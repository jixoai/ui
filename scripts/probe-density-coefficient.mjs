#!/usr/bin/env node
// Density-coefficient probe (explicit-props W1 task 1.8 receipt, §4).
//
// Serves a minimal static fixture over the REAL theme sheet (the www
// mirror — byte-identical to the registry source) and asserts that
// getComputedStyle EQUALS each frozen §4 formula evaluated numerically
// in JS — exact values, never existence:
//   · the PLAIN pattern  : base rung scale × coefficient, once
//   · row-min / hit      : the §4 max() forms — content term (line +
//                          stack + stack, the per-rung BASE scales) ×
//                          coefficient ONCE, floors ABSOLUTE
//   · textarea-min/lane  : UNCHANGED formulas over EFFECTIVE operands
//                          (each already scaled once — the
//                          double-scaling law: zero further coefficient)
// Plus the hard guardrails (coefficient-independent): --jx-hit ≥ 24px
// inside the 2xs scope (its own 6U floor override), ≥ 28px everywhere
// else (7U). Plus the task 1.6 receipt: --text-caption (9px) and
// --text-micro (10px) stay ABSOLUTE (rem) under a --jx-size-effective
// override.
//
// Server: python3 http.server on a scratch dir (the sheet copy with
// only the two fontsource @imports stripped — fonts never enter the
// length math); the process is SIGTERM'd in the finally block and its
// PID reported. Browser: playwright-core + CHROME_PATH (default the
// system Google Chrome).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';

