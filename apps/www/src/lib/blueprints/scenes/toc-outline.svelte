<!-- toc-outline blueprint: the metadata export. Left: the content tree —
     plain h2/h3 headings, nothing else. Right: what derives from it — the
     outline (sections + children), extents (heading → next heading), and
     ids stamped back so ToC links are real fragments.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms; the
     level-3 indent pose rides a conditional atom in the cx slot.) -->
<script lang="ts">
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

  const outline: { id: string; label: string; level: number }[] = [
    { id: 'install', label: 'Install', level: 2 },
    { id: 'wiring', label: 'wiring', level: 3 },
    { id: 'theming', label: 'theming', level: 3 },
    { id: 'deploy', label: 'Deploy', level: 2 },
  ];
</script>

<div class={cx(bpB.tocOutlineStage)}>
  <!-- the content root -->
  <div class={cx(bpB.tocOutlineRoot)}>
    <span class={cx(bpB.tocOutlineRootLabel)}
      >content root · plain headings</span
    >
    <div class={cx(bpB.tocOutlineTree)}>
      <span class={cx(bpB.tocOutlineH2)}>Install</span>
      <div class={cx(bpB.tocOutlineH3Nest)}>
        <span class={cx(bpB.tocOutlineH3)}>wiring</span>
        <span class={cx(bpB.tocOutlineH3)}>theming</span>
      </div>
      <span class={cx(bpB.tocOutlineH2Spaced)}>Deploy</span>
    </div>
    <div class={cx(bpB.tocOutlineExtent)}></div>
    <span class={cx(bpB.tocOutlineExtentLabel)}>extent = h2 → next h2</span>
  </div>

  <!-- the derived outline -->
  <div class={cx(bpB.tocOutlineRail)}>
    <span class={cx(bpB.tocOutlineRailLabel)}
      >derived · zero handwritten ids</span
    >
    {#each outline as entry (entry.id)}
      <div class={cx(bpB.tocOutlineRow, entry.level === 3 ? bpB.tocOutlineRowNested : undefined)}>
        <code class={cx(bpB.tocOutlineRowId)}>#{entry.id}</code>
        <span class={cx(bpB.tocOutlineRowLabel)}>{entry.label}</span>
        <span class={cx(bpB.tocOutlineRowLevel)}>h{entry.level}</span>
      </div>
    {/each}
    <span class={cx(bpB.tocOutlineFoot)}
      >toc-engine eats extents directly — no data-region markup</span
    >
  </div>
</div>
