<!-- press-button blueprint: the variant row + effect attachments.
     (tailwindless BP-B 2026-09-16: layout utilities → surface atoms;
     the jx-hue/jx-pair hooks stay static — the sheet's channels.) -->
<script lang="ts">
  import PressButton, { rainbow, shimmer } from '$lib/ui/press-button/press-button.svelte';
  import { pressEffect } from '$lib/ui/press-button';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
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

<Stack direction="column" justify="center" gap="24" class={cx(bpB.pressButtonStage)}>
  <Stack align="center" wrap gap="16">
    <PressButton variant="fill" {@attach pressEffect(shimmer())}>Deploy</PressButton>
    <PressButton variant="tonal" class="jx-hue-neutral">Invite</PressButton>
    <PressButton variant="outline" {@attach pressEffect(rainbow())}>Cancel</PressButton>
    <PressButton variant="ghost">Dismiss</PressButton>
    <PressButton variant="fill" class="jx-pair-destructive">
      Delete
    </PressButton>
  </Stack>
  <div class={cx(bpB.pressButtonSkel)}>
    <Skeleton class={cx(bpB.pressButtonSkelA)}></Skeleton>
    <Skeleton class={cx(bpB.pressButtonSkelB)}></Skeleton>
  </div>
</Stack>
