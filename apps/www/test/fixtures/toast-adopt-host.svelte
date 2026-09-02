<!-- toast spec fixture: the REAL float plane (D-6 ruling, 2026-09-02 —
     no fake adopt() stubs): a full WebsiteScaffold mount whose
     jx-top-layer context the viewport adopts through, so the pointer
     law and the adoption path are asserted against the real provider,
     the real slot and the real website-scaffold.css. -->
<script lang="ts">
  import { onMount } from 'svelte';
  // pos is forwarded for the nine-slot forwarding test (R3 adversarial
  // P1-1) — the default host keeps the viewport's right-bottom default
  let { pos = undefined }: { pos?: string } = $props();
  import ToastViewport from '../../src/lib/ui/toast/toast-viewport.svelte';
  import WebsiteScaffold from '../../src/lib/ui/website-scaffold/website-scaffold.svelte';
  import { createToastStore } from '../../src/lib/toast-store';

  const store = createToastStore();
  // one sticky toast so the adopted card is IN the DOM (the pointer
  // law asserts the card's own opt-in class, not an empty plane)
  onMount(() => {
    store.api.push({ title: 'adopted', duration: 0 });
  });
</script>

{#snippet header()}
  <div data-testid="band">site header</div>
{/snippet}

<WebsiteScaffold {header}>
  <p data-testid="page">page content under the float plane</p>
  <ToastViewport {store} {pos} />
</WebsiteScaffold>
