<!--
  Test host for the terminal-patterns CTA band (2026-08-30): exposes
  the command payload so the suite can drive the copy contract.
-->
<script lang="ts">
  import PatternCta from '../../src/lib/ui/pattern-cta/pattern-cta.svelte';

  let {
    command = 'npx jixoai-ui add pattern-cta press-button code-card',
  }: { command?: string } = $props();
</script>

<PatternCta {command} />
