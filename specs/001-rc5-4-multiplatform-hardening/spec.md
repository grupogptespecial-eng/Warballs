# Specification — Libre Remote 2.1.3 RC5.4 Multiplatform Hardening

**Spec ID:** LR-SPEC-001  
**Status:** ACTIVE / IMPLEMENTATION IN PROGRESS  
**Release:** `2.1.3-rc5.4-customization`  
**Scope:** Android, iOS/iPadOS, Windows, Linux, macOS, common protocol/security architecture.

## 1. Problem statement

Libre Remote has a multiplatform architecture, but historical evidence is uneven by host platform. Compilation has sometimes been treated as support; RC5.4 validation became Android-centric; iOS framework compilation did not prove the Swift app; desktop artifacts were app images rather than final installers; secret storage and platform-specific network/privacy requirements were not equivalent across hosts; source reconstruction still depended on `.b64 + patches`.

RC5.4 must become a verifiable multiplatform release candidate whose support claims are derived from evidence rather than target existence.

## 2. Goals

- Make the RC5.4 source canonical and reviewable.
- Preserve application identity and user data across upgrades.
- Make LG transport security fail toward the secure path.
- Prove that the real application—not only libraries—builds/runs per host.
- Produce native desktop installers.
- Define truthful capability semantics across TV backends and host platforms.
- Establish secure secret storage per host.
- Establish deterministic protocol tests and a physical validation matrix.
- Make release claims mechanically traceable to evidence.

## 3. Non-goals for RC5.4

- Adding new TV manufacturers merely to increase coverage.
- Web/PWA target.
- Claiming Windows ARM64, Linux ARM64 or macOS Intel without dedicated evidence.
- Replacing all manufacturer protocols with cloud integrations.
- Treating simulator/emulator success as physical-device compatibility.

## 4. Actors

- **User:** installs Libre Remote and controls a TV on the local network.
- **Release engineer:** builds, signs and promotes releases.
- **Protocol maintainer:** implements LG/Samsung/DLNA backends.
- **Platform maintainer:** implements host-specific networking, storage, permissions and packaging.
- **CI:** produces reproducible evidence for requirements.

## 5. Functional requirements

### Source and release identity

**LR-FR-001 — Canonical source [MUST, RELEASE-BLOCKING]**  
RC5.4 MUST be maintainable from normal source files without requiring `.b64` payloads or patch-chain reconstruction after canonicalization.

Acceptance:
- source tree contains the complete `libre-remote-universal` project;
- transport-only `.rc5-universal` / `.universal-*` payload directories are absent after migration;
- clean checkout can build without materializer scripts.

**LR-FR-002 — Android application continuity [MUST, RELEASE-BLOCKING]**  
Android MUST use `io.github.grupogptespecialeng.libreremote` and RC5.4 MUST upgrade the previous Libre Remote installation in place.

Acceptance:
- `adb install -r` RC5.3 → RC5.4 succeeds;
- app-private persistence sentinel survives;
- no second `.universal` application is created.

**LR-FR-003 — Apple identity [MUST]**  
The iOS app and Kotlin/Native framework MUST have explicit, stable bundle identifiers.

Acceptance:
- app bundle ID = `io.github.grupogptespecialeng.libreremote`;
- framework bundle ID = `io.github.grupogptespecialeng.libreremote.framework`;
- compiled framework metadata matches.

**LR-FR-004 — Desktop package continuity [MUST before L5]**  
Desktop package identifiers and upgrade identity MUST remain stable across public releases.

Acceptance:
- package version is installer-compatible;
- Windows `upgradeUuid` is explicit and permanent;
- upgrade test preserves non-secret preferences and secure credentials.

### LG transport security

**LR-FR-010 — WSS first [MUST, RELEASE-BLOCKING]**  
LG `wss://<host>:3001` MUST be attempted before `ws://<host>:3000` when secure transport is available.

**LR-FR-011 — Downgrade resistance [MUST, RELEASE-BLOCKING]**  
A previously saved cleartext endpoint MUST NOT outrank WSS. After a device has successfully used WSS, future connections MUST NOT silently downgrade to WS without controlled secure failure/fallback logic.

