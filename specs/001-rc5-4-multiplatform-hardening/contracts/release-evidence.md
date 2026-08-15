# Contract — Release Evidence

## Evidence levels

- L0: target/source exists.
- L1: platform compile succeeds and expected binary is produced.
- L2: final packaged app launches on target OS/simulator/VM.
- L3: deterministic protocol suite passes on that host.
- L4: representative physical host + TV matrix passes.
- L5: signed/notarized/store or public installer, upgrade preservation, privacy/security gates pass.

## Minimum automated artifacts

### Android
- APK + SHA-256;
- version/application ID manifest;
- multi-API emulator evidence;
- upgrade/persistence evidence.

### iOS/iPadOS
- K/N device+simulator frameworks;
- XCFramework;
- Swift app build logs;
- simulator launch evidence/screenshot;
- privacy/entitlement assertions.

### Windows
- MSI and EXE installers;
- SHA-256;
- packaged-app runtime smoke.

### Linux
- DEB and RPM;
- SHA-256;
- packaged-app runtime smoke.

### macOS
- DMG and PKG;
- SHA-256;
- architecture manifest;
- `.app` runtime smoke.

## Classification

- Missing expected artifact = FAIL.
- App exits/crashes during smoke = FAIL.
- Test assertion failure = FAIL.
- Job has no allocated runner / no executed steps due account infrastructure = BLOCKED.
- Code committed but evidence not run = IMPLEMENTED, not PASS.

## Public claim rule

Release notes and compatibility pages must be generated/reviewed against the highest evidence level achieved for that platform and capability.
