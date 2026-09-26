<!-- section-card blueprint: the content atom itself, nested small cards.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

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

<Stack align="center" justify="center" class={cx(bpB.sectionCardStage)}>
  <div class={cx(bpB.sectionCardCard)}>
    <SectionCard headingLevel={2} eyebrow="registry" title="section-card" summary="The content atom of the site grammar: bordered card, header block with eyebrow, title, summary.">
      <Stack gap="12" }>
        <Badge>ui</Badge>
        <Badge>radius 0</Badge>
      </Stack>
    </SectionCard>
  </div>
</Stack>
