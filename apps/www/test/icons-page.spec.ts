/**
 * /docs/icons.html page lock (icons-docs change, batch A4; audit
 * fixes B1/B4, 2026-09-02).
 *
 * The page's dogfood contract, locked end to end:
 *   - the three toc sections render (vocabulary / css-slots / plugin)
 *   - the icon-table carries the design §1 contract: every
 *     --jx-icon-* face is listed (11 sheet-declared vars + the palette
 *     inline-fallback face), one row per variable, ≥ the 9 concept slots
 *   - every glyph preview REALLY paints the vocabulary face — the style
 *     attribute carries var(--jx-icon-…) (no hand-pasted SVG in the
 *     preview column)
 *   - the named-library grid walks the icons bag itself (dynamic count
 *     — a glyph added to icons.ts appears with zero page edit)
 *   - the plugin demo's local override exists (a scoped
 *     --jx-icon-search redefinition on a wrapper style attribute)
 *   - the plugin export is spelled jixoai (six letters) everywhere —
 *     the five-letter misspelling never appears in rendered text,
 *     head meta or the page source (audit B1)
 *   - the demo override speaks the frozen URI dialect (single-quoted
 *     attrs inside tags, only < > # encoded), so --jx-icon-search
 *     parses as ONE complete url(...) and the mask expression is
 *     retrievable from the CSSOM (audit B4)
 *
 * jsdom notes: no fake timers, no setTimeout(0) — @testing-library's
 * mount is synchronous; and NO nested template literals (esbuild
 * chokes — string concatenation only). jsdom keeps custom-property
 * values RAW (it does not tokenize them), so the CSSOM roundtrip
 * below proves settable-as-one-declaration; the browser-accurate
 * failure condition — a raw double quote inside the url() payload
 * truncating the value to `url(` — is locked as a string invariant.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import IconsPage from '../src/routes/docs/icons.html/+page.svelte';
import { icons } from '../src/lib/icons';

/** the design §1 contract: 9 concept slots ⇔ the variable faces */
const CONTRACT_SLOTS = [
  '--jx-icon-calendar',
  '--jx-icon-calendar-ink',
  '--jx-icon-clock',
  '--jx-icon-clock-ink',
  '--jx-icon-chevron',
  '--jx-icon-palette',
  '--jx-icon-clear',
  '--jx-icon-mail',
  '--jx-icon-search',
  '--jx-icon-check',
  '--jx-icon-valid-ink',
  '--jx-icon-invalid-ink',
];

/** the 9 plugin concept slots (the derivation map) */
const CONCEPTS = [
  'calendar',
  'clock',
  'chevron',
  'palette',
  'clear',
  'mail',
  'search',
  'check',
  'invalid',
];

describe('/docs/icons.html — page structure', () => {
  it('renders the three toc sections', () => {
    const { container } = render(IconsPage);
    for (const id of ['vocabulary', 'css-slots', 'plugin']) {
      expect(container.querySelector('#' + id), 'section #' + id).toBeTruthy();
    }
  });

  it('carries the install block for the registry:lib item', () => {
    const { container } = render(IconsPage);
    const install = container.querySelector('[data-doc-install]');
    expect(install).toBeTruthy();
    expect(install?.textContent).toContain('npx jixoai-ui add icons');
  });

  it('no literal undefined/null text nodes', () => {
    const { container } = render(IconsPage);
    expect(container.innerHTML).not.toMatch(/>undefined</);
    expect(container.innerHTML).not.toMatch(/>null</);
  });
});

