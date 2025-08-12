// Funções de UI e depuração

import { TEAM, CLASSES } from '../config/cfg.js';
import { shade, unitListEl } from '../utils/misc.js';

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
  return `
    <option value="barbaro">Bárbaro</option>
    <option value="paladino">Paladino</option>
    <option value="monge">Monge</option>
    <option value="clerigo">Clérigo</option>
    <option value="ranger">Ranger</option>
    <option value="bruxo">Bruxo</option>
    <option value="guerreiro">Guerreiro</option>
  `;
}

export function populateClassSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = optionClassHTML();
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
  const outline = shade(base, -0.70);
  const weaponCol = shade(base, -0.18);
  const cx = W*0.38, cy = H*0.58, r = 16;

  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = base; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = outline; ctx.stroke();

  ctx.save();
  ctx.font = '700 11px system-ui,Segoe UI';
  ctx.fillStyle = '#e6edf7';
  ctx.textAlign='right'; ctx.textBaseline='top';
  ctx.fillText('Lv ' + Math.max(1,Math.min(20,level|0)), W-6, 4);
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  const bodyR = r, tipR = 7, len = 26;
  ctx.lineCap='round';

  const drawSword = () => {
    ctx.fillStyle = weaponCol;
    ctx.beginPath(); ctx.rect(bodyR, -4, len, 8); ctx.fill();
    ctx.fillStyle = shade(base, -0.4);
    ctx.beginPath(); ctx.rect(bodyR-4, -10, 8, 20); ctx.fill();
  };
  const drawMace = () => {
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bodyR,0); ctx.lineTo(bodyR+len- tipR,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(bodyR+len,0, tipR+2, 0, Math.PI*2);
    ctx.fillStyle = '#b6bcc8'; ctx.fill();
  };
  const drawBow  = () => {
    const limb = len+6, bowH = Math.max(10, limb*0.35), x0 = bodyR;
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x0, -bowH);
    ctx.quadraticCurveTo(x0 + limb * 0.65, 0, x0, bowH);
    ctx.stroke();
    ctx.strokeStyle = shade(base, -0.45); ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(x0,-bowH); ctx.lineTo(x0,bowH); ctx.stroke();
  };
  const drawBook = () => {
    ctx.translate(bodyR,0);
    const x0=0,w=18,h=14,sp=4;
    ctx.fillStyle = shade(base,-0.25);
    ctx.beginPath(); ctx.rect(x0,-h/2,w,h); ctx.fill();
    ctx.fillStyle = shade(base,-0.45);
    ctx.beginPath(); ctx.rect(x0,-h/2,sp,h); ctx.fill();
    ctx.globalAlpha=.25; ctx.strokeStyle='#e5d9ff'; ctx.lineWidth=1.2;
    ctx.strokeRect(x0+0.5,-h/2+0.5,w-1,h-1);
  };
  const drawStick = () => {
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bodyR,0); ctx.lineTo(bodyR+len-3,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(bodyR+len,0, 4, 0, Math.PI*2);
    ctx.fillStyle = shade(base, .15); ctx.fill();
  };

  switch(klass){
    case 'paladino': drawSword(); break;
    case 'ranger':   drawBow();   break;
    case 'clerigo':  drawMace();  break;
    case 'barbaro':  drawMace();  break;
    case 'bruxo':    drawBook();  break;
    case 'monge':
      ctx.globalAlpha=.35; ctx.strokeStyle='rgba(160,210,255,0.9)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(0,0, bodyR+4, 0, Math.PI*2); ctx.stroke();
      break;
    case 'guerreiro':
      ctx.strokeStyle = weaponCol; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bodyR-12, 8); ctx.lineTo(bodyR+14, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bodyR+16, 0); ctx.lineTo(bodyR+10, -4); ctx.lineTo(bodyR+10, 4);
      ctx.closePath(); ctx.fillStyle = '#e5e7eb'; ctx.fill();
      break;
    default:         drawStick();  break;
  }
  ctx.restore();
}

