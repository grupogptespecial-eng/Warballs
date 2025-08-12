// Lógica específica da classe Bárbaro

import { V } from '../math/vec.js';
import { CFG } from '../config/cfg.js';
import { _seg5 } from '../utils/misc.js';

export function barbHP(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return 180 + 14 * a + 16 * b + 18 * c + 20 * d;
}
export function barbTip(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return 18 + 2 * a + 3 * b + 3 * c + 4 * d;
}
export function barbKnock(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return 420 + 10 * a + 12 * b + 14 * c + 16 * d;
}
export function barbOmega(L) {
  const drop = Math.floor(Math.max(0, L - 5) / 5);
  return 3.0 - 0.1 * drop;
}
export function barbApplyPassiveDamage(unit, base) {
  const missing = 1 - (unit.hp / unit.hpMax);
  const bonus = Math.min(0.45, Math.max(0, Math.pow(missing, 1.4) * 0.45));
  return base * (1 + bonus);
}

export function tryInvestida(dt) {
  if (this.className !== 'barbaro') return;
  if (this.dashCD > 0 || this.isDashing) return;
  const P = CFG.barbaro.dash; const t = this.nearestEnemyWithinCone(P.detectR, P.coneDeg);
  if (!t) return;
  this.isDashing = true; this.dashT = 0; this.firstImpactDash = true; this.dashTarget = t; this.dashCD = P.cd;
}

export function updateInvestida(dt) {
  if (this.className !== 'barbaro' || !this.isDashing) return;
  const P = CFG.barbaro.dash; this.dashT += dt;
  if (this.dashT > P.time) { this.isDashing = false; return; }
  let dir;
  if (this.dashTarget && this.dashTarget.alive) {
    dir = new V(this.dashTarget.pos.x - this.pos.x, this.dashTarget.pos.y - this.pos.y).nrm();
  } else {
    dir = new V(Math.cos(this.angle), Math.sin(this.angle));
  }
  this.vel.add(dir.mul(P.accel * dt));
}

export function tryUrro(dt) {
  if (this.className !== 'barbaro') return;
  if (this.urroCD > 0 || this.urroT > 0) return;
  const R = CFG.barbaro.roar; let many = 0;
  for (const o of game.units) {
    if (!o.alive || o === this) continue;
    if (this.team && o.team && this.team === o.team) continue;
    const d = new V(o.pos.x - this.pos.x, o.pos.y - this.pos.y).len();
    if (d <= R.threatR) many++;
  }
  const low = (this.hp / this.hpMax) < 0.35;
  if (many >= R.need || low) { this.urroT = R.duration; this.urroCD = R.cd; }
}

