// W3 probe battery — the timeline drawn spine (2026-09-15).
// Runs against a dev server of THIS worktree (default :5273; the
// Owner's :5199 is untouched). Playwright-core + the pinned Chromium,
// the research/evidence/timeline-probe.mjs pattern.
//
//   node openspec/changes/2026-09-15-visual-quality-iteration/research/w3/w3-probe-battery.mjs [port]
//
// Batteries (tasks 3.5):
//   A. continuity across the axis × direction × RTL matrix (the docs
//      page's [data-variant] cells): spine drawn, ONE continuous run
//      path through the measured dot centers, floor retired, svg under
//      the items, pointer-transparent, aria-hidden.
//   B. dash phase anchoring: (radius + dashoffset) ≡ 0 mod 8 per segment.
//   C. beam width + gradient + travel animation.
//   D. scroll-progress stroke draw responding to scroll position.
//   E. floor upgrade: javaScriptEnabled:false keeps the CSS floor
//      (REAL receipt, not an assertion) + hydration swaps it in.
// Screenshots land next to this script.
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';

const PORT = process.argv[2] ?? '5273';
const BASE = `http://localhost:${PORT}`;
const OUT = new URL('.', import.meta.url).pathname;
const CHROME =
  process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1480, height: 1200 }, deviceScaleFactor: 2 });
const report = { failures: [], checks: 0 };
const ok = (label, cond, detail = '') => {
  report.checks++;
  if (!cond) report.failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail && !cond ? ` — ${detail}` : ''}`);
};

await page.goto(`${BASE}/docs/components/timeline.html`, { waitUntil: 'networkidle' });

// ── A · the geometry matrix ──────────────────────────────────────────
const matrix = await page.evaluate(() => {
  const out = [];
  // cells are DIVs carrying data-variant (dots inside are SPANs with
  // their own data-variant — never confuse the two)
  for (const cell of document.querySelectorAll('#matrix div[data-variant]')) {
    const variant = cell.getAttribute('data-variant');
    const host = cell.querySelector('[data-jx-tl-host]');
    const svg = host?.querySelector(':scope > [data-jx-tl-spine]');
    const list = host?.querySelector(':scope > [data-jx-tl-list]');
    const base = svg?.querySelector('[data-jx-tl-base]');
    const dots = [...(list?.querySelectorAll(':scope > [data-jx-tl-item] > [data-jx-tl-dot]') ?? [])];
    const floorVisible = [...(host?.querySelectorAll('[data-jx-tl-line]') ?? [])].filter(
      (el) => getComputedStyle(el).display !== 'none',
    ).length;
    const svgOrigin = svg?.getBoundingClientRect();
    const centers = dots.map((d) => {
      const r = d.getBoundingClientRect();
      return { x: r.left + r.width / 2 - (svgOrigin?.left ?? 0), y: r.top + r.height / 2 - (svgOrigin?.top ?? 0) };
    });
    out.push({
      variant,
      rtl: cell.getAttribute('dir') === 'rtl',
      spine: host?.getAttribute('data-jx-spine'),
      svgFirst: host?.firstElementChild === svg,
      ariaHidden: svg?.getAttribute('aria-hidden'),
      pointerEvents: svg ? getComputedStyle(svg).pointerEvents : null,
      hostGrid: host ? getComputedStyle(host).display : null,
      isolation: host ? getComputedStyle(host).isolation : null,
      baseD: base?.getAttribute('d') ?? null,
      centers,
      floorVisible,
      items: list?.querySelectorAll(':scope > [data-jx-tl-item]').length ?? 0,
    });
  }
  return out;
});

for (const m of matrix) {
  const label = `matrix[${m.variant}]`;
  ok(`${label}: measured + drawn`, m.spine === 'drawn', `spine=${m.spine}`);
  ok(`${label}: svg is the host's first child (paints under)`, m.svgFirst === true);
  ok(`${label}: aria-hidden`, m.ariaHidden === 'true');
  ok(`${label}: pointer-events none`, m.pointerEvents === 'none');
  ok(`${label}: host is a grid`, m.hostGrid === 'grid');
  ok(`${label}: ladder rooted (isolation)`, m.isolation === 'isolate');
  ok(`${label}: floor retired`, m.floorVisible === 0, `${m.floorVisible} visible`);
  ok(`${label}: run path present`, typeof m.baseD === 'string' && m.baseD.startsWith('M '));
  // the path must visit every dot center, IN FLOW ORDER, with no seam
  const pairs = m.baseD.split(' L ').map((seg) => seg.replace(/^M /, '').split(' ').map(Number));
  ok(`${label}: path == node centers in flow order`,
    pairs.length === m.centers.length &&
      pairs.every((p, i) => Math.abs(p[0] - m.centers[i].x) < 1.5 && Math.abs(p[1] - m.centers[i].y) < 1.5),
    `${JSON.stringify(pairs)} vs ${JSON.stringify(m.centers)}`);
  // collinear on the axis (vertical: shared x; horizontal: shared y)
  const [first, ...rest] = m.centers;
  const horizontal = m.variant.startsWith('h-');
  const collinear = rest.every((c) => (horizontal ? Math.abs(c.y - first.y) < 1.5 : Math.abs(c.x - first.x) < 1.5));
  ok(`${label}: centers collinear on the ${horizontal ? 'inline' : 'block'} axis`, collinear);
  // RTL horizontal: the FLOW-FIRST center must sit physical RIGHT
  if (m.rtl && horizontal) {
    ok(`${label}: rtl — chronology starts physical right`, first.x > m.centers[m.centers.length - 1].x);
  }
  if (!m.rtl && horizontal) {
    ok(`${label}: ltr — chronology starts physical left`, first.x < m.centers[m.centers.length - 1].x);
  }
}

