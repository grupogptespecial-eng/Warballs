// Lógica específica da classe Guerreiro

import { V } from '../math/vec.js';
import { CFG } from '../config/cfg.js';
import { SpearProjectile } from '../entities/spear.js';
import { Particle } from '../entities/particle.js';
import { randAng, rrand } from '../utils/rand.js';
import { game } from '../core/game.js';

// Disparo de lança – retorna o tempo de recarga total
export function fire() {
  if (this.className !== 'guerreiro') return 0;
  const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
  const p = this.tip().add(dir.clone().mul(this.weaponTipR + 2));
  const proj = new SpearProjectile(this, p, dir);
  game.spawnProjectile(proj);
  if (this.gw) {
    const spec = CFG.guerreiro.spear;
    this.gw.disarmedT = spec.cdTotal * spec.disarmedFrac;
  }
  return CFG.guerreiro.spear.cdTotal;
}

// Atualização por frame: timers, troca de modo e postura de guerra
export function updateGuerreiro(dt) {
  if (this.className !== 'guerreiro' || !this.gw) return;
  if (this.gw.parryCD > 0) this.gw.parryCD -= dt;
  if (this.gw.disarmedT > 0) this.gw.disarmedT -= dt;

  let nearest = null, best = 1e9;
  for (const u of game.units) {
    if (!u.alive || u === this) continue;
    if (this.team && u.team && this.team === u.team) continue;
    const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
    if (d < best) { best = d; nearest = u; }
  }

  const desired = (nearest && best <= CFG.guerreiro.switch.meleeR) ? 'melee' : 'ranged';
  if (desired !== this.gw.mode) {
    this.gw.lastMode = this.gw.mode;
    this.gw.mode = desired;
    this.gw.disciplineReady = true;
  }

  const active = nearest && best <= CFG.guerreiro.war.detectR;
  if (active) {
    this.gw.stanceActive = true;
    this.omega = this.gw.baseOmega * CFG.guerreiro.war.omegaMul;
    this.knockResist = CFG.guerreiro.war.knockResistPct;
  } else {
    this.gw.stanceActive = false;
    this.omega = this.gw.baseOmega;
    this.knockResist = 0;
  }
}

// Parry contra outra arma; retorna true se refletiu
export function guerreiroParryAgainst(other) {
  if (this.className !== 'guerreiro' || !this.gw || this.gw.parryCD > 0) return false;
  if (!other || !other.weaponTipR || !other.weaponLen) return false;
  const t1 = this.tip();
  const t2 = other.tip();
  const dist = new V(t2.x - t1.x, t2.y - t1.y).len();
  if (dist >= this.weaponTipR + other.weaponTipR) return false;
  if (!this.canDamage(other)) return false;

  const toTip = new V(t2.x - this.pos.x, t2.y - this.pos.y);
  const n = toTip.clone().nrm();
  const t = new V(-n.y, n.x);

  other.weaponLockT = Math.max(other.weaponLockT || 0, CFG.guerreiro.parry.lockT);
  other.vel.add(t.mul(CFG.guerreiro.parry.tangent / other.mass));
  other.vel.add(n.mul(CFG.guerreiro.parry.radial / other.mass));
  if (other.omega === 0) other.omega = (Math.random() < 0.5 ? 1 : -1) * 2.6;
  other.omega *= -0.8;

  this.gw.parryCD = CFG.guerreiro.parry.cd;
  if (this.canDamage(other)) { this.gainXPWeaponClash(); other.gainXPWeaponClash(); }

  const mid = new V((t1.x + t2.x) / 2, (t1.y + t2.y) / 2);
  for (let i = 0; i < CFG.vfx.reflectSpark; i++) {
    game.spawnParticle(new Particle(
      mid.clone(),
      V.fromAng(randAng(), rrand(60, 160)),
      rrand(.12, .3),
      '#e5e7eb'
    ));
  }
  return true;
}

