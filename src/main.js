import { game } from './core/game.js';
import { drawPreview } from './render/preview.js';
import { boot } from './scenes/boot.js';

window.addEventListener('DOMContentLoaded', () => {
  game.init();
  boot();
  drawPreview('padrao');
});
