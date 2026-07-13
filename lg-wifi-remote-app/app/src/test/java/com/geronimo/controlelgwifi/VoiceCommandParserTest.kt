package com.geronimo.controlelgwifi

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class VoiceCommandParserTest {
    @Test
    fun parsesPortugueseVolumeCommand() {
        assertEquals(
            ParsedVoiceCommand.Action(RemoteAction.VolumeUp),
            VoiceCommandParser.parse("Aumentar volume")
        )
    }

    @Test
    fun parsesMacroCommandWithoutAccents() {
        assertEquals(
            ParsedVoiceCommand.Macro("boa noite"),
            VoiceCommandParser.parse("Executar boa noite")
        )
    }

    @Test
    fun parsesTextCommand() {
        assertEquals(
            ParsedVoiceCommand.Text("filme de aventura"),
            VoiceCommandParser.parse("digitar filme de aventura")
        )
    }

    @Test
    fun unknownCommandIsPreserved() {
        assertTrue(VoiceCommandParser.parse("comando inexistente") is ParsedVoiceCommand.Unknown)
    }
}
