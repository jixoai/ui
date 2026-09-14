<script lang="ts">
  import PopoverAreaProbe from '$lib/__probe__/popover-area-probe.svelte';
</script>

<svelte:head>
  <title>Popover area probe · jixoai-ui</title>
  <!-- internal verification surface (verify-popover-area-align.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="p-8">
  <h1 class="mb-4 text-lg font-semibold">P0.1 popover position-area probe</h1>
  <p class="text-muted-foreground mb-6 max-w-prose text-[13px] leading-6">
    Internal verification surface: scripts/verify-popover-area-align.mjs loads this
    page headless (1440×900), opens the REAL popover below at
    <code>?placement=bottom-start</code> (primary arm) and
    <code>?placement=bottom-end</code> (negative-control arm), and asserts the
    rendered panel/pill edge alignment — the position-area span-suffix semantics
    regression gate. It is not a docs page and is excluded from search indexing.
  </p>
  <PopoverAreaProbe />
</main>
