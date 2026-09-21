// W3 batch D1 spot probe (explicit-props): the LONG TAIL joins the
// eight-axis surface — a compact receipt over three of the batch's
// families through the dev server.
//
// Asserts (the batch D1 spot set):
//  1. code-card (a natural nester, SEVEN lanes — the shiki theme
//     literal owns the theme name): an explicit size NUMBER stamps
//     --jx-size-effective: 18px AND the root's computed font-size
//     composes to 18px (§1: ONE number moves a family); density
//     "small" lands the legacy rung stamp data-density="sm" (the §4
//     bridge);
//  2. the NESTING CONCENTRIC check (§3): a list-item ItemGroup at an
//     explicit radius={20} supplies --jx-radius-effective, and a row
//     at radius="auto" COMPUTES max(0px, R − P) × the §14 factor —
//     20px through the family's own item.css (the batch B card law
//     joined the list-item family this batch);
//  3. a NAMED step resolves via the alias ladder var, zero inline
//     px: code-card radius="large" stamps
//     --jx-radius-effective: var(--jx-radius-large) and
//     size="medium" stamps --jx-size-effective: var(--jx-size-medium)
//     (§12's CSS-var indirection — a plugin remap is a var override).
//
// Run: node scripts/probe-w3d1-spot.mjs (dev server on :5224)
import { chromium } from 'playwright-core';

const URL = 'http://localhost:5224/docs/components/';

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

// ── 1. code-card: the size number lane + the density rung bridge ────
{
  await page.goto(`${URL}code-card.html`, { waitUntil: 'networkidle' });
  const card = page
    .locator('#universal-props .jx-code-card')
    .nth(0);
  const facts = await card.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      fontSize: cs.fontSize,
      density: el.getAttribute('data-density'),
    };
  });
  check(
    'code-card size={18} stamps the §1 carrier verbatim (--jx-size-effective: 18px)',
    /--jx-size-effective:\s*18px/.test(facts.style),
    facts.style.slice(0, 120),
  );
  check(
    'the root font-size COMPOSES to 18px (§1: one number moves the family)',
    facts.fontSize === '18px',
    facts.fontSize,
  );
  check(
    'density="small" lands the legacy rung stamp data-density="sm" (the §4 bridge)',
    facts.density === 'sm',
    String(facts.density),
  );
}

// ── 2. list-item: the §3 nesting concentric chain ────────────────────
{
  await page.goto(`${URL}list-item.html`, { waitUntil: 'networkidle' });
  const group = page.locator('#universal-props .jx-item-group').first();
  const g = await group.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      radiusVar: cs.getPropertyValue('--jx-radius-effective').trim(),
      ownRadius: cs.borderRadius,
    };
  });
  check(
    'ItemGroup radius={20} SUPPLIES --jx-radius-effective: 20px (the concentric anchor)',
    g.radiusVar === '20px' && /--jx-radius-effective:\s*20px/.test(g.style),
    `var=${g.radiusVar} · ${g.style.slice(0, 110)}`,
  );
  check(
    'the frame composes its own corner from the explicit lane (20px)',
    g.ownRadius === '20px',
    g.ownRadius,
  );
  const row = group.locator('.jx-item').nth(1); // the radius="auto" row
  const r = await row.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      radius: cs.borderRadius,
      consumed: cs.getPropertyValue('--jx-radius-consumed').trim(),
    };
  });
  check(
    'the radius="auto" row carries the §3 concentric EXPRESSION (max(0px, R − P) × the factor)',
    /--jx-radius-consumed:\s*calc\(max\(0px,\s*calc\(var\(--jx-radius-effective,\s*0px\)\s*-\s*var\(--jx-inset-effective,\s*0px\)\)\)/.test(
      r.style,
    ),
    r.style.slice(0, 130),
  );
  check(
    'the auto row COMPUTES the concentric result through the group (20 − 0 = 20px)',
    r.radius === '20px',
    r.radius,
  );
}

// ── 3. named steps resolve via the alias ladder, zero inline px ──────
{
  await page.goto(`${URL}code-card.html`, { waitUntil: 'networkidle' });
  const named = page.locator('#universal-props .jx-code-card').nth(1);
  const n = await named.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      style: el.getAttribute('style') ?? '',
      sizeLadder: cs.getPropertyValue('--jx-size-medium').trim(),
      radiusLadder: cs.getPropertyValue('--jx-radius-large').trim(),
      effectiveRadius: cs.getPropertyValue('--jx-radius-effective').trim(),
      effectiveSize: cs.getPropertyValue('--jx-size-effective').trim(),
    };
  });
  check(
    'radius="large" stamps the §12 alias-ladder VAR (zero inline px)',
    /--jx-radius-effective:\s*var\(--jx-radius-large\)/.test(n.style) &&
      !/--jx-radius-effective:\s*\d/.test(n.style),
    n.style.slice(0, 130),
  );
  check(
    'size="medium" stamps the §12 alias-ladder VAR (zero inline px)',
    /--jx-size-effective:\s*var\(--jx-size-medium\)/.test(n.style) &&
      !/--jx-size-effective:\s*\d/.test(n.style),
    n.style.slice(0, 130),
  );
  check(
    'the ladder vars RESOLVE through the kernel sheet (concrete rungs, not IACVT)',
    n.radiusLadder !== '' && n.sizeLadder !== '' && n.effectiveRadius === n.radiusLadder,
    `size=${n.sizeLadder} · radius=${n.radiusLadder} → effective=${n.effectiveRadius}`,
  );
}

await browser.close();
const failed = results.filter(([, ok]) => !ok);
console.log(`\nprobe: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
