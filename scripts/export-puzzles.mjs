// Bulmaca havuzunun tek kaynağı src/puzzles.ts'tir. Bu betik onu Kotlin (Android Studio)
// uygulamasının okuduğu JSON dosyasına aktarır:  node scripts/export-puzzles.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PUZZLES } from '../src/puzzles.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'android-kotlin/app/src/main/assets/puzzles.json');
// Her grup tek satırda: dosya elle de rahat okunup düzenlenebilsin.
const body = PUZZLES.map(
  (p) =>
    `  {"id": ${p.id}, "groups": [\n` +
    p.groups.map((g) => `    ${JSON.stringify(g)}`).join(',\n') +
    '\n  ]}',
).join(',\n');
writeFileSync(target, `[\n${body}\n]\n`);
console.log(`${PUZZLES.length} bulmaca -> ${target}`);
