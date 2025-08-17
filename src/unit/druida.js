// Lógica principal da classe Druida (Guardião Selvagem)

import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { Projectile } from '../entities/projectile.js';
import { DruidRoot } from '../entities/druidRoot.js';
import { game } from '../core/game.js';
import { clamp } from '../utils/misc.js';
import { spawnElementBurst, spawnBearTransform } from '../vfx/druida_vfx.js';

const ELEMENTS = ['fire', 'ice', 'lightning', 'earth'];
const COLORS = {
  fire: '#fb923c',
  ice: '#93c5fd',
  lightning: '#fde68a',
  earth: '#a3e635'
};

const TRAILS = {
  fire:  { color: '#fb923c', width: 3 },
  ice:   { color: '#93c5fd', width: 3 },
  lightning: { color: '#fde68a', width: 2 },
  earth: { color: '#a3e635', width: 3 }
};

// Elemental rune images for projectile visuals
const elementImgs = {};
if (typeof Image !== 'undefined') {
  elementImgs.fire = new Image();
  elementImgs.fire.src = 'assets/druida_proj_fire.svg';
  elementImgs.ice = new Image();
  elementImgs.ice.src = 'assets/druida_proj_ice.svg';
  elementImgs.lightning = new Image();
  elementImgs.lightning.src = 'assets/druida_proj_lightning.svg';
  elementImgs.earth = new Image();
  elementImgs.earth.src = 'assets/druida_proj_earth.svg';
}

export function makeDruidaState() {
  return {
    elemIdx: 0,
    lastCombatT: game.time,
    a1cd: 0,
    a2cd: 0,
    roots: [],
    bear: { active: false, t: 0, saved: null, hitCD: 0 }
  };
}

export function druidaRegisterCombat() {
  if (this.className !== 'druida' || !this.dru) return;
  this.dru.lastCombatT = game.time;
}

export function fireDruida() {
  if (this.className !== 'druida' || !this.dru) return;
  const S = CFG.druida.staff;
  const elem = ELEMENTS[this.dru.elemIdx];
  this.dru.elemIdx = (this.dru.elemIdx + 1) % ELEMENTS.length;
  const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
  const off = this.tip().add(dir.clone().mul(2));
  const proj = new Projectile(this, off, dir);
  proj.dmg = (S.dmgBase + S.dmgPerLevel * (this.level - 1)) * this.dmgMult();
  proj.rad = (S.radiusBase + S.radiusPerLevel * (this.level - 1)) * 0.2;
  proj.color = COLORS[elem];
  proj.img = elementImgs[elem];
  proj.element = elem;
  const trail = TRAILS[elem];
  proj.trailColor = trail.color;
  proj.trailWidth = trail.width;
  if (elem === 'fire') {
    proj.onHit = (u, p) => { u.applyBurn(S.fire.dot, S.fire.duration, this); spawnElementBurst('fire', p); };
  } else if (elem === 'ice') {
    proj.onHit = (u, p) => { u.applySlow(S.ice.slowPct, S.ice.duration); spawnElementBurst('ice', p); };
  } else if (elem === 'lightning') {
    proj.onHit = (u, p) => {
      if (Math.random() < S.lightning.stunChance) {
        u.freezeT = Math.max(u.freezeT, S.lightning.duration);
        u.freezeReason = 'druida';
      }
      spawnElementBurst('lightning', p);
    };
  } else if (elem === 'earth') {
    proj.knock += S.earth.knock;
    proj.onHit = (u, p) => { spawnElementBurst('earth', p); };
  }
  game.spawnProjectile(proj);
  return S.cooldown;
}

