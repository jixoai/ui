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
    resolve(process.cwd(), 'src/routes/docs', rel, '+page.svelte'),
    'utf8',
  );

// pilots relative to src/routes/docs — the component pages under
// components/, plus the guide pages that joined the same-source lane
// in the guide sweep (2026-09-09): variant-grammar, jx-pure, icons.
// registry / density-2xs carry canvases WITHOUT ids by design (their
// stages are page data + page state — the extractor's
// self-containment guard rejects them; their drawers ride real
// files: docs-route-model.ts ?raw and a live jixoai.css extract), so
// they hold no gate entry. paged.html is the verify-print fixture
// surface — no canvases, by design.
const PILOTS = [
  'components/blockquote.html',
  'components/link.html',
  'components/prose.html',
  'components/list.html',
  'variant-grammar.html',
  'jx-pure.html',
  'icons.html',
];

/** per-file extraction cache (the source read is page-truth, not test fixture) */
const extractions = new Map<string, Promise<Awaited<ReturnType<typeof extractCanvases>>>>();
const extractionFor = (rel: string) => {
  if (!extractions.has(rel)) {
    extractions.set(
      rel,
      extractCanvases(routePage(rel), {
        filename: `src/routes/docs/${rel}/+page.svelte`,
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
    const extraction = await extractCanvases(routePage('components/markdown.html'), {
      filename: 'markdown.html',
    });
    expect(extraction.ids).toEqual([]);
    expect(authoredCanvasIds(routePage('components/markdown.html'))).toEqual([]);
  });
});

// one snapshot per (page, canvas) call site — reviewing these inline
// blocks IS reviewing what the drawer and the Usage block ship; the
// dynamic tests above keep the id table honest, these keep the CONTENT
// honest (a canvas edit that drifts the sample fails here, visibly)
describe('canvas same-source — the extracted blocks (the human drift proof)', () => {
  it('blockquote.html :: rungs', async () => {
    expect((await extractionFor('components/blockquote.html')).canvases['rungs']).toMatchInlineSnapshot(`
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
    expect((await extractionFor('components/blockquote.html')).canvases['rule']).toMatchInlineSnapshot(`
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
    expect((await extractionFor('components/link.html')).canvases['lanes']).toMatchInlineSnapshot(`
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
    expect((await extractionFor('components/link.html')).canvases['icon']).toMatchInlineSnapshot(`
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
    expect((await extractionFor('components/list.html')).canvases['shapes']).toMatchInlineSnapshot(`
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
    expect((await extractionFor('components/list.html')).canvases['markers']).toMatchInlineSnapshot(`
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
    expect((await extractionFor('components/list.html')).canvases['nav']).toMatchInlineSnapshot(`
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
    expect((await extractionFor('components/prose.html')).canvases['knobs']).toMatchInlineSnapshot(`
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

  // ── the guide pages (guide sweep, 2026-09-09) ─────────────────────────
  // one inline snapshot per canvas, same law as the component pilots:
  // reviewing these blocks IS reviewing what each drawer ships
  it('variant-grammar.html :: ladder', async () => {
    expect((await extractionFor('variant-grammar.html')).canvases['ladder']).toMatchInlineSnapshot(`
      "<div class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <span class="text-muted-foreground text-[11px]">PressButton — the full union (default: outline)</span>
          <div class="flex flex-wrap items-center gap-3">
            <PressButton variant="fill">deploy</PressButton>
            <PressButton variant="tonal">preview</PressButton>
            <PressButton variant="outline">cancel</PressButton>
            <PressButton variant="ghost">skip</PressButton>
            <PressButton variant="link">read the docs</PressButton>
          </div>
        </div>
        <div class="grid gap-6 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3">
            <span class="text-muted-foreground text-[11px]">Badge — fill / tonal (default) / outline</span>
            <div class="flex flex-wrap items-center gap-3">
              <Badge variant="fill">new</Badge>
              <Badge>running</Badge>
              <Badge variant="outline">beta</Badge>
            </div>
            <span class="text-muted-foreground text-[11px]">
              Chip — all four rungs, control-scale on the hit lane
            </span>
            <div class="flex flex-wrap items-center gap-3">
              <Chip variant="fill">filter: owner</Chip>
              <Chip>filter: open</Chip>
              <Chip variant="outline">filter: label</Chip>
              <Chip variant="ghost">clear filters</Chip>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-muted-foreground text-[11px]">
              Alert — outline (default) / tonal; Blockquote — outline (default) / tonal;
              InlineCode — fused (default) / tonal / outline
            </span>
            <Alert variant="tonal" title="Build queued">
              The canary build enters the queue behind two commits.
            </Alert>
            <Alert title="Heads up">
              Outline keeps the muted body — the neutral rung's own ink ramp for long copy.
            </Alert>
            <Blockquote variant="tonal" label="Note">
              The quote surface rides the same two rungs as the banner — availability frozen
              (fill/ghost excluded: readability, and ghost is interactive-chrome vocabulary).
            </Blockquote>
            <Blockquote cite="the variant grammar, §ladder">
              Outline is the classic left-rule quote — the reading-content posture, own default;
              the rule itself is now the shadow channel (an inset rule at 1px by default, the
              rule×size axis beside the rungs).
            </Blockquote>
            <p class="text-[13px] leading-6">
              Inline code rides the same ladder:
              <InlineCode>npm run verify</InlineCode> is the fused default (the band fused
              from the backdrop behind it), and
              <InlineCode variant="tonal">npm run verify</InlineCode> is its tonal twin —
              <InlineCode variant="outline">npm run verify</InlineCode> the structural one.
            </p>
          </div>
        </div>
      </div>"
    `);
  });
  it('variant-grammar.html :: injection', async () => {
    expect((await extractionFor('variant-grammar.html')).canvases['injection']).toMatchInlineSnapshot(`
      "<div class="grid gap-6 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-3">
          <span class="text-muted-foreground text-[11px]">STATUS hues — the tonal slot, reported states</span>
          <div class="flex flex-wrap items-center gap-3">
            <Badge class="jx-hue-neutral">draft</Badge>
            <Badge class="jx-hue-error">failed</Badge>
            <Badge shape="pill" class="jx-hue-success">
              {#snippet slotStart()}<Icon name="check" />{/snippet}
              passing
            </Badge>
            <Badge class="jx-hue-warning">degraded</Badge>
            <Badge class="jx-hue-info">canary</Badge>
          </div>
          <span class="text-muted-foreground text-[11px]">ACTION hue — the fill pair, verbs that destroy</span>
          <div class="flex flex-wrap items-center gap-3">
            <PressButton variant="fill" class="jx-pair-destructive">delete workspace</PressButton>
            <PressButton variant="outline">cancel</PressButton>
          </div>
          <p class="text-muted-foreground text-[13px] leading-6">
            The pair law: <code class="text-accent">--jx-fill</code> and
            <code class="text-accent">--jx-fill-ink</code> are ALWAYS injected together — one
            without the other paints brand ink on a destructive ground.
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <span class="text-muted-foreground text-[11px]">
            the same failure, both grammars — STATUS error (left) vs ACTION destructive (right)
          </span>
          <div class="grid gap-3">
            <Alert variant="tonal" assertive title="Canary failed">
              The canary build errored on seat 3 — an error STATUS reads tonal + the error hue.
            </Alert>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-muted-foreground text-[11px]">confirm the destructive action:</span>
              <PressButton variant="fill" class="jx-pair-destructive">discard changes</PressButton>
            </div>
          </div>
          <span class="text-muted-foreground text-[11px]">
            inheritance — one injection on the wrapper retunes every consumer below
          </span>
          <div class="jx-hue-info flex flex-wrap items-center gap-3">
            <Badge>info badge</Badge>
            <Chip>info chip</Chip>
            <PressButton variant="tonal">tonal button</PressButton>
            <PressButton variant="outline">outline — hover me</PressButton>
          </div>
          <p class="text-muted-foreground text-[13px] leading-6">
            The wrapper carries <code class="text-accent">class="jx-hue-info"</code> — the
            slots are ordinary custom properties, so the subtree inherits them; even the
            outline rung's 8% hover overlay follows the retuned hue.
          </p>
        </div>
      </div>"
    `);
  });
  it('variant-grammar.html :: intent-utilities', async () => {
    expect((await extractionFor('variant-grammar.html')).canvases['intent-utilities']).toMatchInlineSnapshot(`
      "<div class="flex flex-col gap-4">
        <span class="text-muted-foreground text-[11px]">the closed set, live — every intent is one class</span>
        <div class="flex flex-wrap items-center gap-3">
          <Badge class="jx-hue-primary">primary</Badge>
          <Badge class="jx-hue-neutral">neutral</Badge>
          <Badge class="jx-hue-error">error</Badge>
          <Badge class="jx-hue-success">success</Badge>
          <Badge class="jx-hue-warning">warning</Badge>
          <Badge class="jx-hue-info">info</Badge>
        </div>
        <span class="text-muted-foreground text-[11px]">
          jx-pair-destructive vs the arbitrary pair it replaces
        </span>
        <div class="flex flex-wrap items-center gap-3">
          <PressButton variant="fill" class="jx-pair-destructive">the pair utility</PressButton>
          <PressButton
            variant="fill"
            class="[--jx-fill:var(--destructive)] [--jx-fill-ink:var(--destructive-foreground)]"
          >
            the arbitrary pair
          </PressButton>
        </div>
        <p class="text-muted-foreground text-[13px] leading-6">
          Identical paint — but the utility cannot half-apply, cannot typo a token name, and
          documents its intent in the class list.
        </p>
        <span class="text-muted-foreground text-[11px]">the escape hatch — anything outside the closed set</span>
        <div class="flex flex-wrap items-center gap-3">
          <Badge class="[--jx-tonal:oklch(0.72_0.14_300)]">untitled violet</Badge>
          <span class="text-muted-foreground text-[11px]">
            a hue no semantic token owns — the arbitrary form stays canonical for it
          </span>
        </div>
      </div>"
    `);
  });
  it('variant-grammar.html :: dedupe', async () => {
    expect((await extractionFor('variant-grammar.html')).canvases['dedupe']).toMatchInlineSnapshot(`
      "<div class="flex flex-col gap-4">
        <span class="text-muted-foreground text-[11px]">
          cn() dedupe — last-wins, exactly like the arbitrary form
        </span>
        <div class="flex flex-wrap items-center gap-3">
          <Badge class="jx-hue-error">base — error</Badge>
          <Badge class="jx-hue-error jx-hue-success">naive concat</Badge>
          <Badge class={cn('jx-hue-error', 'jx-hue-success')}>cn() deduped</Badge>
        </div>
      </div>"
    `);
  });
  it('variant-grammar.html :: elevation', async () => {
    expect((await extractionFor('variant-grammar.html')).canvases['elevation']).toMatchInlineSnapshot(`
      "<div class="flex flex-wrap items-end gap-x-10 gap-y-5 text-[12.5px]">
        <div class="text-muted-foreground flex flex-col gap-2">
          <PressButton variant="fill">raise</PressButton>
          <span>press law · xs → sm on hover</span>
        </div>
        <div class="text-muted-foreground flex flex-col gap-2">
          <Kbd>engrave</Kbd>
          <span>--shadow-engrave · incised inset</span>
        </div>
        <div class="text-muted-foreground flex max-w-[16rem] flex-col gap-2">
          <Blockquote rule="shadow" ruleSize={4}>inset rule — blockquote's rule channel</Blockquote>
          <span>shadow-4 · the inset standard consumed as structure</span>
        </div>
        <div class="text-muted-foreground flex flex-col gap-2">
          <Chip variant="outline">raise twin</Chip>
          <span>badge scale, press physics</span>
        </div>
        <div class="text-muted-foreground flex flex-col gap-2">
          <Badge>flush</Badge>
          <span>display glyph · no elevation</span>
        </div>
      </div>"
    `);
  });
  it('jx-pure.html :: typography', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['typography']).toMatchInlineSnapshot(`
      "         <div class="jx-pure" style="max-width: 46rem">
                 <h3 data-doc-demo-heading>Heading level three</h3>
                 <p>
                   A paragraph of ordinary copy. The quick brown fox jumps over the lazy dog while
                   <strong>strong</strong> and <small>small</small> keep their voices —
                   <a href="#typography">a primary link</a> underlines on hover, and
                   <code>inline code</code> sits in a muted box. Press <kbd>⌘K</kbd> to open the palette.
                 </p>
                 <blockquote>
                   The platform already built the semantics — the separator, the quote, the term list.
                   jx-pure only paints them.
                 </blockquote>
                 <pre><code>const law = 'one stylesheet, zero js';
      document.body.classList.add('jx-pure');</code></pre>
                 <p><mark>Marked text</mark> rides the secondary hue at 45% — a token mix, never a hardcoded yellow.</p>
                 <hr />
                 <p>Below the rule, the document keeps flowing.</p>
               </div>"
    `);
  });
  it('jx-pure.html :: buttons', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['buttons']).toMatchInlineSnapshot(`
      "<div class="grid gap-6 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-3">
          <span class="text-muted-foreground text-[11px]">inside .jx-pure — the law</span>
          <div class="jx-pure flex flex-wrap items-center gap-3">
            <button type="button">plain button</button>
            <button type="button" disabled>disabled</button>
            <input type="button" value="input button" />
            <a class="jx-button" href="#buttons">a.jx-button</a>
            <a href="#buttons">plain link</a>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <span class="text-muted-foreground text-[11px]">outside the scope — untouched UA paint</span>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button">plain button</button>
            <button type="button" disabled>disabled</button>
            <a href="#buttons">plain link</a>
          </div>
          <span class="text-muted-foreground text-[11px]">
            opt-in is structural: no class on the ancestor, no jixoai face
          </span>
        </div>
      </div>"
    `);
  });
  it('jx-pure.html :: forms', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['forms']).toMatchInlineSnapshot(`
      "<div class="jx-pure grid gap-5 min-[760px]:grid-cols-2" style="max-width: 60rem">
        <form onsubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>account</legend>
            <p><label for="f-user">username</label><br />
              <input id="f-user" name="user" type="text" placeholder="gaubee" /></p>
            <p><label for="f-mail">email</label><br />
              <input id="f-mail" name="mail" type="email" placeholder="you@host.tld" /></p>
            <p><label for="f-pass">password</label><br />
              <input id="f-pass" name="pass" type="password" placeholder="••••••••" /></p>
          </fieldset>
          <p><label for="f-bio">bio</label><br />
            <textarea id="f-bio" name="bio" placeholder="a line or two…"></textarea></p>
          <p>
            <button type="submit">create account</button>
            <button type="reset">reset</button>
          </p>
        </form>
        <div>
          <p><label for="f-sel">select — platform arrow (default)</label><br />
            <select id="f-sel">
              <option>first option</option>
              <option>second option</option>
              <option>third option</option>
            </select></p>
          <p><label for="f-sel2">select — native island (no-jx-pure)</label><br />
            <span class="no-jx-pure" style="display: inline-block; width: 100%">
              <select id="f-sel2" style="width: 100%">
                <option>first option</option>
                <option>second option</option>
              </select>
            </span></p>
          <p><label for="f-date">date</label> <label for="f-time">time</label><br />
            <input id="f-date" type="date" /> <input id="f-time" type="time" /></p>
          <p><label for="f-dtl">datetime-local</label> <label for="f-week">week</label><br />
            <input id="f-dtl" type="datetime-local" /> <input id="f-week" type="week" /></p>
          <p><label for="f-num">number — the platform stepper rides inside</label><br />
            <input id="f-num" type="number" min="0" step="1" placeholder="42" /></p>
          <p><label for="f-range">range</label><br />
            <input id="f-range" type="range" min="0" max="100" value="40" /></p>
          <p>
            <label><input type="checkbox" checked /> checkbox</label><br />
            <label><input type="checkbox" /> unchecked</label><br />
            <label><input type="radio" name="f-radio" checked /> radio one</label>
            <label><input type="radio" name="f-radio" /> radio two</label>
          </p>
          <p><label for="f-color">color</label><br />
            <input id="f-color" type="color" value="#007924" /></p>
          <p><label for="f-off">disabled lane</label><br />
            <input id="f-off" type="text" placeholder="not allowed" disabled /></p>
          <!-- the ONE-opacity-owner law (Codex review A3): the disabled
               fieldset dims to .5 and the controls inside stay at 1 —
               two stacked .5 layers would composite to ~.25 -->
          <fieldset disabled>
            <legend>locked section</legend>
            <p><label for="f-locked">group-disabled lane</label><br />
              <input id="f-locked" type="text" placeholder="one opacity owner: the fieldset" /></p>
            <p><button type="button">frozen</button></p>
          </fieldset>
          <!-- the label-based input group — STRUCTURE IS THE OPT-IN:
               a label with a direct-child control + span(s), zero classes -->
          <label>
            <span>https://</span>
            <input type="text" aria-label="website name" placeholder="your-site" />
            <span>.example.com</span>
          </label>
          <label>
            <select aria-label="protocol">
              <option>GET</option><option>POST</option>
            </select>
            <span>/api/v1</span>
          </label>
          <label>
            <input type="number" aria-label="timeout" value="300" min="0" step="50" />
            <span>ms</span>
          </label>
        </div>
      </div>"
    `);
  });
  it('jx-pure.html :: disclosure', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['disclosure']).toMatchInlineSnapshot(`
      "<div class="jx-pure" style="max-width: 40rem">
        <details>
          <summary>What is included in v1?</summary>
          <p>Typography, links, buttons, the form lanes, disclosure, lists, and tables — everything on this page.</p>
        </details>
        <details open>
          <summary>And what is deliberately not?</summary>
          <p>Floating surfaces (dialog / popover / tooltip — Tier-2 territory) and select popup internals. The platform keeps those: their top-layer and closing-order laws are component ground.</p>
        </details>
      </div>"
    `);
  });
  it('jx-pure.html :: nav-lists', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['nav-lists']).toMatchInlineSnapshot(`
      "<div class="grid gap-6 min-[760px]:grid-cols-2">
        <div class="jx-pure" style="max-width: 28rem">
          <nav>
            <a href="#nav-lists">docs</a> · <a href="#nav-lists">registry</a> · <a href="#nav-lists">tokens</a>
          </nav>
          <ul>
            <li>an unordered item</li>
            <li>another one, marker themed muted</li>
          </ul>
          <ol>
            <li>ordered steps keep decimals</li>
            <li>second step</li>
          </ol>
        </div>
        <div class="jx-pure" style="max-width: 28rem">
          <dl>
            <dt>tier 0</dt>
            <dd>jx-pure — the componentless face (this page)</dd>
            <dt>tier 1</dt>
            <dd>the class vocabulary, Part A of the same file</dd>
            <dt>tier 2</dt>
            <dd>the Svelte components consuming the classes</dd>
          </dl>
        </div>
      </div>"
    `);
  });
  it('jx-pure.html :: tables', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['tables']).toMatchInlineSnapshot(`
      "<div class="jx-pure" style="max-width: 44rem">
        <table>
          <caption>engine coverage for the v1 repaints</caption>
          <thead>
            <tr><th>element</th><th>chromium</th><th>firefox</th><th>webkit</th></tr>
          </thead>
          <tbody>
            <tr><td>checkbox / radio</td><td>verified: clip-path + dot</td><td>same law, unverified build</td><td>same law, unverified build</td></tr>
            <tr><td>range</td><td>verified: webkit pseudos</td><td>-moz pseudos authored</td><td>webkit pseudos authored</td></tr>
            <tr><td>date/time indicator</td><td>verified: mask glyph</td><td>native indicator</td><td>native indicator</td></tr>
            <tr><td>select.jx-select</td><td>verified: gradient chevron</td><td>same law, unverified build</td><td>same law, unverified build</td></tr>
            <tr><td>progress / meter</td><td>verified: track family + token fills</td><td>-moz bar pseudos authored</td><td>native bar (webkit pseudos)</td></tr>
          </tbody>
        </table>
      </div>"
    `);
  });
  it('jx-pure.html :: media-flow', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['media-flow']).toMatchInlineSnapshot(`
      "<div class="grid gap-6 min-[760px]:grid-cols-2">
        <div class="jx-pure flex flex-col gap-4" style="max-width: 30rem">
          <div>
            <small>progress · 60%</small><br />
            <progress value="60" max="100"></progress>
          </div>
          <div>
            <small>progress · indeterminate (stripe; static under reduced motion)</small><br />
            <progress max="100"></progress>
          </div>
          <div>
            <small>meter · optimum / suboptimum / even-less-good</small><br />
            <meter value="70" min="0" max="100" low="30" high="90" optimum="80"></meter>
            <meter value="20" min="0" max="100" low="30" high="90" optimum="80"></meter>
            <meter value="95" min="0" max="100" low="30" high="90" optimum="80"></meter>
          </div>
          <form onsubmit={(e) => e.preventDefault()} class="flex flex-wrap items-center gap-2">
            <label for="mf-a">a</label>
            <input id="mf-a" type="number" value="6" style="width: 5rem" />
            <label for="mf-b">b</label>
            <input id="mf-b" type="number" value="7" style="width: 5rem" />
            <button type="button" onclick={(e) => { const f = e.currentTarget.closest('form'); f.querySelector('output').value = Number(f.querySelector('#mf-a').value) * Number(f.querySelector('#mf-b').value); }}>a × b =</button>
            <output name="result" for="mf-a mf-b">42</output>
          </form>
        </div>
        <div class="jx-pure" style="max-width: 30rem">
          <figure>
            <img src="/blueprints/jx-pure.svg" alt="the jx-pure blueprint scene" style="background: var(--muted)" />
            <figcaption>figure · the componentless face — its own blueprint</figcaption>
          </figure>
          <p><small>media (img / video) never exceeds its lane; the plate's 1px border is the figure law.</small></p>
        </div>
      </div>"
    `);
  });
  it('jx-pure.html :: switch', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['switch']).toMatchInlineSnapshot(`
      "<div class="jx-pure flex flex-wrap items-center gap-6" style="max-width: 44rem">
        <label class="jx-switch-sm"><input type="checkbox" role="switch" /> sm auto-save</label>
        <label><input type="checkbox" role="switch" /> md notifications</label>
        <label class="jx-switch-lg"><input type="checkbox" role="switch" checked /> lg telemetry</label>
        <label><input type="checkbox" role="switch" disabled /> locked</label>
        <label><input type="checkbox" role="switch" aria-invalid="true" checked /> failing</label>
      </div>"
    `);
  });
  it('jx-pure.html :: validation', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['validation']).toMatchInlineSnapshot(`
      "<div class="jx-pure grid gap-5 min-[760px]:grid-cols-2" style="max-width: 52rem">
        <form onsubmit={(e) => e.preventDefault()} class="flex flex-col gap-3">
          <label for="v-ok">valid lane (aria-invalid='false')</label>
          <input id="v-ok" type="text" value="gaubee" aria-invalid="false" />
          <label for="v-bad">invalid lane (aria-invalid='true')</label>
          <input id="v-bad" type="text" value="nope!" aria-invalid="true" />
          <label for="v-sel-bad">invalid select</label>
          <select id="v-sel-bad" aria-invalid="true"><option>pick…</option></select>
        </form>
        <div class="flex flex-col gap-3">
          <label><input type="checkbox" aria-invalid="true" checked /> invalid checkbox</label>
          <label><input type="checkbox" aria-invalid="false" checked /> valid checkbox</label>
          <label><input type="radio" name="v-radio" aria-invalid="true" checked /> invalid radio</label>
          <label><input type="checkbox" role="switch" aria-invalid="true" checked /> invalid switch</label>
          <div>
            <small>invalid range — fill + thumb flip destructive</small><br />
            <input type="range" min="0" max="100" value="70" aria-invalid="true" />
          </div>
        </div>
      </div>"
    `);
  });
  it('jx-pure.html :: dark-mode', async () => {
    expect((await extractionFor('jx-pure.html')).canvases['dark-mode']).toMatchInlineSnapshot(`
      "<div class="grid gap-6 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-2">
          <span class="text-muted-foreground text-[11px]">&lt;div class="jx-pure"&gt; — light (inherits :root)</span>
          <div class="jx-pure" style="max-width: 26rem">
            <p><label for="d-l">label</label><br />
              <input id="d-l" type="text" placeholder="light lane" /></p>
            <p>
              <button type="button">button</button>
              <label><input type="checkbox" checked /> check</label>
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-muted-foreground text-[11px]">&lt;div class="dark jx-pure"&gt; — scoped dark island</span>
          <div class="dark jx-pure" style="max-width: 26rem">
            <p><label for="d-d">label</label><br />
              <input id="d-d" type="text" placeholder="dark lane" /></p>
            <p>
              <button type="button">button</button>
              <label><input type="checkbox" checked /> check</label>
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-muted-foreground text-[11px]">&lt;div class="jx-light jx-pure"&gt; — forced light under a dark root</span>
          <div class="dark jx-pure" style="padding: 0.75rem; max-width: 26rem">
            <div class="jx-light jx-pure">
              <p><label for="d-lf">label</label><br />
                <input id="d-lf" type="text" placeholder="stays light" /></p>
              <p>
                <button type="button">button</button>
                <label><input type="checkbox" checked /> check</label>
              </p>
            </div>
          </div>
        </div>
      </div>"
    `);
  });
  it('icons.html :: sizes', async () => {
    expect((await extractionFor('icons.html')).canvases['sizes']).toMatchInlineSnapshot(`
      "<div class="flex flex-wrap items-end justify-center gap-x-10 gap-y-5" data-icon-size-demo="">
        <div class="flex flex-col items-center gap-2">
          <Icon name="eye" size={12} />
          <code class="text-muted-foreground font-mono text-[11px]">size={12}</code>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="eye" size={16} />
          <code class="text-muted-foreground font-mono text-[11px]">size={16}</code>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="eye" size={24} />
          <code class="text-muted-foreground font-mono text-[11px]">size={24}</code>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="eye" size={32} />
          <code class="text-muted-foreground font-mono text-[11px]">size={32}</code>
        </div>
      </div>"
    `);
  });
  it('icons.html :: channel-gallery', async () => {
    expect((await extractionFor('icons.html')).canvases['channel-gallery']).toMatchInlineSnapshot(`
      "<div class="flex flex-col gap-3" data-channel-gallery="">
        <!-- STATIC literals by law: the scanner collects static
             name="…" attributes only — a dynamic name={expr} here
             would be unpacked at runtime (the runtime lane), not
             scanned. These six cells ARE the dogfood. -->
        <div class="flex flex-wrap gap-3">
          <div class="border-border/60 bg-card/40 flex flex-col items-center gap-2 border px-4 py-3" data-channel-cell="md:home">
            <Icon name="md:home" size={24} />
            <code class="text-muted-foreground font-mono text-[11px]">md:home</code>
            <span class="text-muted-foreground text-[10px] uppercase tracking-[0.14em]">material · outlined/400</span>
          </div>
          <div class="border-border/60 bg-card/40 flex flex-col items-center gap-2 border px-4 py-3" data-channel-cell="md:copy_all">
            <Icon name="md:copy_all" size={24} />
            <code class="text-muted-foreground font-mono text-[11px]">md:copy_all</code>
            <span class="text-muted-foreground text-[10px] uppercase tracking-[0.14em]">material · snake_case</span>
          </div>
          <div class="border-border/60 bg-card/40 flex flex-col items-center gap-2 border px-4 py-3" data-channel-cell="ph:atom">
            <Icon name="ph:atom" size={24} />
            <code class="text-muted-foreground font-mono text-[11px]">ph:atom</code>
            <span class="text-muted-foreground text-[10px] uppercase tracking-[0.14em]">phosphor · regular</span>
          </div>
          <div class="border-border/60 bg-card/40 flex flex-col items-center gap-2 border px-4 py-3" data-channel-cell="rx:system:add-line">
            <Icon name="rx:system:add-line" size={24} />
            <code class="text-muted-foreground font-mono text-[11px]">rx:system:add-line</code>
            <span class="text-muted-foreground text-[10px] uppercase tracking-[0.14em]">remix · category-prefixed</span>
          </div>
          <div class="border-border/60 bg-card/40 flex flex-col items-center gap-2 border px-4 py-3" data-channel-cell="check">
            <Icon name="check" size={24} />
            <code class="text-muted-foreground font-mono text-[11px]">check</code>
            <span class="text-muted-foreground text-[10px] uppercase tracking-[0.14em]">lucide · built-in</span>
          </div>
          <div class="border-primary/40 bg-card/40 flex flex-col items-center gap-2 border px-4 py-3" data-channel-cell="lucide:check">
            <Icon name="lucide:check" size={24} />
            <code class="text-muted-foreground font-mono text-[11px]">lucide:check</code>
            <span class="text-muted-foreground text-[10px] uppercase tracking-[0.14em]">lucide · equivalence → check</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 border-border border p-4" data-alias-demo="">
          <Icon name="md:copy_all as copy2" size={20} />
          <Icon name="copy2" size={20} />
          <span class="text-muted-foreground text-[13px] leading-6">
            the <code class="text-accent">as</code> form, live: the left cell writes the full literal, the right
            resolves the alias — ONE packed payload, three legal spellings (the artifact's ALIASES row)
          </span>
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
