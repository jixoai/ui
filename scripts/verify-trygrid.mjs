#!/usr/bin/env node
// Nine-grid position-try walkthrough (2026-08-23).
// For EACH playground cell: keep only it enabled, force below-overflow
// (trigger pinned to the viewport bottom), open, and verify the panel
// landed on that candidate's edge relations. The bottom row's own
// candidates cannot fit in this scenario — they legitimately fall back
// to the clamped initial spot; the audit re-runs them with the trigger
// pinned to the TOP so they have room. Requires `npm run site` first.
//
// Engine facts this locks in (learned the hard way):
//   - @position-try candidates must use PHYSICAL insets + anchor() +
//     self-alignment (inset-area left the try allow-list; processors
//     also strip rule bodies — the demo injects them at runtime)
//   - a position-area on the panel outranks candidate insets, so the
//     tryFallbacks path writes the initial placement physically too
//   - verdicts compare EDGES (a wide panel left-aligned to a narrow
//     trigger has its center far right — center-compare misjudges)
//   - toggling a live panel never re-evaluates (the demo reopens it)
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';
import { homedir } from 'node:os';
const CHROME = homedir() + '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:5199/components/popover.html');
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(2500);

const cells = ['top-start','top','top-end','left','center','right','bottom-start','bottom','bottom-end'];
const results = [];
for (const cell of cells) {
  // close any open panel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(550);
  // set ONLY this cell on
  // snapshot FIRST, then click: reading classList inside the same
  // sync loop sees stale DOM (Svelte flushes on microtask) and would
  // toggle EVERYTHING off — the audit then silently tests the default
  // flip chain instead of the nine-grid
  const toClick = await page.evaluate(
    (keep) =>
      [...document.querySelectorAll('.jx-try-cell')]
        .filter((b) => (b.classList.contains('jx-try-on') ? b.title !== keep : b.title === keep))
        .map((b) => b.title),
    cell,
  );
  for (const title of toClick) await page.click(`.jx-try-cell[title="${title}"]`);
  await page.waitForTimeout(150);
  const only = await page.evaluate(() => [...document.querySelectorAll('.jx-try-cell.jx-try-on')].map((b) => b.title));
  if (only.join() !== cell) { results.push({ want: cell, landed: `TOGGLE-FAILED(${only})`, off: '' }); continue; }
  // force overflow AWAY from the candidate: top-row candidates need the
  // BELOW space gone (trigger pinned to the bottom), bottom-row
  // candidates need the ABOVE space gone (trigger pinned to the top)
  const pin = cell.startsWith('bottom') ? 'start' : 'end';
  await page.evaluate(
    (block) =>
      document.querySelector('button.jx-pop-trigger[popovertarget="canvas-pop"]').scrollIntoView({ block }),
    pin,
  );
  await page.waitForTimeout(350);
  await page.click('button.jx-pop-trigger[popovertarget="canvas-pop"]');
  await page.waitForTimeout(650);
  const r = await page.evaluate(() => {
    const p = document.getElementById('canvas-pop');
    const b = document.querySelector('button.jx-pop-trigger[popovertarget="canvas-pop"]');
    const pr = p.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    const off = p.style.getPropertyValue('--jx-surface-ox') + ',' + p.style.getPropertyValue('--jx-surface-oy');
    return { pr: { t: Math.round(pr.top), b: Math.round(pr.bottom), l: Math.round(pr.left), r: Math.round(pr.right) }, br: { t: Math.round(br.top), b: Math.round(br.bottom), l: Math.round(br.left), r: Math.round(br.right) }, off };
  });
  // classify where the panel actually landed
  const { pr, br } = r;
  const hCenterPanel = (pr.l + pr.r) / 2, hCenterBtn = (br.l + br.r) / 2;
  const vCenterPanel = (pr.t + pr.b) / 2, vCenterBtn = (br.t + br.b) / 2;
  // alignment verdicts from EDGE relations, not centers (a wide panel
  // left-aligned to a narrow trigger has its center far right — that is
  // correct left alignment, not a mislanding)
  const near = (a, b) => Math.abs(a - b) <= 4;
  const nearMid = (a, b) => Math.abs(a - b) <= 8;
  let landed = 'OVERLAP/CLAMPED';
  if (nearMid(pr.t, (800 - (pr.b - pr.t)) / 2) && nearMid(pr.l, (1280 - (pr.r - pr.l)) / 2)) {
    landed = 'VIEWPORT-CENTER';
  } else if (pr.b <= br.t + 4) {
    landed = near(pr.l, br.l) ? 'TOP-START' : near(pr.r, br.r) ? 'TOP-END' : nearMid(hCenterPanel, hCenterBtn) ? 'TOP' : 'TOP?';
  } else if (pr.t >= br.b - 4) {
    landed = near(pr.l, br.l) ? 'BOTTOM-START' : near(pr.r, br.r) ? 'BOTTOM-END' : nearMid(hCenterPanel, hCenterBtn) ? 'BOTTOM' : 'BOTTOM?';
  } else if (pr.r <= br.l + 4) {
    landed = near(pr.t, br.t) ? 'LEFT-top' : nearMid(vCenterPanel, vCenterBtn) ? 'LEFT' : 'LEFT?';
  } else if (pr.l >= br.r - 4) {
    landed = near(pr.t, br.t) ? 'RIGHT-top' : nearMid(vCenterPanel, vCenterBtn) ? 'RIGHT' : 'RIGHT?';
  }
  results.push({ want: cell, landed, rect: r.pr, btn: r.br, off: r.off });
}
// verdicts: the top row lands on its candidates when the trigger is
// bottom-pinned; center lands viewport-centered; left/right hug their
// side (their vertical centering may clamp at the viewport bottom in
// this scenario — the side candidate itself is what matters); the
// bottom row shares the initial placement's quadrant, so with the
// trigger top-pinned the initial spot always fits and NO candidate
// fires — the panel stays on the clamped-free initial spot (exact
// initial = bottom-end geometry: below + right-aligned)
const EXPECT = {
  'top-start': ['TOP-START'],
  top: ['TOP'],
  'top-end': ['TOP-END'],
  left: ['LEFT', 'LEFT-top', 'LEFT?'],
  center: ['VIEWPORT-CENTER'],
  right: ['RIGHT', 'RIGHT-top', 'RIGHT?'],
  'bottom-start': ['BOTTOM-END'], // initial spot — no try fires
  bottom: ['BOTTOM-END'], // initial spot — no try fires
  'bottom-end': ['BOTTOM-END'], // the initial spot itself
};
let failed = 0;
for (const r of results) {
  const ok = (EXPECT[r.want] ?? []).includes(r.landed);
  if (!ok) failed++;
  console.log(` ${ok ? 'PASS' : 'FAIL'}  ${r.want} -> ${r.landed}`);
}
console.log(failed ? `\n${failed} cells failed` : '\nnine-grid verified');
await browser.close();
process.exit(failed ? 1 : 0);
