<!--
  HighlightDetectDefault (registry/files/ui/highlight-detect-default/
  highlight-detect-default.svelte, highlight-lang-detector, 2026-09-07).
  The DLD context provider as a CHILDREN WRAPPER — the frozen D2.2 form
  ①, whose implementation IS form ② (one setContext at init). Wrapping
  a subtree makes defaultLangDetector() (the four-layer waterfall:
  filename → shebang → structure → betlang) the detection default for
  every <CodeCard lang="auto"> inside it; the langDetector prop and the
  backend's own detector keep their ring priority (prop → context →
  backend). Svelte context propagates DOWNWARD ONLY — sibling subtrees
  outside the wrapper are untouched, and nested wrappers take the
  nearest (the scope law). ~10 lines on purpose: this component adds
  wiring, not behavior.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import {
    provideUniversalLanes,
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
  import { HIGHLIGHT_DETECT_KEY } from '$lib/highlight/context-key';
  import { defaultLangDetector } from '$lib/highlight/default-detector';
  import { HighlightDetectDefaultDefaults } from './highlight-detect-default-defaults.svelte';

  interface Props {
    children: Snippet;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) — supplied to the wrapped subtree as
     *  ambient (this wrapper has no element to stamp) */
    density?: DensityLane | QueryResult<DensityLane>;
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
  }

  let { children, density, size, shape, radius, color, theme, elevation, motion }: Props = $props();

  setContext(HIGHLIGHT_DETECT_KEY, { detector: defaultLangDetector() });

  // ── the eight-axis surface, the NO-ROOT (fragment) dialect (W3-D5
  // — FIRST-TIME contract, all no-own; the scroll-chrome /
  // pattern-hero-set precedent): the wrapper renders children with NO
  // element of its own, so the family supplies the resolved lanes
  // through CONTEXT only — every component inside the wrapped subtree
  // resolves them as ambient and stamps its own roots. No carriers
  // and no query() anchor here (a fragment has no element to bind).
  // The record is the family's read point (the A3 law); the
  // HIGHLIGHT_DETECT_KEY write above is family STATE — the two
  // contexts coexist, each under its own key
  const d = $derived(
    HighlightDetectDefaultDefaults.resolve({
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
  void d;
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
</script>

{@render children()}
