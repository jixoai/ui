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
import { buildInventory, AUDITOR_SOURCES } from './jx-inventory.mjs';
import { readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
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

// THE shadow collector (r4 B1): scans product inputs only, sharing the
// inventory's versioned AUDITOR_SOURCES exclusion (single boundary).
export function collectDataJx(rootDir) {
  const found = []; // {name('jx-x'), file, line}
  const scan = (dir, exts) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.svelte-kit', 'dist', '.git', '.agents'].includes(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) scan(p, exts);
      else if (exts.some((x) => e.name.endsWith(x)) && !AUDITOR_SOURCES.has(e.name)) {
        const text = readFileSync(p, 'utf8');
        text.split('\n').forEach((line, i) => {
          for (const m of line.matchAll(/data-jx-([a-z0-9-]+)/g)) {
            found.push({ name: `jx-${m[1]}`, file: p, line: i + 1 });
          }
        });
      }
    }
  };
  scan(join(rootDir, 'registry/files'), ['.svelte', '.ts']);
  scan(join(rootDir, 'apps/www/src'), ['.svelte', '.ts']);
  scan(join(rootDir, 'apps/www/test'), ['.svelte', '.ts']);
  scan(join(rootDir, 'scripts'), ['.mjs']);
  return found;
}
const shadowCheck = (invObj, rootDir) => {
  const hits = collectDataJx(rootDir);
  const famBases = new Set(invObj.families.keys());
  return hits.filter((h) => invObj.defined.has(h.name) || famBases.has(h.name.slice(3)));
};

const inv = await buildInventory(root);

// A. regression fixtures (the r1/r2 traps, asserted every run)
ok('fixture: jx-try-on is css-defined (stays a class)', inv.defined.has('jx-try-on') && !inv.staticHooks.has('jx-try-on'));
ok('fixture: jx-bar-panel / jx-bar-trigger id-families invisible', !inv.families.has('bar-panel') && !inv.families.has('bar-trigger'));
const eventInvisible = ![...inv.staticHooks.keys()].some((k) => k === 'jx-reset' || k === 'onjx-disabled');
ok('fixture: event protocol names invisible', eventInvisible);
// B1: no trailing-dash token may ever enter staticHooks
const trailing = [...inv.staticHooks.keys()].filter((k) => k.endsWith('-'));
ok('fixture: zero trailing-dash static hooks', trailing.length === 0, trailing.join(','));
// B2: every family carries variants + shapes evidence
const bare = [...inv.families.entries()].filter(([, v]) => v.variants.size === 0 || v.shapes.size === 0).map(([b]) => b);
ok('fixture: every family has variants + shapes', bare.length === 0, bare.join(','));
// B7: svelte-script query references are visible (kind + line)
const qref = inv.references.filter((r) => r.kind === 'query' && typeof r.line === 'number');
const hasScriptQuery = qref.some((r) => /tooltip|toc|layout/.test(r.file));
ok('fixture: svelte-script query references visible with lines', hasScriptQuery, `${qref.length} query refs, sample: ${qref.slice(0, 2).map((r) => r.file).join(', ')}`);
// r3 B3: parts/variants mutual exclusion
const doubles = [];
for (const [base, fam] of inv.families) for (const v of fam.variants.keys()) {
  if (v !== 'dynamic' && inv.staticHooks.has(`jx-${base}-${v}`)) doubles.push(`${base}:${v}`);
}
ok('fixture: no token double-classified (part + variant)', doubles.length === 0, doubles.join(','));
// r4 B1: the auditors' own sources contribute NOTHING to the inventory
const auditorLeak = [
  ...[...inv.staticHooks.values()].flat().filter((site) => [...AUDITOR_SOURCES].some((a) => site.includes(a))),
  ...inv.handReview.filter((h) => [...AUDITOR_SOURCES].some((a) => h.file.includes(a))),
];
ok('fixture: auditor sources are invisible to the inventory', auditorLeak.length === 0, auditorLeak.slice(0, 3).join(' | '));
// r3 B4: directives carry token + file:line + condition source
const dirOk = inv.directives.length > 0 && inv.directives.every((d) => d.site.includes(':') && d.expr.length > 0);
ok('fixture: class directives carry site + condition evidence', dirOk, `${inv.directives.length} directives, sample ${inv.directives[0]?.site}`);

