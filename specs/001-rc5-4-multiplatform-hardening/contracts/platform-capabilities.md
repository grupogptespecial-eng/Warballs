# Contract — Platform and TV Capabilities

## Purpose

Prevent false parity. A feature is available only if both the connected TV backend and the current host platform implement the required semantics.

## TV capability dimensions

At minimum, model capabilities for:
- navigation;
- volume up/down;
- mute toggle;
- absolute mute, only when genuinely available;
- channel control;
- pointer/touchpad;
- keyboard/text entry;
- apps;
- inputs;
- media play/pause/stop;
- power off;
- Wake-on-LAN eligibility;
- voice-command delivery if protocol-specific.

## Host capability dimensions

At minimum:
- local-network access;
- multicast discovery;
- secure credential storage;
- microphone;
- speech recognition;
- accessibility level;
- notifications/background reconnect where implemented;
- Wake-on-LAN packet support;
- platform-specific permission state.

## Availability rule

`EffectiveCapability = TvCapability ∩ HostCapability ∩ UserPermission ∩ ReleasePolicy`

The UI MUST NOT expose a capability merely because another host supports it.

## Semantic rule

Capability names encode semantics. Examples:
- `MuteToggle` means “invert current TV mute state”.
- `SetMute(Boolean)` means “reach requested absolute state”.

A backend that only has `KEY_MUTE` cannot truthfully implement `SetMute(Boolean)` without reliable state observation and reconciliation.

## Unknown state

Unknown capability/permission state defaults to unavailable or visibly unresolved; it must not be guessed as supported.
