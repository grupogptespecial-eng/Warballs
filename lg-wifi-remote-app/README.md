# Libre Remote

Controle remoto Android gratuito, sem anúncios e open source para TVs e receptores na rede local.

A release candidate ativa é **Libre Remote 2.1.3 RC5.4** (`2.1.3-rc5.4-customization`, `versionCode 29`). A arquitetura universal usa uma interface orientada por capacidades e seleciona o backend compatível com a TV detectada.

## Compatibilidade atual

| Plataforma | Estado | Recursos principais |
|---|---|---|
| LG webOS | principal / mais completo | navegação, volume, canais, touchpad, teclado, apps, entradas, mídia e desligamento |
| Samsung Tizen local | experimental | pareamento local, navegação, volume, canais, mídia, números, cores, guia e desligamento |
| DLNA / UPnP AV | mídia | play, pause, stop e volume/mudo quando os serviços são anunciados |
| Google Cast / SmartThings / Fire TV | não ativos | exigem integração oficial adicional |
| Philips / VIDAA | experimental/não ativos | aguardam auditoria e hardware real |
| Roku | bloqueado no app público | política do fabricante |
| TVs sem protocolo de rede | não suportadas diretamente | futuro Libre Bridge por IR/CEC |

## Segurança e identidade Android

- applicationId canônico: `io.github.grupogptespecialeng.libreremote`;
- WSS LG `:3001` deve ser preferido sobre WS `:3000`;
- endpoint `ws://` salvo anteriormente não pode superar silenciosamente WSS;
- tokens/chaves de pareamento permanecem locais e criptografados;
- nenhum keystore de assinatura é mantido no Git;
- sem anúncios, analytics ou telemetria do desenvolvedor.

## Validação RC5.4

O branch de hardening adiciona gates para:

- integridade/materialização;
- testes e build Android;
- múltiplas APIs Android e múltiplos perfis de dispositivo;
- font scale 1.0/1.5/2.0;
- relaunch/process death;
- memória, gfx/jank, ANR, crash e estatísticas de bateria;
- upgrade RC5.3 -> RC5.4 preservando o diretório de dados do app;
- migração do transporte `.b64 + patches` para uma árvore de source canônica.

Emulador não substitui validação de protocolo em TVs reais. Antes de ampliar o rótulo estável, deve existir uma matriz pública/registrada por modelo, firmware, rede, descoberta, pareamento, reconnect, mudança de IP e recursos efetivamente testados.

## Estado do CI

Os workflows de hardening estão versionados, mas o GitHub está recusando runners por billing/spending limit antes de qualquer step executar. Portanto, até o bloqueio da conta ser resolvido e os workflows ficarem verdes, a RC5.4 deve ser tratada como **source-prepared, não CI-validated**.

Consulte `LIBRE_REMOTE_RELEASE_MANIFEST.md`, `VALIDATION.md`, `RELEASE_STATUS.md`, `SECURITY.md`, `COMPATIBILITY.md` e `UNIVERSAL-TV-ROADMAP.md`.
