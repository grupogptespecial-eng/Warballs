# Libre Remote — plano de compatibilidade universal

## Objetivo

Transformar a interface atual em um controle orientado por capacidades. A tela não deve conhecer LG, Samsung ou qualquer protocolo específico. Ela pergunta ao backend conectado quais funções estão disponíveis e mostra somente essas funções.

## Princípio

Não existe um protocolo universal para todas as TVs. O aplicativo será universal por composição de backends independentes, com um nível de suporte declarado e verificável.

## Níveis de suporte

- **StableFull**: controle local completo, testado em uma matriz real de modelos.
- **BetaFull**: controle amplo, ainda com variações por geração ou dependência de conta.
- **StableMediaOnly**: descoberta e transporte de mídia, sem controle completo da interface da TV.
- **Experimental**: protocolo não documentado publicamente ou com poucos modelos testados.
- **BlockedByVendorPolicy**: tecnicamente possível, porém não distribuído devido a política explícita do fabricante.
- **Unsupported**: sem API pública, protocolo local confiável ou hardware compatível.

## Matriz planejada

| Plataforma | Nível inicial | Descoberta | Controle completo | Conta | Direção |
|---|---|---|---|---|---|
| LG webOS | StableFull | SSDP + último aparelho | Sim | Não | Manter como referência estável |
| Samsung Tizen local | Experimental | SSDP + portas Tizen | Parcial/amplo | Não | Backend opcional, claramente Beta |
| Samsung SmartThings | BetaFull | Conta SmartThings | Conforme capacidades | Sim | Integração oficial em nuvem e opt-in |
| Google Cast | StableMediaOnly | Cast SDK | Não | Não | Mídia, fila e volume de sessão |
| Android TV/Google TV | Experimental | Cast/NSD | Não via API pública oficial | Não | Não prometer controle total; pesquisar APIs autorizadas |
| DLNA/UPnP AV | StableMediaOnly | SSDP | Não | Não | Play, pause, seek e envio de mídia |
| Fire TV | StableMediaOnly/Experimental | APIs de casting quando autorizadas | Não | Depende | Somente recursos oficialmente documentados |
| Philips JointSpace | Experimental | SSDP/probe | Depende do modelo | Não | Só após auditoria e testes |
| Hisense VIDAA | Experimental | SSDP/probe | Depende do modelo | Não | Só após auditoria e testes |
| Roku | BlockedByVendorPolicy | SSDP | Tecnicamente amplo via ECP | Não | Não ativar no app público enquanto a política proibir apps móveis de terceiros |
| TVs antigas | Unsupported sem hardware | — | Não | Não | Futuro Libre Bridge Wi-Fi → IR/CEC |

## Arquitetura

```text
app/
core-model/
core-discovery/
core-backend/
core-security/
core-storage/
protocol-lg-webos/
protocol-samsung-tizen/
protocol-smartthings/
protocol-google-cast/
protocol-dlna/
protocol-fire-tv/
protocol-philips/
protocol-vidaa/
bridge-infrared/
```

A primeira migração será feita dentro do módulo atual para reduzir risco. A modularização Gradle ocorre depois que o contrato estiver estável.

## Contrato de backend

Cada backend deve fornecer:

- metadados e nível de suporte;
- descoberta e identificação da plataforma;
- pareamento e armazenamento seguro de credenciais;
- conexão, reconexão e fechamento;
- conjunto de capacidades;
- envio de comandos universais;
- lista de apps e entradas quando suportadas;
- teclado, ponteiro e mídia quando suportados;
- mensagens de erro próprias para o usuário;
- diagnóstico sem expor tokens, IPs ou identificadores em logs compartilhados.

## Descoberta universal

O orquestrador executará em paralelo:

1. reconexão ao aparelho salvo;
2. SSDP para alvos específicos e `ssdp:all`;
3. Android NSD/mDNS para serviços registrados;
4. Cast SDK para receptores Google Cast;
5. probes limitados em portas conhecidas, apenas em IPs que responderam a descoberta;
6. serviços em nuvem autorizados, como SmartThings, somente depois do login opcional;
7. IP manual em Solução de problemas.

