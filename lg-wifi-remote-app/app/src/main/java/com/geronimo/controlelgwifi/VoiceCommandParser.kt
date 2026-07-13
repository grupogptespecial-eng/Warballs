package com.geronimo.controlelgwifi

import java.text.Normalizer
import java.util.Locale

sealed interface ParsedVoiceCommand {
    data class Action(val action: RemoteAction) : ParsedVoiceCommand
    data class Macro(val query: String) : ParsedVoiceCommand
    data class Text(val value: String) : ParsedVoiceCommand
    data class Unknown(val original: String) : ParsedVoiceCommand
}

/** Deterministic, local parser. It does not send voice or text to Libre Remote servers. */
object VoiceCommandParser {
    fun parse(raw: String): ParsedVoiceCommand {
        val normalized = normalize(raw)
        if (normalized.isBlank()) return ParsedVoiceCommand.Unknown(raw)

        val action = when {
            hasAny(normalized, "aumentar volume", "volume mais", "subir volume", "volume up") -> RemoteAction.VolumeUp
            hasAny(normalized, "diminuir volume", "volume menos", "baixar volume", "volume down") -> RemoteAction.VolumeDown
            hasAny(normalized, "silenciar", "tirar o som", "mudo", "mute") -> RemoteAction.Mute
            hasAny(normalized, "canal seguinte", "proximo canal", "subir canal", "channel up") -> RemoteAction.ChannelUp
            hasAny(normalized, "canal anterior", "baixar canal", "channel down") -> RemoteAction.ChannelDown
            hasAny(normalized, "reproduzir", "continuar", "play") -> RemoteAction.Play
            hasAny(normalized, "pausar", "pause") -> RemoteAction.Pause
            hasAny(normalized, "play pause", "reproduzir ou pausar") -> RemoteAction.PlayPause
            hasAny(normalized, "voltar", "back") -> RemoteAction.Back
            hasAny(normalized, "inicio", "tela inicial", "home") -> RemoteAction.Home
            hasAny(normalized, "menu") -> RemoteAction.Menu
            hasAny(normalized, "informacoes", "informacao", "info") -> RemoteAction.Info
            hasAny(normalized, "guia", "guide") -> RemoteAction.Guide
            hasAny(normalized, "para cima", "cima", "up") -> RemoteAction.Up
            hasAny(normalized, "para baixo", "baixo", "down") -> RemoteAction.Down
            hasAny(normalized, "esquerda", "left") -> RemoteAction.Left
            hasAny(normalized, "direita", "right") -> RemoteAction.Right
            hasAny(normalized, "confirmar", "selecionar", "ok", "enter") -> RemoteAction.Enter
            hasAny(normalized, "desligar tv", "desligar televisao", "power off") -> RemoteAction.PowerOff
            else -> null
        }
        if (action != null) return ParsedVoiceCommand.Action(action)

        val macroPrefixes = listOf("executar ", "rodar ", "iniciar ", "cena ", "macro ")
        val macroPrefix = macroPrefixes.firstOrNull(normalized::startsWith)
        if (macroPrefix != null) {
            return ParsedVoiceCommand.Macro(normalized.removePrefix(macroPrefix).trim())
        }

        val textPrefixes = listOf("digitar ", "escrever ", "pesquisar ", "buscar ")
        val textPrefix = textPrefixes.firstOrNull(normalized::startsWith)
        if (textPrefix != null) {
            return ParsedVoiceCommand.Text(raw.trim().drop(textPrefix.length).trim())
        }

        return ParsedVoiceCommand.Unknown(raw)
    }

    private fun normalize(value: String): String = Normalizer.normalize(value, Normalizer.Form.NFD)
        .replace(Regex("\\p{M}+"), "")
        .lowercase(Locale.ROOT)
        .replace(Regex("[^a-z0-9 ]"), " ")
        .replace(Regex("\\s+"), " ")
        .trim()

    private fun hasAny(value: String, vararg candidates: String): Boolean = candidates.any { candidate ->
        value == candidate || value.contains(candidate)
    }
}
