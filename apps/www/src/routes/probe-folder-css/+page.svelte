<script lang="ts">
  import FolderCssProbe from '$lib/__probe__/folder-css-probe.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  // duplicate-import probe: the SAME css also imported route-side —
  // the built output must still contain it exactly once
  import '$lib/__probe__/folder-css-probe.css';

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
  <title>Folder CSS probe · jixoai-ui</title>
  <!-- internal verification surface (verify-folder-css.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class={cx(rt.pfcPad)}>
  <h1 class={cx(rt.mb16, rt.textLg, rt.semibold)}>P0.1 folder-css contract probe</h1>
  <p class={cx(rt.bodyMuted, rt.mb16, rt.pfcProse)}>
    Internal verification surface: this route exists so
    <code>scripts/verify-folder-css.mjs</code> can probe the built CSS for the
    folder-css contract (route-side imports deduplicated to exactly one copy).
    It is not a docs page and is excluded from search indexing.
  </p>
  <!-- the TW-era util-pool seed (hidden p-8 text-primary border-8
       border-primary) fed Tailwind's dev-mode on-demand scan; it died
       with the engine. The layer-law arm now rides the probe
       component's own stylex atoms (?pad=32&ink=primary) -->
  <FolderCssProbe />
</main>
