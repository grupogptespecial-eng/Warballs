# Changelog

## 1.1.0-rc1 — 2026-07-12

### Added

- universal `TvBackend` contract and backend registry;
- automatic platform and support-level metadata;
- multiprotocol SSDP/UPnP discovery and device-description parsing;
- deduplication that prefers a full local backend over DLNA for the same TV;
- encrypted Samsung Tizen token storage and persistent local WebSocket control;
- experimental Samsung navigation, volume, channels, media, numeric, colored and power keys;
- DLNA AVTransport and RenderingControl backend for media, volume and mute;
- migration of saved LG devices to stable platform-aware identifiers;
- capability-driven UI that hides unsupported controls;
- experimental-backend toggle and platform/support labels in the device picker;
- local command-dispatch latency measurement in network diagnostics.

### Performance

- Samsung endpoint racing and persistent sockets;
- bounded Samsung command queue;
- 250 ms initial reconnect backoff;
- faster held-button repetition;
- pooled HTTP connection for DLNA commands;
- previous LG persistent socket and conflated pointer optimizations retained.

### Honest limitations

- LG is the only full backend considered stable in this release candidate;
- Samsung Tizen local is experimental and requires physical testing by generation;
- DLNA controls only the current media session and exposed volume service;
- SmartThings, Google Cast and Fire TV are represented in the architecture but not activated;
- Roku control remains disabled because of vendor-policy concerns;
- no claim of compatibility with every television is made.

All notable changes to Libre Remote will be documented here.

## 0.2.0-beta — 2026-07-12

### Added

- complete Jetpack Compose and Material 3 interface;
- rounded controls, circular directional pad and bottom navigation;
- dedicated Control, Touchpad, Apps and Settings areas;
- persistent LG webOS WebSocket connection;
- fast connection selection between local ports 3000 and 3001;
- immediate command dispatch on press and repeat while holding volume or channel controls;
- conflated touchpad motion queue and adjustable sensitivity;
- SSDP discovery and manual IP connection;
- dynamic application and input loading;
- media, numeric keypad, colored keys, text input and Wake-on-LAN controls;
- dark and light themes and optional haptic feedback;
- encrypted pairing preferences and local TLS certificate trust-on-first-use checks;
- open-source project documentation.

### Known limitations

- compatibility is currently focused on LG webOS televisions;
- behavior varies across firmware generations and routers;
- the downloadable beta APK is debug-signed and is not the future Google Play release build;
- runtime testing is still required on a wider device matrix.

## 0.1.0 — 2026-07-12

- initial functional LG webOS Wi-Fi remote prototype.
