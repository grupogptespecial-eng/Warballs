# Mapeamento de Refatoração

Este documento serve como guia central para a migração do monolito
`game.js` para a nova arquitetura modular. O arquivo original foi
removido após a migração; aqui permanecem apenas o inventário de seus
símbolos e o destino correspondente em arquivos separados.

## Inventário do monolito

### Seções principais

| Seção | Linha | Observações |
| --- | --- | --- |
| `CAPÍTULO 1` – Configurações Globais | 3 | início do bloco de constantes e parâmetros |
| `CAPÍTULO 2` – Funções de Utilidade | 220 | helpers genéricos |
| `CAPÍTULO 3` – Entidades do Jogo | 601 | definem classes de gameplay |
| `CAPÍTULO 4` – Lógica Central do Jogo | 2382 | objeto `game` e loop principal |
| `CAPÍTULO 5` – Renderização | 2992 | utilidades de desenho e pré-visualização |
| `CAPÍTULO 6` – Testes | 3121 | harness de testes embutido |

### Constantes globais

| Constante | Linha |
| --- | --- |
| `TEAM` | 11 |
| `CLASSES` | 24 |
| `CFG` | 36 |
| `clamp` | 224 |
| `randAng` | 225 |
| `fpsEl`, `overlay`, `arenaNameEl`, `perf`, `unitListEl`, `btnAddUnit` | 2386-2392 |
| `ensureNoiseAny` | 2412 |
| `game` | 2600 |
| `previewCanvas`, `pctx` | 2996-2997 |
| `canvas`, `g` | 3047-3048 |
| `Tests` | 3125 |

### Funções de topo

`rrand`, `drawRoundedRect`, `reflect`, `hexToRgb`, `rgbToHex`, `shade`,
`showMessage`, `hideMessage`, `_seg5`, `barbHP`, `barbTip`, `barbKnock`,
`barbOmega`, `barbApplyPassiveDamage`, `rangerStats`, `rangerSpeedMult`,
`palStats`, `palHP`, `monkHP`, `monkBodyDamage`, `monkVMinBonus`,
`monkVMaxBonus`, `monkConeRad`, `monkScaledDamage`, `inFrontArc`,
`nearestEnemyOf`, `projApproaching`, `clericHP`, `clericTip`, `clericKnock`,
`distPointToSegment`, `optionClassHTML`, `populateClassSelect`, `drawUnitThumb`,
`ensureNoise`, `makeMonkState`, `ensureNoiseFallback`, `optionClassHTMLFallback`,
`getClassOptionsHTML`, `optionTeamHTML`, `addUnitRow`, `wireUnitRow`,
`drawUnitThumbRow`, `drawPreview`, `drawArenaRect`, `drawBackground`,
`addTest`, `runTests`.

### Classes e métodos

| Classe (linha) | Métodos principais |
| --- | --- |
| `V` (228) | `constructor`, `clone`, `set`, `add`, `sub`, `mul`, `len`, `nrm`, `dot`, `fromAng` (estático) |
| `Particle` (624) | `constructor`, `update`, `draw` |
| `Effect` (643) | `constructor`, `update`, `draw` |
| `Projectile` (674) | `constructor`, `stepMove`, `update`, `draw` |
| `Arrow` (824) | `constructor`, `stepMove`, `draw` |
| `SpearProjectile` (899) | `constructor`, `stepMove`, `draw` |
| `Summon` (962) | `constructor`, `update`, `draw` |
| `Familiar` (1001) | `constructor`, `canDamage`, `hit`, `update`, `draw` |
| `Unit` (1087) | `constructor`, `applyClassDefaults`, `xpCost`, `addXP`, `levelUp`, `dmgMult`, `gainXPDefense`, `gainXPWeaponClash`, `gainXPOffense`, `gainXPKill`, `canDamage`, `hit`, `tip`, `ensureSpeed`, `physics`, `collide`, `monkOnHitDealt`, `monkNaturalAccel`, `monkImpactBurst`, `monkApplyPassive`, `monkSeek`, `monkFlurryTick`, `monkEndFlurry`, `monkTryRajada`, `monkTryDeflect`, `monkParryAgainst`, `nearestEnemyWithinCone`, `tryInvestida`, `updateInvestida`, `tryUrro`, `castPalHeal`, `trySacredStrike`, `fire`, `castPerfectShot`, `castForestCall`, `clericPassiveTick`, `clericStartBeam`, `clericBeamTick`, `castPrayer`, `castHex`, `castFamiliar`, `drawBars`, `drawLevel`, `draw` |

### Habilidades e recursos por classe

