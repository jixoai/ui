<!--
  jixoai native-scroll-area
  (registry/files/ui/native-scroll-area/native-scroll-area.svelte,
  2026-09-15 — visual-quality-iteration W4, the scroll-area family
  split). The PLATFORM sibling: zero drawn chrome — the platform
  scrollbar under the site's scrollbar-token law (the theme's global
  currentColor chain paints it; this component never touches
  scrollbar-color) with the native best practices packaged as
  CAPABILITY STYLES from the kit (scroll-area-kit/native-capability.css
  + the core's theme-scope resolution):
    - scrollbar-gutter: stable both-edges on vertical-capable axes
      (overflow arriving never shifts layout);
    - color-scheme follows the STAGE SCOPE, not just the OS — the W1
      lesson applied to the platform bar: the nearest theme scope
      ([data-theme], .dark, .jx-light — self included) resolves and
      re-resolves live (a scope observer on the ancestor chain
      watching class AND data-theme mutations);
    - scrollbar-width tiers auto | thin | none (the theme's thin law
      is the default);
    - overscroll-behavior containment.

  NO custom scrollbar ARIA mounts anywhere inside — no drawn thumb
  exists, and the platform scrollbar IS the accessibility contract
  (role="scrollbar" on a nonexistent thumb would be a violation, not a
  feature — the Gate-1 r1 ruling; probe-asserted absent). The region
  keeps the WAI scrollable-region pattern (role=region + name +
  tabindex) exactly like the family: keyboard, PageUp/Home, snap and
  chaining stay platform behavior.

  Boundary: scroll-run (the linear strip edge system) is a DIFFERENT
  shared system; the mermaid zoom-pan viewport keeps its recorded
  exemption. getViewport() feeds the family's ToC pairing unchanged.

  API contract（克制原则）: orientation / scrollbarWidth / label /
  class / style / onscroll + restProps 透传到滚动口 + children.
  Instance exports (bind:this): getViewport() / scrollTo(). 仅此而已。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { resolveThemeScope } from '$lib/scroll-area-kit/core';
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
  import { NativeScrollAreaDefaults } from './native-scroll-area-defaults.svelte';
  import { nativeScrollAreaStyles } from './native-scroll-area.stylex';
  import '$lib/scroll-area-kit/native-capability.css';
  import './native-scroll-area.css';

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

  export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';
  export type ScrollbarWidthTier = 'auto' | 'thin' | 'none';
  export type ViewportScrollEvent = HTMLElementEventMap['scroll'] & {
    currentTarget: EventTarget & HTMLDivElement;
  };

  interface Props {
    /** which axes scroll: overflow-y/x mapping (default vertical) */
    orientation?: ScrollOrientation;
    /** the scrollbar-width tier (default thin — the theme's global
     *  scrollbar law; `auto` restores the platform-wide bar, `none`
     *  hides it entirely — the content still scrolls) */
    scrollbarWidth?: ScrollbarWidthTier;
    /** a11y name for the scrollable region */
    label?: string;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the native-wrapper batch A
     *  rule: the family owns only the axis names it destructures on
     *  the OUTER root — no native size-like attribute collides here;
     *  the scrollbar tiers ride their own data-width hook) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast (the region root SUPPLIES the anchor) */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge; the scheme OBSERVER below
     *  is family STATE and never reads this lane) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
    style?: string;
    onscroll?: (event: ViewportScrollEvent) => void;
    children: Snippet;
  }

  let {
    orientation = 'vertical',
    scrollbarWidth = 'thin',
    label = 'scrollable content',
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style,
    onscroll,
    children,
    ...restProps
  }: Props = $props();

  // ── the eight-axis surface (W3-D5 — FIRST-TIME contract, all
  // no-own): one resolution record stamped on the OUTER family root
  // (the .jx-native-scroll-area div — never the scrollport: the
  // consumer `style` stays the viewport's own channel); the §11
  // supply + the query() anchor ride the standard wiring (the anchor
  // after the state decl)
  const d = $derived(
    NativeScrollAreaDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement | null>(null);
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  let viewportEl = $state<HTMLDivElement | null>(null);

  /** the stage scope the bar follows: 'light' | 'dark' | undefined
   * (undefined = unscoped — the OS scheme answers, the honest
   * fallback; NO data-scheme attribute, the UA default stands) */
  let scheme = $state<'light' | 'dark' | undefined>(undefined);

  export function getViewport(): HTMLDivElement | null {
    return viewportEl;
  }

  /** thin passthrough to the native scrollport */
  export function scrollTo(options?: ScrollToOptions): void {
    viewportEl?.scrollTo(options);
  }

  const handleScroll = (event: ViewportScrollEvent): void => {
    onscroll?.(event);
  };

  // theme-scope alignment (the core's resolver + the W1 observer
  // shape): class flips AND data-theme flips on the viewport's
  // ancestor chain re-resolve the scheme live, no re-mount
  $effect(() => {
    const vp = viewportEl;
    if (!vp || typeof MutationObserver === 'undefined') return;
    const apply = () => {
      scheme = resolveThemeScope(vp) ?? undefined;
    };
    apply();
    const chain: Element[] = [];
    for (let node: Element | null = vp; node; node = node.parentElement) chain.push(node);
    const mo = new MutationObserver(apply);
    for (const node of chain) mo.observe(node, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => mo.disconnect();
  });

  // orientation → the scrollport's overflow law (deterministic branch):
  // variant → atom group at module scope, runtime is a pure lookup
  const orientationAtoms = {
    vertical: nativeScrollAreaStyles.vertical,
    horizontal: nativeScrollAreaStyles.horizontal,
    both: nativeScrollAreaStyles.both,
  } as const;
</script>

<div
  bind:this={uniRoot}
  class={cx('jx-native-scroll-area', nativeScrollAreaStyles.area)}
  data-orientation={orientation}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (the WAI scrollable-
       region pattern: role=region + name + tabindex makes it a keyboard
       scroll surface — and the ONLY a11y surface here: the platform
       scrollbar is the accessibility contract, nothing custom mounts
       inside this box) -->
  <div
    class={cn(cx('jx-native-scroll jx-native-scroll-viewport', orientationAtoms[orientation]), className)}
    data-orientation={orientation}
    data-width={scrollbarWidth === 'thin' ? undefined : scrollbarWidth}
    data-scheme={scheme}
    role="region"
    aria-label={label}
    tabindex="0"
    bind:this={viewportEl}
    onscroll={handleScroll}
    {style}
    {...restProps}
  >
    <div data-jx-scroll-content class={cx(nativeScrollAreaStyles.content)}>
      {@render children()}
    </div>
  </div>
</div>
