<!-- pattern-hero-set blueprint: the terminal-window hero — one
     copyCommand string driving the CTA, the clipboard payload and the
     typed demo. (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import PatternHeroSet from '$lib/ui/pattern-hero-set/pattern-hero-set.svelte';
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

<div class={cx(bpB.patternHeroSetStage)}>
  <PatternHeroSet
    eyebrow="jixoai-ui"
    summary="the terminal-native component registry — zero runtime deps, one physics."
    copyCommand="npx jixoai-ui init"
    barTitle="~/dev/app"
  />
</div>
