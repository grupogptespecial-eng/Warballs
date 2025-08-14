// Generated visuals module for class items and weapons
export const TAU = Math.PI * 2;
export const LEVEL_SAFE_RADIUS_MULT = 0.42;
export const CLASS_ITEM_SCALE_DEFAULT = 0.15;
export const GLOBAL_ITEM_SCALE_MULT = 1.6; // 160%

// Paleta completa para os elementos do Bárbaro (couro, metal e madeira)
export const BARBARIAN_PALETTE = {
  leatherBase: '#8B4A2B',
  leatherLight: '#C9935A',
  leatherStroke: '#402A1C',
  metal: '#D5D9DF',
  metalStroke: '#848C96',
  woodLight: '#A8743A',
  woodDark: '#7E572C'
};

export const CLASS_VISUALS = {
  barbaro:  { item:'saia_barbaro', scale:0.16, microAnim:'sway_low',   palette:[BARBARIAN_PALETTE.leatherBase,BARBARIAN_PALETTE.leatherLight,BARBARIAN_PALETTE.leatherStroke], weaponOverride:'axe_double_bit_v2', weaponAngleDeg:35 },
  ranger:   { item:'aljava_pequena', anchorAngleDeg:45, scale:0.56, microAnim:'idle_breath', palette:['#4E6B3A','#B89B6B','#2E3B22'], weaponAngleDeg:-25, weaponScale:1.56, weaponOffsetMult:1.2 },
  monge:    { item:'colar_monge',    scale:0.16, palette:[] },
  paladino: { item:'insignia_escudo',anchorAngleDeg:20, scale:0.15, microAnim:'glint_slow',   palette:['#C9C9C9','#E6D27A','#7A6A3A'], weaponAngleDeg:-90, weaponScale:2.0, weaponOffsetMult:1.0 },
  clerigo:  { item:'sigilo_sol',     anchorAngleDeg:330,scale:0.14, microAnim:'soft_glow',    palette:['#FFD67A','#F4B43A','#8A6A2A'], weaponAngleDeg:90, weaponScale:2.0, weaponOffsetMult:1.0 },
  bruxo:    { item:'chifres_duplos', anchorAngleDeg:270,scale:0.18, microAnim:'idle_breath',  palette:['#7E57C2','#A586E8','#40345A'], weaponAngleDeg:-10 },
  artifice: { item:'goggles',        anchorAngleDeg:30, scale:0.16, microAnim:'idle_breath',  palette:['#A6B1B8','#E0E7EA','#3B4A5A'], weaponOverride:'arcane_cannon', weaponAngleDeg:40, weaponScale:1.8 },
  guerreiro:{ item:'ombreira_metal', anchorAngleDeg:210,scale:0.60, microAnim:'sway_low',     palette:['#9BA4AE','#6B757F','#CACFD6'], weaponAngleDeg:15, weaponScale:2.0, weaponOffsetMult:2.2 }
};

// Aliases (compat)
export const ITEM_ALIASES = {
  tanga_barbaro: 'saia_barbaro',
  necklace_monge: 'colar_monge',
  rosario_monge: 'colar_monge'
};

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
    const r = scale * 0.15;
    ctx.save();
    ctx.lineWidth = r * 0.6;
    ctx.strokeStyle = p2;
    ctx.beginPath();
    ctx.moveTo(-r*3,0);
    ctx.lineTo(r*3,0);
    ctx.stroke();
    const lens=(sx)=>{
      const x=sx*r*1.2;
      const grad=ctx.createRadialGradient(x-r*0.3,-r*0.3,r*0.2,x,0,r*1.1);
      grad.addColorStop(0,p1);
      grad.addColorStop(1,shade(p1,-0.25));
      ctx.beginPath();
      ctx.arc(x,0,r,0,TAU);
      ctx.fillStyle=grad;
      ctx.fill();
      ctx.lineWidth=1.2;
      ctx.strokeStyle='rgba(0,0,0,0.75)';
      ctx.stroke();
    };
    lens(-1);
    lens(1);
    ctx.restore();
    return;
  }

  if (useId === 'ombreira_metal') { const R=scale*0.175; ctx.beginPath(); ctx.arc(0,0,R,-120*Math.PI/180,-10*Math.PI/180); ctx.lineTo(0,0); ctx.closePath(); const g=ctx.createLinearGradient(-R,0,R,0); g.addColorStop(0,shade(p1,-0.35)); g.addColorStop(1,p1); ctx.fillStyle=g; ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.beginPath(); ctx.arc(R*0.6,-R*0.2,scale*0.02,0,TAU); ctx.fillStyle=shade(p1,-0.2); ctx.fill(); return; }

  if (useId === 'chifres_duplos') {
    const R = scale * 0.5;
    const baseCol = p1 || '#7E57C2';
    const offsetY = -R * 0.85;
    const spreadX = R * 0.65;
    const horn = (side) => {
      ctx.save();
      ctx.translate(side * spreadX, offsetY);
      ctx.scale(side, 1);
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
      ctx.restore();
    };
    horn(1);
    horn(-1);
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
export function drawMace(ctx,S,pal){ const [metal]=pal||['#cfd5dd']; rr(ctx,-S*0.04,-S*0.4,S*0.08,S*0.7,S*0.04); ctx.fillStyle=shade(metal,-0.2); ctx.fill(); ctx.beginPath(); ctx.arc(0,-S*0.45,S*0.12,0,TAU); ctx.fillStyle=metal; ctx.fill(); }
export function drawBow(ctx,S,pal){ const [wood,string]=pal||['#6e4a2b','#d9c7b0']; ctx.lineWidth=3; ctx.strokeStyle=shade(wood,-0.1); ctx.beginPath(); ctx.moveTo(-S*0.4,-S*0.4); ctx.quadraticCurveTo(0,0,-S*0.4,S*0.4); ctx.stroke(); ctx.lineWidth=1.6; ctx.strokeStyle=string; ctx.beginPath(); ctx.moveTo(-S*0.4,-S*0.4); ctx.lineTo(-S*0.4,S*0.4); ctx.stroke(); }
export function drawBook(ctx,S,pal){ const [cover,spine]=pal||['#6f5aa3','#4d3f73']; rr(ctx,-S*0.22,-S*0.16,S*0.44,S*0.32,S*0.04); ctx.fillStyle=cover; ctx.fill(); rr(ctx,-S*0.22,-S*0.16,S*0.08,S*0.32,S*0.04); ctx.fillStyle=spine; ctx.fill(); }
export function drawSpear(ctx,S,pal){ const [metal]=pal||['#dfe5ee']; rr(ctx,-S*0.48,-S*0.03,S*0.8,S*0.06,S*0.03); ctx.fillStyle=shade(metal,-0.35); ctx.fill(); ctx.beginPath(); ctx.moveTo(S*0.4,0); ctx.lineTo(S*0.24,-S*0.08); ctx.lineTo(S*0.24,S*0.08); ctx.closePath(); ctx.fillStyle='#e5e7eb'; ctx.fill(); }

export function drawArcaneCannon(ctx,S,pal){ const [metal,energy,wood]=pal||['#A6B1B8','#7FDBFF','#7E572C']; rr(ctx,-S*0.25,-S*0.12,S*0.3,S*0.24,S*0.05); ctx.fillStyle=shade(wood,-0.2); ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.7)'; ctx.stroke(); ctx.beginPath(); ctx.rect(-S*0.05,-S*0.15,S*0.55,S*0.30); let g=ctx.createLinearGradient(-S*0.05,0,S*0.5,0); g.addColorStop(0,shade(metal,-0.2)); g.addColorStop(1,metal); ctx.fillStyle=g; ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.7)'; ctx.stroke(); ctx.beginPath(); ctx.arc(S*0.5,0,S*0.18,-Math.PI/2,Math.PI/2); ctx.fillStyle=energy; ctx.fill(); ctx.stroke(); }

