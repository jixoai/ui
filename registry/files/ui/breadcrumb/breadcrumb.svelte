<!--
  jixoai Breadcrumb root (registry/files/ui/breadcrumb/breadcrumb.svelte,
  composition-first, 2026-08-25).
  W3C-first: a breadcrumb trail is a nav landmark wrapping an ordered
  list of ordinary links — the entire ARIA story is nav[aria-label] +
  ol + a[aria-current="page"]. No microdata obligations, no roles to
  maintain; the ol's order IS the hierarchy.

  The root owns NOTHING but the landmark (composition-first: the old
  closed `crumbs[]` data prop died). The trail is authored as parts —

    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/">root</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbPage href="/leaf">leaf</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

  Long trails opt into the fold by wrapping the middle items in
  <BreadcrumbCollapse> (no width magic here, no collapse prop — the
  nesting IS the decision).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { provideDensity, resolveDensity, getDensityContext } from '$lib/density.svelte';
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
  import { BreadcrumbDefaults } from './breadcrumb-defaults.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) — resolved through the bridged provider
     *  below (the parts adopt the tier through the same ambient) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the whole trail scales) */
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
    /** nav landmark label (announced before the trail) */
    label?: string;
    class?: string;
    children: Snippet;
  }

  let {
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    label = 'Breadcrumb',
    class: className = '',
    style: consumerStyle,
    children,
    ...rest
  }: Props = $props();

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // The CAPTURE is load-bearing and EAGER (r11 first contract,
  // context-defaults-economy 3.3): getDensityContext() rides the
  // $derived.by ARGUMENT subtree, which evaluates at this statement —
  // BEFORE provideDensity writes the key — so it captures the PARENT's
  // context object; a lazily-evaluated read would resolve the key to
  // the trail's OWN write and self-reference through the very getter
  // it feeds (derived_references_self — the pre-3.3 bare capture this
  // replaces). The returned getter reads ONLY the captured object.
  // W3-D5: the legacy lane stays confined to the rung spellings (the
  // auto/number/query lanes carry no legacy rung — §4's bridge note),
  // so the bridge keeps forwarding exactly the rung channel the ~60
  // legacy consumers read
  const legacyDensityLane = $derived(
    typeof density === 'string' && density !== 'auto' ? density : undefined,
  );
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(legacyDensityLane, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3, widened
  // W3-D5), riding ON TOP of the provider lane as the family's single
  // audited read point: the density slot's ambient read resolves the
  // key to the trail's own write, whose getter is the captured-parent
  // resolution above, so the chain TERMINATES (it never re-enters
  // this derived); the seven sibling axes join the same record — the
  // nav root stamps the §10 carriers (JOINing the consumer style
  // attr, the merge law) and anchors query() after the anchor state
  // declaration. PROVIDER-SNAPSHOT KERNEL LAW: density does NOT ride
  // the provideUniversalLanes literal — the reactive bridged write
  // above carries the universal density supply (provideDensity
  // bridges onto the universal key); the literal carries the other
  // seven axes
  const d = $derived(
    BreadcrumbDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement | undefined>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );
</script>

<nav
  bind:this={uniRoot}
  data-jx-breadcrumb=""
  class={cn(className)}
  class:dark={d.theme === 'dark'}
  data-density={densityRungOf(d.density)}
  style={rootStyle}
  {...rest}
  aria-label={label}
>
  {@render children()}
</nav>
