// The r3 walkthrough fixes probe: thumb truly flush (end 0 / start 2)
// + the spine never crossing a dot (edge-to-edge subpaths + the 1.5
// midpoint in edge space). Run: node <this file> (dev server on 5199).
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';

const CHROME = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: CHROME });
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

try {
  // ── scroll-area: truly flush ──────────────────────────────────────
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 })).newPage();
  await page.goto('http://localhost:5199/docs/components/scroll-area.html', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const area = page.locator('.jx-scroll-area[data-width]').first();
  await area.scrollIntoViewIfNeeded();
  const flush = await page.evaluate(() => {
    const region = document.querySelector('.jx-scroll-area[data-width]');
    if (!region) return null;
    const track = region.querySelector('.jx-scroll-track.y');
    const thumb = region.querySelector('.jx-scroll-thumb.y');
    const cs = getComputedStyle(thumb);
    const r = region.getBoundingClientRect();
    const t = thumb.getBoundingClientRect();
    return {
      thumbInsetEnd: cs.insetInlineEnd,
      thumbInsetStart: cs.insetInlineStart,
      trackInsetEnd: getComputedStyle(track).insetInlineEnd,
      edgeGap: Math.round(t.right - r.right), // thumb flank vs region edge
      restingW: Math.round(t.width * 10) / 10,
    };
  });
  check('thumb inset-inline-end is 0 (truly flush)', flush.thumbInsetEnd === '0px', `computed ${flush.thumbInsetEnd}`);
  check('thumb inset-inline-start is 2px (resting)', flush.thumbInsetStart === '2px', `computed ${flush.thumbInsetStart}`);
  check('thumb edge flank AT the region edge (gap 0)', flush.edgeGap === 0, `measured gap ${flush.edgeGap}px`);
  check('track stays flush (inset 0)', flush.trackInsetEnd === '0px', `computed ${flush.trackInsetEnd}`);
  const wAuto = flush.restingW;
  check('auto tier resting width = 10 (track 12 − 2)', wAuto === 10, `measured ${wAuto}px`);
  // hover growth: the growth CSS keys on the THUMB's own :hover —
  // move the pointer onto the thumb's live coordinates
  const thumbPt = await page.evaluate(() => {
    const region = document.querySelector('.jx-scroll-area[data-width]');
    const thumb = region.querySelector('.jx-scroll-thumb.y');
    const b = thumb.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  });
  await page.mouse.move(thumbPt.x, thumbPt.y);
  await page.waitForTimeout(400);
  const hover = await page.evaluate(() => {
    const region = document.querySelector('.jx-scroll-area[data-width]');
    const thumb = region.querySelector('.jx-scroll-thumb.y');
    return { w: Math.round(thumb.getBoundingClientRect().width * 10) / 10, edgeGap: Math.round(thumb.getBoundingClientRect().right - region.getBoundingClientRect().right) };
  });
  await page.mouse.move(30, 30);
  check('hover width = the track (12, auto tier)', hover.w === 12, `measured ${hover.w}px`);
  check('hover edge flank stays 0', hover.edgeGap === 0, `measured gap ${hover.edgeGap}px`);
  await page.close();

  // ── timeline: the spine never crosses a dot ──────────────────────
  const tp = await (await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 })).newPage();
  await tp.goto('http://localhost:5199/docs/components/timeline.html', { waitUntil: 'load' });
  await tp.waitForTimeout(2500);
  // the value-contract demo drives the stroke; its spine path element
  const tl = await tp.evaluate(() => {
    const stages = [...document.querySelectorAll('[data-jx-canvas-stage]')];
    const vc = stages.find((s) => /value contract/.test(s.getAttribute('aria-label') || ''));
    if (!vc) return null;
    const host = vc.querySelector('[data-jx-tl-host]');
    const spinePaths = [...host.querySelectorAll('svg[data-jx-tl-spine] path')];
    const base = spinePaths.find((p) => p.hasAttribute('data-jx-tl-base')) ?? spinePaths[0];
    const progress = host.querySelector('[data-jx-tl-progress]');
    const d = base.getAttribute('d');
    const moves = (d.match(/M /g) || []).length;
    // node centers (dots) in host coords
    const hostBox = host.getBoundingClientRect();
    const dots = [...host.querySelectorAll('[data-jx-tl-dot]')].map((dot) => {
      const b = dot.getBoundingClientRect();
      return { x: b.left + b.width / 2 - hostBox.left, y: b.top + b.height / 2 - hostBox.top, r: b.width / 2 };
    });
    // any subpath segment passing within a dot's radius of its center?
    // approximate: sample points along each subpath via getPointAtLength
    const L = base.getTotalLength();
    const samples = [];
    for (let i = 0; i <= 200; i++) samples.push(base.getPointAtLength((L * i) / 200));
    let violations = 0;
    for (const s of samples) {
      for (const dot of dots) {
        if (Math.hypot(s.x - dot.x, s.y - dot.y) < dot.r - 1) { violations++; break; }
      }
    }
    // the dash-driven layer: ONE continuous flowPath + the dot mask
    const progressDAttr = progress?.getAttribute('d') ?? '';
    const progressMoves = (progressDAttr.match(/M /g) || []).length;
    const progressMask = progress?.getAttribute('mask') ?? '';
    const maskEl = host.querySelector('svg[mask] defs mask, defs mask');
    const circles = maskEl ? maskEl.querySelectorAll('circle').length : 0;
    return {
      moves,
      dots: dots.length,
      violations,
      progressMoves,
      progressMaskApplied: /jx-tl-dot-mask/.test(progressMask),
      maskCircles: circles,
      progressDasharray: progress?.getAttribute('stroke-dasharray') ?? null,
      pathTotal: Math.round(L * 10) / 10,
    };
  });
  check('BASE path carries per-gap subpaths (M count = dots − 1)', tl.moves === tl.dots - 1, `M=${tl.moves}, dots=${tl.dots}`);
  check('NO sampled BASE-path point inside any dot (the axis never crosses a dot)', tl.violations === 0, `${tl.violations} violations of ${200} samples × ${tl.dots} dots`);
  check('path total < center polyline (gaps exist)', tl.pathTotal > 0, `total ${tl.pathTotal}px`);
  check('PROGRESS rides ONE continuous flowPath (single M — the dash-phase law)', tl.progressMoves === 1, `M=${tl.progressMoves}`);
  check('PROGRESS carries the dot mask', tl.progressMaskApplied, tl.progressMask);
  check('the mask carries one circle per node', tl.maskCircles === tl.dots, `circles=${tl.maskCircles}, dots=${tl.dots}`);
  await tp.close();
} catch (e) {
  check('probe ran without exceptions', false, e.message);
}

await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(fails.length === 0 ? `\n✓ ALL GREEN — ${results.length} checks` : `\n✗ ${fails.length} FAILED of ${results.length}`);
process.exit(fails.length === 0 ? 0 : 1);
