/**
 * Build script — generates the two CSS artifacts from all laws.
 * Run: npx tsx src/build.ts
 */
import { serializeCollection } from './serializers/core';
import { checkboxLaw } from './laws/checkbox';
import { rangeLaw } from './laws/range';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const laws = { laws: [checkboxLaw, rangeLaw] };

// Output 1: utility class CSS → merged into jixoai.css
const utilityCSS = serializeCollection(laws, { format: 'utility' });
mkdirSync(resolve(repoRoot, 'packages/css-laws/dist'), { recursive: true });
writeFileSync(
  resolve(repoRoot, 'packages/css-laws/dist/utility.css'),
  `/* AUTO-GENERATED from src/laws/*.ts — never hand-edit.\n * Merge into jixoai.css (the standard layer). */\n\n${utilityCSS}\n`,
);

// Output 2: element-default CSS → merged into jx-pure.css
const faceCSS = serializeCollection(laws, { format: 'face' });
writeFileSync(
  resolve(repoRoot, 'packages/css-laws/dist/face.css'),
  `/* AUTO-GENERATED from src/laws/*.ts — never hand-edit.\n * Merge into jx-pure.css (the face). */\n\n${faceCSS}\n`,
);

console.log('✓ dist/utility.css (for jixoai.css)');
console.log('✓ dist/face.css (for jx-pure.css)');