**LR-FR-012 — TOFU fail closed [MUST before L4/L5]**  
WSS certificate pin/TOFU verification MUST reject a missing peer certificate and MUST reject a fingerprint change unless the user explicitly resets/re-pairs the device.

Acceptance scenarios:
- first secure connection stores fingerprint associated with stable device identity;
- repeated same certificate passes;
- changed certificate fails visibly;
- missing certificate fails;
- WSS failure may allow policy-controlled WS fallback only when permitted by capability/policy.

### Capability semantics

**LR-FR-020 — TV capability honesty [MUST]**  
A backend MUST advertise only operations it can implement with the promised semantics.

**LR-FR-021 — Toggle vs absolute state [MUST]**  
Toggle-only manufacturer commands MUST NOT implement absolute setters. Example: Samsung `KEY_MUTE` is a mute toggle, not `setMute(true/false)`.

**LR-FR-022 — Host capability honesty [MUST]**  
A UI feature MUST be exposed only when both `TvCapability` and `HostCapability` permit it.

Required host-capability dimensions include local discovery, multicast, secure storage, microphone, speech recognition, accessibility, notifications/background behavior and Wake-on-LAN.

### Network parsing and discovery

**LR-FR-030 — Bounded network reads [MUST]**  
UPnP/DLNA/local HTTP response limits MUST be enforced while streaming; reading an unbounded body and applying `.take(N)` afterward is prohibited.

**LR-FR-031 — Safe XML parsing [MUST]**  
UPnP XML MUST use a bounded parser appropriate to the platform; regex-only XML parsing is not acceptable for production discovery metadata.

**LR-FR-032 — Stable TV identity [MUST]**  
Pairing, certificate and preference identity SHOULD use manufacturer/UPnP stable identifiers. IP-based temporary identity MUST migrate to a stable identity when one becomes available.

**LR-FR-033 — Local URL policy [MUST]**  
All local control endpoints MUST be validated as local targets after normalization/resolution; redirects MUST not escape the permitted local-network policy.

### iOS / iPadOS

**LR-FR-040 — Local-network privacy [MUST, RELEASE-BLOCKING for iOS]**  
iOS MUST declare a meaningful `NSLocalNetworkUsageDescription` and local-network ATS policy required by supported protocols.

**LR-FR-041 — Multicast entitlement [MUST, RELEASE-BLOCKING for physical iOS discovery]**  
The iOS app MUST carry the multicast entitlement required for SSDP/UDP discovery and the production provisioning profile MUST be authorized for it.

**LR-FR-042 — Voice privacy [MUST when voice is enabled]**  
iOS MUST declare microphone and speech-recognition usage descriptions before exposing voice control.

**LR-FR-043 — Real Swift app validation [MUST]**  
CI MUST compile the SwiftUI wrapper itself for simulator and device. XCFramework-only success does not satisfy the requirement.

**LR-FR-044 — iOS runtime smoke [MUST]**  
CI MUST install and launch the final simulator `.app` and capture evidence.

**LR-FR-045 — iPhone/iPad physical validation [MUST before L4/L5]**  
Physical devices MUST validate permission prompts, SSDP discovery, pairing, reconnect and voice when enabled.

### Windows

**LR-FR-050 — Windows native installers [MUST]**  
CI MUST produce both MSI and EXE installer artifacts for the supported Windows architecture.

**LR-FR-051 — Windows runtime smoke [MUST]**  
The final packaged Windows executable MUST launch in CI/VM.

**LR-FR-052 — Windows accessibility runtime [SHOULD before L5]**  
The reduced runtime MUST include `jdk.accessibility`; Narrator/Java Access Bridge behavior MUST be manually or VM validated.

**LR-FR-053 — Windows signing [MUST before L5]**  
Public Windows installers MUST be production-signed and signature verification MUST be part of release evidence.

### Linux

**LR-FR-060 — Linux native packages [MUST]**  
CI MUST produce DEB and RPM artifacts for the supported architecture.

