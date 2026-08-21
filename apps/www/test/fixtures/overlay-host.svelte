<!--
  Test hosts for the batch-3 overlay trio: alert-dialog, sheet, and the
  toast pair. Each exposes its open/last-action state as data attributes
  so tests read behavior through the DOM.
-->
<script lang="ts">
  import AlertDialog from '../../src/lib/ui/alert-dialog.svelte';
  import Sheet from '../../src/lib/ui/sheet.svelte';
  import ToastViewport from '../../src/lib/ui/toast-viewport.svelte';
  import { createToastStore } from '../../src/lib/toast-store';

  let alertOpen = $state(false);
  let deleted = $state(false);
  let sheetOpen = $state(false);
  const toast = createToastStore();
</script>

<div data-deleted={deleted}>
  <button type="button" data-open-alert onclick={() => (alertOpen = true)}>delete</button>
  <AlertDialog
    bind:open={alertOpen}
    title="Delete the pipeline?"
    description="This removes 12 checks and their history. There is no undo."
    confirmLabel="Delete pipeline"
    onconfirm={() => (deleted = true)}
  />
</div>

<div>
  <button type="button" data-open-sheet onclick={() => (sheetOpen = true)}>filters</button>
  <Sheet bind:open={sheetOpen} title="Filters" side="right">
    <p>sheet body</p>
  </Sheet>
</div>

<div>
  <button
    type="button"
    data-toast-polite
    onclick={() => toast.api.push({ title: 'Deployed', description: 'build 4f2a' })}>
    toast
  </button>
  <button
    type="button"
    data-toast-sticky
    onclick={() =>
      toast.api.push({ title: 'Build failed', tone: 'destructive', assertive: true, duration: 0 })}>
    sticky toast
  </button>
  <ToastViewport store={toast} />
</div>
