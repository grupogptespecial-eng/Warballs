# Release Policy

Libre Remote separates **implementation**, **automated evidence**, **physical evidence**, and **distribution evidence**. A release name is not allowed to outrun the evidence.

## Evidence levels

The detailed platform model is in `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`:

- L0 — target exists;
- L1 — compiles;
- L2 — packaged application runs;
- L3 — deterministic protocol integration passes;
- L4 — representative physical hardware passes;
- L5 — production distribution/signing/install/upgrade requirements pass.

## Release stages

### Development / RC

Allowed while implementation is incomplete or evidence is blocked. Public claims must name the release as experimental/RC and disclose unsupported/unvalidated areas.

### Stable Candidate

Stable Candidate is the final pre-1.0 promotion gate. It requires all of the following:

1. canonical normal source committed; no `.b64`/patch transport required for development;
2. clean public source export passes repository/secret audit;
3. Apache-2.0 `LICENSE`, `NOTICE`, reviewed third-party notices and community/security docs present;
4. spec integrity and runtime-security audits pass;
5. Android, iOS/iPadOS, Windows, Linux and macOS compile for every architecture being claimed;
6. final packaged apps launch for every desktop/Android target being claimed;
7. SwiftUI iOS wrapper builds and simulator install/launch passes;
8. deterministic LG client protocol tests pass on desktop, Android Emulator and iOS Simulator;
9. Samsung/DLNA claims remain experimental unless their corresponding real-client contract suite reaches the required evidence;
10. clean-machine installer lifecycle passes for package formats being distributed;
11. RC5.3→current Android upgrade/persistence test passes;
12. no known open Critical/High release-blocking security finding;
13. public README/support matrix exactly matches achieved evidence;
14. dependency/license inventory is reviewed (`THIRD_PARTY_AUDIT_STATUS: COMPLETE`);
15. release artifact hashes are generated.

Stable Candidate may be published as source/pre-release without every store/signing/hardware gate only if the release is explicitly labeled pre-1.0 and does not claim L4/L5 support that has not been demonstrated.

### 1.0

1.0 requires everything in Stable Candidate **plus**:

1. representative physical LG hardware matrix passes for the LG support claim;
2. any Samsung/DLNA support promoted beyond experimental has representative physical evidence;
3. physical iPhone and iPad local-network discovery/control evidence;
4. representative Android physical-device evidence;
5. signed/notarized production artifacts for every platform presented as distribution-ready;
6. Apple provisioning/capabilities approved for the shipping app, including multicast/local-network requirements where used;
7. Android release APK/AAB signed and verified;
8. Windows Authenticode signed/verified if Windows binaries are distributed as L5;
9. macOS Developer ID signing, notarization, stapling and Gatekeeper validation if macOS is distributed as L5;
10. clean install/update/uninstall validation for the shipping desktop installers;
11. persistence/credential migration survives the supported upgrade path;
12. accessibility validation includes physical/manual checks appropriate to the platform (TalkBack, VoiceOver, Narrator/keyboard path where claimed);
13. privacy/support URLs and store metadata/screenshots are ready for the stores being used;
14. final release notes, checksum manifest, SBOM/dependency notices and support matrix are frozen;
15. all mandatory release evidence is archived and referenced from the release record.

## Fail-closed rules

- `IMPLEMENTED` never means `PASS`.
- `BLOCKED` never means `PASS`.
- a skipped test never counts as evidence;
- a workflow that receives no runner/executes zero steps never counts as a failure of the product, but also never counts as a pass;
- missing signing credentials may produce a documented BLOCKED result for development, but an enforced production promotion fails;
- hardware not tested remains `NOT TESTED`, not inferred from a simulator or another TV generation;
- unknown third-party licensing blocks Stable/1.0 distribution until reviewed.

## Version promotion

Version changes occur only after the target gate passes. Do not rename RC5.4 to Stable or 1.0 just to trigger a workflow. See `VERSIONING.md` for the internal 2.1.3 lineage/public-1.0 issue.

## Release authority

A release may be promoted only from the canonical public-ready source commit. The release checklist/evidence report must identify that exact Git commit so binaries, source and claims are reproducible.
