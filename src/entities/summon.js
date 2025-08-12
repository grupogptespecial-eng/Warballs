// Criatura invocada temporariamente (Forest Call)

import { V } from '../math/vec.js';
import { randAng } from '../utils/rand.js';

export class Summon {
  constructor(owner, pos, dmg, duration) {
    this.owner = owner;
    this.team = owner.team;
    this.pos = pos.clone();
    this.vel = V.fromAng(randAng(), 80);
    this.color = '#7cffb0';
    this.bodyR = 16;
    this.alive = true;
    this.life = duration;
    this.dmg = dmg;
    this.kind = 'forest';
  }

  update(dt, arena, units) {
    this.life -= dt;
    if (this.life <= 0) { this.alive = false; return; }
    let best = null, bestD = 1e9;
    for (const u of units) {
      if (!u.alive) continue;
      if (this.owner.team && u.team && this.owner.team === u.team) continue;
      const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
      if (d < bestD) { bestD = d; best = u; }
    }
    if (best) {
      const dir = new V(best.pos.x - this.pos.x, best.pos.y - this.pos.y).nrm();
      this.vel.add(dir.mul(260 * dt));
      const spd = this.vel.len();
      if (spd > 400) this.vel.mul(400 / spd);
    }
    this.vel.mul(0.992);
    this.pos.add(this.vel.clone().mul(dt));
    if (this.pos.x < arena.x + this.bodyR) { this.pos.x = arena.x + this.bodyR; this.vel.x = Math.abs(this.vel.x); }
    if (this.pos.x > arena.x + arena.w - this.bodyR) { this.pos.x = arena.x + arena.w - this.bodyR; this.vel.x = -Math.abs(this.vel.x); }
    if (this.pos.y < arena.y + this.bodyR) { this.pos.y = arena.y + this.bodyR; this.vel.y = Math.abs(this.vel.y); }
    if (this.pos.y > arena.y + arena.h - this.bodyR) { this.pos.y = arena.y + arena.h - this.bodyR; this.vel.y = -Math.abs(this.vel.y); }
    if (best && new V(best.pos.x - this.pos.x, best.pos.y - this.pos.y).len() < best.bodyR + this.bodyR) {
      best.hit(this.dmg, new V(this.vel.x, this.vel.y), this.owner);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = .9;
    ctx.fillStyle = 'rgba(124,255,176,0.85)';
    ctx.shadowColor = '#7cffb0';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.bodyR * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

