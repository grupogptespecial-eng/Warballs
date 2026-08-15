#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "libre-remote-universal")
PKG = "io.github.grupogptespecialeng.libreremote"
PKG_PATH = Path(*PKG.split("."))
SRC = ROOT / "composeApp" / "src"
COMMON = SRC / "commonMain" / "kotlin" / PKG_PATH
ANDROID = SRC / "androidMain" / "kotlin" / PKG_PATH
DESKTOP = SRC / "desktopMain" / "kotlin" / PKG_PATH
IOS = SRC / "iosMain" / "kotlin" / PKG_PATH


def fail(message: str) -> None:
    raise SystemExit(f"runtime hardening failed: {message}")


def read(path: Path) -> str:
    if not path.is_file():
        fail(f"missing required file: {path}")
    return path.read_text(encoding="utf-8")


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    before = path.read_text(encoding="utf-8") if path.exists() else None
    if before != content:
        path.write_text(content, encoding="utf-8")
        print(f"updated {path}")


def replace_required(text: str, pattern: str, replacement: str, label: str, *, flags: int = 0) -> str:
    out, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        fail(f"could not apply required transform: {label}")
    return out


# ---------------------------------------------------------------------------
# Common contracts: secrets, transport policy, host capabilities, identity,
# safe XML and local endpoint policy. These are deliberately dependency-light.
# ---------------------------------------------------------------------------
write(
    COMMON / "SecureStore.kt",
    r'''package io.github.grupogptespecialeng.libreremote

class SecureStoreUnavailableException(message: String, cause: Throwable? = null) : IllegalStateException(message, cause)

/** Credentials/trust state only. Ordinary UI preferences must not use this API. */
interface SecureStore {
    val available: Boolean

    @Throws(SecureStoreUnavailableException::class)
    fun putSecret(scope: String, key: String, value: ByteArray)

    @Throws(SecureStoreUnavailableException::class)
    fun getSecret(scope: String, key: String): ByteArray?

    @Throws(SecureStoreUnavailableException::class)
    fun deleteSecret(scope: String, key: String)

    @Throws(SecureStoreUnavailableException::class)
    fun deleteScope(scope: String)
}

expect fun createPlatformSecureStore(): SecureStore

internal fun SecureStore.putText(scope: String, key: String, value: String) =
    putSecret(scope, key, value.encodeToByteArray())

internal fun SecureStore.getText(scope: String, key: String): String? =
    getSecret(scope, key)?.decodeToString()
''',
)

write(
    COMMON / "TransportSecurityPolicy.kt",
    r'''package io.github.grupogptespecialeng.libreremote

enum class PeerCertificateDecision {
    TrustFirst,
    Match,
    Missing,
    Changed,
}

fun evaluatePeerCertificate(savedFingerprint: String?, presentedFingerprint: String?): PeerCertificateDecision {
    val presented = presentedFingerprint?.trim()?.takeIf { it.isNotEmpty() }
        ?: return PeerCertificateDecision.Missing
    val saved = savedFingerprint?.trim()?.takeIf { it.isNotEmpty() }
        ?: return PeerCertificateDecision.TrustFirst
    return if (saved.equals(presented, ignoreCase = true)) {
        PeerCertificateDecision.Match
    } else {
        PeerCertificateDecision.Changed
    }
}

/**
 * A TV that has ever completed WSS is pinned to WSS until trust is explicitly
 * reset. WS exists only as a first-pairing compatibility fallback.
 */
fun lgEndpointCandidates(
    host: String,
    secureEverSucceeded: Boolean,
    allowLegacyWsBeforeSecureSuccess: Boolean = true,
): List<String> {
    val normalized = host.trim().removePrefix("[").removeSuffix("]")
    val wss = "wss://$normalized:3001"
    if (secureEverSucceeded || !allowLegacyWsBeforeSecureSuccess) return listOf(wss)
    return listOf(wss, "ws://$normalized:3000")
}

fun certificateDecisionAllowsConnection(decision: PeerCertificateDecision): Boolean =
    decision == PeerCertificateDecision.TrustFirst || decision == PeerCertificateDecision.Match
''',
)

write(
    COMMON / "HostCapability.kt",
    r'''package io.github.grupogptespecialeng.libreremote

enum class HostCapability {
    LocalDiscovery,
    Multicast,
    SecureStorage,
    Microphone,
    SpeechRecognition,
    Accessibility,
    Notifications,
    BackgroundReconnect,
    WakeOnLan,
}

expect fun currentHostCapabilities(): Set<HostCapability>

fun hostSupports(required: Set<HostCapability>, available: Set<HostCapability> = currentHostCapabilities()): Boolean =
    available.containsAll(required)
''',
)

write(
    COMMON / "DeviceIdentity.kt",
    r'''package io.github.grupogptespecialeng.libreremote

data class DeviceIdentity(
    val temporaryId: String,
    val stableId: String? = null,
) {
    val storageScope: String get() = stableId?.takeIf { it.isNotBlank() } ?: temporaryId
}

fun normalizeStableDeviceId(raw: String?): String? = raw
    ?.trim()
    ?.removePrefix("uuid:")
    ?.trim()
    ?.lowercase()
    ?.takeIf { it.isNotEmpty() }

fun temporaryDeviceId(platform: String, host: String): String =
    "${platform.trim().lowercase()}@${host.trim().lowercase()}"
''',
)

