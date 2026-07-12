package com.geronimo.controlelgwifi

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

class RemotePreferences(context: Context) {
    private val prefs = context.getSharedPreferences("libre_remote_product", Context.MODE_PRIVATE)

    fun loadState(): RemoteUiState {
        val devices = loadDevices()
        val presetMap = RemotePresetId.entries.associateWith { loadPreset(it) }
        val selectedPreset = enumValueOrDefault(
            prefs.getString("selected_preset", null),
            RemotePresetId.Normal
        )
        return RemoteUiState(
            savedDevices = devices,
            currentDevice = devices.firstOrNull { it.ip == prefs.getString("current_tv_ip", null) },
            hapticsEnabled = prefs.getBoolean("haptics", true),
            soundEnabled = prefs.getBoolean("sound", false),
            compactMode = prefs.getBoolean("compact", false),
            showLabels = prefs.getBoolean("show_labels", true),
            autoConnect = prefs.getBoolean("auto_connect", true),
            themeMode = enumValueOrDefault(prefs.getString("theme", null), ThemeMode.System),
            accentTheme = enumValueOrDefault(prefs.getString("accent", null), AccentTheme.Ocean),
            selectedPresetId = selectedPreset,
            presets = presetMap,
            onboardingComplete = prefs.getBoolean("onboarding_complete", false)
        )
    }

    fun saveDevice(device: TvDevice): List<TvDevice> {
        val updated = (loadDevices().filterNot { it.ip == device.ip } + device.copy(lastSeenAt = System.currentTimeMillis()))
            .sortedByDescending { it.lastSeenAt }
            .take(12)
        prefs.edit()
            .putString("devices", devicesToJson(updated).toString())
            .putString("current_tv_ip", device.ip)
            .apply()
        return updated
    }

    fun updateDevice(device: TvDevice): List<TvDevice> = saveDevice(device)

    fun removeDevice(ip: String): List<TvDevice> {
        val updated = loadDevices().filterNot { it.ip == ip }
        val editor = prefs.edit().putString("devices", devicesToJson(updated).toString())
        if (prefs.getString("current_tv_ip", null) == ip) editor.remove("current_tv_ip")
        editor.apply()
        return updated
    }

    fun selectDevice(ip: String?) {
        prefs.edit().apply {
            if (ip == null) remove("current_tv_ip") else putString("current_tv_ip", ip)
        }.apply()
    }

    fun saveSettings(state: RemoteUiState) {
        prefs.edit()
            .putBoolean("haptics", state.hapticsEnabled)
            .putBoolean("sound", state.soundEnabled)
            .putBoolean("compact", state.compactMode)
            .putBoolean("show_labels", state.showLabels)
            .putBoolean("auto_connect", state.autoConnect)
            .putString("theme", state.themeMode.name)
            .putString("accent", state.accentTheme.name)
            .putString("selected_preset", state.selectedPresetId.name)
            .putBoolean("onboarding_complete", state.onboardingComplete)
            .apply()
    }

    fun savePreset(preset: RemotePreset) {
        val json = JSONObject()
            .put("name", preset.name)
            .put("modules", JSONArray().apply { preset.modules.forEach { put(it.name) } })
            .put("showLabels", preset.showLabels)
            .put("compact", preset.compact)
        prefs.edit().putString("preset_${preset.id.name}", json.toString()).apply()
    }

    fun resetAll() {
        prefs.edit().clear().apply()
    }

    private fun loadDevices(): List<TvDevice> {
        val raw = prefs.getString("devices", null) ?: return migrateLegacyDevice()
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (index in 0 until array.length()) {
                    val item = array.optJSONObject(index) ?: continue
                    val ip = item.optString("ip")
                    if (ip.isBlank()) continue
                    val capabilities = buildSet {
                        val values = item.optJSONArray("capabilities") ?: JSONArray()
                        for (i in 0 until values.length()) {
                            runCatching { add(TvCapability.valueOf(values.optString(i))) }
                        }
                    }.ifEmpty { TvCapability.lgDefaults }
                    add(
                        TvDevice(
                            ip = ip,
                            name = item.optString("name", "LG webOS TV"),
                            model = item.optString("model").takeIf(String::isNotBlank),
                            room = item.optString("room"),
                            mac = item.optString("mac").takeIf(String::isNotBlank),
                            lastSeenAt = item.optLong("lastSeenAt", 0L),
                            capabilities = capabilities
                        )
                    )
                }
            }
        }.getOrDefault(emptyList())
    }

    private fun migrateLegacyDevice(): List<TvDevice> {
        val legacy = prefs.getString("last_ip", null)
            ?: runCatching {
                val old = prefs.contextFallback()
                old.getString("last_ip", null)
            }.getOrNull()
        return legacy?.takeIf(String::isNotBlank)?.let { listOf(TvDevice(ip = it)) } ?: emptyList()
    }

    private fun android.content.SharedPreferences.contextFallback(): android.content.SharedPreferences = this

    private fun devicesToJson(devices: List<TvDevice>): JSONArray = JSONArray().apply {
        devices.forEach { device ->
            put(
                JSONObject()
                    .put("ip", device.ip)
                    .put("name", device.name)
                    .put("model", device.model ?: "")
                    .put("room", device.room)
                    .put("mac", device.mac ?: "")
                    .put("lastSeenAt", device.lastSeenAt)
                    .put("capabilities", JSONArray().apply { device.capabilities.forEach { put(it.name) } })
            )
        }
    }

    private fun loadPreset(id: RemotePresetId): RemotePreset {
        val fallback = RemotePreset.defaultFor(id)
        val raw = prefs.getString("preset_${id.name}", null) ?: return fallback
        return runCatching {
            val json = JSONObject(raw)
            val modulesJson = json.optJSONArray("modules") ?: JSONArray()
            val modules = buildList {
                for (index in 0 until modulesJson.length()) {
                    runCatching { add(RemoteModule.valueOf(modulesJson.optString(index))) }
                }
            }.distinct().ifEmpty { fallback.modules }
            RemotePreset(
                id = id,
                name = json.optString("name", fallback.name),
                modules = modules,
                showLabels = json.optBoolean("showLabels", fallback.showLabels),
                compact = json.optBoolean("compact", fallback.compact)
            )
        }.getOrDefault(fallback)
    }

    private inline fun <reified T : Enum<T>> enumValueOrDefault(raw: String?, fallback: T): T =
        raw?.let { value -> enumValues<T>().firstOrNull { it.name == value } } ?: fallback
}
