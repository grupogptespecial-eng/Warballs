import { Particle } from '../entities/particle.js';
import { V } from '../math/vec.js';
import { randAng, rrand } from '../utils/rand.js';
import { game } from '../core/game.js';
import { CFG } from '../config/cfg.js';

export function spawnAdvanceVFX(pos) {
  for (let i = 0; i < 6; i++) {
    game.spawnParticle(new Particle(
      pos.clone(),
      V.fromAng(randAng(), rrand(80, 160)),
      rrand(.1, .25),
      '#fcd34d'
    ));
  }
}

export function spawnDodgeVFX(pos) {
  for (let i = 0; i < 6; i++) {
    game.spawnParticle(new Particle(
      pos.clone(),
      V.fromAng(randAng(), rrand(60, 120)),
      rrand(.1, .25),
      '#d1d5db'
    ));
  }
}

export function spawnParryVFX(pos) {
  for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
    game.spawnParticle(new Particle(
      pos.clone(),
      V.fromAng(randAng(), rrand(60, 160)),
      rrand(.12, .3),
      '#e5e7eb'
    ));
  }
  game.spawnParticle(new Particle(
    pos.clone(),
    V.fromAng(randAng(), rrand(120, 220)),
    rrand(.15, .35),
    '#fcd34d'
  ));
}
