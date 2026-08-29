#!/usr/bin/env node
// verify-all — THE composite gate (merge-alignment A3, Codex ruling).
//
// One auditable chain, order fixed:
//   0. registry dependency shape — every inter-item dependency is
//      @jixoai/<item> (A4: bare names are ambiguous across namespaces)
//   1. verify:laws        — css-laws slots fresh from the TS sources
//   2. verify:mirror      — registry ⇄ apps/www byte-identity
//   3. verify:budgets     — source/face/consumer budgets
//   4. ghostty-pin offline — the supply-chain SHAPE (no network: PRs
//      must not flap on proxies; the online check rides wasm-sync)
//   5. verify:shadcn-add  — real-consumer install contract
//
// Runs AFTER the regular build steps (payloads/dist must exist).
// Any failure aborts the chain with the failing gate's name.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const step = (name) => console.log(`\n━━ verify-all · ${name} ━━━━━━━━━━━━━━━━━━━━━`);

function die(name) {
  console.error(`\n✗ verify-all FAILED at ${name}`);
  process.exit(1);
}

// ── 0. registry dependency shape (A4) ────────────────────────────────
step('registry dependency shape');
{
  const registry = JSON.parse(readFileSync(resolve(root, 'registry.json'), 'utf8'));
  const items = registry.items ?? registry;
  const bare = [];
  for (const item of items) {
    for (const dep of item.registryDependencies ?? []) {
      if (!dep.startsWith('@jixoai/')) bare.push(`${item.name}: ${dep}`);
    }
  }
  if (bare.length) {
    console.error('bare inter-item dependencies (must be @jixoai/<item>):\n  ' + bare.join('\n  '));
    die('registry dependency shape');
  }
  console.log('✓ every inter-item dependency is @jixoai/-prefixed');
}

// ── 0.5. the frozen alignment laws (B1/B2) ───────────────────────────
step('verify:standards');
try {
  execFileSync('node', ['scripts/verify-standards.mjs'], { cwd: root, stdio: 'inherit' });
} catch {
  die('standards');
}

// ── 1-3. the npm-script gates ────────────────────────────────────────
for (const name of ['verify:laws', 'verify:mirror', 'verify:budgets']) {
  step(name);
  try {
    execFileSync('npm', ['run', '--silent', name], { cwd: root, stdio: 'inherit' });
  } catch {
    die(name);
  }
}

// ── 4. ghostty pin (offline sentinel) ────────────────────────────────
step('verify:ghostty-pin (offline sentinel)');
try {
  execFileSync('node', ['scripts/verify-ghostty-pin.mjs', '--offline'], { cwd: root, stdio: 'inherit' });
} catch {
  die('ghostty-pin');
}

// ── 5. real-consumer install contract ────────────────────────────────
step('verify:shadcn-add (real consumer proof)');
try {
  execFileSync('node', ['scripts/verify-shadcn-add.mjs'], { cwd: root, stdio: 'inherit' });
} catch {
  die('shadcn-add');
}

console.log('\n✓ verify-all GREEN — the full gate chain passed');
