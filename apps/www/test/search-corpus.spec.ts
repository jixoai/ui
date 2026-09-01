/**
 * The search-corpus generator gates (search-corpus change,
 * 2026-09-02): structure-not-guessed (the SectionCard/CodeBlock
 * markers become sections/blocks), noindex/exclude honored,
 * byte-determinism (only generatedAt moves), and the slug law
 * CONVERGES with the runtime outline derivation (the harvest reads
 * ids only because it computes exactly what the runtime stamps).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  generateSearchCorpus,
  harvestPage,
  headingIds,
} from '../../../registry/files/search-corpus/search-corpus.mjs';
import { deriveTocOutline } from '../src/lib/toc-outline';

const PAGE = (body: string, head = ''): string =>
  `<!DOCTYPE html><html><head><title>P · site</title><meta name="description" content="the page description">${head}</head><body><main>${body}</main></body></html>`;

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'search-corpus-'));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('harvestPage — structure, not guesses', () => {
  it('SectionCard/CodeBlock shapes become sections + blocks with industry meta', async () => {
    const page = await harvestPage(
      PAGE(`
        <section data-family="usage">
          <div><span>eyebrow</span><h2>The transaction</h2><p>prepareSnapshot 是一个事务</p></div>
          <div>
            <p>prose one two three</p>
            <figure class="jx-code-card">
              <figcaption><span>the layer, assembled</span></figcaption>
              <pre data-lang="ts"><code><span class="line">const a = 1;</span><span class="line">const b = 2;</span></code></pre>
            </figure>
            <table><tr><td>cell text</td></tr></table>
          </div>
        </section>`),
      'docs/x.html',
    );
    expect(page.url).toBe('/docs/x.html');
    expect(page.title).toBe('P · site'); // no h1 → <title> fallback (extractPage law)
    const section = page.sections[0]!;
    expect(section.id).toBe('the-transaction');
    expect(section.heading).toBe('The transaction');
    expect(section.summary).toBe('prepareSnapshot 是一个事务');
    expect(section.blocks.map((b) => b.kind)).toEqual(['prose', 'code', 'table']);
    const code = section.blocks[1]!;
    expect(code.lang).toBe('ts');
    expect(code.label).toBe('the layer, assembled');
    expect(code.text).toContain('const b = 2;');
  });

  it('data-toc-skip subtrees and pre-heading prose stay out of the sections', async () => {
    const page = await harvestPage(
      PAGE(`
        <p>orphan prose before any heading</p>
        <div data-toc-skip><h2>Ghost</h2><p>hidden</p></div>
        <div><h2>Real</h2><p>visible</p></div>`),
      'a.html',
    );
    expect(page.sections.map((s) => s.heading)).toEqual(['Real']);
  });
});

describe('the corpus artifact', () => {
  const write = (rel: string, html: string): void => {
    const full = join(dir, ...rel.split('/'));
    writeFileSync(full, html, { flag: 'w' });
  };

  it('is byte-deterministic (only generatedAt moves) and sorted by url', async () => {
    write('b.html', PAGE('<h2>B</h2><p>bee</p>'));
    write('a.html', PAGE('<h2>A</h2><p>ay</p>'));
    const strip = (json: string): string =>
      JSON.stringify({ ...JSON.parse(json), generatedAt: undefined });
    const first = await generateSearchCorpus(dir, {});
    const jsonA = readFileSync(join(dir, first.corpusPath), 'utf8');
    const second = await generateSearchCorpus(dir, {});
    const jsonB = readFileSync(join(dir, second.corpusPath), 'utf8');
    expect(strip(jsonA)).toBe(strip(jsonB));
    const corpus = JSON.parse(jsonB);
    expect(corpus.pages.map((p: { url: string }) => p.url)).toEqual(['/a.html', '/b.html']);
  });

  it('honors noindex and exclude (the AI-layer omissions never leak into search)', async () => {
    write('keep.html', PAGE('<h2>Keep</h2><p>yes</p>'));
    write('secret.html', PAGE('<h2>No</h2><p>never</p>', '<meta name="robots" content="noindex">'));
    write('excluded.html', PAGE('<h2>Ex</h2><p>never</p>'));
    const report = await generateSearchCorpus(dir, { exclude: ['excluded.html'] });
    expect(report.skipped).toContain('secret.html');
    const corpus = JSON.parse(readFileSync(join(dir, report.corpusPath), 'utf8'));
    expect(corpus.pages.map((p: { url: string }) => p.url)).toEqual(['/keep.html']);
  });
});

describe('the slug law converges with the runtime outline', () => {
  it('harvest ids === deriveTocOutline ids across ascii, CJK, and duplicates', async () => {
    const html = PAGE(`
      <h2 id="kept">Explicit keeps</h2>
      <h2>Print verbs</h2>
      <h2>打印管线</h2>
      <h2>打印管线</h2>
      <h3>Deep &amp; deeper!!</h3>
      <h3>Deep &amp; deeper!!</h3>`);
    const page = await harvestPage(html, 'c.html');
    // the runtime side: jsdom stamps ids on a live DOM
    const host = document.createElement('div');
    host.innerHTML = html.match(/<main>([\s\S]*)<\/main>/)![1]!;
    document.body.appendChild(host);
    const outline = deriveTocOutline(host, { levels: [2, 3] });
    expect(page.sections.map((s) => s.id)).toEqual(outline.map((entry) => entry.id));
    expect(page.sections[0]!.id).toBe('kept'); // existing ids win on both sides
    expect(page.sections[2]!.id).toMatch(/^section-/); // CJK positional fallback
    host.remove();
  });

  it('headingIds dedupes exactly like the runtime (base-2 counters)', () => {
    const ids = headingIds([
      { label: 'Same', attrs: {} },
      { label: 'Same', attrs: {} },
      { label: '', attrs: {} }, // CJK-empty → positional
    ] as never);
    expect(ids).toEqual(['same', 'same-2', 'section-3']);
  });
});
