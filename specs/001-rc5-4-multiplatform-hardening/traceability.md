# Traceability — LR-SPEC-001

This file links requirements to implementation tasks and required evidence. `IMPLEMENTED` means configuration/code exists but has not yet been proven by an executed gate.

| Requirement | Tasks | Evidence required | Current state |
|---|---|---|---|
| LR-FR-001 | T001 | clean checkout builds without materializer; no transport payload dirs | IMPLEMENTED / BLOCKED by Actions |
| LR-FR-002 | T010,T011 | package ID assertion + `adb install -r` + sentinel | IMPLEMENTED / not executed |
| LR-FR-003 | T012 | built framework/app bundle IDs | IMPLEMENTED / not executed |
| LR-FR-004 | T013,T063,T072 | stable package IDs + clean-machine upgrade preservation | IMPLEMENTED PARTIAL / cross-version desktop execution pending |
| LR-FR-010 | T014 | endpoint-order assertion + client protocol test | IMPLEMENTED / not executed |
| LR-FR-011 | T015,T017,T084,T085,T086 | persisted WSS history + WS-only fake server must never reconnect after pin | IMPLEMENTED / not executed |
| LR-FR-012 | T016,T017 | missing/changed cert policy tests + TLS rotation fixture + no fail-open source audit | IMPLEMENTED / not executed |
| LR-FR-020 | T020,T021 | backend capability/command semantic audit | IMPLEMENTED / not executed |
| LR-FR-021 | T020,T021 | `MuteToggle`/`SetMute` and play/pause toggle-vs-absolute tests | IMPLEMENTED / not executed |
| LR-FR-022 | T022 | common host-capability intersection tests + platform actual compilation | IMPLEMENTED / not executed |
| LR-FR-030 | T023 | strict source audit + oversized streaming response tests | IMPLEMENTED / not executed |
| LR-FR-031 | T024,T082 | DTD/entity/depth/size tests + malformed/oversized DLNA fixtures + no obvious XML-regex parser audit | IMPLEMENTED / not executed |
| LR-FR-032 | T025,T083 | temporary→stable secure-scope migration test + stable UDN fixture + physical DHCP evidence | IMPLEMENTED / physical evidence pending |
| LR-FR-033 | T026 | local/private URL matrix + bad scheme/userinfo/public-host fuzz | IMPLEMENTED / not executed |
| LR-FR-040 | T050 | Info.plist/ATS assertions | IMPLEMENTED / blocked by Actions |
| LR-FR-041 | T051,T056 | entitlement metadata + signed physical provisioning profile | IMPLEMENTED metadata / BLOCKED external approval |
| LR-FR-042 | T052 | microphone/speech privacy assertions | IMPLEMENTED / blocked by Actions |
| LR-FR-043 | T053,T054 | frameworks + XCFramework + real Swift wrapper builds | IMPLEMENTED / blocked by Actions |
| LR-FR-044 | T055,T058 | iPhone/iPad simulator install/launch/screenshot | IMPLEMENTED / blocked by Actions |
| LR-FR-045 | T057,T058 | iPhone/iPad physical discovery/voice/layout evidence | BLOCKED physical/provisioning |
| LR-FR-050 | T060 | MSI + EXE existence + hashes | IMPLEMENTED / blocked by Actions |
| LR-FR-051 | T061,T063 | packaged Windows executable + installed MSI application launch | IMPLEMENTED / blocked by Actions |
| LR-FR-052 | T063 | Narrator/JAB VM evidence | PARTIAL: runtime module configured; manual/VM assistive-tech evidence pending |
| LR-FR-053 | T062,T063 | Authenticode verification + clean install/uninstall evidence | IMPLEMENTED pipeline / credentials and execution pending |
| LR-FR-060 | T064 | DEB + RPM existence + hashes | IMPLEMENTED / blocked by Actions |
| LR-FR-061 | T065,T066 | packaged and installed Linux app launch | IMPLEMENTED / blocked by Actions |
| LR-FR-062 | T066 | clean Ubuntu DEB + Fedora RPM install/remove evidence; distro support claim remains bounded | IMPLEMENTED / blocked by Actions |
| LR-FR-063 | T067 | public support disclosure | PASS (documentation) |
| LR-FR-070 | T068 | DMG + PKG existence + hashes | IMPLEMENTED / blocked by Actions |
| LR-FR-071 | T069,T072 | `.app` launch + installed PKG application launch | IMPLEMENTED / blocked by Actions |
| LR-FR-072 | T070 | generated LAN privacy metadata | IMPLEMENTED / blocked by Actions |
| LR-FR-073 | T071,T072,T095 | Developer ID verification + notarization/stapling + Gatekeeper + clean install | IMPLEMENTED pipeline / credentials and execution pending |
| LR-FR-074 | T069 | architecture evidence | IMPLEMENTED / blocked by Actions |
| LR-FR-080 | T030–T036 | SecureStore contract + Android Keystore + Apple Keychain + Windows DPAPI + Linux Secret Service + migration tests + strict audit | IMPLEMENTED / platform compilation/runtime evidence pending |
| LR-FR-081 | T035,T036 | no ordinary-preference secret writes + verify-before-delete migration + strict audit | IMPLEMENTED / not executed |
| LR-FR-090 | T080–T086 | fake LG/Samsung/DLNA/SSDP lab + real LG client tests on desktop/Android/iOS simulator | IMPLEMENTED / blocked by Actions |
| LR-FR-091 | T090–T092 | filled hardware ledger | BLOCKED physical hardware/network evidence |
| LR-FR-092 | T003,T060,T064,T068 | artifact assertions + runtime smokes + clean installs | IMPLEMENTED / not executed |
| LR-FR-093 | T003,T099 | runner/step evidence classified BLOCKED | PASS for current infrastructure incident |
| LR-NFR-001 | T001,T030 | canonical source + source-set host contracts | IMPLEMENTED / canonicalization not executed |
| LR-NFR-002 | all implementation tasks | dependency review; runtime lab uses Python stdlib and native OS credential tools instead of broad new app dependencies | IMPLEMENTED POLICY / final build review pending |
| LR-NFR-003 | T023,T080–T086 | bounded payloads, malformed/oversized fixtures, reconnect/downgrade client tests | IMPLEMENTED / not executed |
| LR-NFR-004 | release review | privacy/dependency/source audit + fail-closed signing gates | IMPLEMENTED POLICY / external evidence pending |
| LR-NFR-005 | T002,T003,T096 | spec validator + documentation comparison + support-level contract | IMPLEMENTED |

## Evidence-producing implementation

The following source-level gates are now versioned and are **not** equivalent to executed PASS evidence:

- `scripts/implement_libre_remote_runtime_hardening.py`
- `scripts/finalize_libre_remote_runtime_hardening.py`
- `scripts/audit_libre_remote_runtime_hardening.py --strict`
- `scripts/audit_libre_remote_command_semantics.py`
- generated migration/fuzz/capability tests
- generated desktop/Android/iOS LG client protocol integration tests
- `protocol-lab/libre_remote_lab.py`
- `.github/workflows/libre-remote-runtime-security.yml`
- `.github/workflows/libre-remote-protocol-client-integration.yml`
- `.github/workflows/libre-remote-clean-install.yml`
- `.github/workflows/libre-remote-apple-layout.yml`
- `.github/workflows/libre-remote-release-signing.yml`

## Rule

No `MUST` row may be marked PASS solely because code was committed. PASS requires the evidence listed above. Missing signing credentials, Apple entitlement approval, physical hardware, store access, or runner allocation must remain `BLOCKED`, never silently downgraded to a weaker gate.
