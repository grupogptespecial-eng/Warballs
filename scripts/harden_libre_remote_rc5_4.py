#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "libre-remote-universal")
CANONICAL_APP_ID = "io.github.grupogptespecialeng.libreremote"


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


# Preserve the pre-universal Libre Remote Android identity. The universal RC is an
# upgrade of the same application, not a second installable product.
gradle = ROOT / "composeApp" / "build.gradle.kts"
before = read(gradle)
after, count = re.subn(
    r'applicationId\s*=\s*"io\.github\.grupogptespecialeng\.libreremote(?:\.universal)?"',
    f'applicationId = "{CANONICAL_APP_ID}"',
    before,
    count=1,
)
if count != 1:
    fail("could not normalize Android applicationId")
write_if_changed(gradle, before, after)

# LG endpoint hardening. A previously saved cleartext endpoint is treated as a
# fallback hint only; WSS must get the first opportunity on every connection.
lg = ROOT / "composeApp" / "src" / "commonMain" / "kotlin" / "io" / "github" / "grupogptespecialeng" / "libreremote" / "LgWebOsRemote.kt"
before = read(lg)
after = before

preferred_re = re.compile(r'^(?P<i>\s*)val preferred = (?P<rhs>[^\n]+)$', re.MULTILINE)
match = preferred_re.search(after)
if not match:
    # Idempotent case: the transform may already have introduced savedEndpoint.
    if 'savedEndpoint?.takeIf { it.startsWith("wss://") }' not in after:
        fail("LG preferred endpoint declaration not found")
else:
    rhs = match.group("rhs")
    replacement = (
        f'{match.group("i")}val savedEndpoint = {rhs}\n'
        f'{match.group("i")}val preferred = savedEndpoint?.takeIf {{ it.startsWith("wss://") }}'
    )
    after = after[: match.start()] + replacement + after[match.end() :]

lines = after.splitlines(keepends=True)
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
    after = "".join(lines)

secure_filter = 'savedEndpoint?.takeIf { it.startsWith("wss://") }'
if secure_filter not in after:
    fail("legacy cleartext preferred endpoint can still outrank WSS")
search_from = after.find(secure_filter) + len(secure_filter)
ws_pos = after.find("ws://", search_from)
wss_pos = after.find("wss://", search_from)
if wss_pos < 0 or ws_pos < 0 or wss_pos > ws_pos:
    fail("WSS is not listed before WS fallback")
write_if_changed(lg, before, after)

marker = ROOT / "HARDENING.md"
marker.write_text(
    "# Libre Remote RC hardening\n\n"
    "This source tree has been normalized by `scripts/harden_libre_remote_rc5_4.py`.\n\n"
    "Required invariants:\n"
    f"- Android applicationId: `{CANONICAL_APP_ID}`\n"
    "- LG WSS (`:3001`) is attempted before cleartext WS (`:3000`)\n"
    "- a legacy saved `ws://` endpoint is not treated as preferred over WSS\n"
    "- release validation runs from the normalized source tree\n",
    encoding="utf-8",
)
print("Libre Remote RC hardening invariants applied")
