// W3 batch A live probe (explicit-props): the input family on the real
// docs page through the dev server. Checks: (1) size=14 stamps
// --jx-size-effective:14px + font-size composition on the ROOT; (2)
// density="small" resolves the sm rung onto the root scope AND the
// child lane inherits the scoped channels; (3) the native input NEVER
// receives a size attribute; (4) native-select keeps the native size
// rows passthrough; (5) the universal props section renders on the
// page's PropsTable.
import { chromium } from 'playwright-core';

const URL = 'http://localhost:5221/docs/components/input.html';
const NS_URL = 'http://localhost:5221/docs/components/native-select.html';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const page = await browser.newPage();
const results = [];
const check = (name, ok, detail = '') => {
  results.push([name, ok, detail]);
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ' :: ' + detail : ''}`);
};

await page.goto(URL, { waitUntil: 'networkidle' });

// the universal demo's first field (name=univ-input-px)
const pxField = page.locator('input[name="univ-input-px"]');
await pxField.waitFor({ timeout: 15000 });
const fieldRoot = pxField.locator('xpath=ancestor::div[contains(@class,"jx-field")][1]');

const rootStyle = await fieldRoot.evaluate((el) => el.getAttribute('style') ?? '');
check('root inline style carries --jx-size-effective: 14px',
  /--jx-size-effective:\s*14px/.test(rootStyle), rootStyle);
check('root inline style carries the font-size composition',
  /font-size:\s*var\(--jx-size-effective,\s*1rem\)/.test(rootStyle), rootStyle);
check('root inline style carries --jx-density-coefficient: 1 (named density rung)',
  /--jx-density-coefficient:\s*1/.test(rootStyle), rootStyle);

const rootFs = await fieldRoot.evaluate((el) => getComputedStyle(el).fontSize);
check('root computed font-size is 14px', rootFs === '14px', rootFs);

const densityAttr = await fieldRoot.evaluate((el) => el.getAttribute('data-density'));
check('density="small" stamps the legacy rung data-density="sm"', densityAttr === 'sm', String(densityAttr));

// the native input: no size attribute, and it inherits the scoped
// density channels (the sm rung) — ambient flows into the child lane
const nativeFacts = await pxField.evaluate((el) => {
  const v = (name) => getComputedStyle(el).getPropertyValue(name).trim();
  return { sizeAttr: el.getAttribute('size'), text: v('--jx-text'), line: v('--jx-line') };
});
check('native input has NO size attribute', nativeFacts.sizeAttr === null, String(nativeFacts.sizeAttr));
// the named-steps demo field: root font-size 18px (size="large")
const namedField = page.locator('input[name="univ-input-named"]');
const namedRootFs = await namedField.evaluate(
  (el) => getComputedStyle(el.closest('.jx-field')).fontSize,
);
check('size="large" resolves 18px on its root', namedRootFs === '18px', namedRootFs);

// the density channel composes as a calc chain (base × rung delta ×
// coefficient) — the scope proof is the CONTRAST: the sm-scoped lane
// must differ from the lg-scoped lane next to it
const namedFacts = await namedField.evaluate((el) => {
  const v = (name) => getComputedStyle(el).getPropertyValue(name).trim();
  return { text: v('--jx-text'), line: v('--jx-line') };
});
check('child lane inherits the sm-scoped --jx-text channel (differs from lg)',
  nativeFacts.text !== namedFacts.text && nativeFacts.text.length > 0,
  `sm=${nativeFacts.text} · lg=${namedFacts.text}`);
check('child lane inherits the sm-scoped --jx-line channel (differs from lg)',
  nativeFacts.line !== namedFacts.line && nativeFacts.line.length > 0,
  `sm=${nativeFacts.line} · lg=${namedFacts.line}`);


// the universal props section on the page's API table
const section = await page.locator('[data-jx-props-table-universal]').count();
check('PropsTable renders the Universal props section', section >= 1, `count=${section}`);
const sectionRows = await page.locator('[data-jx-props-table-universal] ~ table tbody tr').count();
check('the section carries the eight axis rows', sectionRows === 8, `rows=${sectionRows}`);

// native-select: the native size passthrough (multiple rows listbox)
await page.goto(NS_URL, { waitUntil: 'networkidle' });
const rowsSelect = page.locator('#universal-props select[multiple]');
const nsUniversalSelect = page.locator('#universal-props select').first();
const nsFacts = await rowsSelect.evaluate((el) => ({
  size: el.getAttribute('size'),
}));
check('native-select multiple demo keeps native size="3"', nsFacts.size === '3', String(nsFacts.size));
const nsDensity = await nsUniversalSelect.evaluate(
  (el) => el.closest('.jx-field')?.getAttribute('data-density'),
);
check('native-select universal demo resolves density rung sm', nsDensity === 'sm', String(nsDensity));
const nsSizeAttr = await nsUniversalSelect.evaluate((el) => el.getAttribute('size'));
check('native-select (single) carries no size attr from the axis', nsSizeAttr === null, String(nsSizeAttr));

await browser.close();
const failed = results.filter(([, ok]) => !ok);
console.log(`\nprobe: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
