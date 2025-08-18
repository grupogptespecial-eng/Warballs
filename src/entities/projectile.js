// Projétil genérico usado por várias classes

import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { reflect, inFrontArc, projApproaching, distPointToSegment } from '../utils/geometry.js';
import { clamp } from '../utils/misc.js';
import { randAng, rrand } from '../utils/rand.js';
import { Particle } from './particle.js';
import { monkConeRad } from '../unit/monge.js';
import { nearestEnemyOf } from '../unit/unit.js';
import { game } from '../core/game.js';

export class Projectile {
  constructor(owner, pos, dir) {
    this.owner = owner;
    this.pos = pos.clone();
    this.dir = dir.clone().nrm();
    this.speed = CFG.ranged.speed;
    this.life = CFG.ranged.life;
    this.rad = CFG.ranged.radius;
    this.dmg = CFG.ranged.dmg * (owner ? owner.dmgMult() : 1);
    this.knock = CFG.ranged.knock;
    this.color = owner ? owner.color : '#fff';
    this.alive = true;
    this.trail = [];
    this.bounces = 0;
    this.penetration = false;
    this.canHurtAllies = true;
    this.scale = CFG.ranged.scale ?? 1;
    this.internalRotation = CFG.ranged.internalRotation ?? 0; // degrees
  }

  stepMove(dt) {
    this.pos.add(this.dir.clone().mul(this.speed * dt));
  }

  update(dt, arena, units, pets) {
    this.life -= dt;
    if (this.life <= 0) { this.alive = false; return; }
    const prevPos = this.pos.clone();
    this.stepMove(dt);

    // Colisão com paredes
    if (this.pos.x < arena.x - this.rad || this.pos.x > arena.x + arena.w + this.rad ||
        this.pos.y < arena.y - this.rad || this.pos.y > arena.y + arena.h + this.rad) {
      this.alive = false; return;
    }

    // Interações com unidades
    for (const u of units) {
      if (!u.alive) continue;
      if (u === this.owner) continue;
      if (this.owner && u.team && this.owner.team && u.team === this.owner.team && !this.canHurtAllies) continue;

      // Monge: deflect reativo
      if (u.className === 'monge') {
        const cone = monkConeRad(CFG.monge.deflect.coneDeg);
        const sense = CFG.monge.deflect.rSense;
        const hitR  = CFG.monge.deflect.rHit;

        if ((!u.monk.deflectT || u.monk.deflectT <= 0) && u.monk.deflectCD <= 0) {
          const hostile = this.owner && (!u.team || !this.owner.team || this.owner.team !== u.team);
          if (hostile && projApproaching(this, u) && inFrontArc(u, this.pos, cone, sense)) {
            u.monk.deflectT = CFG.monge.deflect.dur;
            u.monk.deflectCD = CFG.monge.deflect.cd;
          }
        }
        if (u.monk.deflectT > 0 && inFrontArc(u, this.pos, cone, hitR)) {
          const targ = nearestEnemyOf(u);
          if (targ) {
            this.dir = new V(targ.pos.x - u.pos.x, targ.pos.y - u.pos.y).nrm();
            if (CFG.monge.deflect.speedBoost) this.speed *= CFG.monge.deflect.speedBoost;
            this.pos = u.pos.clone().add(this.dir.clone().mul(u.bodyR + this.rad + 2));
          } else {
            const normal = new V(this.pos.x - u.pos.x, this.pos.y - u.pos.y);
            this.dir = reflect(this.dir, normal);
            this.pos.add(this.dir.clone().mul(this.rad * 1.2));
          }
          if (!this._deflectedByMonk) { this._deflectedByMonk = true; this.dmg *= (CFG.monge.deflect.dmgMult || 2.0); }
          this.owner = u;
          for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
            game.spawnParticle(new Particle(u.pos.clone(),
              V.fromAng(Math.random() * Math.PI * 2, rrand(40, 160)),
              rrand(.15, .35), '#cfe9ff'));
          }
          this.trail.push(this.pos.clone());
          if (this.trail.length > CFG.ranged.trail) this.trail.shift();
          return;
        }
      }

      // Reflexão na ponta da arma (exceto Monge)
      if (u.className !== 'monge') {
        const tip = u.tip();
        const toTip = new V(this.pos.x - tip.x, this.pos.y - tip.y);
        if (toTip.len() < (u.weaponTipR + this.rad)) {
          const newDir = reflect(this.dir, toTip);
          this.dir = newDir;
          this.owner = null;
          this.pos.add(this.dir.clone().mul(this.rad * 1.5));
          for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
            game.spawnParticle(new Particle(tip.clone(), V.fromAng(rrand(0, Math.PI * 2), rrand(40, 160)), rrand(.15, .35), this.color));
          }
          continue;
        }
      }

