#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else "libre-remote-universal")
pkg = Path("io/github/grupogptespecialeng/libreremote")
common = root / "composeApp/src/commonMain/kotlin" / pkg
tests = root / "composeApp/src/commonTest/kotlin" / pkg
common.mkdir(parents=True, exist_ok=True)
tests.mkdir(parents=True, exist_ok=True)


def write(path: Path, content: str) -> None:
    if not path.exists() or path.read_text(encoding="utf-8") != content:
        path.write_text(content, encoding="utf-8")
        print(f"updated {path}")


write(
    common / "CommandSemantics.kt",
    r'''package io.github.grupogptespecialeng.libreremote

enum class CommandSemantic {
    Momentary,
    Toggle,
    AbsoluteBoolean,
    AbsoluteValue,
}

data class CapabilityContract(
    val id: String,
    val semantic: CommandSemantic,
    val requiredHost: Set<HostCapability> = emptySet(),
)

object RemoteCapabilityContracts {
    val MuteToggle = CapabilityContract("mute-toggle", CommandSemantic.Toggle)
    val SetMute = CapabilityContract("set-mute", CommandSemantic.AbsoluteBoolean)
    val Play = CapabilityContract("play", CommandSemantic.Momentary)
    val Pause = CapabilityContract("pause", CommandSemantic.Momentary)
    val PlayPauseToggle = CapabilityContract("play-pause-toggle", CommandSemantic.Toggle)
    val VoiceInput = CapabilityContract(
        "voice-input",
        CommandSemantic.Momentary,
        setOf(HostCapability.Microphone, HostCapability.SpeechRecognition),
    )
    val PairingWithCredential = CapabilityContract(
        "pairing-with-credential",
        CommandSemantic.Momentary,
        setOf(HostCapability.SecureStorage),
    )
}

fun CapabilityContract.isAvailable(tvSupportsContract: Boolean, host: Set<HostCapability> = currentHostCapabilities()): Boolean =
    tvSupportsContract && host.containsAll(requiredHost)
''',
)

write(
    tests / "SecureStoreMigrationTest.kt",
    r'''package io.github.grupogptespecialeng.libreremote

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFails
import kotlin.test.assertNull
import kotlin.test.assertTrue

private class MapPlatformStore : PlatformStore {
    val values = linkedMapOf<String, String>()
    override fun get(key: String): String? = values[key]
    override fun put(key: String, value: String) { values[key] = value }
    override fun remove(key: String) { values.remove(key) }
}

private class MapSecureStore(
    override val available: Boolean = true,
    private val failWrites: Boolean = false,
) : SecureStore {
    val values = linkedMapOf<String, ByteArray>()
    private fun k(scope: String, key: String) = "$scope\u0000$key"
    override fun putSecret(scope: String, key: String, value: ByteArray) {
        if (failWrites) throw SecureStoreUnavailableException("injected failure")
        values[k(scope, key)] = value.copyOf()
    }
    override fun getSecret(scope: String, key: String): ByteArray? = values[k(scope, key)]?.copyOf()
    override fun deleteSecret(scope: String, key: String) { values.remove(k(scope, key)) }
    override fun deleteScope(scope: String) { values.keys.filter { it.startsWith("$scope\u0000") }.toList().forEach(values::remove) }
}

class SecureStoreMigrationTest {
    @Test fun legacyClientKeyMigratesOnlyAfterReadBack() {
        val legacy = MapPlatformStore().also { it.values["lg.client.192.168.1.20"] = "legacy-key" }
        val secure = MapSecureStore()
        val profiles = ProfileStore(legacy, secure)
        assertEquals("legacy-key", profiles.clientKey("192.168.1.20"))
        assertNull(legacy.get("lg.client.192.168.1.20"))
        assertEquals("legacy-key", secure.getSecret("192.168.1.20", "client-key")?.decodeToString())
    }

    @Test fun failedMigrationNeverDeletesOnlyCredential() {
        val legacy = MapPlatformStore().also { it.values["lg.client.192.168.1.21"] = "recover-me" }
        val profiles = ProfileStore(legacy, MapSecureStore(failWrites = true))
        assertFails { profiles.clientKey("192.168.1.21") }
        assertEquals("recover-me", legacy.get("lg.client.192.168.1.21"))
    }

    @Test fun newClientKeyNeverWritesOrdinaryPreferences() {
        val legacy = MapPlatformStore()
        val secure = MapSecureStore()
        val profiles = ProfileStore(legacy, secure)
        profiles.saveClientKey("stable-tv-id", "secret")
        assertTrue(legacy.values.keys.none { it.startsWith("lg.client.") })
        assertEquals("secret", secure.getSecret("stable-tv-id", "client-key")?.decodeToString())
    }

    @Test fun stableIdentityMovesAllTrustState() {
        val ordinary = MapPlatformStore()
        val secure = MapSecureStore()
        val profiles = ProfileStore(ordinary, secure)
        profiles.saveClientKey("lg@192.168.1.2", "client")
        profiles.saveCertificateFingerprint("lg@192.168.1.2", "abc")
        profiles.markSecureTransportSucceeded("lg@192.168.1.2")
        profiles.migrateDeviceSecrets("lg@192.168.1.2", "stable-lg-id")
        assertEquals("client", profiles.clientKey("stable-lg-id"))
        assertEquals("abc", profiles.certificateFingerprint("stable-lg-id"))
        assertTrue(profiles.secureTransportSucceeded("stable-lg-id"))
        assertNull(secure.getSecret("lg@192.168.1.2", "client-key"))
    }
}
''',
)

