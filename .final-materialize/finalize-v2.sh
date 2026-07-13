#!/usr/bin/env bash
set -euo pipefail

cd "${1:-.}"
APP="lg-wifi-remote-app"

# Remove temporary transport/diagnostic files used while preparing the project.
rm -rf .final-overlay .final-overlay-hex .final-overlay-v2 .final-source-hex-v3 \
  .final-source-hex-remainder .final-source-hex-remainder2 .final-source-hex-remainder3 \
  .final-source-hex-remainder4 .final-source-hex-remainder5 .final-source-hex-remainder6 \
  .final-source-hex-remainder7 .final-source-hex-remainder8 .final-source-hex-remainder9 \
  .final-source-hex-remainder10 .final-source-hex-remainder11 .final-source-hex-remainder12 \
  .final-source-hex-remainder13 .final-source-hex-remainder14 .final-source-hex-remainder15 \
  .final-source-hex-remainder16 .final-source-hex-remainder17 .final-source-hex-remainder18 \
  .final-source-hex-remainder19 .final-source-hex-remainder20 .final-source-hex-remainder21 \
  .final-source-hex-remainder22 .final-source-hex-remainder23 .final-source-hex-remainder24 \
  .final-source-hex-remainder25 .final-source-hex-remainder26 .final-source-hex-remainder27 \
  .final-source-hex-remainder28 .final-source-hex-remainder29 .final-source-hex-remainder30 \
  .final-source-hex-remainder31 .final-source-hex-remainder32 .final-source-hex-remainder33 \
  .final-source-hex-remainder34 .final-source-hex-remainder35 .final-source-hex-remainder36 \
  .final-source-hex-remainder37 .final-source-hex-remainder38 .final-source-hex-remainder39 \
  .final-source-hex-remainder40 .final-source-hex-remainder41 .final-source-hex-remainder42 \
  .final-source-hex-remainder43 .final-source-hex-remainder44 .final-source-hex-remainder45 \
  .final-source-hex-remainder46 .final-source-hex-remainder47 .final-source-hex-remainder48 \
  .final-source-hex-remainder49 .final-source-hex-remainder50 .final-materialize \
  .universal-overlay .universal-overlay-v2

# Remove build trigger files and local packaging leftovers.
find "$APP" -maxdepth 1 -type f \( -name '.*trigger*' -o -name '.universal-*' -o -name '.final-*' \) -delete || true

python3 - <<'PY'
from pathlib import Path

root = Path('lg-wifi-remote-app')
controls = root / 'app/src/main/java/com/geronimo/controlelgwifi/RemoteControls.kt'
text = controls.read_text()
text = text.replace(
'''        DirectionButton(
            action = RemoteAction.Up,
            icon = Icons.Filled.ArrowUpward,
            description = "Cima",
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 16.dp)
        )''',
'''        DirectionButton(
            action = RemoteAction.Up,
            icon = Icons.Filled.ArrowUpward,
            description = "Cima",
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 16.dp),
            onAction = onAction
        )''')
text = text.replace(
'''                RemoteModule.Numeric -> item {
                    NumericPad(onAction)
                }
                RemoteModule.Colors -> item {
                    ColoredKeys(onAction)
                }''',
'''                RemoteModule.Numeric -> item {
                    WideActionButton("Teclado numérico", Icons.Filled.Dialpad, onOpenMore)
                }
                RemoteModule.Colors -> item {
                    WideActionButton("Botões coloridos", Icons.Filled.SmartDisplay, onOpenMore)
                }''')
if 'import androidx.compose.ui.input.pointer.positionChange' not in text:
    text = text.replace('import androidx.compose.ui.input.pointer.pointerInput\n', 'import androidx.compose.ui.input.pointer.pointerInput\nimport androidx.compose.ui.input.pointer.positionChange\n')
controls.write_text(text)

main = root / 'app/src/main/java/com/geronimo/controlelgwifi/MainActivity.kt'
text = main.read_text()
if 'import androidx.compose.foundation.lazy.items\n' not in text:
    text = text.replace('import androidx.compose.foundation.lazy.LazyColumn\n', 'import androidx.compose.foundation.lazy.LazyColumn\nimport androidx.compose.foundation.lazy.items\n')
main.write_text(text)
PY

mkdir -p "$APP/.github/workflows" "$APP/docs" "$APP/store-listing" "$APP/app/src/test/java/com/geronimo/controlelgwifi"

