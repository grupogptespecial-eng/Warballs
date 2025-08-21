import { Particle } from '../entities/particle.js';
import { V } from '../math/vec.js';
import { randAng, rrand } from '../utils/rand.js';
import { game } from '../core/game.js';

class CritText {
  constructor(pos) {
    this.pos = pos.clone();
    this.life = 0.6;
    this.alive = true;
  }
  update(dt) {
    this.life -= dt;
    this.pos.y -= 30 * dt;
    if (this.life <= 0) this.alive = false;
  }
  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / 0.6);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRIT!', this.pos.x, this.pos.y);
    ctx.restore();
  }
}

class CritBurst {
  constructor(pos) {
    this.pos = pos.clone();
    this.life = 0.2;
    this.alive = true;
  }
  update(dt) {
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }
  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.globalAlpha = Math.max(0, this.life / 0.2);
    const r = 20 * (1 - this.life / 0.2);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.pos.x - r, this.pos.y);
    ctx.lineTo(this.pos.x + r, this.pos.y);
    ctx.moveTo(this.pos.x, this.pos.y - r);
    ctx.lineTo(this.pos.x, this.pos.y + r);
    ctx.stroke();
    ctx.restore();
  }
}

export function spawnCritFx(pos) {
  for (let i = 0; i < 8; i++) {
    game.spawnParticle(new Particle(
      pos.clone(),
      V.fromAng(randAng(), rrand(80, 160)),
      rrand(0.3, 0.6),
      '#facc15'
    ));
  }
  game.spawnEffect(new CritBurst(pos));
  game.spawnEffect(new CritText(pos));
}
