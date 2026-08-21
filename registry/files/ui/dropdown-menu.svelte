<!--
  jixoai dropdown menu — the ROOT half (registry/files/ui/dropdown-menu.svelte).
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
  registration). Separators are plain <hr>, labels plain markup — the
  W3C elements already mean the right things.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy, setContext } from 'svelte';

  interface Props {
    id: string;
    /** trigger button label (ignored when `trigger` snippet given) */
    triggerLabel?: string;
    placement?: 'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start';
    trigger?: Snippet;
    panelClass?: string;
    onToggle?: (open: boolean) => void;
    children: Snippet;
  }

  let {
    id,
    triggerLabel = '',
    placement = 'bottom-end',
    trigger,
    panelClass = '',
    onToggle,
    children,
  }: Props = $props();

  // id is mount-stable by contract (popover ids + CSS anchors are wired
  // once); $derived keeps the anchor name truthful if it ever flips
  const anchorName = $derived(`--jx-menu-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const area = $derived(
    placement === 'bottom' ? 'bottom'
    : placement === 'bottom-end' ? 'bottom span-right'
    : placement === 'bottom-start' ? 'bottom span-left'
    : placement === 'top' ? 'top'
    : placement === 'top-end' ? 'top span-right'
    : 'top span-left'
  );

  let panel = $state<HTMLElement | null>(null);
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
  const menuItems = () =>
    [...(panel?.querySelectorAll<HTMLElement>('[role=menuitem]:not([disabled])') ?? [])];

  let typed = '';
  let typedAt = 0;

  function focusItem(items: HTMLElement[], next: HTMLElement): void {
    next.focus();
    // keep the roving state visible to CSS (hover highlight follows)
    items.forEach((item) => item.removeAttribute('aria-current'));
    next.setAttribute('aria-current', 'true');
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
  });

  function onPanelToggle(): void {
    open = panel?.matches(':popover-open') ?? false;
    triggerEl?.setAttribute('aria-expanded', String(open));
    onToggle?.(open);
    if (open) {
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => {
        // the panel may already be closing again (fast Escape) — never
        // steal focus into a closed menu
        if (!panel?.matches(':popover-open')) return;
        const items = menuItems();
        if (items[0]) focusItem(items, items[0]);
      });
    } else {
      cancelAnimationFrame(focusFrame);
      if (restoreFocus) triggerEl?.focus();
      restoreFocus = false;
    }
  }
</script>

<span bind:this={anchorEl} class="jx-menu-anchor" style="anchor-name: {anchorName}">
  {#if trigger}
    {@render trigger()}
  {:else}
    <button
      type="button"
      class="jx-menu-trigger"
      popovertarget={id}
      bind:this={triggerEl}
      aria-haspopup="menu"
    >
      {triggerLabel}
      <svg
        class="jx-menu-caret"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  {/if}
</span>

<div
  {id}
  popover="auto"
  role="menu"
  tabindex="-1"
  class="jx-menu {panelClass}"
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={onPanelToggle}
  onkeydown={handleKeydown}
>
  {@render children()}
</div>

<style>
  .jx-menu-anchor {
    display: inline-flex;
  }
  .jx-menu-trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 500;
    color: var(--foreground);
    border: 1px solid var(--border);
    background: var(--background);
    box-shadow: var(--shadow-xs);
    cursor: pointer;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      background-color 150ms ease-out;
  }
  .jx-menu-trigger:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-sm);
    background: var(--muted);
  }
  .jx-menu-trigger:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }
  .jx-menu-caret {
    width: 13px;
    height: 13px;
    flex: none;
    transition: transform 150ms ease-out;
  }
  .jx-menu-anchor:has(+ .jx-menu:popover-open) .jx-menu-caret {
    transform: rotate(180deg);
  }

  .jx-menu {
    position: fixed;
    margin: var(--jx-menu-gap, 8px);
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    position-try: flip-block, flip-inline, flip-block flip-inline;
    position-visibility: anchors-visible;
    width: fit-content;
    min-width: 11rem;
    height: fit-content;
    max-height: 72vh;
    overflow: auto;
    padding: 4px;
    font-size: 13px;
    color: var(--popover-foreground);
    border: 1px solid var(--border);
    background: var(--popover);
    box-shadow: var(--shadow);
  }
  @supports not (anchor-name: --jx-menu-fallback) {
    .jx-menu {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
    }
  }
  .jx-menu::backdrop {
    background: transparent;
  }
</style>
