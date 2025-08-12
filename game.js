
// ===================================
// CAPÍTULO 1: Configurações Globais
// ===================================

// 1.1. Definição das Equipes
// TEAM: Objeto que define as equipes do jogo.
//  - Chave: ID da equipe ('Y' para Amarelo, 'R' para Vermelho, etc.).
//  - name: Nome da equipe.
//  - color: Cor hexadecimal usada para renderizar a equipe.
const TEAM = {
  Y: { name: 'Amarelo', color: '#f1fa8c' },
  R: { name: 'Vermelho', color: '#ff6b6b' },
  G: { name: 'Verde',    color: '#50fa7b' },
  B: { name: 'Azul',     color: '#8be9fd' }
};

// 1.2. Definição das Classes de Unidade
// CLASSES: Atributos base por tipo de unidade.
//  - label: Nome de exibição.
//  - color: Cor base (VFX/UI).
//  - hasRanged: Se a classe dispara projéteis por padrão.
//  - weaponLen / tipRadius / omega: overrides da arma base.
const CLASSES = {
  barbaro:   { label: 'Bárbaro',   color: '#f97316', hasRanged: false, weaponLen: 40, tipRadius: 11, omega: 3.0 },
  paladino:  { label: 'Paladino',  color: '#fde047', hasRanged: false, weaponLen: 36, tipRadius: 10, omega: 3.6 },
  monge:     { label: 'Monge',     color: '#60a5fa', hasRanged: false, weaponLen: 0,  tipRadius: 0,  omega: 0.0 },
  clerigo:   { label: 'Clérigo',   color: '#93c5fd', hasRanged: false, weaponLen: 36, tipRadius: 12, omega: 3.6 },
  ranger:    { label: 'Ranger',    color: '#34d399', hasRanged: true,  weaponLen: 36, tipRadius: 8,  omega: 3.6 },
  bruxo:     { label: 'Bruxo',     color: '#a78bfa', hasRanged: true,  weaponLen: 20, tipRadius: 6,  omega: 3.4 },
  guerreiro: { label: 'Guerreiro', color: '#f59e0b', hasRanged: true,  weaponLen: 38, tipRadius: 10, omega: 3.6 }
};

// 1.3. Configurações Finais do Jogo
// CFG: Objeto global com todas as constantes e parâmetros do jogo.
const CFG = {
  // 1.3.13. Modos de Arena
  arenas: {
    simples:        { key: 'simples',        label: 'Arena Simples',            scale: 1.00 },
    simples_menor:  { key: 'simples_menor',  label: 'Arena Simples (Menor)',    scale: 0.50 },
    battle_royale:  {
      key: 'battle_royale', label: 'Arena Battle Royale',
      startScale: 1.00,
      endScale: 0.75,
      closeDefault: 25, // segundos
      closeMin: 5,
      closeMax: 180
    }
  },

  // 1.3.1. Tema visual
  theme: { grid: '#1f3046', grid2: '#1a2640', border: '#3b82f6', glow: '#7dd3fc' },

  // 1.3.2. Física
  physics: {
    friction: 0.994,           // Fricção para desacelerar as unidades.
    restitution: 0.9,          // Coeficiente de restituição (elasticidade) em colisões.
    wallBounce: 0.92,          // Força de repulsão na parede.
    boostWall: 1.10,           // Impulso extra ao bater na parede.
    boostWeaponWeapon: 1.45,   // Impulso extra ao colidir arma com arma.
    vMin: 160,                 // Velocidade mínima.
    vMax: 780,                 // Velocidade máxima.
    initImpulse: 320           // Impulso inicial ao nascer.
  },

  // 1.3.3. Corpo da Unidade
  body: { radius: 26, mass: 1, baseHP: 100 },

  // 1.3.4. Arma Padrão
  weapon: { length: 36, tipRadius: 9, omega: 3.8 },

  // 1.3.5. Projéteis à Distância
  ranged: {
    speed: 900,            // Velocidade do projétil.
    life: 1.7,             // Tempo de vida em segundos.
    radius: 6,             // Raio para colisão.
    dmg: 7,                // Dano base.
    knock: 220,            // Força de repulsão.
    cooldown: 0.85,        // Tempo de recarga.
    trail: 10              // Comprimento do rastro.
  },

  // 1.3.6. Configurações da Classe Ranger
  ranger: {
    hpBase: 120, hpPerLevel: 8,
    stillVel: 30, stillTime: 0.5, passiveDmgMult: 1.5,
    arrow: { baseSpeed: 700, speedPerLevel: 15, gravity: 180, drag: 0.12, life: 3.0, radius: 5, color: '#96f2a2' },
    perfectShot: { cd: 5.0, dmgMult: 1.5 },
    forestCall: { cd: 12.0, duration: 6.0, minions: { base: 1, lvl2: 8, lvl3: 14 }, dmgBase: 10, dmgPerLevelPct: 0.05 }
  },

  // 1.3.7. Configurações da Classe Bárbaro
  barbaro: {
    hpBase: 180, tipDamageBase: 18, knockTipBase: 420,
    dash: { detectR: 480, coneDeg: 70, accel: 1600, time: 0.35, dmgBonus: 1.3, knockBonus: 1.2, cd: 4.5 },
    roar: { threatR: 300, need: 2, dmgReduce: 0.65, duration: 1.2, cd: 8.0 }
  },

  // 1.3.8. Configurações da Classe Paladino
  paladino: {
    hpBase: 160, hpPerLevel: 12, tipBase: 16,
    _forceSacredOnce: false,
    sacred: { baseChance: 0.08, chancePerLevel: 0.01, chanceMax: 0.35, radiusBase: 52, radiusPerLevel: 1.5, dmgMult: 1.65, knockPerDamage: 22, color: '#ffe28a' },
    shield: { dur: 4.0, cdBase: 10.0, cdMin: 4.5, cdPerLevel: 0.25, knockForce: 900 },
    heal: { cdBase: 12.0, cdMin: 5.0, cdPerLevel: 0.4, percentBase: 0.12, percentPerLevel: 0.01, range: 460, color: '#a7f3d0' }
  },

  // 1.3.9. Configurações da Classe Monge
  monge: {
    hpBase: 120, hpPerLevel: 4,
    dmgMult: 1.5,
    vMinBonusPerLevel: 8,  vMaxBonusPerLevel: 14,
    vMinBonusCap: 160,      vMaxBonusCap: 360,
    baseBodyDamageL1: 8, bodyDamagePerLvl: 0.6,
    impulseOnHit: 280,
    stacks: { time: 2.4, speed: 0.05, max: 6, k: 0.35, vRef: 500 },
    seek: { force: 120, maxDist: 600 },
    accel: { base: 260, perStack: 120 },
    impactBurst: { speed: 320, wallSpeed: 260, grantStack: true },
    // ⚠ adicionado: "local" é usado no CD local do dano de corpo no collide()
    rajada: { dur: 0.45, interval: 0.15, hits: 3, bonus: 1.15, cd: 6, detectR: 160, coneDeg: 85, local: 0.12 },
    deflect: { coneDeg: 110, rSense: 120, rHit: 50, dur: 1.2, cd: 5.5, dmgMult: 2.0, speedBoost: 1.1 },
    parry: {
      omegaMul: -1.1,
      tangentForce: 420,
      radialPush: 160,
      staggerT: 0.18
    }
  },

  // 1.3.10. Configurações da Classe Clérigo
  clerigo: {
    hpBase: 150, hpPerLevel: 10,
    tipBase: 14,
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
      dpsBase: 60, dpsPerLevel: 4.5, push: 900, tick: 0.06,
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

  // 1.3.11. Configurações da Classe Bruxo
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

  // 1.3.12. Configurações da Classe Guerreiro
  guerreiro: {
    hpBase: 150, hpPerLevel: 10, tipBase: 15,

    // Lança arremessada
    spear: {
      speed: 860, life: 1.2, rad: 6, dmgBase: 12, knock: 260,
      color: '#e5e7eb',
      cdTotal: 1.4,      // recarga total
      disarmedFrac: 0.45 // parte da recarga que ele fica "desarmado"
    },

    // Troca de modo
    switch: { meleeR: 180 }, // fica em modo melee quando inimigo aproxima

    // Passiva: bônus no PRÓXIMO golpe após alternar distância
    discipline: { bonus: 1.25 },

    // Habilidade 1: Parry (ganha clash quando off-CD)
    parry: { cd: 5.0, tangent: 520, radial: 240, lockT: 0.22 },

    // Habilidade 2: Postura de Guerra (perto de inimigo)
    war: { detectR: 220, omegaMul: 1.35, knockResistPct: 0.35 }
  },

  // 1.3.10. Sistema de Níveis e XP
  level: { max: 20, hpPerLevelPct: 0.06, dmgPerLevelPct: 0.05 },
  xp: {
    cost(level) { return Math.floor(35 + level * 15 + Math.pow(level, 1.6) * 8); },
    gain: { hitTaken: 5, weaponClash: 10, hitDealtBase: 18, hitDealtPerDmg: 1.2, kill: 60 }
  },

  // 1.3.11. Engajamento da IA
  engage: {
    idleSpeed: 140,
    idleTime: 1.0,
    pullStrength: 220,
    maxPullDist: 520,
    tipDamageBase: 14
  },

  // 1.3.12. Efeitos Visuais
  vfx: { shadow: 18, bloom: 0.25, particlesOnHit: 10, reflectSpark: 6 }
};
// ===================================
// CAPÍTULO 2: Funções de Utilidade (Helpers)
// ===================================

// 2.1. Funções matemáticas básicas
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const randAng = () => Math.random() * Math.PI * 2;

// 2.2. Classe de Vetor 2D (V)
class V {
  constructor(x = 0, y = 0) { this.x = x; this.y = y }
  clone() { return new V(this.x, this.y) }
  set(x, y) { this.x = x; this.y = y; return this }
  add(v) { this.x += v.x; this.y += v.y; return this }
  sub(v) { this.x -= v.x; this.y -= v.y; return this }
  mul(s) { this.x *= s; this.y *= s; return this }
  len() { return Math.hypot(this.x, this.y) }
  nrm() { const l = this.len() || 1; this.x /= l; this.y /= l; return this }
  dot(v) { return this.x * v.x + this.y * v.y }
  static fromAng(a, m = 1) { return new V(Math.cos(a) * m, Math.sin(a) * m) }
}

// 2.3. Outras utilitárias
function rrand(a, b) { return a + Math.random() * (b - a) }

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function reflect(dir, normal) {
  const n = normal.clone();
  const L = n.len();
  if (L < 1e-6) return dir.clone().mul(-1);
  n.mul(1 / L);
  const v = dir.clone();
  const Lv = v.len();
  if (Lv > 1e-6) v.mul(1 / Lv);
  const d = v.dot(n);
  return v.sub(n.mul(2 * d));
}

// 2.4. Cores: hexToRgb / rgbToHex / shade
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 255, g: 255, b: 255 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
function rgbToHex(r, g, b) {
  const h = n => n.toString(16).padStart(2, '0');
  return `#${h(Math.max(0, Math.min(255, r)))}${h(Math.max(0, Math.min(255, g)))}${h(Math.max(0, Math.min(255, b)))}`;
}
function shade(hex, k) {
  const { r, g, b } = hexToRgb(hex);
  const t = k > 0 ? 255 : 0, f = Math.abs(k);
  return rgbToHex(
    Math.round(r + (t - r) * f),
    Math.round(g + (t - g) * f),
    Math.round(b + (t - b) * f)
  );
}

// 2.5. UI simples: mensagens
function showMessage(msg) {
  const msgBox = document.getElementById('message-box');
  const msgContent = document.getElementById('message-content');
  if (msgBox && msgContent) {
    msgContent.textContent = msg;
    msgBox.style.display = 'block';
  }
}
function hideMessage() {
  const msgBox = document.getElementById('message-box');
  if (msgBox) msgBox.style.display = 'none';
}

// 2.6. Progressões e helpers de combate

// _seg5: ajuda a fazer “degraus” a cada 5 níveis
function _seg5(L, start) { return Math.max(0, Math.min((L - 1) - start, 4)); }

// — Bárbaro
function barbHP(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return 180 + 14 * a + 16 * b + 18 * c + 20 * d;
}
function barbTip(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return 18 + 2 * a + 3 * b + 3 * c + 4 * d;
}
function barbKnock(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return 420 + 10 * a + 12 * b + 14 * c + 16 * d;
}
function barbOmega(L) {
  const drop = Math.floor(Math.max(0, L - 5) / 5);
  return 3.0 - 0.1 * drop;
}
function barbApplyPassiveDamage(unit, base) {
  const missing = 1 - (unit.hp / unit.hpMax);
  const bonus = Math.min(0.45, Math.max(0, Math.pow(missing, 1.4) * 0.45));
  return base * (1 + bonus);
}

// — Ranger
function rangerStats(level) {
  const L = Math.max(1, Math.min(level | 0, CFG.level.max));
  const cd = CFG.ranged.cooldown * (1 - 0.06 * Math.min(10, L - 1) / 10);
  const dmgBase = 10 + Math.floor((L - 1) * 1.2);
  const numArrows = (L >= 12) ? 2 : 1;
  const spread = 0.18;
  const speed = CFG.ranger.arrow.baseSpeed + CFG.ranger.arrow.speedPerLevel * (L - 1);
  return { cd, numArrows, dmgBase, spread, speed };
}
function rangerSpeedMult(level) {
  const t = Math.min(10, Math.max(1, level));
  return 1 + 0.167 * (t - 1) / 9;
}

// — Paladino
function palStats(level) {
  const L = Math.max(1, Math.min(level | 0, CFG.level.max));
  const sacredChance = Math.min(
    CFG.paladino.sacred.chanceMax,
    CFG.paladino.sacred.baseChance + CFG.paladino.sacred.chancePerLevel * (L - 1)
  );
  return {
    sacredChance,
    sacredRadius: CFG.paladino.sacred.radiusBase + CFG.paladino.sacred.radiusPerLevel * (L - 1),
    shieldCD: Math.max(CFG.paladino.shield.cdMin, CFG.paladino.shield.cdBase - CFG.paladino.shield.cdPerLevel * (L - 1)),
    healCD: Math.max(CFG.paladino.heal.cdMin, CFG.paladino.heal.cdBase - CFG.paladino.heal.cdPerLevel * (L - 1)),
    healPct: CFG.paladino.heal.percentBase + CFG.paladino.heal.percentPerLevel * (L - 1)
  };
}
function palHP(level) { return CFG.paladino.hpBase + CFG.paladino.hpPerLevel * (Math.max(1, level) - 1); }

// — Monge
function monkHP(level) { return CFG.monge.hpBase + CFG.monge.hpPerLevel * (level - 1); }
function monkBodyDamage(level) { return CFG.monge.baseBodyDamageL1 + Math.floor((level - 1) * CFG.monge.bodyDamagePerLvl); }
function monkVMinBonus(level) { return Math.min(CFG.monge.vMinBonusCap, CFG.monge.vMinBonusPerLevel * (level - 1)); }
function monkVMaxBonus(level) { return Math.min(CFG.monge.vMaxBonusCap, CFG.monge.vMaxBonusPerLevel * (level - 1)); }
function monkConeRad(deg) { return (deg * Math.PI / 180) * 0.5; }
function monkScaledDamage(base, velLen) {
  const k = CFG.monge.stacks.k, vRef = CFG.monge.stacks.vRef;
  return base + k * (velLen / vRef) * base;
}
function inFrontArc(self, point, halfAngleRad, r) {
  const to = new V(point.x - self.pos.x, point.y - self.pos.y);
  const d = to.len();
  if (d > r || d < 1e-6) return false;
  const f = new V(Math.cos(self.angle), Math.sin(self.angle));
  const dir = to.clone().mul(1 / d);
  const cos = clamp(f.dot(dir), -1, 1);
  const ang = Math.acos(cos);
  return ang <= halfAngleRad;
}
function nearestEnemyOf(self){
  let best=null, bestD=1e9;
  for(const o of game.units){
    if(!o.alive || o===self) continue;
    if(self.team && o.team && self.team===o.team) continue;
    const d = new V(o.pos.x-self.pos.x, o.pos.y-self.pos.y).len();
    if(d<bestD){ bestD=d; best=o; }
  }
  return best;
}
function projApproaching(p, u){
  const toU = new V(u.pos.x - p.pos.x, u.pos.y - p.pos.y);
  return p.dir.dot(toU) > 0;
}

// — Clérigo
function clericHP(level) {
  return CFG.clerigo.hpBase + CFG.clerigo.hpPerLevel * (Math.max(1, level) - 1);
}
function clericTip(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return CFG.clerigo.tipBase + 2*a + 3*b + 3*c + 4*d;
}
function clericKnock(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return CFG.clerigo.knockBase + 16*a + 18*b + 20*c + 24*d;
}
function distPointToSegment(p, a, b){
  const ab = new V(b.x - a.x, b.y - a.y);
  const denom = (ab.x*ab.x + ab.y*ab.y) || 1;
  const t = Math.max(0, Math.min(1, ((p.x-a.x)*ab.x + (p.y-a.y)*ab.y) / denom));
  const proj = new V(a.x + ab.x*t, a.y + ab.y*t);
  return new V(p.x - proj.x, p.y - proj.y).len();
}

// ===================================
// 2.7. Helpers de UI (opções + miniatura)
// ===================================

function optionClassHTML() {
  return `
    <option value="barbaro">Bárbaro</option>
    <option value="paladino">Paladino</option>
    <option value="monge">Monge</option>
    <option value="clerigo">Clérigo</option>
    <option value="ranger">Ranger</option>
    <option value="bruxo">Bruxo</option>
    <option value="guerreiro">Guerreiro</option>
  `;
}

function populateClassSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = optionClassHTML();
}

