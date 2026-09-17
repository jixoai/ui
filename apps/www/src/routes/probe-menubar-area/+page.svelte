<script lang="ts">
  import MenubarAreaProbe from '$lib/__probe__/menubar-area-probe.svelte';
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
  <title>Menubar area probe · jixoai-ui</title>
  <!-- internal verification surface (verify-popover-area-align.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class={cx(rt.mbaPad)} data-hydrated={hydrated ? '1' : '0'}>
  <h1 class={cx(rt.mb16, rt.textLg, rt.semibold)}>W5.1 menubar position-area probe</h1>
  <p class={cx(rt.bodyMuted, rt.mbaMb24, rt.mbaProse)}>
    Internal verification surface: scripts/verify-popover-area-align.mjs loads this
    page headless (1440×900), opens the REAL menubar panel at the <code>?at=top</code>
    direct arm and the <code>?at=bottom</code> flip-block collision arm, and asserts
    the rendered panel/item geometry plus the computed position-area — the W5
    anchor-sweep regression gate. It is not a docs page and is excluded from search
    indexing.
  </p>
  <MenubarAreaProbe />
</main>
