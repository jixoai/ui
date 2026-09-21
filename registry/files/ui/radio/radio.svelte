<!--
  jixoai radio (registry/files/ui/radio/radio.svelte).
  Pure-CSS redraw of the native radio, daisyUI-style: the native
  <input type="radio"> keeps every behavior (same-name grouping, arrow-key
  walking, form participation) but appearance:none strips its paint, and a
  single ::after draws the selected dot — an 8px primary circle that
  scales 0 → 1 (150ms ease-out) inside the 16px ring. No font icon, no
  SVG, zero deps.

  States (same law as checkbox.svelte):
    unchecked    background shell + 1px border; hover leans the border
                 toward the brand primary
    :checked     primary border + 8px primary dot (::after scale-in)
    :disabled    opacity .5 + not-allowed
    focus-visible  the site law: inset 1px outline on the ring token

  Semantics: label[for] on the same row (side configurable via labelSide
  'left' | 'right', default right), error string → aria-invalid +
  aria-describedby + "! message" line + dashed border. Everything else
  (name, value, checked, disabled, required…) flows through restProps.
  Uncontrolled when `group` is unbound — read submitted values with FormData; bind:group for the two-way selected value.

  tw4 (2026-08-24; mirror law 2026-08-27): static paint (the ring, the
  lane, the label voice) mirrors jx-pure.css Part B B5's radio law from
  radio.css (@layer components :where() mirror rules; sizes from
  --jx-icon, border-radius 50% per the dot law); the
  .jx-field/.jx-label/.jx-error scaffolding is CONSUMED from the jx-pure
  sheet's Part A (Tier-2 consume-only law). The dot build and the
  :checked/:hover state machine remain in radio.css's carve-out layers
  (D1-exempt residue under the layer law); the labelSide='left' posture
  rides the data-jx-check-left hook as a mirror modifier. Markup keeps
  only the css hooks and the consumer class merge point.
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
  import { RadioDefaults } from './radio-defaults.svelte';
  import { radioStyles } from './radio.stylex';
  import { cn } from '$lib/utils';
  import '../checkbox/checkbox.css';

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
    /** same-row label; renders label[for] */
    label?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** side of the control the label sits on (default right) */
    labelSide?: 'left' | 'right';
    /** $bindable two-way selected VALUE (Svelte's radio channel:
        bind:group — checked alone cannot bind on radios) */
    group?: string | number;
    /** density policy: explicit override, then inherited provider */
    /** density policy: explicit, inherited, then default — the
     *  universal §4 lane (named rungs + the documented small/medium/
     *  large aliases · auto · a coefficient number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query(). CONSUMED by the family (the
     *  native element NEVER receives a size attribute from it — the §1
     *  native collision rule; everything the family does not own still
     *  rides {...rest}) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system —
     *  semantic names · hue degrees · raw values · query(). CONSUMED by
     *  the family (the native attribute never receives it, §1) */
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
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    label,
    id = autoId,
    error,
    labelSide = 'right',
    group = $bindable(),
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
  // legacy helper channels
  const d = $derived(
    RadioDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);
</script>

<!-- bare posture: with no label/error to stack, the field wrapper
     is dead weight — a w-fit inline host instead (inside list-item end
     lanes the control must sit at inline-END, not stretch the lane) -->
<div
  bind:this={uniRoot}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={carriers || undefined}
  class={cn(!label && !error ? cx(radioStyles.host) : 'jx-field')}>
  <span
    data-jx-check
    data-jx-check-left={labelSide === 'left' ? '' : undefined}
    class="jx-check-lane"
  >
    <input
      {id}
      type="radio"
      bind:group
      class={cn('jx-html-radio', className)}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      {...rest}
    />
    {#if label}<label data-jx-check-label for={id}>{label}</label>{/if}
  </span>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
</div>
