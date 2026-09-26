<!-- pattern-cta blueprint: the shell-prompt CTA band — lead block,
     the install command on a code card, exactly ONE copy affordance.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import PatternCta from '$lib/ui/pattern-cta/pattern-cta.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

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

<Stack align="center" justify="center" class={cx(bpB.patternCtaStage)}>
  <PatternCta
    heading="ship it today"
    summary="one init, every atom, zero runtime dependencies."
    command="npx jixoai-ui init"
    secondaryLabel="read the docs"
    secondaryHref="/docs.html"
  />
</Stack>
