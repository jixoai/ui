#!/usr/bin/env node
// W6-r1 — the vision-walkthrough capture harness (explicit-props, task 6.1).
//
// Drives REAL interactions (hover · click · type · resize · toggle · drag
// a slider) against the dev server and captures pinned-phase screenshots,
// LIGHT and DARK, for the W6 vision-subagent walkthrough rounds. This
// script CAPTURES and records programmatic facts only — it never judges
// aesthetics (the vision subagents judge; the black-image defense below
// is the mandatory pre-check that keeps every judgment grounded).
//
// Usage (dev server must run, e.g. `node scripts/dev.mjs --port 5230`):
//   node scripts/capture-w6-walkthrough.mjs            # round r1
//   ROUND=r2 node scripts/capture-w6-walkthrough.mjs   # next round
//   ONLY=press-button node scripts/capture-w6-walkthrough.mjs  # one page
//
// Output: /tmp/w6-captures/<round>/{*.png, manifest.json} — captures
// NEVER enter the repo (they are round artifacts; the manifest names
// every file with sha256 + nontriviality stats).
//
// ---- the capture laws this harness enforces -----------------------------
// 1. REAL theme switching: dark rides the site's own contract
//    (localStorage "theme" + reload — app.html's boot script applies
//    .dark + colorScheme). NEVER a screenshot inversion.
// 2. Pinned phases: page.emulateMedia({ reducedMotion: 'reduce' }) is
//    the DEFAULT (deterministic final states). Motion-SUBJECT captures
//    (toast entry, dialog/sheet mid-open, the motion-axis flip) run
//    under 'no-preference' at a FIXED documented delay — the delay is
//    recorded in the manifest row's `motion` field.
// 3. The black-image defense (mandatory): every capture is decoded and
//    programmatically verified non-trivial BEFORE entering the manifest
//    (unique-color floor + non-background-ratio floor + dominant-color
//    histogram share). A trivial frame retries ONCE, then is recorded
//    FAILED-trivial — never silently kept.
// 4. deviceScaleFactor 2 (retina or nothing — ui-screenshot law) and
//    document.fonts.ready before every shot.
// 5. Canvas-stage dark variants ride the dock's OWN theme toggle click
//    ([data-jx-canvas-theme-toggle] — a real interaction, the island
//    law: only the stage re-themes).
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const PORT = process.env.PORT ?? '5230';
const BASE = `http://localhost:${PORT}`;
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROUND = process.env.ROUND ?? 'r1';
const ONLY = process.env.ONLY; // optional: run a single scenario id
const OUT = join('/tmp', 'w6-captures', ROUND);
mkdirSync(OUT, { recursive: true });

// ── the black-image defense: PNG decode + pixel stats ─────────────────────
// 8-bit non-interlaced RGB (type 2) and RGBA (type 6) — Chrome's encoder
// output (the same decoder contract capture-baseline.mjs uses, widened).
function decodePng(buf) {
  if (buf.readUInt32BE(12) !== 0x49484452) throw new Error('not a png');
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported png ${bitDepth}/${colorType}`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const idat = [];
  let i = 8;
  while (i < buf.length) {
    const len = buf.readUInt32BE(i);
    const typ = buf.toString('ascii', i + 4, i + 8);
    if (typ === 'IDAT') idat.push(buf.subarray(i + 8, i + 8 + len));
    i += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[pos++];
    const line = Buffer.from(raw.subarray(pos, pos + stride));
    pos += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? line[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      if (filter === 1) line[x] = (line[x] + a) & 255;
      else if (filter === 2) line[x] = (line[x] + b) & 255;
      else if (filter === 3) line[x] = (line[x] + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        line[x] = (line[x] + pr) & 255;
      }
    }
    line.copy(out, y * stride);
    prev = line;
  }
  return { w, h, pixels: out, channels };
}

const DIFF_TOL = 8; // a channel delta ≤8 counts as the background (sub-visual)
const FLOOR_UNIQUE = 24; // distinct sampled colors — black/blank frames sit at 1..3
const FLOOR_NON_BG = 0.004; // ≥0.4% of sampled pixels must differ from the dominant color

function pixelStats({ w, h, pixels, channels }) {
  const counts = new Map();
  const stride = Math.max(1, Math.floor((w * h) / 400_000)); // bounded sample
  let sampled = 0;
  for (let p = 0; p < w * h; p += stride) {
    const o = p * channels;
    const key = (pixels[o] << 16) | (pixels[o + 1] << 8) | pixels[o + 2];
    counts.set(key, (counts.get(key) ?? 0) + 1);
    sampled += 1;
  }
  let dominantKey = 0;
  let dominantCount = 0;
  for (const [k, n] of counts) if (n > dominantCount) { dominantCount = n; dominantKey = k; }
  const dr = (dominantKey >> 16) & 255, dg = (dominantKey >> 8) & 255, db = dominantKey & 255;
  let nonBg = 0;
  for (let p = 0; p < w * h; p += stride) {
    const o = p * channels;
    if (Math.abs(pixels[o] - dr) > DIFF_TOL || Math.abs(pixels[o + 1] - dg) > DIFF_TOL || Math.abs(pixels[o + 2] - db) > DIFF_TOL) nonBg++;
  }
  const dominantShare = dominantCount / sampled;
  const nonBgRatio = nonBg / sampled;
  return {
    sampled,
    uniqueColors: counts.size,
    dominantColor: `#${dominantKey.toString(16).padStart(6, '0')}`,
    dominantShare: Number(dominantShare.toFixed(5)),
    nonBgRatio: Number(nonBgRatio.toFixed(5)),
    trivial: counts.size < FLOOR_UNIQUE || nonBgRatio < FLOOR_NON_BG || dominantShare > 0.996,
  };
}

