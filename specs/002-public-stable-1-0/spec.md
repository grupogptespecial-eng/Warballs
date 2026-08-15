# Specification — Libre Remote Public Open Source, Stable Candidate and 1.0

**Spec ID:** LR-SPEC-002  
**Status:** ACTIVE / PROMOTION PREPARATION  
**Depends on:** `LR-SPEC-001` RC5.4 multiplatform hardening  
**Scope:** clean public source repository, licensing, community/security baseline, reproducible CI, Stable Candidate and public 1.0 promotion.

## 1. Problem statement

Libre Remote is currently developed inside the private `Warballs` repository, whose default branch and historical Git objects contain unrelated product history and legacy Libre Remote source-transport artifacts. Making that repository public would expose irrelevant history and could preserve previously removed sensitive/transport files in reachable Git objects.

The project therefore needs a clean-source publication boundary and mechanically enforced promotion gates. A public tag or marketing label MUST NOT convert unexecuted implementation into evidence.

## 2. Goals

- Produce a sanitized, self-contained Libre Remote source snapshot from canonical source.
- Start the public project from a clean Git history rather than exposing Warballs history.
- Ship a recognized open-source license and complete third-party notices.
- Provide security, contribution, conduct, build and release documentation.
- Provide public CI independent of historical materializer/patch transport.
- Generate dependency inventory and a deterministic SBOM.
- Define a fail-closed Stable Candidate gate.
- Define a stronger fail-closed 1.0 gate covering physical and production distribution evidence.
- Preserve native upgrade/version continuity even if public marketing uses a 1.0 semantic baseline.
- Make actual repository publication an explicit guarded operation.

## 3. Non-goals

- Declaring Stable or 1.0 before required evidence is PASS.
- Publishing the entire historical Warballs repository.
- Resetting Android/Apple/Windows native build identifiers in a way that breaks upgrades.
- Auto-approving third-party licenses based only on guessed metadata.
- Treating simulator/emulator evidence as physical hardware evidence.

## 4. Requirements

**LRP-FR-001 — Sanitized canonical public source [MUST, STABLE-BLOCKING]**  
The public source snapshot MUST originate from the canonical Libre Remote tree and MUST exclude legacy `.b64`/patch transport, release-only predecessor fixtures, build output, signing material and the Warballs `.git` directory.

Acceptance:
- export includes normal Libre Remote source, public docs, public CI, protocol-lab/specs and release evidence schema;
- export contains no `.rc5-universal`, `.universal-*`, `release-fixtures`, private Git history or signing-key files;
- export records its private source commit in `SOURCE_ORIGIN.json`.

**LRP-FR-002 — Clean public Git history [MUST, STABLE-BLOCKING]**  
The public repository MUST begin from a newly initialized Git history built from the sanitized snapshot. Publication MUST fail if the target history contains known legacy transport or sensitive key/certificate paths.

**LRP-FR-003 — Open-source licensing completeness [MUST, STABLE-BLOCKING]**  
The public repository MUST include Apache License 2.0, NOTICE, and a reviewed third-party notice inventory. Unknown or incompatible dependency/asset licensing MUST block Stable/1.0 promotion.

Acceptance:
- root `LICENSE` is Apache-2.0;
- `NOTICE` is present;
- `THIRD_PARTY_NOTICES.md` contains `THIRD_PARTY_AUDIT_STATUS: COMPLETE` before promotion;
- bundled assets are included in provenance/license review.

**LRP-FR-004 — Public community and security baseline [MUST]**  
The public repository MUST provide README, BUILDING, SECURITY, CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG, issue templates, PR template and dependency-update configuration. Security-sensitive reports MUST be routed away from public issues.

**LRP-FR-005 — Public CI from canonical source [MUST, STABLE-BLOCKING]**  
Public CI MUST build/test committed canonical source directly and MUST NOT depend on historical private materializer payloads.

Acceptance:
- public source/history audit executes;
- protocol fixture self-test executes;
- desktop tests execute on Windows/Linux/macOS runners;
- Android debug build executes;
- Apple device/simulator framework build executes;
- dependency/license/SBOM inventory executes.

**LRP-FR-006 — Deterministic SBOM [MUST, STABLE-BLOCKING]**  
Each promoted release MUST produce a deterministic dependency SBOM tied to the exact source commit and dependency graph used for the candidate.

