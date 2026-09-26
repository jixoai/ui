<script lang="ts">
  import PopoverAreaProbe from '$lib/__probe__/popover-area-probe.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import { onMount } from 'svelte';
  // hydration readiness stamp for verify-popover-area-align.mjs —
  // the gate this page's measurements wait on (pre-hydration DOM
  // measures stale geometry, the Gate-2 r1 dev-server red)
  let hydrated = false;
  onMount(() => {
    hydrated = true;
  });

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Popover area probe · jixoai-ui</title>
  <!-- internal verification surface (verify-popover-area-align.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class={cx(rt.ppaPad)} data-hydrated={hydrated ? '1' : '0'}>
  <h1 class={cx(rt.mb16, rt.textLg, rt.semibold)}>P0.1 popover position-area probe</h1>
  <p class={cx(rt.inkMuted, rt.ppaMb24, rt.ppaProse, rt.text13, rt.lead6)}>
    Internal verification surface: scripts/verify-popover-area-align.mjs loads this
    page headless (1440×900), opens the REAL popover below at
    <code>?placement=bottom-start</code> (primary arm) and
    <code>?placement=bottom-end</code> (negative-control arm), and asserts the
    rendered panel/pill edge alignment — the position-area span-suffix semantics
    regression gate. It is not a docs page and is excluded from search indexing.
  </p>
  <PopoverAreaProbe />
</main>
