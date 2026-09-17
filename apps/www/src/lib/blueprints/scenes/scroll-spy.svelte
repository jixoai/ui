<!-- scroll-spy blueprint: the ONE plain line-pick — a capture-phase
     scroll listener, the last target whose top sits at/past the offset
     line is the pick. Left: the targets with the line drawn in; right:
     the link list any consumer derives (the surface anchor.svelte
     renders). Composed as representative HTML: the engine itself is
     DOM-read-only logic with no box of its own.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms; the
     holds/plain poses ride ternary atoms in the cx slot — the former
     class: directive folds into the join, per the pilot's Svelte
     pruning gotcha.) -->
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

  const targets: { id: string; holds: boolean }[] = [
    { id: 'install', holds: false },
    { id: 'tokens', holds: true },
    { id: 'deploy', holds: false },
  ];
</script>

<div class={cx(bpB.scrollSpyStage)}>
  <!-- the tracked targets and the line -->
  <div class={cx(bpB.scrollSpyBoard)}>
    <span class={cx(bpB.scrollSpyBoardLabel)}
      >targets · capture-phase scroll</span
    >
    <div class={cx(bpB.scrollSpyStack)}>
      {#each targets as target (target.id)}
        <div class={cx(bpB.scrollSpyRow, target.holds ? bpB.scrollSpyRowHeld : bpB.scrollSpyRowPlain)}>
          <span
            class={cx(bpB.scrollSpyRowLabel, target.holds ? bpB.scrollSpyRowLabelHeld : undefined)}
            >#{target.id}{target.holds ? ' — holds the line' : ''}</span
          >
        </div>
      {/each}
    </div>
    <div class={cx(bpB.scrollSpyLine)}></div>
    <span class={cx(bpB.scrollSpyLineLabel)}>← offset 96</span>
  </div>

  <!-- the derived pick list -->
  <nav class={cx(bpB.scrollSpyList)} aria-label="blueprint scroll spy">
    <span class={cx(bpB.scrollSpyListLabel)}>pick</span>
    {#each targets as target (target.id)}
      {#if target.holds}
        <span class={cx(bpB.scrollSpyPickHeld)}
          >{target.id}</span
        >
      {:else}
        <span class={cx(bpB.scrollSpyPickPlain)}>{target.id}</span>
      {/if}
    {/each}
  </nav>
</div>
