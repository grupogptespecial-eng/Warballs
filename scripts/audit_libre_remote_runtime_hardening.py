#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("root", nargs="?", default="libre-remote-universal")
parser.add_argument("--strict", action="store_true")
parser.add_argument("--report")
args = parser.parse_args()

root = Path(args.root)
src = root / "composeApp/src"
pkg = Path("io/github/grupogptespecialeng/libreremote")
common = src / "commonMain/kotlin" / pkg
android = src / "androidMain/kotlin" / pkg
desktop = src / "desktopMain/kotlin" / pkg
ios = src / "iosMain/kotlin" / pkg

failures: list[str] = []
checks: dict[str, bool] = {}


def check(name: str, condition: bool, detail: str) -> None:
    checks[name] = bool(condition)
    if not condition:
        failures.append(f"{name}: {detail}")


def text(path: Path) -> str:
    if not path.is_file():
        failures.append(f"missing-file: {path}")
        return ""
    return path.read_text(encoding="utf-8", errors="replace")


required = {
    "common_secure_store": common / "SecureStore.kt",
    "transport_policy": common / "TransportSecurityPolicy.kt",
    "host_capability": common / "HostCapability.kt",
    "device_identity": common / "DeviceIdentity.kt",
    "safe_parsing": common / "SafeLocalParsing.kt",
    "android_secure_store": android / "SecureStore.android.kt",
    "desktop_secure_store": desktop / "SecureStore.desktop.kt",
    "ios_secure_store": ios / "SecureStore.ios.kt",
    "runtime_tests": src / "commonTest/kotlin" / pkg / "RuntimeHardeningTest.kt",
}
for name, path in required.items():
    check(name, path.is_file(), f"required runtime hardening source missing: {path}")

all_files = list(src.rglob("*.kt"))
all_text = "\n".join(text(p) for p in all_files)
profile = text(common / "ProfileStore.kt")
lg = text(common / "LgWebOsRemote.kt")
android_store = text(android / "SecureStore.android.kt")
desktop_store = text(desktop / "SecureStore.desktop.kt")
ios_store = text(ios / "SecureStore.ios.kt")

check("profile_uses_secure_store", "private val secureStore: SecureStore" in profile, "ProfileStore lacks SecureStore dependency")
check("no_plaintext_client_key_write", 'store.put("lg.client.' not in profile, "legacy LG client key can still be written to ordinary PlatformStore")
check("verified_migration", "secure-store write verification failed" in profile and "store.remove(legacyKey)" in profile, "legacy migration is not verify-before-delete")
check("trust_state_secure", all(token in profile for token in ("tls-fingerprint", "wss-succeeded", "saveCertificateFingerprint", "markSecureTransportSucceeded")), "certificate/WSS trust state is not isolated in SecureStore")
check("device_secret_migration", "migrateDeviceSecrets" in profile and "promoteStableIdentity" in all_text, "temporary-to-stable secure scope migration missing")

check("android_keystore", all(token in android_store for token in ("AndroidKeyStore", "AES/GCM/NoPadding", "KeyGenParameterSpec")), "Android backend is not Keystore/AES-GCM based")
check("android_private_ciphertext", "libre.remote.secure.v1" in android_store, "Android encrypted ciphertext store missing")
check("windows_dpapi", "ProtectedData" in desktop_store and "DataProtectionScope" in desktop_store, "Windows DPAPI backend missing")
check("mac_keychain", "security\", \"add-generic-password" in desktop_store and "find-generic-password" in desktop_store, "macOS Keychain backend missing")
check("linux_secret_service", "secret-tool" in desktop_store, "Linux Secret Service backend missing")
check("ios_keychain", all(token in ios_store for token in ("SecItemAdd", "SecItemCopyMatching", "SecItemDelete", "kSecClassGenericPassword")), "iOS Keychain backend missing")
check("test_store_explicit", "LIBRE_REMOTE_TEST_SECURE_STORE" in desktop_store and "TestMemorySecureStore" in desktop_store, "deterministic test store is not explicitly gated")

check("no_tofu_fail_open", re.search(r'peerCertificates[^\n]{0,200}\?:\s*return\s+true', all_text) is None, "missing peer certificate can still be accepted")
check("cert_policy_tests", all(token in all_text for token in ("PeerCertificateDecision.Missing", "PeerCertificateDecision.Changed", "wssSuccessDisablesWsDowngrade")), "TOFU/downgrade policy tests missing")
check("lg_reads_secure_history", "secureTransportSucceeded" in lg, "LG endpoint selection does not consult prior WSS success")
check("lg_records_secure_history", "markSecureTransportSucceeded" in lg, "LG connection path does not persist WSS success")

suspicious_mute: list[str] = []
for path in all_files:
    body = text(path)
    if "KEY_MUTE" not in body or "setMute" not in body:
        continue
    for match in re.finditer(r'(?ms)(?:override\s+)?suspend\s+fun\s+setMute\([^)]*\).*?(?=\n\s*(?:override\s+)?suspend\s+fun|\n\s*fun|\Z)', body):
        block = match.group(0)
        if "KEY_MUTE" in block and "UnsupportedOperationException" not in block:
            suspicious_mute.append(str(path))
check("truthful_mute_semantics", not suspicious_mute, "absolute setMute still maps to toggle KEY_MUTE: " + ", ".join(sorted(set(suspicious_mute))))

check("bounded_reads", re.search(r'\.readText\(\)\.take\(\s*\d|\.string\(\)\.take\(\s*\d', all_text) is None, "read-all-then-truncate pattern remains")
check("safe_xml_helper", "<!DOCTYPE" in text(common / "SafeLocalParsing.kt") and "DTD/entities are forbidden" in text(common / "SafeLocalParsing.kt"), "safe XML parser does not reject DTD/entities")
xml_regex_hits: list[str] = []
for path in all_files:
    body = text(path)
    if not any(word in body.lower() for word in ("upnp", "dlna", "ssdp")):
        continue
    for line in body.splitlines():
        if "Regex(" in line and "<" in line and any(tag in line.lower() for tag in ("service", "friendly", "device", "udn", "controlurl")):
            xml_regex_hits.append(f"{path}:{line.strip()[:120]}")
check("no_obvious_xml_regex_parser", not xml_regex_hits, "XML tag regex remains: " + " | ".join(xml_regex_hits[:5]))

check("local_url_policy", all(token in all_text for token in ("validateLocalControlUrl", "isLiteralPrivateOrLocalHost")), "local endpoint policy missing")
check("host_capabilities", all(token in all_text for token in ("enum class HostCapability", "currentHostCapabilities", "HostCapability.SecureStorage")), "host capability intersection contract missing")

if args.strict:
    check("strict_mode", True, "")
    # Ordinary preferences may contain DPAPI ciphertext and a non-secret index,
    # but ProfileStore itself must never route live credentials there.
    check("strict_profile_separation", "secureStore.put" in profile or "secureStore.putText" in profile, "ProfileStore does not route writes through SecureStore")
    check("strict_no_secret_logging", re.search(r'(?i)(println|print|log\w*)\([^\n]*(client[-_ ]?key|tls-fingerprint|auth[-_ ]?token)', all_text) is None, "secret material may be logged")

report = {"strict": args.strict, "checks": checks, "failures": failures, "pass": not failures}
if args.report:
    out = Path(args.report)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")

for name, ok in checks.items():
    print(f"{'PASS' if ok else 'FAIL'} {name}")
if failures:
    for failure in failures:
        print(f"ERROR {failure}")
    raise SystemExit(1)
print("Libre Remote runtime hardening audit PASS")
