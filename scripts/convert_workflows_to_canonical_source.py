#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

RC54_OLD = "bash .rc5-universal/materialize-rc5.4.sh libre-remote-universal"
RC54_NEW = """if [ -f libre-remote-universal/settings.gradle.kts ] && [ -f libre-remote-universal/composeApp/build.gradle.kts ]; then
  echo 'Using committed canonical Libre Remote source'
else
  bash .rc5-universal/materialize-rc5.4.sh libre-remote-universal
fi"""

RC53_PATTERNS = (
    "bash .rc5-universal/materialize-rc5.3.sh libre-remote-universal-rc5.3",
    "bash .rc5-universal/materialize-rc5.3.sh libre-remote-rc5.3",
)


def rc53_replacement(target: str) -> str:
    return f"""if [ -d release-fixtures/rc5.3 ] && [ -f release-fixtures/rc5.3/settings.gradle.kts ]; then
  rm -rf {target}
  cp -R release-fixtures/rc5.3 {target}
else
  bash .rc5-universal/materialize-rc5.3.sh {target}
fi"""


def main() -> int:
    p = argparse.ArgumentParser(description="Make Libre Remote workflows survive source canonicalization")
    p.add_argument("--root", type=Path, default=Path("."))
    p.add_argument("--check", action="store_true", help="fail if legacy unconditional RC5.4 materialization remains")
    args = p.parse_args()

    workflows = args.root / ".github" / "workflows"
    changed = 0
    remaining = []

    for path in sorted(workflows.glob("libre-remote*.yml")):
        text = path.read_text(encoding="utf-8")
        original = text
        text = text.replace(RC54_OLD, RC54_NEW)
        for pattern in RC53_PATTERNS:
            if pattern in text:
                target = pattern.rsplit(" ", 1)[-1]
                text = text.replace(pattern, rc53_replacement(target))
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed += 1
        if RC54_OLD in text:
            remaining.append(path.as_posix())

    print(f"canonical-source workflow conversion: changed={changed} remaining={len(remaining)}")
    if remaining:
        for item in remaining:
            print(f"REMAINS: {item}")
        return 1 if args.check else 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