cat > "$APP/README.md" <<'EOF'
# Libre Remote

**Libre Remote** é um controle remoto Android local, privado e open source para Smart TVs.

A interface começa simples: abra o app, encontre a TV e use o controle. Recursos avançados ficam disponíveis por capacidades, sem mostrar botões que o aparelho não suporta.

## Compatibilidade atual

| Plataforma | Nível nesta versão |
|---|---|
| LG webOS | Controle local completo, principal backend |
| Samsung Tizen local | Beta experimental; exige validação por modelo/firmware |
| DLNA / UPnP AV | Mídia, volume e mudo quando anunciados pela TV |
| Google Cast / SmartThings | Arquitetura documentada, mas integração oficial não incluída nesta build |
| TVs sem protocolo de rede | Precisam de emissor IR ou bridge externo |

Consulte [`COMPATIBILITY.md`](COMPATIBILITY.md). O projeto não promete controlar toda TV: ele detecta o que está disponível e monta o melhor controle possível.

## Recursos

- conexão e reconexão local;
- várias TVs e cômodos;
- presets Simples, Normal, Avançado e três personalizados;
- touchpad, teclado, apps e entradas quando suportados;
- macros limitadas e canceláveis;
- widget, atalhos do launcher e Quick Settings;
- comando de voz interpretado localmente após o reconhecimento do Android;
- diagnóstico sanitizado e métricas locais de latência;
- tema claro, escuro, AMOLED, alto contraste e controles maiores;
- sem anúncios, analytics ou conta Libre Remote.

## Privacidade

O app não opera servidor próprio e não envia telemetria. Tokens de pareamento ficam criptografados no aparelho. Serviços opcionais do sistema operacional, como reconhecimento de voz, podem seguir as políticas do provedor configurado no Android. Leia [`PRIVACY.md`](PRIVACY.md).

## Desenvolvimento

```bash
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleDebug
```

Para release assinada, leia [`BUILDING.md`](BUILDING.md) e [`RELEASING.md`](RELEASING.md).

## Contribuição

Leia [`CONTRIBUTING.md`](CONTRIBUTING.md), [`ARCHITECTURE.md`](ARCHITECTURE.md), [`TESTING.md`](TESTING.md) e [`SECURITY.md`](SECURITY.md). Relatórios de compatibilidade precisam citar modelo e firmware exatos e nunca devem incluir tokens, senhas ou certificados completos.

## Licença e marcas

Código sob **GPL-3.0-or-later**. LG, webOS, Samsung, Tizen, Android, Google TV e demais marcas pertencem aos respectivos titulares. O Libre Remote é um projeto comunitário independente.
EOF

cat > "$APP/ARCHITECTURE.md" <<'EOF'
# Architecture

Libre Remote is local-first. Compose UI sends normalized commands to `RemoteViewModel`; the ViewModel coordinates discovery, persistence, macros, performance tracking and one active `TvBackend`.

## Layers

- **UI**: `MainActivity`, `RemoteControls`, `RemoteSheets`.
- **State**: `RemoteViewModel` exposes immutable `RemoteUiState`.
- **Backends**: `TvBackend` isolates LG webOS, Samsung Tizen and DLNA details.
- **Discovery**: `TvDiscovery` probes known devices and SSDP targets, parses hardened XML, assigns stable identity and deduplicates routes.
- **Persistence**: Room stores devices, macros, layouts and bounded diagnostics; DataStore stores small accessibility settings; encrypted preferences store pairing secrets.
- **Performance**: `CommandScheduler` has bounded critical, repeating and normal queues; `PerformanceTracker` keeps local rolling metrics.
- **Automation**: `MacroEngine` limits steps and total delay; `VoiceCommandParser` is deterministic and local.
- **Android surfaces**: widget, dynamic shortcuts and Quick Settings tile execute one short command through `RemoteCommandExecutor`.

## Backend rules

A backend must return the smallest truthful capability set, never block the main thread, bound queues/timeouts, remove credentials on `forget`, and normalize errors for users. Experimental platforms remain behind the experimental toggle until a public hardware matrix exists.

## Security boundaries

