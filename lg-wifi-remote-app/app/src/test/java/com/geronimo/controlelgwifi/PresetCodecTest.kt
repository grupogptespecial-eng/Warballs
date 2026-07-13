package com.geronimo.controlelgwifi

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PresetCodecTest {
    @Test
    fun roundTripUsesRequestedCustomSlot() {
        val source = RemotePreset(
            id = RemotePresetId.Custom1,
            name = "Filmes",
            modules = listOf(RemoteModule.Power, RemoteModule.DPad, RemoteModule.Media),
            compact = true
        )
        val decoded = PresetCodec.decode(PresetCodec.encode(source), RemotePresetId.Custom3).getOrThrow()
        assertEquals(RemotePresetId.Custom3, decoded.id)
        assertEquals(source.name, decoded.name)
        assertEquals(source.modules, decoded.modules)
        assertTrue(decoded.compact)
    }

    @Test
    fun rejectsUnknownFormat() {
        assertTrue(PresetCodec.decode("{\"format\":\"other\"}", RemotePresetId.Custom1).isFailure)
    }
}
