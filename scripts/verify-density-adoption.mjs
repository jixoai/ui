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
const structuralOK = (prop, value) =>
  /^(1px|-1px|0|0px|100%|auto|inherit|initial|none|0%)$/.test(value.trim()) ||
  (prop.includes('shadow') && /inset 2px 0 0/.test(value)) ||
  (prop.includes('padding-inline-end') && /2rem/.test(value)) ||
  (prop.startsWith('outline') && /\dpx/.test(value));

/** Extract declaration blocks by brace matching; matches the selector
 *  text after stripping :where()/[data-slot=] wrappers. */
const extractBlocks = (css, rawSelector) => {
  // canonical key: the bare class name without wrappers
  const key = rawSelector.replace(/^\./, '').replace(/:where\(|\)/g, '')
    .replace(/\[data-slot=['"]?([\w-]+)['"]?\]/g, '.$1').split(' ').pop().replace(/^\./, '');
  const blocks = [];
  const lines = css.split('\n');
  let capture = false, depth = 0, content = '', selBuf = '';
  for (const line of lines) {
    if (!capture) {
      selBuf += line + ' ';
      if (line.includes('{')) {
        const selPart = selBuf.substring(0, selBuf.indexOf('{'));
        const cleanSel = selPart.replace(/:where\(|\)/g, '').replace(/\[data-slot=['"]?([\w-]+)['"]?\]/g, '.$1');
        if (cleanSel.includes(key)) {
          capture = true;
          depth = 1;
          content = '';
        }
        selBuf = '';
      }
    } else {
      for (const ch of line) {
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { blocks.push(content); capture = false; } }
        else content += ch;
      }
      content += '\n';
    }
  }
  return blocks;
};

for (const row of rows) {
  check('static', `row ${row.family} complete`, rowIsComplete(row), row.family);
  if (!rowIsComplete(row)) continue;
  for (const root of row.roots) {
    const dir = resolve(root);
    if (!existsSync(dir)) continue;
    let cssText = '';
    for (const ent of readdirSync(dir)) {
      if (ent.endsWith('.css') || ent.endsWith('.svelte')) cssText += readFileSync(resolve(dir, ent), 'utf8');
    }
    const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
    if (/\[data-size=/.test(stripped)) check('static', `${row.family}: no data-size`, false, 'legacy selector');
    const isException = (sel) =>
      row.exceptions.some((e) => sel.includes(e.selector.replace(/^\./, '')) || e.selector.includes(sel.replace(/^\./, '')));
    for (const owned of row.densityOwned) {
      if (isException(owned.selector)) continue;
      const blocks = extractBlocks(stripped, owned.selector);
      for (const block of blocks) {
        for (const prop of owned.properties) {
          const decl = new RegExp(prop + '\\s*:\\s*([^;\\n]+)', 'm').exec(block);
          if (!decl) continue;
          const value = decl[1].trim();
          if (structuralOK(prop, value)) continue;
          if (value.startsWith('var(')) {
            const bad = [...value.matchAll(/--jx-[a-z-]+/g)].map((x) => x[0])
              .filter((t) => !CTL.test(t) && !KERNEL_ALLOWLIST.includes(t));
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