Resultados serão deduplicados por identificadores estáveis, MAC quando disponível e combinação plataforma/endereço/modelo. Uma TV que responde por DLNA e por um protocolo completo deve aparecer apenas uma vez, usando o backend de maior capacidade.

## Política de seleção

1. backend local completo e pareado;
2. backend local completo ainda não pareado;
3. backend oficial em nuvem;
4. backend de mídia;
5. experimental, somente com opt-in explícito.

## Compatibilidade por capacidades

A UI usa `TvCapability`, não nomes de fabricantes. As capacidades serão ampliadas para incluir:

- PowerOff / PowerOn;
- Navigation / Back / Home / Menu;
- Pointer;
- Volume / AbsoluteVolume;
- Channels / Guide;
- Media / Seek / Queue;
- Apps / AppLaunch;
- Inputs;
- Keyboard;
- NumericKeys / ColoredKeys;
- Captions / AudioTrack;
- DeviceInfo;
- WakeOnLan;
- CloudControl.

## Segurança

- comunicação limitada a endereços locais para backends locais;
- TLS e pinagem por dispositivo quando possível;
- tokens e chaves no Android Keystore;
- OAuth com PKCE para integrações de conta;
- nenhuma senha no repositório;
- logs com anonimização;
- nenhum backend experimental habilitado silenciosamente;
- política de privacidade atualizada por backend.

## Fases

### Fase U1 — núcleo universal

- adicionar `TvPlatform`, `TvSupportLevel`, `TvBackend` e registry;
- encapsular o cliente LG em `LgWebOsBackend`;
- adicionar plataforma e identificador estável aos dispositivos salvos;
- migrar preferências sem perder a TV LG já pareada;
- alterar ViewModel para depender apenas do backend ativo;
- manter APK funcionalmente idêntico para LG.

Critério: todos os testes LG continuam passando e não há regressão na RC1.

### Fase U2 — descoberta multiprotocolo e DLNA

- separar parser SSDP do filtro LG;
- classificar respostas por fabricante, modelo e serviços;
- adicionar backend DLNA de mídia;
- deduplicar a mesma TV encontrada por mais de um protocolo;
- atualizar seletor para exibir nível de suporte.

Critério: LG continua completa; TVs DLNA aparecem como Controle de mídia.

### Fase U3 — Samsung

- implementar Tizen local como backend experimental;
- implementar SmartThings como backend oficial opcional;
- permitir ao usuário escolher Local ou SmartThings quando ambos existirem;
- testes por geração Tizen e por conjunto de capacidades SmartThings.

Critério: navegação, volume, canais e energia confirmados em uma matriz real antes de sair de Beta.

### Fase U4 — Google Cast

- integrar Cast Application Framework;
- mostrar somente controles de sessão de mídia;
- não chamar o módulo de controle completo de Android TV;
- lidar com aparelhos sem Google Play Services.

Critério: descoberta, conexão, reprodução, pausa, seek, fila e volume de sessão testados.

### Fase U5 — plataformas experimentais

- Fire TV apenas por APIs autorizadas;
- Philips JointSpace e VIDAA apenas depois de auditoria de licença, segurança e termos;
- cada backend atrás de uma opção Experimental;
- telemetria continua desativada; relatórios são enviados manualmente pelo usuário.

### Fase U6 — Libre Bridge

- protocolo aberto entre app e um bridge ESP32/Raspberry Pi;
- IR para TVs antigas;
- HDMI-CEC quando houver hardware compatível;
- perfis exportáveis e aprendizado de comandos.

## Testes

Para cada backend:

- simulador/fake server;
- descoberta duplicada e endereço alterado;
- pareamento aceito, negado e expirado;
- TV desligada, dormindo e reconectada;
- comandos não suportados;
- perda de Wi-Fi;
- rede de convidados;
- IPv4 e IPv6 quando aplicável;
- Android 8 a Android atual;
- testes físicos por geração e fabricante.

## Critério para anunciar “universal”

O aplicativo só será chamado de universal quando tiver:

- LG estável;
- Samsung estável ou Beta claramente marcado;
- pelo menos um backend oficial de mídia, como Cast ou DLNA;
- suporte a aparelhos antigos por bridge ou uma explicação clara da limitação;
- matriz pública de modelos testados;
- nenhum backend contrário à política pública do fabricante;
- seleção automática e deduplicação confiáveis.
