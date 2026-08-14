# Tasks — LR-SPEC-001

Statuses: `[ ] TODO`, `[~] IMPLEMENTED / awaiting evidence`, `[x] PASS`, `[!] BLOCKED`.

## Phase A — Make intent/source canonical

- [~] **T001** Canonicalize RC5.4 source and remove `.b64 + patches` transport. → LR-FR-001
- [x] **T002** Establish engineering constitution and active SDD spec tree. → LR-NFR-005
- [x] **T003** Define L0–L5 support evidence contract. → LR-FR-092/093
- [~] **T004** Keep PR #29 draft until release-blocking evidence passes. → Release rule

## Phase B — Identity and transport security

- [~] **T010** Normalize Android `applicationId`. → LR-FR-002
- [~] **T011** Android RC5.3→RC5.4 upgrade/persistence test. → LR-FR-002
- [~] **T012** Explicit iOS app/framework bundle IDs. → LR-FR-003
- [~] **T013** Explicit Windows permanent `upgradeUuid`. → LR-FR-004
- [~] **T014** LG WSS-first ordering. → LR-FR-010
- [ ] **T015** Persist secure-transport state and prohibit silent post-WSS downgrade. → LR-FR-011
- [ ] **T016** Make TOFU fail closed on missing/changed peer certificate. → LR-FR-012
- [ ] **T017** Add tests for first cert/same cert/changed cert/missing cert/downgrade. → LR-FR-012

## Phase C — Protocol semantics and network hardening

- [ ] **T020** Split `MuteToggle` from absolute mute setter semantics. → LR-FR-020/021
- [ ] **T021** Audit play/pause and other toggle-like commands for semantic mismatch. → LR-FR-020/021
- [ ] **T022** Introduce/centralize `HostCapability` intersection. → LR-FR-022
- [ ] **T023** Replace `readText().take(N)` / `.string().take(N)` with bounded streaming reads. → LR-FR-030
- [ ] **T024** Replace regex UPnP XML parsing with bounded safe parser. → LR-FR-031
- [ ] **T025** Implement temporary-IP → stable-device-ID migration. → LR-FR-032
- [ ] **T026** Fuzz local URL normalization/resolution/redirect policy. → LR-FR-033

## Phase D — Secure storage

- [ ] **T030** Define `SecureStore` common contract. → LR-FR-080
- [ ] **T031** Android Keystore adapter + migration tests. → LR-FR-080
- [ ] **T032** iOS/macOS Keychain adapter + tests. → LR-FR-080
- [ ] **T033** Windows Credential Manager/DPAPI adapter + tests. → LR-FR-080
- [ ] **T034** Linux Secret Service/libsecret adapter + unavailable-service behavior. → LR-FR-080
- [ ] **T035** Remove secret use from `java.util.prefs`/ordinary preferences. → LR-FR-081
- [ ] **T036** Enable `LIBRE_REMOTE_STRICT_SECURE_STORE=1` in release CI. → LR-FR-080/081

## Phase E — Android evidence

- [~] **T040** API/device emulator matrix. → LR-FR-092
- [~] **T041** font scale 1.0/1.5/2.0 + overflow/touch-target audit. → Android L2
- [~] **T042** landscape/process-death/monkey smoke. → Android L2
- [~] **T043** memory/gfx/ANR/crash/battery evidence. → Android L2
- [ ] **T044** Physical Android phone + TV matrix. → LR-FR-091

## Phase F — iOS/iPadOS evidence

- [~] **T050** Add Local Network/ATS privacy metadata. → LR-FR-040
- [~] **T051** Add multicast entitlement metadata. → LR-FR-041
- [~] **T052** Add microphone/speech privacy metadata. → LR-FR-042
- [~] **T053** Compile K/N device+simulator frameworks and XCFramework. → LR-FR-043
- [~] **T054** Compile real SwiftUI wrapper for simulator/device. → LR-FR-043
- [~] **T055** Install/launch simulator app and capture evidence. → LR-FR-044
- [ ] **T056** Provision Apple multicast entitlement for production profile. → LR-FR-041
- [ ] **T057** Test physical iPhone and iPad local discovery/pairing/voice. → LR-FR-045
- [ ] **T058** Test iPad landscape/multitasking layouts. → LR-FR-045

## Phase G — Desktop packages

- [~] **T060** Windows MSI + EXE generation/assertions/hashes. → LR-FR-050
- [~] **T061** Windows packaged-executable smoke. → LR-FR-051
- [ ] **T062** Windows Authenticode signing + signature verification. → LR-FR-053
- [ ] **T063** Windows clean-VM install/update/uninstall + firewall/private-network discovery. → LR-FR-004/053

- [~] **T064** Linux DEB + RPM generation/assertions/hashes. → LR-FR-060
- [~] **T065** Linux headless packaged-app smoke. → LR-FR-061
- [ ] **T066** Ubuntu/Debian/Fedora clean-machine matrix. → LR-FR-062
- [x] **T067** Document Linux accessibility limitation. → LR-FR-063

- [~] **T068** macOS DMG + PKG generation/assertions/hashes. → LR-FR-070
- [~] **T069** macOS `.app` smoke and architecture evidence. → LR-FR-071/074
- [~] **T070** macOS local-network privacy metadata. → LR-FR-072
- [ ] **T071** Developer ID signing + notarization + Gatekeeper verification. → LR-FR-073
- [ ] **T072** Clean-Mac install/update/uninstall. → LR-FR-004/073

## Phase H — Deterministic protocol lab

- [ ] **T080** Fake LG webOS server: WSS/WS, pairing, cert rotation, disconnect/reconnect. → LR-FR-090
- [ ] **T081** Fake Samsung Tizen server: pairing + truthful toggle semantics. → LR-FR-090
- [ ] **T082** Fake DLNA/UPnP server: description/SOAP/media and malformed/oversized payloads. → LR-FR-090
- [ ] **T083** Shared discovery/identity/address-change fixtures. → LR-FR-090
- [ ] **T084** Execute protocol suite on Android. → LR-FR-090
- [ ] **T085** Execute protocol suite on iOS simulator/physical where networking requires it. → LR-FR-090
- [ ] **T086** Execute protocol suite on Windows/Linux/macOS. → LR-FR-090

## Phase I — Physical/release evidence

- [ ] **T090** Populate real-TV matrix for representative LG generations. → LR-FR-091
- [ ] **T091** Populate real-TV matrix for Samsung experimental support. → LR-FR-091
- [ ] **T092** Validate Wi-Fi host ↔ Wi-Fi TV, Wi-Fi host ↔ Ethernet TV, DHCP IP change, sleep/off. → LR-FR-091
- [ ] **T093** Generate signed Android APK/AAB and Play pre-launch evidence. → Android L5
- [ ] **T094** TestFlight distribution + physical Apple evidence. → iOS L5
- [ ] **T095** Sign/notarize desktop public artifacts. → Desktop L5
- [ ] **T096** Update README/store claims to exactly match proven support levels. → LR-NFR-005

## Infrastructure blocker

- [!] **T099** Restore GitHub Actions runner allocation by resolving account billing/spending configuration. This is an infrastructure prerequisite, not an implementation task. → LR-FR-093
