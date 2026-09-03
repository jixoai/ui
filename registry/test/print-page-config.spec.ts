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

  // ── the r5 grammar: token SEQUENCES with quoted literals ─────────────
  it('accepts whitespace-separated token sequences and quoted literals (the folio pair)', () => {
    const config = parsePageConfig({
      footer: { 'bottom-center': 'counter(page) " / " counter(pages)' },
      header: { 'top-center': '"CONFIDENTIAL — internal draft"' },
    });
    expect(config.footer?.['bottom-center']).toBe('counter(page) " / " counter(pages)');
    expect(config.header?.['top-center']).toBe('"CONFIDENTIAL — internal draft"');
  });

  it('REJECTS the broken-literal shapes (unbalanced quote, meta characters, empty, control chars)', () => {
    // the r5 rendering hang: a lone quote tokenized to a bare '"' part
    expect(() => parsePageConfig({ footer: { 'bottom-center': '"' as never } })).toThrow(
      /invalid token/,
    );
    // unterminated literal swallows the whitespace and fails whole
    expect(() =>
      parsePageConfig({ footer: { 'bottom-center': 'counter(page) " /' as never } }),
    ).toThrow(/invalid token/);
    // no css meta characters inside the literal — no injection surface
    expect(() =>
      parsePageConfig({ footer: { 'bottom-center': '"; body { display: none' as never } }),
    ).toThrow(/invalid token/);
    expect(() =>
      parsePageConfig({ footer: { 'bottom-center': '"a""b"' as never } }),
    ).toThrow(/invalid token/);
    expect(() => parsePageConfig({ footer: { 'bottom-center': '' as never } })).toThrow(
      /invalid token sequence/,
    );
    // a raw newline inside the literal is not a css string (subagent
    // pre-review: it rode TOKEN_RE's negated class into the output)
    expect(() =>
      parsePageConfig({ header: { 'top-center': '"two\nlines"' as never } }),
    ).toThrow(/invalid token/);
    // whitespace-only tokenizes to NOTHING — it must not compile to
    // `content: ;` (the emit-invalid-css class this grammar exists
    // to prevent)
    expect(() => parsePageConfig({ footer: { 'bottom-center': '   ' as never } })).toThrow(
      /invalid token sequence/,
    );
  });

  it('validates headerIcon as a site-relative plain path', () => {
    expect(parsePageConfig({ headerIcon: '/icon.svg' }).headerIcon).toBe('/icon.svg');
    expect(parsePageConfig({ headerIcon: '/assets/icons/a-b_v.png' }).headerIcon).toBe(
      '/assets/icons/a-b_v.png',
    );
    expect(() => parsePageConfig({ headerIcon: 'https://evil.example/x.svg' })).toThrow(
      /headerIcon/,
    );
    expect(() => parsePageConfig({ headerIcon: 'icon.svg' })).toThrow(/headerIcon/);
    expect(() => parsePageConfig({ headerIcon: '/a?b' })).toThrow(/headerIcon/);
    // a PROTOCOL-relative URL wears the leading slash of a real path
    expect(() => parsePageConfig({ headerIcon: '//evil.example/x.png' })).toThrow(/headerIcon/);
    expect(() => parsePageConfig({ headerIcon: '/' + 'a'.repeat(200) })).toThrow(/headerIcon/);
  });

  // ── the paper theme (Owner ruling, 2026-09-03): paper is white —
  // light is the DEFAULT (absent), dark is the declared exception ──
  it('validates theme as the declared light|dark pair (absent = light by law)', () => {
    expect(parsePageConfig({ theme: 'dark' }).theme).toBe('dark');
    expect(parsePageConfig({ theme: 'light' }).theme).toBe('light');
    // absent stays undefined — the pipeline resolves it to 'light'
    expect(parsePageConfig({}).theme).toBeUndefined();
    expect(() => parsePageConfig({ theme: 'auto' as never })).toThrow(/theme/);
    expect(() => parsePageConfig({ theme: 'DARK' as never })).toThrow(/theme/);
  });

  it('theme is pipeline-consumed, never compiled into @page css', () => {
    const css = compilePageCss(parsePageConfig({ theme: 'dark' }));
    expect(css).toBe('@page {\n}');
    expect(css).not.toContain('dark');
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

  it('compiles a token SEQUENCE into ONE content value (the r5 folio pair)', () => {
    const css = compilePageCss(
      parsePageConfig({
        footer: { 'bottom-center': 'counter(page) " / " counter(pages)' },
        header: { 'top-left': 'string:docTitle', 'top-right': 'string:sectionTitle' },
      }),
    );
    // one @page block per slot, the parts joined space-separated
    expect(css).toContain('content: counter(page) " / " counter(pages);');
    expect(css).toContain('content: string(docTitle, first);');
    expect(css).toContain('content: string(sectionTitle, first);');
    // the quoted literal passes VERBATIM — exactly the inner spaces
    expect(css).not.toContain('"/"');
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
