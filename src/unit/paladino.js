// Lógica específica da classe Paladino

import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { clamp } from '../utils/misc.js';
import { Particle } from '../entities/particle.js';
import { Effect } from '../entities/effect.js';
import { game } from '../core/game.js';

export function palStats(level) {
  const L = Math.max(1, Math.min(level | 0, CFG.level.max));
  const sacredChance = Math.min(
    CFG.paladino.sacred.chanceMax,
    CFG.paladino.sacred.baseChance + CFG.paladino.sacred.chancePerLevel * (L - 1)
  );
  return {
    sacredChance,
    sacredRadius: CFG.paladino.sacred.radiusBase + CFG.paladino.sacred.radiusPerLevel * (L - 1),
    shieldCD: Math.max(
      CFG.paladino.shield.cdMin,
      CFG.paladino.shield.cdBase - CFG.paladino.shield.cdPerLevel * (L - 1)
    ),
    healCD: Math.max(
      CFG.paladino.heal.cdMin,
      CFG.paladino.heal.cdBase - CFG.paladino.heal.cdPerLevel * (L - 1)
    ),
    healPct: CFG.paladino.heal.percentBase + CFG.paladino.heal.percentPerLevel * (L - 1)
  };
}

export function palHP(level) {
  return CFG.paladino.hpBase + CFG.paladino.hpPerLevel * (Math.max(1, level) - 1);
}

export function castPalHeal() {
  if (this.className !== 'paladino') return;
  const st = palStats(this.level), pct = st.healPct;
  this.hp = clamp(this.hp + this.hpMax * pct, 0, this.hpMax);
  let ally = null, best = 1e9;
  for (const u of game.units) {
    if (!u.alive || u === this) continue;
    if (!(this.team && u.team && this.team === u.team)) continue;
    const d = new V(u.pos.x - this.pos.x, u.pos.y - this.pos.y).len();
    if (d < best && d <= CFG.paladino.heal.range) { best = d; ally = u; }
  }
  if (ally) {
    ally.hp = clamp(ally.hp + ally.hpMax * pct, 0, ally.hpMax);
  }
  for (let i = 0; i < 10; i++) {
    game.spawnParticle(new Particle(
      this.pos.clone(),
      V.fromAng(Math.random() * Math.PI * 2, 60 + Math.random() * 120),
      0.5,
      CFG.paladino.heal.color
    ));
  }
  game.spawnEffect(new Effect(this.pos.clone(), this.bodyR + 40, 0.5, CFG.paladino.heal.color));
}

export function trySacredStrike(hitPos, baseDealt) {
  if (this.className !== 'paladino') return;
  const st = palStats(this.level);
  let ok = Math.random() < st.sacredChance;
  if (CFG.paladino._forceSacredOnce) { ok = true; CFG.paladino._forceSacredOnce = false; }
  if (!ok) return;
  const dmg = baseDealt * CFG.paladino.sacred.dmgMult;
  game.paladinExplosion(this, hitPos.clone(), st.sacredRadius, dmg);
}