- Pairing credentials and local certificate fingerprints are encrypted and excluded from backup/device transfer.
- DLNA and description URLs must resolve to loopback, link-local, private/site-local or `.local` hosts.
- External redirects are disabled and XML DTD/entities are disabled.
- Diagnostic exports omit tokens, typed text and full certificates.
- Release signing keys never belong in source control.

## Stable device identity

UPnP UDN/USN or manufacturer identifiers take priority. IP is only a fallback, so saved devices can survive DHCP changes.
EOF

cat > "$APP/BUILDING.md" <<'EOF'
# Building Libre Remote

## Requirements

- JDK 17
- Android SDK Platform 35
- Android Build Tools 35.0.0+

## Debug

```bash
./gradlew :app:assembleDebug
```

## Validation

```bash
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleDebug
```

## Signed release

```bash
export LIBRE_KEYSTORE_PATH=/absolute/path/upload-key.jks
export LIBRE_KEYSTORE_PASSWORD='...'
export LIBRE_KEY_ALIAS='...'
export LIBRE_KEY_PASSWORD='...'
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleRelease :app:bundleRelease
```

Outputs:

- `app/build/outputs/apk/release/app-release.apk`
- `app/build/outputs/bundle/release/app-release.aab`

No private key, password, APK or AAB should be committed.
EOF

cat > "$APP/PRIVACY.md" <<'EOF'
# Política de Privacidade — Libre Remote

Última atualização: 13 de julho de 2026.

## Resumo

O Libre Remote não possui anúncios, analytics, conta obrigatória nem servidor próprio. O app procura e controla aparelhos na rede local.

## Dados mantidos no aparelho

- TVs salvas, cômodo, IP local, plataforma e capacidades;
- layouts, macros e preferências;
- tokens/chaves de pareamento e impressões digitais de certificados, criptografados;
- histórico limitado de diagnóstico sem conteúdo digitado.

Esses dados não são enviados ao projeto. Credenciais e banco de produto são excluídos de backup e transferência de dispositivo.

## Serviços opcionais

O reconhecimento de voz usa o serviço disponível no Android. Dependendo da configuração do aparelho, o provedor do sistema pode processar áudio segundo a política dele. O Libre Remote recebe o texto reconhecido e não armazena a gravação.

Futuras integrações em nuvem, como SmartThings, deverão ser opcionais, explicar o uso da internet e pedir consentimento separado.

## Permissões

- Internet/rede: conexão direta com TVs;
- estado de Wi-Fi/rede: diagnóstico;
- multicast: descoberta SSDP/UPnP;
- dispositivos Wi-Fi próximos e rede local, quando exigidos pelo Android: descoberta e controle local.

## Exclusão

Remover uma TV apaga as credenciais de pareamento correspondentes. Limpar os dados ou desinstalar apaga todos os dados locais.

## Contato

Use o canal de segurança do repositório para assuntos sensíveis. Não publique tokens, senhas, certificados completos ou logs não sanitizados.
EOF

cat > "$APP/SECURITY.md" <<'EOF'
# Security Policy

## Supported versions

Security fixes target the latest 2.x release candidate/stable line.

## Reporting

Report vulnerabilities privately to the maintainers. Do not open a public issue containing pairing tokens, passwords, full certificates, private network inventories or typed TV content.

## Threat model and controls

- Credentials are encrypted with Android-backed keys and excluded from backup/device transfer.
- LG and Samsung self-signed local certificates use per-device trust on first use and reject later fingerprint changes.
- DLNA/UPnP URLs must remain local; external redirects are disabled.
- XML DTDs and external entities are disabled and response sizes are bounded.
- Command queues, macro steps, macro delay, reconnect backoff and diagnostic history are bounded.
- Public diagnostics are sanitized.

## Known limitations

Many TVs require cleartext LAN protocols or self-signed certificates. The app therefore cannot provide normal public-CA TLS semantics for every local device. Certificate changes require explicit re-pairing. Physical model testing is required before a beta backend is called stable.

## Release keys

Use Play App Signing with a separate permanent upload key. Store secrets only in protected CI/Play systems. Never use a temporary CI key for the first production upload.
EOF

cat > "$APP/TESTING.md" <<'EOF'
# Testing

## Automated gate

```bash
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleRelease :app:bundleRelease
```

CI also verifies the APK signature and publishes SHA-256 hashes.

## Manual device matrix

For every release, test at minimum:

