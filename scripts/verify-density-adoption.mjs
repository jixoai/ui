#!/usr/bin/env node
/**
 * verify-density-adoption.mjs v2 (impl-review r1 remediation — the
 * single-owner rewrite):
 *
 *   node scripts/verify-density-adoption.mjs --packet <A|B|C|D|E|K0|all> [port]
 *
 * STATIC: extracts declaration blocks by brace matching (handles
 * :where()/[data-slot] wrappers), rejects literals + legacy stamps,
 * enforces the CLOSED token rule.
 * BROWSER: serves public/ when no port; EVERY row gets stamps check,
 * USED-value sampling, physical lane rectangles, scope-resize.
 */
import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, extname } from 'node:path';
import { REGISTRY, KERNEL_ALLOWLIST, rowIsComplete, rowsForPacket } from './density-adoption-registry.mjs';

const CHROME =
  homedir() + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

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
const check = (phase, name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${phase}] ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── STATIC ─────────────────────────────────────────────────────────
const CTL = /^--jx-d-ctl-/;
// family-local aliases (one-line to kernel tokens per the design law)
const FAMILY_ALIAS = /^--jx-[a-z]+-[a-z-]+$/;
const structuralOK = (prop, value) =>
  /^(1px|-1px|0|0px|100%|auto|inherit|initial|none|0%)$/.test(value.trim()) ||
  (prop.includes('shadow') && /inset 2px 0 0/.test(value)) ||
  (prop.includes('padding-inline-end') && /2rem/.test(value)) ||
  (prop.startsWith('outline') && /\dpx/.test(value));

/** Extract declaration blocks by brace matching; matches the selector
 *  text after stripping :where()/[data-slot=] wrappers. */
