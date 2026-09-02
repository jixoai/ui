/**
 * icon-uris.test.ts — the byte-stability gate for the lucide-derived
 * icon data-URIs (icons spec, 2026-08-29).
 *
 * Fixtures of record: test/icon-uri-fixtures.ts, extracted verbatim
 * from the pre-migration hand-authored vocabulary (git HEAD of
 * jx-pure.css). If lucide reorders children or attributes upstream,
 * these tests fail BEFORE any sheet diff ships. The single sanctioned
 * deviation: --jx-icon-invalid-ink re-derives as lucide CircleAlert.
 * 2026-09-02 · ICON-2: the plain check slot joins the vocabulary
 * (default sw 2 — valid-ink keeps the 2.5 weight exclusively).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { iconUri, iconSlot, jxIconSlots, jxGlyphs } from '../src/icon-uris';
import { buildIconVocabSheet } from '../src/icon-vocab';
import { repoRoot } from '../src/generate';
import { serializeLaw } from '../src/serializers/core';
import { inputLaw } from '../src/laws/input';
import { clearLaw } from '../src/laws/clear';
import { selectLaw } from '../src/laws/select';
import { committedRootVars, committedDarkVars, committedPaletteMask } from './icon-uri-fixtures';

const WHITE = '#fff' as const;

/** the sanctioned invalid-ink swap: lucide CircleAlert at sw 2.5.
 * B3 (2026-09-02): the bytes ride the FIXTURES now (re-extracted from
 * the sheet) — no copied literals anywhere in this suite */
const circleAlertBlack = committedRootVars['--jx-icon-invalid-ink'];
const circleAlertWhite = committedDarkVars['--jx-icon-invalid-ink'];

describe('byte-stability: lucide derivation vs the committed sheet bytes', () => {
  const plainSlots = ['calendar', 'clock', 'mail', 'search', 'chevron', 'clear', 'check'] as const;

  for (const slot of plainSlots) {
    it(`${slot}: reproduces the committed :root URI byte-for-byte`, () => {
      expect(jxIconSlots[slot]).toBe(committedRootVars[`--jx-icon-${slot}`]);
    });
    it(`${slot}: reproduces the committed .dark URI byte-for-byte (ink flip only)`, () => {
      expect(iconUri(jxGlyphs[slot], { ink: WHITE })).toBe(committedDarkVars[`--jx-icon-${slot}`]);
    });
  }

  it('calendar: lucide canonical order (path-first, rect width/height/x/y) — zero-exemption ruling', () => {
    expect(jxIconSlots.calendar).toContain("round'%3E%3Cpath d='M8 2v4'/%3E%3Cpath d='M16 2v4'/%3E%3Crect width='18' height='18' x='3' y='4' rx='2'/%3E");
    expect(jxIconSlots.calendar).not.toContain("rect x='3'");
  });

  it('palette: fill dots serialize as ink + stroke=none in committed order', () => {
    expect(jxIconSlots.palette).toContain("r='.5' fill='%23000' stroke='none'");
  });

  it('valid-ink: lucide Check at sw 2.5, both inks', () => {
    expect(iconUri(jxGlyphs.check, { strokeWidth: 2.5 })).toBe(committedRootVars['--jx-icon-valid-ink']);
    expect(iconUri(jxGlyphs.check, { strokeWidth: 2.5, ink: WHITE })).toBe(committedDarkVars['--jx-icon-valid-ink']);
  });

  it('calendar-ink / clock-ink: sw 2 twins of the plain slots', () => {
    expect(iconUri(jxGlyphs.calendar)).toBe(committedRootVars['--jx-icon-calendar-ink']);
    expect(iconUri(jxGlyphs.clock)).toBe(committedRootVars['--jx-icon-clock-ink']);
  });
});

describe('invalid-ink: the sanctioned CircleAlert swap (2026-08-29)', () => {
  it('geometry = circle + two lines in lucide insertion order, sw 2.5', () => {
    expect(iconUri(jxGlyphs['circle-alert'], { strokeWidth: 2.5 })).toBe(circleAlertBlack);
    expect(iconUri(jxGlyphs['circle-alert'], { strokeWidth: 2.5, ink: WHITE })).toBe(circleAlertWhite);
  });

  it('the hand-drawn bare exclamation geometry is gone', () => {
    expect(circleAlertBlack).not.toContain('M12 9v4');
    expect(circleAlertBlack).not.toContain('M12 16.5h.01');
  });
});

