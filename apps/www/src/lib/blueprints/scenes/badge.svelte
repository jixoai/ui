<!-- badge blueprint: the variant grammar as a status row — the
     prominence ladder (fill/tonal/outline) over the global tokens,
     then the hue-injection recipes for neutral/success/error statuses,
     plus the shape and slotStart axes. -->
<script lang="ts">
  import Badge from '$lib/ui/badge/badge.svelte';
  import Icon from '$lib/ui/icon';
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

<Stack direction="column" align="start" justify="center" gap="16" class={cx(bpA.badgeStage)}>
  <Stack align="center" wrap gap="12">
    <Badge density="lg">tonal</Badge>
    <Badge variant="fill">fill</Badge>
    <Badge variant="outline">outline</Badge>
  </Stack>
  <Stack align="center" wrap gap="12">
    <Badge>v0.1.0</Badge>
    <Badge class="jx-hue-neutral">draft</Badge>
    <Badge class="jx-hue-success">passing</Badge>
    <Badge class="jx-hue-error">failing</Badge>
  </Stack>
  <Stack align="center" wrap gap="12">
    <Badge shape="pill">pill shape</Badge>
    <Badge shape="pill" class="jx-hue-success">
      {#snippet slotStart()}<Icon name="check" />{/snippet}
      checks passing
    </Badge>
  </Stack>
</Stack>