- cold start, warm start and last-device reconnect;
- first pairing, refused pairing and forgotten credentials;
- TV IP change and app restart;
- volume/channel hold, D-pad, Back/Home and power;
- apps, inputs, keyboard and touchpad when supported;
- Wi-Fi loss, guest network, VPN and multicast blocked;
- background/foreground and one-hour session;
- large font, TalkBack, high contrast and left-handed settings;
- widget, launcher shortcut and Quick Settings tile.

Record exact TV model, firmware, phone, Android version and router topology. A successful emulator build is not hardware compatibility evidence.

## Release blockers

Do not release when LG regresses, credentials leak, queues grow without bound, a capability is advertised falsely, database migration fails, release lint fails or a production artifact uses a temporary signing key.
EOF

cat > "$APP/RELEASING.md" <<'EOF'
# Releasing

1. Confirm the package ID and version code will never be reused.
2. Complete the hardware matrix and update compatibility claims.
3. Run tests, release lint, signed APK/AAB build and APK signature verification.
4. Generate SHA-256 hashes and archive source for the same commit.
5. Publish the privacy policy at a stable HTTPS URL.
6. Complete Play Console App content, Data Safety, content rating and account-specific testing requirements.
7. Upload the AAB signed with the permanent upload key and enable Play App Signing.
8. Use internal testing, then closed testing, then staged production rollout.
9. Monitor crashes/ANRs and compatibility reports; keep the previous stable source/tag available.

The repository CI release workflow expects secrets:

- `LIBRE_UPLOAD_KEYSTORE_B64`
- `LIBRE_UPLOAD_STORE_PASSWORD`
- `LIBRE_UPLOAD_KEY_ALIAS`
- `LIBRE_UPLOAD_KEY_PASSWORD`
EOF

cat > "$APP/MAINTAINERS.md" <<'EOF'
# Maintainers

Maintainers protect privacy, truthful compatibility and reproducible releases.

- Protocol changes require tests and documented hardware evidence.
- Security-sensitive changes require a second review when another maintainer is available.
- No maintainer may commit a private signing key or user credential.
- Release tags must point to the exact source used for the AAB.
- Inactive maintainers should transfer release credentials through a secure owner-controlled process, never through the repository.
EOF

cat > "$APP/THIRD_PARTY_NOTICES.md" <<'EOF'
# Third-party notices

Libre Remote uses AndroidX Core, Activity, Lifecycle, Jetpack Compose, Room, DataStore, Security Crypto and Profile Installer; Kotlin coroutines; OkHttp/Okio; JUnit and AndroidX Test. These projects are generally distributed under Apache License 2.0; consult dependency metadata for exact notices.

LG, webOS, Samsung, Tizen, Android, Google TV, Google Cast, Roku, Fire TV, Philips, Hisense and VIDAA are trademarks of their respective owners. This independent project is not endorsed by those companies.
EOF

cat > "$APP/UNIVERSAL-TV-ROADMAP.md" <<'EOF'
# Universal TV roadmap

## P0 — release closure

- verified LG regression matrix;
- Samsung Tizen model/firmware matrix;
- DLNA interoperability tests;
- permanent signing, privacy URL and Play declarations.

## P1 — stability

- narrower cleartext policy where Android/protocol constraints permit;
- larger protocol simulator suite;
- benchmark/profile module and battery measurements;
- community compatibility database with reviewed reports.

## P2 — authorized protocols

- optional official Google Cast media module;
- optional SmartThings OAuth module;
- Philips/VIDAA only after documentation, legal review and physical testing.

## P3 — Libre Bridge

Open ESP32/Raspberry Pi bridge for IR learning and HDMI-CEC. The mobile app remains usable without a bridge.

The roadmap is not a promise that closed or prohibited systems will be supported.
EOF

cat > "$APP/docs/COMPATIBILITY-REPORT.md" <<'EOF'
# Compatibility report template

- Libre Remote version:
- Phone / Android:
- TV manufacturer and exact model:
- TV firmware/system version:
- Router/topology:
- Pairing: pass/fail/not applicable
- Discovery: automatic/manual
- D-pad and OK:
- Volume and mute:
- Channels:
- Apps and inputs:
- Touchpad and keyboard:
- Power/Wake-on-LAN:
- Reconnect after restart/IP change:
- Sanitized diagnostic summary:

Never include pairing tokens, passwords, full certificates or typed content.
EOF

