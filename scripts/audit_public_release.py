#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

REQUIRED_FILES = (
    "README.md",
    "LICENSE",
    "NOTICE",
    "THIRD_PARTY_NOTICES.md",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "BUILDING.md",
    "CHANGELOG.md",
    "RELEASE_POLICY.md",
    "VERSIONING.md",
)

FORBIDDEN_TOP_LEVEL = (
    ".rc5-universal",
    ".universal-overlay",
    ".universal-overlay-v2",
    ".universal-patch",
    ".universal-patch-v2",
    ".universal-payload",
)

FORBIDDEN_SUFFIXES = (
    ".jks",
    ".keystore",
    ".p12",
    ".pfx",
    ".pem",
    ".key",
)

SKIP_DIRS = {
    ".git",
    ".gradle",
    "build",
    ".idea",
    "node_modules",
    "dist",
    "signed",
}

# Build sensitive markers without embedding complete live-looking token prefixes in one literal.
SECRET_PATTERNS = (
    ("private-key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("github-token", re.compile(r"gh" + r"[ps]_[A-Za-z0-9_]{20,}")),
    ("github-fine-grained-token", re.compile(r"github" + r"_pat_[A-Za-z0-9_]{20,}")),
    ("aws-access-key", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("google-api-key", re.compile(r"AI" + r"za[0-9A-Za-z_-]{30,}")),
)

TEXT_SUFFIXES = {
    ".kt", ".kts", ".java", ".swift", ".m", ".mm", ".h",
    ".py", ".sh", ".ps1", ".yml", ".yaml", ".json", ".xml",
    ".md", ".txt", ".properties", ".toml", ".gradle", ".plist",
    ".entitlements", ".cfg", ".conf", ".ini",
}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Audit a Libre Remote tree for public-release readiness")
    p.add_argument("--root", type=Path, default=Path("."))
    p.add_argument("--report", type=Path, default=Path("public-release-audit.json"))
    p.add_argument("--strict", action="store_true", help="fail on pending third-party audit and all warnings")
    p.add_argument(
        "--allow-pending-third-party",
        action="store_true",
        help="allow the pre-release third-party placeholder; never use for Stable/1.0 promotion",
    )
    return p.parse_args()


def iter_files(root: Path):
    for current, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        base = Path(current)
        for name in files:
            yield base / name


def rel(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def is_text_candidate(path: Path) -> bool:
    if path.name in {"LICENSE", "NOTICE"}:
        return True
    return path.suffix.lower() in TEXT_SUFFIXES


def main() -> int:
    args = parse_args()
    root = args.root.resolve()
    errors: list[str] = []
    warnings: list[str] = []
    evidence: dict[str, object] = {}

    if not root.is_dir():
        raise SystemExit(f"root does not exist: {root}")

    missing = [name for name in REQUIRED_FILES if not (root / name).is_file()]
    if missing:
        errors.append("missing required public files: " + ", ".join(missing))
    evidence["required_files_missing"] = missing

    forbidden_dirs = [name for name in FORBIDDEN_TOP_LEVEL if (root / name).exists()]
    if forbidden_dirs:
        errors.append("legacy transport directories present: " + ", ".join(forbidden_dirs))
    evidence["legacy_transport_present"] = forbidden_dirs

    sensitive_files: list[str] = []
    secret_hits: list[dict[str, object]] = []
    warballs_hits: list[str] = []

    self_path = Path(__file__).resolve() if "__file__" in globals() else None

    for path in iter_files(root):
        r = rel(path, root)
        lower = path.name.lower()
        if lower.endswith(FORBIDDEN_SUFFIXES):
            sensitive_files.append(r)
            continue

        if not is_text_candidate(path):
            continue
        try:
            if path.stat().st_size > 5 * 1024 * 1024:
                warnings.append(f"skipped large text candidate: {r}")
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            warnings.append(f"could not read {r}: {exc}")
            continue

        if r == "README.md" and re.search(r"\bWarballs\b|\bBattle Balls\b", text, re.I):
            warballs_hits.append(r)

        # The auditor contains pattern definitions by design; do not scan itself.
        if self_path is not None and path.resolve() == self_path:
            continue

        for marker_name, pattern in SECRET_PATTERNS:
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                secret_hits.append({"file": r, "line": line, "type": marker_name})
                if len(secret_hits) >= 100:
                    break
            if len(secret_hits) >= 100:
                break
        if len(secret_hits) >= 100:
            warnings.append("secret hit list truncated at 100 entries")
            break

    if sensitive_files:
        errors.append("sensitive key/certificate file extensions present")
    if secret_hits:
        errors.append("high-signal secret/private-key markers found")
    if warballs_hits:
        errors.append("public README still identifies the repository as Warballs/Battle Balls")

    evidence["sensitive_files"] = sensitive_files
    evidence["secret_hits"] = secret_hits
    evidence["wrong_product_readme"] = warballs_hits

    license_path = root / "LICENSE"
    if license_path.is_file():
        license_text = license_path.read_text(encoding="utf-8", errors="replace")
        if "Apache License" not in license_text or "Version 2.0" not in license_text:
            errors.append("LICENSE is not recognizable as Apache License 2.0")

    notices_path = root / "THIRD_PARTY_NOTICES.md"
    third_party_status = "MISSING"
    if notices_path.is_file():
        notices = notices_path.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"THIRD_PARTY_AUDIT_STATUS:\s*([A-Z0-9_-]+)", notices)
        if m:
            third_party_status = m.group(1)
        elif "THIRD_PARTY_AUDIT_STATUS" not in notices:
            third_party_status = "UNMARKED"
    evidence["third_party_audit_status"] = third_party_status

    if third_party_status != "COMPLETE":
        message = f"third-party license audit is not COMPLETE (status={third_party_status})"
        if args.strict and not args.allow_pending_third_party:
            errors.append(message)
        else:
            warnings.append(message)

    readme = root / "README.md"
    if readme.is_file():
        text = readme.read_text(encoding="utf-8", errors="replace")
        if "Libre Remote" not in text:
            errors.append("README does not identify Libre Remote")
        if "Apache License 2.0" not in text and "Apache License" not in text:
            warnings.append("README does not mention Apache-2.0 licensing")

    report = {
        "root": str(root),
        "strict": args.strict,
        "allow_pending_third_party": args.allow_pending_third_party,
        "status": "PASS" if not errors else "FAIL",
        "errors": errors,
        "warnings": warnings,
        "evidence": evidence,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    if errors:
        print("Public-release audit FAILED", file=sys.stderr)
        for item in errors:
            print(f"ERROR: {item}", file=sys.stderr)
        for item in warnings:
            print(f"WARN: {item}", file=sys.stderr)
        return 1

    print("Public-release audit PASS")
    for item in warnings:
        print(f"WARN: {item}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
