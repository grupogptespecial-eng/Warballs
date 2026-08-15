# Implementation Plan — LR-SPEC-001

## 1. Architectural approach

Use Kotlin Multiplatform/Compose as the shared product layer while isolating host-specific responsibilities behind explicit contracts.

```text
Shared UI / presentation
        ↓
RemoteViewModel / use cases
        ↓
┌──────────────────────────────┐
│ TvBackend capability contract│
└──────────────────────────────┘
   ↓ LG   ↓ Samsung   ↓ DLNA

Shared host-independent logic
        ↓
┌──────────────────────────────┐
│ HostServices contracts       │
├──────────────────────────────┤
│ SecureStore                  │
│ HostCapabilities             │
│ LocalNetwork / discovery     │
│ Voice / microphone           │
│ Platform lifecycle           │
└──────────────────────────────┘
        ↓
androidMain / iosMain / desktop platform adapters
```

## 2. Workstreams

### WS1 — Canonical source

Materialize RC5.4 once, apply deterministic hardening, verify, commit full source tree, remove transport payloads. After this migration, changes are made directly against source.

Requirements: LR-FR-001, LR-NFR-001.

### WS2 — Security and identity

- Android canonical application ID and upgrade test.
- Apple bundle IDs.
- Windows permanent upgrade UUID.
- LG WSS-first and downgrade state.
- TOFU fail-closed.
- dedicated `SecureStore` interface and platform implementations.

Requirements: LR-FR-002/003/004/010/011/012/080/081.

### WS3 — Protocol correctness

- split toggle vs absolute-state capabilities;
- stable identity migration;
- bounded streaming response reader;
- safe XML parser;
- local URL validation/fuzz tests.

Requirements: LR-FR-020/021/022/030/031/032/033.

### WS4 — Apple application

- iOS privacy strings and multicast entitlement;
- compile K/N frameworks and XCFramework;
- compile SwiftUI wrapper for simulator/device;
- install/launch simulator app;
- physical iPhone/iPad test later;
- macOS package privacy metadata and release signing later.

Requirements: LR-FR-040–045, LR-FR-070–074.

### WS5 — Desktop packaging

- Windows MSI+EXE, Linux DEB+RPM, macOS DMG+PKG;
- assert concrete artifacts;
- smoke final app image;
- hashes;
- architecture manifest;
- clean-machine install/update/uninstall suites.

Requirements: LR-FR-050–053, LR-FR-060–063, LR-FR-070–074.

### WS6 — Deterministic protocol lab

Create fake manufacturer servers as test fixtures, not UI mocks.

Recommended layout after source canonicalization:

```text
testkit/
  fake-lg-webos/
  fake-samsung-tizen/
  fake-dlna/
  network-fixtures/
```

Tests should control delays, disconnects, TLS certificate changes, pairing decisions, malformed payloads and address changes.

Requirements: LR-FR-090/092.

### WS7 — Hardware evidence

Use `LIBRE_REMOTE_HARDWARE_MATRIX.md` as evidence ledger. Never backfill PASS from assumptions.

Requirements: LR-FR-091/093.

## 3. Target source-set boundaries

### `commonMain`

Allowed:
- TV domain models;
- command semantics;
- backend interfaces;
- capability intersection logic;
- network parsing algorithms that are portable;
- secure-store interface only;
- testable state machines.

Avoid:
- Android/iOS/Desktop permission APIs;
- OS credential stores;
- platform package metadata;
- direct `java.util.prefs` secret use.

### `androidMain`

- Android Keystore;
- Android network permissions/multicast lock;
- lifecycle/background behavior;
- Android-specific voice APIs if applicable.

### `iosMain` + `iosApp`

- Keychain implementation;
- Local Network/privacy metadata;
- multicast entitlement/provisioning contract;
- Speech/Microphone bridges;
- SwiftUI host wrapper.

### desktop

Prefer OS-selected adapters with small native boundaries:
- macOS Keychain and local-network metadata;
- Windows DPAPI/Credential Manager;
- Linux Secret Service/libsecret.

## 4. CI topology

```text
source-integrity
      ↓
common/unit tests
      ↓
 ┌────┼─────┬─────┬─────┐
Android iOS Windows Linux macOS
   ↓     ↓      ↓      ↓      ↓
package + runtime smoke + evidence
      ↓
protocol-contract suite
      ↓
release evidence aggregation
```

CI jobs must distinguish:
- build/test failure;
- missing artifact failure;
- infrastructure blocked before runner execution.

## 5. Release artifact contract

- Android: APK for QA; signed APK/AAB for L5.
- iOS/iPadOS: signed archive/IPA/TestFlight for L5; simulator app for CI L2.
- Windows: MSI + EXE.
- Linux: DEB + RPM.
- macOS: DMG + PKG.

Every produced release artifact gets SHA-256 evidence. Signed artifacts additionally get signature/notarization verification evidence.

## 6. Migration order

1. Canonicalize source.
2. Re-run baseline common/Android tests.
3. Fix compilation regressions on every host.
4. Land identity/security invariants.
5. Land native secure stores.
6. Land parser/network hardening.
7. Land deterministic fake-TV lab.
8. Run multiplatform L1/L2/L3 matrix.
9. Run physical L4 matrix.
10. Complete signing/distribution L5.
11. Update public support claims.

## 7. Rollback strategy

Each workstream should be independently revertible. Do not mix new manufacturer features into hardening commits. If a platform cannot meet L3/L4/L5, downgrade its advertised support level rather than weakening a release gate.
