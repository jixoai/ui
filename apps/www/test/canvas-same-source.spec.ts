/**
 * The canvas same-source drift gate (typography-context-and-parts
 * design §7, Lane D).
 *
 * Two surfaces:
 *   1. THE DRIFT GATE — for every pilot page, every id authored on a
 *      <ComponentCanvas> is extracted, every resolveRawCode('…') call
 *      in the page source names a real id, and each extracted block
 *      carries an inline snapshot (the human-reviewable drift proof:
 *      editing a canvas's children changes the snapshot; editing the
 *      hand-authored usage away is impossible — there is none).
 *      markdown.html stays opted out (the stretch ruling): no canvas
 *      ids until §6.4 identifier lifting lands.
 *   2. RENDERED PARITY THROUGH THE REAL PIPELINE — the blockquote page
 *      component itself is imported (its own
 *      `import … from 'virtual:jixoai-canvas/…'` walks canvasPlugin's
 *      resolveId with the PAGE as importer — the cross-page kill is
 *      satisfied by construction), then mounted: the Usage SectionCard
 *      shows the composed usage and the canvas drawer's usage file
 *      carries the SAME dedented markup (one source, two surfaces).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

// the PURE extractor through the package's ./canvas sub-entry (F3 —
// never the jixoai() umbrella; no wasm anywhere near this suite)
import { extractCanvases } from '@jixoai/ui-vite-plugin/canvas';

// the pilot page COMPONENT: importing it walks the real
// resolveId(importer=page) → load() → extract → emit pipeline
import BlockquotePage from '../src/routes/docs/components/blockquote.html/+page.svelte';

const routePage = (rel: string): string =>
  readFileSync(
    resolve(process.cwd(), 'src/routes/docs/components', rel, '+page.svelte'),
    'utf8',
  );

const PILOTS = ['blockquote.html', 'link.html', 'prose.html', 'list.html'];

/** per-file extraction cache (the source read is page-truth, not test fixture) */
const extractions = new Map<string, Promise<Awaited<ReturnType<typeof extractCanvases>>>>();
const extractionFor = (rel: string) => {
  if (!extractions.has(rel)) {
    extractions.set(
      rel,
      extractCanvases(routePage(rel), {
        filename: `src/routes/docs/components/${rel}/+page.svelte`,
      }),
    );
  }
  return extractions.get(rel)!;
};

/** the ids authored on the page's canvases (order-free, page-source read) */
function authoredCanvasIds(source: string): string[] {
  return [...source.matchAll(/<ComponentCanvas\b[^>]*?\bid="([^"]+)"/g)].map(
    (match) => match[1]!,
  );
}

/** the ids the page's resolveRawCode calls ask for */
function calledCanvasIds(source: string): string[] {
  return [...source.matchAll(/resolveRawCode\(\s*'([^']+)'\s*\)/g)].map(
    (match) => match[1]!,
  );
}

describe('canvas same-source — the pilot drift gate', () => {
  for (const rel of PILOTS) {
    describe(rel, () => {
      const source = routePage(rel);

      // the FIRST extraction anywhere in the run pays the svelte/compiler
      // bridge warm-up (a memoized dynamic import) — under full-suite load
      // that can outrun the 5s default; every later call reuses the module
      // (30ms). The timeout is the warm-up budget, not test logic.
      it('every authored canvas id is extracted (nothing skipped, nothing stale)', { timeout: 30_000 }, async () => {
        const extraction = await extractionFor(rel);
        expect([...extraction.ids].sort()).toEqual(
          authoredCanvasIds(source).sort(),
        );
      });

      it('every resolveRawCode call names a real id on this page', async () => {
        const extraction = await extractionFor(rel);
        const called = calledCanvasIds(source);
        expect(called.length).toBeGreaterThan(0);
        for (const id of called) {
          expect(extraction.canvases[id], `resolveRawCode('${id}')`).toBeDefined();
        }
      });
    });
  }

  it('markdown.html stays opted out (the stretch ruling: no canvas ids)', async () => {
    const extraction = await extractCanvases(routePage('markdown.html'), {
      filename: 'markdown.html',
    });
    expect(extraction.ids).toEqual([]);
    expect(authoredCanvasIds(routePage('markdown.html'))).toEqual([]);
  });
});

