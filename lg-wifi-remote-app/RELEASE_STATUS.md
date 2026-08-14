# Release Status — Libre Remote 2.1.3 RC5.4

Active candidate: `2.1.3-rc5.4-customization` (Android `versionCode 29`).

The universal RC is treated as the continuation of Libre Remote. Android keeps applicationId `io.github.grupogptespecialeng.libreremote`; the hardened Apple app uses bundle ID `io.github.grupogptespecialeng.libreremote`, with an explicit Kotlin/Native framework ID `io.github.grupogptespecialeng.libreremote.framework`.

## Implemented architecture

- LG webOS local control with navigation, volume, channels, pointer/touchpad, keyboard, apps, inputs, media and power-off.
- Samsung Tizen local backend remains experimental.
- DLNA/UPnP AV media backend.
- Capability-driven UI, saved TVs, layouts and customization.
- Local-first design with no ads or developer analytics.
- Multiplatform targets for Android, iOS/iPadOS and Compose Desktop.

## RC5.4 hardening gates

### Common
- RC5.4 materializer hashes must pass.
- Hardening transform must be idempotent.
- WSS `:3001` is preferred over cleartext WS `:3000`; a legacy saved `ws://` endpoint cannot outrank WSS.
- No production signing keystore/key/certificate is tracked in Git.
- Kotlin/Native framework bundle identity is explicit.
- Support claims follow evidence levels L0-L5 from `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`.

### Android
- Existing app identity is preserved for in-place upgrades.
- Build/test workflow covers multiple Android API levels and device profiles.
- Font scales 1.0/1.5/2.0, landscape, memory, gfx/jank, battery-stat, ANR and crash evidence are captured.
- RC5.3 -> RC5.4 upgrade must preserve app-private data.

### iOS / iPadOS
- Local Network, microphone and speech-recognition usage strings are declared.
- ATS local networking is explicitly enabled.
- `com.apple.developer.networking.multicast` is declared for SSDP/UDP discovery.
- Project-level code signing is not disabled; CI chooses unsigned builds explicitly.
- Both device/simulator frameworks and the XCFramework are built.
- The SwiftUI wrapper itself must compile for simulator and device.
- The generated app must install and launch in an iOS Simulator.
- Physical iPhone/iPad discovery remains mandatory because simulator success does not prove multicast behavior on hardware.

### Windows / Linux / macOS
- `desktopTest` and `createDistributable` remain baseline checks.
- Public package formats are also generated: MSI/EXE, DEB/RPM and DMG/PKG.
- The final packaged application must launch before the platform reaches L2.
- Installer/package SHA-256 evidence is emitted.
- Windows runtime includes `jdk.accessibility` for Java Access Bridge.
- macOS runner architecture is recorded so arm64 evidence is not misrepresented as Intel support.

## Credential-storage status

Desktop credential protection is a **release blocker**, not a completed parity claim. The production target is:

- Android — Android Keystore;
- iOS/macOS — Apple Keychain;
- Windows — Credential Manager / DPAPI;
- Linux — Secret Service / libsecret.

`java.util.prefs.Preferences`, DataStore and NSUserDefaults are acceptable only for non-secret preferences. The hardening pass generates `SECURITY-GATES.md`; once the canonical source contains the native desktop implementations, `LIBRE_REMOTE_STRICT_SECURE_STORE=1` should become a mandatory release gate.

## Source migration

The historical RC5 transport used `.b64` fragments plus patches. The hardening branch includes a canonicalization workflow that materializes RC5.4, applies the multiplatform hardening transform, commits the full source tree, and removes transport-only `.rc5-universal` / `.universal-*` payload directories. After canonicalization, normal source files become the release source of truth.

## External blocker

GitHub Actions runners are still rejected before execution because of repository/account billing or spending-limit configuration. The new universal workflow was accepted by GitHub and created all five jobs, but `source-integrity` received `runner_id=0`, executed zero steps, and the dependent Windows/Linux/macOS/iOS jobs were skipped. This remains an infrastructure blocker, not a Kotlin/Gradle failure.

## Still required before public stable release

- Restore GitHub Actions billing and obtain green Android, upgrade and universal workflows.
- Canonicalize the RC5.4 source tree.
- Implement and validate native desktop secure storage.
- Validate multiple real LG/Samsung models and firmware generations.
- Validate Wi-Fi/Ethernet, pairing denial, TV sleep/off, DHCP/IP change and reconnect.
- Obtain Apple multicast-entitlement approval and validate a signed build on physical iPhone/iPad.
- Sign/notarize production desktop packages and validate clean-machine install/update/uninstall.
- Build signed Android release APK/AAB and run Play pre-launch checks.
- Publish privacy/support URLs and current store screenshots.
