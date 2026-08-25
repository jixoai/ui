<!-- density-context spec fixture (design-language-kernel P3):
     outer provider sm → nested provider xs (shadowing) → an explicit
     lg leaf inside the xs scope (explicit wins) -->
<script lang="ts">
  import Provider from './density-provider-host.svelte';
  import Leaf from './density-leaf-host.svelte';

  let { outer = 'sm' }: { outer?: 'sm' | 'lg' } = $props();
</script>

<Provider density={outer}>
  <Provider density="xs">
    <Leaf size="lg" />
  </Provider>
</Provider>
