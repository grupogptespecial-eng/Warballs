package com.geronimo.controlelgwifi

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RemoteModelsTest {
    @Test
    fun normalPresetContainsEssentialControls() {
        val modules = RemotePreset.normal.modules
        assertTrue(RemoteModule.DPad in modules)
        assertTrue(RemoteModule.Volume in modules)
        assertTrue(RemoteModule.CoreActions in modules)
        assertTrue(RemoteModule.Apps in modules)
    }

    @Test
    fun simplePresetAvoidsAdvancedClutter() {
        val modules = RemotePreset.simple.modules
        assertFalse(RemoteModule.Numeric in modules)
        assertFalse(RemoteModule.Colors in modules)
        assertFalse(RemoteModule.InfoMenu in modules)
    }

    @Test
    fun customPresetCanKeepItsIdentity() {
        val custom = RemotePreset.normal.copy(
            id = RemotePresetId.Custom1,
            name = "Filmes",
            modules = listOf(RemoteModule.DPad, RemoteModule.Media)
        )
        assertEquals(RemotePresetId.Custom1, custom.id)
        assertEquals("Filmes", custom.name)
        assertEquals(2, custom.modules.size)
    }

    @Test
    fun roomIsIncludedInDisplayName() {
        val device = TvDevice(ip = "192.168.1.20", name = "LG OLED", room = "Sala")
        assertEquals("Sala • LG OLED", device.displayName)
    }
}
