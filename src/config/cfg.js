// Configurações globais e constantes do jogo

// Definição das equipes disponíveis
export const TEAM = {
  Y: { name: 'Amarelo', color: '#f1fa8c', emoji: '🟡' },
  R: { name: 'Vermelho', color: '#ff6b6b', emoji: '🔴' },
  G: { name: 'Verde',    color: '#50fa7b', emoji: '🟢' },
  B: { name: 'Azul',     color: '#8be9fd', emoji: '🔵' },
  W: { name: 'Branco',   color: '#ffffff', emoji: '⚪' },
  M: { name: 'Marrom',   color: '#a0522d', emoji: '🟤' },
  P: { name: 'Rosa',     color: '#ff9a9e', emoji: '🌸' },
  V: { name: 'Roxo',     color: '#c084fc', emoji: '🟣' },
  O: { name: 'Laranja',  color: '#fb923c', emoji: '🟠' },
  C: { name: 'Cinza',    color: '#9ca3af', emoji: '⚫' }
};

// Atributos base de cada classe de unidade
export const CLASSES = {
  barbaro:   { label: 'Bárbaro',   color: '#f97316', hasRanged: false, weaponLen: 40, tipRadius: 11, omega: 3.0 },
  paladino:  { label: 'Paladino',  color: '#fde047', hasRanged: false, weaponLen: 36, tipRadius: 10, omega: 3.6 },
  monge:     { label: 'Monge',     color: '#60a5fa', hasRanged: false, weaponLen: 0,  tipRadius: 0,  omega: 0.0 },
  clerigo:   { label: 'Clérigo',   color: '#93c5fd', hasRanged: false, weaponLen: 36, tipRadius: 12, omega: 3.6 },
  ranger:    { label: 'Ranger',    color: '#34d399', hasRanged: true,  cooldownMiraPercent: 0.25, weaponLen: 36, tipRadius: 8,  omega: 3.6 },
  bruxo:     { label: 'Bruxo',     color: '#a78bfa', hasRanged: true,  cooldownMiraPercent: 0.10, weaponLen: 20, tipRadius: 6,  omega: 3.4 },
  guerreiro: { label: 'Guerreiro', color: '#f59e0b', hasRanged: true,  cooldownMiraPercent: 0.15, weaponLen: 38, tipRadius: 10, omega: 3.6 }
};

