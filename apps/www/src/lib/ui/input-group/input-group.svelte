<!--
  jixoai input group — the ROOT half (registry/files/ui/input-group/
  input-group.svelte, OpenSpec 2026-08-30-expand-form-family F2).

  The joined field shell — the Origin UI "Input with X" family over
  the input's shared shell law: ONE 1px var(--border) bezel, the
  var(--background) fill, hover lift, the site's inset focus ring and
  the invalid dashed border ride the SAME paint as .jx-html-control-
  shell (the state machines live in input-group.css keyed on the
  data-jx-igroup hook — the Tier-2 vocabulary stays consumed-only,
  never redefined here). The group is a composition frame, not a
  closed composite:

    <InputGroup label="repository url">
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput name="site" bind:value />
      <InputGroupAddon align="inline-end">
        <PressButton variant="tonal">check</PressButton>
      </InputGroupAddon>
    </InputGroup>

  The seams are the ADDONS' hairlines (one 1px var(--border) rule per
  addon edge, input-group.css) — the shell carries ONE border, the
  addons carry ONE seam each, the lane stays chromeless: no double
  borders by construction.

  ONE disabled propagation rule (the disabled-attribute philosophy):
  `disabled` on the ROOT disables the whole group — the
  InputGroupInput renders native `disabled` and every InputGroupAddon
  renders `inert` (the platform's containment: descendant buttons,
  selects, links lose activation AND focus — no per-child chasing,
  aria-disabled theater, or pointer-event patches). Per-part disabling
  (the input's own `disabled`, or `disabled` on a button the consumer
  placed inside an addon) stays per-part — the group never interferes.
  A native fieldset disable inherits into the input through the
  platform, as always.

  A11y: the root is role=group (the consumer may override the role
  through the rest props — an explicitly labeled toolbar is THEIR
  explicit contract, never this component's default); name it with
  `label` (aria-label) or pass aria-labelledby through the rest props —
  a nameless group is announced as nothing. The inner input keeps its
  native semantics; label[for] wiring belongs to the consumer's field
  composition (the group adds no label row of its own — wrap it in a
  .jx-field composition or the ItemField adapter when a visible label
  is needed).

  Density: `density` resolves explicit ?? inherited ?? default and is
  PROVIDED to the subtree (Svelte context), so a PressButton or
  NativeSelect placed inside an addon adopts the group's density tier.

  Value: InputGroupInput implements the house value law verbatim —
  `value` is $bindable; bound ⇒ controlled, absent ⇒ purely uncontrolled
  (FormData / form.reset() untouched).
-->
<script module lang="ts">
  /** the group's context surface: the ONE propagation switch */
  export interface InputGroupApi {
    /** root-level disable — addons go inert, the lane goes disabled */
    readonly disabled: boolean;
  }

  /** context key — global symbol registry (independent registry items) */
  export const INPUT_GROUP_KEY = Symbol.for('jx-input-group');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
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
  import { getDensityContext, provideDensity, resolveDensity } from '$lib/density.svelte';
  import { InputGroupDefaults } from './input-group-defaults.svelte';
  import { inputGroupStyles } from './input-group.stylex';

  import './input-group.css';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
    /** accessible group name (aria-label). Pass aria-labelledby
        through the rest props instead when an external label owns
        the name — a nameless group is announced as nothing */
    label?: string;
    /** the ONE propagation rule: root disable ⇒ the lane renders
        native disabled AND every addon renders inert */
    disabled?: boolean;
    /** density policy: explicit, inherited, then default — provided
        to the subtree so addon children adopt the tier */
    /** density policy: explicit, inherited, then default — the
     *  universal §4 lane (named rungs + the documented small/medium/
     *  large aliases · auto · a coefficient number · query()); the
     *  group PROVIDES its resolved rung to the subtree so addon
     *  children adopt the tier */
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
    /** the group landmark role. The law is group; an explicit
        consumer override (labeled toolbar) is honored, never default */
    role?: string;
    class?: string;
    children: Snippet;
  }

  let {
    label,
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
    role = 'group',
    class: className = '',
    'aria-label': ariaLabel,
    children,
    ...rest
  }: Props = $props();

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // The CAPTURE is load-bearing and eager (r11 provider contract, the
  // button-group precedent): getDensityContext() rides the $derived.by
  // ARGUMENT subtree, which evaluates at this statement — BEFORE
  // provideDensity writes the key — so it captures the PARENT's context
  // object. A lazily-evaluated read (a plain $derived initializer body,
  // or the getter itself) would resolve the key to the group's OWN
  // write and self-reference through the very getter it feeds —
  // derived_references_self. The returned getter reads ONLY the
  // captured object (reactive through its getters, never re-entering
  // the context machinery)
  // the W3 universal lane narrows at the legacy edge: 'auto'/number/
  //  query lanes carry no legacy rung (the rung stays ambient, §4 —
  //  the coefficient rides the carriers on the root)
  const legacyDensityLane = $derived(
    typeof density === 'string' && density !== 'auto' ? density : undefined,
  );
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(legacyDensityLane, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // The family Defaults rides ON TOP of the provider lane as the
  // group's single read point (its own stamp — the audited ambient
  // face): the density slot's ambient read resolves the key to the
  // group's own write, whose getter is the captured-parent resolution
  // above, so the chain TERMINATES (it never re-enters this derived)
  // and lands the same value on every lane
  const d = $derived(
    InputGroupDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp + the broadcast supply + the query anchor
  // (the group root's ANCESTORS are the candidate containers). The
  // universal density supply rides the bridged provideDensity write
  // above; this supply carries the other seven axes downward
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);


  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner (all
  // string values except $$css, space-joined).
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

  setContext<InputGroupApi>(INPUT_GROUP_KEY, {
    get disabled() {
      return disabled;
    },
  });
</script>

<div
  bind:this={uniRoot}
  {...rest}
  {role}
  data-jx-igroup
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={carriers || undefined}
  aria-label={ariaLabel ?? label}
  class={cx(inputGroupStyles.root, className)}
>
  {@render children()}
</div>
