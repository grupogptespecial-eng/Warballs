// Máquina de estados e disciplina do Guerreiro

import { V } from '../math/vec.js';
import { CFG } from '../config/cfg.js';
import { SpearProjectile } from '../entities/spear.js';
import { Particle } from '../entities/particle.js';
import { distPointToSegment } from '../utils/geometry.js';
import { randAng, rrand } from '../utils/rand.js';
import { game } from '../core/game.js';

function registerSwap(u, kind) {
  const D = CFG.guerreiro.discipline;
  const gw = u.gw;
  const now = game.time;
  if (gw.lastAttackType && gw.lastAttackType !== kind && now - gw.lastAttackTime <= D.swapWindow) {
    gw.disciplineReady = true;
    gw.disciplineExpire = now + D.bonusDurationMax;
  }
  gw.lastAttackType = kind;
  gw.lastAttackTime = now;
}

function startMelee(u, target) {
  const S = CFG.guerreiro.spear;
  u.gw.state = 'MELEE_STARTUP';
  u.gw.meleeT = 0;
  u.gw.meleeTarget = target;
   u.gw.meleeHit = false;
  registerSwap(u, 'MELEE');
  const ang = Math.atan2(target.pos.y - u.pos.y, target.pos.x - u.pos.x);
  let diff = Math.atan2(Math.sin(ang - u.angle), Math.cos(ang - u.angle));
  const maxSnap = S.aimSnapDeg * Math.PI / 180;
  if (Math.abs(diff) <= maxSnap) u.angle = ang;
}

function tickMelee(u, dt) {
  const S = CFG.guerreiro.spear;
  u.gw.meleeT += dt;
  if (u.gw.state === 'MELEE_STARTUP' && u.gw.meleeT >= S.meleeStartup) {
    u.gw.state = 'MELEE_ACTIVE';
  } else if (u.gw.state === 'MELEE_ACTIVE' && u.gw.meleeT >= S.meleeStartup + S.meleeActive) {
    u.gw.state = 'MELEE_RECOVER';
  } else if (u.gw.state === 'MELEE_RECOVER' && u.gw.meleeT >= S.meleeStartup + S.meleeActive + S.meleeRecover) {
    u.gw.state = 'IDLE';
    const mult = u.gw.stanceActive ? (1 - CFG.guerreiro.stance.atkRateBonus) : 1;
    u.gw.meleeCD = S.meleeCooldown * mult;
  }

  if (u.gw.state === 'MELEE_ACTIVE' && !u.gw.meleeHit) {
    const base = u.pos.clone();
    const tip = u.tip();
    for (const other of game.units) {
      if (!other.alive || other === u) continue;
      if (u.team && other.team && u.team === other.team) continue;
      const d = distPointToSegment(other.pos, base, tip);
      if (d < other.bodyR + u.weaponTipR) {
        let dmg = CFG.guerreiro.damage.meleeBase;
        const proj = ((other.pos.x - base.x) * Math.cos(u.angle) + (other.pos.y - base.y) * Math.sin(u.angle));
        if (proj > u.weaponLen * 0.8) dmg *= CFG.guerreiro.spear.tipBonus;
        if (u.gw.disciplineReady) {
          dmg *= 1 + CFG.guerreiro.discipline.nextHitBonus;
          u.gw.disciplineReady = false;
        }
        const dealt = other.hit(dmg, V.fromAng(u.angle, 220), u);
        if (dealt > 0) u.gainXPOffense(dealt);
        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(
            other.pos.clone(),
            V.fromAng(randAng(), rrand(50, 220)),
            rrand(.2, .6),
            '#e5e7eb'
          ));
        }
        u.gw.meleeHit = true;
        break;
      }
    }
  }
}

function startThrow(u, target) {
  const T = CFG.guerreiro.throw;
  const err = (T.precisionErrDeg + T.precisionErrPerLevel * (u.level - 1)) * Math.PI / 180;
  const ang = Math.atan2(target.pos.y - u.pos.y, target.pos.x - u.pos.x) + rrand(-err, err);
  const dir = new V(Math.cos(ang), Math.sin(ang));
  const p = u.tip().add(dir.clone().mul(u.weaponTipR + 2));
  const proj = new SpearProjectile(u, p, dir);
  game.spawnProjectile(proj);
  u.gw.thrown = proj;
  u.gw.state = 'THROW_FLIGHT';
  u.gw.throwT = 0;
  u.gw.throwCD = T.cooldown;
  registerSwap(u, 'RANGED');
}

