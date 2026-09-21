// W3 batch D3 spot probe (explicit-props): 15 more families join the
// eight-axis surface — a compact receipt over the batch's families
// through the dev server, incl. select's PORTALED listbox.
//
// Asserts (the batch D3 spot set):
//  1. statistic (a migrated no-own readout): an explicit size NUMBER
//     stamps --jx-size-effective: 18px AND the root's computed
//     font-size composes to 18px (§1: ONE number moves a family);
//     density "small" lands the legacy rung stamp data-density="sm";
//  2. the NESTING CONCENTRIC check (§3) through a batch-D3 family:
//     a SectionCard at an explicit radius={20} SUPPLIES
//     --jx-radius-effective, and a nested Card at radius="auto"
//     (batch B's concentric consumer) COMPUTES max(0px, R − P) —
//     20px − 0.875rem = 6px through the card's own consumed form;
//  3. select's PORTAL (the batch C law): opening the listbox
//     promotes the panel to the top layer — the panel root carries
//     its OWN resolved carriers (self-carried: the elevation own
//     level2 stamps --jx-elevation-effective: 3, the §7 pair rides
//     the panel style) while the trigger surface (.jx-field) carries
//     the §1 size carrier; close it after reading;
//  4. a NAMED step resolves via the alias ladder var, zero inline
//     px: table size="medium" stamps
//     --jx-size-effective: var(--jx-size-medium) (§12's CSS-var
//     indirection — a plugin remap is a var override) and the ladder
//     var RESOLVES through the kernel sheet (concrete rung, not
//     IACVT).
//
// Run: node scripts/probe-w3d3-spot.mjs (dev server on :5226)
import { chromium } from 'playwright-core';