describe('/docs/icons.html — the css-slots table', () => {
  it('one row per contract variable (≥ the 9 concept slots)', () => {
    const { container } = render(IconsPage);
    const table = container.querySelector('[data-jx-icon-table]');
    expect(table).toBeTruthy();
    const rows = table!.querySelectorAll('tbody tr');
    expect(rows.length, 'row count ≥ concept count').toBeGreaterThanOrEqual(CONCEPTS.length);
    expect(rows.length, 'one row per contract face').toBe(CONTRACT_SLOTS.length);
    const listed = [...rows].map((r) => r.cells[1]?.textContent?.trim());
    for (const slot of CONTRACT_SLOTS) {
      expect(listed, 'contract slot ' + slot).toContain(slot);
    }
  });

  it('every glyph preview paints the vocabulary face (var reference, not pasted SVG)', () => {
    const { container } = render(IconsPage);
    const previews = container.querySelectorAll('[data-jx-icon-preview]');
    expect(previews.length).toBeGreaterThanOrEqual(CONTRACT_SLOTS.length);
    for (const preview of previews) {
      const style = preview.getAttribute('style') ?? '';
      expect(style, 'preview carries var(--jx-icon-…) paint').toContain('var(--jx-icon-');
      // the preview column is a paint cell, never an inline SVG hand-off
      expect(preview.querySelector('svg')).toBeNull();
    }
  });

  it('the palette face rides the var(–, inline fallback) embedding law', () => {
    const { container } = render(IconsPage);
    const palettePreview = container.querySelector('[data-jx-icon-preview-slot="--jx-icon-palette"]');
    expect(palettePreview).toBeTruthy();
    const style = palettePreview!.getAttribute('style') ?? '';
    expect(style).toContain('var(--jx-icon-palette, url("data:image/svg+xml,');
  });
});

describe('/docs/icons.html — the named icon library grid', () => {
  it('walks the icons bag dynamically (count = the module, usage text per glyph)', () => {
    const { container } = render(IconsPage);
    const grid = container.querySelector('[data-named-icon-grid]');
    expect(grid).toBeTruthy();
    const items = grid!.querySelectorAll('li');
    const bagSize = Object.keys(icons).length;
    expect(items.length, 'one cell per named icon').toBe(bagSize);
    // every cell renders the REAL glyph ({@html} — svg[data-jx-icon])
    // and the consumption hint '{@html icons.<name>}'
    expect(grid!.querySelectorAll('svg[data-jx-icon]').length).toBe(bagSize);
    const first = items[0];
    const name = first?.querySelector('code')?.textContent ?? '';
    expect(first?.textContent).toContain('{@html icons.' + name.replace('icons.', '') + '}');
  });

  it('states the verify:icons freshness gate', () => {
    const { container } = render(IconsPage);
    expect(container.textContent).toContain('verify:icons');
  });
});

