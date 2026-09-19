<!-- scroll-virtual blueprint: the window. Left: the full list as a faded
     column (100k rows exist in data); the visible window + overscan bands
     are the only DOM. Right: the wiring facts — spacer = count × estimate,
     rows absolute-positioned, measureElement automatic. Strong TanStack
     association, thin coupling.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
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

  const rendered = ['row 41,996', 'row 41,997', 'row 41,998', 'row 41,999', 'row 42,000'];
  const facts = [
    ['window', 'visible + overscan only'],
    ['spacer', 'count × estimateSize'],
    ['rows', 'absolute · translateY(start)'],
    ['measure', 'item.measureElement — ours'],
    ['escape', 'getVirtualizer() → TanStack'],
  ];
</script>

<Stack align="center" justify="center" gap="40" class={cx(bpB.scrollVirtualStage)}>
  <!-- the window over the full list -->
  <div class={cx(bpB.scrollVirtualBoard)}>
    <span class={cx(bpB.scrollVirtualBoardLabel)}
      >100,000 rows · one window in the dom</span
    >
    <div class={cx(bpB.scrollVirtualFaded)}>
      {#each Array(12) as _, i (i)}
        <div class={cx(bpB.scrollVirtualFadedRow)}></div>
      {/each}
    </div>
    <div class={cx(bpB.scrollVirtualWindow)}>
      <div class={cx(bpB.scrollVirtualWindowInner)}>
        {#each rendered as row (row)}
          <div class={cx(bpB.scrollVirtualRow)}>{row}</div>
        {/each}
      </div>
    </div>
    <span class={cx(bpB.scrollVirtualOverscanUp)}>overscan ↑</span>
    <span class={cx(bpB.scrollVirtualOverscanDown)}>overscan ↓</span>
  </div>

  <!-- the wiring facts -->
  <Stack direction="column" gap="10" class={cx(bpB.scrollVirtualFacts)}>
    <span class={cx(bpB.scrollVirtualFactsLabel)}
      >@tanstack/svelte-virtual · dom wiring only</span
    >
    {#each facts as [key, value] (key)}
      <Stack align="baseline" justify="between" class={cx(bpB.scrollVirtualFactRow)} }>
        <code class={cx(bpB.scrollVirtualFactKey)}>{key}</code>
        <span class={cx(bpB.scrollVirtualFactValue)}>{value}</span>
      </Stack>
    {/each}
  </Stack>
</Stack>
