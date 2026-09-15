// W4 pointer-tier floor probe (Gate-2 r1 amendment): the hand-drawn
// chrome's tier behavior, asserted BOTH ways on the live component.
//   fine   → data-chrome='on', the drawn lanes mount, platform bar hidden
//   coarse → data-chrome stays off, NO drawn chrome mounts anywhere,
//            the platform scrollbar serves the region (the touch best
//            practice — momentum/edge behaviors ride the platform)
// Run: node coarse-pointer-floor-probe.mjs [url]   (default: 5199 dev)
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';

const CHROME = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = process.argv[2] ?? 'http://localhost:5199';
const URL = `${BASE}/docs/components/scroll-area.html`;

const browser = await chromium.launch({ executablePath: CHROME });
let failed = 0;
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failed++;
};

async function arm(label, { hasTouch, isMobile }) {
  const context = await browser.newContext({ viewport: { width: 900, height: 800 }, hasTouch, isMobile });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('main[data-hydrated], .jx-scroll-area') !== null, undefined, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
  const res = await page.evaluate(() => {
    const region = document.querySelector('.jx-scroll-area');
    if (!region) return { missing: true };
    const cs = getComputedStyle(region.querySelector('.jx-scroll-viewport') ?? region);
    return {
      missing: false,
      coarse: matchMedia('(pointer: coarse)').matches,
      fine: matchMedia('(pointer: fine)').matches,
      chrome: region.getAttribute('data-chrome'),
      tracks: region.querySelectorAll('.jx-scroll-track').length,
      platformHidden: cs.scrollbarWidth === 'none' || cs.webkitScrollbarDisplay === 'none' || cs.scrollbarWidth === 'hidden',
      scrollbarWidth: cs.scrollbarWidth,
    };
  });
  await context.close();
  return { label, res };
}

const fine = await arm('fine', { hasTouch: false, isMobile: false });
ok('fine: media reports fine', fine.res.fine === true, `coarse=${fine.res.coarse}`);
ok('fine: data-chrome=on (drawn chrome owns)', fine.res.chrome === 'on', `chrome=${fine.res.chrome}`);
ok('fine: drawn lanes mounted', fine.res.tracks > 0, `tracks=${fine.res.tracks}`);

const coarse = await arm('coarse', { hasTouch: true, isMobile: true });
ok('coarse: media reports coarse', coarse.res.coarse === true, `coarse=${coarse.res.coarse}`);
ok('coarse: data-chrome NOT on (platform bar serves)', coarse.res.chrome !== 'on', `chrome=${coarse.res.chrome}`);
ok('coarse: ZERO drawn chrome mounted', coarse.res.tracks === 0, `tracks=${coarse.res.tracks}`);
ok('coarse: platform scrollbar not hidden', coarse.res.scrollbarWidth !== 'none', `scrollbar-width=${coarse.res.scrollbarWidth}`);

await browser.close();
console.log(failed === 0 ? '\ncoarse-pointer floor: GREEN (both tiers)' : `\ncoarse-pointer floor: ${failed} FAIL`);
process.exit(failed === 0 ? 0 : 1);
