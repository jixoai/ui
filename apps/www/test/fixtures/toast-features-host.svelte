<!-- toast spec fixture: the material × effect × countdown vocabulary —
     pushes fixed shapes on mount (child viewport subscribes first, so
     the pushes land). -->
<script lang="ts">
  import { onMount } from 'svelte';
  import ToastViewport from '../../src/lib/ui/toast/toast-viewport.svelte';
  import { createToastStore } from '../../src/lib/toast-store';

  const store = createToastStore();
  onMount(() => {
    store.api.push({
      title: 'glass sweep',
      material: 'glass',
      effect: 'sweep',
      countdown: true,
      duration: 8000,
    });
    store.api.push({ title: 'plain pulse', effect: 'pulse' });
    // a sticky toast asking for a countdown gets NONE (an expiry gauge
    // on an immortal toast lies)
    store.api.push({ title: 'sticky', countdown: true, duration: 0 });
  });
</script>

<div data-testid="features">
  <ToastViewport {store} />
</div>
