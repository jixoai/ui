<!-- entity spec fixture: the INNER entity — proves provideEntity()
     accumulates through the Svelte context chain (depth 2 inside
     depth 1). -->
<script lang="ts">
  import { provideEntity } from '../../src/lib/entity.svelte';

  const depth = provideEntity();
</script>

<div data-jx-entity={depth} data-testid="entity-inner">
  <span data-testid="entity-inner-depth">{depth}</span>
</div>
