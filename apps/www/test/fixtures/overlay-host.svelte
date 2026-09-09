<!--
  Test hosts for the batch-3 overlay trio: system-dialog, sheet, and the
  toast pair. Each exposes its open/last-action state as data attributes
  so tests read behavior through the DOM.
-->
<script lang="ts">
  import SystemDialog from '../../src/lib/ui/system-dialog/system-dialog.svelte';
  import {
    SystemDialogTrigger,
    SystemDialogContent,
    SystemDialogTitle,
    SystemDialogDescription,
    SystemDialogActions,
    SystemDialogAction,
    SystemDialogCancel,
  } from '../../src/lib/ui/system-dialog/index';
  import Sheet from '../../src/lib/ui/sheet/sheet.svelte';
  import ToastViewport from '../../src/lib/ui/toast/toast-viewport.svelte';
  import { createToastStore } from '../../src/lib/toast-store';

  let alertOpen = $state(false);
  let deleted = $state(false);
  let sheetOpen = $state(false);
  const toast = createToastStore();
</script>

<div data-deleted={deleted}>
  <SystemDialog bind:open={alertOpen} onconfirm={() => (deleted = true)}>
    <SystemDialogTrigger>delete</SystemDialogTrigger>
    <SystemDialogContent>
      <SystemDialogTitle>Delete the pipeline?</SystemDialogTitle>
      <SystemDialogDescription>
        This removes 12 checks and their history. There is no undo.
      </SystemDialogDescription>
      <SystemDialogActions>
        <SystemDialogCancel>cancel</SystemDialogCancel>
        <SystemDialogAction>Delete pipeline</SystemDialogAction>
      </SystemDialogActions>
    </SystemDialogContent>
  </SystemDialog>
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
      toast.api.push({ title: 'Build failed', variant: 'tonal', class: 'jx-hue-error', assertive: true, duration: 0 })}>
    sticky toast
  </button>
  <ToastViewport store={toast} />
</div>
