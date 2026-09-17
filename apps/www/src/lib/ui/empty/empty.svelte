<!--
  jixoai empty (registry/files/ui/empty/empty.svelte).
  The no-data state of the eight-state machine — NOTHING more (the
  antd ruling: empty does not absorb error/loading/404; those are
  alert/result surfaces). A figure: terminal-box illustration slot
  (default: the empty directory listing), a title, a description, and
  an optional actions snippet ("create the first…").

    <Empty title="no checks yet">
      {#snippet actions()}<PressButton>add check</PressButton>{/snippet}
    </Empty>

  Pure composition — no JS, no state; the illustration is a slot so
  consumers bring their own glyph without a dependency.

  tw4 (2026-08-24): pure token utilities, zero css residue; `jx-empty*`
  classes are semantic hooks, css defines them not.

  tailwindless one-shot Wave 1 (2026-09-17): the paint rides the
  family's stylex ATOMS (empty.stylex.ts); the utility strip below is
  gone — composed class strings join through the payload's own cx().
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { type Density } from '$lib/density.svelte';
  import { EmptyDefaults } from './empty-defaults.svelte';
  import { emptyStyles } from './empty.stylex';

  interface Props {
    /** density policy: explicit ?? ambient scope, else unstamped */
    density?: Density;
    title: string;
    description?: string;
    /** custom illustration — defaults to the terminal empty-listing */
    illustration?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let { density, title, description, illustration, actions, class: className = '' }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): the density slot resolves explicit ?? ambient
  // scope; no opinion stamps nothing, the ambient css scope channel
  // keeps flowing
  const d = $derived(EmptyDefaults.resolve({ density }));

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, so raw interpolation would render [object Object]
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

<figure data-jx-empty="" data-density={d.density} class={cn(cx(emptyStyles.figure), className)}>
  <div data-jx-empty-art="" class={cx(emptyStyles.art)} aria-hidden="true">
    {#if illustration}
      {@render illustration()}
    {:else}
      <span data-jx-empty-term="" class={cx(emptyStyles.term)}>ls checks/</span>
      <span data-jx-empty-zero="" class={cx(emptyStyles.zero)}>0 items</span>
    {/if}
  </div>
  <figcaption data-jx-empty-caption="" class={cx(emptyStyles.caption)}>
    <p data-jx-empty-title="" class={cx(emptyStyles.title)}>{title}</p>
    {#if description}
      <p data-jx-empty-desc="" class={cx(emptyStyles.desc)}>{description}</p>
    {/if}
    {#if actions}
      <div data-jx-empty-actions="" class={cx(emptyStyles.actions)}>
        {@render actions()}
      </div>
    {/if}
  </figcaption>
</figure>
