<!--
  jixoai ItemGroup (registry/files/ui/list-item/item-group.svelte).
  The surface owner (design-language-kernel design §2–§3): a
  <section|div> frame around a native <ul>. THE FIRST DENSITY PROVIDER
  — provideDensity (getter-backed) + data-density stamps on frame and
  list; Items resolve their density from here. Owns the explicit RULER
  (content-end default — deliberately media-less; media-content-end
  opts into the shared media track) stamped on the ul, and the divider
  policy (data-dividers lives ONLY on the ul — the adjacency owner).
-->
<script module lang="ts">
  import type { Density, DensityContext } from '$lib/density.svelte';

  export const ITEM_GROUP_KEY = Symbol('jx-item-group');

  export type ItemGroupMode = 'default' | 'muted' | 'plain';
  export type ItemGroupLayout = 'standard' | 'media';
  export type ItemRuler = 'content-end' | 'media-content-end';

  export interface ItemGroupPolicy extends DensityContext {
    readonly layout: ItemGroupLayout;
    readonly ruler: ItemRuler;
  }
  // the integration ambient: only a mode that paints a frame may
  // declare its in-row controls bare (muted/plain never own one)</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { provideDensity, resolveDensity, getDensityContext } from '$lib/density.svelte';
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
  import { ListItemDefaults } from './list-item-defaults.svelte';
    import { CONTROL_CHROME_KEY, type ControlChrome } from '$lib/control-chrome.svelte';
  import './item.css';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
    /** frame posture: default (border+dividers) · muted (slab) · plain (host surface) */
    mode?: ItemGroupMode;
    /** fixed 0.75rem inline margins — boolean only */
    inset?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) — provided to the rows */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size — an explicit lane
     *  makes the GROUP the concentric anchor (its carrier stamps
     *  --jx-radius-effective; rows at radius="auto" compute
     *  max(0px, R − P) against it, the §3 chain live through the
     *  list-item family) */
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
    layout?: ItemGroupLayout;
    /** the shared ruler: content-end (media-less, default) | media-content-end */
    ruler?: ItemRuler;
    /** OPTIONAL raw prop — omission stays distinguishable:
        default-mode ?? 'auto', plain ?? 'none', muted forced 'none' */
    dividers?: 'auto' | 'none';
    /** control integration (B5, 2026-09-05): 'integrated' declares the
        group frame as the SOLE surface owner — in-row control shells
        dissolve (background, border, well shadow; the state machine
        stays legible). Opt-in on default mode only: muted (slab) and
        plain (host-owned) never own the frame, the declaration is
        overridden to 'self' there */
    controlChrome?: 'integrated' | 'self';
    /** renders the frame as <section aria-labelledby> + visible label */
    label?: string;
    id?: string;
    class?: string;
    children: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    mode = 'default',
    inset,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    layout = 'standard',
    ruler = 'content-end',
    dividers,
    controlChrome,
    label,
    id,
    class: className = '',
    style = '',
    children,
    // component-owned stamps: the caller cannot forge density or the
    // ul-only divider stamp on the frame
    'data-density': _callerDensity,
    'data-dividers': _callerDividers,
    ...rest
  }: Props = $props();

  // The CAPTURE is load-bearing and eager (r11 provider contract, the
  // button-group form): getDensityContext() rides the $derived.by
  // ARGUMENT subtree, which evaluates at this statement — BEFORE
  // provideDensity writes the key — so it captures the PARENT's
  // context (not the group's own). Reading it lazily (in the
  // $derived initializer body, or the getter itself) would resolve
  // the very getter it feeds — derived_references_self. W3-D1: the
  // lane narrows at the legacy edge (the input-group law — 'auto',
  // the coefficient number and query() carriers never carry a
  // legacy rung).
  const legacyDensityLane = $derived(
    typeof density === 'string' && density !== 'auto' ? density : undefined,
  );
  const resolved = $derived.by(
    ((inherited) => () => resolveDensity(legacyDensityLane, inherited))(getDensityContext()),
  );
  provideDensity(() => resolved);
  // the family Defaults is the single read point for the STAMPS
  // (context-defaults-economy 3.4 + W3-D1): the slot's ambient read
  // lands on this group's own provided policy — exactly what the
  // rows see, one resolution for the whole list; inset rides a
  // literal slot (own false), the eight universal axes resolve one
  // record
  const d = $derived(
    ListItemDefaults.resolve({
      inset,
      density,
      size,
      shape,
      radius,
      color,
      theme,
      elevation,
      motion,
    }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  // the universal density supply rides the bridged provideDensity
  // write above — it is reactive, while the object literal here
  // would SNAPSHOT the prop at init and freeze the explicit lane
  // over the bridge; this supply carries the other seven axes
  provideUniversalLanes({ size, shape, radius, color, theme, elevation, motion });
  // §3/§14 consumption + supply (the batch B card law, the frame's
  // dialect): the explicit lane composes radius-effective × the
  // factor; auto computes the concentric max(0px, R − P) × the
  // factor against the group's own ancestors. The frame paints no
  // inline inset track (rows sit flush — the root sheet's 0px
  // invariant governs a row's P)
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : '--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1))',
  );
  const rootStyle = $derived(
    [carriers, radiusConsumed, style].filter(Boolean).join('; ') || undefined,
  );

  const labelId = $derived(`${id ?? autoId}-label`);
  const resolvedDividers = $derived(
    mode === 'muted' ? 'none' : (dividers ?? (mode === 'plain' ? 'none' : 'auto')),
  );

  let frameEl = $state<HTMLElement>();
  provideQueryAnchor(() => frameEl ?? null);

  setContext(ITEM_GROUP_KEY, {
    get density() {
      return resolved;
    },
    get layout() {
      return layout;
    },
    get ruler() {
      return ruler;
    },
  } satisfies ItemGroupPolicy);
  // the integration ambient: only a mode that paints a frame may
  // declare its in-row controls bare (muted/plain never own one)
  setContext(CONTROL_CHROME_KEY, {
    get chrome() {
      return mode === 'default' && (controlChrome ?? 'self') === 'integrated'
        ? ('bare' as ControlChrome)
        : undefined;
    },
  });
</script>

<svelte:element
  this={label ? 'section' : 'div'}
  {...rest}
  bind:this={frameEl}
  id={id}
  data-slot="item-group"
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  data-mode={mode}
  data-control-chrome={mode === 'default' ? (controlChrome ?? 'self') : 'self'}
  data-inset={d.inset ? 'true' : undefined}
  data-layout={layout}
  class={cn('jx-item-group', className)}
  aria-labelledby={label ? labelId : undefined}
>
  {#if label}
    <div class="jx-item-group-label" id={labelId}>{label}</div>
  {/if}
  <ul
    data-slot="item-list"
    role="list"
    data-density={densityRungOf(d.density)}
    data-ruler={ruler}
    data-dividers={resolvedDividers}
  >
    {@render children()}
  </ul>
</svelte:element>
