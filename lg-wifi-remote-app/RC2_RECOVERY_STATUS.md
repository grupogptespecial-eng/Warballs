# Libre Remote 2.0.0 RC2 — recovery status

Date: 2026-07-13

This branch exists only to preserve the recovery trail. Do **not** merge it into Warballs.

## Recovered sources

- Historical GitHub source artifact ID: `8269145198`
- Corrected historical `reconstructed.tar.gz` SHA-256: `5f537a05fd3f6615edda498563210d51e7549ad81849a7fd48039f63c3facfe4`
- Validated 1.1 public package SHA-256: `6e63ff37e064f13e8e49b8d5d6a923557f925955df4d47eec974bb545f891f97`

The two historical byte corrections were taken from the existing `final-build-verified-source.yml` workflow and the corrected archive matched its expected hash exactly.

## RC2 local handoff

A clean local Git repository was created with two commits:

- recovered source: `502605017990799c91096c84b6e75712fca5a718`
- repaired RC2: `95e7e051affcabecdc41fe40eca2c493a4a7f1a7`

Prepared handoff files:

- `Libre-Remote-2.0.0-rc2-source.zip`
- `Libre-Remote-2.0.0-rc2.git.bundle`
- `Libre-Remote-2.0.0-rc2-recovery.patch`
- source and package SHA-256 manifests
- recovery audit, migration provenance and release blockers

These files were delivered in the ChatGPT handoff for this project because the current GitHub connector cannot create a new repository or upload local binary archives.

## Main RC2 repairs

- restored missing R8, Gradle, network-security, launcher and Wake-on-LAN files;
- bumped to version code 21 / `2.0.0-rc2`;
- fixed natural Portuguese voice phrases and missing voice-provider handling;
- hardened local IPv4/IPv6 validation and manual address normalization;
- migrated LG pairing state from mutable IP keys to stable device identity;
- corrected IPv6 WebSocket URL formatting;
- stopped macros when command scheduling fails;
- made scheduler/macro concurrency deterministic in tests;
- fixed widget/tile command lifecycle and inactive states;
- added unit tests for voice, networking, scheduler, macros and Wake-on-LAN;
- pinned Gradle 8.10.2 in CI and removed reliance on an absent wrapper JAR;
- fixed recursive `dist/` release packaging;
- completed bilingual Play Store text and privacy-policy source.

## Validation completed

- historical source SHA verification: PASS
- XML parsing: PASS
- GitHub Actions YAML parsing: PASS
- static required-file/secret checks: PASS
- JVM core harness: `CORE_HARNESS_RC2_OK`

## Still required before production

- Android SDK build, unit tests, release lint, APK and AAB for RC2;
- permanent upload-key signing and Play App Signing;
- public HTTPS privacy-policy URL;
- physical LG/Samsung/DLNA compatibility testing;
- Play Console declarations, internal/closed testing and review.

The dedicated public repository should contain the RC2 source at repository root and use the local Git bundle as the migration source of truth.