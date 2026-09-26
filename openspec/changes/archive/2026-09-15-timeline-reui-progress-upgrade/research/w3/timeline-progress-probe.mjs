// W3 progress probe — the timeline value contract on the LIVE dev
// server (2026-09-15). Runs against the Owner's :5199 (NEVER killed
// or restarted by the probe); the fixture route
// apps/www/src/routes/probe-timeline-progress renders the arms through
// the dev server's module graph, so the probe drives the REAL
// component (HMR-fresh, no bespoke build). Playwright-core + the
// pinned Chromium (the w3-probe-battery pattern).
//
//   node openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w3/timeline-progress-probe.mjs [port]
//
// Arms (tasks 3.5):
//   A. value=1.5 → the stroke tip at the node1→node2 midpoint: the
//      inline dashoffset arithmetic verified against the browser's own
//      path sampling (getTotalLength + getPointAtLength, ±1px).
//   B. the tween → the dashoffset moves frame over frame (delta > 0),
//      starting fully retracted at value 1.
//   C. the duplicate-first ladder (1,1,2): value 0.5 → zero-length
//      stroke; value 1 → the tip at node 2's CENTER (the later node
//      OWNS the milestone — never zero-length), ±1px; the dev warn
//      fires for the duplicated step.
//   D. animation='scroll' owns the stroke channel: the value-driven
//      inline dashoffset is ABSENT; the scroller's --jx-tl-run carries
//      pathLength (the cumulative polyline, not the chord); the value
//      contract still drives data-completed.
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';

const PORT = process.argv[2] ?? '5199';
const BASE = `http://localhost:${PORT}`;
const OUT = new URL('.', import.meta.url).pathname;
const CHROME =
  process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
