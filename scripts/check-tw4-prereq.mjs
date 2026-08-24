#!/usr/bin/env node
// Tailwind v4 prerequisite check for @jixoai registry:ui consumers
// (tw4-css-modularization tasks 3.1/4.1, 2026-08-24).
//
// The documented install prerequisite of utility-authored ui items:
//   1. tailwindcss v4 + @tailwindcss/vite in package.json;
//   2. a single CSS entry importing 'tailwindcss' AND the jixoai
//      token sheet (the @lib/jixoai.css delivered by the
//      @jixoai/jixoai-theme registryDependency);
//   3. (optional) the jx-pure import for the componentless face.
//
// Usage (inside the consumer project):
//   node check-tw4-prereq.mjs [entry.css]
// Exit 0 = prerequisite met; exit 1 with a named fix otherwise.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const die = (fix) => {
  console.error(`[check-tw4-prereq] MISSING REQUIREMENT — ${fix}`);
  process.exit(1);
};

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const tw = deps.tailwindcss;
if (!tw) die('install tailwindcss v4 and @tailwindcss/vite (npm i -D tailwindcss @tailwindcss/vite)');
if (!deps['@tailwindcss/vite']) die('install @tailwindcss/vite and add it to your vite config plugins');
if (!/^\^?4\./.test(tw)) die(`tailwindcss v4 required (found ${tw}) — the jixoai ui items are utility-authored against v4`);

// find the entry: explicit arg, else any css under src importing tailwindcss
const candidates = [];
if (process.argv[2]) candidates.push(process.argv[2]);
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.css')) candidates.push(p);
  }
};
if (existsSync('src')) walk('src');

let entry = null;
for (const c of candidates) {
  const css = readFileSync(c, 'utf8');
  if (css.includes("@import 'tailwindcss'") || css.includes('@import "tailwindcss"')) {
    entry = { path: c, css };
    break;
  }
}
if (!entry) die("no CSS entry with `@import 'tailwindcss'` found under src/ — create one and wire it in your root layout");
if (!/jixoai\.css/.test(entry.css)) die(`${entry.path} must import the jixoai token sheet (the @lib/jixoai.css delivered by @jixoai/jixoai-theme) AFTER tailwindcss`);

console.log(`[check-tw4-prereq] OK — tailwindcss ${tw}, entry ${entry.path} carries the jixoai theme import`);
