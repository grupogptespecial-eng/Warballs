#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else "libre-remote-universal")
pkg = Path("io/github/grupogptespecialeng/libreremote")


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists() or path.read_text(encoding="utf-8") != content:
        path.write_text(content, encoding="utf-8")
        print(f"updated {path}")


# Android: use the platform's built-in instrumentation runner so the protocol
# contract adds no AndroidX test dependency solely for this release gate.
gradle = root / "composeApp/build.gradle.kts"
text = gradle.read_text(encoding="utf-8")
if "testInstrumentationRunner" not in text:
    match = re.search(r"(?m)^(?P<i>\s*)defaultConfig\s*\{\s*$", text)
    if not match:
        raise SystemExit("Android defaultConfig block not found for protocol instrumentation")
    indent = match.group("i") + "    "
    pos = match.end()
    text = text[:pos] + f'\n{indent}testInstrumentationRunner = "android.test.InstrumentationTestRunner"' + text[pos:]
    gradle.write_text(text, encoding="utf-8")
    print(f"updated {gradle}")

write(
    root / "composeApp/src/androidInstrumentedTest/kotlin" / pkg / "LgAndroidProtocolLabIntegrationTest.kt",
    r'''@file:Suppress("DEPRECATION")

package io.github.grupogptespecialeng.libreremote

import android.test.InstrumentationTestCase
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout

private class AndroidLabPlatformStore : PlatformStore {
    private val values = linkedMapOf<String, String>()
    override fun get(key: String): String? = values[key]
    override fun put(key: String, value: String) { values[key] = value }
    override fun remove(key: String) { values.remove(key) }
}

private class AndroidLabSecureStore : SecureStore {
    private val values = linkedMapOf<String, ByteArray>()
    override val available: Boolean = true
    private fun k(scope: String, key: String) = "$scope\u0000$key"
    override fun putSecret(scope: String, key: String, value: ByteArray) { values[k(scope, key)] = value.copyOf() }
    override fun getSecret(scope: String, key: String): ByteArray? = values[k(scope, key)]?.copyOf()
    override fun deleteSecret(scope: String, key: String) { values.remove(k(scope, key)) }
    override fun deleteScope(scope: String) { values.keys.filter { it.startsWith("$scope\u0000") }.toList().forEach(values::remove) }
}

class LgAndroidProtocolLabIntegrationTest : InstrumentationTestCase() {
    fun testInitialPairingAgainstHostLab() = runBlocking {
        val secure = AndroidLabSecureStore()
        val profiles = ProfileStore(AndroidLabPlatformStore(), secure)
        val remote = LgWebOsRemote(profiles)
        try {
            remote.connect("10.0.2.2")
            val state = withTimeout(15_000) {
                remote.state.filter { it.status == ConnectionStatus.Connected }.first()
            }
            assertEquals(ConnectionStatus.Connected, state.status)
            withTimeout(8_000) { remote.send(RemoteAction.VolumeUp) }
            assertEquals("lab-client-key", profiles.clientKey("10.0.2.2"))
        } finally {
            remote.close()
        }
    }

    fun testPinnedSecureHistoryRejectsWsOnlyLab() = runBlocking {
        val profiles = ProfileStore(AndroidLabPlatformStore(), AndroidLabSecureStore())
        profiles.markSecureTransportSucceeded("10.0.2.2")
        val remote = LgWebOsRemote(profiles)
        try {
            remote.connect("10.0.2.2")
            delay(7_000)
            assertFalse(remote.state.value.status == ConnectionStatus.Connected)
        } finally {
            remote.close()
        }
    }
}
''',
)

# Kotlin/Native simulator test. The lab is started by CI on the host Mac. iOS
# Simulator can address the host-local service at loopback in this test setup;
# physical-device Local Network behavior remains a separate L4 gate.
write(
    root / "composeApp/src/iosSimulatorArm64Test/kotlin" / pkg / "LgIosProtocolLabIntegrationTest.kt",
    r'''package io.github.grupogptespecialeng.libreremote

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals

private class IosLabPlatformStore : PlatformStore {
    private val values = linkedMapOf<String, String>()
    override fun get(key: String): String? = values[key]
    override fun put(key: String, value: String) { values[key] = value }
    override fun remove(key: String) { values.remove(key) }
}

private class IosLabSecureStore : SecureStore {
    private val values = linkedMapOf<String, ByteArray>()
    override val available: Boolean = true
    private fun k(scope: String, key: String) = "$scope\u0000$key"
    override fun putSecret(scope: String, key: String, value: ByteArray) { values[k(scope, key)] = value.copyOf() }
    override fun getSecret(scope: String, key: String): ByteArray? = values[k(scope, key)]?.copyOf()
    override fun deleteSecret(scope: String, key: String) { values.remove(k(scope, key)) }
    override fun deleteScope(scope: String) { values.keys.filter { it.startsWith("$scope\u0000") }.toList().forEach(values::remove) }
}

class LgIosProtocolLabIntegrationTest {
    @Test fun initialPairingAgainstHostLab() = runBlocking {
        val profiles = ProfileStore(IosLabPlatformStore(), IosLabSecureStore())
        val remote = LgWebOsRemote(profiles)
        try {
            remote.connect("127.0.0.1")
            val state = withTimeout(15_000) {
                remote.state.filter { it.status == ConnectionStatus.Connected }.first()
            }
            assertEquals(ConnectionStatus.Connected, state.status)
            withTimeout(8_000) { remote.send(RemoteAction.VolumeUp) }
            assertEquals("lab-client-key", profiles.clientKey("127.0.0.1"))
        } finally {
            remote.close()
        }
    }

    @Test fun secureHistoryRejectsWsOnlyLab() = runBlocking {
        val profiles = ProfileStore(IosLabPlatformStore(), IosLabSecureStore())
        profiles.markSecureTransportSucceeded("127.0.0.1")
        val remote = LgWebOsRemote(profiles)
        try {
            remote.connect("127.0.0.1")
            delay(7_000)
            assertNotEquals(ConnectionStatus.Connected, remote.state.value.status)
        } finally {
            remote.close()
        }
    }
}
''',
)

print("Android and iOS Simulator LG protocol integration tests added")
