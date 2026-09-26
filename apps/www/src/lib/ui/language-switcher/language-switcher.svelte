<!--
  jixoai language switcher (registry/files/ui/language-switcher/language-switcher.svelte).
  Two variants, composed after the openspecui bilingual reference:

    pair — icon + segmented two-locale group (EN / 中文 style): the active
           locale fills with the brand hue; anchored navigation (SSG-safe)
    menu — icon + current-locale button opening a popover of locale links
           for three or more locales; same anchor model, closes on select /
           outside click / Escape

  Locales are links, not options (2026-09-02 honesty pass): the menu
  panel is a nav landmark of plain anchors — no listbox/option composite
  roles, because nothing here implements arrow-key roving or
  aria-activedescendant; the keyboard contract is the links' native
  Tab/Enter, and the trigger is a bare disclosure (aria-expanded, no
  aria-haspopup — the popover is not a menu widget). Each entry carries
  its own href (e.g. the localized path of the current page), so the
  switcher works on fully prerendered sites. Terminal-surface styling
  matches theme-toggle (light border on the dark bezel).

  tw4 (2026-08-24): PURE utility migration, zero css residue — the
  bezel's currentColor color-mix paint rides arbitrary-value utilities,
  and the active-locale states are JS-known, so conditional strings
  carry them.

  popover platform (CR-2, 2026-09-02): the menu rides popover=auto +
  CSS Anchor Positioning beside its trigger (the system-dialog inline
  pattern) — the retired hand-positioned absolute dropdown needed its
  own outside-click/Escape wiring and sat in the grid-law's gray zone.
  Light dismiss, Escape, and the top layer are the platform's now.
  The anchor name derives from $props.id() (SSG law, 2026-09-02): the
  id travels through a hydration marker, so SSR html and the hydrated
  client agree on the name — a Math.random name would diverge across
  the seam and briefly orphan the popover.

  PERSISTENCE CONTRACT (2026-09-06, consumer-feedback-fixes P0-2):
  clicking any locale anchor writes the TARGET locale's code to
  localStorage under the key `lang` (try/catch, silent — storage can
  be unavailable in private mode or over quota; the choice then simply
  doesn't persist). This is the component's half of a two-party
  contract: the SITE's language-negotiation bootstrap (server-side or
  pre-paint script) reads the same `lang` key to pick the entry locale
  — the key name is the frozen seam. Navigation itself stays a PURE
  anchor navigation (href + hreflang per entry): persistence rides the
  click and never preventDefaults or takes over routing, so fully
  prerendered sites keep working. Sites that previously event-delegated
  hreflang reads into their own storage key should migrate to reading
  `lang` and delete their delegation.
-->
<script lang="ts">
  import Icon from '$lib/ui/icon';
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
  import {
    LanguageSwitcherDefaults,
    type LanguageSwitcherVariant,
  } from './language-switcher-defaults.svelte';
  import { langStyles } from './language-switcher.stylex';
  import './language-switcher.css';

  export interface SwitcherLocale {
    code: string;
    label: string;
    href: string;
  }

  interface Props {
    variant?: LanguageSwitcherVariant;
    locales: readonly SwitcherLocale[];
    current: string;
    ariaLabel?: string;
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
    variant,
    locales,
    current,
    ariaLabel = 'Language',
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

  // the family Defaults is the single read point (context-defaults-
  // economy 3.4 + W3-D1): variant rides a literal slot (own 'pair',
  // never reads context — a structural selector, not a paint rung);
  // the eight universal axes resolve one record, all no-own
  const d = $derived(
    LanguageSwitcherDefaults.resolve({
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
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  // the persistence half of the contract (header): target code under
  // the frozen `lang` key, silent on storage failure
  const persistLocale = (code: string): void => {
    try {
      localStorage.setItem('lang', code);
    } catch {
      /* storage unavailable — navigation proceeds regardless */
    }
  };

  let open = $state(false);
  let menu = $state<HTMLElement | null>(null);
  let activeLabel = $derived(locales.find((l) => l.code === current)?.label ?? current);
  // a per-instance anchor name (CSS anchor positioning namespaces by
  // document — two switchers on one page must not share one anchor).
  // $props.id() keeps the name SSG-true: the id rides a hydration
  // marker, so SSR html and the hydrated client derive the identical
  // value; its s1/c1 shape is already ident-safe (no sanitize needed)
  const anchor = `--jx-lang-${autoId}`;
</script>

<div
  bind:this={uniRoot}
  data-jx-lang=""
  class={cn(cx(langStyles.root), className)}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
>
  <!-- glyphs through the Icon component; sizing/stroke overrides are
       its props (16px / sw 2 defaults) -->
  <span class={cx(langStyles.iconLane)}><Icon name="languages" size={14} /></span>

  {#if d.variant === 'pair'}
    <div
      data-jx-lang-seg=""
      class={cx(langStyles.bezel)}
      role="group"
      aria-label={ariaLabel}
    >
      {#each locales.slice(0, 2) as locale (locale.code)}
        <a
          href={locale.href}
          hreflang={locale.code}
          aria-current={locale.code === current ? 'page' : undefined}
          data-jx-lang-item=""
          data-jx-lang-active={locale.code === current ? '' : undefined}
          onclick={() => persistLocale(locale.code)}
          class={cn(
            cx(langStyles.segItem),
            locale.code === current ? cx(langStyles.segActive) : cx(langStyles.segIdle),
          )}
        >
          {locale.label}
        </a>
      {/each}
    </div>
  {:else}
    <button
      type="button"
      data-jx-lang-btn=""
      class={cx(langStyles.bezelButton)}
      aria-expanded={open}
      aria-label={ariaLabel}
      style="anchor-name: {anchor}"
      onclick={() => menu?.togglePopover()}
    >
      {activeLabel}
      <span data-jx-lang-chevron="" class={cn(cx(langStyles.chevron), open ? cx(langStyles.chevronOpen) : '')}>
        <Icon name="chevronDown" size={12} strokeWidth={2.5} />
      </span>
    </button>
    <!-- popover=auto: hidden by the UA until shown — always mounted so
         togglePopover() never races an {#if} render; the toggle event
         is the one truth for `open` (light dismiss included). The
         panel is a nav landmark: locale entries are navigation links,
         and the trigger a bare disclosure (aria-expanded only) — the
         links' native Tab/Enter is the whole keyboard contract -->
    <nav
      bind:this={menu}
      data-jx-lang-menu=""
      popover="auto"
      aria-label={ariaLabel}
      class={cx(langStyles.menu)}
      style="position-anchor: {anchor}; position-area: block-end; position-try: flip-block; margin: 0.375rem;"
      ontoggle={(e) => (open = e.newState === 'open')}
    >
      <ul class={cx(langStyles.menuList)}>
        {#each locales as locale (locale.code)}
          <li>
            <a
              href={locale.href}
              hreflang={locale.code}
              aria-current={locale.code === current ? 'page' : undefined}
              data-jx-lang-menu-item=""
              data-jx-lang-menu-active={locale.code === current ? '' : undefined}
              class={cn(
                cx(langStyles.menuItem),
                locale.code === current ? cx(langStyles.menuActive) : cx(langStyles.menuIdle),
              )}
              onclick={() => {
                persistLocale(locale.code);
                menu?.hidePopover();
              }}
            >
              {locale.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</div>
