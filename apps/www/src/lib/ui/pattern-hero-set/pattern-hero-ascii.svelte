<!--
  jixoai pattern-hero-ascii (registry/files/ui/pattern-hero-set/
  pattern-hero-ascii.svelte, 2026-08-30, terminal-patterns).
  The ascii-art headline hero: the headline IS a figlet banner —
  `art` arrives as payload (value-domain string, whitespace-preserved)
  and renders in a <pre> under the mono scale law (the size clamps
  with the viewport; wide banners scroll their own lane instead of
  wrapping — ascii art must never reflow). CTA row rides PressButton
  with the arrow glyph from the generated icon module.

  Composition-only: no atom is patched; the press law, the icon
  geometry and the hero grammar all belong to the atoms.

  tailwindless one-shot Wave 1 (2026-09-17): the paint rides
  pattern-hero-set.stylex.ts atoms (joined through the payload's own
  cx(); the sm/lg seams ride nested media conditions at Tailwind's
  own thresholds); the banner's 1.1 leading + thin scrollbar ride
  pattern-hero-set.css keyed on the data hook.
-->
<script lang="ts">
  import Icon from '$lib/ui/icon';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
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
  import { PatternHeroSetDefaults } from './pattern-hero-set-defaults.svelte';
  import { heroStyles } from './pattern-hero-set.stylex';
  import './pattern-hero-set.css';

  interface Props {
    /** the ascii banner (whitespace-preserved payload — figlet output) */
    art: string;
    /** tracked label above the banner */
    eyebrow?: string;
    /** max-62ch lead paragraph under the banner */
    summary?: string;
    /** the primary CTA (label + href); omitted renders no CTA row */
    ctaLabel?: string;
    ctaHref?: string;
    /** an outline CTA beside the primary */
    secondaryLabel?: string;
    secondaryHref?: string;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the mono banner keeps its
     *  own viewport-clamped scale law; the chrome scales) */
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
    class?: string;
  }

  let {
    art,
    eyebrow = '$ figlet -f standard jixoai',
    summary = '',
    ctaLabel = 'get started',
    ctaHref = '#',
    secondaryLabel = '',
    secondaryHref = '#',
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();

  // ── the eight-axis surface (W3-D2 — the family's no-root set form
  // supplies through context; this sibling owns its section root and
  // stamps the carriers here directly)
  const d = $derived(
    PatternHeroSetDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, raw interpolation would render [object Object]
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
</script>

<section
  data-jx-hero-ascii=""
  bind:this={uniRoot}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cx(heroStyles.shell, className)}
>
  <div class={cx(heroStyles.inner)}>
    <p class={cx(heroStyles.eyebrow)}>{eyebrow}</p>
    <!-- the mono scale law: size clamps with the viewport, the banner
         scrolls its own lane — ascii never reflows -->
    <pre
      data-jx-hero-ascii-art=""
      class={cx(heroStyles.asciiArt)}
      aria-label="ascii art headline"
    >{art}</pre>
    {#if summary}
      <p class={cx(heroStyles.lead)}>
        {summary}
      </p>
    {/if}
    {#if ctaLabel}
      <div class={cx(heroStyles.ctaRow)}>
        <PressButton variant="fill" href={ctaHref}>
          <span>{ctaLabel}</span>
          <span class={cx(heroStyles.ctaGlyph)} aria-hidden="true"><Icon name="arrowRight" /></span>
        </PressButton>
        {#if secondaryLabel}
          <PressButton variant="outline" href={secondaryHref}>{secondaryLabel}</PressButton>
        {/if}
      </div>
    {/if}
  </div>
</section>
