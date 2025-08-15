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

// Distância mínima entre dois segmentos
export function distSegmentToSegment(a1, a2, b1, b2) {
  const segmentsIntersect = () => {
    const orient = (p, q, r) => {
      const v = (q.x - p.x) * (r.y - q.y) - (q.y - p.y) * (r.x - q.x);
      if (Math.abs(v) < 1e-9) return 0;
      return v > 0 ? 1 : -1;
    };
    const onSeg = (p, q, r) =>
      Math.min(p.x, r.x) <= q.x && q.x <= Math.max(p.x, r.x) &&
      Math.min(p.y, r.y) <= q.y && q.y <= Math.max(p.y, r.y);

    const o1 = orient(a1, a2, b1);
    const o2 = orient(a1, a2, b2);
    const o3 = orient(b1, b2, a1);
    const o4 = orient(b1, b2, a2);

    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSeg(a1, b1, a2)) return true;
    if (o2 === 0 && onSeg(a1, b2, a2)) return true;
    if (o3 === 0 && onSeg(b1, a1, b2)) return true;
    if (o4 === 0 && onSeg(b1, a2, b2)) return true;
    return false;
  };

  if (segmentsIntersect()) return 0;
  return Math.min(
    distPointToSegment(a1, b1, b2),
    distPointToSegment(a2, b1, b2),
    distPointToSegment(b1, a1, a2),
    distPointToSegment(b2, a1, a2)
  );
}

// Verifica se o movimento de um segmento entre dois quadros colide com um círculo
export function sweepSegmentCircle(prevBase, prevTip, base, tip, p, r, steps = 4) {
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = new V(
      prevBase.x + (base.x - prevBase.x) * t,
      prevBase.y + (base.y - prevBase.y) * t
    );
    const b = new V(
      prevTip.x + (tip.x - prevTip.x) * t,
      prevTip.y + (tip.y - prevTip.y) * t
    );
    if (distPointToSegment(p, a, b) < r) return true;
  }
  return false;
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