// Miniatura do boneco na lista (ctx, klass, color, level)
function drawUnitThumb(ctx, klass, color, level){
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0,0,W,H);

  // fundo com gradiente + grid
  const grd = ctx.createLinearGradient(0,0,0,H);
  grd.addColorStop(0,'#0f1622'); grd.addColorStop(1,'#0a111b');
  ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.globalAlpha=.12; ctx.strokeStyle='#1a2640';
  for(let x=10;x<W;x+=10){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=10;y<H;y+=10){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.restore();

  // corpo
  const base = color || (CLASSES[klass]?.color || '#7dd3fc');
  const outline = shade(base, -0.70);
  const weaponCol = shade(base, -0.18);
  const cx = W*0.38, cy = H*0.58, r = 16;

  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = base; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = outline; ctx.stroke();

  // nível (canto)
  ctx.save();
  ctx.font = '700 11px system-ui,Segoe UI';
  ctx.fillStyle = '#e6edf7';
  ctx.textAlign='right'; ctx.textBaseline='top';
  ctx.fillText('Lv ' + Math.max(1,Math.min(20,level|0)), W-6, 4);
  ctx.restore();

  // arma – versão simplificada
  ctx.save();
  ctx.translate(cx, cy);
  const bodyR = r, tipR = 7, len = 26;
  ctx.lineCap='round';

  const drawSword = () => {
    ctx.fillStyle = weaponCol;
    ctx.beginPath(); ctx.rect(bodyR, -4, len, 8); ctx.fill();
    ctx.fillStyle = shade(base, -0.4);
    ctx.beginPath(); ctx.rect(bodyR-4, -10, 8, 20); ctx.fill();
  };
  const drawMace = () => {
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bodyR,0); ctx.lineTo(bodyR+len- tipR,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(bodyR+len,0, tipR+2, 0, Math.PI*2);
    ctx.fillStyle = '#b6bcc8'; ctx.fill();
  };
  const drawBow  = () => {
    const limb = len+6, bowH = Math.max(10, limb*0.35), x0 = bodyR;
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x0, -bowH);
    ctx.quadraticCurveTo(x0 + limb * 0.65, 0, x0, bowH);
    ctx.stroke();
    ctx.strokeStyle = shade(base, -0.45); ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(x0,-bowH); ctx.lineTo(x0,bowH); ctx.stroke();
  };
  const drawBook = () => {
    ctx.translate(bodyR,0);
    const x0=0,w=18,h=14,sp=4;
    ctx.fillStyle = shade(base,-0.25);
    ctx.beginPath(); ctx.rect(x0,-h/2,w,h); ctx.fill();
    ctx.fillStyle = shade(base,-0.45);
    ctx.beginPath(); ctx.rect(x0,-h/2,sp,h); ctx.fill();
    ctx.globalAlpha=.25; ctx.strokeStyle='#e5d9ff'; ctx.lineWidth=1.2;
    ctx.strokeRect(x0+0.5,-h/2+0.5,w-1,h-1);
  };
  const drawStick = () => { // fallback genérico
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bodyR,0); ctx.lineTo(bodyR+len-3,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(bodyR+len,0, 4, 0, Math.PI*2);
    ctx.fillStyle = shade(base, .15); ctx.fill();
  };

  switch(klass){
    case 'paladino': drawSword(); break;
    case 'ranger':   drawBow();   break;
    case 'clerigo':  drawMace();  break;
    case 'barbaro':  drawMace();  break;
    case 'bruxo':    drawBook();  break;
    case 'monge':
      ctx.globalAlpha=.35; ctx.strokeStyle='rgba(160,210,255,0.9)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(0,0, bodyR+4, 0, Math.PI*2); ctx.stroke();
      break;
    case 'guerreiro':
      ctx.strokeStyle = weaponCol; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bodyR-12, 8); ctx.lineTo(bodyR+14, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bodyR+16, 0); ctx.lineTo(bodyR+10, -4); ctx.lineTo(bodyR+10, 4);
      ctx.closePath(); ctx.fillStyle = '#e5e7eb'; ctx.fill();
      break;
    default:         drawStick();  break;
  }
  ctx.restore();
}

// 2.8. Ruído leve para texturas (UMA só definição global)
let _noisePat = null;
function ensureNoise(ctx) {
  if (_noisePat) return _noisePat;
  const n = document.createElement('canvas');
  n.width = n.height = 128;
  const ng = n.getContext('2d');
  const img = ng.createImageData(n.width, n.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 220 + Math.floor(Math.random() * 35);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ng.putImageData(img, 0, 0);
  _noisePat = ctx.createPattern(n, 'repeat');
  return _noisePat;
}

// 2.9. (Opcional) Expor helpers no escopo global (útil p/ outros capítulos)
window.clamp = clamp;
window.randAng = randAng;
window.V = V;
window.rrand = rrand;
window.drawRoundedRect = drawRoundedRect;
window.reflect = reflect;
window.hexToRgb = hexToRgb;
window.rgbToHex = rgbToHex;
window.shade = shade;
window.showMessage = showMessage;
window.hideMessage = hideMessage;

window._seg5 = _seg5;
window.barbHP = barbHP;
window.barbTip = barbTip;
window.barbKnock = barbKnock;
window.barbOmega = barbOmega;
window.barbApplyPassiveDamage = barbApplyPassiveDamage;

window.rangerStats = rangerStats;
window.rangerSpeedMult = rangerSpeedMult;

window.palStats = palStats;
window.palHP = palHP;

window.monkHP = monkHP;
window.monkBodyDamage = monkBodyDamage;
window.monkVMinBonus = monkVMinBonus;
window.monkVMaxBonus = monkVMaxBonus;
window.monkConeRad = monkConeRad;
window.monkScaledDamage = monkScaledDamage;
window.inFrontArc = inFrontArc;
window.nearestEnemyOf = nearestEnemyOf;
window.projApproaching = projApproaching;

window.clericHP = clericHP;
window.clericTip = clericTip;
window.clericKnock = clericKnock;
window.distPointToSegment = distPointToSegment;

window.optionClassHTML = optionClassHTML;
window.populateClassSelect = populateClassSelect;
window.drawUnitThumb = drawUnitThumb;
window.ensureNoise = ensureNoise;
// ===================================
// CAPÍTULO 3: Entidades do Jogo
// ===================================

// 3.0. Helper de estado do Monge (shape padronizado)
function makeMonkState() {
  return {
    stacks: 0,
    stacksExpire: 0,
    rajadaT: 0,
    rajadaCD: 0,
    deflectT: 0,
    deflectCD: 0,
    localHitT: 0,
    flurryT: 0,
    flurryVictim: null,
    nextHit: 0,
    hitsLeft: 0,
    accSelf: new V(0, 0),
    accVict: new V(0, 0)
  };
}

// 3.1. Classe Partícula
class Particle {
  constructor(p, v, life, color) {
    this.p = p.clone(); this.v = v.clone(); this.life = life; this.color = color; this.alive = true;
  }
  update(dt) {
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
    this.p.add(this.v.clone().mul(dt));
    this.v.mul(0.98);
  }
  draw(ctx) {
    if (!this.alive) return;
    ctx.save(); ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color; ctx.beginPath();
    ctx.arc(this.p.x, this.p.y, 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
}

// 3.2. Classe Efeito
class Effect {
  constructor(pos, radius, life, color, type = 'expand') {
    this.pos = pos.clone();
    this.radius = 0;
    this.maxRadius = radius;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.type = type;
    this.alive = true;
  }
  update(dt) {
    this.life -= dt;
    if (this.life <= 0) { this.alive = false; return; }
    if (this.type === 'expand') {
      const progress = 1 - (this.life / this.maxLife);
      this.radius = this.maxRadius * progress;
    }
  }
  draw(ctx) {
    if (!this.alive) return;
    const alpha = this.life / this.maxLife;
    ctx.save(); ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = this.color; ctx.lineWidth = 4;
    ctx.shadowBlur = 15; ctx.shadowColor = this.color;
    ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.stroke(); ctx.restore();
  }
}

// 3.3. Classe Projétil
class Projectile {
  constructor(owner, pos, dir) {
    this.owner = owner; this.pos = pos.clone(); this.dir = dir.clone().nrm();
    this.speed = CFG.ranged.speed; this.life = CFG.ranged.life;
    this.rad = CFG.ranged.radius; this.dmg = CFG.ranged.dmg * (owner ? owner.dmgMult() : 1);
    this.knock = CFG.ranged.knock;
    this.color = owner ? owner.color : '#fff'; this.alive = true;
    this.trail = []; this.bounces = 0; this.penetration = false;
  }
  stepMove(dt) { this.pos.add(this.dir.clone().mul(this.speed * dt)); }
  update(dt, arena, units, pets) {
    this.life -= dt; if (this.life <= 0) { this.alive = false; return; }
    this.stepMove(dt);

    // 3.3.1. Colisão com paredes
    if (this.pos.x < arena.x - this.rad || this.pos.x > arena.x + arena.w + this.rad ||
        this.pos.y < arena.y - this.rad || this.pos.y > arena.y + arena.h + this.rad){
      this.alive = false; return;
    }

    // 3.3.2. Interações com unidades
    for (const u of units) {
      if (!u.alive) continue;

      // Monge: deflect reativo
      if (u.className === 'monge') {
        const cone = monkConeRad(CFG.monge.deflect.coneDeg);
        const sense = CFG.monge.deflect.rSense;
        const hitR  = CFG.monge.deflect.rHit;

        if ((!u.monk.deflectT || u.monk.deflectT <= 0) && u.monk.deflectCD <= 0) {
          const hostile = this.owner && (!u.team || !this.owner.team || this.owner.team !== u.team);
          if (hostile && projApproaching(this, u) && inFrontArc(u, this.pos, cone, sense)) {
            u.monk.deflectT = CFG.monge.deflect.dur;
            u.monk.deflectCD = CFG.monge.deflect.cd;
          }
        }
        if (u.monk.deflectT > 0 && inFrontArc(u, this.pos, cone, hitR)) {
          const targ = nearestEnemyOf(u);
          if (targ) {
            this.dir = new V(targ.pos.x - u.pos.x, targ.pos.y - u.pos.y).nrm();
            if (CFG.monge.deflect.speedBoost) { this.speed *= CFG.monge.deflect.speedBoost; }
            this.pos = u.pos.clone().add(this.dir.clone().mul(u.bodyR + this.rad + 2));
          } else {
            const normal = new V(this.pos.x - u.pos.x, this.pos.y - u.pos.y);
            this.dir = reflect(this.dir, normal);
            this.pos.add(this.dir.clone().mul(this.rad * 1.2));
          }
          if (!this._deflectedByMonk) { this._deflectedByMonk = true; this.dmg *= (CFG.monge.deflect.dmgMult || 2.0); }
          this.owner = u;
          for (let i=0;i<CFG.vfx.reflectSpark;i++){
            game.spawnParticle(new Particle(u.pos.clone(),
              V.fromAng(Math.random()*Math.PI*2, rrand(40,160)),
              rrand(.15,.35), '#cfe9ff'));
          }
          this.trail.push(this.pos.clone()); if (this.trail.length > CFG.ranged.trail) this.trail.shift();
          return;
        }
      }

      // Reflexão na ponta da arma (todas as classes exceto Monge)
      if (u.className !== 'monge') {
        const tip = u.tip();
        const toTip = new V(this.pos.x - tip.x, this.pos.y - tip.y);
        if (toTip.len() < (u.weaponTipR + this.rad)) {
          const newDir = reflect(this.dir, toTip);
          this.dir = newDir;
          this.owner = null;
          this.pos.add(this.dir.clone().mul(this.rad * 1.5));
          for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
            game.spawnParticle(new Particle(tip.clone(), V.fromAng(rrand(0, Math.PI * 2), rrand(40, 160)), rrand(.15, .35), this.color));
          }
          continue;
        }
      }

      // Dano do projétil (com HEX do bruxo)
      let dmgToApply = this.dmg;
      if (this.owner && this.owner.className === 'bruxo' && u.hex && u.hex.owner === this.owner) {
        dmgToApply *= CFG.bruxo.hex.dmgMult;
      }
      const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
      if (d < u.bodyR + this.rad) {
        const dealt = u.hit(dmgToApply, this.dir.clone().mul(this.knock), this.owner);
        if (dealt > 0) {
          game.onDamage(dealt);
          if (this.owner) this.owner.gainXPOffense(dealt);
          // Vínculo sombrio (roubo de vida)
          if (this.owner && this.owner.className === 'bruxo') {
            const heal = dealt * CFG.bruxo.link.leechPct;
            this.owner.hp = clamp(this.owner.hp + heal, 0, this.owner.hpMax);
            game.spawnParticle(new Particle(this.owner.pos.clone(), V.fromAng(randAng(), rrand(40,120)), .25, CFG.bruxo.hex.color));
          }
        }
        if (!this.penetration) { this.alive = false; }
        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(this.pos.clone(), V.fromAng(rrand(0, Math.PI * 2), rrand(50, 220)), rrand(.2, .6), this.color));
        }
        if (!this.alive) break;
      }
    }

    // Summons (ex.: Familiar) — ignore outros summons aqui
    for (const s of game.summons) {
      if (!s.alive || s.kind === 'familiar') continue;
    }

    // Familiar (projetis podem atingi-lo)
    for (const s of game.summons) {
      if (!s.alive || s.kind !== 'familiar') continue;
      if (this.owner && s.team && this.owner.team && s.team === this.owner.team) continue;

      const d = new V(s.pos.x - this.pos.x, s.pos.y - this.pos.y).len();
      if (d < s.bodyR + this.rad) {
        const dealt = s.hit(this.dmg, this.dir.clone().mul(this.knock), this.owner);
        if (dealt > 0) {
          if (this.owner) this.owner.gainXPOffense?.(dealt);
          if (this.owner && this.owner.className === 'bruxo') {
            const heal = dealt * CFG.bruxo.link.leechPct;
            this.owner.hp = clamp(this.owner.hp + heal, 0, this.owner.hpMax);
          }
        }
        if (!this.penetration) this.alive = false;

        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(this.pos.clone(), V.fromAng(rrand(0, Math.PI * 2), rrand(50, 220)), rrand(.2, .6), this.color));
        }
        if (!this.alive) break;
      }
    }

    this.trail.push(this.pos.clone()); if (this.trail.length > CFG.ranged.trail) this.trail.shift();
  }
  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round'; ctx.globalAlpha = .9; ctx.strokeStyle = this.color; ctx.lineWidth = 2;
    if (this.trail.length > 1) {
      ctx.beginPath(); ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (const p of this.trail) { ctx.lineTo(p.x, p.y); }
      ctx.stroke();
    }
    ctx.shadowBlur = 10; ctx.shadowColor = this.color;
    ctx.fillStyle = this.color; ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.rad, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// 3.4. Classe Flecha (Arrow)
class Arrow extends Projectile {
  constructor(owner, pos, dir, spec) {
    super(owner, pos, dir);
    this.color = CFG.ranger.arrow.color; this.rad = CFG.ranger.arrow.radius;
    this.speed = spec.speed; this.life = CFG.ranger.arrow.life;
    this.gravity = CFG.ranger.arrow.gravity; this.drag = CFG.ranger.arrow.drag;
    this.dmg = spec.dmg * (owner ? owner.dmgMult() : 1);
    this.penetration = !!spec.penetration;
    this.vel = dir.clone().mul(this.speed);
    this.visual = spec.visual || null;
  }
  stepMove(dt) {
    const drag = Math.max(0, 1 - this.drag * dt);
    this.vel.mul(drag);
    this.vel.y += this.gravity * dt;
    this.pos.add(this.vel.clone().mul(dt));
    this.dir = this.vel.clone().nrm();
  }
  draw(ctx) {
    // visual especial (warlock)
    if (this.visual === 'eldritch') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (this.trail.length > 1) {
        const g = ctx.createLinearGradient(this.trail[0].x, this.trail[0].y, this.pos.x, this.pos.y);
        g.addColorStop(0, 'rgba(201,167,255,0.0)');
        g.addColorStop(1, 'rgba(201,167,255,0.9)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (const p of this.trail) ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.shadowBlur = 14; ctx.shadowColor = this.color;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.rad+1, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      return;
    }
    // visual especial (perfect shot)
    if (this.visual === 'perfect') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (this.trail.length > 1) {
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(186,247,204,0.9)';
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (const p of this.trail) ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.shadowBlur = 12; ctx.shadowColor = '#baf7cc';
      ctx.fillStyle = '#eafff3';
      ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.rad+1, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      return;
    }
    // padrão
    ctx.save(); ctx.globalAlpha = .95; ctx.strokeStyle = this.color; ctx.lineWidth = 2;
    if (this.trail.length > 1) {
      ctx.beginPath(); ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (const p of this.trail) { ctx.lineTo(p.x, p.y); }
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.rad, 0, Math.PI * 2);
    ctx.fillStyle = this.color; ctx.shadowBlur = 8; ctx.shadowColor = this.color; ctx.fill(); ctx.restore();
  }
}

// 3.4.b Classe Lança (SpearProjectile)
class SpearProjectile extends Projectile {
  constructor(owner, pos, dir) {
    super(owner, pos, dir);
    const S = CFG.guerreiro.spear;

    this.speed = S.speed;
    this.life  = S.life;
    this.rad   = S.rad;                          // colisão simples (círculo)
    this.dmg   = S.dmgBase * (owner ? owner.dmgMult() : 1);
    this.knock = S.knock;
    this.color = S.color;

    // Passiva "Disciplina": bônus no próximo projétil após alternar
    if (owner && owner.gw && owner.gw.disciplineReady) {
      this.dmg *= CFG.guerreiro.discipline.bonus;
      owner.gw.disciplineReady = false;
    }

    this.angle = Math.atan2(this.dir.y, this.dir.x);
    this.visual = 'spear';
  }

  stepMove(dt) {
    this.pos.add(this.dir.clone().mul(this.speed * dt));
    this.angle = Math.atan2(this.dir.y, this.dir.x);
  }

  draw(ctx) {
    const shaft = 28;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);

    // cabo
    ctx.strokeStyle = shade(this.color, -0.25);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-shaft, 0);
    ctx.lineTo(this.rad + 8, 0);
    ctx.stroke();

    // contrapeso
    ctx.beginPath();
    ctx.arc(-shaft, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = shade(this.color, -0.35);
    ctx.fill();

    // ponta triangular
    ctx.beginPath();
    ctx.moveTo(this.rad + 10, 0);
    ctx.lineTo(this.rad - 4, -6);
    ctx.lineTo(this.rad - 4,  6);
    ctx.closePath();
    ctx.fillStyle = '#e5e7eb';
    ctx.fill();

    ctx.restore();
  }
}

