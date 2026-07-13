package com.geronimo.controlelgwifi

import android.os.Build
import java.security.MessageDigest
import java.time.Instant

object DiagnosticsReport {
    fun build(state: RemoteUiState): String {
        val device = state.currentDevice
        val diagnostic = state.diagnostic
        return buildString {
            appendLine("Libre Remote diagnostic report")
            appendLine("Generated: ${Instant.now()}")
            appendLine("App version: ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})")
            appendLine("Android: ${Build.VERSION.RELEASE} / API ${Build.VERSION.SDK_INT}")
            appendLine("Device: ${Build.MANUFACTURER} ${Build.MODEL}")
            appendLine()
            appendLine("TV selected: ${device != null}")
            if (device != null) {
                appendLine("TV id: ${shortHash(device.stableId)}")
                appendLine("TV name: ${device.displayName.take(64)}")
                appendLine("Platform: ${device.platformLabel}")
                appendLine("Support: ${device.supportLabel}")
                appendLine("Model: ${device.model.orEmpty().take(64)}")
                appendLine("Manufacturer: ${device.manufacturer.orEmpty().take(64)}")
                appendLine("Capabilities: ${state.capabilities.sortedBy { it.name }.joinToString { it.name }}")
            }
            appendLine()
            appendLine("Connection state: ${state.connectionState}")
            appendLine("Wi-Fi/Ethernet: ${diagnostic.wifiConnected}")
            appendLine("Multicast: ${diagnostic.multicastAvailable}")
            appendLine("TV reachable: ${diagnostic.tvReachable}")
            appendLine("Backend: ${diagnostic.backendSummary.orEmpty()}")
            appendLine("Last dispatch: ${diagnostic.lastCommandDispatchMs?.formatMs() ?: "n/a"}")
            appendLine("Average dispatch: ${diagnostic.averageCommandDispatchMs?.formatMs() ?: "n/a"}")
            appendLine("P95 dispatch: ${diagnostic.p95CommandDispatchMs?.formatMs() ?: "n/a"}")
            appendLine("Samples: ${diagnostic.commandSampleCount}")
            appendLine("Last connection: ${diagnostic.lastConnectionMs?.let { "$it ms" } ?: "n/a"}")
            appendLine("Reconnect attempts: ${state.reconnectAttempt}")
            appendLine("Last error: ${state.lastError.orEmpty().take(240)}")
            appendLine()
            appendLine("Privacy note: tokens, pairing keys, MAC addresses, certificates, typed text and the TV IP are intentionally omitted.")
        }
    }

    private fun shortHash(value: String): String = MessageDigest.getInstance("SHA-256")
        .digest(value.toByteArray())
        .take(6)
        .joinToString("") { "%02x".format(it) }

    private fun Double.formatMs(): String = "%.2f ms".format(this)
}
