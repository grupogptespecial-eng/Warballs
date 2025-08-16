// DruidRoot entity: stationary nodule that pulls enemies toward it

import { V } from '../math/vec.js';
import { CFG } from '../config/cfg.js';
import { spawnRootBurst } from '../vfx/druida_vfx.js';

// Simple nodule used by Druida's root ability
export class DruidRoot {
  constructor(owner, pos, level = 1) {
    this.owner = owner;
    this.team = owner.team;
    this.pos = pos.clone();
    this.level = level;

    this.kind = 'druidRoot';
    this.alive = true;
    this.bodyR = CFG.druida.root.bodyRadius || 18; // small core

    // gameplay
    this.radius = CFG.druida.root.radius; // detection radius
    this.pullSpeed = CFG.druida.root.pullSpeed; // attraction strength (px/s^2)
    this.dmgCenter = CFG.druida.root.dmgCenter;
    this.dmgEscape = CFG.druida.root.dmgEscape;

    this.target = null; // current pulled enemy

    // simple XP tracking so owner can level this nodule if needed
    this.xp = 0;
  }

  // external XP gain when owner hits enemies
  gainXP(x) {
    this.xp += x;
  }

  // used to remove the nodule manually
  remove() {
    this.alive = false;
  }

  update(dt, arena, units) {
    if (!this.alive) return;

    // remove if outside arena bounds
    if (arena) {
      const inside = this.pos.x >= arena.x && this.pos.x <= arena.x + arena.w &&
                     this.pos.y >= arena.y && this.pos.y <= arena.y + arena.h;
      if (!inside) { this.alive = false; return; }
    }

    // pick a target if none
    if (!this.target || !this.target.alive) {
      this.target = null;
      for (const u of units) {
        if (!u.alive) continue;
        if (this.team && u.team && this.team === u.team) continue;
        const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y);
        if (d.len() <= this.radius + u.bodyR) { this.target = u; break; }
      }
    }

    if (this.target && this.target.alive) {
      const toTarget = new V(this.target.pos.x - this.pos.x, this.target.pos.y - this.pos.y);
      const dist = toTarget.len();

      // target left the area: heavy damage
      if (dist > this.radius + this.target.bodyR) {
        const dir = toTarget.nrm();
        this.target.hit(this.dmgEscape, dir.mul(0), this.owner);
        spawnRootBurst(this.pos.clone());
        this.target = null;
        return;
      }

      // pull target toward center
      const dirToRoot = new V(this.pos.x - this.target.pos.x, this.pos.y - this.target.pos.y).nrm();
      this.target.vel.add(dirToRoot.mul(this.pullSpeed * dt));

      // reached center?
      if (dist <= this.bodyR + this.target.bodyR) {
        // area damage
        for (const u of units) {
          if (!u.alive) continue;
          if (this.team && u.team && this.team === u.team) continue;
          const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y);
          if (d.len() <= 48 + u.bodyR) {
            u.hit(this.dmgCenter, dirToRoot.mul(0), this.owner);
          }
        }
        spawnRootBurst(this.pos.clone());
        this.target = null;
      }
    }
  }

  draw(ctx) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    // detection radius
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(34,197,94,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // core
    ctx.beginPath();
    ctx.arc(0, 0, this.bodyR, 0, Math.PI * 2);
    ctx.fillStyle = '#14532d';
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

