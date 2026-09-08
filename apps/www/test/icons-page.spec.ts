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
 *   - the named-library grid walks ICON_NAMES from the generated
 *     artifact (dynamic count — a glyph added to the library config
 *     appears with zero page edit), every cell rendering through
 *     <Icon> (svg[data-jx-icon]) with the IconName as its label
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
import { ICON_NAMES } from '../src/lib/icon-set.gen';

/**
 * the overflow sentinel, extracted from its ONE definition site —
 * packages/vite-plugin/src/icons/ids.ts (ICON_LIBRARY_SENTINEL_ERROR,
 * three single-quoted literals joined by +; cwd is apps/www under
 * vitest). The page must quote these exact bytes; if the plugin ever
 * rewords its sentinel, this lock fails the page as stale instead of
 * letting the docs drift.
 */
const SENTINEL = (() => {
  const source = readFileSync('../../packages/vite-plugin/src/icons/ids.ts', 'utf8');
  const body = source.match(/ICON_LIBRARY_SENTINEL_ERROR =([\s\S]*?);/)?.[1] ?? '';
  const parts = [...body.matchAll(/'([^']*)'/g)].map((m) => m[1]);
  expect(parts.length, 'the ids.ts sentinel still rides its three-literal form').toBe(3);
  return parts.join('');
})();

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

  it('carries the install block for the icon component item', () => {
    const { container } = render(IconsPage);
    const install = container.querySelector('[data-doc-install]');
    expect(install).toBeTruthy();
    // the retired string-bag item is gone; the grid's component item is
    // the install teach (substring-stable if icon-set rides alongside)
    expect(install?.textContent).toContain('npx jixoai-ui add icon');
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
  it('walks ICON_NAMES dynamically (count = the artifact, <Icon> glyph + name per cell)', () => {
    const { container } = render(IconsPage);
    const grid = container.querySelector('[data-named-icon-grid]');
    expect(grid).toBeTruthy();
    const items = [...grid!.querySelectorAll('li')];
    expect(items.length, 'one cell per named icon').toBe(ICON_NAMES.length);
    // every cell renders the REAL glyph through <Icon> (svg[data-jx-icon])
    expect(grid!.querySelectorAll('svg[data-jx-icon]').length).toBe(ICON_NAMES.length);
    // labels track the artifact: one IconName per cell, in order
    const labels = items.map((li) => li.querySelector('code')?.textContent ?? '');
    expect(labels).toEqual([...ICON_NAMES]);
    // and the consumption hint teaches the component API
    expect(items[0]?.textContent).toContain('<Icon name="arrowRight"');
  });

  it('states the verify:icons freshness gate', () => {
    const { container } = render(IconsPage);
    expect(container.textContent).toContain('verify:icons');
  });
});