// one snapshot per (page, canvas) call site — reviewing these inline
// blocks IS reviewing what the drawer and the Usage block ship; the
// dynamic tests above keep the id table honest, these keep the CONTENT
// honest (a canvas edit that drifts the sample fails here, visibly)
describe('canvas same-source — the extracted blocks (the human drift proof)', () => {
  it('blockquote.html :: rungs', async () => {
    expect((await extractionFor('blockquote.html')).canvases['rungs']).toMatchInlineSnapshot(`
      "<div class="flex w-full max-w-xl flex-col gap-4">
        <div class="grid gap-4 min-[640px]:grid-cols-2">
          <Blockquote>
            outline (own) — transparent ground, a soft 4px left rule at a lightened mix, 0.875em muted body: the classic quote.
          </Blockquote>
          <Blockquote variant="tonal">
            tonal — the alert recipe verbatim: 12% tinted ground, 45% border, rounded box.
          </Blockquote>
        </div>
        <div class="grid gap-4 min-[640px]:grid-cols-2">
          <Blockquote variant="tonal" class="jx-hue-info" label="Note">
            The streaming prefix never remounts while chunks arrive.
          </Blockquote>
          <Blockquote variant="tonal" class="jx-hue-warning" label="Warning">
            The migration rewrites column names in place.
          </Blockquote>
        </div>
        <Blockquote label="Edsger W. Dijkstra" cite="EWD 648, 1978">
          The purpose of abstracting is not to be vague, but to create a new semantic level in
          which one can be absolutely precise.
        </Blockquote>
      </div>"
    `);
  });
  it('blockquote.html :: rule', async () => {
    expect((await extractionFor('blockquote.html')).canvases['rule']).toMatchInlineSnapshot(`
      "<div class="flex w-full max-w-3xl flex-col gap-6">
        <div class="flex flex-col gap-3">
          <span class="text-muted-foreground text-[11px]">outline — shadow (own) × border, 1 | 4 | 8</span>
          <div class="grid gap-4 min-[640px]:grid-cols-3">
            <Blockquote rule="shadow" ruleSize={1}>shadow-4 — the default: a 1px inset rule painted over geometry.</Blockquote>
            <Blockquote rule="shadow" ruleSize={4}>shadow-4 — the emphasis quote, still 0.875rem of pad.</Blockquote>
            <Blockquote rule="shadow" ruleSize={8}>shadow-8 — the pull quote; ps stays fixed, the paint widens.</Blockquote>
            <Blockquote rule="border" ruleSize={1}>border-1 — the classic geometry-consuming rule.</Blockquote>
            <Blockquote rule="border" ruleSize={4}>border-4 — consumes 3px more of the box.</Blockquote>
            <Blockquote rule="border" ruleSize={8}>border-8 — the widest structural edge.</Blockquote>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <span class="text-muted-foreground text-[11px]">the resolved default — 4 won the browser review; 1 stays the xs2-scale hairline</span>
          <div class="grid gap-4 min-[640px]:grid-cols-2">
            <Blockquote rule="shadow" ruleSize={1}>shadow-1: the hairline — fits xs2-scale contexts only.</Blockquote>
            <Blockquote rule="shadow" ruleSize={4}>shadow-4: the default manuscript bar every quote now ships.</Blockquote>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <span class="text-muted-foreground text-[11px]">tonal — the box border stays; the shadow rule rides beside it</span>
          <div class="grid gap-4 min-[640px]:grid-cols-3">
            <Blockquote variant="tonal" rule="shadow" ruleSize={1}>tonal + shadow-1: a deliberate near-no-op — axis uniformity over special-casing.</Blockquote>
            <Blockquote variant="tonal" rule="shadow" ruleSize={4}>tonal + shadow-4: the rule starts to read through the tint.</Blockquote>
            <Blockquote variant="tonal" rule="shadow" ruleSize={8}>tonal + shadow-8: two edges, one hue source.</Blockquote>
          </div>
        </div>
      </div>"
    `);
  });
  it('link.html :: lanes', async () => {
    expect((await extractionFor('link.html')).canvases['lanes']).toMatchInlineSnapshot(`
      "<div class="flex w-full max-w-xl flex-col gap-3 text-[13.5px] leading-7">
        <p class="m-0">
          Same document, different lanes: read
          <Link href="/docs/components/markdown.html" title="the markdown page">the markdown page</Link>
          here, or leave for
          <Link href="https://github.com/jixoai/ui" title="the repository">the repository</Link>
          in a new tab.
        </p>
        <p class="m-0 text-muted-foreground">
          Prose composition — the offset keeps the underline off the descenders:
          <Link href="https://commonmark.org" title="the CommonMark spec">CommonMark</Link>,
          <Link href="https://tailwindcss.com/docs/typography-plugin" title="the Typography plugin">Tailwind Typography</Link>,
          and quiet reference ink inside a muted paragraph.
        </p>
      </div>"
    `);
  });
  it('link.html :: icon', async () => {
    expect((await extractionFor('link.html')).canvases['icon']).toMatchInlineSnapshot(`
      "<div class="flex w-full max-w-xl flex-col gap-3 text-[13.5px] leading-7">
        {#snippet arrowGlyph()}<span aria-hidden="true" class="font-mono">→</span>{/snippet}
        <p class="m-0">
          undefined (omitted) — the default glyph on an external:
          <Link href="https://github.com/jixoai/ui">the repository</Link>
        </p>
        <p class="m-0">
          null — the lane explicitly off:
          <Link href="https://github.com/jixoai/ui" icon={null}>a quiet external</Link>
          (still target=_blank; only the glyph is gone)
        </p>
        <p class="m-0">
          snippet — custom content in the lane:
          <Link href="https://github.com/jixoai/ui" icon={arrowGlyph}>leaving the document</Link>
        </p>
        <p class="m-0 text-muted-foreground">
          internal — the lane never ships:
          <Link href="/docs/components/markdown.html">staying in the document</Link>
        </p>
      </div>"
    `);
  });
  it('list.html :: shapes', async () => {
    expect((await extractionFor('list.html')).canvases['shapes']).toMatchInlineSnapshot(`
      "<div class="grid w-full max-w-3xl gap-8 min-[760px]:grid-cols-2">
        <List>
          <li>prefix keys freeze while the tail grows</li>
          <li>the tail mutates in place on its <code class="font-mono text-[0.85em]">:tail</code> key</li>
          <li>
            nesting composes:
            <List>
              <li>the inner list rides the same channels</li>
              <li>one level deeper, zero extra classes</li>
            </List>
          </li>
        </List>
        <List ordered start={4}>
          <li>the fourth finding — start shifts the first marker</li>
          <li>the fifth, continuing the decimal run</li>
          <li>marker ink is muted; body ink is not</li>
        </List>
      </div>"
    `);
  });
  it('list.html :: markers', async () => {
    expect((await extractionFor('list.html')).canvases['markers']).toMatchInlineSnapshot(`
      "<div class="grid w-full max-w-3xl gap-x-10 gap-y-6 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-4">
          <List marker="disc">
            <li>disc — the ul platform default</li>
            <li>a core utility; the byte-parity stamp</li>
          </List>
          <List marker="circle">
            <li>circle — hollow, the nested-list word</li>
            <li>no core utility exists: the arbitrary [list-style:] form</li>
          </List>
          <List marker="square">
            <li>square — the compact marker</li>
            <li>same arbitrary form, probed against TW 4.2.1</li>
          </List>
          <List marker="none">
            <li>none — markers gone, ps-6 stays</li>
            <li>the indent is structural, not decorative</li>
          </List>
        </div>
        <div class="flex flex-col gap-4">
          <List ordered marker="decimal">
            <li>decimal — the ol platform default</li>
            <li>continues from start when set</li>
          </List>
          <List ordered marker="alpha">
            <li>alpha — lower-alpha counters</li>
            <li>appendix-grade enumeration</li>
          </List>
          <List ordered marker="roman">
            <li>roman — lower-roman counters</li>
            <li>preface-grade enumeration</li>
          </List>
          <List ordered marker="roman" start={4}>
            <li>start shifts the first counter</li>
            <li>iv, v — the native ol accounting</li>
          </List>
        </div>
      </div>"
    `);
  });
  it('list.html :: nav', async () => {
    expect((await extractionFor('list.html')).canvases['nav']).toMatchInlineSnapshot(`
      "<div class="grid w-full max-w-3xl gap-8 min-[760px]:grid-cols-2">
        <div class="jx-pure flex flex-col gap-2">
          <span class="text-[11px] text-muted-foreground">in a jx-pure scope — bare anchors ride the B2 lane</span>
          <List nav="On this page">
            <li><a href="#usage">Usage</a></li>
            <li><a href="#markers">The marker matrix</a></li>
            <li><a href="#api">API</a></li>
          </List>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-[11px] text-muted-foreground">with an explicit marker — the list-style default yields, ps-0 stays</span>
          <List nav="Chapters" ordered marker="decimal">
            <li>the arrival</li>
            <li>the turn</li>
          </List>
          <p class="m-0 text-[12.5px] leading-6 text-muted-foreground">
            Standalone (no face scope), a bare anchor is unstyled by design — compose the
            <a class="text-accent underline underline-offset-2" href="/docs/components/link.html">Link part</a>
            for the prose lane; chrome lists inside app chrome use their own controls.
          </p>
        </div>
      </div>"
    `);
  });
  it('prose.html :: knobs', async () => {
    expect((await extractionFor('prose.html')).canvases['knobs']).toMatchInlineSnapshot(`
      "<div class="grid w-full max-w-4xl gap-8 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-2">
          <span class="text-[11px] text-muted-foreground">ambient — no knob set</span>
          <Prose>
            <P>The face's own channels carry this region: 14px body, the p lane at 1.6, ink at the foreground token. Nothing was stamped.</P>
          </Prose>
          <span class="text-[11px] text-muted-foreground">size + leading — scale and flow</span>
          <Prose size="1.0625rem" leading={1.9}>
            <P>17px by inheritance; the P rides the region's 1.9 leading through the presence-gated residue rule. The same string would move a heading's em ladder for free — ambient size scales the ladder.</P>
          </Prose>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-[11px] text-muted-foreground">align justify + hyphens auto (lang on the host)</span>
          <Prose align="justify" hyphens="auto" lang="en" size="13.5px">
            <P>Justified columns read best when the engine may break words: hyphens auto needs a lang on the host or an ancestor, and the two knobs are documented as a pair — justify without hyphens rivers, hyphens without justify never shows its work.</P>
          </Prose>
          <span class="text-[11px] text-muted-foreground">wrap pretty — the prose word</span>
          <Prose wrap="pretty">
            <P>Pretty wrapping breaks the final line where the reader needs it; balance is the heading-scope word, stable the tabular one.</P>
          </Prose>
        </div>
      </div>"
    `);
  });
});

