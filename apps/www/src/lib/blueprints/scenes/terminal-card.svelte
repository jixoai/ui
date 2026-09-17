<!-- terminal-card blueprint: the Broadside hero terminal in its settled
     state — traffic-light title bar, the large typed command with its
     static block cursor, surfaced output lines, 6px hard offset shadow.
     (The blueprint pass runs reduced-motion, so the one-time typing
     entrance renders settled — the prerendered/no-JS paint.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
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

<div class={cx(bpB.terminalCardStage)}>
  <div class={cx(bpB.terminalCardCard)}>
    <TerminalCard
      barTitle="quick-start — zsh"
      command="npx jixoai-ui add terminal-card"
      outputs={['terminal-card.svelte → src/lib/ui/', 'settled render · static cursor']}
    />
  </div>
</div>
