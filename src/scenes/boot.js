import { game } from '../core/game.js';
import { startLoop, stopLoop } from '../core/loop.js';
import { addUnitRow } from '../ui/debugOverlay.js';
import { unitListEl, btnAddUnit, arenaNameEl } from '../utils/misc.js';
import { Unit } from '../unit/unit.js';
import { TEAM, CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';
import { drawPreview } from '../render/preview.js';

function gatherUnits() {
  const rows = unitListEl ? unitListEl.querySelectorAll('.unit-item') : [];
  const list = [];
  let id = 0;
  rows.forEach(row => {
    const cls = row.querySelector('.unit-class')?.value || 'ranger';
    const team = row.querySelector('.unit-team')?.value || 'Y';
    const lvl = parseInt(row.querySelector('.unit-level')?.value || '1', 10);
    const color = TEAM[team]?.color || '#7dd3fc';
    const pos = new V(
      game.bounds.x + Math.random() * game.bounds.w,
      game.bounds.y + Math.random() * game.bounds.h
    );
    const u = new Unit(id++, pos, color);
    u.team = team;
    u.className = cls;
    u.level = lvl;
    u.applyClassDefaults();
    list.push(u);
  });
  return list;
}

function getArenaParams(mode) {
  if (mode === 'battle_royale') {
    return {
      widthStart: parseFloat(document.getElementById('arenaWidthStart')?.value || CFG.arenas.battle_royale.widthStart),
      heightStart: parseFloat(document.getElementById('arenaHeightStart')?.value || CFG.arenas.battle_royale.heightStart),
      widthEnd: parseFloat(document.getElementById('arenaWidthEnd')?.value || CFG.arenas.battle_royale.widthEnd),
      heightEnd: parseFloat(document.getElementById('arenaHeightEnd')?.value || CFG.arenas.battle_royale.heightEnd),
      shrinkDelay: parseFloat(document.getElementById('shrinkDelay')?.value || CFG.arenas.battle_royale.shrinkDelay),
      shrinkDuration: parseFloat(document.getElementById('shrinkDuration')?.value || CFG.arenas.battle_royale.shrinkDuration)
    };
  }
  return {
    width: parseFloat(document.getElementById('arenaWidth')?.value || CFG.arenas.padrao.width),
    height: parseFloat(document.getElementById('arenaHeight')?.value || CFG.arenas.padrao.height)
  };
}

function startGame() {
  const mode = document.getElementById('arena')?.value || 'padrao';
  const params = getArenaParams(mode);
  game.arena.reset(mode, params);
  game.arena.update(0, { x: 0, y: 0, w: game.canvas.width, h: game.canvas.height });
  game.bounds = game.arena.bounds;

  game.units = [];
  game.projectiles = [];
  game.effects = [];
  game.particles = [];
  game.summons = [];
  const units = gatherUnits();
  units.forEach(u => game.spawnUnit(u));
  startLoop();
}

function resetGame() {
  stopLoop();
  game.units = [];
  game.projectiles = [];
  game.effects = [];
  game.particles = [];
  game.summons = [];
}

export function boot() {
  // arena select e configuração
  const arenaSel = document.getElementById('arena');
  const cfgStd = document.getElementById('cfgStandard');
  const cfgBR = document.getElementById('cfgBR');
  function updateArenaForm() {
    const mode = arenaSel.value;
    if (cfgStd) cfgStd.style.display = mode === 'padrao' ? '' : 'none';
    if (cfgBR) cfgBR.style.display = mode === 'battle_royale' ? '' : 'none';
    arenaNameEl && (arenaNameEl.textContent = arenaSel.options[arenaSel.selectedIndex]?.textContent || '');
    drawPreview(mode, getArenaParams(mode));
  }
  if (arenaSel) {
    Object.entries(CFG.arenas).forEach(([key, cfg]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = cfg.name || key;
      arenaSel.appendChild(opt);
    });
    arenaSel.value = game.arena.mode;
    updateArenaForm();
    arenaSel.onchange = updateArenaForm;
    const inputs = document.querySelectorAll('#cfgStandard input, #cfgBR input');
    inputs.forEach(inp => inp.addEventListener('input', () => drawPreview(arenaSel.value, getArenaParams(arenaSel.value))));
  }

  // default unit rows
  addUnitRow({ klass: 'ranger', team: 'Y' });
  addUnitRow({ klass: 'ranger', team: 'R' });

  if (btnAddUnit) btnAddUnit.onclick = () => addUnitRow();

  const btnStart = document.getElementById('btnStart');
  btnStart && (btnStart.onclick = startGame);
  const btnStartOverlay = document.getElementById('btnStartOverlay');
  btnStartOverlay && (btnStartOverlay.onclick = startGame);
  const btnPause = document.getElementById('btnPause');
  btnPause && (btnPause.onclick = () => stopLoop());
  const btnReset = document.getElementById('btnReset');
  btnReset && (btnReset.onclick = resetGame);
}
