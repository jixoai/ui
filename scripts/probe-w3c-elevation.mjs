// W3 batch C live probe (explicit-props §7): the ELEVATION ×
// SURFACE-LADDER PAIRING RECEIPTS on the real dialog docs page
// through the dev server.
//
// Asserts (design §7, the frozen level table + the surface ladder):
//  1. a dialog at its OWN level (level4, the modal rung): the
//     surface body's computed box-shadow composes the W1 table's
//     recipe AND its background resolves the PAIRED ladder rung —
//     not a tint overlay — light theme;
//  2. explicit elevation="level3" and the NUMBER lane ({6}dp, which
//     snaps to level3's rung) flip BOTH the shadow and the surface;
//  3. dark theme (the .dark class scope): the surface rung STEPS
//     (hierarchy carried by the surface color), with NO tint or
//     color-mix overlay in the composition path;
//  4. level-1 (the Owner's concave rung): the INSET shadow + the
//     deepest surface rung;
//  5. the axis stamps ride the PORTAL ROOT (the top-layered dialog
//     is self-carried), and a nested radius="auto" child inside the
//     portal still resolves batch B's §3 concentric law from the
//     overlay's own stamps (max(0px, 20 − 14) = 6px).
//
// Run: node scripts/probe-w3c-elevation.mjs (dev server on :5223)
import { chromium } from 'playwright-core';

const URL = 'http://localhost:5223/docs/components/dialog.html';

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

// the ladder of demo dialogs, opened by their buttons in DOM order:
// [0] level4 default · [1] level3 · [2] 6dp · [3] level-1 ·
// [4] radius 20 · [5] dark
// (el.click() through evaluate: the canvas's controls dock overlays
// the stage — hit-tested clicks would fight it, the DOM path is the
// same user gesture as far as the component is concerned)
const openNth = async (n) => {
  const buttons = page.locator('#universal-props [data-jx-press-button]');
  await buttons.nth(n).evaluate((el) => el.click());
  const dlg = page.locator('dialog.jx-dialog[open]');
  await dlg.waitFor({ timeout: 10000 });
  return dlg;
};

// ── 1. the OWN level (level4): the paired recipe + rung, light ──────
{
  const dlg = await openNth(0);
  const facts = await dlg.evaluate((el) => {
    const body = el.querySelector('.jx-surface-body');
    const csBody = getComputedStyle(body);
    return {
      rootStyle: el.getAttribute('style') ?? '',
      shadow: csBody.boxShadow,
      bg: csBody.backgroundColor,
      shadowVar: csBody.getPropertyValue('--jx-elevation-shadow').trim(),
      surfaceVar: csBody.getPropertyValue('--jx-elevation-surface').trim(),
      effectiveVar: csBody.getPropertyValue('--jx-elevation-effective').trim(),
    };
  });
  check('the own level4 stamps the §11 dp carrier on the PORTAL ROOT (--jx-elevation-effective: 8)',
    /--jx-elevation-effective:\s*8/.test(facts.rootStyle) && facts.effectiveVar === '8',
    facts.rootStyle.slice(0, 140));
  check('the consumption pair rides the §12 indirection (level-1..5 var refs, zero inline recipes)',
    /--jx-elevation-shadow:\s*var\(--jx-elevation-level4-shadow\)/.test(facts.rootStyle) &&
      /--jx-elevation-surface:\s*var\(--jx-elevation-level4-surface\)/.test(facts.rootStyle),
    facts.rootStyle.slice(0, 200));
  check('level4 computed box-shadow composes the W1 table recipe (0 2px 3px / 0 6px 10px 4px, black ink)',
    facts.shadow.includes('rgba(0, 0, 0, 0.3)') && facts.shadow.includes('rgba(0, 0, 0, 0.15)') &&
      facts.shadow.includes('2px 3px') && facts.shadow.includes('6px 10px 4px'),
    facts.shadow);
  check('level4 surface background resolves the PAIRED rung (surface-container-high, oklch(0.92 0 0)) — a role step, not a tint',
    facts.bg === 'oklch(0.92 0 0)',
    facts.bg);
  await page.keyboard.press('Escape');
}

// ── 2. the explicit + number lanes step BOTH channels ───────────────
{
  const dlg = await openNth(1);
  const l3 = await dlg.evaluate((el) => {
    const cs = getComputedStyle(el.querySelector('.jx-surface-body'));
    return { shadow: cs.boxShadow, bg: cs.backgroundColor, style: el.getAttribute('style') ?? '' };
  });
  check('elevation="level3" flips the shadow to the level3 recipe (0 1px 3px / 0 4px 8px 3px)',
    l3.shadow.includes('rgba(0, 0, 0, 0.3)') && l3.shadow.includes('rgba(0, 0, 0, 0.15)') &&
      l3.shadow.includes('1px 3px') && l3.shadow.includes('4px 8px 3px') && !l3.shadow.includes('6px 10px'),
    l3.shadow);
  check('elevation="level3" steps the surface rung (surface-container, oklch(0.94 0 0))',
    l3.bg === 'oklch(0.94 0 0)', l3.bg);
  await page.keyboard.press('Escape');

  const dlg6 = await openNth(2);
  const dp6 = await dlg6.evaluate((el) => {
    const cs = getComputedStyle(el.querySelector('.jx-surface-body'));
    return { shadow: cs.boxShadow, bg: cs.backgroundColor, style: el.getAttribute('style') ?? '' };
  });
  check('the NUMBER lane {6} stamps dp 6 verbatim on the root carrier',
    /--jx-elevation-effective:\s*6(?!\d)/.test(dp6.style), dp6.style.slice(0, 140));
  check('the NUMBER lane {6} snaps DOWN to the enclosing rung — BOTH channels land level3 exactly',
    dp6.shadow === l3.shadow && dp6.bg === l3.bg,
    `bg=${dp6.bg}`);
  await page.keyboard.press('Escape');
}

