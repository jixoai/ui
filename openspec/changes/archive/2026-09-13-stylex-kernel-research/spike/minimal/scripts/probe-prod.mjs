#!/usr/bin/env node
// probe-prod.mjs — spike/minimal PROD-side D1 fixtures.
//
// Assumes `npm run build` produced dist/. Serves it with
// `vite preview --port 5292` (own lifecycle + recycle evidence).
//
// Covers: D1-03 prod (style-ready = max(responseEnd) over the page's
// render-blocking <link rel=stylesheet>; PASS ⟺ ≤ FCP_start),
// D1-05 (computed == authored ∧ a link's bytes contain the class
// rule), D1-06 prod (console hygiene + data-style-src with debug:true
// pinned in BOTH modes), D1-08 prod ($state dynamic), D1-09 prod
// (hover/keyframes; dev value == prod value is asserted by comparing
// against the values probe-dev.mjs printed — recorded here verbatim).
import { spawn } from 'node:child_process';
import { launchEngine } from './browser.mjs';

const PORT = Number(process.env.PORT || 5292);
const BASE = `http://localhost:${PORT}/`;
const ENGINE = process.env.ENGINE || 'chromium';

const results = [];
const record = (id, verdict, detail) => {
  results.push({ id, verdict });
  console.log(` ${verdict.padEnd(9)} ${id} — ${detail}`);
};

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
});
let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d));
server.stderr.on('data', (d) => (serverLog += d));
const serverPid = server.pid;
console.log(`[probe-prod] preview server pid=${serverPid} spawning on :${PORT}`);

async function waitReady() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (serverLog.includes(`localhost:${PORT}`)) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`preview server never became ready:\n${serverLog}`);
}

