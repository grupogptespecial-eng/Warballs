// Funções de UI e depuração

import { TEAM, CLASSES, CFG, WEAPON_VISUALS } from '../config/cfg.js';
import { unitListEl } from '../utils/misc.js';
import { renderUnitPreview, druidHornsImg, druidStaffImg, paladinHelmImg, warriorShoulderImg, clericMaceImg, paladinSwordImg, warlockBookImg } from '../render/visuals_module.js';
import { game } from '../core/game.js';

// Exibe uma mensagem simples de overlay
export function showMessage(msg) {
  const msgBox = document.getElementById('message-box');
  const msgContent = document.getElementById('message-content');
  if (msgBox && msgContent) {
    msgContent.textContent = msg;
    msgBox.style.display = 'block';
  }
}

export function hideMessage() {
  const msgBox = document.getElementById('message-box');
  if (msgBox) msgBox.style.display = 'none';
}

// Opções de classes para selects
export function optionClassHTML() {
  return Object.entries(CLASSES)
    .map(([id, cfg]) => `<option value="${id}">${cfg.label}</option>`)
    .join('\n');
}

export function populateClassSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = optionClassHTML();
}

function buildPreviewUnit(klass, level, x, y){
  const base = CLASSES[klass] || {};
  const u = {
    className: klass,
    pos: { x, y },
    bodyR: CFG.body.radius,
    level,
    angle: 0,
    color: base.color,
    weaponLen: base.weaponLen ?? CFG.weapon.length,
    weaponTipR: base.tipRadius ?? CFG.weapon.tipRadius,
    omega: base.omega ?? CFG.weapon.omega,
    hasRanged: !!base.hasRanged,
    cooldownMiraPercent: base.cooldownMiraPercent || 0,
    weaponOffset: CFG.body.radius
  };
  const wv = WEAPON_VISUALS[klass];
  const wcfg = Array.isArray(wv) ? wv[0] : wv;
  if (wcfg) {
    if (typeof wcfg.distanceFromCenter === 'number') {
      u.weaponOffset = u.bodyR * wcfg.distanceFromCenter;
    }
    if (wcfg.weaponReach != null) u.weaponLen = wcfg.weaponReach;
    if (wcfg.weaponRadius != null) u.weaponTipR = wcfg.weaponRadius;
  }
  return u;
}

