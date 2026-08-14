#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else "libre-remote-universal")
path = root / "composeApp/src/desktopMain/kotlin/io/github/grupogptespecialeng/libreremote/SecureStore.desktop.kt"
if not path.is_file():
    raise SystemExit(f"missing generated desktop secure store: {path}")

text = path.read_text(encoding="utf-8")
old = "actual fun createPlatformSecureStore(): SecureStore = DesktopSecureStore()"
new = '''actual fun createPlatformSecureStore(): SecureStore =\n    if (System.getenv("LIBRE_REMOTE_TEST_SECURE_STORE") == "1") TestMemorySecureStore else DesktopSecureStore()'''
if old in text:
    text = text.replace(old, new, 1)
elif "LIBRE_REMOTE_TEST_SECURE_STORE" not in text:
    raise SystemExit("desktop SecureStore factory shape changed")

if "private object TestMemorySecureStore" not in text:
    text += r'''

/** Test-only process memory store. It is unreachable unless an explicit test env var is set. */
private object TestMemorySecureStore : SecureStore {
    private val values = linkedMapOf<String, ByteArray>()
    override val available: Boolean = true

    override fun putSecret(scope: String, key: String, value: ByteArray) {
        values["$scope\u0000$key"] = value.copyOf()
    }

    override fun getSecret(scope: String, key: String): ByteArray? =
        values["$scope\u0000$key"]?.copyOf()

    override fun deleteSecret(scope: String, key: String) {
        values.remove("$scope\u0000$key")
    }

    override fun deleteScope(scope: String) {
        val prefix = "$scope\u0000"
        values.keys.filter { it.startsWith(prefix) }.toList().forEach(values::remove)
    }
}
'''

path.write_text(text, encoding="utf-8")
print("test-only desktop SecureStore enabled behind LIBRE_REMOTE_TEST_SECURE_STORE=1")
