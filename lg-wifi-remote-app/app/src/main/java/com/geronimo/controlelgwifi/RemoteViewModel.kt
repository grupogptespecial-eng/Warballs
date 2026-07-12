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

class RemoteViewModel(application: Application) : AndroidViewModel(application), LgWebOsClient.Listener {
    private val preferences = application.getSharedPreferences("libre_remote_ui", 0)
    private val client = LgWebOsClient(application, this)
    private val repeatJobs = mutableMapOf<RemoteAction, Job>()

    private val _uiState = MutableStateFlow(
        RemoteUiState(
            hapticsEnabled = preferences.getBoolean("haptics", true),
            compactMode = preferences.getBoolean("compact", false)
        )
    )
    val uiState: StateFlow<RemoteUiState> = _uiState.asStateFlow()

    val savedIp: String
        get() = preferences.getString("last_ip", "") ?: ""

    val savedMac: String
        get() = preferences.getString("last_mac", "") ?: ""

    init {
        val ip = savedIp
        if (ip.isNotBlank()) {
            connect(TvDevice(ip = ip, name = preferences.getString("last_name", "LG webOS TV") ?: "LG webOS TV"))
        }
    }

    fun discover() {
        _uiState.update {
            it.copy(
                connectionState = ConnectionState.Discovering,
                statusText = "Procurando TVs LG na rede…",
                discoveredDevices = emptyList(),
                showDevicePicker = false,
                lastError = null
            )
        }
        viewModelScope.launch(Dispatchers.IO) {
            val devices = TvDiscovery.discover(getApplication())
            _uiState.update { state ->
                when {
                    devices.isEmpty() -> state.copy(
                        connectionState = ConnectionState.Idle,
                        statusText = "Nenhuma TV encontrada. Você ainda pode informar o IP manualmente.",
                        discoveredDevices = emptyList()
                    )
                    devices.size == 1 -> state.copy(
                        discoveredDevices = devices,
                        showDevicePicker = false
                    )
                    else -> state.copy(
                        connectionState = ConnectionState.Idle,
                        statusText = "${devices.size} TVs encontradas",
                        discoveredDevices = devices,
                        showDevicePicker = true
                    )
                }
            }
            if (devices.size == 1) connect(devices.first())
        }
    }

    fun connectManual(ipText: String) {
        val ip = normalizeLocalAddress(ipText)
        if (ip == null) {
            _uiState.update { it.copy(connectionState = ConnectionState.Error, statusText = "Informe um IP local válido, como 192.168.1.20") }
            return
        }
        connect(TvDevice(ip = ip))
    }

    fun connect(device: TvDevice) {
        preferences.edit()
            .putString("last_ip", device.ip)
            .putString("last_name", device.name)
            .apply()
        _uiState.update {
            it.copy(
                currentDevice = device,
                showDevicePicker = false,
                connectionState = ConnectionState.Connecting,
                statusText = "Conectando a ${device.name}…",
                lastError = null
            )
        }
        client.connect(device)
    }

    fun reconnect() {
        _uiState.value.currentDevice?.let(client::connect) ?: savedIp.takeIf { it.isNotBlank() }?.let(::connectManual)
    }

    fun disconnect() {
        stopAllRepeating()
        client.close()
        _uiState.update { it.copy(connectionState = ConnectionState.Idle, statusText = "Desconectado") }
    }

    fun forgetCurrentDevice() {
        val device = _uiState.value.currentDevice ?: return
        client.forgetDevice(device.ip)
        preferences.edit().remove("last_ip").remove("last_name").apply()
        disconnect()
        _uiState.update { RemoteUiState(hapticsEnabled = it.hapticsEnabled, compactMode = it.compactMode) }
    }

    fun send(action: RemoteAction) = client.send(action)

    fun startRepeating(action: RemoteAction) {
        if (repeatJobs[action]?.isActive == true) return
        repeatJobs[action] = viewModelScope.launch(Dispatchers.IO) {
            client.send(action)
            delay(320)
            while (true) {
                client.send(action)
                delay(92)
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

    fun wake(mac: String) {
        preferences.edit().putString("last_mac", mac).apply()
        viewModelScope.launch(Dispatchers.IO) {
            val sent = WakeOnLan.send(getApplication(), mac)
            _uiState.update {
                it.copy(statusText = if (sent) "Sinal para ligar enviado. Aguarde alguns segundos." else "MAC inválido. Use AA:BB:CC:DD:EE:FF")
            }
        }
    }

    fun setHaptics(enabled: Boolean) {
        preferences.edit().putBoolean("haptics", enabled).apply()
        _uiState.update { it.copy(hapticsEnabled = enabled) }
    }

    fun setCompactMode(enabled: Boolean) {
        preferences.edit().putBoolean("compact", enabled).apply()
        _uiState.update { it.copy(compactMode = enabled) }
    }

    fun dismissDevicePicker() {
        _uiState.update { it.copy(showDevicePicker = false) }
    }

    override fun onConnectionState(state: ConnectionState, message: String) {
        _uiState.update {
            it.copy(
                connectionState = state,
                statusText = message,
                lastError = message.takeIf { state == ConnectionState.Error }
            )
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
        val numbers = value.split('.').mapNotNull { it.toIntOrNull()?.takeIf { number -> number in 0..255 } }
        if (numbers.size != 4) return null
        val local = numbers[0] == 10 ||
            (numbers[0] == 192 && numbers[1] == 168) ||
            (numbers[0] == 172 && numbers[1] in 16..31) ||
            (numbers[0] == 169 && numbers[1] == 254)
        return value.takeIf { local }
    }
}
