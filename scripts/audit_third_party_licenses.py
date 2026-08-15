#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import re
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

COORD = re.compile(r"(?<![\w.-])([A-Za-z0-9_.-]+):([A-Za-z0-9_.-]+):([A-Za-z0-9_.+\-]+)")

REPOSITORIES = (
    "https://repo1.maven.org/maven2",
    "https://maven.pkg.jetbrains.space/public/p/compose/dev",
)

ASSET_SUFFIXES = {
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico",
    ".ttf", ".otf", ".woff", ".woff2", ".mp3", ".wav", ".ogg",
}

SKIP_DIRS = {".git", ".gradle", "build", ".idea", "node_modules", "dist"}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Generate a reviewable third-party license inventory from Gradle dependency output")
    p.add_argument("--dependencies", type=Path, required=True, help="text produced by a Gradle dependencies task")
    p.add_argument("--root", type=Path, default=Path("."), help="source root used to inventory bundled assets")
    p.add_argument("--output", type=Path, default=Path("THIRD_PARTY_NOTICES.generated.md"))
    p.add_argument("--strict", action="store_true", help="fail when dependency license metadata cannot be resolved")
    p.add_argument("--timeout", type=float, default=10.0)
    return p.parse_args()


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def pom_url(repo: str, group: str, artifact: str, version: str) -> str:
    gp = group.replace(".", "/")
    return f"{repo.rstrip('/')}/{gp}/{artifact}/{version}/{artifact}-{version}.pom"


def fetch_pom(group: str, artifact: str, version: str, timeout: float) -> tuple[str | None, str | None]:
    headers = {"User-Agent": "Libre-Remote-license-audit/1"}
    for repo in REPOSITORIES:
        url = pom_url(repo, group, artifact, version)
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.read().decode("utf-8", errors="replace"), url
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
            continue
    return None, None


def parse_licenses(pom_text: str) -> list[tuple[str, str]]:
    try:
        root = ET.fromstring(pom_text)
    except ET.ParseError:
        return []
    result: list[tuple[str, str]] = []
    for element in root.iter():
        if local_name(element.tag) != "license":
            continue
        name = ""
        url = ""
        for child in list(element):
            if local_name(child.tag) == "name" and child.text:
                name = child.text.strip()
            elif local_name(child.tag) == "url" and child.text:
                url = child.text.strip()
        if name or url:
            result.append((name or "UNNAMED", url or ""))
    return result


def asset_inventory(root: Path) -> list[str]:
    assets: list[str] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        try:
            rel_parts = path.relative_to(root).parts
        except ValueError:
            continue
        if any(part in SKIP_DIRS for part in rel_parts):
            continue
        if path.suffix.lower() in ASSET_SUFFIXES:
            assets.append(path.relative_to(root).as_posix())
    return sorted(assets)


def main() -> int:
    args = parse_args()
    text = args.dependencies.read_text(encoding="utf-8", errors="replace")
    coords = sorted(set(COORD.findall(text)))

    rows: list[tuple[str, str, str, list[tuple[str, str]], str | None]] = []
    unknown: list[str] = []
    for group, artifact, version in coords:
        pom, source = fetch_pom(group, artifact, version, args.timeout)
        licenses = parse_licenses(pom) if pom is not None else []
        if not licenses:
            unknown.append(f"{group}:{artifact}:{version}")
        rows.append((group, artifact, version, licenses, source))

    assets = asset_inventory(args.root.resolve())

    out: list[str] = [
        "# Third-Party Notices — Generated Inventory",
        "",
        "`THIRD_PARTY_AUDIT_STATUS: REVIEW_REQUIRED`",
        "",
        "This file is generated evidence, not an automatic legal approval. A human release review must resolve every UNKNOWN item, verify redistribution/NOTICE obligations, review bundled assets, and then update the canonical `THIRD_PARTY_NOTICES.md` to `THIRD_PARTY_AUDIT_STATUS: COMPLETE`.",
        "",
        "## Resolved dependency metadata",
        "",
        "| Coordinate | License metadata | POM source |",
        "|---|---|---|",
    ]

    for group, artifact, version, licenses, source in rows:
        coordinate = f"{group}:{artifact}:{version}"
        if licenses:
            license_text = "; ".join(
                f"{name}" + (f" ({url})" if url else "") for name, url in licenses
            )
        else:
            license_text = "**UNKNOWN — HUMAN REVIEW REQUIRED**"
        out.append(
            f"| `{html.escape(coordinate)}` | {html.escape(license_text)} | {html.escape(source or 'not resolved')} |"
        )

    out.extend(["", "## Bundled assets requiring provenance review", ""])
    if assets:
        out.extend(f"- `{html.escape(path)}`" for path in assets)
    else:
        out.append("- No common bundled asset extensions detected by this scanner.")

    out.extend([
        "",
        "## Review checklist",
        "",
        "- [ ] Every UNKNOWN dependency resolved.",
        "- [ ] Required license texts/NOTICE attributions preserved.",
        "- [ ] Copyleft/source-available/non-commercial restrictions reviewed for compatibility.",
        "- [ ] Fonts, icons, images, audio and other bundled assets have documented provenance/license.",
        "- [ ] Binary distributions include notices required by redistributed dependencies.",
        "- [ ] Canonical `THIRD_PARTY_NOTICES.md` updated and marked COMPLETE.",
        "",
    ])

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("\n".join(out), encoding="utf-8")

    print(f"dependencies={len(coords)} unknown={len(unknown)} assets={len(assets)}")
    if unknown:
        for item in unknown:
            print(f"UNKNOWN LICENSE: {item}", file=sys.stderr)
        return 1 if args.strict else 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
