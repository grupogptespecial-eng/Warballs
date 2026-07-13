# Matriz de compatibilidade — Libre Remote 1.1 RC1

## Ativo nesta build

### LG webOS — controle completo

Descoberta SSDP, conexão WebSocket local nas portas 3000/3001, pareamento por confirmação, chave criptografada, touchpad, teclado, apps, entradas e mídia.

### Samsung Tizen local — experimental

Descoberta por descrição UPnP/SSDP, conexão WebSocket local nas portas 8001/8002, confirmação na TV e token criptografado. O conjunto inicial usa somente o canal de teclas remotas. Apps, texto e seleção direta de entradas não são anunciados como suportados.

### DLNA / UPnP AV — mídia

Usa os serviços anunciados `AVTransport` e `RenderingControl`. Suporta a sessão de mídia atual e volume/mudo quando a TV publica esses serviços. Não oferece Home, Back, canais ou abertura de apps.

## Detectável, mas não controlado

- Roku: bloqueado no app público por política do fabricante.
- Google Cast: requer integração oficial do Cast SDK e configuração de sessão/receptor.
- Samsung SmartThings: requer OAuth, cadastro do aplicativo e consentimento de conta.
- Fire TV: depende de integrações autorizadas; ADB não faz parte da experiência pública.
- Philips JointSpace e Hisense VIDAA: aguardam auditoria e testes físicos.

## Sem suporte por software de rede

TVs sem protocolo de rede precisam de emissor infravermelho ou HDMI-CEC externo. O plano futuro é o Libre Bridge, com protocolo aberto entre o app e ESP32/Raspberry Pi.

## Regra de produto

O aplicativo mostra somente capacidades fornecidas pelo backend conectado. Suporte experimental nunca deve ser apresentado como estável sem uma matriz pública de testes físicos.
