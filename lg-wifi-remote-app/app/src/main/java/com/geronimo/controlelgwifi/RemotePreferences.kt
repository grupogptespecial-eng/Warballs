package com.geronimo.controlelgwifi

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

class RemotePreferences(context: Context) {
    private val appContext = context.applicationContext
    private val prefs = appContext.getSharedPreferences("libre_remote_product", Context.MODE_PRIVATE)
    private val legacyPrefs = appContext.getSharedPreferences("libre_remote_ui", Context.MODE_PRIVATE)

    fun loadState(): RemoteUiState {
        val devices = loadDevices()
        val presetMap = RemotePresetId.entries.associateWith { loadPreset(it) }
        val selectedPreset = enumValueOrDefault(
            prefs.getString("selected_preset", null),
            RemotePresetId.Normal
        )
        val currentStableId = prefs.getString("current_device_id", null)
        val legacyCurrentIp = prefs.getString("current_tv_ip", null)
        val current = devices.firstOrNull { it.stableId == currentStableId }
            ?: devices.firstOrNull { it.ip == legacyCurrentIp }
        return RemoteUiState(
            savedDevices = devices,
            currentDevice = current,
            capabilities = current?.capabilities.orEmpty(),
            hapticsEnabled = prefs.getBoolean("haptics", true),
            soundEnabled = prefs.getBoolean("sound", false),
            compactMode = prefs.getBoolean("compact", false),
            showLabels = prefs.getBoolean("show_labels", true),
            autoConnect = prefs.getBoolean("auto_connect", true),
            experimentalBackendsEnabled = prefs.getBoolean("experimental_backends", true),
            themeMode = enumValueOrDefault(prefs.getString("theme", null), ThemeMode.System),
            accentTheme = enumValueOrDefault(prefs.getString("accent", null), AccentTheme.Ocean),
            selectedPresetId = selectedPreset,
            presets = presetMap,
            onboardingComplete = prefs.getBoolean("onboarding_complete", false)
        )
    }

    fun saveDevice(device: TvDevice): List<TvDevice> {
        val normalized = device.copy(lastSeenAt = System.currentTimeMillis())
        val updated = (loadDevices().filterNot { it.stableId == normalized.stableId } + normalized)
            .sortedByDescending { it.lastSeenAt }
            .take(20)
        prefs.edit()
            .putString("devices", devicesToJson(updated).toString())
            .putString("current_device_id", normalized.stableId)
            .putString("current_tv_ip", normalized.ip)
            .apply()
        return updated
    }

    fun updateDevice(device: TvDevice): List<TvDevice> = saveDevice(device)

    fun removeDevice(stableId: String): List<TvDevice> {
        val removed = loadDevices().firstOrNull { it.stableId == stableId }
        val updated = loadDevices().filterNot { it.stableId == stableId }
        val editor = prefs.edit().putString("devices", devicesToJson(updated).toString())
        if (prefs.getString("current_device_id", null) == stableId) {
            editor.remove("current_device_id").remove("current_tv_ip")
        } else if (removed != null && prefs.getString("current_tv_ip", null) == removed.ip) {
            editor.remove("current_tv_ip")
        }
        editor.apply()
        return updated
    }

    fun selectDevice(stableId: String?) {
        prefs.edit().apply {
            if (stableId == null) remove("current_device_id") else putString("current_device_id", stableId)
        }.apply()
    }