cat > "$APP/docs/PLAY-PUBLISHING.md" <<'EOF'
# Play publishing checklist

- permanent application ID and monotonically increasing version code;
- Play App Signing plus separate upload key;
- signed AAB from the tagged commit;
- privacy policy on HTTPS;
- Data Safety declaration matching the shipped build;
- content rating, app access and ads declaration;
- phone screenshots, 512×512 icon and 1024×500 feature graphic;
- internal/closed testing required for the developer account;
- staged rollout and Android Vitals monitoring.

Google Play requirements change. Re-check the official Play Console and Android developer pages on the upload date.
EOF

cat > "$APP/store-listing/short-description-pt-BR.txt" <<'EOF'
Controle remoto local, privado e open source para Smart TVs compatíveis.
EOF
cat > "$APP/store-listing/short-description-en.txt" <<'EOF'
A private, local-first, open-source remote for compatible smart TVs.
EOF
cat > "$APP/store-listing/short-description-es.txt" <<'EOF'
Control remoto privado, local y de código abierto para Smart TVs compatibles.
EOF
cat > "$APP/store-listing/full-description-pt-BR.txt" <<'EOF'
Libre Remote transforma seu Android em um controle remoto local para Smart TVs compatíveis.

Comece com um controle simples e personalize quando precisar. Escolha layouts Simples, Normal, Avançado ou crie três controles personalizados. O app mostra apenas funções declaradas pela TV conectada.

Recursos:
• descoberta na rede local e reconexão;
• várias TVs e cômodos;
• D-pad, volume, canais e mídia;
• apps, entradas, teclado e touchpad quando suportados;
• macros limitadas e canceláveis;
• widget, atalhos e Quick Settings;
• temas, alto contraste e controles maiores;
• diagnóstico sanitizado e métricas locais.

Privacidade:
• sem anúncios;
• sem analytics;
• sem conta Libre Remote;
• sem servidor próprio;
• tokens de pareamento criptografados no aparelho.

Compatibilidade desta versão:
• LG webOS: backend principal de controle completo;
• Samsung Tizen local: experimental/beta por modelo;
• DLNA/UPnP: mídia e volume quando anunciados.

O Libre Remote é independente e não é afiliado aos fabricantes de TV.
EOF
cat > "$APP/store-listing/full-description-en.txt" <<'EOF'
Libre Remote turns Android into a local-first remote for compatible smart TVs.

Start with a simple remote and customize it when needed. Choose Simple, Normal or Advanced layouts, or create three custom remotes. The app only exposes capabilities reported by the connected backend.

Features include local discovery and reconnect, multiple TVs and rooms, navigation, volume, channels, media, apps/inputs/keyboard/touchpad when supported, bounded macros, widgets, shortcuts, accessibility options and sanitized local diagnostics.

No ads, analytics, Libre Remote account or project-operated server. Pairing credentials are encrypted on the device.

Current compatibility: LG webOS is the primary full backend; Samsung Tizen local is experimental/beta by model; DLNA/UPnP provides media and volume when advertised.
EOF
cat > "$APP/store-listing/full-description-es.txt" <<'EOF'
Libre Remote convierte Android en un control remoto local para Smart TVs compatibles.

Empieza con un control sencillo y personalízalo cuando lo necesites. Incluye varios televisores y habitaciones, navegación, volumen, canales, multimedia, macros limitadas, widget, accesos directos, opciones de accesibilidad y diagnóstico local sanitizado.

Sin anuncios, analytics, cuenta de Libre Remote ni servidor propio. Las credenciales de vinculación se guardan cifradas en el dispositivo.

Compatibilidad actual: LG webOS es el backend completo principal; Samsung Tizen local es experimental/beta según el modelo; DLNA/UPnP ofrece multimedia y volumen cuando el televisor los anuncia.
EOF

cat > "$APP/store-listing/data-safety.md" <<'EOF'
# Data Safety working notes

For the default Libre Remote build:

- the project does not collect or share personal data;
- no ads or analytics SDK is included;
- TV names, local IPs, rooms, layouts, macros and diagnostics remain on-device;
- pairing credentials remain encrypted on-device and are excluded from backup/device transfer;
- optional Android speech recognition is initiated by the user and may be processed by the configured system provider outside Libre Remote;
- no account creation or data deletion request flow is required because no server account exists.

These notes are not a substitute for the Play Console questionnaire. Verify every dependency and shipped variant before submitting.
EOF