// Objeto de configuração principal contendo parâmetros de gameplay
export const CFG = {
  // Modos de arena disponíveis
  arenas: {
    padrao: {
      key: 'padrao',
      name: 'Arena Padrão',
      // Largura/altura absolutas da arena
      width: 1000,
      height: 700
    },
    battle_royale: {
      key: 'battle_royale',
      name: 'Arena Battle Royale',
      // Dimensões iniciais
      widthStart: 1200,
      heightStart: 800,
      // Dimensões finais
      widthEnd: 600,
      heightEnd: 400,
      // Tempo em segundos antes de começar a transição
      shrinkDelay: 5,
      // Duração da transição
      shrinkDuration: 20
    }
  },

  // Tema visual do jogo
  theme: { grid: '#1f3046', grid2: '#1a2640', border: '#3b82f6', glow: '#7dd3fc' },

  // Constantes de física
  physics: {
    friction: 0.994,
    restitution: 0.9,
    wallBounce: 0.92,
    boostWall: 1.10,
    boostWeaponWeapon: 1.45,
    vMin: 160,
    vMax: 780,
    initImpulse: 320
  },

  // Atributos do corpo da unidade
  body: { radius: 26, mass: 1, baseHP: 100 },

  // Arma corpo‑a‑corpo padrão
  weapon: { length: 36, tipRadius: 9, omega: 3.8 },

  // Projéteis genéricos de longa distância
  ranged: {
    speed: 900,
    life: 1.7,
    radius: 6,
    dmg: 7,
    knock: 220,
    cooldown: 0.85,
    trail: 10
  },

  // Configuração específica da classe Ranger
  ranger: {
    hpBase: 120, hpPerLevel: 8,
    stillVel: 30, stillTime: 0.5, passiveDmgMult: 1.5,
    arrow: { baseSpeed: 700, speedPerLevel: 15, gravity: 180, drag: 0.12, life: 3.0, radius: 5, color: '#96f2a2' },
    // Perfect Shot: dano reduzido em 60%
    perfectShot: { cd: 5.0, dmgMult: 0.6 },
    forestCall: { cd: 12.0, duration: 6.0, minions: { base: 1, lvl2: 8, lvl3: 14 }, dmgBase: 10, dmgPerLevelPct: 0.05 }
  },

  // Configuração da classe Bárbaro
  barbaro: {
    hpBase: 180, tipDamageBase: 18, knockTipBase: 420,
    dash: { detectR: 480, coneDeg: 70, accel: 1600, time: 0.35, dmgBonus: 1.3, knockBonus: 1.2, cd: 4.5 },
    roar: { threatR: 300, need: 2, dmgReduce: 0.65, duration: 1.2, cd: 8.0 }
  },

  // Configuração da classe Paladino
  paladino: {
    hpBase: 160, hpPerLevel: 12, tipBase: 16,
    _forceSacredOnce: false,
    sacred: { baseChance: 0.08, chancePerLevel: 0.01, chanceMax: 0.35, radiusBase: 52, radiusPerLevel: 1.5, dmgMult: 1.65, knockPerDamage: 22, color: '#ffe28a' },
    shield: { dur: 4.0, cdBase: 10.0, cdMin: 4.5, cdPerLevel: 0.25, knockForce: 900 },
    heal: { cdBase: 12.0, cdMin: 5.0, cdPerLevel: 0.4, percentBase: 0.12, percentPerLevel: 0.01, range: 460, color: '#a7f3d0' }
  },

  // Configuração da classe Monge
  monge: {
    hpBase: 120, hpPerLevel: 4,
    // aumento de 30% no dano base
    dmgMult: 1.95,
    vMinBonusPerLevel: 8,  vMaxBonusPerLevel: 14,
    vMinBonusCap: 160,      vMaxBonusCap: 360,
    baseBodyDamageL1: 8, bodyDamagePerLvl: 0.6,
    impulseOnHit: 280,
    stacks: { time: 2.4, speed: 0.05, max: 6, k: 0.35, vRef: 500 },
    seek: { force: 120, maxDist: 600 },
    accel: { base: 260, perStack: 120 },
    impactBurst: { speed: 320, wallSpeed: 260, grantStack: true },
    // "local" é usado no CD local do dano de corpo no collide()
    rajada: { dur: 0.45, interval: 0.15, hits: 3, bonus: 1.15, cd: 6, detectR: 160, coneDeg: 85, local: 0.12 },
    deflect: { coneDeg: 110, rSense: 120, rHit: 50, dur: 1.2, cd: 5.5, dmgMult: 2.0, speedBoost: 1.1 },
    parry: {
      omegaMul: -1.1,
      tangentForce: 420,
      radialPush: 160,
      staggerT: 0.18
    }
  },

  // Configuração da classe Clérigo
  clerigo: {
    hpBase: 150, hpPerLevel: 10,
    // dano base reduzido em 20%
    tipBase: 11.2,
    knockBase: 340,

    sacredFlame: {
      dmgBase: 8, dmgPerLevel: 0.8,
      speed: 900, life: 1.1, radius: 5, knock: 160,
      color: '#ffb86c',
      period: 3.8,
      jitter: 0.4
    },

    beam: {
      cd: 18.0, dur: 1.6, range: 900, width: 26,
      // dano do Sunbeam aumentado em 70%
      dpsBase: 102, dpsPerLevel: 7.65, push: 900, tick: 0.06,
      color: '#ffe28a', edge: '#f59e0b'
    },

    prayer: {
      cd: 9.0,
      healPctBase: 0.12, healPctPerLevel: 0.012,
      radius: 360,
      selfBonus: 1.15,
      color: '#a7f3d0'
    }
  },

  // Configuração da classe Bruxo
  bruxo: {
    hpBase: 110,
    hpPerLevel: 6,
    blast: { speed: 900, life: 1.4, rad: 6, dmg: 14, knock: 260 },
    hex:    { cd: 8, dur: 6, dmgMult: 2.5, color: '#b794f4' },
    link:   { leechPct: 0.20 },
    familiar: {
      hpBase: 80, hpPerLevel: 8, bodyR: 14, color: '#c7b2ff',
      fireCD: 1.2,
      bullet: { speed: 750, life: 1.2, rad: 5, dmg: 6, knock: 120, color: '#d6c7ff' },
      cdAfterDeath: 10
    }
  },

  // Configuração da classe Guerreiro
  guerreiro: {
    hpBase: 150, hpPerLevel: 10, tipBase: 15,

    // Lança arremessada
    spear: {
      speed: 860, life: 1.2, rad: 6, dmgBase: 12, knock: 260,
      color: '#e5e7eb',
      cdTotal: 1.4,
      disarmedFrac: 0.45
    },

    // Troca de modo
    switch: { meleeR: 180 },

    // Passiva: bônus no próximo golpe após alternar distância
    discipline: { bonus: 1.25 },

    // Habilidade 1: Parry
    parry: { cd: 5.0, tangent: 520, radial: 240, lockT: 0.22 },

    // Habilidade 2: Postura de Guerra
    war: { detectR: 220, omegaMul: 1.35, knockResistPct: 0.35 }
  },

  // Sistema de níveis e experiência
  level: { max: 20, hpPerLevelPct: 0.06, dmgPerLevelPct: 0.05 },
  xp: {
    cost(level) { return Math.floor(35 + level * 15 + Math.pow(level, 1.6) * 8); },
    gain: { hitTaken: 5, weaponClash: 10, hitDealtBase: 18, hitDealtPerDmg: 1.2, kill: 60 }
  },

  // Engajamento da IA
  engage: {
    idleSpeed: 140,
    idleTime: 1.0,
    pullStrength: 220,
    maxPullDist: 520,
    tipDamageBase: 14
  },

  // Efeitos visuais globais
  vfx: { shadow: 18, bloom: 0.25, particlesOnHit: 10, reflectSpark: 6 }
};

