import { game } from './core/game.js';
import { startLoop } from './core/loop.js';
import { drawPreview } from './render/preview.js';

window.addEventListener('DOMContentLoaded', () => {
  game.init();
  drawPreview('simples');
  startLoop();
});
