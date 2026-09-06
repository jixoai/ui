#!/usr/bin/env node
// verify-katex-mermaid — the KaTeX/Mermaid browser probe
// (katex-mermaid design §8, 2026-09-06).
//
// The REAL-engine gate the vitest lanes cannot be: vitest mocks the
// mermaid engine (a ~1MB ESM engine with a DOM-bound renderer is not a
// jsdom citizen), so the initialize/render contract, the lazy
// singleton, and the live token pipeline only ever run for real in a
// browser. This probe drives a served site (a running dev server, or
// the composite chain's managed static dist server) and asserts, per
// design §8:
//
//   1. /docs/components/mermaid.html mounts and renders its diagram
//      instances — `[data-jx-mermaid] svg` present;
//   2. the rendered SVGs carry DISTINCT ids (the render-id collision
//      contract, live — the page mounts multiple instances);
//   3. a document-root `.dark` flip re-renders the auto instances
//      (data-state settles back, fresh svg ids) and a baked `fill`
//      attribute on a themed node CHANGES between the light and dark
//      snapshots (the token re-derive is real, not mocked);
//   4. /docs/components/math-block.html serves REAL prerendered KaTeX
//      markup (`.katex` + the hidden MathML `math` element) and the
//      wide-equation strip carries its scroll verdict
//      (`data-jx-scroll-state`) once hydration arms the stamp machine;
//   5. any miss exits non-zero naming the failing selector.
//
// Usage (from repo root):
//   pnpm dev &                          # server on :5199
//   npm run verify:km                   # or: node scripts/verify-katex-mermaid.mjs --url http://localhost:5199
//
// The composite chain (verify-all) owns the server lifecycle there: it
// serves apps/www/dist on an OS-assigned 127.0.0.1 port and passes
// --url; standalone runs keep the caller-provided --url contract
// (verify-surface's bootstrap pattern verbatim).
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const argUrl = process.argv.indexOf('--url');
const BASE = argUrl >= 0 ? process.argv[argUrl + 1] : 'http://localhost:5199';

