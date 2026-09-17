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

/* ── law 2: the ribbon ─────────────────────────────────────────────── */

test('no players → no ribbon', () => {
  assert.equal(ribbonOf([]), null);
});

test('one player → the plain single color (today’s look)', () => {
  assert.deepEqual(ribbonOf([73]), { single: true, color: playerHueCss(73) });
  assert.equal(playerHueCss(73), 'hsl(73, 85%, 45%)');
});

test('two players split the border evenly, in the LOCAL order (self first)', () => {
  const ribbon = ribbonOf([146, 73]); // local view: self (146) first
  assert.ok(ribbon !== null && !ribbon.single);
  const image = ribbon.image;
  assert.ok(image.startsWith('linear-gradient(to bottom, '), image);
  assert.ok(image.includes(playerHueCss(146)), 'the first segment is the local self');
  assert.ok(image.includes('hsl(73, 85%, 45%)'), 'the second segment is the other player');
  assert.ok(image.includes('50.0000%'), 'two equal halves');
});

test('three players split into thirds with hard stops', () => {
  const ribbon = ribbonOf([73, 146, 219]);
  assert.ok(ribbon !== null && !ribbon.single);
  assert.ok(ribbon!.image.includes('33.3333%'), 'even thirds');
  assert.ok(ribbon!.image.includes('66.6667%'), 'even thirds (upper bound)');
});
