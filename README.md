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

Na seção **Partida** é possível escolher entre duas arenas:

- **Arena Padrão** – defina manualmente largura e altura fixas.
- **Battle Royale** – informe dimensões inicial/final e tempos de
  delay/duração para que a arena encolha ou cresça suavemente durante a
  partida.

## Mecânica de mira

Unidades com ataques à distância possuem uma espera oculta após o fim do
cooldown normal. Durante esse período a arma só dispara se houver inimigo na
linha de visão; caso contrário o tiro é efetuado quando a espera termina. O
tempo extra é definido por classe em `src/config/cfg.js` através do campo
`cooldownMiraPercent`.

## Desenvolvimento

Instale as dependências (se houver) e execute os testes sintáticos:

```bash
npm test
```

O script percorre todos os arquivos em `src/` usando `node --check`, acusando
quaisquer erros de sintaxe antes de abrir o jogo no navegador.
