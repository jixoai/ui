<!--
  jixoai checkbox (registry/files/ui/checkbox/checkbox.svelte).
  Pure-CSS redraw of the native checkbox, daisyUI-style: the native
  <input type="checkbox"> keeps every behavior (form participation,
  keyboard toggling, :checked/:indeterminate state) but appearance:none
  strips its paint, and a single ::before draws the glyph — a clip-path
  polygon on a 45°-rotated box (no font icon, no SVG, zero deps).

  States:
    unchecked    background shell + 1px border; hover leans the border
                 toward the brand primary
    :checked     primary fill + white check (the polygon grows from a
                 collapsed sliver, 150ms ease-out)
    :indeterminate  primary fill + white dash (rotate resets to 0deg,
                 same 6-vertex polygon — so it morphs cleanly)
    :disabled    opacity .5 + not-allowed
    focus-visible  the site law: inset 1px outline on the ring token

  Same semantics law as input.svelte: label[for] on the same row (side
  configurable via labelSide 'left' | 'right', default right), error
  string → aria-invalid + aria-describedby + "! message" line + dashed
  border. `indeterminate` is an IDL property, not a reflected attribute,
  so the prop lands on the element via $effect. Everything else (name,
  value, checked, disabled, required…) flows through restProps.
  Uncontrolled by design — read submitted values with FormData.

  The BARE mode (2026-09-08, the Owner's markdown unlock ruling
  "用真组件"): `bare` renders the SINGLE input — no field wrapper, no
  hit lane, no label/error chrome — carrying the component's paint
  class. The presentation-only posture for prose contexts (markdown
  task items: the source text owns the state, the marker is disabled):
  a direct-child input keeps the container-level DOM-shape laws
  working (li:has(> input) marker suppression, the vertical-align
  alignment rules) that the interactive wrapper's div>span>input
  shape defeats. The paint is the same law either way — .jx-html-
  checkbox comes from css-laws, the same vocabulary the jx-pure face
  mirrors for bare inputs.

  tw4 (2026-08-24; mirror law 2026-08-27): static paint (the box, the
  lane, the label voice) mirrors jx-pure.css Part B B5's checkbox law
  from checkbox.css (@layer components :where() mirror rules; sizes
  from --jx-icon); the .jx-field/.jx-label/.jx-error scaffolding is
  CONSUMED from the jx-pure sheet's Part A (Tier-2 consume-only law).
  The glyph build and the :checked/:indeterminate/:hover state machine
  remain in checkbox.css's carve-out layers (D1-exempt residue under
  the layer law); the labelSide='left' posture rides the
  data-jx-check-left hook as a mirror modifier. Markup keeps only the
  css hooks and the consumer class merge point.
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
  import { CheckboxDefaults } from './checkbox-defaults.svelte';
  import { checkboxStyles } from './checkbox.stylex';
  import { cn } from '$lib/utils';
  import './checkbox.css';

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
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
    /** tri-state: lands on the element's indeterminate IDL property */
    indeterminate?: boolean;
    /** presentation-only single input — no wrapper/lane/label chrome
     * (the markdown task-item unlock: a direct-child input keeps the
     * container-level DOM-shape laws working) */
    bare?: boolean;
    /** $bindable; bound ⇒ controlled two-way, absent ⇒ uncontrolled */
    checked?: boolean;
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
    indeterminate = false,
    bare = false,
    checked = $bindable(),
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
    CheckboxDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
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

  // :indeterminate CSS needs the IDL property — the attribute never
  // reflects, so the prop is pushed onto the element on every change
  let el = $state<HTMLInputElement>();
  $effect(() => {
    if (el) el.indeterminate = indeterminate;
  });
</script>

{#if bare}
  <!-- the presentation-only form: ONE input, the component's paint class,
       nothing else — the prose contexts' marker (see header). The
       indeterminate $effect above binds this same `el` -->
  <input
    bind:this={el}
    type="checkbox"
    bind:checked
    class={cn('jx-html-checkbox', className)}
    {...rest}
  />
{:else}
  <!-- bare posture: with no label/error to stack, the field wrapper
       is dead weight — a w-fit inline host instead (inside list-item end
       lanes the control must sit at inline-END, not stretch the lane) -->
  <div
    bind:this={uniRoot}
    data-density={densityRungOf(d.density)}
    class:dark={d.theme === 'dark'}
    style={carriers || undefined}
    class={cn(!label && !error ? cx(checkboxStyles.host) : 'jx-field')}>
    <span
      data-jx-check
      data-jx-check-left={labelSide === 'left' ? '' : undefined}
      class="jx-check-lane"
    >
      <input
        bind:this={el}
        {id}
        type="checkbox"
        bind:checked
        class={cn('jx-html-checkbox', className)}
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
        {...rest}
      />
      {#if label}<label data-jx-check-label for={id}>{label}</label>{/if}
    </span>
    {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
  </div>
{/if}
