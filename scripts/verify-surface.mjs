#!/usr/bin/env node
// Floating-surface law walkthrough (Owner tooling, 2026-08-22).
//
// Drives a real browser against a RUNNING dev server (start one first:
// `npm run site`), then samples the law the way a human eye would —
// frame by frame — plus computed-style assertions for every rule the
// architecture pins down:
//
//   1. paint ownership   platform element paints NOTHING (no bg, no
//                        filter, no pseudo); the body owns fill +
//                        border + blur; ::after owns the shadow (fixed
//                        filter, full rect, adaptive offset)
//   2. variants          solid | acrylic in light & dark (fill, blur,
//                        veil color)
//   3. entry phases      opaque composite slides to the SHADOW's spot
//                        (phase 1), then separation + alpha development
//                        (phase 2); opacity stays 1 throughout
//   4. exit mirror       merge + solidify with opacity untouched, then
//                        one unified slide-out + fade
//   5. adaptive vector   a placement flip re-measures the slide AND
//                        shadow direction (no stale cache)
//
// Usage:
//   npm run site &            # server on :5199
//   npm run verify:surface    # or: node scripts/verify-surface.mjs --url http://localhost:5199
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
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(` ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const lastAlpha = (bg) => {
  const m = /\/\s*([\d.]+)\)/.exec(bg ?? '');
  return m ? Number(m[1]) : bg?.includes('oklch') || /^[a-z]+\(\d/.test(bg ?? '') && !bg.includes('/') ? 1 : NaN;
};

const browser = await chromium.launch({ executablePath: findChrome() });

async function openPopoverPage(theme = 'light') {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await page.goto(`${BASE}/components/popover.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1800);
  return page;
}

// ── 1 + 2. ownership & variants (light/dark × solid/acrylic) ──
for (const theme of ['light', 'dark']) {
  for (const variant of ['auto', 'acrylic', 'solid']) {
    const page = await openPopoverPage(theme);
    // set the variant directly on the panel (no coupling to the demo
    // page's playground controls — Codex r18 audit)
    await page.evaluate((v) => {
      document.getElementById('canvas-pop')?.setAttribute('data-variant', v);
    }, variant);
    await page.evaluate(() => (document.querySelector('.jx-shell-body').scrollTop = 0));
    await page.waitForTimeout(250);
    await page.click('button.jx-pop-trigger[popovertarget="canvas-pop"]');
    await page.waitForTimeout(650);
    const r = await page.evaluate(() => {
      const panel = document.getElementById('canvas-pop');
      const body = panel.querySelector('.jx-pop-body');
      const pcs = getComputedStyle(panel);
      const bcs = getComputedStyle(body);
      const shadow = panel.querySelector('.jx-pop-shadow');
      const scs = shadow ? getComputedStyle(shadow) : null;
      return {
        panel: { bg: pcs.backgroundColor, filter: pcs.backdropFilter },
        body: { bg: bcs.backgroundColor, filter: bcs.backdropFilter, border: bcs.borderTopWidth },
        after: scs ? { bg: scs.backgroundColor, filter: scs.backdropFilter, t: scs.translate } : null,
        dark: document.documentElement.classList.contains('dark'),
      };
    });
    await page.close();
    const t = `${theme}/${variant}`;
    check(`${t}: platform paints nothing`, r.panel.bg === 'rgba(0, 0, 0, 0)' && r.panel.filter === 'none', `bg=${r.panel.bg} filter=${r.panel.filter}`);
    check(`${t}: real shadow element present`, !!r.after);
    check(`${t}: body owns blur+border`, r.body.border === '1px' && (variant === 'solid' ? r.body.filter === 'none' : r.body.filter.startsWith('blur')), r.body.filter);
    check(`${t}: shadow fixed filter`, r.after.filter === 'brightness(0.5) blur(8px) contrast(2)');
    const veil = theme === 'light' ? 'rgba(0, 0, 0, 0.32)' : 'rgba(255, 255, 255, 0.32)';
    check(`${t}: veil original color`, r.after.bg === veil, r.after.bg);
    check(`${t}: shadow adaptive offset lands`, /^-?\d+px -?\d+px$/.test(r.after.t), r.after.t);
  }
}

