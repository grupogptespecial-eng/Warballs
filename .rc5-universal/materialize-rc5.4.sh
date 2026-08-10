#!/usr/bin/env bash
set -euo pipefail

DEST="${1:-libre-remote-universal}"
ROOT="$(pwd)"

sha256_check() {
  local expected="$1"
  local file="$2"
  if command -v sha256sum >/dev/null 2>&1; then
    echo "${expected}  ${file}" | sha256sum -c -
  else
    echo "${expected}  ${file}" | shasum -a 256 -c -
  fi
}

bash .rc5-universal/materialize-rc5.3.sh "$DEST"

cat .rc5-universal/fix-09-rc5.4-final.part-*.b64 | base64 -d > fix09.patch.gz
sha256_check 574166dd07077e85a37799a7e7d6b64b42f61abbe52477eb1618ada31b051b32 fix09.patch.gz
gzip -dc fix09.patch.gz > fix09.patch
sha256_check e9cd00c86d3a60a907ad51c00b8b69861eab5715f324104039c17b3a890854cf fix09.patch
(
  cd "$DEST"
  patch --batch -p1 < "$ROOT/fix09.patch"
)

grep -q 'versionCode = 29' "$DEST/composeApp/build.gradle.kts"
grep -q 'versionName = "2.1.3-rc5.4-customization"' "$DEST/composeApp/build.gradle.kts"
grep -q 'put("appVersion", "2.1.3")' "$DEST/composeApp/src/commonMain/kotlin/io/github/grupogptespecialeng/libreremote/LgWebOsRemote.kt"
grep -q 'enum class RemoteLayoutPreset { Classic, Compact, Minimal, MediaFirst, Custom }' "$DEST/composeApp/src/commonMain/kotlin/io/github/grupogptespecialeng/libreremote/Models.kt"
grep -q 'remoteCustomizationCatalogCoversEveryAction' "$DEST/composeApp/src/commonTest/kotlin/io/github/grupogptespecialeng/libreremote/CoreTest.kt"
grep -q 'LinearEasing' "$DEST/composeApp/src/commonMain/kotlin/io/github/grupogptespecialeng/libreremote/App.kt"

echo "RC5.4 source materialized and verified in $DEST"
