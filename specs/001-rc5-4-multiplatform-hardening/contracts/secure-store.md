# Contract — SecureStore

## Purpose

Pairing keys, auth tokens and trust state are credentials. They must not share the same persistence contract as ordinary UI preferences.

## Common interface semantics

A platform SecureStore implementation must support:
- `putSecret(scope, key, bytes)`;
- `getSecret(scope, key)`;
- `deleteSecret(scope, key)`;
- `deleteScope(scope)` when a TV is forgotten;
- atomic replacement where the underlying platform supports it;
- explicit unavailable/error state rather than silent plaintext fallback.

`scope` should be the stable device identity after identity migration.

## Required backends

- Android: Android Keystore-backed encryption/storage.
- iOS/macOS: Keychain.
- Windows: Credential Manager and/or DPAPI-protected storage.
- Linux: Secret Service/libsecret.

## Forbidden behavior

- silent fallback from unavailable secure storage to plaintext preferences;
- writing `client-key`, pairing/auth token or certificate fingerprint to `java.util.prefs`, unprotected DataStore or NSUserDefaults;
- logging secret values;
- exporting secrets in diagnostics.

## Migration

If legacy plaintext or preference-backed credentials exist:
1. read them once;
2. write to SecureStore;
3. verify read-back;
4. delete legacy value;
5. record migration version without secret material.

Migration failure must preserve recoverability and must not delete the only usable credential before secure write verification.