// ===== Escolha de arma por classe/override
export function drawWeaponForUnit(ctx, unit, S){ const cfg = CLASS_VISUALS[unit.className] || {}; if (cfg.weaponOverride === 'axe_double_bit_v2') return drawAxeDoubleBitV2(ctx,S,cfg.palette); if (cfg.weaponOverride === 'arcane_cannon') return drawArcaneCannon(ctx,S,cfg.palette); switch(unit.className){ case 'ranger': return drawBow(ctx,S,cfg.palette); case 'paladino': return drawSword(ctx,S,cfg.palette); case 'clerigo': return drawMace(ctx,S,cfg.palette); case 'bruxo': return drawBook(ctx,S,cfg.palette); case 'guerreiro': return drawSpear(ctx,S,cfg.palette); case 'artifice': return drawArcaneCannon(ctx,S,cfg.palette); case 'monge': return; default: return drawMace(ctx,S,cfg.palette); } }

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
  const cfg=CLASS_VISUALS[unit.className]; if (cfg){ const pal=cfg.palette||[]; const baseScale=(cfg.scale ?? CLASS_ITEM_SCALE_DEFAULT)*(unit.bodyR*2)*GLOBAL_ITEM_SCALE_MULT; if (cfg.item==='chifres_duplos' || cfg.item==='colar_monge' || (ITEM_ALIASES[cfg.item]==='saia_barbaro')){ ctx.save(); ctx.translate(unit.pos.x,unit.pos.y); applyMicroAnim(ctx,cfg.microAnim,now); drawItemSprite(ctx,cfg.item, baseScale, pal, now); ctx.restore(); } else { const safeR=LEVEL_SAFE_RADIUS_MULT*unit.bodyR; const anchor=(cfg.anchorAngleDeg||0)*Math.PI/180; let dist=unit.bodyR*0.82; if(dist<safeR) dist=safeR; let x=unit.pos.x+Math.cos(anchor)*dist, y=unit.pos.y+Math.sin(anchor)*dist; ctx.save(); ctx.translate(x,y); ctx.rotate(anchor); applyMicroAnim(ctx,cfg.microAnim,now); drawItemSprite(ctx,cfg.item,baseScale,pal,now); ctx.restore(); } }
  // 4) arma (omitida para classes sem arma, ex.: monge)
  if (unit.className !== 'monge') {
    ctx.save();
    ctx.translate(unit.pos.x, unit.pos.y);
    const wAng = (cfg?.weaponAngleDeg ?? 30) * Math.PI / 180;
    const wScale = unit.bodyR * 1.2 * (cfg?.weaponScale ?? 1);
    const wOff = unit.bodyR * (cfg?.weaponOffsetMult ?? 0.9);
    if (unit.className === 'paladino' || unit.className === 'clerigo') {
      ctx.rotate(0);
      ctx.translate(wOff, 0);
      ctx.rotate(wAng);
    } else {
      ctx.rotate(wAng);
      ctx.translate(wOff, 0);
    }
    drawWeaponForUnit(ctx, unit, wScale);
    ctx.restore();
  }
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

