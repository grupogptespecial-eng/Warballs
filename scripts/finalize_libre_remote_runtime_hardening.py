#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "libre-remote-universal")
PKG_PATH = Path("io/github/grupogptespecialeng/libreremote")
SRC = ROOT / "composeApp" / "src"
COMMON = SRC / "commonMain" / "kotlin" / PKG_PATH
IOS = SRC / "iosMain" / "kotlin" / PKG_PATH


def fail(message: str) -> None:
    raise SystemExit(f"runtime hardening finalizer failed: {message}")


def read(path: Path) -> str:
    if not path.is_file():
        fail(f"missing required file: {path}")
    return path.read_text(encoding="utf-8")


def write(path: Path, before: str, after: str) -> None:
    if before != after:
        path.write_text(after, encoding="utf-8")
        print(f"updated {path}")


# ---------------------------------------------------------------------------
# Fix/normalize the Kotlin/Native helper emitted by the implementation overlay.
# Keeping this in a separate pass makes the main implementation templates easy
# to audit while this pass owns call-site-sensitive transformations.
# ---------------------------------------------------------------------------
ios = IOS / "SecureStore.ios.kt"
if ios.exists():
    before = read(ios)
    after = before
    if "import kotlinx.cinterop.addressOf" not in after:
        after = after.replace(
            "import kotlinx.cinterop.alloc\n",
            "import kotlinx.cinterop.alloc\nimport kotlinx.cinterop.addressOf\nimport kotlinx.cinterop.usePinned\n",
        )
    after = re.sub(
        r'private inline fun <T> ByteArray\.usePinnedBytes\(block: \(kotlinx\.cinterop\.CPointer<kotlinx\.cinterop\.ByteVar>, Int\) -> T\): T =\n\s*kotlinx\.cinterop\.usePinned \{ pinned -> block\(pinned\.addressOf\(0\), size\) \}',
        'private inline fun <T> ByteArray.usePinnedBytes(block: (kotlinx.cinterop.CPointer<kotlinx.cinterop.ByteVar>, Int) -> T): T =\n    usePinned { pinned -> block(pinned.addressOf(0), size) }',
        after,
    )
    write(ios, before, after)

# ---------------------------------------------------------------------------
# TOFU must fail closed everywhere, not only in one LG class. Fix the known
# dangerous idiom across all source sets and reject any surviving equivalent.
# ---------------------------------------------------------------------------
for kt in SRC.rglob("*.kt"):
    before = read(kt)
    after = before
    if "peerCertificates" in after:
        after = re.sub(
            r'(peerCertificates\s*\.\s*firstOrNull\(\)\s*\?\.\s*encoded\s*\?:\s*)return\s+true',
            r'\1return false',
            after,
        )
        after = re.sub(
            r'(peerCertificates\s*\.\s*firstOrNull\(\)\s*\?:\s*)return\s+true',
            r'\1return false',
            after,
        )
    write(kt, before, after)

# ---------------------------------------------------------------------------
# Wire WSS-success persistence into the LG endpoint candidate loop. RC5.x has
# historically used buildList/add for these adjacent endpoints. We support that
# shape and a direct candidate-list shape, and fail if no real connection call
# can be associated with the policy.
# ---------------------------------------------------------------------------
lg = COMMON / "LgWebOsRemote.kt"
before = read(lg)
after = before

scope_name = "ip" if re.search(r'\bip\s*:\s*String\b', after) else "host"
if not re.search(rf'\b{scope_name}\s*:\s*String\b', after):
    fail("could not identify LG device scope variable for downgrade policy")

# Prevent adding WS to the candidate list after WSS has once succeeded.
if "secureTransportSucceeded" not in after:
    lines = after.splitlines(keepends=True)
    changed = False
    for index, line in enumerate(lines):
        if "ws://" not in line or ":3000" not in line or "wss://" in line:
            continue
        stripped = line.strip()
        indent = line[: len(line) - len(line.lstrip())]
        if stripped.startswith("add(") or stripped.startswith("endpoints.add(") or stripped.startswith("candidates.add("):
            body = line.strip().rstrip("\n")
            lines[index] = f"{indent}if (!profiles.secureTransportSucceeded({scope_name})) {body}\n"
            changed = True
            break
        if "+=" in stripped:
            body = line.strip().rstrip("\n")
            lines[index] = f"{indent}if (!profiles.secureTransportSucceeded({scope_name})) {body}\n"
            changed = True
            break
    if changed:
        after = "".join(lines)

# After the endpoint-specific connect succeeds, remember WSS before returning to
# normal operation. Handle connectOnce(endpoint) and webSocketSession(endpoint)
# style loops without changing exception semantics.
if "markSecureTransportSucceeded" not in after:
    connect_patterns = [
        r'(?m)^(?P<i>\s*)(?P<call>connectOnce\(endpoint\))\s*$',
        r'(?m)^(?P<i>\s*)(?P<call>connectOnce\(candidate\))\s*$',
    ]
    for pattern in connect_patterns:
        match = re.search(pattern, after)
        if match:
            endpoint_var = "endpoint" if "endpoint" in match.group("call") else "candidate"
            replacement = (
                f'{match.group("i")}{match.group("call")}\n'
                f'{match.group("i")}if ({endpoint_var}.startsWith("wss://")) profiles.markSecureTransportSucceeded({scope_name})'
            )
            after = after[: match.start()] + replacement + after[match.end() :]
            break

write(lg, before, after)

