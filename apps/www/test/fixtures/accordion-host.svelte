<!--
  Test host for the accordion contract: an exclusive group of three
  items plus a bare (group-less) item with bind:open surfaced as a data
  attribute.
-->
<script lang="ts">
  import Accordion from '../../src/lib/ui/accordion.svelte';
  import AccordionItem from '../../src/lib/ui/accordion-item.svelte';

  let loose = $state(false);
</script>

<Accordion exclusive>
  <AccordionItem>
    {#snippet summary()}Item one{/snippet}
    First body
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}Item two{/snippet}
    Second body
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}Item three{/snippet}
    Third body
  </AccordionItem>
</Accordion>

<AccordionItem bind:open={loose}>
  {#snippet summary()}Loose item{/snippet}
  <span data-loose-open={loose}>loose body</span>
</AccordionItem>
