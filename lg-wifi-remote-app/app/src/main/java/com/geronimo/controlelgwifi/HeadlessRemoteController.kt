package com.geronimo.controlelgwifi

import android.content.Context
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.delay
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Sends one short command from widgets or Quick Settings without keeping a background service alive.
 */
object HeadlessRemoteController {
    suspend fun send(context: Context, action: RemoteAction): Boolean {
        val device = RemotePreferences(context).loadCurrentDevice() ?: return false
        val completion = CompletableDeferred<Boolean>()
        lateinit var backend: TvBackend
        val listener = object : TvBackendListener {
            override fun onConnectionState(state: ConnectionState, message: String, reconnectAttempt: Int) {
                when (state) {
                    ConnectionState.Connected -> {
                        runCatching { backend.send(action) }
                            .onSuccess { completion.complete(true) }
                            .onFailure { completion.complete(false) }
                    }
                    ConnectionState.Error -> completion.complete(false)
                    else -> Unit
                }
            }

            override fun onApps(apps: List<TvApp>) = Unit
            override fun onInputs(inputs: List<TvInput>) = Unit
            override fun onVolume(volume: Int?, muted: Boolean) = Unit
            override fun onCapabilities(capabilities: Set<TvCapability>) = Unit
        }
        val registry = TvBackendRegistry(context.applicationContext, listener)
        backend = registry.backendFor(device.platform)
        return try {
            backend.connect(device, userInitiated = false)
            withTimeoutOrNull(5_000L) { completion.await() } == true
        } finally {
            delay(120)
            registry.closeAll()
        }
    }

    suspend fun wake(context: Context): Boolean {
        val device = RemotePreferences(context).loadCurrentDevice() ?: return false
        val mac = device.mac ?: return false
        return WakeOnLan.send(context.applicationContext, mac)
    }
}
