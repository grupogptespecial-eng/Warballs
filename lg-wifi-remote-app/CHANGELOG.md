# Changelog

## 2.0.0-rc1 — 2026-07-13

### Product foundation

- Room database for devices, macros, layouts and bounded diagnostic history;
- DataStore preferences for accessibility settings;
- migration from legacy preferences and Room schema 1 to 2;
- stable UDN/USN-based device identity that survives local IP changes;
- multiple saved TVs, rooms and per-device capabilities;
- custom macro creation, execution and deletion with safety limits;
- deterministic local command parser for Portuguese voice phrases;
- Android widget, dynamic launcher shortcuts and Quick Settings tile;
- larger controls, left-handed mode, high contrast and reduced motion;
- sanitized diagnostics and local performance percentiles;
- bounded priority scheduler separating critical, repeating and normal commands.

### Engineering and release

- final application ID `io.github.grupogptespecialeng.libreremote`;
- release version `2.0.0-rc1` / version code 20;
- reproducible CI build for tests, release lint, APK, AAB, signature report and checksums;
- Room schema export and explicit migration;
- full GPL-3.0 license, architecture/build/test/release documentation;
- issue and pull-request templates, Dependabot and contributor governance;
- complete Play Store text, privacy page, Data Safety notes, icon, feature graphic and screenshot package;
- encrypted credential stores and product database excluded from backup/device transfer.

### Compatibility

- LG webOS remains the primary full backend;
- Samsung Tizen local remains experimental until its physical model matrix is complete;
- DLNA/UPnP remains media-only;
- inactive platforms are not advertised as implemented.

### External requirements before production

- sign the first Play upload with the permanent upload key;
- publish the privacy policy at an HTTPS URL;
- finish the Play Console declarations and account-specific testing requirements;
- complete physical LG/Samsung/DLNA validation and replace conceptual screenshots with final device captures when needed.

## 1.1.0-rc1 — 2026-07-12

- universal backend contract and registry;
- multiprotocol SSDP/UPnP discovery and deduplication;
- LG webOS backend, experimental Samsung Tizen local backend and DLNA media backend;
- capability-driven interface, reconnect backoff and command latency measurement.

## 0.2.0-beta — 2026-07-12

- Jetpack Compose interface, LG persistent WebSocket, touchpad, apps, inputs, media, text and Wake-on-LAN;
- encrypted pairing preferences and adaptive launcher icon.

## 0.1.0 — 2026-07-12

- initial LG webOS Wi-Fi remote prototype.
