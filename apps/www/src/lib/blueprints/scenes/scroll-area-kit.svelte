<!-- scroll-area-kit blueprint (the scroll family rework,
    2026-09-15): the SHARED CORE — one pure kit (overflow verdict,
    thumb geometry, theme scope), two adapters that own their own
    paint and ARIA: the hand-drawn law (scroll-area) and the platform
    sibling (native-scroll-area). The scene stages the split. -->
<script lang="ts">
  import ScrollArea from '$lib/ui/scroll-area';
  import NativeScrollArea from '$lib/ui/native-scroll-area';
  import Stack from '$lib/ui/stack';
  import { bpB } from '$lib/surface/blueprints-b.stylex';

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

  const rows = [
    'overflow verdict',
    'thumb geometry',
    'theme scope',
    'RTL engine funnel',
    'gutter stability',
    'color-scheme scope',
    'verdict shape',
    'ratio per axis',
  ];
</script>

<Stack direction="column" justify="center" gap="16" class={cx(bpB.scrollAreaKitStage)}>
  <Stack gap="16">
    <Stack direction="column" gap="4" class={cx(bpB.scrollAreaKitRail)}>
      <span class={cx(bpB.scrollAreaKitLabel)}>hand-drawn · scroll-area</span>
      <div class={cx(bpB.scrollAreaKitPort)}>
        <ScrollArea label="hand-drawn law" class={cx(bpB.scrollAreaKitFill)}>
          <Stack direction="column" gap="4">
            {#each rows as row (row)}
              <span class={cx(bpB.scrollAreaKitRow)}>{row}</span>
            {/each}
          </Stack>
        </ScrollArea>
      </div>
    </Stack>
    <Stack direction="column" gap="4" class={cx(bpB.scrollAreaKitRail)}>
      <span class={cx(bpB.scrollAreaKitLabel)}>platform · native-scroll-area</span>
      <div class={cx(bpB.scrollAreaKitPort)}>
        <NativeScrollArea label="platform sibling" style="height: 170px">
          <Stack direction="column" gap="4">
            {#each rows as row (row)}
              <span class={cx(bpB.scrollAreaKitRow)}>{row}</span>
            {/each}
          </Stack>
        </NativeScrollArea>
      </div>
    </Stack>
  </Stack>
  <span class={cx(bpB.scrollAreaKitNote)}
    >one pure core — zero paint, zero ARIA; the capsule thumb greets, then idle-fades (~700ms; the four pins suspend)</span
  >
</Stack>
