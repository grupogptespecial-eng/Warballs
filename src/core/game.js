// Objeto principal do jogo: gerencia entidades, arena e renderização

import { CFG } from '../config/cfg.js';
import { Arena } from './arena.js';
import { drawBackground, drawArenaRect } from '../render/drawHelpers.js';
import { V } from '../math/vec.js';
import { randAng, rrand } from '../utils/rand.js';
import { Particle } from '../entities/particle.js';
import { Effect } from '../entities/effect.js';
import { CrateSystem } from './crateSystem.js';

export const canvas = document.getElementById('game');
export const g = canvas ? canvas.getContext('2d') : null;

export const game = {
  canvas,
  g,
  time: 0,
  units: [],
  projectiles: [],
  particles: [],
  effects: [],
  summons: [],
  arena: new Arena('padrao'),
  bounds: { x: 0, y: 0, w: canvas ? canvas.width : 0, h: canvas ? canvas.height : 0 },
  debugHit: false,
  restartTimer: null,

  init() {
    this.resize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.resize());
    }
    CrateSystem.init({
      getArenaBounds: () => this.bounds,
      queryUnits: () => this.units,
      rng: Math.random,
      now: () => (typeof performance !== 'undefined' ? performance.now() / 1000 : Date.now() / 1000)
    });
    CrateSystem.setConfig(CFG.crates);
  },

  resize() {
    if (!canvas || typeof window === 'undefined') return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.bounds = { x: 0, y: 0, w: canvas.width, h: canvas.height };
    this.arena.update(0, this.bounds);
  },

  // Spawns
  spawnUnit(u) { this.units.push(u); return u; },
  spawnProjectile(p) { this.projectiles.push(p); return p; },
  spawnParticle(p) { this.particles.push(p); return p; },
  spawnEffect(e) { this.effects.push(e); return e; },
  spawnSummon(s) { this.summons.push(s); return s; },

  // Valores de velocidade mínimos e máximos
  getVMin() { return CFG.physics.vMin; },
  getVMax() { return CFG.physics.vMax; },

  // Hooks de gameplay (placeholders)
  onDeath(u) {},
  onDamage(d) {},
  onFamiliarDeath(f) {
    const owner = f.owner;
    if (owner) {
      owner.familiarRef = null;
      owner.brxFamCD = CFG.bruxo.familiar.cdAfterDeath;
    }
  },

  paladinExplosion(owner, pos, radius, dmg) {
    this.spawnEffect(new Effect(pos.clone(), radius, 0.55, CFG.paladino.sacred.color));
    for (let i = 0; i < 12; i++) {
      this.spawnParticle(new Particle(
        pos.clone(),
        V.fromAng(randAng(), rrand(80, 220)),
        0.4,
        CFG.paladino.sacred.color
      ));
    }
    for (const u of this.units) {
      if (!u.alive || u === owner) continue;
      if (owner.team && u.team && owner.team === u.team) continue;
      const to = new V(u.pos.x - pos.x, u.pos.y - pos.y);
      if (to.len() <= radius + u.bodyR) {
        const knock = to.clone().nrm().mul(dmg * (CFG.paladino.sacred.knockPerDamage || 0));
        const dealt = u.hit(dmg, knock, owner);
        if (dealt > 0) owner.gainXPOffense?.(dealt);
      }
    }
  },

  update(dt) {
    this.time += dt;
    this.arena.update(dt, this.bounds);
    this.bounds = this.arena.bounds;
    const arena = this.bounds;

    for (const u of this.units) u.physics(dt, arena);
    for (let i = 0; i < this.units.length; i++) {
      for (let j = i + 1; j < this.units.length; j++) {
        this.units[i].collide(this.units[j]);
      }
    }

    for (const u of this.units) u.collideSummons?.(this.summons);

    CrateSystem.update(dt);
    for (const u of this.units) CrateSystem.tryPickup(u);

    for (const s of this.summons) s.update(dt, arena, this.units);
    for (const p of this.projectiles) p.update(dt, arena, this.units, this.summons);
    for (const e of this.effects) e.update?.(dt);
    for (const part of this.particles) part.update(dt);

    this.units = this.units.filter(u => u.alive);
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.effects = this.effects.filter(e => e.alive !== false);
    this.particles = this.particles.filter(p => p.alive);
    this.summons = this.summons.filter(s => s.alive);

    if (this.units.length <= 1 && !this.restartTimer && typeof window !== 'undefined') {
      window.stopLoop?.();
      this.restartTimer = setTimeout(() => {
        this.restartTimer = null;
        window.startGame?.();
      }, 3000);
    }
  },

  draw() {
    if (!g) return;
    drawBackground(canvas.width, canvas.height);
    drawArenaRect(this.bounds);
    CrateSystem.render(g);
    for (const e of this.effects) e.draw?.(g);
    for (const part of this.particles) part.draw(g);
    for (const s of this.summons) s.draw(g);
    for (const p of this.projectiles) p.draw(g);
    for (const u of this.units) u.draw(g);
  }
};

if (typeof window !== 'undefined') {
  window.canvas = canvas;
  window.g = g;
  window.game = game;
}

