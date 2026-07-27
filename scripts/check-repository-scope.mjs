import { readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const forbiddenRoots = new Set([
  'android-lg-remote',
  'lg-wifi-remote-app',
  '.final-b64',
  '.final-materialize',
  '.final-overlay',
  '.final2-overlay',
  '.universal-overlay',
  '.universal-overlay-v2'
]);

const forbiddenPatterns = [
  /^\.final-/,
  /^\.universal-/,
  /(^|\/)AndroidManifest\.xml$/,
  /(^|\/)build\.gradle(?:\.kts)?$/,
  /(^|\/)settings\.gradle(?:\.kts)?$/,
  /(^|\/)gradlew(?:\.bat)?$/,
  /^\.github\/workflows\/.*(?:libre|android|lg-wifi|remote).*\.ya?ml$/i
];

const ignored = new Set(['.git', 'node_modules']);
const violations = [];

async function walk(relative = '') {
  const directory = path.join(root, relative);
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;

    const child = relative ? `${relative}/${entry.name}` : entry.name;
    const rootName = child.split('/')[0];

    if (forbiddenRoots.has(rootName) || forbiddenPatterns.some((pattern) => pattern.test(child))) {
      violations.push(child);
      if (entry.isDirectory()) continue;
    }

    if (entry.isDirectory()) await walk(child);
  }
}

await walk();

if (violations.length > 0) {
  console.error('Arquivos de outro projeto foram detectados no Warballs:');
  for (const violation of [...new Set(violations)].sort()) {
    console.error(`- ${violation}`);
  }
  console.error('\nMova aplicativos Android e workflows do Libre Remote para o repositório dedicado.');
  process.exit(1);
}

console.log('Escopo do repositório validado: somente Warballs.');
