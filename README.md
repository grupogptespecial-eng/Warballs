# Warballs

Protótipo em módulos do jogo **Battle Balls**. O antigo monolito
`game.js` foi totalmente decomposto e removido, dando lugar a uma
estrutura organizada por arquivos que facilita manutenção e expansão.

## Estrutura

```
public/          – arquivos entregues ao navegador
  index.html     – página inicial
  assets/        – imagens e outros recursos estáticos
  data/          – arquivos de configuração ou mock de dados
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
`src/main.js`, que inicializa o estado do jogo, prepara os controles da
interface e permite iniciar a partida clicando em **Iniciar** após adicionar
unidades.

## Desenvolvimento

Instale as dependências (se houver) e execute os testes sintáticos:

```bash
npm test
```

O script percorre todos os arquivos em `src/` usando `node --check`, acusando
quaisquer erros de sintaxe antes de abrir o jogo no navegador.