// screenshot receipt: the whole matrix
await page.locator('#matrix').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.locator('#matrix').screenshot({ path: `${OUT}matrix-axis-direction-rtl.png` });

// ── B · dash phase anchoring ─────────────────────────────────────────
const dash = await page.evaluate(() => {
  const segs = [...document.querySelectorAll('[data-jx-tl-dashed]')];
  return segs.map((seg) => {
    const host = seg.closest('[data-jx-tl-host]');
    const item = host?.querySelector('[data-jx-tl-list] > [data-jx-tl-item]');
    const dot = item?.querySelector(':scope > [data-jx-tl-dot]');
    const r = dot?.getBoundingClientRect();
    return {
      dasharray: getComputedStyle(seg).strokeDasharray,
      dashoffset: parseFloat(getComputedStyle(seg).strokeDashoffset),
      radius: r ? r.width / 2 : -1,
    };
  });
});
ok('dashed preset: segments painted', dash.length >= 2, `${dash.length} segments`);
for (const [i, s] of dash.entries()) {
  ok(`dash[${i}]: dasharray 4 4`, s.dasharray === '4 4' || s.dasharray === '4px, 4px', s.dasharray);
  // the dot-edge phase law: pattern position 0 (a dash START) exactly at
  // the node's flow-end edge: (radius + dashoffset) ≡ 0 mod 8
  const phase = (s.radius + s.dashoffset) % 8;
  ok(`dash[${i}]: dash STARTS at the node edge`, Math.abs(phase) < 0.51 || Math.abs(phase - 8) < 0.51,
    `radius=${s.radius} offset=${s.dashoffset} phase=${phase}`);
}