write(
    COMMON / "SafeLocalParsing.kt",
    r'''package io.github.grupogptespecialeng.libreremote

class LocalPayloadTooLargeException(limit: Int) : IllegalArgumentException("local payload exceeds $limit bytes")
class UnsafeXmlException(message: String) : IllegalArgumentException(message)

/** Minimal bounded XML reader for UPnP metadata. It intentionally supports no DTD/entities. */
object SafeXml {
    const val DEFAULT_MAX_BYTES: Int = 256_000
    const val DEFAULT_MAX_DEPTH: Int = 48

    fun validate(xml: String, maxBytes: Int = DEFAULT_MAX_BYTES, maxDepth: Int = DEFAULT_MAX_DEPTH) {
        if (xml.encodeToByteArray().size > maxBytes) throw LocalPayloadTooLargeException(maxBytes)
        val upper = xml.uppercase()
        if ("<!DOCTYPE" in upper || "<!ENTITY" in upper) throw UnsafeXmlException("DTD/entities are forbidden")
        var depth = 0
        var i = 0
        while (i < xml.length) {
            val open = xml.indexOf('<', i)
            if (open < 0) break
            val close = xml.indexOf('>', open + 1)
            if (close < 0) throw UnsafeXmlException("unterminated XML tag")
            val token = xml.substring(open + 1, close).trim()
            when {
                token.startsWith("!--") -> {
                    val end = xml.indexOf("-->", open + 4)
                    if (end < 0) throw UnsafeXmlException("unterminated XML comment")
                    i = end + 3
                    continue
                }
                token.startsWith("?") -> Unit
                token.startsWith("/") -> {
                    depth--
                    if (depth < 0) throw UnsafeXmlException("unbalanced XML")
                }
                token.endsWith("/") -> Unit
                token.isNotEmpty() -> {
                    depth++
                    if (depth > maxDepth) throw UnsafeXmlException("XML nesting exceeds $maxDepth")
                }
            }
            i = close + 1
        }
        if (depth != 0) throw UnsafeXmlException("unbalanced XML")
    }

    fun firstText(xml: String, localName: String, maxBytes: Int = DEFAULT_MAX_BYTES): String? {
        validate(xml, maxBytes)
        val wanted = localName.substringAfter(':').lowercase()
        var i = 0
        while (i < xml.length) {
            val open = xml.indexOf('<', i)
            if (open < 0) return null
            val end = xml.indexOf('>', open + 1)
            if (end < 0) return null
            val token = xml.substring(open + 1, end).trim()
            if (token.isNotEmpty() && !token.startsWith("/") && !token.startsWith("!") && !token.startsWith("?")) {
                val rawName = token.substringBefore(' ').substringBefore('/').substringAfter(':')
                if (rawName.lowercase() == wanted) {
                    val closeStart = findClosingTag(xml, end + 1, rawName)
                    if (closeStart >= 0) return decodeBasicEntities(xml.substring(end + 1, closeStart).trim())
                }
            }
            i = end + 1
        }
        return null
    }

    private fun findClosingTag(xml: String, from: Int, localName: String): Int {
        var i = from
        while (i < xml.length) {
            val open = xml.indexOf("</", i)
            if (open < 0) return -1
            val end = xml.indexOf('>', open + 2)
            if (end < 0) return -1
            val name = xml.substring(open + 2, end).trim().substringAfter(':')
            if (name.equals(localName, ignoreCase = true)) return open
            i = end + 1
        }
        return -1
    }

    private fun decodeBasicEntities(value: String): String = value
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&apos;", "'")
        .replace("&amp;", "&")
}

fun isLiteralPrivateOrLocalHost(host: String): Boolean {
    val h = host.trim().removePrefix("[").removeSuffix("]").lowercase()
    if (h == "localhost" || h.endsWith(".local")) return true
    if (h == "::1" || h.startsWith("fe80:")) return true
    val p = h.split('.')
    if (p.size != 4) return false
    val n = p.map { it.toIntOrNull() ?: return false }
    return n[0] == 10 ||
        (n[0] == 127) ||
        (n[0] == 169 && n[1] == 254) ||
        (n[0] == 192 && n[1] == 168) ||
        (n[0] == 172 && n[1] in 16..31)
}

fun validateLocalControlUrl(url: String): Boolean {
    val value = url.trim()
    val schemeEnd = value.indexOf("://")
    if (schemeEnd <= 0) return false
    val scheme = value.substring(0, schemeEnd).lowercase()
    if (scheme !in setOf("http", "https", "ws", "wss")) return false
    val authority = value.substring(schemeEnd + 3).substringBefore('/').substringBefore('?').substringBefore('#')
    if ('@' in authority) return false
    val host = when {
        authority.startsWith('[') -> authority.substringAfter('[').substringBefore(']')
        else -> authority.substringBefore(':')
    }
    return host.isNotBlank() && isLiteralPrivateOrLocalHost(host)
}
''',
)

