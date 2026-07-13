# Libre Remote — Handoff técnico

Data do pacote: 13 de julho de 2026.

Este documento resume o estado do projeto para que outra pessoa consiga continuar o desenvolvimento sem depender do histórico da conversa.

## 1. Visão do produto

Libre Remote é um controle remoto Android local-first, gratuito, sem anúncios, sem analytics e sem conta própria. A proposta é detectar a televisão, identificar o protocolo disponível, montar somente os controles realmente suportados e oferecer uma experiência plug and play.

Princípios:

- abrir, encontrar a TV e controlar;
- não mostrar funções que o aparelho não suporta;
- preferir comunicação local;
- não enviar telemetria;
- manter protocolos e marcas isolados por backend;
- tratar integrações não comprovadas como beta ou experimental;
- nunca incluir chaves privadas no repositório ou no pacote público.

## 2. Estado atual

A versão cumulativa mais recente é a base do Libre Remote 2.0.

Implementado:

- Android em Kotlin e Jetpack Compose;
- descoberta local e gerenciamento de várias TVs;
- backend LG webOS como principal integração;
- backend Samsung Tizen local experimental;
- backend DLNA/UPnP para mídia e volume quando anunciados;
- contrato universal de backends e capacidades;
- presets Simples, Normal, Avançado e personalizados;
- editor e persistência de layouts;
- touchpad, teclado, apps e entradas quando suportados;
- macros limitadas e canceláveis;
- widget, atalhos de launcher e Quick Settings;
- comandos de voz interpretados localmente após reconhecimento do Android;
- diagnóstico sanitizado;
- métricas locais de desempenho;
- Room, DataStore e armazenamento criptografado de credenciais;
- acessibilidade, modo claro, escuro, AMOLED, alto contraste e controles ampliados;
- documentação de build, release, segurança, compatibilidade e privacidade;
- workflows de CI e materiais da Play Store.

Ainda exige validação real:

- matriz ampla de versões LG webOS;
- matriz ampla de firmwares Samsung Tizen;
- comportamento em roteadores, redes mesh, redes de convidados e troca de IP;
- estabilidade de Wake-on-LAN por modelo;
- testes físicos de macros, widget, atalhos, Quick Settings e voz;
- publicação da política de privacidade em HTTPS;
- criação da conta e configuração definitiva do Play Console;
- chave permanente de upload e Play App Signing;
- teste fechado exigido pela conta do desenvolvedor, quando aplicável.

## 3. Compatibilidade declarada

| Plataforma | Estado | Observação |
|---|---|---|
| LG webOS | Principal / mais completo | Precisa de matriz física por geração |
| Samsung Tizen local | Experimental | Pode variar bastante por firmware |
| DLNA / UPnP AV | Parcial | Mídia, volume e mudo quando anunciados |
| Google Cast | Planejado | Deve ser apresentado como mídia, não controle completo |
| Samsung SmartThings | Planejado | Opcional, exige OAuth e internet |
| Android / Google TV | Planejado | Não prometer navegação completa sem API autorizada |
| Fire TV | Pesquisa | Não anunciar controle completo sem rota oficial |
| Philips JointSpace | Pesquisa | Manter atrás de feature flag até testes reais |
| Hisense VIDAA | Pesquisa | Manter atrás de feature flag até documentação e testes |
| Roku | Não distribuir | Política atual do fabricante restringe apps móveis de terceiros |
| TVs sem protocolo de rede | Libre Bridge futuro | Infravermelho e/ou HDMI-CEC externo |

## 4. Arquitetura resumida

Fluxo principal:

```text
Compose UI
   ↓
RemoteViewModel
   ↓
TvBackend / CommandScheduler / Discovery / Persistence
   ↓
LG webOS | Samsung Tizen | DLNA | futuros backends
```

Regras de backend:

- declarar apenas capacidades comprovadas;
- nunca bloquear a main thread;
- limitar filas, timeouts e reconexões;
- normalizar erros técnicos em mensagens compreensíveis;
- apagar tokens e chaves ao esquecer a TV;
- manter credenciais separadas por dispositivo;
- expor diagnóstico sem segredos.

## 5. Estrutura de arquivos importantes

- `README.md`: apresentação do projeto;
- `ARCHITECTURE.md`: camadas e limites arquiteturais;
- `BUILDING.md`: build local e release;
- `COMPATIBILITY.md`: matriz e políticas de compatibilidade;
- `TESTING.md`: testes automatizados e físicos;
- `SECURITY.md`: modelo de ameaça e reporte;
- `PRIVACY.md`: política de privacidade;
- `RELEASING.md`: processo de versão e assinatura;
- `ROADMAP.md`: direção de evolução;
- `store-listing/`: textos e materiais de publicação;
- `app/src/main/`: código Android;
- `app/src/test/`: testes unitários;
- `.github/workflows/`: CI, release e privacy pages;
- `.github/ISSUE_TEMPLATE/`: bugs e relatórios de compatibilidade.

## 6. Como compilar

Requisitos:

- JDK 17;
- Android SDK Platform 35;
- Android Build Tools 35 ou superior.

Validação local:

```bash
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleDebug
```

Release assinada:

```bash
export LIBRE_KEYSTORE_PATH=/caminho/absoluto/upload-key.jks
export LIBRE_KEYSTORE_PASSWORD='...'
export LIBRE_KEY_ALIAS='...'
export LIBRE_KEY_PASSWORD='...'
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleRelease :app:bundleRelease
```

Nunca colocar keystore, senha, APK ou AAB em commits públicos.

## 7. Prioridade recomendada

1. Fazer regressão completa em uma LG real.
2. Testar Samsung Tizen em vários anos/firmwares.
3. Corrigir descoberta, pareamento e reconexão encontrados nos testes.
4. Medir latência por backend e otimizar filas/comandos.
5. Fechar acessibilidade e screenshots reais.
6. Transferir o projeto para um repositório público dedicado.
7. Configurar chave permanente, Play App Signing e trilha de teste interno.
8. Publicar beta LG/Samsung/DLNA com matriz honesta.
9. Depois integrar Cast oficial, SmartThings opcional e Libre Bridge.

## 8. Critérios de release estável

Uma versão não deve ser marcada como estável quando:

- houver regressão no backend LG;
- tokens forem perdidos em atualização;
- a descoberta travar ou bloquear a interface;
- um botão for exibido sem funcionar;
- dados saírem da rede local sem consentimento;
- logs expuserem token, texto digitado ou certificado completo;
- migrações do banco não forem testadas;
- a assinatura usada for temporária.

## 9. Segurança do pacote

O pacote de handoff deve excluir:

- `*.jks` e `*.keystore`;
- senhas e secrets de CI;
- tokens de pareamento;
- APKs/AABs assinados com chaves privadas;
- diretórios `build/` e `.gradle/`;
- logs não sanitizados.

## 10. Observação sobre o repositório atual

O projeto foi desenvolvido em branches isoladas dentro do repositório `Warballs` apenas para aproveitar CI privado. Ele não deve ser mesclado no jogo. O destino correto é um repositório próprio, como `libre-remote`, preservando a licença GPL-3.0-or-later e a identidade de marca independente.
