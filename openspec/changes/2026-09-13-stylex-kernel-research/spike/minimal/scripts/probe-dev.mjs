#!/usr/bin/env node
// probe-dev.mjs — spike/minimal DEV-side D1 fixtures.
//
// Covers: D1-01 (style[data-stylex] ≤2s + computed bg), D1-02 (HMR
// without full reload), D1-03 dev (FOUC: MutationObserver installed
// via addInitScript BEFORE parsing; style_ready ≤ FCP, SOFT-FAIL band
// 0–100ms), D1-06 dev (zero /hydrat|mismatch/i console + data-style-src),
// D1-08 dev ($state → width follows + inline-style presence), D1-09 dev
// (:hover computed change + animationName + currentTime advancing).
//
// Owns the dev-server lifecycle: spawns `vite --port`, tears it down
// with SIGTERM/SIGKILL and prints the recycle evidence.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { launchEngine } from './browser.mjs';

const PORT = Number(process.env.PORT || 5291);
const BASE = `http://localhost:${PORT}/`;
const APP = new URL('../src/App.svelte', import.meta.url).pathname;
const ENGINE = process.env.ENGINE || 'chromium';

const results = [];
const record = (id, verdict, detail) => {
  results.push({ id, verdict });
  console.log(` ${verdict.padEnd(9)} ${id} — ${detail}`);
};

// ── dev server lifecycle ───────────────────────────────────────────
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
});
let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d));
server.stderr.on('data', (d) => (serverLog += d));
const serverPid = server.pid;
console.log(`[probe-dev] dev server pid=${serverPid} spawning on :${PORT}`);

async function waitReady() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (serverLog.includes(`localhost:${PORT}`)) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`dev server never became ready:\n${serverLog}`);
}

// ── the D1-03 init script: MutationObserver installed before parse ──
const FOUC_INIT = `
  window.__fouc = { installedAt: performance.now(), insertions: [], readyState: document.readyState };
  const record = (node, how) => {
    if (node && node.tagName === 'STYLE' && node.hasAttribute && node.hasAttribute('data-stylex')) {
      window.__fouc.insertions.push({
        ts: performance.now(),
        how,
        len: (node.textContent || '').length,
      });
    }
  };
  new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        record(n, 'mutation:addedNodes');
      }
      if (m.type === 'attributes' && m.target && m.target.tagName === 'STYLE') {
        // a pre-existing <style data-stylex> that only gains content later
        record(m.target, 'mutation:attributes');
      }
    }
  }).observe(document.documentElement || document, { childList: true, subtree: true, characterData: true, attributes: true });
`;

