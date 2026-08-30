<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import ProgressiveBlur from '$lib/ui/progressive-blur/progressive-blur.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import progressiveBlurSource from '$lib/ui/progressive-blur/progressive-blur.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import ProgressiveBlur from '@ui/progressive-blur';
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
    { name: 'registry/files/ui/progressive-blur/progressive-blur.svelte', content: progressiveBlurSource },
    { name: 'src/lib/ui/progressive-blur/usage.svelte', content: usage },
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="The band hangs from any scrollport edge; reveal chooses resting paint or scroll-in fade.">
    <div class="grid gap-4 min-[760px]:grid-cols-3">
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">position top / bottom</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">The band hangs into the viewport from that edge via a sticky h-0 root.</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">position both</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">Two pinned roots — keeps both edges progressive instead of one uniform-blur element.</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">reveal static / scroll</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">static paints always (Magic UI parity); scroll fades the ladder in with the nearest scroller.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Mount the band as an EARLY child of the scroll container, before the sticky head it sits under."><CodeBlock code={usage} lang="svelte" meta="ProgressiveBlur usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Pure scenery: the band is aria-hidden, pointer-events-none decoration over the scroller's real content."><A11yTable keys={[]} aria={[{ name: 'aria-hidden', value: 'true', description: 'The band is decoration; screen readers skip it entirely' }, { name: 'pointer-events', value: 'none', description: 'The band never intercepts pointer input over the scrolling content' }, { name: 'scroll()', value: '@supports-gated', description: 'Engines without scroll timelines keep the resting clean state — never a wrongly-painted band' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="No density footprint — the band is dimensionless chrome; its one token tunes the scroll-in ramp distance."><div class="flex flex-col gap-6"><DensityDemo><div class="relative h-40 overflow-auto border border-border"><ProgressiveBlur position="top" reveal="scroll" height="4rem" class="z-[5]" /><div class="sticky top-0 z-10 bg-background/60 p-2 text-[11px]">pinned head</div><ul class="flex flex-col gap-1 p-3" role="list">{#each rows.slice(0, 8) as row (row)}<li class="border border-border/50 bg-muted/30 px-2 py-2 font-mono text-[11px]">{row}</li>{/each}</ul></div></DensityDemo><TokenTable tokens={[{ name: '--jx-pblur-ramp', default: '72px', source: 'component', description: 'Scroll distance of the reveal fade-in (scroll timeline range)' }, { name: 'height', default: "'6rem'", source: 'component', description: 'Band height — any definite CSS length; % unsupported' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the ProgressiveBlurProps interface; the component ships no script at all."><PropsTable props={[{ name: 'position', type: "'top' | 'bottom' | 'both'", default: "'bottom'", description: 'Which scrollport edge(s) the band hangs from.' }, { name: 'height', type: 'string', default: "'6rem'", description: 'Band height — any definite CSS length (px/rem); % unsupported.' }, { name: 'blurLevels', type: 'number[]', default: '[0.5, 1, 2, 4, 8, 16, 32, 64]', description: 'Per-layer blur px, inner-edge first; at least 2 levels (fewer falls back to the default ladder).' }, { name: 'reveal', type: "'static' | 'scroll'", default: "'static'", description: 'static = always painted; scroll = fades in with the nearest scroller (@supports-gated).' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to each pinned root.' }]} /></SectionCard></div>
</div>
