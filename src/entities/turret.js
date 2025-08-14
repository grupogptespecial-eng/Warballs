// Turret entity used by Artífice
import { V } from '../math/vec.js';
import { Projectile } from './projectile.js';
import { game } from '../core/game.js';
import { nearestEnemyOf } from '../unit/unit.js';
import { drawRoundedRect } from '../utils/geometry.js';

export class Turret {
  constructor(owner, pos, cfg) {
    this.owner = owner;
    this.pos = pos.clone();
    this.cfg = cfg;

    this.level = 1;
    this.xp = 0;
    this.maxHP = cfg.baseHP;
    this.hp = this.maxHP;
    this.alive = true;
    this.lifetime = cfg.lifetime;
    this.fireCD = 0;
    this.bumpCD = 0;

    // visual orientation
    this.angle = 0;

    // Stats that may scale with level
    this.range = cfg.range;
    this.fireRate = cfg.fireRate;
    this.bulletDamage = cfg.bulletDamage;
    this.bulletSpeed = cfg.bulletSpeed;
    this.bulletKnock = cfg.bulletKnock;
  }

  levelUp() {
    if (this.level >= 4) return;
    this.level++;
    const per = this.cfg.perLevel;
    this.maxHP += per.HP[this.level - 1] || 0;
    this.range += per.range[this.level - 1] || 0;
    this.fireRate += per.fireRate[this.level - 1] || 0;
    this.bulletDamage += per.bulletDamage[this.level - 1] || 0;
    // heal 20% of new max HP on level up
    this.hp = Math.min(this.maxHP, this.hp + this.maxHP * 0.2);
  }

  update(dt) {
    if (!this.alive) return;

    // lifetime
    this.lifetime -= dt;
    if (this.lifetime <= 0) { this.alive = false; return; }

    // decay damage
    const dec = this.cfg.decay;
    this.hp -= dec.flatPerSec * dt + dec.pctMaxHPPerSec * this.maxHP * dt;
    if (this.hp < dec.minHPFloor) this.hp = dec.minHPFloor;

    // bump with owner for repair/xp
    const toOwner = new V(this.owner.pos.x - this.pos.x, this.owner.pos.y - this.pos.y);
    const distOwner = toOwner.len();
    if (distOwner <= this.owner.bodyR + this.cfg.bodyRadius) {
      if (this.bumpCD <= 0) {
        const rep = this.cfg.repairOnBump;
        const heal = rep.flat + rep.pctMax * this.maxHP;
        this.hp = Math.min(this.maxHP, this.hp + heal);
        this.xp += this.cfg.xpOnBump;
        this.bumpCD = rep.cd;
        while (this.level <= this.cfg.xpToLevel.length && this.xp >= this.cfg.xpToLevel[this.level - 1]) {
          this.levelUp();
        }
      }
      // pushable: simple position nudge
      toOwner.nrm();
      this.pos.add(toOwner.mul(this.cfg.pushableSpeed * dt));
    }
    this.bumpCD = Math.max(0, this.bumpCD - dt);

    // firing logic
    this.fireCD -= dt;
    if (this.fireCD <= 0) {
      const target = nearestEnemyOf({ pos: this.pos, team: this.owner.team });
      if (target) {
        const to = new V(target.pos.x - this.pos.x, target.pos.y - this.pos.y);
        const dist = to.len();
        if (dist <= this.range * this.owner.bodyR) {
          const dir = to.mul(1 / dist);
          this.angle = Math.atan2(dir.y, dir.x);
          const p = this.pos.clone().add(dir.clone().mul(this.cfg.bodyRadius));
          const proj = new Projectile(this.owner, p, dir);
          proj.speed = this.bulletSpeed;
          proj.dmg = this.bulletDamage;
          proj.knock = this.bulletKnock;
          proj.life = 1.0;
          proj.rad = 4;
          proj.canHurtAllies = false;
          game.spawnProjectile(proj);
          this.fireCD = 1 / this.fireRate;
        }
      }
    }

    if (this.hp <= 0) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.cfg.color || '#A6B1B8';
    // barrel
    ctx.fillRect(0, -2, this.cfg.bodyRadius * 1.5, 4);
    // base
    ctx.beginPath();
    ctx.arc(0, 0, this.cfg.bodyRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // bars
    const w = 40, h = 5, pad = 2;
    const x = this.pos.x - w / 2;
    const y = this.pos.y - this.cfg.bodyRadius - 16;
    drawRoundedRect(ctx, x, y, w, h, 2);
    ctx.fillStyle = 'rgba(8,12,18,0.85)';
    ctx.fill();
    drawRoundedRect(ctx, x, y, w * (this.hp / this.maxHP), h, 2);
    const hpGrad = ctx.createLinearGradient(x, y, x + w, y);
    hpGrad.addColorStop(0, '#7eed90');
    hpGrad.addColorStop(1, '#37d86b');
    ctx.fillStyle = hpGrad;
    ctx.fill();
    const y2 = y + h + pad;
    drawRoundedRect(ctx, x, y2, w, h - 1, 2);
    ctx.fillStyle = 'rgba(8,12,18,0.85)';
    ctx.fill();
    const xpReq = this.cfg.xpToLevel[this.level - 1] || 1;
    const xpR = (this.level > this.cfg.xpToLevel.length) ? 1 : (this.xp / xpReq);
    drawRoundedRect(ctx, x, y2, w * xpR, h - 1, 2);
    const xpGrad = ctx.createLinearGradient(x, y2, x + w, y2);
    xpGrad.addColorStop(0, '#96d8ff');
    xpGrad.addColorStop(1, '#3ab2ff');
    ctx.fillStyle = xpGrad;
    ctx.fill();

    // level indicator
    ctx.save();
    ctx.font = '700 12px system-ui,Segoe UI,Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeText(String(this.level), this.pos.x, this.pos.y);
    ctx.shadowBlur = 4;
    ctx.shadowColor = this.cfg.color || '#A6B1B8';
    ctx.fillStyle = '#e6edf7';
    ctx.fillText(String(this.level), this.pos.x, this.pos.y);
    ctx.restore();
  }
}
