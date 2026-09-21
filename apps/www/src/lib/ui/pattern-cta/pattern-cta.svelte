<!--
  jixoai pattern-cta (registry/files/ui/pattern-cta/pattern-cta.svelte,
  2026-08-30, openspec 2026-08-30-terminal-patterns).
  The shell-prompt CTA band: a lead block (eyebrow / heading /
  summary / optional outline escape) beside the command card — the
  install command rides CodeCard (bash lane, the card's own copy
  control retired so the band owns ONE copy affordance) and the copy
  action is a PressButton in the card's footer snippet: fill rung,
  copy → check glyph flip, 1.4s copied surface — the terminal idiom's
  answer to "sign up now". Press physics stay the button's own (hover
  grows only the shadow, active presses +1px — verified by the
  press-button suite, never re-implemented here).

  Composition-only laws (terminal-patterns delta): no atom prop is
  patched, no atom paint re-implemented.

  Elevation (F-7, adversarial-review 2026-09-02): the band floats on
  the --shadow token (the elevation grammar's float tier) — the old
  `[box-shadow:4px_4px_0_0_var(--shadow)]` arbitrary value was doubly
  wrong: hardcoded geometry OFF the tokens, and var(--shadow) is a
  full shadow LIST, not a color — the substitution produced five
  lengths and the whole declaration computed to none (the band
  rendered shadowless). Geometry lives only in the theme sheet.

  tailwindless Wave 1 batch 3 (2026-09-17): the paint rides the
  family's stylex ATOMS (pattern-cta.stylex.ts) joined through cx();
  the 820px two-track seam rides the band atom's media block at the
  ORIGINAL threshold (breakpoint parity); the `+` corner brackets
  stay in pattern-cta.css (pseudo-element content, lane-2).
-->
<script lang="ts">
  import Icon from '$lib/ui/icon';
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
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
  import { PatternCtaDefaults } from './pattern-cta-defaults.svelte';
  import { ctaStyles } from './pattern-cta.stylex';
  import './pattern-cta.css';

  interface Props {
    /** the shell command the band sells (copy payload + card code) */
    command?: string;
    /** the band heading (renders an h2 stamped as component chrome) */
    heading?: string;
    /** max-52ch support line under the heading */
    summary?: string;
    /** the copy control's label (aria affordance when not copied) */
    actionLabel?: string;
    /** an outline escape beside the heading block; renders when set */
    secondaryLabel?: string;
    secondaryHref?: string;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the composed children ride
     *  the ambient chain — the composition law) */
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
    command = 'npx jixoai-ui init',
    heading = 'ship it from your terminal',
    summary = 'One command pulls the theme, the tokens and every atom you name into your repo — the source stays yours.',
    actionLabel = 'copy command',
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

  // ── the eight-axis surface (W3-D2 — FIRST-TIME contract, all
  // no-own: a composition product over batch A-D1 children; the size
  // axis scales the band root, the children's axis surfaces ride the
  // ambient chain — the whole point of 吃也供)
  const d = $derived(
    PatternCtaDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  async function copyCommand(): Promise<void> {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // preview servers / embedded contexts without a clipboard grant
      const area = document.createElement('textarea');
      area.value = command;
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1400);
  }
  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner, never a
  // raw class={styles.x} interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<section
  data-jx-pattern-cta=""
  bind:this={uniRoot}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={`jx-pattern-cta ${cx(ctaStyles.band)} ${className}`}
  aria-label="call to action"
>
  <div class={cx(ctaStyles.lead)}>
    <p class={cx(ctaStyles.eyebrow)}>$ npx jixoai-ui add …</p>
    <h2
      data-jx-cta-title=""
      class={cx(ctaStyles.heading)}
    >
      {heading}
    </h2>
    <p class={cx(ctaStyles.summary)}>
      {summary}
    </p>
    {#if secondaryLabel}
      <PressButton variant="outline" href={secondaryHref} class={cx(ctaStyles.escape)}>{secondaryLabel}</PressButton>
    {/if}
  </div>

  <CodeCard lang="bash" code={command} filename="install" copyable={false} class={cx(ctaStyles.lead)}>
    {#snippet footer()}
      <PressButton
        variant={copied ? 'tonal' : 'fill'}
        class={copied ? 'jx-hue-success' : undefined}
        onclick={copyCommand}
        ariaLabel={`${copied ? 'copied' : actionLabel} ${command}`}
      >
        {#if copied}
          <span class={cx(ctaStyles.iconLane)}><Icon name="check" size={14} strokeWidth={2.5} /></span>
          <span>copied</span>
        {:else}
          <span class={cx(ctaStyles.iconLane)}><Icon name="copy" size={14} /></span>
          <span>{actionLabel}</span>
        {/if}
      </PressButton>
    {/snippet}
  </CodeCard>
</section>
