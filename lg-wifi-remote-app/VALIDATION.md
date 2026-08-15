# Release validation — Libre Remote 2.1.3 RC5.4

The active candidate is `2.1.3-rc5.4-customization` (Android `versionCode 29`). Evidence levels are L0 target, L1 compile, L2 packaged runtime, L3 protocol, L4 physical hardware and L5 signed/distributed release.

**Committed code is IMPLEMENTED evidence, not PASS evidence.** Current GitHub Actions billing prevents runners from executing, so every new runtime gate remains awaiting execution.

## Canonicalization and source gates

The canonicalization workflow must:

1. materialize exact RC5.4;
2. apply multiplatform hardening;
3. apply runtime security/network hardening;
4. finalize required call-site wiring fail-closed;
5. install deterministic test contracts;
6. run strict runtime/security and command-semantic audits;
7. prove idempotence;
8. remove `.b64`/patch transport and signing material;
9. commit normal source files.

If a known call-site shape cannot be hardened safely, the finalizer exits non-zero rather than leaving a decorative abstraction unused.

## Runtime security gates

Required source/compile/runtime evidence includes:

- `SecureStore` common contract;
- Android Keystore-backed AES/GCM adapter;
- iOS Security.framework Keychain adapter;
- macOS Keychain adapter;
- Windows DPAPI CurrentUser adapter;
- Linux Secret Service adapter with explicit unavailable behavior;
- no new plaintext LG client-key writes to ordinary preferences;
- legacy credential migration only after secure write/read-back succeeds;
- TLS fingerprint and WSS-success history kept with credential trust state;
- fail-closed peer-certificate policy for missing/changed certificates;
- WSS-success persistence consulted by LG endpoint selection;
- no silent WS downgrade after WSS history;
- test-only memory secure store reachable only through `LIBRE_REMOTE_TEST_SECURE_STORE=1`;
- strict source audit and secret-logging audit.

## Network/parser/semantics gates

- bounded reads replace read-all-then-truncate patterns;
- safe UPnP XML path rejects DTD/entities, excessive depth and oversized documents;
- local URL policy rejects unsupported schemes, userinfo and non-local/public literal destinations;
- stable device identities can migrate their secure scope from temporary address identity;
- `MuteToggle` and absolute `SetMute` are distinct capability contracts;
- absolute setters may not internally invoke known toggle commands;
- host capabilities such as SecureStorage/Microphone/SpeechRecognition intersect TV capabilities.

## Deterministic protocol validation

`protocol-lab/` provides deterministic LG, Samsung, DLNA/UPnP and SSDP fixtures. Its own self-test covers fake-server correctness, including LG WS/WSS, pairing denial, Samsung control, DLNA description, SSDP and TLS certificate rotation.

More importantly, the client-integration workflow executes the **real `LgWebOsRemote`** against the lab on:

- Windows, Linux and macOS through `desktopTest`;
- Android API 35 emulator through instrumentation (`10.0.2.2:3000` host lab);
- iOS Simulator through `iosSimulatorArm64Test`.

The integration contract covers initial compatible WS pairing/command/client-key persistence and the critical negative case: persisted WSS success + a WS-only fake TV must never reach `Connected`. Each job checks that its named test class actually exists in test result artifacts and rejects non-zero test failures/errors.

Samsung/DLNA fake endpoints and security/parser policy tests exist now; broader real-client Samsung/DLNA command parity remains experimental evidence and does not upgrade their public support claim without executed tests/hardware.

## Android gates

- debug/release/lint/unit tasks when available;
- API 29/33/35 emulator matrix;
- font scale 1.0/1.5/2.0, landscape, bounds/touch targets;
- relaunch/process checks, Monkey, memory/gfx/ANR/crash/battery evidence;
- RC5.3 → RC5.4 in-place upgrade sentinel;
- Android Keystore implementation compilation;
- LG client→protocol-lab instrumentation;
- production APK/AAB signing + signature verification when protected secrets exist.

## iOS / iPadOS gates

- iOS device/simulator K/N frameworks and explicit framework ID;
- XCFramework;
- real SwiftUI wrapper build for simulator/device;
- Local Network, ATS local, multicast, microphone and speech metadata;
- separate iPhone and iPad simulator install/launch/screenshot jobs;
- iOS Keychain implementation compile;
- LG client→lab simulator test;
- production archive/export/App Store Connect upload path.

L4/L5 still require Apple-approved multicast provisioning and physical iPhone/iPad discovery/voice/network evidence.

## Desktop packaging and clean-install gates

### Windows

MSI + EXE, final app launch, hashes, stable upgrade UUID, DPAPI adapter, client→lab. A fresh Windows runner installs the MSI silently, locates/launches the installed application and uninstalls it. Production signing uses Authenticode and then verifies the signature.

### Linux

DEB + RPM, headless app launch, Secret Service adapter, client→lab. A fresh Ubuntu runner installs/launches/removes the DEB, and a fresh Fedora container installs/removes the produced RPM. Linux accessibility limitations remain documented.

### macOS

DMG + PKG, `.app` launch, stable bundle ID/Local Network metadata, Keychain adapter, client→lab. A fresh macOS runner installs the PKG, launches `/Applications/Libre Remote.app` and removes it. Production flow uses Developer ID signing, `productsign`, notarization, stapling and Gatekeeper verification.

## Production signing behavior

`.github/workflows/libre-remote-release-signing.yml` is intentionally fail-closed. Missing production credentials are reported as **BLOCKED**; with `enforce_credentials=true` they fail the run. It never synthesizes a test signing identity as release evidence.

Prepared credential-backed paths are:

- Android APK/AAB signing and verification;
- Windows Authenticode MSI/EXE signing and verification;
- macOS Developer ID + installer signing + notarization/stapling/Gatekeeper;
- iOS Apple Distribution provisioning + archive/export/upload to App Store Connect for TestFlight processing.

## Physical gates

Before broad stable claims, `LIBRE_REMOTE_HARDWARE_MATRIX.md` must record real host/TV/network evidence for LG and experimental Samsung generations: discovery, accepted/denied pairing, reconnect, sleep/off, DHCP/IP changes, Wi-Fi/Ethernet combinations, navigation, volume/channels, pointer, keyboard, apps, inputs, media, WOL and accessibility-relevant behavior.

## Current infrastructure state

GitHub currently rejects jobs before runner allocation because of account billing/spending configuration. Prior checks show `runner_id=0` and zero executed steps. Therefore RC5.4 remains **source-prepared, not CI-validated**, and PR #29 must remain draft until the evidence gates actually execute.
