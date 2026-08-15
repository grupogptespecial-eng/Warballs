#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

SENSITIVE_SUFFIXES = (".jks", ".keystore", ".p12", ".pfx", ".pem", ".key")
LEGACY_PATH_MARKERS = (
    ".rc5-universal/",
    ".universal-overlay/",
    ".universal-overlay-v2/",
    ".universal-patch/",
    ".universal-patch-v2/",
    ".universal-payload/",
)
PRIVATE_KEY_PATTERN = re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")


def run(repo: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-C", str(repo), *args],
        check=check,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def main() -> int:
    p = argparse.ArgumentParser(description="Audit Git history before publishing Libre Remote")
    p.add_argument("--repo", type=Path, default=Path("."))
    p.add_argument("--report", type=Path, default=Path("git-history-audit.json"))
    p.add_argument("--strict", action="store_true")
    args = p.parse_args()

    repo = args.repo.resolve()
    errors: list[str] = []
    warnings: list[str] = []

    try:
        run(repo, "rev-parse", "--is-inside-work-tree")
    except Exception as exc:
        raise SystemExit(f"not a Git work tree: {repo}: {exc}")

    objects = run(repo, "rev-list", "--objects", "--all").stdout.splitlines()
    sensitive_paths: list[str] = []
    legacy_paths: list[str] = []
    for line in objects:
        parts = line.split(" ", 1)
        if len(parts) != 2:
            continue
        path = parts[1]
        lower = path.lower()
        if lower.endswith(SENSITIVE_SUFFIXES):
            sensitive_paths.append(path)
        if any(marker in path for marker in LEGACY_PATH_MARKERS):
            legacy_paths.append(path)

    if sensitive_paths:
        errors.append("sensitive key/certificate files exist in Git history")
    if legacy_paths:
        errors.append("legacy encoded/patch transport exists in Git history")

    # Scan commit snapshots for an actual PEM private-key header. This is deliberately
    # high-signal and does not attempt to guess every possible secret format.
    key_hits: list[dict[str, str | int]] = []
    commits = run(repo, "rev-list", "--all").stdout.splitlines()
    for commit in commits:
        proc = run(repo, "grep", "-I", "-n", "-E", r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----", commit, "--", check=False)
        if proc.returncode not in (0, 1):
            warnings.append(f"git grep failed for {commit[:12]}: {proc.stderr.strip()}")
            continue
        if proc.returncode == 0:
            for line in proc.stdout.splitlines():
                # Do not copy secret content into the report. Keep only the location.
                match = re.match(r"[^:]+:([^:]+):(\d+):", line)
                if match:
                    key_hits.append({"commit": commit, "file": match.group(1), "line": int(match.group(2))})
                else:
                    key_hits.append({"commit": commit, "file": "UNKNOWN", "line": 0})
                if len(key_hits) >= 100:
                    break
        if len(key_hits) >= 100:
            warnings.append("private-key history hit list truncated at 100 entries")
            break

    if key_hits:
        errors.append("private-key PEM material exists in Git history")

    report = {
        "repo": str(repo),
        "strict": args.strict,
        "status": "PASS" if not errors else "FAIL",
        "errors": errors,
        "warnings": warnings,
        "sensitive_paths": sorted(set(sensitive_paths))[:500],
        "legacy_transport_paths": sorted(set(legacy_paths))[:500],
        "private_key_hits": key_hits,
        "commit_count_scanned": len(commits),
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    if errors:
        for item in errors:
            print(f"ERROR: {item}", file=sys.stderr)
        print(
            "This history is not suitable for direct publication. Create the public repository from the sanitized canonical source snapshot instead of changing the historical repository visibility.",
            file=sys.stderr,
        )
        return 1 if args.strict else 0

    print("Git history audit PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
