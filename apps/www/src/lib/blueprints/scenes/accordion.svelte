<!-- accordion blueprint: native details/summary, one panel open. -->
<script lang="ts">
  import Accordion from '$lib/ui/accordion/accordion.svelte';
  import AccordionItem from '$lib/ui/accordion/accordion-item.svelte';
</script>

<Accordion exclusive class="flex h-full w-full flex-col justify-center p-10">
  <AccordionItem open>
    {#snippet summary()}What is the one-hue law?{/snippet}
    <p class="text-sm leading-6">Colors live in OKLCH; a project's identity is one CSS variable: --brand-hue.</p>
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}Why native details?{/snippet}
    <p class="text-sm leading-6">Toggle semantics, keyboard support and SSR state come free — nothing to hydrate.</p>
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}What is the same-source law?{/snippet}
    <p class="text-sm leading-6">The registry files and the site's copies share one source of truth.</p>
  </AccordionItem>
</Accordion>
