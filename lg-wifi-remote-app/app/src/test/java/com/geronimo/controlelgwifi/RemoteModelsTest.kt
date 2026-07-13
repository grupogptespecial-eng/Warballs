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
        val device = TvDevice(
            ip = "192.168.1.20",
            name = "LG OLED",
            room = "Sala",
            platform = TvPlatform.LgWebOs
        )
        assertEquals("Sala • LG OLED", device.displayName)
    }

    @Test
    fun platformDefaultsHideUnsupportedControls() {
        val dlna = TvPlatform.DlnaMedia.defaultCapabilities(
            hasAvTransport = true,
            hasRenderingControl = false
        )
        assertTrue(TvCapability.Media in dlna)
        assertFalse(TvCapability.Navigation in dlna)
        assertFalse(TvCapability.Volume in dlna)
    }

    @Test
    fun samsungExposesRemoteKeysButNotPointer() {
        val capabilities = TvPlatform.SamsungTizenLocal.defaultCapabilities()
        assertTrue(TvCapability.Navigation in capabilities)
        assertTrue(TvCapability.Channels in capabilities)
        assertFalse(TvCapability.Pointer in capabilities)
        assertFalse(TvCapability.Apps in capabilities)
    }

    @Test
    fun localNetworkValidationRejectsPublicAddresses() {
        assertTrue(NetworkAddressValidator.isLocalHost("192.168.1.10"))
        assertTrue(NetworkAddressValidator.isLocalHost("10.0.0.8"))
        assertFalse(NetworkAddressValidator.isLocalHost("8.8.8.8"))
    }
}
