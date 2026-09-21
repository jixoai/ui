<!--
  jixoai dropdown menu — the ROOT half (registry/files/ui/dropdown-menu/dropdown-menu.svelte).
  The ARIA menu pattern on the popover.svelte laws: a native popover="auto"
  panel (light dismiss, Escape, one-at-a-time, top layer — all browser),
  CSS Anchor Positioning for placement (zero JS geometry), plus the menu
  keyboard contract the platform does not ship:

    open        → the FIRST item receives focus (not the trigger)
    ↑/↓         → walk items, wrapping; Home/End jump the ends
    typeahead   → printable chars jump to the next matching item
                  (500ms buffer; wraps around once)
    Enter/Space → the focused item's native click — selection is the
                  item's own business (dropdown-menu-item closes the panel)
    Escape      → native popover close, THEN focus returns to the trigger
    Tab         → leaves; popover=auto light-dismisses natively
    close       → focus returns to the trigger ONLY when it was inside
                  the panel (Escape/selection). A light-dismiss click
                  keeps focus where the user clicked — never stolen.

  Items are whatever the consumer nests: dropdown-menu-item.svelte pairs
  here, but any [role=menuitem] joins the walk (DOM delegation, no
  registration) — SCOPED to this panel's nearest menu (nested submenu
  families never leak; 2026-08-25 drive-by). Separators are plain <hr>,
  labels plain markup — the W3C elements already mean the right things.

  tw4 (2026-08-24): trigger/caret/scroll paint as token utilities (the
  press poses ride --jx-press* custom-property utilities, verbatim
  law); dropdown-menu.css keeps ONLY what utilities cannot express —
  the caret's :has()+:popover-open flip, the item hover/[data-walk-
  active]/focus-visible state machines (the walk's highlight is a
  paint-only data attribute authored imperatively by this root on ANY
  [role=menuitem], including raw consumer items — it never touches
  aria-current; a static aria-current on an item is consumer
  semantics, D-5 2026-09-02), the anchored panel law (@supports
  fallback), and ::backdrop.

  Motion kernel (2026-08-25): the panel adopts the shared surface
  motion kernel (lib/surface-motion.ts, popover wiring verbatim) —
  the toggle seam drives play/startTracking/stopTracking, .jx-waapi
  opts into the jixoai.css formulas, and the real shadow rides a DOM
  child (data-jx-menu-shadow) the kernel animates in lockstep.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy, setContext } from 'svelte';
  import { provideDensity, resolveDensity, getDensityContext } from '$lib/density.svelte';
  import Icon from '$lib/ui/icon';
  import { createSurfaceMotion } from '$lib/surface-motion';
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
  import { DropdownMenuDefaults, type DropdownMenuSurfaceVariant } from './dropdown-menu-defaults.svelte';
  import { dropdownMenuStyles } from './dropdown-menu.stylex';
  import './dropdown-menu.css';

  interface Props {
    id: string;
    density?: DensityLane | QueryResult<DensityLane>;
    /** trigger button label (ignored when `trigger` snippet given) */
    triggerLabel?: string;
    placement?: 'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start';
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: DropdownMenuSurfaceVariant;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size — an explicit lane
     *  makes the menu the CONCENTRIC ANCHOR; auto consumes the
     *  broadcast against the panel's own ancestors */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() — the consumption pair composes the theme's level
     *  table (shadow recipe + the PAIRED ladder-rung surface); own
     *  level2 = the menu panel's historic z-feel (3dp, M3's menu
     *  rung) */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    trigger?: Snippet;
    panelClass?: string;
    onToggle?: (open: boolean) => void;
    children: Snippet;
  }

  let {
    id,
    density,
    triggerLabel = '',
    placement = 'bottom-end',
    variant,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    trigger,
    panelClass = '',
    onToggle,
    children,
  }: Props = $props();

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // The CAPTURE is load-bearing and EAGER (r11 first contract,
  // context-defaults-economy 3.3): getDensityContext() rides the
  // $derived.by ARGUMENT subtree, which evaluates at this statement —
  // BEFORE provideDensity writes the key — so it captures the PARENT's
  // context object; a lazily-evaluated read would resolve the key to
  // the menu's OWN write and self-reference through the very getter it
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
  // the menu's own write, whose getter is the captured-parent
  // resolution above, so the chain TERMINATES; variant resolves
  // through the literal slot (own 'auto' declared in
  // DropdownMenuDefaults); the menu's own elevation level2 rides the
  // same record (the §7 historic z-feel mapping)
  const d = $derived(
    DropdownMenuDefaults.resolve({ density, variant, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp + the broadcast supply + the query() anchor
  // (PORTAL LAW, W3-C: the carriers stamp the PANEL — the promoted
  // root is self-carried). The universal density supply rides the
  // bridged provideDensity write above; this supply carries the other
  // seven axes downward
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ size, shape, radius, color, theme, elevation, motion });
  // §3/§14 radius consumption (the fallback is the auto concentric
  // form verbatim — the root sheet's invariants close it)
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : '--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1))',
  );
  // §7's consumption pair + the solid-fill bridge
  const elevationConsumed = $derived(elevationSurfaceOf(d.elevation));

  // id is mount-stable by contract (popover ids + CSS anchors are wired
  // once); $derived keeps the anchor name truthful if it ever flips
  const anchorName = $derived(`--jx-menu-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  // SPAN SEMANTICS (W5 sweep, 2026-09-15 — spec-true position-area,
  // the popover.svelte law): position-area names the region the
  // SURFACE occupies relative to its anchor — `bottom span-right`
  // puts the panel below the anchor, START-aligned (spanning from
  // the anchor's inline-start edge rightward: left edges together),
  // `bottom span-left` END-aligns (right edges together). The map
  // pairs each logical placement with the span that MEASURES as its
  // intended alignment (*-start → span-right, *-end → span-left);
  // the pre-sweep table encoded the inverted model. ONE table feeds
  // BOTH emissions below (position-area + the legacy inset-area
  // alias) — no divergence between the channels
  const area = $derived(
    placement === 'bottom' ? 'bottom'
    : placement === 'bottom-start' ? 'bottom span-right'
    : placement === 'bottom-end' ? 'bottom span-left'
    : placement === 'top' ? 'top'
    : placement === 'top-start' ? 'top span-right'
    : 'top span-left'
  );

  let panel = $state<HTMLElement | null>(null);
  provideQueryAnchor(() => panel ?? null);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let anchorEl = $state<HTMLElement | null>(null);
  let open = $state(false);
  // the queued focus-first-item frame — cancelled on close so a fast
  // Escape can never let a stale frame steal focus back (Codex r1)
  let focusFrame: number | undefined;

  /** custom triggers render inside the anchor wrapper; adopt their
   *  popovertarget button for aria mirroring + focus restoration
   *  (the DEFAULT trigger binds itself directly on the button) */
  $effect(() => {
    if (trigger && anchorEl) {
      triggerEl = anchorEl.querySelector(`[popovertarget="${id}"]`) as HTMLButtonElement | null;
    }
  });

  /** context surface for dropdown-menu-item: selection closes the menu
   *  with focus restored to the trigger (APG selection contract) */
  setContext(Symbol.for('jx-dropdown-menu'), {
    closeAndRestore(): void {
      restoreFocus = true;
      if (
        panel &&
        typeof panel.hidePopover === 'function' &&
        panel.matches(':popover-open')
      ) {
        panel.hidePopover();
      }
    },
  });

  // ---- the menu keyboard contract (see header) -----------------------
  // SCOPED to the nearest menu (composition-first-apis, 2026-08-25):
  // only entries whose closest [role=menu] is THIS panel — a nested
  // dropdown/submenu family inside the panel owns its own walk and
  // never leaks into this one (the family context contract, clause 3)
  const menuItems = () =>
    [...(panel?.querySelectorAll<HTMLElement>('[role=menuitem]:not([disabled])') ?? [])].filter(
      (el) => el.closest('[role="menu"]') === panel,
    );

  let typed = '';
  let typedAt = 0;

  function focusItem(items: HTMLElement[], next: HTMLElement): void {
    next.focus();
    // keep the roving state visible to CSS (hover highlight follows).
    // data-walk-active is a PAINT-ONLY hook (adjudicated D-5 fix,
    // 2026-09-02): the walk must never touch aria-current — a static
    // aria-current="page" on a raw item (the breadcrumb dropdown) is
    // consumer semantics Svelte will not re-render once imperatively
    // removed. APG's "current" token stays the author's decision.
    items.forEach((item) => item.removeAttribute('data-walk-active'));
    next.setAttribute('data-walk-active', '');
  }

  // ---- the toggle seam: open focuses item 1, close restores focus -----
  // focus restore is an explicit decision, not a heuristic: Escape and
  // item selection mark `restoreFocus` before the close; a light-dismiss
  // click never does, so the user's focus stays where they put it
  let restoreFocus = false;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') restoreFocus = true;
    const items = menuItems();
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next =
        current === -1
          ? event.key === 'ArrowDown' ? items[0] : items.at(-1)!
          : items[(current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
      focusItem(items, next);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusItem(items, event.key === 'Home' ? items[0] : items.at(-1)!);
      return;
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = Date.now();
      typed = now - typedAt > 500 ? event.key : typed + event.key;
      typedAt = now;
      const from = Math.max(current, 0);
      const match =
        items
          .slice(from + 1)
          .find((item) => item.textContent?.toLowerCase().startsWith(typed)) ??
        items.find((item) => item.textContent?.toLowerCase().startsWith(typed));
      if (match) {
        event.preventDefault();
        focusItem(items, match);
      }
    }
  }

  // the queued focus frame must not outlive the component (Codex r2);
  // rAF is a browser global — onDestroy also fires during SSR destroys
  onDestroy(() => {
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(focusFrame);
    panelMotion.destroy();
  });

  function onPanelToggle(): void {
    open = panel?.matches(':popover-open') ?? false;
    triggerEl?.setAttribute('aria-expanded', String(open));
    onToggle?.(open);
    if (open) {
      panelMotion.play(1);
      panelMotion.startTracking();
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => {
        // the panel may already be closing again (fast Escape) — never
        // steal focus into a closed menu
        if (!panel?.matches(':popover-open')) return;
        const items = menuItems();
        if (items[0]) focusItem(items, items[0]);
      });
    } else {
      panel?.classList.remove('jx-rest');
      panelMotion.play(0);
      panelMotion.stopTracking();
      cancelAnimationFrame(focusFrame);
      if (restoreFocus) triggerEl?.focus();
      restoreFocus = false;
    }
  }

  // ── MOTION KERNEL — the shared declarative half (r29): see
  // lib/surface-motion.ts. WAAPI animates ONE @property number
  // (--jx-p); every visible property is a CSS formula of it (the
  // declarative motion law in jixoai.css). The kernel here only wires
  // the menu's toggle seam and the live anchor wrapper
  const panelMotion = createSurfaceMotion(() => panel, { anchor: () => anchorEl });

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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<span bind:this={anchorEl} data-density={densityRungOf(d.density)} class={cn('jx-menu-anchor', cx(dropdownMenuStyles.anchor))} style="anchor-name: {anchorName}">
  {#if trigger}
    {@render trigger()}
  {:else}
    <button
      type="button"
      data-jx-menu-trigger=""
      class={cn('jx-menu-trigger jx-press', cx(dropdownMenuStyles.trigger))}
      popovertarget={id}
      bind:this={triggerEl}
      aria-haspopup="menu"
    >
      {triggerLabel}
      <!-- jx-menu-caret rides the wrapper: dropdown-menu.css flips it via
           :has() + :popover-open; the glyph is the Icon component's
           chevronDown, sized and re-stroked through its props -->
      <span class={cn('jx-menu-caret', cx(dropdownMenuStyles.caret))}>
        <Icon name="chevronDown" size={13} strokeWidth={2.5} />
      </span>
    </button>
  {/if}
</span>

<div
  {id}
  popover="auto"
  role="menu"
  tabindex="-1"
  class={cn('jx-menu jx-surface', panelMotion.supported && 'jx-waapi', panelClass)}
  data-variant={d.variant}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  bind:this={panel}
  style={[
    carriers,
    radiusConsumed,
    elevationConsumed,
    `position-anchor: ${anchorName}`,
    `inset-area: ${area}`,
    `position-area: ${area}`,
  ]
    .filter(Boolean)
    .join('; ')}
  ontoggle={onPanelToggle}
  onkeydown={handleKeydown}
>
  <!-- surface body (fill + acrylic blur + the ::after shadow layer) +
       scroll ring (floating-surface law arch r3: the platform element
       paints nothing) -->
  <div data-jx-menu-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from WAAPI — the kernel animates it in lockstep -->
  <div data-jx-menu-body="" class="jx-surface-body">
    <div
      data-jx-menu-scroll=""
      class={cx(dropdownMenuStyles.scroll)}
    >
      {@render children()}
    </div>
  </div>
</div>
