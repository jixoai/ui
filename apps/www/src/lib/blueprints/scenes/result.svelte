<!-- result blueprint: the page-level outcome — status glyph in the framed
     tile, uppercase title, description, action row.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Result from '$lib/ui/result/result.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
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
</script>

<div class={cx(bpB.resultStage)}>
  <div class={cx(bpB.resultCard)}>
    <Result density="lg"
      status="success"
      title="release shipped"
      description="Registry 77 published to ui.jixoai.com — p95 unchanged, zero dropped builds."
    >
      {#snippet actions()}
        <PressButton variant="outline">view release</PressButton>
        <PressButton variant="fill">share</PressButton>
      {/snippet}
    </Result>
  </div>
</div>