write(
    tests / "LocalPolicyFuzzTest.kt",
    r'''package io.github.grupogptespecialeng.libreremote

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import kotlin.test.assertFailsWith

class LocalPolicyFuzzTest {
    @Test fun privateAddressMatrixIsAcceptedAndPublicMatrixRejected() {
        for (i in 1..50) {
            assertTrue(validateLocalControlUrl("http://10.0.0.$i:1400/device.xml"))
            assertTrue(validateLocalControlUrl("https://192.168.1.$i/device.xml"))
            assertTrue(validateLocalControlUrl("ws://172.16.0.$i:8001"))
            assertFalse(validateLocalControlUrl("http://8.8.8.$i/device.xml"))
            assertFalse(validateLocalControlUrl("https://1.1.1.$i/control"))
        }
    }

    @Test fun schemeAndAuthorityFuzzNeverEscapesLocalPolicy() {
        val bad = listOf(
            "file:///etc/passwd",
            "ftp://192.168.1.2/file",
            "javascript://192.168.1.2/x",
            "http://user:pass@192.168.1.2/control",
            "https://example.com/redirect?to=192.168.1.2",
            "//192.168.1.2/control",
            "",
        )
        bad.forEach { assertFalse(validateLocalControlUrl(it), it) }
    }

    @Test fun xmlDepthAndEntityFuzzFailsClosed() {
        assertFailsWith<UnsafeXmlException> {
            SafeXml.validate("<!DOCTYPE root [<!ENTITY x SYSTEM 'http://127.0.0.1/secret'>]><root>&x;</root>")
        }
        val deep = buildString {
            repeat(60) { append("<x>") }
            repeat(60) { append("</x>") }
        }
        assertFailsWith<UnsafeXmlException> { SafeXml.validate(deep, maxDepth = 32) }
    }
}
''',
)

write(
    tests / "CapabilityContractTest.kt",
    r'''package io.github.grupogptespecialeng.libreremote

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class CapabilityContractTest {
    @Test fun securePairingAndVoiceAreHostIntersected() {
        val onlyNetwork = setOf(HostCapability.LocalDiscovery, HostCapability.Multicast)
        assertFalse(RemoteCapabilityContracts.PairingWithCredential.isAvailable(true, onlyNetwork))
        assertFalse(RemoteCapabilityContracts.VoiceInput.isAvailable(true, onlyNetwork))
        assertTrue(
            RemoteCapabilityContracts.VoiceInput.isAvailable(
                true,
                onlyNetwork + HostCapability.Microphone + HostCapability.SpeechRecognition,
            )
        )
    }

    @Test fun toggleAndAbsoluteMuteRemainDifferentContracts() {
        assertTrue(RemoteCapabilityContracts.MuteToggle.semantic != RemoteCapabilityContracts.SetMute.semantic)
        assertTrue(RemoteCapabilityContracts.PlayPauseToggle.semantic != RemoteCapabilityContracts.Play.semantic)
    }
}
''',
)

print("Libre Remote contract tests added")
