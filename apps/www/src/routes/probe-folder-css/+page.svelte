<script lang="ts">
  import FolderCssProbe from '$lib/__probe__/folder-css-probe.svelte';
  // duplicate-import probe: the SAME css also imported route-side —
  // the built output must still contain it exactly once
  import '$lib/__probe__/folder-css-probe.css';
</script>

<main class="p-8">
  <h1 class="mb-4 text-lg font-semibold">P0.1 folder-css contract probe</h1>
  <!-- utilities the verify script toggles onto probe elements; they
       must be statically present in source or Tailwind never emits
       them (dev-mode on-demand generation scans markup only) -->
  <div class="hidden p-8 text-primary border-8 border-primary" data-probe="util-pool"></div>
  <FolderCssProbe />
</main>
