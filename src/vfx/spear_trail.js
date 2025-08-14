import { Particle } from '../entities/particle.js';
import { game } from '../core/game.js';
import { randAng, rrand } from '../utils/rand.js';
import { V } from '../math/vec.js';

// Spawn a short-lived sparkle trail for warrior spear throws
export function spawnSpearTrail(pos, dir) {
  const base = dir.clone().mul(-rrand(20, 40));
  const jitter = V.fromAng(randAng(), rrand(10, 30));
  const vel = base.add(jitter);
  game.spawnParticle(new Particle(pos.clone(), vel, rrand(0.1, 0.25), '#e5e7eb'));
}
