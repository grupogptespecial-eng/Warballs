package com.geronimo.controlelgwifi

data class TvDevice(
    val ip: String,
    val name: String = "LG webOS TV",
    val model: String? = null
)

enum class ConnectionState {
    Idle,
    Discovering,
    Connecting,
    Pairing,
    Connected,
    Error
}

data class TvApp(
    val id: String,
    val title: String
)

data class TvInput(
    val id: String,
    val label: String,
    val connected: Boolean = true
)

data class RemoteUiState(
    val connectionState: ConnectionState = ConnectionState.Idle,
    val statusText: String = "Pronto para procurar sua TV",
    val currentDevice: TvDevice? = null,
    val discoveredDevices: List<TvDevice> = emptyList(),
    val apps: List<TvApp> = emptyList(),
    val inputs: List<TvInput> = emptyList(),
    val volume: Int? = null,
    val muted: Boolean = false,
    val hapticsEnabled: Boolean = true,
    val compactMode: Boolean = false,
    val showDevicePicker: Boolean = false,
    val lastError: String? = null
)

enum class RemoteAction {
    Up, Down, Left, Right, Enter, Back, Home, Menu, Info,
    VolumeUp, VolumeDown, Mute, ChannelUp, ChannelDown,
    Play, Pause, Rewind, FastForward, Stop,
    PowerOff
}
