# Security Policy

Libre Remote controls devices on a local network and stores pairing credentials. Security reports are treated as release-blocking when they can expose credentials, weaken local-network trust, bypass transport policy, or execute unintended commands.

## Supported versions

Once public releases exist, security fixes are provided for:

- the latest Stable release;
- the latest active pre-release/RC when it contains changes not yet in Stable.

Older experimental snapshots and private historical branches are not supported releases.

## Reporting a vulnerability

Please **do not open a public issue** for a suspected vulnerability that includes an exploit, pairing token/client key, certificate material, private network identifier, signing credential, or another user's data.

Use GitHub Private Vulnerability Reporting on the public Libre Remote repository. If that feature is temporarily unavailable, contact the maintainers through a private channel listed on the repository profile rather than posting exploit details publicly.

A useful report includes:

- affected Libre Remote version/commit;
- host platform and version;
- TV/device manufacturer, model and firmware when relevant;
- protocol/backend involved;
- reproduction steps;
- expected vs actual behavior;
- impact;
- logs with secrets and private network identifiers redacted;
- suggested mitigation, if known.

## Security invariants

Production releases must preserve these properties:

- LG WSS is preferred over cleartext WS;
- after WSS trust has succeeded for a device, silent downgrade to WS is denied until explicit trust reset;
- missing or changed TLS peer certificate material is a deny/review condition, not an automatic success path;
- pairing secrets are never persisted in ordinary preference stores;
- Android secrets use an Android Keystore-backed path;
- Apple secrets use Keychain;
- Windows secrets use DPAPI/Credential Manager semantics bound to the current user;
- Linux secrets use Secret Service/libsecret, with no plaintext production fallback;
- network reads and XML parsing are bounded;
- UPnP XML does not permit external entities/DTD processing;
- remote endpoints must satisfy the local-network target policy;
- signing keys, certificates, API private keys and store credentials are never committed;
- test-only in-memory secret storage cannot silently activate in production.

The repository contains automated source audits and deterministic protocol fixtures for these invariants. A committed check is not equivalent to a passed check; release evidence must come from an executed workflow or documented physical test.

## Dependency and repository security

Before the repository becomes public, enable at minimum:

- Dependabot alerts and dependency updates;
- secret scanning and push protection;
- code scanning where supported;
- private vulnerability reporting.

Public source snapshots must be created from the sanitized canonical tree, not by exposing the historical Warballs Git history.

## Disclosure

The maintainers will acknowledge a valid report, investigate it, prepare a fix and coordinate disclosure based on impact and exploitability. Do not rely on a fixed response deadline for an unvalidated report; high-impact credential or remote-control vulnerabilities receive priority.

## No absolute security claim

Libre Remote interacts with manufacturer protocols and firmware that vary by model and version. No transport, pairing, storage, or local-network mechanism is described as perfectly secure. Security claims are limited to the behavior that has actually been implemented and validated.
