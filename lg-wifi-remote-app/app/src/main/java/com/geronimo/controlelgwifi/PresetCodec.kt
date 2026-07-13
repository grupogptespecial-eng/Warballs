package com.geronimo.controlelgwifi

import org.json.JSONArray
import org.json.JSONObject

/** Portable, versioned representation of one custom remote layout. */
object PresetCodec {
    private const val SCHEMA_VERSION = 1
    private const val MAX_INPUT_LENGTH = 64 * 1024

    fun encode(preset: RemotePreset): String = JSONObject()
        .put("format", "libre-remote-preset")
        .put("schemaVersion", SCHEMA_VERSION)
        .put("name", preset.name.take(32))
        .put("showLabels", preset.showLabels)
        .put("compact", preset.compact)
        .put("modules", JSONArray().apply { preset.modules.forEach { put(it.name) } })
        .toString(2)

    fun decode(raw: String, destination: RemotePresetId): Result<RemotePreset> = runCatching {
        require(destination.isCustom) { "O destino precisa ser um layout personalizado" }
        require(raw.length in 1..MAX_INPUT_LENGTH) { "Arquivo de layout inválido" }
        val json = JSONObject(raw)
        require(json.optString("format") == "libre-remote-preset") { "Formato de layout desconhecido" }
        require(json.optInt("schemaVersion", -1) == SCHEMA_VERSION) { "Versão de layout incompatível" }
        val modulesJson = json.optJSONArray("modules") ?: error("Layout sem controles")
        val modules = buildList {
            for (index in 0 until modulesJson.length()) {
                val module = runCatching { RemoteModule.valueOf(modulesJson.getString(index)) }.getOrNull()
                if (module != null && module !in this) add(module)
            }
        }
        require(modules.isNotEmpty()) { "Layout sem controles válidos" }
        RemotePreset(
            id = destination,
            name = json.optString("name", destination.title).trim().take(32).ifBlank { destination.title },
            modules = modules.take(RemoteModule.entries.size),
            showLabels = json.optBoolean("showLabels", true),
            compact = json.optBoolean("compact", false)
        )
    }
}
