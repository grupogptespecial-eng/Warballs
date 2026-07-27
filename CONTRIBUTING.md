# Contribuindo com o Warballs

## Escopo

Este repositório aceita somente alterações relacionadas ao jogo Warballs.
Não envie aplicativos Android, controles remotos, arquivos da Play Store,
keystores, APKs, AABs, payloads codificados ou workflows de outro produto.

## Fluxo recomendado

1. Crie uma branch curta a partir de `main`.
2. Use nomes como `feature/...`, `fix/...`, `docs/...` ou `test/...`.
3. Execute `npm test` antes de abrir a pull request.
4. Abra a pull request diretamente contra `main`.
5. Remova a branch depois do merge.

## GitHub Actions

- Workflows devem validar o jogo, não gerar código-fonte.
- O CI não pode fazer commit ou push para a própria branch.
- Não envie artefatos em toda execução. Artefatos só devem existir quando forem
  realmente necessários e com retenção curta.
- Builds de outros projetos devem ocorrer no repositório desses projetos.

## Segurança e manutenção

- Nunca faça commit de senhas, tokens, certificados ou chaves privadas.
- Não use arquivos compactados ou fragmentados como fonte canônica do projeto.
- Mantenha a `main` funcional e revisável.
- Compare branches antigas com `main` antes de apagá-las.
