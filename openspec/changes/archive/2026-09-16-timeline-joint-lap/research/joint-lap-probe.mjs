// The JOINT-LAP probe (r2, rebuilt after the r1 raster arm was caught
// sampling stage-offset rows over a host screenshot — vacuous passes;
// r2's own first cut then over-failed on three artifacts: end windows
// with no connector by design, completed fills read as interior ink,
// and screenshots taken mid data-reveal rise). The law under test:
// every connector endpoint sits JOINT_LAP px INSIDE the node's bounding
// edge; the mask circle rides the same law; the rendered ink is
// CONTINUOUS through every join; hollow interiors stay clean.
//   1. geometry (DOM): mask r = R − LAP; every subpath endpoint sits
//      LAP inside the owning node's edge (euclidean — axis/direction/
//      RTL-agnostic; subpaths are in flow order = DOM order).
//   2. the MATRIX sweep: all 12 axis × direction × RTL cells of the
//      docs page's geometry matrix carry the identical DOM law.
//   3. raster (host screenshots, DSF 4): joins are sampled only
//      BETWEEN consecutive dots (end windows have no connector by
//      design); each join window [edge+2 → band−0.5] must be ink-
//      continuous (no true-background run > 0.5px, ≥40% ink samples —
//      the gate fails on broken mappings, never passes vacuously);
//      hollow interiors (completed dots skipped — their fill is ink by
//      design) scanned variant-aware: round ±(r−1.75), ring ±(r−2.75).
//   4. the ring variant: a live ring host (playground canvas) proves
//      the same laws on the 2px border band.
// Screenshots settle-gate on the page's data-reveal entrances: dot
// rects are measured before AND after the capture and must agree to
// 0.5px (the pre-reveal rise is 10px — a mid-flight capture shifts
// every sampled row).
// Run: node <this file> (dev server on 5199).
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';

const CHROME = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: CHROME });
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};
const LAP = 1;
let ctx1Interiors = null;
let ringInteriors = null;

// measure a host's spine payload in host-local CSS px (dots carry
// variant + completed; base subpaths in flow order). Each dot also
// gets an `occluded` flag: an element OUTSIDE the host's subtree
// hit-tests above the dot's own box (e.g. the desktop ToC rail over
// the wide horizontal host's clipped right end — element screenshots
// capture the layout box with the overlaying chrome painted in, so
// occluded dots must not be raster-sampled)
const MEASURE = () => {
  const host = window.__probeHost;
  const hB = host.getBoundingClientRect();
  const dots = [...host.querySelectorAll('[data-jx-tl-dot]')].map((d) => {
    const b = d.getBoundingClientRect();
    return {
      cx: b.left + b.width / 2 - hB.left,
      cy: b.top + b.height / 2 - hB.top,
      r: b.width / 2,
      variant: d.getAttribute('data-variant') ?? 'default',
      completed: d.closest('[data-jx-tl-item]').hasAttribute('data-completed'),
    };
  });
  // per-REGION occlusion (the canvas dock's aside can overlap just the
  // host's top rows — a center-only test misses it): three flags per
  // dot — the hollow-core box, the join side toward the next node,
  // the join side toward the previous node
  const axis = host.getAttribute('data-axis') ?? 'vertical';
  const foreign = (x, y) => {
    const t = document.elementsFromPoint(hB.left + x, hB.top + y)[0];
    return !(t && (t === host || host.contains(t)));
  };
  for (const dot of dots) {
    const edgeIn = dot.variant === 'ring' ? dot.r - 2 : dot.r - 1;
    const box = edgeIn / 2 - 0.35;
    dot.occCore = box <= 0
      ? true
      : [[dot.cx, dot.cy], [dot.cx - box, dot.cy - box], [dot.cx + box, dot.cy - box], [dot.cx - box, dot.cy + box], [dot.cx + box, dot.cy + box]]
          .some(([x, y]) => foreign(x, y));
    const sidePts = (sign) => {
      const c = axis === 'horizontal' ? dot.cx : dot.cy;
      const lat = axis === 'horizontal' ? dot.cy : dot.cx;
      const mk = (d) => (axis === 'horizontal' ? [c + sign * d, lat] : [lat, c + sign * d]);
      return [mk(dot.r + 1.2), mk(edgeIn)];
    };
    dot.occNext = sidePts(1).some(([x, y]) => foreign(x, y));
    dot.occPrev = sidePts(-1).some(([x, y]) => foreign(x, y));
  }
  const base = host.querySelector('[data-jx-tl-base]');
  const subpaths = base
    ? [...base.getAttribute('d').matchAll(/M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/g)].map((m) => ({
        x1: Number(m[1]), y1: Number(m[2]), x2: Number(m[3]), y2: Number(m[4]),
      }))
    : [];
  return {
    axis: host.getAttribute('data-axis') ?? 'vertical',
    maskR: Number(host.querySelector('defs mask circle')?.getAttribute('r') ?? -1),
    dots,
    subpaths,
    hostH: hB.height,
    hostW: hB.width,
  };
};

