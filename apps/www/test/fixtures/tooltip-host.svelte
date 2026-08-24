<!--
  Test host for the tooltip intent contract: a real focusable trigger
  inside the wrapper, so focusin/focusout and pointer intent run against
  the same DOM a consumer would write. openDelay passes through for the
  hover-intent opt-in assertions.
-->
<script lang="ts">
  import Tooltip from '../../src/lib/ui/tooltip/tooltip.svelte';

  let { openDelay = 0 }: { openDelay?: number } = $props();
</script>

<Tooltip text="Copy to clipboard" {openDelay}>
  <button type="button">copy</button>
</Tooltip>
