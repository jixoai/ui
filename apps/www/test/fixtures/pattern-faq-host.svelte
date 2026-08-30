<!--
  Test host for the terminal-patterns FAQ contract (2026-08-30):
  composes AccordionItem children inside the man-page frame the way
  a consumer authors them.
-->
<script lang="ts">
  import PatternFaq from '../../src/lib/ui/pattern-faq/pattern-faq.svelte';
  import AccordionItem from '../../src/lib/ui/accordion/accordion-item.svelte';

  let {
    command = 'jixoai-ui-faq',
    exclusive = true,
  }: { command?: string; exclusive?: boolean } = $props();
</script>

<PatternFaq {command} {exclusive}>
  <AccordionItem>
    {#snippet summary()}what is a pattern?{/snippet}
    <p>A composed section: atoms arranged into a landing-ready whole. You own the source after <code>add</code>.</p>
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}do patterns add new primitives?{/snippet}
    <p>Never — they declare the atoms they compose and the dependency closure installs them.</p>
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}can I fork the paint?{/snippet}
    <p>Yes: utilities you pass win by the layer law; the pattern css sits in components.</p>
  </AccordionItem>
</PatternFaq>
