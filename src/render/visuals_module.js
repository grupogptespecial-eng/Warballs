// Generated visuals module for class items and weapons
import { CLASS_VISUALS, ITEM_ALIASES, CLASS_ITEM_SCALE_DEFAULT, GLOBAL_ITEM_SCALE_MULT, LEVEL_SAFE_RADIUS_MULT, BARBARIAN_PALETTE, CLASSES } from '../config/cfg.js';

export const TAU = Math.PI * 2;

const BAND_PATH = new Path2D("M -160,40 Q -60,-10 0,5 Q 60,-10 160,40 L 160,70 Q 50,60 0,70 Q -50,60 -160,70 Z");
const SKIRT_PATH = new Path2D("M -120,70 L 120,70 Q 40,110 70,140 Q 30,180 0,200 Q -30,180 -70,140 Q -40,110 -120,70 Z");

// Raio base e posições relativas para o colar do monge
const MONK_BEAD_RADIUS = 17.6;
const MONK_BEAD_POSITIONS = [
  { x:   0,  y:  59 },
  { x: -32,  y:  53 },
  { x: -64,  y:  47 },
  { x: -96,  y:  37 },
  { x:  32,  y:  53 },
  { x:  64,  y:  47 },
  { x:  96,  y:  37 }
];

let MONK_BEAD_GRAD = null;
function initMonkBeadGrad(ctx) {
  MONK_BEAD_GRAD = ctx.createRadialGradient(
    -MONK_BEAD_RADIUS * 0.35,
    -MONK_BEAD_RADIUS * 0.35,
    MONK_BEAD_RADIUS * 0.1,
    0,
    0,
    MONK_BEAD_RADIUS
  );
  MONK_BEAD_GRAD.addColorStop(0, '#c47a4a');
  MONK_BEAD_GRAD.addColorStop(0.55, '#8d4d2d');
  MONK_BEAD_GRAD.addColorStop(1, '#4a2416');
}

const druidHornsImg = (typeof Image !== 'undefined') ? new Image() : { complete: false };
if (druidHornsImg.src !== undefined) druidHornsImg.src = 'assets/druida_horns.svg';
const druidStaffImg = (typeof Image !== 'undefined') ? new Image() : { complete: false };
const paladinHelmImg = (typeof Image !== 'undefined') ? new Image() : { complete: false };
if (paladinHelmImg.src !== undefined) paladinHelmImg.src = 'assets/capacete_paladino.svg';
if (druidStaffImg.src !== undefined) druidStaffImg.src = 'assets/druida_staff.svg';

// ===== Helpers
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const hexToRgb=hex=>{const m=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)||[];return{r:parseInt(m[1]||'ff',16),g:parseInt(m[2]||'ff',16),b:parseInt(m[3]||'ff',16)}};
export const rgbToHex=(r,g,b)=>{const h=n=>n.toString(16).padStart(2,'0');return`#${h(clamp(r,0,255))}${h(clamp(g,0,255))}${h(clamp(b,0,255))}`};
export const shade=(hex,k)=>{const {r,g,b}=hexToRgb(hex);const t=k>0?255:0,f=Math.abs(k);return rgbToHex(Math.round(r+(t-r)*f),Math.round(g+(t-g)*f),Math.round(b+(t-b)*f))};
export function rr(ctx,x,y,w,h,r){ if(ctx.roundRect){ctx.beginPath();ctx.roundRect(x,y,w,h,r);return;} const rad=Math.min(r,Math.abs(w)/2,Math.abs(h)/2); ctx.beginPath(); ctx.moveTo(x+rad,y); ctx.arcTo(x+w,y,x+w,y+h,rad); ctx.arcTo(x+w,y+h,x,y+h,rad); ctx.arcTo(x,y+h,x,y,rad); ctx.arcTo(x,y,x+w,y,rad); ctx.closePath(); }

