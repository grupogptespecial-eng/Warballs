# Libre Remote

Controle remoto **multiplataforma**, gratuito, sem anúncios e open source para TVs e receptores na rede local.

A release candidate ativa é **Libre Remote 2.1.3 RC5.4** (`2.1.3-rc5.4-customization`, Android `versionCode 29`). A arquitetura universal usa uma interface orientada por capacidades e seleciona o backend compatível com a TV detectada.

## Plataformas host

O fato de um target existir não significa automaticamente que ele esteja pronto para distribuição. O projeto usa níveis de evidência L0-L5 definidos em `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`.

| Host | RC5.4 objetivo de validação | Distribuição pretendida |
|---|---|---|
| Android | build, testes, múltiplas APIs/emuladores, upgrade e QA visual/performance | APK/AAB |
| iPhone / iPad | frameworks + XCFramework + wrapper SwiftUI + install/launch no Simulator | App Store / TestFlight após signing e entitlement Apple |
| Windows | testes desktop + app image + launch do binário final | MSI + EXE |
| Linux | testes desktop + app image + launch headless | DEB + RPM |
| macOS | testes desktop + app image + launch do `.app` | DMG + PKG |

Arquiteturas não produzidas e executadas por CI não são implicitamente suportadas. Windows ARM64, Linux ARM64 e macOS Intel exigem evidência própria antes de entrarem no claim de suporte.

## Compatibilidade com TVs

| Plataforma da TV | Estado | Recursos principais |
|---|---|---|
| LG webOS | principal / mais completo | navegação, volume, canais, touchpad, teclado, apps, entradas, mídia e desligamento |
| Samsung Tizen local | experimental | pareamento local, navegação, volume, canais, mídia, números, cores, guia e desligamento |
| DLNA / UPnP AV | mídia | play, pause, stop e volume/mudo quando os serviços são anunciados |
| Google Cast / SmartThings / Fire TV | não ativos | exigem integração oficial adicional |
| Philips / VIDAA | experimental/não ativos | aguardam auditoria e hardware real |
| Roku | bloqueado no app público | política do fabricante |
| TVs sem protocolo de rede | não suportadas diretamente | futuro Libre Bridge por IR/CEC |

## Segurança e identidade

- Android applicationId canônico: `io.github.grupogptespecialeng.libreremote`;
- iOS bundle ID canônico: `io.github.grupogptespecialeng.libreremote`;
- framework Kotlin/Native: `io.github.grupogptespecialeng.libreremote.framework`;
- WSS LG `:3001` deve ser preferido sobre WS `:3000`;
- endpoint `ws://` salvo anteriormente não pode superar silenciosamente WSS;
- nenhum keystore/certificado/chave de assinatura de produção é mantido no Git;
- sem anúncios, analytics ou telemetria do desenvolvedor;
- segredos devem usar storage nativo seguro por host: Android Keystore, Apple Keychain, Windows Credential Manager/DPAPI e Linux Secret Service/libsecret;
- `java.util.prefs`, DataStore e NSUserDefaults são aceitos apenas para preferências não secretas.

Enquanto os stores nativos desktop não estiverem implementados e comprovados na árvore canônica, o desktop não deve ser descrito como tendo proteção de credencial equivalente ao Android/iOS.

## iOS / iPadOS

O hardening RC5.4 adiciona os requisitos de plataforma que faltavam:

- `NSLocalNetworkUsageDescription`;
- `NSMicrophoneUsageDescription`;
- `NSSpeechRecognitionUsageDescription`;
- `NSAppTransportSecurity.NSAllowsLocalNetworking = true`;
- entitlement `com.apple.developer.networking.multicast` para SSDP/UDP;
- bundle IDs explícitos;
- compilação do wrapper SwiftUI, não apenas do XCFramework;
- instalação e launch no iOS Simulator.

O entitlement multicast precisa de autorização Apple para um build assinado real. Simulator verde não substitui teste físico de descoberta local em iPhone/iPad.

## Desktop

A RC5.4 deixa de considerar `createDistributable` suficiente como prova de distribuição. O workflow universal tenta gerar e validar:

- Windows: MSI + EXE;
- Linux: DEB + RPM;
- macOS: DMG + PKG.

O binário final também precisa abrir em CI. No Windows, o runtime reduzido inclui `jdk.accessibility` para Java Access Bridge. No Linux, as limitações atuais de acessibilidade do Compose Desktop devem permanecer explicitamente documentadas.

## Validação RC5.4

O branch de hardening adiciona gates para:

- integridade/materialização;
- hardening idempotente;
- testes/build Android;
- múltiplas APIs Android e múltiplos perfis de dispositivo;
- font scale 1.0/1.5/2.0;
- relaunch/process death;
- memória, gfx/jank, ANR, crash e estatísticas de bateria;
- upgrade RC5.3 -> RC5.4 preservando dados;
- build/launch de Windows, Linux e macOS;
- build do app iOS completo + Simulator;
- migração do transporte `.b64 + patches` para uma árvore source canônica.

Emulador/simulator não substituem validação de protocolo em TVs reais. Antes de ampliar o rótulo estável, deve existir uma matriz registrada por host, arquitetura, modelo da TV, firmware, rede, descoberta, pareamento, reconnect, mudança de IP e recursos efetivamente testados.

## Estado do CI

Os workflows de hardening estão versionados, incluindo `Libre Remote RC5.4 Universal Validation`, mas o GitHub está recusando runners por billing/spending limit antes de qualquer step executar. Portanto, até o bloqueio da conta ser resolvido e os workflows ficarem verdes, a RC5.4 deve ser tratada como **source-prepared, não CI-validated**.

Consulte `LIBRE_REMOTE_RELEASE_MANIFEST.md`, `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md`, `VALIDATION.md`, `RELEASE_STATUS.md`, `SECURITY.md`, `COMPATIBILITY.md` e `UNIVERSAL-TV-ROADMAP.md`.