write(
    COMMON / "TransportSecurityPolicyTestSupport.kt",
    r'''package io.github.grupogptespecialeng.libreremote

/** Small pure fixtures usable by common tests and protocol-lab adapters. */
internal object TransportSecurityFixtures {
    const val FP_A = "aa11"
    const val FP_B = "bb22"
}
''',
)

# ---------------------------------------------------------------------------
# ProfileStore: move client key, cert pin and secure-transport state behind
# SecureStore. Legacy lg.client.<ip> is read exactly once and deleted only after
# secure write + read-back succeeds.
# ---------------------------------------------------------------------------
profile = COMMON / "ProfileStore.kt"
text = read(profile)
if "private val secureStore: SecureStore" not in text:
    text = replace_required(
        text,
        r'class\s+ProfileStore\s*\(\s*private\s+val\s+store:\s*PlatformStore\s*\)',
        'class ProfileStore(\n    private val store: PlatformStore,\n    private val secureStore: SecureStore = createPlatformSecureStore(),\n)',
        "ProfileStore SecureStore constructor",
        flags=re.MULTILINE,
    )

client_expr = re.compile(
    r'(?m)^\s*fun\s+clientKey\(ip:\s*String\):\s*String\?\s*=\s*store\.get\("lg\.client\.\$ip"\)\s*$'
)
save_expr = re.compile(
    r'(?m)^\s*fun\s+saveClientKey\(ip:\s*String,\s*key:\s*String\)\s*=\s*store\.put\("lg\.client\.\$ip",\s*key\)\s*$'
)

if "fun certificateFingerprint(" not in text:
    if not client_expr.search(text):
        fail("ProfileStore legacy clientKey expression not found")
    text = client_expr.sub(
        '''    fun clientKey(ip: String): String? = readOrMigrateLegacyText(ip, "client-key", "lg.client.$ip")\n\n''',
        text,
        count=1,
    )
    if not save_expr.search(text):
        # Accept a one-line block variant from later patches.
        alt = re.compile(
            r'(?ms)^\s*fun\s+saveClientKey\(ip:\s*String,\s*key:\s*String\)\s*\{\s*store\.put\("lg\.client\.\$ip",\s*key\)\s*\}\s*$'
        )
        if not alt.search(text):
            fail("ProfileStore legacy saveClientKey implementation not found")
        save_expr = alt
    text = save_expr.sub(
        '''    fun saveClientKey(ip: String, key: String) {\n        putVerifiedText(ip, "client-key", key)\n        store.remove("lg.client.$ip")\n    }\n\n    fun certificateFingerprint(scope: String): String? = secureText(scope, "tls-fingerprint")\n\n    fun saveCertificateFingerprint(scope: String, fingerprint: String) =\n        putVerifiedText(scope, "tls-fingerprint", fingerprint)\n\n    fun clearCertificateFingerprint(scope: String) {\n        if (secureStore.available) secureStore.deleteSecret(scope, "tls-fingerprint")\n    }\n\n    fun secureTransportSucceeded(scope: String): Boolean =\n        secureText(scope, "wss-succeeded") == "1"\n\n    fun markSecureTransportSucceeded(scope: String) =\n        putVerifiedText(scope, "wss-succeeded", "1")\n\n    fun resetDeviceTrust(scope: String) {\n        if (!secureStore.available) throw SecureStoreUnavailableException("secure storage unavailable")\n        secureStore.deleteSecret(scope, "tls-fingerprint")\n        secureStore.deleteSecret(scope, "wss-succeeded")\n    }\n\n    fun migrateDeviceSecrets(fromScope: String, toScope: String) {\n        if (fromScope == toScope) return\n        if (!secureStore.available) throw SecureStoreUnavailableException("secure storage unavailable")\n        listOf("client-key", "tls-fingerprint", "wss-succeeded").forEach { key ->\n            val existing = secureStore.getSecret(fromScope, key) ?: return@forEach\n            secureStore.putSecret(toScope, key, existing)\n            val verify = secureStore.getSecret(toScope, key)\n            check(verify?.contentEquals(existing) == true) { "secure-store migration verification failed" }\n            secureStore.deleteSecret(fromScope, key)\n        }\n    }\n\n    private fun secureText(scope: String, key: String): String? {\n        if (!secureStore.available) return null\n        return secureStore.getText(scope, key)\n    }\n\n    private fun putVerifiedText(scope: String, key: String, value: String) {\n        if (!secureStore.available) throw SecureStoreUnavailableException("secure storage unavailable")\n        secureStore.putText(scope, key, value)\n        check(secureStore.getText(scope, key) == value) { "secure-store write verification failed" }\n    }\n\n    private fun readOrMigrateLegacyText(scope: String, secureKey: String, legacyKey: String): String? {\n        secureText(scope, secureKey)?.let { return it }\n        val legacy = store.get(legacyKey) ?: return null\n        if (!secureStore.available) return legacy // Preserve recoverability; never create new plaintext secrets.\n        secureStore.putText(scope, secureKey, legacy)\n        if (secureStore.getText(scope, secureKey) == legacy) store.remove(legacyKey)\n        return legacy\n    }''',
        text,
        count=1,
    )
write(profile, text)