// Escalas globais para itens visuais presos às unidades
// Tamanho padrão relativo ao diâmetro da bola e raio seguro para o texto do nível
export const CLASS_ITEM_SCALE = 0.15 * (CFG.body.radius * 2);
export const LEVEL_SAFE_RADIUS = 0.42 * CFG.body.radius;

// Configuração visual por classe. Cada item é posicionado usando um ângulo fixo
// e pode ajustar escala, animação e paleta de cores.
export const CLASS_VISUALS = {
  barbaro: {
    item: 'tunica_fina',
    anchorAngleDeg: 120,
    scale: 0.15,
    microAnim: 'sway_low',
    palette: ['#8B4A2B', '#C9935A', '#402A1C'],
    weaponOverride: 'axe_double_bit_v2'
  },
  ranger: {
    item: 'aljava_pequena',
    anchorAngleDeg: 45,
    scale: 0.15,
    microAnim: 'idle_breath',
    palette: ['#4E6B3A', '#B89B6B', '#2E3B22']
  },
  monge: {
    item: 'rosario_punho',
    anchorAngleDeg: 300,
    scale: 0.14,
    microAnim: 'subtle_pulse',
    palette: ['#C8A26A', '#5E3B21', '#E5D7B8']
  },
  paladino: {
    item: 'insignia_escudo',
    anchorAngleDeg: 20,
    scale: 0.16,
    microAnim: 'glint_slow',
    palette: ['#C9C9C9', '#E6D27A', '#7A6A3A']
  },
  clerigo: {
    item: 'sigilo_sol',
    anchorAngleDeg: 330,
    scale: 0.15,
    microAnim: 'soft_glow',
    palette: ['#FFD67A', '#F4B43A', '#8A6A2A']
  },
  bruxo: {
    item: 'runa_orbital',
    anchorAngleDeg: 250,
    scale: 0.13,
    microAnim: 'orbit_slow',
    palette: ['#7E57C2', '#A586E8', '#40345A']
  },
  guerreiro: {
    item: 'ombreira_metal',
    anchorAngleDeg: 210,
    scale: 0.16,
    microAnim: 'sway_low',
    palette: ['#9BA4AE', '#6B757F', '#CACFD6']
  }
};

