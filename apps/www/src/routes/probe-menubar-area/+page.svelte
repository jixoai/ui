<script lang="ts">
  import MenubarAreaProbe from '$lib/__probe__/menubar-area-probe.svelte';
</script>

<svelte:head>
  <title>Menubar area probe · jixoai-ui</title>
  <!-- internal verification surface (verify-popover-area-align.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="p-8">
  <h1 class="mb-4 text-lg font-semibold">W5.1 menubar position-area probe</h1>
  <p class="text-muted-foreground mb-6 max-w-prose text-[13px] leading-6">
    Internal verification surface: scripts/verify-popover-area-align.mjs loads this
    page headless (1440×900), opens the REAL menubar panel at the <code>?at=top</code>
    direct arm and the <code>?at=bottom</code> flip-block collision arm, and asserts
    the rendered panel/item geometry plus the computed position-area — the W5
    anchor-sweep regression gate. It is not a docs page and is excluded from search
    indexing.
  </p>
  <MenubarAreaProbe />
</main>
