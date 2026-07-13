# Architecture

Libre Remote is a local-first Android remote control. The UI never talks directly to a manufacturer protocol. It sends normalized commands to a `TvBackend` selected from the detected platform and capabilities.

## Main layers

- **UI (`MainActivity`, `RemoteControls`, `RemoteSheets`)** — Compose screens, accessibility, presets and user actions.
- **State (`RemoteViewModel`)** — owns the public UI state, coordinates repositories, discovery, macros and command scheduling.
- **Protocol backends (`TvBackend`, `FastLgWebOsClient`)** — LG webOS, Samsung Tizen local and DLNA/UPnP media.
- **Discovery (`TvDiscovery`)** — known-device probing, SSDP, description parsing, stable identity and deduplication.
- **Persistence (`ProductDatabase`, `ProductSettingsStore`, `RemotePreferences`)** — Room for structured data, DataStore for small settings and encrypted preferences for pairing secrets.
- **Performance (`CommandScheduler`, `PerformanceTracker`)** — bounded priority queues and local metrics.
- **Automation (`MacroEngine`)** — bounded user macros and deterministic voice-command parsing.
- **System surfaces** — launcher shortcuts, app widget and Quick Settings tile.

## Backend contract

A backend must declare honest capabilities. A control is visible only when the active backend reports the corresponding `TvCapability`. New backends should implement `TvBackend`, add metadata to `TvBackendRegistry`, provide contract tests, document legal/distribution constraints and remain experimental until tested on real hardware.

## Security boundaries

- Manufacturer tokens are stored in encrypted preferences and excluded from backup/device transfer.
- Discovery and DLNA URLs are accepted only for private, loopback, link-local or local hostnames.
- Redirects to external hosts are not followed.
- Queues are bounded; stale repeating commands are discarded.
- Diagnostic exports omit credentials, typed text and full device secrets.

## Stable device identity

The preferred identity is the UPnP UDN/USN or a manufacturer identifier. IP is a fallback only. This lets a saved TV survive DHCP address changes.

## Adding a backend

1. Add a `TvPlatform` and support level.
2. Implement `TvBackend` without blocking the main thread.
3. Return the smallest truthful capability set.
4. Add discovery classification and stable identity.
5. Add failure, queue, reconnect and credential-removal tests.
6. Update `COMPATIBILITY.md`, `SECURITY.md` and store disclosures.
7. Keep it behind the experimental toggle until hardware validation is recorded.
