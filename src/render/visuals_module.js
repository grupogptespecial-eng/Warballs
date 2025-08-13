// Generated visuals module for class items and weapons
export const TAU = Math.PI * 2;
export const LEVEL_SAFE_RADIUS_MULT = 0.42;
export const CLASS_ITEM_SCALE_DEFAULT = 0.15;
export const GLOBAL_ITEM_SCALE_MULT = 1.6; // 160%

export const CLASS_VISUALS = {
  barbaro:  { item:'saia_barbaro', anchorAngleDeg:120, scale:0.16, microAnim:'sway_low',   palette:['#8B4A2B','#C9935A','#402A1C'], weaponOverride:'axe_double_bit_v2', weaponAngleDeg:35 },
  ranger:   { item:'aljava_pequena', anchorAngleDeg:45, scale:0.14, microAnim:'idle_breath', palette:['#4E6B3A','#B89B6B','#2E3B22'], weaponAngleDeg:-25 },
  monge:    { item:'colar_monge',    anchorAngleDeg:300,scale:0.13, microAnim:'subtle_pulse', palette:['#C8A26A','#5E3B21','#E5D7B8'] },
  paladino: { item:'insignia_escudo',anchorAngleDeg:20, scale:0.15, microAnim:'glint_slow',   palette:['#C9C9C9','#E6D27A','#7A6A3A'], weaponAngleDeg:20 },
  clerigo:  { item:'sigilo_sol',     anchorAngleDeg:330,scale:0.14, microAnim:'soft_glow',    palette:['#FFD67A','#F4B43A','#8A6A2A'], weaponAngleDeg:0 },
  bruxo:    { item:'chifres_duplos', anchorAngleDeg:270,scale:0.15, microAnim:'idle_breath',  palette:['#7E57C2','#A586E8','#40345A'], weaponAngleDeg:-10 },
  guerreiro:{ item:'ombreira_metal', anchorAngleDeg:210,scale:0.15, microAnim:'sway_low',     palette:['#9BA4AE','#6B757F','#CACFD6'], weaponAngleDeg:15 }
};