// 3.5. Classe Evocação (Summon)
class Summon {
  constructor(owner, pos, dmg, duration) {
    this.owner = owner; this.team = owner.team; this.pos = pos.clone();
    this.vel = V.fromAng(randAng(), 80);
    this.color = '#7cffb0'; this.bodyR = 16; this.alive = true;
    this.life = duration; this.dmg = dmg;
    this.kind = 'forest';
  }
  update(dt, arena, units) {
    this.life -= dt; if (this.life <= 0) { this.alive = false; return; }
    let best = null, bestD = 1e9;
    for (const u of units) {
      if (!u.alive) continue;
      if (this.owner.team && u.team && this.owner.team === u.team) continue;
      const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
      if (d < bestD) { bestD = d; best = u; }
    }
    if (best) {
      const dir = new V(best.pos.x - this.pos.x, best.pos.y - this.pos.y).nrm();
      this.vel.add(dir.mul(260 * dt));
      const spd = this.vel.len(); if (spd > 400) this.vel.mul(400 / spd);
    }
    this.vel.mul(0.992); this.pos.add(this.vel.clone().mul(dt));
    if (this.pos.x < arena.x + this.bodyR) { this.pos.x = arena.x + this.bodyR; this.vel.x = Math.abs(this.vel.x); }
    if (this.pos.x > arena.x + arena.w - this.bodyR) { this.pos.x = arena.x + arena.w - this.bodyR; this.vel.x = -Math.abs(this.vel.x); }
    if (this.pos.y < arena.y + this.bodyR) { this.pos.y = arena.y + this.bodyR; this.vel.y = Math.abs(this.vel.y); }
    if (this.pos.y > arena.y + arena.h - this.bodyR) { this.pos.y = arena.y + arena.h - this.bodyR; this.vel.y = -Math.abs(this.vel.y); }
    if (best && new V(best.pos.x - this.pos.x, best.pos.y - this.pos.y).len() < best.bodyR + this.bodyR) {
      best.hit(this.dmg, new V(this.vel.x, this.vel.y), this.owner);
    }
  }
  draw(ctx) {
    ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = 'rgba(124,255,176,0.85)';
    ctx.shadowColor = '#7cffb0'; ctx.shadowBlur = 12; ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.bodyR * 0.8, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  }
}

class Familiar {
  constructor(owner) {
    this.kind = 'familiar';
    this.owner = owner;
    this.team  = owner.team;
    this.pos   = owner.pos.clone();
    this.vel   = V.fromAng(randAng(), 60);
    this.bodyR = CFG.bruxo.familiar.bodyR;
    this.color = CFG.bruxo.familiar.color;

    this.mass  = 1;
    this.hpMax = CFG.bruxo.familiar.hpBase + CFG.bruxo.familiar.hpPerLevel * (owner.level - 1);
    this.hp    = this.hpMax;
    this.alive = true;

    this.fireCD = 0;
  }

  canDamage(other){
    return !(this.team && other.team && this.team === other.team);
  }

  hit(amount, impulse, attacker){
    if (!this.alive) return 0;
    const before = this.hp;
    this.hp = clamp(this.hp - amount, 0, this.hpMax);
    const dealt = before - this.hp;
    this.vel.add(impulse.clone().mul(1/this.mass));
    if (this.hp <= 0) {
      this.alive = false;
      game.onFamiliarDeath?.(this);
    }
    return dealt;
  }

  update(dt, arena, units){
    const toOwner = new V(this.owner.pos.x - this.pos.x, this.owner.pos.y - this.pos.y);
    if (toOwner.len() > 1e-3) this.vel.add(toOwner.nrm().mul(80*dt));

    let best=null, bestD=1e9;
    for(const u of units){
      if(!u.alive) continue;
      if (this.team && u.team && this.team===u.team) continue;
      const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
      if(d<bestD){ bestD=d; best=u; }
    }

    this.fireCD -= dt;
    if (this.fireCD <= 0 && best) {
      this.fireCD = CFG.bruxo.familiar.fireCD;
      const dir = new V(best.pos.x - this.pos.x, best.pos.y - this.pos.y).nrm();
      const b = CFG.bruxo.familiar.bullet;
      const proj = new Projectile(this.owner, this.pos.clone().add(dir.clone().mul(this.bodyR+6)), dir);
      proj.speed = b.speed; proj.life = b.life; proj.rad = b.rad;
      proj.dmg   = b.dmg * (this.owner ? this.owner.dmgMult() : 1);
      proj.knock = b.knock; proj.color = b.color;
      game.spawnProjectile(proj);
    }

    this.vel.mul(CFG.physics.friction);
    this.pos.add(this.vel.clone().mul(dt));
    if (this.pos.x < arena.x + this.bodyR)       { this.pos.x = arena.x + this.bodyR; this.vel.x = Math.abs(this.vel.x); }
    if (this.pos.x > arena.x + arena.w - this.bodyR){ this.pos.x = arena.x + arena.w - this.bodyR; this.vel.x = -Math.abs(this.vel.x); }
    if (this.pos.y < arena.y + this.bodyR)       { this.pos.y = arena.y + this.bodyR; this.vel.y = Math.abs(this.vel.y); }
    if (this.pos.y > arena.y + arena.h - this.bodyR){ this.pos.y = arena.y + arena.h - this.bodyR; this.vel.y = -Math.abs(this.vel.y); }
  }

  draw(ctx){
    if(!this.alive) return;
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10; ctx.shadowColor = this.color;
    ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.bodyR*0.9, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    const w=36,h=4,x=this.pos.x-w/2,y=this.pos.y-this.bodyR-10;
    drawRoundedRect(ctx,x,y,w,h,3); ctx.fillStyle='rgba(8,12,18,.8)'; ctx.fill();
    drawRoundedRect(ctx,x,y,w*(this.hp/this.hpMax),h,3);
    const g=ctx.createLinearGradient(x,y,x+w,y);
    g.addColorStop(0,'#cbb5ff'); g.addColorStop(1,'#9d7fff');
    ctx.fillStyle=g; ctx.fill();
  }
}

// 3.6. Classe Unidade (Unit)
class Unit {
  constructor(id, pos, color, hasRanged) {
    this.id = id; this.pos = pos.clone(); this.vel = V.fromAng(randAng(), CFG.physics.initImpulse);
    this.color = color;
    this.bodyR = CFG.body.radius; this.mass = CFG.body.mass;
    this.baseHP = CFG.body.baseHP; this.hpMax = this.baseHP; this.hp = this.hpMax; this.alive = true; this.deadHandled = false;
    this.weaponLen = CFG.weapon.length; this.weaponTipR = CFG.weapon.tipRadius; this.omega = CFG.weapon.omega * (Math.random() < .5 ? -1 : 1);
    this.angle = randAng();
    this.hasRanged = !!hasRanged; this.cd = 0;
    this.a1cd = CFG.ranger.perfectShot.cd; this.a2cd = CFG.ranger.forestCall.cd;
    this.level = 1; this.xp = 0;
    this.team = null; this.className = 'ranger';
    this.idleT = 0; this.stillT = 0;
    this.speedMult = 1.0;
    this.palShieldT = 0; this.palShieldCD = 0; this.palHealCD = 0;
    this.clericFlameCD = 0;
    this.beamT = 0;
    this.clericFlameTimer = 0;
    this._beamNext = 0;
    this.weaponLockT = 0;
    this._lastDT = 0;
    this.hex = null;

    // Estado interno do Monge (shape completo)
    this.freezeT = 0; this.freezeReason = null;
    this.monk = makeMonkState();

    // Estado interno do Bruxo
    this._warlock = null;
  }

  // 3.6.1. Métodos de inicialização e progressão
  applyClassDefaults() {
    if (this.className === 'ranger') {
      this.baseHP = CFG.ranger.hpBase; this.hpMax = this.baseHP; this.hp = this.hpMax;
      this.speedMult = rangerSpeedMult(this.level);

    } else if (this.className === 'barbaro') {
      this.hpMax = barbHP(this.level); this.hp = this.hpMax; this.baseHP = this.hpMax;
      this.omega = barbOmega(this.level) * (Math.random() < .5 ? -1 : 1);
      this.isDashing = false; this.dashT = 0; this.dashCD = 0; this.firstImpactDash = false; this.dashTarget = null;
      this.urroT = 0; this.urroCD = 0;
      this.weaponLen = 40; this.weaponTipR = 11;

    } else if (this.className === 'paladino') {
      this.baseHP = palHP(1); this.hpMax = palHP(this.level); this.hp = this.hpMax;

    } else if (this.className === 'monge') {
      this.hpMax = monkHP(this.level); this.baseHP = this.hpMax; this.hp = this.hpMax;
      // mantém o shape completo SEM perder campos
      this.monk = makeMonkState();

    } else if (this.className === 'clerigo') {
      this.baseHP = clericHP(1);
      this.hpMax = clericHP(this.level);
      this.hp = this.hpMax;

      this.a1cd = CFG.clerigo.beam.cd;   // Sunbeam
      this.a2cd = CFG.clerigo.prayer.cd; // Rezo

      const P = CFG.clerigo.sacredFlame;
      const first = P.period + (P.jitter ? rrand(-P.jitter, P.jitter) : 0);
      this.clericFlameTimer = Math.max(0.2, first);
      this.beamT = 0;
      this._beamNext = 0;

    } else if (this.className === 'bruxo') {
      this.baseHP = CFG.bruxo.hpBase; this.hpMax = this.baseHP; this.hp = this.hpMax;
      this.brxHexCD = 0;
      this.brxFamCD = 0;
      this.familiarRef = null;
      this.hexTarget = null;
      this.hexT = 0;

    } else if (this.className === 'guerreiro') {
      this.baseHP = CFG.guerreiro.hpBase;
      this.hpMax = this.baseHP; this.hp = this.hpMax;

      this.gw = {
        mode: 'ranged',          // 'ranged' / 'melee'
        lastMode: 'ranged',
        disciplineReady: false,  // bônus no próximo golpe após alternar
        parryCD: 0,
        disarmedT: 0,
        stanceActive: false,
        baseOmega: this.omega
      };
    }
  }

  xpCost() { return CFG.xp.cost(this.level); }
  addXP(amount) {
    if (this.level >= CFG.level.max) return 0;
    this.xp += amount;
    let ups = 0;
    while (this.level < CFG.level.max && this.xp >= this.xpCost()) {
      this.xp -= this.xpCost(); this.levelUp(); ups++;
    }
    return ups;
  }
  levelUp() {
    const ratio = this.hp / this.hpMax; this.level++;
    if (this.className === 'ranger') {
      this.hpMax = CFG.ranger.hpBase + CFG.ranger.hpPerLevel * (this.level - 1);
      this.hp = clamp(Math.round(this.hpMax * ratio), 1, this.hpMax);
      this.speedMult = rangerSpeedMult(this.level);
    } else if (this.className === 'barbaro') {
      this.hpMax = barbHP(this.level);
      this.hp = clamp(Math.round(this.hpMax * ratio), 1, this.hpMax);
      const sign = this.omega >= 0 ? 1 : -1; this.omega = barbOmega(this.level) * sign;
    } else if (this.className === 'paladino') {
      this.hpMax = palHP(this.level);
      this.hp = clamp(Math.round(this.hpMax * ratio), 1, this.hpMax);
    } else if (this.className === 'bruxo') {
      this.hpMax = CFG.bruxo.hpBase + CFG.bruxo.hpPerLevel * (this.level - 1);
      this.hp = clamp(Math.round(this.hpMax * ratio), 1, this.hpMax);
    } else if (this.className === 'monge') {
      this.hpMax = monkHP(this.level);
      this.hp = clamp(Math.round(this.hpMax * ratio), 1, this.hpMax);
    } else if (this.className === 'clerigo') {
      this.hpMax = clericHP(this.level);
      this.hp = clamp(Math.round(this.hpMax * ratio), 1, this.hpMax);
    } else {
      this.hpMax = Math.round(this.hpMax * (1 + CFG.level.hpPerLevelPct));
      this.hp = clamp(Math.round(this.hpMax * ratio), 1, this.hpMax);
    }
  }

  // 3.6.2. Combate e XP
  dmgMult() {
    let baseMult = 1 + (this.level - 1) * CFG.level.dmgPerLevelPct;
    if (this.className === 'monge' && CFG.monge.dmgMult) {
      baseMult *= CFG.monge.dmgMult;
    }
    return baseMult;
  }
  gainXPDefense() { this.addXP(CFG.xp.gain.hitTaken); }
  gainXPWeaponClash() { this.addXP(CFG.xp.gain.weaponClash); }
  gainXPOffense(dmg) { const v = CFG.xp.gain.hitDealtBase + dmg * CFG.xp.gain.hitDealtPerDmg; this.addXP(Math.round(v)); }
  gainXPKill() { this.addXP(CFG.xp.gain.kill); }
  canDamage(other) { return !(this.team && other.team && this.team === other.team); }
  hit(amount, impulse, attacker) {
    if (!this.alive) return 0;
    if (this.className === 'paladino' && this.palShieldT > 0 && attacker && attacker !== this && attacker.canDamage(this)) {
      this.palShieldT = 0;
      const dir = new V(attacker.pos.x - this.pos.x, attacker.pos.y - this.pos.y).nrm();
      attacker.vel.add(dir.mul(CFG.paladino.shield.knockForce));
      return 0;
    }
    let amountMod = amount; let impulseMod = impulse;
    if (this.className === 'barbaro' && this.urroT > 0) { amountMod *= CFG.barbaro.roar.dmgReduce; impulseMod = new V(0, 0); }
    const before = this.hp;
    if (attacker && !attacker.canDamage(this)) return 0;
    this.hp = clamp(this.hp - amountMod, 0, this.hpMax);
    const dealt = before - this.hp;
    this.vel.add(impulseMod.clone().mul(1 / this.mass));
    if (attacker && attacker !== this && attacker.canDamage(this)) this.gainXPDefense();
    if (this.hp <= 0 && !this.deadHandled) {
      this.alive = false; this.deadHandled = true;
      if (attacker && attacker.canDamage(this)) attacker.gainXPKill();
      game.onDeath(this);
    }
    return dealt;
  }

  // 3.6.3. Física e colisão
  tip() { return new V(this.pos.x + Math.cos(this.angle) * (this.bodyR + this.weaponLen), this.pos.y + Math.sin(this.angle) * (this.bodyR + this.weaponLen)); }
  ensureSpeed() {
    if (this.className === 'monge') {
      const vMin = game.getVMin() + monkVMinBonus(this.level);
      const vMax = CFG.physics.vMax + monkVMaxBonus(this.level);
      const spd = this.vel.len();
      if (spd < vMin) { if (spd < 1e-3) this.vel = V.fromAng(randAng(), vMin); else this.vel.mul(vMin / (spd || 1)); }
      if (spd > vMax) { this.vel.mul(vMax / spd); }
      return;
    }
    const v = this.vel.len(); const vMin = game.getVMin() * this.speedMult;
    if (v < vMin) { if (v < 1e-3) this.vel = V.fromAng(randAng(), vMin); else this.vel.mul(vMin / v); }
    if (v > CFG.physics.vMax) { this.vel.mul(CFG.physics.vMax / v); }
  }
  physics(dt, arena) {
    const wasFrozen = this.freezeT > 0;
    if (!wasFrozen) {
      this.angle += this.omega * dt;
      this.vel.mul(CFG.physics.friction);
      this.pos.add(this.vel.clone().mul(dt));
    } else {
      this.freezeT = Math.max(0, this.freezeT - dt);
    }
    this._lastDT = dt;

    if (this.weaponLockT > 0) this.weaponLockT -= dt;

    // Monge
    if (this.className === 'monge') {
      this.monkApplyPassive(dt);
      this.monkNaturalAccel?.(dt);
      this.monkSeek(dt);
      this.monkFlurryTick(dt);
      this.monkTryRajada(dt);
      this.monkTryDeflect(dt);
      this.monk.rajadaCD = Math.max(0, this.monk.rajadaCD - dt);
      this.monk.deflectCD = Math.max(0, this.monk.deflectCD - dt);
      this.monk.localHitT = Math.max(0, this.monk.localHitT - dt);
      if (this.monk.stacks > 0 && performance.now() / 1000 > this.monk.stacksExpire) {
        this.monk.stacks = Math.max(0, this.monk.stacks - 1);
        if (this.monk.stacks > 0) this.monk.stacksExpire = performance.now() / 1000 + CFG.monge.stacks.time / this.monk.stacks;
      }
      if (this.monk.rajadaT > 0) this.monk.rajadaT = Math.max(0, this.monk.rajadaT - dt);
      if (this.monk.deflectT > 0) this.monk.deflectT = Math.max(0, this.monk.deflectT - dt);
    }

    // Clérigo
    if (this.className === 'clerigo') {
      this.clericPassiveTick(dt);
      this.a1cd -= dt; // Sunbeam
      this.a2cd -= dt; // Rezo
      if (this.beamT > 0) this.clericBeamTick(dt);
      if (this.a1cd <= 0 && this.beamT <= 0) { this.clericStartBeam(); this.a1cd = CFG.clerigo.beam.cd; }
      if (this.a2cd <= 0) { this.castPrayer(); this.a2cd = CFG.clerigo.prayer.cd; }
    }

    // Bruxo
    if (this.className === 'bruxo') {
      this.brxHexCD = Math.max(0, (this.brxHexCD || 0) - dt);
      if (!this.familiarRef && this.brxFamCD <= 0) {
        this.castFamiliar();
      }
      if (this.hex) this.hex.t -= dt;
      if (this.brxHexCD <= 0) { this.castHex(); }
    }

    // Ranger (tempo parado)
    if (this.vel.len() < CFG.ranger.stillVel) this.stillT += dt; else this.stillT = 0;

    // Colisões com paredes + impulso ao centro
    const cx = arena.x + arena.w * 0.5;
    const cy = arena.y + arena.h * 0.5;
    const toCenter = new V(cx - this.pos.x, cy - this.pos.y).nrm();
    if (this.pos.x < arena.x + this.bodyR) {
      this.pos.x = arena.x + this.bodyR;
      this.vel.x *= -CFG.physics.wallBounce;
      this.vel.mul(CFG.physics.boostWall);
      this.vel.add(toCenter.clone().mul(80));
      if (this.className === 'monge') this.monkImpactBurst('wall', toCenter);
    }
    if (this.pos.x > arena.x + arena.w - this.bodyR) {
      this.pos.x = arena.x + arena.w - this.bodyR;
      this.vel.x *= -CFG.physics.wallBounce;
      this.vel.mul(CFG.physics.boostWall);
      this.vel.add(toCenter.clone().mul(80));
      if (this.className === 'monge') this.monkImpactBurst('wall', toCenter);
    }
    if (this.pos.y < arena.y + this.bodyR) {
      this.pos.y = arena.y + this.bodyR;
      this.vel.y *= -CFG.physics.wallBounce;
      this.vel.mul(CFG.physics.boostWall);
      this.vel.add(toCenter.clone().mul(80));
      if (this.className === 'monge') this.monkImpactBurst('wall', toCenter);
    }
    if (this.pos.y > arena.y + arena.h - this.bodyR) {
      this.pos.y = arena.y + arena.h - this.bodyR;
      this.vel.y *= -CFG.physics.wallBounce;
      this.vel.mul(CFG.physics.boostWall);
      this.vel.add(toCenter.clone().mul(80));
      if (this.className === 'monge') this.monkImpactBurst('wall', toCenter);
    }
    this.ensureSpeed();

    // Habilidades e recargas
    if (this.hasRanged) { this.cd -= dt; if (this.cd <= 0) { const next = this.fire(); const rageCdMul = 1; this.cd = (next != null ? next : CFG.ranged.cooldown) * rageCdMul; } }
    if (this.className === 'ranger') { this.a1cd -= dt; this.a2cd -= dt; if (this.a1cd <= 0) { this.castPerfectShot(); this.a1cd = CFG.ranger.perfectShot.cd; } if (this.a2cd <= 0) { this.castForestCall(); this.a2cd = CFG.ranger.forestCall.cd; } }
    if (this.className === 'barbaro') {
      this.tryInvestida(dt); this.updateInvestida(dt); this.tryUrro(dt);
      if (this.dashCD > 0) this.dashCD -= dt;
      if (this.urroCD > 0) this.urroCD -= dt;
      if (this.urroT > 0) this.urroT -= dt;
    }
    if (this.className === 'paladino') {
      const st = palStats(this.level);
      if (this.palShieldT > 0) this.palShieldT -= dt;
      if (this.palShieldCD > 0) this.palShieldCD -= dt;
      if (this.palShieldT <= 0 && this.palShieldCD <= 0) {
        const threatR = 300; let nearby = 0;
        for (const u of game.units) {
          if (!u.alive || u === this) continue; if (this.team && u.team && this.team === u.team) continue;
          const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
          if (d < threatR) { nearby++; if (nearby >= 1) break; }
        }
        if (nearby >= 1 || (this.hp / this.hpMax) < 0.5) {
          this.palShieldT = CFG.paladino.shield.dur;
          this.palShieldCD = st.shieldCD;
        }
      }
      if (this.palHealCD > 0) this.palHealCD -= dt;
      if (this.palHealCD <= 0) { this.castPalHeal(); this.palHealCD = st.healCD; }
    }
    if (this.vel.len() < CFG.engage.idleSpeed) this.idleT += dt; else this.idleT = 0;
  }