// ===== Micro‑anims
export function applyMicroAnim(ctx, name, t){
  switch(name){
    case 'sway_low': { const amp=2.0, per=2000; ctx.translate(Math.sin(t/per)*amp,0); break; }
    case 'idle_breath': { const s=1+Math.sin(t/2500)*0.02; ctx.scale(s,s); break; }
    case 'subtle_pulse': { const a=0.85+(Math.sin(t/900)+1)*0.06; ctx.globalAlpha*=a; break; }
    case 'soft_glow': { ctx.shadowColor='rgba(255,235,160,0.6)'; ctx.shadowBlur=8+(Math.sin(t/800)+1)*4; break; }
    default: break;
  }
}

// ===== Itens de classe (sprites)
export function drawItemSprite(ctx, id, scale, pal, now){
  const [p1,p2] = pal || ['#ccc','#aaa'];
  const useId = ITEM_ALIASES[id] || id;

  if (useId === 'saia_barbaro') {
    const R = scale * 0.5 * 0.805;
    const s = R / 100; // coordenadas originais usam R=100
    ctx.save();
    ctx.translate(0, -21 * s);
    ctx.scale(s, s);
    const g1 = ctx.createLinearGradient(0, 40, 0, 70);
    g1.addColorStop(0, '#C9935A');
    g1.addColorStop(1, '#8B4A2B');
    ctx.fillStyle = g1;
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(42,27,20,0.75)';
    ctx.fill(BAND_PATH);
    ctx.stroke(BAND_PATH);
    const g2 = ctx.createLinearGradient(0, 70, 0, 200);
    g2.addColorStop(0, '#91502F');
    g2.addColorStop(1, '#6F3F25');
    ctx.fillStyle = g2;
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(42,27,20,0.7)';
    ctx.fill(SKIRT_PATH);
    ctx.stroke(SKIRT_PATH);
    ctx.restore();
    return;
  }

  if (useId === 'colar_monge') {
    if (!MONK_BEAD_GRAD) initMonkBeadGrad(ctx);
    ctx.save();
    const R = scale * 0.5;
    const s = R / 100;
    ctx.scale(s, s);
    ctx.fillStyle = MONK_BEAD_GRAD;
    ctx.strokeStyle = '#3a1d12';
    ctx.lineWidth = 3;
    for (const { x, y } of MONK_BEAD_POSITIONS) {
      ctx.beginPath();
      ctx.arc(x, y, MONK_BEAD_RADIUS, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (useId === 'aljava_pequena') {
    const w=scale*0.175, h=scale*0.475; ctx.rotate(-20*Math.PI/180); rr(ctx,-w*0.5,-h*0.5,w,h,Math.min(6,w*0.3)); const grad=ctx.createLinearGradient(0,-h*0.5,0,h*0.5); grad.addColorStop(0,shade(p1,-0.15)); grad.addColorStop(1,shade(p1,-0.35)); ctx.fillStyle=grad; ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.lineWidth=2; ctx.strokeStyle=shade(p2,0.2); for(let i=0;i<3;i++){ const off=-4+i*4; ctx.beginPath(); ctx.moveTo(off,-h*0.55); ctx.lineTo(off,-h*0.35); ctx.stroke(); } return;
  }

  if (useId === 'insignia_escudo') { const w=scale*0.25, h=scale*0.30; ctx.beginPath(); ctx.moveTo(0,-h*0.5); ctx.quadraticCurveTo(w*0.5,-h*0.2,w*0.35,h*0.2); ctx.quadraticCurveTo(0,h*0.6,-w*0.35,h*0.2); ctx.quadraticCurveTo(-w*0.5,-h*0.2,0,-h*0.5); const g=ctx.createLinearGradient(0,-h*0.5,0,h*0.6); g.addColorStop(0,p1); g.addColorStop(1,shade(p1,-0.35)); ctx.fillStyle=g; ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.lineWidth=2; ctx.strokeStyle=p2; ctx.beginPath(); ctx.moveTo(-w*0.2,-h*0.15); ctx.lineTo(w*0.2,h*0.15); ctx.stroke(); return; }

  if (useId === 'sigilo_sol') { const R=scale*0.14, r=scale*0.05; ctx.beginPath(); ctx.arc(0,0,R,0,TAU); const g=ctx.createRadialGradient(0,0,r*0.6,0,0,R); g.addColorStop(0,p1); g.addColorStop(1,shade(p1,-0.25)); ctx.fillStyle=g; ctx.fill(); ctx.lineWidth=1.1; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.lineWidth=1.4; ctx.strokeStyle=shade(p1,0.15); for(let i=0;i<8;i++){ const a=(i/8)*TAU + Math.sin(now/1100)*0.02; ctx.beginPath(); ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r); ctx.lineTo(Math.cos(a)*R,Math.sin(a)*R); ctx.stroke(); } return; }

  if (useId === 'goggles') {
    ctx.save();
    // counter-rotate so goggles stay horizontal at top anchor
    ctx.rotate(Math.PI / 2);
    const s = scale / 400;
    ctx.scale(s, s);
    // straps
    const strapGradL = ctx.createLinearGradient(-200, 0, -120, 0);
    strapGradL.addColorStop(0, '#5b3b1e');
    strapGradL.addColorStop(1, '#2d1e10');
    ctx.fillStyle = strapGradL;
    rr(ctx, -200, -15, 80, 30, 5);
    ctx.fill();
    const strapGradR = ctx.createLinearGradient(120, 0, 200, 0);
    strapGradR.addColorStop(0, '#5b3b1e');
    strapGradR.addColorStop(1, '#2d1e10');
    ctx.fillStyle = strapGradR;
    rr(ctx, 120, -15, 80, 30, 5);
    ctx.fill();
    // left frame
    const frameGradL = ctx.createLinearGradient(-135, -55, -25, 45);
    frameGradL.addColorStop(0, '#d4a64a');
    frameGradL.addColorStop(1, '#7a5520');
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#5a3b17';
    ctx.fillStyle = frameGradL;
    ctx.beginPath();
    ctx.arc(-80, 0, 55, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // right frame
    const frameGradR = ctx.createLinearGradient(25, -55, 135, 45);
    frameGradR.addColorStop(0, '#d4a64a');
    frameGradR.addColorStop(1, '#7a5520');
    ctx.fillStyle = frameGradR;
    ctx.beginPath();
    ctx.arc(80, 0, 55, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // lenses
    const lensGradL = ctx.createRadialGradient(-80, 0, 0, -80, 0, 35);
    lensGradL.addColorStop(0, '#5de0d6');
    lensGradL.addColorStop(0.6, '#1b7b78');
    lensGradL.addColorStop(1, '#0a3f3d');
    ctx.fillStyle = lensGradL;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0d4d4a';
    ctx.beginPath();
    ctx.arc(-80, 0, 35, 0, TAU);
    ctx.fill();
    ctx.stroke();
    const lensGradR = ctx.createRadialGradient(80, 0, 0, 80, 0, 35);
    lensGradR.addColorStop(0, '#5de0d6');
    lensGradR.addColorStop(0.6, '#1b7b78');
    lensGradR.addColorStop(1, '#0a3f3d');
    ctx.fillStyle = lensGradR;
    ctx.beginPath();
    ctx.arc(80, 0, 35, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // bridge
    const bridgeGrad = ctx.createLinearGradient(-20, -12, 20, 12);
    bridgeGrad.addColorStop(0, '#d4a64a');
    bridgeGrad.addColorStop(1, '#7a5520');
    ctx.fillStyle = bridgeGrad;
    ctx.strokeStyle = '#5a3b17';
    ctx.lineWidth = 3;
    rr(ctx, -20, -12, 40, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (useId === 'chapeu_bardo') {
    ctx.save();
    // keep hat horizontal when anchored on top
    ctx.rotate(Math.PI / 2);
    const s = scale / 520;
    ctx.scale(s, s);
    // brim
    ctx.beginPath();
    ctx.moveTo(-220, 20);
    ctx.bezierCurveTo(-100, -18, 110, -18, 230, 24);
    ctx.lineTo(180, 40);
    ctx.bezierCurveTo(58, 70, -100, 70, -200, 36);
    ctx.closePath();
    ctx.fillStyle = '#199233';
    ctx.strokeStyle = '#0c5f20';
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.stroke();
    // crown
    ctx.beginPath();
    ctx.moveTo(-190, 18);
    ctx.bezierCurveTo(-130, -62, 92, -72, 184, 20);
    ctx.lineTo(108, 44);
    ctx.bezierCurveTo(28, 62, -78, 58, -158, 34);
    ctx.closePath();
    ctx.fillStyle = '#34c14a';
    ctx.fill();
    ctx.stroke();
    // feather
    ctx.save();
    ctx.translate(134, 6);
    ctx.rotate(-18 * Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(86, -36);
    ctx.strokeStyle = '#7b5546';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, -8);
    ctx.bezierCurveTo(36, -30, 74, -42, 112, -44);
    ctx.bezierCurveTo(82, -24, 42, -8, -6, 6);
    ctx.closePath();
    const fg = ctx.createLinearGradient(-4, -8, 112, -44);
    fg.addColorStop(0, '#d7b193');
    fg.addColorStop(1, '#906a55');
    ctx.fillStyle = fg;
    ctx.strokeStyle = '#6b4d42';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    return;
  }

  if (useId === 'ombreira_metal') { const R=scale*0.175; ctx.beginPath(); ctx.arc(0,0,R,-120*Math.PI/180,-10*Math.PI/180); ctx.lineTo(0,0); ctx.closePath(); const g=ctx.createLinearGradient(-R,0,R,0); g.addColorStop(0,shade(p1,-0.35)); g.addColorStop(1,p1); ctx.fillStyle=g; ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.beginPath(); ctx.arc(R*0.6,-R*0.2,scale*0.02,0,TAU); ctx.fillStyle=shade(p1,-0.2); ctx.fill(); return; }

  if (useId === 'chifre_bruxo') {
    const R = scale * 0.5;
    const baseCol = p1 || '#7E57C2';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(R * 0.15, -R * 0.25, R * 0.55, -R * 0.55, R * 0.35, -R * 1.4);
    ctx.bezierCurveTo(R * 0.15, -R * 1.8, -R * 0.1, -R * 1.8, -R * 0.15, -R * 0.9);
    ctx.bezierCurveTo(-R * 0.18, -R * 0.25, -R * 0.05, -R * 0.1, 0, 0);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -R * 1.4, 0, R * 0.1);
    g.addColorStop(0, shade(baseCol, 0.25));
    g.addColorStop(1, shade(baseCol, -0.30));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.stroke();
    return;
  }

  if (useId === 'druida_horns') {
    const w = 900, h = 360;
    const s = scale / w;
    ctx.save();
    ctx.scale(s, s);
    if (druidHornsImg && druidHornsImg.complete) {
      ctx.drawImage(druidHornsImg, -w / 2, -h / 2, w, h);
    }
    ctx.restore();
    return;
  }
  if (useId === 'capacete_paladino') {
    const w = 900, h = 900;
    const s = scale / w;
    ctx.save();
    ctx.scale(s, s);
    if (paladinHelmImg && paladinHelmImg.complete && paladinHelmImg.naturalWidth) {
      ctx.drawImage(paladinHelmImg, -w / 2, -h / 2, w, h);
    }
    ctx.restore();
    return;
  }
}

// ===== Armas
export function drawAxeDoubleBitV2(ctx, S){
  const s = S / 200;
  // cabo de madeira
  rr(ctx, -160 * s, -8 * s, 320 * s, 16 * s, 8 * s);
  const g = ctx.createLinearGradient(0, -8 * s, 0, 8 * s);
  g.addColorStop(0, '#A8743A');
  g.addColorStop(1, '#7E572C');
  ctx.fillStyle = g;
  ctx.fill();
  // junta metálica
  ctx.lineWidth = 2 * s;
  ctx.fillStyle = '#D5D9DF';
  ctx.strokeStyle = '#848C96';
  rr(ctx, 140 * s, -14 * s, 28 * s, 28 * s, 3 * s);
  ctx.fill();
  ctx.stroke();
  // lâminas
  const blade = (tx, ty, rot) => {
    ctx.save();
    ctx.translate(tx * s, ty * s);
    ctx.rotate(rot * Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(0, -20 * s);
    ctx.lineTo(60 * s, -80 * s);
    ctx.lineTo(60 * s, 80 * s);
    ctx.lineTo(0, 20 * s);
    ctx.closePath();
    ctx.fillStyle = '#D5D9DF';
    ctx.strokeStyle = '#848C96';
    ctx.lineWidth = 3 * s;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  blade(154, -17, 270);
  blade(154, 17, 90);
}

export function drawSword(ctx,S,pal){ const [metal,gold]=pal||['#dfe5ee','#e6d27a']; rr(ctx,-S*0.04,-S*0.5,S*0.08,S*0.9,S*0.04); ctx.fillStyle=metal; ctx.fill(); rr(ctx,-S*0.18,-S*0.15,S*0.36,S*0.10,S*0.05); ctx.fillStyle=gold; ctx.fill(); rr(ctx,-S*0.04,S*0.4,S*0.08,S*0.2,S*0.04); ctx.fillStyle=shade(gold,-0.45); ctx.fill(); }
export function drawMace(ctx,unit,S,pal){ const [metal]=pal||['#cfd5dd']; rr(ctx,-S*0.04,-S*0.4,S*0.08,S*0.7,S*0.04); ctx.fillStyle=shade(metal,-0.2); ctx.fill(); ctx.beginPath(); const headR = unit?.weaponTipR ?? S*0.12; ctx.arc(0,-S*0.45,headR,0,TAU); ctx.fillStyle=metal; ctx.fill(); }
export function drawBow(ctx,S,pal){ const [wood,string]=pal||['#6e4a2b','#d9c7b0']; ctx.lineWidth=3; ctx.strokeStyle=shade(wood,-0.1); ctx.beginPath(); ctx.moveTo(-S*0.4,-S*0.4); ctx.quadraticCurveTo(0,0,-S*0.4,S*0.4); ctx.stroke(); ctx.lineWidth=1.6; ctx.strokeStyle=string; ctx.beginPath(); ctx.moveTo(-S*0.4,-S*0.4); ctx.lineTo(-S*0.4,S*0.4); ctx.stroke(); }
export function drawBook(ctx,S,pal){ const [cover,spine]=pal||['#6f5aa3','#4d3f73']; rr(ctx,-S*0.22,-S*0.16,S*0.44,S*0.32,S*0.04); ctx.fillStyle=cover; ctx.fill(); rr(ctx,-S*0.22,-S*0.16,S*0.08,S*0.32,S*0.04); ctx.fillStyle=spine; ctx.fill(); }
export function drawSpear(ctx,S,pal){
  const [metal]=pal||['#dfe5ee'];
  rr(ctx,-S*0.48,-S*0.03,S*0.8,S*0.06,S*0.03);
  ctx.fillStyle=shade(metal,-0.35);
  ctx.fill();
  ctx.strokeStyle=shade(metal,-0.7);
  ctx.lineWidth=S*0.02;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(S*0.4,0);
  ctx.lineTo(S*0.24,-S*0.08);
  ctx.lineTo(S*0.24,S*0.08);
  ctx.closePath();
  const headCol='#9ca3af';
  ctx.fillStyle=headCol;
  ctx.strokeStyle=shade(headCol,-0.4);
  ctx.lineWidth=S*0.02;
  ctx.fill();
  ctx.stroke();
}

export function drawRitmoAura(ctx,a){ ctx.save(); const alpha=Math.max(0,a.t/(a.maxT||1)); ctx.globalAlpha=alpha*0.4; ctx.strokeStyle='#f472b6'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(a.owner.pos.x,a.owner.pos.y,a.radius,0,TAU); ctx.stroke(); ctx.restore(); }

export function drawSharpNote(ctx,S,color='#f472b6'){
  ctx.save();
  ctx.fillStyle=color;
  ctx.strokeStyle=shade(color,-0.3);
  ctx.lineWidth=S*0.08;
  // circle
  ctx.beginPath();
  ctx.arc(-S*0.15,0,S*0.25,0,TAU);
  ctx.fill();
  ctx.stroke();
  // stem and flag
  ctx.beginPath();
  ctx.moveTo(-S*0.02,-S*0.25);
  ctx.lineTo(S*0.35,-S*0.6);
  ctx.lineTo(S*0.35,-S*0.3);
  ctx.lineTo(-S*0.02,-S*0.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawBardNote(ctx,S,color='#7F3EF3'){
  ctx.save();
  ctx.fillStyle=color;
  // body
  ctx.beginPath();
  ctx.ellipse(-S*0.1,S*0.25,S*0.2,S*0.18,-12*Math.PI/180,0,TAU);
  ctx.fill();
  // stem
  rr(ctx,S*0.05,-S*0.5,S*0.07,S*0.82,S*0.03);
  ctx.fill();
  // flag
  ctx.beginPath();
  ctx.moveTo(S*0.12,-S*0.5);
  ctx.bezierCurveTo(S*0.75,-S*0.52,S*0.75,-0.0,S*0.12,S*0.1);
  ctx.bezierCurveTo(S*0.46,-0.02,S*0.41,-0.35,S*0.12,-S*0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawCuttingNote(ctx,S,color='#E11D48'){
  ctx.save();
  ctx.fillStyle=color;
  // heads
  ctx.beginPath();
  ctx.ellipse(-S*0.45,S*0.45,S*0.26,S*0.20,-15*Math.PI/180,0,TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(S*0.45,S*0.45,S*0.26,S*0.20,-15*Math.PI/180,0,TAU);
  ctx.fill();
  // stems
  rr(ctx,-S*0.25,-S*0.2,S*0.1,S*0.88,S*0.05);
  rr(ctx,S*0.35,-S*0.2,S*0.1,S*0.88,S*0.05);
  // beam
  rr(ctx,-S*0.25,-S*0.27,S*0.6,S*0.16,S*0.04);
  ctx.fill();
  ctx.restore();
}

export function drawArcaneCannon(ctx,S,pal){ const [metal,energy,wood]=pal||['#A6B1B8','#7FDBFF','#7E572C']; rr(ctx,-S*0.25,-S*0.12,S*0.3,S*0.24,S*0.05); ctx.fillStyle=shade(wood,-0.2); ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.7)'; ctx.stroke(); ctx.beginPath(); ctx.rect(-S*0.05,-S*0.15,S*0.55,S*0.30); let g=ctx.createLinearGradient(-S*0.05,0,S*0.5,0); g.addColorStop(0,shade(metal,-0.2)); g.addColorStop(1,metal); ctx.fillStyle=g; ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.7)'; ctx.stroke(); ctx.beginPath(); ctx.arc(S*0.5,0,S*0.18,-Math.PI/2,Math.PI/2); ctx.fillStyle=energy; ctx.fill(); ctx.stroke(); }

export function drawFlute(ctx,S,pal){
  const [bodyCol,ringCol]=pal||['#a87c3d','#e0d8c0'];
  const g=ctx.createLinearGradient(-S*0.5,0,S*0.5,0);
  g.addColorStop(0,'#cfa66f');
  g.addColorStop(0.5,'#a87c3d');
  g.addColorStop(1,'#7b5523');
  ctx.fillStyle=g;
  ctx.strokeStyle='#5c3a14';
  ctx.lineWidth=S*0.02;
  rr(ctx,-S*0.5,-S*0.08,S,S*0.16,S*0.08); ctx.fill(); ctx.stroke();
  ctx.fillStyle=ringCol; ctx.strokeStyle='#5c3a14'; ctx.lineWidth=S*0.01;
  const ringW=S*0.04, ringH=S*0.20;
  rr(ctx,-S*0.45,-S*0.1,ringW,ringH,S*0.01); ctx.fill(); ctx.stroke();
  rr(ctx,-S*0.1,-S*0.1,ringW,ringH,S*0.01); ctx.fill(); ctx.stroke();
  rr(ctx,S*0.35,-S*0.1,ringW,ringH,S*0.01); ctx.fill(); ctx.stroke();
  // holes
  ctx.fillStyle='#2b1b09';
  const holes=[-S*0.2,-S*0.1,0,S*0.1,S*0.2];
  for(const x of holes){ ctx.beginPath(); ctx.arc(x,0,S*0.05,0,TAU); ctx.fill(); }
}

export function drawDruidaStaff(ctx,S){
  if (!druidStaffImg || !druidStaffImg.complete) return;
  const w = 260, h = 520;
  const s = S / h;
  ctx.save();
  ctx.scale(s, s);
  ctx.drawImage(druidStaffImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// Mapa para renderização de armas por chave textual
export const WEAPON_DRAWERS = {
  axe: (ctx,S,p,u)=>drawAxeDoubleBitV2(ctx,S,p),
  bow: (ctx,S,p,u)=>drawBow(ctx,S,p),
  sword: (ctx,S,p,u)=>drawSword(ctx,S,p),
  mace: (ctx,S,p,u)=>drawMace(ctx,u,S,p),
  book: (ctx,S,p,u)=>drawBook(ctx,S,p),
  flute: (ctx,S,p,u)=>drawFlute(ctx,S,p),
  arcaneCannon: (ctx,S,p,u)=>drawArcaneCannon(ctx,S,p),
  spear: (ctx,S,p,u)=>drawSpear(ctx,S,p),
  druidaStaff: (ctx,S,p,u)=>drawDruidaStaff(ctx,S,p)
};

// Helper para desenhar a arma de uma unidade a partir de CLASS_VISUALS
export function drawWeapon(ctx, unit){
  const vis = CLASS_VISUALS[unit.className];
  const wv = vis?.weapon;
  if (!wv) return;
  const pal = wv.palette || vis.palette;
  const base = unit.bodyR * 1.2;
  const ang = (unit.angle ?? 0) + (wv.angleDeg ?? 0) * Math.PI / 180;
  const dist = unit.weaponOffset !== undefined ? unit.weaponOffset : unit.bodyR * (wv.distanceFromCenter ?? 1);
  const scale = base * (wv.scale ?? 1);
  const anchor = wv.weaponAnchor || [0,0];
  const key = wv.draw || 'mace';
  const drawFn = WEAPON_DRAWERS[key] || WEAPON_DRAWERS.mace;
  const x = unit.pos.x + Math.cos(ang) * dist;
  const y = unit.pos.y + Math.sin(ang) * dist;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  if (anchor[0] || anchor[1]) ctx.translate(-scale*anchor[0], -scale*anchor[1]);
  drawFn(ctx, scale, pal, unit);
  ctx.restore();
}

// ===== Render Unit (bola + item + arma + nível)
export function renderUnitPreview(ctx, unit, teamColor, now){
  // 1) sombra
  ctx.save(); ctx.globalAlpha=0.35; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(unit.pos.x, unit.pos.y + unit.bodyR*0.72, unit.bodyR*0.9, unit.bodyR*0.35, 0, 0, TAU); ctx.fill(); ctx.restore();
  // 2) corpo
  const base = teamColor || '#8be9fd';
  const outlineCol = shade(base, -0.70);
  ctx.beginPath();
  ctx.arc(unit.pos.x, unit.pos.y, unit.bodyR, 0, TAU);
  ctx.fillStyle = base;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = outlineCol;
  ctx.stroke();
  ctx.globalAlpha = 0.14;
  ctx.beginPath();
  ctx.arc(unit.pos.x - unit.bodyR * 0.35, unit.pos.y - unit.bodyR * 0.35, unit.bodyR * 0.55, 0, TAU);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.globalAlpha = 1;
  // 3) itens
  const cfg=CLASS_VISUALS[unit.className];
  if (cfg){
    const items=cfg.items || [cfg];
    for(const ic of items){
      const pal=ic.palette||[];
      const baseScale=(ic.scale ?? CLASS_ITEM_SCALE_DEFAULT)*(unit.bodyR*2)*GLOBAL_ITEM_SCALE_MULT;
      const iRot=(ic.internalRotationDeg ?? 0)*Math.PI/180;
      if (ic.item==='colar_monge' || (ITEM_ALIASES[ic.item]==='saia_barbaro')){
        ctx.save();
        const offX=unit.bodyR*(ic.itemOffsetX ?? 0);
        const offY=unit.bodyR*(ic.itemOffsetY ?? 0);
        ctx.translate(unit.pos.x+offX,unit.pos.y+offY);
        ctx.rotate(iRot);
        applyMicroAnim(ctx,ic.microAnim,now);
        if (ic.flipX) ctx.scale(-1,1);
        drawItemSprite(ctx,ic.item, baseScale, pal, now);
        ctx.restore();
      } else {
        const safeR=LEVEL_SAFE_RADIUS_MULT*unit.bodyR;
        const anchor=(ic.anchorAngleDeg||0)*Math.PI/180;
        let dist=unit.bodyR*(ic.distanceFromCenter ?? 0.82);
        if(dist<safeR) dist=safeR;
        const offX=unit.bodyR*(ic.itemOffsetX ?? 0);
        const offY=unit.bodyR*(ic.itemOffsetY ?? 0);
        const x=unit.pos.x+Math.cos(anchor)*dist+offX;
        const y=unit.pos.y+Math.sin(anchor)*dist+offY;
        ctx.save();
        ctx.translate(x,y);
        ctx.rotate(anchor);
        ctx.rotate(iRot);
        applyMicroAnim(ctx,ic.microAnim,now);
        if (ic.flipX) ctx.scale(-1,1);
        drawItemSprite(ctx,ic.item,baseScale,pal,now);
        ctx.restore();
      }
    }
  }
  // 4) arma (omitida para classes sem arma)
  drawWeapon(ctx, unit);
  // 5) destaque
  ctx.save(); ctx.globalAlpha=0.25; ctx.beginPath(); ctx.arc(unit.pos.x-unit.bodyR*0.35, unit.pos.y-unit.bodyR*0.35, unit.bodyR*0.45, 0, TAU); ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fill(); ctx.restore();
}

// ===== Testes rápidos (sanidade)
export function runVisualTests(ctx){ const out=[]; const ok=(name)=>out.push(`✔ ${name}`); const err=(name,msg)=>out.push(`✖ ${name}: ${msg}`);
  try{ shade('#112233',0.2); ok('shade'); }catch(e){ err('shade',e.message); }
  try{ rr(ctx,0,0,10,10,2); ok('rr'); }catch(e){ err('rr',e.message); }
  try{ const dummy={className:'barbaro',pos:{x:50,y:50},bodyR:24,level:1}; renderUnitPreview(ctx,dummy,'#8be9fd', performance.now()); ok('renderUnitPreview'); }catch(e){ err('renderUnitPreview',e.message); }
  return out.join('\n');
}

