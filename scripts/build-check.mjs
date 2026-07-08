import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const jsFiles = [
  'server.js',
  'store.js',
  'public/app.js',
  'public/admin/app.js',
  'public/academy/app.js',
  'public/academy/data/scripts.js',
  'public/shared/i18n.js',
  'public/site/app.js',
  'public/site/data/content.js',
  'public/site/data/services.js',
  'scripts/build-check.mjs',
  'scripts/smoke-test.mjs',
  'scripts/usability-test.mjs',
  'scripts/pages-smoke.mjs',
  'scripts/pages-mobile-smoke.mjs'
];

const htmlFiles = [
  'public/index.html',
  'public/admin/index.html',
  'public/academy/index.html',
  'public/site/index.html'
];

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing HTML entry: ${file}`);
  }
}

for (const file of jsFiles) {
  const check = spawnSync(process.execPath, ['--check', file], {
    stdio: 'pipe',
    encoding: 'utf8'
  });
  if (check.status !== 0) {
    const output = [check.stdout, check.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`Syntax check failed for ${file}\n${output}`);
  }
}

console.log(`Build check OK: ${jsFiles.length} JS files + ${htmlFiles.length} HTML entries`);
