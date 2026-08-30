#!/usr/bin/env node
/**
 * Blueprint builder (scripts/build-blueprints.mjs).
 *
 * The orchestrator of the satori pipeline (2026-08-22, user request):
 *
 *   apps/www scenes (REAL components, forced-open states)
 *     → vite build → apps/www/dist
 *     → headless Chrome loads /blueprints.html
 *     → per-stage serialization (scripts/blueprints/serialize.mjs)
 *     → satori paint, grayscale baked (scripts/blueprints/render.mjs)
 *     → apps/www/static/blueprints/<name>.svg  (committed; the site
 *       serves them as plain static assets)
 *
 * Incremental: the cache (scripts/blueprints/.cache.json, gitignored)
 * keys each SVG on sha256(CONVERTER_FINGERPRINT + serialized scene JSON),
 * so a scene regenerates ONLY when its rendered pixels actually
 * changed — component tweaks rerender just the affected scenes, docs
 * edits rerender nothing. The headless render pass always runs (it IS
 * the hash source); the satori paint + write are skipped on hits.
 *
 * Requires: system Google Chrome (playwright-core drives it via
 * channel 'chrome' — no browser download).
 *
 * Flags: --no-build   trust apps/www/dist as-is
 *        --only=a,b   restrict to named stages (dev helper)
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

import { serializeStageInPage } from './blueprints/serialize.mjs';
import { CONVERTER_FINGERPRINT, renderScene } from './blueprints/render.mjs';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wwwDir = path.join(repoRoot, 'apps', 'www');
const wwwDist = path.join(wwwDir, 'dist');
const outDir = path.join(wwwDir, 'static', 'blueprints');
const cacheFile = path.join(repoRoot, 'scripts', 'blueprints', '.cache.json');

const args = new Set(process.argv.slice(2));
const only = args.has('--only') ? process.argv[process.argv.indexOf('--only') + 1]?.split(',') : null;

const die = (message) => {
  console.error(`[build-blueprints] ${message}`);
  process.exit(1);
};

// ---- scene audit (site-polish F8, task 5.2) --------------------------------
// The satori canvas CLIPS at the stage edge and paints every text run
// exactly where the browser measured it — so a run that escapes the
// stage, or two runs that paint over each other, render as visible
// garbage in the tile (the toc-engine overlap / list-item clip class).
// The serializer emits per-LINE tight rects (Range API), so an overlap
// here is a real glyph collision, not two layout boxes touching.
const clipText = (t) => (t.length > 32 ? t.slice(0, 32) + '…' : t);

function auditScene(scene) {
  const problems = [];
  const texts = scene.nodes.filter((n) => n.k === 'txt' && n.t && n.t.trim());
  for (const t of texts) {
    if (t.x < -0.5 || t.y < -0.5 || t.x + t.w > scene.w + 0.5 || t.y + t.h > scene.h + 0.5) {
      problems.push(
        `text "${clipText(t.t)}" escapes the ${scene.w}x${scene.h} stage (x=${t.x} y=${t.y} w=${t.w} h=${t.h})`,
      );
    }
  }
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i];
      const b = texts[j];
      // low-opacity ghosts are decorative layering, not collisions
      if ((a.op ?? 1) < 0.3 || (b.op ?? 1) < 0.3) continue;
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 2 && oy > 2) {
        problems.push(
          `text "${clipText(a.t)}" overlaps "${clipText(b.t)}" (${ox.toFixed(1)}x${oy.toFixed(1)}px)`,
        );
      }
    }
  }
  return problems;
}

/** same vite-bin resolution trick as build-site.mjs */
function buildSite() {
  const packageDir = path.dirname(require.resolve('vite/package.json', { paths: [wwwDir] }));
  const bin = path.join(packageDir, 'bin', 'vite.js');
  if (!existsSync(bin)) die('cannot locate the vite binary; run `npm install` in apps/www first');
  const result = spawnSync(process.execPath, [bin, 'build'], { cwd: wwwDir, stdio: 'inherit' });
  if (result.status !== 0) die(`vite build failed (exit ${result.status})`);
}