| Classe | Passivas / Ativos |
| --- | --- |
| **Barbaro** | `barbApplyPassiveDamage` (dano escala com HP faltante), `tryInvestida`/`updateInvestida` (Dash), `tryUrro` (Roar) |
| **Paladino** | `trySacredStrike` (chance de golpe sagrado), `castPalHeal` (cura), `palShieldT`/`shield` (escudo bloqueia e empurra) |
| **Monge** | Bônus de velocidade (`monkVMinBonus`/`VMaxBonus`), `monkSeek`, `monkImpactBurst`, `monkTryRajada` (Rajada), `monkTryDeflect`, `monkParryAgainst` |
| **Clérigo** | `clericPassiveTick` (Sacred Flame), `clericStartBeam`/`clericBeamTick` (Sunbeam), `castPrayer` (cura em área) |
| **Ranger** | `rangerSpeedMult` passivo, `fire` (flechas), `castPerfectShot`, `castForestCall` (invoca `Summon`) |
| **Bruxo** | `fire` usa `CFG.bruxo.blast`, `castHex`, `link` (roubo de vida), `castFamiliar` |
| **Guerreiro** | `fire` lança `SpearProjectile`, `parry` (contra-golpe), `war` (postura de guerra), passiva `discipline` após alternar modo |
| **Artífice** | Canhão Arcano, Overclock, Torreta Móvel, Campo de Mineração |

### Projetis, summons e efeitos

| Nome | Tipo | Propriedades principais |
| --- | --- | --- |
| `Projectile` | Base | `speed`, `life`, `radius`, `dmg`, `knock`, `color`, `trail`, `penetration` |
| `Arrow` | Projétil | herda `Projectile`; adiciona `gravity`, `drag`, `visual` (`eldritch`, `perfect` ou padrão) |
| `SpearProjectile` | Projétil | `speed`, `life`, `rad`, `dmg`, `knock`, `color`, `angle` |
| `CFG.bruxo.blast` | Projétil | `speed`, `life`, `rad`, `dmg`, `knock` |
| `Summon` | Evocação | `pos`, `vel`, `life`, `dmg`, `kind='forest'`, `bodyR`, `color` |
| `Familiar` | Evocação | `hp`, `bodyR`, `fireCD`, projétil próprio (`bullet` spec) |
| `Effect` | VFX | `pos`, `radius/maxRadius`, `life/maxLife`, `color`, `type` (`expand`) |
| `Particle` | VFX | `p`, `v`, `life`, `color` |

## Mapa de migração

| Símbolo | Módulo destino (linha aproximada) |
| --- | --- |
| `TEAM`, `CLASSES`, `CFG` | `src/config/cfg.js` (1-200) |
| `clamp`, `hexToRgb`, `rgbToHex`, `shade`, `addTest`, `runTests`, `fpsEl` etc. | `src/utils/misc.js` (1-120) |
| `rrand`, `randAng` | `src/utils/rand.js` (1-40) |
| `drawRoundedRect`, `reflect`, `distPointToSegment`, `inFrontArc`, `projApproaching` | `src/utils/geometry.js` (1-120) |
| `showMessage`, `hideMessage`, `optionClassHTML*`, `optionTeamHTML`, `addUnitRow`, `wireUnitRow`, `drawUnitThumb*` | `src/ui/debugOverlay.js` (1-160) |
| `ensureNoise`, `ensureNoiseFallback`, `drawArenaRect`, `drawBackground` | `src/render/drawHelpers.js` (1-200) |
| `drawPreview` | `src/render/preview.js` (1-80) |
| `makeMonkState`, `monk*` methods | `src/unit/monge.js` (1-200) |
| `barb*` helpers, `tryInvestida`, `updateInvestida`, `tryUrro` | `src/unit/barbaro.js` (1-200) |
| `pal*` helpers, `castPalHeal`, `trySacredStrike` | `src/unit/paladino.js` (1-200) |
| `rangerStats`, `rangerSpeedMult`, `fire` (arco), `castPerfectShot`, `castForestCall` | `src/unit/ranger.js` (1-220) |
| `cleric*` helpers, `clericStartBeam`, `clericBeamTick`, `castPrayer`, `clericPassiveTick` | `src/unit/clerigo.js` (1-220) |
| `castHex`, `castFamiliar`, `bruxo` passivas | `src/unit/bruxo.js` (1-200) |
| `updateGuerreiro`, `guerreiroParryAgainst`, FSM de spear/discipline | `src/unit/guerreiro.js` (1-220) |
| `class V` | `src/math/vec.js` (1-80) |
| `Particle`, `Effect`, `Projectile`, `Arrow`, `SpearProjectile` (retorno segmentado), `Summon`, `Familiar` | `src/entities/{particle.js,effect.js,projectile.js,arrow.js,spear.js,summon.js,familiar.js}` (1-160 cada) |
| `class Unit` (funcionalidade genérica) | `src/unit/unit.js` (1-400) |
| Objeto `game`, loop de atualização/render | `src/core/{game.js,loop.js,arena.js}` (1-400) |
| Renderização de pré-visualização e canvas principal | `src/render/{preview.js,drawHelpers.js}`, `public/index.html` |
| `CrateSystem` | `src/core/crateSystem.js` (1-200) |

### Novos recursos

*Este projeto continua a ser expandido. Novos símbolos e mecânicas
serão listados aqui conforme adicionados.*

- `cooldownMiraPercent` — parâmetro por classe em `src/config/cfg.js`
  controlando a espera de mira usada em `src/unit/unit.js`.
- `enemyInLineOfSight()` — método em `src/unit/unit.js` que verifica
  se há inimigo na linha de visão durante a janela de mira.
- `CrateSystem` — módulo em `src/core/crateSystem.js` que gerencia
  spawns de crates configuráveis e aplica políticas de shrink da arena.
