<!-- badge-indicator blueprint: the live overlay — a dot on an initials
     avatar, a capped count on a real button, and the standalone chip. -->
<script lang="ts">
  import BadgeIndicator from '$lib/ui/badge-indicator/badge-indicator.svelte';
  import Avatar from '$lib/ui/avatar/avatar.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
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

<div class={cx(bpA.badgeIndicatorStage)}>
  <Stack align="center" wrap gap="40">
    <BadgeIndicator dot label="2 unread reviews">
      <Avatar name="Grace Hopper" size="lg" alt="" />
    </BadgeIndicator>
    <BadgeIndicator count={5}>
      <PressButton variant="outline">inbox</PressButton>
    </BadgeIndicator>
    <BadgeIndicator count={250} />
  </Stack>
  <p class={cx(bpA.badgeIndicatorNote)}>
    dot paints brand presence; counts paint destructive and cap at 99+.
  </p>
</div>
