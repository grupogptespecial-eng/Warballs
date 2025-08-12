// Lança arremessada pelo Guerreiro

import { CFG } from '../config/cfg.js';
import { shade } from '../utils/misc.js';
import { Projectile } from './projectile.js';

export class SpearProjectile extends Projectile {
  constructor(owner, pos, dir) {
    super(owner, pos, dir);
    const T = CFG.guerreiro.throw;
    const S = CFG.guerreiro.spear;
    this.speed = T.speed * CFG.body.radius;
    this.life = T.flightMaxTime;
    this.rad = S.shaftThickness * CFG.body.radius;
    this.dmg = CFG.guerreiro.damage.throwBase * (owner ? owner.dmgMult() : 1);
    this.knock = 260;
    this.color = '#e5e7eb';

    if (owner && owner.gw && owner.gw.disciplineReady) {
      this.dmg *= 1 + CFG.guerreiro.discipline.nextHitBonus;
      owner.gw.disciplineReady = false;
    }

    this.angle = Math.atan2(this.dir.y, this.dir.x);
    this.visual = 'spear';
  }

  stepMove(dt) {
    this.pos.add(this.dir.clone().mul(this.speed * dt));
    this.angle = Math.atan2(this.dir.y, this.dir.x);
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

