// Lança arremessada pelo Guerreiro

import { CFG } from '../config/cfg.js';
import { shade } from '../utils/misc.js';
import { distPointToSegment } from '../utils/geometry.js';
import { randAng, rrand } from '../utils/rand.js';
import { game } from '../core/game.js';
import { Particle } from './particle.js';
import { V } from '../math/vec.js';
import { Projectile } from './projectile.js';
import { spawnSpearTrail } from '../vfx/spear_trail.js';

export class SpearProjectile extends Projectile {
  constructor(owner, pos, dir) {
    super(owner, pos, dir);
    const T = CFG.guerreiro.throw;
    const S = CFG.guerreiro.spear;
    this.speed = T.speed * CFG.body.radius;
    this.life = T.flightMaxTime;
    this.rad = S.shaftThickness * CFG.body.radius;
    this.dmgBase = CFG.guerreiro.damage.throwBase * (owner ? owner.dmgMult() : 1);
    this.knock = 260;
    this.color = '#e5e7eb';
    this.len = S.shaftLenFactor * CFG.body.radius;
    this.angle = Math.atan2(this.dir.y, this.dir.x);
    this.visual = 'spear';
  }

  stepMove(dt) {
    this.pos.add(this.dir.clone().mul(this.speed * dt));
    this.angle = Math.atan2(this.dir.y, this.dir.x);
  }

  segment() {
    const tip = this.pos.clone();
    const tail = tip.clone().sub(this.dir.clone().mul(this.len));
    return { tip, tail };
  }

  update(dt, arena, units) {
    this.life -= dt;
    if (this.life <= 0) { this.alive = false; return; }
    this.stepMove(dt);
    spawnSpearTrail(this.pos.clone(), this.dir.clone());

    // fora da arena
    if (this.pos.x < arena.x - this.rad || this.pos.x > arena.x + arena.w + this.rad ||
        this.pos.y < arena.y - this.rad || this.pos.y > arena.y + arena.h + this.rad) {
      this.alive = false;
      return;
    }

    const { tip, tail } = this.segment();
    for (const u of units) {
      if (!u.alive || u === this.owner) continue;
      if (this.owner && u.team && this.owner.team && u.team === this.owner.team && !CFG.guerreiro.throw.friendlyFire) continue;
      const d = distPointToSegment(u.pos, tail, tip);
      if (d < u.bodyR + this.rad) {
        let dmg = this.dmgBase;
        const proj = ((u.pos.x - tail.x) * this.dir.x + (u.pos.y - tail.y) * this.dir.y);
        if (proj > this.len * 0.8) dmg *= CFG.guerreiro.spear.tipBonus;
        if (this.owner && this.owner.gw && this.owner.gw.disciplineReady) {
          dmg *= 1 + CFG.guerreiro.discipline.nextHitBonus;
          this.owner.gw.disciplineReady = false;
        }
        const dealt = u.hit(dmg, this.dir.clone().mul(this.knock), this.owner);
        if (dealt > 0) {
          game.onDamage(dealt);
          if (this.owner) this.owner.gainXPOffense(dealt);
        }
        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(
            u.pos.clone(),
            V.fromAng(randAng(), rrand(50, 220)),
            rrand(.2, .6),
            this.color
          ));
        }
        this.alive = false;
        break;
      }
    }
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
    ctx.lineTo(this.rad - 4, 6);
    ctx.closePath();
    ctx.fillStyle = '#e5e7eb';
    ctx.fill();

    ctx.restore();
  }
}

