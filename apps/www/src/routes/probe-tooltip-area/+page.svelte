<script lang="ts">
  import TooltipAreaProbe from '$lib/__probe__/tooltip-area-probe.svelte';
</script>

<svelte:head>
  <title>Tooltip area probe · jixoai-ui</title>
  <!-- internal verification surface (verify-popover-area-align.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="p-8">
  <h1 class="mb-4 text-lg font-semibold">W5.1 tooltip position-area probe</h1>
  <p class="text-muted-foreground mb-6 max-w-prose text-[13px] leading-6">
    Internal verification surface: scripts/verify-popover-area-align.mjs loads this
    page headless (1440×900), hovers the REAL tooltip open at the six
    <code>?placement=</code> arms and the <code>?at=bottom|right</code> collision arms,
    and asserts the rendered bubble/anchor geometry plus the computed position-area —
    the W5 anchor-sweep regression gate. It is not a docs page and is excluded from
    search indexing.
  </p>
  <TooltipAreaProbe />
</main>
