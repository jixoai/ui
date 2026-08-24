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

  tw4 (2026-08-24): trigger/caret/scroll paint as token utilities (the
  press poses ride --jx-press* custom-property utilities, verbatim
  law); dropdown-menu.css keeps ONLY what utilities cannot express —
  the caret's :has()+:popover-open flip, the item hover/[aria-current]/
  focus-visible state machines (aria-current is set imperatively by
  this root on ANY [role=menuitem], including raw consumer items), the
  anchored panel law (@supports fallback), and ::backdrop.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy, setContext } from 'svelte';
  import { cn } from '$lib/utils';
  import './dropdown-menu.css';

  interface Props {
    id: string;
    /** trigger button label (ignored when `trigger` snippet given) */
    triggerLabel?: string;
    placement?: 'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start';
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    trigger?: Snippet;
    panelClass?: string;
    onToggle?: (open: boolean) => void;
    children: Snippet;
  }

  let {
    id,
    triggerLabel = '',
    placement = 'bottom-end',
    variant = 'auto',
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

<span bind:this={anchorEl} class="jx-menu-anchor inline-flex" style="anchor-name: {anchorName}">
  {#if trigger}
    {@render trigger()}
  {:else}
    <button
      type="button"
      data-jx-menu-trigger=""
      class="jx-press inline-flex cursor-pointer items-center gap-2.5 border border-border bg-background px-3.5 py-2.5 font-sans text-sm font-medium text-foreground [--jx-press-shadow:var(--shadow-xs)] [--jx-press-shadow-hover:var(--shadow-sm)] [--jx-press-shadow-active:var(--shadow-sm-press)] hover:bg-muted"
      popovertarget={id}
      bind:this={triggerEl}
      aria-haspopup="menu"
    >
      {triggerLabel}
      <svg
        class="jx-menu-caret h-[13px] w-[13px] flex-none transition-transform duration-150 ease-out"
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
  class={cn('jx-menu jx-surface', panelClass)}
  data-variant={variant}
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={onPanelToggle}
  onkeydown={handleKeydown}
>
  <!-- surface body (fill + acrylic blur + the ::after shadow layer) +
       scroll ring (floating-surface law arch r3: the platform element
       paints nothing) -->
  <div data-jx-menu-body="" class="jx-surface-body">
    <div
      data-jx-menu-scroll=""
      class="max-h-[72vh] overflow-auto [scrollbar-gutter:stable_both-edges] [padding:var(--jx-menu-pad,4px)] [padding-inline:max(var(--jx-menu-pad,4px)-var(--jx-scrollbar-thin,0px),0px)]"
    >
      {@render children()}
    </div>
  </div>
</div>
