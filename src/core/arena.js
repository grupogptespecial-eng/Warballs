// Gerencia os limites e a escala da arena de combate

import { CFG } from '../config/cfg.js';

export class Arena {
  constructor(mode = 'simples') {
    this.mode = mode;
    this.scale = 1;
    this.t = 0;
    this.x = 0; this.y = 0; this.w = 0; this.h = 0;
  }

  reset(mode = this.mode) {
    this.mode = mode;
    this.t = 0;
    const cfg = CFG.arenas[mode] || {};
    if (cfg.startScale !== undefined) this.scale = cfg.startScale;
    else this.scale = cfg.scale ?? 1;
  }

  update(dt, fullBounds) {
    const cfg = CFG.arenas[this.mode] || {};
    this.t += dt;
    if (cfg.startScale !== undefined && cfg.endScale !== undefined && cfg.closeDefault) {
      const k = Math.min(1, this.t / cfg.closeDefault);
      this.scale = cfg.startScale + (cfg.endScale - cfg.startScale) * k;
    } else if (cfg.scale !== undefined) {
      this.scale = cfg.scale;
    }
    const fb = fullBounds || { x: 0, y: 0, w: 0, h: 0 };
    const w = fb.w * this.scale;
    const h = fb.h * this.scale;
    this.x = fb.x + (fb.w - w) / 2;
    this.y = fb.y + (fb.h - h) / 2;
    this.w = w;
    this.h = h;
  }

  get bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}

