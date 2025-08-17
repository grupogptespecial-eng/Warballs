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
  barbaro:   { label: 'Bárbaro',   color: '#f97316', hasRanged: false, weaponLen: 40, tipRadius: 14, omega: 3.0 },
  paladino:  { label: 'Paladino',  color: '#fde047', hasRanged: false, weaponLen: 36, tipRadius: 12, omega: 3.6 },
  monge:     { label: 'Monge',     color: '#60a5fa', hasRanged: false, weaponLen: 0,  tipRadius: 0,  omega: 0.0 },
  clerigo:   { label: 'Clérigo',   color: '#93c5fd', hasRanged: false, weaponLen: 36, tipRadius: 8.4, omega: 3.6 },
  ranger:    { label: 'Ranger',    color: '#34d399', hasRanged: true,  cooldownMiraPercent: 0.25, weaponLen: 36, tipRadius: 9,  omega: 3.6 },
  bruxo:     { label: 'Bruxo',     color: '#a78bfa', hasRanged: true,  cooldownMiraPercent: 0.10, weaponLen: 20, tipRadius: 6,  omega: 3.4 },
  bardo:     { label: 'Bardo',     color: '#f472b6', hasRanged: true,  cooldownMiraPercent: 0.15, weaponLen: 20, tipRadius: 5,  omega: 3.6 },
  artifice:  { label: 'Artífice',  color: '#7FDBFF', hasRanged: true,  cooldownMiraPercent: 0.20, weaponLen: 34, tipRadius: 9,  omega: 3.6 },
  guerreiro: { label: 'Guerreiro', color: '#f59e0b', hasRanged: true, cooldownMiraPercent: 0.10, weaponLen: 38, tipRadius: 5, omega: 3.6 },
  druida:   { label: 'Druida',   color: '#22c55e', hasRanged: true, cooldownMiraPercent: 0.0, weaponLen: 32, tipRadius: 8, omega: 3.2 }
};

// Paleta completa para os elementos do Bárbaro (couro, metal e madeira)
export const BARBARIAN_PALETTE = {
  leatherBase: '#8B4A2B',
  leatherLight: '#C9935A',
  leatherStroke: '#402A1C',
  metal: '#D5D9DF',
  metalStroke: '#848C96',
  woodLight: '#A8743A',
  woodDark: '#7E572C'
};

