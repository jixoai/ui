/**
 * The search-corpus generator gates (search-corpus change,
 * 2026-09-02): structure-not-guessed (the SectionCard/CodeBlock
 * markers become sections/blocks), noindex/exclude honored,
 * byte-determinism (only generatedAt moves), and the slug law
 * CONVERGES with the runtime outline derivation (the harvest reads
 * ids only because it computes exactly what the runtime stamps).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  generateSearchCorpus,
  assertNoStraySearchWrites,
  harvestPage,
  headingIds,
} from '../../../registry/files/search-corpus/search-corpus.mjs';
import { deriveTocOutline } from '../src/lib/toc-outline';
import { JSDOM } from 'jsdom';

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
    // the fallback lock (ontology R1): unmarked pages keep today's
    // derivation — role/ordering ship as the schema defaults
    expect(section.role).toBe('section');
    expect(section.ordering).toBe(null);
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

/* ── ontology R1 (2026-09-03): DECLARED MARKERS WIN over shape guesses.
      The line's identity (role/ordering) and its summary are READ from
      the component's own zones; the point's kind is READ from the
      data-kind registry mark. Shape heuristics survive only for
      headings/roots without declarations — page-by-page retirement. ── */
describe('ontology R1 — declared markers win', () => {
  it('a declared section harvests role, ordering and summary from its host zones', async () => {
    const page = await harvestPage(
      PAGE(`
        <section data-jx-section data-role="entry" data-ordering="alpha">
          <div data-jx-section-header>
            <p>verb</p>
            <div><h2>Apple</h2><p>a fruit entry</p></div>
          </div>
          <hr data-jx-separator aria-hidden="true" />
          <div data-jx-section-body><p>body prose here</p></div>
        </section>`),
      'r1-declared.html',
    );
    const section = page.sections[0]!;
    expect(section.role).toBe('entry');
    expect(section.ordering).toBe('alpha');
    // the title block's LAST <p> is the summary — the eyebrow above it
    // is never mistaken for one
    expect(section.summary).toBe('a fruit entry');
  });

  it('a declared host without summary stays honest (no eyebrow harvest)', async () => {
    const page = await harvestPage(
      PAGE(`
        <section data-jx-section data-role="note">
          <div data-jx-section-header>
            <p>eyebrow only</p>
            <div><h2>Marginal</h2></div>
          </div>
          <div data-jx-section-body><p>note body</p></div>
        </section>`),
      'r1-nosummary.html',
    );
    expect(page.sections[0]!.role).toBe('note');
    expect(page.sections[0]!.summary).toBe('');
  });

  it('a default host declares section/absent ordering; a bare heading keeps the fallback path', async () => {
    const page = await harvestPage(
      PAGE(`
        <section data-jx-section>
          <div data-jx-section-header><div><h2>Plain</h2><p>declared summary</p></div></div>
          <div data-jx-section-body></div>
        </section>
        <h2>Bare</h2><p>fallback summary</p>`),
      'r1-defaults.html',
    );
    const [declared, bare] = page.sections;
    expect(declared!.role).toBe('section');
    expect(declared!.ordering).toBe(null);
    expect(declared!.summary).toBe('declared summary');
    expect(bare!.role).toBe('section');
    expect(bare!.summary).toBe('fallback summary');
  });

  it('data-kind declares the block kind regardless of tag shape (open registry)', async () => {
    const page = await harvestPage(
      PAGE(`
        <h2>Root</h2>
        <figure data-kind="code">
          <figcaption><span>odd shape</span></figcaption>
          <pre data-lang="py"><code>x = 1</code></pre>
        </figure>
        <div data-kind="math"><code>e = mc^2</code></div>`),
      'r1-kind.html',
    );
    const section = page.sections[0]!;
    expect(section.blocks.map((b) => b.kind)).toEqual(['code', 'math']);
    const code = section.blocks[0]!;
    expect(code.lang).toBe('py');
    expect(code.label).toBe('odd shape');
    expect(section.blocks[1]!.text).toContain('e = mc^2');
  });
});

