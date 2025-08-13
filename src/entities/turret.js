// Turret entity used by Artífice
import { V } from '../math/vec.js';
import { Projectile } from './projectile.js';
import { game } from '../core/game.js';
import { nearestEnemyOf } from '../unit/unit.js';

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
          const spec = {
            speed: this.bulletSpeed,
            dmg: this.bulletDamage,
            knock: this.bulletKnock,
            radius: 4,
            life: 1.0,
            canHurtAllies: false
          };
          game.spawnProjectile(new Projectile(this.owner, this.pos.clone(), dir, spec));
          this.fireCD = 1 / this.fireRate;
        }
      }
    }

    if (this.hp <= 0) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.fillStyle = this.cfg.color || '#A6B1B8';
    ctx.beginPath();
    ctx.arc(0, 0, this.cfg.bodyRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
