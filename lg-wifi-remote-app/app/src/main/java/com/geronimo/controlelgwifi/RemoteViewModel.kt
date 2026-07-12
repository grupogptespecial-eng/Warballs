package com.geronimo.controlelgwifi

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class RemoteViewModel(application: Application) : AndroidViewModel(application), FastLgWebOsClient.Listener {
    private val preferences = RemotePreferences(application)
    private val client = FastLgWebOsClient(application, this)
    private val repeatJobs = mutableMapOf<RemoteAction, Job>()

    private val _uiState = MutableStateFlow(
        preferences.loadState().let { loaded ->
            loaded.copy(
                statusText = when {
                    loaded.currentDevice != null -> "Pronta para conectar a ${loaded.currentDevice.displayName}"
                    else -> "Toque em Conectar TV para começar"
                }
            )
        }
    )
    val uiState: StateFlow<RemoteUiState> = _uiState.asStateFlow()

    init {
        val state = _uiState.value
        if (state.autoConnect && state.currentDevice != null) {
            viewModelScope.launch {
                delay(100)
                connect(state.currentDevice, userInitiated = false)
            }
        }
    }

    fun openConnect() {
        _uiState.update { it.copy(showConnectSheet = true, lastError = null) }
        discover()
    }

    fun closeConnect() {
        _uiState.update { it.copy(showConnectSheet = false, showDevicePicker = false) }
    }

    fun discover() {
        _uiState.update {
            it.copy(
                connectionState = ConnectionState.Discovering,
                statusText = "Procurando TVs na sua rede…",
                discoveredDevices = emptyList(),
                lastError = null
            )
        }
        viewModelScope.launch(Dispatchers.IO) {
            val known = _uiState.value.savedDevices
            val devices = TvDiscovery.discover(getApplication(), known)
            _uiState.update { state ->
                when {
                    devices.isEmpty() -> state.copy(
                        connectionState = if (state.currentDevice == null) ConnectionState.Idle else state.connectionState,
                        statusText = "Nenhuma TV apareceu. Confira a rede ou use o IP manual.",
                        discoveredDevices = emptyList(),
                        showDevicePicker = false
                    )
                    devices.size == 1 -> state.copy(
                        discoveredDevices = devices,
                        showDevicePicker = false,
                        statusText = "TV encontrada: ${devices.first().displayName}"
                    )
                    else -> state.copy(
                        connectionState = ConnectionState.Idle,
                        discoveredDevices = devices,
                        showDevicePicker = true,
                        statusText = "${devices.size} TVs encontradas"
                    )
                }
            }
            if (devices.size == 1) connect(devices.first(), userInitiated = true)
        }
    }

    fun connectManual(raw: String) {
        val ip = normalizeLocalAddress(raw)
        if (ip == null) {
            _uiState.update {
                it.copy(
                    connectionState = ConnectionState.Error,
                    statusText = "Informe um IP local, como 192.168.1.20",
                    lastError = "Endereço inválido"
                )
            }
            return
        }
        connect(TvDevice(ip = ip), userInitiated = true)
    }

    fun connect(device: TvDevice, userInitiated: Boolean = true) {
        preferences.selectDevice(device.ip)
        val saved = preferences.saveDevice(device)
        _uiState.update {
            it.copy(
                currentDevice = device,
                savedDevices = saved,
                showDevicePicker = false,
                showConnectSheet = false,
                connectionState = if (userInitiated) ConnectionState.Connecting else ConnectionState.Reconnecting,
                statusText = "Conectando a ${device.displayName}…",
                lastError = null
            )
        }
        client.connect(device, userInitiated)
    }

    fun reconnect() {
        _uiState.value.currentDevice?.let { connect(it, userInitiated = true) }
            ?: openConnect()
    }

    fun disconnect() {
        stopAllRepeating()
        client.close()
        _uiState.update {
            it.copy(
                connectionState = ConnectionState.Idle,
                statusText = "Desconectada",
                reconnectAttempt = 0
            )
        }
    }

    fun forgetDevice(device: TvDevice) {
        client.forgetDevice(device.ip)
        val saved = preferences.removeDevice(device.ip)
        val wasCurrent = _uiState.value.currentDevice?.ip == device.ip
        if (wasCurrent) client.close()
        _uiState.update {
            it.copy(
                savedDevices = saved,
                currentDevice = if (wasCurrent) null else it.currentDevice,
                connectionState = if (wasCurrent) ConnectionState.Idle else it.connectionState,
                statusText = if (wasCurrent) "TV removida" else it.statusText
            )
        }
    }

    fun updateCurrentDevice(name: String, room: String, mac: String) {
        val current = _uiState.value.currentDevice ?: return
        val updated = current.copy(
            name = name.trim().take(64).ifBlank { current.name },
            room = room.trim().take(32),
            mac = mac.trim().take(24).ifBlank { null }
        )
        val saved = preferences.updateDevice(updated)
        _uiState.update { it.copy(currentDevice = updated, savedDevices = saved) }
    }

    fun send(action: RemoteAction) {
        if (!_uiState.value.connected) return
        if (action == RemoteAction.Mute) {
            val muted = !_uiState.value.muted
            _uiState.update { it.copy(muted = muted) }
            client.setMute(muted)
        } else {
            client.send(action)
        }
    }

    fun startRepeating(action: RemoteAction) {
        if (!_uiState.value.connected || repeatJobs[action]?.isActive == true) return
        repeatJobs[action] = viewModelScope.launch(Dispatchers.IO) {
            send(action)
            delay(275)
            while (true) {
                send(action)
                delay(90)
            }
        }
    }

    fun stopRepeating(action: RemoteAction) {
        repeatJobs.remove(action)?.cancel()
    }

    private fun stopAllRepeating() {
        repeatJobs.values.forEach(Job::cancel)
        repeatJobs.clear()
    }

    fun setControlSurface(surface: ControlSurface) {
        _uiState.update { it.copy(controlSurface = surface) }
    }

    fun movePointer(dx: Int, dy: Int) = client.move(dx, dy)
    fun clickPointer() = client.click()
    fun scrollPointer(delta: Int) = client.scroll(delta)
    fun launchApp(app: TvApp) = client.launchApp(app.id)
    fun switchInput(input: TvInput) = client.switchInput(input.id)
    fun sendText(text: String) = client.insertText(text)
    fun deleteText() = client.deleteText()
    fun sendNumber(number: Int) = client.sendNumber(number)
    fun sendColor(color: String) = client.sendColor(color)
    fun refresh() = client.refreshDeviceData()

    fun wake(device: TvDevice? = _uiState.value.currentDevice, macOverride: String? = null) {
        val mac = macOverride?.trim()?.takeIf(String::isNotBlank) ?: device?.mac
        if (mac == null) {
            _uiState.update { it.copy(statusText = "Adicione o endereço MAC da TV nas configurações para ligá-la.") }
            return
        }
        viewModelScope.launch(Dispatchers.IO) {
            val sent = WakeOnLan.send(getApplication(), mac)
            _uiState.update {
                it.copy(
                    connectionState = if (sent) ConnectionState.Reconnecting else ConnectionState.Error,
                    statusText = if (sent) "Sinal para ligar enviado. Reconectando…" else "MAC inválido. Use AA:BB:CC:DD:EE:FF"
                )
            }
            if (sent) {
                delay(1_400)
                device?.let { connect(it, userInitiated = false) }
            }
        }
    }

    fun selectPreset(id: RemotePresetId) = updateSettings { it.copy(selectedPresetId = id) }

    fun copyPresetToCustom(source: RemotePresetId, destination: RemotePresetId) {
        if (!destination.isCustom) return
        val sourcePreset = _uiState.value.presets[source] ?: RemotePreset.defaultFor(source)
        val copied = sourcePreset.copy(id = destination, name = destination.title)
        savePreset(copied)
        _uiState.update { it.copy(selectedPresetId = destination, showPresetEditor = true) }
        preferences.saveSettings(_uiState.value)
    }

    fun toggleModule(module: RemoteModule) {
        val state = _uiState.value
        val preset = state.selectedPreset
        if (!preset.id.isCustom) return
        val modules = if (module in preset.modules) {
            preset.modules - module
        } else {
            preset.modules + module
        }
        savePreset(preset.copy(modules = modules.ifEmpty { listOf(RemoteModule.DPad) }))
    }

    fun moveModule(module: RemoteModule, direction: Int) {
        val state = _uiState.value
        val preset = state.selectedPreset
        if (!preset.id.isCustom) return
        val modules = preset.modules.toMutableList()
        val index = modules.indexOf(module)
        if (index < 0) return
        val destination = (index + direction).coerceIn(modules.indices)
        if (destination == index) return
        modules.removeAt(index)
        modules.add(destination, module)
        savePreset(preset.copy(modules = modules))
    }

    fun renamePreset(name: String) {
        val preset = _uiState.value.selectedPreset
        if (!preset.id.isCustom) return
        savePreset(preset.copy(name = name.trim().take(32).ifBlank { preset.id.title }))
    }

    fun resetPreset(id: RemotePresetId = _uiState.value.selectedPresetId) {
        val reset = RemotePreset.defaultFor(id)
        savePreset(reset)
    }

    private fun savePreset(preset: RemotePreset) {
        preferences.savePreset(preset)
        _uiState.update { it.copy(presets = it.presets + (preset.id to preset)) }
    }

    fun setTheme(mode: ThemeMode) = updateSettings { it.copy(themeMode = mode) }
    fun setAccent(accent: AccentTheme) = updateSettings { it.copy(accentTheme = accent) }
    fun setHaptics(enabled: Boolean) = updateSettings { it.copy(hapticsEnabled = enabled) }
    fun setSound(enabled: Boolean) = updateSettings { it.copy(soundEnabled = enabled) }
    fun setCompactMode(enabled: Boolean) = updateSettings { it.copy(compactMode = enabled) }
    fun setShowLabels(enabled: Boolean) = updateSettings { it.copy(showLabels = enabled) }
    fun setAutoConnect(enabled: Boolean) = updateSettings { it.copy(autoConnect = enabled) }

    private fun updateSettings(transform: (RemoteUiState) -> RemoteUiState) {
        _uiState.update(transform)
        preferences.saveSettings(_uiState.value)
    }

    fun completeOnboarding() = updateSettings { it.copy(onboardingComplete = true) }
    fun openSettings() { _uiState.update { it.copy(showSettingsSheet = true) } }
    fun closeSettings() { _uiState.update { it.copy(showSettingsSheet = false) } }
    fun openApps() { _uiState.update { it.copy(showAppsSheet = true) } }
    fun closeApps() { _uiState.update { it.copy(showAppsSheet = false) } }
    fun openInputs() { _uiState.update { it.copy(showInputsSheet = true) } }
    fun closeInputs() { _uiState.update { it.copy(showInputsSheet = false) } }
    fun openMore() { _uiState.update { it.copy(showMoreSheet = true) } }
    fun closeMore() { _uiState.update { it.copy(showMoreSheet = false) } }
    fun openPresetEditor() { _uiState.update { it.copy(showPresetEditor = true) } }
    fun closePresetEditor() { _uiState.update { it.copy(showPresetEditor = false) } }
    fun dismissDevicePicker() { _uiState.update { it.copy(showDevicePicker = false) } }

    fun runDiagnostics() {
        _uiState.update { it.copy(diagnostic = it.diagnostic.copy(summary = "Verificando a rede…")) }
        viewModelScope.launch(Dispatchers.IO) {
            val result = TvDiscovery.diagnose(getApplication(), _uiState.value.currentDevice)
            _uiState.update { it.copy(diagnostic = result) }
        }
    }

    override fun onConnectionState(state: ConnectionState, message: String, reconnectAttempt: Int) {
        _uiState.update {
            it.copy(
                connectionState = state,
                statusText = message,
                reconnectAttempt = reconnectAttempt,
                lastError = message.takeIf { state == ConnectionState.Error }
            )
        }
        if (state == ConnectionState.Connected) {
            val current = _uiState.value.currentDevice ?: return
            val refreshed = current.copy(
                capabilities = _uiState.value.capabilities,
                lastSeenAt = System.currentTimeMillis()
            )
            val saved = preferences.saveDevice(refreshed)
            _uiState.update {
                it.copy(
                    currentDevice = refreshed,
                    savedDevices = saved,
                    onboardingComplete = true,
                    showConnectSheet = false
                )
            }
            preferences.saveSettings(_uiState.value)
        }
    }

    override fun onApps(apps: List<TvApp>) {
        _uiState.update { it.copy(apps = apps) }
    }

    override fun onInputs(inputs: List<TvInput>) {
        _uiState.update { it.copy(inputs = inputs) }
    }

    override fun onVolume(volume: Int?, muted: Boolean) {
        _uiState.update { it.copy(volume = volume ?: it.volume, muted = muted) }
    }

    override fun onCapabilities(capabilities: Set<TvCapability>) {
        _uiState.update { state ->
            val updatedDevice = state.currentDevice?.copy(capabilities = capabilities)
            state.copy(capabilities = capabilities, currentDevice = updatedDevice)
        }
    }

    override fun onCleared() {
        stopAllRepeating()
        client.close()
        super.onCleared()
    }

    private fun normalizeLocalAddress(raw: String): String? {
        val value = raw.trim()
            .removePrefix("http://")
            .removePrefix("https://")
            .substringBefore('/')
            .substringBefore(':')
        if (value.equals("lgwebostv", ignoreCase = true)) return value
        val numbers = value.split('.').mapNotNull { part -> part.toIntOrNull()?.takeIf { it in 0..255 } }
        if (numbers.size != 4) return null
        val local = numbers[0] == 10 ||
            (numbers[0] == 192 && numbers[1] == 168) ||
            (numbers[0] == 172 && numbers[1] in 16..31) ||
            (numbers[0] == 169 && numbers[1] == 254)
        return value.takeIf { local }
    }
}
