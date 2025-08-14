import { CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { clamp } from '../utils/misc.js';

// Sistema de crates independente para spawns de vida e experiência
export const CrateSystem = {
  crates: [],
  config: CFG.crates,
  deps: {
    getArenaBounds: () => ({ x: 0, y: 0, w: 0, h: 0 }),
    queryUnits: () => [],
    rng: Math.random,
    now: () => (typeof performance !== 'undefined' ? performance.now() / 1000 : Date.now() / 1000)
  },

  init(opts = {}) {
    this.deps = { ...this.deps, ...opts };
  },

  setConfig(cfg) {
    this.config = { ...this.config, ...cfg };
  },

  clearAll() {
    this.crates = [];
  },

  update(dt) {
    const bounds = this.deps.getArenaBounds();
    const types = ['health', 'xp', 'hybrid'];
    for (const t of types) {
      const cfg = this.config[t];
      if (cfg?.enabled) this.maybeSpawn(t.toUpperCase(), cfg, dt, bounds);
    }

    const now = this.deps.now();
    for (const c of this.crates) {
      // lifetime
      if (now - c.spawnTime >= c.lifetime) c.remove = true;

      // battle royale shrink policy
      if (!this.insideBounds(c.pos, c.size, bounds)) {
        const policy = this.config.brCratePolicyOnShrink;
        if (policy === 'despawn') {
          c.remove = true;
        } else if (policy === 'pushInwards') {
          c.pos.x = clamp(c.pos.x, bounds.x + c.size / 2, bounds.x + bounds.w - c.size / 2);
          c.pos.y = clamp(c.pos.y, bounds.y + c.size / 2, bounds.y + bounds.h - c.size / 2);
        } else if (policy === 'disableOutside') {
          if (c.state !== 'DISABLED') {
            c.state = 'DISABLED';
            c.disableTimer = 5;
          }
        }
      }

      if (c.state === 'DISABLED') {
        c.disableTimer -= dt;
        if (c.disableTimer <= 0) c.remove = true;
      }
    }

    this.crates = this.crates.filter(c => !c.remove);
  },

  count(kind) {
    return this.crates.filter(c => c.kind === kind).length;
  },

  maybeSpawn(kind, cfg, dt, bounds) {
    if (this.count(kind) >= cfg.maxConcurrent) return;
    const lambda = cfg.avgPer100s / 100;
    const p = 1 - Math.exp(-lambda * dt);
    while (this.deps.rng() < p) {
      const pos = this.samplePos(bounds, cfg.sizePx);
      if (!pos) break;
      this.crates.push({
        id: `${kind}-${Math.random().toString(36).slice(2)}`,
        kind,
        pos,
        size: cfg.sizePx,
        healAmount: cfg.healAmount || 0,
        xpAmount: cfg.xpAmount || 0,
        spawnTime: this.deps.now(),
        lifetime: cfg.lifetime,
        state: 'ACTIVE'
      });
    }
  },

  samplePos(bounds, size) {
    for (let i = 0; i < 20; i++) {
      const x = bounds.x + size / 2 + this.deps.rng() * (bounds.w - size);
      const y = bounds.y + size / 2 + this.deps.rng() * (bounds.h - size);
      const pos = new V(x, y);
      if (this.validSpawn(pos, size)) return pos;
    }
    return null;
  },

  validSpawn(pos, size) {
    const units = this.deps.queryUnits();
    for (const u of units) {
      const d = Math.hypot(pos.x - u.pos.x, pos.y - u.pos.y);
      if (d < (u.bodyR || 0) + this.config.minDistanceFromUnits + size / 2) return false;
    }
    for (const c of this.crates) {
      const d = Math.hypot(pos.x - c.pos.x, pos.y - c.pos.y);
      if (d < this.config.minDistanceBetweenCrates + (c.size + size) / 2) return false;
    }
    return true;
  },

  tryPickup(unit) {
    let picked = false;
    this.crates = this.crates.filter(c => {
      if (c.state !== 'ACTIVE') return true;
      if (this.collideUnit(c, unit)) {
        if (c.healAmount) {
          unit.hp = clamp(unit.hp + c.healAmount, 0, unit.hpMax);
        }
        if (c.xpAmount) unit.addXP?.(c.xpAmount);
        picked = true;
        return false;
      }
      return true;
    });
    return picked;
  },

  collideUnit(crate, unit) {
    const half = crate.size / 2;
    const dx = Math.max(Math.abs(unit.pos.x - crate.pos.x) - half, 0);
    const dy = Math.max(Math.abs(unit.pos.y - crate.pos.y) - half, 0);
    return dx * dx + dy * dy <= unit.bodyR * unit.bodyR;
  },

  render(ctx) {
    for (const c of this.crates) {
      ctx.save();
      ctx.translate(c.pos.x, c.pos.y);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#2c3e50';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 2;

      if (c.state === 'DISABLED') {
        ctx.fillStyle = '#7f8c8d';
        this.drawPolygon(ctx, 4, c.size / 2);
      } else if (c.kind === 'HEALTH') {
        ctx.fillStyle = '#2ECC71';
        this.drawPolygon(ctx, 4, c.size / 2);
      } else if (c.kind === 'XP') {
        ctx.fillStyle = '#3498DB';
        this.drawPolygon(ctx, 6, c.size / 2);
      } else {
        const grad = ctx.createLinearGradient(-c.size / 2, -c.size / 2, c.size / 2, c.size / 2);
        grad.addColorStop(0, '#2ECC71');
        grad.addColorStop(1, '#3498DB');
        ctx.fillStyle = grad;
        this.drawPolygon(ctx, 8, c.size / 2);
      }

      ctx.fill();
      ctx.stroke();

      if (c.state !== 'DISABLED') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let txt = '';
        if (c.healAmount && c.xpAmount) txt = `${c.healAmount}/${c.xpAmount}`;
        else if (c.healAmount) txt = `${c.healAmount}`;
        else if (c.xpAmount) txt = `${c.xpAmount}`;
        ctx.fillText(txt, 0, 0);
      }

      ctx.restore();
    }
  },

  drawPolygon(ctx, sides, r) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
};

CrateSystem.insideBounds = function (pos, size, b) {
  return (
    pos.x - size / 2 >= b.x &&
    pos.x + size / 2 <= b.x + b.w &&
    pos.y - size / 2 >= b.y &&
    pos.y + size / 2 <= b.y + b.h
  );
};
