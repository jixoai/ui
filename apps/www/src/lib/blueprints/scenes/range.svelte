<!-- range blueprint: mid-commit sliders — the ringed disc thumb over the
     primary fill, the second one with the tick ruler.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Range from '$lib/ui/range/range.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

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

  let volume = $state(40);
  let gain = $state(6);
</script>

<div class={cx(bpB.rangeStage)}>
  <div class={cx(bpB.rangeCol)}>
    <Range label="volume" min={0} max={100} bind:value={volume} />
    <Range label="gain" min={0} max={10} step={0.5} ticks bind:value={gain} />
  </div>
</div>
