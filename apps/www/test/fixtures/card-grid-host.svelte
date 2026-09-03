<!--
  card-grid spec host — the REAL composition (CardGrid + SectionCard +
  a plain two-block div card): the grid never asks what a child is.
  Mirrors the home page's usage (post-2026-09-03 cleanup: no
  consumer-side subgrid utilities).
-->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';

  const cards = [
    { eyebrow: 'one', title: 'first', body: 'the first card body' },
    { eyebrow: 'two', title: 'second — a longer title that stretches the shared header row', body: 'the second body' },
  ];
</script>

<CardGrid class="mt-6">
  {#each cards as card, i (i)}
    <SectionCard eyebrow={card.eyebrow} title={card.title}>
      <p>{card.body}</p>
    </SectionCard>
  {/each}
  <!-- the content-agnostic proof: a plain two-block card qualifies
       unchanged (first block = header, second = body) -->
  <div class="rounded-lg border">
    <div class="p-4 font-medium">plain header</div>
    <div class="p-4 text-sm">plain body — fills to the tallest</div>
  </div>
</CardGrid>
