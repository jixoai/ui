// W3 batch D2 spot probe (explicit-props): 16 more long-tail families
// join the eight-axis surface — a compact receipt over the batch's
// families through the dev server, PLUS the prose §13 rename.
//
// Asserts (the batch D2 spot set):
//  1. progress (a zero-hit family whose contract was declared but
//     never wired before this batch): an explicit size NUMBER stamps
//     --jx-size-effective: 18px AND the root's computed font-size
//     composes to 18px (§1: ONE number moves a family); density
//     "small" lands the legacy rung stamp data-density="sm";
//  2. the NESTING CONCENTRIC check (§3) through a batch-D2 family:
//     a ScrollArea at an explicit radius={20} SUPPLIES
//     --jx-radius-effective, and a nested Card at radius="auto"
//     (batch B's concentric consumer) COMPUTES max(0px, R − P) —
//     20px − 0.875rem = 6px through the card's own consumed form;
//  3. the prose §13 RENAME, live: `measure` is accepted as the css
//     type scale (font-size: 1.0625rem from the knob) while `size`
//     is now the universal scale axis (--jx-size-effective: 18px
//     with the computed font-size composing 18px when measure is
//     absent; the knob wins on conflict when both are set);
//  4. a NAMED step resolves via the alias ladder var, zero inline
//     px: progress radius="large" stamps
//     --jx-radius-effective: var(--jx-radius-large) and
//     size="medium" stamps --jx-size-effective: var(--jx-size-medium)
//     (§12's CSS-var indirection — a plugin remap is a var override).
//
// Run: node scripts/probe-w3d2-spot.mjs (dev server on :5225)
import { chromium } from 'playwright-core';

const URL = 'http://localhost:5225/docs/components/';

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

// ── 1. progress: the size number lane + the density rung bridge ──────
{
  await page.goto(`${URL}progress.html`, { waitUntil: 'networkidle' });
  const root = page.locator('#universal-props [data-jx-progress]').nth(0);
  const facts = await root.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      fontSize: cs.fontSize,
      density: el.getAttribute('data-density'),
    };
  });
  check(
    'progress size={18} stamps the §1 carrier verbatim (--jx-size-effective: 18px)',
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

// ── 2. scroll-area → card: the §3 nesting concentric chain ────────────
{
  await page.goto(`${URL}scroll-area.html`, { waitUntil: 'networkidle' });
  const region = page.locator('#universal-props .jx-scroll-area').nth(2);
  const g = await region.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      radiusVar: cs.getPropertyValue('--jx-radius-effective').trim(),
    };
  });
  check(
    'ScrollArea radius={20} SUPPLIES --jx-radius-effective: 20px (the concentric anchor)',
    g.radiusVar === '20px' && /--jx-radius-effective:\s*20px/.test(g.style),
    `var=${g.radiusVar} · ${g.style.slice(0, 110)}`,
  );
  const card = region.locator('[data-jx-card]').first();
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
    'the auto Card COMPUTES the concentric result through the region (20 − 14 = 6px)',
    c.radius === '6px',
    c.radius,
  );
}

// ── 3. prose: the §13 rename, live ────────────────────────────────────
{
  await page.goto(`${URL}prose.html`, { waitUntil: 'networkidle' });
  // the demo row: measure="1.0625rem" + size={18} — the knob is the
  // region's sovereign type scale (it wins on conflict), the axis
  // carrier supplies the parts below
  const knobWins = page.locator('#universal-props [data-jx-prose]').nth(0);
  const k = await knobWins.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      fontSize: cs.fontSize,
      sizeVar: cs.getPropertyValue('--jx-size-effective').trim(),
      tySize: cs.getPropertyValue('--jx-ty-size').trim(),
    };
  });
  check(
    "measure=\"1.0625rem\" is ACCEPTED (the §13 rename): the host paints the knob's font-size",
    k.fontSize === '17px' && k.style.includes('font-size:1.0625rem'),
    `${k.fontSize} · ${k.style.slice(0, 130)}`,
  );
  check(
    'the measure lane rides the historical --jx-ty-size channel (the rename moves the prop, never the shipped var)',
    k.tySize === '1.0625rem',
    k.tySize,
  );
  check(
    'size={18} on the same host stamps the §1 axis carrier (the freed name is the scale axis)',
    /--jx-size-effective:\s*18px/.test(k.style),
    k.style.slice(0, 130),
  );
  // the second demo row: measure="0.9rem" + size="medium" — the
  // axis lane is a NAMED step here (var indirection, no inline px)
  const axisRow = page.locator('#universal-props [data-jx-prose]').nth(1);
  const a = await axisRow.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      sizeLadder: cs.getPropertyValue('--jx-size-medium').trim(),
      effectiveSize: cs.getPropertyValue('--jx-size-effective').trim(),
    };
  });
  check(
    'size="medium" on prose stamps the §12 alias-ladder VAR (zero inline px)',
    /--jx-size-effective:\s*var\(--jx-size-medium\)/.test(a.style) &&
      !/--jx-size-effective:\s*\d/.test(a.style),
    a.style.slice(0, 130),
  );
  check(
    'the ladder var RESOLVES through the kernel sheet (concrete rung, not IACVT)',
    a.sizeLadder !== '' && a.effectiveSize === a.sizeLadder,
    `size-medium=${a.sizeLadder} → effective=${a.effectiveSize}`,
  );
}

// ── 4. progress named steps via the alias ladder ──────────────────────
{
  await page.goto(`${URL}progress.html`, { waitUntil: 'networkidle' });
  const named = page.locator('#universal-props [data-jx-progress]').nth(1);
  const n = await named.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      radiusLadder: cs.getPropertyValue('--jx-radius-large').trim(),
      effectiveRadius: cs.getPropertyValue('--jx-radius-effective').trim(),
    };
  });
  check(
    'radius="large" stamps the §12 alias-ladder VAR (zero inline px)',
    /--jx-radius-effective:\s*var\(--jx-radius-large\)/.test(n.style) &&
      !/--jx-radius-effective:\s*\d/.test(n.style),
    n.style.slice(0, 130),
  );
  check(
    'the radius ladder var RESOLVES through the kernel sheet (concrete rung, not IACVT)',
    n.radiusLadder !== '' && n.effectiveRadius === n.radiusLadder,
    `radius-large=${n.radiusLadder} → effective=${n.effectiveRadius}`,
  );
}

await browser.close();
const failed = results.filter(([, ok]) => !ok);
console.log(`\nprobe: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
