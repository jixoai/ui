/**
 * ink.test.ts — unit tests for the ported ink-baking law (icons-docs
 * ICON-3, 2026-09-02).
 *
 * Pins the LAW on hand-built fixtures (the frozen dialect's shape):
 * stroke substitution, forced vs preserved stroke-width, appended
 * attributes for stroke-less artwork, the fill='currentColor' child
 * rule, tag-scoped quote normalization, the encoding set, and the
 * INK_DERIVATIONS map. The cross-package BYTE equivalence against
 * css-laws lives in ink-equivalence.test.ts — this file is the law's
 * own semantics.
 */
import { describe, expect, it } from 'vitest';
import { INK_DERIVATIONS, bakeInkSvg, bakeInkUri } from '../../src/icons/ink.js';

/** lucide-form stroke artwork (the provider wrapper's own shape) */
const STROKE_ART =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/></svg>';

describe('bakeInkSvg — the root stroke law', () => {
  it('substitutes the root stroke with the ink (black default)', () => {
    const baked = bakeInkSvg(STROKE_ART);
    expect(baked).toContain("stroke='#000'");
    expect(baked).not.toContain('currentColor');
    expect(baked).not.toContain('stroke="#000"'); // single quotes only
  });

  it('flips to white ink on demand', () => {
    const baked = bakeInkSvg(STROKE_ART, { ink: '#fff' });
    expect(baked).toContain("stroke='#fff'");
    expect(baked).not.toContain("stroke='#000'");
  });

  it('a forced strokeWidth replaces the artwork weight', () => {
    expect(bakeInkSvg(STROKE_ART, { strokeWidth: 2.5 })).toContain("stroke-width='2.5'");
  });

  it('without a forced strokeWidth the artwork weight is preserved', () => {
    expect(bakeInkSvg(STROKE_ART)).toContain("stroke-width='2'");
    const heavy = STROKE_ART.replace('stroke-width="2"', 'stroke-width="3"');
    expect(bakeInkSvg(heavy)).toContain("stroke-width='3'");
  });

  it('stroke-less artwork GAINS a stroke, appended in the source law\'s order (stroke, then stroke-width)', () => {
    const fillArt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="currentColor"/></svg>';
    const baked = bakeInkSvg(fillArt, { strokeWidth: 2 });
    expect(baked.startsWith(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' stroke='#000' stroke-width='2'>",
    )).toBe(true);
  });

  it('stroke-* siblings are never mistaken for the stroke attribute', () => {
    const baked = bakeInkSvg(STROKE_ART, { strokeWidth: 2.5 });
    expect(baked).toContain("stroke-linecap='round'");
    expect(baked).toContain("stroke-linejoin='round'");
  });
});

describe('bakeInkSvg — the fill=currentColor child rule', () => {
  it('swaps child fill to ink and appends stroke=none before the self-close', () => {
    const dots =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/></svg>';
    expect(bakeInkSvg(dots)).toContain("<circle cx='13.5' cy='6.5' r='.5' fill='#000' stroke='none'/>");
    expect(bakeInkSvg(dots, { ink: '#fff' })).toContain("fill='#fff' stroke='none'");
  });

  it('open (non-self-closing) tags gain stroke=none before the >', () => {
    const open =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><g fill="currentColor"><path d="M0 0"/></g></svg>';
    expect(bakeInkSvg(open)).toContain("<g fill='#000' stroke='none'>");
  });

  it('leaves other fill values untouched', () => {
    const fixed =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path d="M0 0" fill="#888"/></svg>';
    expect(bakeInkSvg(fixed)).toContain("fill='#888'");
  });
});

describe('bakeInkSvg — quote normalization', () => {
  it('normalizes double-quoted attributes to single quotes inside tags only', () => {
    const baked = bakeInkSvg(STROKE_ART);
    expect(baked).toContain("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'");
    expect(baked).not.toContain('"');
  });

  it('text content is never rewritten', () => {
    const withText =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><text font-family="x">a="b"</text></svg>';
    const baked = bakeInkSvg(withText);
    expect(baked).toContain('>a="b"</text>');
  });
});

describe('bakeInkUri — the frozen encoding dialect', () => {
  it('wraps as url("data:image/svg+xml,…") encoding ONLY < > # (plus defensive %22)', () => {
    const uri = bakeInkUri(STROKE_ART, { strokeWidth: 2 });
    expect(uri.startsWith('url("data:image/svg+xml,')).toBe(true);
    expect(uri.endsWith('")')).toBe(true);
    const payload = uri.slice('url("data:image/svg+xml,'.length, -2);
    expect(payload).not.toMatch(/["#<>]/);
    expect(payload).toContain('%3Csvg');
    expect(payload).toContain("stroke='%23000'");
    // spaces, slashes, dots and commas ride literal
    expect(payload).toContain("viewBox='0 0 24 24'");
    expect(payload).toContain('http://www.w3.org/2000/svg');
  });

  it('a raw quote in TEXT CONTENT encodes as %22 (no-op on lucide bytes)', () => {
    const withText =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><text>say "hi"</text></svg>';
    const payload = bakeInkUri(withText).slice('url("data:image/svg+xml,'.length, -2);
    expect(payload).toContain('say %22hi%22');
    expect(decodeURIComponent(payload)).toBe(bakeInkSvg(withText));
  });

  it('round-trips: the payload decodes to the baked svg', () => {
    const payload = bakeInkUri(STROKE_ART).slice('url("data:image/svg+xml,'.length, -2);
    expect(decodeURIComponent(payload)).toBe(bakeInkSvg(STROKE_ART));
  });
});

describe('bakeInkSvg — failure modes', () => {
  it('throws when there is no svg root', () => {
    expect(() => bakeInkSvg('<div>not an icon</div>')).toThrowError(/no <svg> root/);
  });
});

describe('INK_DERIVATIONS — the css-laws INK_QUARTET twin', () => {
  it('maps exactly the four deriving concepts with their forced weights', () => {
    expect(INK_DERIVATIONS).toEqual({
      calendar: { vocab: 'calendar-ink', strokeWidth: 2 },
      clock: { vocab: 'clock-ink', strokeWidth: 2 },
      check: { vocab: 'valid-ink', strokeWidth: 2.5 },
      invalid: { vocab: 'invalid-ink', strokeWidth: 2.5 },
    });
  });

  it('every other concept slot derives nothing', () => {
    for (const slot of ['chevron', 'palette', 'clear', 'mail', 'search'] as const) {
      expect(INK_DERIVATIONS[slot]).toBeUndefined();
    }
  });
});
