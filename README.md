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

## Crates

O jogo possui um sistema de **crates** configuráveis que pode gerar três
tipos de bônus:

- **Vida** – quadrado verde que cura ao ser coletado;
- **Experiência** – hexágono azul que concede XP;
- **Híbrido** – octógono meio verde/meio azul que oferece ambos.

Os parâmetros ficam em `CFG.crates` e também podem ser ajustados no painel
**Crates** da interface. Ative cada tipo pela caixa de seleção e defina
taxa média de spawn (`avgPer100s`), tempo de vida (`lifetime`), máximo
simultâneo (`maxConcurrent`), tamanho (`sizePx`) e recompensas
(`healAmount`/`xpAmount`). Há limites globais de distância entre crates e
de distância mínima de unidades. As configurações do painel são salvas em
`localStorage` (chave `crateConfig_v2`).

Em arenas do tipo Battle Royale, crates fora dos limites atuais seguem a
política `brCratePolicyOnShrink`, que pode ser `despawn`, `pushInwards` ou
`disableOutside` (cinza e inativo por alguns segundos).

## Mecânica de mira

Unidades com ataques à distância possuem uma espera oculta após o fim do
cooldown normal. Durante esse período a arma só dispara se houver inimigo na
linha de visão; caso contrário o tiro é efetuado quando a espera termina. O
tempo extra é definido por classe em `src/config/cfg.js` através do campo
`cooldownMiraPercent` (Ranger 25%, Bruxo 10%, Artífice 20% por padrão).

## Itens visuais por classe

Cada classe pode exibir um pequeno item cosmético preso ao corpo do personagem
para reforçar sua identidade. As definições estão em `src/config/cfg.js` no
objeto `CLASS_VISUALS`, que indica o item, ângulo de ancoragem, escala e a
microanimação utilizada. O tamanho padrão é dado por `CLASS_ITEM_SCALE_DEFAULT`
com multiplicador global `GLOBAL_ITEM_SCALE_MULT` (160% por padrão), e os itens
jamais ultrapassam o raio seguro `LEVEL_SAFE_RADIUS_MULT * BALL_RADIUS`, reservado ao texto de
nível. Esses elementos são apenas visuais e não afetam colisões.

Itens atuais (com micro‑animação):

- **Bárbaro** – saia e machado duplo *(sway_low)*
- **Preset/Paleta**: `SAIA_PRESET` define as proporções da saia; as cores do
  Bárbaro são expostas em `BARBARIAN_PALETTE` (couro, metal e madeira).
- **Ranger** – aljava grande (4×) *(idle_breath)*
- **Monge** – colar *(subtle_pulse)*
- **Paladino** – insígnia de escudo *(glint_slow)*
- **Clérigo** – sigilo solar *(soft_glow)*
- **Bruxo** – chifres duplos *(idle_breath)*
- **Guerreiro** – ombreira metálica *(sway_low)*
- **Artífice** – óculos sutis e canhão arcano *(idle_breath)*

## Guerreiro – Lança v2

O Guerreiro alterna entre estocadas de média distância e arremessos curtos de
lança. A arma possui geometria segmentada (ponta letal e cabo sólido) e o
projétil retorna automaticamente após um tempo de voo máximo. Alternar entre um
ataque corpo‑a‑corpo e um arremesso dentro do tempo de `discipline.swapWindow`
ativa **Disciplina Marcial**, concedendo bônus de dano no próximo acerto. A
classe conta ainda com Postura de Guerra, Parry avançado e outras manobras
táticas descritas em `CFG.guerreiro`. Quando ameaçado por inimigos próximos,
o Guerreiro aborta qualquer arremesso em preparação ou em voo, aumenta em 50 %
a velocidade de giro e reduz pela metade o tempo entre golpes corpo‑a‑corpo,
retornando à cadência normal após a área estar limpa. Arremessos de lança,
ativação da postura e aparos agora disparam partículas para destacar cada
habilidade.

## Desenvolvimento

Instale as dependências (se houver) e execute os testes sintáticos:

```bash
npm test
```

O script percorre todos os arquivos em `src/` usando `node --check`, acusando
quaisquer erros de sintaxe antes de abrir o jogo no navegador.