// ── the session: theme + capture + manifest rows ──────────────────────────
const manifest = {
  round: ROUND,
  generatedAt: new Date().toISOString(),
  harness: {
    base: BASE,
    chrome: CHROME,
    deviceScaleFactor: 2,
    viewport: [1280, 900],
    themeSwitch: "the site's own contract: localStorage['theme'] + reload (never inversion); canvas-stage dark rides the dock theme-toggle click",
    pinnedPhase:
      "reducedMotion 'reduce' by default; motion subjects pinned by pausing document.getAnimations({subtree:true}) at a fixed delay into the motion (WAAPI surfaces), resumed after the mid-phase shot",
    floors: { uniqueColors: FLOOR_UNIQUE, nonBgRatio: FLOOR_NON_BG, diffTol: DIFF_TOL },
  },
  captures: [],
  findings: [],
};

let browser;
const captureCounters = { ok: 0, failedTrivial: 0, failed: 0 };

async function setTheme(page, theme, route) {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
  await page.evaluate((t) => window.localStorage.setItem('theme', t), theme);
  await page.reload({ waitUntil: 'load' });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  const applied = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  const want = theme === 'dark';
  if (applied !== want) throw new Error(`theme contract violated: ${theme} requested, .dark=${applied} on ${route}`);
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350); // reveal/settle
}

function canvasByTitle(page, title, exact = false) {
  return page.locator('section[data-jx-canvas]', {
    has: page.locator('p[data-jx-canvas-title]', { hasText: exact ? new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : title }),
  });
}

// PIN a motion phase deterministically: pause every running animation
// (CSS + WAAPI, subtree) at the moment of the call — the ui-screenshot
// freeze law for JS-driven surfaces; resume with unpauseAnimations.
async function pauseAnimations(page) {
  await page.evaluate(() => document.getAnimations({ subtree: true }).forEach((a) => a.pause()));
}
async function unpauseAnimations(page) {
  await page.evaluate(() => document.getAnimations({ subtree: true }).forEach((a) => a.play()));
}

// the carrier receipt: the §11 effective vars as COMPUTED on a locator —
// programmatic evidence a flip stamped, independent of pixels (an
// axis can stamp and still paint no rest-state delta; the receipt lets
// the vision round separate "carrier broken" from "demo does not consume")
async function carrierEvidence(locator) {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    const pick = (name) => cs.getPropertyValue(name).trim();
    return {
      'size-effective': pick('--jx-size-effective'),
      'shape-effective': pick('--jx-shape-effective'),
      'color-effective': pick('--jx-color-effective'),
      'elevation-effective': pick('--jx-elevation-effective'),
      'motion-effective': pick('--jx-motion-effective'),
    };
  });
}

// the dock control id (canvas-schema ctlId law): jx-canvas-<slug>-ctl-<key>
const ctl = (slug, key) => `[id="jx-canvas-${slug}-ctl-${key}"]`;

async function selectAxis(page, slug, axis, value) {
  const sel = page.locator(ctl(slug, axis));
  const options = await sel.locator('option').evaluateAll((os) => os.map((o) => o.value));
  if (!options.includes(value)) throw new Error(`axis ${axis}: option '${value}' not in [${options.join(', ')}]`);
  await sel.selectOption(value);
  await page.waitForTimeout(120);
  return options;
}

/**
 * The one capture primitive. target: {kind:'element', locator} | {kind:'viewport'}.
 * motion: 'reduced' | { freeMs: <the fixed delay already awaited> }.
 */
