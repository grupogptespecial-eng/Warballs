// Efeito visual temporário (ex.: explosões, círculos)

export class Effect {
  constructor(pos, radius, life, color, type = 'expand') {
    this.pos = pos.clone();
    this.radius = 0;
    this.maxRadius = radius;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.type = type;
    this.alive = true;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) { this.alive = false; return; }
    if (this.type === 'expand') {
      const progress = 1 - (this.life / this.maxLife);
      this.radius = this.maxRadius * progress;
      if (this.radius < 0) this.radius = 0;
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    const alpha = this.life / this.maxLife;
    ctx.save();
    if (this.radius <= 0) { ctx.restore(); return; }
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

