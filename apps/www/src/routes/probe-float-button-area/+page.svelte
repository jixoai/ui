<script lang="ts">
  import FloatButtonAreaProbe from '$lib/__probe__/float-button-area-probe.svelte';
</script>

<svelte:head>
  <title>FloatButton area probe · jixoai-ui</title>
  <!-- internal verification surface (verify-popover-area-align.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="p-8">
  <h1 class="mb-4 text-lg font-semibold">W5.1 float-button position-area probe</h1>
  <p class="text-muted-foreground mb-6 max-w-prose text-[13px] leading-6">
    Internal verification surface: scripts/verify-popover-area-align.mjs loads this
    page headless (1440×900), opens the REAL float-button menu at the four
    <code>?corner=</code> arms, and asserts the rendered panel/stack geometry plus the
    computed position-area — the W5 anchor-sweep regression gate. It is not a docs
    page and is excluded from search indexing.
  </p>
  <FloatButtonAreaProbe />
</main>
