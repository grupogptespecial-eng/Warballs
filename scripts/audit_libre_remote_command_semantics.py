#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("root", nargs="?", default="libre-remote-universal")
args = parser.parse_args()

root = Path(args.root)
src = root / "composeApp/src"
failures: list[str] = []

setter_re = re.compile(
    r"(?ms)(?:override\s+)?(?:suspend\s+)?fun\s+(set[A-Z]\w*)\s*\(([^)]*)\).*?(?=\n\s*(?:override\s+)?(?:suspend\s+)?fun\s+|\n\s*(?:private|internal|public)?\s*(?:class|object|interface)\s+|\Z)"
)

# Toggle-only manufacturer actions that must never implement an absolute setter.
toggle_tokens = {
    "KEY_MUTE": "mute toggle",
    "KEY_PLAYPAUSE": "play/pause toggle",
    "KEY_PLAY_PAUSE": "play/pause toggle",
    "PLAY_PAUSE": "play/pause toggle",
    "PlayPauseToggle": "play/pause toggle",
}

for path in src.rglob("*.kt"):
    text = path.read_text(encoding="utf-8", errors="replace")
    for match in setter_re.finditer(text):
        name, params, body = match.group(1), match.group(2), match.group(0)
        # A setter is treated as absolute when it accepts a boolean/state/value.
        absolute = bool(re.search(r"\b(Boolean|Int|Long|Float|Double|String|PlaybackState|ConnectionStatus)\b", params))
        if not absolute:
            continue
        for token, semantic in toggle_tokens.items():
            if token in body and "UnsupportedOperationException" not in body:
                failures.append(f"{path}: {name} is absolute but uses {semantic} token {token}")
        if re.search(r"(?i)\btoggle\w*\s*\(", body) and "UnsupportedOperationException" not in body:
            failures.append(f"{path}: {name} is absolute but calls a toggle operation")

contract = root / "composeApp/src/commonMain/kotlin/io/github/grupogptespecialeng/libreremote/CommandSemantics.kt"
if not contract.is_file():
    failures.append(f"missing semantic contract: {contract}")
else:
    c = contract.read_text(encoding="utf-8")
    for required in ("CommandSemantic.Toggle", "CommandSemantic.AbsoluteBoolean", "MuteToggle", "SetMute", "PlayPauseToggle"):
        if required not in c:
            failures.append(f"semantic contract missing {required}")

if failures:
    for failure in failures:
        print(f"FAIL {failure}")
    raise SystemExit(1)

print("PASS command semantics: no toggle command is hidden behind an absolute setter")