// ── 3. entry phases (frame table) ──
{
  const page = await openPopoverPage('light');
  await page.evaluate(() => (document.querySelector('.jx-shell-body').scrollTop = 0));
  await page.waitForTimeout(250);
  await page.click('button.jx-pop-trigger[popovertarget="canvas-pop"]');
  const frames = await page.evaluate(async () => {
    const panel = document.getElementById('canvas-pop');
    const body = panel.querySelector('.jx-pop-body');
    const out = [];
    for (let i = 0; i < 11; i++) {
      out.push({
        t: getComputedStyle(panel).translate,
        op: Number(getComputedStyle(panel).opacity),
        at: (panel.querySelector('.jx-pop-shadow') ? getComputedStyle(panel.querySelector('.jx-pop-shadow')).translate : 'none'),
        bg: lastAlphaOf(getComputedStyle(body).backgroundColor),
      });
      await new Promise((r) => setTimeout(r, 42));
      function lastAlphaOf(bg) {
        const m = /\/\s*([\d.]+)\)/.exec(bg);
        return m ? Number(m[1]) : 1;
      }
    }
    return out;
  });
  console.log('\n entry frames (translate | opacity | shadowT | fillAlpha):');
  for (const f of frames) console.log(`   ${f.t.padEnd(18)} ${String(f.op).padEnd(4)} ${f.at.padEnd(12)} ${f.bg}`);
  // tolerate one boundary frame at the direction-restart handoff
  const opaquePhase1 = frames.slice(0, 5).filter((f) => f.bg >= 0.99).length >= 4;
  const develops = frames.slice(5).some((f) => f.bg < 0.99 && f.bg > 0.7) && frames.at(-1).bg <= 0.85;
  // r21 first-frame law: the kernel cascade rests at 0, so the FIRST
  // sample must already be sub-1 (no pre-JS flash possible)
  // (slice(7)/0.98: the direction-restart shifts the fade tail a frame)
  const fadesIn = frames[0].op < 0.9 && frames.slice(7).every((f) => f.op >= 0.98);
  const near = (v, target, tol = 0.6) => Math.abs(v - target) <= tol;
  const stopsAtShadowSpot = frames.slice(0, 7).some((f) => {
    const [x, y] = f.t.split(' ').map(parseFloat);
    return (near(x, 6) || near(x, -6)) && (near(y, 6) || near(y, -6));
  });
  check('entry: phase-1 fully opaque', opaquePhase1);
  check('entry: phase-2 alpha develops to 0.72', develops, String(frames.at(-1).bg));
  check('entry: opacity fades in INSIDE the opaque window (r11)', fadesIn, `first=${frames[0].op}`);
  check('entry: slide stops at the shadow spot', stopsAtShadowSpot);
  await page.close();
}