// ── C · beam width + gradient + travel ───────────────────────────────
const beam = await page.evaluate(() => {
  const el = document.querySelector('[data-jx-tl-beam]');
  if (!el) return null;
  const s = getComputedStyle(el);
  return {
    strokeWidth: s.strokeWidth,
    filter: s.filter,
    animationName: s.animationName,
    dasharray: s.strokeDasharray,
    stroke: s.stroke,
    basePresent: !!el.parentElement?.querySelector('[data-jx-tl-base]'),
  };
});
ok('beam preset painted', beam !== null);
if (beam) {
  ok('beam: real inline width (4px)', beam.strokeWidth === '4px', beam.strokeWidth);
  ok('beam: soft edges (blur)', beam.filter.includes('blur'), beam.filter);
  ok('beam: travels (animation)', beam.animationName.includes('jx-tl-beam-travel'), beam.animationName);
  ok('beam: gradient stroke', beam.stroke.replace(/['\"]/g, '').includes('url(#jx-tl-beam-grad)'), beam.stroke);
  ok('beam: base spine under it', beam.basePresent === true);
}

// screenshot receipt: the spine presets gallery (zoom crop)
const spineSection = page.locator('#spine');
await spineSection.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await spineSection.screenshot({ path: `${OUT}spine-presets.png` });

// ── D · scroll-progress stroke draw ──────────────────────────────────
const scrollBox = page.locator('#animation .max-h-64.overflow-y-auto').first();
await scrollBox.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
const progressProbe = async () =>
  page.evaluate((sel) => {
    const box = document.querySelector(sel);
    const tl = box.querySelector('[data-jx-tl-host][data-anim="scroll"]');
    const p = tl.querySelector('[data-jx-tl-progress]');
    const s = getComputedStyle(p);
    return {
      display: s.display,
      animName: s.animationName,
      timeline: s.animationTimeline,
      dashoffset: parseFloat(s.strokeDashoffset),
      dasharray: s.strokeDasharray,
      scrollTop: box.scrollTop,
      scrollMax: box.scrollHeight - box.clientHeight,
      runLen: parseFloat(p.style.getPropertyValue('--jx-tl-run')),
    };
  }, '#animation .max-h-64.overflow-y-auto');

await scrollBox.evaluate((el) => el.scrollTo(0, 0));
await page.waitForTimeout(300);
const top = await progressProbe();
await scrollBox.evaluate((el) => el.scrollTo(0, el.scrollHeight));
await page.waitForTimeout(300);
const bottom = await progressProbe();
ok('progress: painted (@supports scroll())', top.display !== 'none', top.display);
ok('progress: stroke-draw keyframes attached', top.animName.includes('jx-tl-progress-draw'), top.animName);
ok('progress: scroll() timeline attached', top.timeline.includes('scroll('), String(top.timeline));
ok('progress: dasharray carries the measured run', top.dasharray.split(/[\s,]+/).some((v) => Math.abs(parseFloat(v) - top.runLen) < 1.5),
  `${top.dasharray} vs run=${top.runLen}`);
ok('progress: retracted at reading start', Math.abs(top.dashoffset - top.runLen) < top.runLen * 0.06,
  `offset=${top.dashoffset} run=${top.runLen}`);
ok('progress: drawn at reading end', bottom.dashoffset < top.dashoffset * 0.35,
  `bottom=${bottom.dashoffset} top=${top.dashoffset}`);
// screenshot receipt: mid-draw
await scrollBox.evaluate((el) => el.scrollTo(0, Math.floor(el.scrollHeight * 0.45)));
await page.waitForTimeout(300);
await page.locator('#animation').screenshot({ path: `${OUT}scroll-progress-draw.png` });

// ── E · the no-JS floor (REAL javaScriptEnabled:false) + the swap ────
const noJs = await browser.newPage({ viewport: { width: 1000, height: 1000 }, javaScriptEnabled: false, deviceScaleFactor: 2 });
await noJs.goto(`${BASE}/docs/components/timeline.html`, { waitUntil: 'networkidle' });
const floor = await noJs.evaluate(() => {
  const hosts = [...document.querySelectorAll('[data-jx-tl-host]')];
  return {
    hosts: hosts.length,
    floorHosts: hosts.filter((h) => h.getAttribute('data-jx-spine') === 'floor').length,
    visibleLines: hosts.flatMap((h) => [...h.querySelectorAll('[data-jx-tl-line]')]).filter(
      (l) => getComputedStyle(l).display !== 'none' && l.getBoundingClientRect().height > 0,
    ).length,
    drawnPaths: document.querySelectorAll('[data-jx-tl-spine] > path').length,
  };
});
ok('floor: every host stays floor without JS', floor.hosts > 0 && floor.floorHosts === floor.hosts,
  `${floor.floorHosts}/${floor.hosts}`);
ok('floor: per-item CSS lines painted', floor.visibleLines >= floor.hosts, `${floor.visibleLines} lines`);
ok('floor: zero drawn paths pre-JS', floor.drawnPaths === 0, `${floor.drawnPaths} paths`);
const heroNoJs = noJs.locator('[data-jx-tl-host]').first();
await heroNoJs.scrollIntoViewIfNeeded();
await noJs.waitForTimeout(200);
await heroNoJs.screenshot({ path: `${OUT}floor-nojs.png` });
// and WITH JS the same host upgrades (the swap receipt)
const hydrated = await page.evaluate(() => {
  const host = document.querySelector('[data-jx-tl-host]');
  return {
    spine: host.getAttribute('data-jx-spine'),
    paths: host.querySelectorAll('[data-jx-tl-spine] > path').length,
    floorVisible: [...host.querySelectorAll('[data-jx-tl-line]')].filter((l) => getComputedStyle(l).display !== 'none').length,
  };
});
ok('upgrade: hydrated host flips to drawn', hydrated.spine === 'drawn', hydrated.spine);
ok('upgrade: floor lines retired', hydrated.floorVisible === 0);
await noJs.close();

// custom spine receipt
const custom = page.locator('[data-testid="tl-custom-spine"], #spine').first();
await page.locator('#spine').scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await page.locator('#spine').screenshot({ path: `${OUT}spine-custom-snippet.png` });

// ── verdict ──────────────────────────────────────────────────────────
console.log('\n━━ W3 probe battery ━━');
console.log(`checks: ${report.checks}, failures: ${report.failures.length}`);
(await import('node:fs')).writeFileSync(`${OUT}w3-probe-report.json`, JSON.stringify({ checks: report.checks, failures: report.failures, matrix }, null, 2));
if (report.failures.length) {
  console.log(report.failures.join('\n'));
  process.exitCode = 1;
}
await browser.close();