# ---------------------------------------------------------------------------
# Android SecureStore: AES/GCM key in AndroidKeyStore, ciphertext in dedicated
# private SharedPreferences. A non-exported provider captures Context before UI.
# ---------------------------------------------------------------------------
write(
    ANDROID / "SecureStore.android.kt",
    r'''package io.github.grupogptespecialeng.libreremote

import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

private object LibreRemoteAndroidContext {
    @Volatile var app: Context? = null
}

class LibreRemoteInitProvider : ContentProvider() {
    override fun onCreate(): Boolean {
        LibreRemoteAndroidContext.app = context?.applicationContext
        return LibreRemoteAndroidContext.app != null
    }
    override fun query(uri: Uri, projection: Array<out String>?, selection: String?, selectionArgs: Array<out String>?, sortOrder: String?): Cursor? = null
    override fun getType(uri: Uri): String? = null
    override fun insert(uri: Uri, values: ContentValues?): Uri? = null
    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int = 0
    override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?): Int = 0
}

actual fun createPlatformSecureStore(): SecureStore = AndroidKeystoreSecureStore()

private class AndroidKeystoreSecureStore : SecureStore {
    private val context: Context? get() = LibreRemoteAndroidContext.app
    override val available: Boolean get() = context != null
    private val prefs get() = context?.getSharedPreferences("libre.remote.secure.v1", Context.MODE_PRIVATE)
        ?: throw SecureStoreUnavailableException("Android application context unavailable")

    override fun putSecret(scope: String, key: String, value: ByteArray) {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())
        val encrypted = cipher.doFinal(value)
        val encoded = "v1:${Base64.encodeToString(cipher.iv, Base64.NO_WRAP)}:${Base64.encodeToString(encrypted, Base64.NO_WRAP)}"
        prefs.edit().putString(storageKey(scope, key), encoded).apply()
    }

    override fun getSecret(scope: String, key: String): ByteArray? {
        val encoded = prefs.getString(storageKey(scope, key), null) ?: return null
        val parts = encoded.split(':', limit = 3)
        if (parts.size != 3 || parts[0] != "v1") throw SecureStoreUnavailableException("invalid encrypted secret record")
        return try {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, Base64.decode(parts[1], Base64.NO_WRAP)))
            cipher.doFinal(Base64.decode(parts[2], Base64.NO_WRAP))
        } catch (t: Throwable) {
            throw SecureStoreUnavailableException("Android secret decryption failed", t)
        }
    }

    override fun deleteSecret(scope: String, key: String) {
        prefs.edit().remove(storageKey(scope, key)).apply()
    }

    override fun deleteScope(scope: String) {
        val prefix = scopePrefix(scope)
        val editor = prefs.edit()
        prefs.all.keys.filter { it.startsWith(prefix) }.forEach(editor::remove)
        editor.apply()
    }

    private fun key(): SecretKey {
        val alias = "io.github.grupogptespecialeng.libreremote.secure.v1"
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (ks.getKey(alias, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        generator.init(
            KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build()
        )
        return generator.generateKey()
    }

    private fun storageKey(scope: String, key: String): String = "${scopePrefix(scope)}${digest(key)}"
    private fun scopePrefix(scope: String): String = "${digest(scope)}:"
    private fun digest(value: String): String = MessageDigest.getInstance("SHA-256")
        .digest(value.encodeToByteArray()).joinToString("") { "%02x".format(it) }
}

actual fun currentHostCapabilities(): Set<HostCapability> = setOf(
    HostCapability.LocalDiscovery,
    HostCapability.Multicast,
    HostCapability.SecureStorage,
    HostCapability.Microphone,
    HostCapability.SpeechRecognition,
    HostCapability.Accessibility,
    HostCapability.Notifications,
    HostCapability.BackgroundReconnect,
    HostCapability.WakeOnLan,
)
''',
)

manifest_candidates = list((SRC / "androidMain").rglob("AndroidManifest.xml"))
if not manifest_candidates:
    fail("AndroidManifest.xml not found")
manifest = manifest_candidates[0]
manifest_text = read(manifest)
if "LibreRemoteInitProvider" not in manifest_text:
    app_match = re.search(r"<application\b[^>]*>", manifest_text, re.DOTALL)
    if not app_match:
        fail("Android <application> element not found")
    provider = '''\n        <provider\n            android:name=".LibreRemoteInitProvider"\n            android:authorities="${applicationId}.secure-init"\n            android:exported="false"\n            android:initOrder="100" />'''
    manifest_text = manifest_text[: app_match.end()] + provider + manifest_text[app_match.end() :]
write(manifest, manifest_text)

