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
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
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

// ── 1-3. the npm-script gates (verify:shadcn-add lives ONLY in the final
// real-consumer step below — running it here too made the chain pay for
// the same five installs twice, out of the documented order) ─────────
for (const name of ['verify:laws', 'verify:icons', 'verify:mirror', 'verify:context', 'verify:deps', 'verify:budgets', 'verify:docs', 'verify:meta', 'verify:print']) {
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

// ── 4b. registry/test local mirror (impl-review r2 S3): the directory is
// gitignored (a LOCAL byte-mirror of apps/www/test, never executed in
// CI), so nothing else would catch its drift — when it is present, every
// file shared with apps/www/test must be byte-identical ──────────────
{
  const regTest = join(root, 'registry', 'test');
  if (existsSync(regTest)) {
    step('registry/test byte-mirror (local convention)');
    const wwwTest = join(root, 'apps', 'www', 'test');
    const regFiles = readdirSync(regTest, { recursive: true }).map(String);
    const drift = [];
    for (const rel of regFiles) {
      const regPath = join(regTest, rel);
      if (!statSync(regPath, { throwIfNoEntry: false })?.isFile()) continue;
      const wwwPath = join(wwwTest, rel);
      if (!existsSync(wwwPath)) {
        drift.push(`${rel}: no apps/www/test counterpart`);
        continue;
      }
      if (readFileSync(regPath).toString() !== readFileSync(wwwPath).toString()) drift.push(rel);
    }
    if (drift.length) {
      console.error(`[registry-test-mirror] drifted (${drift.length}): ${drift.join(', ')}`);
      console.error('  sync with: cp apps/www/test/<file> registry/test/<file>');
      die('registry-test-mirror');
    }
    console.log(`[registry-test-mirror] ${regFiles.length} mirrored files byte-identical`);
  }
}

// ── 5. real-consumer install contract ────────────────────────────────
step('verify:shadcn-add (real consumer proof)');
try {
  execFileSync('node', ['scripts/verify-shadcn-add.mjs'], { cwd: root, stdio: 'inherit' });
} catch {
  die('shadcn-add');
}

console.log('\n✓ verify-all GREEN — the full gate chain passed');
