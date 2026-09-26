<!--
  jixoai Item root (registry/files/ui/list-item/item.svelte).
  The GRID row (openspec list-item-systemization design §1–§2).

  Auto-variant law: variant 'auto' (default) resolves chrome from the
  typed group policy — standalone rows carry their own surface
  (data-item-chrome="surface"), grouped rows yield it to the group
  ("none"). Explicit variant always wins. Resolution is a pure
  function of (current item props, current group policy) — reactive
  after mount, deterministic for SSR.

  DOM law: standalone renders its <a>/<div> root directly; inside an
  ItemGroup the row is wrapped in <li data-slot="item-row"> so native
  list semantics and link semantics coexist. NO asChild: Item is a
  layout container; button-like behavior belongs in ItemActions.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
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
  import { ITEM_GROUP_KEY, type ItemGroupPolicy } from './item-group.svelte';
  import { ListItemDefaults } from './list-item-defaults.svelte';
  import ButtonVariantScope from '../button-group/button-variant-scope.svelte';
  import './item.css';

  type ItemLayout = 'auto' | 'standard' | 'media';

  interface Props extends Omit<HTMLAnchorAttributes, 'class' | 'color'> {
    /** visual variant (geometry-neutral): auto | default | outline | muted */
    variant?: 'auto' | 'default' | 'outline' | 'muted';
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) — omitted = nearest provider */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast — the row's corner paint consumes the §3 chain
     *  (item.css): an explicit lane supplies, auto computes
     *  max(0px, R − P) against the nearest supplier (the group) */
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
    /** row layout: 'auto' inherits the group's, else standard */
    layout?: ItemLayout;
    /** visual selection state ONLY — never emits aria-selected */
    selected?: boolean;
    /** renders the root as an anchor (link rows carry their own hover law) */
    href?: string;
    class?: string;
    children: Snippet;
  }

  let {
    variant,
    density,
    'data-density': _callerDensity,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    layout = 'auto',
    selected = false,
    href,
    class: className = '',
    style = '',
    children,
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.4 + W3-D1): variant rides a literal slot (own 'auto',
  // the auto-chrome grammar), density the bridged axis slot (inside
  // a group the slot's ambient read lands on ItemGroup's provided
  // opinion), the seven other universal axes resolve one record
  const d = $derived(
    ListItemDefaults.resolve({
      variant,
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
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  // §3/§14 consumption (the batch B card law, the row's dialect):
  // an explicit lane composes radius-effective × the factor; auto
  // computes the concentric max(0px, R − P) × the factor against
  // the row's own ancestors (the group frame's carrier — the var()
  // fallbacks load-bearing, IACVT never lands; a bare row resolves
  // 0px through the root sheet's invariants)
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : '--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1))',
  );
  let rowEl = $state<HTMLElement>();
  provideQueryAnchor(() => rowEl ?? null);

  const rootStyle = $derived(
    [carriers, radiusConsumed, style].filter(Boolean).join('; ') || undefined,
  );

  const policy = getContext<ItemGroupPolicy | undefined>(ITEM_GROUP_KEY);

  // explicit 'default' normalizes to chrome 'none' (the transparent
  // escape hatch) — data-item-chrome never leaves its closed union
  const chrome = $derived(
    d.variant === 'auto' ? (policy ? 'none' : 'surface') : d.variant === 'default' ? 'none' : d.variant,
  );
  const resolvedLayout = $derived(layout === 'auto' ? (policy?.layout ?? 'standard') : layout);
  const klass = $derived(cn('jx-item', className));
</script>

{#snippet row()}
  <svelte:element
    this={href ? 'a' : 'div'}
    {href}
    {...rest}
    bind:this={rowEl}
    data-slot="item"
    data-variant={d.variant}
    data-item-chrome={chrome}
    data-density={densityRungOf(d.density)}
    data-layout={resolvedLayout}
    data-selected={selected ? 'true' : undefined}
    class:dark={d.theme === 'dark'}
    style={rootStyle}
    class={klass}
  >
    <!-- the row IS the raised surface — every press control inside
         rides FLAT by ambient (Owner 2026-09-05 r3 follow-up: raw-lane
         icon-buttons were still convex, double light sources); explicit
         raised on any button still wins (inherit-then-provide) -->
    <ButtonVariantScope raised={false}>
      {@render children()}
    </ButtonVariantScope>
  </svelte:element>
{/snippet}

{#if policy}
  <li data-slot="item-row">{@render row()}</li>
{:else}
  {@render row()}
{/if}
