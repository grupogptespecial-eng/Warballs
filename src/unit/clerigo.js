// Lógica específica da classe Clérigo

import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { _seg5, clamp } from '../utils/misc.js';
import { randAng, rrand } from '../utils/rand.js';
import { distPointToSegment } from '../utils/geometry.js';
import { Particle } from '../entities/particle.js';
import { Projectile } from '../entities/projectile.js';
import { Effect } from '../entities/effect.js';

export function clericHP(level) {
  return CFG.clerigo.hpBase + CFG.clerigo.hpPerLevel * (Math.max(1, level) - 1);
}

export function clericTip(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return CFG.clerigo.tipBase + 2 * a + 3 * b + 3 * c + 4 * d;
}

export function clericKnock(L) {
  const a = _seg5(L, 0), b = _seg5(L, 5), c = _seg5(L, 10), d = Math.max(0, L - 15);
  return CFG.clerigo.knockBase + 16 * a + 18 * b + 20 * c + 24 * d;
}

// Passiva: Sacred Flame
export function clericPassiveTick(dt) {
  if (this.className !== 'clerigo') return;
  const P = CFG.clerigo.sacredFlame;
  this.clericFlameTimer = (this.clericFlameTimer ?? P.period) - dt;
  if (this.clericFlameTimer > 0) return;
  this.clericFlameTimer += P.period + (P.jitter ? rrand(-P.jitter, P.jitter) : 0);

  const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
  const p0 = this.tip().add(dir.clone().mul(this.weaponTipR + 2));

  for (let i = 0; i < 4; i++) {
    game.spawnParticle(new Particle(
      p0.clone(),
      V.fromAng(this.angle + rrand(-0.5, 0.5), rrand(60, 180)),
      rrand(0.08, 0.22),
      P.color
    ));
  }

  const pr = new Projectile(this, p0, dir);
  pr.speed = P.speed;
  pr.life = P.life;
  pr.rad = P.radius;
  pr.dmg = (P.dmgBase + P.dmgPerLevel * (this.level - 1)) * this.dmgMult();
  pr.knock = P.knock;
  pr.color = P.color;
  pr.penetration = false;
  game.spawnProjectile(pr);
}

// Sunbeam
export function clericStartBeam() {
  if (this.className !== 'clerigo') return;
  const B = CFG.clerigo.beam;
  this.beamT = B.dur;
  this._beamNext = 0;
  this.freezeT = B.dur;
  this.freezeReason = 'beam';
  this.vel.mul(0);
}

export function clericBeamTick(dt) {
  if (this.className !== 'clerigo' || this.beamT <= 0) return;
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

    for (let i = 0; i < 3; i++) {
      game.spawnParticle(new Particle(
        new V(a.x + Math.random() * (b.x - a.x), a.y + Math.random() * (b.y - a.y)),
        V.fromAng(randAng(), rrand(60, 160)),
        rrand(0.08, 0.22),
        B.color
      ));
    }
  }
}

// Rezo do Clérigo
export function castPrayer() {
  if (this.className !== 'clerigo') return;
  const P = CFG.clerigo.prayer;
  const pct = P.healPctBase + P.healPctPerLevel * (this.level - 1);

  game.spawnEffect(new Effect(this.pos.clone(), P.radius, 0.55, P.color));

  const selfHeal = this.hpMax * pct * P.selfBonus;
  this.hp = clamp(this.hp + selfHeal, 0, this.hpMax);

  for (let i = 0; i < 10; i++) {
    game.spawnParticle(new Particle(
      this.pos.clone(),
      V.fromAng(randAng(), rrand(80, 160)),
      rrand(0.25, 0.6),
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
      for (let k = 0; k < 6; k++) {
        game.spawnParticle(new Particle(
          u.pos.clone(),
          V.fromAng(randAng(), rrand(60, 140)),
          rrand(0.18, 0.42),
          P.color
        ));
      }
    }
  }
}