async function capture(page, row) {
  const { id, page: pageId, route, phase, theme, interaction, motion = 'reduced', target, settle: doSettle = true, evidence } = row;
  const file = `${id}-${theme}.png`;
  const path = join(OUT, file);
  const attempts = [];
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (doSettle) await settle(page);
    const buf =
      target.kind === 'viewport'
        ? await page.screenshot({ path })
        : await target.locator.screenshot({ path });
    let stats;
    try {
      stats = pixelStats(decodePng(buf));
    } catch (e) {
      attempts.push({ attempt, decodeError: e.message });
      continue;
    }
    attempts.push({ attempt, ...stats });
    if (!stats.trivial) {
      const sha = createHash('sha256').update(buf).digest('hex');
      manifest.captures.push({
        id, page: pageId, route, phase, theme,
        viewport: [page.viewportSize()?.width ?? null, page.viewportSize()?.height ?? null],
        interaction, motion, ...(evidence ? { evidence } : {}),
        file, sha256: sha, bytes: buf.length,
        nontrivial: stats, status: 'ok',
      });
      captureCounters.ok += 1;
      console.log(`  ok       ${file}  uniq=${stats.uniqueColors} nonBg=${(stats.nonBgRatio * 100).toFixed(2)}%`);
      return true;
    }
    console.log(`  TRIVIAL  ${file} attempt ${attempt} (uniq=${stats.uniqueColors} nonBg=${(stats.nonBgRatio * 100).toFixed(3)}%) — ${attempt === 1 ? 'retrying' : 'FAILED'}`);
  }
  rmSync(path, { force: true }); // never silently keep a trivial frame
  const last = attempts[attempts.length - 1];
  manifest.captures.push({
    id, page: pageId, route, phase, theme,
    viewport: [page.viewportSize()?.width ?? null, page.viewportSize()?.height ?? null],
    interaction, motion, file: null, status: 'failed-trivial', attempts,
  });
  captureCounters.failedTrivial += 1;
  return false;
}

function finding(where, what) {
  manifest.findings.push({ where, what, at: new Date().toISOString() });
  console.log(`  FINDING  ${where}: ${what}`);
}

