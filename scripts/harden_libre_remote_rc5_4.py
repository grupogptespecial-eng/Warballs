#!/usr/bin/env python3
from __future__ import annotations

import os
import plistlib
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "libre-remote-universal")
CANONICAL_APP_ID = "io.github.grupogptespecialeng.libreremote"
IOS_BUNDLE_ID = CANONICAL_APP_ID
IOS_FRAMEWORK_BUNDLE_ID = f"{CANONICAL_APP_ID}.framework"
DESKTOP_PACKAGE_VERSION = "2.1.3"


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


def upsert_yaml_setting(text: str, key: str, value: str, anchor: str = "PRODUCT_NAME") -> str:
    pattern = re.compile(rf'^(?P<i>\s*){re.escape(key)}:\s*.*$', re.MULTILINE)
    match = pattern.search(text)
    if match:
        replacement = f'{match.group("i")}{key}: {value}'
        return text[: match.start()] + replacement + text[match.end() :]

    anchor_match = re.search(rf'^(?P<i>\s*){re.escape(anchor)}:\s*.*$', text, re.MULTILINE)
    if not anchor_match:
        fail(f"could not insert iOS project setting {key}: anchor {anchor} not found")
    insertion = f'{anchor_match.group("i")}{key}: {value}\n'
    return text[: anchor_match.start()] + insertion + text[anchor_match.start() :]


# ---------------------------------------------------------------------------
# Android identity continuity
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# Kotlin/Native framework identity
# ---------------------------------------------------------------------------
if f'binaryOption("bundleId", "{IOS_FRAMEWORK_BUNDLE_ID}")' not in after:
    lines = after.splitlines(keepends=True)
    transformed: list[str] = []
    framework_blocks = 0
    for line in lines:
        transformed.append(line)
        if ".binaries.framework {" in line:
            indent = re.match(r"\s*", line).group(0) + "    "
            transformed.append(f'{indent}binaryOption("bundleId", "{IOS_FRAMEWORK_BUNDLE_ID}")\n')
            framework_blocks += 1
    if framework_blocks == 0:
        fail("could not locate Kotlin/Native iOS framework configuration")
    after = "".join(transformed)

# ---------------------------------------------------------------------------
# Desktop native distribution hardening
# ---------------------------------------------------------------------------
if "nativeDistributions {" not in after:
    fail("Compose Desktop nativeDistributions block not found")

import_line = "import org.jetbrains.compose.desktop.application.dsl.TargetFormat"
if import_line not in after:
    after = f"{import_line}\n\n{after}"

formats = (
    "targetFormats(\n"
    "            TargetFormat.Dmg, TargetFormat.Pkg,\n"
    "            TargetFormat.Msi, TargetFormat.Exe,\n"
    "            TargetFormat.Deb, TargetFormat.Rpm\n"
    "        )"
)
format_match = re.search(r"targetFormats\s*\([^)]*\)", after, re.DOTALL)
if format_match:
    after = after[: format_match.start()] + formats + after[format_match.end() :]
else:
    native_match = re.search(r"^(?P<i>\s*)nativeDistributions\s*\{\s*$", after, re.MULTILINE)
    if not native_match:
        fail("could not configure native desktop package formats")
    indent = native_match.group("i") + "    "
    inserted_formats = (
        f"{indent}targetFormats(\n"
        f"{indent}    TargetFormat.Dmg, TargetFormat.Pkg,\n"
        f"{indent}    TargetFormat.Msi, TargetFormat.Exe,\n"
        f"{indent}    TargetFormat.Deb, TargetFormat.Rpm\n"
        f"{indent})\n"
    )
    pos = native_match.end()
    after = after[:pos] + "\n" + inserted_formats + after[pos:]

if 'modules("jdk.accessibility")' not in after:
    native_match = re.search(r"^(?P<i>\s*)nativeDistributions\s*\{\s*$", after, re.MULTILINE)
    if not native_match:
        fail("could not enable jdk.accessibility in desktop runtime")
    indent = native_match.group("i") + "    "
    pos = native_match.end()
    after = after[:pos] + f'\n{indent}modules("jdk.accessibility")' + after[pos:]

# Native packagers are stricter than application versionName conventions. Keep
# the installer version stable and numeric while versionName retains the RC label.
package_version_re = re.compile(r'^(?P<i>\s*)packageVersion\s*=\s*"[^"]*"\s*$', re.MULTILINE)
package_version_match = package_version_re.search(after)
if package_version_match:
    replacement = f'{package_version_match.group("i")}packageVersion = "{DESKTOP_PACKAGE_VERSION}"'
    after = after[: package_version_match.start()] + replacement + after[package_version_match.end() :]
else:
    native_match = re.search(r"^(?P<i>\s*)nativeDistributions\s*\{\s*$", after, re.MULTILINE)
    if not native_match:
        fail("could not configure desktop packageVersion")
    indent = native_match.group("i") + "    "
    pos = native_match.end()
    after = after[:pos] + f'\n{indent}packageVersion = "{DESKTOP_PACKAGE_VERSION}"' + after[pos:]

write_if_changed(gradle, before, after)

# ---------------------------------------------------------------------------
# LG transport hardening
# ---------------------------------------------------------------------------
lg = ROOT / "composeApp" / "src" / "commonMain" / "kotlin" / "io" / "github" / "grupogptespecialeng" / "libreremote" / "LgWebOsRemote.kt"
before = read(lg)
after = before

preferred_re = re.compile(r'^(?P<i>\s*)val preferred = (?P<rhs>[^\n]+)$', re.MULTILINE)
match = preferred_re.search(after)
if not match:
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

