// Desenha miniaturas de arenas em um canvas secundário

import { CFG } from '../config/cfg.js';

export const previewCanvas = document.getElementById('preview');
export const pctx = previewCanvas ? previewCanvas.getContext('2d') : null;

export function drawPreview(mode = 'padrao', params = {}){
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

  const cfg = { ...(CFG.arenas[mode] || {}), ...params };
  let wStart, hStart, wEnd, hEnd;
  if (mode === 'battle_royale') {
    wStart = cfg.widthStart; hStart = cfg.heightStart;
    wEnd = cfg.widthEnd;   hEnd = cfg.heightEnd;
  } else {
    wStart = wEnd = cfg.width; hStart = hEnd = cfg.height;
  }
  const maxW = Math.max(wStart, wEnd);
  const maxH = Math.max(hStart, hEnd);
  const scale = Math.min((w - 12) / maxW, (h - 12) / maxH);
  const drawRing = (aw, ah, alpha, color) => {
    const ww = Math.round(aw * scale);
    const hh = Math.round(ah * scale);
    const x = 6 + Math.floor(((w - 12) - ww) / 2);
    const y = 6 + Math.floor(((h - 12) - hh) / 2);
    pctx.save(); pctx.globalAlpha = alpha; pctx.strokeStyle = color; pctx.lineWidth = 2;
    pctx.strokeRect(x, y, ww, hh); pctx.restore();
  };
  drawRing(wStart, hStart, 0.9, '#7dd3fc');
  if (wEnd !== wStart || hEnd !== hStart) drawRing(wEnd, hEnd, 0.6, '#f59e0b');
}