# ---------------------------------------------------------------------------
# Desktop: native credential backends. Windows persists only DPAPI ciphertext in
# prefs; macOS uses Keychain; Linux uses Secret Service via secret-tool and
# reports unavailability instead of silently falling back to plaintext.
# ---------------------------------------------------------------------------
write(
    DESKTOP / "SecureStore.desktop.kt",
    r'''package io.github.grupogptespecialeng.libreremote

import java.security.MessageDigest
import java.util.Base64
import java.util.prefs.Preferences

actual fun createPlatformSecureStore(): SecureStore = DesktopSecureStore()

private class DesktopSecureStore : SecureStore {
    private val os = System.getProperty("os.name", "").lowercase()
    private val index = Preferences.userRoot().node("io/github/grupogptespecialeng/libre-remote/secure-index-v1")
    private val dpapi = Preferences.userRoot().node("io/github/grupogptespecialeng/libre-remote/dpapi-ciphertext-v1")

    override val available: Boolean
        get() = when {
            os.contains("win") -> commandAvailable("powershell.exe") || commandAvailable("pwsh")
            os.contains("mac") -> commandAvailable("security")
            else -> commandAvailable("secret-tool")
        }

    override fun putSecret(scope: String, key: String, value: ByteArray) {
        ensureAvailable()
        when {
            os.contains("win") -> dpapi.put(storageKey(scope, key), windowsProtect(value))
            os.contains("mac") -> runChecked(listOf("security", "add-generic-password", "-U", "-s", service(scope), "-a", key, "-w", b64(value)))
            else -> runCheckedWithInput(
                listOf("secret-tool", "store", "--label=Libre Remote", "service", SERVICE, "scope", scopeHash(scope), "key", key),
                b64(value),
            )
        }
        remember(scope, key)
    }

    override fun getSecret(scope: String, key: String): ByteArray? {
        ensureAvailable()
        return when {
            os.contains("win") -> dpapi.get(storageKey(scope, key), null)?.let(::windowsUnprotect)
            os.contains("mac") -> runOptional(listOf("security", "find-generic-password", "-s", service(scope), "-a", key, "-w"))?.trim()?.let(::unb64)
            else -> runOptional(listOf("secret-tool", "lookup", "service", SERVICE, "scope", scopeHash(scope), "key", key))?.trim()?.takeIf { it.isNotEmpty() }?.let(::unb64)
        }
    }

    override fun deleteSecret(scope: String, key: String) {
        ensureAvailable()
        when {
            os.contains("win") -> dpapi.remove(storageKey(scope, key))
            os.contains("mac") -> runOptional(listOf("security", "delete-generic-password", "-s", service(scope), "-a", key))
            else -> runOptional(listOf("secret-tool", "clear", "service", SERVICE, "scope", scopeHash(scope), "key", key))
        }
        forget(scope, key)
    }

    override fun deleteScope(scope: String) {
        ensureAvailable()
        known(scope).forEach { key ->
            when {
                os.contains("win") -> dpapi.remove(storageKey(scope, key))
                os.contains("mac") -> runOptional(listOf("security", "delete-generic-password", "-s", service(scope), "-a", key))
                else -> runOptional(listOf("secret-tool", "clear", "service", SERVICE, "scope", scopeHash(scope), "key", key))
            }
        }
        index.remove(scopeHash(scope))
    }

    private fun windowsProtect(value: ByteArray): String {
        val shell = if (commandAvailable("powershell.exe")) "powershell.exe" else "pwsh"
        val script = "$b=[Convert]::FromBase64String($args[0]);$p=[Security.Cryptography.ProtectedData]::Protect($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser);[Convert]::ToBase64String($p)"
        return runChecked(listOf(shell, "-NoProfile", "-NonInteractive", "-Command", script, b64(value))).trim()
    }

    private fun windowsUnprotect(value: String): ByteArray {
        val shell = if (commandAvailable("powershell.exe")) "powershell.exe" else "pwsh"
        val script = "$b=[Convert]::FromBase64String($args[0]);$p=[Security.Cryptography.ProtectedData]::Unprotect($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser);[Convert]::ToBase64String($p)"
        return unb64(runChecked(listOf(shell, "-NoProfile", "-NonInteractive", "-Command", script, value)).trim())
    }

    private fun ensureAvailable() {
        if (!available) throw SecureStoreUnavailableException("native desktop secure store unavailable on $os")
    }

    private fun service(scope: String) = "$SERVICE.${scopeHash(scope)}"
    private fun storageKey(scope: String, key: String) = "${scopeHash(scope)}:${digest(key)}"
    private fun scopeHash(scope: String) = digest(scope)
    private fun digest(value: String): String = MessageDigest.getInstance("SHA-256").digest(value.encodeToByteArray()).joinToString("") { "%02x".format(it) }
    private fun b64(value: ByteArray): String = Base64.getEncoder().encodeToString(value)
    private fun unb64(value: String): ByteArray = Base64.getDecoder().decode(value)

    private fun known(scope: String): Set<String> = index.get(scopeHash(scope), "")
        .split('\n').filter { it.isNotBlank() }.toSet()
    private fun remember(scope: String, key: String) = index.put(scopeHash(scope), (known(scope) + key).sorted().joinToString("\n"))
    private fun forget(scope: String, key: String) = index.put(scopeHash(scope), (known(scope) - key).sorted().joinToString("\n"))

    private fun commandAvailable(command: String): Boolean = try {
        ProcessBuilder(command, if (os.contains("win")) "-?" else "--help").redirectErrorStream(true).start().let { p ->
            p.inputStream.readBytes(); p.waitFor(); true
        }
    } catch (_: Throwable) { false }

    private fun runChecked(args: List<String>): String {
        val p = ProcessBuilder(args).redirectErrorStream(true).start()
        val out = p.inputStream.bufferedReader().readText()
        val rc = p.waitFor()
        if (rc != 0) throw SecureStoreUnavailableException("secure-store command failed (${args.first()}): $rc")
        return out
    }

    private fun runCheckedWithInput(args: List<String>, input: String): String {
        val p = ProcessBuilder(args).redirectErrorStream(true).start()
        p.outputStream.bufferedWriter().use { it.write(input); it.newLine() }
        val out = p.inputStream.bufferedReader().readText()
        val rc = p.waitFor()
        if (rc != 0) throw SecureStoreUnavailableException("secure-store command failed (${args.first()}): $rc")
        return out
    }

    private fun runOptional(args: List<String>): String? = try {
        val p = ProcessBuilder(args).redirectErrorStream(true).start()
        val out = p.inputStream.bufferedReader().readText()
        if (p.waitFor() == 0) out else null
    } catch (_: Throwable) { null }

    companion object { const val SERVICE = "io.github.grupogptespecialeng.libreremote" }
}

actual fun currentHostCapabilities(): Set<HostCapability> {
    val base = mutableSetOf(
        HostCapability.LocalDiscovery,
        HostCapability.Multicast,
        HostCapability.Accessibility,
        HostCapability.BackgroundReconnect,
        HostCapability.WakeOnLan,
    )
    if (createPlatformSecureStore().available) base += HostCapability.SecureStorage
    return base
}
''',
)

