// DruidRoot entity: stationary nodule that pulls enemies toward it

import { V } from '../math/vec.js';
import { CFG } from '../config/cfg.js';
import { spawnRootBurst } from '../vfx/druida_vfx.js';
import { drawRoundedRect } from '../utils/geometry.js';

const rootImg = (typeof Image !== 'undefined') ? new Image() : { complete: false };
if (rootImg.src !== undefined) rootImg.src = 'assets/druida_root.svg';

// Simple nodule used by Druida's root ability
export class DruidRoot {
  constructor(owner, pos, startLevel = 1) {
    this.owner = owner;
    this.team = owner.team;
    this.pos = pos.clone();

    this.kind = 'druidRoot';
    this.alive = true;
    this.bodyR = CFG.druida.root.bodyRadius || 18; // small core

    // gameplay
    this.radius = CFG.druida.root.radius; // detection radius
    this.pullSpeed = CFG.druida.root.pullSpeed; // attraction strength (px/s^2)

    // stats
    this.level = 1;
    this.maxHP = CFG.druida.root.baseHP;
    this.hp = this.maxHP;
    this.pulseDmg = CFG.druida.root.pulse.dmg;
    this.pulseRadius = CFG.druida.root.pulse.radius;
    this.pulseCD = CFG.druida.root.pulse.interval;
    this.vineDps = CFG.druida.root.vineDps || 0;

    // current pulled enemy
    this.target = null;

    // XP tracking
    this.xp = 0;
    for (let i = 1; i < startLevel; i++) this.levelUp();
  }

  // external XP gain when owner hits enemies
  gainXP(x) {
    this.xp += x;
    while (this.xp >= this.xpToLevel(this.level)) {
      this.levelUp();
    }
  }

  xpToLevel(level) {
    const arr = CFG.druida.root.xpToLevel || [];
    if (level - 1 < arr.length) return arr[level - 1];
    const last = arr[arr.length - 1] || 0;
    const inc = arr.length >= 2 ? arr[arr.length - 1] - arr[arr.length - 2] : last;
    return last + inc * (level - arr.length);
  }

  levelUp() {
    this.level++;
    const per = CFG.druida.root.perLevel || {};
    if (per.hp) this.maxHP += per.hp[this.level - 1] || 0;
    if (per.pulseDmg) this.pulseDmg += per.pulseDmg[this.level - 1] || 0;
    if (per.vineDps) this.vineDps += per.vineDps[this.level - 1] || 0;
    this.hp = Math.min(this.maxHP, this.hp + this.maxHP * 0.2);
  }

  // used to remove the nodule manually
  remove() { this.alive = false; }

  hit(dmg, attacker) {
    if (!this.alive) return 0;
    const before = this.hp;
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) this.alive = false;
    return before - this.hp;
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
      if (dist > this.radius + this.target.bodyR) {
        // Target escaped; nodule takes the penalty instead
        this.hit(CFG.druida.root.escapeDmg, this.target);
        spawnRootBurst(this.pos.clone());
        this.target = null;
      } else {
        // pull target toward center
        const dirToRoot = new V(this.pos.x - this.target.pos.x, this.pos.y - this.target.pos.y).nrm();
        const pull = this.pullSpeed * (1 + 0.5 * (this.level - 1));
        this.target.vel.add(dirToRoot.mul(pull * dt));

        // continuous vine damage based on nodule level
        const dmg = this.vineDps * dt;
        if (dmg > 0) this.target.hit(dmg, new V(0, 0), this.owner);

        if (dist <= this.bodyR + this.target.bodyR) this.target = null;
      }
    }

    // periodic pulse damage
    this.pulseCD -= dt;
    if (this.pulseCD <= 0) {
      this.pulseCD += CFG.druida.root.pulse.interval;
      for (const u of units) {
        if (!u.alive) continue;
        if (this.team && u.team && this.team === u.team) continue;
        const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y);
        if (d.len() <= this.pulseRadius + u.bodyR) {
          u.hit(this.pulseDmg, new V(0, 0), this.owner);
        }
      }
      spawnRootBurst(this.pos.clone());
    }
  }

  draw(ctx) {
    if (!ctx) return;

    // vine to target
    if (this.target && this.target.alive) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.pos.x, this.pos.y);
      ctx.lineTo(this.target.pos.x, this.target.pos.y);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    // detection radius
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(34,197,94,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // core image
    const size = this.bodyR * 2;
    if (rootImg && rootImg.complete) {
      ctx.drawImage(rootImg, -size / 2, -size / 2, size, size);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.bodyR, 0, Math.PI * 2);
      ctx.fillStyle = '#14532d';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();

    // bars
    const w = 36, h = 5, pad = 2;
    const x = this.pos.x - w / 2;
    const y = this.pos.y - this.bodyR - 14;
    drawRoundedRect(ctx, x, y, w, h, 2);
    ctx.fillStyle = 'rgba(8,12,18,0.85)';
    ctx.fill();
    drawRoundedRect(ctx, x, y, w * (this.hp / this.maxHP), h, 2);
    const hpG = ctx.createLinearGradient(x, y, x + w, y);
    hpG.addColorStop(0, '#7eed90');
    hpG.addColorStop(1, '#37d86b');
    ctx.fillStyle = hpG;
    ctx.fill();
    const y2 = y + h + pad;
    drawRoundedRect(ctx, x, y2, w, h - 1, 2);
    ctx.fillStyle = 'rgba(8,12,18,0.85)';
    ctx.fill();
    const xpReq = this.xpToLevel(this.level);
    const xpR = Math.min(1, this.xp / xpReq);
    drawRoundedRect(ctx, x, y2, w * xpR, h - 1, 2);
    const xpG = ctx.createLinearGradient(x, y2, x + w, y2);
    xpG.addColorStop(0, '#96d8ff');
    xpG.addColorStop(1, '#3ab2ff');
    ctx.fillStyle = xpG;
    ctx.fill();

    // level indicator
    ctx.save();
    ctx.font = '700 11px system-ui,Segoe UI,Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeText(String(this.level), this.pos.x, this.pos.y);
    ctx.fillStyle = '#e6edf7';
    ctx.fillText(String(this.level), this.pos.x, this.pos.y);
    ctx.restore();
  }
}

