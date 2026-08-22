/**
 * llms-txt converter unit tests (test/llms-txt-converter.spec.ts).
 *
 * Locks the whitelist HTML→Markdown converter's fidelity floor set by the
 * Codex design review (2026-08-22): entities, nesting, tables, code,
 * dangerous links, bad input, CJK — deterministic, never leaking raw HTML.
 */
import { describe, expect, it } from 'vitest';
import {
  decodeEntities,
  extractPage,
  globToRegExp,
  htmlToMarkdown,
  pageUrlFromRel,
  parseFragment,
} from '../../../registry/files/llms-txt/llms-txt.mjs';

const md = (html: string) => htmlToMarkdown(parseFragment(html));

describe('decodeEntities', () => {
  it('decodes named, decimal, and hex entities', () => {
    expect(decodeEntities('a &amp; b &lt;c&gt; &#65;&#x42; &hellip;')).toBe('a & b <c> AB …');
  });
  it('leaves unknown entities intact', () => {
    expect(decodeEntities('&nope;')).toBe('&nope;');
  });
});

describe('htmlToMarkdown blocks', () => {
  it('converts headings, paragraphs, and rules', () => {
    expect(md('<h1>Title</h1><p>One <strong>bold</strong> and <em>it</em>.</p><hr/>'))
      .toBe('# Title\n\nOne **bold** and _it_.\n\n---\n');
  });

  it('keeps inline code and escalates fences-free backticks', () => {
    expect(md('<p>use <code>a`b</code> now</p>')).toBe('use ``a`b`` now\n');
  });

  it('nests lists with continuation indentation', () => {
    const out = md('<ul><li>one<ul><li>one.a</li></ul></li><li>two</li></ul>');
    expect(out).toContain('- one\n  - one.a\n- two');
  });

  it('renders ordered lists with their start index', () => {
    const out = md('<ol start="3"><li>third</li><li>fourth</li></ol>');
    expect(out).toContain('3. third\n4. fourth');
  });

  it('prefixes blockquotes line by line', () => {
    expect(md('<blockquote><p>a</p><p>b</p></blockquote>')).toBe('> a\n>\n> b\n');
  });

  it('strips chrome subtrees entirely', () => {
    const out = md('<div><nav>menu</nav><p>kept</p><script>evil()</script></div>');
    expect(out).toBe('kept\n');
  });

  it('strips interactive/semantic chrome: buttons, aria-hidden, inert regions', () => {
    const out = md(
      '<main><button>copy usage</button><span aria-hidden="true">icon</span>' +
        '<p>real text</p><div inert><span>accordion-usage.svelte</span><pre><code>x</code></pre></div></main>',
    );
    expect(out).toBe('real text\n');
  });
});

describe('tables', () => {
  it('renders a GFM grid with a header rule', () => {
    const out = md(
      '<table><thead><tr><th>k</th><th>v</th></tr></thead><tbody><tr><td>a</td><td>1</td></tr></tbody></table>',
    );
    expect(out).toBe('| k | v |\n| --- | --- |\n| a | 1 |\n');
  });

  it('escapes pipes inside cells', () => {
    const out = md('<table><tr><th>k</th></tr><tr><td>a|b</td></tr></table>');
    expect(out).toContain('| a\\|b |');
  });

  it('degrades colspan tables to rows instead of a wrong grid', () => {
    const out = md('<table><tr><th colspan="2">wide</th></tr></table>');
    expect(out).toContain('- wide');
    expect(out).not.toContain('| --- ');
  });
});

describe('code blocks', () => {
  it('detects language- prefixed classes and keeps lines', () => {
    const out = md('<pre class="language-ts"><code>const a = 1;\nconst b = 2;</code></pre>');
    expect(out).toBe('```ts\nconst a = 1;\nconst b = 2;\n```\n');
  });

  it('detects data-lang and lang- classes', () => {
    expect(md('<pre><code data-lang="py">x</code></pre>')).toContain('```py\n');
    expect(md('<pre class="lang-css"><code>x</code></pre>')).toContain('```css\n');
  });

  it('preserves shiki-style line spans and their newlines', () => {
    const out = md(
      '<pre class="language-html"><code><span class="line"><span>&lt;p&gt;</span></span>\n<span class="line"><span>text</span></span></code></pre>',
    );
    expect(out).toBe('```html\n<p>\ntext\n```\n');
  });

  it('inserts newlines between ADJACENT line spans the markup did not separate', () => {
    const out = md(
      '<pre class="language-ts"><code><span class="line">one</span><span class="line">two</span></code></pre>',
    );
    expect(out).toBe('```ts\none\ntwo\n```\n');
  });

  it('keeps 3+ blank lines inside fenced code (collapse never enters fences)', () => {
    const out = md('<pre><code>a\n\n\n\nb</code></pre>');
    expect(out).toBe('```\na\n\n\n\nb\n```\n');
  });

  it('keeps leading/trailing newlines in pre blocks verbatim', () => {
    // full raw fidelity: fenced blocks are sheltered from the global
    // blank-line collapse, so leading/trailing newlines survive intact
    const out = md('<pre class="language-ts"><code>\n\nfirst\nlast\n\n</code></pre>');
    expect(out).toBe('```ts\n\n\nfirst\nlast\n\n```\n');
  });

  it('escalates the fence when the code contains backticks', () => {
    const out = md('<pre><code>inline `` tick</code></pre>');
    expect(out).toContain('```\ninline `` tick\n```\n');
    const nested = md('<pre><code>``` fence inside</code></pre>');
    expect(nested.startsWith('````')).toBe(true);
  });
});

