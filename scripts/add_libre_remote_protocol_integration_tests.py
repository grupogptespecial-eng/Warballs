#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else "libre-remote-universal")
pkg = Path("io/github/grupogptespecialeng/libreremote")
tests = root / "composeApp/src/desktopTest/kotlin" / pkg
tests.mkdir(parents=True, exist_ok=True)
path = tests / "LgProtocolLabIntegrationTest.kt"
content = r'''package io.github.grupogptespecialeng.libreremote

import java.io.File
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals

private class LabPlatformStore : PlatformStore {
    private val values = linkedMapOf<String, String>()
    override fun get(key: String): String? = values[key]
    override fun put(key: String, value: String) { values[key] = value }
    override fun remove(key: String) { values.remove(key) }
}

private class LabSecureStore : SecureStore {
    private val values = linkedMapOf<String, ByteArray>()
    override val available: Boolean = true
    private fun k(scope: String, key: String) = "$scope\u0000$key"
    override fun putSecret(scope: String, key: String, value: ByteArray) { values[k(scope, key)] = value.copyOf() }
    override fun getSecret(scope: String, key: String): ByteArray? = values[k(scope, key)]?.copyOf()
    override fun deleteSecret(scope: String, key: String) { values.remove(k(scope, key)) }
    override fun deleteScope(scope: String) { values.keys.filter { it.startsWith("$scope\u0000") }.toList().forEach(values::remove) }
}

private class LgLabProcess : AutoCloseable {
    private val process: Process

    init {
        val python = sequenceOf(
            System.getenv("LIBRE_REMOTE_PYTHON"),
            "python3",
            "python",
        ).filterNotNull().firstOrNull { candidate ->
            runCatching { ProcessBuilder(candidate, "--version").redirectErrorStream(true).start().also { it.waitFor() }.exitValue() == 0 }.getOrDefault(false)
        } ?: error("Python 3 is required for the protocol lab")

        val script = File(System.getProperty("user.dir"), "../protocol-lab/serve_lg_ws_standard.py")
        require(script.isFile) { "protocol lab fixture not found: $script" }
        process = ProcessBuilder(python, script.absolutePath)
            .directory(script.parentFile)
            .redirectErrorStream(true)
            .start()
        val ready = process.inputStream.bufferedReader().readLine()
        require(ready?.startsWith("READY lg-ws") == true) { "LG protocol lab did not become ready: $ready" }
    }

    override fun close() {
        process.destroy()
        if (!process.waitFor(2, java.util.concurrent.TimeUnit.SECONDS)) process.destroyForcibly()
    }
}

class LgProtocolLabIntegrationTest {
    @Test fun firstPairingMayUseLegacyWsAndPersistsClientKeySecurely() = runBlocking {
        LgLabProcess().use {
            val ordinary = LabPlatformStore()
            val secure = LabSecureStore()
            val profiles = ProfileStore(ordinary, secure)
            val remote = LgWebOsRemote(profiles)
            try {
                remote.connect("127.0.0.1")
                val connected = withTimeout(15_000) {
                    remote.state.filter { it.status == ConnectionStatus.Connected }.first()
                }
                assertEquals(ConnectionStatus.Connected, connected.status)
                withTimeout(8_000) { remote.send(RemoteAction.VolumeUp) }
                assertEquals("lab-client-key", profiles.clientKey("127.0.0.1"))
                assertEquals("lab-client-key", secure.getSecret("127.0.0.1", "client-key")?.decodeToString())
            } finally {
                remote.close()
            }
        }
    }

    @Test fun persistedSecureSuccessProhibitsSilentWsDowngrade() = runBlocking {
        LgLabProcess().use {
            val profiles = ProfileStore(LabPlatformStore(), LabSecureStore())
            profiles.markSecureTransportSucceeded("127.0.0.1")
            val remote = LgWebOsRemote(profiles)
            try {
                remote.connect("127.0.0.1")
                // Only ws://127.0.0.1:3000 exists. A previously WSS-pinned TV must
                // never reach Connected by silently downgrading to that server.
                delay(7_000)
                assertNotEquals(ConnectionStatus.Connected, remote.state.value.status)
            } finally {
                remote.close()
            }
        }
    }
}
'''
if not path.exists() or path.read_text(encoding="utf-8") != content:
    path.write_text(content, encoding="utf-8")
    print(f"updated {path}")
print("desktop LG protocol-lab integration tests added")
