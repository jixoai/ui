<!-- terminal-footer blueprint: the ghost wordmark close — the huge
     hollow brand word (text-stroke recipe) over the composed column
     meta row, with faint page content above it. Explicit copyright
     keeps the render deterministic (no wall-clock year in the shot).
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import TerminalFooter from '$lib/ui/terminal-footer/terminal-footer.svelte';
  import TerminalFooterColumn from '$lib/ui/terminal-footer/terminal-footer-column.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
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

<div class={cx(bpB.terminalFooterStage)}>
  <div class={cx(bpB.terminalFooterSkel)}>
    <Skeleton class={cx(bpB.terminalFooterSkelA)}></Skeleton>
    <Skeleton class={cx(bpB.terminalFooterSkelB)}></Skeleton>
  </div>
  <TerminalFooter ghost="JIXOAI" copyright="© 2026 jixoai · MIT">
    <TerminalFooterColumn title="project">
      <a href="https://github.com/jixoai/ui" target="_blank" rel="noreferrer">GitHub</a>
      <a href="/r/registry.json">Registry JSON</a>
    </TerminalFooterColumn>
  </TerminalFooter>
</div>
