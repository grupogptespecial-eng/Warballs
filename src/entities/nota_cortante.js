import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { Projectile } from './projectile.js';
import { drawCuttingNote } from '../render/visuals_module.js';

export class NotaCortante extends Projectile {
  constructor(owner, pos, dir) {
    super(owner, pos, dir);
    const C = CFG.bardo.cortante;
    this.speed = C.speed;
    this.life = C.life;
    this.rad = C.radius;
    this.dmg = C.dmg * (owner ? owner.dmgMult() : 1);
    this.knock = C.knock;
    this.penetration = true;
    this.pierce = C.pierce;
    this.color = '#E11D48';
    this._t = 0;
    this._off = 0;
  }

  stepMove(dt) {
    this._t += dt;
    const C = CFG.bardo.cortante;
    const forward = this.dir.clone().mul(this.speed * dt);
    const off = Math.sin(this._t * C.zigzagFreq) * C.zigzagAmp;
    const diff = off - this._off;
    this._off = off;
    const perp = new V(-this.dir.y, this.dir.x).mul(diff);
    this.pos.add(forward).add(perp);
  }
  
  update(dt, arena, units) {
    this.life -= dt;
    if (this.life <= 0) { this.alive = false; return; }
    this._t += dt;
    const C = CFG.bardo.cortante;
    const off = Math.sin(this._t * C.zigzagFreq) * C.zigzagAmp;
    const diff = off - this._off;
    this._off = off;
    const forward = this.dir.clone().mul(this.speed * dt);
    const perp = new V(-this.dir.y, this.dir.x).mul(diff);
    this.pos.add(forward).add(perp);
    if (this.pos.x < arena.x - this.rad || this.pos.x > arena.x + arena.w + this.rad ||
        this.pos.y < arena.y - this.rad || this.pos.y > arena.y + arena.h + this.rad) {
      this.alive = false; return;
    }
    for (const u of units) {
      if (!u.alive || u === this.owner) continue;
      const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
      if (d < u.bodyR + this.rad) {
        const dealt = u.hit(this.dmg, this.dir.clone().mul(this.knock), this.owner);
        if (dealt > 0 && this.owner) this.owner.gainXPOffense(dealt);
        this.pierce--;
        if (this.pierce < 0) { this.alive = false; break; }
      }
    }
    this.trail.push(this.pos.clone());
    if (this.trail.length > 6) this.trail.shift();
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (const p of this.trail) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(Math.atan2(this.dir.y, this.dir.x));
    drawCuttingNote(ctx, this.rad * 6, this.color);
    ctx.restore();
  }
}