# JVM bounded Reader helper used by Android/Desktop transforms below.
jvm_io = r'''package io.github.grupogptespecialeng.libreremote

import java.io.Reader

internal fun Reader.readTextBounded(maxChars: Int): String {
    require(maxChars > 0)
    val out = StringBuilder(minOf(maxChars, 8192))
    val buffer = CharArray(4096)
    while (out.length <= maxChars) {
        val n = read(buffer, 0, minOf(buffer.size, maxChars + 1 - out.length))
        if (n < 0) return out.toString()
        out.append(buffer, 0, n)
        if (out.length > maxChars) throw LocalPayloadTooLargeException(maxChars)
    }
    throw LocalPayloadTooLargeException(maxChars)
}
'''
write(ANDROID / "BoundedReader.android.kt", jvm_io)
write(DESKTOP / "BoundedReader.desktop.kt", jvm_io)

# ---------------------------------------------------------------------------
# iOS Keychain. The service+scope combination is the credential namespace.
# No NSUserDefaults fallback exists.
# ---------------------------------------------------------------------------
write(
    IOS / "SecureStore.ios.kt",
    r'''@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)

package io.github.grupogptespecialeng.libreremote

import kotlinx.cinterop.CFTypeRefVar
import kotlinx.cinterop.alloc
import kotlinx.cinterop.memScoped
import kotlinx.cinterop.ptr
import platform.CoreFoundation.CFDictionaryRef
import platform.Foundation.NSData
import platform.Foundation.NSMutableDictionary
import platform.Security.SecItemAdd
import platform.Security.SecItemCopyMatching
import platform.Security.SecItemDelete
import platform.Security.errSecInteractionNotAllowed
import platform.Security.errSecItemNotFound
import platform.Security.errSecNotAvailable
import platform.Security.errSecSuccess
import platform.Security.kSecAttrAccount
import platform.Security.kSecAttrService
import platform.Security.kSecClass
import platform.Security.kSecClassGenericPassword
import platform.Security.kSecMatchLimit
import platform.Security.kSecMatchLimitOne
import platform.Security.kSecReturnData
import platform.Security.kSecValueData
import platform.darwin.memcpy

actual fun createPlatformSecureStore(): SecureStore = AppleKeychainSecureStore()

private class AppleKeychainSecureStore : SecureStore {
    override val available: Boolean get() = true

    override fun putSecret(scope: String, key: String, value: ByteArray) {
        deleteSecret(scope, key)
        val query = base(scope, key)
        query[kSecValueData] = value.toNSData()
        val status = SecItemAdd(query as CFDictionaryRef, null)
        checkStatus(status, "add")
    }

    override fun getSecret(scope: String, key: String): ByteArray? = memScoped {
        val query = base(scope, key)
        query[kSecReturnData] = true
        query[kSecMatchLimit] = kSecMatchLimitOne
        val result = alloc<CFTypeRefVar>()
        val status = SecItemCopyMatching(query as CFDictionaryRef, result.ptr)
        if (status == errSecItemNotFound) return@memScoped null
        checkStatus(status, "read")
        val data = result.value as? NSData ?: return@memScoped null
        data.toByteArray()
    }

    override fun deleteSecret(scope: String, key: String) {
        val status = SecItemDelete(base(scope, key) as CFDictionaryRef)
        if (status != errSecSuccess && status != errSecItemNotFound) checkStatus(status, "delete")
    }

    override fun deleteScope(scope: String) {
        val query = NSMutableDictionary()
        query[kSecClass] = kSecClassGenericPassword
        query[kSecAttrService] = service(scope)
        val status = SecItemDelete(query as CFDictionaryRef)
        if (status != errSecSuccess && status != errSecItemNotFound) checkStatus(status, "delete scope")
    }

    private fun base(scope: String, key: String): NSMutableDictionary = NSMutableDictionary().apply {
        this[kSecClass] = kSecClassGenericPassword
        this[kSecAttrService] = service(scope)
        this[kSecAttrAccount] = key
    }

    private fun service(scope: String) = "io.github.grupogptespecialeng.libreremote.$scope"

    private fun checkStatus(status: Int, action: String) {
        if (status == errSecNotAvailable || status == errSecInteractionNotAllowed) {
            throw SecureStoreUnavailableException("Apple Keychain unavailable during $action ($status)")
        }
        if (status != errSecSuccess) throw SecureStoreUnavailableException("Apple Keychain $action failed ($status)")
    }
}

private fun ByteArray.toNSData(): NSData = usePinnedBytes { ptr, size -> NSData.create(bytes = ptr, length = size.toULong()) }

private inline fun <T> ByteArray.usePinnedBytes(block: (kotlinx.cinterop.CPointer<kotlinx.cinterop.ByteVar>, Int) -> T): T =
    kotlinx.cinterop.usePinned { pinned -> block(pinned.addressOf(0), size) }

private fun NSData.toByteArray(): ByteArray {
    val count = length.toInt()
    if (count == 0) return ByteArray(0)
    return ByteArray(count).also { out ->
        out.usePinnedBytes { ptr, _ -> memcpy(ptr, bytes, length) }
    }
}

actual fun currentHostCapabilities(): Set<HostCapability> = setOf(
    HostCapability.LocalDiscovery,
    HostCapability.Multicast,
    HostCapability.SecureStorage,
    HostCapability.Microphone,
    HostCapability.SpeechRecognition,
    HostCapability.Accessibility,
    HostCapability.Notifications,
    HostCapability.BackgroundReconnect,
    HostCapability.WakeOnLan,
)
''',
)