// Renderiza thumbnail de uma unidade (versão isolada)
export function drawUnitThumb(ctx, klass, color, level){
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0,0,W,H);

  const grd = ctx.createLinearGradient(0,0,0,H);
  grd.addColorStop(0,'#0f1622'); grd.addColorStop(1,'#0a111b');
  ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.globalAlpha=.12; ctx.strokeStyle='#1a2640';
  for(let x=10;x<W;x+=10){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=10;y<H;y+=10){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.restore();

  const base = color || (CLASSES[klass]?.color || '#7dd3fc');
  const cx = W*0.38, cy = H*0.58;
  const unit = buildPreviewUnit(klass, level, cx, cy);
  renderUnitPreview(ctx, unit, base, performance.now());

  if (game.showHitboxes) {
    const baseP = {
      x: unit.pos.x + Math.cos(unit.angle) * unit.weaponOffset,
      y: unit.pos.y + Math.sin(unit.angle) * unit.weaponOffset
    };
    const tipP = {
      x: unit.pos.x + Math.cos(unit.angle) * (unit.weaponOffset + unit.weaponLen),
      y: unit.pos.y + Math.sin(unit.angle) * (unit.weaponOffset + unit.weaponLen)
    };
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#0f0';
    ctx.beginPath();
    ctx.moveTo(baseP.x, baseP.y);
    ctx.lineTo(tipP.x, tipP.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tipP.x, tipP.y, unit.weaponTipR, 0, Math.PI * 2);
    ctx.stroke();
    const noBack = unit.className === 'monge' || unit.className === 'ladino' ||
      (unit.className === 'druida' && unit.dru?.bear?.active);
    if (!noBack) {
      // backstab wedge for preview
      const backW = Math.PI / 3;
      const r = unit.bodyR * 6;
      ctx.strokeStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(unit.pos.x, unit.pos.y);
      ctx.arc(unit.pos.x, unit.pos.y, r, unit.angle + Math.PI - backW, unit.angle + Math.PI + backW);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  const missing=[];
  if(klass==='druida'){
    if(!druidHornsImg.complete||!druidHornsImg.naturalWidth) missing.push(druidHornsImg);
    if(!druidStaffImg.complete||!druidStaffImg.naturalWidth) missing.push(druidStaffImg);
  }
  if(klass==='paladino'){
    if(!paladinHelmImg.complete||!paladinHelmImg.naturalWidth) missing.push(paladinHelmImg);
    if(!paladinSwordImg.complete||!paladinSwordImg.naturalWidth) missing.push(paladinSwordImg);
  }
  if(klass==='clerigo'&&(!clericMaceImg.complete||!clericMaceImg.naturalWidth)) missing.push(clericMaceImg);
  if(klass==='bruxo'&&(!warlockBookImg.complete||!warlockBookImg.naturalWidth)) missing.push(warlockBookImg);
  if(klass==='guerreiro'&&(!warriorShoulderImg.complete||!warriorShoulderImg.naturalWidth)) missing.push(warriorShoulderImg);
  for(const img of missing){
    img.addEventListener('load',()=>drawUnitThumb(ctx,klass,color,level),{once:true});
  }

  ctx.save();
  ctx.font = '700 11px system-ui,Segoe UI';
  ctx.fillStyle = '#e6edf7';
  ctx.textAlign='right'; ctx.textBaseline='top';
  ctx.fillText('Lv ' + Math.max(1,Math.min(20,level|0)), W-6, 4);
  ctx.restore();
}

// Fallback de classes
export function optionClassHTMLFallback() {
  return optionClassHTML();
}

export function getClassOptionsHTML() {
  if (typeof window !== 'undefined' && typeof window.optionClassHTML === 'function') {
    return window.optionClassHTML();
  }
  return optionClassHTMLFallback();
}

// Times (gerados dinamicamente a partir de TEAM)
export function optionTeamHTML() {
  return Object.entries(TEAM)
    .map(([key, t]) => `<option value="${key}">${t.emoji || ''} ${t.name}</option>`)
    .join('');
}

// Adiciona um bloco de unidade à lista
export function addUnitRow(preset) {
  const div = document.createElement('div');
  div.className = 'unit-item pretty';

  const classOptions = getClassOptionsHTML();
  const scale = CFG.body.radius / 16; // matches gameplay body size
  const thumbW = Math.round(120 * scale);
  const thumbH = Math.round(64 * scale);
  div.innerHTML = `
    <canvas class="unit-thumb" width="${thumbW}" height="${thumbH}" style="width:${thumbW}px;height:${thumbH}px"></canvas>
    <div class="unit-fields">
      <select class="unit-class">${classOptions}</select>
      <select class="unit-team">${optionTeamHTML()}</select>
      <span class="team-swatch"></span>
      <input type="number" min="1" max="20" value="${preset?.level || 1}" class="unit-level"/>
      <button class="kill" title="Remover">✕</button>
    </div>
  `;

  if (preset?.team)  div.querySelector('.unit-team').value  = preset.team;
  if (preset?.klass) div.querySelector('.unit-class').value = preset.klass;

  div.querySelector('.kill').onclick = () => div.remove();

  wireUnitRow(div);

  unitListEl.appendChild(div);
  return div;
}

// Liga eventos e pinta o thumbnail
export function wireUnitRow(div){
  const clsSel = div.querySelector('.unit-class');
  const teamSel = div.querySelector('.unit-team');
  const lvlInp = div.querySelector('.unit-level');
  const swatch = div.querySelector('.team-swatch');
  const thumb  = div.querySelector('.unit-thumb');
  const ctx    = thumb.getContext('2d');

  const paint = () => {
    const team = TEAM[teamSel.value] || { color:'#7dd3fc' };
    swatch.style.backgroundColor = team.color;
    drawUnitThumbRow(ctx, clsSel.value, team.color, parseInt(lvlInp.value||1,10));
  };

  clsSel.addEventListener('change', paint);
  teamSel.addEventListener('change', paint);
  lvlInp.addEventListener('input', paint);

  paint();
}

// Mini-render para o row de unidade
export function drawUnitThumbRow(ctx, klass, color, level){
  drawUnitThumb(ctx, klass, color, level);
}

// ===== Painel de Crates =====
const CRATE_KEY = 'crateConfig_v2';

export function populateCratePanel(){
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(CRATE_KEY) : null;
  const cfg = stored ? JSON.parse(stored) : CFG.crates;
  const types = ['health','xp','hybrid'];
  const setVal = (id,val)=>{ const el=document.getElementById(id); if(el) el.value=val; };
  types.forEach(t=>{
    const cap = t[0].toUpperCase()+t.slice(1);
    const enable = document.getElementById(`enable${cap}Crates`);
    const panel  = document.getElementById(`cfg${cap}Crate`);
    const tc = cfg[t];
    if(!enable||!panel||!tc) return;
    enable.checked = tc.enabled;
    panel.style.display = enable.checked ? 'block' : 'none';
    enable.addEventListener('change',()=>{ panel.style.display = enable.checked ? 'block' : 'none'; save(); });
    setVal(`${t}Avg`, tc.avgPer100s);
    setVal(`${t}Lifetime`, tc.lifetime);
    setVal(`${t}Max`, tc.maxConcurrent);
    if(tc.healAmount !== undefined) setVal(`${t}Heal`, tc.healAmount);
    if(tc.xpAmount !== undefined) setVal(`${t}Xp`, tc.xpAmount);
  });

  document.getElementById('btnCrateReset')?.addEventListener('click',()=>{
    if(typeof localStorage!=='undefined') localStorage.removeItem(CRATE_KEY);
    populateCratePanel();
  });
  const inputs=document.querySelectorAll('#panelCrates input');
  inputs.forEach(inp=>inp.addEventListener('input',save));

  function save(){
    if(typeof localStorage==='undefined') return;
    localStorage.setItem(CRATE_KEY, JSON.stringify(readCrateConfig()));
  }
}

export function readCrateConfig(){
  const getNum=id=>parseFloat(document.getElementById(id)?.value||'0');
  const build=t=>{
    const cap = t[0].toUpperCase()+t.slice(1);
    const base = CFG.crates[t] || {};
    const obj={
      enabled: document.getElementById(`enable${cap}Crates`)?.checked || false,
      avgPer100s:getNum(`${t}Avg`),
      lifetime:getNum(`${t}Lifetime`),
      maxConcurrent:getNum(`${t}Max`),
      sizePx: base.sizePx
    };
    if(t!=='xp') obj.healAmount = getNum(`${t}Heal`);
    if(t!=='health') obj.xpAmount = getNum(`${t}Xp`);
    return obj;
  };
  return {
    health: build('health'),
    xp: build('xp'),
    hybrid: build('hybrid'),
    minDistanceFromUnits: CFG.crates.minDistanceFromUnits,
    minDistanceBetweenCrates: CFG.crates.minDistanceBetweenCrates,
    brCratePolicyOnShrink: CFG.crates.brCratePolicyOnShrink
  };
}