describe('links and images', () => {
  it('keeps http(s), mailto, and fragment hrefs', () => {
    const out = md('<p><a href="https://x.io">x</a> <a href="mailto:a@b.io">m</a> <a href="#sec">s</a></p>');
    expect(out).toContain('[x](https://x.io)');
    expect(out).toContain('[m](mailto:a@b.io)');
    expect(out).toContain('[s](#sec)');
  });

  it('resolves relative hrefs against the page base url', () => {
    // baseUrl mirrors the generator's page URL (no trailing slash), so
    // ../b.html from /docs/install resolves against the /docs parent.
    const out = htmlToMarkdown(parseFragment('<p><a href="../b.html">rel</a></p>'), {
      baseUrl: 'https://x.io/docs/install',
    });
    expect(out).toContain('[rel](https://x.io/b.html)');
  });

  it('drops javascript: links to plain text', () => {
    const out = md('<p><a href="javascript:alert(1)">click</a></p>');
    expect(out).toBe('click\n');
  });

  it('renders images, but data: URIs degrade to alt text', () => {
    expect(md('<p><img src="/i.png" alt="diagram"/></p>')).toContain('![diagram](/i.png)');
    expect(md('<p><img src="data:image/png;base64,AAAA" alt="pic"/></p>')).toBe('pic\n');
  });
});

describe('whitespace and content boundaries', () => {
  it('collapses prose whitespace but never merges sibling blocks', () => {
    const out = md('<div>alpha</div><div>beta</div>');
    expect(out).toBe('alpha\n\nbeta\n');
  });

  it('keeps CJK text verbatim', () => {
    expect(md('<p>中文 内容 保持</p>')).toBe('中文 内容 保持\n');
  });

  it('is deterministic for repeated runs', () => {
    const html = '<h2>H</h2><ul><li>a</li><li>b</li></ul><p>x &amp; y</p>';
    expect(md(html)).toBe(md(html));
  });
});

describe('extractPage', () => {
  const page = (body: string, head = '') =>
    extractPage(`<html><head><title>T · site</title>${head}</head><body><nav>menu</nav><main><h1>Heading one</h1>${body}</main></body></html>`);

  it('prefers main over body and strips chrome', () => {
    const { contentNode } = page('<p>content</p>');
    expect(htmlToMarkdown(contentNode)).toBe('# Heading one\n\ncontent\n');
  });

  it('falls back to body when main is absent', () => {
    const { contentNode } = extractPage('<body><p>only</p></body>');
    expect(htmlToMarkdown(contentNode)).toBe('only\n');
  });

  it('collects title, description, and h1', () => {
    const pageData = page('<p>x</p>', '<meta name="description" content="d1"/>');
    expect(pageData.title).toBe('T · site');
    expect(pageData.description).toBe('d1');
    expect(pageData.h1).toBe('Heading one');
  });

  it('flags noindex pages', () => {
    expect(page('<p>x</p>', '<meta name="robots" content="noindex, nofollow"/>').noindex).toBe(true);
    expect(page('<p>x</p>').noindex).toBe(false);
  });
});

describe('url + glob mapping', () => {
  it('maps html paths to canonical page urls', () => {
    expect(pageUrlFromRel('index.html')).toBe('/');
    expect(pageUrlFromRel('docs/index.html')).toBe('/docs/');
    expect(pageUrlFromRel('a/b.html')).toBe('/a/b');
  });

  it('globs: ** spans separators, * does not', () => {
    expect(globToRegExp('**/*.html').test('a/b/c.html')).toBe(true);
    expect(globToRegExp('components/*.html').test('components/a/b.html')).toBe(false);
    expect(globToRegExp('components/**').test('components/a/b.html')).toBe(true);
    expect(globToRegExp('*.html').test('index.html')).toBe(true);
  });
});
