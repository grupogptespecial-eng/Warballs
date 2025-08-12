// Funções de utilidade geométrica

import { V } from '../math/vec.js';
import { clamp } from './misc.js';

// Desenha um retângulo com cantos arredondados
export function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Reflete o vetor dir em torno da normal
export function reflect(dir, normal) {
  const n = normal.clone();
  const L = n.len();
  if (L < 1e-6) return dir.clone().mul(-1);
  n.mul(1 / L);
  const v = dir.clone();
  const Lv = v.len();
  if (Lv > 1e-6) v.mul(1 / Lv);
  const d = v.dot(n);
  return v.sub(n.mul(2 * d));
}

// Distância de um ponto até um segmento
export function distPointToSegment(p, a, b) {
  const ab = new V(b.x - a.x, b.y - a.y);
  const denom = (ab.x * ab.x + ab.y * ab.y) || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / denom));
  const proj = new V(a.x + ab.x * t, a.y + ab.y * t);
  return new V(p.x - proj.x, p.y - proj.y).len();
}

// Verifica se um ponto está no arco frontal de uma unidade
export function inFrontArc(self, point, halfAngleRad, r) {
  const to = new V(point.x - self.pos.x, point.y - self.pos.y);
  const d = to.len();
  if (d > r || d < 1e-6) return false;
  const f = new V(Math.cos(self.angle), Math.sin(self.angle));
  const dir = to.clone().mul(1 / d);
  const cos = clamp(f.dot(dir), -1, 1);
  const ang = Math.acos(cos);
  return ang <= halfAngleRad;
}

// Determina se um projétil está se aproximando da unidade
export function projApproaching(p, u) {
  const toU = new V(u.pos.x - p.pos.x, u.pos.y - p.pos.y);
  return p.dir.dot(toU) > 0;
}
