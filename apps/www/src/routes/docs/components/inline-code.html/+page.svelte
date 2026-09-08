<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import InlineCode, { INLINE_LANGS, detectInlineLang } from '$lib/ui/inline-code/inline-code.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import {
    playOutputs,
    playState,
    PlayFields,
    PlayHelp,
    PlayRow,
    PlaySelect,
    PlaySegmented,
    PlayToggle,
  } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import inlineCodeSource from '$lib/ui/inline-code/inline-code.svelte?raw';
  import textStyleSource from '$lib/text-style.svelte.ts?raw';

  const close = '</' + 'script>';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import InlineCode from '@ui/inline-code.svelte';
${close}

<!-- plain forever: it says a token, not code -->
<InlineCode lang="text">--jx-tonal</InlineCode>

<!-- explicit lang: detection is skipped -->
<InlineCode lang="ts">const answer: number = 42</InlineCode>

<!-- auto: the zero-download fingerprint heuristic picks the grammar -->
<InlineCode>npm install @jixoai/ui</InlineCode>

<!-- the ladder: fused is the default band, outline the structural twin -->
<InlineCode variant="outline">var(--primary)</InlineCode>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/inline-code/inline-code.svelte', content: inlineCodeSource },
    { name: 'src/lib/ui/inline-code-usage.svelte', content: usage },
  ];

  // canvas-everywhere sweep (2026-09-08): the ladder-trio demo's usage
  // mirror — hand-authored to match the stage markup (same-source
  // migration is the recorded follow-up).
  const inlineCodeVariantsDemo = `<script lang="ts">
  import InlineCode from '@ui/inline-code.svelte';
${close}

<!-- the ladder trio over the page ground -->
<InlineCode>fused · the page ground</InlineCode>
<InlineCode variant="tonal">tonal · neutral default</InlineCode>
<InlineCode variant="outline">outline · structural</InlineCode>
<InlineCode variant="tonal" class="jx-hue-success">tonal · injected success</InlineCode>

<!-- fused earns its name over tonal / patterned grounds -->
<div class="flex flex-wrap items-center gap-3 rounded-(--radius) bg-muted p-4">
  <InlineCode>fused over a tonal ground</InlineCode>
  <InlineCode variant="tonal">tonal</InlineCode>
  <InlineCode variant="outline">outline</InlineCode>
</div>
<div class="flex flex-wrap items-center gap-3 rounded-(--radius) p-4 bg-[repeating-linear-gradient(45deg,var(--muted)_0_8px,transparent_8px_16px)]">
  <InlineCode>fused over a pattern</InlineCode>
  <InlineCode variant="tonal">tonal</InlineCode>
  <InlineCode variant="outline">outline</InlineCode>
</div>`;

  // the engine seam, on the record: the chain + the two override lanes
  const engineUsage = `<script lang="ts">
  import InlineCode from '@ui/inline-code.svelte';
  import { shiki } from '@lib/highlight/shiki';
${close}

<!-- per instance: any HighlightBackend prop wins outright -->
<InlineCode lang="ts" backend={shiki()}>const answer: number = 42</InlineCode>

<!-- no prop: the HIGHLIGHT_KEY context, else the stock microlighter -->
<InlineCode>npm install @jixoai/ui</InlineCode>`;

  const contextUsage = `<script lang="ts">
  import { setContext } from 'svelte';
  import { HIGHLIGHT_KEY } from '@lib/highlight/context-key';
  import { microLighter } from '@lib/highlight/microlighter';

  // the subtree default: every chip below eats the provided backend;
  // the prop still wins per instance — the code-card seam, verbatim
  setContext(HIGHLIGHT_KEY, { backend: microLighter() });
${close}`;

  // the padding formula, normative — ONE folder-css rule (the
  // arbitrary-utility form never survived Tailwind's source scanner;
  // found live in the vision pass, moved to inline-code.css)
  const paddingFormula = `padding-inline = radius + fontSize × (lineHeight − 1) / 2

/* inline-code.css — ONE :where rule, custom properties with token
   fallbacks (absent modifiers read the density pair; the rule stays
   :where so consumer padding utilities always win): */
:where([data-jx-inline-code]) {
  padding-inline: calc(
    var(--jx-chip-radius) +
    (var(--jx-code-line, var(--jx-line-secondary))
      - var(--jx-code-fs, var(--jx-text-secondary))) / 2
  );
}

/* explicit modifier props mirror their values onto the vars through
   the style attribute (the only channel past the scanner):
   fontSize="12px" lineHeight={1.5} ⇒
     style="--jx-code-fs:12px;--jx-code-line:calc((12px) * 1.5)"
   (12px × 1.5 line box − 12px) / 2 + radius 4px ⇒ 7px — the Owner's
   worked example, resolved by the same one rule */`;

  // the honest heuristic, on the record: what the detector answers for
  // representative snippets (pure function, zero downloads)
  const detectionSamples: [label: string, code: string][] = [
    ['css', 'color: var(--jx-tonal)'],
    ['svelte', '{#each list as item (item.id)}{/each}'],
    ['typescript', 'const value: number = 42'],
    ['bash', 'npm install @jixoai/ui'],
    ['json', '{"name": "jixoai", "private": true}'],
    ['plain', 'Ctrl + C'],
  ];

  // ---- modifier playground (r4 acceptance round, 2026-09-08) -------------
  // The COMPACT interactive treatment: the chip-relevant four of the
  // six text modifiers, ONE page-owned playState driving two chips.
  // The full six-control flagship lives on the text page. Defaults are
  // the geometry section's worked example — 12px on 1.5 (7px of
  // padding at default density).
  type ChipWeight = 'normal' | 'medium' | 'semibold' | 'bold' | '450';
  type ChipFontSize = '11px' | '12px' | '13px' | '14px' | '16px';

  const chipPlay = playState({
    fontSize: '12px' as ChipFontSize,
    lineHeight: 1.5 as number,
    weight: 'normal' as ChipWeight,
    italic: false as boolean,
  });

  const chipLineHeightOptions: { value: number; label: string }[] = [
    { value: 1, label: '1' },
    { value: 1.25, label: '1.25' },
    { value: 1.5, label: '1.5' },
    { value: 1.75, label: '1.75' },
    { value: 2, label: '2' },
  ];
  const chipWeightOptions: { value: ChipWeight; label: string }[] = [
    { value: 'normal', label: 'normal · 400' },
    { value: 'medium', label: 'medium · 500' },
    { value: 'semibold', label: 'semibold · 600' },
    { value: 'bold', label: 'bold · 700' },
    { value: '450', label: '450 · font-[450]' },
  ];
  const chipFontSizeOptions: { value: ChipFontSize; label: string }[] = [
    { value: '11px', label: '11px' },
    { value: '12px', label: '12px' },
    { value: '13px', label: '13px' },
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px' },
  ];

  // ONE derivation feeding BOTH the stage spread and the snippet
  // expression (single source, zero drift — the taught string IS the
  // shown string; italic off emits nothing and is omitted)
  const chipMods = $derived({
    fontSize: chipPlay.current.fontSize,
    lineHeight: chipPlay.current.lineHeight,
    weight: chipPlay.current.weight,
    italic: chipPlay.current.italic,
  });
  const q = (value: string): string => JSON.stringify(value);
  const chipPropsExpr = $derived.by(() => {
    const parts: string[] = [];
    if (chipMods.fontSize !== undefined) parts.push(`fontSize=${q(chipMods.fontSize)}`);
    if (chipMods.lineHeight !== undefined) parts.push(`lineHeight={${chipMods.lineHeight}}`);
    if (chipMods.weight !== undefined) parts.push(`weight=${q(chipMods.weight)}`);
    if (chipMods.italic === true) parts.push('italic');
    return parts.length > 0 ? ` ${parts.join(' ')}` : '';
  });

  const chipUsageHead = `<script lang="ts">
  import InlineCode from '@ui/inline-code.svelte';
${close}

<!-- the chip-relevant four: fontSize and lineHeight also feed the
     padding calc (radius + fontSize × (lineHeight − 1) / 2) -->`;
  const chipUsageLive = $derived(`${chipUsageHead}
<InlineCode lang="ts"${chipPropsExpr}>const value = 42</InlineCode>
<InlineCode lang="text" variant="outline"${chipPropsExpr}>--jx-chip-radius</InlineCode>`);

  // content stays '' — the drawer's displayed text ALWAYS walks
  // resolveFileContent, so the live $derived is the single source
  const modifierFiles: TreeFile[] = [
    { name: 'registry/files/lib/text-style.svelte.ts', content: textStyleSource },
    { name: 'src/lib/ui/inline-code-modifiers-usage.svelte', content: '', kind: 'usage' },
  ];
  const resolveModifierUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? chipUsageLive : file.content;

  /* Tailwind scanner candidates — same law as the text page's block:
     the modifier utilities are composed at RUNTIME by the kernel
     (template interpolations the source scanner can never see); this
     block feeds the exact set this page's playground AND its static
     tiles can emit, so the compiled sheet carries them (the app.css
     jx-html block precedent). */
  /* leading-[1] leading-[1.25] leading-[1.5] leading-[1.75] leading-[2]
     font-[450] tracking-[-0.02em] [font-family:IBM_Plex_Mono]
     [font-size:11px] [font-size:12px] [font-size:13px] [font-size:14px]
     [font-size:16px] */
