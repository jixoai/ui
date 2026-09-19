<!-- pattern-faq blueprint: the man-page FAQ — command(section) head,
     dotted leader, accordion disclosure, SEE ALSO close.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import PatternFaq from '$lib/ui/pattern-faq/pattern-faq.svelte';
  import AccordionItem from '$lib/ui/accordion/accordion-item.svelte';
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

<Stack align="center" justify="center" class={cx(bpB.patternFaqStage)}>
  <PatternFaq command="jixoai-ui-faq" section="7">
    <AccordionItem>
      {#snippet summary()}does it ship javascript?{/snippet}
      the atoms ride native elements — the bridge is one custom element,
      everything else is css law.
    </AccordionItem>
    <AccordionItem>
      {#snippet summary()}can i override the physics?{/snippet}
      the press law is the contract: inject tokens (--jx-press-shadow*)
      but the body never moves on hover.
    </AccordionItem>
    <AccordionItem>
      {#snippet summary()}what about density?{/snippet}
      ambient context, one kernel: --jx-hit derives the lane at every
      tier, no per-component branching.
    </AccordionItem>
  </PatternFaq>
</Stack>
