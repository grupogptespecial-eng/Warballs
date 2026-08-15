# Changelog

All notable public Libre Remote changes should be documented here.

The project follows a release-train model: private/internal RC lineage → Stable Candidate → public 1.0 after all mandatory evidence gates pass. The exact public semantic version is not changed automatically by the hardening branch because the current internal `2.1.3-rc5.4-customization` lineage must be reconciled with platform-specific upgrade/version rules first; see `VERSIONING.md`.

## Unreleased — RC5.4 hardening

### Added

- multiplatform release gates for Android, iOS/iPadOS, Windows, Linux and macOS;
- platform-native secure-store architecture;
- deterministic LG/Samsung/DLNA protocol lab;
- real-client LG integration paths on desktop, Android Emulator and iOS Simulator;
- canonical-source migration workflow;
- clean-machine package lifecycle workflows;
- production signing/notarization/TestFlight workflows that fail closed when credentials are unavailable;
- source/spec traceability and L0-L5 evidence model;
- public-source sanitization/open-source readiness gates;
- accessibility/layout auditing improvements.

### Security

- WSS-first LG transport;
- post-success downgrade prevention;
- fail-closed certificate trust behavior;
- migration of pairing secrets away from ordinary preferences;
- bounded network reads and hardened UPnP XML handling;
- local-target policy and secret/logging audits.

### Changed

- Android/iOS/macOS app identity is normalized for release continuity;
- Windows installer lineage uses a stable upgrade UUID;
- native desktop package formats are treated as release artifacts rather than app-image-only evidence;
- support claims are explicitly tied to executed evidence.

### Not yet promoted

This section is **not** a Stable or 1.0 release declaration. Runtime CI, signing credentials and physical hardware validation remain required where recorded in `RELEASE_POLICY.md` and the release evidence manifest.
