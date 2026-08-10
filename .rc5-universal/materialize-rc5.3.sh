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

rm -rf "$DEST"
mkdir -p "$DEST"

cat .rc5-universal/part-*.b64 | base64 -d > rc5.tar.gz
sha256_check b16e7abf44e1445a901b7441850b8cfb321c65770b82a1981cbe06e0f75d0622 rc5.tar.gz
tar -xzf rc5.tar.gz -C "$DEST"

(
  cd "$DEST"
  patch --batch -p1 < "$ROOT/.rc5-universal/fix-01.patch"
)

cat .rc5-universal/fix-03.part-*.b64 | base64 -d > fix03.patch.gz
sha256_check 796c41e0aa2a01935c6cad253d6618c2aa59493367d4ff534e321b0e8dcf0130 fix03.patch.gz
gzip -dc fix03.patch.gz > fix03.patch
sha256_check 25c396feb217a1870d0bfec3db60c829739177bb53430180e6ea06392c37051c fix03.patch
(
  cd "$DEST"
  patch --batch -p1 < "$ROOT/fix03.patch"
  patch --batch -p1 < "$ROOT/.rc5-universal/fix-04-ios-wrapper.patch"
  patch --batch -p1 < "$ROOT/.rc5-universal/fix-05-ios-symbol.patch"
)

base64 -d .rc5-universal/fix-06-rc5.2-input-visual.patch.gz.b64 > fix06.patch.gz
gzip -dc fix06.patch.gz > fix06.patch
sha256_check 2ba3a42f40d21dc5ca39dfa0db68831c6c767ce63fb40f8f83fee6a09f84508d fix06.patch
(
  cd "$DEST"
  patch --batch -p1 < "$ROOT/fix06.patch"
)

cat .rc5-universal/fix-07.part-*.b64 | base64 -d > fix07.patch.gz
sha256_check 665dbbfbfdcf8520249b0a165f2b8ad36b0a2ae58b969d07d6c649533c6ae8c8 fix07.patch.gz
gzip -dc fix07.patch.gz > fix07.patch
sha256_check 399194e7b8d82ceee248a7b59a8758326e22549bf01e0ff5160c400eb95dfef3 fix07.patch
(
  cd "$DEST"
  patch --batch -p1 < "$ROOT/fix07.patch"
)

sha256_check 15160b41177cbae09038207eb77f46a7d2391c8b136cfdcbfb61527d9ac60d14 .rc5-universal/fix-08-rc5.3-ios-auto-fallback.patch
(
  cd "$DEST"
  patch --batch -p1 < "$ROOT/.rc5-universal/fix-08-rc5.3-ios-auto-fallback.patch"
)

test -f "$DEST/composeApp/src/commonMain/kotlin/io/github/grupogptespecialeng/libreremote/RemoteCommandPlan.kt"
test -f "$DEST/composeApp/src/commonMain/kotlin/io/github/grupogptespecialeng/libreremote/Voice.kt"
test -f "$DEST/composeApp/src/commonMain/kotlin/io/github/grupogptespecialeng/libreremote/LocalTvNetwork.kt"
test -f "$DEST/composeApp/src/commonMain/kotlin/io/github/grupogptespecialeng/libreremote/SettingsAudit.kt"
grep -q 'versionName = "2.1.2-rc5.3-voice-settings"' "$DEST/composeApp/build.gradle.kts"
grep -q 'let canFallbackExternally = externalFallback' "$DEST/iosApp/VoiceBridge.swift"

echo "RC5.3 source materialized and verified in $DEST"
