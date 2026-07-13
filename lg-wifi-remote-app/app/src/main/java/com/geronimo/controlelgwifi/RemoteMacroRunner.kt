package com.geronimo.controlelgwifi

import kotlinx.coroutines.delay
import kotlinx.coroutines.withTimeoutOrNull

class RemoteMacroRunner(private val host: Host) {
    interface Host {
        fun isConnected(): Boolean
        suspend fun waitForConnection(): Boolean
        suspend fun send(action: RemoteAction): Boolean
        suspend fun launchApp(appId: String): Boolean
        suspend fun switchInput(inputId: String): Boolean
        suspend fun insertText(text: String): Boolean
        fun onProgress(index: Int, total: Int, message: String)
    }

    suspend fun execute(macro: RemoteMacro): MacroResult {
        val total = macro.steps.size
        for ((index, step) in macro.steps.withIndex()) {
            host.onProgress(index + 1, total, stepDescription(step))
            val success = when (step.type) {
                MacroStepType.Command -> step.action?.let { host.send(it) } ?: false
                MacroStepType.Delay -> {
                    delay(step.delayMs.coerceIn(0L, 30_000L))
                    true
                }
                MacroStepType.WaitForConnection -> {
                    if (host.isConnected()) true else withTimeoutOrNull(step.timeoutMs.coerceIn(500L, 30_000L)) {
                        host.waitForConnection()
                    } == true
                }
                MacroStepType.LaunchApp -> step.value?.let { host.launchApp(it) } ?: false
                MacroStepType.SwitchInput -> step.value?.let { host.switchInput(it) } ?: false
                MacroStepType.InsertText -> step.value?.let { host.insertText(it) } ?: false
            }
            if (!success && !step.continueOnError) {
                return MacroResult(false, index, "A macro parou em: ${stepDescription(step)}")
            }
        }
        return MacroResult(true, total, "Macro concluída")
    }

    private fun stepDescription(step: MacroStep): String = when (step.type) {
        MacroStepType.Command -> step.action?.name ?: "Comando inválido"
        MacroStepType.Delay -> "Aguardar ${step.delayMs} ms"
        MacroStepType.WaitForConnection -> "Aguardar conexão"
        MacroStepType.LaunchApp -> "Abrir aplicativo"
        MacroStepType.SwitchInput -> "Trocar entrada"
        MacroStepType.InsertText -> "Enviar texto"
    }
}

data class MacroResult(val success: Boolean, val completedSteps: Int, val message: String)