export function updateDruida(dt) {
  if (this.className !== 'druida' || !this.dru) return;
  const D = this.dru;
  const P = CFG.druida.passive;
  if (!D.bear.active && game.time - D.lastCombatT >= P.delay && this.hp < this.hpMax) {
    this.hp = Math.min(this.hp + P.regenPerSec * dt, this.hpMax);
  }
  D.a1cd = Math.max(0, D.a1cd - dt);
  D.a2cd = Math.max(0, D.a2cd - dt);
  if (D.roots) D.roots = D.roots.filter(r => r.alive);

  const R = CFG.druida.root;
  if (!D.bear.active && D.a1cd <= 0) {
    const cap = Math.ceil(this.level * R.limitFactor);
    const alive = D.roots.length;
    if (alive < cap) {
      const dir = V.fromAng(this.angle);
      const pos = this.pos.clone().add(dir.clone().mul(this.bodyR + R.bodyRadius + 4));
      const b = game.bounds;
      const r = R.bodyRadius;
      pos.x = clamp(pos.x, b.x + r, b.x + b.w - r);
      pos.y = clamp(pos.y, b.y + r, b.y + b.h - r);
      const root = new DruidRoot(this, pos, this.level);
      D.roots.push(root);
      game.spawnSummon && game.spawnSummon(root);
      D.a1cd = R.cooldown;
    }
  }

  const B = CFG.druida.bear;
  if (!D.bear.active) {
    if (D.a2cd <= 0) {
      let target = null, best = 1e9;
      for (const o of game.units) {
        if (!o.alive || o === this) continue;
        if (this.team && o.team && this.team === o.team) continue;
        const d = new V(o.pos.x - this.pos.x, o.pos.y - this.pos.y).len();
        if (d < best) { best = d; target = o; }
      }
      if (target && best < R.radius) {
        D.bear.saved = {
          hp: this.hp,
          hpMax: this.hpMax,
          bodyR: this.bodyR,
          hasRanged: this.hasRanged,
          weaponLen: this.weaponLen,
          weaponTipR: this.weaponTipR,
          weaponOffset: this.weaponOffset,
          burn: this.burn,
          slowT: this.slowT,
          slowPct: this.slowPct,
          freezeT: this.freezeT,
          freezeReason: this.freezeReason
        };
        this.hasRanged = false;
        this.weaponLen = 0;
        this.weaponTipR = 0;
        this.weaponOffset = 0;
        this.bodyR = D.bear.saved.bodyR * B.radiusMult;
        this.hpMax = B.hpBase;
        this.hp = B.hpBase;
        this.burn = null; this.slowT = 0; this.slowPct = 0; this.freezeT = 0; this.freezeReason = null;
        D.bear.active = true;
        spawnBearTransform(this.pos.clone());
        D.bear.t = B.duration;
        D.bear.hitCD = 0;
        D.a2cd = B.duration;
      }
    }
  } else {
    D.bear.t -= dt;
    D.bear.hitCD = Math.max(0, D.bear.hitCD - dt);
    let target = null, best = 1e9;
    for (const o of game.units) {
      if (!o.alive || o === this) continue;
      if (this.team && o.team && this.team === o.team) continue;
      const d = new V(o.pos.x - this.pos.x, o.pos.y - this.pos.y).len();
      if (d < best) { best = d; target = o; }
    }
    if (target) {
      const dir = new V(target.pos.x - this.pos.x, target.pos.y - this.pos.y).nrm();
      this.vel.add(dir.mul(CFG.engage.pullStrength * dt));
    }
    if (D.bear.t <= 0 || this.hp <= 0) {
      const s = D.bear.saved;
      if (s) {
        this.hp = s.hp;
        this.hpMax = s.hpMax;
        this.bodyR = s.bodyR;
        this.hasRanged = s.hasRanged;
        this.weaponLen = s.weaponLen;
        this.weaponTipR = s.weaponTipR;
        this.weaponOffset = s.weaponOffset;
        this.burn = s.burn;
        this.slowT = s.slowT;
        this.slowPct = s.slowPct;
        this.freezeT = s.freezeT;
        this.freezeReason = s.freezeReason;
      }
      D.bear.active = false;
      D.bear.t = 0;
      D.bear.saved = null;
      D.bear.hitCD = 0;
    }
  }
}

