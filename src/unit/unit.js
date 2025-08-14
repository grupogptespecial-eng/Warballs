import { CFG, CLASSES, CLASS_VISUALS, CLASS_ITEM_SCALE_DEFAULT, GLOBAL_ITEM_SCALE_MULT, LEVEL_SAFE_RADIUS_MULT } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { clamp, shade } from '../utils/misc.js';
import { randAng, rrand } from '../utils/rand.js';
import { drawRoundedRect, distPointToSegment } from '../utils/geometry.js';
import { Particle } from '../entities/particle.js';
import { Effect } from '../entities/effect.js';
import { Projectile } from '../entities/projectile.js';
import { game } from '../core/game.js';
import { drawItemSprite, drawWeaponForUnit, applyMicroAnim, ITEM_ALIASES } from '../render/visuals_module.js';

import {
  makeMonkState,
  monkHP,
  monkBodyDamage,
  monkVMinBonus,
  monkVMaxBonus,
  monkConeRad,
  monkScaledDamage,
  monkOnHitDealt,
  monkNaturalAccel,
  monkImpactBurst,
  monkApplyPassive,
  monkSeek,
  monkFlurryTick,
  monkEndFlurry,
  monkTryRajada,
  monkTryDeflect,
  monkParryAgainst
} from './monge.js';

import {
  barbHP,
  barbTip,
  barbKnock,
  barbOmega,
  barbApplyPassiveDamage,
  tryInvestida,
  updateInvestida,
  tryUrro
} from './barbaro.js';

import {
  rangerSpeedMult,
  fire as rangerFire,
  castPerfectShot,
  castForestCall
} from './ranger.js';

import {
  palStats,
  palHP,
  castPalHeal,
  trySacredStrike
} from './paladino.js';

import {
  clericHP,
  clericTip,
  clericKnock,
  clericPassiveTick,
  clericStartBeam,
  clericBeamTick,
  castPrayer
} from './clerigo.js';

import {
  fire as bruxoFire,
  castHex,
  castFamiliar
} from './bruxo.js';

import {
  updateGuerreiro,
  guerreiroParryAgainst
} from './guerreiro.js';

import {
  makeArtificeState,
  updateArtifice,
  fireCannon as artificeFire,
  castTurret,
  castMine,
  artificeTookDamage
} from './artifice.js';

// Busca o inimigo vivo mais próximo de uma unidade
export function nearestEnemyOf(self) {
  let best = null, bestD = 1e9;
  for (const o of game.units) {
    if (!o.alive || o === self) continue;
    if (self.team && o.team && self.team === o.team) continue;
    const d = new V(o.pos.x - self.pos.x, o.pos.y - self.pos.y).len();
    if (d < bestD) { bestD = d; best = o; }
  }
  return best;
}

export class Unit {
  constructor(id, pos, color) {
    this.id = id;
    this.pos = pos.clone();
    this.vel = V.fromAng(randAng(), CFG.physics.initImpulse);
    this.color = color;

    this.bodyR = CFG.body.radius;
    this.mass = CFG.body.mass;

    this.baseHP = CFG.body.baseHP;
    this.hpMax = this.baseHP;
    this.hp = this.hpMax;
    this.alive = true;
    this.deadHandled = false;

    this.weaponLen = CFG.weapon.length;
    this.weaponTipR = CFG.weapon.tipRadius;
    this.omega = CFG.weapon.omega * (Math.random() < 0.5 ? -1 : 1);
    this.angle = randAng();

    this.hasRanged = false;
    this.cooldownMiraPercent = 0;
    this.cdAim = 0;
    this.lastShotCD = CFG.ranged.cooldown;
    this.cd = this.lastShotCD;
    this.a1cd = CFG.ranger.perfectShot.cd;
    this.a2cd = CFG.ranger.forestCall.cd;

    this.level = 1;
    this.xp = 0;
    this.team = null;
    this.className = 'ranger';

    this.idleT = 0;
    this.stillT = 0;
    this.speedMult = 1.0;

    this.palShieldT = 0;
    this.palShieldCD = 0;
    this.palHealCD = 0;

    this.clericFlameCD = 0;
    this.beamT = 0;
    this.clericFlameTimer = 0;
    this._beamNext = 0;

    this.weaponLockT = 0;
    this._lastDT = 0;
    this.hex = null;

    // Estado interno do Monge
    this.freezeT = 0;
    this.freezeReason = null;
    this.monk = makeMonkState();

    // Estado interno do Guerreiro
    this.gw = null;
  }