const browser = await launchEngine(ENGINE);
let exitCode = 0;
try {
  await waitReady();

  // ── D1-03 prod + D1-05: fresh navigation with resource timing ───
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(BASE, { waitUntil: 'load' });
    const m = await page.evaluate(async () => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paints = performance.getEntriesByType('paint');
      const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? null;
      // render-blocking links: <link rel=stylesheet> in head
      const links = [...document.head.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
      const res = performance.getEntriesByType('resource').filter((r) => links.includes(r.name));
      const probe = document.querySelector('[data-d1="probe"]');
      // D1-05: the link's BYTES must contain the probe class rule
      const probeClass = probe ? (probe.className || '').split(/\s+/).filter((c) => /^x/.test(c)) : [];
      let ruleHits = [];
      for (const href of links) {
        try {
          const css = await (await fetch(href)).text();
          ruleHits = probeClass.filter((c) => css.includes(`.${c}`));
        } catch {}
      }
      return {
        navStart: nav ? nav.startTime : null,
        fcp,
        paints: paints.map((p) => `${p.name}@${p.startTime.toFixed(1)}`),
        blockingLinks: links,
        linkResponseEnds: res.map((r) => `${r.name.split('/').pop()}=${r.responseEnd.toFixed(1)}`),
        styleReady: res.length ? Math.max(...res.map((r) => r.responseEnd)) : null,
        probeBg: probe ? getComputedStyle(probe).backgroundColor : null,
        probeClass: probe ? probe.className : null,
        ruleHits,
        dataStyleSrc: probe ? probe.getAttribute('data-style-src') : null,
      };
    });
    if (m.styleReady == null || m.fcp == null) {
      const noPaints = m.paints.length === 0;
      record(
        'D1-03(prod)',
        noPaints ? 'LIMITATION' : 'FAIL',
        `style_ready=${m.styleReady} fcp=${m.fcp} paints=[${m.paints.join(',')}] links=${JSON.stringify(m.blockingLinks)}`,
      );
    } else {
      const gap = m.styleReady - m.fcp;
      const verdict = m.styleReady <= m.fcp ? 'PASS' : gap <= 100 ? 'SOFT-FAIL' : 'FAIL';
      record(
        'D1-03(prod)',
        verdict,
        `style_ready(max responseEnd)=${m.styleReady.toFixed(1)}ms FCP_start=${m.fcp.toFixed(1)}ms gap=${gap.toFixed(1)}ms; links=[${m.linkResponseEnds.join(', ')}]; navStart=${m.navStart}`,
      );
    }
    const okBg = m.probeBg === 'rgb(18, 52, 86)';
    record(
      'D1-05',
      okBg && m.ruleHits.length > 0 ? 'PASS' : 'FAIL',
      `computed=${m.probeBg} (expected rgb(18, 52, 86)); link bytes contain ${m.ruleHits.length} of the probe's atomic classes (${JSON.stringify(m.ruleHits)}); links=${JSON.stringify(m.blockingLinks)}`,
    );
    await page.close();
  }

  // ── D1-06 prod + D1-08 prod + D1-09 prod ────────────────────────
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
      'D1-06(prod)',
      bad.length === 0 && dataStyleSrc != null && pageErrors.length === 0 ? 'PASS' : 'FAIL',
      `console=${JSON.stringify(consoleMsgs)} pageErrors=${JSON.stringify(pageErrors)} data-style-src=${JSON.stringify(dataStyleSrc)} (debug:true pinned in prod too)`,
    );

    const wBefore = await page.evaluate(
      () => getComputedStyle(document.querySelector('[data-d1="dyn"]')).width,
    );
    await page.click('[data-d1="dyn-toggle"]');
    await page.waitForTimeout(200);
    const wAfter = await page.evaluate(
      () => getComputedStyle(document.querySelector('[data-d1="dyn"]')).width,
    );
    const inlineAfter = await page.evaluate(() => document.querySelector('[data-d1="dyn"]').getAttribute('style'));
    record(
      'D1-08(prod)',
      wBefore === '120px' && wAfter === '220px' && inlineAfter && inlineAfter.includes('width: 220px') ? 'PASS' : 'FAIL',
      `width ${wBefore}→${wAfter}; mechanism=${inlineAfter ? 'inline style' : 'class swap'}; style attr=${JSON.stringify(inlineAfter)}; pageErrors=${pageErrors.length}`,
    );

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
    // dev values from probe-dev.mjs (chromium): hoverOn rgb(255,204,0), name xqng64z-B
    const devParity = hoverOn === 'rgb(255, 204, 0)' && anim.name === 'xqng64z-B';
    record(
      'D1-09(prod)',
      hoverBase !== hoverOn && hoverOn === 'rgb(255, 204, 0)' && anim.name && anim.name !== 'none' && advances && devParity
        ? 'PASS'
        : 'FAIL',
      `:hover ${hoverBase}→${hoverOn}; animationName=${anim.name}; currentTime ${anim.t1?.toFixed?.(1)}→${t2?.toFixed?.(1)} (advances=${advances}); dev≡prod=${devParity} (dev: rgb(255,204,0)/xqng64z-B)`,
    );
    await page.close();
  }
} catch (err) {
  console.error('[probe-prod] fatal:', err);
  exitCode = 1;
} finally {
  await browser.close().catch(() => {});
  try {
    process.kill(-serverPid, 'SIGTERM');
  } catch {
    try { server.kill('SIGTERM'); } catch {}
  }
  await new Promise((r) => setTimeout(r, 800));
  let alive = false;
  try { process.kill(serverPid, 0); alive = true; } catch {}
  let groupAlive = false;
  try { process.kill(-serverPid, 0); groupAlive = true; } catch {}
  if (alive || groupAlive) {
    try { process.kill(-serverPid, 'SIGKILL'); } catch {}
    try { server.kill('SIGKILL'); } catch {}
  }
  console.log(`[probe-prod] preview server pid=${serverPid} recycled (alive after SIGTERM: ${alive}, group: ${groupAlive}${alive || groupAlive ? ' → SIGKILL sent' : ''})`);
}

const fails = results.filter((r) => r.verdict === 'FAIL' || r.verdict === 'SOFT-FAIL');
console.log(`\n[probe-prod:${ENGINE}] ${results.length - fails.length}/${results.length} green`);
process.exit(fails.length ? 1 : exitCode);
