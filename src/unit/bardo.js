import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { clamp } from '../utils/misc.js';
import { game } from '../core/game.js';
import { NoteProjectile } from '../entities/note.js';
import { RitmoAura } from '../entities/ritmo_aura.js';
import { NotaCortante } from '../entities/nota_cortante.js';

export function fire() {
  const N = CFG.bardo.note;
  const dir = V.fromAng(this.angle, 1);
  const off = this.bodyR + this.weaponLen + 2;
  const pos = this.pos.clone().add(dir.clone().mul(off));
  const proj = new NoteProjectile(this, pos, dir);
  game.spawnProjectile(proj);
  return N.cooldown;
}

export function inspire(self) {
  const P = CFG.bardo.inspire;
  for (const u of game.units) {
    if (!u.alive) continue;
    if (self.team && u.team && self.team === u.team) {
      const d = new V(u.pos.x - self.pos.x, u.pos.y - self.pos.y).len();
      if (d < P.radius) {
        u.hp = clamp(u.hp + P.heal, 0, u.hpMax);
      }
    }
  }
}

export function startRitmoDeGuerra() {
  const A = CFG.bardo.ritmo;
  game.spawnEffect(new RitmoAura(this));
  return A.cooldown;
}

export function fireNotaCortante() {
  const C = CFG.bardo.cortante;
  const dir = V.fromAng(this.angle, 1);
  const off = this.bodyR + this.weaponLen + 2;
  const pos = this.pos.clone().add(dir.clone().mul(off));
  const proj = new NotaCortante(this, pos, dir);
  game.spawnProjectile(proj);
  return C.cd;
}
