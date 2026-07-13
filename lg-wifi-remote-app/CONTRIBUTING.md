# Contributing

Thank you for improving Libre Remote.

## Non-negotiable product principles

- no ads, tracking or mandatory Libre Remote account;
- local-first behavior wherever the platform allows it;
- truthful compatibility and capability reporting;
- credentials and signing material never committed;
- accessible controls and understandable errors;
- bounded queues, timeouts and cancellation for every protocol.

## Setup

Read `BUILDING.md`, then run:

```bash
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleDebug
```

## Protocol changes

Keep manufacturer details behind `TvBackend`. Document models/firmware tested, legal/distribution constraints, credential lifecycle, ports and failure behavior. Experimental backends must remain behind the settings toggle until the public physical matrix is sufficient.

## Pull requests

Use the repository template. Include the user problem, implementation, tests, screenshots for UI work, accessibility checks and privacy/security impact. Never attach real pairing tokens, typed passwords, full certificate material, private account data or unsanitized logs.

## Compatibility reports

Use `docs/COMPATIBILITY-REPORT.md`. Reports are evidence, not automatic proof that an entire brand is supported.
