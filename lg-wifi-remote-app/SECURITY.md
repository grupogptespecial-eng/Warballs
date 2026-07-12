# Security Policy

## Supported versions

The latest tagged beta and stable release receive security fixes. Experimental branches are not supported releases.

## Reporting a vulnerability

Do not publish pairing keys, local network identifiers, certificate fingerprints or a working exploit in a public issue. Contact the maintainers privately through GitHub's private vulnerability reporting feature once the project is moved to its permanent public repository.

A useful report includes the affected version, Android version, television model and system version, reproduction steps, impact and suggested mitigation when available.

## Security design

Libre Remote limits connections to local-network targets, stores LG pairing material in encrypted preferences, uses a persistent WebSocket connection and records the first trusted local TLS certificate fingerprint. A changed fingerprint is treated as a potential device change or interception and should require explicit user review.

No security mechanism should be described as perfect. Local network protocols and television firmware vary, and every public release requires continued review.
