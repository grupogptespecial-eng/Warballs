# Libre Remote

Libre Remote is a local-first, ad-free and open-source Android remote for compatible smart TVs and media renderers.

## Current compatibility

- **LG webOS:** primary full remote backend — navigation, volume, channels, apps, inputs, media, keyboard, touchpad and Wake-on-LAN where the television supports them.
- **Samsung Tizen local:** experimental remote-key backend. Pairing and available keys vary by model and firmware.
- **DLNA/UPnP MediaRenderer:** media transport, volume and mute when the device advertises the corresponding standard services.

The app intentionally does not claim that every television is supported. Features are generated from the capabilities reported by the selected backend. Platforms that require a cloud account, proprietary SDK, manufacturer registration or an external infrared bridge remain documented but disabled until they can be distributed and tested responsibly.

## Product highlights

- automatic local discovery and manual local-IP fallback;
- multiple saved televisions and room names;
- Simple, Normal, Advanced and three custom presets;
- bounded priority command scheduler for responsive controls;
- touchpad, keyboard, apps and inputs when supported;
- local macros with delays and explicit safety limits;
- optional Android widget, launcher shortcuts and Quick Settings tile;
- deterministic Portuguese voice commands;
- high contrast, left-handed mode, reduced motion and large controls;
- local, sanitized diagnostics and latency percentiles;
- no Libre Remote account, ads, telemetry or analytics.

## Privacy and security

Pairing credentials are stored with Android encrypted preferences and are excluded from Android backup/device transfer. The structured product database is also excluded from backup. Network discovery and protocol URLs are restricted to the local network, redirects are disabled and queues/timeouts are bounded.

See `PRIVACY.md` and `SECURITY.md`.

## Build

Requirements and release signing are documented in `BUILDING.md`. The project uses JDK 17, Android SDK 35, Kotlin, Jetpack Compose, Room, DataStore, OkHttp and AndroidX Security.

```bash
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleDebug
```

A signed release requires the four `LIBRE_KEYSTORE_*` environment variables described in `BUILDING.md`.

## Contributing

Read `CONTRIBUTING.md`, `ARCHITECTURE.md`, `TESTING.md`, `COMPATIBILITY.md` and `docs/BACKEND-CONTRACT.md` before changing a protocol. Compatibility reports must never contain pairing tokens, typed passwords or unsanitized device logs.

## Release status

`2.0.0-rc1` is a release candidate. Automated compilation and tests do not replace physical validation across multiple LG/Samsung firmware generations, Play pre-launch testing, permanent release signing or the declarations required in the Play Console.

## License

GPL-3.0-or-later. See `LICENSE`.
