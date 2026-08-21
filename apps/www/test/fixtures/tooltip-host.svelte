<!--
  Test host for the tooltip intent contract: a real focusable trigger
  inside the wrapper, so focusin/focusout and pointer intent run against
  the same DOM a consumer would write.
-->
<script lang="ts">
  import Tooltip from '../../src/lib/ui/tooltip.svelte';
</script>

<Tooltip text="Copy to clipboard">
  <button type="button">copy</button>
</Tooltip>