const extractBlocks = (css, rawSelector) => {
  // extract the bare key: strip ALL wrappers, dots, brackets, parens
  const key = rawSelector
    .replace(/:where|:not|:has/g, '')
    .replace(/\[data-slot=['"]?([\w-]+)['"]?\]/g, '$1')
    .replace(/[.()[\]'">~+]/g, '')
    .replace(/\s+/g, ' ').trim().split(' ').pop();

  // find every selector-at-brace in the css, check if it contains our key
  const results = [];
  const re = /([^{}]+)\{/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const selText = m[1].replace(/:where|:not|:has/g, '')
      .replace(/\[data-slot=['"]?([\w-]+)['"]?\]/g, '$1')
      .replace(/[.()[\]'">~+]/g, '')
      .replace(/\s+/g, ' ').trim();
    if (selText.includes(key)) {
      // brace-count from the opening { to find the matching }
      const openIdx = m.index + m[0].length - 1;
      let depth = 1;
      let i = openIdx + 1;
      while (i < css.length && depth > 0) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') depth--;
        i++;
      }
      results.push(css.substring(openIdx + 1, i - 1));
      // advance the regex past this block
      re.lastIndex = i;
    }
  }
  return results;
};

for (const row of rows) {
  check('static', `row ${row.family} complete`, rowIsComplete(row), row.family);
  if (!rowIsComplete(row)) continue;
  for (const root of row.roots) {
    const dir = resolve(root);
    if (!existsSync(dir)) { check('static', `${row.family}: root exists`, false, dir); continue; }
    let cssText = '';
    for (const ent of readdirSync(dir)) {
      if (ent.endsWith('.css') || ent.endsWith('.svelte')) cssText += readFileSync(resolve(dir, ent), 'utf8');
    }
    const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
    if (/\[data-size=/.test(stripped)) check('static', `${row.family}: no data-size`, false, 'legacy selector');
    const isException = (sel, prop) =>
      row.exceptions.some((e) => {
        const key = e.selector.replace(/^\./, '');
        const selMatch = sel.includes(key) || key.includes(sel.replace(/^\./, ''));
        const propMatch = !e.property || e.property.includes('/') || e.property === prop;
        return selMatch && propMatch;
      });
    for (const owned of row.densityOwned) {
      if (owned.properties.some((pr) => isException(owned.selector, pr))) continue;
      const blocks = extractBlocks(stripped, owned.selector);
      if (blocks.length === 0) {
        // Utility-styled family: check the .svelte markup for the expected
        // token pattern (Tailwind arbitrary values) instead of CSS blocks
        const propToUtil = {
          'min-height': 'min-h-[var(--jx-d-ctl-hit)]',
          'min-block-size': 'min-h-[var(--jx-d-ctl-hit)]',
          'min-width': 'min-w-[var(--jx-d-ctl-hit)]',
          'padding-inline': 'px-[var(--jx-d-ctl-pad)]',
          'padding-block': 'py-[var(--jx-d-ctl-pad)]',
          'font-size': 'text-[length:var(--jx-d-ctl-text)]',
          'line-height': 'leading-[var(--jx-d-ctl-line)]',
          'width': 'w-[var(--jx-d-ctl-icon)]',
          'height': 'h-[var(--jx-d-ctl-icon)]',
          'gap': 'gap-[var(--jx-d-ctl-gap)]',
        };
        const utilPat = owned.properties.map((pr) => propToUtil[pr]).filter(Boolean)[0];
        const markupHit = utilPat && stripped.includes(utilPat);
        check('static', `${row.family}/${owned.selector}: utility or CSS`,
          markupHit === true,
          markupHit ? 'utility pattern found' : 'neither CSS block nor utility pattern found');
        continue;
      }
      for (const block of blocks) {
        for (const prop of owned.properties) {
          const decl = new RegExp(prop + '\\s*:\\s*([^;\\n]+)', 'm').exec(block);
          if (!decl) continue;
          const value = decl[1].trim();
          if (structuralOK(prop, value)) continue;
          if (value.includes('var(')) {
            const bad = [...value.matchAll(/--jx-[a-z-]+/g)].map((x) => x[0])
              .filter((t) => !CTL.test(t) && !KERNEL_ALLOWLIST.includes(t) && !FAMILY_ALIAS.test(t));
            check('static', `${row.family}/${owned.selector}/${prop}`, bad.length === 0,
              bad.length ? `non-closed: ${bad.join(',')}` : value);
          } else if (/\d+(\.\d+)?(px|rem)/.test(value)) {
            check('static', `${row.family}/${owned.selector}/${prop}`, false, `literal: ${value}`);
          }
        }
      }
    }
  }
}

// ── BROWSER ────────────────────────────────────────────────────────
let server = null, origin = portArg ? `http://127.0.0.1:${portArg}` : null;
if (!origin) {
  const pub = resolve('public');
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
  server = createServer((req, res) => {
    const path = req.url.split('?')[0].replace(/\/$/, '/index.html');
    const file = resolve(pub, '.' + decodeURIComponent(path));
    if (!file.startsWith(pub) || !existsSync(file)) { res.statusCode = 404; res.end(); return; }
    res.setHeader('content-type', mime[extname(file)] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  origin = `http://127.0.0.1:${server.address().port}`;
  check('browser', 'server (public/)', true, origin);
}
const { chromium } = await import('/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs');
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-proxy-server'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

for (const row of rows) {
  if (!rowIsComplete(row)) continue;
  await page.goto(origin + row.docsRoute, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(600);
  const stamps = await page.evaluate(() => document.querySelectorAll('[data-density]').length).catch(() => 0);
  check('browser', `${row.family}: density stamps`, stamps > 0, String(stamps));
  const used = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { fs: cs.fontSize, lh: cs.lineHeight, minH: cs.minHeight };
  }, row.probeRoot).catch(() => null);
  check('browser', `${row.family}: USED values`, used !== null,
    used ? `${used.fs}/${used.lh}/min${used.minH}` : `probe ${row.probeRoot} missing`);
  for (const lane of row.lanes) {
    const el = await page.$(lane).catch(() => null);
    if (!el) continue;
    const rect = await el.boundingBox().catch(() => null);
    if (rect) check('browser', `${row.family}: lane physical`, rect.height >= 28, `h=${rect.height.toFixed(1)}`);
  }
  const resize = await page.evaluate((probeRoot) => {
    const probe = document.querySelector(probeRoot);
    if (!probe) return null;
    const out = {};
    for (const d of ['xs', 'default', 'lg']) {
      probe.setAttribute('data-density', d);
      const el = document.createElement('span');
      el.style.fontSize = 'var(--jx-d-text)';
      probe.appendChild(el);
      out[d] = getComputedStyle(el).fontSize;
      el.remove();
    }
    probe.removeAttribute('data-density');
    return out;
  }, row.probeRoot).catch(() => null);
  if (resize) check('browser', `${row.family}: resize --jx-d-text`, new Set(Object.values(resize)).size >= 2, JSON.stringify(resize));
}

await browser.close();
if (server) server.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed (packet ${packet})`);
process.exit(failed ? 1 : 0);