// ── 4. exit mirror (real outside click) ──
{
  const page = await openPopoverPage('light');
  await page.evaluate(() => (document.querySelector('.jx-shell-body').scrollTop = 0));
  await page.waitForTimeout(250);
  await page.click('button.jx-pop-trigger[popovertarget="canvas-pop"]');
  await page.waitForTimeout(700);
  await page.mouse.click(640, 700);
  const frames = await page.evaluate(async () => {
    const panel = document.getElementById('canvas-pop');
    const body = panel.querySelector('.jx-pop-body');
    const out = [];
    for (let i = 0; i < 10; i++) {
      out.push({
        t: getComputedStyle(panel).translate,
        op: Number(getComputedStyle(panel).opacity),
        at: (panel.querySelector('.jx-pop-shadow') ? getComputedStyle(panel.querySelector('.jx-pop-shadow')).translate : 'none'),
        bg: (() => { const m = /\/\s*([\d.]+)\)/.exec(getComputedStyle(body).backgroundColor); return m ? Number(m[1]) : 1; })(),
      });
      await new Promise((r) => setTimeout(r, 42));
    }
    return out;
  });
  console.log('\n exit frames (translate | opacity | shadowT | fillAlpha):');
  for (const f of frames) console.log(`   ${f.t.padEnd(18)} ${String(f.op).padEnd(4)} ${f.at.padEnd(12)} ${f.bg}`);
  const mergedOpaque = frames.slice(6).every((f) => f.bg >= 0.99) && frames.slice(4).every((f) => f.bg >= 0.9);
  const phaseAOpacityUntouched = frames.slice(0, 6).filter((f) => f.op >= 0.99).length >= 5;
  const [lx, ly] = frames.at(-1).t.split(' ').map(parseFloat);
  const slidesOut = Math.hypot(lx, ly) > 8;
  const fades = frames.at(-1).op < 0.55 && frames.at(-1).op < frames[frames.length - 4].op;
  check('exit: merged composite solidifies', mergedOpaque);
  // r15 regression — the double flicker: after the exit animation
  // ends, opacity must NEVER rebound while the panel is still
  // displayed (the forwards fill holds until display:none lands)
  const tail = frames.slice(5).map((f) => f.op);
  const noRebound = tail.every((v, i) => i === 0 || v <= tail[i - 1] + 0.05);
  check('exit: no flicker at the end (no opacity rebound)', noRebound);
  await page.close();

  // ── mid-entry close: continuous, no snap to resting values ──
  {
    const midPage = await openPopoverPage('light');
    await midPage.evaluate(() => (document.querySelector('.jx-shell-body').scrollTop = 0));
    await midPage.waitForTimeout(250);
    await midPage.click('button.jx-pop-trigger[popovertarget="canvas-pop"]');
    await midPage.waitForTimeout(110); // inside phase A
    // sample the LIVE state right BEFORE the close (the continuity
    // baseline — Codex r2: post-close-only sampling proves nothing)
    const pre = await midPage.evaluate(() => {
      const panel = document.getElementById('canvas-pop');
      return { op: Number(getComputedStyle(panel).opacity), f: getComputedStyle(panel).filter };
    });
    await midPage.mouse.click(640, 700);
    // phase A' runs ~230ms before B' starts fading — sample through it
    await midPage.waitForTimeout(300);
    const tail = await midPage.evaluate(async () => {
      const panel = document.getElementById('canvas-pop');
      const seq = [];
      for (let i = 0; i < 5; i++) {
        seq.push({ op: Number(getComputedStyle(panel).opacity), f: getComputedStyle(panel).filter });
        await new Promise((r) => setTimeout(r, 50));
      }
      return seq;
    });
    // proof chain: the pre-close state WAS mid-animation (not resting),
    // the first post-close frame continues from it, the tail fades out
    // mid-flight proof: BOTH channels were animated pre-close, AND the
    // frozen state carries the blur (frozen filter keeps fading in B')
    const wasMidFlight = pre.op < 0.99 && pre.f !== 'none';
    const frozenBlurred = tail[0].f !== 'none';
    // B' fades from the frozen value toward 0 across the tail window
    const fadesOut = tail[0].op < 0.99 && tail.at(-1).op < tail[0].op;
    check('mid-entry close: frozen opacity/filter, continuous fade', wasMidFlight && frozenBlurred && fadesOut, JSON.stringify({ pre, tail: tail.map((f) => f.op) }));
    await midPage.close();
  }
  check('exit: opacity untouched through the merge phase (r11)', phaseAOpacityUntouched);
  check('exit: unified slide-out + fade', slidesOut && fades);
}

// ── 5. adaptive direction across a flip ──
{
  const page = await openPopoverPage('light');
  await page.evaluate(() => (document.querySelector('.jx-shell-body').scrollTop = 0));
  await page.waitForTimeout(250);
  await page.click('button.jx-pop-trigger[popovertarget="canvas-pop"]');
  await page.waitForTimeout(650);
  const up = await page.evaluate(() => {
    const p = document.getElementById('canvas-pop');
    return { inY: p.style.getPropertyValue('--jx-surface-in-y'), oy: p.style.getPropertyValue('--jx-surface-oy') };
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await page.evaluate(() => (document.querySelector('.jx-shell-body').scrollTop = 600));
  await page.waitForTimeout(250);
  await page.click('button.jx-pop-trigger[popovertarget="canvas-pop"]');
  await page.waitForTimeout(650);
  const down = await page.evaluate(() => {
    const p = document.getElementById('canvas-pop');
    return { inY: p.style.getPropertyValue('--jx-surface-in-y'), oy: p.style.getPropertyValue('--jx-surface-oy') };
  });
  await page.close();
  check('direction adapts across a flip (no stale cache)', up.inY !== down.inY && up.oy !== down.oy, `${up.inY}/${up.oy} → ${down.inY}/${down.oy}`);
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
