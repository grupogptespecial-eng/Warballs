# Release Status — Libre Remote 2.1.3 RC5.4

Active candidate: `2.1.3-rc5.4-customization` (`versionCode 29`).

The universal RC is treated as the continuation of Libre Remote, using Android applicationId `io.github.grupogptespecialeng.libreremote`. The `.universal` package suffix is not used by the hardened candidate because it would create a separate Android app and break in-place upgrade continuity.

## Implemented

- LG webOS local control with navigation, volume, channels, pointer/touchpad, keyboard, apps, inputs, media and power-off.
- Samsung Tizen local backend remains experimental.
- DLNA/UPnP AV media backend.
- Capability-driven UI, saved TVs, layouts and customization.
- Local-only design with encrypted pairing material and no analytics/ads.

## RC5.4 hardening gates

- RC5.4 materializer hashes must pass.
- Hardening transform must be idempotent.
- WSS `:3001` is preferred over cleartext WS `:3000`; a legacy saved `ws://` endpoint cannot outrank WSS.
- No signing keystore/key is tracked in Git.
- Build/test workflow covers multiple Android API levels and device profiles.
- Font scales 1.0/1.5/2.0, relaunch, memory, gfx/jank, battery-stat, ANR and crash evidence are captured.
- RC5.3 -> RC5.4 in-place upgrade must preserve app-private data.
- Physical hardware matrix remains required before expanding stable compatibility claims.

## Source migration

The historical RC5 transport used `.b64` fragments plus patches. The hardening branch includes a canonicalization workflow that materializes RC5.4, applies the hardening transform, commits the full source tree, and removes the transport-only `.rc5-universal` / `.universal-*` payload directories. After canonicalization, normal source files become the release source of truth.

## External blocker

GitHub Actions runners are currently rejected before execution because of repository/account billing or spending-limit configuration. This is an infrastructure blocker, not a Kotlin/Gradle test failure. The hardening branch must receive green CI after billing is restored.

## Still required before public stable release

- Run all hardening workflows successfully.
- Validate multiple real LG/Samsung models/firmware generations.
- Validate Wi-Fi/Ethernet, pairing denial, TV sleep/off, DHCP/IP change and reconnect.
- Generate production signing material outside source control.
- Build signed release APK/AAB, verify signatures/hashes and run Play pre-launch checks.
- Publish privacy/support URLs and current store screenshots.
