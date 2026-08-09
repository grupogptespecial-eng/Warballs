package com.geronimo.controlelgwifi

import androidx.compose.runtime.Immutable

@Immutable
data class TvDevice(
    val ip: String,
    val name: String = "Smart TV",
    val model: String? = null,
    val manufacturer: String? = null,
    val room: String = "",
    val mac: String? = null,
    val platform: TvPlatform = TvPlatform.Unknown,
    val supportLevel: TvSupportLevel = platform.defaultSupportLevel,
    val stableId: String = "${platform.name}:$ip",
    val descriptionUrl: String? = null,
    val avTransportUrl: String? = null,
    val renderingControlUrl: String? = null,
    val lastSeenAt: Long = System.currentTimeMillis(),
    val capabilities: Set<TvCapability> = platform.defaultCapabilities(
        hasAvTransport = avTransportUrl != null,
        hasRenderingControl = renderingControlUrl != null
    )
) {
    val displayName: String
        get() = room.takeIf { it.isNotBlank() }?.let { "$it • $name" } ?: name

    val platformLabel: String get() = platform.displayName
    val supportLabel: String get() = supportLevel.displayName
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
    AbsoluteVolume,
    Channels,
    Media,
    Seek,
    Queue,
    Apps,
    Inputs,
    Keyboard,
    NumericKeys,
    ColoredKeys,
    Info,
    Guide,
    Captions,
    AudioTrack,
    DeviceInfo,
    WakeOnLan,
    CloudControl;

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
            Info,
            DeviceInfo,
            WakeOnLan
        )

        val samsungDefaults = setOf(
            PowerOff,
            Navigation,
            Volume,
            Channels,
            Media,
            NumericKeys,
            ColoredKeys,
            Info,
            Guide,
            DeviceInfo,
            WakeOnLan
        )

        val dlnaMediaDefaults = setOf(Media, DeviceInfo)
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

enum class AccentTheme {
    Ocean, Violet, Emerald, Sunset, Monochrome,
    Aurora, Rose, Cyber, Gold, Arctic
}

enum class BackgroundEffect { None, Aurora, GradientFlow, AmbientOrbs }
enum class AnimationPreset { Off, Calm, Fluid, Energetic }
enum class ButtonEffect { Classic, Soft, Bounce, Glow }

enum class AppLanguage(val tag: String?) {
    System(null),
    PortugueseBrazil("pt-BR"),
    English("en-US"),
    Spanish("es-ES");

    fun resolved(): AppLanguage {
        if (this != System) return this
        return when (java.util.Locale.getDefault().language.lowercase()) {
            "pt" -> PortugueseBrazil
            "es" -> Spanish
            else -> English
        }
    }
}

enum class VoiceLanguage(val tag: String?) {
    Auto(null),
    PortugueseBrazil("pt-BR"),
    EnglishUS("en-US"),
    Spanish("es-ES"),
    French("fr-FR"),
    German("de-DE"),
    Italian("it-IT")
}

enum class ControlSurface { Remote, Touchpad }

enum class RemotePresetId(val title: String) {
    Simple("Simples"),
    Normal("Normal"),
    Advanced("Avançado"),
    AdvancedLegacy("Avançado AL"),
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
        val advancedLegacy = RemotePreset(
            RemotePresetId.AdvancedLegacy,
            name = "Avançado AL",
            modules = listOf(
                RemoteModule.Power,
                RemoteModule.DPad,
                RemoteModule.Volume,
                RemoteModule.Channels,
                RemoteModule.CoreActions,
                RemoteModule.Media,
                RemoteModule.TouchpadShortcut,
                RemoteModule.Inputs,
                RemoteModule.Apps,
                RemoteModule.Keyboard,
                RemoteModule.Numeric,
                RemoteModule.Colors,
                RemoteModule.InfoMenu
            ),
            compact = false
        )
        fun defaultFor(id: RemotePresetId): RemotePreset = when (id) {
            RemotePresetId.Simple -> simple
            RemotePresetId.Normal -> normal
            RemotePresetId.Advanced -> advanced
            RemotePresetId.AdvancedLegacy -> advancedLegacy
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
    val backendSummary: String? = null,
    val lastCommandDispatchMs: Double? = null,
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
    val capabilities: Set<TvCapability> = emptySet(),
    val volume: Int? = null,
    val muted: Boolean = false,
    val hapticsEnabled: Boolean = true,
    val soundEnabled: Boolean = false,
    val compactMode: Boolean = false,
    val showLabels: Boolean = true,
    val autoConnect: Boolean = true,
    val experimentalBackendsEnabled: Boolean = true,
    val themeMode: ThemeMode = ThemeMode.System,
    val accentTheme: AccentTheme = AccentTheme.Ocean,
    val backgroundEffect: BackgroundEffect = BackgroundEffect.Aurora,
    val animationPreset: AnimationPreset = AnimationPreset.Calm,
    val buttonEffect: ButtonEffect = ButtonEffect.Soft,
    val appLanguage: AppLanguage = AppLanguage.System,
    val voiceLanguage: VoiceLanguage = VoiceLanguage.Auto,
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
