import { game } from '../core/game.js';
import { startLoop, stopLoop } from '../core/loop.js';
import { addUnitRow } from '../ui/debugOverlay.js';
import { unitListEl, btnAddUnit, arenaNameEl } from '../utils/misc.js';
import { Unit } from '../unit/unit.js';
import { TEAM, CFG } from '../config/cfg.js';
import { V } from '../math/vec.js';

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

function startGame() {
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
  // arena select
  const arenaSel = document.getElementById('arena');
  if (arenaSel) {
    Object.entries(CFG.arenas).forEach(([key, cfg]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = cfg.name || key;
      arenaSel.appendChild(opt);
    });
    arenaSel.value = game.arena.mode;
    arenaNameEl && (arenaNameEl.textContent = arenaSel.options[arenaSel.selectedIndex]?.textContent || '');
    arenaSel.onchange = () => {
      game.arena.reset(arenaSel.value);
      arenaNameEl && (arenaNameEl.textContent = arenaSel.options[arenaSel.selectedIndex]?.textContent || '');
    };
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