// ── 3. dark: the STEPS carry the hierarchy, no tint overlay ─────────
{
  const dlg = await openNth(5);
  const dark = await dlg.evaluate((el) => {
    const cs = getComputedStyle(el.querySelector('.jx-surface-body'));
    return {
      shadow: cs.boxShadow,
      bg: cs.backgroundColor,
      bgImage: cs.backgroundImage,
      rootClass: el.className,
      surfaceVar: cs.getPropertyValue('--jx-elevation-level4-surface').trim(),
    };
  });
  check('the theme axis flips the .dark class scope on the portal root',
    /\bdark\b/.test(dark.rootClass), dark.rootClass);
  check('dark level4: the surface rung STEPS to the dark ladder (oklch(0.245 0 0) — surface-container-high dark, M3 dark law)',
    dark.bg === 'oklch(0.245 0 0)', dark.bg);
  check('dark surface is a ROLE STEP — no tint / color-mix overlay in the composition path',
    dark.bgImage === 'none' && !dark.bg.includes('color-mix') && !dark.shadow.includes('color-mix'),
    `img=${dark.bgImage}`);
  check('dark keeps the paired geometry with the white ink (0.16/0.08 alphas, pinned rung for rung)',
    dark.shadow.includes('rgba(255, 255, 255, 0.16)') && dark.shadow.includes('rgba(255, 255, 255, 0.08)'),
    dark.shadow);
  await page.keyboard.press('Escape');
}

// ── 4. level-1: the concave rung ────────────────────────────────────
{
  const dlg = await openNth(3);
  const concave = await dlg.evaluate((el) => {
    const cs = getComputedStyle(el.querySelector('.jx-surface-body'));
    const rootCs = getComputedStyle(el);
    return {
      shadow: cs.boxShadow,
      bg: cs.backgroundColor,
      concaveRung: rootCs.getPropertyValue('--surface-concave').trim(),
      style: el.getAttribute('style') ?? '',
    };
  });
  check('level-1 composes the INSET shadow (the concave duet, 1px)',
    concave.shadow.includes('inset') && concave.shadow.includes('rgba(0, 0, 0, 0.12)'),
    concave.shadow);
  check('level-1 resolves the DEEPEST rung (--surface-concave → the page void itself)',
    /--jx-elevation-surface:\s*var\(--jx-elevation-level-1-surface\)/.test(concave.style) &&
      concave.concaveRung !== '' && concave.bg === 'oklch(1 0 0)',
    `rung=${concave.concaveRung} · bg=${concave.bg}`);
  await page.keyboard.press('Escape');
}

// ── 5. the PORTAL ROOT is self-carried + the concentric law lives ───
{
  const dlg = await openNth(4);
  const facts = await dlg.evaluate((el) => {
    const cs = getComputedStyle(el);
    // the BODY cell's demo button — NOT the head band's × close
    // (an IconButton: ambient-resolved at the dialog's lane 20; the
    // explicit-branch 20px it computes is its own correct outcome)
    const btn = el.querySelector('[data-jx-card-body] [data-jx-press-button]');
    const btnCs = btn ? getComputedStyle(btn) : null;
    return {
      // the top-layered dialog's own carrier set (self-carried across
      // the promotion — the trigger ancestor's stamps never span it)
      radiusVar: cs.getPropertyValue('--jx-radius-effective').trim(),
      elevationVar: cs.getPropertyValue('--jx-elevation-effective').trim(),
      sizeVar: cs.getPropertyValue('--jx-size-effective').trim(),
      ownRadius: cs.borderRadius,
      btnRadius: btnCs ? btnCs.borderRadius : 'n/a',
      btnStyle: btn?.getAttribute('style') ?? '',
    };
  });
  check('the PORTAL ROOT carries its own stamps (radius 20 + the elevation dp) — self-carried across the top layer',
    facts.radiusVar === '20px' && facts.elevationVar === '8',
    `R=${facts.radiusVar} · z=${facts.elevationVar} · size=${facts.sizeVar}`);
  check('the dialog composes its own corner from the explicit lane (radiusConsumed × factor = 20px)',
    facts.ownRadius === '20px', facts.ownRadius);
  check('a nested radius="auto" child INSIDE the portal resolves batch B concentric law from the overlay own stamps (20 − 14 = 6px)',
    facts.btnRadius === '6px' &&
      /--jx-radius-consumed:\s*calc\(max\(0px,\s*calc\(var\(--jx-radius-effective,\s*0px\)\s*-\s*var\(--jx-inset-effective,\s*0px\)\)\)/.test(facts.btnStyle),
    `btn=${facts.btnRadius}`);
  await page.keyboard.press('Escape');
}

await browser.close();
const failed = results.filter(([, ok]) => !ok);
console.log(`\nprobe: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