cat > "$APP/store-listing/release-notes-pt-BR.txt" <<'EOF'
Nova base 2.0: várias TVs, layouts personalizados, macros, widget, atalhos, diagnóstico local, acessibilidade e melhorias de reconexão. LG webOS é o backend principal; Samsung Tizen continua experimental e DLNA é somente mídia.
EOF

cat > "$APP/store-listing/submission-checklist.md" <<'EOF'
# Submission checklist

- [ ] First production upload signed with permanent upload key
- [ ] Play App Signing enabled
- [ ] Version code unused
- [ ] Hardware matrix completed
- [ ] Privacy page published on HTTPS
- [ ] Data Safety matches the release variant
- [ ] Ads: No
- [ ] Content rating complete
- [ ] Store icon, feature graphic and real screenshots reviewed
- [ ] Internal and account-required closed testing complete
- [ ] Support email and repository URL configured
- [ ] Staged rollout selected
EOF

cat > "$APP/store-listing/privacy-policy.html" <<'EOF'
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Libre Remote — Política de Privacidade</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:760px;margin:auto;padding:32px;color:#18202a}h1,h2{line-height:1.2}code{background:#eef2f6;padding:.15rem .35rem;border-radius:.3rem}</style></head><body><h1>Libre Remote — Política de Privacidade</h1><p>Atualizada em 13 de julho de 2026.</p><h2>Resumo</h2><p>O Libre Remote não possui anúncios, analytics, conta obrigatória ou servidor próprio. O aplicativo controla aparelhos na rede local.</p><h2>Dados no aparelho</h2><p>TVs salvas, cômodos, endereços locais, layouts, macros e diagnóstico limitado permanecem no dispositivo. Tokens de pareamento e impressões digitais de certificados são criptografados e excluídos de backup/transferência.</p><h2>Serviços opcionais</h2><p>O reconhecimento de voz usa o serviço configurado no Android. O provedor do sistema pode processar áudio segundo sua política; o Libre Remote recebe o texto e não armazena a gravação.</p><h2>Exclusão</h2><p>Remover uma TV apaga as credenciais correspondentes. Limpar os dados ou desinstalar apaga todos os dados locais.</p><h2>Contato</h2><p>Use o repositório do projeto para suporte e o canal privado de segurança para vulnerabilidades. Nunca publique tokens, senhas ou certificados completos.</p></body></html>
EOF

cat > "$APP/.github/workflows/ci.yml" <<'EOF'
name: Android CI
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
concurrency:
  group: android-ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 35
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: {distribution: temurin, java-version: "17"}
      - uses: android-actions/setup-android@v3
      - run: |
          yes | sdkmanager --licenses >/dev/null || true
          sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"
      - uses: gradle/actions/setup-gradle@v4
      - run: |
          chmod +x gradlew
          ./gradlew --no-daemon --stacktrace :app:testDebugUnitTest :app:lintRelease :app:assembleDebug
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: validation-reports
          path: |
            app/build/reports/tests/testDebugUnitTest/
            app/build/reports/lint-results-release.*
          if-no-files-found: warn
EOF

cat > "$APP/.github/workflows/release.yml" <<'EOF'
name: Signed Android release
on:
  workflow_dispatch:
  push:
    tags: ["v*"]
permissions:
  contents: read
