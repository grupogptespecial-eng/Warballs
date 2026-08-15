# Plan — LR-SPEC-002

## Workstream A — Public source boundary

- Treat LR-SPEC-001 canonical source as input.
- Export only normal Libre Remote source plus public docs, protocol lab, specs, release evidence and public GitHub configuration.
- Explicitly exclude Warballs Git history, legacy transport, predecessor fixtures, build output and signing material.
- Audit both exported tree and newly initialized public Git history before any visibility change.

## Workstream B — Licensing and supply chain

- License original Libre Remote code/documentation under Apache-2.0.
- Maintain `NOTICE` and reviewed `THIRD_PARTY_NOTICES.md`.
- Generate a dependency/license review artifact from the actual Gradle dependency graph.
- Inventory bundled assets for provenance review.
- Generate a deterministic CycloneDX SBOM tied to dependency output and source commit.

## Workstream C — Public project hygiene

- Root Libre Remote README/build/security/contribution/conduct/changelog/version/release docs.
- Issue templates for bugs, features and hardware compatibility evidence.
- PR checklist for tests, accessibility, security/privacy and licensing.
- Dependabot for Gradle and GitHub Actions.
- Public CI that assumes committed canonical source only.

## Workstream D — Stable Candidate

- Maintain `release/evidence.json` as the machine-readable gate ledger.
- Require literal PASS for every Stable-required gate.
- Block on pending license review, dirty public history, failed runtime/security/protocol/install/upgrade evidence or known release-blocking security findings.
- Publish Stable Candidate only with truthful support claims.

## Workstream E — 1.0

- Complete physical host/TV matrix for advertised stable capabilities.
- Complete production Android/Windows/macOS/iOS signing/distribution evidence where those binaries are advertised L5.
- Complete physical accessibility evidence.
- Freeze support/store/release metadata and SBOM/checksums.
- Perform dedicated final version commit preserving native monotonic upgrade identities.

## Workstream F — Guarded publication

- Default publisher to dry-run.
- Require explicit target, selected evidence level, dedicated token and literal confirmation.
- Refuse existing target repositories.
- Create target private, push one clean initial commit, configure repository security, then make public and enable private vulnerability reporting.

## Ordering

`LR-SPEC-001 hardening → canonicalize → license/SBOM review → clean export/history → Stable gate → Stable Candidate → physical/signing/accessibility → version freeze → 1.0 gate → guarded public repository publication`.

## Evidence principle

The plan intentionally separates source implementation from executed evidence. A workflow file, test file or release script being present does not satisfy a gate until it executes successfully and the corresponding evidence record becomes PASS.
