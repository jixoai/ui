<!--
  print-medium-root-host (test fixture, print-pipeline integration
  2026-08-30) — the ROOT layout's medium shape: a DOCUMENT-level
  provideMedium (root = document.documentElement), while the stamp
  carrier (the print layer's source root) lives DEEP in the tree and
  changes across navigations. The span mirrors the derived medium so
  assertions read the DOM, not internals.
-->
<script lang="ts">
  import { provideMedium } from '$lib/medium.svelte';
  const documentMedium = provideMedium({ root: () => document.documentElement });
</script>

<div>
  <div data-print-source>
    <span data-medium-out={documentMedium.medium}></span>
  </div>
</div>