// ── browser discovery: newest playwright cache, then system Chrome ──
function findChrome() {
  const cache = join(homedir(), 'Library/Caches/ms-playwright');
  if (existsSync(cache)) {
    const versions = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse();
    for (const v of versions) {
      for (const name of ['Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium']) {
        const p = join(cache, v, name);
        if (existsSync(p)) return p;
      }
    }
  }
  const system = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (existsSync(system)) return system;
  console.error('No Chromium found (playwright cache or /Applications). Run: npx playwright install chromium');
  process.exit(1);
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(` ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// the per-page snapshot (evaluated IN the page as a REAL function —
// playwright auto-invokes function arguments): every rendered diagram's
// ROOT svg (the direct child of the zoom wrapper — mermaid nests
// icon svgs inside, and only the root carries the render id) + the
// joined baked fill attributes of its themed nodes (positional order is
// stable across re-renders — ids are not)
const snapshot = () => {
  const figures = [...document.querySelectorAll('[data-jx-mermaid]')];
  const svgs = [...document.querySelectorAll('[data-jx-mermaid-zoom] > svg')].map((svg) => ({
    id: svg.getAttribute('id') ?? '',
    fills: [...svg.querySelectorAll('[fill]')].map((el) => el.getAttribute('fill')).join('|'),
  }));
  return {
    svgs,
    states: figures.map((f) => f.getAttribute('data-state')),
    rendering: figures.some((f) => f.getAttribute('data-state') === 'rendering'),
  };
};

/** poll an in-page predicate (a real function, auto-invoked by
 *  playwright, one optional arg) until it holds or the budget runs out */
async function waitFor(page, predicate, what, timeoutMs = 30_000, arg) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await page.evaluate(predicate, arg)) return true;
    await page.waitForTimeout(250);
  }
  console.error(`[verify-katex-mermaid] timed out waiting for ${what} (${timeoutMs}ms)`);
  return false;
}

/** no instance is mid-render (the serial queue drains) */
const settled = () =>
  ![...document.querySelectorAll('[data-jx-mermaid]')].some(
    (f) => f.getAttribute('data-state') === 'rendering',
  );

/** settled AND at least one root svg id is fresh (not in the light snapshot) */
const rerenderedAwayFrom = (ids) =>
  ![...document.querySelectorAll('[data-jx-mermaid]')].some(
    (f) => f.getAttribute('data-state') === 'rendering',
  ) &&
  [...document.querySelectorAll('[data-jx-mermaid-zoom] > svg')].some(
    (svg) => !ids.includes(svg.getAttribute('id') ?? ''),
  );

const browser = await chromium.launch({ executablePath: findChrome() });

try {
  // ── 1-3. the mermaid page: instances, distinct ids, the dark flip ──
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/docs/components/mermaid.html`);
    await page.waitForLoadState('domcontentloaded');

    // 1. the lazy engine loads and the instances render (generous
    //    budget: ~1MB engine, several instances through the serial queue)
    try {
      await page.waitForSelector('[data-jx-mermaid-zoom] > svg', { timeout: 60_000 });
      check('mermaid: rendered diagram instances exist ([data-jx-mermaid] svg)', true);
    } catch {
      check('mermaid: rendered diagram instances exist ([data-jx-mermaid] svg)', false, 'selector never appeared within 60s');
      throw new Error('probe cannot continue without a rendered diagram');
    }
    // let the remaining instances settle (the queue serializes renders)
    await waitFor(page, settled, 'the initial renders to settle');

    const light = await page.evaluate(snapshot);

    // 2. the id collision contract: ≥2 instances, pairwise-distinct ids
    check(
      'mermaid: at least two rendered instances (the id-collision demo surface)',
      light.svgs.length >= 2,
      `${light.svgs.length} svg(s)`,
    );
    const ids = light.svgs.map((s) => s.id);
    const distinct = new Set(ids);
    check(
      'mermaid: svg ids are pairwise distinct (the render-id contract)',
      distinct.size === ids.length && !distinct.has(''),
      ids.join(', ') || '(no ids)',
    );

    // 3. the dark flip: auto instances re-derive and re-render — fresh
    //    svg ids, settled states, and a baked themed fill that CHANGED
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    const rerendered = await waitFor(
      page,
      rerenderedAwayFrom,
      'the dark-flip re-render (fresh svg ids, states settled)',
      45_000,
      ids,
    );
    check(
      'mermaid: .dark flip re-renders the auto instances (fresh svg ids, data-state settled)',
      rerendered,
      rerendered ? '' : 'no fresh svg id appeared after the flip (the effective-scope observer never fired?)',
    );
    const dark = await page.evaluate(snapshot);
    const changedAt = light.svgs
      .map((s, i) => (dark.svgs[i] && dark.svgs[i].fills !== s.fills ? i : -1))
      .filter((i) => i !== -1);
    check(
      'mermaid: a baked themed fill changed between the light and dark snapshots',
      changedAt.length > 0,
      changedAt.length
        ? `svg position(s) ${changedAt.join(', ')} re-derived the palette`
        : 'every baked fill is identical across themes (tokens never re-read?)',
    );

    await page.close();
  }

  // ── 4. the math-block page: prerendered markup + the strip verdict ──
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/docs/components/math-block.html`);
    await page.waitForLoadState('domcontentloaded');

    // real KaTeX markup in the SERVED DOM (the sync SSR lane — these
    // arrive with the prerendered bytes, no waiting on hydration)
    try {
      await page.waitForSelector('[data-jx-math-block] .katex', { timeout: 30_000 });
      check('math-block: .katex markup present in the served DOM', true);
    } catch {
      check('math-block: .katex markup present in the served DOM', false, 'selector [data-jx-math-block] .katex never appeared');
    }
    const mathml = await page.$('[data-jx-math-block] math');
    check(
      'math-block: hidden MathML present (the screen-reader path)',
      mathml !== null,
      mathml !== null ? '' : 'selector [data-jx-math-block] math not found (output: htmlAndMathml default broken?)',
    );

    // the stamp machine arms on hydration: the run carries its verdict
    // (none | start-closed | end-closed | open — any of the four)
    try {
      await page.waitForSelector('[data-jx-math-block] [data-jx-scroll-run][data-jx-scroll-state]', { timeout: 30_000 });
      const verdicts = await page.$$eval(
        '[data-jx-math-block] [data-jx-scroll-run]',
        (runs) => runs.map((run) => `${run.getAttribute('data-axis')}=${run.getAttribute('data-jx-scroll-state')}`),
      );
      check(
        'math-block: the strip carries a data-jx-scroll-state verdict',
        verdicts.length > 0 && verdicts.every((v) => /=(none|start-closed|end-closed|open)$/.test(v)),
        verdicts.join(', '),
      );
    } catch {
      check('math-block: the strip carries a data-jx-scroll-state verdict', false, 'selector [data-jx-scroll-run][data-jx-scroll-state] never appeared (stamp machine unarmed?)');
    }

    await page.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\n✗ verify-katex-mermaid FAILED — ${failed.length} assertion(s):`);
  for (const f of failed) console.error(`  ${f.name}`);
  process.exit(1);
}
console.log(`\n✓ verify-katex-mermaid GREEN — ${results.length} assertion(s) passed against ${BASE}`);
