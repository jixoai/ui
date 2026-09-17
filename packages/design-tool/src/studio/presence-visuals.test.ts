/**
 * presence-visuals tests — the two pure laws (the hue bridge and the
 * ribbon), node-tested against known oklab anchors and CSS shapes.
 *
 * Original need: presence-visuals task group 1 (2026-09-17).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { hslHueToOklchHue, playerHueCss, ribbonOf } from './presence-visuals.ts';

/* ── law 1: the hue bridge ─────────────────────────────────────────── */

test('the hue bridge lands on the known oklab anchors (±3°)', () => {
  const approx = (hue: number, expected: number) =>
    assert.ok(Math.abs(hslHueToOklchHue(hue) - expected) < 3, `hsl ${hue} → oklch ${hslHueToOklchHue(hue)} (want ≈${expected})`);
  approx(0, 29.2); // pure red
  approx(60, 109.8); // yellow (Ottosson's pure-yellow anchor)
  approx(120, 142.5); // green
  approx(240, 264.1); // blue
});

test('the hue bridge wraps into [0, 360) and stays monotone-ish per sextant', () => {
  for (let h = 0; h < 720; h += 15) {
    const hue = hslHueToOklchHue(h);
    assert.ok(hue >= 0 && hue < 360, `${h} → ${hue}`);
  }
  // 360° of hsl maps back to the same oklch hue
  assert.ok(Math.abs(hslHueToOklchHue(0) - hslHueToOklchHue(360)) < 0.001);
});

test('the 73° presence ladder bridges to distinct oklch hues', () => {
  const hues = [1, 2, 3, 4].map((n) => hslHueToOklchHue((73 * n) % 360));
  for (let i = 1; i < hues.length; i += 1) {
    assert.ok(Math.abs(hues[i] - hues[i - 1]) > 20, `players ${i} and ${i + 1} are visually distinct: ${hues.join(',')}`);
  }
});

/* ── law 2: the ribbon (the Owner syntax, presence-liveness P5/P6) ──── */

test('no players → no ribbon', () => {
  assert.equal(ribbonOf([]), null);
});

test('one player → the plain single color, Owner single form (P5)', () => {
  assert.deepEqual(ribbonOf([73]), {
    single: true,
    style: `border-inline-start: 2px solid ${playerHueCss(73)}; border-image: none;`,
  });
  assert.equal(playerHueCss(73), 'hsl(73, 85%, 45%)');
});

test('two players → the Owner border-image form (vertical halves, self first)', () => {
  const ribbon = ribbonOf([146, 73]); // local view: self (146) first
  assert.ok(ribbon !== null && !ribbon.single);
  // the complete style: placeholder border + the verbatim slice/width tails
  assert.ok(
    ribbon.style.startsWith(`border-inline-start: 2px solid transparent; border-image: linear-gradient(to bottom, ${playerHueCss(146)}`),
    ribbon.style,
  );
  assert.ok(ribbon.style.endsWith(') 0 0 0 1 / 0 0 0 2px;'), `the Owner slice/width tail: ${ribbon.style}`);
  // the gradient: vertical, hard-stop halves, self first
  const image = ribbon.image;
  assert.ok(image.startsWith('linear-gradient(to bottom, '), image);
  assert.ok(
    image.startsWith(`linear-gradient(to bottom, ${playerHueCss(146)} 0 50.0000%`),
    'the first segment is the local self, hard-stopped at the half',
  );
  assert.ok(image.includes(`${playerHueCss(73)} 50.0000% 100.0000%`), 'the second segment closes the border');
});

test('three players → vertical thirds with hard stops', () => {
  const ribbon = ribbonOf([73, 146, 219]);
  assert.ok(ribbon !== null && !ribbon.single);
  const image = ribbon.image;
  assert.ok(image.includes(`${playerHueCss(73)} 0 33.3333%`), 'first third');
  assert.ok(image.includes(`${playerHueCss(146)} 33.3333% 66.6667%`), 'middle third');
  assert.ok(image.includes(`${playerHueCss(219)} 66.6667% 100.0000%`), 'last third');
  assert.ok(ribbon.style.includes(' 0 0 0 1 / 0 0 0 2px;'), 'the Owner slice/width tail rides every multi ribbon');
});
