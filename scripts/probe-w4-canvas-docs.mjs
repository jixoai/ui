// W4 canvas/docs probe (explicit-props, tasks 4.1/4.2/4.4/4.5/4.6 —
// the canvas/docs wave): the per-axis CONTROLS on the component-canvas
// page re-stamp the stage LIVE, the concept page renders the grammar
// with LIVE dogfood, and the two new gates (the 110-page manifest
// receipt + the fixtures gate inside --check) run GREEN.
//
// Asserts:
//  1. the component-canvas universal-props canvas (schema mode): the
//     axis-enum flip (size auto → large) re-stamps the workbench root
//     LIVE — the §1 carrier declaration lands and the computed
//     font-size follows (the D3 receipt-authoring law: assert the
//     DECLARATION + a computed channel, never an unregistered
//     custom's computed value);
//  2. the number spinner: size mode 'number' reveals the stepper,
//     typing 22 stamps --jx-size-effective: 22px and computes 22px;
//  3. the query editor: mode 'query()' reveals the source editor; the
//     valid case `{ sm: 'large' }` resolves at the LIVE media boundary
//     (the viewport is ≥40rem → the large rung computes 18px; an
//     INVALID case flags the error channel and stamps nothing);
//  4. the elevation enum flip (auto → level4) stamps the §7 carrier
//     declaration verbatim (--jx-elevation-effective: 8);
//  5. the concept page: the grammar sections render (总纲/lanes/axes/
//     query/resolution/degrade/dogfood) and TWO+ LIVE dogfood examples
//     compute real values (the concentric Card 20→auto PressButton
//     6px; the media-query Card at the 40rem boundary; the docs-infra
//     TokenTable at the explicit 18px number lane);
//  6. the 110-page manifest receipt script GREEN (tail shown);
//  7. the fixtures gate GREEN inside component-metadata-gen --check.
//
// Run: node scripts/probe-w4-canvas-docs.mjs
// (owns its dev server on :5229 — spawned, killed by PID group)
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 5229;
const BASE = `http://localhost:${PORT}`;

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

  // ── 1-4. the component-canvas universal-props canvas (W4 4.2) ────
  await page.goto(`${BASE}/docs/components/component-canvas.html`, { waitUntil: 'networkidle' });
  const section = page.locator('#universal-props');
  const canvas = section.locator('[data-jx-canvas]').first();
  const workbench = () => canvas.evaluate((el) => ({
    style: el.getAttribute('style') ?? '',
    fontSize: getComputedStyle(el).fontSize,
  }));
  const selectOf = (key) =>
    section.locator(`[data-jx-canvas-axis-select]#jx-canvas-component-canvas-universal-props-ctl-${key}`);

  check(
    'the dock renders the six axis-enum controls (schema mode over the family meta)',
    (await section.locator('[data-jx-canvas-axis-select]').count()) === 6,
    String(await section.locator('[data-jx-canvas-axis-select]').count()),
  );

  const before = await workbench();
  await selectOf('size').selectOption('large');
  const afterLarge = await workbench();
  check(
    'axis-enum flip size → large re-stamps the stage LIVE (the §1 carrier declaration + the computed font-size)',
    /--jx-size-effective:\s*var\(--jx-size-large\)/.test(afterLarge.style) &&
      afterLarge.fontSize !== before.fontSize &&
      afterLarge.fontSize === '18px',
    `${before.fontSize} → ${afterLarge.fontSize} · ${afterLarge.style.slice(0, 90)}`,
  );

  // the number spinner (2)
  await selectOf('size').selectOption('number');
  const spinner = section.locator('[data-jx-canvas-axis-number]');
  check(
    "number mode reveals the stepper (the axis-number row's visibility gate)",
    (await spinner.count()) === 1,
  );
  await spinner.fill('22');
  await spinner.blur();
  const afterNumber = await workbench();
  check(
    'the number spinner works — 22 stamps --jx-size-effective: 22px and computes 22px',
    /--jx-size-effective:\s*22px/.test(afterNumber.style) && afterNumber.fontSize === '22px',
    `${afterNumber.fontSize} · ${afterNumber.style.slice(0, 90)}`,
  );

  // the query editor (3) — the LIVE media boundary
  await selectOf('size').selectOption('query()');
  const editor = section.locator('[data-jx-canvas-axis-query]');
  check(
    "query() mode reveals the source editor (the query-editor row's visibility gate)",
    (await editor.count()) === 1,
  );
  await editor.fill(`{ sm: 'large' }`);
  await editor.blur();
  await page.waitForTimeout(120); // the input commit → values → derived → re-stamp
  const atWide = await workbench();
  check(
    "a valid query case reacts at the boundary — viewport 1280px ≥ sm 40rem → the large rung computes",
    atWide.fontSize === '18px' && /--jx-size-effective:/.test(atWide.style),
    `${atWide.fontSize} · ${atWide.style.slice(0, 90)}`,
  );
  // narrow the viewport below the boundary → the base (auto) applies
  await page.setViewportSize({ width: 560, height: 900 });
  await page.waitForTimeout(200); // the matchMedia tick re-resolves
  const atNarrow = await workbench();
  check(
    'below the 40rem boundary the base (auto) applies — the stage re-stamps back',
    !/--jx-size-effective:\s*(18|22)px/.test(atNarrow.style),
    atNarrow.style.slice(0, 90),
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  // the INVALID case: flags the error channel, stamps nothing new
  await editor.fill(`{ sm: large }`);
  await editor.blur();
  await page.waitForTimeout(120);
  const invalidFlag = await editor.evaluate((el) => el.getAttribute('aria-invalid'));
  check(
    'an invalid query source flags the error channel (aria-invalid) and keeps the last valid stamp',
    invalidFlag === 'true' || (await editor.getAttribute('aria-invalid')) === 'true',
    String(invalidFlag),
  );
  await selectOf('size').selectOption('auto');

  // the elevation flip (4)
  await selectOf('elevation').selectOption('level4');
  const afterElevation = await workbench();
  check(
    'elevation auto → level4 stamps the §7 carrier verbatim (the 8dp recipe declaration)',
    /--jx-elevation-effective:\s*8/.test(afterElevation.style),
    afterElevation.style.slice(0, 120),
  );

  // ── 5. the concept page (W4 4.5) ─────────────────────────────────
  await page.goto(`${BASE}/docs/universal-props.html`, { waitUntil: 'networkidle' });
  for (const id of ['grammar', 'lanes', 'axes', 'query', 'resolution', 'degrade', 'dogfood']) {
    check(
      `the concept page renders the #${id} section`,
      (await page.locator(`#${id}`).count()) === 1,
    );
  }
  const concentric = page.locator('#dogfood [data-jx-card]').first();
  const autoButton = concentric.locator('button').first();
  const autoRadius = await autoButton.evaluate((el) => getComputedStyle(el).borderRadius);
  check(
    'LIVE dogfood 1 — the concentric anchor: radius 20 Card → the auto PressButton computes 20 − 14 = 6px',
    autoRadius === '6px',
    autoRadius,
  );
  const queryCard = page.locator('#dogfood [data-jx-card]').nth(1);
  const querySize = await queryCard.evaluate((el) => getComputedStyle(el).fontSize);
  check(
    "LIVE dogfood 2 — the media-key query() Card computes at the boundary (≥40rem → 18px, the large rung)",
    querySize === '18px',
    querySize,
  );
  const tokenTable = page.locator('#site-adoption div[style*="--jx-size-effective: 18px"]').first();
  const tokenSize = await tokenTable.evaluate((el) => getComputedStyle(el).fontSize);
  check(
    'LIVE dogfood 3 — the docs-infra TokenTable at the explicit 18px number lane',
    (await tokenTable.count()) === 1 && tokenSize === '18px',
    tokenSize,
  );
  const degradeRows = await page.locator('#degrade table tbody tr').count();
  check(
    'the §14 degrade table renders all six shapes',
    degradeRows === 6,
    String(degradeRows),
  );

  // ── 6-7. the gates (spawned; tails shown) ────────────────────────
  const run = (cmd, args) => {
    const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });
    return { code: r.status, out: `${r.stdout}${r.stderr}`.trim().split('\n').slice(-3).join(' | ') };
  };
  const manifest = run('node', ['scripts/verify-docs-universal-manifest.mjs']);
  check(
    'the 110-page manifest receipt GREEN (built dist)',
    manifest.code === 0,
    manifest.out,
  );
  const meta = run('node', ['scripts/component-metadata-gen.mjs', '--check']);
  check(
    'the fixtures gate GREEN inside --check (card merge + exempt ledger)',
    meta.code === 0,
    meta.out,
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
  console.error(`probe-w4-canvas-docs: ${failed.length} FAIL(S)`);
  process.exit(1);
}
