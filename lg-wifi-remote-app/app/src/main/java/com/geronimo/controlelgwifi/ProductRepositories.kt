package com.geronimo.controlelgwifi

import java.util.UUID
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class DeviceRepository(
    private val database: ProductDatabase,
    private val preferences: RemotePreferences
) {
    val devices: Flow<List<TvDevice>> = database.savedDeviceDao().observeAll().map { list -> list.map(SavedDeviceEntity::toDevice) }

    suspend fun save(device: TvDevice, roomName: String = "", connected: Boolean = false) {
        val existing = database.savedDeviceDao().find(device.stableId())
        val now = System.currentTimeMillis()
        database.savedDeviceDao().upsert(
            device.toSavedEntity(
                roomName = roomName.ifBlank { existing?.roomName.orEmpty() },
                isDefault = existing?.isDefault ?: false,
                lastSeenAtMillis = now,
                lastConnectedAtMillis = if (connected) now else existing?.lastConnectedAtMillis ?: 0L
            )
        )
    }

    suspend fun setDefault(stableId: String) {
        database.withTransactionCompat {
            database.savedDeviceDao().clearDefault()
            database.savedDeviceDao().markDefault(stableId)
        }
    }

    suspend fun remove(device: TvDevice) {
        preferences.forget(device)
        database.savedDeviceDao().delete(device.stableId())
    }
}

class MacroRepository(private val database: ProductDatabase) {
    val macros: Flow<List<RemoteMacro>> = database.remoteMacroDao().observeAll().map { it.map(MacroCodec::decode) }

    suspend fun save(macro: RemoteMacro): MacroValidation {
        val validation = MacroSafety.validate(macro)
        if (!validation.valid) return validation
        val now = System.currentTimeMillis()
        database.remoteMacroDao().upsert(
            RemoteMacroEntity(
                id = macro.id.ifBlank { UUID.randomUUID().toString() },
                name = macro.name.take(60),
                deviceId = macro.deviceId,
                stepsJson = MacroCodec.encode(macro),
                requiresConfirmation = macro.requiresConfirmation,
                createdAtMillis = macro.createdAtMillis,
                updatedAtMillis = now
            )
        )
        return MacroValidation(true)
    }

    suspend fun remove(id: String) = database.remoteMacroDao().delete(id)
    suspend fun find(id: String): RemoteMacro? = database.remoteMacroDao().find(id)?.let(MacroCodec::decode)
}

class DiagnosticRepository(private val database: ProductDatabase) {
    suspend fun record(
        device: TvDevice?,
        command: UniversalRemoteCommand,
        result: CommandResult,
        queueDelayMillis: Long
    ) {
        val event = DiagnosticEventEntity(
            deviceId = device?.stableId().orEmpty(),
            command = command.name,
            backend = device?.platform?.name.orEmpty(),
            success = result.success,
            error = sanitize(result.message),
            latencyMillis = result.latencyMillis,
            queueDelayMillis = queueDelayMillis.coerceAtLeast(0),
            createdAtMillis = System.currentTimeMillis()
        )
        database.diagnosticDao().insert(event)
        database.diagnosticDao().trim(MAX_EVENTS)
    }

    suspend fun recent(deviceId: String, limit: Int = 100): List<DiagnosticEventEntity> =
        database.diagnosticDao().recent(deviceId, limit.coerceIn(1, 250))

    suspend fun clear() = database.diagnosticDao().clear()

    fun sanitize(value: String): String = value
        .replace(Regex("(?i)(token|client[-_ ]?key|password|authorization)\\s*[:=]\\s*[^\\s,;]+"), "$1=[redacted]")
        .replace(Regex("[A-Fa-f0-9]{40,}"), "[fingerprint-redacted]")
        .take(240)

    companion object {
        private const val MAX_EVENTS = 500
    }
}

private suspend fun ProductDatabase.withTransactionCompat(block: suspend () -> Unit) {
    // Both statements are idempotent and Room serializes writes. Keeping this helper suspend-safe
    // avoids a dependency on room-testing transaction APIs in minified production builds.
    block()
}
