// Máquina de estados e disciplina do Guerreiro

import { V } from '../math/vec.js';
import { CFG } from '../config/cfg.js';
import { SpearProjectile } from '../entities/spear.js';
import { Particle } from '../entities/particle.js';
import { spawnSpearTrail } from '../vfx/spear_trail.js';
import {
  spawnAdvanceVFX,
  spawnDodgeVFX,
  spawnParryVFX
} from '../vfx/guerreiro_maneuver_vfx.js';
import { distPointToSegment, projApproaching } from '../utils/geometry.js';
import { randAng, rrand } from '../utils/rand.js';
import { game } from '../core/game.js';

function registerSwap(u, kind) {
  const D = CFG.guerreiro.discipline;
  const gw = u.gw;
  const now = game.time;
  if (gw.lastAttackType && gw.lastAttackType !== kind && now - gw.lastAttackTime <= D.swapWindow) {
    const max = Math.ceil(u.level / 2);
    gw.disciplineStacks = Math.min(max, (gw.disciplineStacks || 0) + 1);
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
        if (u.gw.disciplineReady && u.gw.disciplineStacks > 0) {
          dmg *= 1 + u.gw.disciplineStacks * CFG.guerreiro.discipline.nextHitBonus;
          u.gw.disciplineReady = false;
          u.gw.disciplineStacks = 0;
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
  for (let i = 0; i < 3; i++) spawnSpearTrail(p, dir);
  u.gw.thrown = proj;
  u.gw.state = 'THROW_FLIGHT';
  u.gw.throwT = 0;
  u.gw.throwCD = T.cooldown;
  u.weaponLen = 0;
  u.weaponTipR = 0;
  registerSwap(u, 'RANGED');
}

function tickThrow(u, dt) {
  const T = CFG.guerreiro.throw;
  u.gw.throwT += dt;
  if (u.gw.state === 'THROW_FLIGHT') {
    if (!u.gw.thrown || !u.gw.thrown.alive || u.gw.throwT >= T.flightMaxTime) {
      if (u.gw.thrown) u.gw.thrown.alive = false;
      u.gw.state = 'DISARMED';
      u.gw.disarmT = T.cooldown * 0.4;
      u.gw.stanceActive = false;
      u.omega = u.gw.baseOmega;
      u.knockResist = 0;
    }
  }
}

function triggerAdvance(u, target) {
  const A = CFG.guerreiro.maneuvers.advance;
  u.gw.state = 'ADVANCE';
  u.gw.advanceT = A.dashDuration;
  u.gw.advanceTarget = target;
  u.vel = V.fromAng(u.angle, A.dashSpeed);
  u.gw.maneuverCD = A.cooldown;
  spawnAdvanceVFX(u.pos.clone());
}

function tickAdvance(u, dt) {
  const A = CFG.guerreiro.maneuvers.advance;
  u.gw.advanceT -= dt;
  u.vel = V.fromAng(u.angle, A.dashSpeed);
  if (u.gw.advanceTarget) {
    const ang = Math.atan2(u.gw.advanceTarget.pos.y - u.pos.y, u.gw.advanceTarget.pos.x - u.pos.x);
    let diff = Math.atan2(Math.sin(ang - u.angle), Math.cos(ang - u.angle));
    if (Math.abs(diff) > A.connectAngleDeg * Math.PI / 180) {
      u.omega += Math.sign(diff) * A.angAccel * dt;
    }
  }
  if (u.gw.advanceT <= 0) {
    u.gw.state = 'IDLE';
    u.vel.mul(0);
    u.gw.advanceTarget = null;
  }
}

function triggerDodge(u, proj) {
  const D = CFG.guerreiro.maneuvers.dodge;
  const side = new V(-proj.dir.y, proj.dir.x);
  const toU = new V(u.pos.x - proj.pos.x, u.pos.y - proj.pos.y);
  if (side.dot(toU) < 0) side.mul(-1);
  const step = side.nrm().mul(D.sidestepDist * CFG.body.radius);
  u.pos.add(step);
  u.vel.mul(0);
  u.gw.maneuverCD = D.cooldown;
  spawnDodgeVFX(u.pos.clone());
}

export function updateGuerreiro(dt) {
  if (this.className !== 'guerreiro' || !this.gw) return;
  const gw = this.gw;
  const BR = CFG.body.radius;

  if (gw.meleeCD > 0) gw.meleeCD -= dt;
  if (gw.throwCD > 0) gw.throwCD -= dt;
  if (gw.disarmT > 0) gw.disarmT -= dt;
  if (gw.aimT > 0) gw.aimT -= dt;
  if (gw.maneuverCD > 0) gw.maneuverCD -= dt;
  if (gw.disciplineReady && game.time > gw.disciplineExpire) {
    gw.disciplineReady = false;
    gw.disciplineStacks = 0;
  }

  if (gw.state === 'MELEE_STARTUP' || gw.state === 'MELEE_ACTIVE' || gw.state === 'MELEE_RECOVER') {
    tickMelee(this, dt);
    return;
  }
  if (gw.state === 'ADVANCE') {
    tickAdvance(this, dt);
    return;
  }
  if (gw.state === 'THROW_FLIGHT') {
    tickThrow(this, dt);
    return;
  }
  if (gw.state === 'DISARMED') {
    if (gw.disarmT <= 0) {
      gw.state = 'IDLE';
      this.weaponLen = gw.baseWeaponLen;
      this.weaponTipR = gw.baseWeaponTipR;
    } else return;
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
    if (!gw.stanceActive) {
      for (let i = 0; i < 8; i++) {
        game.spawnParticle(new Particle(
          this.pos.clone(),
          V.fromAng(randAng(), rrand(80, 160)),
          rrand(.2, .4),
          '#fcd34d'
        ));
      }
    }
    gw.stanceActive = true;
    gw.stanceGrace = ST.exitGrace;
    this.omega = gw.baseOmega * 1.5;
    this.knockResist = Math.min(
      ST.knockbackRedBase + (this.hpMax / 100) * ST.knockbackRedPer100HP,
      ST.knockbackRedMax
    );
    if (gw.state === 'THROW_FLIGHT' && gw.thrown) {
      gw.thrown.alive = false;
      gw.thrown = null;
      gw.state = 'IDLE';
      gw.disarmT = 0;
      this.weaponLen = gw.baseWeaponLen;
      this.weaponTipR = gw.baseWeaponTipR;
    }
    gw.aimT = 0;
    gw.throwCD = CFG.guerreiro.throw.cooldown;
  } else if (gw.stanceActive) {
    gw.stanceGrace -= dt;
    if (gw.stanceGrace <= 0) {
      gw.stanceActive = false;
      this.omega = gw.baseOmega;
      this.knockResist = 0;
    }
  }

  // Desvio contra projéteis
  if (gw.maneuverCD <= 0 && gw.state === 'IDLE') {
    const D = CFG.guerreiro.maneuvers.dodge;
    for (const p of game.projectiles) {
      if (!p.alive) continue;
      if (p.owner && this.team && p.owner.team && this.team === p.owner.team) continue;
      if (!projApproaching(p, this)) continue;
      const toU = new V(this.pos.x - p.pos.x, this.pos.y - p.pos.y);
      const distBody = toU.len();
      const tti = distBody / (p.speed || 1);
      if (tti > D.ttiProjectile) continue;
      const tip = this.tip();
      const distTip = new V(tip.x - p.pos.x, tip.y - p.pos.y).len();
      if (distBody >= distTip) continue;
      triggerDodge(this, p);
      return;
    }
  }

  // Avanço Tático
  if (gw.maneuverCD <= 0) {
    const A = CFG.guerreiro.maneuvers.advance;
    let advTarget = null, advBest = Infinity;
    for (const u of game.units) {
      if (!u.alive || u === this) continue;
      if (this.team && u.team && this.team === u.team) continue;
      const to = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y);
      const dist = to.len();
      const ang = Math.atan2(to.y, to.x);
      const diff = Math.atan2(Math.sin(ang - this.angle), Math.cos(ang - this.angle));
      if (Math.abs(diff) > A.vulnerableFOVDeg * Math.PI / 180) continue;
      let vulnerable = u.state === 'DISARMED' || (u.weaponLockT || 0) > 0;
      if (!vulnerable && u.tip) {
        const tip = u.tip();
        const tipDist = new V(tip.x - this.pos.x, tip.y - this.pos.y).len();
        if (tipDist > dist) vulnerable = true;
      }
      if (vulnerable && dist < advBest) {
        advBest = dist;
        advTarget = u;
      }
    }
    if (advTarget) {
      triggerAdvance(this, advTarget);
      return;
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
  } else if (CFG.guerreiro.throw.enabled && target && best >= minThrow && best <= maxThrow) {
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
  if (this.className !== 'guerreiro' || !this.gw || this.gw.maneuverCD > 0) return false;
  if (this.gw.state === 'THROW_FLIGHT' || this.gw.state === 'DISARMED') return false;
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

  this.gw.maneuverCD = P.disarmDuration;
  startMelee(this, other);
  const S = CFG.guerreiro.spear;
  this.gw.meleeT = Math.max(0, S.meleeStartup - P.counterStartup);
  if (this.canDamage(other)) { this.gainXPWeaponClash(); other.gainXPWeaponClash(); }

  const mid = new V((t1.x + t2.x) / 2, (t1.y + t2.y) / 2);
  spawnParryVFX(mid);
  return true;
}

