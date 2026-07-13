# Release Status — Libre Remote 2.0.0 RC1

This branch is the cleaned release-candidate source for the dedicated Libre Remote repository.

## Implemented

- LG webOS local control: navigation, volume, channels, touchpad, keyboard, apps, inputs, media and Wake-on-LAN when supported.
- Samsung Tizen local backend: experimental pairing, persistent WebSocket control, bounded queues and reconnect backoff.
- DLNA/UPnP AV backend: media, volume and mute when the device announces those services.
- Multiple saved TVs, stable identities and capability-based UI.
- Simple, Normal, Advanced and custom layouts.
- Bounded macros, local diagnostics, latency metrics, widget, launcher shortcuts and Quick Settings tile.
- Encrypted pairing credentials, local URL restrictions, hardened XML parsing and sanitized diagnostic export.
- Open-source maintenance documentation, issue templates, release checklist and Play Store materials.

## Release gates completed by source validation

- JDK 17 / Android API 35 configuration.
- Release minification and resource shrinking.
- Configurable external signing; no key is stored in source control.
- Unit-test, release-lint, APK and AAB commands documented.
- Privacy policy, Data Safety draft, compatibility matrix and contribution guides included.

## External steps still owned by the publisher

- Create the dedicated public GitHub repository and copy this directory as its root.
- Generate and privately back up the permanent upload key.
- Enroll in Play App Signing and perform the first AAB upload.
- Publish the privacy policy at a public HTTPS URL.
- Complete Play Console identity, content rating, Data Safety and required testing tracks.
- Replace concept screenshots with screenshots captured from the signed candidate on real hardware.
- Validate LG and Samsung behavior on a public model/firmware matrix before removing beta labels.

A temporary CI-signed APK must never be used as the first production Play Store upload.