// the DOM law verdict for a measured payload
function lawVerdict(g) {
  const { dots, subpaths } = g;
  let ok = dots.length >= 2 && subpaths.length === dots.length - 1 && Math.abs(g.maskR - (dots[0].r - LAP)) <= 0.51;
  const fails = [];
  if (Math.abs(g.maskR - (dots[0].r - LAP)) > 0.51) fails.push(`mask r=${g.maskR.toFixed(2)} vs R−${LAP}=${(dots[0].r - LAP).toFixed(2)}`);
  subpaths.forEach((sp, i) => {
    if (i + 1 >= dots.length) return;
    const dA = Math.hypot(sp.x1 - dots[i].cx, sp.y1 - dots[i].cy);
    const dB = Math.hypot(sp.x2 - dots[i + 1].cx, sp.y2 - dots[i + 1].cy);
    const want = dots[i].r - LAP;
    if (Math.abs(dA - want) > 0.51) { ok = false; fails.push(`gap${i} a:${dA.toFixed(2)}≠${want.toFixed(2)}`); }
    if (Math.abs(dB - want) > 0.51) { ok = false; fails.push(`gap${i} b:${dB.toFixed(2)}≠${want.toFixed(2)}`); }
  });
  return { ok, fails };
}

// the raster verdict for a measured payload + host screenshot (DSF 4):
// joins BETWEEN consecutive dots only; interiors variant-aware,
// completed skipped
const RASTER = async ({ b64, g }) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  const W = c.width, DSF = 4;
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const lum = (x, y) => {
    const ix = Math.round(x * DSF), iy = Math.round(y * DSF);
    if (ix < 0 || iy < 0 || ix >= c.width || iy >= c.height) return 255; // outside = background, never ink
    const i = (iy * W + ix) * 4;
    return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  };
  const { dots, axis } = g;
  const along = axis === 'horizontal' ? 'x' : 'y';
  const joins = { total: 0, bad: 0, worstInk: 1, longestBg: 0, skipped: 0 };
  const interiors = { samples: 0, ink: 0, hollow: 0 };
  for (let i = 0; i + 1 < dots.length; i++) {
    for (const [dot, nx, sign] of [[dots[i], dots[i + 1], 1], [dots[i + 1], dots[i], -1]]) {
      if (sign > 0 ? dot.occNext : dot.occPrev) { joins.skipped++; continue; } // foreign chrome painted over
      // the join side faces the neighbor; the connector runs between
      // the two tips, so the window is [vertex+2 → bandInner−0.5]
      const edgeIn = dot.variant === 'ring' ? dot.r - 2 : dot.r - 1;
      const center = along === 'x' ? dot.cx : dot.cy;
      const a = center + sign * (dot.r + 2);
      const b = center + sign * (edgeIn - 0.5);
      const lo = Math.min(a, b), hi = Math.max(a, b);
      const lateral = along === 'x' ? dot.cy : dot.cx;
      let ink = 0, n = 0, bgRun = 0, worstRun = 0;
      for (let t = lo; t <= hi + 1e-9; t += 0.25) {
        n++;
        const l = along === 'x' ? lum(t, lateral) : lum(lateral, t);
        if (l < 240) { ink++; bgRun = 0; }
        else if (l >= 246) { bgRun += 0.25; worstRun = Math.max(worstRun, bgRun); }
        // 240–246 = antialias shoulder: neither ink nor seam
      }
      joins.total++;
      const ratio = n ? ink / n : 0;
      joins.worstInk = Math.min(joins.worstInk, ratio);
      joins.longestBg = Math.max(joins.longestBg, worstRun);
      if (ratio < 0.4 || worstRun > 0.5) joins.bad++;
    }
  }
  for (const dot of dots) {
    if (dot.completed) continue; // filled by design — ink is the point
    if (dot.occCore) { interiors.skipped = (interiors.skipped ?? 0) + 1; continue; } // foreign chrome over the box
    const edgeIn = dot.variant === 'ring' ? dot.r - 2 : dot.r - 1;
    // the hollow is the INNER DIAMOND (corner-shape: bevel,
    // |dx|+|dy| ≤ edgeIn): the inscribed axis-aligned square has
    // half-width edgeIn/2 (corner (w,w) sits ON the wall at 2w = e) —
    // minus a margin, or the corners sample the walls and cry wolf
    const box = edgeIn / 2 - 0.35;
    if (box <= 0) continue;
    interiors.hollow++;
    for (let dx = -box; dx <= box + 1e-9; dx += 0.5)
      for (let dy = -box; dy <= box + 1e-9; dy += 0.5) {
        interiors.samples++;
        if (lum(dot.cx + dx, dot.cy + dy) < 238) interiors.ink++;
      }
  }
  return { joins, interiors, img: `${c.width}×${c.height}` };
};

