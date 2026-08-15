#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path

ROOT_DOCS = (
    "README.md", "LICENSE", "NOTICE", "THIRD_PARTY_NOTICES.md", "SECURITY.md",
    "PRIVACY.md", "SUPPORT.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md",
    "BUILDING.md", "CHANGELOG.md", "RELEASE_POLICY.md", "VERSIONING.md",
    "STORE_METADATA.md", "LIBRE_REMOTE_RELEASE_MANIFEST.md",
    "LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md", "LIBRE_REMOTE_HARDWARE_MATRIX.md",
)

SCRIPT_GLOBS = (
    "audit_*.py",
    "check_*.py",
    "generate_cyclonedx_sbom.py",
    "validate_libre_remote*.py",
)

SKIP_NAMES = {".git", ".gradle", ".idea", "build", "dist", "signed", "release-fixtures"}


def copy_tree(src: Path, dst: Path) -> None:
    def ignore(_dir: str, names: list[str]):
        return [name for name in names if name in SKIP_NAMES]
    shutil.copytree(src, dst, dirs_exist_ok=True, ignore=ignore)


def main() -> int:
    p = argparse.ArgumentParser(description="Create a sanitized Libre Remote public-repository snapshot")
    p.add_argument("--root", type=Path, default=Path("."))
    p.add_argument("--source", type=Path, default=Path("libre-remote-universal"))
    p.add_argument("--output", type=Path, required=True)
    p.add_argument("--source-commit", default="UNKNOWN")
    p.add_argument("--allow-pending-third-party", action="store_true")
    args = p.parse_args()

    root = args.root.resolve()
    source = (root / args.source).resolve() if not args.source.is_absolute() else args.source.resolve()
    output = args.output.resolve()

    required_source = [source / "settings.gradle.kts", source / "composeApp" / "build.gradle.kts"]
    if not all(path.is_file() for path in required_source):
        missing = [str(path) for path in required_source if not path.is_file()]
        raise SystemExit("canonical source is not available: " + ", ".join(missing))

    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)

    copy_tree(source, output / "libre-remote-universal")

    for name in ROOT_DOCS:
        src = root / name
        if not src.is_file():
            raise SystemExit(f"missing required public document: {name}")
        shutil.copy2(src, output / name)

    for directory in ("protocol-lab", "specs", "release"):
        src = root / directory
        if src.is_dir():
            copy_tree(src, output / directory)

    scripts_out = output / "scripts"
    scripts_out.mkdir(exist_ok=True)
    scripts_src = root / "scripts"
    copied_scripts: set[str] = set()
    for pattern in SCRIPT_GLOBS:
        for src in scripts_src.glob(pattern):
            if src.is_file() and src.name not in copied_scripts:
                shutil.copy2(src, scripts_out / src.name)
                copied_scripts.add(src.name)

    template = root / "public-repo"
    if not template.is_dir():
        raise SystemExit("public-repo template is missing")
    copy_tree(template, output)

    origin = {
        "project": "Libre Remote",
        "source_commit": args.source_commit,
        "source_directory": "libre-remote-universal",
        "history_policy": "sanitized snapshot; do not import Warballs Git history",
    }
    (output / "SOURCE_ORIGIN.json").write_text(json.dumps(origin, indent=2) + "\n", encoding="utf-8")

    audit = root / "scripts" / "audit_public_release.py"
    cmd = ["python3", str(audit), "--root", str(output), "--report", str(output / "public-release-audit.json")]
    if args.allow_pending_third_party:
        cmd.append("--allow-pending-third-party")
    else:
        cmd.append("--strict")
    subprocess.run(cmd, check=True)

    print(f"Public Libre Remote snapshot created at {output}")
    print("Initialize a NEW Git repository from this directory. Do not copy the Warballs .git directory/history.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
