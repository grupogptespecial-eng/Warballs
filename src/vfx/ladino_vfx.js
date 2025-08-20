import { Particle } from '../entities/particle.js';
import { V } from '../math/vec.js';
import { randAng, rrand } from '../utils/rand.js';
import { game } from '../core/game.js';

export function spawnRollFx(pos) {
  for (let i = 0; i < 8; i++) {
    game.spawnParticle(new Particle(
      pos.clone(),
      V.fromAng(randAng(), rrand(80, 160)),
      rrand(0.2, 0.4),
      '#cbd5e1'
    ));
  }
}

export function spawnStealthFx(pos) {
  for (let i = 0; i < 8; i++) {
    game.spawnParticle(new Particle(
      pos.clone(),
      V.fromAng(randAng(), rrand(60, 120)),
      rrand(0.25, 0.5),
      '#94a3b8'
    ));
  }
}