// settle-gated capture: measure → screenshot → measure; the two
// measurements must agree to 0.5px (data-reveal entrances shift rows
// up to 10px while in flight)
async function capture(page, hostLoc) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const m0 = await page.evaluate(MEASURE);
    const buf = await hostLoc.screenshot();
    const m1 = await page.evaluate(MEASURE);
    const drift = Math.max(
      Math.max(...m1.dots.map((d, i) => Math.max(Math.abs(d.cx - m0.dots[i].cx), Math.abs(d.cy - m0.dots[i].cy)))),
      Math.abs(m1.hostH - m0.hostH),
    );
    if (drift <= 0.5) return { g: m1, buf };
    await page.waitForTimeout(600);
  }
  throw new Error('layout never settled (reveal still in flight?)');
}

try {
  // ── context 1: the horizontal leading-labels stage (geometry + raster)
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 })).newPage();
  await page.goto('http://localhost:5199/docs/components/timeline.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const st = page.locator('[data-jx-canvas-stage][aria-label*="horizontal leading labels"]');
  await st.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const hostLoc = st.locator('[data-jx-tl-host]');
  await page.evaluate((sel) => { window.__probeHost = document.querySelector(sel); },
    '[data-jx-canvas-stage][aria-label*="horizontal leading labels"] [data-jx-tl-host]');
  const { g, buf } = await capture(page, hostLoc);
  const law = lawVerdict(g);
  check('mask + every subpath endpoint laps 1px inside the node edges (DOM law)', law.ok,
    law.fails.join('; ') || `${g.subpaths.length} gaps, mask r=${g.maskR}, R=${g.dots[0].r}`);
  const raster = await page.evaluate(RASTER, { b64: buf.toString('base64'), g });
  ctx1Interiors = raster.interiors;
  check('raster: joins continuous through the vertex band (connector↔dot ink unbroken)',
    raster.joins.bad === 0 && raster.joins.total > 0,
    `${raster.joins.total} joins, worst inkRatio ${raster.joins.worstInk.toFixed(2)}, longest true-bg ${raster.joins.longestBg}px${raster.joins.skipped ? `, ${raster.joins.skipped} occluded-side skips (canvas-dock chrome over the region)` : ''}, img ${raster.img}`);
  check('raster: this stage contributes no dirty hollow core (the binding hollow law aggregates with the ring arm below)',
    raster.interiors.ink === 0,
    raster.interiors.samples > 0
      ? `${raster.interiors.ink}/${raster.interiors.samples} ink in ${raster.interiors.hollow} hollow core(s)`
      : `0 unoccluded hollow dots here (the canvas dock's aside overlaps the sole hollow core's top rows)`);
  await page.close();

  // ── context 2: the geometry MATRIX sweep (DOM law) + the ring host
  const mp = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 })).newPage();
  await mp.goto('http://localhost:5199/docs/components/timeline.html', { waitUntil: 'load' });
  await mp.waitForTimeout(3000);
  const matrix = await mp.evaluate((lap) => {
    const section = document.querySelector('#matrix');
    if (!section) return { cells: 0, expected: 12, verdicts: [] };
    const hosts = [...section.querySelectorAll('[data-jx-tl-host]')];
    const verdicts = hosts.map((host) => {
      const cellId = host.closest('[data-variant]')?.getAttribute('data-variant') ?? '?';
      const hB = host.getBoundingClientRect();
      const dots = [...host.querySelectorAll('[data-jx-tl-dot]')].map((d) => {
        const b = d.getBoundingClientRect();
        return { cx: b.left + b.width / 2 - hB.left, cy: b.top + b.height / 2 - hB.top, r: b.width / 2 };
      });
      const base = host.querySelector('[data-jx-tl-base]');
      const subpaths = base
        ? [...base.getAttribute('d').matchAll(/M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/g)].map((m) => ({ x1: Number(m[1]), y1: Number(m[2]), x2: Number(m[3]), y2: Number(m[4]) }))
        : [];
      const maskR = Number(host.querySelector('defs mask circle')?.getAttribute('r') ?? -1);
      let ok = dots.length >= 2 && subpaths.length === dots.length - 1 && Math.abs(maskR - (dots[0].r - lap)) <= 0.51;
      const fails = [];
      subpaths.forEach((sp, i) => {
        if (i + 1 >= dots.length) return;
        const dA = Math.hypot(sp.x1 - dots[i].cx, sp.y1 - dots[i].cy);
        const dB = Math.hypot(sp.x2 - dots[i + 1].cx, sp.y2 - dots[i + 1].cy);
        const want = dots[i].r - lap;
        if (Math.abs(dA - want) > 0.51) { ok = false; fails.push(`${cellId} gap${i} a:${dA.toFixed(2)}≠${want.toFixed(2)}`); }
        if (Math.abs(dB - want) > 0.51) { ok = false; fails.push(`${cellId} gap${i} b:${dB.toFixed(2)}≠${want.toFixed(2)}`); }
      });
      return { cellId, ok, fails };
    });
    return { cells: verdicts.length, expected: 12, verdicts };
  }, LAP);
  const badCells = matrix.verdicts?.filter((v) => !v.ok) ?? [];
  check('the geometry-matrix sweep: all 12 axis × direction × RTL cells ride the lap',
    matrix.cells === matrix.expected && badCells.length === 0,
    badCells.length ? badCells.flatMap((v) => v.fails).join('; ') : `${matrix.cells}/${matrix.expected} cells green (${matrix.verdicts.map((v) => v.cellId).join(', ')})`);

  // the RING host (playground canvas): DOM law + raster on the 2px band
  const ringDotLoc = mp.locator("[data-jx-tl-dot][data-variant='ring']").first();
  await ringDotLoc.scrollIntoViewIfNeeded();
  await mp.waitForTimeout(1200);
  const ringHostLoc = ringDotLoc.locator('xpath=ancestor::*[@data-jx-tl-host][1]');
  await mp.evaluate(() => {
    window.__probeHost = document.querySelector("[data-jx-tl-dot][data-variant='ring']").closest('[data-jx-tl-host]');
  });
  const { g: rg, buf: rbuf } = await capture(mp, ringHostLoc);
  const ringLaw = lawVerdict(rg);
  const hasRing = rg.dots.some((d) => d.variant === 'ring' && !d.completed);
  check('the ring variant rides the same DOM law (endpoint/mask, 2px band)',
    ringLaw.ok && hasRing,
    ringLaw.fails.join('; ') || `axis=${rg.axis}, ${rg.dots.length} dots, mask r=${rg.maskR}, R=${rg.dots[0].r}`);
  const ringRaster = await mp.evaluate(RASTER, { b64: rbuf.toString('base64'), g: rg });
  ringInteriors = ringRaster.interiors;
  check('raster: the ring host joins continuous through the 2px band',
    ringRaster.joins.bad === 0 && ringRaster.joins.total > 0,
    `${ringRaster.joins.total} joins, worst inkRatio ${ringRaster.joins.worstInk.toFixed(2)}, longest true-bg ${ringRaster.joins.longestBg}px`);
  check('raster: the ring hollow interior clean to the inner border edge',
    ringRaster.interiors.ink === 0 && ringRaster.interiors.samples > 0,
    `${ringRaster.interiors.ink}/${ringRaster.interiors.samples} ink in the ring core`);
  // the BINDING aggregate: at least one unoccluded hollow core was
  // actually sampled across both raster arms, and every sampled core
  // is clean (neither arm may pass the hollow law vacuously)
  const sampled = (ctx1Interiors?.samples ?? 0) + (ringInteriors?.samples ?? 0);
  const ink = (ctx1Interiors?.ink ?? 0) + (ringInteriors?.ink ?? 0);
  check('raster (binding): hollow-interior law asserted on real samples, all clean',
    sampled > 0 && ink === 0, `${sampled} samples across both arms, ${ink} ink`);
  await mp.close();
} catch (e) {
  check('probe ran without exceptions', false, e.message);
}

await browser.close();
const fails = results.filter((x) => !x.ok);
console.log(fails.length === 0 ? `\n✓ ALL GREEN — ${results.length} checks` : `\n✗ ${fails.length} FAILED of ${results.length}`);
process.exit(fails.length === 0 ? 0 : 1);
