package com.geronimo.controlelgwifi

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import org.json.JSONArray
import org.json.JSONObject

@Entity(
    tableName = "saved_devices",
    indices = [Index(value = ["stableId"], unique = true), Index(value = ["lastKnownIp"])]
)
data class SavedDeviceEntity(
    @PrimaryKey val stableId: String,
    val displayName: String,
    val roomName: String,
    val platform: String,
    val supportLevel: String,
    val lastKnownIp: String,
    val manufacturer: String,
    val modelName: String,
    val udn: String,
    val usn: String,
    val location: String,
    val macAddress: String,
    val serviceUrlsJson: String,
    val capabilitiesJson: String,
    val isDefault: Boolean,
    val lastSeenAtMillis: Long,
    val lastConnectedAtMillis: Long
)

@Entity(tableName = "remote_macros", indices = [Index("deviceId")])
data class RemoteMacroEntity(
    @PrimaryKey val id: String,
    val name: String,
    val deviceId: String,
    val stepsJson: String,
    val requiresConfirmation: Boolean,
    val createdAtMillis: Long,
    val updatedAtMillis: Long
)

@Entity(tableName = "custom_layouts", indices = [Index("deviceId")])
data class CustomLayoutEntity(
    @PrimaryKey val id: String,
    val name: String,
    val presetId: String,
    val deviceId: String,
    val modulesJson: String,
    val createdAtMillis: Long,
    val updatedAtMillis: Long
)

@Entity(tableName = "diagnostic_events", indices = [Index("deviceId"), Index("createdAtMillis")])
data class DiagnosticEventEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val deviceId: String,
    val command: String,
    val backend: String,
    val success: Boolean,
    val error: String,
    val latencyMillis: Long,
    val queueDelayMillis: Long,
    val createdAtMillis: Long
)

data class RemoteMacro(
    val id: String,
    val name: String,
    val deviceId: String,
    val steps: List<MacroStep>,
    val requiresConfirmation: Boolean = false,
    val createdAtMillis: Long = System.currentTimeMillis(),
    val updatedAtMillis: Long = System.currentTimeMillis()
)

sealed interface MacroStep {
    data class Command(val command: UniversalRemoteCommand) : MacroStep
    data class Delay(val milliseconds: Long) : MacroStep
    data class WaitForConnection(val timeoutMillis: Long) : MacroStep
}

data class MacroValidation(
    val valid: Boolean,
    val reason: String = ""
)

object MacroSafety {
    const val MAX_STEPS = 40
    const val MAX_TOTAL_DELAY_MILLIS = 60_000L
    const val MAX_SINGLE_DELAY_MILLIS = 15_000L

    fun validate(macro: RemoteMacro): MacroValidation {
        if (macro.name.isBlank()) return MacroValidation(false, "A macro precisa de um nome.")
        if (macro.steps.isEmpty()) return MacroValidation(false, "A macro não possui ações.")
        if (macro.steps.size > MAX_STEPS) return MacroValidation(false, "A macro excede $MAX_STEPS etapas.")
        var totalDelay = 0L
        macro.steps.forEach { step ->
            when (step) {
                is MacroStep.Delay -> {
                    if (step.milliseconds !in 0..MAX_SINGLE_DELAY_MILLIS) {
                        return MacroValidation(false, "Um intervalo está fora do limite.")
                    }
                    totalDelay += step.milliseconds
                }
                is MacroStep.WaitForConnection -> {
                    if (step.timeoutMillis !in 100..MAX_SINGLE_DELAY_MILLIS) {
                        return MacroValidation(false, "O tempo de conexão está fora do limite.")
                    }
                    totalDelay += step.timeoutMillis
                }
                is MacroStep.Command -> Unit
            }
        }
        if (totalDelay > MAX_TOTAL_DELAY_MILLIS) {
            return MacroValidation(false, "A macro excede um minuto de espera.")
        }
        return MacroValidation(true)
    }
}

object CapabilityCodec {
    fun encode(capabilities: Set<TvCapability>): String = JSONArray(capabilities.map(TvCapability::name)).toString()

    fun decode(raw: String): Set<TvCapability> = runCatching {
        val array = JSONArray(raw)
        buildSet {
            for (index in 0 until array.length()) {
                runCatching { TvCapability.valueOf(array.getString(index)) }.getOrNull()?.let(::add)
            }
        }
    }.getOrDefault(emptySet())
}

object ServiceUrlsCodec {
    fun encode(value: TvServiceUrls): String = JSONObject().apply {
        put("avTransport", value.avTransportControlUrl)
        put("renderingControl", value.renderingControlUrl)
    }.toString()

