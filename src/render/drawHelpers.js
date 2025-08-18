// Funções auxiliares de renderização

import { CFG } from '../config/cfg.js';
import { g } from '../core/game.js';

// Ruído leve para texturas
let _noisePat = null;
export function ensureNoise(ctx) {
  if (_noisePat) return _noisePat;
  const n = document.createElement('canvas');
  n.width = n.height = 128;
  const ng = n.getContext('2d');
  const img = ng.createImageData(n.width, n.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 220 + Math.floor(Math.random() * 35);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ng.putImageData(img, 0, 0);
  _noisePat = ctx.createPattern(n, 'repeat');
  return _noisePat;
}

let _noisePatFallback = null;
export function ensureNoiseFallback(ctx) {
  if (_noisePatFallback) return _noisePatFallback;
  const n = document.createElement('canvas');
  n.width = n.height = 128;
  const ng = n.getContext('2d');
  const img = ng.createImageData(n.width, n.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 220 + Math.floor(Math.random() * 35);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ng.putImageData(img, 0, 0);
  _noisePatFallback = ctx.createPattern(n, 'repeat');
  return _noisePatFallback;
}

export const ensureNoiseAny = (ctx) =>
  (typeof window !== 'undefined' && typeof window.ensureNoise === 'function')
    ? window.ensureNoise(ctx)
    : ensureNoiseFallback(ctx);

// Desenha a área de jogo
export function drawArenaRect(bounds){
  if (!g || !bounds) return;
  const {x, y, w, h} = bounds;

  const bg = g.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, CFG.theme.bg);
  bg.addColorStop(1, CFG.theme.bg2);
  g.fillStyle = bg;
  g.fillRect(x, y, w, h);

  g.save();
  g.globalAlpha = .22;
  g.strokeStyle = CFG.theme.grid;
  const step = 24;
  for (let gx = x + step; gx < x + w; gx += step) {
    g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke();
  }
  for (let gy = y + step; gy < y + h; gy += step) {
    g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke();
  }
  g.restore();

  g.save();
  g.globalAlpha = .08;
  g.strokeStyle = CFG.theme.border;
  g.lineWidth = 6;
  g.strokeRect(x + 3, y + 3, w - 6, h - 6);
  g.restore();
}

// Fundo radial do canvas principal
export function drawBackground(w, h) {
  if (!g || w <= 0 || h <= 0) return;
  const rad = g.createRadialGradient(
    w*0.5, h*0.5, Math.min(w,h)*0.12,
    w*0.5, h*0.5, Math.min(w,h)*0.65
  );
  rad.addColorStop(0, CFG.theme.bg);
  rad.addColorStop(1, CFG.theme.bg2);
  g.fillStyle = rad;
  g.fillRect(0, 0, w, h);
}