/** static file server for the prerendered dist (no runtime deps) */
function serveDist() {
  const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.json': 'application/json', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.txt': 'text/plain', '.ico': 'image/x-icon', '.map': 'application/json',
  };
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.join(wwwDist, urlPath);
    if (!existsSync(file) || statSync(file).isDirectory()) {
      file = path.join(wwwDist, urlPath.replace(/\/$/, '') + '/index.html');
    }
    if (!existsSync(file)) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function main() {
  const startedAt = Date.now();
  if (!args.has('--no-build')) {
    console.log('[build-blueprints] vite build (apps/www)');
    buildSite();
  } else if (!existsSync(path.join(wwwDist, 'blueprints.html'))) {
    die('--no-build passed but apps/www/dist/blueprints.html is missing; run once without it');
  }

  mkdirSync(outDir, { recursive: true });
  let cache = { version: CONVERTER_FINGERPRINT, entries: {} };
  if (existsSync(cacheFile)) {
    try {
      cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
    } catch {
      // corrupt cache = full rebuild
    }
  }
  if (cache.version !== CONVERTER_FINGERPRINT) cache = { version: CONVERTER_FINGERPRINT, entries: {} };

  const { server, port } = await serveDist();
  console.log(`[build-blueprints] serving dist on 127.0.0.1:${port}`);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    try {
      browser = await chromium.launch({ headless: true });
    } catch (error) {
      die(`cannot launch a browser (system Chrome expected): ${error.message}`);
    }
  }
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/blueprints.html`, { waitUntil: 'networkidle' });

  // freeze motion: the cache hash must not depend on animation frames
  await page.addStyleTag({
    content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600); // force-show popovers settle (60ms) + a few frames

  const names = await page.evaluate(() =>
    [...document.querySelectorAll('[data-blueprint]')].map((el) => el.dataset.blueprint),
  );
  if (!names.length) die('no [data-blueprint] stages found on /blueprints.html');
  const targets = only ? names.filter((n) => only.includes(n)) : names;
  if (!targets.length) die(`--only matched nothing (page has: ${names.join(', ')})`);

  let hits = 0;
  const misses = [];
  const rendered = [];
  const auditFailures = [];
  const strict = args.has('--strict');

  for (const name of targets) {
    // scroll the stage to the viewport center first: anchor-positioned
    // panels (position-visibility: anchors-visible) and :modal geometry
    // must be live for the serializer
    await page.evaluate((n) => {
      document.querySelector(`[data-blueprint="${CSS.escape(n)}"]`)?.scrollIntoView({ block: 'center', inline: 'center' });
    }, name);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const scene = await page.evaluate(serializeStageInPage, `[data-blueprint="${name}"]`);
    // F8 overflow probe: a text run outside the stage or over another run
    // is visible garbage in the tile. --strict skips + fails the scene;
    // default runs render anyway (no silent stale artifacts) and report.
    const problems = auditScene(scene);
    if (problems.length) auditFailures.push({ name, problems });
    if (problems.length && strict) continue;
    const hash = createHash('sha256').update(CONVERTER_FINGERPRINT + JSON.stringify(scene)).digest('hex');
    if (cache.entries[name] === hash && existsSync(path.join(outDir, `${name}.svg`))) {
      hits++;
      continue;
    }
    const svg = await renderScene(scene);
    // committed convention: no trailing newline (keeps regenerated artifacts
    // byte-stable against the repo copies for unchanged scenes)
    writeFileSync(path.join(outDir, `${name}.svg`), svg.replace(/\n$/, ''));
    cache.entries[name] = hash;
    misses.push(name);
    rendered.push(`${name}: ${(svg.length / 1024).toFixed(1)}KB`);
  }
  // keep the built dist in step (the tool's internal vite build ran
  // BEFORE these writes — a stale dist would serve the previous svgs)
  if (misses.length) {
    const distBlueprints = path.join(wwwDist, 'blueprints');
    mkdirSync(distBlueprints, { recursive: true });
    cpSync(outDir, distBlueprints, { recursive: true });
  }

  // orphan cleanup: svgs whose stage no longer exists
  const keep = new Set(names.map((n) => `${n}.svg`));
  for (const file of readdirSync(outDir)) {
    if (file.endsWith('.svg') && !keep.has(file)) {
      rmSync(path.join(outDir, file));
      delete cache.entries[path.basename(file, '.svg')];
      console.log(`[build-blueprints] removed orphan ${file}`);
    }
  }

  writeFileSync(cacheFile, JSON.stringify(cache, null, 2) + '\n');
  await browser.close();
  server.close();

  console.log(`[build-blueprints] ${targets.length} stages: ${hits} cache hits, ${misses.length} rendered`);
  for (const line of rendered) console.log(`  ${line}`);
  if (auditFailures.length) {
    // site-polish F8: the audit's walkthrough eyeballed TWO tiles, but the
    // probe shows the overflow class is systemic across the scene catalog
    // (~20 scenes). The gate FAILS under --strict; until those scenes get
    // the same measure-then-fit pass, default runs report the inventory so
    // the data is never lost.
    console.error(`\n[build-blueprints] scene audit: ${auditFailures.length} stage(s) with text overflow/overlap${strict ? '' : ' (report-only — pass --strict to fail)'}:`);
    for (const { name, problems } of auditFailures) {
      for (const problem of problems) console.error(`  ${name}: ${problem}`);
    }
    if (strict) process.exit(1);
  } else {
    console.log('[build-blueprints] scene audit: all stages clean');
  }
  console.log(`[build-blueprints] done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s → apps/www/static/blueprints/`);
}

main().catch((error) => {
  console.error('[build-blueprints] failed:', error);
  process.exit(1);
});
