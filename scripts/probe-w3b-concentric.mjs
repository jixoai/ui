// W3 batch B live probe (explicit-props §3): the CONCENTRIC RADIUS
// RECEIPTS on the real card docs page through the dev server.
//
// Asserts (design §3/§14, the frozen chain):
//  1. a card at explicit radius R=20 (number lane) with the ruler's
//     14px inset P, containing a press-button at radius="auto" → the
//     button STAMPS §3's expression and its computed border-radius is
//     max(0, R − P) = 6px;
//  2. the squircle ×2 law: shape="squircle" + radius 20 composes the
//     card's border-radius as 2R under the live capability verdict,
//     and the @supports ladder carries the degrade reversal var
//     (--jx-radius-factor-squircle: 1 in the not-supported branch);
//  3. the IACVT fallback: an auto button under a NON-supplying
//     ancestor computes 0px through the root sheet's invariants
//     (--jx-radius-effective/--jx-inset-effective are DEFINED at
//     :root as 0px — never an invalid-at-computed-value cascade);
//  4. a named-step radius (large) resolves through the alias ladder
//     var indirection — the stamp carries var(--jx-radius-large),
//     ZERO inline px values at use sites, and computes 10px.
//
// Run: node scripts/probe-w3b-concentric.mjs (dev server on :5222)
import { chromium } from 'playwright-core';

const URL = 'http://localhost:5222/docs/components/card.html';

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

await page.goto(URL, { waitUntil: 'networkidle' });

// the universal section's concentric demo: the cards in DOM order are
// [0] radius 20 anchor · [1] squircle 20 · [2] named large · [3] size demo
const cards = page.locator('#universal-props [data-jx-card]');
await cards.nth(0).waitFor({ timeout: 15000 });
const cardR20 = cards.nth(0);
const cardSquircle = cards.nth(1);
const cardNamed = cards.nth(2);

// ── 1. the concentric law ────────────────────────────────────────────
const cardFacts = await cardR20.evaluate((el) => {
  const cs = getComputedStyle(el);
  return {
    style: el.getAttribute('style') ?? '',
    radiusVar: cs.getPropertyValue('--jx-radius-effective').trim(),
    insetVar: cs.getPropertyValue('--jx-inset-effective').trim(),
    borderRadius: cs.borderRadius,
  };
});
check('card(20) stamps --jx-radius-effective: 20px (the §11 supply)',
  cardFacts.radiusVar === '20px', cardFacts.radiusVar);
check('card supplies --jx-inset-effective: 0.875rem (the ruler track = P)',
  cardFacts.insetVar === '0.875rem', cardFacts.insetVar);
check('card(20) own corner composes R × factor = 20px (round, factor 1)',
  cardFacts.borderRadius === '20px', cardFacts.borderRadius);
check('card(20) stamp carries NO literal px in the radius slot (§12 indirection applies to named; numbers are the exact-value lane)',
  /--jx-radius-effective:\s*20px/.test(cardFacts.style), cardFacts.style.slice(0, 160));

const autoBtn = cardR20.locator('[data-jx-press-button]').first();
const btnFacts = await autoBtn.evaluate((el) => {
  const cs = getComputedStyle(el);
  return {
    style: el.getAttribute('style') ?? '',
    borderRadius: cs.borderRadius,
    radiusVar: cs.getPropertyValue('--jx-radius-effective').trim(),
    insetVar: cs.getPropertyValue('--jx-inset-effective').trim(),
  };
});
check('auto button STAMPS the §3 concentric expression (max(0px, calc(R − P)) × the §14 factor)',
  /--jx-radius-consumed:\s*calc\(max\(0px,\s*calc\(var\(--jx-radius-effective,\s*0px\)\s*-\s*var\(--jx-inset-effective,\s*0px\)\)\)\s*\*\s*var\(--jx-radius-factor-effective,\s*1\)\)/.test(btnFacts.style),
  btnFacts.style);
check('auto button INHERITS the card supply (20px / 0.875rem)',
  btnFacts.radiusVar === '20px' && btnFacts.insetVar === '0.875rem',
  `R=${btnFacts.radiusVar} · P=${btnFacts.insetVar}`);
check('auto button computed border-radius = max(0, 20 − 14) = 6px',
  btnFacts.borderRadius === '6px', btnFacts.borderRadius);

// the explicit-lane sibling: radius 4 computes 4px (own opinion, not concentric)
const explicitBtn = cardR20.locator('[data-jx-press-button]').nth(1);
const explicitR = await explicitBtn.evaluate((el) => getComputedStyle(el).borderRadius);
check('explicit radius={4} sibling computes 4px (own lane, inset reset)',
  explicitR === '4px', explicitR);

