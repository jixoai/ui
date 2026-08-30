<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import ScrollArea from '$lib/ui/scroll-area/scroll-area.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Toc from '$lib/ui/toc/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { createTocEngine } from '$lib/toc-engine';
  import { deriveTocOutline } from '$lib/toc-outline';
  import { PlayFields, PlayRow, PlaySegmented, PlayNumber, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tocOutlineSource from '$lib/toc-outline.ts?raw';
  import scrollAreaSource from '$lib/ui/scroll-area/scroll-area.svelte?raw';
  import scrollAreaCssSource from '$lib/ui/scroll-area/scroll-area.css?raw';

  const close = '</' + 'script>';

  // THIS PAGE is the outline-mode dogfood: no tocSections literal, no
  // data-region/data-family markup — the rail derives itself from the h2
  // tree under #sa-content on hydration (the reveal philosophy: prerendered
  // output shows the rail empty, then it fills).
  const pageOutline = { root: '#sa-content', levels: [2] };

  // ---- canvas playground (site-polish F10: the standard opening) -----------
  type ScrollOrientationOpt = 'vertical' | 'horizontal';
  type ScrollbarOpt = 'native' | 'overlay';
  const canvasInitial = {
    scrollbar: 'native' as ScrollbarOpt,
    orientation: 'vertical' as ScrollOrientationOpt,
    pad: 0.75,
  };
  let canvasScrollbar = $state(canvasInitial.scrollbar);
  let canvasOrientation = $state(canvasInitial.orientation);
  let canvasPad = $state(canvasInitial.pad);

  function resetScrollAreaCanvas(): void {
    canvasScrollbar = canvasInitial.scrollbar;
    canvasOrientation = canvasInitial.orientation;
    canvasPad = canvasInitial.pad;
  }

  const canvasUsage = $derived(
    [
      '<ScrollArea',
      '  label="config demo"',
      `  scrollbar="${canvasScrollbar}"`,
      `  orientation="${canvasOrientation}"`,
      `  pad="${canvasPad}rem"`,
      '  class="h-40"',
      '>',
      '  …scrolling content…',
      '</ScrollArea>',
    ]
      .flat()
      .join('\n'),
  );

  // stable named resolver: the usage file tracks live playground state
  const resolveScrollAreaUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/scroll-area/scroll-area.svelte', content: scrollAreaSource },
    { name: 'registry/files/ui/scroll-area/scroll-area.css', content: scrollAreaCssSource },
    // initial snapshot only — resolveScrollAreaUsage serves the live state
    { name: 'src/lib/ui/scroll-area-usage.svelte', content: canvasUsage },
  ];

  // ---- toc-metadata demo: the inner scroller linkage, engine-direct ----
  // The Toc component assumes the page shell (its line law measures the
  // scaffold header); an ARBITRARY inner scroller pairs toc-engine +
  // toc-outline directly — scrollRoot = the ScrollArea viewport, extents =
  // the derived outline, line = the viewport's own top in page coordinates.
  let metaArea = $state<{ getViewport(): HTMLDivElement | null } | null>(null);
  let metaViewport = $state<HTMLDivElement | null>(null);
  let metaPick = $state('');
  let metaWeights = $state<ReadonlyMap<string, number>>(new Map());

  $effect(() => {
    metaViewport = metaArea?.getViewport() ?? null;
  });

  $effect(() => {
    const vp = metaViewport;
    if (!vp) return;
    const line = () => Math.round(vp.getBoundingClientRect().top) + 8;
    const stop = createTocEngine(
      ({ weights, pick }) => {
        metaWeights = weights;
        metaPick = pick ?? '';
      },
      { scrollRoot: vp, lineOffset: line, extents: () => deriveTocOutline(vp, { levels: [3] }) },
    );
    return stop;
  });

  const metaSections = [
    'deriving the outline',
    'extents, not attributes',
    'the line stays honest',
    'zero boilerplate',
  ];

  // ---- usage snippets ----
  const nativeUsage = `<script lang="ts">
  import ScrollArea from '@ui/scroll-area.svelte';
${close}

<!-- native variant (default): the theme scrollbar law, gutter compensated -->
<ScrollArea class="h-72" label="release notes" pad="0.75rem">
  {#each notes as note (note.id)}
    <article>…</article>
  {/each}
</ScrollArea>`;

  const overlayUsage = `<ScrollArea scrollbar="overlay" class="h-72" label="terminal log">
  <!-- overlay thumb: desktop (fine pointer) only; touch keeps native -->
</ScrollArea>`;

  const tocUsage = `import { deriveTocOutline, tocOutlineToSections } from '@lib/toc-outline';

// zero handwritten ids: sections + extents derive from the heading tree
const entries = deriveTocOutline(scrollArea.getViewport());
const sections = tocOutlineToSections(entries);

// Toc component, page-level (outline mode):
//   <Toc outline={{ root: '#content' }} scrollRoot={area.getViewport()} />
// engine-direct for arbitrary inner scrollers:
//   createTocEngine(onUpdate, { scrollRoot: viewport, extents: () => entries });`;

  const metaCanvasFiles: TreeFile[] = [
    { name: 'registry/files/lib/toc-outline.ts', content: tocOutlineSource },
  ];
