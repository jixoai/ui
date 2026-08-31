/**
 * The PrintPageConfig grammar gates (print-pipeline, 2026-08-30):
 * structured values validated before compilation; invalid input is
 * REJECTED and no @page rule is emitted for it — never
 * string-concatenated into CSS. Snapshot: the compiled margin boxes
 * and counter rules.
 */
import { describe, expect, it } from 'vitest';
import {
  PageConfigError,
  compilePageCss,
  NAMED_SIZE_MM,
  parsePageConfig,
  sheetMm,
} from '../src/lib/print/page-config';

describe('parsePageConfig — the validator', () => {
  it('accepts the documented grammar and freezes the product', () => {
    const config = parsePageConfig({
      size: 'A4',
      margin: { top: 18, right: 16, bottom: 18, left: 16, unit: 'mm' },
      marks: 'crop',
      footer: { 'bottom-center': 'counter(pages)' },
      header: { 'top-center': 'string:chapterTitle' },
    });
    expect(config.size).toBe('A4');
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('REJECTS a negative margin (the verifier scenario)', () => {
    expect(() => parsePageConfig({ margin: { top: -1, right: 0, bottom: 0, left: 0, unit: 'mm' } })).toThrow(
      PageConfigError,
    );
  });

  it('rejects unknown units', () => {
    expect(() =>
      parsePageConfig({ margin: { top: 1, right: 1, bottom: 1, left: 1, unit: 'px' as never } }),
    ).toThrow(/unknown unit/);
    expect(() => parsePageConfig({ size: { width: 10, length: 10, unit: 'em' as never } })).toThrow(
      /unknown unit/,
    );
  });

  it('rejects non-positive sizes and unknown named sizes', () => {
    expect(() => parsePageConfig({ size: { width: 0, length: 10, unit: 'mm' } })).toThrow(/size\.width/);
    expect(() => parsePageConfig({ size: { width: -5, length: 10, unit: 'mm' } })).toThrow(/size\.width/);
    expect(() => parsePageConfig({ size: 'Legal' as never })).toThrow(/named size/);
  });

  it('rejects illegal marks and header/footer tokens', () => {
    expect(() => parsePageConfig({ marks: 'trim' as never })).toThrow(/marks/);
    expect(() =>
      parsePageConfig({ footer: { 'bottom-center': 'counter(bogus)' as never } }),
    ).toThrow(/invalid token/);
    expect(() =>
      parsePageConfig({ header: { 'middle-center': 'counter(page)' as never } }),
    ).toThrow(/not a compilable margin box/);
  });

  it('undefined input parses to the empty config', () => {
    expect(parsePageConfig(undefined)).toEqual({});
  });
});

describe('compilePageCss — the kernel stylesheet text', () => {
  it('compiles size + margin + the counter footer (snapshot)', () => {
    const css = compilePageCss(
      parsePageConfig({
        size: 'A4',
        margin: { top: 18, right: 16, bottom: 18, left: 16, unit: 'mm' },
        footer: { 'bottom-left': 'counter(page)', 'bottom-right': 'counter(pages)' },
      }),
    );
    expect(css).toContain('@page {');
    expect(css).toContain('size: A4;');
    expect(css).toContain('margin: 18mm 16mm 18mm 16mm;');
    expect(css).toContain('@bottom-left {');
    expect(css).toContain('content: counter(page);');
    expect(css).toContain('@bottom-right {');
    expect(css).toContain('content: counter(pages);');
    expect(css).toMatchSnapshot();
  });

  it('compiles structured sizes, marks and string-set headers', () => {
    const css = compilePageCss(
      parsePageConfig({
        size: { width: 8.5, length: 11, unit: 'in' },
        marks: 'both',
        header: { 'top-center': 'string:chapterTitle' },
      }),
    );
    expect(css).toContain('size: 8.5in 11in;');
    expect(css).toContain('marks: crop cross;');
    expect(css).toContain('content: string(chapterTitle, first);');
  });

  it('the empty config compiles to a bare @page (no fabricated values)', () => {
    expect(compilePageCss({})).toBe('@page {\n}');
  });
});

describe('sheetMm', () => {
  it('resolves named and structured sizes to millimetres', () => {
    expect(sheetMm('A4')).toEqual(NAMED_SIZE_MM.A4);
    expect(sheetMm({ width: 1, length: 1, unit: 'in' })).toEqual({ width: 25.4, length: 25.4 });
    expect(sheetMm(undefined)).toEqual(NAMED_SIZE_MM.A4); // the default
  });
});
