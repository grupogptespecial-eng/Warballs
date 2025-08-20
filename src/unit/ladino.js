// Lógica da classe Ladino

import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { game } from '../core/game.js';
import { projApproaching } from '../utils/geometry.js';
import { spawnRollFx, spawnStealthFx } from '../vfx/ladino_vfx.js';

export function initLadinoState() {
  return {
    rollT: 0,
    rollCD: 0,
    stealth: null,
    stealthCD: 0,
    shadowInvulnT: 0
  };
}

export function updateLadino(dt) {
  if (this.className !== 'ladino') return;
  const S = this.lad;
  if (!S) return;
  if (S.rollCD > 0) S.rollCD -= dt;
  if (S.stealthCD > 0) S.stealthCD -= dt;
  if (S.rollT > 0) S.rollT -= dt;
  if (S.shadowInvulnT > 0) S.shadowInvulnT -= dt;
  if (S.rollT <= 0 && S.shadowInvulnT <= 0) this.invuln = false;
  if (S.rollT <= 0 && S.shadowInvulnT <= 0 && S.rollCD <= 0) {
    const R = CFG.ladino.roll;
    // Desvio contra projéteis
    for (const p of game.projectiles) {
      if (!p.alive) continue;
      if (p.owner && this.team && p.owner.team && this.team === p.owner.team) continue;
      if (!projApproaching(p, this)) continue;
      const toU = new V(this.pos.x - p.pos.x, this.pos.y - p.pos.y);
      const dist = toU.len();
      const tti = dist / (p.speed || 1);
      if (tti > (R.ttiProjectile || 0.25)) continue;
      const side = new V(-p.dir.y, p.dir.x);
      if (side.dot(toU) < 0) side.mul(-1);
      tryLadinoRoll.call(this, side.nrm());
      break;
    }
    // Desvio contra armas
    if (S.rollT <= 0 && S.shadowInvulnT <= 0) {
      const range = (R.weaponRange || 100);
      for (const u of game.units) {
        if (!u.alive || u === this) continue;
        if (this.team && u.team && this.team === u.team) continue;
        if (!u.weaponSweepHitsCircle) continue;
        const toU = new V(this.pos.x - u.pos.x, this.pos.y - u.pos.y);
        if (toU.len() > range) continue;
        if (!u.weaponSweepHitsCircle(this.pos, this.bodyR + (u.weaponTipR || 0))) continue;
        let dir;
        if (u.prevTip) {
          dir = new V(u.tip().x - u.prevTip.x, u.tip().y - u.prevTip.y);
        }
        if (!dir || dir.len() === 0) dir = new V(Math.cos(u.angle), Math.sin(u.angle));
        tryLadinoRoll.call(this, dir.nrm());
        break;
      }
    }
  }

  const P = CFG.ladino.stealthAtk;
  if (S.stealth) {
    const tgt = S.stealth.target;
    if (!tgt || !tgt.alive || tgt.className === 'monge' || tgt.className === 'ladino' ||
      (tgt.className === 'druida' && tgt.dru?.bear.active)) {
      S.stealth = null;
    } else {
      const facing = V.fromAng(tgt.angle);
      const toLadino = new V(this.pos.x - tgt.pos.x, this.pos.y - tgt.pos.y);
      const backDot = -Math.cos(Math.PI / 3);
      if (toLadino.clone().nrm().dot(facing) >= backDot) {
        S.stealth = null;
      } else {
        const backPos = tgt.pos.clone().add(V.fromAng(tgt.angle + Math.PI, tgt.bodyR + this.bodyR + 4));
        const dir = backPos.sub(this.pos);
        const dist = dir.len();
        if (dist > P.range || toLadino.len() > P.range) {
          S.stealth = null;
        } else if (dist < 4) {
          S.stealth = null;
          this.vel.mul(0);
        } else {
          dir.nrm();
          this.vel = dir.mul(P.speed);
          this.angle = dir.ang();
        }
      }
    }
  } else if (S.stealthCD <= 0) {
    tryStealthAttack.call(this);
  }
}

export function tryLadinoRoll(dir) {
  if (this.className !== 'ladino') return;
  const S = this.lad;
  if (!S || S.rollCD > 0) return;
  const R = CFG.ladino.roll;
  const d = (dir ? dir.clone().nrm() : V.fromAng(this.angle));
  this.pos.add(d.clone().mul(R.distance));
  this.vel = d.mul(R.speed);
  this.invuln = true;
  S.rollT = R.invuln;
  S.rollCD = R.cd;
  spawnRollFx(this.pos);
}

export function tryStealthAttack() {
  if (this.className !== 'ladino') return;
  const S = this.lad;
  if (!S || S.stealthCD > 0) return;
  const P = CFG.ladino.stealthAtk;
  const backDot = -Math.cos(Math.PI / 3);
  let best = P.range;
  let target = null;
  for (const u of game.units) {
    if (!u.alive || u === this) continue;
    if (!this.canDamage(u)) continue;
    if (u.className === 'monge' || u.className === 'ladino' || (u.className === 'druida' && u.dru?.bear.active)) continue;
    const toLadino = new V(this.pos.x - u.pos.x, this.pos.y - u.pos.y);
    const dist = toLadino.len();
    if (dist > P.range) continue;
    const facing = V.fromAng(u.angle);
    if (toLadino.clone().nrm().dot(facing) < backDot && dist < best) {
      best = dist;
      target = u;
    }
  }
  if (target) {
    S.stealth = { target };
    S.stealthCD = P.cost;
    spawnStealthFx(this.pos);
  }
}