// Aliases (compat)
export const ITEM_ALIASES = { tanga_barbaro: 'saia_barbaro' };

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
    const R = scale*0.5; // scale recebido já é diâmetro; usar metade como base
    const pBase = p1 || '#8B4A2B';
    const pLight= p2 || '#C9935A';
    const top = -R*0.35, w = R*1.9;
    const x0=-w*0.5, x1=w*0.5;
    // Faixa
    ctx.beginPath();
    ctx.moveTo(x0, top);
    ctx.quadraticCurveTo(-w*0.25, top - R*0.18, 0, top - R*0.10);
    ctx.quadraticCurveTo( w*0.25, top - R*0.18, x1, top);
    ctx.lineTo(x1, top + R*0.14);
    ctx.quadraticCurveTo( w*0.10, top + R*0.06, 0, top + R*0.12);
    ctx.quadraticCurveTo(-w*0.10, top + R*0.06, x0, top + R*0.14);
    ctx.closePath();
    let g1=ctx.createLinearGradient(0,top-R*0.2,0,top+R*0.2); g1.addColorStop(0,pLight); g1.addColorStop(1,pBase);
    ctx.fillStyle=g1; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle='rgba(0,0,0,0.7)'; ctx.stroke();
    // Corpo serrilhado
    const h=R*0.9; ctx.beginPath(); ctx.moveTo(x0+R*0.10, top+R*0.12); ctx.lineTo(x1-R*0.10, top+R*0.12);
    const teeth=7, span=(x1-R*0.10)-(x0+R*0.10);
    for(let i=0;i<teeth;i++){ const xx=(x0+R*0.10)+(i+0.5)*(span/teeth); const yy=top+R*0.12+(i%2?h*0.55:h*0.70); ctx.lineTo(xx,yy);} ctx.lineTo(x0+R*0.10, top+R*0.12); ctx.closePath();
    let g2=ctx.createLinearGradient(0,top+R*0.1,0,top+h); g2.addColorStop(0,shade(pBase,0.05)); g2.addColorStop(1,shade(pBase,-0.25)); ctx.fillStyle=g2; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle='rgba(0,0,0,0.65)'; ctx.stroke();
    return;
  }

  if (useId === 'colar_monge') {
    const R=scale*0.46, beads=7, r=scale*0.065; const a0=20*Math.PI/180, a1=160*Math.PI/180;
    for(let i=0;i<beads;i++){ const tt=(beads===1?0.5:i/(beads-1)); const a=a0+(a1-a0)*tt; const x=Math.cos(a)*R, y=Math.sin(a)*R; const grad=ctx.createRadialGradient(x-r*0.35,y-r*0.35,r*0.2,x,y,r*1.1); grad.addColorStop(0,p1); grad.addColorStop(1,'#8f6a3e'); ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fillStyle=grad; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle='rgba(0,0,0,0.7)'; ctx.stroke(); }
    return;
  }

  if (useId === 'aljava_pequena') {
    const w=scale*0.175, h=scale*0.475; ctx.rotate(-20*Math.PI/180); rr(ctx,-w*0.5,-h*0.5,w,h,Math.min(6,w*0.3)); const grad=ctx.createLinearGradient(0,-h*0.5,0,h*0.5); grad.addColorStop(0,shade(p1,-0.15)); grad.addColorStop(1,shade(p1,-0.35)); ctx.fillStyle=grad; ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.lineWidth=2; ctx.strokeStyle=shade(p2,0.2); for(let i=0;i<3;i++){ const off=-4+i*4; ctx.beginPath(); ctx.moveTo(off,-h*0.55); ctx.lineTo(off,-h*0.35); ctx.stroke(); } return;
  }

  if (useId === 'insignia_escudo') { const w=scale*0.25, h=scale*0.30; ctx.beginPath(); ctx.moveTo(0,-h*0.5); ctx.quadraticCurveTo(w*0.5,-h*0.2,w*0.35,h*0.2); ctx.quadraticCurveTo(0,h*0.6,-w*0.35,h*0.2); ctx.quadraticCurveTo(-w*0.5,-h*0.2,0,-h*0.5); const g=ctx.createLinearGradient(0,-h*0.5,0,h*0.6); g.addColorStop(0,p1); g.addColorStop(1,shade(p1,-0.35)); ctx.fillStyle=g; ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.lineWidth=2; ctx.strokeStyle=p2; ctx.beginPath(); ctx.moveTo(-w*0.2,-h*0.15); ctx.lineTo(w*0.2,h*0.15); ctx.stroke(); return; }

  if (useId === 'sigilo_sol') { const R=scale*0.14, r=scale*0.05; ctx.beginPath(); ctx.arc(0,0,R,0,TAU); const g=ctx.createRadialGradient(0,0,r*0.6,0,0,R); g.addColorStop(0,p1); g.addColorStop(1,shade(p1,-0.25)); ctx.fillStyle=g; ctx.fill(); ctx.lineWidth=1.1; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.lineWidth=1.4; ctx.strokeStyle=shade(p1,0.15); for(let i=0;i<8;i++){ const a=(i/8)*TAU + Math.sin(now/1100)*0.02; ctx.beginPath(); ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r); ctx.lineTo(Math.cos(a)*R,Math.sin(a)*R); ctx.stroke(); } return; }

  if (useId === 'ombreira_metal') { const R=scale*0.175; ctx.beginPath(); ctx.arc(0,0,R,-120*Math.PI/180,-10*Math.PI/180); ctx.lineTo(0,0); ctx.closePath(); const g=ctx.createLinearGradient(-R,0,R,0); g.addColorStop(0,shade(p1,-0.35)); g.addColorStop(1,p1); ctx.fillStyle=g; ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.beginPath(); ctx.arc(R*0.6,-R*0.2,scale*0.02,0,TAU); ctx.fillStyle=shade(p1,-0.2); ctx.fill(); return; }

  if (useId === 'chifres_duplos') { const S=scale*0.5; const baseCol=p1||'#7E57C2'; const TILT=12*Math.PI/180, OFF_X=S*0.64, OFF_Y=-S*0.48; const horn=(side)=>{ ctx.save(); ctx.translate(side*OFF_X,OFF_Y); ctx.scale(side,1); ctx.rotate(TILT); ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(S*0.36,-S*0.24,S*0.60,-S*0.60); ctx.quadraticCurveTo(S*0.88,-S*1.16,S*0.48,-S*1.84); ctx.quadraticCurveTo(S*0.12,-S*1.40,-S*0.04,-S*0.72); ctx.quadraticCurveTo(-S*0.04,-S*0.20,0,0); ctx.closePath(); const grad=ctx.createLinearGradient(0,-S,0,S); grad.addColorStop(0,shade(baseCol,0.20)); grad.addColorStop(1,shade(baseCol,-0.35)); ctx.fillStyle=grad; ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.75)'; ctx.stroke(); ctx.restore(); }; horn(1); horn(-1); return; }
}