describe('/docs/icons.html — the plugin section', () => {
  it('documents the four provider shapes', () => {
    const { container } = render(IconsPage);
    const text = container.textContent ?? '';
    for (const provider of ['lucideIconProvider()', 'svgIconProvider(', 'fontIconProvider(', 'mixinIconProvider(']) {
      expect(text, 'provider ' + provider).toContain(provider);
    }
    expect(text).toContain('virtual:jixoai-icons');
  });

  it('live demo: a scoped --jx-icon-* override on a wrapper style attribute', () => {
    const { container } = render(IconsPage);
    const demo = container.querySelector('[data-icon-override-demo]');
    expect(demo, 'demo block present').toBeTruthy();
    const scope = container.querySelector('[data-icon-override-scope]');
    expect(scope, 'override wrapper present').toBeTruthy();
    const style = scope?.getAttribute('style') ?? '';
    expect(style, 'local redefinition of the slot').toContain('--jx-icon-search:');
    expect(style, 'the override value is a real SVG data URI').toContain('data:image/svg+xml');
    // both previews paint through the same mask expression
    const def = container.querySelector('[data-icon-demo-default]');
    const over = container.querySelector('[data-icon-demo-override]');
    expect(def?.getAttribute('style') ?? '').toContain('var(--jx-icon-search)');
    expect(over?.getAttribute('style') ?? '').toContain('var(--jx-icon-search)');
  });

  it('derives the demo override from the named library (check geometry)', () => {
    const { container } = render(IconsPage);
    const scope = container.querySelector('[data-icon-override-scope]');
    const style = scope?.getAttribute('style') ?? '';
    // icons.check path data rides literal (the frozen dialect encodes
    // only < > # — spaces stay), and the < must be percent-encoded
    expect(style).toContain('M20 6 9 17l-5-5');
    expect(style).toContain('%3Csvg');
    expect(style).not.toContain('<svg');
  });

  it('carries the dogfood statement (the site runs the jixoai icons pipeline)', () => {
    const { container } = render(IconsPage);
    const text = container.textContent ?? '';
    expect(text).toContain('jixoai({ icons })');
  });

  it('the vite config sample shows the real export: jixoai({ icons })', () => {
    const { container } = render(IconsPage);
    const text = container.textContent ?? '';
    expect(text).toContain('import { jixoai } from');
    expect(text).toContain('...jixoai({');
  });

  // the five-letter misspelling is copy-paste poison: a config built
  // from it fails to compile. j-i-x-o-a-i never contains the j-x-o-a-i
  // sequence, so a plain includes() is word-boundary safe here.
  it('the five-letter misspelling appears nowhere (rendered text, markup, head meta, source)', () => {
    const { container } = render(IconsPage);
    expect(container.textContent ?? '', 'rendered text').not.toContain('jxoai');
    expect(container.innerHTML, 'rendered markup (attributes included)').not.toContain('jxoai');
    const meta = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    expect(meta, 'head meta exists').toContain('jixoai({ icons })');
    expect(meta, 'head meta description').not.toContain('jxoai');
    // vitest transforms specs through vite (import.meta.url is not a
    // file: URL there) — resolve against the runner cwd (apps/www)
    const source = readFileSync('src/routes/docs/icons.html/+page.svelte', 'utf8');
    expect(source, 'page source').not.toContain('jxoai');
  });

  it('the demo override speaks the frozen URI dialect (single-quoted attrs, only < > # encoded)', () => {
    const { container } = render(IconsPage);
    const scope = container.querySelector('[data-icon-override-scope]');
    const style = scope?.getAttribute('style') ?? '';
    // attrs normalized to the dialect's single quotes (ink.ts law)
    expect(style).toContain("viewBox='0 0 24 24'");
    expect(style).toContain("stroke='currentColor'");
    // and the encoding is exactly < > # (the check path rides literal)
    expect(style).toContain('%3Csvg');
    expect(style).toContain('%3E%3C/svg%3E');
    expect(style).not.toContain('<svg');
  });

  it('the override value parses as ONE complete url() — no url( truncation, mask retrievable', () => {
    const { container } = render(IconsPage);
    const scope = container.querySelector('[data-icon-override-scope]');
    const value = scope?.style.getPropertyValue('--jx-icon-search') ?? '';
    expect(value.startsWith('url("data:image/svg+xml,')).toBe(true);
    // THE browser failure condition: a raw double quote between the
    // url("…") delimiters terminates the string token and the CSSOM
    // truncates the whole declaration to `url(` — the repaint dies.
    // (jsdom keeps custom props raw, so this string invariant is the
    // browser-accurate guard; the roundtrip below locks the rest.)
    expect(value.slice(5, -2), 'no raw double quote inside the url payload').not.toContain('"');
    expect(value.endsWith('")')).toBe(true);
    expect(value).toContain('M20 6 9 17l-5-5');
    // CSSStyleDeclaration roundtrip: the whole token survives
    // setProperty → getPropertyValue as one complete declaration
    const probe = document.createElement('div');
    probe.style.setProperty('--jx-icon-search', value);
    const parsed = probe.style.getPropertyValue('--jx-icon-search');
    expect(parsed, 'not the url( truncation').not.toBe('url(');
    expect(parsed).toBe(value);
    // the paint expression consuming the slot is retrievable too
    const glyph = container.querySelector('[data-icon-demo-default]');
    const mask = glyph?.style.getPropertyValue('mask') ?? '';
    expect(mask).toContain('var(--jx-icon-search)');
    expect(mask).toContain('center / contain no-repeat');
  });
});
