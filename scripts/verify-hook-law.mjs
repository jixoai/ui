#!/usr/bin/env node
// verify-hook-law — the data-jx-hooks failing gate (Codex r1 B4, 2026-08-25).
//
// Assertions (exit 1 on any failure, file:line in the report):
//   A. REGRESSION FIXTURES — the scanner's known traps stay correct:
//      jx-try-on css-defined (stays class), jx-bar-panel/bar-trigger
//      id-families invisible, onjx-*/jx-reset events invisible.
//   B. PRE-MIGRATION (current state): css-less hooks exist and are
//      enumerable (this is the CHANGE'S TARGET SET — reported, not a
//      failure, until migration lands; flips to a failure via --post).
//   C. POST-MIGRATION (--post): zero css-less jx-* tokens anywhere in
//      the fixed input set; zero data-jx-* attribute names shadowing
//      css-defined selectors or family bases; handReview must be EMPTY
//      (ambiguous tokens are unresolved work).
//   D. Browser probes (--live, after migration): [data-jx-kbd]
//      present on the docs page, .jx-kbd absent, a variant resolves.
//
// Usage:
//   node scripts/verify-hook-law.mjs            # pre-state report + fixtures
//   node scripts/verify-hook-law.mjs --post     # the failing gate
//   node scripts/verify-hook-law.mjs --live 5199
import { buildInventory } from './jx-inventory.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const post = process.argv.includes('--post');
const liveIdx = process.argv.indexOf('--live');
const failures = [];
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!cond) failures.push(name);
};

const inv = await buildInventory(root);

// A. regression fixtures (the r1 traps, asserted every run)
ok('fixture: jx-try-on is css-defined (stays a class)', inv.defined.has('jx-try-on') && !inv.staticHooks.has('jx-try-on'));
ok('fixture: jx-bar-panel / jx-bar-trigger id-families invisible', !inv.families.has('bar-panel') && !inv.families.has('bar-trigger'));
const eventInvisible = ![...inv.staticHooks.keys()].some((k) => k === 'jx-reset' || k === 'onjx-disabled');
ok('fixture: event protocol names invisible', eventInvisible);

// B/C. the hook set itself
const hookCount = inv.staticHooks.size;
const familyList = [...inv.families.keys()];
if (post) {
  ok('post: zero css-less jx-* hooks remain', hookCount === 0, `found ${hookCount}: ${[...inv.staticHooks.keys()].slice(0, 8).join(', ')}${hookCount > 8 ? ' …' : ''}`);
  ok('post: zero dynamic jx- families remain', inv.families.size === 0, familyList.join(', '));
  ok('post: zero hand-review ambiguities', inv.handReview.length === 0, `${inv.handReview.length} site(s): ${inv.handReview.slice(0, 4).map((h) => `${h.file}:${h.line}`).join(', ')}`);
  // D(b) static half: data-jx names must not shadow css-defined selectors
  const dataJx = new Set();
  const scan = (dir, exts) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.svelte-kit', 'dist', '.git', '.agents'].includes(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) scan(p, exts);
      else if (exts.some((x) => e.name.endsWith(x))) {
        for (const m of readFileSync(p, 'utf8').matchAll(/data-jx-([a-z0-9-]+)/g)) dataJx.add(m[1]);
      }
    }
  };
  scan(join(root, 'registry/files'), ['.svelte', '.ts']);
  scan(join(root, 'apps/www/src'), ['.svelte', '.ts']);
  const shadows = [...dataJx].filter((n) => inv.defined.has(n));
  ok('post: no data-jx name shadows a css-defined selector', shadows.length === 0, shadows.join(', '));
} else {
  console.log(`PRE-STATE (the migration's target set): ${hookCount} static hooks, ${inv.families.size} families (${familyList.join(', ')}), ${inv.handReview.length} hand-review sites, ${inv.references.length} reference sites — enumerated, not gated (use --post after the rewrite)`);
}

// D. browser probes
if (liveIdx > -1) {
  const port = process.argv[liveIdx + 1] ?? '5199';
  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`http://localhost:${port}/components/kbd.html`, { waitUntil: 'networkidle' });
  const live = await page.evaluate(() => ({
    dataKbd: !!document.querySelector('[data-jx-kbd]'),
    classKbd: !!document.querySelector('.jx-kbd'),
  }));
  ok('live: [data-jx-kbd] present, .jx-kbd gone', live.dataKbd && !live.classKbd, JSON.stringify(live));
  await page.goto(`http://localhost:${port}/components/alert.html`, { waitUntil: 'networkidle' });
  const variant = await page.evaluate(() => ({
    valued: !!document.querySelector('[data-jx-alert]'),
    sample: document.querySelector('[data-jx-alert]')?.getAttribute('data-jx-alert') ?? null,
  }));
  ok('live: variant family resolves as a valued attribute', variant.valued, JSON.stringify(variant));
  await browser.close();
}

if (failures.length) {
  console.error(`\nhook law: ${failures.length} FAILURE(S)`);
  process.exit(1);
}
console.log('\nhook law: OK');