// Fallback de classes
export function optionClassHTMLFallback() {
  return `
    <option value="barbaro">Bárbaro</option>
    <option value="paladino">Paladino</option>
    <option value="monge">Monge</option>
    <option value="clerigo">Clérigo</option>
    <option value="ranger">Ranger</option>
    <option value="bruxo">Bruxo</option>
    <option value="guerreiro">Guerreiro</option>
  `;
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
  div.innerHTML = `
    <canvas class="unit-thumb" width="120" height="64"></canvas>
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
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0,0,W,H);

  const grd = ctx.createLinearGradient(0,0,0,H);
  grd.addColorStop(0,'#0f1622'); grd.addColorStop(1,'#0a111b');
  ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);
  ctx.save(); ctx.globalAlpha=.12; ctx.strokeStyle='#1a2640';
  for(let x=10;x<W;x+=10){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=10;y<H;y+=10){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.restore();

  const base = color || '#7dd3fc';
  const outline = shade(base, -0.70);
  const weaponCol = shade(base, -0.18);
  const cx = W*0.38, cy = H*0.58, r = 16;

  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = base; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = outline; ctx.stroke();

  ctx.save();
  ctx.font = '700 11px system-ui,Segoe UI';
  ctx.fillStyle = '#e6edf7';
  ctx.textAlign='right'; ctx.textBaseline='top';
  ctx.fillText('Lv ' + Math.max(1,Math.min(20,level|0)), W-6, 4);
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  const bodyR = r, tipR = 7, len = 26;
  ctx.lineCap='round';

  const drawSword = () => {
    ctx.fillStyle = weaponCol;
    ctx.beginPath(); ctx.rect(bodyR, -4, len, 8); ctx.fill();
    ctx.fillStyle = shade(base, -0.4);
    ctx.beginPath(); ctx.rect(bodyR-4, -10, 8, 20); ctx.fill();
  };
  const drawMace = () => {
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bodyR,0); ctx.lineTo(bodyR+len- tipR,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(bodyR+len,0, tipR+2, 0, Math.PI*2);
    ctx.fillStyle = '#b6bcc8'; ctx.fill();
  };
  const drawBow  = () => {
    const limb = len+6, bowH = Math.max(10, limb*0.35), x0 = bodyR;
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x0, -bowH);
    ctx.quadraticCurveTo(x0 + limb * 0.65, 0, x0, bowH);
    ctx.stroke();
    ctx.strokeStyle = shade(base, -0.45); ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(x0,-bowH); ctx.lineTo(x0,bowH); ctx.stroke();
  };
  const drawBook = () => {
    ctx.translate(bodyR,0);
    const x0=0,w=18,h=14,sp=4;
    ctx.fillStyle = shade(base,-0.25);
    ctx.beginPath(); ctx.rect(x0,-h/2,w,h); ctx.fill();
    ctx.fillStyle = shade(base,-0.45);
    ctx.beginPath(); ctx.rect(x0,-h/2,sp,h); ctx.fill();
    ctx.globalAlpha=.25; ctx.strokeStyle='#e5d9ff'; ctx.lineWidth=1.2;
    ctx.strokeRect(x0+0.5,-h/2+0.5,w-1,h-1);
  };
  const drawStick = () => {
    ctx.strokeStyle = weaponCol; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bodyR,0); ctx.lineTo(bodyR+len-3,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(bodyR+len,0, 4, 0, Math.PI*2);
    ctx.fillStyle = shade(base, .15); ctx.fill();
  };

  switch(klass){
    case 'paladino': drawSword(); break;
    case 'ranger':   drawBow();   break;
    case 'clerigo':  drawMace();  break;
    case 'barbaro':  drawMace();  break;
    case 'bruxo':    drawBook();  break;
    case 'monge':
      ctx.globalAlpha=.35; ctx.strokeStyle='rgba(160,210,255,0.9)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(0,0, bodyR+4, 0, Math.PI*2); ctx.stroke();
      break;
    case 'guerreiro':
      ctx.strokeStyle = weaponCol; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bodyR-12, 8); ctx.lineTo(bodyR+14, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bodyR+16, 0); ctx.lineTo(bodyR+10, -4); ctx.lineTo(bodyR+10, 4);
      ctx.closePath(); ctx.fillStyle = '#e5e7eb'; ctx.fill();
      break;
    default:         drawStick();  break;
  }
  ctx.restore();
}
