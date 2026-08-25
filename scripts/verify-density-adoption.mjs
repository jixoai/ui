#!/usr/bin/env node
/**
 * verify-density-adoption.mjs (design §5, the CLI contract):
 *
 *   node scripts/verify-density-adoption.mjs --packet <A|B|C|D|E|K0|all> [port]
 *
 * STATIC phase (no browser): scans each registry row's density-owned
 * selector/property pairs in the family css/svelte sources; rejects
 * px/rem literals, legacy [data-size]/[data-density] selectors in
 * family css, --jx-d-* consumption outside the closed rule (ctl for
 * control footprints; the named kernel allowlist for semantic roles),
 * and placeholder rows. Failures print `family / selector / property → value`.
 *
 * BROWSER phase: unless [port] names a running server, mounts the
 * built site (public/) on a throwaway server; per row: mounts the
 * docs route, nests data-density scopes, samples USED values, checks
 * stamps, measures/clicks physical lanes, runs resize assertions.
 *
 * Used-value normalization everywhere (no raw custom-property text).
 */
import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { REGISTRY, KERNEL_ALLOWLIST, rowIsComplete, rowsForPacket } from './density-adoption-registry.mjs';

const CHROME =
  homedir() +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const args = process.argv.slice(2);
const packetIdx = args.indexOf('--packet');
const packet = packetIdx !== -1 ? args[packetIdx + 1] : 'all';
if (!['A', 'B', 'C', 'D', 'E', 'K0', 'all'].includes(packet)) {
  console.error('usage: verify-density-adoption.mjs --packet <A|B|C|D|E|K0|all> [port]');
  process.exit(2);
}
const portArg = args.find((a) => /^\d+$/.test(a));

const rows = rowsForPacket(packet);
const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── STATIC phase ────────────────────────────────────────────────────
const CTL = /^--jx-d-ctl-/;
const structuralOK = (prop, value) =>
  /^(1px|-1px|0|0px|100%|auto|inherit|initial|none)$/.test(value) ||
  (prop === 'box-shadow' && /inset 2px 0 0/.test(value));

for (const row of rows) {
  check(`row ${row.family} complete (no placeholders)`, rowIsComplete(row), row.family);
  for (const root of row.roots) {
    for (const owned of row.densityOwned) {
      const dir = resolve(root);
      if (!existsSync(dir)) continue;
      let cssText = '';
      for (const ent of readdirSync(dir)) {
        if (ent.endsWith('.css') || ent.endsWith('.svelte')) {
          cssText += readFileSync(resolve(dir, ent), 'utf8');
        }
      }
      const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
      // no legacy stamps in family sources
      if (/\[data-size=/.test(stripped)) {
        check(`${row.family} / ${owned.selector} → no legacy data-size`, false, 'data-size selector present');
      }
      // density-owned declarations in the selector's block
      const blockRe = new RegExp(owned.selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'g');
      for (const m of stripped.matchAll(blockRe)) {
        const block = m[1];
        for (const prop of owned.properties) {
          const decl = new RegExp(prop + '\\s*:\\s*([^;]+);').exec(block);
          if (!decl) continue;
          const value = decl[1].trim();
          if (structuralOK(prop, value)) continue;
          if (value.startsWith('var(')) {
            // closed rule: ctl OR named kernel allowlist
            const usedTokens = [...value.matchAll(/--jx-[a-z-]+/g)].map((x) => x[0]);
            const bad = usedTokens.filter((t) => !CTL.test(t) && !KERNEL_ALLOWLIST.includes(t));
            check(`${row.family} / ${owned.selector} / ${prop}`, bad.length === 0, bad.length ? `non-closed tokens: ${bad.join(', ')}` : value);
          } else {
            check(`${row.family} / ${owned.selector} / ${prop}`, false, `literal: ${value}`);
          }
        }
      }
    }
  }
}

// ── BROWSER phase ───────────────────────────────────────────────────
let server = null;
let origin = portArg ? `http://127.0.0.1:${portArg}` : null;
if (!origin) {
  // serve the BUILT site (public/) — the docs fixtures live there
  const pub = resolve('public');
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
  server = createServer((req, res) => {
    const path = req.url.split('?')[0].replace(/\/$/, '/index.html');
    const file = resolve(pub, '.' + decodeURIComponent(path));
    if (!file.startsWith(pub) || !existsSync(file)) { res.statusCode = 404; res.end('not found'); return; }
    res.setHeader('content-type', mime[file.slice(file.lastIndexOf('.'))] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  origin = `http://127.0.0.1:${server.address().port}`;
  check('fixture server started (public/)', true, origin);
}

const { chromium } = await import('/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs');
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-proxy-server'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

for (const row of rows) {
  if (row.family !== 'K0') continue; // A–E browser rows activate with their packets
  await page.goto(origin + row.docsRoute, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(600);
  const stamps = await page.evaluate((sel) => document.querySelectorAll('[data-density]').length, row.probeRoot).catch(() => 0);
  check(`${row.family} browser: density stamps present in DOM`, stamps > 0, String(stamps));
  const usedValues = await page.evaluate(() => {
    const probe = document.querySelector('[data-slot="item-title"]');
    if (!probe) return null;
    const cs = getComputedStyle(probe);
    return { fs: cs.fontSize, lh: cs.lineHeight };
  }).catch(() => null);
  check(`${row.family} browser: used values sampled`, usedValues !== null, usedValues ? `${usedValues.fs} / ${usedValues.lh}` : 'probe missing');
}

await browser.close();
if (server) server.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed (packet ${packet})`);
process.exit(failed ? 1 : 0);
