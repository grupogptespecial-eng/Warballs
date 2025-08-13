// Vetor bidimensional com operações básicas
export class V {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  clone() { return new V(this.x, this.y); }
  set(x, y) { this.x = x; this.y = y; return this; }
  add(v) { this.x += v.x; this.y += v.y; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; return this; }
  mul(s) { this.x *= s; this.y *= s; return this; }
  len2() { return this.x * this.x + this.y * this.y; }
  len() { return Math.hypot(this.x, this.y); }
  nrm() { const l = this.len() || 1; this.x /= l; this.y /= l; return this; }
  dot(v) { return this.x * v.x + this.y * v.y; }
  ang() { return Math.atan2(this.y, this.x); }
  rot(a) {
    const c = Math.cos(a), s = Math.sin(a);
    const nx = this.x * c - this.y * s;
    const ny = this.x * s + this.y * c;
    this.x = nx; this.y = ny; return this;
  }
  static fromAng(a, m = 1) { return new V(Math.cos(a) * m, Math.sin(a) * m); }
}

