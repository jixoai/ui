// W3 batch D4 spot probe (explicit-props, the W3 closer): the four
// siteOnly families + the docs-infra loose files join the eight-axis
// surface — a compact receipt over the batch's families through the
// dev server, incl. the composed-Dialog palette's portal law.
//
// Asserts (the batch D4 spot set):
//  1. token-table (a siteOnly no-own readout): an explicit size
//     NUMBER stamps --jx-size-effective: 18px AND the root's computed
//     font-size composes to 18px (§1: ONE number moves a family);
//  2. the search PALETTE (the docs-infra overlay, siteOnly-mounted at
//     the root layout): ⌘K opens it — the composed Dialog's promoted
//     panel (the PORTAL root) is SELF-CARRIED: the own elevation
//     level4 stamps --jx-elevation-effective: 8 with the §7 pair
//     declared through the level-table indirection and RESOLVING
//     across the top-layer boundary; Escape closes it;
//  3. density-demo DOGFOODS the §4 axis: an explicit density="large"
//     lane visibly stamps the demo row root (data-density="lg" + the
//     coefficient carrier) while the scope boxes KEEP their own
//     per-rung stamps (explicit scope > ambient root — the fleet law
//     live inside the demo that teaches it);
//  4. a NAMED step resolves via the alias ladder var, zero inline
//     px: props-table size="medium" stamps
//     --jx-size-effective: var(--jx-size-medium) (§12's CSS-var
//     indirection — a plugin remap is a var override) and the ladder
//     var RESOLVES through the kernel sheet (concrete rung, not
//     IACVT).
//
// Run: node scripts/probe-w3d4-spot.mjs (dev server on :5227)
import { chromium } from 'playwright-core';

const URL = 'http://localhost:5227/docs/universal-props.html';

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

// ── 1. token-table: the size number lane on a siteOnly readout ──────
{
  await page.goto(URL, { waitUntil: 'networkidle' });
  const section = page.locator('#site-adoption');
  const root = await section.evaluate((node) => {
    const el = [...node.querySelectorAll('*')].find((e) =>
      (e.getAttribute('style') ?? '').includes('--jx-size-effective: 18px'),
    );
    return el ? { style: el.getAttribute('style') ?? '', fontSize: getComputedStyle(el).fontSize } : null;
  });
  check(
    'token-table size={18} stamps the §1 carrier verbatim (--jx-size-effective: 18px)',
    root !== null && /--jx-size-effective:\s*18px/.test(root.style),
    root ? root.style.slice(0, 120) : 'no stamped element found',
  );
  check(
    'the token-table root font-size COMPOSES to 18px (§1: one number moves the family)',
    root !== null && root.fontSize === '18px',
    root ? root.fontSize : '—',
  );
}

// ── 2. the search palette: the portal root is self-carried ──────────
{
  // ⌘K (Ctrl-K accepted by the same handler) opens the ONE palette
  await page.keyboard.press('Control+k');
  const dialog = page.locator('dialog[open] input[aria-label="Search the docs"] >> xpath=ancestor::dialog');
  await dialog.waitFor({ state: 'attached', timeout: 5000 });
  const p = await dialog.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      open: el.open,
      style: el.getAttribute('style') ?? '',
      elevationVar: cs.getPropertyValue('--jx-elevation-effective').trim(),
      elevationShadow: cs.getPropertyValue('--jx-elevation-shadow').trim(),
      elevationSurface: cs.getPropertyValue('--jx-elevation-surface').trim(),
    };
  });
  check(
    '⌘K opens the palette (the promoted <dialog> reaches the open state)',
    p.open,
    String(p.open),
  );
  check(
    'the PORTAL root is SELF-CARRIED: the composed Dialog’s own level4 stamps --jx-elevation-effective: 8',
    /--jx-elevation-effective:\s*8/.test(p.style) && p.elevationVar === '8',
    `var=${p.elevationVar} · ${p.style.slice(0, 120)}`,
  );
  check(
    'the §7 consumption pair rides the panel (the level-table indirection declared; the recipe RESOLVES)',
    /--jx-elevation-shadow:\s*var\(--jx-elevation-level4-shadow\)/.test(p.style) &&
      /--jx-elevation-surface:\s*var\(--jx-elevation-level4-surface\)/.test(p.style) &&
      p.elevationShadow !== '',
    p.elevationShadow.slice(0, 80),
  );
  // close it (Escape — the Dialog's cancel route) and confirm it shut
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const closed = (await page.locator('dialog[open]').count()) === 0;
  check('Escape closes the palette (the panel leaves the open state)', closed, String(closed));
}

// ── 3. density-demo: the axis dogfood ────────────────────────────────
{
  const facts = await page.evaluate(() => {
    const node = document.querySelector('#site-adoption');
    if (node === null) return null;
    // the demo ROW root is the [data-density] element that ALSO
    // carries the coefficient carrier in its style (the explicit
    // lane's stamp); the scope boxes carry their own rungs alone
    const row = [...node.querySelectorAll('[data-density]')].find((el) =>
      (el.getAttribute('style') ?? '').includes('--jx-density-coefficient'),
    );
    const scopes = row
      ? [...row.querySelectorAll('[data-density]')].map((el) => el.getAttribute('data-density'))
      : [];
    return row
      ? {
          density: row.getAttribute('data-density'),
          style: row.getAttribute('style') ?? '',
          scopes,
        }
      : null;
  });
  check(
    'density-demo DOGFOODS the §4 axis: the explicit density="large" lane stamps the demo row root (data-density="lg")',
    facts !== null && facts.density === 'lg',
    facts ? `data-density=${facts.density}` : 'no stamped row found',
  );
  check(
    'the named lane resets the coefficient to 1 (explicit rung = exact rung, §4 precedence)',
    facts !== null && /--jx-density-coefficient:\s*1/.test(facts.style),
    facts ? facts.style.slice(0, 120) : '—',
  );
  check(
    'the scope boxes KEEP their own per-rung stamps (explicit scope > ambient root)',
    facts !== null && JSON.stringify(facts.scopes) === JSON.stringify(['xs', 'sm', 'default', 'lg']),
    facts ? facts.scopes.join(',') : '—',
  );
}

// ── 4. props-table: a named step via the alias ladder, zero inline px ─
{
  const facts = await page.evaluate(() => {
    const node = document.querySelector('#site-adoption [data-jx-props-table-scroll]');
    if (node === null) return null;
    const cs = getComputedStyle(node);
    return {
      style: node.getAttribute('style') ?? '',
      sizeLadder: cs.getPropertyValue('--jx-size-medium').trim(),
      effectiveSize: cs.getPropertyValue('--jx-size-effective').trim(),
    };
  });
  check(
    'props-table size="medium" stamps the §12 alias-ladder VAR (zero inline px)',
    facts !== null &&
      /--jx-size-effective:\s*var\(--jx-size-medium\)/.test(facts.style) &&
      !/--jx-size-effective:\s*\d/.test(facts.style),
    facts ? facts.style.slice(0, 130) : 'no props-table root found',
  );
  check(
    'the ladder var RESOLVES through the kernel sheet (concrete rung, not IACVT)',
    facts !== null && facts.sizeLadder !== '' && facts.effectiveSize === facts.sizeLadder,
    facts ? `size-medium=${facts.sizeLadder} → effective=${facts.effectiveSize}` : '—',
  );
}

await browser.close();
const failed = results.filter(([, ok]) => !ok);
console.log(`\nprobe: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