async function gotoRoute(page, route) {
  const resp = await page.goto(`${BASE}${route}`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  if (!resp || resp.status() !== 200) throw new Error(`HTTP ${resp?.status()} on ${route}`);
  const marker = await page.evaluate(() => {
    const main = document.querySelector('main');
    return !!main && (main.textContent?.trim().length ?? 0) > 200;
  });
  if (!marker) throw new Error(`no main-content marker on ${route} (suspected fallback page)`);
}

// ══════════════════════════════════════════════════════════════════════════
// SCENARIOS — every capture follows at least one REAL interaction
// ══════════════════════════════════════════════════════════════════════════

// 1. universal-props — the three LIVE dogfoods + the 40rem media-key resize
async function universalProps(page) {
  const route = '/docs/universal-props.html';
  for (const theme of ['light', 'dark']) {
    await gotoRoute(page, route);
    await setTheme(page, theme, route);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('#dogfood').scrollIntoViewIfNeeded();
    const dogfood = page.locator('#dogfood');
    // interaction: hover the concentric-auto button (press physics: shadow grows)
    await dogfood.getByRole('button', { name: 'auto radius' }).hover();
    await capture(page, {
      id: 'up-dogfood-hover', page: 'universal-props', route, phase: 'settled', theme,
      interaction: 'hover PressButton(radius=auto) inside the radius-20 concentric-anchor card (the §3 broadcast)',
      target: { kind: 'element', locator: dogfood },
    });
    // the §14 squircle dogfood card (hover its squircle child first)
    await dogfood.getByRole('button', { name: 'squircle child' }).hover();
    await capture(page, {
      id: 'up-squircle-card', page: 'universal-props', route, phase: 'settled', theme,
      interaction: 'hover PressButton(shape=squircle, radius=10) — the §14 ×2 factor card',
      target: {
        kind: 'element',
        locator: page.locator('#dogfood [data-jx-card]', { hasText: 'shape squircle' }),
      },
    });
    // the site-adoption section (docs infra on the axes)
    const site = page.locator('#site-adoption');
    await site.scrollIntoViewIfNeeded();
    await site.locator('density-demo, [data-density]').first().hover();
    await capture(page, {
      id: 'up-site-adoption', page: 'universal-props', route, phase: 'settled', theme,
      interaction: 'hover the density-demo dogfood scope (token-table size=18 · density-demo density=large · props-table size=medium)',
      target: { kind: 'element', locator: site },
    });
  }
  // the media-key query card across the 40rem boundary — REAL viewport resizes
  // (light first at 1280 [sm:large matches], then 560 [base auto], then dark both)
  for (const [theme, width, phase] of [
    ['light', 1280, 'sm-matched (≥40rem): size steps to the large rung'],
    ['light', 560, 'base (below 40rem): the auto/base lane applies'],
    ['dark', 1280, 'sm-matched (≥40rem): size steps to the large rung'],
    ['dark', 560, 'base (below 40rem): the auto/base lane applies'],
  ]) {
    await gotoRoute(page, route);
    await setTheme(page, theme, route);
    await page.setViewportSize({ width, height: 900 });
    const panel = page.locator('#dogfood [data-jx-card]', { hasText: 'below 40rem the base' });
    await panel.scrollIntoViewIfNeeded();
    await panel.hover(); // a real pointer interaction on the resized card
    await capture(page, {
      id: `up-media-query-${width}`, page: 'universal-props', route, phase, theme,
      interaction: `viewport RESIZED to ${width}×900 (across the 40rem boundary) then hover the size query({sm:'large'}) card`,
      target: { kind: 'element', locator: panel },
    });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
}

// 2. press-button — the schema-driven canvas: flip every axis one at a time
async function pressButton(page) {
  const route = '/docs/components/press-button.html';
  const slug = 'press-button';
  await gotoRoute(page, route);
  await setTheme(page, 'light', route);
  const canvas = canvasByTitle(page, 'press-button').first();
  await canvas.scrollIntoViewIfNeeded();
  const stage = canvas.locator('[data-jx-canvas-stage]');
  // the playground-driven instance: the LAST button in the demo content
  // (its own label renders the live variant name — a label-wrapped sibling
  // would make strict getByRole ambiguous)
  const driven = canvas.locator('[data-doc-demo-content] button').last();
  const meta = (flip) => `dock axis select flipped (${flip}), stage captured after the flip`;
  // every flip row carries the COMPUTED carrier receipt off the driven root
  const ev = () => carrierEvidence(driven);

  // baseline: hover the driven fill button (a real hover, the press law)
  await driven.hover();
  await capture(page, {
    id: 'pb-baseline-hover', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: 'hover the playground-driven PressButton (variant=fill, all axes auto)', motion: 'reduced',
    target: { kind: 'element', locator: canvas },
  });

  // size: named → number (both lanes)
  await selectAxis(page, slug, 'size', 'large');
  await capture(page, {
    id: 'pb-size-large', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: meta('size=large'), evidence: await ev(), target: { kind: 'element', locator: canvas },
  });
  await selectAxis(page, slug, 'size', 'number');
  const sizeNum = page.locator(ctl(slug, 'size:number'));
  await sizeNum.fill('14');
  await page.keyboard.press('Tab'); // commit (NumberInput fires change on blur)
  await capture(page, {
    id: 'pb-size-14', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: meta('size=number → 14px'), evidence: await ev(), target: { kind: 'element', locator: canvas },
  });
  await selectAxis(page, slug, 'size', 'auto');

  // shape: squircle (the §14 flagship) — LIGHT + DARK (dock toggle = real click)
  await selectAxis(page, slug, 'shape', 'squircle');
  await driven.hover();
  await capture(page, {
    id: 'pb-shape-squircle', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: `${meta('shape=squircle')} + hover the driven button`, evidence: await ev(), target: { kind: 'element', locator: canvas },
  });
  await canvas.locator('[data-jx-canvas-theme-toggle]').click();
  await page.waitForTimeout(250);
  await capture(page, {
    id: 'pb-shape-squircle', page: 'press-button', route, phase: 'settled', theme: 'dark-stage',
    interaction: 'the dock theme-toggle CLICKED (the island law: only the stage re-themes) over shape=squircle',
    target: { kind: 'element', locator: canvas },
  });
  await canvas.locator('[data-jx-canvas-theme-toggle]').click(); // back to light
  await page.waitForTimeout(250);
  await selectAxis(page, slug, 'shape', 'auto');

  // radius
  await selectAxis(page, slug, 'radius', 'large');
  await capture(page, {
    id: 'pb-radius-large', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: meta('radius=large'), evidence: await ev(), target: { kind: 'element', locator: canvas },
  });
  await selectAxis(page, slug, 'radius', 'auto');

  // density: small vs large — LIGHT + DARK (most-telling pair)
  await selectAxis(page, slug, 'density', 'small');
  await capture(page, {
    id: 'pb-density-small', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: meta('density=small'), evidence: await ev(), target: { kind: 'element', locator: canvas },
  });
  await selectAxis(page, slug, 'density', 'large');
  await capture(page, {
    id: 'pb-density-large', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: meta('density=large'), evidence: await ev(), target: { kind: 'element', locator: canvas },
  });
  await canvas.locator('[data-jx-canvas-theme-toggle]').click();
  await page.waitForTimeout(250);
  await capture(page, {
    id: 'pb-density-large', page: 'press-button', route, phase: 'settled', theme: 'dark-stage',
    interaction: 'the dock theme-toggle CLICKED over density=large',
    target: { kind: 'element', locator: canvas },
  });
  await canvas.locator('[data-jx-canvas-theme-toggle]').click();
  await page.waitForTimeout(250);
  await selectAxis(page, slug, 'density', 'auto');

  // color
  await selectAxis(page, slug, 'color', 'error');
  await capture(page, {
    id: 'pb-color-error', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: meta('color=error'), evidence: await ev(), target: { kind: 'element', locator: canvas },
  });
  await selectAxis(page, slug, 'color', 'auto');

  // elevation level2 — LIGHT + DARK (the dock enum spells it 'level2')
  await selectAxis(page, slug, 'elevation', 'level2');
  await capture(page, {
    id: 'pb-elevation-level2', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: meta('elevation=level2'), evidence: await ev(), target: { kind: 'element', locator: canvas },
  });
  await canvas.locator('[data-jx-canvas-theme-toggle]').click();
  await page.waitForTimeout(250);
  await capture(page, {
    id: 'pb-elevation-level2', page: 'press-button', route, phase: 'settled', theme: 'dark-stage',
    interaction: 'the dock theme-toggle CLICKED over elevation=level2 (the §7 pairing on the axis)',
    target: { kind: 'element', locator: canvas },
  });
  await canvas.locator('[data-jx-canvas-theme-toggle]').click();
  await page.waitForTimeout(250);
  await selectAxis(page, slug, 'elevation', 'auto');

  // motion: expressive — MOTION SUBJECT (no-preference, click+settle)
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await selectAxis(page, slug, 'motion', 'expressive');
  await driven.click();
  await page.waitForTimeout(600); // the press transition settles
  await capture(page, {
    id: 'pb-motion-expressive', page: 'press-button', route, phase: 'settled post-click (600ms)', theme: 'light',
    interaction: 'motion=expressive then CLICK the driven button — captured at the settled post-animation moment',
    motion: { freeMs: 600, note: 'reduced-motion lifted (motion is the subject); fixed 600ms post-click delay' },
    settle: false,
    evidence: await ev(),
    target: { kind: 'element', locator: canvas },
  });
  await selectAxis(page, slug, 'motion', 'auto');
  await page.emulateMedia({ reducedMotion: 'reduce' });

  // the dock-head density select (the stage scope) — real select interaction
  const densitySelect = canvas.locator('[data-jx-canvas-density-select] select, select[data-jx-canvas-density-select]');
  if (await densitySelect.count()) {
    await densitySelect.first().selectOption('xs');
    await page.waitForTimeout(200);
    await capture(page, {
      id: 'pb-stage-density-xs', page: 'press-button', route, phase: 'settled', theme: 'light',
      interaction: 'the dock-head density select flipped to xs — the STAGE scope re-densifies',
      target: { kind: 'element', locator: canvas },
    });
    await densitySelect.first().selectOption('default');
  } else {
    finding(route, 'dock-head density select not found by [data-jx-canvas-density-select]');
  }

  // reset (real click) → everything back to schema defaults
  await canvas.locator('[data-jx-canvas-reset]').click();
  await page.waitForTimeout(250);
  await capture(page, {
    id: 'pb-reset', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: 'the dock reset button CLICKED — stage returns to schema defaults',
    target: { kind: 'element', locator: canvas },
  });

  // the page's static universal-props specimens (explicit lanes, hover one)
  const uni = canvasByTitle(page, 'PressButton · universal props');
  await uni.scrollIntoViewIfNeeded();
  await uni.getByRole('button', { name: 'shape squircle · radius 10' }).hover();
  await capture(page, {
    id: 'pb-universal-demo', page: 'press-button', route, phase: 'settled', theme: 'light',
    interaction: 'hover the squircle specimen in the universal-props demo canvas (size 14/small · large/medium · squircle · concentric)',
    target: { kind: 'element', locator: uni },
  });
  void stage; void meta;
}

// 3. dialog — click-open, mid-open (motion PAUSED mid-flight), settled, Escape
async function dialog(page) {
  const route = '/docs/components/dialog.html';
  for (const theme of ['light', 'dark']) {
    await gotoRoute(page, route);
    await setTheme(page, theme, route);
    await settle(page);
    const trigger = page.getByRole('button', { name: 'Open dialog' }).first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.hover();
    await page.emulateMedia({ reducedMotion: 'no-preference' }); // motion subject
    await trigger.click();
    await page.waitForTimeout(70); // 70ms into the ~120ms surface motion
    await pauseAnimations(page); // PIN the phase (screenshot latency then cannot drift it)
    await capture(page, {
      id: 'dialog-mid-open', page: 'dialog', route, phase: 'mid-open (animations paused 70ms into the ~120ms surface motion)', theme,
      interaction: 'CLICK "Open dialog" — every animation paused in-page 70ms into the open motion',
      motion: { freeMs: 70, pinnedBy: "document.getAnimations({subtree:true}).forEach(a=>a.pause()) — the freeze law for WAAPI surfaces" },
      settle: false,
      target: { kind: 'viewport' },
    });
    await unpauseAnimations(page);
    await page.waitForTimeout(500); // the motion completes
    await capture(page, {
      id: 'dialog-settled', page: 'dialog', route, phase: 'settled', theme,
      interaction: 'the same open dialog after the motion resumes and settles',
      motion: { freeMs: 570, note: 'animations resumed; fixed 500ms settle delay' },
      settle: false,
      target: { kind: 'viewport' },
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const stillOpen = await page.locator('dialog[open]').count();
    if (stillOpen > 0) finding(route, `Escape did not close the dialog (${stillOpen} dialog[open] remain) — theme ${theme}`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  }
}

// 4. sheet — click-open, mid-slide (paused), settled, Escape-close
async function sheet(page) {
  const route = '/docs/components/sheet.html';
  for (const theme of ['light', 'dark']) {
    await gotoRoute(page, route);
    await setTheme(page, theme, route);
    await settle(page);
    const trigger = page.getByRole('button', { name: /open sheet|filters/i }).first();
    await trigger.scrollIntoViewIfNeeded();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const label = (await trigger.textContent()) ?? 'open sheet';
    await trigger.click();
    await page.waitForTimeout(110); // 110ms into the declared 200ms slide
    await pauseAnimations(page);
    await capture(page, {
      id: 'sheet-mid-open', page: 'sheet', route, phase: 'mid-open (animations paused 110ms into the 200ms slide)', theme,
      interaction: `CLICK "${label.trim()}" — every animation paused in-page 110ms into the slide`,
      motion: { freeMs: 110, pinnedBy: 'document.getAnimations pause — the freeze law for WAAPI surfaces' },
      settle: false,
      target: { kind: 'viewport' },
    });
    await unpauseAnimations(page);
    await page.waitForTimeout(500);
    await capture(page, {
      id: 'sheet-settled', page: 'sheet', route, phase: 'settled', theme,
      interaction: 'the same open sheet after the motion resumes and settles',
      motion: { freeMs: 610, note: 'animations resumed; fixed 500ms settle delay' },
      settle: false,
      target: { kind: 'viewport' },
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const stillOpen = await page.locator('dialog[open]').count();
    if (stillOpen > 0) finding(route, `Escape did not close the sheet (${stillOpen} dialog[open] remain) — theme ${theme}`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
  }
}

// 5. input — the native flagship: type, focus, size=14 vs default, density small
async function inputDemo(page) {
  const route = '/docs/components/input.html';
  for (const theme of ['light', 'dark']) {
    await gotoRoute(page, route);
    await setTheme(page, theme, route);
    // the universal demo: px-number (size 14 · density small) vs named (large · radius medium)
    const uni = canvasByTitle(page, 'input · universal props', true);
    await uni.scrollIntoViewIfNeeded();
    const pxInput = uni.locator('input[name="univ-input-px"]');
    await pxInput.click();
    await pxInput.type('typed@jixoai.ai');
    await capture(page, {
      id: 'input-universal-typed', page: 'input', route, phase: 'focused+typed', theme,
      interaction: 'CLICK + TYPE "typed@jixoai.ai" into the size=14 density=small input; the size=large radius=medium sibling beside it',
      target: { kind: 'element', locator: uni },
    });
    // the default-size flagship canvas for the size contrast (exact title "input")
    const main = canvasByTitle(page, 'input', true);
    await main.scrollIntoViewIfNeeded();
    const endpoint = main.locator('input').first();
    await endpoint.click();
    await endpoint.type('you@jixoai.ai');
    await capture(page, {
      id: 'input-default-size-typed', page: 'input', route, phase: 'focused+typed', theme,
      interaction: 'CLICK + TYPE "you@jixoai.ai" into the DEFAULT-size endpoint input (the size=14 contrast pair)',
      target: { kind: 'element', locator: main },
    });
    await page.keyboard.press('Escape');
  }
}

// 6. select — the PORTAL receipt: open the listbox, capture the promoted panel
async function selectDemo(page) {
  const route = '/docs/components/select.html';
  for (const theme of ['light', 'dark']) {
    await gotoRoute(page, route);
    await setTheme(page, theme, route);
    const uni = canvasByTitle(page, 'Select · universal props');
    await uni.scrollIntoViewIfNeeded();
    const trigger = uni.locator('button.jx-sel-trigger').first(); // the size=18 density=small runtime demo
    await trigger.click();
    await page.waitForTimeout(250); // the panel's surface motion settles
    const panel = page.locator('.jx-sel-panel:popover-open, .jx-sel-panel.popover-open');
    const panelCount = await panel.count();
    if (panelCount === 0) {
      finding(route, `select listbox did not promote (no :popover-open panel after trigger click) — theme ${theme}`);
    }
    await capture(page, {
      id: 'select-portal-panel', page: 'select', route, phase: 'open (panel promoted to the top layer)', theme,
      interaction: 'CLICK the runtime Select trigger (size=18 · density=small) — the PORTALED listbox with self-carried lanes',
      target: panelCount ? { kind: 'element', locator: panel.first() } : { kind: 'element', locator: uni },
    });
    await capture(page, {
      id: 'select-trigger-open', page: 'select', route, phase: 'open', theme,
      interaction: 'the same open state, trigger region (aria-expanded=true)',
      target: { kind: 'element', locator: uni },
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
}

// 7. density-2xs — the five-rung ladder + the 2xs-vs-default inspector scene
async function density2xs(page) {
  const route = '/docs/density-2xs.html';
  for (const theme of ['light', 'dark']) {
    await gotoRoute(page, route);
    await setTheme(page, theme, route);
    const scene = page.locator('#scene');
    await scene.scrollIntoViewIfNeeded();
    // real interaction: open the scene's own Select (blend) and move focus over the 2xs panel
    const blend = scene.getByRole('button', { name: /blend/i }).first();
    if (await blend.count()) {
      await blend.hover();
    } else {
      await scene.locator('[data-density]').first().hover();
    }
    await capture(page, {
      id: 'd2xs-scene', page: 'density-2xs', route, phase: 'settled', theme,
      interaction: 'hover the blend Select trigger inside the inspector scene (the SAME scene at 2xs and default side by side)',
      target: { kind: 'element', locator: scene },
    });
    const ladder = page.locator('#scale');
    const ladderTarget = (await ladder.count()) ? ladder : page.locator('main');
    await ladderTarget.scrollIntoViewIfNeeded();
    await ladderTarget.locator('[data-density]').first().hover();
    await capture(page, {
      id: 'd2xs-ladder', page: 'density-2xs', route, phase: 'settled', theme,
      interaction: 'hover the 2xs rung scope in the five-rung ladder table (computed live from the css vars)',
      target: { kind: 'element', locator: ladderTarget },
    });
  }
}

// 8. tokens — the density ladder + the full sheet + the shadow ladder + the
//    hue runtime SLIDER drag; records the missing surface/elevation section
async function tokens(page) {
  const route = '/tokens.html';
  for (const theme of ['light', 'dark']) {
    await gotoRoute(page, route);
    await setTheme(page, theme, route);
    // real interaction: drag the hue slider (a manual hue write — every swatch follows)
    const slider = page.locator('#hue-slider');
    const hueCanvas = canvasByTitle(page, 'hue runtime');
    if (await slider.count()) {
      await slider.scrollIntoViewIfNeeded();
      await hueCanvas.scrollIntoViewIfNeeded();
      await slider.fill('200');
      await page.waitForTimeout(300);
      await capture(page, {
        id: 'tokens-hue-dragged', page: 'tokens', route, phase: 'hue=200 manual', theme,
        interaction: 'DRAG/SET the hue runtime slider to 200° (pauses the wall-clock cycle; every swatch re-hues live)',
        target: { kind: 'element', locator: hueCanvas },
      });
    } else {
      finding(route, 'hue slider #hue-slider not found');
    }
    // the density kernel: the DensityDemo five-rung ladder side by side
    const kernel = page.locator('#density-kernel');
    if (await kernel.count()) {
      await kernel.scrollIntoViewIfNeeded();
      await kernel.locator('[data-density]').first().hover();
      await capture(page, {
        id: 'tokens-density-ladder', page: 'tokens', route, phase: 'settled', theme,
        interaction: 'hover a rung scope in the density-kernel DensityDemo (2xs/xs/sm/default/lg side by side)',
        target: { kind: 'element', locator: kernel },
      });
    } else {
      finding(route, '#density-kernel section not found');
    }
    // the full sheet (the token table with live swatches — carries the surface rows)
    const sheetSection = page.locator('#palette');
    if (await sheetSection.count()) {
      await sheetSection.scrollIntoViewIfNeeded();
      await sheetSection.locator('.swatch-chip').first().hover();
      await capture(page, {
        id: 'tokens-full-sheet', page: 'tokens', route, phase: 'settled', theme,
        interaction: 'hover the first swatch in the full token sheet (the current theme’s live var table)',
        target: { kind: 'element', locator: sheetSection },
      });
    } else {
      finding(route, '#palette (the full sheet section) not found');
    }
    // the hard-offset shadow ladder (the elevation receipt the page DOES carry)
    const shadows = page.locator('[data-reveal]').filter({ hasText: 'Hard offset shadows' }).first();
    if (await shadows.count()) {
      await shadows.scrollIntoViewIfNeeded();
      await shadows.locator('div >> nth=5').hover().catch(() => {});
      await capture(page, {
        id: 'tokens-shadow-ladder', page: 'tokens', route, phase: 'settled', theme,
        interaction: 'hover a rung in the hard-offset shadow ladder (2xs/xs/sm/md)',
        target: { kind: 'element', locator: shadows },
      });
    }
  }
  finding(
    route,
    'no dedicated surface-ladder/elevation-level-table section exists on /tokens.html (W1 §1/§2 tokens ship in the sheet; the §7 pairing is visible only through the press-button elevation axis + this shadow ladder) — recorded for the vision round and the 6.3 dossier',
  );
}

// 9. component-canvas — the flagship axis demo: every dock axis driven
async function componentCanvas(page) {
  const route = '/docs/components/component-canvas.html';
  const slug = 'component-canvas-universal-props';
  await gotoRoute(page, route);
  await setTheme(page, 'light', route);
  const canvas = canvasByTitle(page, 'component-canvas · universal props');
  await canvas.scrollIntoViewIfNeeded();
  const flips = [
    ['size', 'large'],
    ['shape', 'squircle'],
    ['radius', 'large'],
    ['color', 'secondary'],
    ['elevation', 'level2'],
    ['motion', 'expressive'],
  ];
  for (const [axis, value] of flips) {
    await selectAxis(page, slug, axis, value);
    await capture(page, {
      id: `cc-${axis}-${value.replace(/[^a-z0-9]+/gi, '')}`, page: 'component-canvas', route,
      phase: 'settled', theme: 'light',
      interaction: `dock axis select flipped (${axis}=${value}) on the workbench root — the stage re-stamps live`,
      evidence: await carrierEvidence(canvas),
      target: { kind: 'element', locator: canvas },
    });
    await selectAxis(page, slug, axis, 'auto');
  }
  // all six axes set together, dark stage via the dock toggle (real click)
  for (const [axis, value] of flips) await selectAxis(page, slug, axis, value);
  await canvas.locator('[data-jx-canvas-theme-toggle]').click();
  await page.waitForTimeout(250);
  await capture(page, {
    id: 'cc-all-axes', page: 'component-canvas', route, phase: 'settled (all six axes)', theme: 'dark-stage',
    interaction: 'all SIX axis controls set (size large · shape squircle · radius large · color secondary · elevation level2 · motion expressive) + the dock theme-toggle CLICKED',
    evidence: await carrierEvidence(canvas),
    target: { kind: 'element', locator: canvas },
  });
  await canvas.locator('[data-jx-canvas-theme-toggle]').click();
  finding(
    route,
    'the flagship axis demo drives SIX axes (CANVAS_AXES: size/shape/radius/color/elevation/motion); theme+density are the stage-preview bindables by the no-rename law — the press-button page is the seven-axis dogfood',
  );
  finding(
    route,
    "color=secondary / elevation=level2 / motion=expressive stamp the carriers (probed: --jx-color-effective → oklch(0.968 0.211 109.7692), --jx-elevation-effective → 3, --jx-motion-effective → 1.5) but this demo's rest state paints NO pixel delta — the three frames come out byte-identical, kept deliberately as honest evidence; the vision round should weigh whether the flagship demo needs a consuming specimen (a fill seat for color, an elevating surface for elevation)",
  );
}

// 10. toast — trigger one, capture mid-entry (PAUSED), settled, hover-freeze,
//     then dismiss
async function toast(page) {
  const route = '/docs/components/toast.html';
  for (const theme of ['light', 'dark']) {
    await gotoRoute(page, route);
    await setTheme(page, theme, route);
    await settle(page);
    const canvas = canvasByTitle(page, 'toast', true);
    await canvas.scrollIntoViewIfNeeded();
    const trigger = canvas.getByRole('button', { name: 'polite toast' });
    await page.emulateMedia({ reducedMotion: 'no-preference' }); // motion subject
    await trigger.click();
    await page.waitForTimeout(150); // mid-entry
    await pauseAnimations(page); // PIN the entry phase
    const viewport = page.locator('[data-jx-toasts]');
    await capture(page, {
      id: 'toast-mid-entry', page: 'toast', route, phase: 'mid-entry (animations paused 150ms after push)', theme,
      interaction: 'CLICK "polite toast" — every animation paused in-page 150ms into the entry',
      motion: { freeMs: 150, pinnedBy: 'document.getAnimations pause — the freeze law for WAAPI surfaces' },
      settle: false,
      target: { kind: 'element', locator: viewport },
    });
    await unpauseAnimations(page);
    await page.waitForTimeout(600); // settled
    const card = page.locator('[data-jx-toast]').first();
    await card.hover(); // hover freezes the countdown — a real interaction
    await page.waitForTimeout(250);
    await capture(page, {
      id: 'toast-settled-hover', page: 'toast', route, phase: 'settled + hover freeze', theme,
      interaction: 'the toast settled, then HOVERED (the countdown freezes)',
      motion: { freeMs: 1000, note: 'animations resumed; 600ms settle + 250ms post-hover delays' },
      settle: false,
      target: { kind: 'element', locator: viewport },
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const dismiss = page.locator('[data-jx-toasts] button[aria-label="dismiss notification"]').first();
    if (await dismiss.count()) {
      await dismiss.click();
      await page.waitForTimeout(400);
    } else {
      await page.waitForTimeout(5500); // wait out the default duration
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
const SCENARIOS = [
  ['universal-props', universalProps],
  ['press-button', pressButton],
  ['dialog', dialog],
  ['sheet', sheet],
  ['input', inputDemo],
  ['select', selectDemo],
  ['density-2xs', density2xs],
  ['tokens', tokens],
  ['component-canvas', componentCanvas],
  ['toast', toast],
];

browser = await chromium.launch({ headless: true, executablePath: CHROME });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
page.setDefaultTimeout(20000);

const failedPages = [];
for (const [id, fn] of SCENARIOS) {
  if (ONLY && id !== ONLY) continue;
  console.log(`▶ ${id}`);
  try {
    await fn(page);
  } catch (e) {
    failedPages.push(id);
    finding(id, `scenario aborted: ${e.message.split('\n')[0]}`);
    console.error(`  SCENARIO FAILED: ${e.message.split('\n')[0]}`);
  }
}

await context.close();
await browser.close();

// ── the manifest summary ──────────────────────────────────────────────────
const perPage = {};
for (const row of manifest.captures) {
  const key = row.page;
  perPage[key] ??= { planned: 0, ok: 0, failedTrivial: 0 };
  perPage[key].planned += 1;
  if (row.status === 'ok') perPage[key].ok += 1;
  if (row.status === 'failed-trivial') perPage[key].failedTrivial += 1;
}
manifest.summary = {
  scenariosPlanned: SCENARIOS.length,
  scenariosRun: SCENARIOS.filter(([id]) => !ONLY || id === ONLY).length,
  scenariosFailed: failedPages,
  capturesAttempted: manifest.captures.length,
  captured: captureCounters.ok,
  failedTrivial: captureCounters.failedTrivial,
  findings: manifest.findings.length,
  perPage,
};
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(
  `\nround ${ROUND}: ${captureCounters.ok} captured, ${captureCounters.failedTrivial} failed-trivial, ` +
    `${manifest.findings.length} findings → ${OUT}/manifest.json`,
);
if (captureCounters.failedTrivial > 0 || failedPages.length > 0) process.exitCode = 1;
