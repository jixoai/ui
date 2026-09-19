<!-- native-scroll-area blueprint (the scroll family rework,
    2026-09-15): the platform sibling — zero drawn chrome, the
    scrollbar-width tiers under the token law, the packaged capability
    styles (stable gutter, scoped color-scheme). Two ports, one tall
    manifest, the tiers side by side. -->
<script lang="ts">
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
    'layout shell',
    'release notes',
    'terminal log',
    'data table',
    'command palette',
    'search corpus',
    'design tokens',
    'grid laws',
  ];
</script>

<Stack direction="column" justify="center" gap="16" class={cx(bpB.nativeScrollAreaStage)}>
  <Stack gap="16">
    <Stack direction="column" gap="4" class={cx(bpB.nativeScrollAreaRail)}>
      <span class={cx(bpB.nativeScrollAreaLabel)}>scrollbarWidth="thin" — the theme's law</span>
      <div class={cx(bpB.nativeScrollAreaPort)}>
        <NativeScrollArea label="thin tier" scrollbarWidth="thin" style="height: 200px">
          <Stack direction="column" gap="4">
            {#each rows as row (row)}
              <span class={cx(bpB.nativeScrollAreaRow)}>{row}</span>
            {/each}
          </Stack>
        </NativeScrollArea>
      </div>
    </Stack>
    <Stack direction="column" gap="4" class={cx(bpB.nativeScrollAreaRail)}>
      <span class={cx(bpB.nativeScrollAreaLabel)}>'auto' — the platform bar restored</span>
      <div class={cx(bpB.nativeScrollAreaPort)}>
        <NativeScrollArea label="auto tier" scrollbarWidth="auto" style="height: 200px">
          <Stack direction="column" gap="4">
            {#each rows as row (row)}
              <span class={cx(bpB.nativeScrollAreaRow)}>{row}</span>
            {/each}
          </Stack>
        </NativeScrollArea>
      </div>
    </Stack>
  </Stack>
</Stack>