// B/C. the hook set itself
const hookCount = inv.staticHooks.size;
const familyList = [...inv.families.keys()];
if (post) {
  ok('post: zero css-less jx-* hooks remain', hookCount === 0, `found ${hookCount}: ${[...inv.staticHooks.keys()].slice(0, 8).join(', ')}${hookCount > 8 ? ' …' : ''}`);
  ok('post: zero dynamic jx- families remain', inv.families.size === 0, familyList.join(', '));
  ok('post: zero hand-review ambiguities', inv.handReview.length === 0, `${inv.handReview.length} site(s): ${inv.handReview.slice(0, 4).map((h) => `${h.file}:${h.line}`).join(', ')}`);
  // D(b) static half: data-jx names must not shadow css-defined selectors
  // r3 B1/B2: the shared collector (auditor source excluded)
  // RULED COEXISTENCE (design D1/B6, file-icon precedent): a css-defined
  // base class MAY lawfully coexist with its family's valued attribute
  // on the same element — recorded rulings, not shadow violations
  const RULED_COEXISTENCE = new Set(['jx-file', 'jx-file-icon', 'jx-step', 'jx-toast', 'jx-toggle']);
  const shadows = shadowCheck(inv, root).filter((h) => !RULED_COEXISTENCE.has(h.name));
  ok('post: no data-jx name shadows a css-defined selector or family', shadows.length === 0, shadows.slice(0, 4).map((s2) => `${s2.name}@${s2.file}:${s2.line}`).join(', '));
} else {
  console.log(`PRE-STATE (the migration's target set): ${hookCount} static hooks, ${inv.families.size} families (${familyList.join(', ')}), ${inv.handReview.length} hand-review sites, ${inv.references.length} reference sites — enumerated, not gated (use --post after the rewrite)`);
}

// selftest (r3 B2): inject a UNIQUE css-defined conflict and prove the
// SAME collector the --post gate uses catches it with file:line; then
// prove the clean tree has zero shadow hits.
if (process.argv.includes('--selftest')) {
  const probePath = join(root, 'apps/www/src/lib/__shadow-probe__.svelte');
  writeFileSync(probePath, '<div data-jx-toggle-track="probe"></div>\n');
  const hits = collectDataJx(root).filter((h) => h.name === 'jx-toggle-track');
  const caught = hits.length === 1 && hits[0].file === probePath && typeof hits[0].line === 'number';
  const shadowsIncludingProbe = shadowCheck(inv, root);
  rmSync(probePath);
  const cleanShadows = shadowCheck(inv, root);
  ok('selftest: injected css-defined shadow caught with file:line', caught && shadowsIncludingProbe.some((s2) => s2.name === 'jx-toggle-track'));
  const RULED = new Set(['jx-file', 'jx-file-icon', 'jx-step', 'jx-toast', 'jx-toggle']);
  const filtered = cleanShadows.filter((h) => !RULED.has(h.name));
  ok('selftest: clean tree has zero shadow hits (ruled coexistence aside)', filtered.length === 0, filtered.map((s2) => s2.name).join(','));
}

// D. browser probes
if (liveIdx > -1) {
  const port = process.argv[liveIdx + 1] ?? '5199';
  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH ?? chromium.executablePath() });
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
  const knownTones = ['default', 'primary', 'destructive'];
  ok('live: variant valued attribute carries a known tone', variant.valued && knownTones.includes(variant.sample), JSON.stringify(variant));
  await browser.close();
}

if (failures.length) {
  console.error(`\nhook law: ${failures.length} FAILURE(S)`);
  process.exit(1);
}
console.log('\nhook law: OK');
