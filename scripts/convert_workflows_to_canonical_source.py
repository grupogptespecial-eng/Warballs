#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path

RC54_LINE = re.compile(
    r"(?m)^(?P<indent>[ \t]*)bash \.rc5-universal/materialize-rc5\.4\.sh (?P<target>[^\s]+)[ \t]*$"
)
RC53_LINE = re.compile(
    r"(?m)^(?P<indent>[ \t]*)bash \.rc5-universal/materialize-rc5\.3\.sh (?P<target>[^\s]+)[ \t]*$"
)


def indent_block(block: str, indent: str) -> str:
    return "\n".join(indent + line if line else line for line in block.splitlines())


def rc54_replacement(match: re.Match[str]) -> str:
    indent = match.group("indent")
    target = match.group("target")
    if target == "libre-remote-universal":
        block = f"""if [ -f libre-remote-universal/settings.gradle.kts ] && [ -f libre-remote-universal/composeApp/build.gradle.kts ]; then
  echo 'Using committed canonical Libre Remote source'
else
  bash .rc5-universal/materialize-rc5.4.sh {target}
fi"""
    else:
        block = f"""if [ -f libre-remote-universal/settings.gradle.kts ] && [ -f libre-remote-universal/composeApp/build.gradle.kts ]; then
  rm -rf {target}
  cp -R libre-remote-universal {target}
else
  bash .rc5-universal/materialize-rc5.4.sh {target}
fi"""
    return indent_block(block, indent)


def rc53_replacement(match: re.Match[str]) -> str:
    indent = match.group("indent")
    target = match.group("target")
    block = f"""if [ -d release-fixtures/rc5.3 ] && [ -f release-fixtures/rc5.3/settings.gradle.kts ]; then
  rm -rf {target}
  cp -R release-fixtures/rc5.3 {target}
else
  bash .rc5-universal/materialize-rc5.3.sh {target}
fi"""
    return indent_block(block, indent)


def main() -> int:
    p = argparse.ArgumentParser(description="Make Libre Remote workflows survive source canonicalization")
    p.add_argument("--root", type=Path, default=Path("."))
    p.add_argument("--check", action="store_true", help="fail if an unconditional legacy materializer invocation remains")
    args = p.parse_args()

    workflows = args.root / ".github" / "workflows"
    changed = 0
    remaining: list[str] = []

    for path in sorted(workflows.glob("libre-remote*.yml")):
        text = path.read_text(encoding="utf-8")
        original = text
        text = RC54_LINE.sub(rc54_replacement, text)
        text = RC53_LINE.sub(rc53_replacement, text)
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed += 1
        if RC54_LINE.search(text) or RC53_LINE.search(text):
            remaining.append(path.as_posix())

    print(f"canonical-source workflow conversion: changed={changed} remaining={len(remaining)}")
    if remaining:
        for item in remaining:
            print(f"REMAINS: {item}")
        return 1 if args.check else 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
