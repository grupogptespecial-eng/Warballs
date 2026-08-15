# Libre Remote Privacy Policy

**Status:** project policy for the open-source application; review the final store-facing copy before 1.0 publication.

Libre Remote is designed as a local-first remote-control application. Core TV/device discovery and control are intended to occur between the user's host device and compatible devices on the user's local network.

## Libre Remote developer data collection

Libre Remote does not intentionally require a Libre Remote account, display advertising, or include developer-operated analytics/telemetry in the core application.

The project does not sell user personal data.

## Data stored on the user's device

Libre Remote may store locally:

- saved TV/device profiles and user preferences;
- layout/customization preferences;
- pairing credentials required by manufacturer protocols;
- local trust/certificate state required by secure TV connections.

Pairing credentials and security-sensitive trust material must use the platform-specific secure storage path described in `SECURITY.md`. Ordinary preferences are not an acceptable production secret store.

## Local network access

Libre Remote needs local-network access to discover and communicate with compatible TVs/media devices. Depending on platform and backend this can include local HTTP, WebSocket/WSS, SSDP/UPnP/multicast/broadcast and Wake-on-LAN traffic.

Local network addresses, TV identifiers and pairing material can be sensitive even though they are not sent to a Libre Remote developer backend. Bug reports and compatibility reports should remove private identifiers and secrets before publication.

## Microphone and speech recognition

Voice-control features, when enabled on a platform, can require microphone and speech-recognition permissions. Operating-system speech services may process speech according to the platform vendor's settings and privacy terms. Libre Remote must not describe platform speech processing as developer-collected Libre Remote telemetry.

Users who do not grant voice permissions should still be able to use non-voice remote-control functionality where the host/TV backend supports it.

## Manufacturer and operating-system services

A television, operating system, app store, speech service or manufacturer protocol may independently collect data under its own privacy policy. Libre Remote cannot control third-party device/platform telemetry merely by controlling a device on the local network.

## Logs and support reports

Diagnostic logs generated for troubleshooting should be sanitized before they are shared. Do not publish pairing keys, tokens, private certificates/keys, signing credentials, precise private-network identifiers or another person's data.

## Security reports

Security vulnerabilities should use the private reporting process in `SECURITY.md`, not a public issue.

## Changes

Material privacy changes must be reflected in this document and in any platform store privacy/data-safety declarations before the affected release is promoted.
