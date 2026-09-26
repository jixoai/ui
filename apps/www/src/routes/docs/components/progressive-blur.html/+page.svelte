<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
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

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<ProgressiveBlur pin="grid" position="top" density="small" />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/progressive-blur-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Progressive blur · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai progressive blur: the scroll-edge blur atom (Magic UI port) — stacked masked backdrop-filter bands ramp blur from clear to full at the scrollport edge, pinned by a sticky h-0 root, zero JS, with a scroll-timeline reveal that keeps resting content clean."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="progressive blur — content scrolls UNDER a pinned head and diffuses"
      summary="The same-layer-sticky practice made literal: a list scrolling inside its own container gets a pinned head, and whatever passes beneath it diffuses instead of slicing. Stacked backdrop-filter bands, each masked to its own gradient rung, ramp blur from ~clear at the inner edge to the full stack at the scrollport edge. Zero JS: the pin is a sticky h-0 root (absolutely positioned overlays scroll away — probed), and the reveal rides the CSS scroll timeline, so nothing blurs while the list rests at the top."
    >
      <div class={cx(rt.wrap12)}>
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
      <div class={cx(rt.prPair)}>
        <div class={cx(rt.prHalf)}>
          <p class={cx(rt.inkMuted, rt.fontNav, rt.mb8, rt.text10, rt.upper, rt.track18)}>
            sticky head · reveal scroll — the rail law
          </p>
          <div class={cx(rt.prScroll64)}>
            <ProgressiveBlur position="top" reveal="scroll" height="7.5rem" class={cx(rt.prZ5)} />
            <div class={cx(rt.sticky, rt.top0, rt.z10, rt.pt16)}>
              <p class={cx(rt.microEyebrow, rt.inkMuted, rt.mb8, rt.ps12)}>
                components
              </p>
              <div class={cx(rt.px12, rt.pb8)}>
                <input
                  class={cx(rt.frame, rt.bgBackground55, rt.inkFg, rt.wFull, rt.px8, rt.py6, rt.fontMono, rt.text11)}
                  type="search"
                  placeholder="filter…"
                  aria-label="Demo filter"
                />
              </div>
            </div>
            <ul class={cx(rt.flex, rt.col, rt.gap4, rt.p12, rt.pt4)} role="list">
              {#each rows as row (row)}
                <li class={cx(rt.prRow)}>
                  {row}
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <div class={cx(rt.prHalf)}>
          <p class={cx(rt.inkMuted, rt.fontNav, rt.mb8, rt.text10, rt.upper, rt.track18)}>
            position bottom · reveal static
          </p>
          <div class={cx(rt.prScroll64)}>
            <ul class={cx(rt.flex, rt.col, rt.gap4, rt.p12)} role="list">
              {#each rows as row (row)}
                <li class={cx(rt.prRow)}>
                  {row}
                </li>
              {/each}
            </ul>
            <ProgressiveBlur position="bottom" height="5rem" />
          </div>
        </div>
      </div>
      {#snippet playground()}
        <p class={cx(rt.inkMuted, rt.pretty, rt.text115, rt.lead5)}>
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
      <p class={cx(rt.para)}>
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

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="The band hangs from any scrollport edge; the pin dialect picks the positioning law; reveal chooses resting paint or scroll-in fade.">
    <div class={cx(rt.grid760c)}>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>position top / bottom</span><p class={cx(rt.bodyMuted, rt.mt8)}>The band hangs into the viewport from that edge via a sticky h-0 root.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>position both</span><p class={cx(rt.bodyMuted, rt.mt8)}>Two pinned roots — keeps both edges progressive instead of one uniform-blur element.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>position start / end / inline</span><p class={cx(rt.bodyMuted, rt.mt8)}>The inline-axis edges of a horizontal-overflow strip; inline renders the start+end pair as two roots.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>pin sticky / grid</span><p class={cx(rt.bodyMuted, rt.mt8)}>sticky = the zero-height root inside a scroller (any edge); grid = a position-free item of the host one-cell grid — inline edges only, else it is a compile error.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>hold (grid only)</span><p class={cx(rt.bodyMuted, rt.mt8)}>The outer share (0–100) holding the ladder peak — the ramp compresses inboard for strips with a blank control lane at the clip edge.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>reveal static / scroll</span><p class={cx(rt.bodyMuted, rt.mt8)}>static paints always (Magic UI parity); scroll fades the ladder in with the nearest scroller — inline edges keep the static law.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Mount the band as an EARLY child of the scroll container, before the sticky head it sits under."><CodeBlock code={usage} lang="svelte" meta="ProgressiveBlur usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Pure scenery: the band is aria-hidden, pointer-events-none decoration over the scroller's real content."><A11yTable keys={[]} aria={[{ name: 'aria-hidden', value: 'true', description: 'The band is decoration; screen readers skip it entirely' }, { name: 'pointer-events', value: 'none', description: 'The band never intercepts pointer input over the scrolling content' }, { name: 'scroll()', value: '@supports-gated', description: 'Engines without scroll timelines keep the resting clean state — never a wrongly-painted band' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="No density footprint — the band is dimensionless chrome; its one token tunes the scroll-in ramp distance."><div class={cx(rt.col24)}><DensityDemo><div class={cx(rt.prScroll40)}><ProgressiveBlur position="top" reveal="scroll" height="4rem" class={cx(rt.prZ5)} /><div class={cx(rt.prPinnedHead)}>pinned head</div><ul class={cx(rt.flex, rt.col, rt.gap4, rt.p12)} role="list">{#each rows.slice(0, 8) as row (row)}<li class={cx(rt.prRow)}>{row}</li>{/each}</ul></div></DensityDemo><TokenTable tokens={[{ name: '--jx-pblur-ramp', default: '72px', source: 'component', description: 'Scroll distance of the reveal fade-in (scroll timeline range)' }, { name: 'height', default: "'6rem'", source: 'component', description: 'Band height — any definite CSS length; % unsupported' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. A FLAT subtractive veil by design (the 减色墨律's own child): the band's FIRST-TIME Defaults contract carries all eight axes with NO owns — no elevation rung, nothing to stamp absent an explicit lane. The supply chain is the point: the axis tree stays continuous through a band."
    >
      <ComponentCanvas title="ProgressiveBlur · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)} style="position: relative; height: 120px; overflow: auto;"><p class={cx(rt.text13)}>…scrolls…</p><ProgressiveBlur pin="grid" position="bottom" height="4rem" /></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the ProgressiveBlurProps interface (a dialect-discriminated union); the component's MECHANISM ships no script at all — the props lane is JS (resolution + stamps), the popover zero-script precedent."><PropsTable universal props={[{ name: 'pin', type: "'sticky' | 'grid'", default: "'sticky'", description: 'How the band pins to its edge. sticky = the zero-layout sticky root inside a scroller (any edge); grid = a position-free item of the host one-cell grid (grid-area 1/1 + justify-self per edge, inline edges only).' }, { name: 'position', type: "'top' | 'bottom' | 'both' | 'start' | 'end' | 'inline'", default: "'bottom'", description: 'Which scrollport edge(s) the band hangs from: both = the block pair, inline = the start+end pair (the horizontal-overflow strip). Narrows to start | end under pin=grid — other combos are compile-time errors (the runtime fallback is start).' }, { name: 'hold', type: 'number', default: '0', description: 'Grid dialect only: the outer share of the band (0–100, clamped) that holds the ladder peak instead of ramping — the ramp compresses into the inboard (100-hold)% for strips whose readable content parks inboard of the clip edge.' }, { name: 'height', type: 'string', default: "'6rem'", description: 'Band size along its hang axis — any definite CSS length (px/rem); % unsupported.' }, { name: 'blurLevels', type: 'number[]', default: '[0.5, 1, 2, 4, 8, 16, 32, 64]', description: 'Per-layer blur px, inner-edge first; at least 2 levels (fewer falls back to the default ladder).' }, { name: 'reveal', type: "'static' | 'scroll'", default: "'static'", description: 'static = always painted; scroll = fades in with the nearest scroller (@supports-gated; inline edges keep the always-painted static law).' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to each pinned root.' }]} /></SectionCard></div>
</div>
