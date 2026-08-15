# Versioning Policy

Libre Remote currently has an internal/private RC lineage named `2.1.3-rc5.4-customization` with Android `versionCode 29` and desktop installer `packageVersion 2.1.3`.

The planned first polished public milestone may be branded **1.0**, but the repository must not blindly change every native version field from 2.1.3 to 1.0.0. That would be a numeric downgrade for some package managers/installers and could break upgrade semantics.

## Rules

- Android `versionCode` is monotonic and must remain greater than every previously distributed build code. A public `versionName` may be chosen independently, but `versionCode` must never reset.
- Apple `CFBundleVersion` must remain monotonic for distributed builds. `CFBundleShortVersionString` is the user-facing release version and is chosen when the public release train is finalized.
- Windows MSI/installer upgrade continuity uses the permanent `upgradeUuid` already assigned to Libre Remote. The installer package version must follow Windows upgrade rules and must not be decreased on an upgrade path that must work in place.
- macOS package/app version fields used by signing/distribution must satisfy the selected distribution channel's ordering rules.
- source/release tags follow semantic versioning after the public baseline is established.

## Public 1.0 decision

Before the public version is frozen, choose one of these deliberately:

### Option A — preserve current semantic lineage

Promote the hardened product as a 2.x Stable release. This is the simplest upgrade story for internal testers who already installed 2.1.3-lineage desktop packages.

### Option B — public semantic reset to 1.0

Use `1.0.0` as the public product/repository tag while retaining monotonic native build/package identifiers where required. Any native installer that cannot safely downgrade from an internal 2.1.3 test install must either use a compatible higher native package version or document/automate the one-time migration/uninstall path.

## Current hardening policy

The hardening branch does **not** perform the semantic reset. It prepares Stable/1.0 gates and keeps the current RC identity until runtime, upgrade and distribution evidence is available. This prevents a version label from creating a broken upgrade path.

The final version bump should be a small dedicated release commit after the target gate passes, accompanied by release notes and a version-field audit for Android, Apple, Windows and macOS.