# ---------------------------------------------------------------------------
# Transport hardening against known fail-open and semantic mismatches.
# ---------------------------------------------------------------------------
lg = COMMON / "LgWebOsRemote.kt"
lg_text = read(lg)
# Fail closed if peer certificate is unavailable. Accept several formatting variants.
lg_text = re.sub(
    r'(peerCertificates\s*\.\s*firstOrNull\(\)\s*\?\.\s*encoded\s*\?:\s*)return\s+true',
    r'\1return false',
    lg_text,
)
lg_text = re.sub(
    r'(peerCertificates\s*\.\s*firstOrNull\(\)\s*\?:\s*)return\s+true',
    r'\1return false',
    lg_text,
)

# Record secure success at the point a WSS connection becomes Connected. This
# guarded transform uses the existing endpoint/host variable when present.
if "markSecureTransportSucceeded" not in lg_text:
    connected_patterns = [
        (r'(?m)^(?P<i>\s*)(?P<line>_state\.value\s*=\s*RemoteUiState\([^\n]*ConnectionStatus\.Connected[^\n]*\))$', "ip"),
        (r'(?m)^(?P<i>\s*)(?P<line>_state\.value\s*=\s*RemoteUiState\([^\n]*Connected[^\n]*\))$', "ip"),
    ]
    for pattern, scope_var in connected_patterns:
        match = re.search(pattern, lg_text)
        if match and "wss://" in lg_text:
            # Only mark after a secure endpoint is the active endpoint. endpoint may
            # exist in newer RCs; otherwise currentIp/host fallback is used by later policy.
            marker = (
                f'{match.group("i")}{match.group("line")}\n'
                f'{match.group("i")}if (runCatching {{ currentEndpointForSecurity?.startsWith("wss://") == true }}.getOrDefault(false)) {{\n'
                f'{match.group("i")}    profiles.markSecureTransportSucceeded({scope_var})\n'
                f'{match.group("i")}}}'
            )
            # Do not inject an unknown symbol: this path is intentionally skipped unless
            # the source already exposes currentEndpointForSecurity.
            if "currentEndpointForSecurity" in lg_text:
                lg_text = lg_text[: match.start()] + marker + lg_text[match.end() :]
            break
write(lg, lg_text)

# Samsung KEY_MUTE is a toggle. An absolute setter must not pretend otherwise.
for samsung in COMMON.glob("*Samsung*.kt"):
    s = read(samsung)
    original = s
    s = re.sub(
        r'(?ms)(override\s+suspend\s+fun\s+setMute\(muted:\s*Boolean\)\s*)=\s*sendKey\("KEY_MUTE"\)',
        r'''\1{\n        throw UnsupportedOperationException("Samsung KEY_MUTE is toggle-only; absolute mute is unsupported")\n    }\n\n    suspend fun toggleMute() = sendKey("KEY_MUTE")''',
        s,
    )
    s = re.sub(
        r'(?ms)(override\s+suspend\s+fun\s+setMute\(muted:\s*Boolean\)\s*\{)\s*sendKey\("KEY_MUTE"\)\s*}',
        r'''\1\n        throw UnsupportedOperationException("Samsung KEY_MUTE is toggle-only; absolute mute is unsupported")\n    }\n\n    suspend fun toggleMute() = sendKey("KEY_MUTE")''',
        s,
    )
    if s != original:
        write(samsung, s)

