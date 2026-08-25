<!--
  jixoai progressive blur (registry/files/ui/progressive-blur.svelte).
  The scroll-edge blur atom: content scrolling under its OWN container's
  edge diffuses progressively instead of slicing. Magic UI port
  (2026-08-25) with two deliberate upgrades, both probed on Chromium:

    THE PIN — the overlay root is sticky h-0, never abspos-in-scroller
    (abspos children of a scroll container scroll away with content;
    the sticky zero-height root stays pinned to the scrollport edge at
    zero layout cost). The band (height prop) hangs INTO the viewport
    from that edge; its layers carry the effect.

    THE LADDER — one gradient formula for every layer (Magic UI's
    first/last special cases are the clamped edges of the same form):
    step = 100/levels; layer i masks transparent→opaque→opaque→
    transparent at i·step…(i+3)·step while blurring levels[i]px. Each
    backdrop-filter layer blurs everything beneath it INCLUDING earlier
    layers, so the stack ramps from ~clear at the inner edge to the
    full blur at the scrollport edge. position='both' renders two
    pinned roots — Magic UI's single full-height element degenerates
    into uniform blur; the twin roots keep both edges progressive.

    THE REVEAL (jixoai extension) — reveal='scroll' fades the ladder in
    with the scroller (nothing blurs at rest; see progressive-blur.css
    for the opacity-on-layers law and the @supports scroll() gate).
    Zero JS in every mode: the component ships no script at all.

  Height takes a definite CSS length (default 6rem). Percentages are
  NOT supported — the band resolves % against the 0-height sticky root
  (documented deviation from Magic UI's '30%' default).
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import './progressive-blur.css';

  export interface ProgressiveBlurProps {
    /** which scrollport edge(s) the band hangs from */
    position?: 'top' | 'bottom' | 'both';
    /** band height — any definite CSS length (px/rem); % unsupported */
    height?: string;
    /** per-layer blur px, inner-edge first; ≥2 levels */
    blurLevels?: number[];
    /** static = always painted (Magic UI parity); scroll = fades in
        with the nearest scroller (CSS scroll timeline, @supports-gated) */
    reveal?: 'static' | 'scroll';
    class?: string;
  }

  let {
    position = 'bottom',
    height = '6rem',
    blurLevels = [0.5, 1, 2, 4, 8, 16, 32, 64],
    reveal = 'static',
    class: className = '',
  }: ProgressiveBlurProps = $props();

  const edges = $derived(position === 'both' ? (['top', 'bottom'] as const) : ([position] as const));

  // ladder normalization: fewer than 2 levels cannot express a ramp
  // (step = 100/0, or one full-band rung) — fall back to the default
  // ladder rather than render a degenerate band
  const levels = $derived(blurLevels.length >= 2 ? blurLevels : [0.5, 1, 2, 4, 8, 16, 32, 64]);

  const pct = (v: number): string => `${Math.round(v * 100) / 100}%`;

  /** layer i's paint: cumulative backdrop blur + its mask band */
  const layerStyle = (edge: 'top' | 'bottom', i: number): string => {
    const step = 100 / levels.length;
    const mask = `linear-gradient(to ${edge}, rgba(0, 0, 0, 0) ${pct(i * step)}, rgba(0, 0, 0, 1) ${pct((i + 1) * step)}, rgba(0, 0, 0, 1) ${pct((i + 2) * step)}, rgba(0, 0, 0, 0) ${pct((i + 3) * step)})`;
    const blur = `blur(${levels[i]}px)`;
    return [
      `-webkit-backdrop-filter: ${blur}`,
      `backdrop-filter: ${blur}`,
      `-webkit-mask-image: ${mask}`,
      `mask-image: ${mask}`,
    ].join('; ');
  };
</script>

{#each edges as edge (edge)}
  <!-- scenery: the band is decoration over the scroller's content. The
       sticky offset (top-0/bottom-0) is LOAD-BEARING: position:sticky
       without an offset is inert. data-VARIANT (not data-reveal): the
       docs site's entrance system owns the bare [data-reveal]
       selector — the collision pinned the band ~10px off the edge
       through a view()-timeline transform (vision r2 finding) -->
  <div
    class={cn('jx-pblur pointer-events-none sticky z-10 h-0', edge === 'top' ? 'top-0' : 'bottom-0', className)}
    data-jx-pblur=""
    data-position={edge}
    data-variant={reveal}
    aria-hidden="true"
  >
    <div
      class="absolute inset-x-0 {edge === 'top' ? 'top-0' : 'bottom-0'}"
      style="height: {height}"
    >
      {#each levels as _, i (i)}
        <div class="jx-pblur-layer absolute inset-0" style={layerStyle(edge, i)}></div>
      {/each}
    </div>
  </div>
{/each}
