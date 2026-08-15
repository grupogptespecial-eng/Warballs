# Libre Remote — Engineering Constitution

This constitution governs implementation, review and release work for Libre Remote. Specifications are the primary source of truth; code, workflows and documentation must conform to them.

## 1. Product truth over platform claims

A platform is supported only to the level demonstrated by evidence. Compilation alone is not runtime support. Runtime alone is not protocol compatibility. Protocol compatibility alone is not distribution readiness.

Support levels:
- L0 Target exists.
- L1 Compiles.
- L2 Packaged application runs.
- L3 Protocol contract suite passes.
- L4 Representative physical hosts and TVs pass.
- L5 Signed/distributed release, upgrade and privacy/security gates pass.

No README, store listing or release note may claim a higher level than the recorded evidence.

## 2. Local-first and minimum privilege

Libre Remote controls devices on the local network. Network access, permissions, entitlements and cleartext fallbacks must be no broader than required by the supported protocols. Manufacturer/vendor cloud integrations are opt-in extensions, not hidden dependencies.

## 3. Security invariants

- LG WSS `:3001` is preferred before cleartext WS `:3000`.
- A device that has successfully used WSS must not silently downgrade to WS without an explicit fallback decision.
- TLS/TOFU verification must fail closed when peer-certificate evidence is absent.
- Pairing secrets/tokens are secrets, not preferences.
- Android secrets use Keystore-backed storage.
- iOS/macOS secrets use Keychain.
- Windows secrets use Credential Manager/DPAPI.
- Linux secrets use Secret Service/libsecret.
- Signing keys and private credentials never live in Git.

## 4. Stable identity and upgrades

Platform identities, bundle IDs and package upgrade identifiers are stable contracts. A release must not silently create a second application or lose paired TVs/settings. Every platform with a public installer must have an upgrade-preservation test before L5.

## 5. Capability honesty

UI capabilities are exposed only when both the TV backend and the host platform can implement the operation truthfully. Toggle semantics must not masquerade as absolute-state setters. Unsupported operations are explicit.

## 6. Tests are derived from specifications

Every MUST requirement has at least one acceptance criterion and an evidence owner: automated test, integration test, simulator/VM test, physical test or release-signing check. New implementation work is not complete until its traceability row is updated.

## 7. Canonical source

The normal source tree is the implementation source of truth. Historical `.b64 + patches` transport is transitional only and must be removed once RC5.4 canonicalization is validated.

## 8. Maintainability

Prefer minimal dependencies, small explicit interfaces, deterministic tests and platform adapters over broad conditional logic. Platform-specific behavior belongs in platform-specific source sets behind common contracts.

## 9. No false green CI

A platform job must fail if the expected artifact is missing. Desktop jobs require the target installer format and a launch smoke. iOS requires the Swift application wrapper, not only an XCFramework. CI infrastructure failures must be distinguished from implementation failures.

## 10. Release rule

A release is promoted only when all requirements marked `RELEASE-BLOCKING` for its advertised support level are PASS. `NOT TESTED`, `UNKNOWN`, `BLOCKED` and infrastructure failure are not PASS.