const URL = 'http://localhost:5226/docs/components/';

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
const results = [];
const check = (name, ok, detail = '') => {
  results.push([name, ok, detail]);
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` :: ${detail}` : ''}`);
};

// ── 1. statistic: the size number lane + the density rung bridge ──────
{
  await page.goto(`${URL}statistic.html`, { waitUntil: 'networkidle' });
  const root = page.locator('#universal-props [data-jx-stat]').nth(0);
  const facts = await root.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      fontSize: cs.fontSize,
      density: el.getAttribute('data-density'),
    };
  });
  check(
    'statistic size={18} stamps the §1 carrier verbatim (--jx-size-effective: 18px)',
    /--jx-size-effective:\s*18px/.test(facts.style),
    facts.style.slice(0, 120),
  );
  check(
    'the readout root font-size COMPOSES to 18px (§1: one number moves the family)',
    facts.fontSize === '18px',
    facts.fontSize,
  );
  check(
    'density="small" lands the legacy rung stamp data-density="sm" (the §4 bridge)',
    facts.density === 'sm',
    String(facts.density),
  );
}

// ── 2. section-card → card: the §3 nesting concentric chain ────────────
{
  await page.goto(`${URL}section-card.html`, { waitUntil: 'networkidle' });
  // nth(3): the outer universal SectionCard itself is nth(0) — the
  // three demo rows follow (18 / named / concentric)
  const section = page.locator('#universal-props [data-jx-section]').nth(3);
  const s = await section.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      radiusVar: cs.getPropertyValue('--jx-radius-effective').trim(),
    };
  });
  check(
    'SectionCard radius={20} SUPPLIES --jx-radius-effective: 20px (the concentric anchor)',
    s.radiusVar === '20px' && /--jx-radius-effective:\s*20px/.test(s.style),
    `var=${s.radiusVar} · ${s.style.slice(0, 110)}`,
  );
  const card = section.locator('[data-jx-card]').first();
  const c = await card.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      radius: cs.borderRadius,
      consumed: cs.getPropertyValue('--jx-radius-consumed').trim(),
    };
  });
  check(
    'the radius="auto" Card carries the §3 concentric EXPRESSION (max(0px, R − P) × the factor)',
    /--jx-radius-consumed:\s*calc\(max\(0px,\s*calc\(var\(--jx-radius-effective,\s*0px\)\s*-\s*var\(--jx-inset-effective,\s*0px\)\)\)/.test(
      c.style,
    ),
    c.style.slice(0, 130),
  );
  check(
    'the auto Card COMPUTES the concentric result through the section (20 − 14 = 6px)',
    c.radius === '6px',
    c.radius,
  );
}

// ── 3. select: the PORTALED listbox is self-carried ────────────────────
{
  await page.goto(`${URL}select.html`, { waitUntil: 'networkidle' });
  const field = page.locator('#universal-props .jx-field').nth(0);
  const f = await field.evaluate((el) => ({
    style: el.getAttribute('style') ?? '',
    density: el.getAttribute('data-density'),
  }));
  check(
    'the TRIGGER surface (.jx-field) carries the §1 size carrier (18px) + the density rung',
    /--jx-size-effective:\s*18px/.test(f.style) && f.density === 'sm',
    `${f.density} · ${f.style.slice(0, 110)}`,
  );
  // open the first demo's listbox (popovertarget click on the trigger)
  await field.locator('button.jx-sel-trigger').click();
  const panel = page.locator('.jx-sel-panel:popover-open').first();
  await panel.waitFor({ state: 'attached', timeout: 5000 });
  const p = await panel.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      open: el.matches(':popover-open'),
      elevationVar: cs.getPropertyValue('--jx-elevation-effective').trim(),
      elevationShadow: cs.getPropertyValue('--jx-elevation-shadow').trim(),
      positionAnchor: /position-anchor:\s*--jx-sel-/.test(el.getAttribute('style') ?? ''),
    };
  });
  check(
    'opening the listbox PROMOTES the panel (top layer, popover-open)',
    p.open,
    String(p.open),
  );
  check(
    "the PORTALED panel is SELF-CARRIED: the elevation own level2 stamps --jx-elevation-effective: 3",
    /--jx-elevation-effective:\s*3/.test(p.style) && p.elevationVar === '3',
    `var=${p.elevationVar} · ${p.style.slice(0, 120)}`,
  );
  check(
    'the §7 consumption pair rides the panel style (the level-table indirection declared; the recipe RESOLVES)',
    /--jx-elevation-shadow:\s*var\(--jx-elevation-level2-shadow\)/.test(p.style) &&
      /--jx-elevation-surface:\s*var\(--jx-elevation-level2-surface\)/.test(p.style) &&
      p.elevationShadow !== '',
    p.elevationShadow.slice(0, 80),
  );
  check(
    'the anchor placement survives the carrier JOIN (position-anchor still on the panel)',
    p.positionAnchor,
    p.style.slice(0, 160),
  );
  // close it (Escape — the native popover path) and confirm it left the top layer
  await page.keyboard.press('Escape');
  const closed = await page
    .locator('.jx-sel-panel:popover-open')
    .count()
    .then((n) => n === 0);
  check('Escape closes the listbox (the panel leaves the top layer)', closed, String(closed));
}

// ── 4. table: a named step via the alias ladder, zero inline px ────────
{
  await page.goto(`${URL}table.html`, { waitUntil: 'networkidle' });
  const frame = page.locator('#universal-props figure').nth(1);
  const t = await frame.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      sizeLadder: cs.getPropertyValue('--jx-size-medium').trim(),
      effectiveSize: cs.getPropertyValue('--jx-size-effective').trim(),
    };
  });
  check(
    'table size="medium" stamps the §12 alias-ladder VAR (zero inline px)',
    /--jx-size-effective:\s*var\(--jx-size-medium\)/.test(t.style) &&
      !/--jx-size-effective:\s*\d/.test(t.style),
    t.style.slice(0, 130),
  );
  check(
    'the ladder var RESOLVES through the kernel sheet (concrete rung, not IACVT)',
    t.sizeLadder !== '' && t.effectiveSize === t.sizeLadder,
    `size-medium=${t.sizeLadder} → effective=${t.effectiveSize}`,
  );
}

await browser.close();
const failed = results.filter(([, ok]) => !ok);
console.log(`\nprobe: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
