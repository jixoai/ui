<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import ProgressiveBlur from '$lib/ui/progressive-blur/progressive-blur.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import progressiveBlurSource from '$lib/ui/progressive-blur/progressive-blur.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import ProgressiveBlur from '@ui/progressive-blur.svelte';
${close}

<!-- an EARLY child of the scroll container — the sticky h-0 root
     pins to the scrollport edge through the whole scroll range -->
<div class="relative h-72 overflow-auto">
  <ProgressiveBlur position="top" reveal="scroll" class="z-[5]" />
  <!-- the sticky head pins ABOVE the band (z-10); the list scrolls
       under both through the progressive fade -->
  <div class="sticky top-0 z-10">…title + filter…</div>
  <!-- …the scrolling list… -->
</div>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/progressive-blur.svelte', content: progressiveBlurSource },
    { name: 'src/lib/ui/progressive-blur-usage.svelte', content: usage },
  ];

  // the demo list: enough rows to make both scrollers truly scroll
  const rows = Array.from({ length: 18 }, (_, i) => `entry-${String(i + 1).padStart(2, '0')}`);
</script>

<svelte:head>
  <title>Progressive blur · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai progressive blur: the scroll-edge blur atom (Magic UI port) — stacked masked backdrop-filter bands ramp blur from clear to full at the scrollport edge, pinned by a sticky h-0 root, zero JS, with a scroll-timeline reveal that keeps resting content clean."
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
      eyebrow="registry:ui · NativeHTML"
      title="progressive blur — content scrolls UNDER a pinned head and diffuses"
      summary="The same-layer-sticky practice made literal: a list scrolling inside its own container gets a pinned head, and whatever passes beneath it diffuses instead of slicing. Stacked backdrop-filter bands, each masked to its own gradient rung, ramp blur from ~clear at the inner edge to the full stack at the scrollport edge. Zero JS: the pin is a sticky h-0 root (absolutely positioned overlays scroll away — probed), and the reveal rides the CSS scroll timeline, so nothing blurs while the list rests at the top."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">zero JS</span>
        <span class="pill">sticky h-0 pin</span>
        <span class="pill">scroll-timeline reveal</span>
      </div>
    </SectionCard>
  </div>

  <div id="pblur-demo" data-region="pblur-demo" data-family="pblur-demo" data-reveal="">
    <ComponentCanvas
      title="progressive blur"
      description="THE docs-rail composition (left): the head pins at the edge, the list scrolls UNDER it through the progressive band — scroll the card and watch the entries diffuse beneath the pinned title/filter. Right: the always-painted static band at the bottom edge, the Magic UI default posture."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/progressive-blur/progressive-blur.svelte"
      files={canvasFiles}
    >
      <div class="flex w-full flex-col gap-6 sm:flex-row sm:gap-8">
        <div class="w-full sm:flex-1">
          <p class="text-muted-foreground font-nav mb-2 text-[10px] uppercase tracking-[0.18em]">
            sticky head · reveal scroll — the rail law
          </p>
          <div class="border-border bg-background relative h-64 overflow-auto border">
            <ProgressiveBlur position="top" reveal="scroll" height="7.5rem" class="z-[5]" />
            <div class="sticky top-0 z-10 pt-4">
              <p class="text-muted-foreground font-nav mb-2 ps-3 text-[10px] uppercase tracking-[0.24em]">
                components
              </p>
              <div class="px-3 pb-2">
                <input
                  class="border-border bg-background/55 text-foreground border w-full px-2 py-1.5 font-mono text-[11px]"
                  type="search"
                  placeholder="filter…"
                  aria-label="Demo filter"
                />
              </div>
            </div>
            <ul class="flex flex-col gap-1 p-3 pt-1" role="list">
              {#each rows as row (row)}
                <li class="border-border/50 bg-muted/30 border px-2 py-2 font-mono text-[11px]">
                  {row}
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <div class="w-full sm:flex-1">
          <p class="text-muted-foreground font-nav mb-2 text-[10px] uppercase tracking-[0.18em]">
            position bottom · reveal static
          </p>
          <div class="border-border bg-background relative h-64 overflow-auto">
            <ul class="flex flex-col gap-1 p-3" role="list">
              {#each rows as row (row)}
                <li class="border-border/50 bg-muted/30 border px-2 py-2 font-mono text-[11px]">
                  {row}
                </li>
              {/each}
            </ul>
            <ProgressiveBlur position="bottom" height="5rem" />
          </div>
        </div>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the docs rail you are browsing wears the left card's exact law — pinned head, band
          z-under it, reveal='scroll'. Engines without scroll timelines keep the resting clean
          state (the reveal degrades to no effect, never a wrongly-painted band).
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="pblur-usage" data-reveal="">
    <SectionCard
      family="pblur-usage"
      headerRegion="pblur-usage"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div id="pblur-law" data-reveal="">
    <SectionCard
      family="pblur-law"
      headerRegion="pblur-law"
      eyebrow="the technique"
      title="How the ladder works"
    >
      <p class="text-muted-foreground text-pretty text-[13px] leading-6">
        Each layer blurs everything painted beneath it — including the earlier layers — so
        stacking masked runs compounds. With the default eight levels, layer i owns the rung
        between i·12.5% and (i+3)·12.5% of the band: near the inner edge only the half-pixel
        layer contributes; at the scrollport edge the whole 0.5→64px stack is active. The
        reveal animates opacity on EACH LAYER (an opacity on a common ancestor would create a
        backdrop root and the layers would sample nothing beneath themselves), driven by
        scroll(nearest) over --jx-pblur-ramp (72px default).
      </p>
      <CodeBlock
        code={/* css */ `/* layer i of n — the whole ladder is this one formula */
step = 100 / n;
mask: linear-gradient(to edge,
  transparent i·step, opaque (i+1)·step,
  opaque (i+2)·step, transparent (i+3)·step);
backdrop-filter: blur(levels[i]px);`}
        lang="css"
        meta="the formula"
      />
    </SectionCard>
  </div>
  </div>
</div>
