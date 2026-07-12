# Contributing

Thanks for helping improve Libre Remote.

## Principles

Contributions must preserve the project's core promises: no ads, no tracking, no mandatory account, local-first operation and honest compatibility reporting.

## Development

1. Use Android Studio with JDK 17.
2. Build with `gradle :app:assembleDebug` or the repository wrapper when added.
3. Keep television protocols isolated from the Compose interface.
4. Avoid proprietary SDKs unless the community has explicitly accepted the trade-off.
5. Do not include pairing keys, private IP addresses, MAC addresses or other personal information in issues or test fixtures.

## Pull requests

A pull request should explain the user problem, implementation, models or protocol versions tested, screenshots for interface changes and any privacy or licensing impact.

## Compatibility reports

Include television brand, model, webOS version when available, Android version, network type and the exact features that worked or failed. Attach only sanitized logs.

## Code style

Prefer small protocol-independent models, coroutines for asynchronous work, persistent connections where appropriate and tests for message serialization and state transitions.
