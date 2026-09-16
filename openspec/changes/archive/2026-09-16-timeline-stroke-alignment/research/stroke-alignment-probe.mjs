// The STROKE-ALIGNMENT probe (Owner r5): the structural spine strokes
// and the dot's border are ONE weight through the shared token
// --jx-tl-stroke-w, caps are BUTT, the beam keeps its glow-grammar
// exemption, and the ring dot keeps its 2px variant identity.
// Asserted on the live docs page across a plain host (with a progress
// stroke), a dashed host, a beam host, and the ring playground host.
// Run: node <this file> (dev server on 5199). The joint-continuity
// raster law stays owned by the archived r4 probe (rerun green under
// the new caps — see the change receipts).
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';

const CHROME = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: CHROME });
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};
const px = (v) => parseFloat(v) || 0;

const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://localhost:5199/docs/components/timeline.html', { waitUntil: 'load' });
await page.waitForTimeout(3000);

const audit = await page.evaluate(() => {
  const hosts = [...document.querySelectorAll('[data-jx-tl-host]')];
  const describe = (host) => {
    const cs = (el) => getComputedStyle(el);
    const base = host.querySelector('[data-jx-tl-base]');
    const seg = host.querySelector('[data-jx-tl-seg]');
    const beam = host.querySelector('[data-jx-tl-beam]');
    const progress = host.querySelector('[data-jx-tl-progress]');
    const dots = [...host.querySelectorAll('[data-jx-tl-dot]')];
    const defaultDot = dots.find((d) => d.getAttribute('data-variant') !== 'ring');
    const ringDot = dots.find((d) => d.getAttribute('data-variant') === 'ring');
    return {
      token: cs(host).getPropertyValue('--jx-tl-stroke-w').trim(),
      base: base ? { w: cs(base).strokeWidth, cap: cs(base).strokeLinecap } : null,
      seg: seg ? { w: cs(seg).strokeWidth, cap: cs(seg).strokeLinecap } : null,
      beam: beam ? { w: cs(beam).strokeWidth, cap: cs(beam).strokeLinecap } : null,
      progress: progress ? { w: cs(progress).strokeWidth, cap: cs(progress).strokeLinecap } : null,
      dotBorder: defaultDot ? cs(defaultDot).borderTopWidth : null,
      ringBorder: ringDot ? cs(ringDot).borderTopWidth : null,
    };
  };
  // one host per shape: a plain host with a progress stroke (the
  // leading-labels stage), a dashed host, a beam host, the ring host
  const stage = document.querySelector('[data-jx-canvas-stage][aria-label*="horizontal leading labels"] [data-jx-tl-host]');
  const plain = stage ? describe(stage) : null;
  const dashedHost = hosts.find((h) => h.querySelector('[data-jx-tl-seg]'));
  const dashed = dashedHost ? describe(dashedHost) : null;
  const beamHost = hosts.find((h) => h.querySelector('[data-jx-tl-beam]'));
  const beam = beamHost ? describe(beamHost) : null;
  const ringHost = document.querySelector("[data-jx-tl-dot][data-variant='ring']")?.closest('[data-jx-tl-host]');
  const ring = ringHost ? describe(ringHost) : null;
  return { plain, dashed, beam, ring };
});

// 1. the token exists and the pair can never drift: the host's
//    STRUCTURAL stroke (base, or the dashed preset's segs — dashed
//    renders no base path by design) === the default dot's
//    border-width === the token
const hosts = ['plain', 'dashed', 'ring'].filter((k) => audit[k]);
let pairOk = hosts.length > 0, pairDetail = [];
for (const k of hosts) {
  const a = audit[k];
  const structural = a.base ?? a.seg;
  const ok = structural && a.dotBorder && px(structural.w) === px(a.dotBorder) && a.token === '1px' && px(a.dotBorder) === 1;
  if (!ok) { pairOk = false; pairDetail.push(`${k}: stroke ${structural?.w} vs dot ${a.dotBorder}, token '${a.token}'`); }
}
check('the stroke-alignment pair: structural stroke-width === dot border-width === --jx-tl-stroke-w (1px)', pairOk,
  pairDetail.join('; ') || hosts.map((k) => `${k}: ${(audit[k].base ?? audit[k].seg).w}/${audit[k].dotBorder}`).join(', '));

// 2. butt caps on every structural stroke (base, dashed segs, progress)
let capOk = true, capDetail = [];
for (const k of hosts) {
  const a = audit[k];
  for (const [name, stroke] of [['base', a.base], ['seg', a.seg], ['progress', a.progress]]) {
    if (stroke && stroke.cap !== 'butt') { capOk = false; capDetail.push(`${k}.${name}: ${stroke.cap}`); }
    if (stroke && px(stroke.w) !== 1) { capOk = false; capDetail.push(`${k}.${name} w: ${stroke.w}`); }
  }
}
check('structural strokes: stroke-linecap butt + token width (base, dashed, progress)', capOk,
  capDetail.join('; ') || 'all butt @ 1px');

// 3. the beam exemption: a light, not a connector — glow grammar kept
const beamOk = audit.beam && audit.beam.beam && audit.beam.beam.cap === 'round' && px(audit.beam.beam.w) === 4;
check('the beam keeps its glow grammar (round caps, 4px — the standing exemption)', !!beamOk,
  audit.beam?.beam ? `cap=${audit.beam.beam.cap}, w=${audit.beam.beam.w}` : 'no beam host found');

// 4. the ring dot's variant identity: 2px border kept
const ringOk = audit.ring && audit.ring.ringBorder && px(audit.ring.ringBorder) === 2;
check("the ring dot keeps its 2px variant identity (identity outranks the shared token)", !!ringOk,
  audit.ring?.ringBorder ? `ring border ${audit.ring.ringBorder}` : 'no ring dot found');

await page.close();
await browser.close();
const fails = results.filter((x) => !x.ok);
console.log(fails.length === 0 ? `\n✓ ALL GREEN — ${results.length} checks` : `\n✗ ${fails.length} FAILED of ${results.length}`);
process.exit(fails.length === 0 ? 0 : 1);
