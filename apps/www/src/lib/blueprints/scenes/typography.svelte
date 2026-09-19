<!-- typography blueprint: the scope lib — TypoScope's frozen knob bag
     passes through the plugin chain (TYPOGRAPHY_DEF, matched by
     identity) and resolves PURELY into the host's declarations,
     --jx-ty-* vars and data-jx-ty-* presence attrs; nearest setter
     wins down the context pair.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
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

<Stack direction="column" justify="center" gap="16" class={cx(bpB.typographyStage)}>
  <div class={cx(bpB.typographyKey)}>
    TypoScope · the value domain, never a variant axis
  </div>
  <Stack align="center" justify="center" gap="10">
    <div class={cx(bpB.typographyNode)}>
      <span class={cx(bpB.typographyNodeName)}>TypoScope</span>
      <span class={cx(bpB.typographyNodeNote)}>11 absentSlot fields</span>
    </div>
    <div class={cx(bpB.typographyApply)}>
      <span>apply</span>
      <span class={cx(bpB.typographyApplyArrow)}>→</span>
      <span>chain</span>
    </div>
    <div class={cx(bpB.typographyNode)}>
      <span class={cx(bpB.typographyNodeName)}>TYPOGRAPHY_DEF</span>
      <span class={cx(bpB.typographyNodeNote)}>plugins target by identity</span>
    </div>
    <div class={cx(bpB.typographyArrow)}>→</div>
    <div class={cx(bpB.typographyNode)}>
      <span class={cx(bpB.typographyNodeName)}>resolveTypoStyle</span>
      <span class={cx(bpB.typographyNodeNote)}>pure: vars + presence attrs</span>
    </div>
  </Stack>
  <Stack align="center" justify="center" wrap gap="8">
    <Badge>absence IS the state</Badge>
    <Badge>nearest setter wins</Badge>
    <Badge>zero hue slots touched</Badge>
  </Stack>
</Stack>
