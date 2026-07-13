# Libre Remote

Controle remoto Android gratuito, sem anúncios e open source para televisões e receptores na rede local.

A versão **1.1.0 RC1 Universal** usa uma interface única e seleciona automaticamente um backend conforme o sistema detectado. Funções incompatíveis são escondidas em vez de aparecerem como botões quebrados.

## Compatibilidade desta build

| Plataforma | Estado | Recursos |
|---|---|---|
| LG webOS | Estável dentro da matriz já implementada | navegação, volume, canais, touchpad, teclado, apps, entradas, mídia e desligamento |
| Samsung Tizen local | Experimental | pareamento na TV, navegação, volume, canais, mídia, números, cores, guia e desligamento |
| DLNA / UPnP AV | Controle de mídia | play, pause, stop e volume/mudo quando AVTransport e RenderingControl são anunciados |
| Roku | Detectável, mas bloqueado | o app público não ativa o controle enquanto houver restrição do fabricante |
| Google Cast, SmartThings, Fire TV | Arquitetura preparada | não ativados nesta build; exigem SDK, credenciais ou fluxo oficial adicional |
| Android/Google TV completo, VIDAA e Philips próprios | Experimental/não ativado | aguardam API autorizada, auditoria e testes físicos |
| TVs sem rede | Não suportadas sem hardware | futuro Libre Bridge Wi-Fi para infravermelho/HDMI-CEC |

## Como funciona

1. O aplicativo tenta reconectar à última TV salva.
2. A busca multiprotocolo usa SSDP e descrições UPnP na rede local.
3. Respostas duplicadas da mesma TV são combinadas e o backend mais completo recebe prioridade.
4. O seletor mostra o sistema e o nível de suporte antes da conexão.
5. O layout usa capacidades reais: uma TV DLNA, por exemplo, mostra mídia e volume, mas não mostra D-pad.

## Desempenho

- conexão WebSocket persistente para LG e Samsung;
- tentativa paralela de endpoints locais;
- reconexão progressiva a partir de 250 ms;
- envio no toque, sem esperar o clique terminar;
- repetição de volume/canais a cada ~86 ms depois do atraso inicial;
- fila limitada de comandos Samsung;
- movimentos LG conflados para descartar eventos antigos;
- cliente HTTP reutilizado para DLNA;
- medição local do tempo de despacho do último comando, sem telemetria.

## Privacidade e segurança

- sem anúncios;
- sem telemetria;
- sem servidor do projeto;
- protocolos locais limitados a endereços privados;
- tokens Samsung e chaves LG em preferências criptografadas;
- verificação TOFU da impressão digital de certificados locais quando WSS é usado;
- integrações experimentais claramente identificadas.

## Primeira conexão

1. Mantenha celular e TV na mesma rede.
2. Toque em **Conectar TV**.
3. Selecione o aparelho encontrado.
4. Em LG ou Samsung, aceite o pareamento mostrado na televisão.

O IP manual fica disponível como recuperação. Ele identifica automaticamente LG pelas portas 3000/3001 e Samsung pelas portas 8001/8002.

## Estado do projeto

Esta é uma release candidate experimental. LG continua sendo o backend mais completo. Samsung e DLNA precisam de testes em aparelhos reais de várias gerações antes de serem anunciados como suporte amplo.

O projeto não é afiliado a LG Electronics, Samsung Electronics, Google, Roku, Amazon, Philips ou Hisense.

## Licença

GPL-3.0-or-later. Consulte `LICENSE.md`, `PRIVACY.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `THIRD_PARTY_NOTICES.md` e `UNIVERSAL-TV-ROADMAP.md`.
