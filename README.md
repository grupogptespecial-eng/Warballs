# Warballs

Protótipo em módulos do jogo **Battle Balls**. O antigo monolito
`game.js` foi totalmente decomposto e removido, dando lugar a uma
estrutura organizada por arquivos que facilita manutenção e expansão.

## Estrutura

```
public/          – arquivos entregues ao navegador
  index.html     – página inicial
src/             – código-fonte em ES modules
  main.js        – ponto de entrada que inicializa o jogo
  core/          – estado central e loop
  render/        – utilidades de desenho (preview, background)
  entities/      – projéteis, partículas, summons e familiares
  unit/          – classes jogáveis e lógica de unidades
  utils/         – helpers diversos (rand, geometry, misc)
  ...
```

## Uso

Abra `public/index.html` em um navegador moderno. O arquivo importa
`src/main.js`, que por sua vez inicializa `game` e começa o loop principal.

## Desenvolvimento

- Os módulos utilizam sintaxe ES6.
- Cada arquivo pode ser verificado rapidamente com `node --check <arquivo>`. 
  Exemplo:

  ```bash
  node --check src/render/preview.js
  ```

## Licença

Este projeto é distribuído nos termos da licença MIT. Consulte o arquivo
`LICENSE` (se disponível) para mais detalhes.
