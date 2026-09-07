/**
 * Markdown renderer contract suite (test/markdown-render.spec.ts,
 * 2026-09-06 — markdown-streaming tasks 2.5/2.2; markdown-coverage
 * 2026-09-07 — the first-party map matrix, escape scoping, the
 * container-inner stack source guard, and the GitHub alert matrix).
 *
 * The renderer owns the DOM outright: this suite pins the AST →
 * registry-part map on a GFM kitchen sink (every remapped construct
 * asserts BOTH the valued data-jx-* hook and the native element the
 * component renders), the DEFAULT-map security floor (raw HTML stays
 * literal text, unsafe link schemes never produce anchors, image src
 * must survive sanitizeImageSrc or the img is omitted), the root hooks
 * (data-jx-markdown, jx-pure scope class, rest passthrough) and the
 * components override seam (override wins for its type, everything
 * else keeps the default map, delegation flows through the exported
 * MarkdownNode). Streaming laws (cursor, keyed identity) live in
 * markdown-streaming.spec.ts. Assertions read the DOM only.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Markdown from '$lib/ui/markdown/markdown.svelte';
import LinkOverride from './fixtures/markdown-link-override.svelte';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../..');
import { assertMarkdownDocShape, SSR_DOC } from './helpers/markdown-doc-shape';

const FENCE = '`'.repeat(3);

/** the GFM vocabulary the default map must render structurally */
const KITCHEN_SINK = [
  '## Kitchen *sink*',
  '',
  'Plain **bold**, *italic*, ~~gone~~, `chip`, [link](https://example.com "the title").',
  '',
  '- [x] done task',
  '- [ ] open task',
  '',
  '| Left | Center | Right |',
  '| :--- | :----: | ----: |',
  '| a | b | c |',
  '',
  FENCE + 'ts',
  'const value: number = 42;',
  FENCE,
  '',
  '> quoted line',
  '',
  '---',
  '',
  'Footnote ref[^1]',
  '',
  '[^1]: the note',
].join('\n');

describe('markdown — the default map', () => {
  it('renders the GFM kitchen sink through registry parts and native roots (hook + element pairs)', () => {
    const { container } = render(Markdown, { props: { source: KITCHEN_SINK } });
    const root = container.querySelector('[data-jx-markdown]')!;

    // heading ladder + inline emphasis recursion: the native h2 root
    // carries the Heading hook (the component IS the element)
    const h2 = root.querySelector('h2[data-jx-heading="2"]')!;
    expect(h2).not.toBeNull();
    expect(h2.textContent).toBe('Kitchen sink');
    expect(h2.querySelector('em[data-jx-text="em"]')!.textContent).toBe('sink');

    // the emphasis family rides the text sugars; the inline-code chip
    // is the InlineCode part (hook + native code root)
    const p = root.querySelector('p[data-jx-text="p"]')!;
    expect(p.querySelector('strong[data-jx-text="strong"]')!.textContent).toBe('bold');
    expect(p.querySelector('em[data-jx-text="em"]')!.textContent).toBe('italic');
    expect(p.querySelector('del[data-jx-text="del"]')!.textContent).toBe('gone');
    const chip = p.querySelector('code[data-jx-inline-code]')!;
    expect(chip.textContent).toBe('chip');

    // link: href + optional title pass through as authored; the hook
    // records external detection (absolute http(s))
    const anchor = p.querySelector('a[data-jx-link="external"]')!;
    expect(anchor.getAttribute('href')).toBe('https://example.com');
    expect(anchor.getAttribute('title')).toBe('the title');
    // the external suffix-icon lane (typography-context-and-parts §3):
    // the default glyph rides every external anchor, aria-hidden and
    // svg-only — anchor text assertions survive unchanged
    const lane = anchor.querySelector('span[data-jx-link-icon]')!;
    expect(lane).not.toBeNull();
    expect(lane.getAttribute('aria-hidden')).toBe('true');
    expect(lane.querySelector('svg[data-jx-icon]')).not.toBeNull();
    expect(anchor.textContent).toBe('link');

    // task lists: BOTH variants map to the same disabled native input
    const boxes = root.querySelectorAll('ul[data-jx-list="ul"] li input[type="checkbox"]');
    expect(boxes.length).toBe(2);
    for (const box of boxes) expect(box.hasAttribute('disabled')).toBe(true);
    expect((boxes[0] as HTMLInputElement).checked).toBe(true);
    expect((boxes[1] as HTMLInputElement).checked).toBe(false);
    expect(root.querySelectorAll('label').length).toBe(0); // plugin wrappers render nothing

    // blockquote rides the Blockquote part (outline rung, no label) +
    // hr is the Separator part behind its carrier div
    expect(root.querySelector('blockquote[data-jx-blockquote="outline"] p')!.textContent).toBe('quoted line');
    // …and the §2 default: the rule channel stamps shadow-4 (every
    // markdown quote flipped border→shadow — the Owner-mandated delta)
    expect(
      root.querySelector('blockquote[data-jx-blockquote="outline"]')!.getAttribute('data-jx-blockquote-rule'),
    ).toBe('shadow-4');
    const hr = root.querySelector('hr[data-jx-separator]')!;
    expect(hr).not.toBeNull();

    // footnote: inert degradation — <sup> marker + plain trailing block
    expect(root.querySelector('sup')!.textContent).toBe('1');
    expect(root.textContent).toContain('the note');
  });

  it('maps fenced code onto CodeCard with language and plain-first paint', () => {
    const { container } = render(Markdown, {
      props: { source: `${FENCE}ts\nconst value: number = 42;\n${FENCE}` },
    });
    const figure = container.querySelector('figure[data-kind="code"]')!;
    expect(figure).not.toBeNull();
    // the progressive-enhancement floor: the escaped plain sample is
    // already the code text before any async highlight resolves
    expect(figure.querySelector('pre code')!.textContent).toContain('const value: number = 42;');
    expect(figure.querySelector('pre')!.getAttribute('data-lang')).toBe('ts');
  });

  it('maps a fence without a language onto CodeCard as literal text', () => {
    const { container } = render(Markdown, {
      props: { source: `${FENCE}\nplain\n${FENCE}` },
    });
    expect(container.querySelector('pre')!.getAttribute('data-lang')).toBe('text');
  });

  it('maps tables through Table inside the neutral harvest carrier', () => {
    const { container } = render(Markdown, { props: { source: KITCHEN_SINK } });
    const root = container.querySelector('[data-jx-markdown]')!;

    // the semantically neutral wrapper is the marker carrier ONLY
    const carrier = root.querySelector('div[data-kind="table"]')!;
    expect(carrier).not.toBeNull();
    const figure = carrier.querySelector('figure.jx-table')!;
    expect(figure).not.toBeNull();
    const table = figure.querySelector('table')!;

    // generated thead: scope=col headers, alignment from the delimiter row
    const headers = table.querySelectorAll('thead th[scope="col"]');
    expect(headers.length).toBe(3);
    expect((headers[0] as HTMLElement).style.textAlign).toBe('left');
    expect((headers[1] as HTMLElement).style.textAlign).toBe('center');
    expect((headers[2] as HTMLElement).style.textAlign).toBe('right');

    // generated tbody: td[data-label] carries the header cell text (the
    // stack law's label source) and the same per-column alignment
    const firstRow = table.querySelector('tbody tr')!;
    const cells = firstRow.querySelectorAll('td');
    expect(cells.length).toBe(3);
    expect(cells[0]!.getAttribute('data-label')).toBe('Left');
    expect(cells[1]!.getAttribute('data-label')).toBe('Center');
    expect(cells[2]!.getAttribute('data-label')).toBe('Right');
    expect(cells[0]!.textContent).toBe('a');
    expect((cells[2] as HTMLElement).style.textAlign).toBe('right');
  });

  it('keeps the ordered-list start attribute from the first item number', () => {
    const { container } = render(Markdown, { props: { source: '5. five\n6. six' } });
    const ol = container.querySelector('ol[data-jx-list="ol"]')!;
    expect(ol).not.toBeNull();
    expect(ol.getAttribute('start')).toBe('5');
    expect(ol.querySelectorAll('li').length).toBe(2);
  });
});

