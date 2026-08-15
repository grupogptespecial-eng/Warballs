# Release Status — Libre Remote 2.1.3 RC5.4

Active candidate: `2.1.3-rc5.4-customization` (Android `versionCode 29`).

The universal RC keeps the existing Libre Remote Android identity `io.github.grupogptespecialeng.libreremote`; Apple app/framework IDs are explicit and Windows keeps permanent upgrade UUID `9d0feb6a-8a93-558e-9297-4d2f0c6dc420`.

## Implemented on the hardening branch

- Android/iOS/desktop multiplatform build and packaging gates.
- LG WSS-first policy plus persisted secure-transport history intended to prohibit post-WSS WS downgrade.
- fail-closed certificate policy/audit for missing or changed peer certificates.
- dedicated `SecureStore` contract with Android Keystore/AES-GCM, Apple Keychain, Windows DPAPI and Linux Secret Service adapters.
- verify-before-delete migration for legacy LG client keys; TLS fingerprint/WSS trust state moved to secure storage.
- `HostCapability` intersection and explicit toggle-vs-absolute command semantics.
- bounded reads, local URL policy, safe bounded XML helper rejecting DTD/entities, and stable-identity secure-scope migration helpers.
- deterministic LG/Samsung/DLNA/SSDP protocol lab.
- real `LgWebOsRemote` client→lab test paths for desktop, Android emulator and iOS Simulator.
- iPhone/iPad separate simulator evidence workflow.
- clean Windows/Ubuntu/Fedora/macOS installer lifecycle workflows.
- fail-closed Android signing, Windows Authenticode, macOS Developer ID/notarization and iOS App Store Connect/TestFlight workflows.
- SDD task/traceability system where IMPLEMENTED is not PASS.

## Security implementation status

The source transform now routes new LG client keys, certificate fingerprints and WSS-success state through `SecureStore`. Legacy plaintext client keys are deleted only after the secure write can be read back successfully. Linux explicitly reports secure storage unavailable instead of writing a fallback plaintext credential. A test-only in-memory store exists solely behind `LIBRE_REMOTE_TEST_SECURE_STORE=1`.

`audit_libre_remote_runtime_hardening.py --strict` is the post-remediation source gate. `audit_libre_remote_command_semantics.py` rejects known toggle actions hidden behind absolute setters.

These implementations are **not yet compilation/runtime PASS evidence** because current Actions jobs cannot start.

## Protocol implementation status

The Python protocol lab includes LG WS/WSS registration and denial, TLS certificate rotation, Samsung responses, DLNA device/SOAP endpoints, malformed/entity/oversized XML and SSDP with stable UDN. Generated integration tests use the real LG client and explicitly test the WS-only server after persisted WSS history. CI verifies that the named test class appears in result artifacts so skipped tests cannot count as L3.

## Platform implementation status

- Android: API/device matrix, UI/performance/upgrade, Keystore build gate, real client→lab instrumentation and production signing path.
- iOS/iPadOS: privacy/entitlement metadata, frameworks/XCFramework/SwiftUI, iPhone+iPad simulator paths, Keychain build gate, real client→lab K/N test and TestFlight distribution path.
- Windows: MSI/EXE, DPAPI, final app smoke, clean MSI lifecycle, client→lab and Authenticode path.
- Linux: DEB/RPM, Secret Service, headless smoke, Ubuntu/Fedora package lifecycle and client→lab.
- macOS: DMG/PKG, Keychain, Local Network metadata, clean PKG lifecycle, client→lab and Developer ID/notarization path.

## Source migration

The `.b64 + patches` source transport is still physically present until the canonicalization workflow executes. That workflow is now fail-closed: it materializes RC5.4, applies multiplatform + runtime hardening, enables deterministic test contracts, runs the strict audit/idempotence check, then removes the legacy transport and commits the full source tree.

## Still BLOCKED / externally required

- GitHub Actions runner allocation: billing/spending configuration currently prevents every validation job from executing.
- Apple multicast-entitlement approval and production provisioning.
- production signing/store credentials for Android, Windows, macOS and iOS.
- physical iPhone/iPad Local Network/multicast testing.
- physical LG/Samsung TV matrix, Wi-Fi/Ethernet, sleep/off, DHCP/IP changes and reconnect.
- physical accessibility and hardware-specific QA.

The signing workflows do not substitute test credentials. With missing secrets they report BLOCKED, or fail when invoked in enforced mode.

## Merge status

PR #29 must remain draft. Restore runners, execute canonicalization and all automated gates, then collect physical L4 and production L5 evidence before merging/promoting the candidate.