</script>

<svelte:head>
  <title>InlineCode · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai inline code chip: a native <code> in the variant grammar's fused/tonal/outline ladder (fused default — the backdrop-fusion band), highlighted by the microlighter range engine through the backend seam, with the zero-download fingerprint heuristic for lang='auto' and a density-scaled radius ladder."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="inline code — the token, framed by its backdrop"
        summary="A native <code> — the element whose entire meaning is 'this is source code' — in the ladder's fused/tonal/outline paint with kbd-law geometry. Mono with untouched case: code is not a label, so the eyebrow voice (uppercase, tracking) never applies. Highlighting rides the engine seam: the stock microlighter RANGE engine paints zero markup — token ranges over the same text node, so the text stays copyable and the frame never depends on it. Inside <pre> the jx-pure reset strips a bare code's frame — long or dynamic code belongs to CodeCard."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;code&gt;</span>
          <span class="pill">fused default</span>
          <span class="pill">microlighter ranges</span>
          <span class="pill">zero markup</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="inline-code"
        stage="center"
        description="Plain, explicit, and auto-detected — one component, three language paths, the same frame."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/inline-code/inline-code.svelte"
        files={canvasFiles}
      >
        <div class="flex flex-col gap-3 text-[13.5px]">
          <p>
            Set <InlineCode lang="text">--jx-tonal</InlineCode> to retune any tonal chip.
          </p>
          <p>
            <InlineCode lang="ts">const answer: number = 42</InlineCode> pins the grammar;
            <InlineCode lang="svelte" class="ms-1">{'{#each list as item (item.id)}{/each}'}</InlineCode>
            too.
          </p>
          <p class="text-muted-foreground">
            <InlineCode>npm install @jixoai/ui</InlineCode> and
            <InlineCode class="ms-1">{"{ name: 'jixoai' }"}</InlineCode> were auto-detected — the
            chip renders before the grammar resolves.
          </p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              stateless display atom — the reading pane stays. The chip renders its plain text
              server-side; after hydration the resolved range engine registers Highlight ranges
              over the same characters (zero markup, zero layout shift). A failed guess costs
              color, never the frame.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="inline-code-variants" data-reveal="">
      <SectionCard
        family="inline-code-variants"
        headerRegion="inline-code-variants"
        eyebrow="demo"
        title="The ladder trio — fused (default), tonal, outline"
        summary="Fused is the backdrop-fusion rung: a transparent ground plus a backdrop contrast filter pulling whatever sits BEHIND the chip toward mid — near-black lifts, near-white dims — so the band reads over any ground with zero color tokens. The fusion IS the frame: the width-only border is painted transparent (currentColor would leak) and forced-colors repaints it CanvasText. On a flat page ground it is deliberately near-invisible — the ghost's own quiet; over tonal or patterned grounds it earns its name. Tonal tints 12%/45% from --jx-tonal; outline lets the 1px --jx-outline border do the work."
      >
        <div class="flex flex-col gap-4">
          <ComponentCanvas
            title="inline-code · ladder"
            stage="fill"
            files={[{ name: 'inline-code-variants-demo.svelte', content: inlineCodeVariantsDemo, kind: 'usage' }]}
          >
            <div class="flex flex-wrap items-center gap-3 text-[13.5px]">
              <InlineCode>fused · the page ground</InlineCode>
              <InlineCode variant="tonal">tonal · neutral default</InlineCode>
              <InlineCode variant="outline">outline · structural</InlineCode>
              <InlineCode variant="tonal" class="jx-hue-success">tonal · injected success</InlineCode>
            </div>
            <div class="flex flex-wrap items-center gap-3 rounded-(--radius) bg-muted p-4 text-[13.5px]">
              <InlineCode>fused over a tonal ground</InlineCode>
              <InlineCode variant="tonal">tonal</InlineCode>
              <InlineCode variant="outline">outline</InlineCode>
            </div>
            <div
              class="flex flex-wrap items-center gap-3 rounded-(--radius) p-4 text-[13.5px] bg-[repeating-linear-gradient(45deg,var(--muted)_0_8px,transparent_8px_16px)]"
            >
              <InlineCode>fused over a pattern</InlineCode>
              <InlineCode variant="tonal">tonal</InlineCode>
              <InlineCode variant="outline">outline</InlineCode>
            </div>
          </ComponentCanvas>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="inline-code-engine" data-reveal="">
      <SectionCard
        family="inline-code-engine"
        headerRegion="inline-code-engine"
        eyebrow="engine"
        title="The engine seam — microlighter by default"
        summary="Highlighting is pluggable exactly like code-card's: a backend prop, else the HIGHLIGHT_KEY context default, else the stock DEFAULT_MICROLIGHTER_BACKEND singleton. The range engine paints ZERO markup — token ranges in the global CSS.highlights registry over the plain text node, coalesced to one document scan per frame (a markdown page of chips costs one pass). The chip carries the --tok-* palette itself; microlighter's jixoai theme bridges --syntax-* onto it chip-side. A CSS.highlights PRE-GATE degrades to plain text silently where the API is missing (old Safari); print loses ranges by the documented freeze limitation — pin a markup backend through the seam if printing highlighted chips matters."
      >
        <div class="flex flex-col gap-5">
          <div class="grid gap-4 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-3">
              <h3 class="font-nav text-[13px] tracking-tight">per instance — the backend prop</h3>
              <CodeBlock code={engineUsage} lang="svelte" meta="per-instance" />
            </div>
            <div class="flex flex-col gap-3">
              <h3 class="font-nav text-[13px] tracking-tight">subtree default — the context lane</h3>
              <CodeBlock code={contextUsage} lang="svelte" meta="subtree default" />
            </div>
          </div>
          <p class="text-[13px] leading-6 text-muted-foreground">
            The seam ships with the items (zero dependencies):
            <code class="text-accent">HIGHLIGHT_KEY</code> + the structural type. Vite hosts owe
            microlighter its two bundler lines — dev excludes it from the optimizer
            (<code class="text-accent">optimizeDeps: {'{ exclude: [\'microlighter\'] }'}</code>),
            builds emit its <code class="text-accent">dist/grammars/*.js</code> next to the engine
            chunk (this site's vite.config.ts is the reference implementation; a miss shows plain
            text with zero console signal). The full engine matrix — markup engines that survive
            print, sizes, languages — lives on the
            <a href="/docs/components/code-card.html#code-card-engines" class="text-accent underline underline-offset-2">code-card page</a>.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="inline-code-detection" data-reveal="">
      <SectionCard
        family="inline-code-detection"
        headerRegion="inline-code-detection"
        eyebrow="law"
        title="The honest heuristic"
        summary="lang='auto' runs a zero-download regex fingerprint scorer over the snippet — tuned for short inline code, not a general language detector. Weights add up per candidate, the highest score at or above 2 wins, and plain prose stays plain. An explicit lang skips the guesswork entirely; detection is documented, deterministic, and wrong at worst in color."
      >
        <div class="flex flex-col gap-5">
          <table class="w-full max-w-xl text-[12.5px]">
            <caption class="sr-only">what the fingerprint detector answers for representative snippets</caption>
            <tbody>
              {#each detectionSamples as [expected, code] (code)}
                <tr class="border-t border-border">
                  <th scope="row" class="border-b border-border px-2 py-1.5 text-left font-normal text-muted-foreground">{code}</th>
                  <td class="border-b border-border px-2 py-1.5">
                    <InlineCode lang="text">{detectInlineLang(code) || 'plain'}</InlineCode>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
          <div>
            <p class="mb-2 text-[12.5px] text-muted-foreground">
              The candidate set mirrors the highlight engines' curated grammars (ids + aliases):
            </p>
            <div class="flex max-w-2xl flex-wrap gap-1.5">
              {#each INLINE_LANGS as candidate (candidate)}
                <InlineCode lang="text" variant="outline">{candidate}</InlineCode>
              {/each}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="inline-code-geometry" data-reveal="">
      <SectionCard
        family="inline-code-geometry"
        headerRegion="inline-code-geometry"
        eyebrow="law"
        title="Geometry — the density radius ladder and the padding formula"
        summary="The corner leaves the global --radius for its own density ladder token --jx-chip-radius: 2px at 2xs/xs/sm (a 1px-border band reads as softened, not round), 4px at default, 8px at lg. The channel is a css custom property, so ambient density scopes and explicit data-density stamps both flow through one declaration. padding-inline = radius + fontSize × (lineHeight − 1) / 2 — the leading's half-extra on each side; the flat --jx-inset form is retired."
      >
        <div class="flex flex-col gap-5">
          <DensityDemo scopes={['2xs', 'xs', 'sm', 'default', 'lg']}>
            <InlineCode lang="ts">const value = 42</InlineCode>
          </DensityDemo>
          <CodeBlock code={paddingFormula} lang="css" meta="the padding formula (normative)" />
          <p class="text-[13px] leading-6 text-muted-foreground">
            Worked examples at default density (radius 4px): 12px type on a 1.0 line ⇒ 4px of
            padding; the same type on 1.5 ⇒ 7px. Explicit fontSize + lineHeight props fold the
            excess in JS for density-exactness; half-pairs substitute the provided literal and
            keep the missing half on its token.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="inline-code-modifiers" data-region="inline-code-modifiers" data-family="inline-code-modifiers" data-reveal="">
      <ComponentCanvas
        title="inline-code · modifiers"
        description="The six text modifiers ride the shared kernel (@jixoai/text's text-style resolver): an ABSENT prop emits nothing — the ambient channels flow untouched — and an EXPLICIT prop emits its utility after the variant paint, before the consumer class. An explicit fontSize/lineHeight also feeds the padding calc and replaces the base token utility for that property (emission, not ordering, is the guarantee). The playground drives the chip-relevant four; the full six-control flagship lives on the text page."
        sourceUrl={registrySourceUrl('inline-code')}
        files={modifierFiles}
        stage="fill"
        onreset={() => chipPlay.reset()}
        output={playOutputs(chipPlay.current)}
        resolveFileContent={resolveModifierUsage}
      >
        <div class="flex w-full max-w-xl flex-col gap-4 text-[13.5px]">
          <div class="flex flex-wrap items-center gap-3">
            <InlineCode lang="ts" lineHeight={1.75}>lineHeight 1.75</InlineCode>
            <InlineCode lang="ts" weight="450">weight 450</InlineCode>
            <InlineCode lang="ts" italic>italic</InlineCode>
            <InlineCode lang="ts" tracking="-0.02em">tighter tracking</InlineCode>
            <InlineCode lang="ts" family="IBM Plex Mono">IBM Plex Mono</InlineCode>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <InlineCode lang="ts" fontSize="13px">13px mono</InlineCode>
            <InlineCode lang="ts" lineHeight={1.25} fontSize="13px">13px / 1.25 — the padding folds the excess</InlineCode>
          </div>
          <div class="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">driven by the playground</span>
            <InlineCode lang="ts" {...chipMods}>const value = 42</InlineCode>
            <InlineCode lang="text" variant="outline" {...chipMods}>--jx-chip-radius</InlineCode>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="fontSize" hint="also feeds the padding calc">
              <PlaySelect bind:value={chipPlay.current.fontSize} options={chipFontSizeOptions} />
            </PlayRow>
            <PlayRow label="lineHeight" hint="number ⇒ the unitless ratio">
              <PlaySegmented bind:value={chipPlay.current.lineHeight} options={chipLineHeightOptions} />
            </PlayRow>
            <PlayRow label="weight">
              <PlaySelect bind:value={chipPlay.current.weight} options={chipWeightOptions} />
            </PlayRow>
            <PlayRow label="italic" hint="false never emits not-italic">
              <PlayToggle bind:value={chipPlay.current.italic} />
            </PlayRow>
            <PlayHelp>
              the chip-relevant four of the kernel's six — tracking and family live on the
              <a href="/docs/components/text.html#modifiers" class="text-accent underline underline-offset-2">text page's modifier playground</a>.
              Defaults are the geometry section's worked example (12px on 1.5); reset restores
              them in place, live bindings intact.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="types" data-reveal="">
      <SectionCard eyebrow="types" title="The three language paths" summary="Plain stays plain forever; an explicit lang is trusted as-is; auto asks the heuristic. All three render the same chip before any JavaScript runs.">
        <div class="flex flex-wrap items-center gap-3 text-[13.5px]">
          <InlineCode lang="text">lang="text"</InlineCode>
          <span class="text-muted-foreground">·</span>
          <InlineCode lang="ts">lang="ts"</InlineCode>
          <span class="text-muted-foreground">·</span>
          <InlineCode>lang="auto" (default)</InlineCode>
        </div>
      </SectionCard>
    </div>
    <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'code', value: 'native element', description: 'Communicates "this is code" without extra ARIA; the range engine never touches the DOM text.' }, { name: 'highlight ranges', value: 'async, cosmetic', description: 'Paint rides the CSS Custom Highlight API over the SAME text node — screen readers read the identical characters before and after hydration.' }]}/></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><InlineCode lang="ts">const value = 42</InlineCode></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-chip-radius', default: 'density ladder 2/2/2/4/8px', source: 'density', description: 'The chip corner — its own ladder, not the global --radius fleet corner.' }, { name: '--jx-tonal', default: 'var(--primary); tonal injects var(--muted-foreground)', source: 'color', description: 'Tonal ground/border/text hue slot — the design.md §1 recipe.' }, { name: '--jx-outline', default: 'var(--border)', source: 'color', description: 'Outline border source.' }, { name: '--tok-token-keyword', default: 'var(--primary)', source: 'color', description: 'The range palette the microlighter jixoai theme bridges onto — the same values code-card.css wires, carried by the chip itself.' }, { name: '--tok-token-string', default: 'var(--accent)', source: 'color' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
    <div id="api" data-reveal=""><SectionCard eyebrow="api" title="InlineCode props"><PropsTable props={[{ name: 'variant', type: "'fused' | 'tonal' | 'outline'", default: "'fused' · ambient zone", description: "The ladder paint (fused own, the backdrop-fusion band); omitted → the ambient paint zone, else the frozen own fused." }, { name: 'lang', type: 'string', default: "'auto'", description: "'auto' = fingerprint heuristic; an explicit id/alias skips detection; 'text'/'plain' stay plain." }, { name: 'backend', type: 'HighlightBackend', description: 'The engine seam: prop → HIGHLIGHT_KEY context → the stock microlighter range engine. A rejecting backend leaves the plain chip standing.' }, { name: 'lineHeight', type: 'number | string', description: 'The shared text-modifier kernel: number ⇒ the unitless ratio (leading-[1.5]); string ⇒ verbatim. Also feeds the padding calc; absent ⇒ the ambient line flows.' }, { name: 'weight', type: 'string', description: "A weight word or number — 'bold' → font-bold (named map); '450' → font-[450]." }, { name: 'italic', type: 'boolean', description: 'true ⇒ italic; absent stays ambient (never not-italic).' }, { name: 'tracking', type: 'string', description: "A letter-spacing word or length — 'wide' → tracking-wide; '-0.02em' → tracking-[-0.02em]." }, { name: 'family', type: 'string', description: 'A font-family value — verbatim [font-family:…] (spaces escape to underscores).' }, { name: 'fontSize', type: 'string', description: 'A CSS length — verbatim [font-size:…]; also feeds the padding calc. Never named size (the axis-word law).' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }, { name: 'class', type: 'string', description: 'Adds consumer classes; jx-hue-* intent utilities retune the tonal slot, and [--tok-token-…:…] injections land here.' }]} /><p class="mt-4 text-[12.5px] text-muted-foreground">Every other attribute (title, data-*, aria-*) flows through to the native &lt;code&gt; element verbatim. Module exports: <InlineCode lang="text" variant="outline">INLINE_LANGS</InlineCode> (the detection candidates) and <InlineCode lang="text" variant="outline">detectInlineLang(code)</InlineCode> (the pure heuristic).</p></SectionCard></div>
  </div>
</div>
