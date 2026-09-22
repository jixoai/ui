// W7 dock eight-axes probe (the Owner's post-acceptance directive,
// 2026-09-21: 「把这八轴的控制，挂到 playground 这个 bar 上…」).
//
// Asserts, on the FLAGSHIP page (component-canvas.html, the
// #canvas-workbench outer canvas — the driven specimen consumes the
// lanes; the plain prose beside it ignores them, both by design):
//  1. the bar renders EIGHT axis icon-buttons (theme + the seven menu
//     axes) beside grip + chevron, and fits the SMALLER dock — the
//     head band's bounding-box height measured against the pre-change
//     46px baseline (measured 2026-09-21 on this very page, before
//     the bar landed; the bar rides density xs now);
//  2. the ButtonGroup RUN scrolls when narrow — a 480px viewport
//     leaves the run overflowing and scrollLeft travels > 0 (the
//     Owner: 「bar 可能会很长，所以可以考虑使用 ButtonGroup 的可
//     滚动性来提供支持」);
//  3. a menu axis flip (size → large) visibly re-stamps the flagship
//     stage — the driven deploy button's COMPUTED font-size moves
//     (13px → 18px at the large rung) — AND the lane stamps on the
//     canvas root (the §1 carrier declaration verbatim);
//  4. the theme cycle still flips the stage island (data-theme dark +
//     the .dark scope class), the page-owned bindable's own channel;
//  5. `auto` (the default) stamps NOTHING — after flipping back, the
//     root's style carries no axis carrier (the pre-existing
//     --jx-density-coefficient: 1 aside is the density slot's own
//     'default', shipped before this change and untouched by it).
//
// Run: node scripts/probe-w7-dock-eight-axes.mjs
// (owns its dev server on :5231 — spawned, killed by PID group)
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 5231;
const BASE = `http://localhost:${PORT}`;
// the PRE-change baseline (this page, this viewport, 2026-09-21):
// the old head band measured 238×46 — the smaller-bar receipt's
// "before" number, frozen here so the shrink stays gated
const OLD_HEAD_PX = 46;

// ── the dev server (owned; killed by process group at the end) ─────
const server = spawn('node', ['scripts/dev.mjs', '--port', String(PORT)], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true, // own process group — vite (the child) dies with it
});
server.stdout.on('data', () => {});
server.stderr.on('data', () => {});

async function waitReady() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/docs/components/component-canvas.html`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`dev server on :${PORT} never became ready`);
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push([name, ok, detail]);
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` :: ${detail}` : ''}`);
};

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