Acceptance:
- CycloneDX JSON generated from resolved Gradle dependency output;
- source commit and dependency-output digest recorded;
- SBOM checksum recorded as release evidence.

**LRP-FR-007 — Stable Candidate gate [MUST]**  
Stable Candidate promotion MUST fail unless every gate marked `required_for: stable` in `release/evidence.json` is literally `PASS`.

Stable Candidate MUST include at least canonical source, clean public export/history, license review, spec/runtime audits, claimed-platform builds/runtime, LG deterministic protocol L3, clean installer lifecycle, Android upgrade persistence, security review and SBOM evidence.

**LRP-FR-008 — Public 1.0 gate [MUST]**  
Public 1.0 promotion MUST fail unless every gate marked `required_for: 1.0` is literally `PASS`.

In addition to Stable Candidate, 1.0 MUST require representative physical-device/TV validation for advertised stable capabilities, production signing/notarization/TestFlight evidence where binaries are advertised distribution-ready, physical accessibility checks and frozen release/store metadata.

**LRP-FR-009 — Version and upgrade continuity [MUST]**  
A public semantic 1.0 label MUST NOT reset native identifiers in a way that breaks in-place upgrades from previously distributed test builds.

Acceptance:
- Android `versionCode` remains monotonic;
- Apple build number remains monotonic for distributed builds;
- Windows permanent `upgradeUuid` is retained and installer version ordering is valid;
- final public semantic version is changed only in a dedicated release commit after the target evidence gate passes.

**LRP-FR-010 — Guarded repository publication [MUST]**  
Actual public repository creation MUST be explicit, fail closed and non-destructive.

Acceptance:
- publication defaults to dry-run;
- actual publication requires target repository, explicit boolean, literal confirmation and a dedicated token;
- selected Stable/1.0 evidence gate passes before repository creation;
- publisher refuses to overwrite an existing target repository;
- target is created private, receives the clean one-commit history, has security settings configured, then is made public;
- private vulnerability reporting is enabled after public visibility.

**LRP-FR-011 — Truthful publication state [MUST]**  
`IMPLEMENTED`, `BLOCKED`, `NOT_TESTED`, skipped and no-runner states MUST NOT be interpreted as `PASS`. Public README/release metadata MUST not claim a stronger level than recorded evidence.

## 5. Non-functional requirements

**LRP-NFR-001 — Reproducibility [MUST]**  
Every release/public snapshot MUST identify the exact private source commit and generated hashes needed to reproduce the source/artifact evidence.

**LRP-NFR-002 — Minimal release dependencies [SHOULD]**  
Release tooling SHOULD prefer Python standard library, Git/GitHub tooling and existing Gradle/platform tooling instead of adding application runtime dependencies.

**LRP-NFR-003 — Fail-closed automation [MUST]**  
Missing credentials, unknown licenses, dirty public history, missing artifacts or non-PASS required evidence MUST stop promotion/publication rather than silently weakening a gate.

**LRP-NFR-004 — Privacy and secret minimization [MUST]**  
Public export, issue templates, reports and release artifacts MUST avoid real pairing keys, private certificates, signing material, API private keys and unsanitized private network/user data.

## 6. Promotion order

1. Complete LR-SPEC-001 source/runtime hardening.
2. Execute source canonicalization and preserve only the private RC5.3 upgrade fixture needed for regression testing.
3. Generate and review dependency/license inventory; mark third-party audit COMPLETE only after human review.
4. Export sanitized source and validate a fresh one-commit Git history.
5. Execute public-style CI and the Stable evidence suite.
6. Promote to Stable Candidate only when the Stable gate is PASS.
7. Complete physical L4, production L5, accessibility and store/release metadata evidence.
8. Freeze the public version in a dedicated release commit.
9. Promote to 1.0 only when the 1.0 gate is PASS.
10. Create the clean public repository through the guarded publisher.

## 7. Current state

The implementation for export, audits, public CI, licensing skeleton, SBOM generation, evidence gates and guarded publication is versioned. Runtime/build/physical/signing evidence remains BLOCKED or NOT TESTED until the corresponding workflows/hardware can execute. GitHub Actions runner allocation is currently blocked before steps execute by the private repository account billing/spending state.
