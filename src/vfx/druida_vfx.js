import { Particle } from '../entities/particle.js';
import { V } from '../math/vec.js';
import { randAng, rrand } from '../utils/rand.js';
import { game } from '../core/game.js';

const ELEM_COLORS = {
  fire: '#fb923c',
  ice: '#93c5fd',
  lightning: '#fde68a',
  earth: '#a3e635'
};

export function spawnElementBurst(elem, pos) {
  const col = ELEM_COLORS[elem] || '#fff';
  for (let i = 0; i < 8; i++) {
    game.spawnParticle(new Particle(
      pos.clone(),
      V.fromAng(randAng(), rrand(60, 160)),
      rrand(0.2, 0.5),
      col
    ));
  }
}

export function spawnRootBurst(pos) {
  for (let i = 0; i < 10; i++) {
    game.spawnParticle(new Particle(
      pos.clone(),
      V.fromAng(randAng(), rrand(80, 200)),
      rrand(0.3, 0.6),
      '#34BE6A'
    ));
  }
}

export function spawnBearTransform(pos) {
  for (let i = 0; i < 12; i++) {
    game.spawnParticle(new Particle(
      pos.clone(),
      V.fromAng(randAng(), rrand(100, 220)),
      rrand(0.3, 0.7),
      '#a16207'
    ));
  }
}
