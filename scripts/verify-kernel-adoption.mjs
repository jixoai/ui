#!/usr/bin/env node
// Kernel-adoption walkthrough (surface-kernel-adoption change, 2026-08-25).
//
// Drives a RUNNING dev server (`npm run site`, :5199) and probes the
// NEW kernel adopters the way verify-surface probes popover: the
// panel must carry .jx-waapi + the real shadow child, and the toggle
// must drive --jx-p 0→1 (entry) / 1→0 (exit) with the panel held
// rendered through the allow-discrete window. Click+sample run inside
// ONE evaluate — no roundtrip gap can eat the entry's first frames —
// and every page waits out hydration (native popovertarget opens
// panels pre-hydration, but the kernel choreography needs Svelte's
// handlers; sampling early reads p=0 forever).
//
//   node scripts/verify-kernel-adoption.mjs [--url http://localhost:5199]
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const argUrl = process.argv.indexOf('--url');
const BASE = argUrl >= 0 ? process.argv[argUrl + 1] : 'http://localhost:5199';

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
  console.error('No Chromium found');
  process.exit(1);
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(` ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const p0 = (frames) => frames.map((f) => f.p);
const ps = (a) => a.slice(0, 6).join(',') + '…' + a.slice(-3).join(',');
const rises = (frames) => {
  const v = p0(frames).filter((x) => x > 0);
  return v.length >= 3 && v[0] <= 0.5 && Math.max(...v) >= 0.9;
};
const falls = (frames) => {
  const v = p0(frames);
  return v.some((x) => x > 0.15) && v.some((x, i) => i > 0 && x < v[0]);
};

const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.addInitScript(() => localStorage.setItem('theme', 'light'));

async function openPage(path) {
  await page.goto(`${BASE}/docs/components/${path}.html`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(900);
}

/** click `trigSel`, then sample `panelSel` computed --jx-p/display
 *  every frame for `dur` ms — all inside one evaluate (zero gap) */
const clickSample = (trigSel, panelSel, dur) =>
  page.evaluate(([t, s, d]) => new Promise((resolve) => {
    document.querySelector(t)?.click();
    const el = document.querySelector(s);
    const out = [];
    const t0 = performance.now();
    const step = () => {
      const cs = getComputedStyle(el);
      out.push({ t: Math.round(performance.now() - t0), p: Number(cs.getPropertyValue('--jx-p')) || 0, disp: cs.display, cls: el.className });
      if (performance.now() - t0 < d) requestAnimationFrame(step);
      else resolve(out);
    };
    requestAnimationFrame(step);
  }), [trigSel, panelSel, dur]);

/** press `key` via TRUSTED CDP input, then sample `panelSel` — the
 *  native popover Escape close only honors real user events, a
 *  synthetic KeyboardEvent does nothing */
const keySample = async (key, panelSel, dur) => {
  await page.keyboard.press(key);
  return page.evaluate(([s, d]) => new Promise((resolve) => {
    const el = document.querySelector(s);
    const out = [];
    const t0 = performance.now();
    const step = () => {
      const cs = getComputedStyle(el);
      out.push({ p: Number(cs.getPropertyValue('--jx-p')) || 0, disp: cs.display });
      if (performance.now() - t0 < d) requestAnimationFrame(step);
      else resolve(out);
    };
    requestAnimationFrame(step);
  }), [panelSel, dur]);
};

// ── 1. dropdown-menu ─────────────────────────────────────────────
await openPage('dropdown-menu');
{
  const panel = '.jx-menu.jx-surface';
  const entry = await clickSample('button[data-jx-menu-trigger]', panel, 700);
  const cls = entry.at(-1)?.cls ?? '';
  check('dropdown-menu: jx-waapi + shadow child while open', cls.includes('jx-waapi') && !!await page.evaluate((s) => !!document.querySelector(`${s} .jx-surface-shadow`), panel), cls);
  check('dropdown-menu: entry drives --jx-p 0→1', rises(entry), ps(p0(entry)));
  check('dropdown-menu: rests ≥0.9', (p0(entry).at(-1) ?? 0) >= 0.9);
  const exit = await keySample('Escape', panel, 700);
  check('dropdown-menu: exit drives --jx-p down', falls(exit), ps(p0(exit)));
  check('dropdown-menu: allow-discrete holds panel through exit', exit.some((f) => f.disp !== 'none' && f.p < 0.5));
}

// ── 2. menubar: glide isolation (close A → open B) ────────────────
await openPage('menubar');
{
  const ids = await page.evaluate(() => [...document.querySelectorAll('[id^="jx-bar-trigger-"]')].map((b) => b.id));
  check('menubar: ≥2 triggers on the page', ids.length >= 2, `${ids.length} found: ${ids.join(',')}`);
  if (ids.length >= 2) {
    const a = (ids[0] ?? '').replace('jx-bar-trigger-', '');
    const b = (ids[1] ?? '').replace('jx-bar-trigger-', '');
    // TRUSTED clicks: the switch path rides the document pointerdown
    // handler (it closes the open panel), which a synthetic el.click()
    // never fires — the panels are popover=manual with no popovertarget
    await page.click(`#jx-bar-trigger-${a}`);
    await page.waitForTimeout(560); // A fully open, then glide
    await page.click(`#jx-bar-trigger-${b}`);
    const glide = await page.evaluate(([ai, bi]) => {
      const ea = document.getElementById(`jx-bar-panel-${ai}`);
      const eb = document.getElementById(`jx-bar-panel-${bi}`);
      const out = { a: [], b: [] };
      const t0 = performance.now();
      const step = () => {
        out.a.push(Number(getComputedStyle(ea).getPropertyValue('--jx-p')) || 0);
        out.b.push(Number(getComputedStyle(eb).getPropertyValue('--jx-p')) || 0);
        if (performance.now() - t0 < 700) requestAnimationFrame(step);
        return Promise.resolve(out);
      };
      return new Promise((resolve) => {
        const tick = () => {
          const v = step();
          if (performance.now() - t0 >= 700) resolve(v);
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, [a, b]);
    check('menubar: glide — A exits (p falls)', glide.a[0] >= 0.9 && glide.a.at(-1) < glide.a[0], ps(glide.a));
    check('menubar: glide — B enters (p rises to rest)', glide.b.at(-1) >= 0.9, ps(glide.b));
    check('menubar: glide — A not ghost-pinned at 1', !glide.a.every((v) => v >= 0.999));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
  }
}

// ── 3. hover-card (Pattern C, no ontoggle) ────────────────────────
await openPage('hover-card');
{
  const state = await page.evaluate(() => {
    const anchor = document.querySelector('[data-jx-hover-anchor]');
    anchor?.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
    return new Promise((resolve) => {
      const el = document.querySelector('.jx-hover-card');
      setTimeout(() => {
        const cs = getComputedStyle(el);
        resolve({ cls: el.className, p: Number(cs.getPropertyValue('--jx-p')) || 0, open: el.matches(':popover-open') });
      }, 1400); // openDelay + the 460ms entry, both covered
    });
  });
  check('hover-card: opens with kernel at rest (p≈1, jx-waapi)', state.open && state.cls.includes('jx-waapi') && state.p >= 0.9, JSON.stringify(state));
  const closed = await page.evaluate(() => {
    const anchor = document.querySelector('[data-jx-hover-anchor]');
    anchor?.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
    return new Promise((resolve) => setTimeout(() => resolve(document.querySelector('.jx-hover-card')?.matches(':popover-open') === false), 350));
  });
  check('hover-card: closes on pointer exit', closed);
}

// ── 4. select (listbox family representative) ────────────────────
await openPage('select');
{
  const panel = '.jx-sel-panel';
  const entry = await clickSample('.jx-sel-trigger', panel, 700);
  const cls = entry.at(-1)?.cls ?? '';
  check('select: jx-waapi + shadow child', cls.includes('jx-waapi') && !!await page.evaluate((s) => !!document.querySelector(`${s} .jx-surface-shadow`), panel), cls);
  check('select: entry drives --jx-p 0→1', rises(entry), ps(p0(entry)));
  const exit = await keySample('Escape', panel, 700);
  check('select: exit drives --jx-p down', falls(exit), ps(p0(exit)));
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n${failed.length} FAILED` : '\nALL GREEN');
process.exit(failed.length ? 1 : 0);
