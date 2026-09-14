#!/usr/bin/env node
// probe-d2.mjs — the D2 matrix runner for spike/coexist.
//
// Serves dist-control, dist-o1, dist-o2 serially (own lifecycle +
// recycle evidence) and reads every D2 row's computed values. Verdict
// protocol (D2 manifest):
//   - O1 runs carry the PASS assertions (manifest literals or
//     CONTROL-BUILD EQUALITY vs dist-control).
//   - O2 runs assert only where a row pre-declares O2-INV (D2-01) or
//     where the row lists O2 with a build-independent expectation
//     (unlayered rules). Other O2 values are RECORDED as
//     "O2-observed" for the misconfig-damage ledger, not failed.
//   - D1-10 (same-frame dark+density flip) and D1-11 (three
//     emulations) also run here (coexist owns the token env).
import { existsSync } from 'node:fs';
import { serveDir } from './serve.mjs';
import { launchEngine } from './browser.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ENGINE = process.env.ENGINE || 'chromium';
const PORT = Number(process.env.PORT || 5293);

const results = [];
const record = (id, verdict, detail) => {
  results.push({ id, verdict });
  console.log(` ${verdict.padEnd(11)} ${id} — ${detail}`);
};

const get = (sel, prop, pseudo) =>
  `getComputedStyle(document.querySelector('${sel}')${pseudo ? `, '${pseudo}'` : ''}).${prop}`;

async function readBase(page) {
  return page.evaluate(() => {
    const cs = (sel, pseudo) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return getComputedStyle(el, pseudo);
    };
    const pad = (sel) => {
      const s = cs(sel);
      return s ? `${s.paddingTop} ${s.paddingLeft}` : null;
    };
    return {
      d201: pad('[data-d2="d2-01"]'),
      d202: pad('[data-d2="d2-02"]'),
      d202s: pad('[data-d2="d2-02s"]'),
      d203on: cs('[data-d2="d2-03-on"]')?.backgroundColor,
      d203off: cs('[data-d2="d2-03-off-red"]')?.backgroundColor,
      d204aDisplay: cs('[data-d2="d2-04a"]')?.display,
      d204bOverflow: cs('[data-d2="d2-04b"]')?.overflow,
      d204bMaxH: cs('[data-d2="d2-04b"]')?.maxHeight,
      d205: pad('[data-d2="d2-05"]'),
      d206: pad('[data-d2="d2-06"]'),
      d207: pad('[data-d2="d2-07"]'),
      d208in: cs('[data-d2="d2-08-in"]')?.backdropFilter,
      d208out: cs('[data-d2="d2-08-out"]')?.backdropFilter,
      d209out: cs('[data-d2="d2-09-out"]')?.color,
      d209scoped: cs('[data-d2="d2-09-scoped"]')?.color,
      d210: cs('[data-d2="d2-10"]')?.backgroundColor,
      d210pad: pad('[data-d2="d2-10"]'),
      d210base: cs('[data-d2="d2-10-base"]')?.backgroundColor,
      d210basepad: pad('[data-d2="d2-10-base"]'),
      d211: cs('[data-d2="d2-11"]')?.animationName,
      d213: cs('[data-d2="d2-13"]')?.backgroundColor,
      d214a: cs('[data-d2="d2-14a"]', '::after')?.content,
      d214aShadowMask: cs('[data-d2="d2-14a-shadow"]')?.maskImage,
      d214w: cs('[data-d2="d2-14w"]', '::after')?.content,
      d2KernelClass: document.querySelector('[data-d2="d2-01"]')?.className,
    };
  });
}

async function readPopover(page) {
  return page.evaluate(async () => {
    const panel = document.getElementById('d2-panel');
    const mega = document.getElementById('d2-mega');
    const out = {};
    try {
      panel.showPopover();
      const s = getComputedStyle(panel);
      out.panelPad = s.getPropertyValue('--jx-panel-pad').trim();
      out.popPad = s.getPropertyValue('--jx-pop-pad').trim();
      out.popPadInline = s.getPropertyValue('--jx-pop-pad-inline').trim();
      out.positionArea = s.positionArea;
      out.backdrop = getComputedStyle(panel, '::backdrop').backgroundColor;
      panel.hidePopover();
    } catch (e) {
      out.panelError = String(e);
    }
    try {
      mega.showPopover();
      out.megaPad = getComputedStyle(mega).getPropertyValue('--jx-panel-pad').trim();
      mega.hidePopover();
    } catch (e) {
      out.megaError = String(e);
    }
    return out;
  });
}

