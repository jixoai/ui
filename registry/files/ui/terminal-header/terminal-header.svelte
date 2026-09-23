<!--
  jixoai terminal header
  (registry/files/ui/terminal-header/terminal-header.svelte).
  The site nav bar: a strict two-wing layout — LEFT carries the brand
  (logo slot + wordmark + domain/subtitle, the page's identity), RIGHT
  carries the navigation pill group plus the switcher slot. The wings
  never mix.

  Theme lock: the bar is a CRT bezel locked DARK by default; components
  inside render with dark tokens because the wrapper carries the scoped
  token class (dark). Declare theme="light" or "system" to unlock.

  Chrome scope (chrome-density-tier, 2026-08-26): the ROW stamps
  data-jx-chrome — the pointer-modality band (hit 32px, icon 16px,
  sm-tier text/gaps). Controls composed into the bar (pills,
  switcher, hamburger, logo slot) follow the ONE band; the drawer
  below the row and the composed panels' surfaces stay on the density
  axis — panels re-scope at their root, so their control law (44px
  touch floor) survives inside the bezel.

  Composition-first (2026-08-25, composition-first-apis — BREAKING): the
  header owns CHROME ONLY and is a thin composition surface OVER the
  NavigationMenu family. The nav slot hosts consumer-composed parts —
  NavigationMenuItem/Trigger/Panel with the mega grids authored INSIDE
  the panels, links-only entries as NavigationMenuLink or bare anchors.
  The three-level TerminalNavItem config tree, panelAction and
  navColumns are DEAD: what renders is the consumer's tree; the header
  wraps it in the bezel. What survives here, verbatim in behavior:

    - the pill-group box + the family's NavigationMenuIndicator over
      the composed entries (indicator migration, 2026-09-01: the
      private 70-line DOM-delegated engine is RETIRED — the part
      carries the measurement, the WAAPI slide, the quiet laws and the
      vt-nav-active morph name; the bezel paint (backdrop brightener,
      never a fill) rides the class seam + terminal-header.css)
    - the mobile drawer SHELL: the hamburger fold, the grid-rows
      0fr→1fr collapse, the bounded scroll viewport, Escape→close with
      focus returned to the hamburger, and the tier-cross reset; the
      drawer CONTENTS are the `drawer` snippet, and bind:open is the
      consumer's reset signal for its own drawer state
    - closeAll(): navigation cleanup — hides every open [popover] panel
      under the header (composed NavigationMenu panels included, found
      by DOM query — the header never tracked them) and resets the
      drawer; consumers call it from their router hook (the registry
      component stays app-agnostic)

  Responsive — two deliberate tiers:
    ≥sm   one row: brand LEFT; pill group + switcher RIGHT
    <sm   row 1: logo + brand LEFT; switcher + hamburger RIGHT; the
          drawer opens as a stacked disclosure below the bar
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
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
  } from '$lib/defaults.svelte';
  import NavigationMenuIndicator from '../navigation-menu/navigation-menu-indicator.svelte';
  import { thStyles } from './terminal-header.stylex';
  import { TerminalHeaderDefaults } from './terminal-header-defaults.svelte';
  import { watchTerminalScope } from '$lib/terminal-scope.svelte';
  import { animateGridDisclosure } from '$lib/disclosure-motion';
  import { tokenScope } from '../../tokens.stylex';
  import './terminal-header.css';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
    /** the wordmark line of the brand block */
    brand: string;
    /** second brand line (the domain) */
    domain?: string;
    /** third brand line — desktop tier only */
    subtitle?: string;
    /** the brand block's link target */
    homeHref?: string;
    /** bezel theme lock: dark (default) | light | system */
    theme?: 'dark' | 'light' | 'system';
    /** the brand mark (logo slot) */
    logo?: Snippet;
    /** the right-wing control slot (theme pair toggle, hue switcher…) */
    switcher?: Snippet;
    /** wrap the switcher slot in the bezel frame (border + p-0.5, the
        38px outer band shared with the pill box). DEFAULT ON — the
        frame law; opt OUT for consumers whose control carries its own
        frame/padding (e.g. the blueprint's compact ThemeToggle — a
        framed-in-frame control double-borders and breaks the band) */
    switcherFrame?: boolean;
    /** the desktop nav slot — compose NavigationMenu parts here */
    children?: Snippet;
    /** the mobile drawer contents (the stacked tier's nav) */
    drawer?: Snippet;
    /** the mobile drawer's open state (bind:open) — the consumer's
        reset signal: closing clears its own drawer state */
    open?: boolean;
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
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query(). NO own — the bezel is flat chrome (its depth is the
     *  page shell's own law); an explicit lane flows to the carriers */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
  }

  let {
    brand,
    domain,
    subtitle,
    homeHref = '/',
    theme,
    logo,
    switcher,
    switcherFrame = true,
    drawer,
    open = $bindable(false),
    density,
    size,
    shape,
    radius,
    color,
    elevation,
    motion,
    class: className = '',
    style = '',
    children,
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults
  // round 2): theme rides its literal slot — own 'dark' (the bezel
  // law) lives in the contract, never a destructure default.
  // W3-C: the seven non-theme axes ride the same record — the THEME
  // axis is DELIBERATELY ABSENT (the unruled-collision law, the
  // terminal-card/ghostty-term precedent): the bezel theme is the
  // SHELL lock (own-before-ambient), not the axis' ambient-first law.
  // The theme lane forwards ambient, unadopted
  const d = $derived(
    TerminalHeaderDefaults.resolve({ theme, density, size, shape, radius, color, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, elevation, motion });
  const rootStyle = $derived(
    [carriers, style].filter(Boolean).join('; ') || undefined,
  );

  // scoped token class: dark (default lock) or jx-light (css-defined)
  // — the SHARED resolution (lib/terminal-scope: one law, one
  // implementation; the header and card no longer carry twin
  // effects). Held as the OBJECT: the watch's scope is a getter —
  // destructuring would copy the value once and kill reactivity
  const scopeWatch = watchTerminalScope(() => d.theme);

  // the mobile drawer's 0fr→1fr motion rides the rAF lane
  // (lib/disclosure-motion — the Chrome 146 clock-freeze receipt);
  // the atoms carry the endpoints, this lane interpolates. Mount =
  // resting state, no entrance frames
  let drawerEl = $state<HTMLElement | null>(null);
  let prevDrawerOpen: boolean | undefined;
  // $effect.pre: measure the OLD endpoint BEFORE the class flip —
  // with the css transition retired, the class change is instant,
  // and the post-update effect would read the FINAL state as the
  // motion's start; the .pre lane sees the pre-flip track, then the
  // frames' inline interpolation takes over past the flip
  $effect.pre(() => {
    const state = open;
    const el = drawerEl;
    if (prevDrawerOpen === undefined || !el) {
      prevDrawerOpen = state;
      return;
    }
    animateGridDisclosure(el, state);
    prevDrawerOpen = state;
  });

  let headerEl = $state<HTMLElement | null>(null);
  provideQueryAnchor(() => headerEl ?? null);

  /* -----------------------------------------------------------------
   * Navigation cleanup (consumers call this from their router hook —
   * SvelteKit onNavigate; the registry component stays app-agnostic).
   * Panels are no longer tracked by the header: whatever [popover]
   * surfaces the composed nav opened under this header get hidden by
   * DOM query, and the drawer resets. The bound open state flows to
   * the consumer synchronously, so its drawer-state reset effect runs
   * without lag.
   * --------------------------------------------------------------- */
  export function closeAll(): void {
    open = false;
    if (!headerEl) return;
    for (const panel of headerEl.querySelectorAll<HTMLElement>('[popover]')) {
      if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) {
        panel.hidePopover();
      }
    }
  }

  // crossing the sm breakpoint (rotate, resize) never carries nav state
  // across tiers — composed panels hide, the disclosure resets
  onMount(() => {
    const mobile = matchMedia('(max-width: 639.98px)');
    const onCross = () => closeAll();
    mobile.addEventListener('change', onCross);
    return () => mobile.removeEventListener('change', onCross);
  });

  // mobile drawer: Escape closes it while open and returns focus to the
  // hamburger (the fold itself rides the button's aria-expanded state)
  let burgerEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        open = false;
        burgerEl?.focus();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner, never a
  // raw class={styles.x} interpolation
  const cx = (
    // `object` (not a keyed shape): stylex's Theme products (the
    // same-map createTheme stamp) are branded interfaces with NO
    // index signature — their runtime truth IS the compiled styles
    // map ({<varGroupHash>: 'cls1 cls2', $$css: true}); the joiner
    // narrows by VALUE typeof, the parameter just admits the shape
    ...styles: (object | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : style === undefined
            ? ''
            : Object.entries(style ?? {}).flatMap(([key, value]) =>
                key !== '$$css' && typeof value === 'string' ? [value] : [],
              ).join(' '),
      )
      .join(' ');
</script>

<!-- isolate (stacking-isolation, 2026-09-09): the bezel's entries
     (z 1 over the backdrop-filter indicator) are this header's
     private rung — scoped in production by .jx-top-layer; standalone
     and in-demo uses keep the ladder private too -->
<header
  bind:this={headerEl}
  data-density={densityRungOf(d.density)}
  style={rootStyle}
  class={cn(
    'jx-nav',
    cx(thStyles.bezel),
    // cx(tokenScope): the same-map createTheme's theme class — in the
    // compile lane it lands as a styles OBJECT ({xbpgcew: 'xr8… xb…'}),
    // so it goes through THE joiner, never a raw .theme read (that's
    // the runtime-injection lane's shape). The class RE-DECLARES every
    // --jx-* member on THIS bezel, so the map re-resolves against the
    // bezel's own .dark cascade instead of :root's frozen light
    // literals (W4-r6: the lost dark-bezel regression)
    cx(tokenScope),
    scopeWatch.scope === 'dark' ? `dark ${cx(thStyles.schemeDark)}` : `jx-light ${cx(thStyles.schemeLight)}`,
    className,
  )}
  {...rest}
>
  <div class={cx(thStyles.shell)}>
    <!-- the chrome band rides the ROW, not the header root: the
         drawer below and the composed panels' surfaces stay on the
         density axis (control law), only the bar's controls follow
         the pointer-modality band -->
    <div data-jx-chrome="" class={cx(thStyles.row)}>
      <!-- LEFT WING · the brand -->
      <a href={homeHref} class={cx(thStyles.brandLink)}>
        {#if logo}
          <span class={cx(thStyles.logoSlot)}>
            {@render logo()}
          </span>
        {/if}
        <span class={cx(thStyles.brandCol)}>
          <span class={cx(thStyles.wordmark)}>
            {brand}
          </span>
          {#if domain}
            <span class={cx(thStyles.domain)}>{domain}</span>
          {/if}
          {#if subtitle}
            <span class={cx(thStyles.subtitle)}>
              {subtitle}
            </span>
          {/if}
        </span>
      </a>

      <!-- RIGHT WING · the nav pill slot + controls -->
      <div class={cx(thStyles.wing)}>
        <!-- the pill box: chrome the composed nav lands in (the nav
             landmark itself is the consumer's NavigationMenu root).
             The INDICATOR is the family's part, sunk here (2026-09-01):
             it measures against this box (the part's parent fallback),
             slides via WAAPI on the bezel curve, and morphs across
             pages through the preserved vt-nav-active name; the bezel
             paint — backdrop brightener, never a fill — rides the css
             key on the part's hook (the atom seam overrides through
             the class seam: transparent ground, square corners). The
             retired engine's 150ms ease-out opacity fade (appear/
             disappear) is restored through the same seam (B-8,
             2026-09-02 — "verbatim in behavior" made whole; the first
             placement stays instant: the fade only arms after the
             initial paint) -->
        <div
          class={cx(thStyles.pillBox)}
        >
          <NavigationMenuIndicator
            name="vt-nav-active"
            duration={450}
            easing="cubic-bezier(0.22, 1, 0.36, 1)"
            class={cx(thStyles.indicatorSeam)}
          />
          {@render children?.()}
        </div>
        <!-- frame law (walkthrough report, 2026-08-26): every bezel
             control cluster wears the SAME outer frame as the pill box
             (border + p-0.5 around the 32px chrome band = 38px outer),
             so the pill group, the switcher and the hamburger read as
             one aligned row -->
        {#if switcher}
          {#if switcherFrame}
            <div class={cx(thStyles.frame)}>
              {@render switcher()}
            </div>
          {:else}
            {@render switcher()}
          {/if}
        {/if}
        <span class={cx(thStyles.burgerWrap)}>
        <button
          type="button"
          class={cx(thStyles.burger)}
          aria-expanded={open}
          aria-label="Toggle navigation"
          bind:this={burgerEl}
          onclick={() => (open = !open)}
        >
          <span class="jx-bar {cx(thStyles.bar, thStyles.barMoving)}"></span>
          <span class={cx(thStyles.bar)}></span>
          <span class="jx-bar {cx(thStyles.bar, thStyles.barMoving)}"></span>
        </button>
        </span>
      </div>
    </div>

    <!-- mobile drawer: the consumer's drawer snippet stacked below the
         bar; the inner scroller bounds it to the viewport so every link
         stays reachable -->
    <div
      bind:this={drawerEl}
      class={cn(cx(thStyles.drawer), open && cx(thStyles.drawerOpen))}
    >
      <div class={cx(thStyles.drawerClip)}>
        <div
          data-jx-mobile-scroll
          class={cx(thStyles.drawerScroll)}
        >
          {@render drawer?.()}
        </div>
      </div>
    </div>
  </div>
</header>
