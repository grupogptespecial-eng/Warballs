# Security Policy

## Supported version

Security fixes target the latest Libre Remote release candidate and stable release.

## Reporting

Do not open a public issue for vulnerabilities that expose pairing credentials, signing material, certificate validation bypasses or arbitrary network access. Contact the maintainers privately through the repository owner's security-reporting channel. Include the affected commit/version, Android version, television model, reproduction steps and impact, but never include a real credential.

## Design guarantees

- no signing keys or store credentials in the repository;
- encrypted local storage for pairing secrets;
- credential/product stores excluded from backup and transfer;
- local-address validation for local protocol endpoints;
- no HTTP redirect following in discovery/DLNA clients;
- bounded queues and request timeouts;
- certificate pin/TOFU warning when an associated local certificate changes;
- diagnostic export redaction.

## Scope limitations

Many TV protocols are not formally standardized and firmware behavior varies. A successful compile does not prove that a command is safe or supported on every model. New backends remain experimental until simulator and physical-device tests are recorded.
