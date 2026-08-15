# Changelog

All notable public Libre Remote changes should be documented here.

The project follows a release-train model: private/internal RC lineage → Stable Candidate → public 1.0 after all mandatory evidence gates pass. The exact public semantic version is not changed automatically by the hardening branch because the current internal `2.1.3-rc5.4-customization` lineage must be reconciled with platform-specific upgrade/version rules first; see `VERSIONING.md`.

## Unreleased — RC5.4 hardening and public-release preparation

### Added

- multiplatform release gates for Android, iOS/iPadOS, Windows, Linux and macOS;
- platform-native secure-store architecture;
- deterministic LG/Samsung/DLNA protocol lab;
- real-client LG integration paths on desktop, Android Emulator and iOS Simulator;
- canonical-source migration workflow with a private normal-source RC5.3 upgrade fixture;
- clean-machine package lifecycle workflows;
- production signing/notarization/TestFlight workflows that fail closed when credentials are unavailable;
- source/spec traceability and L0-L5 evidence model;
- Apache-2.0 license, NOTICE, privacy/support/security/community/build/release documentation;
- sanitized public-source exporter and Git-history/secret audits;
- public GitHub template with issue forms, PR checklist and Dependabot;
- public canonical-source CI and Stable/1.0 promotion workflow;
- Gradle dependency/license review inventory and deterministic CycloneDX SBOM generation;
- machine-readable `release/evidence.json`, controlled evidence recorder and fail-closed promotion checker;
- second canonical spec (`LR-SPEC-002`) for Open Source → Stable Candidate → 1.0;
- guarded publisher that defaults to dry-run, creates a clean repository private-first and refuses to overwrite an existing target;
- privacy/support/store metadata freeze checklists;
- accessibility/layout auditing improvements.

### Security

- WSS-first LG transport;
- post-success downgrade prevention;
- fail-closed certificate trust behavior;
- migration of pairing secrets away from ordinary preferences;
- bounded network reads and hardened UPnP XML handling;
- local-target policy and secret/logging audits;
- public source/history scanners reject known private-key/signing/legacy transport artifacts;
- release PASS records require a reviewable evidence reference and exact source commit.

### Changed

- Android/iOS/macOS app identity is normalized for release continuity;
- Windows installer lineage uses a stable upgrade UUID;
- native desktop package formats are treated as release artifacts rather than app-image-only evidence;
- support claims are explicitly tied to executed evidence;
- workflows are prepared to prefer committed canonical source after legacy materializers are removed;
- Stable Candidate and 1.0 are now separate mechanical promotion gates rather than informal labels.

### Not yet promoted

This section is **not** a Stable or 1.0 release declaration. GitHub Actions runner allocation, final third-party license review, production credentials/Apple approvals, physical hardware/accessibility validation, final version freeze and final store/release metadata still require evidence as recorded in `release/evidence.json`.