**LR-FR-061 — Linux runtime smoke [MUST]**  
The packaged app MUST launch in a headless graphical CI session.

**LR-FR-062 — Linux distro validation [MUST before broad L4/L5 claim]**  
Clean-machine validation MUST cover at least Ubuntu LTS, Debian stable and current Fedora.

**LR-FR-063 — Linux accessibility disclosure [MUST]**  
Public compatibility documentation MUST disclose current framework limitations instead of claiming screen-reader parity with other desktop platforms.

### macOS

**LR-FR-070 — macOS native packages [MUST]**  
CI MUST produce DMG and PKG artifacts for the supported architecture.

**LR-FR-071 — macOS runtime smoke [MUST]**  
The final `.app` MUST launch.

**LR-FR-072 — macOS local-network privacy [MUST]**  
The macOS package metadata MUST include a meaningful local-network usage description when the deployed OS requires it.

**LR-FR-073 — macOS signing/notarization [MUST before L5]**  
Public builds MUST use Developer ID signing, notarization and Gatekeeper verification.

**LR-FR-074 — Architecture truth [MUST]**  
CI MUST record architecture. Apple Silicon validation MUST NOT be represented as Intel validation.

### Secret storage

**LR-FR-080 — Secret-store abstraction [MUST before L5]**  
Pairing keys/tokens/certificate state MUST pass through a dedicated secure-store contract rather than ordinary preference APIs.

Platform implementations:
- Android → Keystore-backed storage;
- iOS/macOS → Keychain;
- Windows → Credential Manager/DPAPI;
- Linux → Secret Service/libsecret.

**LR-FR-081 — Preference separation [MUST]**  
`java.util.prefs`, DataStore and NSUserDefaults MAY store non-secret preferences only.

### Validation and evidence

**LR-FR-090 — Deterministic protocol lab [MUST before L3]**  
Each supported host platform MUST run deterministic contract tests against fake LG webOS, Samsung Tizen and DLNA/UPnP endpoints.

Minimum cases:
1. discovery and duplicate discovery;
2. stable identity/address change;
3. pairing accept/deny/expire;
4. WSS preference/downgrade rules;
5. unsupported-command semantics;
6. sleep/off/reconnect;
7. network loss/recovery;
8. malformed/oversized responses;
9. IPv4/IPv6 where available;
10. persistence/upgrade.

**LR-FR-091 — Physical TV matrix [MUST before L4]**  
Hardware evidence MUST record host OS/device/architecture, TV model/year/firmware, network topology and each capability as PASS/FAIL/N/A/NOT TESTED.

**LR-FR-092 — No false green [MUST]**  
A platform CI job MUST fail if an expected installer/app artifact is missing or the final packaged app cannot launch.

**LR-FR-093 — Infrastructure distinction [MUST]**  
A workflow that never received a runner MUST be reported as infrastructure BLOCKED, not implementation FAIL/PASS.

## 6. Non-functional requirements

**LR-NFR-001 — Maintainability [MUST]**  
Platform-specific behavior MUST live behind common contracts; avoid platform conditionals spread through UI/business logic.

**LR-NFR-002 — Minimal dependencies [SHOULD]**  
Add a dependency only when a platform API or robust parser/security implementation materially benefits from it.

**LR-NFR-003 — Bounded resources [MUST]**  
Network queues, response bodies, retries and reconnect loops MUST be bounded.

**LR-NFR-004 — Privacy [MUST]**  
No ads, developer analytics or telemetry are introduced by this hardening work.

**LR-NFR-005 — Documentation freshness [MUST]**  
Release/public docs MUST derive support claims from the active support contract and evidence matrix.

## 7. Release success criteria

RC5.4 hardening may leave draft status only when all in-scope automated release blockers are PASS. Public stable promotion additionally requires secure desktop storage, deterministic protocol L3, representative hardware L4 and platform signing/distribution L5 for every platform advertised as stable.

Current GitHub billing/spending runner rejection is an external BLOCKED state and cannot be treated as successful validation.
