package com.geronimo.controlelgwifi

import java.text.Normalizer
import java.util.Locale

object VoiceCommandParser {
    fun parse(raw: String): RemoteAction? {
        val text = normalize(raw)
        return when (text) {
            "cima", "subir", "up", "arriba" -> RemoteAction.Up
            "baixo", "descer", "down", "abajo" -> RemoteAction.Down
            "esquerda", "left", "izquierda" -> RemoteAction.Left
            "direita", "right", "derecha" -> RemoteAction.Right
            "ok", "confirmar", "confirma", "enter", "accept", "aceptar", "acepta" -> RemoteAction.Enter
            "voltar", "back", "atras", "volver" -> RemoteAction.Back
            "inicio", "home", "casa" -> RemoteAction.Home
            "menu", "menú" -> RemoteAction.Menu
            "informacao", "informacoes", "info", "information", "informacion" -> RemoteAction.Info
            "guia", "guide", "guía" -> RemoteAction.Guide
            "aumentar volume", "volume mais", "volume up", "subir volumen", "aumenta el volumen" -> RemoteAction.VolumeUp
            "diminuir volume", "volume menos", "volume down", "bajar volumen", "baja el volumen" -> RemoteAction.VolumeDown
            "mudo", "silenciar", "mute", "silencio" -> RemoteAction.Mute
            "canal mais", "proximo canal", "channel up", "siguiente canal", "canal siguiente" -> RemoteAction.ChannelUp
            "canal menos", "canal anterior", "channel down", "previous channel" -> RemoteAction.ChannelDown
            "reproduzir", "tocar", "play", "reproducir" -> RemoteAction.Play
            "pausar", "pause", "pausa" -> RemoteAction.Pause
            "parar", "stop", "detener" -> RemoteAction.Stop
            "avancar", "adiantar", "fast forward", "avanzar" -> RemoteAction.FastForward
            "retroceder", "rewind", "rebobinar" -> RemoteAction.Rewind
            else -> null
        }
    }

    internal fun normalize(raw: String): String {
        return Normalizer.normalize(raw, Normalizer.Form.NFD)
            .replace("\\p{Mn}+".toRegex(), "")
            .lowercase(Locale.ROOT)
            .replace("[^a-z0-9 ]".toRegex(), " ")
            .replace("\\s+".toRegex(), " ")
            .trim()
    }
}
