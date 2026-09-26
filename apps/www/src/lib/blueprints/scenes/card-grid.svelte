<!-- card-grid blueprint: the subgrid equalizer — one short-header card
     beside a deliberately taller one; shared header/body rows keep the
     tops aligned and the bodies filled to the tallest. min="240px" holds
     two columns inside the stage. -->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Stack from '$lib/ui/stack';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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

<Stack align="center" justify="center" class={cx(bpA.cardGridStage)}>
  <CardGrid min="240px" class={cx(bpA.cardGridGrid)}>
    <SectionCard
      eyebrow="card 01"
      title="Short header"
      summary="One summary line — this header is short, yet it reserves the same shared row height as card 02's taller block."
    >
      <p class={cx(bpA.cardGridBody)}>
        A short body. The subgrid row still stretches it to the tallest card's extent.
      </p>
    </SectionCard>
    <SectionCard
      eyebrow="card 02"
      title="A deliberately much longer header that wraps"
      summary="The tallest header block sets the shared header row for every card in the grid."
    >
      <ul class={cx(bpA.cardGridList)}>
        <li>headers align to the tallest header</li>
        <li>bodies fill to the tallest body</li>
        <li>rows live on the grid, not on each card</li>
      </ul>
    </SectionCard>
  </CardGrid>
</Stack>
