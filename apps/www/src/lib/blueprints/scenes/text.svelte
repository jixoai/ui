<!-- text blueprint: the mark matrix in one passage — every member is
     the semantic element, one word per form.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Text, { Strong, Em, Del, Mark, Ins, Sub, Sup } from '$lib/ui/text';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

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

<div class={cx(bpB.textStage)}>
  <p class={cx(bpB.textBody)}>
    <Text>Plain paragraph, <Strong>strong</Strong> at the 600 settle, <Em>stress</Em>,
    <Del>struck</Del>, <Mark>highlighted</Mark>, <Ins>inserted</Ins>, H<Sub>2</Sub>O, and
    x<Sup>2</Sup> — the whole family in one flow.</Text>
  </p>
  <div class={cx(bpB.textBadges)}>
    <Badge>8 forms · one vocabulary</Badge>
    <Badge>mark = literal slot (own 'p')</Badge>
    <Badge>face-composing</Badge>
  </div>
</div>
