# Privacy Policy — Libre Remote

Last updated: 13 July 2026

Libre Remote is a local-first remote-control application. It does not require a Libre Remote account, display advertisements, embed advertising identifiers or include analytics/telemetry SDKs.

## Data handled on the device

The application may store locally:

- saved television names, rooms, local addresses and capability information;
- local pairing keys or tokens supplied by a television;
- custom layouts, macros and preferences;
- a short bounded diagnostic history containing command category, timing and sanitized error information.

Pairing credentials are stored using Android encrypted preferences. The product database and credential stores are excluded from Android backup and device-to-device transfer.

## Local network communication

Libre Remote discovers and controls compatible devices on the same local network using protocols such as SSDP/UPnP, WebSocket, HTTP/SOAP and Wake-on-LAN. Local device identifiers and commands are sent to the selected television or local media device. Libre Remote does not operate a server that receives this traffic.

## Voice input

Voice recognition is initiated only after the user presses the microphone action. Recognition may be provided by the speech service configured on the Android device. Its data practices are governed by that provider. Libre Remote receives the recognized text, parses supported commands locally and does not retain an audio recording.

## Diagnostics and sharing

Diagnostic reports are created locally and are shared only when the user explicitly exports them. Reports are designed to omit pairing credentials, typed television text, passwords and full certificate material. Users should still review a report before publishing it.

## Internet and third parties

The current open-source build does not include SmartThings, cloud accounts, advertising, analytics or Google Cast SDK integration. If an optional cloud module is added later, this policy and the Play Data Safety declaration must be updated before release.

## Deletion

Users can remove a saved television to delete its locally stored pairing information, or clear the application's data/uninstall it to remove all Libre Remote data from the device.

## Contact

Privacy and security reports should be submitted through the repository instructions in `SECURITY.md`.
