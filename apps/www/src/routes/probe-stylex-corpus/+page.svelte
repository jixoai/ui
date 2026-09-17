<script lang="ts">
  import CorpusFixture from '$lib/__probe__/stylex-corpus/corpus-fixture.svelte';
  import { rt } from '$lib/surface/routes.stylex';

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
  <title>StyleX kernel/payload fixture · jixoai-ui</title>
  <!-- internal verification fixture (P0.6 build-time corpus) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class={cx(rt.pscP32)}>
  <h1 class={cx(rt.mb16, rt.textLg, rt.semibold)}>P0.6 stylex kernel/payload fixture</h1>
  <p class={cx(rt.inkMuted, rt.pscMb24, rt.pscMaxWProse, rt.body13)}>
    Internal KERNEL/PAYLOAD FIXTURE — not a registry consumer proof: the 8
    research families + the demo chrome are authored as StyleX static atoms
    under the phase-0 authoring law
    (apps/www/src/lib/__probe__/stylex-corpus/) and compiled by the REAL site
    build. Nothing renders — the equivalence check compares the emitted CSS
    against the research spike's archived artifact
    (openspec/changes/2026-09-14-stylex-kernel-phase0/research/p0-dogfood-receipt.md).
    The real registry migration + its clean-consumer receipt live elsewhere
    (separator: registry/files/ui/separator/, tailwindless-site P0).
  </p>
  <CorpusFixture />
</main>