function tickThrow(u, dt) {
  const T = CFG.guerreiro.throw;
  u.gw.throwT += dt;
  if (u.gw.state === 'THROW_FLIGHT') {
    if (!u.gw.thrown || !u.gw.thrown.alive || u.gw.throwT >= T.flightMaxTime) {
      if (u.gw.thrown) u.gw.thrown.alive = false;
      u.gw.state = 'IDLE';
    }
  }
}

export function updateGuerreiro(dt) {
  if (this.className !== 'guerreiro' || !this.gw) return;
  const gw = this.gw;
  const BR = CFG.body.radius;

  if (gw.meleeCD > 0) gw.meleeCD -= dt;
  if (gw.throwCD > 0) gw.throwCD -= dt;
  if (gw.aimT > 0) gw.aimT -= dt;
  if (gw.parryCD > 0) gw.parryCD -= dt;
  if (gw.disciplineReady && game.time > gw.disciplineExpire) gw.disciplineReady = false;

  if (gw.state === 'MELEE_STARTUP' || gw.state === 'MELEE_ACTIVE' || gw.state === 'MELEE_RECOVER') {
    tickMelee(this, dt);
    return;
  }
  if (gw.state === 'THROW_FLIGHT') {
    tickThrow(this, dt);
    return;
  }

  // Postura de guerra
  const ST = CFG.guerreiro.stance;
  let threat = false;
  for (const u of game.units) {
    if (!u.alive || u === this) continue;
    if (this.team && u.team && this.team === u.team) continue;
    const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
    if (d <= ST.threatRadius * BR) { threat = true; break; }
  }
  if (threat) {
    gw.stanceActive = true;
    gw.stanceGrace = ST.exitGrace;
    this.omega = gw.baseOmega * (1 + ST.atkRateBonus);
    this.knockResist = Math.min(ST.knockbackRedBase + (this.hpMax / 100) * ST.knockbackRedPer100HP, ST.knockbackRedMax);
  } else if (gw.stanceActive) {
    gw.stanceGrace -= dt;
    if (gw.stanceGrace <= 0) {
      gw.stanceActive = false;
      this.omega = gw.baseOmega;
      this.knockResist = 0;
    }
  }

  // Seleção de ataque
  let target = null, best = Infinity;
  for (const u of game.units) {
    if (!u.alive || u === this) continue;
    if (this.team && u.team && this.team === u.team) continue;
    const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
    if (d < best) { best = d; target = u; }
  }

  const meleeRange = CFG.guerreiro.spear.shaftLenFactor * BR;
  const minThrow = CFG.guerreiro.throw.minRange * BR;
  const maxThrow = CFG.guerreiro.throw.maxRange * BR;

  if (target && best <= meleeRange && gw.meleeCD <= 0) {
    startMelee(this, target);
  } else if (target && best >= minThrow && best <= maxThrow) {
    if (gw.throwCD <= 0) {
      if (gw.aimT <= 0) gw.aimT = CFG.guerreiro.throw.cooldown * CFG.guerreiro.throw.miraCondPercent;
      if (gw.aimT > 0 && this.enemyInLineOfSight()) {
        startThrow(this, target);
        gw.aimT = 0;
      } else {
        if (gw.aimT <= 0) {
          startThrow(this, target);
        }
      }
    }
  }
}

export function guerreiroParryAgainst(other) {
  if (this.className !== 'guerreiro' || !this.gw || this.gw.parryCD > 0) return false;
  if (!other || !other.weaponTipR || !other.weaponLen) return false;
  const P = CFG.guerreiro.maneuvers.parry;
  const t1 = this.tip();
  const t2 = other.tip();
  const dist = new V(t2.x - t1.x, t2.y - t1.y).len();
  if (dist >= this.weaponTipR + other.weaponTipR) return false;
  if (!this.canDamage(other)) return false;

  const toTip = new V(t2.x - this.pos.x, t2.y - this.pos.y);
  const n = toTip.clone().nrm();
  const t = new V(-n.y, n.x);

  other.weaponLockT = Math.max(other.weaponLockT || 0, P.lockT);
  other.vel.add(t.mul(P.tangent / other.mass));
  other.vel.add(n.mul(P.radial / other.mass));
  if (other.omega === 0) other.omega = (Math.random() < 0.5 ? 1 : -1) * 2.6;
  other.omega *= -0.8;

  this.gw.parryCD = P.disarmDuration;
  if (this.canDamage(other)) { this.gainXPWeaponClash(); other.gainXPWeaponClash(); }

  const mid = new V((t1.x + t2.x) / 2, (t1.y + t2.y) / 2);
  for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
    game.spawnParticle(new Particle(
      mid.clone(),
      V.fromAng(randAng(), rrand(60, 160)),
      rrand(.12, .3),
      '#e5e7eb'
    ));
  }
  return true;
}

