<!--
  jixoai theme toggle (registry/files/ui/theme-toggle/theme-toggle.svelte).
  light / dark / system with four variants:
    full    — segmented selector: icon + label per mode, click to SET
    compact — cycling button: icon + current mode label
    icon    — cycling button: icon only (aria-label carries the mode)
    text    — cycling button: current mode label only
  Drives the shared theme contract (localStorage "theme", .dark class +
  colorScheme on the root). Pair with the no-flash inline bootstrap in
  app.html. Icons render through the Icon component over the generated
  set (lucide geometry, code-split chunks — no icon-library runtime
  dependency).

  tw4 (2026-08-24): PURE utility migration, zero css residue — the
  bezel's currentColor color-mix paint rides arbitrary-value utilities;
  the segmented group's last-slot border and the data-active fill are
  JS-known, so conditional strings carry them.
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (theme-toggle.stylex.ts) joined through
  cx() below — the last-slot rail and the data-active fill walk
  conditional atom groups; the data-active attribute stays the valued
  hook. Still zero css residue.

  Localization (2026-09-06, consumer-feedback-fixes P0-1): the mode
  vocabulary is a presentation payload, not structure — the OPTIONAL
  `labels` prop localizes the three mode labels and the full variant's
  group aria name:

    labels?: { light: string; dark: string; system: string;
               groupAriaLabel?: string }

  Absent → the English literals shipped to date, byte-identical render
  and aria; present → labels + aria localize while the VALUE domain
  (light/dark/system) and the localStorage "theme" contract stay
  untouched (a zh page says 系统, the stored value stays `system`).
-->
<script lang="ts">
  import Icon from '$lib/ui/icon';
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
  import { ThemeToggleDefaults, type ThemeToggleVariant } from './theme-toggle-defaults.svelte';
  import { themeToggleStyles } from './theme-toggle.stylex';

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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  type Theme = 'light' | 'dark' | 'system';

  /** the localization payload: the three mode labels + the full
   *  variant's group aria name (defaults = the English literals) */
  export interface ThemeToggleLabels {
    light: string;
    dark: string;
    system: string;
    groupAriaLabel?: string;
  }

  interface Props {
    variant?: ThemeToggleVariant;
    /** full variant only: hide the text labels, show icons alone. */
    hideLabels?: boolean;
    /** localize the mode labels and the group aria name; absent =
     *  English (the shipped defaults) — no behavioral change */
    labels?: ThemeToggleLabels;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
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
    /** universal theme axis (§6): tree-scoped paint (class:dark on
     *  the control's own root); auto = inheritance — deliberately NOT
     *  the global flip (the §6 system lane keeps driving html.dark +
     *  localStorage through set/cycle below, untouched by this
     *  lane) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
  }

  let {
    variant,
    hideLabels = false,
    labels = undefined,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4): variant rides a literal slot (own 'compact', never
  // reads context — a structural selector, not a paint rung); W3-D5
  // widens the record to the EIGHT-axis surface (all no-own) — the
  // carriers stamp whichever root renders (the segmented group or
  // the cycle button), the supply + the query() anchor ride the
  // standard wiring. The GLOBAL flip machinery below is never
  // touched by the axis surface
  const d = $derived(
    ThemeToggleDefaults.resolve({ variant, density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement | undefined>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);
  const rootDensity = $derived(densityRungOf(d.density));

  const ORDER: Theme[] = ['light', 'dark', 'system'];
  // the resolved vocabulary: explicit labels over the English own — one
  // spread inside $derived (a reactive labels swap re-resolves), the
  // full three-key shape required so a partial localization cannot
  // half-happen
  const LABEL: Record<Theme, string> = $derived({
    light: 'light',
    dark: 'dark',
    system: 'system',
    ...labels,
  });

  let current = $state<Theme>('system');

  const apply = (theme: Theme): void => {
    const dark =
      theme === 'dark' ||
      (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  };

  const set = (theme: Theme): void => {
    current = theme;
    localStorage.setItem('theme', theme);
    apply(theme);
  };

  const cycle = (): void => set(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!);

  $effect(() => {
    current = (localStorage.getItem('theme') as Theme | null) ?? 'system';
    apply(current);
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => current === 'system' && apply('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  });

</script>

{#snippet iconFor(theme: Theme)}
  <!-- sun/moon/monitor glyphs through the Icon component; the wrapper
       keeps the data hook, the component owns the 13px box -->
  {#if theme === 'light'}
    <span data-jx-theme-icon="" class={cx(themeToggleStyles.icon)}><Icon name="sun" size={13} /></span>
  {:else if theme === 'dark'}
    <span data-jx-theme-icon="" class={cx(themeToggleStyles.icon)}><Icon name="moon" size={13} /></span>
  {:else}
    <span data-jx-theme-icon="" class={cx(themeToggleStyles.icon)}><Icon name="monitor" size={13} /></span>
  {/if}
{/snippet}

{#if d.variant === 'full'}
  <div
    bind:this={uniRoot}
    data-jx-theme-segmented=""
    class={cx(themeToggleStyles.group)}
    data-density={rootDensity}
    class:dark={d.theme === 'dark'}
    style={rootStyle}
    role="group"
    aria-label={labels?.groupAriaLabel ?? 'Color theme'}
  >
    {#each ORDER as theme, index (theme)}
      <button
        type="button"
        onclick={() => set(theme)}
        aria-pressed={current === theme}
        aria-label={hideLabels ? LABEL[theme] : undefined}
        data-jx-theme-seg=""
        class={cx(
          themeToggleStyles.bezel,
          themeToggleStyles.seg,
          index === ORDER.length - 1 ? themeToggleStyles.segRail : themeToggleStyles.segFlush,
          current === theme && themeToggleStyles.segActive,
        )}
        data-active={current === theme || undefined}
      >
        {@render iconFor(theme)}
        {#if !hideLabels}
          <span>{LABEL[theme]}</span>
        {/if}
      </button>
    {/each}
  </div>
{:else}
  <button
    bind:this={uniRoot}
    type="button"
    onclick={cycle}
    data-jx-theme-btn=""
    class={cx(themeToggleStyles.bezel, themeToggleStyles.cycle)}
    data-density={rootDensity}
    class:dark={d.theme === 'dark'}
    style={rootStyle}
    aria-label={`theme: ${current}`}
  >
    {#if d.variant === 'compact'}
      {@render iconFor(current)}
      <span>{LABEL[current]}</span>
    {:else if d.variant === 'icon'}
      {@render iconFor(current)}
    {:else}
      <span>{LABEL[current]}</span>
    {/if}
  </button>
{/if}
