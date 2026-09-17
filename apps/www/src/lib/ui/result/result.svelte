<!--
  jixoai result (registry/files/ui/result/result.svelte).
  The page-level outcome of an operation: status glyph + title +
  description + actions. Deliberately THIN (the ruling): no 403/404
  routing logic, no illustration system — bring your own through the
  icon snippet. Status paints by semantic hue (success = the
  brand's emphasis voice — there is no green in this language;
  error = the destructive hue; the others stay neutral).

  empty ≠ result: empty says "no data"; result says "an operation
  reached an outcome". They are different states and stay different
  components.

  tw4 (2026-08-24): pure token utilities, zero css residue — status
  maps to icon border/glyph color utilities per prop; `jx-result*`
  classes are semantic hooks, css defines them not.

  tailwindless one-shot (2026-09-16): the utilities became the
  family's stylex atoms (result.stylex.ts); the status maps are
  module-scope atom groups joined by cx() — never a
  raw member interpolation (the serialize law).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { type Density } from '$lib/density.svelte';
  import { ResultDefaults } from './result-defaults.svelte';
  import { resultStyles } from './result.stylex';

  interface Props {
    /** density policy: explicit ?? ambient scope, else unstamped */
    density?: Density;
    /** success uses the brand voice (no green in this language) */
    status?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    /** custom glyph — defaults to the status text glyph */
    icon?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let { density, status = 'info', title, description, icon, actions, class: className = '' }: Props = $props();

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
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

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): the density slot resolves explicit ?? ambient
  // scope; no opinion stamps nothing, the ambient css scope channel
  // keeps flowing
  const d = $derived(ResultDefaults.resolve({ density }));

  const glyph = $derived(
    status === 'success' ? '✓' : status === 'error' ? '✕' : status === 'warning' ? '!' : 'i',
  );
  // status → atom groups (module scope, pure lookup): success paints
  // the brand voice (no green in this language), error the
  // destructive hue, the neutrals stay --border / the inheriting ink
  const iconBorder: Record<Props['status'], string> = {
    success: cx(resultStyles.iconBox, resultStyles.borderPrimary),
    error: cx(resultStyles.iconBox, resultStyles.borderDestructive),
    warning: cx(resultStyles.iconBox, resultStyles.borderNeutral),
    info: cx(resultStyles.iconBox, resultStyles.borderNeutral),
  };
  const glyphColor: Record<Props['status'], string> = {
    success: cx(resultStyles.inkPrimary),
    error: cx(resultStyles.inkDestructive),
    warning: '',
    info: '',
  };
</script>

<div data-jx-result={status} data-density={d.density} class={cn(cx(resultStyles.root), className)}>
  <div
    data-jx-result-icon=""
    class={iconBorder[status]}
    aria-hidden="true"
  >
    {#if icon}
      {@render icon()}
    {:else}
      <span data-jx-result-glyph="" class={cx(resultStyles.glyph, glyphColor[status] || undefined)}>{glyph}</span>
    {/if}
  </div>
  <h2 data-jx-result-title="" class={cx(resultStyles.title)}>{title}</h2>
  {#if description}
    <p data-jx-result-desc="" class={cx(resultStyles.description)}>{description}</p>
  {/if}
  {#if actions}
    <div data-jx-result-actions="" class={cx(resultStyles.actions)}>
      {@render actions()}
    </div>
  {/if}
</div>
