# Release validation — Libre Remote 2.1.3 RC5.4

The active candidate is `2.1.3-rc5.4-customization` (`versionCode 29`). The legacy Android-only directory is retained for history/reference; release validation for RC5.4 is performed against the universal source produced from the RC5.4 materializer and hardened by `scripts/harden_libre_remote_rc5_4.py`.

## Automated gates

Required before release:

- source/materializer hash validation;
- hardening transform and identity invariants;
- common/desktop unit tests;
- Android debug build and available release/lint/unit tasks;
- emulator smoke across multiple Android API levels and device profiles;
- large-font and relaunch checks;
- memory, gfx/jank, battery-stat, crash and ANR evidence capture;
- RC5.3 -> RC5.4 in-place upgrade install;
- APK SHA-256 and build manifest.

## Security gates

- Android applicationId remains `io.github.grupogptespecialeng.libreremote` for upgrade continuity;
- LG WSS `:3001` must outrank cleartext WS `:3000`;
- a previously stored `ws://` endpoint may not outrank WSS;
- no `.jks`, `.keystore`, private key or signing password may be committed;
- release signing material comes only from protected secrets/external secure signing.

## Physical gates

Emulator success is not sufficient for a remote-control release. Before broad stable claims, record PASS/FAIL/N/A/NOT TESTED for multiple real LG/Samsung generations covering discovery, pairing accepted/denied, reconnect, TV sleep/off, IP change, Wi-Fi/Ethernet, navigation, volume, channels, pointer, keyboard, apps, inputs, media and Wake-on-LAN.

## Current infrastructure note

The latest RC5.4 GitHub Actions attempt investigated before this hardening branch did not start because GitHub billing/spending configuration blocked runner allocation. The hardening workflows therefore must be rerun after billing is restored. Until they are green, RC5.4 is source-prepared but not CI-validated.
