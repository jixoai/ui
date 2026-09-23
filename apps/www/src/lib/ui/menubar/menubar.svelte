<!--
  jixoai menubar — the ROOT half (registry/files/ui/menubar/menubar.svelte).
  The application menu bar — File Edit View… — with its OWN walker
  (batch-4 ruling): the top-level keyboard contract differs from a
  stack of dropdowns, so this is an independent coordinator over the
  popover laws (popover=manual panels — WE own dismissal: document
  pointerdown outside-check + panel Escape; auto light-dismiss raced
  the trigger click):

    ←/→          move between top-level triggers (panels follow an
                 open bar — glide behavior)
    ↓ / Enter    open the trigger's panel, focus its first item
    ↑            opens too (menubar convention both ways)
    Home/End     first/last trigger
    Escape       close the panel, focus back on its trigger
    panel items  ↓/↑/Home/End walk + wrap (the menu contract shared
                 with dropdown-menu — duplicated deliberately: registry
                 items stay independent, no hidden coupling)

  Composition-first (2026-08-25, composition-first-apis): the bar owns
  STATE + BEHAVIOR only — open-panel id, the roving tab stop, the
  walkers, the document dismissal — never membership ORDER. Triggers
  and panels are discovered through the DOM (the family context
  contract): the bar's walk queries [role=menuitem] scoped to entries
  whose closest [role=menubar] is THIS bar and whose closest [role=menu]
  is null, so panel content and nested dropdown-menu families never
  leak into the bar walk; the glide resolves a trigger → panel through
  its aria-controls (the deterministic derived id is the registry key).

  Panel handles (imperative show/hide for the glide and the trigger
  toggle) register at Panel INIT under the PANEL id (`${itemId}-panel`,
  NEVER the registrant's own $props.id()) and unregister onDestroy;
  first registration wins on duplicate panel ids AND duplicate
  sanitized anchor names (dev-mode console error — a collision is
  observable exactly there). A conditionally removed panel leaves no
  ghost handle behind.

  tw4 (2026-08-24): bar/trigger paint as token utilities; ONLY the
  anchored panel law (position-try geometry, the @supports
  viewport-center fallback, ::backdrop) remains in menubar.css —
  D1-exempt residue.
  (props-discipline sweep, 2026-08-25)
-->
<script module lang="ts">
  import type { MenubarSurfaceVariant } from './menubar-defaults.svelte';

  /** imperative panel surface — registered at INIT under the PANEL id */
  export interface MenubarPanelHandles {
    show(source?: HTMLElement): void;
    hide(): void;
  }

  /** the bar's context surface: state + behavior, never membership order */
  export interface MenubarApi {
    readonly density: import('$lib/density.svelte').Density | undefined;
    /** first-wins registry for the glide/toggle; key = `${itemId}-panel` */
    register(panelId: string, anchorName: string, handles: MenubarPanelHandles): void;
    /** identity-guarded: only the winning registrant can remove itself */
    unregister(panelId: string, handles: MenubarPanelHandles): void;
    /** the open panel's derived id ('' = closed) */
    readonly openPanelId: string;
    /** the roving tab stop: trigger id ('' = unresolved — see below) */
    readonly tabStop: string;
    setTabStop(triggerId: string): void;
    /** open/close through the registered handles (toggle + glide paths) */
    openPanel(panelId: string, focusFirst: boolean): void;
    closePanel(panelId: string): void;
    /** the popover toggle seam's state mirror (panels report here) */
    markOpen(panelId: string): void;
    markClosed(panelId: string): void;
    /** floating-surface variant for every panel in the bar */
    readonly variant: MenubarSurfaceVariant;
  }

  /** context key — global symbol registry so the family files stay
   *  independent registry items */
  export const MENUBAR_KEY = Symbol.for('jx-menubar');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { provideDensity, resolveDensity, getDensityContext } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import {
    densityRungOf,
    elevationSurfaceOf,
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
  import { MenubarDefaults, type MenubarSurfaceVariant } from './menubar-defaults.svelte';
  import { menubarStyles } from './menubar.stylex';
  import './menubar.css';

  interface Props extends Omit<HTMLAttributes<HTMLUListElement>, 'color'> {
    density?: DensityLane | QueryResult<DensityLane>;
    /** menubar landmark label — announced to assistive tech */
    label?: string;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: MenubarSurfaceVariant;
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
     *  query() — the consumption pair composes the theme's level
     *  table (shadow recipe + the PAIRED ladder-rung surface); own
     *  level2 = the bar's floating panel's historic z-feel (3dp, the
     *  menu rung — the BAR itself is chrome, never elevated) */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
    children: Snippet;
  }

  let {
    label = 'menu bar',
    density,
    variant,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style = '',
    children,
    ...rest
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

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // The CAPTURE is load-bearing and EAGER (r11 first contract,
  // context-defaults-economy 3.3): getDensityContext() rides the
  // $derived.by ARGUMENT subtree, which evaluates at this statement —
  // BEFORE provideDensity writes the key — so it captures the PARENT's
  // context object; a lazily-evaluated read would resolve the key to
  // the bar's OWN write and self-reference through the very getter it
  // feeds (derived_references_self — the pre-3.3 bare capture this
  // replaces). The returned getter reads ONLY the captured object.
  // The W3 universal lane narrows at the legacy edge (the input-group
  // law): 'auto'/number/query lanes carry no legacy rung — the rung
  // stays ambient (§4), the coefficient rides the carriers on the root
  const legacyDensityLane = $derived(
    typeof density === 'string' && density !== 'auto' ? density : undefined,
  );
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(legacyDensityLane, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3 + W3-C),
  // riding ON TOP of the provider lane as the family's single audited
  // read point: the density slot's ambient read resolves the key to
  // the bar's own write, whose getter is the captured-parent
  // resolution above, so the chain TERMINATES; variant resolves
  // through the literal slot (own 'auto' declared in MenubarDefaults);
  // the panel's own elevation level2 rides the same record
  const d = $derived(
    MenubarDefaults.resolve({ density, variant, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp + the broadcast supply + the query() anchor
  // (the bar root's ANCESTORS are the candidate containers). The
  // universal density supply rides the bridged provideDensity write
  // above; this supply carries the other seven axes downward — the
  // PANEL (a top-layer promotion) reads them through the Svelte
  // context, which follows the COMPONENT tree, never the promotion
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ size, shape, radius, color, theme, elevation, motion });
  // §3/§14 radius consumption (the fallback is the auto concentric
  // form verbatim — the root sheet's invariants close it)
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : '--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1))',
  );
  // §7's consumption pair + the solid-fill bridge (rides the bar root;
  // the PANEL reads it through the context supply — the promotion is
  // paint, not DOM)
  const elevationConsumed = $derived(elevationSurfaceOf(d.elevation));
  const rootStyle = $derived([carriers, radiusConsumed, elevationConsumed, style].filter(Boolean).join('; ') || undefined);

  const dev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

  let barEl = $state<HTMLElement | null>(null);
  provideQueryAnchor(() => barEl ?? null);
  let openPanelId = $state('');
  /** the roving tab stop FOLLOWS arrow focus; '' = unresolved (the
   *  empty-state law: every trigger renders tabbable until the bar
   *  trims to one after mount — the tabs-list precedent) */
  let tabStop = $state('');
  /** panel id marking "just opened by keyboard — focus its first item" */
  let focusIntoId = $state('');

  // ── the panel registry: first-wins on BOTH keys (panel id and the
  //    sanitized anchor name — `foo/bar` vs `foo?bar` both → `foo-bar`
  //    collide on the anchor while carrying distinct DOM ids). Later
  //    registrants are ignored and their handles never fire.
  const panels = new Map<string, MenubarPanelHandles>();
  const anchors = new Map<string, string>();

  setContext<MenubarApi>(MENUBAR_KEY, {
    get density() {
      return resolvedDensity;
    },
    register(panelId, anchorName, handles) {
      if (panels.has(panelId) || anchors.has(anchorName)) {
        if (dev) {
          console.error(
            `jixoai menubar: duplicate registration — panel id "${panelId}" / anchor name "${anchorName}" already claimed; first registration wins`,
          );
        }
        return;
      }
      panels.set(panelId, handles);
      anchors.set(anchorName, panelId);
    },
    unregister(panelId, handles) {
      if (panels.get(panelId) !== handles) return;
      panels.delete(panelId);
      for (const [anchorName, owner] of anchors) {
        if (owner === panelId) anchors.delete(anchorName);
      }
    },
    get openPanelId() {
      return openPanelId;
    },
    get tabStop() {
      return tabStop;
    },
    setTabStop(triggerId) {
      tabStop = triggerId;
    },
    openPanel(panelId, focusFirst) {
      panels.get(panelId)?.show();
      openPanelId = panelId;
      if (focusFirst) focusIntoId = panelId;
    },
    closePanel(panelId) {
      panels.get(panelId)?.hide();
      if (openPanelId === panelId) openPanelId = '';
    },
    markOpen(panelId) {
      openPanelId = panelId;
    },
    markClosed(panelId) {
      if (openPanelId === panelId) openPanelId = '';
    },
    get variant() {
      return d.variant;
    },
  });

  /** the BAR's walk scope: menuitems directly under this menubar —
   *  not inside any [role=menu] panel (menubar panels AND nested
   *  dropdown families) and not inside a nested menubar */
  function barTriggers(): HTMLButtonElement[] {
    return [
      ...(barEl?.querySelectorAll<HTMLButtonElement>('[role=menuitem]:not([disabled])') ?? []),
    ].filter(
      (el) => el.closest('[role="menubar"]') === barEl && el.closest('[role="menu"]') === null,
    );
  }

  /** panels are popover=manual: WE own dismissal (popover=auto's light
   *  dismiss raced the trigger click — outside-close then click-reopen
   *  read as "toggle broken"; Escape is handled in the panel keydown) */
  function handleDocPointerDown(event: PointerEvent): void {
    if (openPanelId === '') return;
    const target = event.target as Node | null;
    const panel = document.getElementById(openPanelId);
    const trigger = barTriggers().find((t) => t.getAttribute('aria-controls') === openPanelId);
    if (panel && target && !panel.contains(target) && !(trigger && trigger.contains(target))) {
      panels.get(openPanelId)?.hide();
      openPanelId = '';
    }
  }

  function handleBarKeydown(event: KeyboardEvent): void {
    const bars = barTriggers();
    const current = bars.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const move = (delta: number): void => {
      event.preventDefault();
      const nextIndex = (current + delta + bars.length) % bars.length;
      const next = bars[nextIndex];
      tabStop = next?.id ?? '';
      next?.focus();
      if (openPanelId !== '') {
        // the glide resolves trigger → panel through aria-controls (the
        // deterministic derived id — the wire never depends on order)
        const nextPanelId = next?.getAttribute('aria-controls');
        if (nextPanelId) {
          const closing = openPanelId;
          panels.get(closing)?.hide();
          if (openPanelId === closing) openPanelId = '';
          // gliding with a panel open keeps the FOCUS INSIDE the panels
          // (consistent with ↓-open, per the walkthrough note)
          panels.get(nextPanelId)?.show();
          openPanelId = nextPanelId;
          focusIntoId = nextPanelId;
        }
      }
    };
    if (event.key === 'ArrowRight') return move(1);
    if (event.key === 'ArrowLeft') return move(-1);
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : bars.length - 1;
      tabStop = bars[index]?.id ?? '';
      bars[index]?.focus();
      return;
    }
    const ownPanelId = bars[current]?.getAttribute('aria-controls');
    if (
      (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter') &&
      ownPanelId
    ) {
      event.preventDefault();
      panels.get(ownPanelId)?.show();
      openPanelId = ownPanelId;
      focusIntoId = ownPanelId;
    }
  }

  // trim the empty-state tab stop after mount ('' → first trigger) and
  // re-resolve when the focused trigger disappears (keyed reorders keep
  // their stop while it survives)
  $effect(() => {
    if (!barEl) return;
    const stops = barTriggers();
    if (tabStop === '' || !stops.some((t) => t.id === tabStop)) {
      tabStop = stops[0]?.id ?? '';
    }
  });

  // focus the first item of a keyboard-opened panel once it is open
  $effect(() => {
    if (focusIntoId === '') return;
    const targetId = focusIntoId;
    requestAnimationFrame(() => {
      if (typeof requestAnimationFrame === 'function') {
        const menu = document.getElementById(targetId);
        const first = [
          ...(menu?.querySelectorAll<HTMLElement>('[role=menuitem]:not([disabled])') ?? []),
        ].find((el) => el.closest('[role="menu"]') === menu);
        first?.focus();
      }
      focusIntoId = '';
    });
  });
</script>

<svelte:document onpointerdown={handleDocPointerDown} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_interactive_supports_focus -- the
     bar hosts the menubar walk; its BUTTONS hold the roving tabindex,
     the bar itself is never a tab stop -->
<ul
  bind:this={barEl}
  data-jx-menubar=""
  class={cn(cx(menubarStyles.bar), className)}
  {...rest}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  role="menubar"
  aria-label={label}
  onkeydown={handleBarKeydown}
>
  {@render children()}
</ul>