    fun saveSettings(state: RemoteUiState) {
        prefs.edit()
            .putBoolean("haptics", state.hapticsEnabled)
            .putBoolean("sound", state.soundEnabled)
            .putBoolean("compact", state.compactMode)
            .putBoolean("show_labels", state.showLabels)
            .putBoolean("auto_connect", state.autoConnect)
            .putBoolean("experimental_backends", state.experimentalBackendsEnabled)
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
                    val platform = enumValueOrDefault(
                        item.optString("platform").takeIf(String::isNotBlank),
                        TvPlatform.LgWebOs
                    )
                    val avTransportUrl = item.optString("avTransportUrl").takeIf(String::isNotBlank)
                    val renderingControlUrl = item.optString("renderingControlUrl").takeIf(String::isNotBlank)
                    val capabilities = buildSet {
                        val values = item.optJSONArray("capabilities") ?: JSONArray()
                        for (i in 0 until values.length()) {
                            runCatching { add(TvCapability.valueOf(values.optString(i))) }
                        }
                    }.ifEmpty {
                        platform.defaultCapabilities(
                            hasAvTransport = avTransportUrl != null,
                            hasRenderingControl = renderingControlUrl != null
                        )
                    }
                    val support = enumValueOrDefault(
                        item.optString("supportLevel").takeIf(String::isNotBlank),
                        platform.defaultSupportLevel
                    )
                    val stableId = item.optString("stableId")
                        .takeIf(String::isNotBlank)
                        ?: "${platform.name}:$ip"
                    add(
                        TvDevice(
                            ip = ip,
                            name = item.optString("name", defaultName(platform)),
                            model = item.optString("model").takeIf(String::isNotBlank),
                            manufacturer = item.optString("manufacturer").takeIf(String::isNotBlank),
                            room = item.optString("room"),
                            mac = item.optString("mac").takeIf(String::isNotBlank),
                            platform = platform,
                            supportLevel = support,
                            stableId = stableId,
                            descriptionUrl = item.optString("descriptionUrl").takeIf(String::isNotBlank),
                            avTransportUrl = avTransportUrl,
                            renderingControlUrl = renderingControlUrl,
                            lastSeenAt = item.optLong("lastSeenAt", 0L),
                            capabilities = capabilities
                        )
                    )
                }
            }.distinctBy(TvDevice::stableId)
        }.getOrDefault(emptyList())
    }

    private fun migrateLegacyDevice(): List<TvDevice> {
        val legacyIp = prefs.getString("last_ip", null)
            ?: legacyPrefs.getString("last_ip", null)
        val legacyName = legacyPrefs.getString("last_name", "LG webOS TV") ?: "LG webOS TV"
        val migrated = legacyIp?.takeIf(String::isNotBlank)?.let {
            listOf(
                TvDevice(
                    ip = it,
                    name = legacyName,
                    manufacturer = "LG Electronics",
                    platform = TvPlatform.LgWebOs,
                    supportLevel = TvSupportLevel.StableFull,
                    stableId = "${TvPlatform.LgWebOs.name}:$it",
                    capabilities = TvCapability.lgDefaults
                )
            )
        } ?: emptyList()
        if (migrated.isNotEmpty()) {
            prefs.edit()
                .putString("devices", devicesToJson(migrated).toString())
                .putString("current_device_id", migrated.first().stableId)
                .putString("current_tv_ip", migrated.first().ip)
                .apply()
        }
        return migrated
    }

    private fun devicesToJson(devices: List<TvDevice>): JSONArray = JSONArray().apply {
        devices.forEach { device ->
            put(
                JSONObject()
                    .put("ip", device.ip)
                    .put("stableId", device.stableId)
                    .put("name", device.name)
                    .put("model", device.model ?: "")
                    .put("manufacturer", device.manufacturer ?: "")
                    .put("room", device.room)
                    .put("mac", device.mac ?: "")
                    .put("platform", device.platform.name)
                    .put("supportLevel", device.supportLevel.name)
                    .put("descriptionUrl", device.descriptionUrl ?: "")
                    .put("avTransportUrl", device.avTransportUrl ?: "")
                    .put("renderingControlUrl", device.renderingControlUrl ?: "")
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

    private fun defaultName(platform: TvPlatform): String = when (platform) {
        TvPlatform.LgWebOs -> "LG webOS TV"
        TvPlatform.SamsungTizenLocal -> "Samsung Smart TV"
        TvPlatform.DlnaMedia -> "TV DLNA"
        else -> "Smart TV"
    }

    private inline fun <reified T : Enum<T>> enumValueOrDefault(raw: String?, fallback: T): T =
        raw?.let { value -> enumValues<T>().firstOrNull { it.name == value } } ?: fallback
}
