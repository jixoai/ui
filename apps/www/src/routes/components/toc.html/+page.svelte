<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc, { type TocSection } from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tocSource from '$lib/ui/toc.svelte?raw';
  import tocEngineSource from '$lib/toc-engine?raw';

  const close = '</' + 'script>';

  // THIS PAGE is the demo: the rail on the right is the live component, and
  // the sections inside the workbench stage carry the data-region /
  // data-family marks it watches — dogfooding, not a mock
  const tocSections: TocSection[] = [
    {
      id: 'toc-what',
      label: 'what it tracks',
      children: [
        { id: 'toc-weights', label: 'IoM weights' },
        { id: 'toc-line', label: 'the line pick' },
      ],
    },
    { id: 'toc-anatomy', label: 'two surfaces' },
    { id: 'toc-engine', label: 'the engine' },
    { id: 'toc-usage', label: 'usage' },
  ];

  const usage = `<script lang="ts">
  import Toc from '@ui/toc.svelte';
${close}

<aside class="page-grid-right"><!-- sticky in your grid -->
  <Toc {sections} scrollRoot=".my-scroll-root" />
</aside>

<!-- content marks non-overlapping leaf blocks + parent extents -->
<section id="intro" data-family="intro">
  <h2 data-region="intro-head">Intro</h2>
  <div data-region="intro-body">…</div>
</section>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/toc.svelte', content: tocSource },
    { name: 'registry/files/lib/toc-engine.ts', content: tocEngineSource },
    { name: 'src/lib/ui/toc-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>ToC · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toc: a rule-tracker reading rail — desktop spine with IoM-weighted nodes, mobile terminal rail — powered by the framework-free toc-engine (intersection-over-minimum weights + the line pick)."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail — the LIVE component itself: aside precedes the content in the
       DOM, desktop sticky right column, mobile the glass single-row bar under
       the scaffold header. scrollRoot is mandatory in the overlay shell. -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · engine"
      title="toc — the rule tracker rail"
      summary="A reading-progress rail that measures instead of guessing: per-frame geometry snapshots compute IoM weights (intersection over the smaller of block and viewport) and a viewport-top line pick. Desktop gets the spine with weighted nodes; mobile gets the glass terminal rail. This page is the live demo — the rail on the right is the component itself, watching the very sections staged inside the workbench below."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">IoM weights</span>
        <span class="pill">line pick</span>
        <span class="pill">desktop spine + mobile rail</span>
        <span class="pill">framework-free engine</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the tracked article lives on the stage; the page rail spies
       on it through the data-region / data-family marks -->
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="toc"
      description="Scroll and watch the rail: nodes fill proportionally to how much of their block occupies the viewport, and the bold marker is the viewport-top line pick. Resize across 900px to watch the desktop spine and the mobile glass row swap."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/toc.svelte"
      stage="start"
      {files}
    >
      <article class="flex w-full min-w-0 flex-col gap-8">
        <div class="flex flex-col gap-8" data-family="toc-what">
          <section id="toc-what" class="flex flex-col gap-4" data-region="toc-what">
            <h2 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.22rem]">what it tracks</h2>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              Scroll this page and watch the rail: nodes fill proportionally to how much of their
              block occupies the viewport — a half-visible heading block reads ~50%, not a binary
              in-view flag. Both directions saturate: cover the viewport entirely and the weight
              is 100%.
            </p>
          </section>
          <div id="toc-weights" class="flex flex-col gap-4" data-region="toc-weights">
            <h3 class="font-nav text-[0.95rem] tracking-tight">IoM weights</h3>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground">
              Intersection-over-minimum: the intersection area divided by the smaller of the block
              and the viewport. Tall blocks don't dwarf small ones — a short block fully visible
              weighs the same 100% as a tall block filling the screen.
            </p>
          </div>
          <div id="toc-line" class="flex flex-col gap-4" data-region="toc-line">
            <h3 class="font-nav text-[0.95rem] tracking-tight">the line pick</h3>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground">
              The bold marker is the viewport-top LINE: whichever region contains it is the pick.
              Margins between blocks resolve downward to the next block — the line never floats in
              dead space. On mobile the line sits at the sticky rail's bottom edge.
            </p>
          </div>
        </div>
        <section id="toc-anatomy" class="flex flex-col gap-4" data-region="toc-anatomy">
          <h2 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.22rem]">two surfaces, one component</h2>
          <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
            Desktop (≥ the toc.css breakpoint) renders the spine: numbered level-1 nodes with
            weight fills, level-2 as weighted text, the pick as the strong node, parent extents as
            ghost markers. Mobile collapses to the glass terminal rail — one row, scroll-snap
            list, height expands on demand and nothing else moves. Resize this window across the
            breakpoint to watch the swap.
          </p>
        </section>
        <section id="toc-engine" class="flex flex-col gap-4" data-region="toc-engine">
          <h2 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.22rem]">the engine</h2>
          <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
            toc-engine.ts is framework-free: observe regions with data-region and parents with
            data-family, and it calls onUpdate(weights, pick) on scroll and resize (rAF-throttled).
            The Svelte component is one consumer; the same engine can drive a progress bar, a
            checker, or a native mobile app's web view.
          </p>
        </section>
        <section id="toc-usage" class="flex flex-col gap-4" data-region="toc-usage">
          <h2 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.22rem]">usage</h2>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
          <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground">
            The contract is honest about the hard part: leaf regions must not overlap
            (heading-to-next-heading blocks), parents carry data-family on their whole extent. Get
            that right and the weights are exact — get it wrong and the engine faithfully reports
            the overlap.
          </p>
        </section>
      </article>
    </ComponentCanvas>
  </div>
  </div>
</div>
