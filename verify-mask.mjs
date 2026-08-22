// Mask-cut notch verification: geometry + seamless pixels.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = '/tmp/tooltip-mask';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://127.0.0.1:5199/components/tooltip.html', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);

async function openTip(label, opts = {}) {
  await page.getByRole('button', { name: label, exact: !label.includes('·') }).click(opts);
  await page.waitForTimeout(450);
  const open = await page.evaluate(() =>
    [...document.querySelectorAll('[role="tooltip"]')].some((p) => p.matches(':popover-open')),
  );
  if (!open) {
    await page.evaluate((l) => {
      const btn = [...document.querySelectorAll('button')].find((b) =>
        b.textContent.trim().startsWith(l.split(' ·')[0]),
      );
      btn.closest('.jx-tip-anchor').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    }, label);
    await page.waitForTimeout(250);
  }
}
const measure = (name) =>
  page.evaluate((n) => {
    const open = [...document.querySelectorAll('[role="tooltip"]')].find((p) =>
      p.matches(':popover-open'),
    );
    if (!open) return { error: 'no open panel' };
    const body = open.querySelector('.jx-tip-body');
    const cs = getComputedStyle(body);
    const anchor = document.querySelector(`[aria-describedby="${open.id}"]`);
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, width: b.width, height: b.height, cx: b.x + b.width / 2, cy: b.y + b.height / 2 };
    };
    return {
      case: n, body: r(body), anchor: r(anchor), side: open.dataset.side,
      mask: cs.maskImage.slice(0, 60), paddingBlock: cs.paddingBlock, border: cs.borderTopWidth,
    };
  }, name);

const checks = [];
const check = (name, ok, detail = '') => checks.push({ name, ok, detail });

// 1. top-center
await openTip('arrow');
let m = await measure('1');
// apex = body bottom edge center at aim x: apex x = body.x + x; from mask we can't read x —
// derive expected from side: tab apex y = body.y + body.height (side bottom)
check('top: side=bottom', m.side === 'bottom', m.side);
check('top: reserved strip (padding-block 14px)', m.paddingBlock === '14px', m.paddingBlock);
check('top: border handed to the ring layer', m.border === '0px', m.border);
check('top: mask authored', m.mask.includes('data:image/svg+xml'), m.mask.slice(0, 40));
// aim: parse x from the --jx-tip-shape var (L{x},{h} apex command)
const shapeVar = await page.evaluate(() => {
  const open = [...document.querySelectorAll('[role="tooltip"]')].find((p) => p.matches(':popover-open'));
  return open.style.getPropertyValue('--jx-tip-shape');
});
await page.screenshot({ path: `${OUT}/1.png`, clip: { x: m.body.x - 30, y: m.body.y - 10, width: m.body.width + 60, height: m.body.height + 60 } });
const apexX = Number(/H[\d.]+L([\d.]+)/.exec(decodeURIComponent(shapeVar))?.[1] ?? -1);
const expectX = m.anchor.cx - m.body.x;
check('top: tab apex x ≈ anchor center-x', Math.abs(apexX - expectX) < 2, `apex=${apexX} expected≈${expectX.toFixed(1)}`);
check('top: apex at the body edge nearest the anchor', m.body.y + m.body.height <= m.anchor.y + 2, `apexY=${(m.body.y + m.body.height).toFixed(1)} anchorTop=${m.anchor.y.toFixed(1)}`);
await page.keyboard.press('Escape');
await page.waitForTimeout(250);

// 2. bottom-end
await openTip('arrow · bottom-end');
m = await measure('2');
check('bottom-end: side=top', m.side === 'top', m.side);
await page.screenshot({ path: `${OUT}/2.png`, clip: { x: m.body.x - 30, y: m.anchor.y - 10, width: m.body.width + 60, height: m.body.height + 80 } });
await page.keyboard.press('Escape');
await page.waitForTimeout(250);

// 3. top-start
await openTip('arrow · top-start');
m = await measure('3');
await page.screenshot({ path: `${OUT}/3.png`, clip: { x: m.body.x - 30, y: m.body.y - 10, width: m.body.width + 60, height: m.body.height + 60 } });
check('top-start: side=bottom', m.side === 'bottom', m.side);
await page.keyboard.press('Escape');
await page.waitForTimeout(250);

// 4. seamlessness pixels: zoom across the tab (top-center)
await openTip('arrow');
m = await measure('4');
await page.screenshot({ path: `${OUT}/4-seam.png`, clip: { x: m.anchor.cx - 24, y: m.body.y + m.body.height - 26, width: 48, height: m.body.height + 20 - (m.body.height - 26) + 20 } });
await page.keyboard.press('Escape');

await browser.close();
const failed = checks.filter((c) => !c.ok);
console.log(JSON.stringify(checks, null, 2));
console.log(failed.length ? `FAIL: ${failed.length}` : 'GEOMETRY OK — inspect seam pixels');
