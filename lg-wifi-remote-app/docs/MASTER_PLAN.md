# Plano mestre de implementação — Libre Remote

Este plano organiza o trabalho restante para transformar a base atual em um produto público, confiável e expansível.

## Objetivo

Entregar um controle remoto Android que:

- conecte com o menor número possível de etapas;
- funcione bem com LG webOS e Samsung Tizen;
- ofereça mídia para DLNA/UPnP e Google Cast;
- esconda funções incompatíveis;
- preserve privacidade e segurança;
- tenha baixa latência;
- seja acessível e personalizável;
- possa ser publicado no GitHub, F-Droid e Google Play.

## Fase 0 — Congelamento e auditoria

### Entregas

- congelar a última base LG funcional;
- comparar comportamento da base universal com a versão LG;
- remover código e triggers temporários;
- revisar dependências e licenças;
- revisar package ID, nome e marca;
- confirmar que nenhum secret está versionado;
- gerar inventário de arquivos e hashes.

### Critérios de aceite

- build limpo em uma máquina nova;
- testes e lint passam;
- nenhum arquivo privado no histórico que será publicado;
- documentação aponta limitações reais.

## Fase 1 — Fundação de dados e estado

### Banco

Usar Room para:

- dispositivos;
- rotas/endpoints históricos;
- capacidades detectadas;
- layouts;
- macros;
- favoritos;
- diagnóstico limitado;
- resultados de testes de compatibilidade.

Usar DataStore para:

- tema;
- vibração e som;
- sensibilidade;
- modo mão esquerda;
- tamanho dos controles;
- TV e preset padrão;
- onboarding e permissões.

Usar Android Keystore para:

- client keys LG;
- tokens Samsung;
- fingerprints locais;
- futuros refresh tokens OAuth.

### Migrações

- criar migração dos dados legados por IP;
- gerar ID estável por UDN/USN, identificador do fabricante, certificado ou MAC;
- preservar pareamentos existentes;
- testar upgrade e downgrade suportado.

## Fase 2 — Descoberta plug and play

### Pipeline

Executar de forma concorrente e limitada:

1. última TV conhecida;
2. IPs históricos;
3. SSDP direcionado;
4. SSDP geral;
5. NSD/mDNS;
6. descoberta oficial Cast, na variante Play;
7. SmartThings apenas após OAuth;
8. Libre Bridge por mDNS.

### Deduplicação

Combinar uma mesma TV encontrada por:

- webOS;
- Tizen;
- DLNA;
- DIAL;
- Cast;
- bridge.

Escolher o backend mais completo como principal e manter rotas secundárias para recursos complementares.

### Diagnóstico

Detectar:

- Wi-Fi desligado;
- permissão negada;
- rede de convidados;
- isolamento de clientes;
- VPN;
- multicast bloqueado;
- TV desligada;
- porta inacessível;
- pareamento recusado;
- certificado alterado;
- IP trocado.

## Fase 3 — Estabilização LG webOS

### Trabalho

- reduzir permissões do manifesto de registro ao mínimo necessário;
- testar webOS antigo, intermediário e atual;
- validar portas 3000/3001 e certificados;
- testar touchpad, teclado, apps e entradas;
- estabilizar Wake-on-LAN;
- corrigir reconexão após suspensão;
- adicionar simulador LG;
- criar testes de contrato por comando.

### Saída

LG passa de “principal” para “estável” apenas após matriz física publicada.

## Fase 4 — Estabilização Samsung Tizen

### Trabalho

- separar claramente 8001 e 8002;
- tratar token ausente, expirado e recusado;
- verificar `ms.channel.ready` e timeouts;
- mapear teclas por geração;
- testar desligar, ligar, canais e mídia;
- limitar comandos pendentes;
- fazer TLS pinning/TOFU dentro do handshake;
- criar simulador Tizen;
- montar matriz por ano/firmware.

### Saída

Backend continua Beta até existir cobertura física suficiente.

## Fase 5 — DLNA/UPnP

### Trabalho

- endurecer parser XML;
- suportar AVTransport e RenderingControl v1/v2;
- play, pause, stop, seek, URI e metadados;
- normalizar volume;
- bloquear redirects externos;
- garantir somente hosts locais;
- adicionar timeouts por fabricante;
- testar XML malformado e respostas gigantes.

### Saída

Classificação “Mídia”, nunca “controle completo”.

## Fase 6 — Google Cast e SmartThings

### Cast

Criar duas variantes:

- `foss`: sem Google Play Services;
- `play`: com Cast Framework oficial.

Entregas:

- descoberta;
- sessão;
- play/pause/seek;
- fila;
- faixas;
- volume;
- reconexão;
- notificação de mídia.

### SmartThings

- OAuth oficial;
- lista de dispositivos autorizados;
- capabilities reais por aparelho;
- fallback opcional para Samsung;
- preferir Tizen local quando disponível;
- remover credenciais ao desconectar a conta.

