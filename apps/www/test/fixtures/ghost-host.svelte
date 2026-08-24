<!--
  Test host for the accordion ghost paint variant: framed + ghost groups
  side by side, one bare item for the native contract check.
-->
<script lang="ts">
  import Accordion from '../../src/lib/ui/accordion/accordion.svelte';
  import AccordionItem from '../../src/lib/ui/accordion/accordion-item.svelte';

  let { ghost = false }: { ghost?: boolean } = $props();
</script>

<Accordion {ghost}>
  <AccordionItem>
    {#snippet summary()}Ghost one{/snippet}
    body
  </AccordionItem>
</Accordion>