// ── 2. the squircle ×2 law + the degrade reversal ladder ────────────
const squircleFacts = await cardSquircle.evaluate((el) => {
  const cs = getComputedStyle(el);
  return {
    style: el.getAttribute('style') ?? '',
    factor: cs.getPropertyValue('--jx-radius-factor-effective').trim(),
    radiusVar: cs.getPropertyValue('--jx-radius-effective').trim(),
    borderRadius: cs.borderRadius,
    cornerShape: cs.cornerShape,
  };
});
const supportsCorner = await page.evaluate(() => CSS.supports('corner-shape', 'bevel'));
const expectedFactor = supportsCorner ? '2' : '1';
check('squircle card resolves the per-shape factor var under the LIVE verdict',
  squircleFacts.factor === expectedFactor,
  `supports=${supportsCorner} · factor=${squircleFacts.factor}`);
check('squircle(20) supplies radius 20px but COMPOSES the corner as ×2 = 40px',
  squircleFacts.radiusVar === '20px' && squircleFacts.borderRadius === (supportsCorner ? '40px' : '20px'),
  `R=${squircleFacts.radiusVar} · corner=${squircleFacts.borderRadius}`);
check('squircle card stamps the factor through the §12 indirection (no inline 2)',
  /--jx-radius-factor-effective:\s*var\(--jx-radius-factor-squircle\)/.test(squircleFacts.style),
  squircleFacts.style);

// the degrade reversal: the sheet's @supports not-branch must define
// squircle factor 1 (static receipt of the reversal rule — the branch
// is inert under a supporting engine but present in the CSSOM)
const ladder = await page.evaluate(() => {
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (rule.constructor.name !== 'CSSSupportsRule') continue;
      if (/not\s*\(corner-shape:\s*bevel\)/.test(rule.conditionText)) {
        return rule.cssText;
      }
    }
  }
  return '';
});
check('the degrade ladder branch exists and reverses squircle to factor 1',
  ladder.includes('--jx-radius-factor-squircle:') && /--jx-radius-factor-squircle:\s*1;/.test(ladder),
  ladder ? ladder.slice(0, 120) : 'no @supports not branch found');

// ── 3. the IACVT fallback under a NON-supplying ancestor ────────────
const rootInvariants = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    radius: cs.getPropertyValue('--jx-radius-effective').trim(),
    inset: cs.getPropertyValue('--jx-inset-effective').trim(),
  };
});
check('the root sheet defines the load-bearing invariants (0px / 0px)',
  rootInvariants.radius === '0px' && rootInvariants.inset === '0px',
  `R=${rootInvariants.radius} · P=${rootInvariants.inset}`);
const bareBtn = page.locator('#universal-props [data-jx-press-button][aria-label="bare auto"]');
const bareFacts = await bareBtn.evaluate((el) => {
  const cs = getComputedStyle(el);
  return { borderRadius: cs.borderRadius, radiusVar: cs.getPropertyValue('--jx-radius-effective').trim() };
});
check('a bare auto button (no supplying ancestor) computes 0px — the fallback law, never IACVT',
  bareFacts.borderRadius === '0px' && bareFacts.radiusVar === '0px',
  `computed=${bareFacts.borderRadius} · var=${bareFacts.radiusVar}`);

// ── 4. the named-step alias ladder ──────────────────────────────────
const namedFacts = await cardNamed.evaluate((el) => {
  const cs = getComputedStyle(el);
  return {
    style: el.getAttribute('style') ?? '',
    radiusVar: cs.getPropertyValue('--jx-radius-effective').trim(),
    borderRadius: cs.borderRadius,
  };
});
check('radius="large" stamps var(--jx-radius-large) — ZERO inline values at the use site',
  /--jx-radius-effective:\s*var\(--jx-radius-large\)/.test(namedFacts.style) &&
    !/--jx-radius-effective:\s*\d/.test(namedFacts.style),
  namedFacts.style);
check('radius="large" resolves through the ladder to 10px (computed vars resolve the indirection)',
  namedFacts.radiusVar === '10px' && namedFacts.borderRadius === '10px',
  `var=${namedFacts.radiusVar} · corner=${namedFacts.borderRadius}`);

// ── 5. the press-button page: the §1/§4 carriers (batch B bonus) ────
await page.goto('http://localhost:5222/docs/components/press-button.html', { waitUntil: 'networkidle' });
const pxBtn = page.locator('#universal-props [data-jx-press-button]').first();
await pxBtn.waitFor({ timeout: 15000 });
const pbFacts = await pxBtn.evaluate((el) => {
  const cs = getComputedStyle(el);
  return {
    style: el.getAttribute('style') ?? '',
    fontSize: cs.fontSize,
    density: el.getAttribute('data-density'),
    radiusVar: cs.getPropertyValue('--jx-radius-effective').trim(),
    corner: cs.borderRadius,
  };
});
check('press-button size={14} stamps --jx-size-effective: 14px + the font-size composition',
  /--jx-size-effective:\s*14px/.test(pbFacts.style) && pbFacts.fontSize === '14px',
  `${pbFacts.style.slice(0, 120)} · fs=${pbFacts.fontSize}`);
check('press-button density="small" stamps the legacy rung data-density="sm"',
  pbFacts.density === 'sm', String(pbFacts.density));

await browser.close();
const failed = results.filter(([, ok]) => !ok);
console.log(`\nprobe: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
