<!--
  jixoai progressive blur (registry/files/ui/progressive-blur/progressive-blur.svelte).
  The scroll-edge blur atom: content scrolling under its OWN container's
  edge diffuses progressively instead of slicing. Magic UI port
  (2026-08-25) with two deliberate upgrades, both probed on Chromium:

    THE PIN — the overlay root is sticky h-0, never abspos-in-scroller
    (abspos children of a scroll container scroll away with content;
    the sticky zero-height root stays pinned to the scrollport edge at
    zero layout cost). The band (height prop) hangs INTO the viewport
    from that edge; its layers carry the effect.

    THE GRID DIALECT (Owner, 2026-09-01) — pin='grid' swaps the sticky
    pin for position-free tech: the band is a grid item of the
    consumer's ONE-CELL host (grid-area 1/1 + justify-self per edge),
    the ladder layers stack as grid items of the band, and a no-op
    translateZ(0) buys each band compositor isolation — without it a
    band at the scroll-origin edge samples a dead backdrop (the
    left-veil-is-invisible bug, measured 2026-09-01).

    THE HOLD (2026-09-01, grid dialect) — hold (0–100, clamped to it)
    parks the ladder's peak across the outer share of the band and
    compresses the ramp into the inboard (100-hold)%: strips whose
    readable content parks inboard of the clip edge (the tabs'
    chevron lane) would see a pure edge-peaked ramp blanch over blank.

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
    position?: 'top' | 'bottom' | 'both' | 'start' | 'end' | 'inline';
    /** band size along its hang axis — any definite CSS length
        (px/rem); % unsupported */
    height?: string;
    /** per-layer blur px, inner-edge first; ≥2 levels */
    blurLevels?: number[];
    /** static = always painted (Magic UI parity); scroll = fades in
        with the nearest scroller (CSS scroll timeline, @supports-gated
        — block-axis edges only; the scroll() timeline has no inline
        aim, so inline edges keep the always-painted static law and are
        never hidden — B-5, 2026-09-02) */
    reveal?: 'static' | 'scroll';
    /** how the band pins to its edge. sticky = the zero-layout sticky
     *  root INSIDE a scroller (the original atom); grid = a position-free
     *  dialect (Owner, 2026-09-01 — grid provides positioning, z-index
     *  the layering): the band is a sibling item in the consumer's
     *  ONE-CELL grid host (grid-area 1/1 + justify-self per edge), and
     *  the ladder layers stack as grid items of the band itself.
     *  start/end edges only in the grid dialect */
    pin?: 'sticky' | 'grid';
    /** grid dialect only: the outer share of the band (0–100, clamped
     *  to it, %) that HOLDS the ladder's peak instead of ramping — for
     *  strips whose readable content parks inboard of the clip edge (a
     *  control lane: the tabs' chevron lane + snap padding park the
     *  first label ~1.5 lanes in, so a pure edge-peaked ramp blanches
     *  over blank — the measured left-veil-is-invisible bug,
     *  2026-09-01). The ramp compresses into the inboard (100-hold)%
     *  and the top layers hold full strength through the lane to the
     *  edge */
    hold?: number;
    class?: string;
  }

  let {
    position = 'bottom',
    height = '6rem',
    blurLevels = [0.5, 1, 2, 4, 8, 16, 32, 64],
    reveal = 'static',
    pin = 'sticky',
    hold = 0,
    class: className = '',
  }: ProgressiveBlurProps = $props();

  /** which edges render: 'both' = the block pair, 'inline' = the
   *  inline pair (start+end) — the horizontal-overflow strip shape */
  const edges = $derived(
    position === 'both'
      ? (['top', 'bottom'] as const)
      : position === 'inline'
        ? (['start', 'end'] as const)
        : ([position] as const),
  );

  // ladder normalization: fewer than 2 levels cannot express a ramp
  // (step = 100/0, or one full-band rung) — fall back to the default
  // ladder rather than render a degenerate band
  const levels = $derived(blurLevels.length >= 2 ? blurLevels : [0.5, 1, 2, 4, 8, 16, 32, 64]);

  // hold clamps to [0,100] (B-11, 2026-09-02): a runaway hold drives
  // the ramp (100-hold) negative — gradient stops below 0% silently
  // kill the mask. At the clamp the ramp collapses onto a full-strength
  // band; below 0 the plain ladder stands
  const holdPct = $derived(Math.min(100, Math.max(0, hold)));

  /** layer i's paint: cumulative backdrop blur + its mask band. The
   *  gradient aims PHYSICALLY (css gradients have no logical 'to
   *  start'): the inline bands assume LTR — start maps 'to left',
   *  end 'to right'. With hold > 0 (grid dialect) the ramp compresses
   *  into the inboard (100-hold)% and every layer whose rung reaches
   *  the ramp's end stays OPAQUE through the outer lane to 100% */
  const layerStyle = (edge: 'top' | 'bottom' | 'start' | 'end', i: number): string => {
    const aim = edge === 'start' ? 'left' : edge === 'end' ? 'right' : edge;
    const g = (v: number) => `rgba(0, 0, 0, ${v})`;
    const pct = (v: number) => `${Math.round(v * 100) / 100}%`;
    let stops: string;
    if (holdPct > 0 && pin === 'grid') {
      const ramp = 100 - holdPct;
      const step = ramp / levels.length;
      const holdsPeak = (i + 3) * step >= ramp - 0.01;
      stops = holdsPeak
        ? `${g(0)} ${pct(i * step)}, ${g(1)} ${pct((i + 1) * step)}, ${g(1)} 100%`
        : `${g(0)} ${pct(i * step)}, ${g(1)} ${pct((i + 1) * step)}, ${g(1)} ${pct((i + 2) * step)}, ${g(0)} ${pct(Math.min(100, (i + 3) * step))}`;
    } else {
      const step = 100 / levels.length;
      stops = `${g(0)} ${pct(i * step)}, ${g(1)} ${pct((i + 1) * step)}, ${g(1)} ${pct((i + 2) * step)}, ${g(0)} ${pct(Math.min(100, (i + 3) * step))}`;
    }
    const mask = `linear-gradient(to ${aim}, ${stops})`;
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
  {#if pin === 'grid'}
    <!-- the grid dialect (Owner, 2026-09-01): positioning by GRID and
         layering by z-index — the band is a grid item of the
         consumer's ONE-CELL host and the ladder layers are grid items
         of the band ([grid-area:1/1] each) — no position tech
         anywhere. PAINT LAW (empirical, Chromium 152): the band must
         paint AFTER the scrolled content and carry a no-op
         translateZ(0) — compositor isolation, never positioning —
         which gives EACH band its own layer; without it a band at the
         scroll-origin edge samples a dead backdrop and only the first
         band after the scroller paints (the left-veil-is-invisible
         bug, measured 2026-09-01; with translateZ the grid-item
         layers paint full-strength — verified pixel-equal) -->
    <div
      class={cn(
        'jx-pblur pointer-events-none grid [grid-area:1/1] self-stretch [transform:translateZ(0)]',
        edge === 'start' ? 'justify-self-start' : 'justify-self-end',
        className,
      )}
      style="width: {height}"
      data-jx-pblur=""
      data-position={edge}
      data-variant={reveal}
      aria-hidden="true"
    >
      {#each levels as _, i (i)}
        <div class="jx-pblur-layer [grid-area:1/1]" style={layerStyle(edge, i)}></div>
      {/each}
    </div>
  {:else}
    <!-- scenery: the band is decoration over the scroller's content. The
         sticky offset (top-0/bottom-0/start-0/end-0) is LOAD-BEARING:
         position:sticky without an offset is inert. data-VARIANT (not
         data-reveal): the docs site's entrance system owns the bare
         [data-reveal] selector — the collision pinned the band ~10px off
         the edge through a view()-timeline transform (vision r2 finding) -->
    <div
      class={cn(
        'jx-pblur pointer-events-none sticky z-10',
        edge === 'top' || edge === 'bottom' ? 'h-0' : 'w-0',
        edge === 'top' && 'top-0',
        edge === 'bottom' && 'bottom-0',
        edge === 'start' && 'start-0',
        edge === 'end' && 'end-0',
        className,
      )}
      data-jx-pblur=""
      data-position={edge}
      data-variant={reveal}
      aria-hidden="true"
    >
      {#if edge === 'top' || edge === 'bottom'}
        <div class="absolute inset-x-0 {edge === 'top' ? 'top-0' : 'bottom-0'}" style="height: {height}">
          {#each levels as _, i (i)}
            <div class="jx-pblur-layer absolute inset-0" style={layerStyle(edge, i)}></div>
          {/each}
        </div>
      {:else}
        <div class="absolute inset-y-0 {edge === 'start' ? 'start-0' : 'end-0'}" style="width: {height}">
          {#each levels as _, i (i)}
            <div class="jx-pblur-layer absolute inset-0" style={layerStyle(edge, i)}></div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
{/each}