const browser = await launchEngine(ENGINE);
let exitCode = 0;
try {
  await waitReady();

  // ── D1-01: fresh page, style[data-stylex] within 2s + computed bg ──
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const t0 = Date.now();
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    let styleAt = -1;
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      styleAt = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const el = document.querySelector('style[data-stylex]');
            if (el) return resolve(performance.now());
            const obs = new MutationObserver(() => {
              if (document.querySelector('style[data-stylex]')) {
                obs.disconnect();
                resolve(performance.now());
              }
            });
            obs.observe(document.head, { childList: true, subtree: true });
            setTimeout(() => resolve(-1), 250);
          }),
      );
      if (styleAt >= 0) break;
    }
    const waitedMs = Date.now() - t0;
    const bg = await page.evaluate(
      () => getComputedStyle(document.querySelector('[data-d1="probe"]'))?.backgroundColor ?? null,
    );
    const okStyle = styleAt >= 0 && waitedMs <= 2000;
    const okBg = bg === 'rgb(18, 52, 86)'; // #123456
    record(
      'D1-01',
      okStyle && okBg ? 'PASS' : 'FAIL',
      `style[data-stylex] seen after ${waitedMs}ms (probe-now ${styleAt.toFixed(1)}ms, ≤2000 required); probe computed bg=${bg} (expected rgb(18, 52, 86))`,
    );
    await page.close();
  }

  // ── D1-03 dev: FRESH navigation, observer installed pre-parse ────
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.addInitScript(FOUC_INIT);
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: 'load' });
    // settle: ensure the style tag has rules and probe bg settled
    await page.waitForFunction(
      () =>
        document.querySelector('style[data-stylex]') &&
        getComputedStyle(document.querySelector('[data-d1="probe"]')).backgroundColor ===
          'rgb(18, 52, 86)',
      { timeout: 10_000 },
    );
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paints = performance.getEntriesByType('paint');
      const links = performance.getEntriesByType('resource').filter((r) => r.name.includes('.css') || r.name.includes('virtual:stylex'));
      return {
        fouc: window.__fouc,
        navigationStart: nav ? nav.startTime : null,
        fcp: paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? null,
        allPaints: paints.map((p) => `${p.name}@${p.startTime.toFixed(1)}`),
        resources: links.map((r) => `${r.name.split('/').pop()} respEnd=${r.responseEnd.toFixed(1)}`),
        settledBg: getComputedStyle(document.querySelector('[data-d1="probe"]')).backgroundColor,
      };
    });
    const insertions = m.fouc.insertions;
    const styleReady = insertions.length ? Math.min(...insertions.map((i) => i.ts)) : null;
    const fcp = m.fcp;
    if (styleReady == null) {
      record('D1-03(dev)', 'FAIL', `style_ready never observed. insertions=${JSON.stringify(insertions)} paints=${m.allPaints.join(',')}`);
    } else if (fcp == null) {
      // FCP missing ⇒ FAIL unless the browser emits NO paint entries at all
      const noPaints = m.allPaints.length === 0;
      record(
        'D1-03(dev)',
        noPaints ? 'LIMITATION' : 'FAIL',
        `FCP entry missing (paints: ${m.allPaints.join(',') || 'none'}). style_ready=${styleReady.toFixed(1)}ms`,
      );
    } else {
      const gap = styleReady - fcp;
      const verdict = styleReady <= fcp ? 'PASS' : gap <= 100 ? 'SOFT-FAIL' : 'FAIL';
      record(
        'D1-03(dev)',
        verdict,
        `style_ready=${styleReady.toFixed(1)}ms FCP_start=${fcp.toFixed(1)}ms gap=${gap.toFixed(1)}ms; navStart=${m.navigationStart} observerInstall=${m.fouc.installedAt.toFixed(1)}ms readyState@install=${m.fouc.readyState}; callback-delay upper bound recorded; settledBg=${m.settledBg}; resources=[${m.resources.join(', ')}]`,
      );
    }
    await context.close();
  }

  // ── D1-02: HMR edit without full reload ──────────────────────────
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector('[data-d1="hmr"]')).backgroundColor === 'rgb(0, 170, 51)',
      { timeout: 10_000 },
    );
    const before = await page.evaluate(() => performance.getEntriesByType('navigation').length);
    const src = readFileSync(APP, 'utf8');
    const NEW = '#00bb44';
    writeFileSync(APP, src.replace("backgroundColor: '#00aa33'", `backgroundColor: '${NEW}'`));
    const t0 = Date.now();
    let updated = false;
    while (Date.now() - t0 < 3000) {
      const bg = await page.evaluate(
        () => getComputedStyle(document.querySelector('[data-d1="hmr"]'))?.backgroundColor ?? null,
      );
      if (bg === 'rgb(0, 187, 68)') {
        updated = true;
        break;
      }
      await page.waitForTimeout(100);
    }
    const took = Date.now() - t0;
    const after = await page.evaluate(() => performance.getEntriesByType('navigation').length);
    writeFileSync(APP, src); // restore
    await page.waitForTimeout(400); // let HMR settle back
    record(
      'D1-02',
      updated && took <= 3000 && before === 1 && after === 1 ? 'PASS' : 'FAIL',
      `computed bg #00aa33→#00bb44 observed after ${took}ms (≤3000 required); navigation entries before=${before} after=${after} (must stay 1)`,
    );
    await page.close();
  }

  // ── D1-06 dev + D1-08 dev + D1-09 dev (one instrumented page) ────
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const consoleMsgs = [];
    const pageErrors = [];
    page.on('console', (msg) => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector('[data-d1="probe"]')).backgroundColor === 'rgb(18, 52, 86)',
      { timeout: 10_000 },
    );
    const dataStyleSrc = await page.evaluate(
      () => document.querySelector('[data-d1="probe"]')?.getAttribute('data-style-src') ?? null,
    );
    const bad = consoleMsgs.filter((t) => /hydrat|mismatch/i.test(t));
    record(
      'D1-06(dev)',
      bad.length === 0 && dataStyleSrc != null && pageErrors.length === 0 ? 'PASS' : 'FAIL',
      `console=${JSON.stringify(consoleMsgs)} pageErrors=${JSON.stringify(pageErrors)} data-style-src=${JSON.stringify(dataStyleSrc)} (debug:true pinned)`,
    );

    // D1-08: $state-driven dynamic width
    const wBefore = await page.evaluate(
      () => getComputedStyle(document.querySelector('[data-d1="dyn"]')).width,
    );
    const inlineBefore = await page.evaluate(() => document.querySelector('[data-d1="dyn"]').getAttribute('style'));
    await page.click('[data-d1="dyn-toggle"]');
    await page.waitForTimeout(200);
    const wAfter = await page.evaluate(
      () => getComputedStyle(document.querySelector('[data-d1="dyn"]')).width,
    );
    const inlineAfter = await page.evaluate(() => document.querySelector('[data-d1="dyn"]').getAttribute('style'));
    const errsDuring = pageErrors.length;
    record(
      'D1-08(dev)',
      wBefore === '120px' && wAfter === '220px' && inlineAfter && inlineAfter.includes('width: 220px') && errsDuring === 0
        ? 'PASS'
        : 'FAIL',
      `width ${wBefore}→${wAfter}; mechanism=${inlineAfter ? 'inline style' : 'class swap'}; style attr ${JSON.stringify(inlineBefore)}→${JSON.stringify(inlineAfter)}; pageErrors=${errsDuring}`,
    );

    // D1-09: :hover + keyframes
    const hoverBase = await page.evaluate(
      () => getComputedStyle(document.querySelector('[data-d1="hover"]')).backgroundColor,
    );
    await page.hover('[data-d1="hover"]');
    await page.waitForTimeout(250);
    const hoverOn = await page.evaluate(
      () => getComputedStyle(document.querySelector('[data-d1="hover"]')).backgroundColor,
    );
    const anim = await page.evaluate(() => {
      const el = document.querySelector('[data-d1="keyframes"]');
      const cs = getComputedStyle(el);
      const a = el.getAnimations()[0];
      return { name: cs.animationName, t1: a ? a.currentTime : null };
    });
    await page.waitForTimeout(120);
    const t2 = await page.evaluate(
      () => document.querySelector('[data-d1="keyframes"]').getAnimations()[0]?.currentTime ?? null,
    );
    const advances = anim.t1 != null && t2 != null && Number(t2) > Number(anim.t1);
    record(
      'D1-09(dev)',
      hoverBase !== hoverOn && hoverOn === 'rgb(255, 204, 0)' && anim.name && anim.name !== 'none' && advances
        ? 'PASS'
        : 'FAIL',
      `:hover ${hoverBase}→${hoverOn}; animationName=${anim.name}; currentTime ${anim.t1}→${t2} (advances=${advances})`,
    );
    await page.close();
  }
} catch (err) {
  console.error('[probe-dev] fatal:', err);
  exitCode = 1;
} finally {
  await browser.close().catch(() => {});
  // ── process recycle evidence ─────────────────────────────────────
  try {
    process.kill(-serverPid, 'SIGTERM'); // negative pid: the process group (npx → vite child)
  } catch {
    try { server.kill('SIGTERM'); } catch {}
  }
  await new Promise((r) => setTimeout(r, 800));
  let alive = false;
  try { process.kill(serverPid, 0); alive = true; } catch { alive = false; }
  let groupAlive = false;
  try { process.kill(-serverPid, 0); groupAlive = true; } catch { groupAlive = false; }
  if (alive || groupAlive) {
    try { process.kill(-serverPid, 'SIGKILL'); } catch {}
    try { server.kill('SIGKILL'); } catch {}
  }
  console.log(`[probe-dev] dev server pid=${serverPid} recycled (alive after SIGTERM: ${alive}, group: ${groupAlive}${alive || groupAlive ? ' → SIGKILL sent' : ''})`);
}

const fails = results.filter((r) => r.verdict === 'FAIL' || r.verdict === 'SOFT-FAIL');
console.log(`\n[probe-dev:${ENGINE}] ${results.length - fails.length}/${results.length} green`);
process.exit(fails.length ? 1 : exitCode);