  // === Inicialização e progressão ===
  applyClassDefaults() {
    this.hasRanged = !!CLASSES[this.className]?.hasRanged;
    this.cooldownMiraPercent = CLASSES[this.className]?.cooldownMiraPercent || 0;
    if (this.className === 'ranger') {
      this.baseHP = CFG.ranger.hpBase;
      this.hpMax = this.baseHP;
      this.hp = this.hpMax;
      this.speedMult = rangerSpeedMult(this.level);

    } else if (this.className === 'barbaro') {
      this.hpMax = barbHP(this.level);
      this.hp = this.hpMax;
      this.baseHP = this.hpMax;
      this.omega = barbOmega(this.level) * (Math.random() < 0.5 ? -1 : 1);
      this.isDashing = false;
      this.dashT = 0;
      this.dashCD = 0;
      this.firstImpactDash = false;
      this.dashTarget = null;
      this.urroT = 0;
      this.urroCD = 0;
      this.weaponLen = 40;
      this.weaponTipR = 11;

    } else if (this.className === 'paladino') {
      this.baseHP = palHP(1);
      this.hpMax = palHP(this.level);
      this.hp = this.hpMax;

    } else if (this.className === 'monge') {
      this.hpMax = monkHP(this.level);
      this.baseHP = this.hpMax;
      this.hp = this.hpMax;
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
      this.baseHP = CFG.bruxo.hpBase;
      this.hpMax = this.baseHP;
      this.hp = this.hpMax;
      this.brxHexCD = 0;
      this.brxFamCD = 0;
      this.familiarRef = null;
      this.hexTarget = null;
      this.hexT = 0;

    } else if (this.className === 'artifice') {
      this.baseHP = CFG.body.baseHP;
      this.hpMax = this.baseHP;
      this.hp = this.hpMax;
      this.art = makeArtificeState();
      this.a1cd = 0;
      this.a2cd = 0;

    } else if (this.className === 'guerreiro') {
        this.baseHP = CFG.guerreiro.hpBase;
        this.hpMax = this.baseHP;
        this.hp = this.hpMax;
        const S = CFG.guerreiro.spear;
        this.weaponLen = S.shaftLenFactor * CFG.body.radius;
        this.weaponTipR = S.shaftThickness * CFG.body.radius;
        this.gw = {
          state: 'IDLE',
          meleeCD: 0,
          throwCD: 0,
          disarmT: 0,
          aimT: 0,
          maneuverCD: 0,
          lastAttackType: null,
          lastAttackTime: 0,
          disciplineReady: false,
          disciplineExpire: 0,
          disciplineStacks: 0,
          stanceActive: false,
          stanceGrace: 0,
          baseOmega: this.omega,
          baseWeaponLen: this.weaponLen,
          baseWeaponTipR: this.weaponTipR
        };
      }
  }

  xpCost() { return CFG.xp.cost(this.level); }

  addXP(amount) {
    if (this.level >= CFG.level.max) return 0;
    this.xp += amount;
    let ups = 0;
    while (this.level < CFG.level.max && this.xp >= this.xpCost()) {
      this.xp -= this.xpCost();
      this.levelUp();
      ups++;
    }
    return ups;
  }

