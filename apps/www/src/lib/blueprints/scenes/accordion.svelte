<!-- accordion blueprint: native details/summary, one panel open. -->
<script lang="ts">
  import Accordion from '$lib/ui/accordion/accordion.svelte';
  import AccordionItem from '$lib/ui/accordion/accordion-item.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members.
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

<Accordion exclusive class={cx(bpA.accordionStage)}>
  <AccordionItem open>
    {#snippet summary()}What is the one-hue law?{/snippet}
    <p class={cx(bpA.accordionBody)}>Colors live in OKLCH; a project's identity is one CSS variable: --brand-hue.</p>
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}Why native details?{/snippet}
    <p class={cx(bpA.accordionBody)}>Toggle semantics, keyboard support and SSR state come free — nothing to hydrate.</p>
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}What is the same-source law?{/snippet}
    <p class={cx(bpA.accordionBody)}>The registry files and the site's copies share one source of truth.</p>
  </AccordionItem>
</Accordion>
