# Contributing to Libre Remote

Thank you for contributing.

## Product principles

Changes must preserve the following unless the active specification is intentionally amended first:

- no ads, developer tracking, or mandatory Libre Remote account;
- local-first behavior wherever the host platform allows it;
- truthful TV/host capability reporting;
- secrets never stored as ordinary preferences;
- no production credentials/signing material in Git;
- accessible controls and understandable errors;
- bounded I/O, timeouts and cancellation for protocol work;
- protocol claims backed by deterministic tests and, where required, physical evidence.

## Sources of truth

- `specs/001-rc5-4-multiplatform-hardening/` governs RC5.4 runtime/platform hardening.
- `specs/002-public-stable-1-0/` governs the clean open-source boundary, Stable Candidate and public 1.0 promotion.
- `release/evidence.json` is the machine-readable promotion ledger; implementation alone is never PASS.

After source canonicalization, contributors should edit normal source files directly. Do not reintroduce `.b64`, generated patch transport, or overlay-driven development.

## Development setup

Read `BUILDING.md` first. Typical checks include:

```bash
./gradlew :composeApp:desktopTest
./gradlew :composeApp:assembleDebug
python3 protocol-lab/libre_remote_lab.py --self-test --json
python3 scripts/validate_libre_remote_specs.py
python3 scripts/validate_libre_remote_public_spec.py
```

Run the platform-specific tasks relevant to your change.

## Pull requests

A pull request should state:

1. user problem;
2. implementation approach;
3. host platforms/backends affected;
4. tests run and evidence produced;
5. screenshots for visible UI changes;
6. accessibility impact;
7. privacy/security impact;
8. compatibility or migration impact;
9. any hardware/firmware actually tested.

Do not mark an item PASS because the code for a test exists. PASS requires executed/reviewed evidence and release promotion additionally requires `evidence_ref` + exact `source_commit`.

## Protocol changes

Keep manufacturer-specific behavior behind backend/capability boundaries. For protocol changes:

- add or update deterministic protocol-lab fixtures;
- cover denial/error paths as well as success paths;
- bound response sizes and parser depth;
- avoid toggle commands behind absolute-state APIs;
- document ports, discovery behavior and credential lifecycle;
- preserve stable device identity when network addresses change;
- add physical compatibility evidence for broad support claims.

Experimental backends remain experimental until the release evidence level supports promotion.

## Security-sensitive changes

Never commit or attach:

- pairing client keys/tokens;
- passwords;
- full certificate/private-key material;
- keystores/PFX/P12 files;
- App Store Connect API private keys;
- private user/network data;
- unsanitized logs containing any of the above.

Security fixes should include a regression test where safely possible. See `SECURITY.md` for disclosure rules.

## Dependencies

New dependencies require:

- a concrete need that cannot reasonably be met with the existing stack;
- compatible licensing;
- an entry in the dependency/license audit output when required;
- no hidden telemetry or mandatory cloud dependency for core local control;
- review of binary size and platform availability.

Prefer standard-library/platform APIs and existing dependencies over adding new libraries.

## Compatibility reports

A single successful TV does not prove an entire manufacturer or firmware family. Record model, year/firmware, network path and tested commands in the hardware/compatibility matrix.

## Licensing of contributions

Unless explicitly stated otherwise, contributions intentionally submitted for inclusion in Libre Remote are provided under the Apache License 2.0, consistent with `LICENSE`.
