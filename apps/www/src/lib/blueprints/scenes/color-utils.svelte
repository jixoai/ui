<!-- color-utils blueprint: the framework-free color bridge as a
     diagram (lib-scene precedent). The one-hue law lives in OKLCH;
     canvas/tailwind speak rgb()/hex — this lib is the only translator.
     Shows the conversion lattice every surface rides on. -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const lattice = [
    { from: 'oklch(L C H)', arrow: '→', to: 'parseColor()', note: 'hex · hsl · oklch in' },
    { from: 'oklchToRgb()', arrow: '→', to: 'rgb(r g b)', note: 'canvas fillStyle out' },
    { from: 'rgbToOklch()', arrow: '→', to: 'oklch()', note: 'round-trip proof' },
    { from: 'hsvToOklch()', arrow: '→', to: 'oklch()', note: 'the hue picker path' },
  ];

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div class={cx(bpA.colorUtilsStage)}>
  <div class={cx(bpA.colorUtilsPanel)}>
    <div class={cx(bpA.colorUtilsComment)}>// one-hue law lives in OKLCH; the canvas speaks rgb</div>
    {#each lattice as row (row.from)}
      <div class={cx(bpA.colorUtilsRow)}>
        <span class={cx(bpA.colorUtilsNode)}>{row.from}</span>
        <span class={cx(bpA.colorUtilsArrow)}>{row.arrow}</span>
        <span class={cx(bpA.colorUtilsChip)}>{row.to}</span>
        <span class={cx(bpA.colorUtilsNote)}>{row.note}</span>
      </div>
    {/each}
    <div class={cx(bpA.colorUtilsComment, bpA.colorUtilsTail)}>// parseColor never throws — null is the contract</div>
  </div>
</div>
