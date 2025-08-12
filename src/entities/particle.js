// Partícula de efeito visual simples

export class Particle {
  constructor(p, v, life, color) {
    this.p = p.clone();
    this.v = v.clone();
    this.life = life;
    this.color = color;
    this.alive = true;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
    this.p.add(this.v.clone().mul(dt));
    this.v.mul(0.98);
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.p.x, this.p.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

