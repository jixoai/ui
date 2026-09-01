<!-- entity spec fixture: the OUTER entity (depth 1) wrapping a nested
     entity component (depth 2) — the accumulation probe. -->
<script lang="ts">
  import { provideEntity } from '../../src/lib/entity.svelte';
  import EntityInner from './entity-inner.svelte';

  const depth = provideEntity();
</script>

<div data-jx-entity={depth} data-testid="entity-outer">
  <EntityInner />
</div>