# ---------------------------------------------------------------------------
# Stable identity migration: when discovery code has both a temporary host ID
# and a stable/UDN identifier, migrate secure scope instead of orphaning trust.
# We add a single reusable hook and replace the common explicit migration idiom
# when found. The pure function is also available to backends that resolve IDs.
# ---------------------------------------------------------------------------
identity = COMMON / "DeviceIdentity.kt"
id_before = read(identity)
id_after = id_before
if "fun ProfileStore.promoteStableIdentity" not in id_after:
    id_after += '''\n\nfun ProfileStore.promoteStableIdentity(platform: String, host: String, stableId: String?): DeviceIdentity {\n    val temporary = temporaryDeviceId(platform, host)\n    val stable = normalizeStableDeviceId(stableId)\n    val identity = DeviceIdentity(temporary, stable)\n    if (stable != null && stable != temporary) migrateDeviceSecrets(temporary, stable)\n    return identity\n}\n'''
write(identity, id_before, id_after)

# ---------------------------------------------------------------------------
# Samsung semantics: no absolute setter may still issue KEY_MUTE. If the source
# uses a different backend filename, scan the whole tree.
# ---------------------------------------------------------------------------
for kt in SRC.rglob("*.kt"):
    body = read(kt)
    if "KEY_MUTE" not in body or "setMute" not in body:
        continue
    before_kt = body
    body = re.sub(
        r'(?ms)(override\s+suspend\s+fun\s+setMute\(muted:\s*Boolean\)\s*)=\s*sendKey\("KEY_MUTE"\)',
        r'''\1{\n        throw UnsupportedOperationException("Samsung KEY_MUTE is toggle-only; absolute mute is unsupported")\n    }\n\n    suspend fun toggleMute() = sendKey("KEY_MUTE")''',
        body,
    )
    body = re.sub(
        r'(?ms)(override\s+suspend\s+fun\s+setMute\(muted:\s*Boolean\)\s*\{)\s*sendKey\("KEY_MUTE"\)\s*}',
        r'''\1\n        throw UnsupportedOperationException("Samsung KEY_MUTE is toggle-only; absolute mute is unsupported")\n    }\n\n    suspend fun toggleMute() = sendKey("KEY_MUTE")''',
        body,
    )
    write(kt, before_kt, body)

# ---------------------------------------------------------------------------
# Safe UPnP XML integration. Replace small helper functions commonly used by the
# RC source. Larger regex parsers are rejected by the audit script instead of
# being silently rewritten incorrectly.
# ---------------------------------------------------------------------------
for kt in SRC.rglob("*.kt"):
    body = read(kt)
    if not any(word in body.lower() for word in ("upnp", "dlna", "ssdp")):
        continue
    before_kt = body
    body = re.sub(
        r'(?ms)(?:private\s+)?fun\s+xmlText\(xml:\s*String,\s*tag:\s*String\):\s*String\?\s*=\s*Regex\([^\n]+\)\s*\.find\(xml\)\?\.groupValues\?\.get\(1\)',
        'private fun xmlText(xml: String, tag: String): String? = SafeXml.firstText(xml, tag)',
        body,
    )
    body = re.sub(
        r'(?ms)(?:private\s+)?fun\s+tagValue\(xml:\s*String,\s*tag:\s*String\):\s*String\?\s*=\s*Regex\([^\n]+\)\s*\.find\(xml\)\?\.groupValues\?\.get\(1\)',
        'private fun tagValue(xml: String, tag: String): String? = SafeXml.firstText(xml, tag)',
        body,
    )
    write(kt, before_kt, body)

# ---------------------------------------------------------------------------
# Fail-closed invariants. These are intentionally strict: a source-shape change
# must stop canonicalization/CI rather than silently skipping a security fix.
# ---------------------------------------------------------------------------
all_kotlin = "\n".join(read(p) for p in SRC.rglob("*.kt"))
profile = read(COMMON / "ProfileStore.kt")
lg_final = read(lg)

if 'store.put("lg.client.$ip"' in profile or 'store.put("lg.client.' in profile:
    fail("legacy plaintext LG client-key write remains in ProfileStore")
if "private val secureStore: SecureStore" not in profile:
    fail("ProfileStore is not wired to SecureStore")
if "saveCertificateFingerprint" not in profile or "markSecureTransportSucceeded" not in profile:
    fail("ProfileStore trust-state APIs missing")
if re.search(r'peerCertificates[^\n]{0,160}\?:\s*return\s+true', all_kotlin):
    fail("fail-open peer-certificate path remains")
if re.search(r'(?ms)setMute\([^)]*\).*?KEY_MUTE', all_kotlin):
    # Allow only if the setter clearly throws before a separate toggle function.
    suspicious = []
    for p in SRC.rglob("*.kt"):
        t = read(p)
        for m in re.finditer(r'(?ms)(?:override\s+)?suspend\s+fun\s+setMute\([^)]*\).*?(?=\n\s*(?:override\s+)?suspend\s+fun|\n\s*fun|\Z)', t):
            if "KEY_MUTE" in m.group(0) and "UnsupportedOperationException" not in m.group(0):
                suspicious.append(str(p))
    if suspicious:
        fail("Samsung absolute mute still maps to KEY_MUTE: " + ", ".join(sorted(set(suspicious))))
if re.search(r'\.readText\(\)\.take\(\s*\d', all_kotlin) or re.search(r'\.string\(\)\.take\(\s*\d', all_kotlin):
    fail("unbounded read-then-truncate pattern remains")
if "lgEndpointCandidates" not in all_kotlin:
    fail("LG downgrade policy source missing")
if "secureTransportSucceeded" not in lg_final:
    fail("LG connection path is not consulting persisted secure-transport state")
if "markSecureTransportSucceeded" not in lg_final:
    fail("LG connection path is not recording successful WSS")
if "SafeXml" not in all_kotlin:
    fail("safe XML parser source missing")
if "currentHostCapabilities" not in all_kotlin:
    fail("HostCapability implementation missing")

print("Libre Remote runtime hardening call sites finalized and verified")
