import { afterEach, describe, expect, it, vi } from 'vitest';
import { serializeAllSlots, serializeIcon } from '../../src/icons/serializer.js';
import { createSafetyChecker } from '../../src/icons/safety.js';
import { SLOT_NAMES } from '../../src/icons/types.js';
import type { IconSlot, SvgAsset } from '../../src/icons/types.js';

const CALENDAR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
  'fill="none" stroke="currentColor" stroke-width="2">' +
  '<path d="M8 2v4M16 2v4M3 10h18"/>' +
  '</svg>';

const SCRIPT_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';

function makeAsset(svg: string, overrides: Partial<SvgAsset> = {}): SvgAsset {
  return {
    svg,
    viewBox: { width: 24, height: 24 },
    nature: 'stroke',
    source: { kind: 'inline' },
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('serializeIcon — css-var mode', () => {
  it('returns a url("data:image/svg+xml,…") custom property value', () => {
    const value = serializeIcon(makeAsset(CALENDAR_SVG));
    expect(value).toMatch(/^url\("data:image\/svg\+xml,[^"]*"\)$/);
    expect(value?.startsWith('url("')).toBe(true);
    expect(value?.endsWith('")')).toBe(true);
  });

  it('round-trips: the encoded payload decodes to the original SVG', () => {
    const value = serializeIcon(makeAsset(CALENDAR_SVG));
    const payload = value?.slice('url("data:image/svg+xml,'.length, -2);
    expect(payload).toBeDefined();
    expect(decodeURIComponent(payload ?? '')).toBe(CALENDAR_SVG);
  });

  it('URI-encodes characters that break data URIs and CSS strings', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg">#"<>&</svg>';
    const value = serializeIcon(makeAsset(svg));
    if (value === null) throw new Error('expected a serialized value');
    const payload = value.slice('url("data:image/svg+xml,'.length, -2);
    // no raw quotes / fragment / tags inside the payload
    expect(payload).not.toMatch(/["#<>]/);
    expect(decodeURIComponent(payload)).toBe(svg);
  });

  it('is the default mode', () => {
    const asset = makeAsset(CALENDAR_SVG);
    expect(serializeIcon(asset)).toBe(serializeIcon(asset, 'css-var'));
  });
});

describe('serializeIcon — dom-string mode', () => {
  it('returns the SVG string itself (for {@html} injection)', () => {
    const value = serializeIcon(makeAsset(CALENDAR_SVG), 'dom-string');
    expect(value).toBe(CALENDAR_SVG);
  });
});

describe('serializeIcon — unchecked mode (no checker)', () => {
  it('serializes without validation when no checker is provided', () => {
    const asset = makeAsset(SCRIPT_SVG);
    expect(serializeIcon(asset, 'css-var')).toMatch(/^url\("data:image\/svg\+xml,/);
    expect(serializeIcon(asset, 'dom-string')).toBe(SCRIPT_SVG);
  });
});

describe('serializeIcon — validation with a checker', () => {
  it('serializes normally when the check passes', () => {
    const checker = createSafetyChecker({ mode: 'error' });
    expect(serializeIcon(makeAsset(CALENDAR_SVG), 'css-var', checker)).toMatch(
      /^url\("data:image\/svg\+xml,/,
    );
    expect(serializeIcon(makeAsset(CALENDAR_SVG), 'dom-string', checker)).toBe(
      CALENDAR_SVG,
    );
  });

  it('warn-mode failure logs a warning and returns null (rejected, not passed through)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const checker = createSafetyChecker({ mode: 'warn' });
    const asset = makeAsset(SCRIPT_SVG);

    expect(serializeIcon(asset, 'css-var', checker)).toBeNull();
    expect(serializeIcon(asset, 'dom-string', checker)).toBeNull();
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain('rejected');
    expect(String(warn.mock.calls[0]?.[0])).toContain('disallowed element <script>');
  });

  it('error-mode failure throws in both modes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const checker = createSafetyChecker({ mode: 'error' });
    const asset = makeAsset(SCRIPT_SVG);

    expect(() => serializeIcon(asset, 'css-var', checker)).toThrowError(
      /safety check failed/,
    );
    expect(() => serializeIcon(asset, 'dom-string', checker)).toThrowError(
      /disallowed element <script>/,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('includes the source label in warnings and errors', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const warnChecker = createSafetyChecker({ mode: 'warn' });
    serializeIcon(
      makeAsset(SCRIPT_SVG, { source: { kind: 'file', path: 'icons/x.svg' } }),
      'css-var',
      warnChecker,
    );
    expect(String(warn.mock.calls[0]?.[0])).toContain('file icons/x.svg');

    const errorChecker = createSafetyChecker({ mode: 'error' });
    expect(() =>
      serializeIcon(
        makeAsset(SCRIPT_SVG, { source: { kind: 'font-glyph', codepoint: 0xd7 } }),
        'css-var',
        errorChecker,
      ),
    ).toThrowError(/font-glyph U\+00D7/);
  });
});

describe('serializeAllSlots — walks the SLOT_REGISTRY', () => {
  it('serializes only the slots the lookup serves', () => {
    const provider = (slot: IconSlot) =>
      slot === 'calendar' ? makeAsset(CALENDAR_SVG) : null;
    const result = serializeAllSlots(provider);
    expect(Object.keys(result).sort()).toEqual(['calendar']);
    expect(result.calendar).toBe(serializeIcon(makeAsset(CALENDAR_SVG)));
  });

  it('covers every registered slot when the lookup serves all of them', () => {
    const provider = () => makeAsset(CALENDAR_SVG);
    const result = serializeAllSlots(provider);
    expect(Object.keys(result).sort()).toEqual([...SLOT_NAMES].sort());
  });

  it('omits warn-mode-rejected slots (the inline fallback serves instead)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const checker = createSafetyChecker({ mode: 'warn' });
    const provider = (slot: IconSlot) =>
      slot === 'calendar' ? makeAsset(SCRIPT_SVG) : makeAsset(CALENDAR_SVG);
    const result = serializeAllSlots(provider, 'css-var', checker);

    expect(result.calendar).toBeUndefined();
    expect(Object.keys(result).sort()).toEqual(
      SLOT_NAMES.filter((slot) => slot !== 'calendar').sort(),
    );
  });

  it('propagates error-mode failures (the build must fail)', () => {
    const checker = createSafetyChecker({ mode: 'error' });
    const provider = () => makeAsset(SCRIPT_SVG);
    expect(() => serializeAllSlots(provider, 'css-var', checker)).toThrowError(
      /safety check failed/,
    );
  });
});