      const d = distPointToSegment(u.pos, prevPos, this.pos);
      if (d < u.bodyR + this.rad) {
        const dealt = u.hit(this.dmg, this.dir.clone().mul(this.knock), this.owner);
        if (dealt > 0) {
          game.onDamage(dealt);
          if (this.owner) this.owner.gainXPOffense(dealt);
          if (this.owner && this.owner.className === 'bruxo' && u.hex && u.hex.owner === this.owner) {
            const heal = dealt * CFG.bruxo.link.leechPct;
            this.owner.hp = clamp(this.owner.hp + heal, 0, this.owner.hpMax);
            game.spawnParticle(new Particle(this.owner.pos.clone(), V.fromAng(randAng(), rrand(40,120)), .25, CFG.bruxo.hex.color));
          }
          if (this.onHit) this.onHit(u, this.pos.clone());
        }
        if (!this.penetration) { this.alive = false; }
        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(this.pos.clone(), V.fromAng(rrand(0, Math.PI * 2), rrand(50, 220)), rrand(.2, .6), this.color));
        }
        if (!this.alive) break;
      }
    }

    // Summons genéricos: minas podem ser detonadas por projéteis
    for (const s of game.summons) {
      if (!s.alive) continue;
      if (s.kind === 'mine') {
        if (this.owner && s.team && this.owner.team && s.team === this.owner.team && !this.canHurtAllies) continue;
        const d = distPointToSegment(s.pos, prevPos, this.pos);
        if (d < s.bodyR + this.rad) {
          s.hit?.(this.dmg, this.owner);
          if (!this.penetration) this.alive = false;
          if (!this.alive) break;
        }
      }
    }

    // Familiar (projéteis não causam dano em aliados)
    for (const s of game.summons) {
      if (!s.alive || s.kind !== 'familiar') continue;
      if (this.owner && s.team && this.owner.team && s.team === this.owner.team) continue;

      const d = distPointToSegment(s.pos, prevPos, this.pos);
      if (d < s.bodyR + this.rad) {
        const dealt = s.hit(this.dmg, this.dir.clone().mul(this.knock), this.owner);
        if (dealt > 0) {
          if (this.owner) this.owner.gainXPOffense?.(dealt);
          if (this.owner && this.owner.className === 'bruxo' && s.hex && s.hex.owner === this.owner) {
            const heal = dealt * CFG.bruxo.link.leechPct;
            this.owner.hp = clamp(this.owner.hp + heal, 0, this.owner.hpMax);
          }
        }
        if (!this.penetration) this.alive = false;
        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(this.pos.clone(), V.fromAng(rrand(0, Math.PI * 2), rrand(50, 220)), rrand(.2, .6), this.color));
        }
        if (!this.alive) break;
      }
    }

    // Turrets can take damage from enemy projectiles
    for (const s of game.summons) {
      if (!s.alive || s.kind !== 'turret') continue;
      if (this.owner && s.team && this.owner.team && s.team === this.owner.team && !this.canHurtAllies) continue;

      const d = distPointToSegment(s.pos, prevPos, this.pos);
      if (d < s.bodyR + this.rad) {
        const dealt = s.hit(this.dmg, this.owner);
        if (dealt > 0 && this.owner) this.owner.gainXPOffense?.(dealt);
        if (!this.penetration) this.alive = false;
        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(this.pos.clone(), V.fromAng(rrand(0, Math.PI * 2), rrand(50, 220)), rrand(.2, .6), this.color));
        }
        if (!this.alive) break;
      }
    }

    // Druid roots can take damage from projectiles
    for (const s of game.summons) {
      if (!s.alive || s.kind !== 'druidRoot') continue;
      if (this.owner && s.team && this.owner.team && s.team === this.owner.team && !this.canHurtAllies) continue;

      const d = distPointToSegment(s.pos, prevPos, this.pos);
      if (d < s.bodyR + this.rad) {
        const dealt = s.hit(this.dmg, this.owner);
        if (dealt > 0 && this.owner) this.owner.gainXPOffense?.(dealt);
        if (!this.penetration) this.alive = false;
        for (let i = 0; i < CFG.vfx.particlesOnHit; i++) {
          game.spawnParticle(new Particle(this.pos.clone(), V.fromAng(rrand(0, Math.PI * 2), rrand(50, 220)), rrand(.2, .6), this.color));
        }
        if (!this.alive) break;
      }
    }

    this.trail.push(this.pos.clone());
    if (this.trail.length > CFG.ranged.trail) this.trail.shift();
  }

  draw(ctx) {
    const useImg = this.img && this.img.complete;
    const scale = this.scale ?? 1;
    const rot = (this.internalRotation ?? 0) * Math.PI / 180;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.globalAlpha = .9;

    // draw elemental trail (even when using image)
    const trailCol = this.trailColor || (!useImg ? this.color : null);
    if (trailCol && this.trail.length > 1) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = trailCol;
      ctx.lineWidth = this.trailWidth || 2;
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (const p of this.trail) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = useImg ? 'source-over' : 'lighter';
    ctx.shadowBlur = useImg ? 0 : 10;
    ctx.shadowColor = this.color;
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(rot);
    if (useImg) {
      const iw = this.img.naturalWidth || this.img.width;
      const ih = this.img.naturalHeight || this.img.height;
      const w = this.rad * 2 * scale;
      const h = w * (ih / iw);
      ctx.drawImage(this.img, -w / 2, -h / 2, w, h);
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.rad * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (game.showHitboxes) {
      ctx.save();
      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

