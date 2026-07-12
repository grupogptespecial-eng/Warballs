# Libre Remote

Controle remoto Android gratuito, local-first e open source para TVs LG webOS.

## Princípios

- sem anúncios;
- sem conta;
- sem telemetria;
- sem servidor externo;
- comunicação direta pela rede local;
- código aberto sob GPL-3.0-or-later.

## Recursos da versão 0.2

- interface Jetpack Compose com Material 3;
- controle direcional circular e botões arredondados;
- resposta tátil opcional;
- envio no momento em que o dedo toca o botão;
- repetição de volume e canal ao manter pressionado;
- conexão WebSocket persistente;
- disputa rápida entre portas 3000 e 3001 e memorização da melhor rota;
- touchpad com movimentos conflados para evitar fila e atraso;
- rolagem dedicada;
- teclado numérico e botões coloridos;
- controles de mídia;
- descoberta SSDP e conexão manual por IP;
- lista dinâmica de aplicativos e entradas HDMI;
- envio de texto para a TV;
- Wake-on-LAN;
- chave de pareamento guardada em preferências criptografadas;
- verificação TOFU da impressão digital do certificado local;
- tema claro e escuro;
- interface em português e estrutura pronta para tradução.

## Primeira conexão

1. Mantenha celular e TV na mesma rede.
2. Abra Ajustes e toque em Buscar.
3. Escolha a TV.
4. Aceite o pareamento mostrado na tela da LG.

Alguns roteadores bloqueiam multicast ou isolam dispositivos. Nesses casos, informe manualmente o IP da televisão.

## Estado do projeto

Esta é uma versão beta funcional criada para testes comunitários. Compatibilidade pode variar entre gerações do webOS. O projeto não é afiliado à LG Electronics.

O APK beta é assinado com uma chave de depuração. Uma publicação oficial deverá usar uma chave de lançamento estável, testes ampliados e um repositório próprio separado do projeto usado temporariamente para compilação.

## Licença e documentação

O código é disponibilizado sob GPL-3.0-or-later. Consulte `LICENSE.md`, `PRIVACY.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md` e `THIRD_PARTY_NOTICES.md`.