jobs:
  release:
    runs-on: ubuntu-latest
    timeout-minutes: 40
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: {distribution: temurin, java-version: "17"}
      - uses: android-actions/setup-android@v3
      - run: |
          yes | sdkmanager --licenses >/dev/null || true
          sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"
      - uses: gradle/actions/setup-gradle@v4
      - name: Configure signing
        env:
          KEYSTORE_B64: ${{ secrets.LIBRE_UPLOAD_KEYSTORE_B64 }}
          STORE_PASSWORD: ${{ secrets.LIBRE_UPLOAD_STORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.LIBRE_UPLOAD_KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.LIBRE_UPLOAD_KEY_PASSWORD }}
        run: |
          set -euo pipefail
          test -n "$KEYSTORE_B64"; test -n "$STORE_PASSWORD"; test -n "$KEY_ALIAS"; test -n "$KEY_PASSWORD"
          echo "$KEYSTORE_B64" | base64 --decode > "$RUNNER_TEMP/libre-upload-key.jks"
          echo "LIBRE_KEYSTORE_PATH=$RUNNER_TEMP/libre-upload-key.jks" >> "$GITHUB_ENV"
          echo "LIBRE_KEYSTORE_PASSWORD=$STORE_PASSWORD" >> "$GITHUB_ENV"
          echo "LIBRE_KEY_ALIAS=$KEY_ALIAS" >> "$GITHUB_ENV"
          echo "LIBRE_KEY_PASSWORD=$KEY_PASSWORD" >> "$GITHUB_ENV"
      - run: |
          chmod +x gradlew
          ./gradlew --no-daemon --stacktrace :app:testDebugUnitTest :app:lintRelease :app:assembleRelease :app:bundleRelease
      - run: |
          mkdir -p dist
          cp app/build/outputs/apk/release/app-release.apk dist/Libre-Remote.apk
          cp app/build/outputs/bundle/release/app-release.aab dist/Libre-Remote.aab
          APKSIGNER="$(find "$ANDROID_HOME/build-tools" -type f -name apksigner | sort -V | tail -n 1)"
          "$APKSIGNER" verify --verbose --print-certs dist/Libre-Remote.apk > dist/APK-SIGNATURE.txt
          sha256sum dist/Libre-Remote.apk dist/Libre-Remote.aab > dist/SHA256SUMS.txt
      - uses: actions/upload-artifact@v4
        with:
          name: signed-release-${{ github.ref_name }}
          path: dist/*
          if-no-files-found: error
          retention-days: 30
EOF

cat > "$APP/.github/workflows/privacy-pages.yml" <<'EOF'
name: Publish privacy policy
on:
  push:
    branches: [main]
    paths: [store-listing/privacy-policy.html, PRIVACY.md]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - run: mkdir -p _site && cp store-listing/privacy-policy.html _site/index.html && cp PRIVACY.md _site/PRIVACY.md
      - uses: actions/upload-pages-artifact@v3
        with: {path: _site}
      - id: deployment
        uses: actions/deploy-pages@v4
EOF

cat > "$APP/app/src/test/java/com/geronimo/controlelgwifi/VoiceCommandParserTest.kt" <<'EOF'
package com.geronimo.controlelgwifi

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class VoiceCommandParserTest {
    @Test fun parsesPortugueseVolumeCommand() {
        assertEquals(VoiceCommandResult.Action(RemoteAction.VolumeUp), VoiceCommandParser.parse("aumentar volume", emptyList()))
    }
    @Test fun prioritizesNamedMacro() {
        val macro = RemoteMacro("movie", "Modo cinema", listOf(MacroStep.Command(RemoteAction.Home)))
        assertEquals(VoiceCommandResult.Macro("Modo cinema"), VoiceCommandParser.parse("executar modo cinema", listOf(macro)))
    }
    @Test fun returnsUnknownWithoutExecutingArbitraryText() {
        assertTrue(VoiceCommandParser.parse("faça qualquer coisa", emptyList()) is VoiceCommandResult.Unknown)
    }
}
EOF

cat > "$APP/app/src/test/java/com/geronimo/controlelgwifi/StableIdTest.kt" <<'EOF'
package com.geronimo.controlelgwifi

import org.junit.Assert.assertEquals
import org.junit.Test

class StableIdTest {
    @Test fun hardwareIdentitySurvivesIpChange() {
        val first = TvDiscovery.stableId(TvPlatform.LgWebOs, "uuid:ABC-123", "192.168.1.10")
        val second = TvDiscovery.stableId(TvPlatform.LgWebOs, "uuid:abc-123", "192.168.1.99")
        assertEquals(first, second)
    }
}
EOF

cat > "$APP/app/src/test/java/com/geronimo/controlelgwifi/CommandSchedulerTest.kt" <<'EOF'
package com.geronimo.controlelgwifi

import org.junit.Assert.assertTrue
import org.junit.Test

class CommandSchedulerTest {
    @Test fun trackerMaintainsBoundedRollingWindow() {
        val tracker = PerformanceTracker()
        repeat(500) { tracker.recordDispatch(it.toDouble()) }
        assertTrue(tracker.snapshot().samples <= 200)
    }
}
EOF

git add -A
git commit -m "Finalize Libre Remote 2 product, docs and Play package [finalized-product]"
git push origin HEAD:feature/libre-remote-2-product-foundation
