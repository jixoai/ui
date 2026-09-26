<!--
  jixoai pattern-hero-marquee (registry/files/ui/pattern-hero-set/
  pattern-hero-marquee.svelte, 2026-08-30, terminal-patterns).
  The badge-marquee hero: a lead block (eyebrow / title snippet /
  summary / CTA row) over a token marquee strip — `npm ls --depth 0`
  energy, plain mono tokens (NO chip boxes: the strip is text with
  dot separators, so no atom paint is duplicated). The loop is pure
  CSS: the track carries the readable row plus an aria-hidden
  duplicate and translates -50% seamlessly; under
  prefers-reduced-motion the animation dies, the duplicate folds
  away and the strip becomes a static scrollable row (the
  reduced-motion law — never a frozen half-row).

  Composition-only: PressButton owns the CTA physics; the glyph comes
  from the Icon component over the generated set.

  tailwindless one-shot Wave 1 (2026-09-17): the paint rides
  pattern-hero-set.stylex.ts atoms (joined through the payload's own
  cx(); the sm/lg seams ride nested media conditions at Tailwind's
  own thresholds); the title's bold/1.2/-0.02em rungs + the strip's
  thin scrollbar ride pattern-hero-set.css keyed on the data hooks.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
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
    /** the marquee tokens (value-domain payload — plain strings) */
    items: readonly string[];
    /** tracked label above the title */
    eyebrow?: string;
    /** the h1 content — <em> inside carries the accent paint */
    title?: Snippet;
    /** max-62ch lead paragraph */
    summary?: string;
    /** the primary CTA (label + href); omitted renders no CTA row */
    ctaLabel?: string;
    ctaHref?: string;
    /** an outline CTA beside the primary */
    secondaryLabel?: string;
    secondaryHref?: string;
    /** one full pass of the strip, in seconds (default 24) */
    duration?: number;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the strip's own animation
     *  cadence keeps its duration prop; the chrome scales) */
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
    items,
    eyebrow = '$ npm ls --depth 0',
    title,
    summary = '',
    ctaLabel = 'get started',
    ctaHref = '#',
    secondaryLabel = '',
    secondaryHref = '#',
    duration = 24,
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
  data-jx-hero-marquee=""
  bind:this={uniRoot}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cx(heroStyles.shell, className)}
>
  <div class={cx(heroStyles.inner)}>
    <p class={cx(heroStyles.eyebrow)}>{eyebrow}</p>
    {#if title}
      <h2 data-jx-hero-marquee-title="" class={cx(heroStyles.title)}>
        {@render title()}
      </h2>
    {/if}
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

    <!-- the strip: readable row + aria-hidden duplicate, -50% loop;
         edge fade is a mask so nothing interactive hides under it -->
    <div data-jx-hero-marquee-strip="" class={cx(heroStyles.strip)}>
      <div
        class="jx-hero-marquee-track"
        style={`--jx-hero-marquee-duration: ${Math.max(6, duration)}s`}
      >
        <ul data-jx-hero-marquee-row="" class={cx(heroStyles.row)}>
          {#each items as token (token)}
            <li class={cx(heroStyles.token)}>
              <span class={cx(heroStyles.tokenLabel)}>{token}</span>
              <span aria-hidden="true" class={cx(heroStyles.dotPrimaryText)}>·</span>
            </li>
          {/each}
        </ul>
        <ul class={cx(heroStyles.row)} aria-hidden="true">
          {#each items as token (token)}
            <li class={cx(heroStyles.token)}>
              <span class={cx(heroStyles.tokenLabel)}>{token}</span>
              <span aria-hidden="true" class={cx(heroStyles.dotPrimary)}>·</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</section>