// ===== Armas
export function drawAxeDoubleBitV2(ctx,S,pal){ const [metal,accent,wood] = pal || ['#cfd5dd','#e7d39e','#7a4b2a']; rr(ctx,-S*0.055,-S*0.64,S*0.11,S*1.28,S*0.07); const cab=ctx.createLinearGradient(0,-S*0.64,0,S*0.64); cab.addColorStop(0,shade(wood,0.12)); cab.addColorStop(1,shade(wood,-0.30)); ctx.fillStyle=cab; ctx.fill(); rr(ctx,-S*0.11,-S*0.12,S*0.22,S*0.24,S*0.05); ctx.fillStyle=shade(metal,-0.22); ctx.fill(); const blade=(sx)=>{ ctx.save(); ctx.scale(sx,1); ctx.beginPath(); ctx.moveTo(S*0.10,0); ctx.quadraticCurveTo(S*0.56,-S*0.30,S*0.58,0); ctx.quadraticCurveTo(S*0.56,S*0.30,S*0.10,0); const grad=ctx.createLinearGradient(S*0.10,-S*0.32,S*0.58,S*0.32); grad.addColorStop(0,shade(metal,-0.06)); grad.addColorStop(1,shade(metal,0.14)); ctx.fillStyle=grad; ctx.fill(); ctx.lineWidth=1.4; ctx.strokeStyle='rgba(0,0,0,0.72)'; ctx.stroke(); ctx.restore(); }; blade(1); blade(-1); ctx.beginPath(); ctx.moveTo(0,-S*0.62); ctx.lineTo(S*0.06,-S*0.38); ctx.lineTo(-S*0.06,-S*0.38); ctx.closePath(); const spike=ctx.createLinearGradient(0,-S*0.62,0,-S*0.38); spike.addColorStop(0,shade(metal,0.12)); spike.addColorStop(1,shade(metal,-0.20)); ctx.fillStyle=spike; ctx.fill(); ctx.lineWidth=1.2; ctx.strokeStyle='rgba(0,0,0,0.7)'; ctx.stroke(); }

