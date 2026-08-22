<!--
  jixoai tooltip (registry/files/ui/tooltip.svelte).
  The hover-intent hint, built the same way as popover.svelte: a native
  Popover API panel (popover="manual" — no light dismiss; the tooltip
  owns its own exit) anchored to the trigger through CSS Anchor
  Positioning, zero JS geometry.

  Intent model (the part CSS alone cannot do — the reason this is a
  component and not a utility class):
    pointerenter → open after openDelay (400ms)     hover intent
    pointerleave → close after closeDelay (100ms)   lets the pointer
                     cross the gap onto the tooltip itself (the panel's
                     own pointerenter cancels the pending close)
    focusin     → open NOW                           keyboard/screen
                     readers never wait for hover timers
    focusout    → close NOW
    Escape      → close NOW (manual popovers skip the native Esc path)
    toggle      → the pin aims once, at open (see Arrow law)

  a11y: the wrapper carries aria-describedby → the panel id permanently;
  hidden popover content is display:none, so assistive tech only reads
  the tip while it is actually shown. Non-interactive by contract — put
  actionable content in a popover, not a tooltip.

  Arrow law (2026-08-22, seamless-notch revision after visual review):
  `arrow` opts into a pointer notch — an inline-SVG triangle fused to the
  panel edge: one path paints the 1px border ring as an evenodd HOLE
  (outer triangle minus inner), the second paints the inner fill THROUGH
  that hole, so even translucent (acrylic) fills composite over the page
  exactly like the panel's own edge — no dark under-layer, no splicing,
  no detached diamond, and the base covers the panel border line across
  the notch width (XboxYan's seamless-bubble recipe, SVG form). Aimed at
  the anchor point the placement names ('top' → the anchor's top-center,
  'top-end' → its top-end corner; clamped inward at the panel's corners);
  the base rides the panel edge nearest the anchor, whichever side the
  engine's flip fallbacks chose (aimPin writes left px + data-side at
  open; data-side=top flips the SVG with scaleY(-1)). The arrowed block
  gap widens to house the notch, and hovering it still bridges the gap.

  Chromium constraint (151, empirically pinned 2026-08-22): anchor()
  inside a popover is not shippable — declarations carried by the style
  attribute or a stylesheet never resolve for an element first computed
  while the popover is closed, and even CSSOM-armed declarations
  mis-resolve to the spec's 50% unresolvable fallback. The pin therefore
  aims from a rect read in the popover's toggle handler, which is exactly
  as dynamic as the panel's own flip law (popover.svelte: position-try
  settles ONCE, at open, never re-evaluated) — a once-at-open aim is
  correct by the system's contract. The panel itself uses no anchor()
  function (position-anchor + inset-area inline) and stays zero-JS.

  Anchoring, flip fallbacks and anchors-visible scroll hiding follow the
  popover.svelte laws; engines without anchor positioning fall back to
  viewport-center (never worse).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';

  interface Props {
    /** panel id (aria-describedby pairs the trigger wrapper to the tip);
        auto-generated when omitted */
    id?: string;
    /** the tip itself — plain text; composed content belongs in a popover */
    text: string;
    /** anchored side; 'top' (default) is the tooltip convention */
    placement?: 'top' | 'bottom' | 'top-start' | 'bottom-start' | 'top-end' | 'bottom-end';
    /** opt-in pointer notch: a fill triangle fused to the panel edge,
        aimed at the anchor point the placement names ('top' →
        top-center, 'top-end' → the top-end corner); follows flip
        fallbacks (re-aimed at every open, mirroring the once-at-open
        flip law) */
    arrow?: boolean;
    /** hover-intent open delay (ms); focus opens immediately regardless */
    openDelay?: number;
    /** grace before closing, so the pointer can cross onto the tip */
    closeDelay?: number;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency). The tip keeps its
        shadowless character in every variant — the jx-surface offset is
        pinned to 0 below; the law contributes the entry/exit
        choreography and the acrylic paint. */
    variant?: 'solid' | 'acrylic' | 'auto';
    class?: string;
    /** the trigger content; the wrapper span carries the anchoring */
    children: Snippet;
  }

  const autoId = $props.id();

  let {
    id = autoId,
    text,
    placement = 'top',
    arrow = false,
    openDelay = 400,
    closeDelay = 100,
    variant = 'auto',
    class: className = '',
    children,
  }: Props = $props();

  // id is mount-stable by contract; $derived keeps the name truthful
  const anchorName = $derived(`--jx-tip-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const area = $derived(
    placement === 'top' ? 'top'
    : placement === 'top-start' ? 'top span-left'
    : placement === 'top-end' ? 'top span-right'
    : placement === 'bottom' ? 'bottom'
    : placement === 'bottom-start' ? 'bottom span-left'
    : 'bottom span-right'
  );
  // the anchor point the pin aims at: center placements → the side
  // midpoint, -start/-end → the matching corner (physical left/right,
  // mirroring the physical span-left/span-right choice in `area`)
  const aimSide = $derived(
    placement.endsWith('-start') ? 'left'
    : placement.endsWith('-end') ? 'right'
    : 'center'
  );

  let panel = $state<HTMLElement | null>(null);
  let anchorEl = $state<HTMLElement | null>(null);
  let pin = $state<SVGSVGElement | null>(null);
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  // notch geometry — keep ARROW in sync with --jx-tip-arrow in the styles
  // (triangle base width); the x clamp keeps the base clear of the panel
  // corners: half base + 2px air
  const ARROW = 12;
  const EDGE = ARROW / 2 + 2;

  // Aim the notch once, at open — the same moment position-try settles
  // the panel's own flip (see Chromium constraint in the header). Plain
  // px/decorative attributes only; no anchor() anywhere. left = the aim
  // point on the anchor; data-side = the panel edge that ended up
  // nearest the anchor (the stylesheet flips the triangle on it).
  function aimPin(): void {
    if (!panel || !pin || !anchorEl) return;
    const p = panel.getBoundingClientRect();
    const a = anchorEl.getBoundingClientRect();
    const w = p.width - 2; // pin insets resolve in the padding box (1px border)
    const target =
      aimSide === 'left' ? a.left : aimSide === 'right' ? a.right : (a.left + a.right) / 2;
    const x = Math.min(Math.max(target - p.left - 1, EDGE), Math.max(w - EDGE, EDGE));
    const panelAbove = p.top + p.bottom < a.top + a.bottom;
    pin.style.left = `${x}px`;
    pin.dataset.side = panelAbove ? 'bottom' : 'top';
  }

  const popoverApi = (
    el: HTMLElement | null,
  ): el is HTMLElement & { showPopover(): void; hidePopover(): void } =>
    !!el && typeof el.showPopover === 'function';

  function clearTimers(): void {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  }

  function open(): void {
    clearTimers();
    if (popoverApi(panel) && !panel!.matches(':popover-open')) panel!.showPopover();
  }
  function close(): void {
    clearTimers();
    if (popoverApi(panel) && panel!.matches(':popover-open')) panel!.hidePopover();
  }

  function onEnter(): void {
    clearTimeout(closeTimer);
    openTimer = setTimeout(open, openDelay);
  }
  function onLeave(): void {
    clearTimeout(openTimer);
    closeTimer = setTimeout(close, closeDelay);
  }

  // pending intent timers must never outlive the component (Codex r1)
  onDestroy(clearTimers);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<!-- svelte-ignore a11y_no_static_element_interactions -- the wrapper is
     not an interactive control; hover/focus intent is decoration riding
     over whatever focusable trigger the consumer composed inside -->
<span
  class="jx-tip-anchor {className}"
  style="anchor-name: {anchorName}"
  aria-describedby={id}
  bind:this={anchorEl}
  onpointerenter={onEnter}
  onpointerleave={onLeave}
  onfocusin={open}
  onfocusout={(e) => {
    // focus moving BETWEEN the wrapper's own children must not flicker
    // the tip (only a real exit closes)
    if (!e.currentTarget.contains(e.relatedTarget)) close();
  }}
>
  {@render children()}
</span>

<div
  {id}
  popover="manual"
  role="tooltip"
  class="jx-tip jx-surface"
  data-variant={variant}
  data-arrow={arrow ? '' : undefined}
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={(e) => e.newState === 'open' && aimPin()}
  onpointerenter={() => clearTimeout(closeTimer)}
  onpointerleave={onLeave}
>
  {#if arrow}
    <!-- seamless notch: the ring path's evenodd HOLE lets the translucent
         fill composite over the page (a dark under-layer would darken it
         one tone below the panel); data-side=top flips the whole SVG -->
    <svg class="jx-tip-arrow" viewBox="0 0 12 8" bind:this={pin} aria-hidden="true">
      <path class="jx-tip-arrow-ring" d="M0 0H12L6 8ZM1.2 0H10.8L6 6.7Z" fill-rule="evenodd" />
      <path class="jx-tip-arrow-fill" d="M1.2 0H10.8L6 6.7Z" />
    </svg>
  {/if}
  <!-- surface body (fill + acrylic blur); the popover element paints
       nothing (floating-surface law arch r3). The notch stays OUTSIDE
       the body — it hugs the panel's border line -->
  <span class="jx-tip-body jx-surface-body">{text}</span>
</div>

<style>
  .jx-tip-anchor {
    display: inline-flex;
  }

  /* Tip law: quiet inverse surface, 1px border, no shadow (hints do not
     press on the page — that weight belongs to interactive panels).
     PLATFORM element only (arch r3): the body carries the fill; the
     shadow layer is disabled (.jx-tip-body::after content none). */
  .jx-tip {
    position: fixed;
    margin: var(--jx-tip-gap, 6px);
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    position-try: flip-block, flip-inline, flip-block flip-inline;
    position-visibility: anchors-visible;
    width: fit-content;
    max-width: min(80vw, 18rem);
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
    color: var(--popover-foreground);
  }
  .jx-tip-body {
    display: block;
    padding: 5px 9px;
  }
  @supports not (anchor-name: --jx-tip-fallback) {
    .jx-tip {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
      align-self: center;
      justify-self: center;
    }
    /* the notch's aim is anchor-driven — meaningless at viewport-center */
    .jx-tip-arrow {
      display: none;
    }
  }
  .jx-tip::backdrop {
    background: transparent;
  }
  /* the shadow layer is OFF entirely (content: none) — the tip's law
     is shadowless in every variant (arch r3: the guard targets the
     BODY's ::after; the platform element has none) */
  .jx-tip-body::after {
    content: none;
  }

  /* Pointer notch (seamless-bubble law): inline SVG, two paths — the
     ring (fill: border) is an evenodd HOLE so the fill path composites
     over the page, never over a dark under-layer; translucent (acrylic)
     fills then match the panel's edge exactly. Base flush on the panel's
     border line (top: 100% of the padding box) covers the line across
     the notch width — bubble and notch read as one shape. aimPin() (rect
     read at open, the Chromium-safe pivot — see header) supplies left =
     the anchor point the placement names (clamped clear of the corners)
     and data-side = the panel edge nearest the anchor (top flips via
     scale). The arrowed block gap widens to house the notch (height +
     3px air); inline gaps keep the 6px law. ARROW in the script and
     --jx-tip-arrow are the same 12px base by contract (viewBox 0 0 12 8
     scales with the CSS box). */
  .jx-tip[data-arrow] {
    --jx-tip-arrow: 12px;
    margin-block: calc(var(--jx-tip-arrow) * 0.6667 + 3px);
  }
  .jx-tip-arrow {
    position: absolute;
    top: 100%;
    translate: -50% 0;
    display: block;
    width: var(--jx-tip-arrow);
    height: calc(var(--jx-tip-arrow) * 0.6667);
  }
  .jx-tip-arrow[data-side='top'] {
    top: auto;
    bottom: 100%;
    scale: 1 -1;
  }
  .jx-tip-arrow-ring {
    fill: var(--border);
  }
  .jx-tip-arrow-fill {
    fill: var(--popover);
  }
  /* variant fills follow the panel; no backdrop-filter on the notch — a
     filtered parent is a backdrop root, so a child filter would sample the
     panel behind it, not the page (and notch-scale blur is imperceptible) */
  .jx-tip[data-variant='acrylic'] .jx-tip-arrow-fill,
  .jx-tip[data-variant='auto'] .jx-tip-arrow-fill {
    fill: var(--jx-surface-acrylic-fill, color-mix(in oklab, var(--popover) 72%, transparent));
  }
  @media (prefers-reduced-transparency: reduce) {
    .jx-tip[data-variant='auto'] .jx-tip-arrow-fill {
      fill: var(--jx-surface-solid-fill, var(--popover));
    }
  }
</style>
