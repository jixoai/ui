<script lang="ts">
  import FloatButtonAreaProbe from '$lib/__probe__/float-button-area-probe.svelte';
  import { onMount } from 'svelte';
  import { rt } from '$lib/surface/routes.stylex';
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
  <title>FloatButton area probe · jixoai-ui</title>
  <!-- internal verification surface (verify-popover-area-align.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class={cx(rt.pfaP32)} data-hydrated={hydrated ? '1' : '0'}>
  <h1 class={cx(rt.mb16, rt.textLg, rt.semibold)}>W5.1 float-button position-area probe</h1>
  <p class={cx(rt.inkMuted, rt.pfaMb24, rt.pfaMaxWProse, rt.body13)}>
    Internal verification surface: scripts/verify-popover-area-align.mjs loads this
    page headless (1440×900), opens the REAL float-button menu at the four
    <code>?corner=</code> arms, and asserts the rendered panel/stack geometry plus the
    computed position-area — the W5 anchor-sweep regression gate. It is not a docs
    page and is excluded from search indexing.
  </p>
  <FloatButtonAreaProbe />
</main>
