# Libre Remote Universal — roteiro técnico, compatibilidade e limites

## Objetivo

Transformar o Libre Remote em um controle universal por Wi-Fi sem prejudicar a implementação LG webOS que já funciona. O aplicativo deve identificar a plataforma, selecionar o backend correto e mostrar somente recursos que o aparelho realmente oferece.

## Arquitetura entregue

A interface não chama mais um protocolo de fabricante diretamente. Ela trabalha com:

- `TvBackend`: contrato comum para conectar, enviar comandos, carregar apps/entradas, mover ponteiro e esquecer credenciais;
- `TvBackendRegistry`: mantém um backend isolado por plataforma;
- `TvCapabilities`: descreve o que cada aparelho pode fazer;
- `TvDevice`: preserva plataforma, suporte, UDN/USN estável e serviços UPnP anunciados;
- `UniversalRemoteCommand`: vocabulário comum de controle;
- `TvDiscovery`: executa SSDP multiprotocolo, lê descrições de dispositivo, classifica e deduplica resultados;
- `RemoteViewModel`: coordena descoberta, conexão, reconexão, comandos otimistas e latência sem conhecer detalhes do fabricante.

## Plataformas habilitadas nesta fase

### LG webOS — completo

A implementação LG anterior permanece sendo usada por composição. Suporta:

- pareamento no televisor;
- D-pad, OK, voltar, home e menu;
- volume, mudo e canais;
- números e teclas coloridas;
- mídia;
- texto;
- touchpad;
- apps;
- entradas;
- Wake-on-LAN quando há MAC disponível;
- WebSocket persistente, seleção de rota e reconexão.

### Samsung Tizen local — experimental

Foi implementado o protocolo remoto local por WebSocket:

- portas 8001 e 8002;
- autorização exibida na televisão;
- token salvo em armazenamento criptografado;
- tentativa concorrente de endpoints, com preferência pela última rota que funcionou;
- conexão persistente;
- fila limitada de comandos;
- reconexão com backoff;
- pinning local de certificado por TOFU;
- D-pad, home, voltar, menu, guia e info;
- volume, mudo e canais;
- números, cores, mídia e energia.

#### Limites Samsung

A implementação continua `Experimental` porque o comportamento depende do ano e firmware:

- alguns modelos não aceitam a porta segura;
- alguns não devolvem token;
- algumas teclas variam;
- ligar por rede depende de configuração e modelo;
- listagem de apps e entradas não é anunciada nesta fase;
- teclado e touchpad não são anunciados nesta fase.

Não é correto declarar Samsung estável antes de uma matriz física ampla.

### DLNA / UPnP MediaRenderer — mídia

A descoberta coleta URLs de controle dos serviços `AVTransport` e `RenderingControl`. O backend implementa:

- play;
- pause;
- stop;
- volume;
- mudo;
- leitura de volume/mudo;
- transporte SOAP com cliente HTTP compartilhado.

DLNA não é apresentado como controle completo: normalmente não oferece D-pad, home, canais ou apps.

## Detecção e deduplicação

A descoberta envia M-SEARCH para múltiplos alvos:

- LG webOS;
- Samsung RemoteControlReceiver;
- `MediaRenderer` versões 1–3;
- DIAL;
- Roku;
- `ssdp:all`.

Após receber `LOCATION`, o aplicativo lê a descrição UPnP e extrai:

- fabricante;
- modelo;
- nome amigável;
- UDN/USN;
- URL de descrição;
- serviços anunciados e URLs de controle.

O UDN/USN é usado como identidade estável quando disponível. O agregador funde anúncios do mesmo aparelho e prioriza o protocolo com maior controle. Assim, uma LG que aparece como webOS e DLNA não deve ser exibida como duas TVs.

## Latência e velocidade

### Caminho de comando

- o toque dispara comando imediatamente;
- o `RemoteViewModel` usa dispatcher de I/O;
- LG e Samsung mantêm WebSocket aberto;
- a rota conhecida é tentada primeiro;
- comandos de volume/canal possuem repetição acelerada;
- touchpad usa fila conflada;
- Samsung limita a fila a 32 comandos;
- comandos secundários, apps e entradas são carregados depois da conexão;
- volume e mudo usam estado otimista;
- o backend devolve latência local do envio.

### Reconexão

Samsung usa atrasos de 250 ms, 500 ms, 1 s, 2 s, 5 s e 8 s. A arquitetura permite aplicar a mesma política aos demais backends sem alterar a interface.

### Próximas otimizações mensuráveis

- módulo Macrobenchmark;
- Baseline Profiles gerados por benchmark;
- métricas `tap → queue`, `queue → socket` e `socket → response`;
- prewarm do backend da última TV;
- cache persistente de capacidades, apps e entradas;
- perfis de inicialização;
- testes de 60 Hz no touchpad;
- consumo de bateria e frames lentos.

