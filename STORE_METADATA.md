# Libre Remote Store / Release Metadata

`STORE_METADATA_STATUS: DRAFT`

This file is the 1.0 freeze checklist. It MUST remain DRAFT until URLs, screenshots, final support claims and production artifacts match executed evidence.

## Product identity

- Product name: **Libre Remote**
- Package/bundle identity: see `LIBRE_REMOTE_RELEASE_MANIFEST.md`
- License: Apache-2.0
- Product positioning: open-source, local-first remote control for compatible TVs/media devices on the local network
- Manufacturer affiliation: **independent project; not endorsed by device manufacturers unless explicitly documented**

## Candidate short description

Open-source, local-first remote control for compatible TVs and media devices on your local network.

## Candidate long-description points

Only include a point in final store copy when the corresponding evidence/compatibility claim is PASS:

- local-network TV discovery and control;
- LG webOS support level achieved by the final hardware matrix;
- Samsung/DLNA support only at the experimentally/physically proven level;
- Android/iPhone/iPad/Windows/Linux/macOS availability only for artifacts actually produced and validated;
- no ads, developer analytics or mandatory Libre Remote account in the released build;
- customization/accessibility features only as validated on the shipping platform.

## Required public URLs

Before 1.0 promotion replace/freeze:

- [ ] Source repository URL
- [ ] Privacy policy URL pointing to `PRIVACY.md` or a rendered equivalent
- [ ] Support URL pointing to `SUPPORT.md` / issue tracker
- [ ] Security reporting URL/process
- [ ] Release/download URL

## Screenshots and visual assets

- [ ] Android phone screenshots from final candidate
- [ ] iPhone screenshots from final candidate when distributed
- [ ] iPad screenshots from final candidate when distributed
- [ ] Windows screenshot when distributed
- [ ] macOS screenshot when distributed
- [ ] Linux screenshot when distributed
- [ ] App icon/source provenance confirmed
- [ ] Screenshots contain no private IP/device identifier/pairing data

## Permission / capability rationale

Final metadata must accurately explain only permissions present in the shipping platform build. Candidate rationales:

- Local Network: discover and control compatible TVs/media devices on the same network.
- Multicast/local discovery: SSDP/UPnP discovery where supported/approved.
- Microphone: capture voice commands when the user explicitly uses voice control.
- Speech Recognition: convert a user-invoked voice command into text/action where enabled.
- Network/Internet permission: local protocol communication and platform-required networking APIs; do not imply a developer cloud service when none exists.

## Privacy / data declarations

Before store submission:

- [ ] Compare shipping code/dependencies against `PRIVACY.md`.
- [ ] Verify there is no unexpected analytics/advertising SDK.
- [ ] Verify platform secure storage behavior.
- [ ] Complete each store's current privacy/data-safety questionnaire from the shipping build, not from assumptions.
- [ ] Record any platform speech-service behavior separately from Libre Remote developer collection.

## Compatibility claims

Final copy MUST be generated/reviewed against:

- `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`
- `LIBRE_REMOTE_HARDWARE_MATRIX.md`
- `release/evidence.json`

Do not use blanket phrases such as “works with all LG/Samsung TVs” unless the evidence contract explicitly supports that scope.

## Release assets

- [ ] Final source commit frozen
- [ ] CHANGELOG release section frozen
- [ ] LICENSE / NOTICE / third-party notices COMPLETE
- [ ] CycloneDX SBOM generated
- [ ] SHA-256 manifests generated
- [ ] Production signatures/notarization verified for distributed artifacts
- [ ] Upgrade/install/uninstall evidence linked
- [ ] Physical validation evidence linked
- [ ] Accessibility evidence linked

## Freeze

Set `STORE_METADATA_STATUS: COMPLETE` only in the dedicated final-release commit after all 1.0-required evidence is PASS and the final public version mapping from `VERSIONING.md` is applied.
