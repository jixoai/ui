<!--
  Popover gap contract-test harness (test/fixtures/popover-gap-host.svelte).
  The children snippet must be real Svelte 5 markup, so the fixed consumer
  markup lives here. Props mirror the Popover gap API exactly as a
  consumer would drive it.
-->
<script lang="ts">
  import Popover from '../../src/lib/ui/popover/popover.svelte';

  let {
    gap = undefined,
    placement = undefined,
  }: {
    gap?: number | string;
    placement?: 'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start' | 'left' | 'right' | 'center';
  } = $props();
</script>

<Popover id="gap-host" triggerLabel="Actions" {gap} {placement}>
  <div class="flex flex-col">
    <button type="button" popovertarget="gap-host">Rename…</button>
  </div>
</Popover>
