# Checklist final do Google Play Console — Libre Remote 2.1.3 RC5.4

Versão candidata: `2.1.3-rc5.4-customization` (`versionCode 29`).
ApplicationId canônico: `io.github.grupogptespecialeng.libreremote`.

## Identidade e assinatura

- [x] applicationId definido e coberto por gate de continuidade.
- [x] keystore de sideload removido do Git e padrões de chave adicionados ao `.gitignore`.
- [ ] Gerar a chave permanente de upload fora do repositório e manter backup seguro.
- [ ] Ativar Play App Signing no primeiro upload.
- [ ] Confirmar nome público e e-mail de suporte do desenvolvedor.

## Build e QA automatizado

- [x] Workflow de integridade/materialização RC5.4.
- [x] Gate de WSS LG preferencial sobre WS.
- [x] Matriz Android API 29 / 33 / 35 e perfis Pixel 2 / Pixel 4 / Pixel 6 configurada.
- [x] Font scale 1.0 / 1.5 / 2.0 e landscape configurados.
- [x] Auditor de viewport e touch targets configurado.
- [x] Evidências de memória, gfx/jank, ANR, crash e batterystats configuradas.
- [x] Upgrade RC5.3 -> RC5.4 com sentinela de persistência configurado.
- [ ] Obter execução verde dos workflows após corrigir Billing & plans / spending limit do GitHub Actions.
- [ ] Gerar e verificar APK/AAB de release assinado.

## Testes físicos obrigatórios

- [ ] Instalar o candidato em pelo menos três celulares físicos.
- [ ] Testar pelo menos cinco gerações/modelos LG webOS antes de ampliar `StableFull`.
- [ ] Testar Samsung em múltiplas gerações antes de remover o rótulo experimental.
- [ ] Testar Wi-Fi, TV em Ethernet e isolamento de clientes/rede de convidados.
- [ ] Testar descoberta, pareamento aceito, negado e expirado.
- [ ] Testar TV desligada/dormindo, retorno, reconnect e mudança de IP/DHCP.
- [ ] Confirmar WSS, fallback WS, mudança de certificado e re-pareamento.
- [ ] Validar navegação, volume, canais, pointer, teclado, apps, inputs, mídia e Wake-on-LAN conforme a matriz de cada modelo.

## Página da loja

- [x] Data Safety preparado; revisar novamente após qualquer dependência nova.
- [ ] Publicar política de privacidade em HTTPS.
- [ ] Enviar ícone 512 x 512 e feature graphic 1024 x 500.
- [ ] Capturar screenshots reais do candidato validado; não usar apenas imagens conceituais.
- [ ] Preencher classificação de conteúdo, público e acesso ao app.
- [ ] Informar URL de suporte e do repositório Libre Remote dedicado quando criado.

## Publicação

- [ ] Executar teste interno no Play Console.
- [ ] Cumprir eventual exigência de teste fechado da conta.
- [ ] Revisar relatório de pré-lançamento e corrigir bloqueadores.
- [ ] Publicar somente depois de CI verde, matriz física registrada e revisão final de políticas de fabricantes.