/* ── ontology R2 (2026-09-05): numbers, edges and the TWO-PASS
      pre-scan (design §4). The harvest consumes the float/reference
      emissions ADDITIVELY — number/refids/citedIn are optional fields,
      omitted (never null) when absent; unmarked pages stay
      byte-identical. Pass one indexes referenceable targets
      ([data-jx-section][id] numbered-or-not ∪ [data-jx-figure][id]
      [data-number]); pass two projects data-ref-to → refids[] with
      first-occurrence dedup, filtering edges whose target is not in
      the index (not-yet is not missing — a forward SSR fallback edge
      still harvests). ── */
describe('ontology R2 — numbers, edges and the two-pass pre-scan', () => {
  it('a numbered page harvests numbers, citedIn and edges; the wrapper contributes no block', async () => {
    const page = await harvestPage(
      PAGE(`
        <section data-jx-section id="method" data-number="3">
          <div data-jx-section-header><div><h2>Method</h2><p>how we measure</p></div></div>
          <div data-jx-section-body>
            <p>see <a href="#eq-two" data-ref-to="eq-two">Eq (3.2)</a></p>
            <figure data-jx-figure="equation" id="eq-one" data-number="3.1">
              <figcaption><span data-jx-figure-label>Equation</span> <span data-jx-number>3.1</span></figcaption>
              <pre data-lang="ts"><code>a = 1</code></pre>
            </figure>
            <figure data-jx-figure="equation" id="eq-two" data-number="3.2" data-cited-in='["§ 3.1"]'>
              <figcaption><span data-jx-figure-label>Equation</span> <span data-jx-number>3.2</span></figcaption>
              <pre data-lang="ts"><code>b = 2</code></pre>
            </figure>
          </div>
        </section>`),
      'r2-numbered.html',
    );
    const section = page.sections[0]!;
    expect(section.number).toBe('3'); // the section number rides its host
    // the [data-jx-figure] wrappers contribute NO blocks (taxonomy
    // priority — the wrapped points keep their own markers)
    expect(section.blocks.map((b) => b.kind)).toEqual(['prose', 'code', 'code']);
    const [prose, eqOne, eqTwo] = section.blocks;
    expect(eqOne!.number).toBe('3.1');
    expect(eqTwo!.number).toBe('3.2');
    expect(eqOne!.citedIn).toBeUndefined();
    expect(eqTwo!.citedIn).toEqual(['§ 3.1']); // JSON array payload, order kept
    expect(prose!.refids).toEqual(['eq-two']); // the edge projects onto its paragraph
    expect(eqOne!.refids).toBeUndefined(); // no field when no edge
  });

  it('the five projection branches each hold (inline / bare-preceded / bare-hostless / missing target / two-block figure)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const page = await harvestPage(
        PAGE(`
          <h2>Branches</h2>
          <p>inline <a href="#fig-2" data-ref-to="fig-2">Listing 7.1</a> twice <a href="#fig-2" data-ref-to="fig-2">it</a></p>
          <p>dead <a href="#ghost" data-ref-to="ghost">??(ghost)</a></p>
          <a href="#sec" data-ref-to="sec">bare after prose</a>
          <figure data-jx-figure="listing" id="fig-2" data-number="7.1">
            <pre data-lang="sh"><code>one</code></pre>
            <pre data-lang="sh"><code>two</code></pre>
          </figure>
          <a href="#fig-2" data-ref-to="fig-2">bare after block</a>
          <h2>Hostless</h2>
          <a href="#sec" data-ref-to="sec">bare with no precedent</a>
          <section data-jx-section id="sec"><div data-jx-section-header><div><h2>Sink</h2></div></div><div data-jx-section-body><p>sink body</p></div></section>`),
        'r2-branches.html',
      );
      const [branches, hostless] = page.sections;
      // branch 1 INLINE (deduped, first-occurrence order) + branch 4
      // MISSING TARGET (ghost filtered) + branch 2 BARE-PRECEDED (the
      // open prose window is the nearest preceding stream item)
      expect(branches!.blocks[0]!.refids).toEqual(['fig-2', 'sec']);
      // branch 5 TWO-BLOCK FIGURE: number on the FIRST point block only
      expect(branches!.blocks[1]!.number).toBe('7.1');
      expect(branches!.blocks[2]!.number).toBeUndefined();
      // a bare edge after a block hangs on that block
      expect(branches!.blocks[2]!.refids).toEqual(['fig-2']);
      // branch 3 BARE-HOSTLESS: warns (naming the id) and contributes nothing
      expect(hostless!.blocks).toEqual([]);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]![0]).toContain('sec');
    } finally {
      warn.mockRestore();
    }
  });

  it("a forward SSR edge survives the static harvest; a nowhere-target edge filters", async () => {
    const page = await harvestPage(
      PAGE(`
        <h2>Forward</h2>
        <p>see <a href="#eq-late" data-ref-to="eq-late">??(eq-late)</a> before it renders, and <a href="#nowhere" data-ref-to="nowhere">??(nowhere)</a> never</p>
        <figure data-jx-figure="equation" id="eq-late" data-number="1.1">
          <figcaption><span data-jx-figure-label>Equation</span> <span data-jx-number>1.1</span></figcaption>
          <pre><code>e = mc^2</code></pre>
        </figure>`),
      'r2-forward.html',
    );
    // pass one indexed the LATER equation; pass two projected the edge —
    // the fallback anchor's claim is complete without hydration, while
    // the nowhere edge (target absent from the whole document) filters
    expect(page.sections[0]!.blocks[0]!.refids).toEqual(['eq-late']);
  });

  it('an unnumbered Section is targetable; an unnumbered Figure is not (never a legal target)', async () => {
    const page = await harvestPage(
      PAGE(`
        <section data-jx-section id="preface">
          <div data-jx-section-header><div><h2>Preface</h2></div></div>
          <div data-jx-section-body><p>see <a href="#preface" data-ref-to="preface">Preface</a> itself</p></div>
        </section>
        <figure data-jx-figure="figure" id="unnumbered-fig">
          <figcaption><span data-jx-figure-label>Figure</span></figcaption>
          <pre><code>z</code></pre>
        </figure>
        <h2>Appendix</h2>
        <figure data-jx-figure="figure" id="unnumbered-fig-2">
          <figcaption><span data-jx-figure-label>Figure</span></figcaption>
          <pre><code>z</code></pre>
        </figure>
        <p>dead <a href="#unnumbered-fig-2" data-ref-to="unnumbered-fig-2">??(unnumbered-fig-2)</a></p>`),
      'r2-unnumbered.html',
    );
    const [preface, tail] = page.sections;
    // the index carries [data-jx-section][id] regardless of numbering…
    expect(preface!.blocks[0]!.refids).toEqual(['preface']);
    expect('number' in preface!).toBe(false); // unnumbered = field omitted, never null
    // …but an unnumbered Figure stays out of the index: its edge
    // filters and its wrapped block projects no number
    expect(tail!.blocks.map((b) => b.kind)).toEqual(['code', 'prose']);
    expect('number' in tail!.blocks[0]!).toBe(false);
    expect(tail!.blocks[1]!.refids).toBeUndefined();  });

  it('the projection is additive: unmarked pages keep the exact pre-R2 shape, R2 pages regenerate byte-stable', async () => {
    // pre-R2 page: no R2 attribute anywhere — the schema is unchanged
    const unmarked = await harvestPage(PAGE('<h2>Old</h2><p>plain page</p>'), 'r2-old.html');
    expect(Object.keys(unmarked.sections[0]!)).toEqual([
      'id',
      'heading',
      'level',
      'role',
      'ordering',
      'summary',
      'blocks',
    ]);
    expect(Object.keys(unmarked.sections[0]!.blocks[0]!)).toEqual(['kind', 'text']);
    // the R2 page itself is deterministic across harvests (the sha
    // stability gate's harvest-side floor; the corpus-level gate runs
    // in "the corpus artifact" above)
    const html = PAGE(
      `<h2>Det</h2><p>x <a href="#d1" data-ref-to="d1">Eq (1)</a></p><figure data-jx-figure="equation" id="d1" data-number="1" data-cited-in='["§ 1"]'><pre><code>q</code></pre></figure>`,
    );
    const first = JSON.stringify(await harvestPage(html, 'r2-det.html'));
    const second = JSON.stringify(await harvestPage(html, 'r2-det.html'));
    expect(first).toBe(second);
    expect(first).toContain('"number":"1"');
    expect(first).toContain('"citedIn":["§ 1"]');
    expect(first).toContain('"refids":["d1"]');
  });
});

