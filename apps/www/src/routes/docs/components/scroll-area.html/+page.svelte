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

  // ---- canvas playground (the standard opening) — REWORKED 2026-09-15:
  // the scrollbar variant prop retired; the chrome is always hand-drawn ---
  type ScrollOrientationOpt = 'vertical' | 'horizontal';
  const canvasInitial = {
    orientation: 'vertical' as ScrollOrientationOpt,
    pad: 0.75,
  };
  let canvasOrientation = $state(canvasInitial.orientation);
  let canvasPad = $state(canvasInitial.pad);

  function resetScrollAreaCanvas(): void {
    canvasOrientation = canvasInitial.orientation;
    canvasPad = canvasInitial.pad;
  }

  const canvasUsage = $derived(
    [
      '<ScrollArea',
      '  label="config demo"',
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
  const basicUsage = `<script lang="ts">
  import ScrollArea from '@ui/scroll-area.svelte';
${close}

<!-- ALWAYS hand-drawn: the capsule thumb on the scrollbar-token law -->
<ScrollArea class="h-72" label="release notes" pad="0.75rem">
  {#each notes as note (note.id)}
    <article>…</article>
  {/each}
</ScrollArea>`;

  const horizontalUsage = `<ScrollArea orientation="horizontal" class="w-full" label="filmstrip">
  <!-- both axes ride the same capsule chrome; RTL mirrors through
       logical geometry -->
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

  // the hand-drawn law demo (scroll-capsule section): the capsule chrome
  // over a terminal log
  const scrollCapsuleDemo = `<script lang="ts">
  import ScrollArea from '@ui/scroll-area.svelte';
${close}

<ScrollArea class="h-56" label="capsule demo">
  <div class="jx-log">
    {#each Array(60) as _, i (i)}
      <p class="jx-log-line">log line {i} — capsule thumb, idle fade, the four pins</p>
    {/each}
  </div>
</ScrollArea>`;

  const scrollCapsuleFiles: TreeFile[] = [
    { name: 'scroll-area-capsule-demo.svelte', content: scrollCapsuleDemo, kind: 'usage' },
  ];

  // the axes pair (types section): vertical against horizontal, the same law
  const scrollAreaTypesDemo = `<script lang="ts">
  import ScrollArea from '@ui/scroll-area.svelte';
${close}

<div class="grid gap-4 min-[760px]:grid-cols-2">
  <div><span>vertical</span><ScrollArea class="h-40" label="vertical sample" pad="0.75rem"><ol>{#each Array(12) as _, i (i)}<li>item {i + 1}</li>{/each}</ol></ScrollArea></div>
  <div><span>horizontal</span><ScrollArea orientation="horizontal" class="h-40 w-full" label="horizontal sample"><ol class="flex gap-2">{#each Array(16) as _, i (i)}<li class="w-36 flex-none">card {i + 1}</li>{/each}</ol></ScrollArea></div>
</div>`;

  const scrollAreaTypesFiles: TreeFile[] = [
    { name: 'scroll-area-types-demo.svelte', content: scrollAreaTypesDemo, kind: 'usage' },
  ];

  // ---- chrome params (Owner r2): the radius × width matrix — three
  // widths (thin/auto/wide lanes) × three radius modes (default 0,
  // configured px, full capsule), every cell live on BOTH axes
  // (orientation="both") so each tier's y and x chrome mount together
  const chromeRadiusModes = [
    { key: 'default', label: '0 (default)', radius: undefined as number | 'full' | undefined },
    { key: 'px', label: '6px', radius: 6 as number | 'full' | undefined },
    { key: 'full', label: 'full (capsule)', radius: 'full' as number | 'full' | undefined },
  ];
  const chromeWidthTiers = ['thin', 'auto', 'wide'] as const;

  const chromeParamsUsage = `<ScrollArea radius={6} width="wide" orientation="both" class="h-36" label="matrix cell">
  <!-- radius: a px number | 'full' | omitted → square-cut (0, the default)
       width:  'thin' 8px | 'auto' 12px (default) | 'wide' 16px lane -->
  …content overflowing both axes…
</ScrollArea>`;

  const chromeParamsFiles: TreeFile[] = [
    { name: 'scroll-area-chrome-params-demo.svelte', content: chromeParamsUsage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Scroll area · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai scroll-area family, reworked 2026-09-15: the styled component hand-draws its scrollbar ALWAYS (capsule thumb on the scrollbar-token law, idle fade with four testable pins), the native-scroll-area sibling ships the platform path, and both share the scroll-area-kit kernel."
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
      title="scroll-area — the scrollable region, always hand-drawn"
      summary="A dedicated scrollable-region component after shadcnui, with the jixoai law: the component IS a native scroll container — wheel, touch momentum, keyboard and scroll-snap stay platform behavior — and the scrollbar is ALWAYS HAND-DRAWN (the 2026-09-15 rework retired the dual-mode scrollbar prop; no mode branch exists, breaking). Capsule thumb on the scrollbar-token law, idle fade with four testable auto-hide pins, hover growth, drag pinning, keyboard affordances on region and thumb. The platform path is its own sibling (native-scroll-area); both share the scroll-area-kit kernel. The windowed-list sibling (scroll-virtual) lives on its own page, and the ToC metadata export lets a table of contents derive itself from your content."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">nativeHTML scrollport</span>
        <span class="pill">hand-drawn capsule, always</span>
        <span class="pill">sibling: native-scroll-area</span>
        <span class="pill">shared: scroll-area-kit</span>
        <span class="pill">auto ToC outline</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (the standard opening): live demo + PLAYGROUND -->
  <div data-reveal="">
    <ComponentCanvas
      title="scroll-area"
      description="the component IS a native scroll container — wheel, touch momentum, keyboard and scroll-snap stay platform behavior; the chrome is the hand-drawn capsule on the token law."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/scroll-area/scroll-area.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetScrollAreaCanvas}
      output={[
        { label: 'orientation', value: canvasOrientation },
      ]}
      resolveFileContent={resolveScrollAreaUsage}
    >
      <div class="flex w-full max-w-md flex-col gap-3">
        <ScrollArea
          label="config demo"
          orientation={canvasOrientation}
          pad={`${canvasPad}rem`}
          class="h-40"
        >
          <ol class="flex flex-col gap-2">
            {#each Array(12) as _, i (i)}
              <li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">
                item {i + 1} — scroll me: the capsule fades in, idles out
              </li>
            {/each}
          </ol>
        </ScrollArea>
      </div>
      {#snippet playground()}
        <PlayFields>
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
            the capsule chrome is always hand-drawn — hover the lane to widen and brighten
            the thumb, drag it (it pins the active tone), Tab to the region or the thumb
            and the idle fade suspends.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="">
    <SectionCard
      family="scroll-capsule"
      headerRegion="scroll-capsule"
      eyebrow="the hand-drawn law"
      title="capsule — the complete style-control surface"
    >
      <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
        The thumb is a full-radius capsule painted by the scrollbar-token law
        (<code class="text-accent">currentColor</code> family) — themes and dark stages restyle
        it without a line of JS. It auto-hides after ~700ms idle, and FOUR pins suspend the
        fade, each separately probe-asserted: region focus-within, thumb focus, active drag,
        hover. While any pin holds, the thumb stays in the accessibility tree with its
        <code class="text-accent">role="scrollbar"</code> intact and
        <code class="text-accent">aria-valuenow</code> tracking position. Hover widens +
        brightens; drag pins the active tone; the thumb is focusable and keyboard-draggable
        (arrows step, PageUp/PageDown page, Home/End jump); track-click pages. Content that
        fits draws nothing; touch keeps the platform's own momentum bars; reduced motion
        keeps the chrome statically visible.
      </p>
      <ComponentCanvas title="scroll-area · capsule" stage="fill" class="mt-4" files={scrollCapsuleFiles}>
        <ScrollArea class="h-56" label="capsule demo">
          <div class="jx-log">
            {#each Array(60) as _, i (i)}
              <p class="jx-log-line">
                <span class="text-muted-foreground">[{(i * 137) % 1000}</span> ms] capsule thumb,
                idle fade, four pins — not a single platform scrollbar pixel
              </p>
            {/each}
          </div>
        </ScrollArea>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="chrome-params" data-reveal="">
    <SectionCard
      family="chrome-params"
      headerRegion="chrome-params"
      eyebrow="chrome parameters"
      title="radius × width — the configuration matrix"
    >
      <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
        The chrome's geometry is parameterized (Owner r2): the thumb is
        <strong>square-cut by default</strong> — <code class="text-accent">radius</code> paints any
        px or the retired-to-opt-in <code class="text-accent">'full'</code> capsule — and
        <code class="text-accent">width</code> tiers the lane (<code class="text-accent">thin</code>
        8px · <code class="text-accent">auto</code> 12px · <code class="text-accent">wide</code>
        16px, the thumb resting 4/8/12 and growing to 6/10/14 under hover/drag). The track runs
        FLUSH to the region edge and the growth is EDGE-ANCHORED: the edge-side flank pins while
        the thumb widens strictly into the content. Every cell below scrolls on both axes —
        hover a thumb in any tier to feel the anchor.
      </p>
      <ComponentCanvas
        title="scroll-area · radius × width"
        stage="fill"
        class="mt-4"
        files={chromeParamsFiles}
      >
        <div class="flex flex-col gap-5">
          {#each chromeRadiusModes as mode (mode.key)}
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">radius {mode.label}</span>
              <div class="grid gap-3 min-[900px]:grid-cols-3">
                {#each chromeWidthTiers as tier (tier)}
                  <div class="flex flex-col gap-1.5 border border-border/60 p-3">
                    <span class="text-[11px] text-muted-foreground">width {tier}</span>
                    <ScrollArea
                      orientation="both"
                      width={tier}
                      radius={mode.radius}
                      class="h-36"
                      label={`chrome params — radius ${mode.label}, width ${tier}`}
                    >
                      <div class="jx-matrix-doc">
                        <ol class="flex flex-col gap-1.5 p-1">
                          {#each Array(24) as _, i (i)}
                            <li class="border border-border/40 bg-muted/40 px-2 py-1 text-[11px] whitespace-nowrap">
                              {tier} lane · row {i + 1}
                            </li>
                          {/each}
                        </ol>
                      </div>
                    </ScrollArea>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="platform-sibling" data-reveal="">
    <SectionCard
      family="platform-sibling"
      headerRegion="platform-sibling"
      eyebrow="family sibling"
      title="native-scroll-area — the platform path, its own item"
    >
      <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
        The 2026-09-15 rework did NOT split native vs non-native inside one component: the
        platform scrollbar ships as its own registry item under the same token law, with the
        native best practices packaged as capability styles (stable gutter, stage-scoped
        color-scheme, width tiers, overscroll containment) — and NO custom scrollbar ARIA:
        the platform bar IS the accessibility contract there. It lives on
        <a class="text-accent" href="/docs/components/native-scroll-area.html">/docs/components/native-scroll-area.html</a>.
      </p>
    </SectionCard>
  </div>

  <div id="the-kit" data-reveal="">
    <SectionCard
      family="the-kit"
      headerRegion="the-kit"
      eyebrow="registry:lib · scroll-area-kit"
      title="scroll-area-kit — one kernel, split by concern"
      summary="The family's shared lib item (the control-chrome precedent): behavior lives in the kit; paint lives in the consumer."
    >
      <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
        THREE parts, so a consumer adopts exactly what it is: <strong>(a) the shared CORE</strong>
        (<code class="text-accent">core.ts</code>) — the overflow verdict (the scroll-run
        verdict's shape, one per axis pair), thumb geometry math, the RTL inline-engine
        funnel, and theme-scope resolution; zero paint, zero ARIA.
        <strong>(b) the HAND-DRAWN INTERACTION ADAPTER</strong>
        (<code class="text-accent">hand-drawn.svelte.ts</code>, consumed ONLY by scroll-area) —
        the idle fade, the four pins, drag pinning, keyboard scrolling, track paging, and the
        thumb's a11y contract mounted on consumer-rendered bare nodes.
        <strong>(c) the NATIVE CAPABILITY STYLES</strong>
        (<code class="text-accent">native-capability.css</code>, consumed ONLY by
        native-scroll-area) — the packaged platform best practices. The siblings share the
        core while touching disjoint kit parts.
      </p>
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

  <!-- Material3 sections: inside #sa-content so the outline-mode rail
       derives their entries from the h2 tree. -->
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One hand-drawn law over both axes; three orientation modes."><ComponentCanvas title="scroll-area · axes" stage="fill" files={scrollAreaTypesFiles}><div class="grid gap-4 min-[760px]:grid-cols-2">
      <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">vertical (default)</span><ScrollArea class="h-40" label="vertical sample" pad="0.75rem"><ol class="flex flex-col gap-2">{#each Array(12) as _, i (i)}<li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">item {i + 1}</li>{/each}</ol></ScrollArea></div>
      <div class="flex flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">horizontal</span><ScrollArea orientation="horizontal" class="h-40 w-full" label="horizontal sample"><ol class="flex gap-2">{#each Array(16) as _, i (i)}<li class="border border-border/40 bg-muted/40 w-36 flex-none px-3 py-1.5 text-[12.5px]">card {i + 1}</li>{/each}</ol></ScrollArea></div>
    </div></ComponentCanvas>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Give it a height, a label, and pad for the thumb lane; the rest is a native scroll container."><div class="flex flex-col gap-4"><CodeBlock code={basicUsage} lang="svelte" meta="basic" /><CodeBlock code={horizontalUsage} lang="svelte" meta="horizontal" /><CodeBlock code={tocUsage} lang="ts" meta="toc-outline" /></div></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The WAI scrollable-region pattern, PLUS the thumb's own scrollbar contract — mounted by the kit's adapter."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through the scrollable area (the region, then the thumb)' }, { key: '↑ ↓ ← → / Home / End / PgUp / PgDn', action: 'Native scrollport scrolling once the region is focused' }, { key: 'arrows / PgUp / PgDn / Home / End on the thumb', action: 'Keyboard-drag the thumb itself — steps, pages, jumps (role=scrollbar contract)' }, { key: 'pointer drag / track click', action: 'The thumb drags with pointer capture; a track click pages toward the click' }]} aria={[{ name: 'aria-label', value: 'label prop', description: 'Accessible name for the region (default "scrollable content")' }, { name: 'role', value: 'region', description: 'Plus tabindex=0 — the WAI scrollable-region pattern' }, { name: 'role (thumb)', value: 'scrollbar', description: 'The thumb\'s contract: aria-controls → the viewport, aria-valuenow tracking 0..100, aria-orientation, focusable, keyboard-draggable' }, { name: 'the four pins', value: 'focus-within / thumb focus / drag / hover', description: 'Each suspends the idle fade; while any pin holds the thumb stays in the accessibility tree ("AT-engaged" is not a detectable platform state and is deliberately not a pin)' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The capsule look rides the scrollbar-token law: currentColor family, no JS."><div class="flex flex-col gap-6"><DensityDemo><ScrollArea class="h-36" label="density sample" pad="0.75rem"><ol class="flex flex-col gap-2">{#each Array(10) as _, i (i)}<li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">item {i + 1}</li>{/each}</ol></ScrollArea></DensityDemo><TokenTable tokens={[{ name: '--scrollbar-thumb / -hover / -active', default: 'currentColor steps', source: 'theme', description: 'The token law the capsule paints with — dark stages restyle for free' }, { name: '--jx-scroll-thumb-radius', default: '0px (square-cut)', source: 'component', description: 'The thumb\'s corner radius — set by the radius prop (px or the \'full\' capsule); 0 by default' }, { name: '--jx-scroll-track-w', default: '12px (width tiers: 8/12/16)', source: 'component', description: 'The drawn lane\'s size — the width prop\'s tier table (thumb rides at track − 2×2px resting, growing +2px inward on hover/drag)' }, { name: '--jx-scroll-pad', default: 'pad prop', source: 'component', description: 'The ring padding keeping content clear of the thumb lane' }] } /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the ScrollArea Props interface (the scrollbar variant prop retired with the dual-mode era); getViewport()/scrollTo() are the imperative exports."><PropsTable props={[{ name: 'orientation', type: "'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'Which axes scroll: overflow-y/x mapping.' }, { name: 'label', type: 'string', default: "'scrollable content'", description: 'a11y name for the region.' }, { name: 'pad', type: 'string', default: '0', description: 'Ring padding (CSS length), inline-axis — keeps content clear of the thumb lane.' }, { name: 'radius', type: "number | 'full'", default: '—', description: 'Thumb corner radius: a px number or the \'full\' capsule. Omitted → 0 (square-cut, the r2 default — the hard capsule retired).' }, { name: 'width', type: "'auto' | 'thin' | 'wide'", default: "'auto'", description: 'The chrome width tier sizing the drawn lane (8/12/16px; thumb resting 4/8/12, hover/drag 6/10/14). \'none\' is native-only vocabulary.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough.' }, { name: 'style', type: 'string', default: '—', description: 'Style passthrough.' }, { name: 'onscroll', type: '(event: ViewportScrollEvent) => void', default: '—', description: 'Scroll callback from the viewport.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The scrolling content.', required: true }, { name: 'getViewport()', type: '() => HTMLDivElement | null', default: 'export', description: 'The scrollport element — Toc scrollRoot / engine-direct linkage.' }]} /></SectionCard></div>
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
  /* the matrix cell's content: fixed box overflowing BOTH axes inside
     the h-36 cell — both tiers' chrome mount together */
  .jx-matrix-doc {
    block-size: 420px;
    inline-size: 400px;
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
