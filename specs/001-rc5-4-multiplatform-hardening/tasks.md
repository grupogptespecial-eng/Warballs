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
- [~] **T015** Persist secure-transport state and prohibit silent post-WSS downgrade. Implemented in the runtime hardening/finalizer and exercised by generated client→lab tests; awaiting CI execution. → LR-FR-011
- [~] **T016** Make TOFU fail closed on missing/changed peer certificate. The finalizer rejects surviving missing-certificate fail-open paths and policy code treats missing/changed certs as deny; awaiting runtime evidence. → LR-FR-012
- [~] **T017** Add tests for first cert/same cert/changed cert/missing cert/downgrade. Pure policy tests plus fake TLS certificate-rotation fixtures and no-downgrade client tests are implemented; awaiting CI. → LR-FR-012

## Phase C — Protocol semantics and network hardening

- [~] **T020** Split `MuteToggle` from absolute mute setter semantics. Capability contracts plus Samsung guard are implemented; awaiting compilation/runtime evidence. → LR-FR-020/021
- [~] **T021** Audit play/pause and other toggle-like commands for semantic mismatch. `audit_libre_remote_command_semantics.py` rejects toggle commands hidden behind absolute setters. → LR-FR-020/021
- [~] **T022** Introduce/centralize `HostCapability` intersection. Common contract and platform actuals are implemented; awaiting build evidence. → LR-FR-022
- [~] **T023** Replace `readText().take(N)` / `.string().take(N)` with bounded streaming reads. Runtime transform plus strict source audit implemented; awaiting build/protocol evidence. → LR-FR-030
- [~] **T024** Replace regex UPnP XML parsing with bounded safe parser. `SafeXml` rejects DTD/entities/depth/size and the finalizer/audit replace/reject known regex helpers; awaiting source-shape/build evidence. → LR-FR-031
- [~] **T025** Implement temporary-IP → stable-device-ID migration. Stable identity contract and verify-before-delete secure-scope migration are implemented/tested in generated common tests; discovery integration awaits CI/hardware evidence. → LR-FR-032
- [~] **T026** Fuzz local URL normalization/resolution/redirect policy. Local URL/private-host policy and deterministic fuzz matrix are implemented; awaiting CI. → LR-FR-033

## Phase D — Secure storage

- [~] **T030** Define `SecureStore` common contract. → LR-FR-080
- [~] **T031** Android Keystore adapter + migration tests. AES/GCM key is created in Android Keystore; ciphertext is isolated in private app storage; migration tests are generated. → LR-FR-080
- [~] **T032** iOS/macOS Keychain adapter + tests. iOS uses Security.framework `SecItem*`; macOS desktop uses Keychain CLI with no plaintext fallback; dedicated Apple compilation job is implemented. → LR-FR-080
- [~] **T033** Windows Credential Manager/DPAPI adapter + tests. DPAPI CurrentUser protection is implemented; ordinary prefs may contain ciphertext/index only. → LR-FR-080
- [~] **T034** Linux Secret Service/libsecret adapter + unavailable-service behavior. `secret-tool` backend reports unavailable instead of silently falling back to plaintext. → LR-FR-080
- [~] **T035** Remove secret use from `java.util.prefs`/ordinary preferences. ProfileStore writes client keys/trust state only through SecureStore; legacy plaintext is read once and deleted only after verified migration. Strict audit rejects a surviving plaintext write. → LR-FR-081
- [~] **T036** Enable strict secure-store enforcement in release CI. A post-implementation `--strict` runtime security audit is mandatory in canonicalization/runtime/release workflows; the legacy pre-transform scanner intentionally remains non-strict so it cannot block its own remediation. → LR-FR-080/081

## Phase E — Android evidence

- [~] **T040** API/device emulator matrix. → LR-FR-092
- [~] **T041** font scale 1.0/1.5/2.0 + overflow/touch-target audit. → Android L2
- [~] **T042** landscape/process-death/monkey smoke. → Android L2
- [~] **T043** memory/gfx/ANR/crash/battery evidence. → Android L2
- [!] **T044** Physical Android phone + TV matrix. Code-side matrix exists; PASS requires physical devices/TVs. → LR-FR-091

## Phase F — iOS/iPadOS evidence

- [~] **T050** Add Local Network/ATS privacy metadata. → LR-FR-040
- [~] **T051** Add multicast entitlement metadata. → LR-FR-041
- [~] **T052** Add microphone/speech privacy metadata. → LR-FR-042
- [~] **T053** Compile K/N device+simulator frameworks and XCFramework. → LR-FR-043
- [~] **T054** Compile real SwiftUI wrapper for simulator/device. → LR-FR-043
- [~] **T055** Install/launch simulator app and capture evidence. → LR-FR-044
- [!] **T056** Provision Apple multicast entitlement for production profile. Workflow/metadata are prepared, but entitlement approval/provisioning is external. → LR-FR-041
- [!] **T057** Test physical iPhone and iPad local discovery/pairing/voice. Requires physical Apple devices and approved provisioning. → LR-FR-045
- [~] **T058** Test iPad layouts separately from iPhone. Dedicated iPhone/iPad simulator matrix with install/launch/screenshots is implemented; physical multitasking/Stage Manager remains part of T057/L4. → LR-FR-045

