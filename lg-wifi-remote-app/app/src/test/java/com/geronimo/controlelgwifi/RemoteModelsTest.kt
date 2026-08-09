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
    @Test
    fun localNetworkValidationRejectsMalformedIpv4() {
        assertFalse(NetworkAddressValidator.isLocalHost("192.168.bad.1.2"))
        assertFalse(NetworkAddressValidator.isLocalHost("192.168.1"))
        assertFalse(NetworkAddressValidator.isLocalHost("192.168.1.999"))
    }

    @Test
    fun localNetworkValidationAcceptsPrivateIpv6() {
        assertTrue(NetworkAddressValidator.isLocalHost("::1"))
        assertTrue(NetworkAddressValidator.isLocalHost("fe80::1234"))
        assertTrue(NetworkAddressValidator.isLocalHost("fd12:3456::1"))
        assertFalse(NetworkAddressValidator.isLocalHost("2001:4860:4860::8888"))
    }

    @Test
    fun ipv6HostsAreBracketedForWebSockets() {
        assertEquals("192.168.1.20", NetworkAddressValidator.asUrlHost("192.168.1.20"))
        assertEquals("[fd12:3456::1]", NetworkAddressValidator.asUrlHost("fd12:3456::1"))
        assertEquals("[fe80::1%25wlan0]", NetworkAddressValidator.asUrlHost("fe80::1%wlan0"))
    }

    @Test
    fun manualAddressNormalizationKeepsIpv6Intact() {
        assertEquals("192.168.1.20", TvDiscovery.normalizeHost("http://192.168.1.20:3000/"))
        assertEquals("fd12:3456::1", TvDiscovery.normalizeHost("[fd12:3456::1]:3000"))
        assertEquals("fd12:3456::1", TvDiscovery.normalizeHost("fd12:3456::1"))
        assertEquals(null, TvDiscovery.normalizeHost("8.8.8.8"))
    }

    @Test
    fun advancedLegacyPresetKeepsClassicOneScrollControls() {
        val preset = RemotePreset.advancedLegacy
        assertEquals(RemotePresetId.AdvancedLegacy, preset.id)
        assertTrue(RemoteModule.DPad in preset.modules)
        assertTrue(RemoteModule.Volume in preset.modules)
        assertTrue(RemoteModule.Channels in preset.modules)
        assertTrue(RemoteModule.Media in preset.modules)
        assertTrue(RemoteModule.TouchpadShortcut in preset.modules)
        assertTrue(RemoteModule.Inputs in preset.modules)
        assertTrue(RemoteModule.Apps in preset.modules)
        assertTrue(RemoteModule.Keyboard in preset.modules)
        assertTrue(RemoteModule.Numeric in preset.modules)
    }

    @Test
    fun lgPointerProtocolFramesNavigationAndPointerCommands() {
        assertEquals("type:button\nname:LEFT\n\n", LgPointerProtocol.button("left"))
        assertEquals("type:click\n\n", LgPointerProtocol.click())
        assertEquals("type:move\ndx:240\ndy:-240\ndown:0\n\n", LgPointerProtocol.move(999, -999))
        assertEquals("type:scroll\ndx:0\ndy:80\n\n", LgPointerProtocol.scroll(999))
    }

    @Test
    fun voiceCommandsWorkAcrossPortugueseEnglishAndSpanish() {
        assertEquals(RemoteAction.Up, VoiceCommandParser.parse("cima"))
        assertEquals(RemoteAction.Left, VoiceCommandParser.parse("left"))
        assertEquals(RemoteAction.VolumeUp, VoiceCommandParser.parse("subir volumen"))
        assertEquals(RemoteAction.Enter, VoiceCommandParser.parse("confirmar"))
        assertEquals(null, VoiceCommandParser.parse("um texto livre para a televisão"))
    }

    @Test
    fun personalizationDefaultsArePersistentFriendly() {
        val state = RemoteUiState()
        assertEquals(BackgroundEffect.Aurora, state.backgroundEffect)
        assertEquals(AnimationPreset.Calm, state.animationPreset)
        assertEquals(ButtonEffect.Soft, state.buttonEffect)
        assertEquals(AppLanguage.System, state.appLanguage)
        assertEquals(VoiceLanguage.Auto, state.voiceLanguage)
    }

    @Test
    fun appLanguageResolutionAlwaysProducesSupportedUiLanguage() {
        val resolved = AppLanguage.System.resolved()
        assertTrue(resolved in setOf(
            AppLanguage.PortugueseBrazil,
            AppLanguage.English,
            AppLanguage.Spanish
        ))
    }

}
