# Libre Remote 2.1.3 RC5.4 — Release Manifest

Canonical release candidate: `2.1.3-rc5.4-customization`

- versionCode: `29`
- Android applicationId: `io.github.grupogptespecialeng.libreremote`
- iOS application bundle ID: `io.github.grupogptespecialeng.libreremote`
- Kotlin/Native framework bundle ID: `io.github.grupogptespecialeng.libreremote.framework`
- Java: `17`
- Android build tools: `35.0.0`
- current source origin: RC5.4 materializer plus multiplatform hardening pass
- target branch for hardening: `fix/libre-remote-rc5.4-hardening`
- platform contract: `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`

## Required common release gates

1. Source integrity/materialization hashes pass.
2. Hardening transform is idempotent.
3. WSS on LG `:3001` is preferred over cleartext WS `:3000`; a legacy saved `ws://` endpoint may not outrank WSS.
4. Android applicationId remains the existing Libre Remote identity so an RC can upgrade the installed app rather than create a second app.
5. Kotlin/Native frameworks use an explicit bundle identifier rather than an inferred one.
6. No signing key, keystore, Apple certificate or Windows/macOS production certificate is committed.
7. Physical-TV validation remains mandatory before `StableFull` claims are widened.
8. A platform is advertised only at the support level actually demonstrated by CI and physical validation.

## Android gates

1. Debug APK builds; release APK/AAB tasks run when exposed/configured.
2. Unit/common tests and Android lint run when exposed by the Gradle project.
3. Emulator smoke runs across multiple Android API levels.
4. RC5.3 -> RC5.4 in-place upgrade succeeds with persistence retained.
5. Large-font, landscape, touch-target, memory, jank, ANR and crash evidence is captured.
6. Physical phone + TV testing remains required before public release.

## iOS / iPadOS gates

1. `iosArm64` and `iosSimulatorArm64` Kotlin frameworks compile.
2. The XCFramework is generated from the hardened RC5.4 source.
3. The SwiftUI wrapper itself compiles for simulator and device; framework-only success is insufficient.
4. The simulator app installs and launches.
5. `Info.plist` declares Local Network, microphone and speech-recognition usage descriptions.
6. ATS explicitly allows local networking.
7. The app has a multicast entitlement file for SSDP/UDP discovery.
8. Project configuration does not globally disable code signing; unsigned builds are a CI command-line choice only.
9. Production release additionally requires Apple approval for the multicast entitlement, signing/provisioning, TestFlight and physical iPhone/iPad discovery tests.

## Windows gates

1. `desktopTest` and `createDistributable` pass on Windows.
2. MSI and EXE packages are generated.
3. The final packaged executable launches before the CI job is considered L2.
4. SHA-256 hashes are emitted for produced installers.
5. The reduced runtime includes `jdk.accessibility` for Java Access Bridge support.
6. Production release requires Authenticode/Store signing and a clean Windows VM install/update/uninstall test.

## Linux gates

1. `desktopTest` and `createDistributable` pass on Linux.
2. DEB and RPM packages are generated.
3. The final packaged executable launches in a headless X session.
4. SHA-256 hashes are emitted for packages.
5. Ubuntu/Debian/Fedora clean-machine validation is required before widening support claims.
6. Current Compose Desktop screen-reader limitations on Linux must remain disclosed.

## macOS gates

1. `desktopTest` and `createDistributable` pass on macOS.
2. DMG and PKG packages are generated.
3. The final `.app` bundle launches.
4. CI records the runner architecture so arm64 validation is not misrepresented as Intel validation.
5. Production release requires Developer ID signing, notarization and Gatekeeper validation on a clean Mac.

## Secure-storage gate

Secrets must not be treated as ordinary preferences. Production targets are Android Keystore, Apple Keychain, Windows Credential Manager/DPAPI, and Linux Secret Service/libsecret. `java.util.prefs.Preferences`, DataStore and NSUserDefaults are for non-secret preferences only.

The hardening transform emits `SECURITY-GATES.md`. While the historical source is still materialized from patches, a detected desktop preferences/secret overlap is reported as a release blocker. After native stores are committed into the canonical tree, enable the strict gate with `LIBRE_REMOTE_STRICT_SECURE_STORE=1`.

## Physical validation matrix

Record at minimum: host OS/device, host architecture, TV model, manufacture year, firmware/webOS/Tizen version, Wi-Fi/Ethernet, discovery, pairing accepted/denied, reconnect, IP change, WSS/WS, navigation, volume, channels, pointer, keyboard, apps, inputs, media and Wake-on-LAN.

Status values: `PASS`, `FAIL`, `N/A`, `NOT TESTED`.

## Release signing

No signing material may be committed. Release signing material must be provided by protected CI secrets, store-managed signing, or an external secure signing process. Any previously committed sideload key is considered test-only and retired.

## Known infrastructure blocker

As of the RC5.4 investigation, GitHub Actions runners were blocked by account billing/spending configuration. Green Android and universal workflows are therefore required after that account issue is resolved; source changes alone must not be interpreted as completed runtime validation.
