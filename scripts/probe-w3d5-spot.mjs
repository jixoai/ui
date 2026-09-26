// W3 batch D5 spot probe (explicit-props, the HOLE round that closes
// W3): the 13 families the batch map never listed join the eight-axis
// surface — a compact receipt over the batch's families through the
// dev server, incl. the §6 global-flip survival on theme-toggle.
//
// Asserts (the batch D5 spot set):
//  1. accordion (a first-time composite): an explicit size NUMBER
//     stamps --jx-size-effective: 18px AND the group root's computed
//     font-size composes to 18px (§1: ONE number moves a family —
//     summary + body inherit the frame's stamp; the item rides the
//     supply chain, no machinery of its own);
//  2. the CONCENTRIC nesting chain: an Accordion carrying radius={20}
//     SUPPLIES --jx-radius-effective: 20px on the group root, and the
//     nested radius="auto" Card child carries the §3 EXPRESSION
//     (max(0px, R − P) through the declaration, the receipt-authoring
//     law: assert the DECLARATION + the computed recipe, never the
//     computed value of an unregistered custom property) and COMPUTES
//     20 − 14 = 6px through the cascade;
//  3. theme-toggle STILL FLIPS THE GLOBAL THEME after its surface
//     lands (the §6 JS-mutable system lane untouched): one click
//     advances the stored mode, html.dark matches the resolved
//     scheme, and the control's OWN root carries the axis carriers
//     (--jx-size-effective: 18px) — tree-scoped paint beside the
//     global flip, never entangled;
//  4. a NAMED step resolves via the alias ladder var, zero inline px:
//     alert size="medium" stamps --jx-size-effective:
//     var(--jx-size-medium) (§12's CSS-var indirection) and the ladder
//     var RESOLVES through the kernel sheet (the concrete 16px rung).
//
// Run: node scripts/probe-w3d5-spot.mjs (dev server on :5228)
import { chromium } from 'playwright-core';

const URL = 'http://localhost:5228/docs/components/';

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

// ── 1. accordion: the size number lane on the group root ────────────
{
  await page.goto(`${URL}accordion.html`, { waitUntil: 'networkidle' });
  const section = page.locator('#universal-props');
  const group = section.locator('[data-jx-accordion-ghost], .jx-accordion').first();
  const a = await group.evaluate((el) => ({
    style: el.getAttribute('style') ?? '',
    fontSize: getComputedStyle(el).fontSize,
    density: el.getAttribute('data-density'),
  }));
  check(
    'accordion size={18} stamps the §1 carrier verbatim (--jx-size-effective: 18px)',
    /--jx-size-effective:\s*18px/.test(a.style),
    a.style.slice(0, 120),
  );
  check(
    'the group root font-size COMPOSES to 18px (§1: one number moves the set)',
    a.fontSize === '18px',
    a.fontSize,
  );
  check(
    'the density lane stamps the legacy rung on the group root (density small → sm)',
    await section.locator('.jx-accordion').nth(1).evaluate((el) => el.getAttribute('data-density')) === 'sm',
    String(
      await section.locator('.jx-accordion').nth(1).evaluate((el) => el.getAttribute('data-density')),
    ),
  );

  // ── 2. the concentric chain: radius={20} group → auto Card child ──
  const anchor = section.locator('.jx-accordion').nth(2);
  const s = await anchor.evaluate((el) => ({
    style: el.getAttribute('style') ?? '',
    radiusVar: getComputedStyle(el).getPropertyValue('--jx-radius-effective').trim(),
  }));
  check(
    'accordion radius={20} SUPPLIES --jx-radius-effective: 20px (the concentric anchor)',
    s.radiusVar === '20px' && /--jx-radius-effective:\s*20px/.test(s.style),
    `var=${s.radiusVar} · ${s.style.slice(0, 110)}`,
  );
  const card = anchor.locator('[data-jx-card]').first();
  const c = await card.evaluate((el) => ({
    style: el.getAttribute('style') ?? '',
    radius: getComputedStyle(el).borderRadius,
    consumed: getComputedStyle(el).getPropertyValue('--jx-radius-consumed').trim(),
  }));
  check(
    'the radius="auto" Card carries the §3 concentric EXPRESSION (max(0px, R − P) × the factor)',
    /--jx-radius-consumed:\s*calc\(max\(0px,\s*calc\(var\(--jx-radius-effective,\s*0px\)\s*-\s*var\(--jx-inset-effective,\s*0px\)\)\)/.test(
      c.style,
    ),
    c.style.slice(0, 130),
  );
  check(
    'the auto Card COMPUTES the concentric result through the group (20 − 14 = 6px)',
    c.radius === '6px',
    c.radius,
  );
}

// ── 3. theme-toggle: the §6 global flip survives the surface ────────
{
  await page.goto(`${URL}theme-toggle.html`, { waitUntil: 'networkidle' });
  const section = page.locator('#universal-props');
  const toggle = section.locator('[data-jx-theme-btn]').first();
  const before = await toggle.evaluate((el) => ({
    style: el.getAttribute('style') ?? '',
    stored: localStorage.getItem('theme'),
    dark: document.documentElement.classList.contains('dark'),
  }));
  check(
    'theme-toggle size={18} stamps the §1 carrier on the control root (the surface landed)',
    /--jx-size-effective:\s*18px/.test(before.style),
    before.style.slice(0, 120),
  );
  await toggle.click();
  const after = await toggle.evaluate((el) => {
    const mode = localStorage.getItem('theme');
    const dark =
      mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    return { mode, htmlDark: document.documentElement.classList.contains('dark'), expectsDark: dark };
  });
  check(
    'one click ADVANCES the stored global mode (the §6 JS-mutable lane)',
    after.mode !== before.stored && ['light', 'dark', 'system'].includes(String(after.mode)),
    `${before.stored} → ${after.mode}`,
  );
  check(
    'html.dark matches the resolved scheme after the flip (the global source, not the axis)',
    after.htmlDark === after.expectsDark,
    `html.dark=${after.htmlDark} · mode=${after.mode}`,
  );
}

// ── 4. alert: the named step via the alias ladder var ───────────────
{
  await page.goto(`${URL}alert.html`, { waitUntil: 'networkidle' });
  const section = page.locator('#universal-props');
  const alert = section.locator('[data-jx-alert]').nth(1);
  const r = await alert.evaluate((el) => ({
    style: el.getAttribute('style') ?? '',
    fontSize: getComputedStyle(el).fontSize,
  }));
  check(
    'alert size="medium" resolves through the §12 alias-ladder var (zero inline px)',
    /--jx-size-effective:\s*var\(--jx-size-medium\)/.test(r.style) && !/--jx-size-effective:\s*[\d.]+px/.test(r.style),
    r.style.slice(0, 120),
  );
  check(
    'the ladder var RESOLVES through the kernel sheet (the concrete 16px rung, not IACVT)',
    r.fontSize === '16px',
    r.fontSize,
  );
}

await browser.close();

const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) {
  console.error(`probe-w3d5-spot: ${failed.length} FAIL(S)`);
  process.exit(1);
}
