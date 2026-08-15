# Libre Remote 2.1.3 RC5.4 — Release Manifest

> **Canonical engineering requirements:** `specs/001-rc5-4-multiplatform-hardening/spec.md`. This manifest is release evidence/supporting documentation; when it conflicts with the active spec, the spec wins.

Canonical release candidate: `2.1.3-rc5.4-customization`

- Android versionCode: `29`
- Android applicationId: `io.github.grupogptespecialeng.libreremote`
- iOS application bundle ID: `io.github.grupogptespecialeng.libreremote`
- Kotlin/Native framework bundle ID: `io.github.grupogptespecialeng.libreremote.framework`
- macOS application bundle ID: `io.github.grupogptespecialeng.libreremote`
- desktop installer packageVersion: `2.1.3`
- Windows installer upgradeUuid: `9d0feb6a-8a93-558e-9297-4d2f0c6dc420`
- Java: `17`
- Android build tools: `35.0.0`
- current source origin: RC5.4 materializer plus multiplatform/runtime hardening overlays until canonicalization executes
- target branch: `fix/libre-remote-rc5.4-hardening`
- active spec: `specs/001-rc5-4-multiplatform-hardening/spec.md`
- tasks/traceability: `specs/001-rc5-4-multiplatform-hardening/tasks.md` and `traceability.md`
- platform contract: `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`
- physical matrix: `LIBRE_REMOTE_HARDWARE_MATRIX.md`

## Common release gates

1. Source integrity/materialization hashes pass and the final hardening sequence is idempotent.
2. Canonicalization commits normal source files and removes transport-only `.b64`/patch payloads.
3. LG WSS `:3001` is attempted before WS `:3000`; after a successful WSS connection, persisted trust state prohibits silent WS downgrade until trust is explicitly reset.
4. TOFU certificate handling fails closed for missing or changed peer certificates.
5. Android/iOS/macOS/Windows identities remain stable across upgrades.
6. Secrets are routed through `SecureStore`, not ordinary application preferences.
7. Network payloads are bounded, local URLs are policy-checked, and UPnP XML rejects DTD/entities/oversized/deep documents.
8. Toggle-only manufacturer actions may not masquerade as absolute setters.
9. A platform claim may not exceed its recorded L0-L5 evidence level.
10. `scripts/validate_libre_remote_specs.py` and the strict runtime-security audit pass.

## Secure storage implementation

The runtime hardening now contains concrete platform adapters; these are **implemented source, not yet compiled/runtime-PASS because Actions cannot allocate runners**:

- Android — AES/GCM data encryption with the key held by Android Keystore; ciphertext is kept in dedicated private app storage.
- iOS — Security.framework Keychain (`SecItemAdd` / `SecItemCopyMatching` / `SecItemDelete`).
- macOS — Keychain-backed desktop adapter.
- Windows — DPAPI `CurrentUser`; only protected ciphertext/index data may live in ordinary preferences.
- Linux — Secret Service through `secret-tool`; if unavailable, secret operations fail instead of silently falling back to plaintext.

`ProfileStore` is transformed so new LG client keys, TLS fingerprints and WSS-success trust state use `SecureStore`. Legacy `lg.client.<ip>` data is migrated with **write → read-back verify → delete legacy** semantics; failed secure writes preserve the old credential. A strict source audit rejects surviving plaintext client-key writes or known fail-open trust patterns.

A process-memory store exists only when `LIBRE_REMOTE_TEST_SECURE_STORE=1` is explicitly set by tests; it is not a production fallback.

## Protocol/security evidence implementation

`protocol-lab/` now provides deterministic fixtures for:

- LG webOS WS/WSS registration, accepted/denied pairing, disconnect/expiry and TLS certificate rotation;
- Samsung WebSocket authorization/control responses;
- DLNA/UPnP device descriptions, SOAP, malformed XML, entity/DTD payloads and oversized responses;
- SSDP discovery with a stable UDN.

Generated client tests instantiate the real `LgWebOsRemote` on desktop, Android emulator and iOS Simulator. They cover initial WS-compatible pairing, command send/client-key persistence, and the critical **WSS-history + WS-only server must not reconnect** downgrade case. CI additionally asserts that the named test classes actually appear in test results; a task existing without executing the test is not accepted as L3 evidence.

## Platform gates

### Android

- debug/release/lint/unit tasks when exposed;
- API/device emulator matrix, font 1.0/1.5/2.0, landscape, touch geometry, relaunch, Monkey, memory/gfx/ANR/crash/battery evidence;
- RC5.3 → RC5.4 in-place upgrade sentinel;
- Android Keystore implementation compilation;
- real LG client → host protocol-lab instrumentation test;
- production APK/AAB signing workflow that verifies signatures when protected signing secrets are configured.

### iOS / iPadOS

- device + simulator Kotlin/Native frameworks, explicit bundle IDs and XCFramework;
- real SwiftUI wrapper compile for simulator/device;
- Local Network, ATS, multicast, microphone and speech metadata;
- separate iPhone and iPad simulator install/launch/screenshots;
- iOS Keychain implementation compilation;
- real LG client → protocol-lab Kotlin/Native simulator test;
- fail-closed App Store Connect/TestFlight archive/export/upload workflow when Apple distribution/profile/API credentials are configured.

Physical discovery remains mandatory because simulator success cannot prove real-device local-network/multicast behavior.

### Windows

- `desktopTest`, final app image, MSI + EXE, executable launch and hashes;
- stable `upgradeUuid`;
- native DPAPI adapter;
- real LG client → protocol lab;
- clean-runner MSI install/launch/uninstall;
- fail-closed Authenticode signing and signature verification workflow when PFX secrets exist.

### Linux

- `desktopTest`, DEB + RPM, headless final app launch and hashes;
- native Secret Service adapter with explicit unavailable behavior;
- real LG client → protocol lab;
- clean Ubuntu DEB install/launch/remove and clean Fedora RPM install/remove;
- accessibility limitation remains disclosed.

### macOS

- DMG + PKG, `.app` launch, stable bundle ID, Local Network usage string and architecture evidence;
- native Keychain adapter;
- real LG client → protocol lab;
- clean-runner PKG install/launch/remove;
- fail-closed Developer ID signing, `productsign`, notarization, stapling and Gatekeeper verification workflow when Apple credentials exist.

## Release blockers that remain external

The following cannot be converted to PASS by source changes alone:

- GitHub Actions runner allocation: billing/spending configuration currently prevents jobs from starting;
- Apple multicast entitlement approval and production provisioning;
- production Android/Windows/macOS/iOS signing credentials and store access;
- physical iPhone/iPad local-network tests;
- representative real LG/Samsung TV and network-condition matrix;
- physical accessibility and hardware-specific behavior.

Signing workflows report **BLOCKED** when credentials are absent and can be run in enforced mode to fail instead. No test key/certificate is accepted as production evidence.

## Physical validation matrix

Use `LIBRE_REMOTE_HARDWARE_MATRIX.md`. Record host OS/device, architecture, TV model/year/firmware, Wi-Fi/Ethernet, discovery, pairing accepted/denied, reconnect, DHCP/IP change, WSS/WS, navigation, volume, channels, pointer, keyboard, apps, inputs, media and Wake-on-LAN. Status values are `PASS`, `FAIL`, `N/A`, `NOT TESTED`.

## Current validation state

The new implementation is **source-prepared, not CI-validated**. GitHub accepts the workflows but current jobs receive no runner/execute zero steps because of the account billing/spending block. Do not merge/promote the draft PR until canonicalization executes and the required automated, physical and distribution evidence is recorded.
