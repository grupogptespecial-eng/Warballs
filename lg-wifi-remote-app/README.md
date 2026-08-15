# Libre Remote

Controle remoto **multiplataforma**, gratuito, sem anúncios e open source para TVs e receptores na rede local.

A release candidate ativa é **Libre Remote 2.1.3 RC5.4** (`2.1.3-rc5.4-customization`, Android `versionCode 29`). A arquitetura universal usa capacidades do host + capacidades da TV e separa suporte de código de evidência de release.

## Plataformas host

Os níveis L0–L5 de `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md` distinguem target, compilação, runtime, protocolo, hardware e distribuição.

| Host | Gates implementados | Distribuição pretendida |
|---|---|---|
| Android | build, APIs/emuladores, upgrade, QA visual/performance, Keystore, cliente LG→lab | APK/AAB assinado |
| iPhone / iPad | frameworks/XCFramework, SwiftUI, iPhone+iPad Simulator, Keychain, cliente LG→lab | App Store / TestFlight |
| Windows | desktop test, MSI/EXE, DPAPI, app/instalador smoke, cliente LG→lab | MSI + EXE Authenticode |
| Linux | desktop test, DEB/RPM, Secret Service, clean package lifecycle, cliente LG→lab | DEB + RPM |
| macOS | desktop test, DMG/PKG, Keychain, clean package lifecycle, cliente LG→lab | Developer ID + notarização |

Arquiteturas não produzidas/executadas por CI não são implicitamente suportadas. Windows ARM64, Linux ARM64 e macOS Intel precisam de evidência própria.

## Compatibilidade com TVs

| Plataforma da TV | Estado de produto | Recursos principais |
|---|---|---|
| LG webOS | principal / mais completo | navegação, volume, canais, touchpad, teclado, apps, entradas, mídia e desligamento |
| Samsung Tizen local | experimental | pareamento local, navegação, volume, canais, mídia, números, cores, guia e desligamento |
| DLNA / UPnP AV | mídia | play, pause, stop e volume/mudo quando anunciados corretamente |
| Google Cast / SmartThings / Fire TV | não ativos | exigem integração oficial adicional |
| Philips / VIDAA | experimental/não ativos | aguardam auditoria/hardware real |
| Roku | bloqueado no app público | política do fabricante |
| TVs sem protocolo de rede | não suportadas diretamente | futuro Libre Bridge por IR/CEC |

## Segurança

O hardening RC5.4 agora implementa um `SecureStore` dedicado:

- Android: AES/GCM com chave no Android Keystore;
- iOS/macOS: Apple Keychain;
- Windows: DPAPI CurrentUser;
- Linux: Secret Service (`secret-tool`), sem fallback plaintext.

Novos LG `client-key`, fingerprint TLS e histórico de sucesso WSS usam o store seguro. Credenciais legadas são migradas com write + read-back + só então remoção do valor antigo. O auditor estrito rejeita escrita plaintext remanescente e padrões conhecidos de TOFU fail-open.

LG WSS `:3001` é prioritário; depois de WSS bem-sucedido, o estado persistido proíbe downgrade silencioso para WS. Certificado ausente ou alterado é decisão de negação. Toggles como `KEY_MUTE` não podem implementar setters absolutos.

## Rede e parsing

O runtime hardening inclui leitura limitada antes de materializar payloads, política de URLs locais, parser UPnP XML com limite de tamanho/profundidade e rejeição de DTD/entities, além de helpers de identidade estável para migrar o escopo seguro quando um dispositivo passa de identidade temporária por IP para ID estável.

## Protocol lab

`protocol-lab/` fornece fixtures determinísticas de LG WS/WSS, Samsung WebSocket, DLNA/UPnP e SSDP, incluindo pareamento negado, rotação de certificado, XML malformado/entity/oversized e UDN estável.

Os testes gerados instanciam o **cliente real `LgWebOsRemote`** em desktop, Android emulator e iOS Simulator. A CI exige não apenas a task Gradle, mas também que a classe de integração apareça no resultado do teste.

## Apple

iOS/iPadOS declaram Local Network, ATS local, multicast, microfone e speech. Há gates separados para iPhone e iPad Simulator. A pipeline de distribuição está preparada para provisioning real e upload ao App Store Connect/TestFlight, mas aprovação do entitlement multicast, credenciais Apple e teste físico continuam externos.

macOS tem bundle ID/local-network metadata e caminho preparado de Developer ID, assinatura de installer, notarização, stapling e Gatekeeper.

## Desktop

A RC não trata `createDistributable` como instalador público. Os gates exigem Windows MSI+EXE, Linux DEB+RPM e macOS DMG+PKG. Há clean-machine workflows para instalar/abrir/remover MSI em Windows, DEB em Ubuntu, RPM em Fedora e PKG em macOS. Windows mantém o upgrade UUID `9d0feb6a-8a93-558e-9297-4d2f0c6dc420`.

## Estado atual

Tudo acima está **implementado em source/workflows**, mas ainda não deve ser chamado de PASS: GitHub Actions continua recusando runners por billing/spending antes de executar steps. Também permanecem externos certificados/entitlements de produção e a matriz física de TVs/hosts.

A RC5.4, portanto, continua **source-prepared, não CI-validated**. Consulte `LIBRE_REMOTE_RELEASE_MANIFEST.md`, `LIBRE_REMOTE_MULTIPLATFORM_SUPPORT.md` e `specs/001-rc5-4-multiplatform-hardening/` para o estado canônico.