describe('canvas same-source — rendered parity through the real pipeline', () => {
  it('the blockquote page mounts; the Usage block and the canvas drawer ship the SAME extracted markup', async () => {
    const { container } = render(BlockquotePage);

    // the page mounted (the hero title renders)
    expect(container.textContent).toContain('blockquote — the quote');

    // the Usage SectionCard's CodeBlock carries the composed usage —
    // the cite composition exists ONLY through resolveRawCode('rungs')
    // (the hand template literal is gone)
    const usageBlock = container.querySelector('#usage')!;
    expect(usageBlock.textContent).toContain(
      "cite=\"EWD 648, 1978\"",
    );
    expect(usageBlock.textContent).toContain("import Blockquote from '@ui/blockquote';");

    // the drawer-mount parity: the rungs canvas's files carry the
    // composed usage — open the drawer, the code view contains the
    // dedented markup (byte-honest: the Dijkstra cite composition
    // only lives in the canvas children)
    const toggle = container.querySelector<HTMLButtonElement>(
      '.jx-canvas-code-toggle',
    )!;
    await fireEvent.click(toggle);
    const drawers = container.querySelectorAll<HTMLElement>('.jx-canvas-code-drawer');
    // 3 canvases: rungs, rule, and the icon-lane demo swept through a
    // canvas (canvas-everywhere-demos, 2026-09-08) — a plain-files
    // canvas; it never joins the same-source lane below
    expect(drawers.length).toBe(3);
    const rungsDrawer = drawers[0]!;
    expect(rungsDrawer.hasAttribute('data-open')).toBe(true);
    expect(rungsDrawer.textContent).toContain('blockquote-usage.svelte');
    expect(rungsDrawer.textContent).toContain('cite="EWD 648, 1978"');

    // and the SECOND canvas (rule) carries its OWN usage file — the
    // per-canvas split (both drawers showed the rungs sample before)
    const toggles = container.querySelectorAll<HTMLButtonElement>(
      '.jx-canvas-code-toggle',
    );
    await fireEvent.click(toggles[1]!);
    const ruleDrawer = drawers[1]!;
    expect(ruleDrawer.hasAttribute('data-open')).toBe(true);
    expect(ruleDrawer.textContent).toContain('blockquote-rule-usage.svelte');
    expect(ruleDrawer.textContent).toContain('border-8 — the widest structural edge');
  });
});
