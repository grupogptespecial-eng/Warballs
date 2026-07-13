# Testing

## Automated gates

```bash
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleRelease :app:bundleRelease
```

The test suite covers stable identity, private-address filtering, capability serialization, macro/voice parsing, database migration and command scheduling. Release lint must pass before an AAB is accepted.

## Physical release matrix

At minimum test:

- five LG webOS generations;
- five Samsung Tizen generations before removing the experimental label;
- three DLNA MediaRenderers;
- Wi-Fi 2.4/5 GHz, Ethernet TV, mesh router and guest/client-isolated network;
- changed DHCP address, television sleep/wake and app process restart;
- Android 8, 10, 12, 14, 16 and Android 17 preview/production behavior;
- TalkBack, large text, high contrast, left-handed mode and reduced motion.

Use `docs/COMPATIBILITY-REPORT.md`. Never paste credentials or typed TV content into public reports.
