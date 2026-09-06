/**
 * lib/color-utils parseColor contract suite
 * (test/color-utils.spec.ts, 2026-09-06 katex-mermaid track B).
 *
 * The rgb()/rgba() extension promises: BOTH serialization families parse
 * (comma `rgb(255,0,0)` / `rgba(1,2,3,0.5)` and space/slash `rgb(1 2 3)` /
 * `rgb(1 2 3 / 0.25)` — getComputedStyle emits either depending on the
 * origin space), alpha is ACCEPTED then DISCARDED in hex output (never
 * premultiplied: rgba(255,0,0,0.5) → #ff0000), and every input funnels
 * through the one OKLCH model so rgb values round-trip against the
 * pre-existing hex parse. The mermaid-engine token pipeline's safe-hex
 * oracle also derives from this conversion (see mermaid-engine.spec.ts).
 */
import { describe, expect, it } from 'vitest';
import { formatColor, parseColor } from '$lib/color-utils';

describe('lib/color-utils parseColor — rgb()/rgba() extension', () => {
  it.each([
    ['rgb(255, 0, 0)', '#ff0000'],
    ['rgb(0,0,0)', '#000000'],
    ['rgb(1,2,3)', '#010203'],
    ['rgba(255, 0, 0, 1)', '#ff0000'],
    ['rgb(1 2 3)', '#010203'],
    ['RGB(255 0 0)', '#ff0000'],
  ])('parses the plain srgb triple %s → %s', (input, hex) => {
    expect(formatColor(parseColor(input)!, 'hex')).toBe(hex);
  });

  it.each([
    ['rgba(255, 0, 0, 0.5)', '#ff0000'],
    ['rgba(1,2,3,0)', '#010203'],
    ['rgb(1 2 3 / 0.25)', '#010203'],
    ['rgb(255 0 0 / 50%)', '#ff0000'],
    ['rgba(255, 0, 0, 0.5) ', '#ff0000'],
  ])('accepts and DISCARDS alpha (opaque model, never premultiplied): %s → %s', (input, hex) => {
    expect(formatColor(parseColor(input)!, 'hex')).toBe(hex);
  });

  it('parses per-channel percentages on the ×2.55 scale', () => {
    expect(formatColor(parseColor('rgb(100%, 0%, 0%)')!, 'hex')).toBe('#ff0000');
    expect(formatColor(parseColor('rgb(0% 50% 100%)')!, 'hex')).toBe('#0080ff');
  });

  it('rejects malformed rgb input with null (never a raw-string funnel)', () => {
    expect(parseColor('rgb(255, 0)')).toBeNull();
    expect(parseColor('rgb(a, b, c)')).toBeNull();
    expect(parseColor('rgb()')).toBeNull();
    expect(parseColor('rgb(1 2 3 / )')).toBeNull();
  });

  it('funnels rgb into the one OKLCH model — identical triples agree across families', () => {
    const comma = parseColor('rgb(217, 69, 209)');
    const space = parseColor('rgb(217 69 209)');
    const fromHex = parseColor('#d945d1');
    expect(comma).toEqual(space);
    expect(comma).toEqual(fromHex);
  });

  it('round-trips: rgb parse → oklch format → parse → same hex', () => {
    const hex = '#54b3fd';
    const first = parseColor(hex)!;
    const throughOklch = parseColor(formatColor(first, 'oklch'))!;
    expect(formatColor(throughOklch, 'hex')).toBe(formatColor(parseColor('rgb(84, 179, 253)')!, 'hex'));
    // and the family converges to the same triple the hex parse yields
    expect(formatColor(parseColor('rgb(84, 179, 253)')!, 'hex')).toBe(hex);
  });

  it('keeps the pre-existing families intact (hex/hsl/oklch prefix routing)', () => {
    expect(formatColor(parseColor('#d945d1')!, 'hex')).toBe('#d945d1');
    expect(formatColor(parseColor('hsl(330 100% 64%)')!, 'oklch')).toBe(
      formatColor(parseColor('hsl(330,100%,64%)')!, 'oklch'),
    );
    expect(formatColor(parseColor('oklch(0.6489 0.237 330)')!, 'hex')).toBe('#d945d1');
    expect(parseColor('not a color')).toBeNull();
  });
});
