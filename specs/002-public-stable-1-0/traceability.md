# Traceability — LR-SPEC-002

`IMPLEMENTED` means the mechanism exists in source/configuration. It is not promotion evidence until the required gate executes successfully.

| Requirement | Tasks | Evidence required | Current state |
|---|---|---|---|
| LRP-FR-001 | P101,P102 | canonical source export; no legacy transport/release fixtures/signing material; SOURCE_ORIGIN | IMPLEMENTED / canonical source execution pending |
| LRP-FR-002 | P103,P152 | strict clean-history audit on newly initialized public repo | IMPLEMENTED / publisher not executed |
| LRP-FR-003 | P100,P110,P111 | Apache-2.0 + NOTICE + resolved dependency/asset licensing + `THIRD_PARTY_AUDIT_STATUS: COMPLETE` | IMPLEMENTED SKELETON / human review BLOCKED |
| LRP-FR-004 | P100,P120–P122 | public docs, privacy/support/store metadata, issue/PR templates, Dependabot/security workflow configuration | IMPLEMENTED |
| LRP-FR-005 | P123,P124,P132,P133,P199 | public-style CI on committed canonical source across source audit/desktop/Android/Apple/dependency jobs | IMPLEMENTED / execution BLOCKED by Actions |
| LRP-FR-006 | P112,P113 | deterministic CycloneDX JSON + source/dependency digest + checksum artifact | IMPLEMENTED / execution pending |
| LRP-FR-007 | P130–P136 | literal traceable PASS for every `required_for: stable` gate + strict source/history/license review | IMPLEMENTED GATE / evidence BLOCKED |
| LRP-FR-008 | P140–P148,P154 | literal traceable PASS for every `required_for: 1.0` gate including physical/signing/accessibility/metadata | IMPLEMENTED GATE / physical + external credentials BLOCKED |
| LRP-FR-009 | P150,P151 | version-field audit + dedicated final version commit + upgrade evidence | POLICY IMPLEMENTED / final version intentionally not frozen |
| LRP-FR-010 | P152,P153,P155 | guarded dry-run; clean one-commit target; security configured private-first; public transition only after PASS | IMPLEMENTED / publication intentionally not executed |
| LRP-FR-011 | P102,P130,P131,P154 | evidence ledger/recorder and promotion scripts reject all non-PASS or untraceable PASS states | IMPLEMENTED |
| LRP-NFR-001 | P104,P113 | SOURCE_ORIGIN, source commit, dependency digest, SBOM/archive checksums | IMPLEMENTED / execution pending |
| LRP-NFR-002 | P110–P113,P123 | release tooling uses Python stdlib/Git/Gradle/platform tools; no app runtime dependency added for release automation | IMPLEMENTED POLICY |
| LRP-NFR-003 | P111,P131,P152–P155 | unknown licenses/missing evidence/credentials/dirty history/existing target stop promotion | IMPLEMENTED |
| LRP-NFR-004 | P101–P103,P121,P152 | source/history audits + secret-safe templates + sanitized export | IMPLEMENTED / execution pending |

## Evidence-producing implementation

- `scripts/audit_public_release.py`
- `scripts/audit_git_history.py`
- `scripts/audit_third_party_licenses.py`
- `scripts/generate_cyclonedx_sbom.py`
- `scripts/export_libre_remote_public.py`
- `scripts/record_release_evidence.py`
- `scripts/check_release_evidence.py`
- `scripts/convert_workflows_to_canonical_source.py`
- `scripts/validate_libre_remote_public_spec.py`
- `release/evidence.json`
- `release/README.md`
- `public-repo/.github/workflows/ci.yml`
- `public-repo/.github/workflows/promotion-gate.yml`
- `.github/workflows/libre-remote-open-source-readiness.yml`
- `.github/workflows/libre-remote-publish-public-repo.yml`
- `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES.md`, `README.md`, `BUILDING.md`, `SECURITY.md`, `PRIVACY.md`, `SUPPORT.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`, `RELEASE_POLICY.md`, `VERSIONING.md`, `STORE_METADATA.md`

## Promotion rule

Neither Stable Candidate nor 1.0 may be promoted from this traceability table alone. Promotion is mechanical through `release/evidence.json` + `scripts/check_release_evidence.py`, and every required status must be exactly `PASS` with `evidence_ref` and `source_commit`.