  levelUp() {
    const ratio = this.hp / this.hpMax;
    this.level++;
    if (this.className === 'ranger') {
      this.hpMax = CFG.ranger.hpBase + CFG.ranger.hpPerLevel * (this.level - 1);
      this.hp = clamp(Math.round(this.hpMax * ratio), 1, this.hpMax);
      this.speedMult = rangerSpeedMult(this.level);
    } else if (this.className === 'barbaro') {
      this.hpMax = barbHP(this.level);
      this.hp = clamp(Math.round(this.hpMax * ratio), 1, this.hpMax);
      const sign = this.omega >= 0 ? 1 : -1;
      this.omega = barbOmega(this.level) * sign;
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

  // === Combate e XP ===
  dmgMult() {
    let baseMult = 1 + (this.level - 1) * CFG.level.dmgPerLevelPct;
    if (this.className === 'monge' && CFG.monge.dmgMult) {
      baseMult *= CFG.monge.dmgMult;
    }
    return baseMult;
  }

  gainXPDefense() { this.addXP(CFG.xp.gain.hitTaken); }
  gainXPWeaponClash() { this.addXP(CFG.xp.gain.weaponClash); }
  gainXPOffense(dmg) {
    const v = CFG.xp.gain.hitDealtBase + dmg * CFG.xp.gain.hitDealtPerDmg;
    this.addXP(Math.round(v));
  }
  gainXPKill() { this.addXP(CFG.xp.gain.kill); }

  canDamage(other) {
    return !(this.team && other.team && this.team === other.team);
  }

  hit(amount, impulse, attacker) {
    if (!this.alive) return 0;
    if (this.className === 'paladino' && this.palShieldT > 0 && attacker && attacker !== this && attacker.canDamage(this)) {
      this.palShieldT = 0;
      const dir = new V(attacker.pos.x - this.pos.x, attacker.pos.y - this.pos.y).nrm();
      attacker.vel.add(dir.mul(CFG.paladino.shield.knockForce));
      return 0;
    }
    let amountMod = amount;
    let impulseMod = impulse;
    if (this.hex && this.hex.t > 0) {
      amountMod *= CFG.bruxo.hex.dmgMult;
    }
    if (this.className === 'barbaro' && this.urroT > 0) {
      amountMod *= CFG.barbaro.roar.dmgReduce;
      impulseMod = new V(0, 0);
    }
    const before = this.hp;
    if (attacker && !attacker.canDamage(this)) return 0;
    this.hp = clamp(this.hp - amountMod, 0, this.hpMax);
    const dealt = before - this.hp;
    this.vel.add(impulseMod.clone().mul(1 / this.mass));
    if (this.className === 'artifice' && dealt > 0) this.artificeTookDamage();
    if (attacker && attacker !== this && attacker.canDamage(this)) this.gainXPDefense();
    if (this.hp <= 0 && !this.deadHandled) {
      this.alive = false;
      this.deadHandled = true;
      if (attacker && attacker.canDamage(this)) attacker.gainXPKill();
      game.onDeath(this);
    }
    return dealt;
  }

  // === Física e colisão ===
  tip() {
    return new V(
      this.pos.x + Math.cos(this.angle) * (this.bodyR + this.weaponLen),
      this.pos.y + Math.sin(this.angle) * (this.bodyR + this.weaponLen)
    );
  }

  enemyInLineOfSight(range) {
    let r = range;
    if (r == null) {
      if (this.className === 'ranger') {
        const A = CFG.ranger.arrow;
        const speed = A.baseSpeed + A.speedPerLevel * (this.level - 1);
        r = speed * A.life;
      } else if (this.className === 'bruxo') {
        const B = CFG.bruxo.blast;
        r = B.speed * B.life;
      } else if (this.className === 'guerreiro') {
        const T = CFG.guerreiro.throw;
        r = (T.speed * CFG.body.radius) * T.flightMaxTime;
      } else {
        r = CFG.ranged.speed * CFG.ranged.life;
      }
    }
    const tip = this.tip();
    const end = new V(
      tip.x + Math.cos(this.angle) * r,
      tip.y + Math.sin(this.angle) * r
    );
    for (const u of game.units) {
      if (!u.alive || u === this) continue;
      if (this.team && u.team && this.team === u.team) continue;
      const d = distPointToSegment(u.pos, tip, end);
      if (d < u.bodyR) return true;
    }
    return false;
  }

  ensureSpeed() {
    if (this.className === 'monge') {
      const vMin = game.getVMin() + monkVMinBonus(this.level);
      const vMax = CFG.physics.vMax + monkVMaxBonus(this.level);
      const spd = this.vel.len();
      if (spd < vMin) {
        if (spd < 1e-3) this.vel = V.fromAng(randAng(), vMin); else this.vel.mul(vMin / (spd || 1));
      }
      if (spd > vMax) { this.vel.mul(vMax / spd); }
      return;
    }
    const v = this.vel.len();
    const vMin = game.getVMin() * this.speedMult;
    if (v < vMin) {
      if (v < 1e-3) this.vel = V.fromAng(randAng(), vMin); else this.vel.mul(vMin / v);
    }
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
        if (this.monk.stacks > 0)
          this.monk.stacksExpire = performance.now() / 1000 + CFG.monge.stacks.time / this.monk.stacks;
      }
      if (this.monk.rajadaT > 0) this.monk.rajadaT = Math.max(0, this.monk.rajadaT - dt);
      if (this.monk.deflectT > 0) this.monk.deflectT = Math.max(0, this.monk.deflectT - dt);
    }

    // Clérigo
    if (this.className === 'clerigo') {
      this.clericPassiveTick(dt);
      this.a1cd -= dt;
      this.a2cd -= dt;
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

    // Guerreiro
    if (this.className === 'guerreiro') {
      this.updateGuerreiro(dt);
    }

    // Artífice
    if (this.className === 'artifice') {
      this.updateArtifice(dt);
      if (this.art.a1cd <= 0) this.castTurret();
      if (this.art.a2cd <= 0) this.castMine();
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
    if (this.hasRanged) {
      if (this.cd > 0) {
        this.cd -= dt;
        if (this.cd <= 0) {
          this.cd = 0;
          this.cdAim = this.lastShotCD * this.cooldownMiraPercent;
        }
      } else {
        if (this.cdAim > 0) {
          this.cdAim -= dt;
          if (this.enemyInLineOfSight()) {
            const next = this.fire();
            this.lastShotCD = next != null ? next : CFG.ranged.cooldown;
            this.cd = this.lastShotCD;
            this.cdAim = 0;
          } else if (this.cdAim <= 0) {
            const next = this.fire();
            this.lastShotCD = next != null ? next : CFG.ranged.cooldown;
            this.cd = this.lastShotCD;
          }
        } else {
          this.cdAim = this.lastShotCD * this.cooldownMiraPercent;
          if (this.cdAim <= 0) {
            const next = this.fire();
            this.lastShotCD = next != null ? next : CFG.ranged.cooldown;
            this.cd = this.lastShotCD;
          }
        }
      }
    }
    if (this.className === 'ranger') {
      this.a1cd -= dt;
      this.a2cd -= dt;
      if (this.a1cd <= 0) { this.castPerfectShot(); this.a1cd = CFG.ranger.perfectShot.cd; }
      if (this.a2cd <= 0) { this.castForestCall(); this.a2cd = CFG.ranger.forestCall.cd; }
    }
    if (this.className === 'barbaro') {
      this.tryInvestida(dt);
      this.updateInvestida(dt);
      this.tryUrro(dt);
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
          if (!u.alive || u === this) continue;
          if (this.team && u.team && this.team === u.team) continue;
          const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
          if (d < threatR) { nearby++; if (nearby >= 1) break; }
        }
        if (nearby >= 1 || (this.hp / this.hpMax) < 0.5) {
          this.palShieldT = CFG.paladino.shield.dur;
          this.palShieldCD = st.shieldCD;
          game.spawnEffect(new Effect(this.pos.clone(), this.bodyR + 12, 0.3, '#fff8c2'));
        }
      }
      if (this.palHealCD > 0) this.palHealCD -= dt;
      if (this.palHealCD <= 0) { this.castPalHeal(); this.palHealCD = st.healCD; }
    }
    if (this.vel.len() < CFG.engage.idleSpeed) this.idleT += dt; else this.idleT = 0;
  }

