# Building Libre Remote

This document describes the supported development/build path for the hardened Kotlin Multiplatform source.

## Toolchain baseline

The RC5.4 validation workflows currently pin or expect:

- Java 17;
- Gradle 8.13;
- Android SDK platform 36;
- Android Build Tools 35.0.0;
- current Xcode on the selected macOS runner for Apple targets.

The CI workflow is the source of truth when these pins change.

## Source layout during RC5.4 hardening

The historical release source is reconstructed by `.rc5-universal/materialize-rc5.4.sh` and hardened by the scripts under `scripts/`.

Before public release, the canonicalization workflow must commit the full normal source tree and remove `.b64`, patch transport, and materializer-only directories. Public development must not continue through encoded payloads/patch overlays.

## Local materialization before canonicalization

From the repository root:

```bash
bash .rc5-universal/materialize-rc5.4.sh libre-remote-universal
python3 scripts/harden_libre_remote_rc5_4.py libre-remote-universal
python3 scripts/implement_libre_remote_runtime_hardening.py libre-remote-universal
python3 scripts/finalize_libre_remote_runtime_hardening.py libre-remote-universal
python3 scripts/audit_libre_remote_runtime_hardening.py libre-remote-universal --strict --report runtime-security-audit.json
```

The test-only in-memory secure store is **not** a production fallback. Enable it only for deterministic tests that explicitly need it:

```bash
LIBRE_REMOTE_TEST_SECURE_STORE=1 python3 scripts/enable_libre_remote_test_secure_store.py libre-remote-universal
```

## Common and desktop tests

```bash
cd libre-remote-universal
./gradlew :composeApp:desktopTest
```

If no wrapper exists in the materialized source, install/use the Gradle version pinned by CI:

```bash
gradle --no-daemon :composeApp:desktopTest
```

## Android

```bash
./gradlew :composeApp:assembleDebug
```

Release, lint and unit tasks are executed by CI when exposed by the project. Production signing credentials must come from protected CI secrets or a secure external signing process; never create or commit release keystores in the repository.

## iOS / iPadOS

Kotlin/Native framework checks:

```bash
./gradlew :composeApp:linkDebugFrameworkIosSimulatorArm64
./gradlew :composeApp:linkDebugFrameworkIosArm64
```

The release pipeline additionally builds the SwiftUI wrapper. Framework-only success is insufficient evidence that the iOS app works.

A signed physical-device build requires Apple Developer provisioning and the approved capabilities used by Libre Remote, including multicast/local-network requirements where applicable.

## Desktop packages

### Windows

```bash
./gradlew :composeApp:createDistributable :composeApp:packageMsi :composeApp:packageExe
```

### Linux

```bash
./gradlew :composeApp:createDistributable :composeApp:packageDeb :composeApp:packageRpm
```

### macOS

```bash
./gradlew :composeApp:createDistributable :composeApp:packageDmg :composeApp:packagePkg
```

A package being produced does not by itself satisfy the release gate: CI must also install/launch it and, for production distribution, validate signing/notarization where required.

## Protocol lab

Run the deterministic fixtures directly:

```bash
python3 protocol-lab/libre_remote_lab.py --self-test --json
```

The client-integration workflow runs the real Libre Remote LG client against the fake protocol endpoint on desktop, Android Emulator and iOS Simulator.

## Public-release audit

Before creating a public source snapshot:

```bash
python3 scripts/audit_public_release.py --root . --report public-release-audit.json
```

For a Stable/1.0 candidate, use strict mode on the clean exported repository:

```bash
python3 scripts/audit_public_release.py --root . --strict --report public-release-audit.json
python3 scripts/audit_git_history.py --repo . --strict --report git-history-audit.json
```

The current Warballs repository is intentionally expected to fail the clean-history requirement because historical non-public transport/signing artifacts existed. Public Libre Remote should start from the sanitized exported source snapshot in a new repository/history.