const report = { failures: [], checks: 0 };
const ok = (label, cond, detail = '') => {
  report.checks++;
  if (!cond) report.failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail && !cond ? ` — ${detail}` : ''}`);
};

// the dev-warn channel (arm C's duplicate)
const consoleWarns = [];
page.on('console', (msg) => {
  if (msg.type() === 'warning') consoleWarns.push(msg.text());
});

await page.goto(`${BASE}/probe-timeline-progress`, { waitUntil: 'networkidle' });
// hydration + the measured spine: every host drawn, every stroke mounted
await page.waitForFunction(
  () =>
    document.querySelector('main[data-hydrated]')?.getAttribute('data-hydrated') === '1' &&
    [...document.querySelectorAll('[data-jx-tl-host]')].every((h) =>
      h.querySelector(':scope > [data-jx-tl-spine] > [data-jx-tl-progress]'),
    ) &&
    [...document.querySelectorAll('[data-jx-tl-host]')].every((h) => h.getAttribute('data-jx-spine') === 'drawn'),
  undefined,
  { timeout: 15000 },
);

/** one arm's measured facts: dot centers (svg/list-root space), the
 *  progress path's inline dash arithmetic, the browser's own sampling */
async function readArm(arm) {
  return page.evaluate((a) => {
    const section = document.querySelector(`[data-arm="${a}"]`);
    const host = section.querySelector('[data-jx-tl-host]');
    const svg = host.querySelector(':scope > [data-jx-tl-spine]');
    const path = svg.querySelector('[data-jx-tl-progress]');
    const origin = svg.getBoundingClientRect();
    const dots = [...host.querySelectorAll('[data-jx-tl-list] > [data-jx-tl-item] > [data-jx-tl-dot]')];
    const centers = dots.map((d) => {
      const r = d.getBoundingClientRect();
      return { x: r.left + r.width / 2 - origin.left, y: r.top + r.height / 2 - origin.top };
    });
    const segs = [];
    for (let i = 0; i + 1 < centers.length; i++) {
      segs.push(Math.hypot(centers[i + 1].x - centers[i].x, centers[i + 1].y - centers[i].y));
    }
    const polyline = segs.reduce((s, l) => s + l, 0);
    const chord = Math.hypot(
      centers[centers.length - 1].x - centers[0].x,
      centers[centers.length - 1].y - centers[0].y,
    );
    return {
      centers,
      segs,
      polyline,
      chord,
      totalLen: path.getTotalLength(),
      dasharray: path.getAttribute('stroke-dasharray'),
      dashoffsetAttr: path.getAttribute('stroke-dashoffset'),
      display: getComputedStyle(path).display,
      transition: getComputedStyle(path).transitionProperty,
      items: [...host.querySelectorAll('[data-jx-tl-item]')].map((li) => ({
        step: li.getAttribute('data-step'),
        completed: li.hasAttribute('data-completed'),
      })),
    };
  }, arm);
}

const num = (v) => Number.parseFloat(String(v));

// ── arm A · the fractional midpoint (value 1.5, default ladder) ──────
{
  const a = await readArm('a');
  const dash = num(a.dasharray);
  const offset = num(a.dashoffsetAttr);
  const halfSeg1 = a.segs[0] / 2;
  ok('A: stroke displayed (value mode)', a.display === 'inline', `display=${a.display}`);
  ok('A: transition on stroke-dashoffset', a.transition.includes('stroke-dashoffset'), a.transition);
  // the dasharray rides pathLength = the cumulative POLYLINE (collinear
  // here, but the basis is asserted against the browser's own length)
  ok(
    'A: dasharray == pathLength (±1px)',
    Math.abs(dash - a.polyline) <= 1 && Math.abs(dash - a.totalLen) <= 1,
    `dasharray=${dash} polyline=${a.polyline.toFixed(2)} totalLen=${a.totalLen.toFixed(2)}`,
  );
  // dashoffset = pathLength − len(1.5) = polyline − seg1/2 (±1px)
  ok(
    'A: dashoffset == pathLength − len(1.5) (±1px)',
    Math.abs(offset - (a.polyline - halfSeg1)) <= 1,
    `offset=${offset.toFixed(2)} expected=${(a.polyline - halfSeg1).toFixed(2)}`,
  );
  // pixel truth: the tip sits at the node1→node2 midpoint (±1px)
  const tip = await page.evaluate(() => {
    const path = document.querySelector('[data-arm="a"] [data-jx-tl-progress]');
    const svg = path.closest('svg');
    const dots = [...svg.parentElement.querySelectorAll('[data-jx-tl-dot]')];
    const r1 = dots[0].getBoundingClientRect();
    const r2 = dots[1].getBoundingClientRect();
    const o = svg.getBoundingClientRect();
    const mid = { x: (r1.left + r1.width / 2 + r2.left + r2.width / 2) / 2 - o.left, y: (r1.top + r1.height / 2 + r2.top + r2.height / 2) / 2 - o.top };
    const len = Number.parseFloat(path.getAttribute('stroke-dasharray')) - Number.parseFloat(path.getAttribute('stroke-dashoffset'));
    // DOMPoint is not structured-cloneable — read the coordinates in-page
    const p = path.getPointAtLength(len);
    return { mid, p: { x: p.x, y: p.y }, len };
  });
  const dist = Math.hypot(tip.p.x - tip.mid.x, tip.p.y - tip.mid.y);
  ok('A: stroke tip at node1→node2 midpoint (±1px)', dist <= 1, `dist=${dist.toFixed(2)}px len=${tip.len.toFixed(2)}`);
  // discrete paint alongside: 1.5 completes item 1, not item 2
  ok('A: data-completed — item1 on, item2 off at 1.5', a.items[0].completed === true && a.items[1].completed === false);
}

// ── arm B · the tween animates the dashoffset frame over frame ──────
{
  const before = await readArm('b');
  ok(
    'B: value 1 starts fully retracted (dashoffset == dasharray)',
    Math.abs(num(before.dashoffsetAttr) - num(before.dasharray)) <= 1,
    `offset=${before.dashoffsetAttr} dasharray=${before.dasharray}`,
  );
  await page.getByTestId('tween-run').click();
  // two samples ~150ms apart, mid-tween: the inline dashoffset must MOVE
  const sample1 = await page.evaluate(() => {
    const p = document.querySelector('[data-arm="b"] [data-jx-tl-progress]');
    return Number.parseFloat(p.getAttribute('stroke-dashoffset'));
  });
  await page.waitForTimeout(150);
  const sample2 = await page.evaluate(() => {
    const p = document.querySelector('[data-arm="b"] [data-jx-tl-progress]');
    return Number.parseFloat(p.getAttribute('stroke-dashoffset'));
  });
  const delta = sample1 - sample2;
  ok('B: tween → dashoffset delta over two frames > 0', delta > 0, `s1=${sample1.toFixed(2)} s2=${sample2.toFixed(2)} delta=${delta.toFixed(2)}`);
  await page.waitForTimeout(1600); // let the tween + transition settle
  const after = await readArm('b');
  ok('B: tween end — the stroke fully laid (dashoffset ≈ 0)', Math.abs(num(after.dashoffsetAttr)) <= 2, `offset=${after.dashoffsetAttr}`);
}

// ── arm C · the duplicate-first ladder (steps 1, 1, 2) ───────────────
{
  const c0 = await readArm('c');
  const dash = num(c0.dasharray);
  ok(
    'C: value 0.5 → zero-length stroke (dashoffset == pathLength)',
    Math.abs(num(c0.dashoffsetAttr) - dash) <= 1,
    `offset=${c0.dashoffsetAttr} dasharray=${c0.dasharray}`,
  );
  ok('C: the duplicated step dev-warns', consoleWarns.some((w) => /duplicate step 1/.test(w)), consoleWarns.join(' | ') || 'no warns captured');
  await page.getByTestId('dup-set-1').click();
  await page.waitForTimeout(450); // the 300ms dashoffset transition settles
  const c1 = await readArm('c');
  // value 1 → len = arc(node 2) = seg1 (the LATER node owns the
  // milestone): dashoffset = polyline − seg1 (±1px)
  ok(
    'C: value 1 → dashoffset = pathLength − arc(node2) (±1px)',
    Math.abs(num(c1.dashoffsetAttr) - (c1.polyline - c1.segs[0])) <= 1,
    `offset=${num(c1.dashoffsetAttr).toFixed(2)} expected=${(c1.polyline - c1.segs[0]).toFixed(2)}`,
  );
  const tip = await page.evaluate(() => {
    const path = document.querySelector('[data-arm="c"] [data-jx-tl-progress]');
    const svg = path.closest('svg');
    const dots = [...svg.parentElement.querySelectorAll('[data-jx-tl-dot]')];
    const r2 = dots[1].getBoundingClientRect();
    const o = svg.getBoundingClientRect();
    const node2 = { x: r2.left + r2.width / 2 - o.left, y: r2.top + r2.height / 2 - o.top };
    const len = Number.parseFloat(path.getAttribute('stroke-dasharray')) - Number.parseFloat(path.getAttribute('stroke-dashoffset'));
    // DOMPoint is not structured-cloneable — read the coordinates in-page
    const p = path.getPointAtLength(len);
    return { node2, p: { x: p.x, y: p.y }, len };
  });
  const dist = Math.hypot(tip.p.x - tip.node2.x, tip.p.y - tip.node2.y);
  ok('C: value 1 → stroke tip at NODE 2 center (the owner, ±1px)', dist <= 1, `dist=${dist.toFixed(2)}px len=${tip.len.toFixed(2)}`);
  // both duplicate items keep their discrete paint at value 1 (1 ≤ 1)
  ok('C: both step-1 items completed at value 1', c1.items[0].completed === true && c1.items[1].completed === true);
}

// ── arm D · scroll owns the stroke channel ───────────────────────────
{
  const d = await readArm('d');
  ok('D: value inline dashoffset ABSENT under scroll mode', d.dashoffsetAttr === null, `dashoffset=${d.dashoffsetAttr}`);
  const runVar = await page.evaluate(() => {
    const path = document.querySelector('[data-arm="d"] [data-jx-tl-progress]');
    return path.style.getPropertyValue('--jx-tl-run');
  });
  ok(
    'D: the scroller rides pathLength (--jx-tl-run == dasharray, the polyline ±1px)',
    /px$/.test(runVar.trim()) && Math.abs(num(runVar) - num(d.dasharray)) <= 1 && Math.abs(num(d.dasharray) - d.polyline) <= 1,
    `run=${runVar} dasharray=${d.dasharray} polyline=${d.polyline.toFixed(2)}`,
  );
  ok(
    'D: the scroll() stroke is displayed (@supports gate passed)',
    d.display === 'inline',
    `display=${d.display}`,
  );
  // the value contract still drives discrete completion under scroll
  const completed = d.items.filter((i) => i.completed).length;
  ok('D: value still drives data-completed (item 1 at default 1)', d.items[0].completed === true && completed === 1, `completed=${completed}`);
  // the scroller actually draws: scrolling moves the computed dashoffset
  await page.evaluate(() => {
    const scroller = document.querySelector('[data-arm="d"] [data-scroller]');
    scroller.scrollTop = Math.floor(scroller.scrollHeight / 2);
  });
  await page.waitForTimeout(200);
  const moved = await page.evaluate(() => {
    const path = document.querySelector('[data-arm="d"] [data-jx-tl-progress]');
    const v = getComputedStyle(path).strokeDashoffset;
    return { computed: v, attr: path.getAttribute('stroke-dashoffset') };
  });
  ok(
    'D: the scroll timeline drives the computed dashoffset (attr still absent)',
    moved.attr === null && num(moved.computed) < num(d.dasharray),
    `computed=${moved.computed} attr=${moved.attr}`,
  );
}

// screenshot receipt: the four arms
await page.screenshot({ path: `${OUT}timeline-progress-probe.png`, fullPage: true });

await browser.close();

console.log(`\n${report.checks - report.failures.length}/${report.checks} checks passed`);
if (report.failures.length > 0) {
  console.log('FAILURES:');
  for (const f of report.failures) console.log(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