try {
  await waitReady();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  // the reveal choreography moves the dock while settling — freeze it
  // (the probe's subject is the bar, not the entrance)
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${BASE}/docs/components/component-canvas.html`, { waitUntil: 'networkidle' });
  const canvas = page.locator('#canvas-workbench > [data-jx-canvas]');
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  // the OUTER canvas's own dock (the inner recursion embeds another)
  const dock = page.locator(
    '#canvas-workbench > [data-jx-canvas] > [data-jx-canvas-stage-row] > [data-jx-canvas-dock]',
  );
  const run = dock.locator('[data-jx-scroll-run]');
  const deploy = canvas.locator('[data-jx-canvas-stage] button').first();
  const stage = canvas.locator('[data-jx-canvas-stage]').first();

  // ── 1. the eight axis buttons + the smaller bar ───────────────────
  const headBox = await dock.locator('[data-jx-canvas-dock-head]').evaluate((el) => {
    const b = el.getBoundingClientRect();
    return { w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
  });
  const themeCount = await dock.locator('[data-jx-canvas-theme-toggle]').count();
  const axisCount = await dock.locator('[data-jx-canvas-axis]').count();
  check(
    'the bar renders EIGHT axis icon-buttons (theme + seven menus) beside grip + chevron',
    themeCount === 1 && axisCount === 7 &&
      (await dock.locator('[data-jx-canvas-dock-grip]').count()) === 1 &&
      (await dock.locator('[data-jx-canvas-dock-toggle]').count()) === 1,
    `theme=${themeCount} axes=${axisCount}`,
  );
  check(
    `the bar fits the smaller dock — head ${headBox.h}px < the pre-change ${OLD_HEAD_PX}px`,
    headBox.h > 0 && headBox.h < OLD_HEAD_PX,
    `head ${headBox.w}×${headBox.h}`,
  );

  // ── 3. the size axis flip (run before the narrow viewport so the
  //        menu anchors sit in the wide layout) ──────────────────────
  const rootStyle = () => canvas.evaluate((el) => el.getAttribute('style') ?? '');
  const fsBefore = await deploy.evaluate((el) => getComputedStyle(el).fontSize);
  await dock.locator('[data-jx-canvas-axis="size"]').click();
  await page.waitForTimeout(250);
  const menuOpen = await page
    .locator('#jx-canvas-component-canvas-axis-size')
    .evaluate((el) => el.matches(':popover-open'));
  await page
    .locator('#jx-canvas-component-canvas-axis-size [data-axis-value="large"]')
    .click();
  await page.waitForTimeout(250);
  const styleLarge = await rootStyle();
  const fsAfter = await deploy.evaluate((el) => getComputedStyle(el).fontSize);
  check('the axis menu OPENS (the popover contract)', menuOpen, String(menuOpen));
  check(
    'a menu axis flip (size → large) stamps the lane on the canvas root (the §1 carrier declaration)',
    /--jx-size-effective:\s*var\(--jx-size-large\)/.test(styleLarge),
    styleLarge.slice(0, 90),
  );
  check(
    'the flip visibly re-stamps the flagship stage — the driven specimen computes the large rung',
    fsBefore !== fsAfter && fsAfter === '18px',
    `${fsBefore} → ${fsAfter}`,
  );

  // ── 4. the theme cycle (the page-owned bindable's own channel) ────
  await dock.locator('[data-jx-canvas-theme-toggle]').click();
  await page.waitForTimeout(200);
  const island = await stage.evaluate((el) => [
    el.getAttribute('data-theme'),
    el.classList.contains('dark'),
  ]);
  check('the theme cycle still flips the stage island (data-theme + .dark scope)', island[0] === 'dark' && island[1] === true, JSON.stringify(island));
  await dock.locator('[data-jx-canvas-theme-toggle]').click();
  await page.waitForTimeout(200);

  // ── 5. `auto` stamps nothing ──────────────────────────────────────
  await dock.locator('[data-jx-canvas-axis="size"]').click();
  await page.waitForTimeout(250);
  await page
    .locator('#jx-canvas-component-canvas-axis-size [data-axis-value="auto"]')
    .click();
  await page.waitForTimeout(250);
  const styleAuto = await rootStyle();
  check(
    '`auto` (the default) stamps nothing — no axis carrier on the root after the flip back',
    !/--jx-size-effective|--jx-shape-effective|--jx-radius-effective|--jx-color-effective|--jx-elevation-effective|--jx-motion-effective/.test(styleAuto),
    styleAuto || '(no style attr)',
  );
  const checkState = await page
    .locator('#jx-canvas-component-canvas-axis-size [data-axis-value="auto"]')
    .evaluate((el) => el.hasAttribute('data-axis-current'));
  check('the check state rides the current value (auto re-checked)', checkState, String(checkState));

  // ── 2. the run scrolls when narrow ────────────────────────────────
  await page.setViewportSize({ width: 480, height: 900 });
  await page.waitForTimeout(400);
  const scrollProbe = await run.evaluate((el) => {
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: max });
    return { max, state: el.getAttribute('data-jx-scroll-state') };
  });
  // the run rides scroll-behavior smooth (the tabs contract) — the
  // travel settles asynchronously, the verdict follows the scroll
  await page.waitForTimeout(500);
  const left = await run.evaluate((el) => el.scrollLeft);
  check(
    'the ButtonGroup run scrolls when narrow (scrollLeft > 0, the verdict gated)',
    scrollProbe.max > 0 && left > 0,
    `max=${scrollProbe.max} left=${left} state=${scrollProbe.state}`,
  );
} finally {
  await browser.close();
  try {
    process.kill(-server.pid, 'SIGTERM'); // the process GROUP: vite dies with it
  } catch {
    /* already gone */
  }
  await new Promise((r) => setTimeout(r, 600));
}

const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) {
  console.error(`probe-w7-dock-eight-axes: ${failed.length} FAIL(S)`);
  process.exit(1);
}
