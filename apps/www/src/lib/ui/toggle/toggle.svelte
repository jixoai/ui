<!--
  jixoai toggle (registry/files/ui/toggle/toggle.svelte).

  V2 DOM ISOMORPHISM (native-contract-fusion, 2026-08-27): the switch
  is ONE input[role=switch] on BOTH sides — the jx-pure face paints
  the bare element with the jx-html-switch utility (::before knob,
  transform travel, inset ring); the registry component applies the
  SAME utility class. No label wrapper, no track/knob spans. The
  visible label (when requested) renders OUTSIDE the input as a
  sibling <label for>.

  checked is $bindable; everything else flows through restProps onto
  the native input — a named toggle participates in FormData like any
  checkbox. The sr-hidden driver is gone: the input IS the control,
  visually painted by the standard layer.
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
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
  import { ToggleDefaults } from './toggle-defaults.svelte';
  import { toggleStyles } from './toggle.stylex';
  import { cn } from '$lib/utils';

  // the payload's own join (separator's serialize law): atoms are
  // objects in dev — composition goes through THIS joiner (all string
  // values except $$css, space-joined; plain strings pass through)
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

  interface Props extends Omit<HTMLInputAttributes, 'size' | 'color'> {
    /** toggle state; bindable (bind:checked) for controlled use */
    checked?: boolean;
    /** reads INLINE-START of the control (external label[for]) */
    label?: string;
    /** lands on the input; auto-generated when omitted */
    id?: string;
    disabled?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) — the toggle's kernel formulas are the
     *  §4-frozen effective-operand exception: EXACTLY as-is */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query(). CONSUMED by the family
     *  (the native input NEVER receives a size attribute from it —
     *  the §1 native collision rule) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system.
     *  CONSUMED by the family (the native attribute never receives
     *  it, §1) */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp · query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive · a
     *  coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    'data-density'?: string;
    class?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    checked = $bindable(false),
    label,
    id = autoId,
    disabled = false,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    'data-density': _callerDensity,
    class: className = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.1): explicit ?? ambient scope per slot, one line, no
  // legacy helper channels — W3-B: the eight universal axes ride the
  // same record
  const d = $derived(ToggleDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }));
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the control root's
  // ANCESTORS are the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLInputElement>();
  provideQueryAnchor(() => uniRoot ?? null);
</script>

{#if label}
  <label for={id} data-jx-toggle-label class="jx-label" data-density={densityRungOf(d.density)}>
    {label}
  </label>
{/if}
<input
  bind:this={uniRoot}
  {id}
  type="checkbox"
  role="switch"
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  class={cn(cx('jx-html-switch', disabled && cx(toggleStyles.disabled)), className)}
  style={carriers || undefined}
  bind:checked
  {disabled}
  {...rest}
/>
