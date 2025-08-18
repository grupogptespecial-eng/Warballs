// Classe Artífice - controle de área com torretas e minas
// Implementação simplificada focada na passiva Overclock e no canhão arcano.

import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { Projectile } from '../entities/projectile.js';
import { Turret } from '../entities/turret.js';
import { Mine } from '../entities/mine.js';
import { game } from '../core/game.js';
import { randAng } from '../utils/rand.js';
import { clamp } from '../utils/misc.js';

export function makeArtificeState() {
  const C = CFG.artifice || {};
  return {
    cfg: C,
    overclock: { active: false, tSinceHit: 0, activeT: 0 },
    turrets: [],
    mines: [],
    a1cd: 0,
    a2cd: 0,
    cannonCD: 0
  };
}

// Passiva Overclock
function updateOverclock(dt) {
  const O = this.art.cfg.overclock;
  const oc = this.art.overclock;
  oc.tSinceHit += dt;
  if (!oc.active && oc.tSinceHit >= O.tSemDano) {
    oc.active = true;
    oc.activeT = 0;
  }
  if (oc.active) {
    oc.activeT += dt;
    if (oc.activeT < O.minUptimeAfterStart) return; // mantém pelo mínimo
    if (oc.decayOnHit && oc.tSinceHit <= 0) oc.active = false;
  }
}

export function updateArtifice(dt) {
  updateOverclock.call(this, dt);
  // atualizar CD das habilidades
  this.art.cannonCD = Math.max(0, this.art.cannonCD - dt * cdRate(this));
  this.art.a1cd = Math.max(0, this.art.a1cd - dt * cdRate(this));
  this.art.a2cd = Math.max(0, this.art.a2cd - dt * cdRate(this));
  // manter referências apenas aos gadgets vivos (atualizados pelo game)
  this.art.turrets = this.art.turrets.filter(t => t.alive);
  this.art.mines = this.art.mines.filter(m => m.alive);
}

function cdRate(u) {
  return u.art.overclock.active ? u.art.cfg.overclock.cdRateMult : 1;
}

// Arma principal: Canhão Arcano
export function fireCannon() {
  if (this.className !== 'artifice') return;
  const C = this.art.cfg.cannon;
  const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
  const p = this.tip().add(dir.clone().mul(2));
  const proj = new Projectile(this, p, dir);
  // velocidade baseada no raio corporal
  proj.speed = C.speed * CFG.body.radius;
  proj.dmg = C.baseDamage * this.dmgMult();
  proj.knock = C.knockback;
  proj.life = C.lifeTime;
  proj.rad = C.radius;
  proj.canHurtAllies = C.friendlyFire;
  proj.color = '#444';
  game.spawnProjectile(proj);
  if (C.selfKnockback) {
    this.vel.add(dir.clone().mul(-C.selfKnockback * CFG.body.radius));
  }
  this.art.cannonCD = C.cooldown;
  return C.cooldown;
}

// Habilidade 1: coloca uma torreta simples
export function castTurret() {
  if (this.className !== 'artifice') return;
  if (this.art.a1cd > 0) return;
  const T = this.art.cfg.turret;
  const alive = this.art.turrets.filter(t => t.alive).length;
  const cap = Math.ceil(this.level / 2);
  if (alive >= cap) return;
  const dir = new V(Math.cos(this.angle), Math.sin(this.angle));
  const pos = this.pos.clone().add(dir.clone().mul(this.bodyR + 4));
  const b = game.bounds;
  const r = T.bodyRadius;
  pos.x = clamp(pos.x, b.x + r, b.x + b.w - r);
  pos.y = clamp(pos.y, b.y + r, b.y + b.h - r);
  const t = new Turret(this, pos, T, this.level);
  this.art.turrets.push(t);
  game.spawnSummon && game.spawnSummon(t); // no-op se não existir
  this.art.a1cd = T.spawnCooldown;
}

// Habilidade 2: arremessa uma mina
export function castMine() {
  if (this.className !== 'artifice') return;
  if (this.art.a2cd > 0) return;
  const M = this.art.cfg.mines;
  const cap = M.capacityBase + Math.floor((this.level - 1) / (M.capacityPerLevel || 99));
  const count = this.art.mines.filter(m => m.alive).length;
  if (count >= cap) return;
  const dir = V.fromAng(randAng());
  const pos = this.pos.clone().add(dir.clone().mul(M.throwRadius * CFG.body.radius));
  const b = game.bounds;
  const r = M.bodyRadius || 8;
  pos.x = clamp(pos.x, b.x + r, b.x + b.w - r);
  pos.y = clamp(pos.y, b.y + r, b.y + b.h - r);
  const mine = new Mine(this, pos, M);
  this.art.mines.push(mine);
  game.spawnSummon && game.spawnSummon(mine);
  this.art.a2cd = M.cooldown;
}

// Utilitário para dano recebido
export function artificeTookDamage() {
  const oc = this.art.overclock;
  oc.tSinceHit = 0;
  if (oc.active && oc.activeT >= this.art.cfg.overclock.minUptimeAfterStart) {
    oc.active = false;
  }
}
