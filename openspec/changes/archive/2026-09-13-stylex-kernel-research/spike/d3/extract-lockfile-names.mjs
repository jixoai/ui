#!/usr/bin/env node
// extract-lockfile-names.mjs — F6-frozen lockfileNames algorithm:
// parse package-lock.json `packages` object keys — strip the leading
// `node_modules/`, keep the LAST `node_modules/` segment (handles
// nested dedup), drop the root `""` key. Same parser for all configs.
// Prints per-config name lists + the Δ table (|config \ tw-baseline|).
import fs from 'node:fs';
import path from 'node:path';

const HERE = import.meta.dirname;
const CONFIGS = ['tw-baseline', 'arch-a', 'arch-b', 'arch-c'];

function lockfileNames(cfg) {
  const lock = JSON.parse(fs.readFileSync(path.join(HERE, cfg, 'package-lock.json'), 'utf8'));
  const names = new Set();
  for (const key of Object.keys(lock.packages ?? {})) {
    if (key === '') continue; // root
    const stripped = key.replace(/^node_modules\//, '');
    const last = stripped.split('/node_modules/').pop();
    names.add(last);
  }
  return names;
}

const sets = {};
for (const cfg of CONFIGS) {
  sets[cfg] = lockfileNames(cfg);
  console.log(`${cfg}: ${sets[cfg].size} lockfileNames`);
}

const base = sets['tw-baseline'];
console.log('\n--- Δ vs tw-baseline (NEW names only) ---');
for (const cfg of CONFIGS.slice(1)) {
  const added = [...sets[cfg]].filter((n) => !base.has(n)).sort();
  const removed = [...base].filter((n) => !sets[cfg].has(n)).sort();
  console.log(`\n${cfg}: Δpackages = ${added.length}`);
  console.log(`  + ${added.join(', ')}`);
  if (removed.length) console.log(`  (baseline-only, not counted): ${removed.join(', ')}`);
}
