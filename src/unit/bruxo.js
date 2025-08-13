// Lógica específica da classe Bruxo

import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { randAng, rrand } from '../utils/rand.js';
import { Particle } from '../entities/particle.js';
import { Effect } from '../entities/effect.js';
import { Projectile } from '../entities/projectile.js';
import { Familiar } from '../entities/familiar.js';
import { game } from '../core/game.js';

export function fire() {
  if (this.className !== 'bruxo') return;
  const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
  const p = this.tip().add(dir.clone().mul(this.weaponTipR + 2));
  const proj = new Projectile(this, p, dir);
  const B = CFG.bruxo.blast;
  proj.speed = B.speed;
  proj.life = B.life;
  proj.rad = B.rad;
  proj.dmg = B.dmg * this.dmgMult();
  proj.knock = B.knock;
  proj.color = '#c9a7ff';
  proj.visual = 'eldritch';
  game.spawnProjectile(proj);
  return CFG.ranged.cooldown * 1.05;
}

export function castHex() {
  if (this.className !== 'bruxo') return;
  let best = null, bestD = 1e9;
  for (const o of game.units) {
    if (!o.alive || o === this) continue;
    if (this.team && o.team && this.team === o.team) continue;
    const d = new V(o.pos.x - this.pos.x, o.pos.y - this.pos.y).len();
    if (d < bestD) { bestD = d; best = o; }
  }
  if (!best) return;
  best.hex = { owner: this, t: CFG.bruxo.hex.dur };
  game.spawnEffect(new Effect(best.pos.clone(), 36, 0.45, CFG.bruxo.hex.color));
  for (let i = 0; i < 10; i++) {
    game.spawnParticle(new Particle(
      best.pos.clone(),
      V.fromAng(randAng(), rrand(60, 160)),
      rrand(0.2, 0.5),
      CFG.bruxo.hex.color
    ));
  }
  this.brxHexCD = CFG.bruxo.hex.cd;
}

export function castFamiliar() {
  if (this.className !== 'bruxo') return;
  if (this.familiarRef && this.familiarRef.alive) return;
  const fam = new Familiar(this);
  this.familiarRef = fam;
  game.spawnSummon(fam);
}

