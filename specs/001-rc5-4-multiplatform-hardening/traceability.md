# Traceability — LR-SPEC-001

This file links requirements to implementation tasks and required evidence. `IMPLEMENTED` means configuration/code exists but has not yet been proven by an executed gate.

| Requirement | Tasks | Evidence required | Current state |
|---|---|---|---|
| LR-FR-001 Canonical source | T001 | clean checkout builds without materializer; no transport payload dirs | IMPLEMENTED / BLOCKED by Actions |
| LR-FR-002 Android continuity | T010–T011 | package ID assertion + `adb install -r` + sentinel | IMPLEMENTED / not executed |
| LR-FR-003 Apple identity | T012 | built framework/app bundle IDs | IMPLEMENTED / not executed |
| LR-FR-004 Desktop upgrade identity | T013,T063,T072 | stable package IDs + clean-machine upgrade preservation | PARTIAL |
| LR-FR-010 WSS first | T014 | unit/integration endpoint-order test | IMPLEMENTED / not executed |
| LR-FR-011 Downgrade resistance | T015 | fake-LG WSS→failure scenario | TODO |
| LR-FR-012 TOFU fail closed | T016–T017 | cert lifecycle integration tests | TODO |
| LR-FR-020/021 Capability semantics | T020–T021 | backend contract tests | TODO |
| LR-FR-022 Host capability | T022 | common capability-intersection tests | TODO |
| LR-FR-030 Bounded reads | T023 | oversized streaming response tests | TODO |
| LR-FR-031 Safe XML | T024 | malformed/XXE/depth/size tests | TODO |
| LR-FR-032 Stable TV identity | T025 | DHCP/address-change test | TODO |
| LR-FR-033 Local URL policy | T026 | URL/fuzz/redirect tests | TODO |
| LR-FR-040–044 iOS automated | T050–T055 | plist/entitlement checks + framework + Swift wrapper + sim launch | IMPLEMENTED / blocked by Actions |
| LR-FR-045 Physical Apple | T057–T058 | iPhone/iPad evidence rows | NOT TESTED |
| LR-FR-050/051 Windows package/run | T060–T061 | MSI+EXE + launch + hashes | IMPLEMENTED / blocked by Actions |
| LR-FR-052 Windows accessibility | T063 | Narrator/JAB VM evidence | TODO |
| LR-FR-053 Windows signing | T062–T063 | verified production signature | TODO |
| LR-FR-060/061 Linux package/run | T064–T065 | DEB+RPM + launch + hashes | IMPLEMENTED / blocked by Actions |
| LR-FR-062 Linux distro matrix | T066 | clean Ubuntu/Debian/Fedora | TODO |
| LR-FR-063 Linux accessibility disclosure | T067 | public support contract | PASS (documentation) |
| LR-FR-070–072/074 macOS automated | T068–T070 | DMG+PKG + launch + arch + privacy metadata | IMPLEMENTED / blocked by Actions |
| LR-FR-073 macOS signing | T071–T072 | Developer ID + notarization + Gatekeeper | TODO |
| LR-FR-080/081 Secure storage | T030–T036 | platform adapters + migration tests + strict gate | TODO / release blocker |
| LR-FR-090 Protocol lab | T080–T086 | fake LG/Samsung/DLNA matrix | TODO |
| LR-FR-091 Physical TV matrix | T090–T092 | filled hardware ledger | NOT TESTED |
| LR-FR-092 No false green | T003,T060,T064,T068 | explicit artifact assertions + runtime smoke | IMPLEMENTED / not executed |
| LR-FR-093 Infrastructure distinction | T003,T099 | runner/step evidence classified BLOCKED | PASS for current incident |

## Rule

No `MUST` row may be marked PASS solely because code was committed. PASS requires the evidence listed above.
