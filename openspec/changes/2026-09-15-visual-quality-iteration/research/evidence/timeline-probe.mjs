import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';

const CHROME = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:5199/docs/components/timeline.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

const report = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const out = {
    rootVars: {
      border: cs.getPropertyValue('--border').trim(),
      primary: cs.getPropertyValue('--primary').trim(),
      background: cs.getPropertyValue('--background').trim(),
      colorScheme: cs.colorScheme,
    },
    presets: [],
  };
  for (const el of [...document.querySelectorAll('[data-line]')]) {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const a = getComputedStyle(el, '::after');
    out.presets.push({
      line: el.getAttribute('data-line'),
      w: Math.round(r.width), h: Math.round(r.height),
      x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
      bg: s.backgroundImage.slice(0, 100),
      bgPosition: s.backgroundPosition,
      afterContent: a.content,
      afterBg: a.backgroundImage.slice(0, 80),
      afterAnim: a.animationName,
      afterSize: a.width + 'x' + a.height,
    });
  }
  return out;
});
console.log(JSON.stringify(report, null, 1));

const dashed = page.locator("[data-line='dashed']").first();
await dashed.scrollIntoViewIfNeeded();
const box = await dashed.boundingBox();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/stylex-review/line-presets-zoom.png', clip: { x: Math.max(0, box.x - 340), y: Math.max(0, box.y - 120), width: Math.min(900, 1440 - Math.max(0, box.x - 340)), height: Math.min(380, 1000 - Math.max(0, box.y - 120)) } });
console.log('crop saved');
await browser.close();
