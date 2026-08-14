#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "libre-remote-universal")


def fail(message: str) -> None:
    raise SystemExit(f"hardening failed: {message}")


def read(path: Path) -> str:
    if not path.is_file():
        fail(f"missing required file: {path}")
    return path.read_text(encoding="utf-8")


def write_if_changed(path: Path, before: str, after: str) -> None:
    if before != after:
        path.write_text(after, encoding="utf-8")
        print(f"updated {path}")


# 1. Preserve Android application identity across RC upgrades.
gradle = ROOT / "composeApp" / "build.gradle.kts"
text = read(gradle)
expected_id = 'io.github.grupogptespecialeng.libreremote'
text2, count = re.subn(
    r'applicationId\s*=\s*"io\.github\.grupogptespecialeng\.libreremote(?:\.universal)?"',
    f'applicationId = "{expected_id}"',
    text,
    count=1,
)
if count != 1:
    fail("could not normalize Android applicationId")
write_if_changed(gradle, text, text2)

# 2. LG: never let a previously saved cleartext endpoint outrank WSS.
lg = ROOT / "composeApp" / "src" / "commonMain" / "kotlin" / "io" / "github" / "grupogptespecialeng" / "libreremote" / "LgWebOsRemote.kt"
text = read(lg)

# Restrict a saved preferred endpoint to WSS. If a legacy ws:// endpoint was saved,
# the connection will probe secure WSS first and use WS only as a fresh fallback.
preferred_re = re.compile(r'^(?P<i>\s*)val preferred = (?P<rhs>[^\n]+)$', re.MULTILINE)
match = preferred_re.search(text)
if not match:
    fail("LG preferred endpoint declaration not found")
rhs = match.group("rhs")
if "startsWith(\"wss://\")" not in rhs:
    replacement = (
        f'{match.group("i")}val savedEndpoint = {rhs}\n'
        f'{match.group("i")}val preferred = savedEndpoint?.takeIf {{ it.startsWith("wss://") }}'
    )
    text = text[: match.start()] + replacement + text[match.end() :]

# Secure endpoint must be attempted before cleartext fallback. Swap complete list lines
# rather than changing protocols/ports.
lines = text.splitlines(keepends=True)
ws_index = next((i for i, line in enumerate(lines) if "ws://" in line and ":3000" in line and "wss://" not in line), None)
wss_index = next((i for i, line in enumerate(lines) if "wss://" in line and ":3001" in line), None)
if ws_index is None or wss_index is None:
    fail("LG WS/WSS endpoint lines not found")
if ws_index < wss_index:
    if wss_index - ws_index > 4:
        fail("LG WS/WSS endpoints are too far apart to reorder safely")
    ws_line = lines.pop(ws_index)
    wss_index -= 1
    lines.insert(wss_index + 1, ws_line)
    text = "".join(lines)

# Verify security invariants after the transformation.
ws_pos = text.find("ws://", text.find("val preferred"))
wss_pos = text.find("wss://", text.find("val preferred"))
if wss_pos < 0 or ws_pos < 0 or wss_pos > ws_pos:
    fail("WSS is not preferred over WS after hardening")
if 'savedEndpoint?.takeIf { it.startsWith("wss://") }' not in text:
    fail("legacy cleartext preferred endpoint can still outrank WSS")
write_if_changed(lg, read(lg), text)

# 3. Add a machine-readable marker consumed by CI/release tooling.
marker = ROOT / "HARDENING.md"
marker.write_text(
    """# Libre Remote RC5.4 hardening\n\n"
    "This source tree has been normalized by `scripts/harden_libre_remote_rc5_4.py`.\n\n"
    "Required invariants:\n"
    "- Android applicationId: `io.github.grupogptespecialeng.libreremote`\n"
    "- LG WSS (`:3001`) is attempted before cleartext WS (`:3000`)\n"
    "- a legacy saved `ws://` endpoint is not treated as the preferred endpoint\n"
    "- release validation is performed from the materialized source tree\n"
    """,
    encoding="utf-8",
)
print("Libre Remote RC5.4 hardening invariants applied")
