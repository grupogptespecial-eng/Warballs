package com.geronimo.controlelgwifi

import java.text.Normalizer
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

sealed interface MacroRunState {
    data object Idle : MacroRunState
    data class Running(val macroId: String, val macroName: String, val step: Int, val total: Int) : MacroRunState
    data class Completed(val macroId: String) : MacroRunState
    data class Failed(val macroId: String, val reason: String) : MacroRunState
    data class Cancelled(val macroId: String) : MacroRunState
}

class MacroEngine(
    private val isConnected: () -> Boolean,
    private val send: suspend (UniversalRemoteCommand) -> CommandResult
) {
    private val mutableState = MutableStateFlow<MacroRunState>(MacroRunState.Idle)
    val state: StateFlow<MacroRunState> = mutableState.asStateFlow()

    @Volatile private var cancelled = false

    suspend fun run(macro: RemoteMacro): CommandResult {
        val validation = MacroSafety.validate(macro)
        if (!validation.valid) {
            mutableState.value = MacroRunState.Failed(macro.id, validation.reason)
            return CommandResult.fail(CommandError.UNSUPPORTED, validation.reason)
        }
        cancelled = false
        return try {
            macro.steps.forEachIndexed { index, step ->
                if (cancelled) throw CancellationException("Macro cancelada")
                mutableState.value = MacroRunState.Running(macro.id, macro.name, index + 1, macro.steps.size)
                when (step) {
                    is MacroStep.Delay -> delay(step.milliseconds)
                    is MacroStep.WaitForConnection -> waitForConnection(step.timeoutMillis)
                    is MacroStep.Command -> {
                        val result = send(step.command)
                        if (!result.success) {
                            mutableState.value = MacroRunState.Failed(
                                macro.id,
                                result.message.ifBlank { "Falha em ${step.command.name}" }
                            )
                            return result
                        }
                    }
                }
            }
            mutableState.value = MacroRunState.Completed(macro.id)
            CommandResult.ok()
        } catch (cancelledError: CancellationException) {
            mutableState.value = MacroRunState.Cancelled(macro.id)
            CommandResult.fail(CommandError.TIMEOUT, cancelledError.message)
        } catch (error: Throwable) {
            mutableState.value = MacroRunState.Failed(macro.id, error.message.orEmpty())
            CommandResult.fail(CommandError.PROTOCOL, error.message)
        }
    }

    fun cancel() {
        cancelled = true
    }

    private suspend fun waitForConnection(timeoutMillis: Long) {
        val started = System.currentTimeMillis()
        while (!isConnected()) {
            if (cancelled) throw CancellationException("Macro cancelada")
            if (System.currentTimeMillis() - started > timeoutMillis) {
                throw IllegalStateException("A TV não conectou dentro do tempo da macro.")
            }
            delay(100)
        }
    }
}

object VoiceCommandParser {
    fun parse(raw: String): UniversalRemoteCommand? {
        val normalized = normalize(raw)
        val compact = normalized.replace(" ", "")
        return when {
            normalized in setOf("ligar tv", "desligar tv", "energia", "power") -> UniversalRemoteCommand.POWER
            normalized.contains("aumentar volume") || normalized.contains("subir volume") -> UniversalRemoteCommand.VOLUME_UP
            normalized.contains("diminuir volume") || normalized.contains("baixar volume") -> UniversalRemoteCommand.VOLUME_DOWN
            normalized.contains("silenciar") || normalized.contains("tirar som") || normalized == "mudo" -> UniversalRemoteCommand.MUTE
            normalized.contains("canal anterior") || normalized.contains("voltar canal") -> UniversalRemoteCommand.CHANNEL_DOWN
            normalized.contains("proximo canal") || normalized.contains("subir canal") -> UniversalRemoteCommand.CHANNEL_UP
            normalized.contains("abrir home") || normalized.contains("ir para home") || normalized == "inicio" -> UniversalRemoteCommand.NAVIGATE_HOME
            normalized.contains("voltar") -> UniversalRemoteCommand.NAVIGATE_BACK
            normalized.contains("confirmar") || normalized == "ok" -> UniversalRemoteCommand.NAVIGATE_OK
            normalized.contains("para cima") -> UniversalRemoteCommand.NAVIGATE_UP
            normalized.contains("para baixo") -> UniversalRemoteCommand.NAVIGATE_DOWN
            normalized.contains("para esquerda") -> UniversalRemoteCommand.NAVIGATE_LEFT
            normalized.contains("para direita") -> UniversalRemoteCommand.NAVIGATE_RIGHT
            normalized.contains("reproduzir") || normalized == "play" -> UniversalRemoteCommand.MEDIA_PLAY
            normalized.contains("pausar") || normalized == "pause" -> UniversalRemoteCommand.MEDIA_PAUSE
            normalized.contains("parar") || normalized == "stop" -> UniversalRemoteCommand.MEDIA_STOP
            normalized.contains("hdmi 1") || compact.contains("hdmium") -> UniversalRemoteCommand.INPUT_HDMI_1
            normalized.contains("hdmi 2") || compact.contains("hdmidois") -> UniversalRemoteCommand.INPUT_HDMI_2
            normalized.contains("hdmi 3") || compact.contains("hdmitres") -> UniversalRemoteCommand.INPUT_HDMI_3
            normalized.contains("hdmi 4") || compact.contains("hdmiquatro") -> UniversalRemoteCommand.INPUT_HDMI_4
            else -> null
        }
    }

    private fun normalize(value: String): String = Normalizer.normalize(value.lowercase(), Normalizer.Form.NFD)
        .replace(Regex("\\p{Mn}+"), "")
        .replace(Regex("[^a-z0-9 ]"), " ")
        .replace(Regex("\\s+"), " ")
        .trim()
}
