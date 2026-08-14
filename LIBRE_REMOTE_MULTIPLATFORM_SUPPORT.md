# Libre Remote RC5.4 — Multiplatform Support Contract

This document separates **target availability**, **successful compilation**, **runtime validation**, **hardware validation**, and **distribution readiness**. A platform must not be advertised as fully supported merely because Kotlin/Compose can compile a target for it.

## Support levels

- **L0 — Target exists:** source set / target is present.
- **L1 — Compiles:** CI produces the platform binary.
- **L2 — Runs:** the final packaged application launches on the target OS.
- **L3 — Protocol validated:** discovery, pairing, commands, disconnect and reconnect pass against deterministic fake-TV servers.
- **L4 — Hardware validated:** representative real devices and real TVs pass the physical matrix.
- **L5 — Distribution ready:** signed/notarized store or installer artifact, upgrade preservation, privacy declarations and release checks pass.

No release note or store listing may claim a level above the evidence recorded by CI and physical validation.

## RC5.4 platform matrix

| Platform | Intended architectures | RC5.4 automated gate | Distribution artifact | External/manual gate |
|---|---|---|---|---|
| Android | arm64-v8a / armeabi-v7a / x86_64 as produced by Android build | build, lint/tests when exposed, multi-API emulator, UI/font/landscape/perf/upgrade | APK; AAB/release when configured | physical phones + TVs; Play signing/internal testing |
| iPhone / iPad | arm64 device; arm64 simulator | Kotlin frameworks, XCFramework, SwiftUI wrapper compile, simulator install/launch, privacy metadata | unsigned CI app/XCFramework | Apple Developer signing, multicast entitlement approval, TestFlight, physical local-network test |
| Windows | x86-64 current runner | desktop tests, app-image build, EXE/MSI package, final executable launch | EXE + MSI | Authenticode/Store signing, clean Windows VM, Defender/Private Network discovery test |
| Linux | x86-64 current runner | desktop tests, app-image build, DEB/RPM package, headless launch | DEB + RPM | Ubuntu/Debian/Fedora clean-machine tests; Secret Service availability; accessibility limitation disclosure |
| macOS | runner architecture recorded in artifact | desktop tests, app-image build, DMG/PKG package, final app launch, generated LAN-privacy metadata | DMG + PKG | Developer ID signing, notarization, local-network permission, Gatekeeper clean-machine test; Intel build only if separately produced |

Architectures not produced by CI are **not implicitly supported**. In particular, Windows ARM64, Linux ARM64 and macOS Intel require their own build/runtime evidence before being added to the support claim.

## Apple requirements

### iOS / iPadOS

The hardened source must contain:

- `NSLocalNetworkUsageDescription`;
- `NSMicrophoneUsageDescription`;
- `NSSpeechRecognitionUsageDescription`;
- `NSAppTransportSecurity.NSAllowsLocalNetworking = true`;
- `com.apple.developer.networking.multicast = true` in the entitlements file;
- an explicit app bundle identifier;
- an explicit Kotlin/Native framework bundle identifier;
- no project-level `CODE_SIGNING_ALLOWED: NO` setting that would make production signing impossible.

CI intentionally compiles unsigned Apple artifacts. Real iOS distribution still requires an Apple provisioning profile authorized for multicast networking. Simulator success is not evidence that SSDP/multicast works on a physical iPhone or iPad.

### macOS

macOS 15+ local-network privacy is a separate host requirement. The packaged desktop `.app` must have:

- a stable `CFBundleIdentifier` / Compose `bundleID`;
- `NSLocalNetworkUsageDescription` in the generated `Info.plist`;
- stable production code signing before public distribution so the OS can track permission identity reliably.

The iOS multicast entitlement is **not required on macOS**. Physical/clean-machine validation must still exercise the Local Network permission prompt and denied/allowed flows.

## Desktop packaging requirements

`createDistributable` is a runtime smoke artifact, not the public installer contract. RC5.4 also exposes the native package formats:

- macOS: `DMG`, `PKG`;
- Windows: `MSI`, `EXE`;
- Linux: `DEB`, `RPM`.

The installer-facing package version is normalized to `2.1.3` while the app release label remains `2.1.3-rc5.4-customization`. Each desktop job must prove that every expected package type was actually produced; a green compile without the expected installer files is a failure.

Windows additionally uses the stable upgrade UUID `9d0feb6a-8a93-558e-9297-4d2f0c6dc420` so future installer releases can participate in the same upgrade lineage. This UUID must not be regenerated per release.

The packaged application itself must be launched in CI after packaging. A successful Gradle compile alone does not satisfy L2.

## Accessibility contract

- Android: UIAutomator/layout/touch-target evidence plus physical accessibility checks before release.
- iOS/iPadOS: VoiceOver, Dynamic Type and focus order require physical/simulator QA.
- macOS: Compose accessibility is supported and must be exercised before L5.
- Windows: the reduced runtime includes `jdk.accessibility`; Narrator/Java Access Bridge requires manual/VM validation.
- Linux: current Compose Desktop accessibility support is limited; do not advertise equivalent screen-reader support until the framework/platform path supports it and the app is tested.

## Secure-storage contract

Secrets are not ordinary preferences.

Production targets are:

- Android — Android Keystore-backed storage;
- iOS/macOS — Keychain;
- Windows — Credential Manager / DPAPI;
- Linux — Secret Service / libsecret.

`java.util.prefs.Preferences`, DataStore and NSUserDefaults are permitted only for non-secret preferences. The hardening pass emits `SECURITY-GATES.md` and can enforce the desktop gate with `LIBRE_REMOTE_STRICT_SECURE_STORE=1` after the native implementations are committed into the canonical source tree.

## Protocol parity contract

Every host platform must eventually run the same deterministic contract suite against fake LG webOS, Samsung Tizen and DLNA/UPnP endpoints. At minimum:

1. discovery and duplicate discovery;
2. stable identity and address change;
3. pairing accepted, denied and expired;
4. secure LG WSS preference and controlled WS fallback;
5. unsupported command semantics;
6. TV asleep/off and reconnect;
7. Wi-Fi/network interruption;
8. malformed or oversized local responses;
9. IPv4 and IPv6 where supported;
10. persistence and upgrade of profiles/credentials.

A capability must be exposed only when both the TV backend and the host platform can implement it truthfully.

## Release blockers that cannot be solved by source-only CI

The following remain mandatory even after all workflows are green:

- GitHub Actions billing/spending must allow runners to execute;
- Apple multicast entitlement approval and real signing credentials;
- Windows/macOS production signing credentials;
- physical iPhone/iPad local-network discovery test;
- macOS local-network permission testing on a signed app;
- real-TV matrix across supported manufacturers/firmware generations;
- clean-machine installer/update/uninstaller validation;
- native desktop secure storage before L5.