  collide(other) {
    if (this.freezeT > 0 || other.freezeT > 0) return;

    // 3.6.4. Colisão corpo a corpo
    const d = other.pos.clone().sub(this.pos);
    const dist = d.len();
    const minDist = this.bodyR + other.bodyR;

    if (dist > 0 && dist < minDist) {
      const n = d.clone().mul(1 / dist);
      const preThisSpeed  = this.vel.len();
      const preOtherSpeed = other.vel.len();

      // separação
      const overlap = minDist - dist;
      this.pos.add(n.clone().mul(-overlap * 0.5));
      other.pos.add(n.clone().mul( overlap * 0.5));

      // impulso de separação
      const rel = other.vel.clone().sub(this.vel);
      const sep = rel.dot(n);
      if (sep < 0) {
        const j = (-(1 + CFG.physics.restitution) * sep) / (1 / this.mass + 1 / other.mass);
        const imp = n.clone().mul(j);
        this.vel.sub(imp.clone().mul(1 / this.mass));
        other.vel.add(imp.clone().mul(1 / other.mass));
      }

      // Dano de corpo do Monge (lado this)
      if (this.className === 'monge' && this.canDamage(other)) {
        const inFlurry = !!(this.monk && this.monk.rajadaT > 0);
        const speedOK  = inFlurry || (preThisSpeed > 90);
        if (speedOK) {
          const localCD = inFlurry ? CFG.monge.rajada.local : 0.25;
          if ((this.monk.localHitT || 0) <= 0) {
            let base = monkBodyDamage(this.level);
            base = monkScaledDamage(base, preThisSpeed);
            if (inFlurry) base *= CFG.monge.rajada.bonus;
            let dmg = base * CFG.monge.dmgMult;
            const dealt = other.hit(dmg, n.clone().mul(CFG.monge.impulseOnHit), this);
            if (dealt > 0) {
              this.monkOnHitDealt();
              this.monkImpactBurst('hit');
              this.gainXPOffense(dealt);
            }
            this.monk.localHitT = localCD;
          }
        }
      }

      // Dano de corpo do Monge (lado other)
      if (other.className === 'monge' && other.canDamage(this)) {
        const inFlurry = !!(other.monk && other.monk.rajadaT > 0);
        const speedOK  = inFlurry || (preOtherSpeed > 90);
        if (speedOK) {
          const localCD = inFlurry ? CFG.monge.rajada.local : 0.25;
          if ((other.monk.localHitT || 0) <= 0) {
            let base = monkBodyDamage(other.level);
            base = monkScaledDamage(base, preOtherSpeed);
            if (inFlurry) base *= CFG.monge.rajada.bonus;
            let dmg = base * CFG.monge.dmgMult;
            const dealt = this.hit(dmg, n.clone().mul(-CFG.monge.impulseOnHit), other);
            if (dealt > 0) {
              other.monkOnHitDealt();
              other.monkImpactBurst('hit');
              other.gainXPOffense(dealt);
            }
            other.monk.localHitT = localCD;
          }
        }
      }
    }

    // Parry do Monge (contra arma)
    let parried = false;
    if (this.className === 'monge')  parried = this.monkParryAgainst(other) || parried;
    if (other.className === 'monge') parried = other.monkParryAgainst(this) || parried;

    // 3.6.5. Colisão arma (this) vs. corpo (other)
    const t1 = this.tip();
    const t2 = other.tip();
    {
      const d1 = new V(other.pos.x - t1.x, other.pos.y - t1.y).len();

      const warriorThisMeleeBlocked =
        (this.className === 'guerreiro' && this.gw &&
         (this.gw.mode !== 'melee' || this.gw.disarmedT > 0));

      if (this.className !== 'ranger' && this.className !== 'monge'
          && !warriorThisMeleeBlocked
          && d1 < other.bodyR + this.weaponTipR
          && this.canDamage(other)
          && (this.weaponLockT || 0) <= 0
          && !parried) {

        let tipBase;
        if (this.className === 'barbaro')        tipBase = barbTip(this.level);
        else if (this.className === 'paladino')  tipBase = CFG.paladino.tipBase;
        else if (this.className === 'clerigo')   tipBase = clericTip(this.level);
        else if (this.className === 'guerreiro') tipBase = CFG.guerreiro.tipBase;
        else                                     tipBase = CFG.engage.tipDamageBase;

        let dmg = tipBase * this.dmgMult();

        if (this.className === 'barbaro') dmg = barbApplyPassiveDamage(this, dmg);

        // Guerreiro — Disciplina (consome no golpe)
        if (this.className === 'guerreiro' && this.gw && this.gw.disciplineReady) {
          dmg *= CFG.guerreiro.discipline.bonus;
          this.gw.disciplineReady = false;
        }

        let knockMag =
            (this.className === 'barbaro') ? barbKnock(this.level)
          : (this.className === 'clerigo') ? clericKnock(this.level)
          :                                   380;

        // Bônus da investida do Bárbaro
        if (this.className === 'barbaro' && this.isDashing && this.firstImpactDash) {
          dmg     *= CFG.barbaro.dash.dmgBonus;
          knockMag =  knockMag * CFG.barbaro.dash.knockBonus;
          this.isDashing = false; this.firstImpactDash = false;
        }

        const dealt = other.hit(dmg, V.fromAng(this.angle, knockMag), this);
        if (dealt > 0) {
          this.gainXPOffense(dealt);
          if (this.className === 'paladino') this.trySacredStrike(t1, dealt);
        }

        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(
            t1.clone(),
            V.fromAng(rrand(0, Math.PI * 2), rrand(50, 220)),
            rrand(.2, .6),
            this.color
          ));
        }
      }
    }

    // 3.6.6. Colisão arma (other) vs. corpo (this)
    {
      const d2 = new V(this.pos.x - t2.x, this.pos.y - t2.y).len();

      const warriorOtherMeleeBlocked =
        (other.className === 'guerreiro' && other.gw &&
         (other.gw.mode !== 'melee' || other.gw.disarmedT > 0));

      if (other.className !== 'ranger' && other.className !== 'monge'
          && !warriorOtherMeleeBlocked
          && d2 < this.bodyR + other.weaponTipR
          && other.canDamage(this)
          && (other.weaponLockT || 0) <= 0
          && !parried) {

        let tipBase;
        if (other.className === 'barbaro')        tipBase = barbTip(other.level);
        else if (other.className === 'paladino')  tipBase = CFG.paladino.tipBase;
        else if (other.className === 'clerigo')   tipBase = clericTip(other.level);
        else if (other.className === 'guerreiro') tipBase = CFG.guerreiro.tipBase;
        else                                      tipBase = CFG.engage.tipDamageBase;

        let dmg = tipBase * other.dmgMult();

        if (other.className === 'barbaro') dmg = barbApplyPassiveDamage(other, dmg);

        // Guerreiro — Disciplina (consome no golpe)
        if (other.className === 'guerreiro' && other.gw && other.gw.disciplineReady) {
          dmg *= CFG.guerreiro.discipline.bonus;
          other.gw.disciplineReady = false;
        }

        let knockMag =
            (other.className === 'barbaro') ? barbKnock(other.level)
          : (other.className === 'clerigo') ? clericKnock(other.level)
          :                                    380;

        if (other.className === 'barbaro' && other.isDashing && other.firstImpactDash) {
          dmg     *= CFG.barbaro.dash.dmgBonus;
          knockMag =  knockMag * CFG.barbaro.dash.knockBonus;
          other.isDashing = false; other.firstImpactDash = false;
        }

        const dealt = this.hit(dmg, V.fromAng(other.angle, knockMag), other);
        if (dealt > 0) {
          other.gainXPOffense(dealt);
          if (other.className === 'paladino') other.trySacredStrike(t2, dealt);
        }

        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(
            t2.clone(),
            V.fromAng(rrand(0, Math.PI * 2), rrand(50, 220)),
            rrand(.2, .6),
            other.color
          ));
        }
      }
    }

    // 3.6.7. Colisão arma vs arma (inclui Parry do Guerreiro)
    const tipDist = new V(t2.x - t1.x, t2.y - t1.y).len();
    if (tipDist < this.weaponTipR + other.weaponTipR) {

      // Parry do Guerreiro: this
      if (this.className === 'guerreiro' && this.gw && this.gw.parryCD <= 0 && this.canDamage(other)) {
        const toTip = new V(t2.x - this.pos.x, t2.y - this.pos.y);
        const n = toTip.clone().nrm();
        const t = new V(-n.y, n.x);

        other.weaponLockT = Math.max(other.weaponLockT || 0, CFG.guerreiro.parry.lockT);
        other.vel.add(t.mul(CFG.guerreiro.parry.tangent / other.mass));
        other.vel.add(n.mul(CFG.guerreiro.parry.radial  / other.mass));
        if (other.omega === 0) other.omega = (Math.random() < .5 ? 1 : -1) * 2.6;
        other.omega *= -0.8;

        this.gw.parryCD = CFG.guerreiro.parry.cd;

        if (this.canDamage(other)) { this.gainXPWeaponClash(); other.gainXPWeaponClash(); }

        for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
          game.spawnParticle(new Particle(
            new V((t1.x + t2.x) / 2, (t1.y + t2.y) / 2),
            V.fromAng(randAng(), rrand(60, 160)),
            rrand(.12, .3),
            '#e5e7eb'
          ));
        }
        return;
      }

      // Parry do Guerreiro: other
      if (other.className === 'guerreiro' && other.gw && other.gw.parryCD <= 0 && other.canDamage(this)) {
        const toTip = new V(t1.x - other.pos.x, t1.y - other.pos.y);
        const n = toTip.clone().nrm();
        const t = new V(-n.y, n.x);

        this.weaponLockT = Math.max(this.weaponLockT || 0, CFG.guerreiro.parry.lockT);
        this.vel.add(t.mul(CFG.guerreiro.parry.tangent / this.mass));
        this.vel.add(n.mul(CFG.guerreiro.parry.radial  / this.mass));
        if (this.omega === 0) this.omega = (Math.random() < .5 ? 1 : -1) * 2.6;
        this.omega *= -0.8;

        other.gw.parryCD = CFG.guerreiro.parry.cd;

        if (other.canDamage(this)) { this.gainXPWeaponClash(); other.gainXPWeaponClash(); }

        for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
          game.spawnParticle(new Particle(
            new V((t1.x + t2.x) / 2, (t1.y + t2.y) / 2),
            V.fromAng(randAng(), rrand(60, 160)),
            rrand(.12, .3),
            '#e5e7eb'
          ));
        }
        return;
      }

      // Clash padrão
      this.vel.mul(CFG.physics.boostWeaponWeapon);
      other.vel.mul(CFG.physics.boostWeaponWeapon);

      let s1 = this.vel.len(); if (s1 > CFG.physics.vMax) this.vel.mul(CFG.physics.vMax / s1);
      let s2 = other.vel.len(); if (s2 > CFG.physics.vMax) other.vel.mul(CFG.physics.vMax / s2);

      this.omega  *= -1;
      other.omega *= -1;

      if (this.canDamage(other)) {
        this.gainXPWeaponClash();
        other.gainXPWeaponClash();
      }
      if (this.className === 'monge')  this.monkImpactBurst('clash');
      if (other.className === 'monge') other.monkImpactBurst('clash');

      for (let i = 0; i < 6; i++) {
        game.spawnParticle(new Particle(
          new V((t1.x + t2.x) / 2, (t1.y + t2.y) / 2),
          V.fromAng(rrand(0, Math.PI * 2), rrand(30, 150)),
          rrand(.15, .45),
          '#9aa6c1'
        ));
      }
    }
  }

  // 3.6.8. Habilidades e IA
  monkOnHitDealt() {
    if (!this.monk) return;
    const m = CFG.monge.stacks;
    this.monk.stacks = Math.min(m.max, (this.monk.stacks || 0) + 1);
    this.monk.stacksExpire = performance.now() / 1000 + m.time;
  }
  monkNaturalAccel(dt){
    if (!this.monk) return;
    const s = this.monk.stacks || 0;
    const a = CFG.monge.accel.base + CFG.monge.accel.perStack * s;
    const fwd = this.vel.len() > 1e-3 ? this.vel.clone().nrm() : V.fromAng(this.angle, 1);
    this.vel.add(fwd.mul(a * dt));
  }
  monkImpactBurst(kind, dir){
    if (!this.monk) return;
    const spd = (kind === 'wall') ? CFG.monge.impactBurst.wallSpeed : CFG.monge.impactBurst.speed;
    const pushDir = dir ? dir.clone().nrm() : (this.vel.len()>1e-3 ? this.vel.clone().nrm() : V.fromAng(this.angle,1));
    this.vel.add(pushDir.mul(spd));
    if (CFG.monge.impactBurst.grantStack) this.monkOnHitDealt();
  }
  monkApplyPassive(dt) {
    if (!this.monk) return;
    const s = this.monk.stacks || 0;
    if (s > 0) {
      const mult = 1 + CFG.monge.stacks.speed * s * dt;
      this.vel.mul(mult);
    }
  }
  monkSeek(dt){
    const t = nearestEnemyOf(this);
    if (!t) return;
    const dir = new V(t.pos.x - this.pos.x, t.pos.y - this.pos.y).nrm();
    this.vel.add(dir.mul(CFG.monge.seek.force * dt));
  }
  monkFlurryTick(dt){
    const m = this.monk;
    if (!m || m.flurryT <= 0) return;
    m.flurryT -= dt;
    m.nextHit -= dt;
    const target = m.flurryVictim;
    if (!target || !target.alive) { this.monkEndFlurry(); return; }
    if (m.nextHit <= 0 && m.hitsLeft > 0) {
      const n = new V(target.pos.x - this.pos.x, target.pos.y - this.pos.y).nrm();
      let dmg = monkBodyDamage(this.level) * CFG.monge.rajada.bonus * CFG.monge.dmgMult;
      const dealt = target.hit(dmg, new V(0,0), this);
      if (dealt > 0) {
        this.monkOnHitDealt();
        m.accVict.add(n.clone().mul(CFG.monge.impulseOnHit));
        m.accSelf.add(n.clone().mul(-CFG.monge.impulseOnHit * 0.8));
        this.gainXPOffense(dealt);
      }
      m.hitsLeft--;
      m.nextHit = CFG.monge.rajada.interval;
    }
    if (m.flurryT <= 0 || m.hitsLeft <= 0) {
      this.monkEndFlurry();
    }
  }
  monkEndFlurry(){
    const m = this.monk; if (!m) return;
    const target = m.flurryVictim;
    if (m.accSelf && (m.accSelf.x||m.accSelf.y)) this.vel.add(m.accSelf.clone().mul(1/this.mass));
    if (target && target.alive && m.accVict && (m.accVict.x||m.accVict.y)) {
      target.vel.add(m.accVict.clone().mul(1/target.mass));
    }
    this.freezeT = 0; if (this.freezeReason === 'flurry') this.freezeReason = null;
    if (target) { target.freezeT = 0; if (target.freezeReason === 'flurry') target.freezeReason = null; }
    m.flurryT = 0; m.hitsLeft = 0; m.nextHit = 0;
    m.accSelf = new V(0,0); m.accVict = new V(0,0); m.flurryVictim = null;
  }
  monkTryRajada(dt) {
    if (!this.monk || this.monk.flurryT > 0 || this.monk.rajadaCD > 0) return;
    const cone = monkConeRad(CFG.monge.rajada.coneDeg);
    let best=null, bestD=1e9;
    for (const v of game.units) {
      if (v===this || !v.alive) continue;
      if (this.team && v.team && this.team===v.team) continue;
      if (!inFrontArc(this, v.pos, cone, CFG.monge.rajada.detectR)) continue;
      const d = new V(v.pos.x - this.pos.x, v.pos.y - this.pos.y).len();
      if (d < bestD) { bestD = d; best = v; }
    }
    if (!best) return;
    const P = CFG.monge.rajada;
    this.monk.flurryT = P.dur;
    this.monk.hitsLeft = P.hits;
    this.monk.nextHit = 0;
    this.monk.accSelf = new V(0,0);
    this.monk.accVict = new V(0,0);
    this.monk.flurryVictim = best;
    this.freezeT = P.dur; this.freezeReason = 'flurry';
    best.freezeT = P.dur; best.freezeReason = 'flurry';
    this.vel.mul(0); best.vel.mul(0);
    this.monk.rajadaCD = P.cd;
  }
  monkTryDeflect(dt) {
    if(!this.monk || this.monk.deflectT>0 || this.monk.deflectCD>0) return;
    const cone = monkConeRad(CFG.monge.deflect.coneDeg);
    for(const p of game.projectiles){
      if(!p.alive) continue;
      if(!p.owner || (this.team && p.owner.team && p.owner.team===this.team)) continue;
      if(!projApproaching(p, this)) continue;
      if(inFrontArc(this, p.pos, cone, CFG.monge.deflect.rSense)){
        this.monk.deflectT = CFG.monge.deflect.dur;
        this.monk.deflectCD = CFG.monge.deflect.cd;
        break;
      }
    }
  }
  monkParryAgainst(other){
    if (this.className !== 'monge' || !this.monk || this.monk.deflectT <= 0) return false;
    if (!other || !other.alive) return false;
    if (this.team && other.team && this.team === other.team) return false;
    if (!other.weaponLen || !other.weaponTipR) return false;
    const tip = other.tip();
    const cone = monkConeRad(CFG.monge.deflect.coneDeg);
    const allow = inFrontArc(this, tip, cone, CFG.monge.deflect.rHit + other.weaponTipR + 6);
    if (!allow) return false;
    const toTip = new V(tip.x - this.pos.x, tip.y - this.pos.y);
    const n = toTip.clone().nrm();
    const t = new V(-n.y, n.x);
    if (other.omega === 0) other.omega = (Math.random() < .5 ? 1 : -1) * 2.6;
    other.omega *= CFG.monge.parry.omegaMul;
    other.vel.add(t.mul(CFG.monge.parry.tangentForce / other.mass));
    other.vel.add(n.mul(CFG.monge.parry.radialPush / other.mass));
    other.weaponLockT = Math.max(other.weaponLockT || 0, CFG.monge.parry.staggerT);
    for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
      game.spawnParticle(new Particle(
        tip.clone(),
        V.fromAng(Math.random() * Math.PI * 2, rrand(30, 120)),
        rrand(.12, .3),
        '#ffe9b3'
      ));
    }
    return true;
  }
  nearestEnemyWithinCone(radius, coneDeg) {
    let best = null, bestD = 1e9;
    const f = new V(Math.cos(this.angle), Math.sin(this.angle));
    for (const o of game.units) {
      if (!o.alive || o === this) continue;
      if (this.team && o.team && this.team === o.team) continue;
      const to = new V(o.pos.x - this.pos.x, o.pos.y - this.pos.y);
      const d = to.len();
      if (d > radius || d < 1e-6) continue;
      const dir = to.clone().mul(1 / d);
      const cos = clamp(f.dot(dir), -1, 1);
      const ang = Math.acos(clamp(cos,-1,1)) * 180 / Math.PI;
      if (ang <= coneDeg * 0.5 && d < bestD) { best = o; bestD = d; }
    }
    return best;
  }
  tryInvestida(dt) {
    if (this.className !== 'barbaro') return;
    if (this.dashCD > 0 || this.isDashing) return;
    const P = CFG.barbaro.dash; const t = this.nearestEnemyWithinCone(P.detectR, P.coneDeg);
    if (!t) return;
    this.isDashing = true; this.dashT = 0; this.firstImpactDash = true; this.dashTarget = t; this.dashCD = P.cd;
  }
  updateInvestida(dt) {
    if (this.className !== 'barbaro' || !this.isDashing) return;
    const P = CFG.barbaro.dash; this.dashT += dt;
    if (this.dashT > P.time) { this.isDashing = false; return; }
    let dir;
    if (this.dashTarget && this.dashTarget.alive) { dir = new V(this.dashTarget.pos.x - this.pos.x, this.dashTarget.pos.y - this.pos.y).nrm(); }
    else { dir = new V(Math.cos(this.angle), Math.sin(this.angle)); }
    this.vel.add(dir.mul(P.accel * dt));
  }
  tryUrro(dt) {
    if (this.className !== 'barbaro') return;
    if (this.urroCD > 0 || this.urroT > 0) return;
    const R = CFG.barbaro.roar; let many = 0;
    for (const o of game.units) {
      if (!o.alive || o === this) continue;
      if (this.team && o.team && this.team === o.team) continue;
      const d = new V(o.pos.x - this.pos.x, o.pos.y - this.pos.y).len();
      if (d <= R.threatR) many++;
    }
    const low = (this.hp / this.hpMax) < 0.35; if (many >= R.need || low) { this.urroT = R.duration; this.urroCD = R.cd; }
  }
  castPalHeal() {
    if (this.className !== 'paladino') return;
    const st = palStats(this.level), pct = st.healPct;
    this.hp = clamp(this.hp + this.hpMax * pct, 0, this.hpMax);
    let ally = null, best = 1e9;
    for (const u of game.units) {
      if (!u.alive || u === this) continue;
      if (!(this.team && u.team && this.team === u.team)) continue;
      const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
      if (d < best && d <= CFG.paladino.heal.range) { best = d; ally = u; }
    }
    if (ally) { ally.hp = clamp(ally.hp + ally.hpMax * pct, 0, ally.hpMax); }
    for (let i = 0; i < 10; i++) game.spawnParticle(new Particle(this.pos.clone(), V.fromAng(Math.random() * Math.PI * 2, 60 + Math.random() * 120), .5, CFG.paladino.heal.color));
  }
  trySacredStrike(hitPos, baseDealt) {
    if (this.className !== 'paladino') return;
    const st = palStats(this.level);
    let ok = Math.random() < st.sacredChance;
    if (CFG.paladino._forceSacredOnce) { ok = true; CFG.paladino._forceSacredOnce = false; }
    if (!ok) return;
    const dmg = baseDealt * CFG.paladino.sacred.dmgMult;
    game.paladinExplosion(this, hitPos.clone(), st.sacredRadius, dmg);
  }

  // === RANGER: Disparo básico ===
  fire() {
    if (this.className === 'ranger') {
      const stats = rangerStats(this.level);
      const baseDir = new V(Math.cos(this.angle), Math.sin(this.angle));
      const center = this.tip().add(baseDir.clone().mul(this.weaponTipR + 2));
      const passive = (this.stillT >= CFG.ranger.stillTime) ? CFG.ranger.passiveDmgMult : 1;
      const makeArrow = (offset) => {
        const dirAngle = this.angle + offset; const dir = new V(Math.cos(dirAngle), Math.sin(dirAngle));
        const spec = {speed: stats.speed, dmg: stats.dmgBase * passive, penetration: false};
        game.spawnProjectile(new Arrow(this, center.clone(), dir, spec));
      };
      if (stats.numArrows === 1) { makeArrow(0); }
      else if (stats.numArrows === 2) { const a = stats.spread * 0.5; makeArrow(-a); makeArrow(a); }
      return stats.cd;
    }

    if (this.className === 'bruxo') {
      const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
      const p = this.tip().add(dir.clone().mul(this.weaponTipR + 2));
      const proj = new Projectile(this, p, dir);
      proj.speed = CFG.bruxo.blast.speed;
      proj.life  = CFG.bruxo.blast.life;
      proj.rad   = CFG.bruxo.blast.rad;
      proj.dmg   = CFG.bruxo.blast.dmg * this.dmgMult();
      proj.knock = CFG.bruxo.blast.knock;
      proj.color = '#c9a7ff';
      proj.visual = 'eldritch';
      game.spawnProjectile(proj);
      return CFG.ranged.cooldown * 1.05;
    }

    if (this.className === 'guerreiro') {
      const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
      const p = this.tip().add(dir.clone().mul(this.weaponTipR + 2));
      const spec = CFG.guerreiro.spear;

      // ✅ usar o projétil correto da lança
      const proj = new SpearProjectile(this, p, dir);
      game.spawnProjectile(proj);

      // mão “vazia” por parte do CD total
      if (this.gw) {
        this.gw.disarmedT = spec.cdTotal * spec.disarmedFrac;
      }

      return spec.cdTotal;
    }

    const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
    const p = this.tip().add(dir.clone().mul(this.weaponTipR + 2));
    game.spawnProjectile(new Projectile(this, p, dir));
    return CFG.ranged.cooldown;
  }

  // === RANGER A1: Perfect Shot (3 flechas penetrantes) ===
  castPerfectShot() {
    if (this.className !== 'ranger') return;

    const stats = rangerStats(this.level);
    const P = CFG.ranger.perfectShot || {};

    // defaults seguros
    const spreadDeg = (P.spreadDeg != null ? P.spreadDeg : 8);
    const dmgMult   = (P.dmgMult   != null ? P.dmgMult   : 1.2);
    const speedMul  = (P.speedMul  != null ? P.speedMul  : 1.0);

    const spread = spreadDeg * Math.PI / 180;

    // bônus de ficar parado
    const passive = (this.stillT >= CFG.ranger.stillTime) ? CFG.ranger.passiveDmgMult : 1;

    const baseDir = new V(Math.cos(this.angle), Math.sin(this.angle));
    const origin  = this.tip().add(baseDir.clone().mul(this.weaponTipR + 3));

    // centro, esquerda, direita
    const offsets = [0, -spread, +spread];

    for (const off of offsets) {
      const dir = new V(Math.cos(this.angle + off), Math.sin(this.angle + off));
      const spec = {
        speed: stats.speed * speedMul,
        dmg:   stats.dmgBase * passive * dmgMult,
        penetration: true,
        visual: 'perfect'
      };
      const arr = new Arrow(this, origin.clone(), dir, spec);
      game.spawnProjectile(arr);
    }
  }

  // === RANGER A2: Forest Call (evoca espíritos aliados que expiram) ===
  castForestCall() {
    if (this.className !== 'ranger') return;

    const F = CFG.ranger.forestCall || {};
    const duration = F.duration != null ? F.duration : 6.0;

    // limite de minions ativos por Ranger (evita explosão)
    const MAX = (F.maxActive != null ? F.maxActive : 3);
    let aliveMine = 0;
    for (const s of game.summons) {
      if (s.alive && s.kind === 'forest' && s.owner === this) aliveMine++;
    }

    // quantidade por nível (usa thresholds do CFG)
    let want = (F.minions && F.minions.base) ? F.minions.base : 1;
    if (F.minions) {
      if (this.level >= 3 && F.minions.lvl3 != null)      want = F.minions.lvl3;
      else if (this.level >= 2 && F.minions.lvl2 != null) want = F.minions.lvl2;
    }

    const spawnCount = Math.max(0, Math.min(want, MAX - aliveMine));
    if (spawnCount <= 0) return;

    // dano base dos minions escala com nível e com multiplicador de dano do Ranger
    const base = (F.dmgBase != null ? F.dmgBase : 10);
    const perL = (F.dmgPerLevelPct != null ? F.dmgPerLevelPct : 0.05);
    const minionDmg = base * (1 + perL * Math.max(0, this.level - 1)) * this.dmgMult();

    // nasce em círculo ao redor do Ranger
    const R = Math.max(24, this.bodyR + 10);
    for (let i = 0; i < spawnCount; i++) {
      const ang = (i / spawnCount) * Math.PI * 2 + Math.random() * 0.3;
      const pos = new V(this.pos.x + Math.cos(ang) * R, this.pos.y + Math.sin(ang) * R);
      const s = new Summon(this, pos, minionDmg, duration);
      game.spawnSummon(s);

      // vfx
      for (let k=0;k<6;k++){
        game.spawnParticle(new Particle(
          pos.clone(),
          V.fromAng(randAng(), rrand(60,160)),
          rrand(.18,.4),
          '#a8ffcf'
        ));
      }
    }
  }

  // PASSIVA do Clérigo: Sacred Flame
  clericPassiveTick(dt){
    const P = CFG.clerigo.sacredFlame;
    this.clericFlameTimer = (this.clericFlameTimer ?? P.period) - dt;
    if (this.clericFlameTimer > 0) return;

    this.clericFlameTimer += P.period + (P.jitter ? rrand(-P.jitter, P.jitter) : 0);

    const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
    const p0  = this.tip().add(dir.clone().mul(this.weaponTipR + 2));

    for (let i=0;i<4;i++){
      game.spawnParticle(new Particle(
        p0.clone(),
        V.fromAng(this.angle + rrand(-0.5,0.5), rrand(60,180)),
        rrand(.08,.22),
        P.color
      ));
    }

    const pr = new Projectile(this, p0, dir);
    pr.speed = P.speed;
    pr.life  = P.life;
    pr.rad   = P.radius;
    pr.dmg   = (P.dmgBase + P.dmgPerLevel * (this.level - 1)) * this.dmgMult();
    pr.knock = P.knock;
    pr.color = P.color;
    pr.penetration = false;
    game.spawnProjectile(pr);
  }

  // Sunbeam
  clericStartBeam(){
    const B = CFG.clerigo.beam;
    this.beamT = B.dur;
    this._beamNext = 0;
    this.freezeT = B.dur;
    this.freezeReason = 'beam';
    this.vel.mul(0);
  }
  clericBeamTick(dt){
    const B = CFG.clerigo.beam;
    this.beamT = Math.max(0, this.beamT - dt);

    const fwd = new V(Math.cos(this.angle), Math.sin(this.angle));
    const a = this.tip().add(fwd.clone().mul(this.weaponTipR + 2));
    const b = a.clone().add(fwd.clone().mul(B.range));

    this._beamNext += dt;
    while (this._beamNext >= B.tick) {
      this._beamNext -= B.tick;
      const dmgTick = (B.dpsBase + B.dpsPerLevel * (this.level - 1)) * this.dmgMult() * B.tick;

      for (const u of game.units) {
        if (!u.alive || u === this) continue;
        if (!this.canDamage(u)) continue;
        const d = distPointToSegment(u.pos, a, b);
        if (d <= (B.width * 0.5 + u.bodyR)) {
          const dealt = u.hit(dmgTick, fwd.clone().mul(B.push * B.tick), this);
          if (dealt > 0) this.gainXPOffense(dealt);
        }
      }

      for (let i=0;i<3;i++){
        game.spawnParticle(new Particle(
          new V(a.x + Math.random()*(b.x-a.x), a.y + Math.random()*(b.y-a.y)),
          V.fromAng(randAng(), rrand(60,160)),
          rrand(.08,.22),
          B.color
        ));
      }
    }
  }

  // Rezo do Clérigo
  castPrayer(){
    const P = CFG.clerigo.prayer;
    const pct = P.healPctBase + P.healPctPerLevel * (this.level - 1);

    game.spawnEffect(new Effect(this.pos.clone(), P.radius, 0.55, P.color)); // ring expand

    const selfHeal = this.hpMax * pct * P.selfBonus;
    this.hp = clamp(this.hp + selfHeal, 0, this.hpMax);

    for (let i=0;i<10;i++){
      game.spawnParticle(new Particle(
        this.pos.clone(),
        V.fromAng(randAng(), rrand(80,160)),
        rrand(.25,.6),
        P.color
      ));
    }

    for (const u of game.units) {
      if (!u.alive || u === this) continue;
      if (!(this.team && u.team && this.team === u.team)) continue;
      const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
      if (d <= P.radius) {
        const heal = u.hpMax * pct;
        u.hp = clamp(u.hp + heal, 0, u.hpMax);

        game.spawnEffect(new Effect(u.pos.clone(), Math.min(42, u.bodyR + 20), 0.35, P.color));
        for (let k=0;k<6;k++){
          game.spawnParticle(new Particle(
            u.pos.clone(),
            V.fromAng(randAng(), rrand(60,140)),
            rrand(.18,.42),
            P.color
          ));
        }
      }
    }
  }

  castHex() {
    if (this.className !== 'bruxo') return;
    let best=null, bestD=1e9;
    for (const o of game.units) {
      if (!o.alive || o===this) continue;
      if (this.team && o.team && this.team===o.team) continue;
      const d = new V(o.pos.x - this.pos.x, o.pos.y - this.pos.y).len();
      if (d < bestD) { bestD=d; best=o; }
    }
    if (!best) return;
    best.hex = { owner: this, t: CFG.bruxo.hex.dur };
    game.spawnEffect(new Effect(best.pos.clone(), 36, .45, CFG.bruxo.hex.color));
    for (let i=0;i<10;i++){
      game.spawnParticle(new Particle(best.pos.clone(), V.fromAng(randAng(), rrand(60,160)), rrand(.2,.5), CFG.bruxo.hex.color));
    }
    this.brxHexCD = CFG.bruxo.hex.cd;
  }
  castFamiliar() {
    if (this.className !== 'bruxo') return;
    if (this.familiarRef && this.familiarRef.alive) return;
    const fam = new Familiar(this);
    this.familiarRef = fam;
    game.spawnSummon(fam);
  }

  // 3.6.9. Desenho
  drawBars(ctx) {
    const w = 54, h = 6, pad = 2;
    const x = this.pos.x - w / 2;
    const y = this.pos.y - this.bodyR - 16;
    drawRoundedRect(ctx, x, y, w, h, 3);
    ctx.fillStyle = 'rgba(8,12,18,0.85)'; ctx.fill();
    const hpw = w * (this.hp / this.hpMax);
    drawRoundedRect(ctx, x, y, hpw, h, 3);
    const hpGrad = ctx.createLinearGradient(x, y, x + w, y);
    hpGrad.addColorStop(0, '#7eed90'); hpGrad.addColorStop(1, '#37d86b');
    ctx.fillStyle = hpGrad; ctx.fill();
    const y2 = y + h + pad;
    drawRoundedRect(ctx, x, y2, w, h - 2, 3);
    ctx.fillStyle = 'rgba(8,12,18,0.85)'; ctx.fill();
    const r = (this.level >= CFG.level.max) ? 1 : (this.xp / this.xpCost());
    drawRoundedRect(ctx, x, y2, w * r, h - 2, 3);
    const xpGrad = ctx.createLinearGradient(x, y2, x + w, y2);
    xpGrad.addColorStop(0, '#96d8ff'); xpGrad.addColorStop(1, '#3ab2ff');
    ctx.fillStyle = xpGrad; ctx.fill();
  }
  drawLevel(ctx) {
    ctx.save(); ctx.font = '700 14px system-ui,Segoe UI,Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.strokeText(String(this.level), this.pos.x, this.pos.y);
    ctx.shadowBlur = 10; ctx.shadowColor = this.color;
    ctx.fillStyle = '#e6edf7'; ctx.fillText(String(this.level), this.pos.x, this.pos.y); ctx.restore();
  }
  draw(ctx) {
    if (this.className === 'barbaro') {
      if (this.urroT > 0) { ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = '#f87171'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.bodyR + 6, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      if (this.isDashing) { ctx.save(); ctx.globalAlpha = 0.20; ctx.strokeStyle = '#fde047'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.bodyR + 10, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    }
    if (this.className === 'paladino' && this.palShieldT > 0) {
      ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = '#fff8c2'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.bodyR + 6, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    if (this.className === 'monge' && this.monk && this.monk.deflectT > 0) {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y); ctx.rotate(this.angle);
      ctx.globalAlpha = 0.45; ctx.strokeStyle = 'rgba(200,230,255,0.9)'; ctx.lineWidth = 3;
      const a = monkConeRad(CFG.monge.deflect.coneDeg);
      const r = CFG.monge.deflect.rHit;
      ctx.beginPath(); ctx.arc(0, 0, r, -a, +a); ctx.stroke();
      ctx.restore();
    }
    if (this.className === 'monge' && this.monk && this.monk.stacks > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.5, 0.08 * this.monk.stacks);
      ctx.strokeStyle = 'rgba(160,210,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.bodyR + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // Indicador de HEX
    if (this.hex && this.hex.t > 0) {
      const t = (performance.now()/1000);
      const r = this.bodyR + 8;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = CFG.bruxo.hex.color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, r, 0, Math.PI*2);
      ctx.stroke();

      for (let i=0;i<4;i++){
        const a = t*2 + i*Math.PI/2;
        const px = this.pos.x + Math.cos(a)*r;
        const py = this.pos.y + Math.sin(a)*r;
        ctx.beginPath();
        ctx.moveTo(px+3,py);
        ctx.lineTo(px,py+3);
        ctx.lineTo(px-3,py);
        ctx.lineTo(px,py-3);
        ctx.closePath();
        ctx.fillStyle = CFG.bruxo.hex.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
      }
      ctx.restore();
    }

    // Corpo e arma
    ctx.save();
    const base = this.color;
    const outlineCol = shade(base, -0.70);
    const weaponCol = shade(base, -0.18);
    ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.bodyR, 0, Math.PI * 2);
    ctx.fillStyle = base; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = outlineCol; ctx.stroke();
    ctx.globalAlpha = 0.14;
    ctx.beginPath(); ctx.arc(this.pos.x - this.bodyR * 0.35, this.pos.y - this.bodyR * 0.35, this.bodyR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.globalAlpha = 1;

    ctx.save(); ctx.translate(this.pos.x, this.pos.y); ctx.rotate(this.angle);

    if (this.className === 'paladino') {
      const swordW = 8; const guardW = 22; const guardH = 6;
      ctx.fillStyle = weaponCol;
      ctx.beginPath(); ctx.rect(this.bodyR, -swordW / 2, this.weaponLen, swordW); ctx.fill();
      ctx.fillStyle = shade(base, -0.4);
      ctx.beginPath(); ctx.rect(this.bodyR - guardH / 2, -guardW / 2, guardH, guardW); ctx.fill();

    } else if (this.className === 'ranger') {
      const limb = this.weaponLen;
      const bowH = Math.max(10, limb * 0.35);
      const x0 = this.bodyR;
      ctx.lineCap = 'round';
      ctx.strokeStyle = weaponCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, -bowH);
      ctx.quadraticCurveTo(x0 + limb * 0.65, 0, x0, bowH);
      ctx.stroke();
      ctx.strokeStyle = shade(base, -0.45);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x0, -bowH);
      ctx.lineTo(x0, bowH);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x0 + limb * 0.65, 0, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = shade(base, 0.05);
      ctx.fill();

    } else if (this.className === 'monge') {
      // sem arma

    } else if (this.className === 'clerigo') {
      const ax = this.bodyR, ay = 0;
      const tx = this.bodyR + this.weaponLen, ty = 0;

      ctx.lineCap = 'round';
      ctx.strokeStyle = weaponCol; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tx - this.weaponTipR, ty); ctx.stroke();

      ctx.beginPath();
      ctx.arc(tx, ty, this.weaponTipR + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#b6bcc8';
      ctx.fill();

      ctx.globalAlpha = 0.30;
      ctx.beginPath();
      ctx.arc(tx, ty, this.weaponTipR + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#e7ecf2';
      ctx.fill();
      ctx.globalAlpha = 1;

    } else if (this.className === 'bruxo') {
      ctx.translate(this.bodyR, 0);
      const x0 = 0;
      const w = 18, h = 14, spine = 4;
      ctx.fillStyle = shade(base, -0.25);
      ctx.beginPath(); ctx.rect(x0, -h/2, w, h); ctx.fill();
      ctx.fillStyle = shade(base, -0.45);
      ctx.beginPath(); ctx.rect(x0, -h/2, spine, h); ctx.fill();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#e5d9ff'; ctx.lineWidth = 1.5;
      ctx.strokeRect(x0+0.5, -h/2+0.5, w-1, h-1);
      ctx.globalAlpha = 1;

    } else if (this.className === 'guerreiro') {
      if (this.gw && this.gw.disarmedT > 0) {
        const ax = this.bodyR, ay = 0;
        ctx.strokeStyle = shade(this.color, -0.25); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 12, ay); ctx.stroke();
      } else {
        const ax = this.bodyR, ay = 0;
        const tx = this.bodyR + this.weaponLen, ty = 0;

        ctx.lineCap = 'round';
        ctx.strokeStyle = weaponCol; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tx - this.weaponTipR - 6, ty); ctx.stroke();

        ctx.beginPath();
        ctx.arc(ax + 6, ay, 3.5, 0, Math.PI*2);
        ctx.fillStyle = shade(this.color, -0.25);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - (this.weaponTipR + 10), ty - (this.weaponTipR * 0.9));
        ctx.lineTo(tx - (this.weaponTipR + 10), ty + (this.weaponTipR * 0.9));
        ctx.closePath();
        ctx.fillStyle = '#e5e7eb';
        ctx.fill();

        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.moveTo(tx-4, ty);
        ctx.lineTo(tx - (this.weaponTipR + 10) + 3, ty - (this.weaponTipR * 0.6));
        ctx.lineTo(tx - (this.weaponTipR + 10) + 3, ty + (this.weaponTipR * 0.6));
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.globalAlpha = 1;
      }

    } else {
      const ax = this.bodyR; const ay = 0; const tx = this.bodyR + this.weaponLen; const ty = 0;
      ctx.lineCap = 'round'; ctx.strokeStyle = weaponCol; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.beginPath(); ctx.arc(tx, ty, this.weaponTipR, 0, Math.PI * 2);
      ctx.fillStyle = base; ctx.fill();
      ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.arc(tx, ty, this.weaponTipR + 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.globalAlpha = 1;
    }

    ctx.restore();
    if (game.debugHit) { ctx.globalAlpha = .3; ctx.strokeStyle = '#fff'; ctx.strokeRect(game.bounds.x + 1, game.bounds.y + 1, game.bounds.w - 2, game.bounds.h - 2); }
    ctx.restore();

    this.drawBars(ctx);
    this.drawLevel(ctx);
  }
}


