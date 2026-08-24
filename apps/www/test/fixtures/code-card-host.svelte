<!--
  Test host for the CodeCard prop-change contract: the swap button flips the
  runtime code prop so a test can observe what the card paints between the
  prop change and the async Shiki resolution.
-->
<script lang="ts">
  import CodeCard from '../../src/lib/ui/code-card/code-card.svelte';

  let code = $state('const first = 1;');

  const swap = (): void => {
    code = 'const second = 2;';
  };
</script>

<button type="button" onclick={swap}>swap</button>
<CodeCard {code} lang="ts" />