describe('markdown — the first-party map matrix (markdown-coverage §3)', () => {
  it('each remapped node type renders its component root + valued hook', () => {
    const source = [
      '# One', // h1
      '###### Six', // h6
      '',
      'A paragraph with ==highlight==, ++insert++, H~2~O and x^2^ spans.',
      '',
      '- bullet item',
      '',
      '5. ordered item',
      '',
      '> plain quote',
      '',
      '[internal](/docs/x) and [external](https://example.com).',
      '',
      '---',
    ].join('\n');
    const { container } = render(Markdown, { props: { source } });
    const root = container.querySelector('[data-jx-markdown]')!;

    // heading level → native element + hook value (the level axis)
    expect(root.querySelector('h1[data-jx-heading="1"]')!.textContent).toBe('One');
    expect(root.querySelector('h6[data-jx-heading="6"]')!.textContent).toBe('Six');

    // paragraph → P; the seven marks → their sugar elements + form hooks
    expect(root.querySelector('p[data-jx-text="p"]')).not.toBeNull();
    expect(root.querySelector('mark[data-jx-text="mark"]')!.textContent).toBe('highlight');
    expect(root.querySelector('ins[data-jx-text="ins"]')!.textContent).toBe('insert');
    expect(root.querySelector('sub[data-jx-text="sub"]')!.textContent).toBe('2');
    expect(root.querySelector('sup[data-jx-text="sup"]')!.textContent).toBe('2');

    // list → List: unordered + ordered roots, both hooks
    expect(root.querySelector('ul[data-jx-list="ul"] li')!.textContent).toBe('bullet item');
    expect(root.querySelector('ol[data-jx-list="ol"] li')!.textContent).toBe('ordered item');

    // blockquote → Blockquote (outline rung)
    expect(root.querySelector('blockquote[data-jx-blockquote="outline"]')!.textContent).toContain('plain quote');

    // link → Link: external detection splits the hook value
    expect(root.querySelector('a[data-jx-link="internal"]')!.getAttribute('href')).toBe('/docs/x');
    expect(root.querySelector('a[data-jx-link="external"]')!.getAttribute('target')).toBe('_blank');

    // the §2/§3 part upgrades ride the map for free: the rule hook on
    // the quote, the suffix-icon lane on the external anchor (the
    // internal anchor keeps a bare lane-free anchor)
    expect(
      root.querySelector('blockquote[data-jx-blockquote="outline"]')!.getAttribute('data-jx-blockquote-rule'),
    ).toBe('shadow-4');
    expect(
      root.querySelector('a[data-jx-link="external"] [data-jx-link-icon] svg[data-jx-icon]'),
    ).not.toBeNull();
    expect(root.querySelector('a[data-jx-link="internal"] [data-jx-link-icon]')).toBeNull();

    // thematic_break → Separator behind the neutral carrier div
    const carrier = root.querySelector('div > hr[data-jx-separator]')!;
    expect(carrier).not.toBeNull();
    expect(carrier.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('inline_code maps onto InlineCode with lang frozen to text (the zero-work law)', () => {
    const { container } = render(Markdown, { props: { source: 'chip `const a = 1;` chip' } });
    const chip = container.querySelector('code[data-jx-inline-code]')!;
    expect(chip).not.toBeNull();
    expect(chip.textContent).toBe('const a = 1;');
    // plain forever: the frozen map never runs per-span grammar detection
    expect(chip.querySelector('span')).toBeNull();
  });
});

describe('markdown — escape scoping (markdown-coverage §2)', () => {
  it('box-owning block surfaces escape: blockquote/heading/list/separator/inline-code roots carry no-jx-pure', () => {
    const source = [
      '## Escape probe',
      '',
      '> quoted',
      '',
      '- item',
      '',
      'A `chip` inside prose.',
      '',
      '---',
    ].join('\n');
    const { container } = render(Markdown, { props: { source } });
    const root = container.querySelector('[data-jx-markdown]')!;
    expect(root.querySelector('h2[data-jx-heading]')!.classList.contains('no-jx-pure')).toBe(true);
    expect(root.querySelector('blockquote[data-jx-blockquote]')!.classList.contains('no-jx-pure')).toBe(true);
    expect(root.querySelector('ul[data-jx-list]')!.classList.contains('no-jx-pure')).toBe(true);
    expect(root.querySelector('code[data-jx-inline-code]')!.classList.contains('no-jx-pure')).toBe(true);
    expect(root.querySelector('hr[data-jx-separator]')!.classList.contains('no-jx-pure')).toBe(true);
  });

  it('face-composing members do NOT escape: P, the marks, and Link keep the face scope', () => {
    const source = 'Plain **bold**, *italic*, ~~gone~~, ==lit==, ++new++, H~2~O, x^2^ and [link](https://example.com).';
    const { container } = render(Markdown, { props: { source } });
    const root = container.querySelector('[data-jx-markdown]')!;
    const roots = [
      root.querySelector('p[data-jx-text="p"]')!,
      root.querySelector('strong[data-jx-text="strong"]')!,
      root.querySelector('em[data-jx-text="em"]')!,
      root.querySelector('del[data-jx-text="del"]')!,
      root.querySelector('mark[data-jx-text="mark"]')!,
      root.querySelector('ins[data-jx-text="ins"]')!,
      root.querySelector('sub[data-jx-text="sub"]')!,
      root.querySelector('sup[data-jx-text="sup"]')!,
      root.querySelector('a[data-jx-link]')!,
    ];
    for (const el of roots) {
      expect(el, el.tagName).not.toBeNull();
      expect(el.classList.contains('no-jx-pure')).toBe(false);
    }
  });
});

describe('markdown — the container-inner sibling stack (§2c, source-guard)', () => {
  it('the sheet owns the flush law\'s positive counterpart at (0,1,1)', () => {
    // jsdom does not apply the layered sheet's cascade to custom props
    // reliably — the file's own source-guard style reads the law where
    // it lives (the css source guard precedent in this suite)
    const css = readFileSync(resolve(repoRoot, 'registry/files/ui/markdown/markdown.css'), 'utf8');
    expect(css).toContain('[data-jx-markdown] :is(li, blockquote) > * + *');
    expect(css).toContain('margin-block-start: var(--jx-md-stack, 0.875rem);');
    // the flush pair still flanks it: edges zero, middles stack
    expect(css).toContain('[data-jx-markdown] :is(li, blockquote) > :first-child');
    expect(css).toContain('[data-jx-markdown] :is(li, blockquote) > :last-child');
    // the no-disc task-item rule survives the map change (container law)
    expect(css).toContain("li:has(> input[type='checkbox'])");
    expect(css).toContain('list-style: none');
    // the em heading ladder EMIGRATED: no dead :not(.no-jx-pure) rungs left
    expect(css).not.toContain('h1:not(.no-jx-pure');
    expect(css).not.toContain('font-size: 1.5em');
  });

  it('a two-paragraph list item and a two-paragraph quote keep BOTH paragraphs in the DOM (the stack payload)', () => {
    const source = [
      '- first paragraph',
      '',
      '  second paragraph',
      '',
      '> quote first',
      '>',
      '> quote second',
    ].join('\n');
    const { container } = render(Markdown, { props: { source } });
    const root = container.querySelector('[data-jx-markdown]')!;
    const li = root.querySelector('ul[data-jx-list="ul"] > li')!;
    expect(li.querySelectorAll('p[data-jx-text="p"]').length).toBe(2);
    const quote = root.querySelector('blockquote[data-jx-blockquote="outline"]')!;
    expect(quote.querySelectorAll('p[data-jx-text="p"]').length).toBe(2);
  });
});

describe('markdown — GitHub alert detection (markdown-coverage §4)', () => {
  // full site-utility class names — never a `jx-hue-` prefix for
  // concatenation (the hook-law B1 inventory scans test sources too)
  const ALERT_MATRIX: ReadonlyArray<[string, string, string, string]> = [
    ['note', 'jx-hue-info', 'Note', '> [!NOTE]\n> body'],
    ['tip', 'jx-hue-success', 'Tip', '> [!TIP]\n> body'],
    ['important', 'jx-hue-primary', 'Important', '> [!IMPORTANT]\n> body'],
    ['warning', 'jx-hue-warning', 'Warning', '> [!WARNING]\n> body'],
    ['caution', 'jx-hue-error', 'Caution', '> [!CAUTION]\n> body'],
  ];

  it.each(ALERT_MATRIX)('%s renders the tonal rung + the %s hue + the %s label', (_kind, hueClass, label, source) => {
    const { container } = render(Markdown, { props: { source } });
    const quote = container.querySelector('blockquote[data-jx-blockquote="tonal"]')!;
    expect(quote).not.toBeNull();
    expect(quote.classList.contains(hueClass)).toBe(true);
    // alert quotes carry the rule hook too (§2: variant-orthogonal)
    expect(quote.getAttribute('data-jx-blockquote-rule')).toBe('shadow-4');
    expect(quote.querySelector('[data-jx-blockquote-label]')!.textContent).toBe(label);
    // the marker line is stripped from the rendered body
    expect(quote.textContent).not.toContain('[!');
    expect(quote.textContent).toContain('body');
  });

  it('mixed-case markers trigger (GitHub behavior)', () => {
    const { container } = render(Markdown, { props: { source: '> [!note]\n> body' } });
    const quote = container.querySelector('blockquote[data-jx-blockquote="tonal"]')!;
    expect(quote.classList.contains('jx-hue-info')).toBe(true);
    expect(quote.querySelector('[data-jx-blockquote-label]')!.textContent).toBe('Note');
  });

  it('a marker sharing its first line with text does NOT trigger (mid-line rule)', () => {
    const { container } = render(Markdown, { props: { source: '> text [!NOTE] more' } });
    const quote = container.querySelector('blockquote[data-jx-blockquote="outline"]')!;
    expect(quote).not.toBeNull();
    expect(quote.querySelector('[data-jx-blockquote-label]')).toBeNull();
    expect(quote.textContent).toContain('[!NOTE]');
  });

  it('a marker NOT on the first line does NOT trigger', () => {
    const { container } = render(Markdown, { props: { source: '> first line\n> [!NOTE]\n> body' } });
    const quote = container.querySelector('blockquote[data-jx-blockquote="outline"]')!;
    expect(quote).not.toBeNull();
    expect(quote.querySelector('[data-jx-blockquote-label]')).toBeNull();
  });

  it('an unknown kind or half-typed marker stays a plain quote', () => {
    const a = render(Markdown, { props: { source: '> [!FOO]\n> body' } });
    expect(a.container.querySelector('blockquote[data-jx-blockquote="outline"]')).not.toBeNull();
    const b = render(Markdown, { props: { source: '> [!NO' } });
    expect(b.container.querySelector('blockquote[data-jx-blockquote="outline"]')).not.toBeNull();
  });

  it('a marker-only first text node with inline siblings strips to the siblings (the bold-follow shape)', () => {
    const { container } = render(Markdown, { props: { source: '> [!NOTE] **bold** body' } });
    const quote = container.querySelector('blockquote[data-jx-blockquote="tonal"]')!;
    expect(quote.querySelector('[data-jx-blockquote-label]')!.textContent).toBe('Note');
    const body = quote.querySelector('p[data-jx-text="p"]')!;
    expect(body.querySelector('strong[data-jx-text="strong"]')!.textContent).toBe('bold');
    expect(body.textContent).toContain('body');
    expect(quote.textContent).not.toContain('[!');
  });

  it('an empty-after-strip paragraph is dropped entirely (label-only alert)', () => {
    const { container } = render(Markdown, { props: { source: '> [!WARNING]' } });
    const quote = container.querySelector('blockquote[data-jx-blockquote="tonal"]')!;
    expect(quote.querySelector('[data-jx-blockquote-label]')!.textContent).toBe('Warning');
    expect(quote.querySelectorAll('p[data-jx-text="p"]').length).toBe(0); // the marker paragraph dropped
  });

  it('a multi-paragraph alert body recurses — every paragraph renders', () => {
    const source = '> [!TIP]\n> line one\n>\n> second para';
    const { container } = render(Markdown, { props: { source } });
    const quote = container.querySelector('blockquote[data-jx-blockquote="tonal"]')!;
    const paras = quote.querySelectorAll('p[data-jx-text="p"]');
    expect(paras.length).toBe(2);
    expect(paras[0]!.textContent).toBe('line one');
    expect(paras[1]!.textContent).toBe('second para');
  });

  it('a plain quote renders the outline rung with NO label row', () => {
    const { container } = render(Markdown, { props: { source: '> quoted line' } });
    const quote = container.querySelector('blockquote[data-jx-blockquote="outline"]')!;
    expect(quote).not.toBeNull();
    expect(quote.querySelector('[data-jx-blockquote-label]')).toBeNull();
    expect(quote.className).not.toMatch(/jx-hue-/); // no hue injection without an alert
  });

  it('nested alert quotes recurse through the map (inner blockquote detection)', () => {
    const { container } = render(Markdown, { props: { source: '> outer\n>\n> > [!NOTE]\n> > inner body' } });
    const quotes = container.querySelectorAll('blockquote');
    expect(quotes.length).toBe(2);
    const alert = container.querySelector('blockquote[data-jx-blockquote="tonal"]')!;
    expect(alert.querySelector('[data-jx-blockquote-label]')!.textContent).toBe('Note');
  });
});

describe('markdown — the default-map security floor', () => {
  it('renders a <script> block as visible literal text, never as an element', () => {
    const before = document.querySelectorAll('script').length;
    const { container } = render(Markdown, {
      props: { source: '<script>alert(1)</script>' },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    expect(container.querySelector('script')).toBeNull();
    expect(document.querySelectorAll('script').length).toBe(before);
    expect(root.textContent).toContain('<script>alert(1)</script>');
  });

  it('renders out-of-table html as literal text — interpolation escapes, zero {@html}', () => {
    // the equivalence law (markdown-coverage §8) whitelists b/strong/…;
    // span sits OUTSIDE the table, so it keeps the escaped-text floor.
    // The comment stays literal under every spelling.
    const { container } = render(Markdown, {
      props: { source: 'Inline <span>bold</span> and a comment <!-- note -->' },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    expect(root.querySelector('span')).toBeNull();
    expect(root.textContent).toContain('<span>bold</span>');
    expect(root.textContent).toContain('<!-- note -->');
  });

  it('demotes unsafe link schemes to plain text — no anchor is ever minted', () => {
    const { container } = render(Markdown, {
      props: {
        source: '[one](javascript:alert(1)) and [two](vbscript:msgbox) and [ok](https://example.com)',
      },
    });
    const anchors = container.querySelectorAll('a');
    expect(anchors.length).toBe(1); // only the safe scheme survives
    expect(anchors[0]!.getAttribute('href')).toBe('https://example.com');
  });

  it('scheme demotion holds across casings, embedded whitespace and data: payloads', () => {
    // the parser's validateLink normalizes before judging — probe-verified
    // behaviors, locked so a dependency bump that loosens any of them fails
    const { container } = render(Markdown, {
      props: {
        source: [
          '[a](JAVASCRIPT:alert(1))',
          '[b](JaVaScRiPt:alert(1))',
          '[c](java\tscript:alert(1))',
          '[d]( javascript:alert(1))',
          '[e](vbscript:msgbox)',
          '[f](data:text/html,x)',
          '[g](//protocol-relative.example/x)',
          '[ok](https://safe.example)',
        ].join(' and '),
      },
    });
    const anchors = container.querySelectorAll('a');
    expect(anchors.length).toBe(1); // every unsafe/protocol-relative form demotes to text
    expect(anchors[0]!.getAttribute('href')).toBe('https://safe.example');
    // demotion drops the URL ENTIRELY (label-only text — probe-verified,
    // stricter than showing the raw markdown): no scheme string, no
    // protocol-relative path ever reaches the DOM in any form
    const text = container.querySelector('[data-jx-markdown]')!.textContent!;
    expect(text).not.toContain('JAVASCRIPT');
    expect(text).not.toContain('javascript');
    expect(text).not.toContain('vbscript');
    expect(text).not.toContain('protocol-relative');
    expect(text).toContain('a'); // the demoted labels survive as plain text
  });

  it('a scheme broken by a newline can never reassemble — no anchor carries it', () => {
    // markdown-it's url normalization strips the control char; the link
    // that survives carries an EMPTY href (harmless self-reference), and
    // the scheme text never reaches the DOM as an executable href
    const { container } = render(Markdown, {
      props: { source: '[x](java\nscript:alert(1))' },
    });
    const anchors = container.querySelectorAll('a');
    const hrefs = [...anchors].map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.every((href) => !href.toLowerCase().replace(/[^a-z]/g, '').includes('javascript'))).toBe(true);
  });

  it('unclosed tag fragments and html comments stay literal text', () => {
    const { container } = render(Markdown, {
      props: { source: 'broken <script alert and <!-- hidden note --> tail' },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    expect(root.querySelector('script')).toBeNull();
    expect(root.textContent).toContain('<script alert');
    expect(root.textContent).toContain('<!-- hidden note -->');
  });

  it('a streaming table drops its all-empty trailing row shell (visual-review)', () => {
    // mid-stream: the delimiter row parsed, a row exists whose every
    // cell is empty — the not-yet-typed shell must not paint an empty
    // box row; it appears the moment any cell gains content
    const shell = render(Markdown, {
      props: {
        streaming: true,
        source: '| A | B |\n| --- | --- |\n| 1 | |\n|  |  |\n',
      },
    });
    const rows = shell.container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1); // only the row with content
    expect(rows[0]!.textContent).toContain('1');
  });

  it('renders bitmap data-URL images and omits sanitized-away srcs entirely', () => {
    const { container } = render(Markdown, {
      props: {
        source:
          '![png](data:image/png;base64,AAAA) and ![svg](data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=)',
      },
    });
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(1); // the SVG data URL sanitizes away → img omitted
    const img = images[0] as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    expect(img.getAttribute('alt')).toBe('png');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
  });
});

describe('markdown — registry chrome opts out of the face (visual-review)', () => {
  it('div[data-kind=table] carries no-jx-pure — the face bare-table laws never reach Table', () => {
    const { container } = render(Markdown, {
      props: { source: '| A | B |\n| --- | --- |\n| 1 | 2 |' },
    });
    const carrier = container.querySelector('[data-kind="table"]')!;
    expect(carrier.classList.contains('no-jx-pure')).toBe(true);
  });

  it('the mapped CodeCard carries no-jx-pure — the face pre/button laws never reach the card', () => {
    const fence = '`'.repeat(3);
    const { container } = render(Markdown, {
      props: { source: `${fence}ts\nconst a = 1;\n${fence}` },
    });
    const card = container.querySelector('.jx-code-card')!;
    expect(card.classList.contains('no-jx-pure')).toBe(true);
  });
});

describe('markdown — SSR parity client side (the pair of test/markdown-ssr.spec.ts)', () => {
  it('the client mount of the shared DOC runs the SAME shape assertions as the server frame', () => {
    // one assertion path, two runtimes: the node-env suite renders the
    // true prerender frame through svelte/server and runs
    // assertMarkdownDocShape on it; here the client mount of the SAME
    // DOC runs the SAME helper — structural parity is enforced, not
    // duplicated
    const streaming = render(Markdown, { props: { source: SSR_DOC, streaming: true } });
    assertMarkdownDocShape(streaming.container.querySelector('[data-jx-markdown]')!, { streaming: true });
    const staticDoc = render(Markdown, { props: { source: SSR_DOC, streaming: false } });
    assertMarkdownDocShape(staticDoc.container.querySelector('[data-jx-markdown]')!, { streaming: false });
  });
});

describe('markdown — the prose typography trio (typography pass)', () => {
  it('stamps data-jx-typography and defaults to standard', () => {
    const a = render(Markdown, { props: { source: 'x' } });
    const root = a.container.querySelector('[data-jx-markdown]')!;
    expect(root.getAttribute('data-jx-typography')).toBe('standard');
    const b = render(Markdown, { props: { source: 'x', typography: 'relaxed' } });
    expect(b.container.querySelector('[data-jx-markdown]')!.getAttribute('data-jx-typography')).toBe('relaxed');
  });

  it('the preset maps onto the ambient density slot for nested chrome (the context lane)', () => {
    const table = '| A |\n| --- |\n| 1 |';
    // relaxed → lg, compact → sm; the root itself never stamps data-density
    const a = render(Markdown, { props: { source: table, typography: 'relaxed' } });
    expect(a.container.querySelector('[data-jx-markdown] table')!.getAttribute('data-density')).toBe('lg');
    const b = render(Markdown, { props: { source: table, typography: 'compact' } });
    expect(b.container.querySelector('table')!.getAttribute('data-density')).toBe('sm');
    const c = render(Markdown, { props: { source: table } });
    expect(c.container.querySelector('[data-jx-markdown]')!.getAttribute('data-density')).toBeNull();
  });

  it('the css owns the trio (source guard): three presets, one stack token, the owl rhythm', () => {
    const css = readFileSync(resolve(repoRoot, 'registry/files/ui/markdown/markdown.css'), 'utf8');
    for (const preset of ['compact', 'standard', 'relaxed']) {
      expect(css, preset + ' preset token block').toContain(`[data-jx-typography='${preset}']`);
    }
    // the calibration trio rides one stack token
    expect(css.match(/--jx-md-stack:/g)?.length).toBe(3);
    // the container-content flush law (GitHub's li>p / :first-child posture)
    expect(css).toContain('[data-jx-markdown] :is(li, blockquote) > :first-child');
    // the prose leading un-short-circuit (face p{1.6} loses to inheritance)
    expect(css).toContain('[data-jx-markdown] p:not(.no-jx-pure, .no-jx-pure *) {\n    line-height: inherit;');
    // the collapse-immune rhythm: flow-root zeroing + the sibling stack
    expect(css).toContain('[data-jx-markdown][data-jx-typography] > * {');
    expect(css).toContain('display: flow-root');
    expect(css).toContain('[data-jx-markdown][data-jx-typography] > * + *');
    // headings breathe more above — the 1.75x breath (the em size ladder
    // itself emigrated into the heading component, markdown-coverage §1.2)
    expect(css).toContain('calc(var(--jx-md-stack, 0.875rem) * 1.75)');
    // task item alignment: the GitHub posture
    expect(css).toContain('vertical-align: middle');
  });
});

describe('markdown — root hooks', () => {
  it('stamps data-jx-markdown, the jx-pure scope class and merges the consumer class', () => {
    const { container } = render(Markdown, {
      props: { source: 'x', class: 'prose-doc' },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    expect(root.classList.contains('jx-pure')).toBe(true);
    expect(root.classList.contains('prose-doc')).toBe(true);
  });

  it('passes rest props and style through to the root verbatim', () => {
    const { container } = render(Markdown, {
      props: { source: 'x', 'aria-label': 'document body', style: '--jx-mark: 1' },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    expect(root.getAttribute('aria-label')).toBe('document body');
    expect(root.getAttribute('style')).toContain('--jx-mark');
  });
});

describe('markdown — the components override seam', () => {
  it('routes link nodes through the override and keeps the default map elsewhere', () => {
    const { container } = render(Markdown, {
      props: {
        source: '**kept default** and [glossary](https://example.com "the title")',
        components: { link: LinkOverride },
      },
    });
    const root = container.querySelector('[data-jx-markdown]')!;

    // the override won for its node type and received { node } raw
    const glossary = root.querySelector('a.glossary-link')!;
    expect(glossary).not.toBeNull();
    expect(glossary.getAttribute('data-glossary')).toBe('');
    expect(glossary.getAttribute('href')).toBe('https://example.com');

    // delegation: the override rendered children through MarkdownNode
    expect(glossary.textContent).toBe('glossary');

    // every other type kept the default map
    expect(root.querySelector('strong')!.textContent).toBe('kept default');
    expect(root.querySelector('a[title="the title"]')).toBeNull(); // not the default anchor
  });
});

describe('markdown — the html equivalence law (markdown-coverage §8)', () => {
  it('the two spellings render ONE component: <b>text</b> ≡ **text**', () => {
    const { container } = render(Markdown, {
      props: { source: 'some <b>text</b> and **md**' },
    });
    const strongs = container.querySelectorAll('strong[data-jx-text="strong"]');
    expect(strongs.length).toBe(2);
    // indistinguishable: same element, same hook, same class list
    expect(strongs[0]!.className).toBe(strongs[1]!.className);
    expect(strongs[0]!.textContent).toBe('text');
    expect(strongs[1]!.textContent).toBe('md');
  });

  it.each([
    ['<strong>s</strong>', 'strong'],
    ['<i>e</i>', 'em'],
    ['<em>e</em>', 'em'],
    ['<del>d</del>', 'del'],
    ['<s>d</s>', 'del'],
    ['<strike>d</strike>', 'del'],
    ['<ins>i</ins>', 'ins'],
    ['<u>i</u>', 'ins'],
    ['<mark>m</mark>', 'mark'],
    ['<sub>2</sub>', 'sub'],
    ['<sup>2</sup>', 'sup'],
  ])('%s routes to the %s mark', (html, mark) => {
    const { container } = render(Markdown, { props: { source: `x ${html} y` } });
    expect(container.querySelector(`[data-jx-text="${mark}"]`), html).not.toBeNull();
  });

  it('html code spans ride the InlineCode chip like `code` does', () => {
    const { container } = render(Markdown, { props: { source: 'a <code>c</code> b' } });
    const chips = container.querySelectorAll('code');
    expect(chips.length).toBe(1);
    expect(chips[0]!.textContent).toBe('c');
  });

  it('html kbd rides the Kbd component', () => {
    const { container } = render(Markdown, { props: { source: 'press <kbd>⌘</kbd> now' } });
    expect(container.querySelector('kbd[data-jx-kbd]')!.textContent).toBe('⌘');
  });

  it('html anchors become Links; unsafe schemes never mint an anchor', () => {
    const { container } = render(Markdown, {
      props: { source: '<a href="https://example.com">ok</a> and <a href="javascript:alert(1)">bad</a>' },
    });
    const anchors = container.querySelectorAll('a[data-jx-link]');
    expect(anchors.length).toBe(1);
    expect(anchors[0]!.getAttribute('href')).toBe('https://example.com');
    // the html-anchor equivalence lane rides the SAME suffix-icon
    // glyph as markdown-syntax links (one component, one lane)
    expect(anchors[0]!.querySelector('[data-jx-link-icon] svg[data-jx-icon]')).not.toBeNull();
    // the unsafe one renders its text with no anchor
    expect(container.querySelector('[data-jx-markdown]')!.textContent).toContain('bad');
  });

  it('<br> breaks the line like a hardbreak', () => {
    const { container } = render(Markdown, { props: { source: 'a<br>b' } });
    expect(container.querySelectorAll('br').length).toBe(1);
  });

  it('hostile tags degrade to escaped text — never markup, never handlers', () => {
    const { container } = render(Markdown, {
      props: {
        source:
          'safe <script>alert(1)</script> <iframe src="x"></iframe> <div onclick="p()">d</div> end',
      },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    expect(root.querySelector('script')).toBeNull();
    expect(root.querySelector('iframe')).toBeNull();
    expect(root.querySelector('div[onclick]')).toBeNull();
    expect(root.textContent).toContain('<script>alert(1)</script>');
  });
});

describe('markdown — details/summary ride the accordion (markdown-coverage §8.3)', () => {
  const TWO_DETAILS = [
    '<details>',
    '<summary>First</summary>',
    'first body',
    '</details>',
    '<details open>',
    '<summary>Second</summary>',
    '',
    '**second body parses markdown**',
    '',
    '</details>',
  ].join('\n');

  it('consecutive details runs merge into ONE Accordion group', () => {
    const { container } = render(Markdown, { props: { source: TWO_DETAILS } });
    const group = container.querySelector('[data-jx-markdown] > .jx-accordion');
    expect(group).not.toBeNull();
    const items = group!.querySelectorAll(':scope > details');
    expect(items.length).toBe(2);
    // summaries from the summary elements
    expect(items[0]!.querySelector('summary')!.textContent).toBe('First');
    expect(items[1]!.querySelector('summary')!.textContent).toBe('Second');
    // the open attribute carries through
    expect(items[0]!.hasAttribute('open')).toBe(false);
    expect(items[1]!.hasAttribute('open')).toBe(true);
    // the body parses its markdown
    expect(items[1]!.querySelector('strong[data-jx-text="strong"]')!.textContent).toBe(
      'second body parses markdown',
    );
  });

  it('a details separated by a paragraph frames itself as a group-of-one', () => {
    const { container } = render(Markdown, {
      props: { source: '<details>\n<summary>Solo</summary>\nbody\n</details>\n\nbetween\n\n<details>\n<summary>Other</summary>\nbody\n</details>' },
    });
    const groups = container.querySelectorAll('[data-jx-markdown] > .jx-accordion');
    expect(groups.length).toBe(2);
    expect(groups[0]!.querySelectorAll(':scope > details').length).toBe(1);
    // the separating paragraph is a ROOT-level P (accordion bodies hold
    // their own paragraphs — the root-child selector is the discriminant)
    expect(container.querySelector('[data-jx-markdown] > p')!.textContent).toBe('between');
  });

  it('a summary-less details renders the default disclosure label', () => {
    const { container } = render(Markdown, {
      props: { source: '<details>\nbody only\n</details>' },
    });
    expect(container.querySelector('summary')!.textContent).toBe('Details');
  });

  it('a nested details inside a body frames its own accordion face', () => {
    // the CONTIGUOUS form (no blank lines inside the outer body) keeps
    // the inner details as an AST child — CommonMark's html_block rule
    // fragments at blank lines (a documented boundary, design §8.5)
    const { container } = render(Markdown, {
      props: {
        source:
          '<details>\n<summary>Outer</summary>\nouter-prefix\n<details>\n<summary>Inner</summary>\ninner body\n</details>\nouter-suffix\n</details>',
      },
    });
    const outer = container.querySelector('[data-jx-markdown] > .jx-accordion')!;
    const inner = outer.querySelector('.jx-accordion .jx-accordion > details')!;
    expect(inner.querySelector('summary')!.textContent).toBe('Inner');
  });

  it('an unclosed details streams as the accordion tail, in place (L2)', () => {
    const chunks = ['<details>\n<summary>Live</summary>\npartial', '<details>\n<summary>Live</summary>\npartial body\n</details>'];
    const { container, rerender } = render(Markdown, {
      props: { source: chunks[0]!, streaming: true },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    const group = root.querySelector('.jx-accordion')!;
    expect(group.querySelector('summary')!.textContent).toBe('Live');
    // the close arrives while the block stays the tail: same DOM node
    rerender({ source: chunks[1]! });
    const settled = root.querySelector('.jx-accordion')!;
    expect(settled).toBe(group);
    expect(settled.querySelector('details > div, [data-jx-acc-body]')!.textContent).toContain('partial body');
  });
});

describe('markdown — task items ride the BARE Checkbox (the 2026-09-08 ruling)', () => {
  it('the marker IS the component: a direct-child input carrying jx-html-checkbox, disabled', () => {
    const { container } = render(Markdown, {
      props: { source: '- [x] done\n- [ ] todo' },
    });
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    expect(inputs.length).toBe(2);
    for (const input of inputs) {
      // the component's paint class — 真组件, not a bare native
      expect(input.classList.contains('jx-html-checkbox')).toBe(true);
      expect((input as HTMLInputElement).disabled).toBe(true);
      // NO wrapper chrome: the input is the DIRECT child (or inside
      // the one paragraph the parser wraps loose items in) the
      // container laws key on — BOTH li:has(> input) and
      // li:has(> p > input) forms are lawful shapes
      const parent = input.parentElement!.tagName;
      expect(parent === 'LI' || parent === 'P').toBe(true);
    }
    expect((inputs[0] as HTMLInputElement).checked).toBe(true);
    expect((inputs[1] as HTMLInputElement).checked).toBe(false);
    // the no-disc law holds with the component mounted
    const css = readFileSync(resolve(import.meta.dirname, '../src/lib/ui/markdown/markdown.css'), 'utf8');
    expect(css).toContain("li:has(> input[type='checkbox'])");
  });
});