describe('the frozen URI dialect', () => {
  const sample = jxIconSlots.calendar;

  it('wraps as double-quoted url() with the data:image/svg+xml scheme', () => {
    expect(sample.startsWith('url("data:image/svg+xml,')).toBe(true);
    expect(sample.endsWith('")')).toBe(true);
  });

  it('percent-encodes ONLY < > # — no raw angle brackets or hashes', () => {
    const data = sample.slice('url("data:image/svg+xml,'.length, -2);
    expect(data).not.toMatch(/[<>#]/);
    expect(data).toContain('%3Csvg');
    expect(data).toContain("stroke='%23000'");
  });

  it('attributes are single-quoted; no double quotes inside the data', () => {
    const data = sample.slice('url("data:image/svg+xml,'.length, -2);
    expect(data).not.toContain('"');
    expect(data).toContain("viewBox='0 0 24 24'");
  });

  it('no width/height on the svg (CSS sizes data-URI glyphs)', () => {
    expect(sample).not.toMatch(/width='24'|height='24'/);
  });
});

describe('laws embed the lucide-derived URIs (single declaration source)', () => {
  it('input law: every icon slot rides the derived fallback', () => {
    const css = serializeLaw(inputLaw, { format: 'utility' }).css;
    for (const slot of ['calendar', 'clock', 'mail', 'search', 'clear'] as const) {
      expect(css).toContain(iconSlot(slot));
    }
  });

  it('clear law: the mask paint keeps its center / contain no-repeat suffix', () => {
    const css = serializeLaw(clearLaw, { format: 'utility' }).css;
    expect(css).toContain(`-webkit-mask: ${iconSlot('clear')} center / contain no-repeat;`);
    expect(css).toContain(`mask: ${iconSlot('clear')} center / contain no-repeat;`);
  });

  it('select law: --jx-icon-chevron-svg is the bare chevron URI', () => {
    const css = serializeLaw(selectLaw, { format: 'utility' }).css;
    expect(css).toContain(`--jx-icon-chevron-svg: ${jxIconSlots.chevron};`);
  });
});

describe('icon vocabulary sheet (the 4th projection)', () => {
  /** parse `--jx-icon-*: url(...);` lines per block context */
  const vocabVars = (sheet: string): Record<string, Record<string, string>> => {
    const out: Record<string, Record<string, string>> = { ':root': {}, '.dark': {}, '.jx-light': {} };
    let ctx = '';
    for (const line of sheet.split('\n')) {
      if (line === '  :root {') ctx = ':root';
      else if (line === '.dark {') ctx = '.dark';
      else if (line === '.jx-light {') ctx = '.jx-light';
      const m = line.match(/^  (--jx-icon-[a-z-]+): (url\(.*\));$/);
      if (m && ctx) out[ctx][m[1]] = m[2];
    }
    return out;
  };

  const sheet = buildIconVocabSheet();
  const vars = vocabVars(sheet);

  it(':root vars match the committed bytes (fixture = sheet truth, no exemptions)', () => {
    for (const [name, uri] of Object.entries(committedRootVars)) {
      expect(vars[':root'][name], `:root ${name}`).toBe(uri);
    }
    expect(Object.keys(vars[':root']).length).toBe(11); // 7 plain + 4 ink (placeholder is not an icon var)
  });

  it('.dark vars match the committed bytes (fixture = sheet truth, no exemptions)', () => {
    for (const [name, uri] of Object.entries(committedDarkVars)) {
      expect(vars['.dark'][name], `.dark ${name}`).toBe(uri);
    }
    expect(Object.keys(vars['.dark']).length).toBe(11);
  });

  it('.jx-light mirrors .dark at black ink', () => {
    for (const [name, uri] of Object.entries(vars['.dark'])) {
      expect(vars['.jx-light'][name], `.jx-light ${name}`).toBe(uri.replace("stroke='%23fff'", "stroke='%23000'"));
    }
  });

  it('the palette mask paint survives verbatim (--jx-icon-palette name unchanged)', () => {
    expect(sheet).toContain(`-webkit-mask: ${committedPaletteMask};`);
    expect(sheet).toContain(`mask: ${committedPaletteMask};`);
  });

  it('both mask-rule consumers are present', () => {
    expect(sheet).toContain('.jx-color-shell::after {');
    expect(sheet).toContain('.jx-color-shell:hover::after {');
    expect(sheet).toContain('.jx-color-picker-chevron {');
  });

  it('generation is byte-stable (idempotent)', () => {
    expect(buildIconVocabSheet()).toBe(sheet);
  });
});

describe('slot marker validation: jx-icon-vocab in the committed sheet', () => {
  const committed = readFileSync(resolve(repoRoot, 'registry/files/theme/jx-pure.css'), 'utf8');
  const b = '/* @jixoai/css-laws:begin:jx-icon-vocab — GENERATED, do not edit (source: packages/css-laws/src/icon-vocab) */';
  const e = '/* @jixoai/css-laws:end:jx-icon-vocab */';

  it('exactly one begin/end pair, correctly ordered', () => {
    expect(committed.split(b).length - 1).toBe(1);
    expect(committed.split(e).length - 1).toBe(1);
    expect(committed.indexOf(e)).toBeGreaterThan(committed.indexOf(b));
  });

  it('the committed slot content equals a fresh generation (the --check gate, in-process)', () => {
    const slot = committed.slice(committed.indexOf(b), committed.indexOf(e) + e.length);
    expect(slot.trim()).toBe(`${b}\n${buildIconVocabSheet()}\n${e}`.trim());
  });
});