# ---------------------------------------------------------------------------
# iOS / iPadOS privacy, local-network and signing metadata
# ---------------------------------------------------------------------------
ios_dir = ROOT / "iosApp"
info_plist = ios_dir / "Info.plist"
if not info_plist.exists():
    fail("iOS Info.plist not found")

with info_plist.open("rb") as handle:
    info_values = plistlib.load(handle)
ats = info_values.get("NSAppTransportSecurity")
if not isinstance(ats, dict):
    ats = {}
ats["NSAllowsLocalNetworking"] = True
info_values.update(
    {
        "NSLocalNetworkUsageDescription": "Libre Remote uses your local network to discover and control TVs on the same network.",
        "NSMicrophoneUsageDescription": "Libre Remote uses the microphone only when you choose voice control.",
        "NSSpeechRecognitionUsageDescription": "Libre Remote uses speech recognition only when you choose voice control.",
        "NSAppTransportSecurity": ats,
    }
)
after_info = plistlib.dumps(info_values, fmt=plistlib.FMT_XML, sort_keys=False)
before_info = info_plist.read_bytes()
if before_info != after_info:
    info_plist.write_bytes(after_info)
    print(f"updated {info_plist}")

entitlements = ios_dir / "LibreRemote.entitlements"
entitlement_values: dict[str, object] = {}
if entitlements.exists():
    with entitlements.open("rb") as handle:
        entitlement_values = plistlib.load(handle)
entitlement_values["com.apple.developer.networking.multicast"] = True
after_entitlements = plistlib.dumps(entitlement_values, fmt=plistlib.FMT_XML, sort_keys=False)
before_entitlements = entitlements.read_bytes() if entitlements.exists() else b""
if before_entitlements != after_entitlements:
    entitlements.write_bytes(after_entitlements)
    print(f"updated {entitlements}")

project_yml = ios_dir / "project.yml"
before_project = read(project_yml)
after_project = re.sub(r"^\s*CODE_SIGNING_ALLOWED:\s*NO\s*\n", "", before_project, flags=re.MULTILINE)
after_project = upsert_yaml_setting(after_project, "PRODUCT_BUNDLE_IDENTIFIER", IOS_BUNDLE_ID)
after_project = upsert_yaml_setting(after_project, "CODE_SIGN_ENTITLEMENTS", "LibreRemote.entitlements")
write_if_changed(project_yml, before_project, after_project)

# ---------------------------------------------------------------------------
# Desktop secret-storage release gate
# ---------------------------------------------------------------------------
kt_files = list((ROOT / "composeApp" / "src").rglob("*.kt"))
prefs_hits = [p for p in kt_files if "java.util.prefs.Preferences" in p.read_text(encoding="utf-8", errors="ignore")]
secret_hits = [
    p
    for p in kt_files
    if re.search(r"client[-_]?key|clientKey|pairing.*token|auth.*token", p.read_text(encoding="utf-8", errors="ignore"), re.IGNORECASE)
]
plaintext_desktop_secret_risk = bool(prefs_hits and secret_hits)

strict_secure_store = os.environ.get("LIBRE_REMOTE_STRICT_SECURE_STORE", "0") == "1"
if strict_secure_store and plaintext_desktop_secret_risk:
    fail("desktop plaintext secret-storage risk detected; native secure storage is required")

security_status = "BLOCKED" if plaintext_desktop_secret_risk else "PASS (no known prefs/secret overlap detected)"
security_report = ROOT / "SECURITY-GATES.md"
security_report.write_text(
    "# Security release gates\n\n"
    f"- Desktop secure-storage audit: **{security_status}**\n"
    "- Required production backends: Android Keystore; Apple Keychain; Windows Credential Manager/DPAPI; Linux Secret Service/libsecret.\n"
    "- `java.util.prefs.Preferences`, DataStore and NSUserDefaults are for non-secret preferences only.\n"
    "- The strict CI gate is enabled with `LIBRE_REMOTE_STRICT_SECURE_STORE=1` after the native implementations land.\n",
    encoding="utf-8",
)

marker = ROOT / "HARDENING.md"
marker.write_text(
    "# Libre Remote RC hardening\n\n"
    "This source tree has been normalized by `scripts/harden_libre_remote_rc5_4.py`.\n\n"
    "Required invariants:\n"
    f"- Android applicationId: `{CANONICAL_APP_ID}`\n"
    f"- iOS application bundle ID: `{IOS_BUNDLE_ID}`\n"
    f"- Kotlin/Native framework bundle ID: `{IOS_FRAMEWORK_BUNDLE_ID}`\n"
    f"- desktop package version: `{DESKTOP_PACKAGE_VERSION}`\n"
    "- iOS declares Local Network, microphone and speech-recognition purpose strings\n"
    "- iOS carries the multicast entitlement required by SSDP/UDP discovery; Apple entitlement approval is still an external release prerequisite\n"
    "- Apple release signing is not disabled in project.yml; CI disables signing only on explicit build commands\n"
    "- desktop native distributions expose DMG/PKG, MSI/EXE and DEB/RPM formats\n"
    "- Windows reduced runtime includes `jdk.accessibility` for Java Access Bridge\n"
    "- LG WSS (`:3001`) is attempted before cleartext WS (`:3000`)\n"
    "- a legacy saved `ws://` endpoint is not treated as preferred over WSS\n"
    "- release validation runs from the normalized source tree\n"
    f"- desktop secure-storage gate: `{security_status}`\n",
    encoding="utf-8",
)
print("Libre Remote RC multiplatform hardening invariants applied")
