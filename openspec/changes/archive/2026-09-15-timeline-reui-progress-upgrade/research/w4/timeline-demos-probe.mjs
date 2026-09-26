// W4 demos probe — the timeline docs page on the LIVE dev server
// (2026-09-15). Runs against the Owner's :5199 (NEVER killed or
// restarted by the probe); the docs route hot-reloads through the dev
// server's module graph, so the probe drives the REAL upgraded page
// (HMR-fresh, no bespoke build). Playwright-core + the pinned Chromium
// (the w3-probe-battery pattern).
//
//   node openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w4/timeline-demos-probe.mjs [port]
//
// Arms (tasks 4.2):
//   A. THE TWELVE OFFICIAL FAMILIES mount — one [data-jx-canvas-stage]
//      per family whose aria-label equals the inventory mapping table's
//      `docs stage aria-label` column (research/reui-family-inventory.md,
//      frozen), verified row by row, each stage carrying a drawn
//      timeline host with the value-driven progress stroke.
//   B. the stepper buttons change data-completed counts — next/prev
//      step whole milestones, random lands a decimal whose completed
//      count equals floor(value); the readout carries the decimals.
//   C. the tween's dashoffset varies over two sampled frames — play
//      tweens value 1 → 6 through the fractional mid-states, the
//      progress stroke's inline stroke-dashoffset moves frame over
//      frame, and the run lands at 6.00 with all six complete.
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';

const PORT = process.argv[2] ?? '5199';
const BASE = `http://localhost:${PORT}`;
const PAGE = '/docs/components/timeline.html';
const CHROME =
  process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