describe('the corpus artifact', () => {

  const write = (rel: string, html: string): void => {
    const full = join(dir, ...rel.split('/'));
    mkdirSync(join(full, '..'), { recursive: true });
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

  it('a stray writer in /search/ fails loud naming the offender (one generation point)', async () => {
    write('a.html', PAGE('<h2>A</h2><p>ay</p>'));
    write('search/stray.json', '{}');
    await expect(generateSearchCorpus(dir, {})).rejects.toThrow(/stray writer.*search\/stray\.json/);
    // the audit export stands alone too (build-site calls it end-of-main)
    expect(() => assertNoStraySearchWrites(dir)).toThrow(/search\/stray\.json/);
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
      <h3>Deep &amp; deeper!!</h3>
      <div id="usage"><h2>Usage</h2></div>
      <div id="usage"><h2>Usage</h2></div>`);
    const page = await harvestPage(html, 'c.html');
    // the runtime side: jsdom stamps ids on a live DOM
    const host = document.createElement('div');
    host.innerHTML = html.match(/<main>([\s\S]*)<\/main>/)![1]!;
    document.body.appendChild(host);
    const outline = deriveTocOutline(host, { levels: [2, 3] });
    expect(page.sections.map((s) => s.id)).toEqual(outline.map((entry) => entry.id));
    expect(page.sections[0]!.id).toBe('kept'); // existing ids win on both sides
    expect(page.sections[2]!.id).toMatch(/^section-/); // CJK positional fallback
    // the wrapper blind spot (anchor law v2): id-bearing ancestors are
    // NOT the heading's address and never join the dedup set — the
    // stamper owns the anchor (chip/press-button usage-2 regression)
    expect(page.sections.slice(6).map((s) => s.id)).toEqual(['usage', 'usage-2']);
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

/* ── the live convergence gate (anchor law v2): when a built public/
      tree exists, EVERY corpus section id must equal what the REAL
      runtime stamper (deriveTocOutline) would write on that page —
      catches law drift the fixture tests cannot (fresh clones without
      a build skip this; the build pipeline itself always has one) ── */
describe('the live corpus converges with the real stamper (built pages)', () => {
  const pub = join(import.meta.dirname, '../../..', 'public');
  const hasCorpus = existsSync(join(pub, 'search', 'corpus.json'));

  function walkHtml(dir: string, base = ''): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      const rel = base === '' ? name : `${base}/${name}`;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) out.push(...walkHtml(full, rel));
      else if (name.endsWith('.html')) out.push(rel);
    }
    return out;
  }

  it.skipIf(!hasCorpus)(
    'corpus section ids === deriveTocOutline output on every built page',
    { timeout: 120_000 },
    () => {
      const corpus = JSON.parse(readFileSync(join(pub, 'search/corpus.json'), 'utf8'));
      const files = new Set(walkHtml(pub));
      let checked = 0;
      const divergences: string[] = [];
      for (const page of corpus.pages as { url: string; sections: { id: string; heading: string }[] }[]) {
        const rel = page.url === '/' ? 'index.html' : page.url.slice(1);
        const html = readFileSync(join(pub, rel), 'utf8');
        const dom = new JSDOM(html);
        const host = (dom.window.document.querySelector('main') ?? dom.window.document.body) as HTMLElement;
        const stamped = deriveTocOutline(host, { levels: [2, 3] }).map((e) => ({ id: e.id, heading: e.label }));
        let si = 0;
        for (const sec of page.sections) {
          while (si < stamped.length && stamped[si]!.heading !== sec.heading) si++;
          if (si >= stamped.length) {
            divergences.push(`${page.url}#${sec.id}: heading "${sec.heading}" not in outline`);
            break;
          }
          if (stamped[si]!.id !== sec.id)
            divergences.push(`${page.url}#${sec.id}: stamper says "${stamped[si]!.id}" ("${sec.heading}")`);
          si++;
          checked++;
        }
      }
      console.log(`live convergence: checked ${checked} sections over ${files.size} built files`);
      expect(divergences, divergences.join('\n')).toEqual([]);
    },
  );
});
