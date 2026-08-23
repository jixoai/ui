<!--
  jixoai popover (registry/files/ui/popover.svelte).

  NativeHTML base (2026-08-20): the Popover API — `popover="auto"` on the
  panel plus a trigger button wired declaratively through `popovertarget`.
  Light dismiss (outside click / focus loss), Escape, aria-expanded on the
  trigger, one-auto-popover-at-a-time, and top-layer rendering are all
  browser-native. The declarative path (default trigger) runs zero
  listeners and zero positioning script; the only runtime script is the
  single native toggle seam plus the optional imperative handle.

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
    placement     the INITIAL anchored position: the six classic sides
                  plus 'left' | 'right' | 'center' (the nine-grid
                  positions). Default 'bottom-end' — under the trigger,
                  right edges aligned
    variant       floating-surface variant: 'solid' | 'acrylic' | 'auto'
                  (default 'auto' — acrylic, solid under reduced
                  transparency; jixoai.css lays the law out, and the
                  WAAPI motion kernel below animates everything)
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
  itself scrolls out of view.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  /** marker interface for kernel-owned WAAPI animations */
  interface CSSElementAnimationLike extends Animation {
    __jxKernel?: boolean;
  }

  interface Props {
    id: string;
    /** Button label for the default trigger; unnecessary when a custom
        `trigger` snippet renders its own control. */
    triggerLabel?: string;
    placement?: 'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start' | 'left' | 'right' | 'center';
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    /** position-try fallbacks as a raw CSS value — custom @position-try
        idents (space/comma list) replace the default flip series; pass
        e.g. '--try-top, --try-bottom-end' authored on the consumer side.
        Empty/undefined = flip-block, flip-inline (the engine default) */
    tryFallbacks?: string;
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
    tryFallbacks = '',
    trigger,
    panelClass = '',
    onToggle,
    children,
  }: Props = $props();

  // PHYSICAL placement map (r23): when tryFallbacks drives the try
  // chain, the INITIAL position is written with physical anchor()
  // insets too — a position-area on the panel outranks any candidate's
  // physical insets (the engine's try allow-list dropped inset-area),
  // so mixing the two silently disables every candidate
  const physical = $derived.by(() => {
    // left/right: hug the side, vertically centered on the anchor;
    // center: viewport-centered (inset 0 + margin auto, the same form
    // as the --jx-try-center candidate)
    if (placement === 'left' || placement === 'right') {
      const side = placement === 'left'
        ? 'right: anchor(left); left: auto'
        : 'left: anchor(right); right: auto';
      return `${side}; top: auto; bottom: auto; align-self: anchor-center;`;
    }
    if (placement === 'center') return 'top: 0; bottom: 0; left: 0; right: 0; margin: auto;';
    const c = placement.endsWith('-start') ? 'left: anchor(left); right: auto'
      : placement.endsWith('-end') ? 'left: auto; right: anchor(right)'
      : 'left: auto; right: auto; justify-self: anchor-center';
    const r = placement.startsWith('top') ? 'top: auto; bottom: anchor(top)' : 'top: anchor(bottom); bottom: auto';
    return `${r}; ${c};`;
  });

  // Anchor names are CSS custom-ident-ish: sanitize the id into a stable
  // dashed token so any consumer id yields a valid --jx-pop-* name.
  const anchorName = `--jx-pop-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const area = $derived(
    placement === 'bottom' ? 'bottom' :
    placement === 'bottom-end' ? 'bottom span-right' :
    placement === 'bottom-start' ? 'bottom span-left' :
    placement === 'top' ? 'top' :
    placement === 'top-end' ? 'top span-right' :
    placement === 'left' ? 'left' :
    placement === 'right' ? 'right' :
    placement === 'center' ? 'center' :
    'top span-left'
  );

  let panel = $state<HTMLElement | null>(null);
  // DIRECTION STATE (r25): the four vector props live in reactive
  // state and render through the style template — the kernel used to
  // write them imperatively via setProperty, and every Svelte style
  // re-render (placement/tryFallbacks change) REBUILT the attribute,
  // wiping them mid-flight: animations suddenly ran on the default
  // vector. Reactive = rewrite-proof by construction
  let dir = $state({ ix: '0px', iy: '6px', ox: '6px', oy: '6px' });
  // the anchor wrapper — the enter kernel measures the slide
  // direction against it at every open
  let anchorEl = $state<HTMLElement | null>(null);
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
    if (open && panel) {
      playProgress(1);
      trackAxis();
    } else if (panel) {
      panel.classList.remove('jx-rest');
      playProgress(0);
      cancelAnimationFrame(trackFrame);
    }
    onToggle?.(open);
  }

  // ── MOTION KERNEL (Owner ruling, 2026-08-23 r26 — declarative) ──
  // WAAPI animates exactly ONE thing: --jx-p, the timeline progress
  // (an @property-registered number, so Chrome's animation panel can
  // scrub it). Every visible property is a CSS formula of it (see the
  // declarative motion law in jixoai.css) — no layout property is ever
  // touched from JS, no finished() chains, no state callbacks. The
  // kernel's only other job is the LIVE direction axis: an rAF loop
  // publishes the panel↔anchor unit vector as --jx-dx/--jx-dy (pure
  // custom properties; the degenerate axis falls back to the project
  // default, bottom-right). Reduced motion jumps the same lifecycle to
  // its end instantly.
  const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let progressAnim: Animation | null = null;
  let trackFrame = 0;
  // last observed progress: the engine cancels the fill-both progress
  // animation when the closed panel's display flips — reading the
  // computed --jx-p at close time then returns the cascade initial 0
  // and the exit would snap instead of reversing (r26 exit probe). The
  // axis tracker refreshes this every frame while open
  let lastP = 0;

  /** the WHOLE lifecycle: drive --jx-p to the target — 460ms linear,
   *  fill both (formulas hold the end pose), from the CURRENT value so
   *  rapid toggles reverse mid-flight without jumps */
  function playProgress(to: number): void {
    const p = panel;
    if (!p) return;
    progressAnim?.cancel();
    if (prefersReducedMotion()) {
      lastP = to;
      p.style.setProperty('--jx-p', String(to)); // jump to complete
      p.classList.toggle('jx-rest', to >= 0.999);
      return;
    }
    const from = lastP;
    // pin the start inline FIRST: an animation created while the panel
    // is still display:none never runs (the engine skips it — the entry
    // flashed straight to the end state while the exit, whose panel
    // stays rendered through the discrete window, played fine)
    p.style.setProperty('--jx-p', String(from));
    p.classList.remove('jx-rest'); // the blur formula must own filter again
    if (to < from) {
      // EXIT: the panel is rendered (discrete window) — start at once
      progressAnim = p.animate(
        [{ '--jx-p': from }, { '--jx-p': to }],
        { duration: 460, easing: 'linear', fill: 'both' },
      );
    } else {
      // ENTRY: create on the NEXT frame, when display has flipped
      requestAnimationFrame(() => {
        if (!p.matches(':popover-open')) return;
        progressAnim = p.animate(
          [{ '--jx-p': from }, { '--jx-p': to }],
          { duration: 460, easing: 'linear', fill: 'both' },
        );
      });
    }
  }

  /** LIVE axis (rAF loop while open): the unit vector from the anchor
   *  center to the panel center — position-try flips and window resizes
   *  are picked up frame by frame; the CSS engine caches the calc
   *  chains, so the per-frame cost is two custom-property writes */
  function trackAxis(): void {
    cancelAnimationFrame(trackFrame);
    const step = (): void => {
      const p = panel;
      if (!p || !anchorEl || !p.matches(':popover-open')) return;
      const pv = Number(getComputedStyle(p).getPropertyValue('--jx-p'));
      if (Number.isFinite(pv)) lastP = pv;
      // at rest, drop the filter to none: a lingering blur(0px) still
      // creates a filter layer and disturbs the backdrop compositing
      // (Owner ruling, 2026-08-23 r27)
      p.classList.toggle('jx-rest', lastP >= 0.999);
      const pr = p.getBoundingClientRect();
      const ar = anchorEl.getBoundingClientRect();
      const dx = pr.left + pr.width / 2 - (ar.left + ar.width / 2);
      const dy = pr.top + pr.height / 2 - (ar.top + ar.height / 2);
      const len = Math.hypot(dx, dy);
      if (len > 1) {
        p.style.setProperty('--jx-dx', String(dx / len));
        p.style.setProperty('--jx-dy', String(dy / len));
      } else {
        // degenerate axis (centers coincide) → the project default
        p.style.setProperty('--jx-dx', '0.70710678');
        p.style.setProperty('--jx-dy', '0.70710678');
      }
      trackFrame = requestAnimationFrame(step);
    };
    trackFrame = requestAnimationFrame(step);
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

<span class="jx-pop-anchor" style="anchor-name: {anchorName}" bind:this={anchorEl}>
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
  class="jx-pop jx-surface jx-waapi {panelClass}"
  data-variant={variant}
  bind:this={panel}
  style="position-anchor: {anchorName}; --jx-surface-in-x: {dir.ix}; --jx-surface-in-y: {dir.iy}; --jx-surface-ox: {dir.ox}; --jx-surface-oy: {dir.oy}; {tryFallbacks ? `${physical}; position-try: ${tryFallbacks}; position-try-fallbacks: ${tryFallbacks};` : `inset-area: ${area}; position-area: ${area};`}"
  ontoggle={onPanelToggle}
>
  <!-- jx-surface-body = THE SURFACE (fill + acrylic blur + the ::after
       shadow layer); it never scrolls or clips. The scroll+padding ring
       sits inside it (floating-surface law, arch r3: the platform
       element paints nothing). -->
  <div class="jx-pop-shadow jx-surface-shadow" aria-hidden="true"></div>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from WAAPI — the kernel animates it in lockstep
       (Owner ruling r18) -->
  <div class="jx-pop-body jx-surface-body">
    <div class="jx-pop-scroll">
      {@render children()}
    </div>
  </div>
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
    .jx-pop-anchor:has(+ .jx-pop:popover-open) .jx-pop-caret {
    transform: rotate(180deg);
  }

  /* Panel law: the PLATFORM element — 1px border, anchoring, and the
     open/close motion ONLY (floating-surface law arch r3: no paint
     here; the fill lives on .jx-pop-body). Anchored via
     position-anchor + inset-area (inline styles carry the per-instance
     names); native try-fallbacks flip on overflow — zero JS geometry.
     The panel never scrolls or clips. */
  /* the real .jx-pop-shadow child owns the shadow here; the law's
     ::after fallback is disabled to avoid painting both */
  .jx-pop.jx-surface::after {
    content: none;
  }
  .jx-pop {
    position: fixed;
    /* flush anchoring (Owner, 2026-08-23 r22): the adaptive shadow
       always falls to the OUTWARD side (away from the anchor), so the
       panel can hug the anchor directly — the old 8px margin existed
       only to keep a fixed bottom-right shadow off the anchor */
    margin: 0;
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    position-try: flip-block, flip-inline, flip-block flip-inline;
    /* scroll law (MDN tip): when the anchor scrolls out of view (nested
       scrollers move it), hide the panel instead of leaving it stale */
    position-visibility: anchors-visible;
    width: fit-content;
    height: fit-content;
    max-width: min(92vw, 22rem);
    padding: 0;
    font-size: 13px;
    color: var(--popover-foreground);
  }
  /* the scroll+padding ring inside the surface body — consumers retune
     padding through --jx-pop-pad (terminal-header's bezel does) */
  .jx-pop-scroll {
    max-height: 72vh;
    overflow: auto;
    /* scrollbar law: both-edges gutters; padding-inline hands the gutter
       back. --jx-pop-pad-inline mirrors the shorthand's inline value —
       retune inline padding through it whenever you set --jx-pop-pad */
    scrollbar-gutter: stable both-edges;
    padding: var(--jx-pop-pad, 12px 14px);
    padding-inline: max(var(--jx-pop-pad-inline, 14px) - var(--jx-scrollbar-thin, 0px), 0px);
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
