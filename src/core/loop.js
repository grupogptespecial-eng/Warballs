// Laço principal do jogo baseado em requestAnimationFrame

import { perf, fpsEl } from '../utils/misc.js';
import { game } from './game.js';

let running = false;
let last = 0;

function frame(now) {
  if (!running) return;
  const dt = (now - last) / 1000;
  last = now;
  game.update(dt);
  game.draw();
  if (fpsEl) fpsEl.textContent = (1000 / (dt * 1000)).toFixed(0);
  requestAnimationFrame(frame);
}

export function startLoop() {
  if (running) return;
  running = true;
  last = perf.now();
  requestAnimationFrame(frame);
}

export function stopLoop() { running = false; }

