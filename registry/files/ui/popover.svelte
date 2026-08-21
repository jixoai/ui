<!--
  jixoai popover (registry/files/ui/popover.svelte).

  NativeHTML base (2026-08-20): the Popover API — `popover="auto"` on the
  panel plus a trigger button wired declaratively through `popovertarget`.
  Light dismiss (outside click / focus loss), Escape, aria-expanded on the
  trigger, one-auto-popover-at-a-time, and top-layer rendering are all
  browser-native. The component ships ZERO script — markup and styling
  only.

  Anchored placement (2026-08-21, Owner ruling): the panel anchors to the
  trigger through the CSS Anchor Positioning API — `anchor-name` on the
  wrapper, `position-anchor` + `position-area` on the panel (both the
  current name and its `inset-area` legacy alias are set inline; Chrome
  127+ dropped the old name, older engines ignore the new one), plus native
  `position-try`/`position-try-fallbacks` flipping (block/inline — the
  MDN-recommended shorthand ships alongside the longhand) and
  `position-visibility: anchors-visible` so a panel whose anchor scrolled
  away hides instead of floating stale. Declarative CSS
  positioning replaces every line of JS geometry: no measure-and-replace,
  so the panel cannot jitter on open. Engines without anchor positioning
  fall back to authored viewport-center (inset + margin:auto) — the same
  visual as v1, never worse.

  Props:
    id            popover id; popovertarget association + anchor name
    triggerLabel  trigger button label (ignored when `trigger` snippet given)
    placement     anchored inset-area: 'bottom' | 'bottom-end' | 'top' |
                  'top-end' | 'top-start' | 'bottom-start' (default
                  'bottom-end' — under the trigger, right edges aligned)
    trigger?      custom trigger snippet: render your own control inside;
                  the wrapper still carries anchor-name, so anchoring stays
                  component-owned. With anything other than a real
                  <button popovertarget={id}> you drive open/close through
                  the imperative handle.
    panelClass?   classes appended to the panel (consumer panel law: width,
                  grid, tokens — never anchoring)
    onToggle?     mirrors the panel's native toggle event; the ONLY
                  open-state source of truth for aria-expanded mirroring
    bind:this     optional imperative handle: show()/hide()/toggle() call
                  the native popover methods (no-op without the Popover
                  API). Exceptional-trigger escape hatch (link triggers,
                  hover intent) — NOT a controlled state model: no open
                  prop, no timers, no coordinates.
  Side selection (2026-08-22, Owner mobile feedback): the side is chosen
  ONCE, at open, by the native position-try fallbacks — never re-evaluated
  while open. The earlier JS bridge (rAF scroll listener picking between
  the two authored areas) is removed: it never ran at open (stale side
  across reopens) and on mobile it fought the engine plus URL-bar resize
  events, which read as direction inversion and visible jitter. Chromium's
  "no try re-evaluation on nested-scroller scroll" behavior is now
  load-bearing: the side stays locked for the popover's lifetime, and
  `position-visibility: anchors-visible` hides the panel once the anchor
  itself scrolls out of view. Zero runtime script, as authored.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    id: string;
    triggerLabel: string;
    placement?: 'bottom' | 'bottom-end' | 'top' | 'top-end' | 'top-start' | 'bottom-start';
    trigger?: Snippet;
    panelClass?: string;
    onToggle?: (open: boolean) => void;
    children: Snippet;
  }

  let {
    id,
    triggerLabel,
    placement = 'bottom-end',
    trigger,
    panelClass = '',
    onToggle,
    children,
  }: Props = $props();

  // Anchor names are CSS custom-ident-ish: sanitize the id into a stable
  // dashed token so any consumer id yields a valid --jx-pop-* name.
  const anchorName = `--jx-pop-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const area = $derived(
    placement === 'bottom' ? 'bottom' :
    placement === 'bottom-end' ? 'bottom span-right' :
    placement === 'bottom-start' ? 'bottom span-left' :
    placement === 'top' ? 'top' :
    placement === 'top-end' ? 'top span-right' :
    'top span-left'
  );

  let panel = $state<HTMLElement | null>(null);
  // the DEFAULT trigger only — a custom trigger snippet owns its own
  // aria-expanded (terminal-header's link triggers manage theirs)
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let open = $state(false);
  const popoverApi = (el: HTMLElement | null): Pick<HTMLElement, 'showPopover' | 'hidePopover' | 'togglePopover'> | null =>
    el && typeof el.showPopover === 'function' ? el : null;

  // THE toggle seam (2026-08-20 fix): one native event covers every
  // open/close path (popovertarget, light dismiss, Escape, the handle).
  // Open state is read LIVE from :popover-open at fire time — ToggleEvent
  // state fields are never trusted (the pre-fix code read a nonexistent
  // .newValue, which made every consumer onToggle receive false) — and
  // the seam mirrors aria-expanded onto the default trigger, which
  // popovertarget alone never does.
  function onPanelToggle(): void {
    open = panel?.matches(':popover-open') ?? false;
    triggerEl?.setAttribute('aria-expanded', String(open));
    onToggle?.(open);
  }

  // imperative handle (bind:this) — thin native passthroughs, nothing more
  export function show(source?: HTMLElement): void {
    const el = popoverApi(panel);
    if (el && !panel!.matches(':popover-open')) {
      // `source` names the invoking control where the popover spec supports
      // it (focus restoration, invoker semantics); engines without the
      // options bag simply ignore the argument
      (el as HTMLElement & { showPopover(options?: { source?: HTMLElement }): void }).showPopover(
        source ? { source } : undefined,
      );
    }
  }
  export function hide(): void {
    const el = popoverApi(panel);
    if (el && panel!.matches(':popover-open')) el.hidePopover();
  }
  export function toggle(): void {
    const el = popoverApi(panel);
    if (el) el.togglePopover();
  }
</script>

<span class="jx-pop-anchor" style="anchor-name: {anchorName}">
  {#if trigger}
    {@render trigger()}
  {:else}
    <button
      type="button"
      class="jx-pop-trigger"
      popovertarget={id}
      bind:this={triggerEl}
      aria-expanded={open}
    >
      {triggerLabel}
      <svg
        class="jx-pop-caret"
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

<!-- one native toggle listener is the single seam: it feeds the default
     trigger's aria-expanded AND the optional onToggle consumer callback;
     open state is read live from :popover-open, never from event fields -->
<div
  {id}
  popover="auto"
  class="jx-pop {panelClass}"
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={onPanelToggle}
>
  {@render children()}
</div>

<style>
  .jx-pop-anchor {
    display: inline-flex;
  }

  /* Trigger: the press-button outline recipe on a native button — it must
     stay a real <button> because popovertarget only works on buttons. */
  .jx-pop-trigger {
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
  .jx-pop-trigger:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-sm);
    background: var(--muted);
  }
  .jx-pop-trigger:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }

  /* Caret: flips while open via :has + ::popover-open (progressive —
     engines without it simply keep the closed caret). */
  .jx-pop-caret {
    width: 13px;
    height: 13px;
    flex: none;
    transition: transform 150ms ease-out;
  }
  .jx-pop-trigger:has(+ :popover-open) .jx-pop-caret,
  .jx-pop-anchor:has(+ .jx-pop:popover-open) .jx-pop-caret {
    transform: rotate(180deg);
  }

  /* Panel law: 1px border, hard offset shadow, radius 0. Anchored via
     position-anchor + inset-area (inline styles carry the per-instance
     names); native try-fallbacks flip on overflow — zero JS geometry. */
  .jx-pop {
    position: fixed;
    /* gap law (Owner, 2026-08-21): the shadow extends bottom-right; a
       uniform margin keeps it off the anchor for EVERY placement — above
       (shadow's bottom edge), left (shadow's right edge), and below/right
       (adjacency itself). */
    margin: var(--jx-pop-gap, 8px);
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    position-try: flip-block, flip-inline, flip-block flip-inline;
    /* scroll law (MDN tip): when the anchor scrolls out of view (nested
       scrollers move it), hide the panel instead of leaving it stale */
    position-visibility: anchors-visible;
    width: fit-content;
    height: fit-content;
    max-width: min(92vw, 22rem);
    max-height: 72vh;
    overflow: auto;
    padding: 12px 14px;
    font-size: 13px;
    color: var(--popover-foreground);
    border: 1px solid var(--border);
    background: var(--popover);
    box-shadow: var(--shadow);
  }
  /* Engines without CSS Anchor Positioning: authored viewport-center —
     the v1 visual, never worse. */
  @supports not (anchor-name: --jx-pop-fallback) {
    .jx-pop {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
    }
  }
  /* Popovers get a ::backdrop too; light dismiss must never dim the page. */
  .jx-pop::backdrop {
    background: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-pop-trigger,
    .jx-pop-caret {
      transition: none;
    }
  }
</style>
