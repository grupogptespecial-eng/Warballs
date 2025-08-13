// Proximity mine used by Artífice
import { V } from '../math/vec.js';
import { Effect } from './effect.js';
import { game } from '../core/game.js';

function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

export class Mine {
  constructor(owner, pos, cfg) {
    this.owner = owner;
    this.team = owner.team;
    this.pos = pos.clone();
    this.cfg = cfg;
    this.bodyR = cfg.bodyRadius || 8;
    this.kind = 'mine';

    this.armed = false;
    this.armT = cfg.armingTime;
    this.lifetime = cfg.lifetime;

    this.alive = true;
    this.disabled = false;
    this.disableT = 0;
  }

  update(dt, arena, units) {
    if (!this.alive) return;

    // lifetime countdown
    this.lifetime -= dt;
    if (this.lifetime <= 0) { this.alive = false; return; }

    // disabled mines fade out
    if (this.disabled) {
      this.disableT -= dt;
      if (this.disableT <= 0) this.alive = false;
      return;
    }

    // arena bounds policy
    if (arena) {
      const inside = this.pos.x >= arena.x && this.pos.x <= arena.x + arena.w &&
                     this.pos.y >= arena.y && this.pos.y <= arena.y + arena.h;
      if (!inside) {
        const policy = this.owner.art?.cfg?.arenaBRPolicy || 'despawn';
        if (policy === 'despawn') {
          this.alive = false;
          return;
        } else if (policy === 'pushInwards') {
          this.pos.x = clamp(this.pos.x, arena.x + this.bodyR, arena.x + arena.w - this.bodyR);
          this.pos.y = clamp(this.pos.y, arena.y + this.bodyR, arena.y + arena.h - this.bodyR);
        } else if (policy === 'disableOutside') {
          this.disabled = true;
          this.disableT = 3;
          return;
        }
      }
    }

    // arming
    if (!this.armed) {
      this.armT -= dt;
      if (this.armT <= 0) this.armed = true;
    }
    if (!this.armed) return;

    const triggerR = this.cfg.detectRadius * this.owner.bodyR;
    for (const u of units || game.units) {
      if (!u.alive) continue;
      if (!this.cfg.friendlyFire && u.team === this.team) continue;
      const d = Math.hypot(u.pos.x - this.pos.x, u.pos.y - this.pos.y);
      if (d <= triggerR + u.bodyR) {
        this.detonate();
        break;
      }
    }
  }

  hit(dmg, src) {
    if (!this.alive) return 0;
    if (this.cfg.hitToDetonate) this.detonate();
    else this.alive = false;
    return dmg;
  }

  detonate() {
    if (!this.alive) return;
    this.alive = false;
    const radius = this.cfg.detectRadius * this.owner.bodyR * 1.4;
    game.spawnEffect(new Effect(this.pos.clone(), radius, 0.4, this.cfg.mineColor || '#C54B4B'));

    for (const u of game.units) {
      if (!u.alive) continue;
      if (!this.cfg.friendlyFire && u.team === this.team) continue;
      const to = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y);
      const d = to.len();
      if (d <= radius + u.bodyR) {
        const knock = to.mul(1 / (d || 1)).mul(this.cfg.knockback * this.owner.bodyR);
        const dealt = u.hit(this.cfg.damage * this.owner.dmgMult(), knock, this.owner);
        if (dealt > 0) this.owner.gainXPOffense?.(dealt);
      }
    }

    if (this.cfg.chainAffectsMines) {
      for (const s of game.summons) {
        if (!s.alive || s === this || s.kind !== 'mine') continue;
        const d = Math.hypot(s.pos.x - this.pos.x, s.pos.y - this.pos.y);
        if (d <= radius + (s.bodyR || 0)) {
          s.detonate();
        }
      }
    }
  }

  draw(ctx) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.fillStyle = this.disabled ? '#777' : (this.cfg.mineColor || '#C54B4B');
    ctx.beginPath();
    ctx.rect(-this.bodyR, -this.bodyR, this.bodyR * 2, this.bodyR * 2);
    ctx.fill();
    ctx.restore();
  }
}