export const THEMES = {
  dark: {
    bg: '#0f1622',
    bg2: '#0a111b',
    grid: '#1f3046',
    grid2: '#1a2640',
    border: '#3b82f6',
    glow: '#7dd3fc'
  },
  // Light theme uses softer tints to brighten the arena and canvas backgrounds
  light: {
    bg: '#f8fafc',
    bg2: '#e5e7eb',
    grid: '#94a3b8',
    grid2: '#cbd5e1',
    border: '#64748b',
    glow: '#94a3b8'
  }
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
  theme: { ...THEMES.dark },

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
  body: { radius: 26, mass: 1, baseHP: 130 },

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
    hpBase: 156, hpPerLevel: 10.4,
    stillVel: 30, stillTime: 0.5, passiveDmgMult: 1.5,
    arrow: { baseSpeed: 700, speedPerLevel: 15, gravity: 180, drag: 0.12, life: 3.0, radius: 5, color: '#16a34a' },
    // Perfect Shot: dano reduzido em 60%
    perfectShot: { cd: 5.0, dmgMult: 0.6 },
    forestCall: { cd: 12.0, duration: 6.0, minions: { base: 1, lvl2: 8, lvl3: 14 }, dmgBase: 12, dmgPerLevelPct: 0.05 }
  },

  // Configuração da classe Bárbaro
  barbaro: {
    hpBase: 234, // 30% mais vida
    tipDamageBase: 18, knockTipBase: 420,
    dash: { detectR: 480, coneDeg: 70, accel: 1600, time: 0.35, dmgBonus: 1.3, knockBonus: 1.2, cd: 4.5 },
    roar: { threatR: 300, need: 2, dmgReduce: 0.65, duration: 1.2, cd: 8.0 }
  },

  // Configuração da classe Paladino
  paladino: {
    hpBase: 208, hpPerLevel: 15.6, tipBase: 16,
    _forceSacredOnce: false,
    sacred: { baseChance: 0.08, chancePerLevel: 0.01, chanceMax: 0.35, radiusBase: 52, radiusPerLevel: 1.5, dmgMult: 1.65, knockPerDamage: 22, color: '#ffe28a' },
    shield: { dur: 4.0, cdBase: 10.0, cdMin: 4.5, cdPerLevel: 0.25, knockForce: 900 },
    heal: { cdBase: 12.0, cdMin: 5.0, cdPerLevel: 0.4, percentBase: 0.12, percentPerLevel: 0.01, range: 460, color: '#a7f3d0' }
  },

  // Configuração da classe Monge
  monge: {
    hpBase: 202.8, hpPerLevel: 6.76,
    // aumento adicional de 20% no dano base
    dmgMult: 2.34,
    vMinBonusPerLevel: 8,  vMaxBonusPerLevel: 14,
    vMinBonusCap: 160,      vMaxBonusCap: 360,
    baseBodyDamageL1: 12.48, bodyDamagePerLvl: 0.936,
    impulseOnHit: 280,
    stacks: { time: 2.4, speed: 0.05, max: 6, k: 0.35, vRef: 500 },
    seek: { force: 120, maxDist: 600 },
    accel: { base: 260, perStack: 120 },
    impactBurst: { speed: 320, wallSpeed: 260, grantStack: true },
    // "local" é usado no CD local do dano de corpo no collide()
    rajada: { dur: 0.45, interval: 0.15, hits: 3, bonus: 1.15, cd: 6, detectR: 160, coneDeg: 85, local: 0.12 },
    deflect: { coneDeg: 150, rSense: 208, rHit: 84.5, dur: 1.6, cd: 4.0, dmgMult: 2.5, speedBoost: 1.3 },
    parry: {
      omegaMul: -1.1,
      tangentForce: 420,
      radialPush: 160,
      staggerT: 0.18
    }
  },

  // Configuração da classe Clérigo
  clerigo: {
    hpBase: 195, hpPerLevel: 13,
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
      // dano do Sunbeam reduzido em 40%
      dpsBase: 122.4, dpsPerLevel: 9.18, push: 900, tick: 0.06,
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
    hpBase: 143,
    hpPerLevel: 7.8,
    blast: { speed: 900, life: 1.4, rad: 6, dmg: 14, knock: 260 },
    hex:    { cd: 8, dur: 6, dmgMult: 2.5, color: '#b794f4' },
    link:   { leechPct: 0.20 },
    familiar: {
      hpBase: 40, hpPerLevel: 4, bodyR: 14, color: '#c7b2ff',
      fireCD: 1.2,
      bullet: { speed: 750, life: 1.2, rad: 5, dmg: 6, knock: 120, color: '#d6c7ff' },
      cdAfterDeath: 7
    }
  },

  // Configuração da classe Bardo
  bardo: {
    hpBase: 187.2, hpPerLevel: 12.48,
    note: {
      dmg: 29.204,
      heal: 6,
      selfHeal: 4,
      buffDmg: 0.3,
      buffSpeed: 0.15,
      debuffDmg: 0.18,
      duration: 2.0,
      cooldown: 0.6,
      speed: 600,
      track: 4,
      life: 1.12,
      radius: 5,
      knock: 120
    },
    inspire: { heal: 3, radius: 120 },
    ritmo: {
      radius: 270,
      dmg: 0.2,
      speed: 0.2,
      tempHP: 40,
      duration: 5.0,
      cooldown: 12.0
    },
    cortante: {
      cd: 8.0,
      speed: 120,
      life: 6.3,
      radius: 5,
      zigzagAmp: 100,
      zigzagFreq: 20,
      pierce: 2,
      dmg: 13,
      knock: 180
    }
  },

  // Configuração da classe Guerreiro
  guerreiro: {
    hpBase: 214.5,
    hpPerLevel: 14.3,

    spear: {
      shaftLenFactor: 3.6,
      shaftThickness: 0.18,
      tipBonus: 1.25,
      meleeStartup: 0.085,
      meleeActive: 0.065,
      meleeRecover: 0.12,
      meleeCooldown: 0.18,
      aimSnapDeg: 18,
      maxAngVel: 720
    },

    throw: {
      enabled: true,
      // Warriors stop throwing when foes are within 65% of max range
      minRange: 10.4,
      maxRange: 16.0,
      speed: 15.6 * 1.3 * 1.3,
      flightMaxTime: (16.0 / 15.6 * 1.4) * 1.2,
      onHitStop: 0.06,
      cooldown: 20.4 * 0.8,
      returnMode: 'auto',
      friendlyFire: false,
      precisionErrDeg: 8,
      precisionErrPerLevel: -0.4,
      rangePerLevel: 0.08
    },

    discipline: {
      swapWindow: 0.9,
      nextHitBonus: 0.2,
      bonusDurationMax: 3.0
    },

    maneuvers: {
      parry: {
        ttiWindow: 0.10,
        disarmDuration: 0.45,
        counterStartup: 0.05,
        tangent: 520,
        radial: 240,
        lockT: 0.22
      },
        advance: {
          vulnerableFOVDeg: 35,
          dashSpeed: 8.0,
          dashDuration: 0.12,
          angAccel: 1800,
          connectAngleDeg: 10,
          triggerRadius: 3.0,
          cooldown: 0.75
        },
        dodge: {
          ttiProjectile: 0.35,
          sidestepDist: 0.6,
          cooldown: 1.65
        }
      },

      stance: {
        threatRadius: 3.0,
        atkRateBonus: 0.5,
        knockbackRedBase: 0.2,
        knockbackRedPer100HP: 0.2,
        knockbackRedMax: 0.6,
        exitGrace: 0.28
      },

      damage: {
        meleeBase: 32.4,
        throwBase: 109.7
      }
  },

  // Configuração da classe Artífice
  artifice: {
    // Arma principal: Canhão Arcano
    cannon: {
      baseDamage: 33.124,
      knockback: 1.666,
      selfKnockback: 12.0,
      // velocidade dobrada
      speed: 18.0,
      lifeTime: 0.9,
      cooldown: 1.862,
      radius: 8.4,
      pierce: 0,
      friendlyFire: false,
      miraCondPercent: 0.20,
      precisionErrDeg: 6
    },

    // Passiva Overclock
    overclock: {
      tSemDano: 3.5,
      cdRateMult: 1.35,
      decayOnHit: true,
      minUptimeAfterStart: 1.0
    },

    // Habilidade 1: Torreta Móvel
    turret: {
      maxActive: 2,
      spawnCooldown: 4.0,
      bodyRadius: 12,
      baseHP: 65,
      range: 6.0,
      fireRate: 1.4,
      bulletDamage: 7,
      // dobro da velocidade anterior
      bulletSpeed: 16.0,
      bulletKnock: 0.5,
      xpOnBump: 10.4,
      xpToLevel: [12, 28, 52],
      perLevel: {
        HP: [0, 20, 35, 55],
        range: [0, 0.4, 0.6, 0.8],
        fireRate: [0, 0.15, 0.25, 0.35],
        bulletDamage: [0, 2, 3, 4]
      },
      decay: {
        flatPerSec: 1.0,
        pctMaxHPPerSec: 0.012,
        minHPFloor: 1
      },
      repairOnBump: {
        flat: 6,
        pctMax: 0.06,
        cd: 0.6
      },
      lifetime: 45,
      pushableSpeed: 2.0
    },

    // Habilidade 2: Campo de Mineração
    mines: {
      capacityBase: 3,
      capacityPerLevel: 1,
      throwRadius: 4.5,
      armingTime: 0.4,
      detectRadius: 1.2,
      damage: 18,
      knockback: 1.2,
      chainAffectsMines: true,
      friendlyFire: false,
      lifetime: 25,
      cooldown: 0.49,
      hitToDetonate: true
    },

    // Arena Battle Royale — política para gadgets fora da safe zone
    arenaBRPolicy: 'disableOutside',

    // Itens visuais e cores
    visuals: {
      goggles: { anchorDeg: 30, scale: 0.16, microAnim: 'idle_breath' },
      turretColor: '#A6B1B8',
      mineColor: '#C54B4B',
      arcaneColor: '#7FDBFF'
    }
  },

  // Configuração da classe Druida
  druida: {
    staff: {
      dmgBase: 15, dmgPerLevel: 1.5,
      cooldown: 1.8,
      radiusBase: 8.4, radiusPerLevel: 0.4,
      fire: { dot: 5, duration: 3 },
      ice: { slowPct: 0.35, duration: 1.6 },
      lightning: { stunChance: 0.18, duration: 0.8 },
      earth: { knock: 380 }
    },
    passive: { regenPerSec: 4, delay: 5.0 },
    root: {
      radius: 220,
      pullSpeed: 160,
      limitFactor: 0.5,
      cooldown: 8,
      bodyRadius: 18,
      baseHP: 180,
      escapeDmg: 35,
      pulse: { dmg: 5, radius: 60, interval: 1.0 },
      xpToLevel: [18, 36, 60],
      perLevel: {
        hp: [0, 40, 60],
        pulseDmg: [0, 2, 3]
      }
    },
    bear: {
      hpBase: 260,
      duration: 20,
      radiusMult: 1.3,
      impactDmg: 22
    }
  },

  // Sistema de níveis e experiência
  level: { max: 20, hpPerLevelPct: 0.1875, dmgPerLevelPct: 0.125 },
  xp: {
    cost(level) { return Math.floor(35 + level * 15 + Math.pow(level, 1.6) * 8); },
    gain: {
      hitTaken: 5,
      weaponClash: 10,
      hitDealtBase: 18,
      hitDealtPerDmg: 1.2,
      killBase: 60,
      killPerLevel: 10
    }
  },

  // Engajamento da IA
  engage: {
    idleSpeed: 140,
    idleTime: 1.0,
    pullStrength: 220,
    maxPullDist: 520,
    tipDamageBase: 14
  },

  // Configuração do sistema de crates (power‑ups de vida/XP)
  crates: {
    health: {
      enabled: false,
      avgPer100s: 12,
      lifetime: 35,
      maxConcurrent: 6,
      sizePx: 18,
      healAmount: 12
    },
    xp: {
      enabled: false,
      avgPer100s: 12,
      lifetime: 35,
      maxConcurrent: 6,
      sizePx: 18,
      xpAmount: 8
    },
    hybrid: {
      enabled: true,
      avgPer100s: 12,
      lifetime: 35,
      maxConcurrent: 6,
      sizePx: 18,
      healAmount: 8,
      xpAmount: 6
    },
    minDistanceFromUnits: 28,
    minDistanceBetweenCrates: 24,
    brCratePolicyOnShrink: 'despawn'
  },

  // Efeitos visuais globais
  vfx: { shadow: 18, bloom: 0.25, particlesOnHit: 10, reflectSpark: 6 }
};

