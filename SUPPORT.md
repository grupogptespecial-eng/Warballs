# Libre Remote Support

## User support

For normal defects, use the public bug-report issue form and include the Libre Remote version/commit, host platform, TV/device model/firmware when relevant, reproduction steps, expected behavior and sanitized evidence.

For compatibility evidence, use the TV compatibility report template rather than assuming one model proves an entire manufacturer family.

For feature proposals, use the feature-request template and describe the user problem before proposing an implementation.

## Security

Do not use public support channels for vulnerabilities containing exploit details, pairing credentials, certificate/private-key material or other sensitive data. Follow `SECURITY.md` and use private vulnerability reporting.

## Support scope

Once public releases exist, the project intends to support the latest Stable release and the active pre-release when it contains fixes not yet promoted to Stable. Historical development snapshots are not guaranteed to receive fixes.

## Compatibility claims

Support is evidence-based. A host platform or TV/backend is supported only to the level recorded by `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`, `LIBRE_REMOTE_HARDWARE_MATRIX.md` and `release/evidence.json`. Experimental backends remain experimental until the required deterministic and physical evidence exists.

## What to include in reports

Useful reports include:

- Libre Remote version or exact commit;
- host OS/device and architecture;
- TV/media-device manufacturer, exact model and firmware/system version;
- Wi-Fi/Ethernet topology when relevant;
- whether discovery, pairing, reconnect and the specific command failed;
- sanitized logs/screenshots;
- whether the problem reproduces after app/TV restart and network reconnect.

Never include real pairing keys/tokens, signing credentials, private certificates/keys or another person's personal data.
