// Funções utilitárias diversas

// Elementos de UI referenciados globalmente
export const fpsEl = document.getElementById('fps');
export const overlay = document.getElementById('overlay');
export const arenaNameEl = document.getElementById('arenaName');
export const perf = { now: () => performance.now() };
export const unitListEl = document.getElementById('unitList');
export const btnAddUnit = document.getElementById('btnAddUnit');

// Limita um valor entre a e b
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Ajuda a criar degraus a cada 5 níveis
export const _seg5 = (L, start) => Math.max(0, Math.min((L - 1) - start, 4));

// Conversões e manipulação de cores
export function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 255, g: 255, b: 255 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function rgbToHex(r, g, b) {
  const h = n => n.toString(16).padStart(2, '0');
  return `#${h(Math.max(0, Math.min(255, r)))}${h(Math.max(0, Math.min(255, g)))}${h(Math.max(0, Math.min(255, b)))}`;
}

export function shade(hex, k) {
  const { r, g, b } = hexToRgb(hex);
  const t = k > 0 ? 255 : 0, f = Math.abs(k);
  return rgbToHex(
    Math.round(r + (t - r) * f),
    Math.round(g + (t - g) * f),
    Math.round(b + (t - b) * f)
  );
}

// Infraestrutura simples de testes de unidade
const Tests = [];
export function addTest(name, fn) { Tests.push({ name, fn }); }
export function runTests() {
  let passed = 0; const results = [];
  for (const t of Tests) {
    try { t.fn(); results.push(`✔ ${t.name}`); passed++; }
    catch (e) { console.error(`Test failed: ${t.name}`, e); results.push(`✖ ${t.name}: ${e}`); }
  }
  const el = document.getElementById('testStatus');
  if (el) {
    el.textContent = `Tests: ${passed}/${Tests.length} passed`;
    el.title = results.join('\n');
  }
}

