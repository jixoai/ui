/**
 * Markdown renderer contract suite (test/markdown-render.spec.ts,
 * 2026-09-06 — markdown-streaming tasks 2.5/2.2).
 *
 * The renderer owns the DOM outright: this suite pins the default AST →
 * registry/native map on a GFM kitchen sink, the DEFAULT-map security
 * floor (raw HTML stays literal text, unsafe link schemes never produce
 * anchors, image src must survive sanitizeImageSrc or the img is
 * omitted), the root hooks (data-jx-markdown, jx-pure scope class, rest
 * passthrough) and the components override seam (override wins for its
 * type, everything else keeps the default map, delegation flows through
 * the exported MarkdownNode). Streaming laws (cursor, keyed identity)
 * live in markdown-streaming.spec.ts. Assertions read the DOM only.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Markdown from '$lib/ui/markdown/markdown.svelte';
import LinkOverride from './fixtures/markdown-link-override.svelte';
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
  it('renders the GFM kitchen sink through native elements and registry parts', () => {
    const { container } = render(Markdown, { props: { source: KITCHEN_SINK } });
    const root = container.querySelector('[data-jx-markdown]')!;

    // heading ladder + inline emphasis recursion
    const h2 = root.querySelector('h2')!;
    expect(h2).not.toBeNull();
    expect(h2.textContent).toBe('Kitchen sink');
    expect(h2.querySelector('em')!.textContent).toBe('sink');

    // the emphasis family + the native inline-code chip
    const p = root.querySelector('p')!;
    expect(p.querySelector('strong')!.textContent).toBe('bold');
    expect(p.querySelector('em')!.textContent).toBe('italic');
    expect(p.querySelector('del')!.textContent).toBe('gone');
    expect(p.querySelector('code')!.textContent).toBe('chip');

    // link: href + optional title pass through as authored
    const anchor = p.querySelector('a')!;
    expect(anchor.getAttribute('href')).toBe('https://example.com');
    expect(anchor.getAttribute('title')).toBe('the title');

    // task lists: BOTH variants map to the same disabled native input
    const boxes = root.querySelectorAll('ul li input[type="checkbox"]');
    expect(boxes.length).toBe(2);
    for (const box of boxes) expect(box.hasAttribute('disabled')).toBe(true);
    expect((boxes[0] as HTMLInputElement).checked).toBe(true);
    expect((boxes[1] as HTMLInputElement).checked).toBe(false);
    expect(root.querySelectorAll('label').length).toBe(0); // plugin wrappers render nothing

    // blockquote + hr stay real elements
    expect(root.querySelector('blockquote p')!.textContent).toBe('quoted line');
    expect(root.querySelector('hr')).not.toBeNull();

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
    const ol = container.querySelector('ol')!;
    expect(ol).not.toBeNull();
    expect(ol.getAttribute('start')).toBe('5');
    expect(ol.querySelectorAll('li').length).toBe(2);
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

  it('renders inline html as literal text — interpolation escapes, zero {@html}', () => {
    const { container } = render(Markdown, {
      props: { source: 'Inline <b>bold</b> and a comment <!-- note -->' },
    });
    const root = container.querySelector('[data-jx-markdown]')!;
    expect(root.querySelector('b')).toBeNull();
    expect(root.textContent).toContain('<b>bold</b>');
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
