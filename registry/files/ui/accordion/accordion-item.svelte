<!--
  jixoai accordion item (registry/files/ui/accordion/accordion-item.svelte).
  The leaf half of the accordion pair: a styled <details>/<summary> with
  nothing added semantically — the browser already exposes the toggle,
  the disclosure state, and the keyboard contract. Drop it inside
  accordion.svelte (the group frame) or use it bare for a one-off
  disclosure.

  bind:open is supported (Svelte binds <details> open natively) — the
  exclusive mode on the group still works through the DOM, so manual
  open changes participate in the same radio behavior.

  The summary is a snippet (icons, badges compose); the marker is a CSS
  chevron that rotates on [open] — the native ::marker is retired.
  CONSTRAINT: no interactive elements (buttons/links) inside the summary
  snippet — they fight the summary's own click/keyboard contract. Put
  per-row actions in the body, or use a menu outside the accordion.

  tw4 (2026-08-24): utility-authored — the summary line paint (incl.
  hover/focus-visible) and the body paint live in the markup; ONLY the
  marker retirement, the chevron pseudo build with its [open] rotation,
  the ::details-content height machinery, and the reduced-motion kill
  stay in accordion-item.css (D1-exempt residue).

  tailwindless one-shot W1 (2026-09-17): the summary/body paint rides
  the family's stylex ATOMS (accordion.stylex.ts) EXCEPT the ink +
  state seams (hover text, focus-visible outline, the color
  transition) — those are lane-2 rules in accordion-item.css now (a
  state rule must own its property outright).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { accordionStyles } from './accordion.stylex';
  import './accordion-item.css';

  interface Props {
    /** disclosure state; bindable (bind:open) for controlled use */
    open?: boolean;
    /** the summary line — plain text or a composed snippet */
    summary: Snippet;
    children: Snippet;
    class?: string;
  }

  let { open = $bindable(false), summary, children, class: className = '' }: Props = $props();

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<details class="jx-acc-item {cn(cx(accordionStyles.item), className)}" bind:open>
  <!-- the summary's INK lives in accordion-item.css (the placement
       law: hover/focus-visible own their properties there — the atom
       tier would shade a lane-2 :hover under the F9 layer order) -->
  <summary class="jx-acc-summary {cx(accordionStyles.summary)}">{@render summary()}</summary>
  <div data-jx-acc-body="" class={cx(accordionStyles.body)}>
    {@render children()}
  </div>
</details>
