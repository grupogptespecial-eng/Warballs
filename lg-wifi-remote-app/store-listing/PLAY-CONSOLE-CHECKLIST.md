# Checklist final do Google Play Console

Versão preparada: Libre Remote 1.0.0 RC1, applicationId `io.github.grupogptespecialeng.libreremote`.
Build de validação: testes unitários, lint, APK assinado e Android App Bundle.

## Identidade

- [ ] Criar/confirmar a conta do desenvolvedor.
- [ ] Confirmar o nome público do desenvolvedor.
- [ ] Informar e-mail de suporte público.
- [x] Confirmar o applicationId: `io.github.grupogptespecialeng.libreremote`.
- [ ] Guardar `PRIVATE-Libre-Remote-upload-key.zip` em dois locais seguros.
- [ ] Ativar Play App Signing no primeiro upload.

## Página da loja

- [x] Nome, descrição curta e completa em português e inglês.
- [x] Notas da versão.
- [x] Ícone adaptativo no aplicativo.
- [ ] Enviar ícone PNG de 512 × 512.
- [ ] Enviar feature graphic de 1024 × 500.
- [ ] Enviar pelo menos duas capturas reais do aplicativo.
- [ ] Publicar a política de privacidade em URL HTTPS pública.
- [ ] Informar URL do repositório open source e suporte.

## Conteúdo e políticas

- [x] Sem anúncios e sem compras no app.
- [x] Respostas de Data Safety preparadas em `DATA-SAFETY.md`.
- [ ] Preencher classificação de conteúdo no Console.
- [ ] Declarar público geral e que o app não é dirigido especificamente a crianças.
- [ ] Preencher acesso ao app: nenhuma credencial necessária.
- [ ] Confirmar declaração de uso de permissões quando solicitada pelo Console.

## Testes

- [x] Testes unitários e lint incluídos na CI.
- [x] APK e AAB de release gerados automaticamente.
- [ ] Instalar o APK de release em pelo menos três celulares.
- [ ] Testar em pelo menos cinco gerações/modelos de LG webOS.
- [ ] Testar rede Wi-Fi, TV por Ethernet e roteador com isolamento.
- [ ] Testar pareamento aceito, negado, TV desligada e mudança de IP.
- [ ] Realizar teste interno no Play Console.
- [ ] Caso a conta pessoal esteja sujeita à regra, cumprir o teste fechado exigido pelo Console.

## Publicação

- [ ] Subir o arquivo `.aab`.
- [ ] Verificar avisos automáticos de pré-lançamento.
- [ ] Corrigir bloqueadores do relatório de dispositivos.
- [ ] Promover para produção apenas após teste físico e revisão da política LG.
