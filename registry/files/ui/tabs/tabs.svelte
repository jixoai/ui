<!--
  jixoai tabs — the ROOT half (registry/files/ui/tabs/tabs.svelte,
  2026-09-01 tabs variant system; 2026-09-02 fix wave touched only
  comment/format hygiene here — the context contract is stable).
  WAI-ARIA APG tabs pattern, composition-first: this component owns ONLY
  the shared state (the selected value) and hands it to the family
  through context — the tablist, triggers and panels can be laid out
  anywhere in the subtree (sidebar + panel grid, inline docs switches…):

    <Tabs bind:value>
      <TabsList>                       ← keyboard + roving tabindex
        <TabsTrigger value="a">A</TabsTrigger>
      </TabsList>
      <TabsContent value="a">…</TabsContent>
    </Tabs>

  value is $bindable; '' means nothing selected (SSR-honest — like the
  wider ecosystem, the initial selection is an explicit decision, not a
  hydration-time guess). Automatic activation: focus moving across
  triggers selects them (terminal immediacy; the manual-activation
  variant can arrive later as a prop if a use case shows up).
-->
<script lang="ts" module>
  /** context surface the family shares (import type where needed) */
  export interface TabsApi {
    readonly uid: string;
    readonly selected: string;
    /** the tab stop: last-focused trigger, falling back to the selected
     *  one — manual activation keeps roving tabindex on the FOCUSED
     *  trigger, not the selected one (APG contract) */
    readonly tabStop: string;
    setTabStop(value: string): void;
    select(value: string): void;
    /** 'automatic': arrows select as they focus · 'manual': Enter/Space */
    readonly activation: 'automatic' | 'manual';
  }

  /** context key — registered on the global symbol registry so the
   *  family files stay independent registry items */
  export const TABS_KEY = Symbol.for('jx-tabs');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { getDensityContext, provideDensity, resolveDensity } from '$lib/density.svelte';
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
  import { TabsDefaults } from './tabs-defaults.svelte';
  import { tabsStyles } from './tabs.stylex';

  interface Props {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** the active tab value; bindable (bind:value) — '' = none selected.
     *  The bound value is the authority: pointing it at a disabled or
     *  absent tab keeps that value verbatim (caller's decision). */
    value?: string;
    /** fires on every selection change (bound or not) */
    onchange?: (value: string) => void;
    /** automatic: focus moves select (default, terminal immediacy).
     *  manual: arrows move focus only — Enter/Space commit. */
    activation?: 'automatic' | 'manual';
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
    children: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    density,
    value = $bindable(''),
    onchange,
    activation = 'automatic',
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    children,
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

  // '' = "nothing focused yet" → the selected trigger is the tab stop
  let focused = $state('');

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // The CAPTURE is load-bearing and EAGER (r11 first contract,
  // context-defaults-economy 3.3): getDensityContext() rides the
  // $derived.by ARGUMENT subtree, which evaluates at this statement —
  // BEFORE provideDensity writes the key — so it captures the PARENT's
  // context object. A lazily-evaluated read (a plain $derived
  // initializer body, or the getter itself) would resolve the key to
  // the tabs' OWN write and self-reference through the very getter it
  // feeds — derived_references_self, the pre-3.3 bare capture this
  // replaces. The returned getter reads ONLY the captured object
  // (reactive through its getters, never re-entering the context
  // machinery). The W3 universal lane narrows at the legacy edge (the
  // input-group law): 'auto'/number/query lanes carry no legacy rung —
  // the rung stays ambient (§4), the coefficient rides the carriers
  const legacyDensityLane = $derived(
    typeof density === 'string' && density !== 'auto' ? density : undefined,
  );
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(legacyDensityLane, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3 + W3-D3),
  // riding ON TOP of the provider lane as the family's single audited
  // read point: the density slot's ambient read resolves the key to
  // the tabs' own write, whose getter is the captured-parent
  // resolution above, so the chain TERMINATES (it never re-enters this
  // derived) and lands the same value every lane stamps; the seven
  // sibling axes ride the same record (the root div is the family's
  // own DOM root; the indicator machinery stays untouched — the parts
  // ride the supply chain). PROVIDER-SNAPSHOT KERNEL LAW: density does
  // NOT ride the provideUniversalLanes literal — the reactive bridged
  // write above carries the universal density supply; the literal
  // carries the other seven axes
  const d = $derived(TabsDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }));
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  setContext<TabsApi>(TABS_KEY, {
    uid: autoId,
    get activation() {
      return activation;
    },
    get selected() {
      return value;
    },
    get tabStop() {
      return focused || value;
    },
    setTabStop(next: string) {
      focused = next;
    },
    select(next: string) {
      if (next === value) return;
      value = next;
      onchange?.(next);
    },
  });
</script>

<div
  data-jx-tabs=""
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  bind:this={uniRoot}
  class={cx(tabsStyles.root)}
>{@render children()}</div>