## Phase G — Desktop packages

- [~] **T060** Windows MSI + EXE generation/assertions/hashes. → LR-FR-050
- [~] **T061** Windows packaged-executable smoke. → LR-FR-051
- [~] **T062** Windows Authenticode signing + signature verification. Fail-closed signing workflow is implemented; production PFX is external. → LR-FR-053
- [~] **T063** Windows clean-VM install/update/uninstall + firewall/private-network discovery. Fresh-runner MSI install/launch/uninstall is implemented; cross-version upgrade and physical/private-network firewall evidence remain to execute. → LR-FR-004/053

- [~] **T064** Linux DEB + RPM generation/assertions/hashes. → LR-FR-060
- [~] **T065** Linux headless packaged-app smoke. → LR-FR-061
- [~] **T066** Ubuntu/Debian/Fedora clean-machine matrix. Ubuntu DEB install/launch/remove and Fedora-container RPM install/remove jobs are implemented; Debian-specific external image evidence remains optional follow-up. → LR-FR-062
- [x] **T067** Document Linux accessibility limitation. → LR-FR-063

- [~] **T068** macOS DMG + PKG generation/assertions/hashes. → LR-FR-070
- [~] **T069** macOS `.app` smoke and architecture evidence. → LR-FR-071/074
- [~] **T070** macOS local-network privacy metadata. → LR-FR-072
- [~] **T071** Developer ID signing + notarization + Gatekeeper verification. `codesign`/`productsign`/`notarytool`/stapler/`spctl` workflow is implemented; identities and Apple notary credentials are external. → LR-FR-073
- [~] **T072** Clean-Mac install/uninstall. Fresh macOS runner installs PKG, launches `/Applications/Libre Remote.app`, and removes it; cross-version upgrade evidence awaits execution/history. → LR-FR-004/073

## Phase H — Deterministic protocol lab

- [~] **T080** Fake LG webOS server: WS/WSS, pairing accepted/denied, cert rotation, disconnect/expiry controls and standard-port fixture. → LR-FR-090
- [~] **T081** Fake Samsung Tizen server: pairing/authorization response and truthful toggle fixture. → LR-FR-090
- [~] **T082** Fake DLNA/UPnP server: description/SOAP plus malformed/entity/oversized payload fixtures. → LR-FR-090
- [~] **T083** Shared SSDP discovery, stable UDN, TLS rotation and address/identity fixtures. → LR-FR-090
- [~] **T084** Execute real LG client protocol suite on Android emulator. Instrumentation tests + host lab workflow are implemented; awaiting runner execution. → LR-FR-090
- [~] **T085** Execute real LG client protocol suite on iOS Simulator. `iosSimulatorArm64Test` + host lab workflow is implemented; physical Local Network remains L4. → LR-FR-090
- [~] **T086** Execute real LG client protocol suite on Windows/Linux/macOS. Desktop tests instantiate `LgWebOsRemote`, pair/send against the Python lab and test post-WSS no-downgrade. → LR-FR-090

## Phase I — Physical/release evidence

- [!] **T090** Populate real-TV matrix for representative LG generations. Requires physical TVs. → LR-FR-091
- [!] **T091** Populate real-TV matrix for Samsung experimental support. Requires physical TVs. → LR-FR-091
- [!] **T092** Validate Wi-Fi host ↔ Wi-Fi TV, Wi-Fi host ↔ Ethernet TV, DHCP IP change, sleep/off. Requires physical/network lab evidence. → LR-FR-091
- [~] **T093** Generate signed Android APK/AAB and verify signatures. Production signing workflow is implemented; Play pre-launch execution requires signing credentials/store access. → Android L5
- [~] **T094** TestFlight distribution pipeline. Archive/export/upload path is implemented; credentials, multicast provisioning and physical Apple evidence are external. → iOS L5
- [~] **T095** Sign/notarize desktop public artifacts. Windows/macOS signing/notarization workflows are implemented; production credentials are external. → Desktop L5
- [~] **T096** Update README/store claims to exactly match proven support levels. Documentation contract exists; final public claim update follows executed evidence. → LR-NFR-005

## Infrastructure blocker

- [!] **T099** Restore GitHub Actions runner allocation by resolving account billing/spending configuration. This is an infrastructure prerequisite, not an implementation task. → LR-FR-093
