import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { clamp } from '../utils/misc.js';
import { game } from '../core/game.js';
import { drawBardNote } from '../render/visuals_module.js';
import { Effect } from './effect.js';
import { Particle } from './particle.js';
import { rrand } from '../utils/rand.js';

export class NoteProjectile {
  constructor(owner, pos, dir, target) {
    const N = CFG.bardo.note;
    this.owner = owner;
    this.pos = pos.clone();
    this.dir = dir.clone().nrm();
    this.speed = N.speed;
    this.life = N.life;
    this.rad = N.radius;
    this.dmg = N.dmg * (owner ? owner.dmgMult() : 1);
    this.knock = N.knock;
    this.alive = true;
    this.trail = [];
    this.colors = ['#7F3EF3','#8be9fd','#1e40af','#34d399'];
    this.colorIndex = 0;
    this._t = 0;
    this.target = target;
    this.track = N.track;
  }

  update(dt, arena, units) {
    this.life -= dt;
    if (this.life <= 0) { this.alive = false; return; }
    if (this.target && this.target.alive) {
      const desired = this.target.pos.clone().sub(this.pos).nrm();
      this.dir.mul(1 - this.track * dt).add(desired.mul(this.track * dt)).nrm();
    }
    this.pos.add(this.dir.clone().mul(this.speed * dt));
    if (this.pos.x < arena.x - this.rad || this.pos.x > arena.x + arena.w + this.rad ||
        this.pos.y < arena.y - this.rad || this.pos.y > arena.y + arena.h + this.rad) {
      this.alive = false; return;
    }
    for (const u of units) {
      if (!u.alive || u === this.owner) continue;
      const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
      if (d < u.bodyR + this.rad) {
        const N = CFG.bardo.note;
        if (this.owner.team && u.team && this.owner.team === u.team) {
          u.hp = clamp(u.hp + N.heal, 0, u.hpMax);
          u.bardBuffT = N.duration;
        } else {
          const dealt = u.hit(this.dmg, this.dir.clone().mul(this.knock), this.owner);
          if (dealt > 0 && this.owner) this.owner.gainXPOffense(dealt);
          u.bardDebuffT = N.duration;
        }
        const cols = this.colors;
        const col = cols[this.colorIndex];
        game.spawnEffect(new Effect(this.pos.clone(), 16, 0.3, col));
        for (const c of cols) {
          const dir = V.fromAng(Math.random() * Math.PI * 2, rrand(40, 120));
          game.spawnParticle(new Particle(this.pos.clone(), dir, 0.25, c));
        }
        if (this.owner && this.owner.bardInspire) this.owner.bardInspire();
        this.alive = false;
        break;
      }
    }
    this._t += dt;
    if (this._t > 0.1) { this._t -= 0.1; this.colorIndex = (this.colorIndex + 1) % this.colors.length; }
    this.trail.push({ pos: this.pos.clone(), color: this.colors[this.colorIndex] });
    if (this.trail.length > 6) this.trail.shift();
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 2;
    for (let i = 1; i < this.trail.length; i++) {
      ctx.strokeStyle = this.trail[i-1].color;
      ctx.beginPath();
      ctx.moveTo(this.trail[i-1].pos.x, this.trail[i-1].pos.y);
      ctx.lineTo(this.trail[i].pos.x, this.trail[i].pos.y);
      ctx.stroke();
    }
    ctx.translate(this.pos.x, this.pos.y);
    drawBardNote(ctx, this.rad*6, this.colors[this.colorIndex]);
    ctx.restore();
  }
}