export function drawSword(ctx,S,pal){ const [metal,gold]=pal||['#dfe5ee','#e6d27a']; rr(ctx,-S*0.04,-S*0.5,S*0.08,S*0.9,S*0.04); ctx.fillStyle=metal; ctx.fill(); rr(ctx,-S*0.18,-S*0.15,S*0.36,S*0.10,S*0.05); ctx.fillStyle=gold; ctx.fill(); rr(ctx,-S*0.04,S*0.4,S*0.08,S*0.2,S*0.04); ctx.fillStyle=shade(gold,-0.45); ctx.fill(); }
export function drawMace(ctx,S,pal){ const [metal]=pal||['#cfd5dd']; rr(ctx,-S*0.04,-S*0.4,S*0.08,S*0.7,S*0.04); ctx.fillStyle=shade(metal,-0.2); ctx.fill(); ctx.beginPath(); ctx.arc(0,-S*0.45,S*0.12,0,TAU); ctx.fillStyle=metal; ctx.fill(); }
export function drawBow(ctx,S,pal){ const [wood,string]=pal||['#6e4a2b','#d9c7b0']; ctx.lineWidth=3; ctx.strokeStyle=shade(wood,-0.1); ctx.beginPath(); ctx.moveTo(-S*0.4,-S*0.4); ctx.quadraticCurveTo(0,0,-S*0.4,S*0.4); ctx.stroke(); ctx.lineWidth=1.6; ctx.strokeStyle=string; ctx.beginPath(); ctx.moveTo(-S*0.4,-S*0.4); ctx.lineTo(-S*0.4,S*0.4); ctx.stroke(); }
export function drawBook(ctx,S,pal){ const [cover,spine]=pal||['#6f5aa3','#4d3f73']; rr(ctx,-S*0.22,-S*0.16,S*0.44,S*0.32,S*0.04); ctx.fillStyle=cover; ctx.fill(); rr(ctx,-S*0.22,-S*0.16,S*0.08,S*0.32,S*0.04); ctx.fillStyle=spine; ctx.fill(); }
export function drawSpear(ctx,S,pal){ const [metal]=pal||['#dfe5ee']; rr(ctx,-S*0.48,-S*0.03,S*0.8,S*0.06,S*0.03); ctx.fillStyle=shade(metal,-0.35); ctx.fill(); ctx.beginPath(); ctx.moveTo(S*0.4,0); ctx.lineTo(S*0.24,-S*0.08); ctx.lineTo(S*0.24,S*0.08); ctx.closePath(); ctx.fillStyle='#e5e7eb'; ctx.fill(); }

// ===== Escolha de arma por classe/override
export function drawWeaponForUnit(ctx, unit, S){ const cfg = CLASS_VISUALS[unit.className] || {}; if (cfg.weaponOverride === 'axe_double_bit_v2') return drawAxeDoubleBitV2(ctx,S,cfg.palette); switch(unit.className){ case 'ranger': return drawBow(ctx,S,cfg.palette); case 'paladino': return drawSword(ctx,S,cfg.palette); case 'clerigo': return drawMace(ctx,S,cfg.palette); case 'bruxo': return drawBook(ctx,S,cfg.palette); case 'guerreiro': return drawSpear(ctx,S,cfg.palette); default: return drawMace(ctx,S,cfg.palette); } }

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
  const cfg=CLASS_VISUALS[unit.className]; if (cfg){ const pal=cfg.palette||[]; if (cfg.item==='chifres_duplos' || cfg.item==='colar_monge' || (ITEM_ALIASES[cfg.item]==='saia_barbaro')){ ctx.save(); ctx.translate(unit.pos.x,unit.pos.y); applyMicroAnim(ctx,cfg.microAnim,now); drawItemSprite(ctx,cfg.item, unit.bodyR*2*GLOBAL_ITEM_SCALE_MULT, pal, now); ctx.restore(); } else { const safeR=LEVEL_SAFE_RADIUS_MULT*unit.bodyR; const anchor=(cfg.anchorAngleDeg||0)*Math.PI/180; let dist=unit.bodyR*0.82; if(dist<safeR) dist=safeR; let x=unit.pos.x+Math.cos(anchor)*dist, y=unit.pos.y+Math.sin(anchor)*dist; const scale=(cfg.scale ?? CLASS_ITEM_SCALE_DEFAULT)*(unit.bodyR*2)*GLOBAL_ITEM_SCALE_MULT; ctx.save(); ctx.translate(x,y); ctx.rotate(anchor); applyMicroAnim(ctx,cfg.microAnim,now); drawItemSprite(ctx,cfg.item,scale,pal,now); ctx.restore(); } }
  // 4) arma
  ctx.save();
  ctx.translate(unit.pos.x, unit.pos.y);
  const wAng = ((cfg && cfg.weaponAngleDeg) || 30) * Math.PI / 180;
  ctx.rotate(wAng);
  ctx.translate(unit.bodyR * 0.9, 0);
  drawWeaponForUnit(ctx, unit, unit.bodyR * 1.2);
  ctx.restore();
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

