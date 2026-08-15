# Tasks — LR-SPEC-002

Statuses: `[ ] TODO`, `[~] IMPLEMENTED / awaiting evidence`, `[x] PASS`, `[!] BLOCKED`.

## Phase J — Open-source source boundary

- [~] **P100** Add Apache-2.0 `LICENSE`, `NOTICE`, root README/build/security/community/release docs. → LRP-FR-003, LRP-FR-004
- [~] **P101** Export sanitized canonical Libre Remote source without Warballs history, legacy transport, release fixtures or signing material. → LRP-FR-001
- [~] **P102** Audit exported public tree for required docs, wrong-product residue, legacy payloads, key/certificate files and high-signal secret markers. → LRP-FR-001, LRP-FR-011, LRP-NFR-004
- [~] **P103** Audit public Git history and reject historical signing/transport/private-key artifacts. → LRP-FR-002
- [~] **P104** Record exact private source commit in public `SOURCE_ORIGIN.json`. → LRP-NFR-001

## Phase K — Licensing and software supply chain

- [~] **P110** Generate Gradle dependency/license review inventory from resolved candidate graph. → LRP-FR-003
- [!] **P111** Human-review all third-party licenses/NOTICE obligations/assets and mark `THIRD_PARTY_AUDIT_STATUS: COMPLETE`. Requires canonical dependency output and legal/provenance review. → LRP-FR-003
- [~] **P112** Generate deterministic CycloneDX SBOM tied to source commit and dependency-output SHA-256. → LRP-FR-006
- [~] **P113** Emit SBOM/source/archive checksums as release evidence. → LRP-FR-006, LRP-NFR-001

## Phase L — Public repository hygiene

- [~] **P120** Add Dependabot Gradle/GitHub Actions configuration. → LRP-FR-004
- [~] **P121** Add bug/feature/TV-compatibility issue forms and secret-safe guidance. → LRP-FR-004, LRP-NFR-004
- [~] **P122** Add PR template covering executed tests, accessibility, security/privacy and licensing. → LRP-FR-004
- [~] **P123** Add canonical-source public CI for source/history audit, protocol fixture test, desktop, Android, Apple and dependency/SBOM inventory. → LRP-FR-005, LRP-FR-006
- [~] **P124** Use currently supported GitHub Action majors in public template and keep them dependency-managed. → LRP-FR-005

## Phase M — Stable Candidate promotion

- [~] **P130** Define machine-readable `release/evidence.json` with explicit PASS/BLOCKED/NOT_TESTED state. → LRP-FR-007, LRP-FR-011
- [~] **P131** Implement fail-closed Stable promotion checker requiring literal PASS for every Stable-required gate. → LRP-FR-007, LRP-NFR-003
- [!] **P132** Execute canonicalization and obtain green source/spec/runtime-security evidence. Blocked by current GitHub runner allocation. → LRP-FR-005, LRP-FR-007
- [!] **P133** Execute Android/desktop/Apple/public-style build/runtime gates. Blocked by current GitHub runner allocation. → LRP-FR-005, LRP-FR-007
- [!] **P134** Execute LG real-client deterministic L3, clean installer lifecycle and Android upgrade persistence. Blocked by current GitHub runner allocation. → LRP-FR-007
- [!] **P135** Close any Critical/High release-blocking security finding and record review status. Requires executed audits/review. → LRP-FR-007
- [!] **P136** Promote Stable Candidate only after P111 and every Stable-required evidence item is PASS. → LRP-FR-007

## Phase N — 1.0 physical/distribution evidence

- [!] **P140** Complete representative physical LG TV matrix for advertised stable support. → LRP-FR-008
- [!] **P141** Complete physical Android phone validation. → LRP-FR-008
- [!] **P142** Complete physical iPhone + iPad Local Network/multicast/control validation. → LRP-FR-008
- [!] **P143** Complete physical accessibility validation (TalkBack/VoiceOver and applicable desktop assistive-tech paths). → LRP-FR-008
- [!] **P144** Produce/verify production-signed Android release artifacts. Requires real signing credentials/store path. → LRP-FR-008
- [!] **P145** Produce/verify Authenticode Windows artifacts when advertised L5. Requires production signing credential. → LRP-FR-008
- [!] **P146** Developer-ID sign/notarize/staple/Gatekeeper-verify macOS artifacts when advertised L5. Requires Apple production identities. → LRP-FR-008
- [!] **P147** Archive/export/TestFlight iOS build with approved provisioning/capabilities. Requires Apple entitlement/provisioning/store credentials. → LRP-FR-008
- [!] **P148** Freeze support URLs, privacy/release metadata, screenshots, notices, SBOM and checksums. → LRP-FR-008

## Phase O — Version freeze and public repository publication

- [~] **P150** Document native monotonic versioning constraints and public 1.0 semantic-reset options. → LRP-FR-009
- [!] **P151** Choose final public version mapping and apply dedicated version commit only after target evidence gate passes. → LRP-FR-009
- [~] **P152** Implement guarded publisher: dry-run default, explicit target/level/confirmation/token, refuse existing repo, clean one-commit history. → LRP-FR-010
- [~] **P153** Configure target private first, vulnerability alerts/secret scanning/push protection, then public visibility and private vulnerability reporting. → LRP-FR-010
- [!] **P154** Run 1.0 promotion checker with every 1.0-required item PASS. → LRP-FR-008
- [!] **P155** Publish clean Libre Remote repository through guarded publisher. Requires P154 and explicit operator publication intent. → LRP-FR-010

## Infrastructure

- [!] **P199** Restore GitHub Actions runner allocation by resolving repository/account billing/spending configuration. This remains an external prerequisite for automated evidence, not a source-code task. → LRP-FR-005, LRP-FR-007, LRP-FR-008
