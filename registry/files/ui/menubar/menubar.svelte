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
-->
<script module lang="ts">
  /** imperative panel surface — registered at INIT under the PANEL id */
  export interface MenubarPanelHandles {
    show(source?: HTMLElement): void;
    hide(): void;
  }

  /** the bar's context surface: state + behavior, never membership order */
  export interface MenubarApi {
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
    readonly variant: 'solid' | 'acrylic' | 'auto';
  }

  /** context key — global symbol registry so the family files stay
   *  independent registry items */
  export const MENUBAR_KEY = Symbol.for('jx-menubar');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { cn } from '$lib/utils';
  import './menubar.css';

  interface Props {
    /** menubar landmark label — announced to assistive tech */
    label?: string;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    class?: string;
    children: Snippet;
  }

  let {
    label = 'menu bar',
    variant = 'auto',
    class: className = '',
    children,
  }: Props = $props();

  const dev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

  let barEl = $state<HTMLElement | null>(null);
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
      return variant;
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
  class={cn(
    'flex w-fit list-none flex-wrap items-stretch border border-border bg-card p-0 m-0 shadow-2xs',
    className,
  )}
  role="menubar"
  aria-label={label}
  onkeydown={handleBarKeydown}
>
  {@render children()}
</ul>
