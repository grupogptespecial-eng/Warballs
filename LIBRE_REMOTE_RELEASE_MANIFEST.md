# Libre Remote 2.1.3 RC5.4 — Release Manifest

Canonical release candidate: `2.1.3-rc5.4-customization`

- versionCode: `29`
- Android applicationId: `io.github.grupogptespecialeng.libreremote`
- Java: `17`
- Android build tools: `35.0.0`
- current source origin: RC5.4 materializer plus hardening pass
- target branch for hardening: `fix/libre-remote-rc5.4-hardening`

## Required release gates

1. Source integrity/materialization hashes pass.
2. Hardening transform is idempotent.
3. WSS on LG `:3001` is preferred over cleartext WS `:3000`; a legacy saved `ws://` endpoint may not outrank WSS.
4. Android applicationId remains the existing Libre Remote identity so an RC can upgrade the installed app rather than create a second app.
5. Debug APK builds; release APK/AAB tasks must run when available.
6. Unit/common tests and Android lint run when exposed by the Gradle project.
7. Emulator smoke runs on multiple Android API levels.
8. Upgrade install from RC5.3 to RC5.4 succeeds.
9. Large-font, landscape, repeated-command, memory, jank, ANR and crash evidence is captured.
10. Physical-TV validation remains mandatory before `StableFull` claims are widened.

## Physical validation matrix

Record at minimum: TV model, manufacture year, firmware/webOS/Tizen version, Wi-Fi/Ethernet, discovery, pairing accepted/denied, reconnect, IP change, WSS/WS, navigation, volume, channels, pointer, keyboard, apps, inputs, media and Wake-on-LAN.

Status values: `PASS`, `FAIL`, `N/A`, `NOT TESTED`.

## Release signing

No signing key or keystore may be committed. Release signing material must be provided by protected CI secrets or an external secure signing process. Any previously committed sideload key is considered test-only and retired.

## Known infrastructure blocker

As of the RC5.4 investigation, GitHub Actions runners were blocked by account billing/spending configuration. A green hardening workflow is therefore required after that account issue is resolved; source changes alone must not be interpreted as completed runtime validation.
