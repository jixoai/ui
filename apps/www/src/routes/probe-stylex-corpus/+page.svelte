<script lang="ts">
  import CorpusFixture from '$lib/__probe__/stylex-corpus/corpus-fixture.svelte';
</script>

<svelte:head>
  <title>StyleX corpus dogfood · jixoai-ui</title>
  <!-- internal verification fixture (P0.6 build-time corpus) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="p-8">
  <h1 class="mb-4 text-lg font-semibold">P0.6 stylex corpus dogfood</h1>
  <p class="text-muted-foreground mb-6 max-w-prose text-[13px] leading-6">
    Internal build fixture: the 8 research families + the demo chrome are authored
    as StyleX static atoms under the phase-0 authoring law
    (apps/www/src/lib/__probe__/stylex-corpus/) and compiled by the REAL site
    build. Nothing renders — the equivalence check compares the emitted CSS
    against the research spike's archived artifact
    (openspec/changes/2026-09-14-stylex-kernel-phase0/research/p0-dogfood-receipt.md).
    Phase 1 owns the real production migration.
  </p>
  <CorpusFixture />
</main>
