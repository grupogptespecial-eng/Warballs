// Desenha miniaturas de arenas em um canvas secundário

import { CFG } from '../config/cfg.js';

export const previewCanvas = document.getElementById('preview');
export const pctx = previewCanvas ? previewCanvas.getContext('2d') : null;

export function drawPreview(mode = 'simples'){
  if (!previewCanvas || !pctx) return;
  const w = previewCanvas.width, h = previewCanvas.height;

  // fundo
  const grd = pctx.createLinearGradient(0,0,0,h);
  grd.addColorStop(0,'#0f1622');
  grd.addColorStop(1,'#0a111b');
  pctx.fillStyle = grd;
  pctx.fillRect(0,0,w,h);

  // grid
  pctx.save();
  pctx.globalAlpha = .22;
  pctx.strokeStyle = CFG.theme.grid;
  const step = 20;
  for (let gx = step; gx < w; gx += step) {
    pctx.beginPath(); pctx.moveTo(gx,0); pctx.lineTo(gx,h); pctx.stroke();
  }
  for (let gy = step; gy < h; gy += step) {
    pctx.beginPath(); pctx.moveTo(0,gy); pctx.lineTo(w,gy); pctx.stroke();
  }
  pctx.restore();

  // moldura
  pctx.save();
  pctx.strokeStyle = CFG.theme.border; pctx.lineWidth = 2;
  pctx.strokeRect(6, 6, w-12, h-12);
  pctx.restore();

  // anéis de arena (start/end)
  let sStart = 1.0, sEnd = 1.0;
  if (mode === 'simples_menor') sStart = sEnd = CFG.arenas.simples_menor.scale;
  if (mode === 'battle_royale') {
    sStart = CFG.arenas.battle_royale.startScale;
    sEnd   = CFG.arenas.battle_royale.endScale;
  }
  const drawRing = (scale, alpha, color) => {
    const ww = Math.round((w-12) * scale), hh = Math.round((h-12) * scale);
    const x = 6 + Math.floor(((w-12) - ww)/2), y = 6 + Math.floor(((h-12) - hh)/2);
    pctx.save(); pctx.globalAlpha = alpha; pctx.strokeStyle = color; pctx.lineWidth = 2;
    pctx.strokeRect(x, y, ww, hh); pctx.restore();
  };
  drawRing(sStart, 0.9, '#7dd3fc');
  if (sEnd !== sStart) drawRing(sEnd, 0.6, '#f59e0b');
}