</script>

<svelte:head>
  <title>Scroll area · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai scroll-area family: a W3C-first nativeHTML scrollable region (native + overlay virtual scrollbar variants), TanStack-backed virtual scrolling, and automatic ToC outline export."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- outline-mode rail: no sections literal below — it derives itself from
       #sa-content's h2 tree on hydration (this page is the dogfood) -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc outline={pageOutline} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div id="sa-content" class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · scroll-area family"
      title="scroll-area — the scrollable region, nativeHTML"
      summary="A dedicated scrollable-region component after shadcnui, with the jixoai law: the component IS a native scroll container — wheel, touch momentum, keyboard and scroll-snap stay platform behavior. Two scrollbar variants (native = the theme scrollbar law; overlay = the custom virtual scrollbar, desktop-fine-pointer only), The windowed-list sibling (scroll-virtual) lives on its own page now, and the ToC metadata export lets a table of contents derive itself from your content."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">nativeHTML scrollport</span>
        <span class="pill">overlay virtual scrollbar</span>
        <span class="pill">sibling: scroll-virtual</span>
        <span class="pill">auto ToC outline</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (site-polish F10): the standard opening — live demo + PLAYGROUND -->
  <div data-reveal="">
    <ComponentCanvas
      title="scroll-area"
      description="the component IS a native scroll container — wheel, touch momentum, keyboard and scroll-snap stay platform behavior; the variants dress the scrollbar."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/scroll-area/scroll-area.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetScrollAreaCanvas}
      output={[
        { label: 'scrollbar', value: canvasScrollbar },
        { label: 'orientation', value: canvasOrientation },
      ]}
      resolveFileContent={resolveScrollAreaUsage}
    >
      <div class="flex w-full max-w-md flex-col gap-3">
        <ScrollArea
          label="config demo"
          scrollbar={canvasScrollbar}
          orientation={canvasOrientation}
          pad={`${canvasPad}rem`}
          class="h-40"
        >
          <ol class="flex flex-col gap-2">
            {#each Array(12) as _, i (i)}
              <li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">
                item {i + 1} — scroll me in both variants
              </li>
            {/each}
          </ol>
        </ScrollArea>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="scrollbar">
            <PlaySegmented
              bind:value={canvasScrollbar}
              options={[
                { value: 'native', label: 'native' },
                { value: 'overlay', label: 'overlay' },
              ]}
            />
          </PlayRow>
          <PlayRow label="orientation">
            <PlaySegmented
              bind:value={canvasOrientation}
              options={[
                { value: 'vertical', label: 'vertical' },
                { value: 'horizontal', label: 'horizontal' },
              ]}
            />
          </PlayRow>
          <PlayRow label="pad">
            <PlayNumber bind:value={canvasPad} />
          </PlayRow>
          <PlayHelp>
            native encapsulates the theme scrollbar law; overlay floats a square virtual thumb
            (desktop fine-pointer only, fades after idle).
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="">
    <SectionCard
      family="scroll-native"
      headerRegion="scroll-native"
      eyebrow="variant 1"
      title="native — the scrollbar law, componentized"
    >
      <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
        The default variant encapsulates the theme scrollbar law: thin, theme-linked thumbs over a
        transparent track with the hover chain — plus <code class="text-accent">stable both-edges</code>
        gutters whose reservation <code class="text-accent">pad</code> hands back (the inline
        compensation recipe). On classic-scrollbar systems the visual inset stays exactly
        <code class="text-accent">pad</code> on both edges; on overlay-scrollbar systems nothing is
        reserved at all.
      </p>
      <div class="mt-4">
        <ScrollArea class="h-56" label="law demo" pad="0.75rem">
          <ol class="flex flex-col gap-2">
            {#each Array(40) as _, i (i)}
              <li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">
                item {i + 1} — scroll me: the scrollbar is thin, themed, and the content inset
                stays symmetric
              </li>
            {/each}
          </ol>
        </ScrollArea>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <SectionCard
      family="scroll-overlay"
      headerRegion="scroll-overlay"
      eyebrow="variant 2"
      title="overlay — the virtual scrollbar"
    >
      <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
        The custom scrollbar: native bars hidden, a square theme-token thumb floats over full-width
        content — the overlay effect even on classic-scrollbar desktops. Pointer-drag it (capture
        law), watch it fade after ~700ms idle. On touch devices it stays pure native: the OS already
        paints overlay bars during momentum — the mobile/desktop behavioral split is the law.
        <code class="text-accent">prefers-reduced-motion</code> keeps the thumb statically visible.
      </p>
      <div class="mt-4">
        <ScrollArea scrollbar="overlay" class="h-56" label="overlay demo">
          <div class="jx-log">
            {#each Array(60) as _, i (i)}
              <p class="jx-log-line">
                <span class="text-muted-foreground">[{(i * 137) % 1000}</span> ms] overlay thumb
                rendered without a single native scrollbar pixel
              </p>
            {/each}
          </div>
        </ScrollArea>
      </div>
    </SectionCard>
  </div>

  <div id="virtual-scrolling" data-reveal="">
    <SectionCard
      family="scroll-virtual"
      headerRegion="scroll-virtual"
      eyebrow="family sibling"
      title="scroll-virtual — moved to its own page"
    >
      <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
        The TanStack-backed windowed list is a registry item of its own now — the 100,000-row demo,
        the count playground and the imperative passthroughs live on
        <a class="text-accent" href="/docs/components/scroll-virtual.html">/docs/components/scroll-virtual.html</a>.
      </p>
    </SectionCard>
  </div>

  <div id="toc-metadata" data-reveal="">
    <ComponentCanvas
      title="toc metadata export"
      stage="fill"
      description="The scrollable area exports what the ToC needs: the viewport element (scrollRoot), and the outline its content derives — heading-to-heading extents, no data-region markup. The page rail on the right already runs in outline mode; this demo pairs an inner scroller with the engine directly."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/lib/toc-outline.ts"
      files={metaCanvasFiles}
    >
      <div class="grid gap-4 min-[900px]:grid-cols-[1fr_13rem]">
        <ScrollArea bind:this={metaArea} class="h-64" label="toc metadata demo" pad="0.75rem">
          <div class="flex flex-col gap-6 pr-2">
            {#each metaSections as section, i (section)}
              <section>
                <!-- h3 keeps clean document order under the h2 section; explicit
                     ids are respected by the derivation (the readout matches).
                     data-doc-demo-heading: the heading IS the demo's data —
                     deriveTocOutline derives from it (lint opt-out) -->
                <h3
                  id="toc-metadata-demo-{i}"
                  data-doc-demo-heading=""
                  class="font-nav text-[0.95rem]"
                >{section}</h3>
                <p class="mt-1 text-[12.5px] leading-6 text-muted-foreground">
                  {['deriveTocOutline scans the heading tree, slugs labels, stamps ids back — the ToC links are real fragments.',
                    'extents (heading → next heading) feed toc-engine directly: weights and pick without a single data attribute.',
                    'the line is the viewport\'s own top — inner scrollers have no scaffold header, so the engine gets lineOffset from geometry.',
                    'ScrollArea.getViewport() + toc-outline + toc-engine: the whole linkage, zero handwritten ids.'][i]}
                </p>
                {#each Array(6) as _, j (`${section}-${j}`)}
                  <p class="text-[12px] leading-5 text-muted-foreground/60">depth filler {j + 1} — every section must be able to cross the line</p>
                {/each}
              </section>
            {/each}
          </div>
        </ScrollArea>
        <aside class="jx-meta-rail">
          <p class="font-nav text-[11px] uppercase tracking-[0.14em] text-muted-foreground">engine readout</p>
          <ol>
            {#each metaSections as section, i (section)}
              {@const id = `toc-metadata-demo-${i}`}
              <li class="jx-meta-item" class:active={metaPick === id} style="--w: {(metaWeights.get(id) ?? 0).toFixed(3)}">
                {section}
              </li>
            {/each}
          </ol>
          <p class="mt-2 text-[11px] leading-4 text-muted-foreground/70">
            pick: <code class="text-accent">{metaPick || '—'}</code>
          </p>
        </aside>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            this canvas is the engine dogfood: the demo document's headings are FUNCTIONAL
            DATA — deriveTocOutline derives the outline from them, so they are marked
            <code>data-doc-demo-heading</code> rather than demoted to styled text. Scroll the
            inner area: weights and the line pick update from the inner scroller's geometry.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- Material3 sections (2026-08-26): inside #sa-content so the
       outline-mode rail derives their entries from the h2 tree. -->
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two scrollbar presentations over the same native scrollport; three orientation axes.">
    <div class="grid gap-4 min-[760px]:grid-cols-2">
      <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">native (default)</span><ScrollArea class="h-40" label="native sample" pad="0.75rem"><ol class="flex flex-col gap-2">{#each Array(12) as _, i (i)}<li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">item {i + 1}</li>{/each}</ol></ScrollArea></div>
      <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">overlay</span><ScrollArea scrollbar="overlay" class="h-40" label="overlay sample"><div class="jx-log">{#each Array(16) as _, i (i)}<p class="jx-log-line"><span class="text-muted-foreground">[{(i * 137) % 1000}</span> ms] overlay thumb, desktop fine-pointer only</p>{/each}</div></ScrollArea></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Give it a height, a label, and pad for the gutter compensation; the rest is a native scroll container."><div class="flex flex-col gap-4"><CodeBlock code={nativeUsage} lang="svelte" meta="native" /><CodeBlock code={overlayUsage} lang="svelte" meta="overlay" /><CodeBlock code={tocUsage} lang="ts" meta="toc-outline" /></div></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The WAI scrollable-region pattern: role=region + name + tabindex makes the scrollport itself keyboard-focusable."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through the scrollable area' }, { key: '↑ ↓ ← → / Home / End / PgUp / PgDn', action: 'Native scrollport scrolling once the region is focused' }, { key: 'pointer drag', action: 'The overlay thumb drags with pointer capture; keyboard never needs it' }]} aria={[{ name: 'aria-label', value: 'label prop', description: 'Accessible name for the region (default "scrollable content")' }, { name: 'role', value: 'region', description: 'Plus tabindex=0 — the WAI scrollable-region pattern' }, { name: 'aria-hidden', value: 'true', description: 'On the decorative overlay thumbs' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The scrollbar law is token-driven: thin themed thumbs, transparent tracks, gutter compensation via pad."><div class="flex flex-col gap-6"><DensityDemo><ScrollArea class="h-36" label="density sample" pad="0.75rem"><ol class="flex flex-col gap-2">{#each Array(10) as _, i (i)}<li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">item {i + 1}</li>{/each}</ol></ScrollArea></DensityDemo><TokenTable tokens={[{ name: '--jx-scrollbar-thin', default: 'thin thumb width', source: 'component' }, { name: '--jx-scroll-thumb-w', default: 'overlay thumb width', source: 'component' }, { name: '--jx-scroll-pad', default: 'pad prop', source: 'component', description: 'The ring padding the gutter compensation recipe hands back' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the ScrollArea Props interface; getViewport()/scrollTo() are the imperative exports."><PropsTable props={[{ name: 'orientation', type: "'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'Which axes scroll: overflow-y/x mapping.' }, { name: 'scrollbar', type: "'native' | 'overlay'", default: "'native'", description: 'Theme scrollbar law or the custom overlay thumb (fine-pointer only).' }, { name: 'label', type: 'string', default: "'scrollable content'", description: 'a11y name for the region.' }, { name: 'pad', type: 'string', default: '0', description: 'Ring padding (CSS length), inline-axis — feeds the gutter compensation recipe.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough.' }, { name: 'style', type: 'string', default: '—', description: 'Style passthrough.' }, { name: 'onscroll', type: '(event: ViewportScrollEvent) => void', default: '—', description: 'Scroll callback from the viewport.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The scrolling content.', required: true }, { name: 'getViewport()', type: '() => HTMLDivElement | null', default: 'export', description: 'The scrollport element — Toc scrollRoot / engine-direct linkage.' }]} /></SectionCard></div>
  </div>
</div>

<style>
  .jx-log {
    font-size: 12px;
    line-height: 1.7;
    padding: 0.75rem;
  }
  .jx-log-line {
    margin: 0;
    white-space: nowrap;
  }
  .jx-meta-rail {
    align-self: start;
    border: 1px solid var(--border);
    padding: 0.6rem;
    position: sticky;
    top: 0.5rem;
  }
  .jx-meta-item {
    border-inline-start: 2px solid
      color-mix(in oklab, var(--primary) calc(var(--w, 0) * 100%), transparent);
    color: var(--muted-foreground);
    font-size: 12px;
    list-style: none;
    padding: 0.25rem 0 0.25rem 0.5rem;
  }
  .jx-meta-item.active {
    color: var(--foreground);
  }
</style>
