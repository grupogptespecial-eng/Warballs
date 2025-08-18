// Lógica específica da classe Ranger

import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { Arrow } from '../entities/arrow.js';
import { Summon } from '../entities/summon.js';
import { Particle } from '../entities/particle.js';
import { randAng, rrand } from '../utils/rand.js';
import { game } from '../core/game.js';

export function rangerStats(level) {
  const L = Math.max(1, Math.min(level | 0, CFG.level.max));
  const cd = CFG.ranged.cooldown * (1 - 0.06 * Math.min(10, L - 1) / 10);
  const dmgBase = (10 + Math.floor((L - 1) * 1.2)) * 1.8 * 1.2 * 1.3;
  const numArrows = (L >= 12) ? 2 : 1;
  const spread = 0.18;
  const speed = CFG.ranger.arrow.baseSpeed + CFG.ranger.arrow.speedPerLevel * (L - 1);
  return { cd, numArrows, dmgBase, spread, speed };
}

export function rangerSpeedMult(level) {
  const t = Math.min(10, Math.max(1, level));
  return 1 + 0.167 * (t - 1) / 9;
}

export function fire() {
  if (this.className !== 'ranger') return;
  const stats = rangerStats(this.level);
  const baseDir = new V(Math.cos(this.angle), Math.sin(this.angle));
  const center = this.tip().add(baseDir.clone().mul(this.weaponTipR + 2));
  const passive = (this.stillT >= CFG.ranger.stillTime) ? CFG.ranger.passiveDmgMult : 1;
  const makeArrow = (offset) => {
    const dirAngle = this.angle + offset;
    const dir = new V(Math.cos(dirAngle), Math.sin(dirAngle));
    const spec = { speed: stats.speed, dmg: stats.dmgBase * passive, penetration: false };
    game.spawnProjectile(new Arrow(this, center.clone(), dir, spec));
  };
  if (stats.numArrows === 1) {
    makeArrow(0);
  } else if (stats.numArrows === 2) {
    const a = stats.spread * 0.5;
    makeArrow(-a);
    makeArrow(a);
  }
  return stats.cd;
}

export function castPerfectShot() {
  if (this.className !== 'ranger') return;
  const stats = rangerStats(this.level);
  const P = CFG.ranger.perfectShot || {};
  const spreadDeg = (P.spreadDeg != null ? P.spreadDeg : 8);
  const dmgMult   = (P.dmgMult   != null ? P.dmgMult   : 1.2);
  const speedMul  = (P.speedMul  != null ? P.speedMul  : 1.0);
  const spread = spreadDeg * Math.PI / 180;
  const passive = (this.stillT >= CFG.ranger.stillTime) ? CFG.ranger.passiveDmgMult : 1;
  const baseDir = new V(Math.cos(this.angle), Math.sin(this.angle));
  const origin  = this.tip().add(baseDir.clone().mul(this.weaponTipR + 3));
  const offsets = [0, -spread, +spread];
  for (const off of offsets) {
    const dir = new V(Math.cos(this.angle + off), Math.sin(this.angle + off));
    const spec = {
      speed: stats.speed * speedMul,
      dmg:   stats.dmgBase * passive * dmgMult,
      penetration: true,
      visual: 'perfect',
      canHurtAllies: false
    };
    const arr = new Arrow(this, origin.clone(), dir, spec);
    game.spawnProjectile(arr);
  }
}

export function castForestCall() {
  if (this.className !== 'ranger') return;
  const F = CFG.ranger.forestCall || {};
  const duration = F.duration != null ? F.duration : 6.0;
  const MAX = (F.maxActive != null ? F.maxActive : 3);
  let aliveMine = 0;
  for (const s of game.summons) {
    if (s.alive && s.kind === 'forest' && s.owner === this) aliveMine++;
  }
  let want = (F.minions && F.minions.base) ? F.minions.base : 1;
  if (F.minions) {
    if (this.level >= 3 && F.minions.lvl3 != null)      want = F.minions.lvl3;
    else if (this.level >= 2 && F.minions.lvl2 != null) want = F.minions.lvl2;
  }
  const spawnCount = Math.max(0, Math.min(want, MAX - aliveMine));
  if (spawnCount <= 0) return;
  const base = (F.dmgBase != null ? F.dmgBase : 10);
  const perL = (F.dmgPerLevelPct != null ? F.dmgPerLevelPct : 0.05);
  const minionDmg = base * (1 + perL * Math.max(0, this.level - 1)) * this.dmgMult();
  const R = Math.max(24, this.bodyR + 10);
  for (let i = 0; i < spawnCount; i++) {
    const ang = (i / spawnCount) * Math.PI * 2 + Math.random() * 0.3;
    const pos = new V(this.pos.x + Math.cos(ang) * R, this.pos.y + Math.sin(ang) * R);
    const s = new Summon(this, pos, minionDmg, duration);
    game.spawnSummon(s);
    for (let k = 0; k < 6; k++) {
      game.spawnParticle(new Particle(
        pos.clone(),
        V.fromAng(randAng(), rrand(60, 160)),
        rrand(.18, .4),
        '#a8ffcf'
      ));
    }
  }
}

