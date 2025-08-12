// Gerencia dimensões da arena e animações de shrink

import { CFG } from '../config/cfg.js';
import { lerp } from '../utils/misc.js';

export class Arena {
  constructor(mode = 'padrao', params = {}) {
    this.reset(mode, params);
  }

  reset(mode = this.mode, params = {}) {
    this.mode = mode;
    this.t = 0;
    const cfg = { ...(CFG.arenas[mode] || {}), ...params };
    if (mode === 'padrao') {
      this.wStart = this.wEnd = cfg.width || 800;
      this.hStart = this.hEnd = cfg.height || 600;
      this.shrinkDelay = 0;
      this.shrinkDuration = 0;
    } else if (mode === 'battle_royale') {
      this.wStart = cfg.widthStart || 800;
      this.hStart = cfg.heightStart || 600;
      this.wEnd = cfg.widthEnd ?? this.wStart;
      this.hEnd = cfg.heightEnd ?? this.hStart;
      this.shrinkDelay = cfg.shrinkDelay || 0;
      this.shrinkDuration = cfg.shrinkDuration || 0;
    } else {
      this.wStart = this.wEnd = cfg.width || 800;
      this.hStart = this.hEnd = cfg.height || 600;
      this.shrinkDelay = 0;
      this.shrinkDuration = 0;
    }
    this.w = this.wStart;
    this.h = this.hStart;
    this.x = 0; this.y = 0;
  }

  update(dt, fullBounds) {
    this.t += dt;
    let w = this.wStart, h = this.hStart;
    if (this.mode === 'battle_royale') {
      if (this.t <= this.shrinkDelay) {
        w = this.wStart; h = this.hStart;
      } else if (this.t <= this.shrinkDelay + this.shrinkDuration && this.shrinkDuration > 0) {
        const prog = (this.t - this.shrinkDelay) / this.shrinkDuration;
        w = lerp(this.wStart, this.wEnd, prog);
        h = lerp(this.hStart, this.hEnd, prog);
      } else {
        w = this.wEnd; h = this.hEnd;
      }
    }
    this.w = w; this.h = h;
    const fb = fullBounds || { x: 0, y: 0, w: 0, h: 0 };
    this.x = fb.x + (fb.w - w) / 2;
    this.y = fb.y + (fb.h - h) / 2;
  }

  get bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