  collide(other) {
    if (this.freezeT > 0 || other.freezeT > 0) return;

    // Corpo a corpo
    const d = other.pos.clone().sub(this.pos);
    const dist = d.len();
    const minDist = this.bodyR + other.bodyR;
    if (dist > 0 && dist < minDist) {
      const n = d.clone().mul(1 / dist);
      const preThisSpeed = this.vel.len();
      const preOtherSpeed = other.vel.len();

      // separação
      const overlap = minDist - dist;
      this.pos.add(n.clone().mul(-overlap * 0.5));
      other.pos.add(n.clone().mul(overlap * 0.5));

      // impulso de separação
      const rel = other.vel.clone().sub(this.vel);
      const sep = rel.dot(n);
      if (sep < 0) {
        const j = (-(1 + CFG.physics.restitution) * sep) / (1 / this.mass + 1 / other.mass);
        const imp = n.clone().mul(j);
        this.vel.sub(imp.clone().mul(1 / this.mass));
        other.vel.add(imp.clone().mul(1 / other.mass));
      }

      // Dano de corpo do Monge (this)
      if (this.className === 'monge' && this.canDamage(other)) {
        const inFlurry = !!(this.monk && this.monk.rajadaT > 0);
        const speedOK = inFlurry || (preThisSpeed > 90);
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

      // Dano de corpo do Monge (other)
      if (other.className === 'monge' && other.canDamage(this)) {
        const inFlurry = !!(other.monk && other.monk.rajadaT > 0);
        const speedOK = inFlurry || (preOtherSpeed > 90);
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

    // Parry do Monge
    let parried = false;
    if (this.className === 'monge') parried = this.monkParryAgainst(other) || parried;
    if (other.className === 'monge') parried = other.monkParryAgainst(this) || parried;

    // Colisão arma (this) vs corpo (other)
    const t1 = this.tip();
    const t2 = other.tip();
    {
      const d1 = new V(other.pos.x - t1.x, other.pos.y - t1.y).len();
      const warriorThisMeleeBlocked =
        (this.className === 'guerreiro' && this.gw && this.gw.state !== 'MELEE_ACTIVE');
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
        else if (this.className === 'guerreiro') tipBase = CFG.guerreiro.damage.meleeBase;
        else                                     tipBase = CFG.engage.tipDamageBase;
        let dmg = tipBase * this.dmgMult();
        if (this.className === 'barbaro') dmg = barbApplyPassiveDamage(this, dmg);
        if (this.className === 'guerreiro' && this.gw && this.gw.disciplineReady && this.gw.disciplineStacks > 0) {
          dmg *= 1 + this.gw.disciplineStacks * CFG.guerreiro.discipline.nextHitBonus;
          this.gw.disciplineReady = false;
          this.gw.disciplineStacks = 0;
        }
        let knockMag =
            (this.className === 'barbaro') ? barbKnock(this.level)
          : (this.className === 'clerigo') ? clericKnock(this.level)
          : 380;
        if (this.className === 'barbaro' && this.isDashing && this.firstImpactDash) {
          dmg *= CFG.barbaro.dash.dmgBonus;
          knockMag = knockMag * CFG.barbaro.dash.knockBonus;
          this.isDashing = false;
          this.firstImpactDash = false;
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
            rrand(0.2, 0.6),
            this.color
          ));
        }
      }
    }

    // Colisão arma (other) vs corpo (this)
    {
      const d2 = new V(this.pos.x - t2.x, this.pos.y - t2.y).len();
      const warriorOtherMeleeBlocked =
        (other.className === 'guerreiro' && other.gw && other.gw.state !== 'MELEE_ACTIVE');
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
        else if (other.className === 'guerreiro') tipBase = CFG.guerreiro.damage.meleeBase;
        else                                      tipBase = CFG.engage.tipDamageBase;
        let dmg = tipBase * other.dmgMult();
        if (other.className === 'barbaro') dmg = barbApplyPassiveDamage(other, dmg);
        if (other.className === 'guerreiro' && other.gw && other.gw.disciplineReady && other.gw.disciplineStacks > 0) {
          dmg *= 1 + other.gw.disciplineStacks * CFG.guerreiro.discipline.nextHitBonus;
          other.gw.disciplineReady = false;
          other.gw.disciplineStacks = 0;
        }
        let knockMag =
            (other.className === 'barbaro') ? barbKnock(other.level)
          : (other.className === 'clerigo') ? clericKnock(other.level)
          : 380;
        if (other.className === 'barbaro' && other.isDashing && other.firstImpactDash) {
          dmg *= CFG.barbaro.dash.dmgBonus;
          knockMag = knockMag * CFG.barbaro.dash.knockBonus;
          other.isDashing = false;
          other.firstImpactDash = false;
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
            rrand(0.2, 0.6),
            other.color
          ));
        }
      }
    }

    // Colisão arma vs arma (inclui Parry do Guerreiro)
    const tipDist = new V(t2.x - t1.x, t2.y - t1.y).len();
    if (tipDist < this.weaponTipR + other.weaponTipR) {
      let handled = false;
      if (this.className === 'guerreiro') handled = this.guerreiroParryAgainst(other) || handled;
      if (other.className === 'guerreiro') handled = other.guerreiroParryAgainst(this) || handled;
      if (handled) return;

      this.vel.mul(CFG.physics.boostWeaponWeapon);
      other.vel.mul(CFG.physics.boostWeaponWeapon);
      let s1 = this.vel.len(); if (s1 > CFG.physics.vMax) this.vel.mul(CFG.physics.vMax / s1);
      let s2 = other.vel.len(); if (s2 > CFG.physics.vMax) other.vel.mul(CFG.physics.vMax / s2);
      this.omega *= -1;
      other.omega *= -1;
      if (this.canDamage(other)) {
        this.gainXPWeaponClash();
        other.gainXPWeaponClash();
      }
      if (this.className === 'monge') this.monkImpactBurst('clash');
      if (other.className === 'monge') other.monkImpactBurst('clash');
      for (let i = 0; i < 6; i++) {
        game.spawnParticle(new Particle(
          new V((t1.x + t2.x) / 2, (t1.y + t2.y) / 2),
          V.fromAng(rrand(0, Math.PI * 2), rrand(30, 150)),
          rrand(0.15, 0.45),
          '#9aa6c1'
        ));
      }
    }
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
      const ang = Math.acos(cos) * 180 / Math.PI;
      if (ang <= coneDeg * 0.5 && d < bestD) { best = o; bestD = d; }
    }
    return best;
  }

  fire() {
    if (this.className === 'ranger') return rangerFire.call(this);
    if (this.className === 'bruxo') return bruxoFire.call(this);
    if (this.className === 'artifice') return artificeFire.call(this);
    const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
    const p = this.tip().add(dir.clone().mul(this.weaponTipR + 2));
    game.spawnProjectile(new Projectile(this, p, dir));
    return CFG.ranged.cooldown;
  }

  // === Desenho ===
  drawBars(ctx) {
    const w = 54, h = 6, pad = 2;
    const x = this.pos.x - w / 2;
    const y = this.pos.y - this.bodyR - 16;
    drawRoundedRect(ctx, x, y, w, h, 3);
    ctx.fillStyle = 'rgba(8,12,18,0.85)';
    ctx.fill();
    const hpw = w * (this.hp / this.hpMax);
    drawRoundedRect(ctx, x, y, hpw, h, 3);
    const hpGrad = ctx.createLinearGradient(x, y, x + w, y);
    hpGrad.addColorStop(0, '#7eed90');
    hpGrad.addColorStop(1, '#37d86b');
    ctx.fillStyle = hpGrad;
    ctx.fill();
    const y2 = y + h + pad;
    drawRoundedRect(ctx, x, y2, w, h - 2, 3);
    ctx.fillStyle = 'rgba(8,12,18,0.85)';
    ctx.fill();
    const r = (this.level >= CFG.level.max) ? 1 : (this.xp / this.xpCost());
    drawRoundedRect(ctx, x, y2, w * r, h - 2, 3);
    const xpGrad = ctx.createLinearGradient(x, y2, x + w, y2);
    xpGrad.addColorStop(0, '#96d8ff');
    xpGrad.addColorStop(1, '#3ab2ff');
    ctx.fillStyle = xpGrad;
    ctx.fill();
  }

  drawLevel(ctx) {
    ctx.save();
    ctx.font = '700 14px system-ui,Segoe UI,Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.strokeText(String(this.level), this.pos.x, this.pos.y);
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = '#e6edf7';
    ctx.fillText(String(this.level), this.pos.x, this.pos.y);
    ctx.restore();
  }

  drawClassItem(ctx) {
    const cfg = CLASS_VISUALS[this.className];
    if (!cfg) return;

    const now = performance.now();
    const pal = cfg.palette || [];
    const itemId = cfg.item;
    if (itemId === 'chifres_duplos' || itemId === 'colar_monge' || ITEM_ALIASES[itemId] === 'saia_barbaro') {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      applyMicroAnim(ctx, cfg.microAnim, now);
      const scale = (cfg.scale ?? CLASS_ITEM_SCALE_DEFAULT) * (this.bodyR * 2) * GLOBAL_ITEM_SCALE_MULT;
      drawItemSprite(ctx, itemId, scale, pal, now);
      ctx.restore();
      return;
    }

    const anchor = (cfg.anchorAngleDeg || 0) * Math.PI / 180;
    const safeR = LEVEL_SAFE_RADIUS_MULT * this.bodyR;
    let dist = this.bodyR * 0.82;
    if (dist < safeR) dist = safeR;
    const x = this.pos.x + Math.cos(anchor) * dist;
    const y = this.pos.y + Math.sin(anchor) * dist;
    const scale = (cfg.scale ?? CLASS_ITEM_SCALE_DEFAULT) * (this.bodyR * 2) * GLOBAL_ITEM_SCALE_MULT;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(anchor);
    applyMicroAnim(ctx, cfg.microAnim, now);
    drawItemSprite(ctx, itemId, scale, pal, now);
    ctx.restore();
  }

  draw(ctx) {
    if (this.className === 'barbaro') {
      if (this.urroT > 0) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bodyR + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (this.isDashing) {
        ctx.save();
        ctx.globalAlpha = 0.20;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bodyR + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    if (this.className === 'paladino' && this.palShieldT > 0) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#fff8c2';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.bodyR + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (this.className === 'monge' && this.monk && this.monk.deflectT > 0) {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = 'rgba(200,230,255,0.9)';
      ctx.lineWidth = 3;
      const a = monkConeRad(CFG.monge.deflect.coneDeg);
      const r = CFG.monge.deflect.rHit;
      ctx.beginPath();
      ctx.arc(0, 0, r, -a, +a);
      ctx.stroke();
      ctx.restore();
    }
    if (this.className === 'monge' && this.monk && this.monk.stacks > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.5, 0.08 * this.monk.stacks);
      ctx.strokeStyle = 'rgba(160,210,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.bodyR + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.className === 'clerigo' && this.beamT > 0) {
      const t = this.tip();
      const len = CFG.clerigo.beam.range;
      ctx.save();
      ctx.strokeStyle = CFG.clerigo.beam.color;
      ctx.lineWidth = CFG.clerigo.beam.width;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(t.x + Math.cos(this.angle) * len, t.y + Math.sin(this.angle) * len);
      ctx.stroke();
      ctx.restore();
    }

    if (this.hex && this.hex.t > 0) {
      const t = (performance.now() / 1000);
      const r = this.bodyR + 8;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = CFG.bruxo.hex.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, r, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = t * 2 + i * Math.PI / 2;
        const px = this.pos.x + Math.cos(a) * r;
        const py = this.pos.y + Math.sin(a) * r;
        ctx.beginPath();
        ctx.moveTo(px + 3, py);
        ctx.lineTo(px, py + 3);
        ctx.lineTo(px - 3, py);
        ctx.lineTo(px, py - 3);
        ctx.closePath();
        ctx.fillStyle = CFG.bruxo.hex.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
      }
      ctx.restore();
    }

    if (this.className === 'guerreiro' && this.gw && this.gw.stanceActive) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.bodyR + 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    const base = this.color;
    const outlineCol = shade(base, -0.70);
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.bodyR, 0, Math.PI * 2);
    ctx.fillStyle = base;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = outlineCol;
    ctx.stroke();
    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    ctx.arc(this.pos.x - this.bodyR * 0.35, this.pos.y - this.bodyR * 0.35, this.bodyR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.globalAlpha = 1;

    // Desenha itens visuais sutis da classe antes das armas
    this.drawClassItem(ctx);

    const cfg = CLASS_VISUALS[this.className];
    const skipWeapon = this.className === 'guerreiro' && this.gw &&
      (this.gw.state === 'THROW_FLIGHT' || this.gw.state === 'DISARMED');
    if (!skipWeapon) {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      const ang = this.angle + (((cfg && cfg.weaponAngleDeg) || 30) * Math.PI / 180);
      ctx.rotate(ang);
      const wScale = this.bodyR * 1.2 * ((cfg && cfg.weaponScale) || 1);
      const wOff = this.bodyR * ((cfg && cfg.weaponOffsetMult) || 0.9);
      ctx.translate(wOff, 0);
      drawWeaponForUnit(ctx, this, wScale);
      ctx.restore();
    }
    if (game.debugHit) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(game.bounds.x + 1, game.bounds.y + 1, game.bounds.w - 2, game.bounds.h - 2);
    }
    ctx.restore();

    this.drawBars(ctx);
    this.drawLevel(ctx);
  }
}

Object.assign(Unit.prototype, {
  monkOnHitDealt,
  monkNaturalAccel,
  monkImpactBurst,
  monkApplyPassive,
  monkSeek,
  monkFlurryTick,
  monkEndFlurry,
  monkTryRajada,
  monkTryDeflect,
  monkParryAgainst,
  tryInvestida,
  updateInvestida,
  tryUrro,
  castPalHeal,
  trySacredStrike,
  castPerfectShot,
  castForestCall,
  clericPassiveTick,
  clericStartBeam,
  clericBeamTick,
  castPrayer,
  castHex,
  castFamiliar,
  updateGuerreiro,
  guerreiroParryAgainst,
  castTurret,
  castMine,
  updateArtifice,
  artificeTookDamage
});