// ===================================
// CAPÍTULO 4: Lógica Central do Jogo
// ===================================

// 4.1. Variáveis e elementos da UI
const fpsEl = document.getElementById('fps');
const overlay = document.getElementById('overlay');
const arenaNameEl = document.getElementById('arenaName');
const perf = { now: () => performance.now() };

const unitListEl = document.getElementById('unitList');
const btnAddUnit = document.getElementById('btnAddUnit');

// ===== Helpers anti-conflito (fallbacks) =====
// Noise: usa o do Cap. 2 se existir; senão um fallback local.
let _noisePat4 = null;
function ensureNoiseFallback(ctx) {
  if (_noisePat4) return _noisePat4;
  const n = document.createElement('canvas');
  n.width = n.height = 128;
  const ng = n.getContext('2d');
  const img = ng.createImageData(n.width, n.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 220 + Math.floor(Math.random() * 35);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ng.putImageData(img, 0, 0);
  _noisePat4 = ctx.createPattern(n, 'repeat');
  return _noisePat4;
}
const ensureNoiseAny = (ctx) =>
  (typeof window !== 'undefined' && typeof window.ensureNoise === 'function')
    ? window.ensureNoise(ctx)
    : ensureNoiseFallback(ctx);

// Classes (HTML das opções): usa o do Cap. 2 se existir; senão fallback.
function optionClassHTMLFallback() {
  return `
    <option value="barbaro">Bárbaro</option>
    <option value="paladino">Paladino</option>
    <option value="monge">Monge</option>
    <option value="clerigo">Clérigo</option>
    <option value="ranger">Ranger</option>
    <option value="bruxo">Bruxo</option>
    <option value="guerreiro">Guerreiro</option>
  `;
}
function getClassOptionsHTML() {
  if (typeof window !== 'undefined' && typeof window.optionClassHTML === 'function') {
    return window.optionClassHTML();
  }
  return optionClassHTMLFallback();
}

// Teams
function optionTeamHTML() {
  return `
    <option value="Y">🟡 Amarelo</option>
    <option value="R">🔴 Vermelho</option>
    <option value="G">🟢 Verde</option>
    <option value="B">🔵 Azul</option>`;
}

// === SUBSTITUIR ESTA ===
function addUnitRow(preset) {
  const div = document.createElement('div');
  div.className = 'unit-item pretty';

  const classOptions = getClassOptionsHTML();
  div.innerHTML = `
    <canvas class="unit-thumb" width="120" height="64"></canvas>
    <div class="unit-fields">
      <select class="unit-class">${classOptions}</select>
      <select class="unit-team">${optionTeamHTML()}</select>
      <span class="team-swatch"></span>
      <input type="number" min="1" max="20" value="${preset?.level || 1}" class="unit-level"/>
      <button class="kill" title="Remover">✕</button>
    </div>
  `;

  // presets
  if (preset?.team)  div.querySelector('.unit-team').value  = preset.team;
  if (preset?.klass) div.querySelector('.unit-class').value = preset.klass;

  // remover
  div.querySelector('.kill').onclick = () => div.remove();

  // liga eventos e pinta o thumbnail
  wireUnitRow(div);

  unitListEl.appendChild(div);
  return div;
}

// === ADICIONAR ESTA ===
// Conecta os eventos do row e atualiza cor/preview
function wireUnitRow(div){
  const clsSel = div.querySelector('.unit-class');
  const teamSel = div.querySelector('.unit-team');
  const lvlInp = div.querySelector('.unit-level');
  const swatch = div.querySelector('.team-swatch');
  const thumb  = div.querySelector('.unit-thumb');
  const ctx    = thumb.getContext('2d');

  const paint = () => {
    const team = TEAM[teamSel.value] || { color:'#7dd3fc' };
    swatch.style.backgroundColor = team.color;
    drawUnitThumbRow(ctx, clsSel.value, team.color, parseInt(lvlInp.value||1,10));
  };

  clsSel.addEventListener('change', paint);
  teamSel.addEventListener('change', paint);
  lvlInp.addEventListener('input', paint);

  paint();
}

// === ADICIONAR ESTA ===
// Mini-render do bonequinho + arma conforme classe (nome diferente do Cap. 2)
function drawUnitThumbRow(ctx, klass, color, level){
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0,0,W,H);

  // fundo com gradiente + grid
  const grd = ctx.createLinearGradient(0,0,0,H);
  grd.addColorStop(0,'#0f1622'); grd.addColorStop(1,'#0a111b');
  ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.globalAlpha=.12; ctx.strokeStyle='#1a2640';
  for(let x=10;x<W;x+=10){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=10;y<H;y+=10){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.restore();

  // corpo
  const base = color || '#7dd3fc';
  const outline = shade(base, -0.70);
  const weaponCol = shade(base, -0.18);
  const cx = W*0.38, cy = H*0.58, r = 16;

  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = base; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = outline; ctx.stroke();

  // nível (canto)
  ctx.save();
  ctx.font = '700 11px system-ui,Segoe UI';
  ctx.fillStyle = '#e6edf7';
  ctx.textAlign='right'; ctx.textBaseline='top';
  ctx.fillText('Lv ' + Math.max(1,Math.min(20,level|0)), W-6, 4);
  ctx.restore();

  // arma – versão simplificada
  ctx.save();
  ctx.translate(cx, cy);
  const bodyR = r, tipR = 7, len = 26;
  ctx.lineCap='round';

  const drawSword = () => {
    ctx.fillStyle = weaponCol;
    ctx.beginPath(); ctx.rect(bodyR, -4, len, 8); ctx.fill();
    ctx.fillStyle = shade(base, -0.4);
    ctx.beginPath(); ctx.rect(bodyR-4, -10, 8, 20); ctx.fill();
  };
  const drawMace = () => {
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bodyR,0); ctx.lineTo(bodyR+len- tipR,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(bodyR+len,0, tipR+2, 0, Math.PI*2);
    ctx.fillStyle = '#b6bcc8'; ctx.fill();
  };
  const drawBow  = () => {
    const limb = len+6, bowH = Math.max(10, limb*0.35), x0 = bodyR;
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x0, -bowH);
    ctx.quadraticCurveTo(x0 + limb * 0.65, 0, x0, bowH);
    ctx.stroke();
    ctx.strokeStyle = shade(base, -0.45); ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(x0,-bowH); ctx.lineTo(x0,bowH); ctx.stroke();
  };
  const drawBook = () => {
    ctx.translate(bodyR,0);
    const x0=0,w=18,h=14,sp=4;
    ctx.fillStyle = shade(base,-0.25);
    ctx.beginPath(); ctx.rect(x0,-h/2,w,h); ctx.fill();
    ctx.fillStyle = shade(base,-0.45);
    ctx.beginPath(); ctx.rect(x0,-h/2,sp,h); ctx.fill();
    ctx.globalAlpha=.25; ctx.strokeStyle='#e5d9ff'; ctx.lineWidth=1.2;
    ctx.strokeRect(x0+0.5,-h/2+0.5,w-1,h-1);
  };
  const drawStick = () => { // fallback genérico
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bodyR,0); ctx.lineTo(bodyR+len-3,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(bodyR+len,0, 4, 0, Math.PI*2);
    ctx.fillStyle = shade(base, .15); ctx.fill();
  };

  switch(klass){
    case 'paladino': drawSword(); break;
    case 'ranger':   drawBow();   break;
    case 'clerigo':  drawMace();  break;
    case 'barbaro':  drawMace();  break;
    case 'bruxo':    drawBook();  break;
    case 'monge':
      ctx.globalAlpha=.35; ctx.strokeStyle='rgba(160,210,255,0.9)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(0,0, bodyR+4, 0, Math.PI*2); ctx.stroke();
      break;
    case 'guerreiro':
      ctx.strokeStyle = weaponCol; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bodyR-12, 8); ctx.lineTo(bodyR+14, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bodyR+16, 0); ctx.lineTo(bodyR+10, -4); ctx.lineTo(bodyR+10, 4);
      ctx.closePath(); ctx.fillStyle = '#e5e7eb'; ctx.fill();
      break;
    default:         drawStick();  break;
  }
  ctx.restore();
}