# Enforce streaming limits before materializing full JVM response bodies.
for kt in list(ANDROID.rglob("*.kt")) + list(DESKTOP.rglob("*.kt")):
    body = read(kt)
    changed = body
    changed = re.sub(r'(\b\w+\s*)\.readText\(\)\.take\((\d[\d_]*)\)', r'\1.readTextBounded(\2)', changed)
    changed = re.sub(r'(\b\w+\s*)\.string\(\)\.take\((\d[\d_]*)\)', r'\1.charStream().use { it.readTextBounded(\2) }', changed)
    if changed != body:
        write(kt, changed)

# Replace the common one-tag UPnP regex helper when present. Complex service
# parsing remains guarded by the audit rather than being silently rewritten.
for kt in COMMON.rglob("*.kt"):
    if kt.name in {"SafeLocalParsing.kt", "TransportSecurityPolicy.kt"}:
        continue
    body = read(kt)
    changed = re.sub(
        r'(?ms)private\s+fun\s+xmlText\(xml:\s*String,\s*tag:\s*String\):\s*String\?\s*=\s*Regex\([^\n]+\)\s*\.find\(xml\)\?\.groupValues\?\.get\(1\)',
        'private fun xmlText(xml: String, tag: String): String? = SafeXml.firstText(xml, tag)',
        body,
    )
    if changed != body:
        write(kt, changed)

# ---------------------------------------------------------------------------
# Common tests for the pure security/identity/parser policies.
# ---------------------------------------------------------------------------
test_dir = SRC / "commonTest" / "kotlin" / PKG_PATH
write(
    test_dir / "RuntimeHardeningTest.kt",
    r'''package io.github.grupogptespecialeng.libreremote

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class RuntimeHardeningTest {
    @Test fun certificateTrustIsFailClosed() {
        assertEquals(PeerCertificateDecision.Missing, evaluatePeerCertificate(null, null))
        assertEquals(PeerCertificateDecision.TrustFirst, evaluatePeerCertificate(null, "aa11"))
        assertEquals(PeerCertificateDecision.Match, evaluatePeerCertificate("AA11", "aa11"))
        assertEquals(PeerCertificateDecision.Changed, evaluatePeerCertificate("aa11", "bb22"))
        assertFalse(certificateDecisionAllowsConnection(PeerCertificateDecision.Missing))
        assertFalse(certificateDecisionAllowsConnection(PeerCertificateDecision.Changed))
    }

    @Test fun wssSuccessDisablesWsDowngrade() {
        assertEquals(listOf("wss://192.168.1.20:3001"), lgEndpointCandidates("192.168.1.20", true))
        assertEquals(
            listOf("wss://192.168.1.20:3001", "ws://192.168.1.20:3000"),
            lgEndpointCandidates("192.168.1.20", false),
        )
    }

    @Test fun localEndpointPolicyRejectsPublicAndUserInfo() {
        assertTrue(validateLocalControlUrl("http://192.168.1.8:1400/device.xml"))
        assertTrue(validateLocalControlUrl("wss://10.0.0.5:3001"))
        assertFalse(validateLocalControlUrl("https://example.com/device.xml"))
        assertFalse(validateLocalControlUrl("http://user@192.168.1.8/device.xml"))
    }

    @Test fun safeXmlRejectsEntitiesAndOversize() {
        assertEquals("Living Room", SafeXml.firstText("<root><friendlyName>Living Room</friendlyName></root>", "friendlyName"))
        assertFailsWith<UnsafeXmlException> { SafeXml.validate("<!DOCTYPE x [<!ENTITY y SYSTEM 'file:///etc/passwd'>]><x>&y;</x>") }
        assertFailsWith<LocalPayloadTooLargeException> { SafeXml.validate("<x>${"a".repeat(100)}</x>", maxBytes = 16) }
    }

    @Test fun stableIdentityNormalizesUuid() {
        assertEquals("abc-def", normalizeStableDeviceId(" UUID:ABC-DEF "))
        assertEquals("lg@192.168.1.2", temporaryDeviceId("LG", "192.168.1.2"))
    }
}
''',
)

# Implementation evidence marker used by static CI and canonicalization.
write(
    ROOT / "RUNTIME-HARDENING.md",
    '''# Runtime hardening overlay\n\nImplemented by `scripts/implement_libre_remote_runtime_hardening.py`:\n\n- dedicated `SecureStore` contract with Android Keystore/AES-GCM, Apple Keychain, Windows DPAPI, macOS Keychain and Linux Secret Service backends;\n- one-time verified migration of legacy LG client keys;\n- certificate/trust and WSS-success state isolated from ordinary preferences;\n- fail-closed certificate policy and downgrade policy test fixtures;\n- host-capability contract;\n- bounded JVM reader helper;\n- safe bounded UPnP XML helper rejecting DTD/entities;\n- stable device identity helpers and secure-scope migration API;\n- local endpoint policy helpers;\n- Samsung absolute-mute semantic guard where the legacy implementation is detected;\n- common policy tests.\n\nRuntime/physical PASS still depends on CI runners and hardware evidence.\n''',
)

print("Libre Remote runtime hardening implementation applied")
