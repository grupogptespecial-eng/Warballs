# Release validation — Libre Remote 2.1.3 RC5.4

The active candidate is `2.1.3-rc5.4-customization` (Android `versionCode 29`). The legacy Android-only directory is retained for history/reference; release validation for RC5.4 is performed against the universal source produced from the RC5.4 materializer and hardened by `scripts/harden_libre_remote_rc5_4.py`.

The release uses evidence levels defined in `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`: target exists (L0), compiles (L1), packaged app runs (L2), protocol suite passes (L3), real hardware passes (L4), and distribution/signing/upgrade gates pass (L5).

## Common automated gates

Required before release:

- source/materializer hash validation;
- idempotent hardening transform;
- common/desktop unit tests;
- explicit Android/iOS/framework identities;
- LG WSS-first invariant;
- no committed signing material;
- release manifest/support-contract consistency.

## Android automated gates

- debug build and available release/lint/unit tasks;
- emulator smoke across multiple Android API levels and device profiles;
- font scale 1.0/1.5/2.0 and landscape checks;
- UI bounds/touch-target audit;
- relaunch/process-death checks;
- memory, gfx/jank, battery-stat, crash and ANR evidence;
- RC5.3 -> RC5.4 in-place upgrade install;
- APK SHA-256 and build manifest.

## iOS / iPadOS automated gates

Framework-only success is not sufficient.

Required:

- `linkDebugFrameworkIosSimulatorArm64`;
- `linkDebugFrameworkIosArm64`;
- explicit Kotlin/Native `CFBundleIdentifier` in both framework variants;
- XCFramework creation;
- XcodeGen project generation;
- SwiftUI wrapper build for iOS Simulator;
- SwiftUI wrapper build for generic physical-device target with CI signing disabled only on the command line;
- app install and launch in an iPhone Simulator;
- screenshot/app-container evidence;
- `NSLocalNetworkUsageDescription`;
- `NSMicrophoneUsageDescription`;
- `NSSpeechRecognitionUsageDescription`;
- `NSAppTransportSecurity.NSAllowsLocalNetworking = true`;
- `com.apple.developer.networking.multicast = true` entitlement metadata.

A real signed iOS build additionally requires Apple approval for multicast networking. Simulator success must never be presented as proof that SSDP/broadcast/multicast works on physical iPhone/iPad hardware.

## Windows automated gates

- `desktopTest`;
- `createDistributable`;
- `packageMsi`;
- `packageExe`;
- launch the executable from the final app image;
- package SHA-256 evidence;
- `jdk.accessibility` included in the reduced runtime.

Before L5: install/update/uninstall on a clean Windows VM, private-network/firewall discovery test, Narrator/Java Access Bridge test and Authenticode/Store signing.

## Linux automated gates

- `desktopTest`;
- `createDistributable`;
- `packageDeb`;
- `packageRpm`;
- final executable launch under a headless X server;
- package SHA-256 evidence.

Before broad stable support: clean Ubuntu, Debian and Fedora checks, network discovery on real interfaces, packaging lifecycle, and explicit disclosure of current Compose Desktop accessibility limitations on Linux.

## macOS automated gates

- `desktopTest`;
- `createDistributable`;
- `packageDmg`;
- `packagePkg`;
- final `.app` bundle launch;
- SHA-256 evidence;
- host architecture recorded.

Before L5: Developer ID signing, notarization, Gatekeeper validation and clean-machine install/update/uninstall. An arm64 runner does not prove Intel compatibility.

## Security gates

- Android applicationId remains `io.github.grupogptespecialeng.libreremote` for upgrade continuity;
- LG WSS `:3001` outranks cleartext WS `:3000`;
- a previously stored `ws://` endpoint may not outrank WSS;
- no `.jks`, `.keystore`, private key, certificate or signing password may be committed;
- release signing material comes only from protected secrets/store signing/external secure signing;
- secret persistence must move to Android Keystore, Apple Keychain, Windows Credential Manager/DPAPI and Linux Secret Service/libsecret;
- `java.util.prefs`, DataStore and NSUserDefaults may store only non-secret preferences;
- after native desktop stores land, enable `LIBRE_REMOTE_STRICT_SECURE_STORE=1` as a mandatory gate.

## Protocol validation gates

Every host should ultimately run the same deterministic fake-TV contract suite. At minimum cover:

- LG discovery, pairing, WSS/WS behavior, commands and reconnect;
- Samsung discovery/pairing and truthful toggle-vs-absolute command semantics;
- DLNA/UPnP discovery/service parsing/control;
- duplicate discovery and IP/address changes;
- accepted/denied/expired pairing;
- unsupported commands;
- TV asleep/off/reconnected;
- Wi-Fi loss and recovery;
- malformed/oversized local responses;
- IPv4/IPv6 where supported;
- persisted profiles/credentials and upgrade migration.

Until this suite exists, a green build proves platform packaging/runtime, not full protocol parity.

## Physical gates

Emulator/simulator success is not sufficient for a remote-control release. Before broad stable claims, record `PASS`, `FAIL`, `N/A` or `NOT TESTED` for multiple real LG/Samsung generations and each supported host class, covering discovery, pairing accepted/denied, reconnect, TV sleep/off, IP change, Wi-Fi/Ethernet, navigation, volume, channels, pointer, keyboard, apps, inputs, media and Wake-on-LAN.

## Current infrastructure note

The new universal workflow was accepted and expanded into `source-integrity`, Windows, Linux, macOS and iOS jobs, but GitHub assigned no runner to the first job (`runner_id=0`) and executed zero steps. The annotation still reports failed account payments or a spending-limit issue. Dependent jobs are therefore skipped. Until billing is restored and all workflows are green, RC5.4 is **source-prepared but not CI-validated**.