// 4.3. Objeto Principal do Jogo
// game: Objeto que gerencia o estado, loop e entidades do jogo.
const game = {
  state: 'menu',
  canvasW: 0, canvasH: 0,
  bounds: {x:0, y:0, w:0, h:0},
  arenaType: 'simples',
  br: { active:false, total: CFG.arenas.battle_royale.closeDefault, elapsed:0 },
  units: [], projectiles: [], summons: [], particles: [], effects: [],
  last: perf.now(), paused: false, debugB: false, debugHit: false, victoryTeam: null, _stars: null,

  // 4.3.1. Métodos de controle do jogo
  init() {
    this.resize();
    this.bindUI();
    this.setArenaType('simples');
    this.populateArenaSelect();
    if (typeof drawPreview === 'function') drawPreview('simples');
    addUnitRow({team: 'G', klass: 'ranger', level: 1});
    addUnitRow({team: 'R', klass: 'paladino', level: 1});
    requestAnimationFrame(() => this.loop());
  },
  populateArenaSelect() {
    const sel = document.querySelector('select#arena');
    if (!sel) { console.warn('select#arena não encontrado'); return; }

    sel.innerHTML = Object.entries(CFG.arenas)
      .map(([k, a]) => {
        const key = a.key || k;
        const label = a.label || key;
        return `<option value="${key}">${label}</option>`;
      })
      .join('');

    sel.value = this.arenaType;

    arenaNameEl && (arenaNameEl.textContent = sel.options[sel.selectedIndex]?.text || '');
    const brBox = document.getElementById('brConfig');
    if (brBox) brBox.style.display = (this.arenaType === 'battle_royale') ? '' : 'none';
  },
  bindUI() {
    window.addEventListener('resize', () => this.resize());
    const btnMenu  = document.getElementById('btnMenu');
    const btnReset = document.getElementById('btnReset');
    const btnPause = document.getElementById('btnPause');
    const btnStart = document.getElementById('btnStart');

    btnMenu  && (btnMenu.onclick  = () => this.showMenu());
    btnReset && (btnReset.onclick = () => this.reset(false));
    btnPause && (btnPause.onclick = () => this.paused = !this.paused);
    btnStart && (btnStart.onclick = () => this.start());

    const arenaSel = document.querySelector('select#arena');
    if (arenaSel) {
      arenaSel.onchange = (e) => {
        const mode = e.target.value;
        this.setArenaType(mode);
        if (arenaNameEl) arenaNameEl.textContent = e.target.options[e.target.selectedIndex].text;
        const brBox = document.getElementById('brConfig');
        if (brBox) brBox.style.display = (mode === 'battle_royale') ? '' : 'none';
        if (mode === 'battle_royale') {
          const v = parseFloat(document.getElementById('brTime')?.value || CFG.arenas.battle_royale.closeDefault);
          this.setBRCloseTime(v);
        }
        if (typeof drawPreview === 'function') drawPreview(mode);
      };
    }

    document.getElementById('brTime')?.addEventListener('input', (e) => {
      const v = Math.max(CFG.arenas.battle_royale.closeMin, Math.min(CFG.arenas.battle_royale.closeMax, parseFloat(e.target.value||CFG.arenas.battle_royale.closeDefault)));
      if (this.arenaType === 'battle_royale') this.setBRCloseTime(v);
    });

    // corrige o ID do botão de mensagem: no HTML é "message-close"
    document.getElementById('message-close')?.addEventListener('click', () => hideMessage());

    window.addEventListener('keydown', e => {
      if (e.code === 'KeyR') this.reset(false);
      if (e.code === 'KeyP') this.paused = !this.paused;
      if (e.code === 'KeyB') this.debugB = !this.debugB;
      if (e.code === 'KeyH') this.debugHit = !this.debugHit;
    });

    btnAddUnit && (btnAddUnit.onclick = () => addUnitRow());
  },
  showMenu() { this.state = 'menu'; if (overlay) overlay.style.display = 'flex'; },
  hideMenu() { if (overlay) overlay.style.display = 'none'; this.state = 'playing'; },
  resize() {
    // requer que existam canvas e contexto global g (criados no capítulo do palco)
    const ratio = 16 / 9; const w = window.innerWidth; const h = window.innerHeight - 150;
    let cssW = w, cssH = Math.floor(w / ratio);
    if (cssH > h) { cssH = h; cssW = Math.floor(h * ratio); }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px';
    canvas.width = Math.floor(cssW * dpr); canvas.height = Math.floor(cssH * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.canvasW = cssW; this.canvasH = cssH;
    this.updateBounds();
    this._stars = null;
  },
  getVMin() { return CFG.physics.vMin; },
  onDamage(_d) { /* hook p/ telemetria se quiser */ },
  setArenaType(mode){
    if (!CFG.arenas[mode]) mode = 'simples'; // guard contra chaves antigas
    this.arenaType = mode;
    this.br.active = (mode === 'battle_royale');
    this.br.elapsed = 0;
    this.updateBounds();
  },
  setBRCloseTime(sec){
    this.br.total = Math.max(CFG.arenas.battle_royale.closeMin, Math.min(CFG.arenas.battle_royale.closeMax, sec|0));
    this.br.elapsed = 0;
    this.updateBounds();
  },
  computeBounds(){
    const W = this.canvasW, H = this.canvasH;
    let scale = 1;
    const arenaCfg = CFG.arenas[this.arenaType];

    if (this.arenaType === 'simples' || this.arenaType === 'simples_menor'){
      scale = arenaCfg.scale;
    } else if (this.arenaType === 'battle_royale'){
      const p = (this.br.total>0) ? Math.min(1, Math.max(0, this.br.elapsed/this.br.total)) : 1;
      scale = arenaCfg.startScale + (arenaCfg.endScale - arenaCfg.startScale) * p;
    }
    const w = Math.round(W * scale), h = Math.round(H * scale);
    const x = Math.floor((W - w)/2), y = Math.floor((H - h)/2);
    this.bounds = { x, y, w, h };
  },
  updateBounds(){ this.computeBounds(); },
  spawnInRing(){
    const a = randAng();
    const rmin = 0.28, rmax = 0.48;
    const R = 0.5 * Math.min(this.bounds.w, this.bounds.h);
    const rr = R * (rmin + Math.random() * (rmax - rmin));
    const cx = this.bounds.x + this.bounds.w*0.5;
    const cy = this.bounds.y + this.bounds.h*0.5;
    return new V(cx + Math.cos(a)*rr, cy + Math.sin(a)*rr);
  },
  setupUnits() {
    this.units.length = 0; this.projectiles.length = 0; this.summons.length = 0;
    this.particles.length = 0; this.effects.length = 0; this.victoryTeam = null;
    const rows = [...document.querySelectorAll('.unit-item')]; let id = 0;
    for (const row of rows) {
      const klass = row.querySelector('.unit-class').value;
      const team = row.querySelector('.unit-team').value;
      const level = parseInt(row.querySelector('.unit-level').value || '1', 10);
      const def = CLASSES[klass];
      const color = TEAM[team].color;
      const pos = this.spawnInRing();
      const u = new Unit(id++, pos, color, def.hasRanged);
      u.team = team; u.className = klass; u.weaponLen = def.weaponLen;
      u.weaponTipR = def.tipRadius; u.omega = def.omega * (Math.random() < .5 ? -1 : 1);
      u.level = 1; u.applyClassDefaults();
      for (let L = 1; L < Math.min(level, CFG.level.max); L++) u.levelUp();
      u.xp = 0; u.hp = u.hpMax;
      const dir = new V(this.bounds.x + this.bounds.w * 0.5 - u.pos.x, this.bounds.y + this.bounds.h * 0.5 - u.pos.y).nrm();
      const jitter = V.fromAng(randAng(), CFG.physics.initImpulse * 0.25);
      u.vel = dir.mul(CFG.physics.initImpulse).add(jitter).nrm().mul(CFG.physics.initImpulse);
      this.units.push(u);
    }
  },
  start() {
    if (document.querySelectorAll('.unit-item').length < 2) {
      showMessage('Adicione ao menos 2 unidades para começar.'); return;
    }
    this.hideMenu(); this.setupUnits(); this.paused = false;
    if (this.arenaType === 'battle_royale'){
      const v = parseFloat(document.getElementById('brTime')?.value || CFG.arenas.battle_royale.closeDefault);
      this.setBRCloseTime(v);
      this.br.elapsed = 0;
      this.updateBounds();
    }
  },
  reset(respawn) {
    if (this.state !== 'playing') { return; }
    if (respawn) {
      this.setupUnits();
    } else {
      for (const u of this.units) {
        u.pos = this.spawnInRing();
        const dir = new V(this.bounds.x + this.bounds.w * 0.5 - u.pos.x, this.bounds.y + this.bounds.h * 0.5 - u.pos.y).nrm();
        const jitter = V.fromAng(randAng(), CFG.physics.initImpulse * 0.25);
        u.vel = dir.mul(CFG.physics.initImpulse).add(jitter).nrm().mul(CFG.physics.initImpulse);
        u.hp = u.hpMax; u.alive = true; u.deadHandled = false;
        u.omega = Math.abs(u.omega) * (Math.random() < .5 ? -1 : 1);
      }
      this.projectiles.length = 0; this.summons.length = 0; this.particles.length = 0;
      this.effects.length = 0; this.victoryTeam = null; this.paused = false;
    }
  },
  onDeath(_u) { this.checkVictory(); },
  onFamiliarDeath(f){
    if (f.owner && f.owner.className === 'bruxo') {
      f.owner.brxFamCD = CFG.bruxo.familiar.cdAfterDeath;
      f.owner.familiarRef = null;
    }
  },
  aliveTeams() {
    const set = new Set();
    for (const u of this.units) {
      if (u.alive) set.add(u.team || ('U' + u.id));
    }
    return set;
  },
  checkVictory() {
    const teams = this.aliveTeams();
    if (teams.size <= 1 && !this.victoryTeam) {
      this.victoryTeam = [...teams][0];
      setTimeout(() => this.reset(true), 1400);
    }
  },

  // 4.3.2. Métodos de spawn
  spawnProjectile(p) { this.projectiles.push(p) },
  spawnSummon(s) { this.summons.push(s) },
  spawnParticle(p) { this.particles.push(p) },
  spawnEffect(e) { this.effects.push(e) },
  spawnFamiliar(f) { this.summons.push(f) },
  paladinExplosion(owner, pos, radius, damage) {
    this.spawnEffect(new Effect(pos.clone(), radius * 1.2, 0.4, CFG.paladino.sacred.color));
    for (let i = 0; i < 18; i++) this.spawnParticle(new Particle(pos.clone(), V.fromAng(Math.random() * Math.PI * 2, 120 + Math.random() * 200), .4, CFG.paladino.sacred.color));
    for (const u of this.units) {
      if (!u.alive) continue;
      if (owner.team && u.team && owner.team === u.team) continue;
      const d = new V(u.pos.x - pos.x, u.pos.y - pos.y); const L = d.len();
      if (L < radius + u.bodyR) {
        const dealt = u.hit(damage, d.nrm().mul(CFG.paladino.sacred.knockPerDamage * (damage / 20)), owner);
        if (dealt > 0 && owner) owner.gainXPOffense(dealt);
      }
    }
  },

  // 4.3.3. Loop principal do jogo
  applyNudge(u, dt) {
    if (u.idleT < CFG.engage.idleTime) return;
    let best = null, bestD = 1e9;
    for (const v of this.units) {
      if (!v.alive || v === u) continue;
      if (u.team && v.team && u.team === v.team) continue;
      const d = new V(v.pos.x - u.pos.x, v.pos.y - u.pos.y).len();
      if (d < bestD) { bestD = d; best = v; }
    }
    if (best && bestD < CFG.engage.maxPullDist) {
      const dir = new V(best.pos.x - u.pos.x, best.pos.y - u.pos.y).nrm();
      u.vel.add(dir.mul(CFG.engage.pullStrength * dt));
    }
  },
  update(dt) {
    this.updateRing(dt);

    for (const u of this.units) { if (!u.alive) continue; u.physics(dt, this.bounds); }
    for (let i = 0; i < this.units.length; i++) {
      for (let j = i + 1; j < this.units.length; j++) {
        const a = this.units[i], b = this.units[j];
        if (!a.alive || !b.alive) continue;
        a.collide(b);
      }
    }

    for (const p of this.projectiles) p.update(dt, this.bounds, this.units);
    this.projectiles = this.projectiles.filter(p => p.alive);

    for (const s of this.summons) s.update(dt, this.bounds, this.units);
    this.summons = this.summons.filter(s => s.alive);

    for (const q of this.particles) q.update(dt);
    this.particles = this.particles.filter(q => q.alive);

    for (const e of this.effects) e.update(dt);
    this.effects = this.effects.filter(e => e.alive);

    // separação básica contra familiares + dano de ponta
    const pets = this.summons.filter(s => s.alive && s.kind === 'familiar');
    for (const u of this.units){
      if (!u.alive) continue;
      for (const f of pets){
        if (!f.alive) continue;
        const d = new V(f.pos.x - u.pos.x, f.pos.y - u.pos.y);
        const L = d.len(); const min = u.bodyR + f.bodyR;
        if(L>0 && L<min){
          const n = d.clone().mul(1/L);
          const over = min - L;
          u.pos.add(n.clone().mul(-over*0.5));
          f.pos.add(n.clone().mul( over*0.5));
        }
        if (u.className !== 'ranger' && u.className !== 'monge' && u.canDamage(f)){
          const tip = u.tip();
          const dist = new V(f.pos.x - tip.x, f.pos.y - tip.y).len();
          if (dist < f.bodyR + u.weaponTipR && (u.weaponLockT||0)<=0){
            let tipBase = (u.className==='barbaro') ? barbTip(u.level)
                       : (u.className==='paladino') ? CFG.paladino.tipBase
                       : (u.className==='clerigo')  ? clericTip(u.level)
                       : CFG.engage.tipDamageBase;
            let dmg = tipBase * u.dmgMult();
            if (u.className==='barbaro') dmg = barbApplyPassiveDamage(u,dmg);
            const knock = (u.className==='barbaro') ? barbKnock(u.level) : 360;
            const dealt = f.hit(dmg, V.fromAng(u.angle,knock), u);
            if (dealt>0) u.gainXPOffense(dealt);
          }
        }
      }
    }

    for (const u of this.units) { if (u.hex && (u.hex.t > 0)) { u.hex.t -= dt; if (u.hex.t <= 0) u.hex = null; } }
    this.checkVictory();
  },
  updateRing(dt){
    if (this.arenaType !== 'battle_royale' || !this.br.active) return;
    this.br.elapsed = Math.min(this.br.elapsed + dt, this.br.total);
    this.updateBounds();
    if (this.br.elapsed >= this.br.total) this.br.active = false;
  },
  draw() {
    const CW = this.canvasW, CH = this.canvasH;
    g.fillStyle = '#05080e'; g.fillRect(0,0,CW,CH);
    if (typeof drawArenaRect === 'function') drawArenaRect(this.bounds);

    if (this.debugB) {
      g.save(); g.strokeStyle = CFG.theme.border; g.strokeRect(this.bounds.x+1, this.bounds.y+1, this.bounds.w-2, this.bounds.h-2); g.restore();
    }

    // borda da arena jogável (bounds)
    g.save();
    g.shadowColor = CFG.theme.border; g.shadowBlur = 8;
    g.strokeStyle = 'rgba(59,130,246,0.65)'; g.lineWidth = 2;
    g.strokeRect(this.bounds.x+1, this.bounds.y+1, this.bounds.w-2, this.bounds.h-2);
    g.restore();

    for (const p of this.projectiles) p.draw(g);
    for (const s of this.summons) s.draw(g);
    for (const u of this.units) if (u.alive) u.draw(g);
    for (const q of this.particles) q.draw(g);
    for (const e of this.effects) e.draw(g);

    // Raio canalizado visível (Clérigo)
    for (const u of this.units) {
      if (u.className === 'clerigo' && u.beamT > 0) {
        const B = CFG.clerigo.beam;
        const fwd = new V(Math.cos(u.angle), Math.sin(u.angle));
        const a = u.tip().add(fwd.clone().mul(u.weaponTipR + 2));
        const b = a.clone().add(fwd.clone().mul(B.range));

        g.save();
        g.globalAlpha = 0.85;
        g.lineCap = 'round';
        g.shadowColor = B.color; g.shadowBlur = 14;

        // corpo do feixe
        g.strokeStyle = B.color;
        g.lineWidth = B.width;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();

        // borda/miolo
        g.globalAlpha = 0.5;
        g.shadowBlur = 8;
        g.strokeStyle = B.edge;
        g.lineWidth = Math.max(2, B.width * 0.5);
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();

        g.restore();
      }
    }

    // grão (noise) leve na tela toda — usa ANY para evitar conflito
    g.save();
    g.globalAlpha = 0.035; g.globalCompositeOperation = 'multiply';
    g.fillStyle = ensureNoiseAny(g);
    g.fillRect(0, 0, CW, CH);
    g.restore();

    if (this.victoryTeam) {
      g.save(); g.fillStyle = '#e6edf7'; g.shadowColor = CFG.theme.glow; g.shadowBlur = 12;
      g.font = '700 42px system-ui,Segoe UI'; g.textAlign = 'center';
      const name = (TEAM[this.victoryTeam]?.name) || '—';
      g.fillText(`Time ${name} venceu!`, this.bounds.x + this.bounds.w / 2, this.bounds.y + this.bounds.h / 2);
      g.restore();
    }
  },
  loop() {
    const now = perf.now(); let dt = (now - this.last) / 1000; this.last = now;
    dt = Math.min(dt, 0.033);
    this._fa = (this._fa || 0) + dt; this._fc = (this._fc || 0) + 1;
    if (this._fa > 0.25) {
      fpsEl && (fpsEl.textContent = (this._fc / this._fa).toFixed(0));
      this._fa = 0; this._fc = 0;
    }
    if (this.state === 'playing' && !this.paused) {
      this.update(dt); this.draw();
    }
    requestAnimationFrame(() => this.loop());
  }
};
// ===================================
// CAPÍTULO 5: Renderização (corrigido)
// ===================================

// 5.1. Renderização da tela de pré-visualização (Preview)
const previewCanvas = document.getElementById('preview');
const pctx = previewCanvas ? previewCanvas.getContext('2d') : null;

function drawPreview(mode){
  if (!previewCanvas || !pctx) return;
  const w = previewCanvas.width, h = previewCanvas.height;

  // fundo
  const grd = pctx.createLinearGradient(0,0,0,h);
  grd.addColorStop(0,'#0f1622');
  grd.addColorStop(1,'#0a111b');
  pctx.fillStyle = grd;
  pctx.fillRect(0,0,w,h);

  // grid
  pctx.save();
  pctx.globalAlpha = .22;
  pctx.strokeStyle = CFG.theme.grid;
  const step = 20;
  for (let gx = step; gx < w; gx += step) {
    pctx.beginPath(); pctx.moveTo(gx,0); pctx.lineTo(gx,h); pctx.stroke();
  }
  for (let gy = step; gy < h; gy += step) {
    pctx.beginPath(); pctx.moveTo(0,gy); pctx.lineTo(w,gy); pctx.stroke();
  }
  pctx.restore();

  // moldura
  pctx.save();
  pctx.strokeStyle = CFG.theme.border; pctx.lineWidth = 2;
  pctx.strokeRect(6, 6, w-12, h-12);
  pctx.restore();

  // anéis de arena (start/end)
  let sStart = 1.0, sEnd = 1.0;
  if (mode === 'simples_menor') sStart = sEnd = CFG.arenas.simples_menor.scale;
  if (mode === 'battle_royale') {
    sStart = CFG.arenas.battle_royale.startScale;
    sEnd   = CFG.arenas.battle_royale.endScale;
  }
  const drawRing = (scale, alpha, color) => {
    const ww = Math.round((w-12) * scale), hh = Math.round((h-12) * scale);
    const x = 6 + Math.floor(((w-12) - ww)/2), y = 6 + Math.floor(((h-12) - hh)/2);
    pctx.save(); pctx.globalAlpha = alpha; pctx.strokeStyle = color; pctx.lineWidth = 2;
    pctx.strokeRect(x, y, ww, hh); pctx.restore();
  };
  drawRing(sStart, 0.9, '#7dd3fc');
  if (sEnd !== sStart) drawRing(sEnd, 0.6, '#f59e0b');
}

// 5.2. Canvas principal do jogo
const canvas = document.getElementById('game');
const g = canvas ? canvas.getContext('2d') : null;

// retângulo da arena (usado no Cap. 4)
function drawArenaRect(bounds){
  if (!g || !bounds) return;
  const {x, y, w, h} = bounds;

  // fundo interno
  const bg = g.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, '#0f1622');
  bg.addColorStop(1, '#0a111b');
  g.fillStyle = bg;
  g.fillRect(x, y, w, h);

  // grid sutil
  g.save();
  g.globalAlpha = .22;
  g.strokeStyle = CFG.theme.grid;
  const step = 24;
  for (let gx = x + step; gx < x + w; gx += step) {
    g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke();
  }
  for (let gy = y + step; gy < y + h; gy += step) {
    g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke();
  }
  g.restore();

  // brilho interno leve
  g.save();
  g.globalAlpha = .08;
  g.strokeStyle = CFG.theme.border;
  g.lineWidth = 6;
  g.strokeRect(x + 3, y + 3, w - 6, h - 6);
  g.restore();
}

