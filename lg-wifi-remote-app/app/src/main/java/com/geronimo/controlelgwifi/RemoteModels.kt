package com.geronimo.controlelgwifi

import androidx.compose.runtime.Immutable

@Immutable
data class TvDevice(
    val ip: String,
    val name: String = "LG webOS TV",
    val model: String? = null,
    val room: String = "",
    val mac: String? = null,
    val lastSeenAt: Long = System.currentTimeMillis(),
    val capabilities: Set<TvCapability> = TvCapability.lgDefaults
) {
    val displayName: String
        get() = room.takeIf { it.isNotBlank() }?.let { "$it • $name" } ?: name
}

enum class ConnectionState {
    Idle,
    PermissionRequired,
    Discovering,
    Connecting,
    Pairing,
    Reconnecting,
    Connected,
    Sleeping,
    Error
}

enum class TvCapability {
    PowerOff,
    PowerOn,
    Navigation,
    Pointer,
    Volume,
    Channels,
    Media,
    Apps,
    Inputs,
    Keyboard,
    NumericKeys,
    ColoredKeys,
    Info,
    Guide;

    companion object {
        val lgDefaults = setOf(
            PowerOff,
            Navigation,
            Pointer,
            Volume,
            Channels,
            Media,
            Apps,
            Inputs,
            Keyboard,
            NumericKeys,
            ColoredKeys,
            Info
        )
    }
}

@Immutable
data class TvApp(
    val id: String,
    val title: String,
    val iconUrl: String? = null
)

@Immutable
data class TvInput(
    val id: String,
    val label: String,
    val connected: Boolean = true
)

enum class ThemeMode { System, Light, Dark, Amoled }
enum class AccentTheme { Ocean, Violet, Emerald, Sunset, Monochrome }
enum class ControlSurface { Remote, Touchpad }

enum class RemotePresetId(val title: String) {
    Simple("Simples"),
    Normal("Normal"),
    Advanced("Avançado"),
    Custom1("Personalizado 1"),
    Custom2("Personalizado 2"),
    Custom3("Personalizado 3");

    val isCustom: Boolean get() = this in setOf(Custom1, Custom2, Custom3)
}

enum class RemoteModule(val title: String, val requiredCapability: TvCapability? = null) {
    Power("Energia", TvCapability.PowerOff),
    DPad("Navegação", TvCapability.Navigation),
    Volume("Volume", TvCapability.Volume),
    Channels("Canais", TvCapability.Channels),
    CoreActions("Voltar, Home e Mudo", TvCapability.Navigation),
    Media("Reprodução", TvCapability.Media),
    Apps("Aplicativos", TvCapability.Apps),
    Inputs("Entradas", TvCapability.Inputs),
    Keyboard("Teclado", TvCapability.Keyboard),
    Numeric("Teclado numérico", TvCapability.NumericKeys),
    Colors("Botões coloridos", TvCapability.ColoredKeys),
    InfoMenu("Info e Menu", TvCapability.Info),
    TouchpadShortcut("Atalho do touchpad", TvCapability.Pointer)
}

@Immutable
data class RemotePreset(
    val id: RemotePresetId,
    val name: String = id.title,
    val modules: List<RemoteModule>,
    val showLabels: Boolean = true,
    val compact: Boolean = false
) {
    companion object {
        val simple = RemotePreset(
            RemotePresetId.Simple,
            modules = listOf(
                RemoteModule.Power,
                RemoteModule.DPad,
                RemoteModule.Volume,
                RemoteModule.CoreActions,
                RemoteModule.Media
            )
        )
        val normal = RemotePreset(
            RemotePresetId.Normal,
            modules = listOf(
                RemoteModule.Power,
                RemoteModule.DPad,
                RemoteModule.Volume,
                RemoteModule.Channels,
                RemoteModule.CoreActions,
                RemoteModule.Apps,
                RemoteModule.Inputs,
                RemoteModule.Media,
                RemoteModule.Keyboard
            )
        )
        val advanced = RemotePreset(
            RemotePresetId.Advanced,
            modules = RemoteModule.entries.toList(),
            compact = true
        )
        fun defaultFor(id: RemotePresetId): RemotePreset = when (id) {
            RemotePresetId.Simple -> simple
            RemotePresetId.Normal -> normal
            RemotePresetId.Advanced -> advanced
            else -> normal.copy(id = id, name = id.title)
        }
    }
}

@Immutable
data class NetworkDiagnostic(
    val wifiConnected: Boolean = true,
    val multicastAvailable: Boolean? = null,
    val localAddress: String? = null,
    val tvReachable: Boolean? = null,
    val port3000Reachable: Boolean? = null,
    val port3001Reachable: Boolean? = null,
    val summary: String = "Pronto para verificar a rede"
)

@Immutable
data class RemoteUiState(
    val connectionState: ConnectionState = ConnectionState.Idle,
    val statusText: String = "Toque em Conectar TV para começar",
    val currentDevice: TvDevice? = null,
    val savedDevices: List<TvDevice> = emptyList(),
    val discoveredDevices: List<TvDevice> = emptyList(),
    val apps: List<TvApp> = emptyList(),
    val inputs: List<TvInput> = emptyList(),
    val capabilities: Set<TvCapability> = TvCapability.lgDefaults,
    val volume: Int? = null,
    val muted: Boolean = false,
    val hapticsEnabled: Boolean = true,
    val soundEnabled: Boolean = false,
    val compactMode: Boolean = false,
    val showLabels: Boolean = true,
    val autoConnect: Boolean = true,
    val themeMode: ThemeMode = ThemeMode.System,
    val accentTheme: AccentTheme = AccentTheme.Ocean,
    val controlSurface: ControlSurface = ControlSurface.Remote,
    val selectedPresetId: RemotePresetId = RemotePresetId.Normal,
    val presets: Map<RemotePresetId, RemotePreset> = RemotePresetId.entries.associateWith(RemotePreset::defaultFor),
    val showDevicePicker: Boolean = false,
    val showConnectSheet: Boolean = false,
    val showSettingsSheet: Boolean = false,
    val showAppsSheet: Boolean = false,
    val showInputsSheet: Boolean = false,
    val showMoreSheet: Boolean = false,
    val showPresetEditor: Boolean = false,
    val onboardingComplete: Boolean = false,
    val diagnostic: NetworkDiagnostic = NetworkDiagnostic(),
    val reconnectAttempt: Int = 0,
    val lastError: String? = null
) {
    val connected: Boolean get() = connectionState == ConnectionState.Connected
    val busy: Boolean get() = connectionState in setOf(
        ConnectionState.Discovering,
        ConnectionState.Connecting,
        ConnectionState.Pairing,
        ConnectionState.Reconnecting
    )
    val selectedPreset: RemotePreset get() = presets[selectedPresetId] ?: RemotePreset.normal
}

enum class RemoteAction {
    Up, Down, Left, Right, Enter,
    Back, Home, Menu, Settings, Info, Guide, Exit,
    VolumeUp, VolumeDown, Mute,
    ChannelUp, ChannelDown,
    Play, Pause, PlayPause, Rewind, FastForward, Stop, Previous, Next,
    PowerOff
}
