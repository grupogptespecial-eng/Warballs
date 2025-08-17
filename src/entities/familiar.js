// Familiar invocado pelo Bruxo

import { V } from '../math/vec.js';
import { CFG, CLASS_VISUALS, CLASS_ITEM_SCALE_DEFAULT, GLOBAL_ITEM_SCALE_MULT } from '../config/cfg.js';
import { randAng } from '../utils/rand.js';
import { clamp } from '../utils/misc.js';
import { Projectile } from './projectile.js';
import { drawRoundedRect } from '../utils/geometry.js';
import { drawItemSprite, applyMicroAnim } from '../render/visuals_module.js';
import { game } from '../core/game.js';

export class Familiar {
  constructor(owner) {
    this.kind = 'familiar';
    this.owner = owner;
    this.team = owner.team;
    this.pos = owner.pos.clone();
    this.vel = V.fromAng(randAng(), 60);
    this.bodyR = CFG.bruxo.familiar.bodyR;
    this.color = CFG.bruxo.familiar.color;
    this.mass = 1;
    this.hpMax = CFG.bruxo.familiar.hpBase + CFG.bruxo.familiar.hpPerLevel * (owner.level - 1);
    this.hp = this.hpMax;
    this.alive = true;
    this.fireCD = 0;
    this.level = owner.level;
  }

  canDamage(other) {
    return !(this.team && other.team && this.team === other.team);
  }

  hit(amount, impulse, attacker) {
    if (!this.alive) return 0;
    const before = this.hp;
    this.hp = clamp(this.hp - amount, 0, this.hpMax);
    const dealt = before - this.hp;
    this.vel.add(impulse.clone().mul(1 / this.mass));
    if (this.hp <= 0) {
      this.alive = false;
      game.onFamiliarDeath?.(this);
    }
    return dealt;
  }

  update(dt, arena, units) {
    const toOwner = new V(this.owner.pos.x - this.pos.x, this.owner.pos.y - this.pos.y);
    if (toOwner.len() > 1e-3) this.vel.add(toOwner.nrm().mul(80 * dt));

    let best = null, bestD = 1e9;
    for (const u of units) {
      if (!u.alive) continue;
      if (this.team && u.team && this.team === u.team) continue;
      const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
      if (d < bestD) { bestD = d; best = u; }
    }

    this.fireCD -= dt;
    if (this.fireCD <= 0 && best) {
      this.fireCD = CFG.bruxo.familiar.fireCD;
      const dir = new V(best.pos.x - this.pos.x, best.pos.y - this.pos.y).nrm();
      const b = CFG.bruxo.familiar.bullet;
      const proj = new Projectile(this.owner, this.pos.clone().add(dir.clone().mul(this.bodyR + 6)), dir);
      proj.speed = b.speed; proj.life = b.life; proj.rad = b.rad;
      proj.dmg = b.dmg * (this.owner ? this.owner.dmgMult() : 1);
      proj.knock = b.knock; proj.color = b.color;
      game.spawnProjectile(proj);
    }

    this.vel.mul(CFG.physics.friction);
    this.pos.add(this.vel.clone().mul(dt));
    if (this.pos.x < arena.x + this.bodyR) { this.pos.x = arena.x + this.bodyR; this.vel.x = Math.abs(this.vel.x); }
    if (this.pos.x > arena.x + arena.w - this.bodyR) { this.pos.x = arena.x + arena.w - this.bodyR; this.vel.x = -Math.abs(this.vel.x); }
    if (this.pos.y < arena.y + this.bodyR) { this.pos.y = arena.y + this.bodyR; this.vel.y = Math.abs(this.vel.y); }
    if (this.pos.y > arena.y + arena.h - this.bodyR) { this.pos.y = arena.y + arena.h - this.bodyR; this.vel.y = -Math.abs(this.vel.y); }
    this.level = this.owner.level;
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10; ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.bodyR * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // chifres do familiar usando configuração do Bruxo
    const vis = CLASS_VISUALS.bruxo;
    if (vis?.items) {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      for (const ic of vis.items) {
        const pal = ic.palette || vis.palette || [];
        const ang = (ic.anchorDeg ?? 0) * Math.PI / 180;
        const dist = this.bodyR * (ic.distanceFromCenter ?? 0);
        const rot = (ic.internalRotation ?? 0) * Math.PI / 180;
        const scale = (ic.scale ?? CLASS_ITEM_SCALE_DEFAULT) * (this.bodyR * 2) * GLOBAL_ITEM_SCALE_MULT;
        ctx.save();
        ctx.translate(this.pos.x + Math.cos(ang) * dist, this.pos.y + Math.sin(ang) * dist);
        ctx.rotate(ang + rot);
        if (ic.flipX) ctx.scale(-1, 1);
        applyMicroAnim(ctx, ic.microAnim, now);
        drawItemSprite(ctx, ic.item, scale, pal, now);
        ctx.restore();
      }
    }

    const w = 36, h = 4, x = this.pos.x - w / 2, y = this.pos.y - this.bodyR - 10;
    drawRoundedRect(ctx, x, y, w, h, 3);
    ctx.fillStyle = 'rgba(8,12,18,.8)';
    ctx.fill();
    drawRoundedRect(ctx, x, y, w * (this.hp / this.hpMax), h, 3);
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, '#cbb5ff');
    g.addColorStop(1, '#9d7fff');
    ctx.fillStyle = g;
    ctx.fill();

    const yLvl = y - 2;
    ctx.save();
    ctx.font = '700 12px system-ui,Segoe UI,Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeText(String(this.level), this.pos.x, yLvl);
    ctx.shadowBlur = 4;
    ctx.shadowColor = this.color;
    ctx.fillStyle = '#e6edf7';
    ctx.fillText(String(this.level), this.pos.x, yLvl);
    ctx.restore();
  }
}

