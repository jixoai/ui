<!--
  Test host for the Mermaid surface contracts: the swap button flips the
  runtime source prop (the generation-discipline law — what paints between
  the prop change and the async engine resolution), and the .stage wrapper
  + .bystander sibling give the effective-scope observer tests a scoped
  ancestor to flip (.jx-light → dark) and an unrelated element to mutate.
-->
<script lang="ts">
  import Mermaid from '../../src/lib/ui/mermaid/mermaid.svelte';

  let source = $state('graph TD; A-->B');

  const swap = (): void => {
    source = 'graph TD; C-->D';
  };
</script>

<div class="stage jx-light">
  <Mermaid {source} name="flow" />
</div>
<div class="bystander"></div>
<button type="button" onclick={swap}>swap</button>