async function withEmulation(page, opts, fn) {
  await page.emulateMedia(opts);
  try {
    return await fn(page);
  } finally {
    await page.emulateMedia({ media: 'screen', forcedColors: 'none', reducedMotion: 'no-preference' });
  }
}

// ── run one build's page ───────────────────────────────────────────
async function measure(browser, dir, port, entry = 'index.html') {
  if (!existsSync(dir)) throw new Error(`missing build dir ${dir} — run npm run build:all first`);
  const served = await serveDir(dir, port);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/${entry}`, { waitUntil: 'load' });
  await page.waitForSelector('[data-d2-root]', { timeout: 10_000 });
  const base = await readBase(page);
  const pop = await readPopover(page);
  const print = await withEmulation(page, { media: 'print' }, (p) =>
    p.evaluate(() => {
      const cs = (sel) => getComputedStyle(document.querySelector(sel));
      return {
        d204aDisplay: cs('[data-d2="d2-04a"]').display,
        d204bOverflow: cs('[data-d2="d2-04b"]').overflow,
        d204bMaxH: cs('[data-d2="d2-04b"]').maxHeight,
        d213: cs('[data-d2="d2-13"]').backgroundColor,
      };
    }),
  );
  const fc = await withEmulation(page, { forcedColors: 'active' }, (p) =>
    p.evaluate(() => {
      const s = getComputedStyle(document.querySelector('[data-d2="d2-12"]'));
      return { appearance: s.appearance, backgroundImage: s.backgroundImage };
    }),
  );
  const rm = await withEmulation(page, { reducedMotion: 'reduce' }, (p) =>
    p.evaluate(() => getComputedStyle(document.querySelector('[data-d2="d2-11"]')).animationName),
  );
  await page.close();
  await served.close();
  return { base, pop, print, fc, rm, errors };
}

const browser = await launchEngine(ENGINE);
let control, o1, o2;
try {
  console.log(`[probe-d2] measuring dist-control (TW-only baseline)…`);
  control = await measure(browser, `${ROOT}dist-control`, PORT, 'control.html');
  console.log(`[probe-d2] measuring dist-o1 (lawful)…`);
  o1 = await measure(browser, `${ROOT}dist-o1`, PORT + 1);
  console.log(`[probe-d2] measuring dist-o2 (misconfig)…`);
  o2 = await measure(browser, `${ROOT}dist-o2`, PORT + 2);
  let o1h = null;
  if (existsSync(`${ROOT}dist-o1h`)) {
    console.log(`[probe-d2] measuring dist-o1h (hoisted-layer-statement DIAGNOSTIC — conflict evidence)…`);
    o1h = await measure(browser, `${ROOT}dist-o1h`, PORT + 4);
  }

  const c = control, a = o1, b = o2;
  console.log('\n── control baseline ──');
  console.log(JSON.stringify({ d207: c.base.d207, d202s: c.base.d202s, d203off: c.base.d203off, d210: c.base.d210, d210base: c.base.d210base, d210pad: c.base.d210pad, d210basepad: c.base.d210basepad, printD213: c.print.d213, fc: c.fc }, null, 1));

  // ── D2-01 core-i ──
  // CONFLICT RECORD (frozen protocol): under the manifest's FROZEN app.css
  // import order, unplugin 0.19.0 appends stylex css AFTER TW's utilities
  // block → stylex layers inscribed LAST → stylex wins (12px), defeating
  // the O1 expectation. The dist-o1h DIAGNOSTIC (layer statement hoisted
  // above the @import — CSS-legal) restores it. Verdict below is the
  // frozen-protocol verdict; the o1h value is the remedy evidence.
  const o1hNote = o1h ? ` | O1-H(hoisted statement): ${o1h.base.d201}${o1h.base.d201 === '42px 42px' ? ' ✓ remedy works' : ' remedy FAILED'}` : '';
  record('D2-01', a.base.d201 === '42px 42px' ? 'PASS' : 'FAIL',
    `O1 padding=${a.base.d201} (expected 42px 42px — consumer utility WINS)${o1hNote}`);
  record('D2-01@O2-INV', b.base.d201 === '12px 12px' ? 'PASS' : 'FAIL',
    `O2 padding=${b.base.d201} (expected inverted 12px 12px — stylex wins over utilities)`);

  // ── D2-02 core-ii ──
  const d202ok = a.base.d202 === '8px 12px' && b.base.d202 === '8px 12px';
  const d202sec = c.base.d202s && a.base.d202s === c.base.d202s;
  record('D2-02', d202ok && d202sec ? 'PASS' : 'FAIL',
    `O1=${a.base.d202} O2=${b.base.d202} (expected 8px 12px under the synthetic env — unlayered alias WINS); SECONDARY real-theme literal: O1=${a.base.d202s} control=${c.base.d202s} (equality=${d202sec})`);

  // ── D2-03 core-iii ──
  const d203checked = a.base.d203on === 'rgb(255, 0, 0)' && b.base.d203on === 'rgb(255, 0, 0)';
  // TW4.3.3 red-500 serializes as oklch(0.637 0.237 25.331) in computed values
  // (= #ef4444 = rgb(239,68,68)); the row's BINDING criterion is control equality.
  const red500 = a.base.d203off === 'rgb(239, 68, 68)' || a.base.d203off === 'oklch(0.637 0.237 25.331)';
  const d203unchecked = a.base.d203off === c.base.d203off && red500;
  const o1hNote3 = o1h ? ` | O1-H: ${o1h.base.d203off}${o1h.base.d203off === c.base.d203off ? ' ✓ remedy works' : ' remedy FAILED'}` : '';
  record('D2-03', d203checked && d203unchecked ? 'PASS' : 'FAIL',
    `checked: O1=${a.base.d203on} O2=${b.base.d203on} (expected rgb(255, 0, 0) — carve-out WINS over stylex static); unchecked+bg-red-500: O1=${a.base.d203off} control=${c.base.d203off} (equality=${a.base.d203off === c.base.d203off}); O2-observed=${b.base.d203off} (misconfig damage: stylex now wins — recorded, not asserted)${o1hNote3}`);

  // ── D2-04 core-iv ──
  const d204screen = a.base.d204aDisplay === 'flex' && a.base.d204bOverflow === 'auto' && a.base.d204bMaxH === '512px';
  const d204print = a.print.d204aDisplay === 'none' && a.print.d204bOverflow === 'visible' && a.print.d204bMaxH === 'none';
  record('D2-04', d204screen && d204print ? 'PASS' : 'FAIL',
    `screen: display=${a.base.d204aDisplay} overflow=${a.base.d204bOverflow} maxH=${a.base.d204bMaxH} (flex/auto expected); print: display=${a.print.d204aDisplay} overflow=${a.print.d204bOverflow} maxH=${a.print.d204bMaxH} (none/visible+none expected); O2-observed print: ${b.print.d204aDisplay}/${b.print.d204bOverflow}/${b.print.d204bMaxH}`);

  // ── D2-05 negative-v ──
  record('D2-05', a.base.d205 === '8px 12px' ? 'PASS' : 'FAIL',
    `O1 padding=${a.base.d205} (expected 8px 12px — consumer utility LOSES, negative asserted)`);

  // ── D2-06 !important ──
  record('D2-06', a.base.d206 === '42px 42px' ? 'PASS' : 'FAIL',
    `O1 padding=${a.base.d206} (expected 42px — !important beats the stylex layer)`);

  // ── D2-07 same-layer order (CONTROL-BUILD EQUALITY) ──
  const ptwNonInitial = c.base.d207 && c.base.d207 !== '0px';
  record('D2-07', ptwNonInitial && a.base.d207 === c.base.d207 ? 'PASS' : 'FAIL',
    `P_tw(control)=${c.base.d207} coexist(O1)=${a.base.d207} (equality=${a.base.d207 === c.base.d207}; P_tw non-initial=${!!ptwNonInitial})`);

  // ── D2-08 inline channel ──
  const d208 = a.base.d208in?.includes('14px') && a.base.d208out?.includes('10px') && b.base.d208in?.includes('14px') && b.base.d208out?.includes('10px');
  record('D2-08', d208 ? 'PASS' : 'FAIL',
    `O1 in=${a.base.d208in} out=${a.base.d208out}; O2 in=${b.base.d208in} out=${b.base.d208out} (expected 14px inside / 10px outside)`);

  // ── D2-09 custom-prop precedence ──
  record('D2-09', a.base.d209out === 'rgb(0, 0, 255)' && a.base.d209scoped === 'rgb(0, 255, 0)' ? 'PASS' : 'FAIL',
    `O1 outside=${a.base.d209out} (pinned #0000ff) scoped=${a.base.d209scoped} (pinned #00ff00) — nearest scope wins BOTH asserted`);

  // ── D2-10 dark+density (CONTROL-BUILD EQUALITY binding) ──
  const d210colorEq = a.base.d210 === c.base.d210;
  const d210padEq = a.base.d210pad === c.base.d210pad;
  const d210changed = a.base.d210 !== a.base.d210base && a.base.d210pad !== a.base.d210basepad;
  record('D2-10', d210colorEq && d210padEq && d210changed ? 'PASS' : 'FAIL',
    `dark color: coexist=${a.base.d210} control=${c.base.d210} (eq=${d210colorEq}); lg padding: coexist=${a.base.d210pad} control=${c.base.d210pad} (eq=${d210padEq}); both CHANGE from light/base (${a.base.d210base} / ${a.base.d210basepad}): ${d210changed}`);

  // ── D2-11 reduced-motion ──
  record('D2-11', a.rm === 'none' && a.base.d211 && a.base.d211 !== 'none' ? 'PASS' : 'FAIL',
    `screen animationName=${a.base.d211}; reduced-motion=${a.rm} (expected pulse→none)`);

  // ── D2-12 forced-colors (parity with control) ──
  const pairOk = a.fc.appearance === 'auto' && a.fc.backgroundImage === 'none';
  const parity = a.fc.appearance === c.fc.appearance && a.fc.backgroundImage === c.fc.backgroundImage;
  record('D2-12', pairOk && parity ? 'PASS' : 'FAIL',
    `coexist pair: appearance=${a.fc.appearance} background-image=${JSON.stringify(a.fc.backgroundImage)}; control pair: appearance=${c.fc.appearance} background-image=${JSON.stringify(c.fc.backgroundImage)} (parity=${parity})`);

  // ── D2-13 print-sim exclusion ──
  const d213screen = a.base.d213 === 'rgb(18, 52, 86)';
  const d213print = a.print.d213 !== 'rgb(18, 52, 86)' && a.print.d213 === c.print.d213;
  record('D2-13', d213screen && d213print ? 'PASS' : 'FAIL',
    `screen=${a.base.d213} (expected rgb(18, 52, 86)); print=${a.print.d213} control-print=${c.print.d213} (NOT the sim color ∧ control-equal=${a.print.d213 === c.print.d213})`);

  // ── D2-14 surface-kernel ──
  const contentNone = a.base.d214a === 'none';
  const maskOk = /none/.test(a.base.d214aShadowMask ?? '');
  const whereLoses = a.base.d214w !== 'none' && a.base.d214w != null;
  record('D2-14', contentNone && maskOk && whereLoses ? 'PASS' : 'FAIL',
    `primary ::after content=${JSON.stringify(a.base.d214a)} (expected none — real 0,2,1 override); shadow mask-image=${a.base.d214aShadowMask} (var fallback none under @supports anchor); :where variant content=${JSON.stringify(a.base.d214w)} (LOSES — law paint survives); O2-observed content=${JSON.stringify(b.base.d214a)}`);

  // ── D2-15 terminal-header ──
  const p = a.pop;
  const pa = (p.positionArea ?? '').split(/\s+/).sort().join(' ');
  const px = (v) => {
    const m = /^([0-9.]+)rem$/.exec(v ?? '');
    return m ? `${Math.round(parseFloat(m[1]) * 16 * 1000) / 1000}px` : v;
  };
  const d215ok =
    px(p.panelPad) === '4px' && px(p.megaPad) === '6px' && px(p.popPad) === '4px' && px(p.popPadInline) === '4px' &&
    pa === 'bottom span-right' && p.backdrop === 'rgba(0, 0, 0, 0)';
  record('D2-15', d215ok ? 'PASS' : 'FAIL',
    `--jx-panel-pad=${p.panelPad}→${px(p.panelPad)} (4px) mega=${p.megaPad}→${px(p.megaPad)} (6px); --jx-pop-pad=${p.popPad}→${px(p.popPad)} --jx-pop-pad-inline=${p.popPadInline}→${px(p.popPadInline)} (4px; custom props serialize as authored rem — normalized at the 16px root); position-area=${JSON.stringify(p.positionArea)} (normalized '${pa}'; enumerated !important beats the inline 'bottom span-left'); ::backdrop=${p.backdrop}${p.panelError ? ` ERROR: ${p.panelError}` : ''}`);

  // ── D1-10: same-frame dark+density flip (O1 build, prod) ────────
  {
    const served = await serveDir(`${ROOT}dist-o1`, PORT + 3);
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${PORT + 3}/index.html`, { waitUntil: 'load' });
    await page.waitForSelector('[data-d2="d2-10"]', { timeout: 10_000 });
    const flip = await page.evaluate(async () => {
      const darkWrap = document.querySelector('.dark');
      const lgWrap = document.querySelector('[data-density="lg"]');
      const k = document.querySelector('[data-d2="d2-10"]');
      const read = () => ({
        color: getComputedStyle(k).backgroundColor,
        pad: `${getComputedStyle(k).paddingTop} ${getComputedStyle(k).paddingLeft}`,
      });
      const before = read();
      // flip BOTH in the same task, read in the SAME frame batch
      darkWrap.classList.remove('dark');
      lgWrap.removeAttribute('data-density');
      const afterRaf = await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(read())),
      );
      // flip back
      darkWrap.classList.add('dark');
      lgWrap.setAttribute('data-density', 'lg');
      const restored = await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(read())),
      );
      return { before, afterRaf, restored };
    });
    const changed = flip.before.color !== flip.afterRaf.color && flip.before.pad !== flip.afterRaf.pad;
    const sameBatch = changed; // both reads landed post-flip in one rAF
    const restores = flip.before.color === flip.restored.color && flip.before.pad === flip.restored.pad;
    record('D1-10(prod)', changed && sameBatch && restores ? 'PASS' : 'FAIL',
      `same-frame batch: color ${flip.before.color}→${flip.afterRaf.color}, padding ${flip.before.pad}→${flip.afterRaf.pad} (changed=${changed}); restore-equal=${restores}`);
    await page.close();
    await served.close();
  }

  // ── D1-11: three emulations on O1 (rm + fc parity + print) ──────
  {
    const rmOk = o1.rm === 'none';
    const fcOk = o1.fc.appearance === 'auto' && o1.fc.backgroundImage === 'none' && o1.fc.appearance === control.fc.appearance && o1.fc.backgroundImage === control.fc.backgroundImage;
    const printOk = o1.print.d204aDisplay === 'none' && o1.print.d204bOverflow === 'visible' && o1.print.d204bMaxH === 'none';
    record('D1-11(prod)', rmOk && fcOk && printOk ? 'PASS' : 'FAIL',
      `reduced-motion: animationName→${o1.rm}; forced-colors: appearance=${o1.fc.appearance} bg-image=${JSON.stringify(o1.fc.backgroundImage)} (control parity ${o1.fc.appearance === control.fc.appearance && o1.fc.backgroundImage === control.fc.backgroundImage}); print: display=${o1.print.d204aDisplay} overflow=${o1.print.d204bOverflow} maxH=${o1.print.d204bMaxH}`);
  }

  const errs = [...control.errors, ...o1.errors, ...o2.errors];
  if (errs.length) console.log(`[probe-d2] page errors observed: ${JSON.stringify(errs)}`);
} catch (err) {
  console.error('[probe-d2] fatal:', err);
  process.exitCode = 1;
} finally {
  await browser.close().catch(() => {});
}

const fails = results.filter((r) => r.verdict === 'FAIL');
console.log(`\n[probe-d2:${ENGINE}] ${results.length - fails.length}/${results.length} green`);
process.exit(fails.length ? 1 : 0);