## Fase 7 — Interface final

### Estrutura

- uma tela principal de controle;
- alternador Controle/Touchpad;
- painéis inferiores para Apps, Entradas e Mais;
- configurações secundárias;
- seletor de TV no cabeçalho.

### Presets

- Simples;
- Normal;
- Avançado;
- Personalizado 1, 2 e 3.

### Editor

- grade responsiva;
- mover e redimensionar;
- trocar ação e ícone;
- repetição ao segurar;
- visibilidade por capacidade;
- validação contra sobreposição;
- exportar/importar layout.

### Acessibilidade

- TalkBack;
- 48 dp mínimos;
- contraste;
- fonte grande;
- modo mão esquerda;
- alto contraste;
- teclado físico;
- foco correto;
- não depender apenas de cor.

## Fase 8 — Macros e automação

### Recursos

- comandos;
- delays limitados;
- aguardar conexão;
- aguardar capacidade;
- trocar dispositivo;
- cancelar;
- continuar/parar em falha;
- mostrar passo atual.

### Limites

- máximo de passos;
- máximo de duração;
- sem loops infinitos;
- confirmação para ações destrutivas;
- logs locais sanitizados.

## Fase 9 — Superfícies Android

- widget Glance;
- atalhos dinâmicos;
- atalhos fixados;
- Quick Settings Tile;
- notificação opcional;
- ações rápidas por preset;
- atualização sem serviço permanente sempre que possível.

## Fase 10 — Voz e texto

- SpeechRecognizer;
- preferir reconhecimento local;
- parser determinístico;
- confirmação antes de enviar texto sensível;
- não guardar áudio;
- histórico de texto opcional;
- limpar histórico;
- nunca registrar senha digitada.

## Fase 11 — Desempenho

### Scheduler

Separar filas:

- crítica: OK, Voltar, Home e Energia;
- repetível: Volume e Canal;
- conflada: touchpad e scroll;
- normal: apps, entradas e mídia;
- background: estado e diagnóstico.

### Metas

- UI fria visível abaixo de 800 ms;
- abertura quente abaixo de 350 ms;
- toque até fila abaixo de 8 ms;
- trabalho interno antes da rede abaixo de 16 ms;
- reconexão local abaixo de 1 segundo;
- repetição em 80–110 ms;
- até 60 Hz no touchpad;
- zero comandos antigos acumulados;
- zero rede na thread principal.

### Ferramentas

- Baseline Profiles;
- Startup Profiles;
- Macrobenchmark;
- FrameTimingMetric;
- StartupTimingMetric;
- traces customizados por backend.

## Fase 12 — Segurança

- restrição a endereços locais;
- validação IPv4/IPv6 local;
- sem redirects externos;
- TLS por dispositivo;
- alerta de fingerprint alterada;
- XML sem DTD/entidades;
- limites de resposta;
- logs sem tokens;
- banco e credenciais sem backup;
- revisão de dependências;
- canal privado de vulnerabilidade.

## Fase 13 — Libre Bridge

### Hardware inicial

- ESP32;
- LED IR;
- receptor IR;
- USB para energia;
- Wi-Fi local.

### Protocolo

- mDNS;
- pareamento por QR;
- HTTPS local;
- chaves por aparelho;
- comandos assinados;
- firmware assinado.

### Recursos

- perfis IR;
- aprendizado;
- repetição;
- macros;
- exportação/importação;
- futuro HDMI-CEC.

## Fase 14 — Testes

### Automatizados

- unidades;
- contratos de backend;
- migrações;
- parsers;
- filas;
- macros;
- layouts;
- segurança de URL;
- Compose UI;
- acessibilidade.

### Simuladores

- LG aceita/recusa;
- Samsung aceita/recusa/muda certificado;
- DLNA lento ou malformado;
- IP muda;
- socket cai;
- multicast bloqueado.

### Matriz física

- Android 8 a 17;
- Samsung, Motorola, Pixel e Xiaomi;
- cinco gerações LG;
- cinco gerações Samsung;
- três DLNA;
- Cast/Google TV;
- roteadores e mesh diferentes.

## Fase 15 — Publicação

- repositório público dedicado;
- licença GPL-3.0-or-later;
- marca e ícone próprios;
- package ID definitivo;
- chave permanente de upload;
- Play App Signing;
- política HTTPS;
- Data Safety;
- screenshots reais;
- teste interno;
- teste fechado;
- GitHub Releases;
- F-Droid para variante FOSS;
- changelog e hashes.

## Critério de conclusão

O projeto pode ser chamado de estável quando:

- LG e Samsung possuem matrizes reais;
- DLNA/Cast são apresentados honestamente como mídia;
- troca de IP não perde o aparelho;
- layouts e macros são confiáveis;
- segurança foi revisada;
- Android 17 está tratado;
- CI reproduz builds;
- assinatura definitiva está configurada;
- nenhuma capacidade falsa é exibida;
- crash/ANR e latência atendem as metas.