## Plataformas detectáveis, mas não habilitadas

### Google Cast

Suporte correto deve usar o Google Cast SDK oficial. Ele oferece descoberta, sessão e controle de mídia, não um D-pad universal do sistema. A melhor estrutura é uma variante opcional `play`, mantendo uma variante `foss` sem dependência proprietária.

### Android TV / Google TV

Não existe uma API Android pública geral que permita a qualquer aplicativo móvel controlar a interface completa de qualquer TV Android. Cast deve ser usado para mídia. Controle integral exige protocolo/parceira autorizada e não deve ser anunciado antes disso.

### Samsung SmartThings

Pode complementar Tizen local usando a API oficial e OAuth. Deve ser opcional, preferir LAN e explicar quando usa internet. Não é possível publicar uma integração real sem cadastro de aplicativo, redirect URI e consentimento do usuário.

### Fire TV

A documentação pública encontrada se concentra em aplicativos rodando no Fire TV e eventos de controles pareados. ADB não é apropriado para um app de consumo publicado. O backend permanece desabilitado até existir uma rota autorizada e distribuível.

### Philips JointSpace e Hisense VIDAA

Permanecem em pesquisa/feature flag. Precisam de documentação, revisão de termos, simulador e aparelhos reais antes de aparecerem como suporte.

### Roku

O ECP é tecnicamente conhecido, mas a política pública do fabricante restringe comandos enviados por aplicativos móveis de terceiros. O aplicativo público não habilita esse backend.

## TVs sem protocolo de rede

Nenhum app exclusivamente por Wi-Fi controla uma TV antiga sem receptor/protocolo compatível. A cobertura exige:

- celular com emissor infravermelho;
- bridge opcional, como ESP32/Raspberry Pi;
- HDMI-CEC externo;
- dispositivo comercial compatível e autorizado.

### Libre Bridge planejado

- descoberta mDNS `_libreremote._tcp`;
- pareamento por QR code;
- chave local;
- HTTPS na LAN;
- aprendizado de códigos por receptor IR;
- perfis exportáveis;
- firmware assinado;
- suporte futuro a HDMI-CEC.

## Segurança

### Implementado

- tokens LG e Samsung em `EncryptedSharedPreferences`;
- PIN/fingerprint local por dispositivo;
- filas limitadas;
- timeouts;
- clientes HTTP compartilhados;
- sem conta, anúncios, telemetria ou servidor Libre Remote.

### Antes de uma versão universal estável

- mover validação TOFU para o trust manager do handshake;
- bloquear URLs DLNA externas à LAN;
- desabilitar redirects externos;
- endurecer parser XML contra DTD/entidades externas;
- limitar tamanho/profundidade XML;
- apagar token, rota e fingerprint ao esquecer a TV;
- relatório sanitizado sem tokens, texto digitado ou certificado completo;
- auditoria do manifesto de permissões LG;
- revisar `usesCleartextTraffic` e Network Security Configuration.

## Android 17 e rede local

Quando o aplicativo subir o `targetSdk` para API 37, será necessário tratar a permissão de rede local. A descoberta e comunicação SSDP, mDNS, TCP, UDP, broadcast e HTTP local podem depender de `ACCESS_LOCAL_NETWORK`. O onboarding deve explicar a finalidade antes da caixa do sistema.

## Testes obrigatórios

### Automatizados

- contrato de todos os backends;
- fila limitada;
- reconexão cancelada após `close`;
- mapeamento de comandos;
- deduplicação UDN/IP;
- XML UPnP malformado;
- mudança de certificado;
- token recusado/expirado;
- TV que muda de IP;
- descoberta sem multicast;
- acessibilidade Compose;
- Macrobenchmark.

### Físicos

- pelo menos cinco gerações webOS;
- pelo menos cinco gerações Tizen;
- três MediaRenderers DLNA;
- Android 8–17;
- Samsung, Pixel, Motorola e Xiaomi;
- Wi-Fi 2,4/5 GHz, Ethernet, mesh e guest network;
- televisão dormindo e acordando;
- várias TVs no mesmo ambiente;
- roteador trocando IP;
- horas de uso e reconexão.

## Critério para chamar de “universal”

O aplicativo só será chamado de universal quando tiver:

- LG estável;
- Samsung estável ou Beta claramente marcado;
- pelo menos um backend oficial de mídia, como Cast ou DLNA;
- suporte a aparelhos antigos por bridge ou uma explicação clara da limitação;
- matriz pública de modelos testados;
- nenhum backend contrário à política pública do fabricante;
- seleção automática e deduplicação confiáveis.