// Escalas globais para itens visuais presos às unidades
// Tamanho padrão relativo ao diâmetro da bola e raio seguro para o texto do nível
export const CLASS_ITEM_SCALE_DEFAULT = 0.15;
export const GLOBAL_ITEM_SCALE_MULT = 1.6;
export const LEVEL_SAFE_RADIUS_MULT = 0.42;

// Configuração visual por classe. Cada item é posicionado usando um ângulo fixo
// e pode ajustar escala, animação e paleta de cores.
export const CLASS_VISUALS = {
  barbaro: {
    // item
    item: 'saia_barbaro',
    anchorAngleDeg: 100,
    scale: 0.45,
    microAnim: 'sway_low',
    palette: [BARBARIAN_PALETTE.leatherBase, BARBARIAN_PALETTE.leatherLight, BARBARIAN_PALETTE.leatherStroke],
    distanceFromCenter: 0.02,
    internalRotationDeg: -100,
    itemOffsetY: 0.0,
    // weapon
    weaponOverride: 'axe_double_bit_v2',
    weaponAngleDeg: 35,
    weaponScale: 1.25,
    weaponDistanceFromCenter: 2.0,
    weaponAnchor: 0
  },
  ranger: {
    // item
    item: 'aljava_pequena',
    anchorAngleDeg: 45,
    scale: 0.56,
    microAnim: 'idle_breath',
    palette: ['#4E6B3A', '#B89B6B', '#2E3B22'],
    distanceFromCenter: 0.82,
    internalRotationDeg: 0,
    // weapon
    weaponAngleDeg: -25,
    weaponScale: 1.56,
    weaponDistanceFromCenter: 1.5,
    weaponAnchor: 0
  },
  monge: {
    // item
    item: 'colar_monge',
    scale: 0.6,
    palette: [],
    distanceFromCenter: 0.82,
    internalRotationDeg: 0
  },
  paladino: {
    // item
    item: 'insignia_escudo',
    anchorAngleDeg: 20,
    scale: 0.55,
    microAnim: 'glint_slow',
    palette: ['#C9C9C9', '#E6D27A', '#7A6A3A'],
    distanceFromCenter: 0.62,
    internalRotationDeg: 0,
    // weapon
    weaponAngleDeg: -90,
    weaponScale: 1.6,
    weaponDistanceFromCenter: 2.0,
    weaponAnchor: 0
  },
  clerigo: {
    // item
    item: 'sigilo_sol',
    anchorAngleDeg: 330,
    scale: 0.34,
    microAnim: 'soft_glow',
    palette: ['#FFD67A', '#F4B43A', '#8A6A2A'],
    distanceFromCenter: 0.72,
    internalRotationDeg: 0,
    // weapon
    weaponAngleDeg: 90,
    weaponScale: 2.0,
    weaponDistanceFromCenter: 1.8,
    weaponAnchor: 0
  },
  bruxo: {
    // weapon
    weaponAngleDeg: -10,
    weaponAnchor: 0,
    palette: ['#7E57C2', '#A586E8', '#40345A'],
    items: [
      { item: 'chifre_bruxo', anchorAngleDeg: 220, scale: 0.38, microAnim: 'idle_breath', palette: ['#7E57C2', '#A586E8', '#40345A'], distanceFromCenter: 1.92, internalRotationDeg: -100 },
      { item: 'chifre_bruxo', anchorAngleDeg: 320, scale: 0.38, microAnim: 'idle_breath', palette: ['#7E57C2', '#A586E8', '#40345A'], distanceFromCenter: 1.92, internalRotationDeg: 280, flipX: true }
    ]
  },
  bardo: {
    // item
    item: 'chapeu_bardo',
    anchorAngleDeg: 270,
    scale: 0.66,
    microAnim: 'idle_breath',
    palette: ['#11772a', '#22a33a', '#d7b193'],
    distanceFromCenter: 0.72,
    internalRotationDeg: 0,
    // weapon
    weaponOverride: 'flauta',
    weaponAngleDeg: 0,
    weaponScale: 1.5,
    weaponDistanceFromCenter: 1.6,
    weaponAnchor: 0
  },
  artifice: {
    // item
    item: 'goggles',
    anchorAngleDeg: 270,
    scale: 0.56,
    microAnim: 'idle_breath',
    palette: ['#A6B1B8', '#E0E7EA', '#3B4A5A'],
    distanceFromCenter: 0.52,
    internalRotationDeg: 0,
    // weapon
    weaponOverride: 'arcane_cannon',
    weaponAngleDeg: 40,
    weaponScale: 1.8,
    weaponDistanceFromCenter: 1.5,
    weaponAnchor: 0
  },
  guerreiro: {
    // item
    item: 'ombreira_metal',
    anchorAngleDeg: 210,
    scale: 0.70,
    microAnim: 'sway_low',
    palette: ['#9BA4AE', '#6B757F', '#CACFD6'],
    distanceFromCenter: 0.82,
    internalRotationDeg: 0,
    // weapon
    weaponAngleDeg: 15,
    weaponScale: 1,
    weaponDistanceFromCenter: 1.0,
    weaponThickness: 1,
    weaponAnchor: -0.48
  },
  druida: {
    // item
    item: 'druida_horns',
    anchorAngleDeg: 270,
    scale: 1.5,
    microAnim: 'idle_breath',
    palette: ['#6E4A2F', '#C9A17B', '#E9D7C1'],
    distanceFromCenter: 0.72,
    internalRotationDeg: 90,
    // weapon
    weaponOverride: 'druida_staff',
    weaponAngleDeg: 0,
    weaponScale: 1.5,
    weaponDistanceFromCenter: 1.6,
    weaponAnchor: 0
  }
};

export const ITEM_ALIASES = {
  tanga_barbaro: 'saia_barbaro',
  necklace_monge: 'colar_monge',
  rosario_monge: 'colar_monge'
};

export function setTheme(name) {
  const t = THEMES[name] || THEMES.dark;
  Object.assign(CFG.theme, t);
}

