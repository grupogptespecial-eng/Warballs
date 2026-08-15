# Libre Remote — Hardware Validation Matrix

Use this file for **real-device evidence**. Do not replace `NOT TESTED` with `PASS` based on simulator/emulator or successful compilation.

## Result values

`PASS` · `FAIL` · `N/A` · `NOT TESTED`

## Host coverage

| Host | OS/version | Architecture | Device/model | Install | Launch | Upgrade | Accessibility | Local-network permission | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Android | TBD | TBD | TBD | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | |
| iPhone | TBD | arm64 | TBD | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | Multicast entitlement must be present in signed provisioning |
| iPad | TBD | arm64 | TBD | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | Include portrait/landscape and large text |
| Windows | TBD | x86-64 | TBD | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | Include Defender/private-network prompt |
| Linux | TBD | x86-64 | TBD | NOT TESTED | NOT TESTED | NOT TESTED | N/A | NOT TESTED | Record distro + desktop + Wayland/X11 |
| macOS | TBD | arm64 | TBD | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | Record Gatekeeper/notarization status |

Add a separate row before claiming support for Windows ARM64, Linux ARM64 or macOS Intel.

## TV / protocol coverage

Create one row per **host + TV + firmware + network topology** combination.

| Host | TV manufacturer/model | Year | Firmware / OS | TV network | Host network | Discovery | Stable identity / DHCP change | Pair allow | Pair deny | Reconnect | WSS | WS fallback | D-pad | Volume | Channel | Pointer | Keyboard | Apps | Inputs | Media | Power off | Wake-on-LAN | Notes |
|---|---|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TBD | LG TBD | TBD | webOS TBD | Wi-Fi | Wi-Fi | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | |
| TBD | Samsung TBD | TBD | Tizen TBD | Ethernet | Wi-Fi | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | N/A | N/A | NOT TESTED | NOT TESTED | NOT TESTED | N/A | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | |
| TBD | DLNA device TBD | TBD | TBD | Ethernet | Wi-Fi | NOT TESTED | NOT TESTED | N/A | N/A | NOT TESTED | N/A | N/A | N/A | NOT TESTED | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | |

## Mandatory failure-path cases

Each stable backend must also have evidence for:

| Case | LG webOS | Samsung Tizen | DLNA/UPnP |
|---|---|---|---|
| TV asleep at discovery | NOT TESTED | NOT TESTED | NOT TESTED |
| TV powers off during command | NOT TESTED | NOT TESTED | NOT TESTED |
| Wi-Fi disappears | NOT TESTED | NOT TESTED | NOT TESTED |
| Host changes Wi-Fi | NOT TESTED | NOT TESTED | NOT TESTED |
| TV IP changes after DHCP lease | NOT TESTED | NOT TESTED | NOT TESTED |
| Pairing rejected | NOT TESTED | NOT TESTED | N/A |
| Pairing/token expires | NOT TESTED | NOT TESTED | N/A |
| Unsupported command | NOT TESTED | NOT TESTED | NOT TESTED |
| Duplicate discovery response | NOT TESTED | NOT TESTED | NOT TESTED |
| Oversized/malformed description | NOT TESTED | NOT TESTED | NOT TESTED |
| IPv6 path | NOT TESTED | NOT TESTED | NOT TESTED |
| Guest/client-isolated network | NOT TESTED | NOT TESTED | NOT TESTED |

## Release rule

A platform/backend pair cannot be promoted to broad `StableFull` solely from build or simulator evidence. At minimum it needs successful packaged-app runtime evidence, deterministic protocol tests, and representative physical hardware evidence recorded here.
