import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { game } from '../core/game.js';
import { drawRitmoAura } from '../render/visuals_module.js';

export class RitmoAura {
  constructor(owner) {
    const A = CFG.bardo.ritmo;
    this.owner = owner;
    this.radius = A.radius;
    this.t = A.duration;
    this.maxT = A.duration;
    this.alive = true;
    this.buffed = new Set();
  }

  update(dt) {
    const A = CFG.bardo.ritmo;
    this.t -= dt;
    if (!this.owner.alive) this.t = 0;
    for (const u of game.units) {
      if (!u.alive) continue;
      const sameTeam = (this.owner === u) || (this.owner.team && u.team && this.owner.team === u.team);
      if (!sameTeam) continue;
      const dist = new V(u.pos.x - this.owner.pos.x, u.pos.y - this.owner.pos.y).len();
      const inside = dist <= this.radius;
      const has = this.buffed.has(u);
      if (inside && !has) {
        this.buffed.add(u);
        u.ritmoAura = true;
        u.tempHP = Math.max(u.tempHP || 0, A.tempHP);
      } else if (!inside && has) {
        this.buffed.delete(u);
        u.ritmoAura = false;
        u.tempHP = 0;
        u.hp = Math.min(u.hp, u.hpMax);
      } else if (inside && has) {
        u.tempHP = Math.max(u.tempHP, A.tempHP);
      }
    }
    if (this.t <= 0) {
      for (const u of this.buffed) {
        u.ritmoAura = false;
        u.tempHP = 0;
        u.hp = Math.min(u.hp, u.hpMax);
      }
      this.buffed.clear();
      this.alive = false;
    }
  }

  draw(ctx) {
    drawRitmoAura(ctx, this);
  }
}
