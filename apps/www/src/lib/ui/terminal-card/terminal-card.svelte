<!--
  jixoai terminal card (registry/files/ui/terminal-card/terminal-card.svelte).
  The Broadside hero terminal, composed after the openspecui reference:
  traffic-light title bar, one large typed command line, outputs that
  surface line by line, 6px hard offset shadow. Commands type in
  character by character (one-time entrance — never looping); the cursor
  is a STATIC block (the jixoai motion law; the reference's blink
  predates it). Prerendered/no-JS shows the settled terminal; reduced
  motion renders everything instantly.

  Bezel law (Owner, 2026-08-21): same as terminal-header — dark-locked by
  default; theme="light" | "system" opts the card into the light CRT shell
  (scoped .jx-light token class re-renders inner tokens).

  Props:
    barTitle  window title (traffic-light bar label)
    command   the single command line (typed)
    outputs   lines surfaced sequentially after the command completes
    theme     'dark' | 'light' | 'system' (default 'dark')
    speed     typing pace multiplier (default 1; 2 = twice as fast).
              Clamped to >= 0.25. Pacing is read on mount, so a live
              control applies its value by re-mounting (e.g. {#key}).

  tw4 (2026-08-24): bezel paint, traffic lights, the static block
  cursor and the color-scheme lock ride token utilities in the markup
  (the color-mix output tint too); ONLY the line-reveal state machine
  (.jx-out/.jx-out-shown + reduced-motion) stays in terminal-card.css —
  D1-exempt residue on the unlayered carve-out.

  tailwindless one-shot W1 (2026-09-17): bezel/bar/dots/cursor paint
  ride the family's stylex atoms (terminal-card.stylex.ts); the body
  padding seam (sm), the command display voice (weight + size seam),
  and the output sibling rhythm joined the css residue (media and
  `> * + *` seams atoms cannot own).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';
  import { terminalCardStyles } from './terminal-card.stylex';
  import './terminal-card.css';

  interface Props {
    barTitle: string;
    command: string;
    outputs: readonly string[];
    theme?: 'dark' | 'light' | 'system';
    speed?: number;
  }

  let { barTitle, command, outputs, theme = 'dark', speed = 1 }: Props = $props();

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
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

  // scoped token class: dark (default lock) or jx-light (css-defined)
  let scope = $state<'dark' | 'light'>(theme === 'light' ? 'light' : 'dark');

  $effect(() => {
    if (theme !== 'system') {
      scope = theme === 'light' ? 'light' : 'dark';
      return;
    }
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => (scope = media.matches ? 'dark' : 'light');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  });

  // Prerendered/no-JS output shows the settled terminal; hydration
  // restarts the typing story.
  // svelte-ignore state_referenced_locally
  let typed = $state(command);
  // svelte-ignore state_referenced_locally
  let shownLines = $state(outputs.length);

  onMount(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // pacing: the authored rhythm divided by the speed multiplier
    const pace = Math.max(0.25, speed || 1);

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clear = () => clearTimeout(timer);

    typed = '';
    shownLines = 0;

    const revealOutputs = (line: number) => {
      if (cancelled) return;
      if (line >= outputs.length) return;
      shownLines = line + 1;
      timer = setTimeout(() => revealOutputs(line + 1), 110 / pace);
    };
    const typeNext = (index: number) => {
      if (cancelled) return;
      if (index <= command.length) {
        typed = command.slice(0, index);
        timer = setTimeout(() => typeNext(index + 1), (42 + Math.random() * 40) / pace);
      } else {
        timer = setTimeout(() => revealOutputs(0), 140 / pace);
      }
    };
    timer = setTimeout(() => typeNext(0), 300 / pace);

    return () => {
      cancelled = true;
      clear();
    };
  });
</script>

<div
  data-jx-terminal
  class={cn(
    cx(
      terminalCardStyles.card,
      scope === 'dark' ? terminalCardStyles.schemeDark : terminalCardStyles.schemeLight,
    ),
    scope === 'dark' ? 'dark' : 'jx-light',
  )}
>
  <div class={cx(terminalCardStyles.bar)}>
    <span data-jx-light-dot class={cx(terminalCardStyles.dot, terminalCardStyles.dotRed)} aria-hidden="true"></span>
    <span data-jx-light-dot data-jx-light-yellow class={cx(terminalCardStyles.dot, terminalCardStyles.dotYellow)} aria-hidden="true"></span>
    <span data-jx-light-dot data-jx-light-green class={cx(terminalCardStyles.dot, terminalCardStyles.dotGreen)} aria-hidden="true"></span>
    <span class={cx(terminalCardStyles.barTitle)}>{barTitle}</span>
  </div>
  <!-- the body's padding (p-4 → sm:p-5), the command voice
       (font-semibold + its sm size seam), and the output stack's
       sibling rhythm live in terminal-card.css (media/sibling seams
       atoms cannot own) -->
  <div data-jx-terminal-body="">
    <p data-jx-terminal-command="">
      <span class={cx(terminalCardStyles.prompt)}>$</span><span>{typed}</span><span class="jx-cursor {cx(terminalCardStyles.cursor)}" aria-hidden="true"></span>
    </p>
    <div data-jx-terminal-outputs="" class={cx(terminalCardStyles.outputs)}>
      {#each outputs as line, index (line)}
        <p class={cn('jx-out', index < shownLines && 'jx-out-shown')}>{line}</p>
      {/each}
    </div>
  </div>
</div>
