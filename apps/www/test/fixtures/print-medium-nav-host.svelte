<!--
  print-medium-nav-host (test fixture, print-pipeline integration
  2026-08-30) — the NAVIGATION shape: the medium readout sits OUTSIDE
  the source root, so a test can tear the source root down and slot a
  new one in (what a route change does to the docs layout's source
  root) while the document medium keeps reporting. Locks the P1-6
  seam: a stamped root LEAVING the tree, and a new root arriving
  (stamped or not), must both re-derive the medium — only childList
  observation at the document root sees those mutations.
-->
<script lang="ts">
  import { provideMedium } from '$lib/medium.svelte';
  const documentMedium = provideMedium({ root: () => document.documentElement });
</script>

<div>
  <span data-medium-out={documentMedium.medium}></span>
  <div data-print-source></div>
</div>
