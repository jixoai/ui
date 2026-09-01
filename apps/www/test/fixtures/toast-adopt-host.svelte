<!-- toast spec fixture: a FAKE float plane — setContext provides the
     jx-top-layer contract, so the viewport renders through ScaffoldFloat
     (the adoption path) instead of self-floating. -->
<script lang="ts">
  import { setContext } from 'svelte';
  import ToastViewport from '../../src/lib/ui/toast/toast-viewport.svelte';
  import { createToastStore } from '../../src/lib/toast-store';
  import type { TopLayerApi } from '../../src/lib/ui/website-scaffold/website-scaffold.svelte';

  const store = createToastStore();
  setContext<TopLayerApi>('jx-top-layer', {
    adopt: () => () => {},
  });
</script>

<div data-testid="plane">
  <ToastViewport {store} />
</div>