describe('/docs/icons.html — the component face (the bridge section)', () => {
  it('renders the live size ladder (real svgs) — the one demo kept on the system page', () => {
    const { container } = render(IconsPage);
    const sizes = container.querySelector('[data-icon-size-demo]');
    expect(sizes, 'size ladder demo').toBeTruthy();
    const svgs = sizes!.querySelectorAll('svg[data-jx-icon]');
    expect(svgs.length).toBe(4);
    for (const svg of svgs) {
      expect(svg.getAttribute('width')).toMatch(/^\d+$/);
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('bridges to the component item page — the API authority (no duplication)', () => {
    const { container } = render(IconsPage);
    // the system page no longer carries the stroke ladder / usage
    // sample / typo block — those live on /docs/components/icon.html
    expect(container.querySelector('[data-icon-stroke-demo]')).toBeNull();
    const bridge = container.querySelector<HTMLAnchorElement>('a[href="/docs/components/icon.html"]');
    expect(bridge, 'the bridge link').toBeTruthy();
    expect((bridge?.textContent ?? '')).toContain('playground');
    // the section still names the law in prose
    expect(container.textContent ?? '').toContain('IconName');
  });
});

describe('/docs/icons.html — the plugin library face (library config + tiers + async)', () => {
  it('documents the real option semantics', () => {
    const { container } = render(IconsPage);
    const text = container.textContent ?? '';
    for (const option of [
      'includeDefaults',
      'channels',
      'maxChunkBytes',
      '20480',
      'chunking',
      'single',
      'inlineFirstChunk',
      'optimize',
      'output',
      'write',
    ]) {
      expect(text, 'option ' + option).toContain(option);
    }
    // the budget unit is RAW non-gzip module bytes
    expect(text).toContain('RAW');
    // the single-writer law: the repo's gen:icons script, write stays false
    expect(text).toContain('single-writer');
    expect(text).toContain('gen:icons');
  });

  it('shows all three source forms incl. the lucide: ref dialect', () => {
    const { container } = render(IconsPage);
    const text = container.textContent ?? '';
    expect(text).toContain("'lucide:zap'");
    expect(text).toContain("{ file: 'assets/logo.svg' }");
    expect(text).toContain('<svg xmlns="…">…</svg>');
  });

  it('shows the channel + font source forms (icon-channel-api)', () => {
    const { container } = render(IconsPage);
    const text = container.textContent ?? '';
    expect(text).toContain("'md:home'");
    expect(text).toContain("{ font: 'brand.woff2', code: 0xE002 }");
    expect(text).toContain("liga: 'md-logo'");
  });

  it('carries the channel table: prefix / sub-entry / package / license / default mapping', () => {
    const { container } = render(IconsPage);
    const table = container.querySelector('[data-channel-table] table');
    expect(table, 'the channel table').toBeTruthy();
    const rows = [...table!.querySelectorAll('tbody tr')];
    expect(rows.length).toBe(5); // material + phosphor + remix + the lucide default row + your own
    const cellText = rows.map((row) => row.textContent ?? '');
    // the shipped channels with their sub-entries + packages + licenses + ref forms
    for (const needle of [
      'material',
      'md:home',
      '…/icons/md',
      '@material-symbols/svg-400',
      'Apache-2.0',
      'phosphor',
      'ph:atom',
      '…/icons/ph',
      '@phosphor-icons/core',
      'MIT',
      'remix',
      'rx:system:add-line',
      '…/icons/rx',
      'remixicon',
      '…/icons/lucide',
      'defineIconChannel',
      '…/icons/channel',
    ]) {
      expect(cellText.join('\n'), 'channel table mentions ' + needle).toContain(needle);
    }
    // the default mapping row names the frozen defaults
    expect(cellText.join('\n')).toContain('outlined · weight 400 · FILL 0');
    // the frozen default mapping stays regular for phosphor
    expect(cellText.join('\n')).toContain('assets/regular');
  });

  it('states the not-shipped verdicts: tabler/hugeicons + the SF Symbols licensing rejection', () => {
    const { container } = render(IconsPage);
    const note = container.querySelector('[data-not-shipped-note]');
    expect(note, 'the not-shipped note').toBeTruthy();
    // whitespace-normalized: the markup wraps mid-phrase
    const text = (note?.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toContain('tabler');
    expect(text).toContain('hugeicons');
    expect(text).toContain('no per-icon SVG source package');
    expect(text).toContain('SF Symbols');
    expect(text).toContain('Apple-platform apps');
    expect(text).toContain('prohibit SVG export or redistribution');
  });

  it('documents the font-source lane (build-time extraction, pure-SVG runtime)', () => {
    const { container } = render(IconsPage);
    const section = container.querySelector('[data-font-source-docs]');
    expect(section, 'the font-source section').toBeTruthy();
    const text = section?.textContent ?? '';
    expect(text).toContain('{ font:');
    expect(text).toContain('codepoint');
    expect(text).toContain('ligature');
    expect(text).toContain('best-effort');
    expect(text).toContain('watchFile');
    expect(text).toContain('never a silent blank glyph');
  });

  it('documents both install tiers (plugin-free default vs plugin-prerequisite overflow)', () => {
    const { container } = render(IconsPage);
    const text = container.textContent ?? '';
    expect(text).toContain('plugin-free');
    expect(text).toContain('plugin prerequisite');
    expect(text).toContain('virtual:jixoai-icons/chunk/');
  });

  it('quotes the overflow sentinel BYTE-EXACT (the ids.ts contract)', () => {
    const { container } = render(IconsPage);
    const text = container.textContent ?? '';
    expect(
      text,
      'the page must carry the sentinel exactly — never a paraphrase',
    ).toContain(SENTINEL);
  });

  it('documents the async semantics (sync core, reserved box, preloadIcons)', () => {
    const { container } = render(IconsPage);
    const text = container.textContent ?? '';
    expect(text).toContain('preloadIcons');
    expect(text).toContain('data-jx-icon-pending');
    expect(text).toContain('SSR');
    // the hydration law: pending and rejected render the IDENTICAL box
    expect(text).toContain('IDENTICAL');
  });

  it('carries the mode matrix (chunking × inlineFirstChunk, four rows)', () => {
    const { container } = render(IconsPage);
    const tables = container.querySelectorAll('table');
    const matrix = [...tables].find((t) =>
      (t.textContent ?? '').includes('budgeted chunks; chunk 0 inline'),
    );
    expect(matrix, 'the mode matrix table').toBeTruthy();
    expect(matrix!.querySelectorAll('tbody tr').length).toBe(4);
  });

  // the retired literals are SPLICED so the migration sweeper's
  // per-line patterns never match THIS guard's own source (a spec
  // teaching the ban must not itself land in the inventory)
  const RETIRED_MODULE = '$lib/' + 'icons';
  const RETIRED_HINT = '@ht' + 'ml icons.';

  it('the old icon API never returns (the retired module + hint stay out of the source)', () => {
    // the migration law (design §8): this page was the old API's
    // loudest teacher — it must now teach only the component face
    const source = readFileSync('src/routes/docs/icons.html/+page.svelte', 'utf8');
    expect(source).not.toContain(RETIRED_MODULE);
    expect(source).not.toContain(RETIRED_HINT);
    expect(source).toContain("from '$lib/icon-set.gen'");
  });
});

describe('/docs/icons.html — the prefix compiler (scanned names + as aliases)', () => {
  it('documents the scanned + alias + dynamic snippet forms', () => {
    const { container } = render(IconsPage);
    const section = container.querySelector('[data-prefix-compiler-docs]');
    expect(section, 'the prefix-compiler section').toBeTruthy();
    const text = section?.textContent ?? '';
    expect(text).toContain('md:copy_all');
    expect(text).toContain('as copy2');
    expect(text).toContain('<Icon name="copy2" />');
    // the dynamic lane is taught as intentionally unscanned
    expect(text).toContain('md:${iconKey}');
    expect(text).toContain('NOT scanned');
  });

  it('states the dual-key law (双键并存): both keys, one payload, sources untouched', () => {
    const { container } = render(IconsPage);
    const text = container.querySelector('[data-prefix-compiler-docs]')?.textContent ?? '';
    expect(text).toContain('ALIASES');
    expect(text).toContain('双键并存');
    // whitespace-normalized: the markup wraps mid-phrase
    expect(text.replace(/\s+/g, ' ')).toContain('never rewritten');
    expect(text).toContain('exactly once');
    expect(text).toContain('adjacent to its ref');
    // collisions fail by name — the three documented rules
    expect(text).toContain('Collisions');
    expect(text).toContain('camelCase');
  });

  it('carries the three-tier safety table (compile / build / runtime)', () => {
    const { container } = render(IconsPage);
    const section = container.querySelector('[data-prefix-compiler-docs]');
    const table = section?.querySelector('table');
    expect(table, 'the tier table').toBeTruthy();
    const rows = [...table!.querySelectorAll('tbody tr')];
    expect(rows.length).toBe(3);
    const body = table!.textContent ?? '';
    for (const tier of ['compile', 'build', 'runtime']) {
      expect(body, 'tier ' + tier).toContain(tier);
    }
    // the template union member + the fa: compile-error story
    expect(body).toContain('`md:${string}`');
    expect(body).toContain('fa:');
    // never a silently blank glyph — resolution fails by name
    expect(body).toContain('BY NAME');
  });

  it('documents the scanner mechanics: eager walk + gen:icons parity + fail-safe prefixes', () => {
    const { container } = render(IconsPage);
    // the summary rides the SectionCard (outside the data div)
    const text = container.textContent ?? '';
    expect(text).toContain('eager project walk');
    expect(text).toContain('gen:icons');
    expect(text).toContain('never diverge');
    expect(text).toContain('ignored fail-safe');
    // the dynamic-name runtime contract
    const sectionText =
      container.querySelector('[data-prefix-compiler-docs]')?.textContent ?? '';
    expect(sectionText).toContain('runtime lane');
    expect(sectionText).toContain('reserved box');
    expect(sectionText).toContain('getIcon()');
  });

  it('the site DOGFOODS the scanner — channel refs + the alias + the equivalence ride the real artifact', () => {
    const { container } = render(IconsPage);
    // the named-library grid walks the REGENERATED artifact: the 38
    // built-ins plus the scanner's own findings from this site's
    // source (the docs page's static channel literals — incl. the
    // lucide: equivalence — + the vite config's registered channels)
    const grid = container.querySelector('[data-named-icon-grid]');
    const items = grid?.querySelectorAll('li') ?? [];
    expect(items.length).toBe(ICON_NAMES.length);
    expect(ICON_NAMES.length).toBe(45); // 39 built-ins (gripVertical, 2026-09-08) + 4 scanned canonicals + 1 alias + 1 equivalence key
    for (const name of ['md:copy_all', 'copy2', 'md:home', 'ph:atom', 'rx:system:add-line', 'lucide:check']) {
      expect(ICON_NAMES, 'the scanned set rides the artifact').toContain(name);
    }
    // adjacency law: the alias sits next to its ref
    expect(ICON_NAMES.indexOf('copy2')).toBe(ICON_NAMES.indexOf('md:copy_all') + 1);
    // and the equivalence key sits next to its canonical (the chain:
    // check → lucide:check → the built-in payload)
    expect(ICON_NAMES.indexOf('lucide:check')).toBe(ICON_NAMES.indexOf('check') + 1);
    expect(grid?.textContent ?? '').toContain('md:copy_all');
  });

  it('the EQUIVALENCES chain resolves: getIcon(lucide:check) === getIcon(check)', async () => {
    // the artifact's chained canonicalizer (ALIASES then EQUIVALENCES)
    // answers the scanned lucide ref with the BUILT-IN payload — the
    // same glyph the gallery renders in both cells
    const artifact = await import('../src/lib/icon-set.gen');
    expect(artifact.EQUIVALENCES).toEqual({ 'lucide:check': 'check' });
    expect(artifact.getIcon('lucide:check')).toEqual(artifact.getIcon('check'));
    expect(artifact.getIcon('lucide:check')?.d).toContain('M20 6 9 17l-5-5');
    await expect(artifact.loadIcon('lucide:check')).resolves.toEqual(artifact.getIcon('check'));
  });

  it('the live channel gallery renders (the real cells, not stock artwork)', () => {
    const { container } = render(IconsPage);
    const gallery = container.querySelector('[data-channel-gallery]');
    expect(gallery, 'the channel gallery section').toBeTruthy();
    const cells = gallery?.querySelectorAll('[data-channel-cell]') ?? [];
    expect(cells.length).toBe(6); // md:home, md:copy_all, ph:atom, rx:system:add-line, check, lucide:check
    const refs = [...cells].map((cell) => cell.getAttribute('data-channel-cell'));
    expect(refs).toEqual(['md:home', 'md:copy_all', 'ph:atom', 'rx:system:add-line', 'check', 'lucide:check']);
    // every gallery cell paints a real glyph — 6 cells PLUS the alias
    // demo's two icons (the demo subtree lives inside the gallery)
    expect(gallery?.querySelectorAll('svg[data-jx-icon]').length).toBe(8);
    // the equivalence pair renders the SAME glyph: the built-in check
    // cell and the lucide:check cell carry byte-equal svg innards
    const builtIn = gallery?.querySelector('[data-channel-cell="check"] svg[data-jx-icon]');
    const equivalence = gallery?.querySelector('[data-channel-cell="lucide:check"] svg[data-jx-icon]');
    expect(builtIn).toBeTruthy();
    expect(equivalence).toBeTruthy();
    expect(equivalence!.innerHTML).toBe(builtIn!.innerHTML);
    // the live alias demo: the full literal + the bare alias, one payload each
    const aliasDemo = container.querySelector('[data-alias-demo]');
    expect(aliasDemo?.querySelectorAll('svg[data-jx-icon]').length).toBe(2);
  });

  it('documents the define-your-own-channel section (the myco: example)', () => {
    const { container } = render(IconsPage);
    const section = container.querySelector('[data-define-channel-docs]');
    expect(section, 'the define-channel section').toBeTruthy();
    const text = section?.textContent ?? '';
    expect(text).toContain('defineIconChannel');
    expect(text).toContain("resolvePeerFile('my-icons'");
    expect(text).toContain('myco');
    expect(text).toContain('/^[a-z][a-z0-9]*$/');
    expect(text).toContain('reserved');
    expect(text).toContain('inherits the built-ins');
    expect(text).toContain('guarantees by construction');
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