    fun decode(raw: String): TvServiceUrls = runCatching {
        val json = JSONObject(raw)
        TvServiceUrls(
            avTransportControlUrl = json.optString("avTransport"),
            renderingControlUrl = json.optString("renderingControl")
        )
    }.getOrDefault(TvServiceUrls())
}

object MacroCodec {
    fun encode(macro: RemoteMacro): String = JSONArray().apply {
        macro.steps.forEach { step ->
            put(JSONObject().apply {
                when (step) {
                    is MacroStep.Command -> {
                        put("type", "command")
                        put("command", step.command.name)
                    }
                    is MacroStep.Delay -> {
                        put("type", "delay")
                        put("milliseconds", step.milliseconds)
                    }
                    is MacroStep.WaitForConnection -> {
                        put("type", "wait_connection")
                        put("milliseconds", step.timeoutMillis)
                    }
                }
            })
        }
    }.toString()

    fun decode(entity: RemoteMacroEntity): RemoteMacro = RemoteMacro(
        id = entity.id,
        name = entity.name,
        deviceId = entity.deviceId,
        steps = decodeSteps(entity.stepsJson),
        requiresConfirmation = entity.requiresConfirmation,
        createdAtMillis = entity.createdAtMillis,
        updatedAtMillis = entity.updatedAtMillis
    )

    fun decode(raw: String): RemoteMacro? = runCatching {
        val json = JSONObject(raw)
        RemoteMacro(
            id = json.getString("id"),
            name = json.getString("name"),
            deviceId = json.optString("deviceId"),
            steps = decodeSteps(json.getJSONArray("steps").toString()),
            requiresConfirmation = json.optBoolean("requiresConfirmation"),
            createdAtMillis = json.optLong("createdAtMillis", System.currentTimeMillis()),
            updatedAtMillis = json.optLong("updatedAtMillis", System.currentTimeMillis())
        )
    }.getOrNull()

    fun encodePortable(macro: RemoteMacro): String = JSONObject().apply {
        put("id", macro.id)
        put("name", macro.name)
        put("deviceId", macro.deviceId)
        put("steps", JSONArray(encode(macro)))
        put("requiresConfirmation", macro.requiresConfirmation)
        put("createdAtMillis", macro.createdAtMillis)
        put("updatedAtMillis", macro.updatedAtMillis)
    }.toString(2)

    private fun decodeSteps(raw: String): List<MacroStep> = runCatching {
        val array = JSONArray(raw)
        buildList {
            for (index in 0 until array.length()) {
                val json = array.getJSONObject(index)
                when (json.optString("type")) {
                    "command" -> runCatching {
                        UniversalRemoteCommand.valueOf(json.getString("command"))
                    }.getOrNull()?.let { add(MacroStep.Command(it)) }
                    "delay" -> add(MacroStep.Delay(json.optLong("milliseconds")))
                    "wait_connection" -> add(MacroStep.WaitForConnection(json.optLong("milliseconds")))
                }
            }
        }
    }.getOrDefault(emptyList())
}

fun SavedDeviceEntity.toDevice(): TvDevice = TvDevice(
    name = displayName,
    ipAddress = lastKnownIp,
    platform = runCatching { TvPlatform.valueOf(platform) }.getOrDefault(TvPlatform.UNKNOWN),
    supportLevel = runCatching { TvSupportLevel.valueOf(supportLevel) }.getOrDefault(TvSupportLevel.UNSUPPORTED),
    manufacturer = manufacturer,
    modelName = modelName,
    udn = udn,
    usn = usn,
    location = location,
    macAddress = macAddress,
    serviceUrls = ServiceUrlsCodec.decode(serviceUrlsJson)
)

fun TvDevice.toSavedEntity(
    roomName: String = "",
    isDefault: Boolean = false,
    lastSeenAtMillis: Long = System.currentTimeMillis(),
    lastConnectedAtMillis: Long = 0L
): SavedDeviceEntity = SavedDeviceEntity(
    stableId = stableId(),
    displayName = displayName,
    roomName = roomName,
    platform = platform.name,
    supportLevel = supportLevel.name,
    lastKnownIp = ipAddress,
    manufacturer = manufacturer,
    modelName = modelName,
    udn = udn,
    usn = usn,
    location = location,
    macAddress = macAddress,
    serviceUrlsJson = ServiceUrlsCodec.encode(serviceUrls),
    capabilitiesJson = CapabilityCodec.encode(capabilitiesForPlatform(platform, serviceUrls).values),
    isDefault = isDefault,
    lastSeenAtMillis = lastSeenAtMillis,
    lastConnectedAtMillis = lastConnectedAtMillis
)
