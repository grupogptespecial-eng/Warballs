// Flecha disparada pelo Ranger ou outros efeitos

import { CFG } from '../config/cfg.js';
import { Projectile } from './projectile.js';

export class Arrow extends Projectile {
  constructor(owner, pos, dir, spec) {
    super(owner, pos, dir);
    this.color = CFG.ranger.arrow.color;
    this.rad = CFG.ranger.arrow.radius;
    this.speed = spec.speed;
    this.life = CFG.ranger.arrow.life;
    this.gravity = CFG.ranger.arrow.gravity;
    this.drag = CFG.ranger.arrow.drag;
    this.dmg = spec.dmg * (owner ? owner.dmgMult() : 1);
    this.penetration = !!spec.penetration;
    this.vel = dir.clone().mul(this.speed);
    this.visual = spec.visual || null;
    this.canHurtAllies = spec.canHurtAllies !== false;
  }

  stepMove(dt) {
    const drag = Math.max(0, 1 - this.drag * dt);
    this.vel.mul(drag);
    this.vel.y += this.gravity * dt;
    this.pos.add(this.vel.clone().mul(dt));
    this.dir = this.vel.clone().nrm();
  }

  draw(ctx) {
    // visual especial (warlock)
    if (this.visual === 'eldritch') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (this.trail.length > 1) {
        const g = ctx.createLinearGradient(this.trail[0].x, this.trail[0].y, this.pos.x, this.pos.y);
        g.addColorStop(0, 'rgba(201,167,255,0.0)');
        g.addColorStop(1, 'rgba(201,167,255,0.9)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (const p of this.trail) ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.shadowBlur = 14; ctx.shadowColor = this.color;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.rad + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    // visual especial (perfect shot)
      if (this.visual === 'perfect') {
        ctx.save();
        if (this.trail.length > 1) {
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#059669';
          ctx.beginPath();
          ctx.moveTo(this.trail[0].x, this.trail[0].y);
          for (const p of this.trail) ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        ctx.fillStyle = '#10b981';
        ctx.shadowBlur = 8; ctx.shadowColor = '#059669';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.rad + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }
    // padrão
    ctx.save();
    ctx.globalAlpha = .95;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (const p of this.trail) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.rad, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

