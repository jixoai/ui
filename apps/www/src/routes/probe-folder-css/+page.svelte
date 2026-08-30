<script lang="ts">
  import FolderCssProbe from '$lib/__probe__/folder-css-probe.svelte';
  // duplicate-import probe: the SAME css also imported route-side —
  // the built output must still contain it exactly once
  import '$lib/__probe__/folder-css-probe.css';
</script>

<svelte:head>
  <title>Folder CSS probe · jixoai-ui</title>
  <!-- internal verification surface (verify-folder-css.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="p-8">
  <h1 class="mb-4 text-lg font-semibold">P0.1 folder-css contract probe</h1>
  <p class="text-muted-foreground mb-4 max-w-prose text-[13px] leading-6">
    Internal verification surface: this route exists so
    <code>scripts/verify-folder-css.mjs</code> can probe the built CSS for the
    folder-css contract (route-side imports deduplicated to exactly one copy).
    It is not a docs page and is excluded from search indexing.
  </p>
  <!-- utilities the verify script toggles onto probe elements; they
       must be statically present in source or Tailwind never emits
       them (dev-mode on-demand generation scans markup only) -->
  <div class="hidden p-8 text-primary border-8 border-primary" data-probe="util-pool"></div>
  <FolderCssProbe />
</main>