const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ── the kernel constants, mirrored in JS (U = 4px at the 16px root;
//    rung values are the sheet's own computed table — the same numbers
//    verify-density-kernel.mjs locks) ────────────────────────────────
const U = 4;
const RUNGS = {
  '2xs': { text: 10, line: 14, gap: 8, stack: 4, inset: 8, icon: 14, rowFloor: 6, hitFloor: 24 },
  sm: { text: 12, line: 18, gap: 8, stack: 4, inset: 8, icon: 18, rowFloor: 8, hitFloor: 28 },
  default: { text: 13, line: 20, gap: 12, stack: 8, inset: 12, icon: 20, rowFloor: 10, hitFloor: 28 },
  lg: { text: 15, line: 24, gap: 16, stack: 8, inset: 16, icon: 24, rowFloor: 12, hitFloor: 28 },
};
const contentTerm = (r) => r.line + r.stack + r.stack; // the per-rung BASE scales, unscaled
// the frozen §4 forms, evaluated numerically:
const rowMin = (r, k) => Math.max(U * r.rowFloor, contentTerm(r) * k); // floor absolute
const hit = (r, k) => Math.max(r.hitFloor, U * r.rowFloor, contentTerm(r) * k); // floors absolute
const textareaMin = (r, k) => Math.max(hit(r, k), r.line * k * 3 + r.stack * k * 2 + 2); // operands EFFECTIVE
const colorLane = (r, k) => Math.max(hit(r, k), r.icon * k + r.inset * k * 2 + 2); // operands EFFECTIVE

// ── the fixture ────────────────────────────────────────────────────
const PROBE_CLASSES = `
.p-gap { display: flex; column-gap: var(--jx-gap); }
.p-stack { display: flex; row-gap: var(--jx-stack); }
.p-text { font-size: var(--jx-text); }
.p-line { min-height: var(--jx-line); }
.p-leading { font-size: 100px; line-height: var(--jx-leading); } /* px/100 = the leading number */
.p-inset { padding-inline-start: var(--jx-inset); }
.p-icon { width: var(--jx-icon); }
.p-rowmin { min-height: var(--jx-row-min); }
.p-hit { min-height: var(--jx-hit); }
.p-textarea { min-height: var(--jx-textarea-min); }
.p-lane { min-height: var(--jx-color-lane); }
.p-caption { font-size: var(--text-caption); }
.p-micro { font-size: var(--text-micro); }`;
const CHANNEL_PROBES = ['gap', 'stack', 'text', 'line', 'leading', 'inset', 'icon', 'rowmin', 'hit', 'textarea', 'lane']
  .map((c) => `<div class="p-${c}"></div>`)
  .join('');

const fixtureHtml = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="jixoai.css">
<style>${PROBE_CLASSES}</style>
</head><body>
<div data-density="sm" id="f-sm-coef" style="--jx-density-coefficient: 0.75">${CHANNEL_PROBES}</div>
<div data-density="sm" id="f-sm-named">${CHANNEL_PROBES}</div>
<div data-density="lg" id="f-lg-coef" style="--jx-density-coefficient: 0.75"><div id="f-auto">${CHANNEL_PROBES}</div></div>
<div data-density="2xs" id="f-2xs-coef" style="--jx-density-coefficient: 0.75">${CHANNEL_PROBES}</div>
<div data-density="2xs" id="f-2xs-tiny" style="--jx-density-coefficient: 0.1">${CHANNEL_PROBES}</div>
<div data-density="sm" id="f-sm-tiny" style="--jx-density-coefficient: 0.1">${CHANNEL_PROBES}</div>
<div data-density="default" id="f-default-coef" style="--jx-density-coefficient: 0.75">${CHANNEL_PROBES}</div>
<div id="f-micro" style="--jx-size-effective: 1.5rem; font-size: var(--jx-size-effective, 1rem)">
  <span class="p-caption" id="micro-caption"></span>
  <span class="p-micro" id="micro-micro"></span>
</div>
</body></html>`;

// ── serve: python3 http.server over a scratch dir ──────────────────
const scratch = mkdtempSync(resolve(tmpdir(), 'jx-density-probe-'));
const sheet = readFileSync(resolve('apps/www/src/lib/jixoai.css'), 'utf8')
  .replace(/^@import '@fontsource[^;]+;\n/gm, ''); // fonts never enter the length math
writeFileSync(resolve(scratch, 'jixoai.css'), sheet);
writeFileSync(resolve(scratch, 'fixture.html'), fixtureHtml);

const py = spawn('python3', ['-u', '-m', 'http.server', '0', '--bind', '127.0.0.1', '--directory', scratch], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
const port = await new Promise((res, rej) => {
  const onLine = (d) => {
    const m = /port (\d+)/.exec(d.toString());
    if (m) {
      py.stdout.off('data', onLine);
      py.stderr.off('data', onLine);
      res(Number(m[1]));
    }
  };
  py.stdout.on('data', onLine);
  py.stderr.on('data', onLine); // http.server may print the banner on stderr
  py.on('exit', () => rej(new Error('python3 http.server exited before serving')));
  setTimeout(() => rej(new Error('python3 http.server port parse timeout')), 10_000);
}).catch((err) => {
  // never leak the server: a port-parse failure aborts before the main
  // try/finally, so the kill lives HERE too (the orphan-process law)
  py.kill('SIGKILL');
  throw err;
});

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

let browser;
try {
  browser = await chromium.launch({ executablePath: CHROME, args: ['--no-proxy-server'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await page.goto(`http://127.0.0.1:${port}/fixture.html`, { waitUntil: 'networkidle' });

  const read = await page.evaluate(() => {
    const px = (v) => parseFloat(v) || 0;
    const grab = (rootId) => {
      const root = document.getElementById(rootId);
      const q = (cls) => root.querySelector(`.${cls}`) || root; // #f-auto is its own root
      const cs = (cls) => getComputedStyle(q(cls));
      return {
        gap: px(cs('p-gap').columnGap),
        stack: px(cs('p-stack').rowGap),
        text: px(cs('p-text').fontSize),
        line: px(cs('p-line').minHeight),
        leading: px(cs('p-leading').lineHeight) / 100, // 100px probe font
        inset: px(cs('p-inset').paddingInlineStart),
        icon: px(cs('p-icon').width),
        rowmin: px(cs('p-rowmin').minHeight),
        hit: px(cs('p-hit').minHeight),
        textarea: px(cs('p-textarea').minHeight),
        lane: px(cs('p-lane').minHeight),
      };
    };
    return {
      smCoef: grab('f-sm-coef'),
      smNamed: grab('f-sm-named'),
      auto: grab('f-auto'),
      xs2Coef: grab('f-2xs-coef'),
      xs2Tiny: grab('f-2xs-tiny'),
      smTiny: grab('f-sm-tiny'),
      defaultCoef: grab('f-default-coef'),
      rootCoefficient: getComputedStyle(document.documentElement).getPropertyValue('--jx-density-coefficient').trim(),
      microParent: px(getComputedStyle(document.getElementById('f-micro')).fontSize),
      caption: px(getComputedStyle(document.getElementById('micro-caption')).fontSize),
      micro: px(getComputedStyle(document.getElementById('micro-micro')).fontSize),
    };
  });

  const eq = (name, got, want) => check(name, got === want, `got ${got}, want ${want}`);

  // the root-sheet invariant (§11): coefficient 1 at :root
  eq('root --jx-density-coefficient invariant = 1', read.rootCoefficient === '1' ? 1 : 0, 1);

  // the three-lane fixture (§4): ambient-×coef · named · auto — all distinct
  eq('ambient sm × 0.75: --jx-gap = 6px', read.smCoef.gap, RUNGS.sm.gap * 0.75);
  eq('named sm (coef untouched = 1): --jx-gap = 8px', read.smNamed.gap, RUNGS.sm.gap);
  eq('auto inside lg × 0.75 (inherits rung + coef): --jx-gap = 12px', read.auto.gap, RUNGS.lg.gap * 0.75);
  check(
    'the three lanes resolve distinctly',
    new Set([read.smCoef.gap, read.smNamed.gap, read.auto.gap]).size === 3
  );

  // the PLAIN pattern under sm × 0.75 — base × coefficient, once
  const sm = RUNGS.sm, k = 0.75;
  eq('sm×0.75 --jx-text', read.smCoef.text, sm.text * k);
  eq('sm×0.75 --jx-leading', read.smCoef.leading, 1.5 * k);
  eq('sm×0.75 --jx-line', read.smCoef.line, sm.line * k);
  eq('sm×0.75 --jx-stack', read.smCoef.stack, sm.stack * k);
  eq('sm×0.75 --jx-inset', read.smCoef.inset, sm.inset * k);
  eq('sm×0.75 --jx-icon', read.smCoef.icon, sm.icon * k);

  // the DERIVED four — EXACTLY the frozen §4 formulas, sm AND 2xs
  // (the scoped hit-floor case), default for the effective-operand pair
  eq('sm×0.75 --jx-row-min (floor absolute wins)', read.smCoef.rowmin, rowMin(sm, k));
  eq('sm×0.75 --jx-hit (triple max)', read.smCoef.hit, hit(sm, k));
  eq('sm×0.75 --jx-textarea-min (operands effective)', read.smCoef.textarea, textareaMin(sm, k));
  eq('sm×0.75 --jx-color-lane (operands effective)', read.smCoef.lane, colorLane(sm, k));
  const x2 = RUNGS['2xs'];
  eq('2xs×0.75 --jx-row-min', read.xs2Coef.rowmin, rowMin(x2, k));
  eq('2xs×0.75 --jx-hit (scoped 6U floor)', read.xs2Coef.hit, hit(x2, k));
  eq('2xs×0.75 --jx-textarea-min', read.xs2Coef.textarea, textareaMin(x2, k));
  eq('2xs×0.75 --jx-color-lane', read.xs2Coef.lane, colorLane(x2, k));
  const df = RUNGS.default;
  eq('default×0.75 --jx-hit', read.defaultCoef.hit, hit(df, k));
  eq('default×0.75 --jx-textarea-min', read.defaultCoef.textarea, textareaMin(df, k));
  eq('default×0.75 --jx-color-lane', read.defaultCoef.lane, colorLane(df, k));

  // the hard guardrails — coefficient-INDEPENDENT floors
  eq('2xs × 0.1: --jx-hit = 24px (6U, WCAG 2.5.8 AA)', read.xs2Tiny.hit, 24);
  check('2xs × 0.1: --jx-hit ≥ 24px', read.xs2Tiny.hit >= 24, `got ${read.xs2Tiny.hit}`);
  check('sm × 0.1: --jx-hit ≥ 28px (7U)', read.smTiny.hit >= 28, `got ${read.smTiny.hit}`);
  eq('sm × 0.1: --jx-hit = 32px (rung floor U×8)', read.smTiny.hit, 32);

  // task 1.6 receipt: micro-typography stays ABSOLUTE under a size override
  eq('micro parent font-size = 24px (the --jx-size-effective override)', read.microParent, 24);
  eq('--text-caption stays 9px (rem, never em)', read.caption, 9);
  eq('--text-micro stays 10px (rem, never em)', read.micro, 10);
} finally {
  if (browser) await browser.close();
  py.kill('SIGTERM');
  const how = await new Promise((res) => {
    py.on('exit', (code, signal) => res(signal ?? `exit ${code}`));
    setTimeout(() => {
      py.kill('SIGKILL');
      res('SIGKILL fallback');
    }, 3000);
  });
  console.log(`[probe] python3 http.server (pid ${py.pid}) terminated (${how})`);
  rmSync(scratch, { recursive: true, force: true });
}

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
