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
  import {
    densityRungOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { ResultDefaults } from './result-defaults.svelte';
  import { resultStyles } from './result.stylex';

  interface Props {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** success uses the brand voice (no green in this language) */
    status?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    /** custom glyph — defaults to the status text glyph */
    icon?: Snippet;
    actions?: Snippet;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
  }

  let {
    density,
    status = 'info',
    title,
    description,
    icon,
    actions,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2 + W3-D2): one record — density resolves through the
  // bridged axis slot (explicit ?? ambient ?? 'auto'; no opinion
  // stamps nothing, the ambient css scope channel keeps flowing) and
  // the seven sibling axes ride the same record (the outcome panel is
  // flat content, all no-own; the supply chain is the point)
  const d = $derived(
    ResultDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  const glyph = $derived(
    status === 'success' ? '✓' : status === 'error' ? '✕' : status === 'warning' ? '!' : 'i',
  );
  // status → atom groups (module scope, pure lookup): success paints
  // the brand voice (no green in this language), error the
  // destructive hue, the neutrals stay --border / the inheriting ink
  const iconBorder: Record<NonNullable<Props['status']>, string> = {
    success: cx(resultStyles.iconBox, resultStyles.borderPrimary),
    error: cx(resultStyles.iconBox, resultStyles.borderDestructive),
    warning: cx(resultStyles.iconBox, resultStyles.borderNeutral),
    info: cx(resultStyles.iconBox, resultStyles.borderNeutral),
  };
  const glyphColor: Record<NonNullable<Props['status']>, string> = {
    success: cx(resultStyles.inkPrimary),
    error: cx(resultStyles.inkDestructive),
    warning: '',
    info: '',
  };
</script>

<div
  bind:this={uniRoot}
  data-jx-result={status}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cn(cx(resultStyles.root), className)}
>
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
