# Libre Remote

Libre Remote is an open-source, local-first universal remote for TVs and media devices on your local network.

> **Release status:** the current RC5.4 hardening branch is source-prepared but not yet CI-validated because GitHub Actions runners are currently blocked before execution. Do not interpret committed release gates as passed evidence until the corresponding workflow has run successfully.

## Principles

- no ads, developer tracking, or mandatory Libre Remote account;
- local-first control whenever the target platform allows it;
- truthful capability reporting instead of fake/partial controls;
- pairing credentials stay in platform-native secure storage;
- no production signing keys or certificates in the repository;
- accessibility, bounded network I/O, cancellation, and explicit failure states are release requirements.

## Host platforms

| Host | Intended artifact | Current release gate |
|---|---|---|
| Android | APK / AAB | build, emulator matrix, accessibility/layout/perf, upgrade, signing |
| iPhone / iPad | App Store / TestFlight | KMP framework, SwiftUI wrapper, simulator, Keychain, privacy metadata, signing |
| Windows | MSI / EXE | packaged launch, DPAPI, protocol lab, clean install, Authenticode |
| Linux | DEB / RPM | packaged launch, Secret Service, protocol lab, clean install |
| macOS | DMG / PKG | packaged launch, Keychain, Local Network privacy, notarization |

Architectures and operating systems are supported only at the evidence level recorded in `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`.

## TV backends

- **LG webOS:** primary backend; WSS-first transport, pairing, navigation, volume, channels, pointer/keyboard, apps/inputs/media and power features where the TV exposes them.
- **Samsung Tizen:** experimental until the deterministic and physical compatibility matrix is sufficient.
- **DLNA / UPnP AV:** media/control subset according to advertised services.

Other manufacturers are not implicitly supported.

## Build

See [`BUILDING.md`](BUILDING.md). The hardened multiplatform project lives in `libre-remote-universal/` until canonicalization commits it as the normal source tree.

Typical validation tasks after canonicalization include:

```bash
./gradlew :composeApp:desktopTest
./gradlew :composeApp:assembleDebug
./gradlew :composeApp:linkDebugFrameworkIosSimulatorArm64
```

If the Gradle wrapper is not present in the materialized tree, use the pinned Gradle version from the CI workflows.

## Security

See [`SECURITY.md`](SECURITY.md). Do **not** open public issues containing pairing keys, certificate material, private network identifiers, signing credentials, or working exploit details.

Production credential targets are Android Keystore, Apple Keychain, Windows DPAPI/Credential Manager semantics, and Linux Secret Service/libsecret. Ordinary preferences are not accepted as a production secret store.

## Protocol validation

`protocol-lab/` contains deterministic fake LG, Samsung and DLNA/UPnP endpoints used to exercise pairing, reconnect, malformed input, TLS/downgrade behavior and command semantics. Build success alone is not considered protocol parity.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and the active hardening spec under `specs/001-rc5-4-multiplatform-hardening/` before making protocol or release changes.

## Releases and evidence

- [`RELEASE_POLICY.md`](RELEASE_POLICY.md) defines Stable Candidate and 1.0 gates.
- [`LIBRE_REMOTE_RELEASE_MANIFEST.md`](LIBRE_REMOTE_RELEASE_MANIFEST.md) records release invariants.
- [`LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`](LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md) defines L0-L5 support evidence.
- [`LIBRE_REMOTE_HARDWARE_MATRIX.md`](LIBRE_REMOTE_HARDWARE_MATRIX.md) is the physical validation matrix.
- [`CHANGELOG.md`](CHANGELOG.md) records public release changes.

## License

Libre Remote is licensed under the [Apache License 2.0](LICENSE). Third-party software remains under its respective licenses; release artifacts must include the required notices recorded in `THIRD_PARTY_NOTICES.md`.

Libre Remote is an independent project and is not affiliated with or endorsed by LG Electronics, Samsung Electronics, Apple, Microsoft, Google, or other device manufacturers unless explicitly stated.