// the frozen mapping table, c-timeline-1..12 in inventory order —
// research/reui-family-inventory.md is the source of truth
const FAMILIES = [
  { n: 1, slug: 'basic', label: 'timeline demo · basic' },
  { n: 2, slug: 'roadmap', label: 'timeline demo · roadmap' },
  { n: 3, slug: 'order-status', label: 'timeline demo · order status' },
  { n: 4, slug: 'git-activity', label: 'timeline demo · git activity' },
  { n: 5, slug: 'milestones', label: 'timeline demo · milestones' },
  { n: 6, slug: 'pipeline-steps', label: 'timeline demo · pipeline steps' },
  { n: 7, slug: 'roadmap-items', label: 'timeline demo · roadmap items' },
  { n: 8, slug: 'vertical', label: 'timeline demo · vertical' },
  { n: 9, slug: 'horizontal-leading', label: 'timeline demo · horizontal leading labels' },
  { n: 10, slug: 'deployment-log', label: 'timeline demo · deployment log' },
  { n: 11, slug: 'activity-feed', label: 'timeline demo · activity feed' },
  { n: 12, slug: 'compact-milestone', label: 'timeline demo · compact horizontal milestone' },
];

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
const report = { failures: [], checks: 0 };
const ok = (label, cond, detail = '') => {
  report.checks++;
  if (!cond) report.failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail && !cond ? ` — ${detail}` : ''}`);
};

// uncaught page errors fail the probe (a broken page proves nothing)
const pageErrors = [];
page.on('pageerror', (err) => pageErrors.push(String(err)));

await page.goto(`${BASE}${PAGE}`, { waitUntil: 'networkidle' });
// hydration + measurement settle: every timeline host on the page drew
// its spine, and the stepper demo mounted its controls
await page.waitForFunction(
  () => {
    const hosts = [...document.querySelectorAll('[data-jx-tl-host]')];
    const drawn = hosts.length > 0 && hosts.every((h) => h.getAttribute('data-jx-spine') === 'drawn');
    const stepper = document.querySelector('[data-testid="tl-step-next"]');
    return drawn && stepper instanceof HTMLElement;
  },
  undefined,
  { timeout: 20000 },
);

ok('settle: no uncaught page errors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 200));

// ── arm A · the twelve official families, row by row ─────────────
{
  const stages = await page.evaluate(() =>
    [...document.querySelectorAll('[data-jx-canvas-stage]')].map((s) => ({
      label: s.getAttribute('aria-label'),
      items: s.querySelectorAll('[data-jx-tl-item]').length,
      drawn: !!s.querySelector('[data-jx-tl-host][data-jx-spine="drawn"]'),
      stroke: !!s.querySelector('[data-jx-tl-host] > [data-jx-tl-spine] > [data-jx-tl-progress]'),
      icons: s.querySelectorAll('svg[data-jx-icon]').length,
    })),
  );
  console.log(`  stages on page: ${stages.length} (labels: ${stages.map((s) => `"${s.label}"`).join(', ')})`);

  for (const family of FAMILIES) {
    const hits = stages.filter((s) => s.label === family.label);
    ok(
      `A${family.n} (${family.slug}): exactly one stage aria-label="${family.label}"`,
      hits.length === 1,
      `stages=${hits.length}`,
    );
    if (hits.length === 1) {
      const s = hits[0];
      ok(
        `A${family.n} (${family.slug}): the stage hosts a drawn timeline (${s.items} items) with the progress stroke`,
        s.drawn && s.stroke && s.items >= 3,
        `drawn=${s.drawn} stroke=${s.stroke} items=${s.items}`,
      );
    }
  }

  // the git-activity stage's icon badges actually rendered (lucide glyphs)
  const git = stages.find((s) => s.label === 'timeline demo · git activity');
  ok('A4 (git-activity): four lucide icon badges rendered inside the nodes', (git?.icons ?? 0) >= 4, `icons=${git?.icons ?? 0}`);
}

// ── arm B · the stepper buttons drive data-completed counts ──────
{
  const read = () =>
    page.evaluate(() => {
      const stages = [...document.querySelectorAll('[data-jx-canvas-stage]')];
      const stage = stages.find((s) => s.getAttribute('aria-label') === 'timeline · value contract demo');
      const host = stage?.querySelector('[data-jx-tl-host]');
      return {
        readout: stage?.querySelector('[data-testid="tl-value-readout"]')?.textContent ?? '',
        completed: host ? host.querySelectorAll('[data-jx-tl-item][data-completed]').length : -1,
        dashoffset: host?.querySelector('[data-jx-tl-spine] > [data-jx-tl-progress]')?.getAttribute('stroke-dashoffset') ?? '',
      };
    });

  await page.click('[data-testid="tl-step-reset"]');
  let state = await read();
  ok('B: reset → value 1.00, exactly item 1 complete', state.readout.includes('1.00') && state.completed === 1, `readout="${state.readout}" completed=${state.completed}`);

  await page.click('[data-testid="tl-step-next"]');
  state = await read();
  ok('B: next → value 2.00, two items complete', state.readout.includes('2.00') && state.completed === 2, `readout="${state.readout}" completed=${state.completed}`);

  await page.click('[data-testid="tl-step-next"]');
  state = await read();
  ok('B: next → value 3.00, three items complete', state.readout.includes('3.00') && state.completed === 3, `readout="${state.readout}" completed=${state.completed}`);

  await page.click('[data-testid="tl-step-prev"]');
  state = await read();
  ok('B: prev → value 2.00, two items complete', state.readout.includes('2.00') && state.completed === 2, `readout="${state.readout}" completed=${state.completed}`);

  await page.click('[data-testid="tl-step-random"]');
  state = await read();
  const parsed = Number.parseFloat(state.readout.replace('value = ', ''));
  ok(
    'B: random → a decimal readout, completed count == floor(value)',
    Number.isFinite(parsed) &&
      parsed > 1 &&
      parsed < 6 &&
      state.completed === Math.floor(parsed) &&
      /\d+\.\d{2}/.test(state.readout),
    `readout="${state.readout}" completed=${state.completed} parsed=${parsed}`,
  );

  // the progress stroke tracks the value: dashoffset present and finite
  const dash = Number.parseFloat(state.dashoffset);
  ok('B: the progress stroke carries a finite inline dashoffset', Number.isFinite(dash), `dashoffset="${state.dashoffset}"`);
}

// ── arm C · the tween's dashoffset varies over two sampled frames ─
{
  const dashAt = () =>
    page.evaluate(() => {
      const stages = [...document.querySelectorAll('[data-jx-canvas-stage]')];
      const stage = stages.find((s) => s.getAttribute('aria-label') === 'timeline · value contract demo');
      const path = stage?.querySelector('[data-jx-tl-host] > [data-jx-tl-spine] > [data-jx-tl-progress]');
      return path ? path.getAttribute('stroke-dashoffset') : null;
    });

  await page.click('[data-testid="tl-step-reset"]');
  const before = await dashAt();
  await page.click('[data-testid="tl-tween-toggle"]'); // play: 1 → 6 over ~2.4s
  await page.waitForTimeout(300);
  const mid1 = await dashAt();
  await page.waitForTimeout(250);
  const mid2 = await dashAt();
  ok(
    'C: tween animates dashoffset over two sampled frames (delta > 0)',
    mid1 !== null && mid2 !== null && Math.abs(Number.parseFloat(mid2) - Number.parseFloat(mid1)) > 0,
    `frame1=${mid1} frame2=${mid2}`,
  );
  ok(
    'C: the tween actually retracted the stroke from the reset state',
    before !== null && mid1 !== null && Number.parseFloat(mid1) !== Number.parseFloat(before),
    `before=${before} frame1=${mid1}`,
  );

  // the run lands: value 6.00, all six items complete (tween 2.4s + slack)
  await page.waitForFunction(
    () => {
      const stages = [...document.querySelectorAll('[data-jx-canvas-stage]')];
      const stage = stages.find((s) => s.getAttribute('aria-label') === 'timeline · value contract demo');
      const readout = stage?.querySelector('[data-testid="tl-value-readout"]')?.textContent ?? '';
      const done = stage ? stage.querySelectorAll('[data-jx-tl-item][data-completed]').length : -1;
      return readout.includes('6.00') && done === 6;
    },
    undefined,
    { timeout: 8000 },
  );
  const final = await page.evaluate(() => {
    const stages = [...document.querySelectorAll('[data-jx-canvas-stage]')];
    const stage = stages.find((s) => s.getAttribute('aria-label') === 'timeline · value contract demo');
    return {
      readout: stage?.querySelector('[data-testid="tl-value-readout"]')?.textContent ?? '',
      completed: stage ? stage.querySelectorAll('[data-jx-tl-item][data-completed]').length : -1,
      dashoffset: stage?.querySelector('[data-jx-tl-host] > [data-jx-tl-spine] > [data-jx-tl-progress]')?.getAttribute('stroke-dashoffset') ?? '',
    };
  });
  ok(
    'C: tween end → value 6.00 with all six complete and the stroke fully laid',
    final.completed === 6 && Math.abs(Number.parseFloat(final.dashoffset)) <= 1,
    `readout="${final.readout}" completed=${final.completed} dashoffset="${final.dashoffset}"`,
  );

  await page.click('[data-testid="tl-tween-toggle"]'); // pause (toggle back to idle state)
}

await browser.close();

if (report.failures.length) {
  console.error(`\nW4 demos probe FAILED — ${report.failures.length} of ${report.checks} checks:`);
  for (const f of report.failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`\nW4 demos probe PASS — all ${report.checks} checks green`);
process.exit(0);
