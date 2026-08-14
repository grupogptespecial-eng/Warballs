# Traceability — LR-SPEC-001

This file links requirements to implementation tasks and required evidence. `IMPLEMENTED` means configuration/code exists but has not yet been proven by an executed gate.

| Requirement | Tasks | Evidence required | Current state |
|---|---|---|---|
| LR-FR-001 | T001 | clean checkout builds without materializer; no transport payload dirs | IMPLEMENTED / BLOCKED by Actions |
| LR-FR-002 | T010,T011 | package ID assertion + `adb install -r` + sentinel | IMPLEMENTED / not executed |
| LR-FR-003 | T012 | built framework/app bundle IDs | IMPLEMENTED / not executed |
| LR-FR-004 | T013,T063,T072 | stable package IDs + clean-machine upgrade preservation | PARTIAL |
| LR-FR-010 | T014 | unit/integration endpoint-order test | IMPLEMENTED / not executed |
| LR-FR-011 | T015 | fake-LG WSS→failure scenario | TODO |
| LR-FR-012 | T016,T017 | cert lifecycle integration tests | TODO |
| LR-FR-020 | T020,T021 | backend capability contract tests | TODO |
| LR-FR-021 | T020,T021 | toggle-vs-absolute semantic tests | TODO |
| LR-FR-022 | T022 | common capability-intersection tests | TODO |
| LR-FR-030 | T023 | oversized streaming response tests | TODO |
| LR-FR-031 | T024 | malformed/XXE/depth/size tests | TODO |
| LR-FR-032 | T025 | DHCP/address-change test | TODO |
| LR-FR-033 | T026 | URL/fuzz/redirect tests | TODO |
| LR-FR-040 | T050 | Info.plist/ATS assertions | IMPLEMENTED / blocked by Actions |
| LR-FR-041 | T051,T056 | entitlement metadata + signed physical profile | PARTIAL |
| LR-FR-042 | T052 | microphone/speech privacy assertions | IMPLEMENTED / blocked by Actions |
| LR-FR-043 | T053,T054 | frameworks + XCFramework + real Swift wrapper builds | IMPLEMENTED / blocked by Actions |
| LR-FR-044 | T055 | simulator install/launch/screenshot | IMPLEMENTED / blocked by Actions |
| LR-FR-045 | T057,T058 | iPhone/iPad physical evidence | NOT TESTED |
| LR-FR-050 | T060 | MSI + EXE existence + hashes | IMPLEMENTED / blocked by Actions |
| LR-FR-051 | T061 | packaged Windows executable launch | IMPLEMENTED / blocked by Actions |
| LR-FR-052 | T063 | Narrator/JAB VM evidence | TODO |
| LR-FR-053 | T062,T063 | verified production signature | TODO |
| LR-FR-060 | T064 | DEB + RPM existence + hashes | IMPLEMENTED / blocked by Actions |
| LR-FR-061 | T065 | packaged Linux app launch | IMPLEMENTED / blocked by Actions |
| LR-FR-062 | T066 | clean Ubuntu/Debian/Fedora | TODO |
| LR-FR-063 | T067 | public support disclosure | PASS (documentation) |
| LR-FR-070 | T068 | DMG + PKG existence + hashes | IMPLEMENTED / blocked by Actions |
| LR-FR-071 | T069 | `.app` launch | IMPLEMENTED / blocked by Actions |
| LR-FR-072 | T070 | generated LAN privacy metadata | IMPLEMENTED / blocked by Actions |
| LR-FR-073 | T071,T072 | Developer ID + notarization + Gatekeeper | TODO |
| LR-FR-074 | T069 | architecture evidence | IMPLEMENTED / blocked by Actions |
| LR-FR-080 | T030–T036 | platform adapters + migration tests + strict gate | TODO / release blocker |
| LR-FR-081 | T035,T036 | no secret preference writes + strict gate | TODO / release blocker |
| LR-FR-090 | T080–T086 | fake LG/Samsung/DLNA matrix | TODO |
| LR-FR-091 | T090–T092 | filled hardware ledger | NOT TESTED |
| LR-FR-092 | T003,T060,T064,T068 | artifact assertions + runtime smokes | IMPLEMENTED / not executed |
| LR-FR-093 | T003,T099 | runner/step evidence classified BLOCKED | PASS for current incident |
| LR-NFR-001 | T001,T030 | source-set/contracts review | PARTIAL |
| LR-NFR-002 | all implementation tasks | dependency review | POLICY |
| LR-NFR-003 | T023,T080–T083 | bounds/retry/queue tests | TODO |
| LR-NFR-004 | release review | privacy/dependency/source audit | POLICY |
| LR-NFR-005 | T002,T003,T096 | spec validator + documentation comparison | IMPLEMENTED |

## Rule

No `MUST` row may be marked PASS solely because code was committed. PASS requires the evidence listed above.
