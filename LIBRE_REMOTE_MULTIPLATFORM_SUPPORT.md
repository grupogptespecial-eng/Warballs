# Libre Remote RC5.4 — Multiplatform Support Contract

> **Canonical engineering requirements:** `specs/001-rc5-4-multiplatform-hardening/spec.md`. This document is a public/evidence-facing view of platform support; it must not contradict the active spec.

A target existing, compiling, running, controlling a fake TV, working on physical hardware and being ready for public distribution are deliberately different claims.

## Support levels

- **L0 — Target exists:** source set / target is present.
- **L1 — Compiles:** CI produces the platform binary.
- **L2 — Runs:** the final packaged application launches on the target OS.
- **L3 — Protocol validated:** the real client passes deterministic protocol contracts.
- **L4 — Hardware validated:** representative real host devices and TVs pass the physical matrix.
- **L5 — Distribution ready:** signed/notarized store or installer artifact, upgrade preservation, privacy declarations and release checks pass.

No public claim may exceed recorded evidence.

## RC5.4 platform matrix

| Platform | Intended architectures | Implemented automated gates | Public artifact path | External/manual gate |
|---|---|---|---|---|
| Android | arm64-v8a / armeabi-v7a / x86_64 as produced by Android build | build, multi-API emulator, UI/perf/upgrade, Keystore compile, real LG client→lab instrumentation | signed APK/AAB workflow | billing, production signing/store, physical phone+TV |
| iPhone / iPad | arm64 device; arm64 simulator | frameworks/XCFramework, SwiftUI wrapper, separate iPhone+iPad simulator launch, Keychain compile, real LG client→lab simulator test | App Store Connect/TestFlight workflow | Apple multicast provisioning, signing creds, physical device/network |
| Windows | x86-64 current runner | desktop tests, MSI/EXE, app launch, DPAPI, real LG client→lab, clean MSI install/remove | Authenticode MSI/EXE workflow | production PFX, firewall/private-network and physical-TV evidence |
| Linux | x86-64 current runner | desktop tests, DEB/RPM, headless launch, Secret Service, real LG client→lab, Ubuntu/Fedora clean package lifecycle | DEB + RPM | distro/network/hardware evidence; accessibility limitation |
| macOS | runner architecture recorded | desktop tests, DMG/PKG, `.app` launch, Keychain, real LG client→lab, clean PKG install/remove | Developer ID/notarized DMG+PKG workflow | Apple signing/notary creds, Local Network and physical-TV evidence |

Architectures not produced and executed by CI are not implicitly supported. Windows ARM64, Linux ARM64 and macOS Intel need independent evidence.

## Apple requirements

### iOS / iPadOS

The hardened source declares Local Network, microphone and speech-recognition purpose strings, ATS local networking, multicast entitlement metadata, explicit app/framework bundle IDs, and keeps production signing possible. CI builds remain unsigned unless the dedicated distribution workflow is invoked with protected credentials.

The distribution workflow is prepared to build release frameworks, archive the SwiftUI app with a real provisioning profile, export/upload through App Store Connect authentication and report BLOCKED when the required certificate/profile/API key is absent. Physical iPhone/iPad testing remains mandatory because simulator success is not evidence of real multicast/local-network behavior.

### macOS

The desktop `.app` uses a stable bundle identity and Local Network usage text. The production path is prepared for Developer ID application/installer identities, `codesign`, `productsign`, `notarytool`, stapling and Gatekeeper validation. Missing signing credentials are never replaced by a test identity.

## Secure-storage contract

Secrets are isolated behind the common `SecureStore` contract defined by the active spec. The runtime hardening now implements:

- Android — AES/GCM using a key held by Android Keystore;
- iOS — Security.framework Keychain;
- macOS — Keychain;
- Windows — DPAPI CurrentUser;
- Linux — Secret Service via `secret-tool`.

Ordinary preferences are for non-secret state. On Windows they may contain DPAPI ciphertext and a non-secret index, but never live plaintext credentials. Linux secret operations fail if Secret Service is unavailable rather than falling back to plaintext.

Legacy LG `client-key` migration is verify-before-delete: write secure value, read it back, then remove the old preference. TLS fingerprints and persisted WSS-success state use the secure store too. A process-memory secure store exists only behind the explicit `LIBRE_REMOTE_TEST_SECURE_STORE=1` test environment flag.

`audit_libre_remote_runtime_hardening.py --strict` is the post-implementation release gate. The older pre-transform scan remains informational so it does not block the remediation before the new adapters are injected.

## Transport/network contract

- WSS `:3001` is first-choice LG transport.
- A TV with persisted successful WSS history may not silently downgrade to WS until trust is explicitly reset.
- Missing or changed peer certificates are deny decisions; TOFU only permits a first presented certificate to become the trust candidate.
- `read-all then take(N)` patterns are rejected in favor of bounded streaming reads.
- UPnP XML has byte/depth bounds and rejects DTD/entities.
- local control URLs are subject to scheme/authority/private-or-local-host policy.
- stable device IDs can promote temporary IP identities while migrating their secure scope.

## Command/capability contract

`MuteToggle` and absolute `SetMute` are different semantics, as are play/pause toggles and absolute actions. `audit_libre_remote_command_semantics.py` rejects known toggle commands hidden behind absolute setters. Features also intersect TV capability with `HostCapability`, so a TV capability is not exposed as functional when the host lacks its prerequisite, such as SecureStorage or voice facilities.

## Deterministic protocol lab

`protocol-lab/` implements LG WS/WSS, Samsung WebSocket, DLNA/UPnP HTTP/SOAP and SSDP fixtures, including pairing denial, TLS rotation, malformed/entity/oversized XML and stable UDN data.

The real `LgWebOsRemote` is wired into generated integration tests for:

- Windows/Linux/macOS desktop tests;
- Android emulator instrumentation using host `10.0.2.2`;
- iOS Simulator Kotlin/Native tests.

Each CI job requires the expected task to exist and then verifies that the named integration-test class appears in the generated result files. Thus a green task that skipped the actual protocol test cannot be used as L3 evidence.

## Desktop packaging and clean-machine contract

`createDistributable` remains useful for a runtime image but is not the public installer contract. The expected formats are Windows MSI+EXE, Linux DEB+RPM and macOS DMG+PKG. Dedicated clean-machine jobs install/launch/remove MSI on a fresh Windows runner, DEB on Ubuntu, RPM in a fresh Fedora container, and PKG on a fresh macOS runner.

Windows retains upgrade UUID `9d0feb6a-8a93-558e-9297-4d2f0c6dc420`; package version is `2.1.3` while the app/release label remains `2.1.3-rc5.4-customization`.

## Accessibility contract

- Android — geometry/font stress automation plus physical accessibility checks before L5.
- iOS/iPadOS — simulator family separation is automated; VoiceOver/focus/physical Dynamic Type remain explicit evidence gates.
- macOS — app accessibility requires signed/physical validation before L5.
- Windows — reduced runtime includes `jdk.accessibility`; Narrator/Java Access Bridge evidence remains required.
- Linux — do not claim equivalent screen-reader support while the Compose Desktop platform path remains limited.

## Release blockers that code cannot mark PASS

- GitHub Actions billing/spending must allow runners to execute;
- Apple multicast entitlement approval and real provisioning;
- production Android/Windows/macOS/iOS signing credentials and store access;
- physical iPhone/iPad Local Network validation;
- real-TV matrix across supported manufacturers/firmware generations and network states;
- physical accessibility/hardware-specific validation.

The corresponding workflows are implemented, but until they execute successfully the RC remains **source-prepared rather than CI-validated**.