// (opcional) fundo full canvas – se quiser usar em outro lugar
function drawBackground(w, h) {
  if (!g || w <= 0 || h <= 0) return;
  const rad = g.createRadialGradient(
    w*0.5, h*0.5, Math.min(w,h)*0.12,
    w*0.5, h*0.5, Math.min(w,h)*0.65
  );
  rad.addColorStop(0, '#08121f');
  rad.addColorStop(1, '#05080e');
  g.fillStyle = rad;
  g.fillRect(0, 0, w, h);
}

// 5.3. Inicialização segura (garante canvas/context e evita double init)
(function safeInit(){
  const init = () => {
    if (!canvas || !g) {
      console.error('Canvas principal #game não encontrado.');
      return;
    }
    if (typeof game !== 'undefined' && typeof game.init === 'function') {
      game.init();
    } else {
      console.error('Objeto "game" não disponível ou sem método init().');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    // DOM já pronto
    init();
  }
})();


// ===================================
// CAPÍTULO 6: Testes
// ===================================

// 6.1. Definição e execução dos testes
const Tests = [];
function addTest(name, fn) { Tests.push({name, fn}) }
function runTests() {
    let passed = 0; const results = [];
    for (const t of Tests) {
        try { t.fn(); results.push(`✔ ${t.name}`); passed++; }
        catch (e) { console.error(`Test failed: ${t.name}`, e); results.push(`✖ ${t.name}: ${e}`); }
    }
    const el = document.getElementById('testStatus');
    if (el) {
        el.textContent = `Tests: ${passed}/${Tests.length} passed`;
        el.title = results.join('\n');
    }
}
addTest('draw() does not throw', () => { game.draw(); });
addTest('speed floor/ceiling are applied', () => {
    const u = new Unit(999, new V(100, 100), '#fff', false);
    u.vel = V.fromAng(0, 5); u.ensureSpeed();
    if (u.vel.len() < game.getVMin() - 1e-6) throw new Error('floor');
    u.vel = V.fromAng(0, 1e9); u.ensureSpeed();
    if (u.vel.len() > CFG.physics.vMax + 1e-6) throw new Error('ceiling');
});
addTest('projectile exits and disappears', () => {
    const u = new Unit(1, new V(10, 10), '#fff', true);
    const dir = new V(1, 0); const p = new Projectile(u, new V(1270, 10), dir);
    const arena = {x:0, y:0, w: 1280, h: 720};
    p.update(1, arena, [u]);
    if (p.alive) throw new Error('projectile should be gone');
});
addTest('level up keeps HP ratio', () => {
    const u = new Unit(1, new V(0, 0), '#fff', false); u.hp = 50; u.hpMax = 100; u.addXP(9999);
    const ratio = Math.round((u.hp / u.hpMax) * 100);
    if (ratio < 45 || ratio > 55) throw new Error('ratio not preserved');
});
addTest('projectile reflects on weapon tip', () => {
    const a = new Unit(1, new V(60, 50), '#fff', false); a.angle = 0; a.weaponLen = 20; a.weaponTipR = 8;
    const tip = a.tip(); const pr = CFG.ranged.radius;
    const p = new Projectile(a, new V(tip.x - (a.weaponTipR + pr - 0.2), tip.y), new V(1, 0));
    p.update(0.001, {x:0, y:0, w: 200, h: 100}, [a]);
    if (!(p.dir.x < 0)) throw new Error('should reflect to negative x');
});
addTest('reflection causes no damage and clears owner', () => {
    const a = new Unit(1, new V(60, 50), '#fff', false); a.angle = 0; a.weaponLen = 20; a.weaponTipR = 8;
    const tip = a.tip(); const pr = CFG.ranged.radius; const hp = a.hp;
    const p = new Projectile(a, new V(tip.x - (a.weaponTipR + pr - 0.2), tip.y), new V(1, 0));
    p.update(0.001, {x:0, y:0, w: 200, h: 100}, [a]);
    if (a.hp !== hp) throw new Error('blocker should not take damage');
    if (p.owner !== null) throw new Error('reflected projectile should be neutral');
});
addTest('ranger passive boosts arrow damage when still', () => {
    const r = new Unit(1, new V(100, 100), '#50fa7b', true); r.className = 'ranger'; r.level = 10; r.applyClassDefaults();
    r.stillT = 1.0; const before = game.projectiles.length;
    const cd = r.fire();
    if (game.projectiles.length === before) throw new Error('no arrow spawned');
    const arr = game.projectiles[game.projectiles.length - 1];
    if (!(arr instanceof Arrow)) throw new Error('not an Arrow');
    const base = rangerStats(r.level).dmgBase;
    if (!(arr.dmg > base * 1.01)) throw new Error('passive not applied');
});
addTest('perfect shot penetrates bodies', () => {
    const r = new Unit(1, new V(80, 80), '#50fa7b', true); r.className = 'ranger'; r.level = 10; r.applyClassDefaults();
    r.stillT = 0; r.angle = 0;
    const e1 = new Unit(2, new V(160, 80), '#ff6b6b', false); e1.team = 'R';
    const e2 = new Unit(3, new V(240, 80), '#ff6b6b', false); e2.team = 'R';
    r.team = 'G'; const testUnits = [r, e1, e2];
    game.units = testUnits; const before = game.projectiles.length; r.castPerfectShot();
    const arr = game.projectiles[game.projectiles.length - 1];
    if (!(arr instanceof Arrow)) throw new Error('not an Arrow');
    if (!arr.penetration) throw new Error('perfect shot should penetrate');
    arr.update(0.02, {x:0, y:0, w: 400, h: 200}, testUnits); const aliveAfterE1 = arr.alive;
    if (!aliveAfterE1) throw new Error('arrow died on first body');
});
addTest('forest spirits are allies and expire', () => {
    const r = new Unit(1, new V(100, 100), '#50fa7b', true); r.className = 'ranger'; r.level = 14; r.applyClassDefaults();
    r.team = 'G'; game.units = [r]; const before = game.summons.length;
    r.castForestCall();
    if (game.summons.length <= before) throw new Error('no summons');
    for (let t = 0; t < 7; t += 0.5) { game.update(0.5); }
    if (game.summons.length !== 0) throw new Error('summons should expire');
});
addTest('barbaro_dash_accel', () => {
    const b = new Unit(1, new V(200, 200), '#eab308', false); b.className = 'barbaro'; b.level = 10; b.applyClassDefaults();
    b.vel = new V(0, 0); b.angle = 0;
    const t = new Unit(2, new V(300, 200), '#fff', false);
    game.units = [b, t]; const speed0 = b.vel.len();
    b.tryInvestida(0.016); for (let i = 0; i < 15; i++) { b.updateInvestida(0.016); }
    if (!(b.vel.len() > speed0)) throw new Error('dash should accelerate');
    game.units = [];
});
addTest('barbaro_first_impact_bonus', () => {
    const b = new Unit(1, new V(100, 100), '#eab308', false); b.className = 'barbaro'; b.level = 10; b.applyClassDefaults(); b.angle = 0;
    const t = new Unit(2, new V(100 + b.bodyR + b.weaponLen + 6, 100), '#fff', false);
    b.isDashing = true; b.firstImpactDash = true;
    const tip = b.tip(); const pr = CFG.ranged.radius;
    const before = t.hp; const tipBase = barbTip(b.level) * b.dmgMult();
    const dmgDash = t.hit(barbApplyPassiveDamage(b, tipBase) * CFG.barbaro.dash.dmgBonus, V.fromAng(b.angle, barbKnock(b.level) * CFG.barbaro.dash.knockBonus), b);
    b.isDashing = false; b.firstImpactDash = false; t.hp = t.hpMax;
    const dmgNorm = t.hit(barbApplyPassiveDamage(b, tipBase), V.fromAng(b.angle, barbKnock(b.level)), b);
    if (!(dmgDash > dmgNorm)) throw new Error('first impact should deal more');
});
addTest('barbaro_urro_damage_reduction', () => {
    const b = new Unit(1, new V(100, 100), '#eab308', false); b.className = 'barbaro'; b.level = 1; b.applyClassDefaults(); b.urroT = 1.0;
    const hp0 = b.hp; const dealt = b.hit(100, new V(300, 0), null);
    const expected = 100 * CFG.barbaro.roar.dmgReduce;
    if (!(dealt >= expected - 1 && dealt <= expected + 1)) throw new Error('roar should reduce damage');
});
addTest('barbaro_urro_knock_immunity', () => {
    const b = new Unit(1, new V(100, 100), '#eab308', false); b.className = 'barbaro'; b.level = 1; b.applyClassDefaults(); b.urroT = 1.0;
    const v0 = b.vel.clone(); b.hit(0, new V(1000, 0), null);
    if (Math.abs(b.vel.x - v0.x) > 1e-6 || Math.abs(b.vel.y - v0.y) > 1e-6) throw new Error('roar should ignore knockback');
});
addTest('barbaro_passive_scales', () => {
    const b = new Unit(1, new V(100, 100), '#eab308', false); b.className = 'barbaro'; b.level = 1; b.applyClassDefaults();
    const base = barbTip(b.level) * b.dmgMult(); b.hp = b.hpMax; const full = barbApplyPassiveDamage(b, base);
    b.hp = b.hpMax * 0.1; const low = barbApplyPassiveDamage(b, base);
    if (!(low > full)) throw new Error('passive should increase damage at low HP');
});
addTest('paladin sacred strike triggers AoE (forced)', () => {
    const p = new Unit(1, new V(100, 100), '#fff', false); p.className = 'paladino'; p.applyClassDefaults();
    p.team = 'G'; p.angle = 0; p.weaponLen = 38; p.weaponTipR = 10;
    const tip = p.tip();
    const e1 = new Unit(2, new V(tip.x - 5, tip.y), '#f66', false); e1.team = 'R';
    const e2 = new Unit(3, new V(tip.x + 20, tip.y), '#f66', false); e2.team = 'R';
    game.units = [p, e1, e2];
    const hp1 = e1.hp, hp2 = e2.hp; CFG.paladino._forceSacredOnce = true;
    p.collide(e1);
    if (!(e1.hp < hp1)) throw new Error('primary target took no damage');
    if (!(e2.hp < hp2)) throw new Error('AoE did not hit nearby enemy');
    game.units = [];
});
addTest('paladin shield negates next hit and pushes attacker', () => {
    const pal = new Unit(1, new V(120, 100), '#fff', false); pal.className = 'paladino'; pal.applyClassDefaults(); pal.team = 'G';
    const atk = new Unit(2, new V(140, 100), '#f66', false); atk.team = 'R';
    pal.palShieldT = 10;
    const hp0 = pal.hp; const vel0 = atk.vel.clone();
    const dealt = pal.hit(50, new V(-200, 0), atk);
    if (dealt !== 0) throw new Error('shield should block all damage');
    if (!(atk.vel.len() > vel0.len())) throw new Error('attacker should be pushed');
});
addTest('paladin healing heals self and ally', () => {
    const pal = new Unit(1, new V(100, 100), '#fff', false); pal.className = 'paladino'; pal.applyClassDefaults(); pal.team = 'G';
    const ally = new Unit(2, new V(120, 100), '#ffb', false); ally.team = 'G';
    game.units = [pal, ally];
    pal.hp = pal.hpMax * 0.5; const h0 = pal.hp;
    ally.hp = ally.hpMax * 0.4; const a0 = ally.hp;
    pal.castPalHeal();
    if (!(pal.hp > h0)) throw new Error('self not healed');
    if (!(ally.hp > a0)) throw new Error('ally not healed');
    game.units = [];
});
addTest('monk_stacks_speed_up', () => {
    const m = new Unit(1, new V(200, 200), '#aee1ff', false); m.className = 'monge'; m.level = 10; m.applyClassDefaults();
    m.vel = V.fromAng(0, 300);
    const v0 = m.vel.len(); m.monkOnHitDealt(); m.monkOnHitDealt(); m.monkOnHitDealt();
    m.monkApplyPassive(0.3);
    if (!(m.vel.len() > v0)) throw new Error('velocity should increase with stacks');
});
addTest('monk_flurry_multihit_window', () => {
    const m = new Unit(1, new V(120, 100), '#aee1ff', false); m.className = 'monge'; m.level = 10; m.applyClassDefaults();
    const t = new Unit(2, new V(145, 100), '#ff6b6b', false); m.team = 'G'; t.team = 'R';
    game.units = [m, t];
    m.vel = V.fromAng(0, 400); t.vel = V.fromAng(Math.PI, 0);
    m.monk.rajadaT = CFG.monge.rajada.dur; m.monk.localHitT = 0; const hp0 = t.hp;
    m.collide(t);
    const hp1 = t.hp; if (!(hp1 < hp0)) throw new Error('first hit missing');
    m.monk.localHitT = 0; m.collide(t);
    if (!(t.hp < hp1)) throw new Error('second flurry hit missing');
    game.units = [];
});
addTest('monk_deflect_reflects_projectile', () => {
    const m = new Unit(1, new V(200, 200), '#aee1ff', false); m.className = 'monge'; m.level = 5; m.applyClassDefaults();
    m.monk.deflectT = 0.5; m.angle = Math.PI;
    const shooter = new Unit(9, new V(160, 200), '#fff', true); shooter.team = 'R'; m.team = 'G'});
// (substitua a linha cortada do teste pelo bloco completo abaixo)
addTest('barbaro_urro_damage_reduction', () => {
  const b = new Unit(1, new V(100, 100), '#eab308', false);
  b.className = 'barbaro';
  b.level = 10;
  b.applyClassDefaults();

  const atk = new Unit(2, new V(100 + b.bodyR + b.weaponLen + 12, 100), '#fff', false);

  const base = 50;

  // Com URRO ativo
  b.urroT = CFG.barbaro.roar.duration;
  const dealtRoar = b.hit(base, new V(0, 0), atk);

  // Sem URRO
  b.hp = b.hpMax;
  b.urroT = 0;
  const dealtNoRoar = b.hit(base, new V(0, 0), atk);

  if (!(dealtRoar < dealtNoRoar)) throw new Error('Urro deveria reduzir o dano recebido');
});

// Paladino: o escudo anula o primeiro golpe e empurra o atacante
addTest('paladino_shield_blocks_first_hit_and_knocks', () => {
  const p = new Unit(1, new V(200, 200), '#fff', false);
  p.className = 'paladino';
  p.level = 8;
  p.applyClassDefaults();

  const a = new Unit(2, new V(200 + p.bodyR + p.weaponLen + 8, 200), '#ff6b6b', false);

  p.palShieldT = 1.0; // escudo ativo
  const v0 = a.vel.len();
  const dealt = p.hit(40, new V(0, 0), a);

  if (dealt !== 0) throw new Error('Escudo do paladino deveria anular o primeiro dano');
  if (!(a.vel.len() > v0)) throw new Error('Atacante deveria ser empurrado pelo escudo');
});

// Bruxo: projétil causa mais dano em alvo com HEX do mesmo bruxo
addTest('bruxo_hex_amplifies_damage', () => {
  const w = new Unit(10, new V(300, 300), '#c9a7ff', true);
  w.className = 'bruxo';
  w.level = 6;
  w.applyClassDefaults();
  w.team = 'G';

  const t = new Unit(11, new V(340, 300), '#ff6b6b', false);
  t.team = 'R';

  // cenário sem HEX
  const baseDir = new V(1, 0);
  const p1 = new Projectile(w, t.pos.clone().add(new V(-CFG.ranged.radius - 0.5, 0)), baseDir);
  p1.dmg = 20 * w.dmgMult();
  p1.knock = 0;
  p1.update(0.002, { x: 0, y: 0, w: 1000, h: 1000 }, [t]);
  const dmgNoHex = t.hpMax - t.hp;

  // reseta e aplica HEX do mesmo bruxo
  t.hp = t.hpMax;
  t.hex = { owner: w, t: 3 };

  const p2 = new Projectile(w, t.pos.clone().add(new V(-CFG.ranged.radius - 0.5, 0)), baseDir);
  p2.dmg = 20 * w.dmgMult();
  p2.knock = 0;
  p2.update(0.002, { x: 0, y: 0, w: 1000, h: 1000 }, [t]);

  const dmgWithHex = t.hpMax - t.hp;

  if (!(dmgWithHex > dmgNoHex)) throw new Error('HEX deveria amplificar o dano do bruxo');
});

// Clérigo: feixe causa dano ao longo da linha
addTest('clerigo_beam_ticks_damage', () => {
  const c = new Unit(20, new V(400, 400), '#ffe28a', false);
  c.className = 'clerigo';
  c.level = 5;
  c.applyClassDefaults();
  c.angle = 0;

  const victim = new Unit(21, new V(400 + c.bodyR + c.weaponLen + 80, 400), '#ff6b6b', false);

  game.units = [c, victim]; // necessário pro cálculo de colisão do feixe

  const hp0 = victim.hp;

  c.clericStartBeam();
  // Simula alguns ticks do feixe
  for (let t = 0; t < CFG.clerigo.beam.dur + 0.05; t += 0.06) {
    c.clericBeamTick(0.06);
  }

  if (!(victim.hp < hp0)) throw new Error('Feixe do clérigo deveria causar dano ao alvo dentro da linha');
  game.units = [];
});

// Monge: rajada (flurry) aplica múltiplos hits e paralisa brevemente
addTest('monge_rajada_applies_multi_hits', () => {
  const m = new Unit(30, new V(500, 500), '#96d8ff', false);
  m.className = 'monge';
  m.level = 10;
  m.applyClassDefaults();
  m.angle = 0;

  const e = new Unit(31, new V(500 + 120, 500), '#ff6b6b', false);
  game.units = [m, e];

  // Força uma rajada (vítima em cone e alcance)
  const before = e.hp;
  m.monkTryRajada(0.016);
  // avança o tempo até concluir a rajada
  let t = 0;
  while (m.monk.flurryT > 0 && t < 3) {
    m.monkFlurryTick(0.05);
    t += 0.05;
  }

  if (!(e.hp < before)) throw new Error('Rajada do monge deveria aplicar dano múltiplo');
  game.units = [];
});

// 6.2. Executa os testes e inicia o jogo
(function boot() {
  try {
    runTests();
  } catch (err) {
    console.error('Falha ao rodar testes:', err);
  }
  // Inicia o loop do jogo
  game.init();
})(); 
