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
    toggle      → the notch mask is authored once, at open (Arrow law)

  a11y: the wrapper carries aria-describedby → the panel id permanently;
  hidden popover content is display:none, so assistive tech only reads
  the tip while it is actually shown. Non-interactive by contract — put
  actionable content in a popover, not a tooltip.

  Arrow law (2026-08-23, mask-cut revision, Owner-directed — XboxYan's
  seamless-bubble recipe, mask form): `arrow` opts into a notch that is
  CUT FROM THE BUBBLE ITSELF, never appended. The body reserves a
  --jx-tip-notch strip of padding on BOTH block sides (layout-stable
  across flips), and its mask digs away everything in that strip EXCEPT
  the tab pointing at the anchor — one SVG path outlines bubble+tab, so
  fill, acrylic blur and silhouette are the SAME paint by construction.
  The path is authored per open by aimPin() (all px, any side, any aim
  x): the tab points at the anchor point the placement names ('top' →
  the anchor's top-center, 'top-end' → its top-end corner; clamped
  inward at the bubble's corners). The 1px border can't ride `border`
  on a masked silhouette: the platform element opts into the
  jx-surface border-ring layer ([data-border-ring] — the ring is the
  silhouette minus its 1px-inset copy, mask-composite: subtract; see
  jixoai.css). Side/aim cover all 6 placements (and generalize to any
  side), matching the 8-direction space the recipe allows.

  Chromium constraint (151, empirically pinned 2026-08-22): anchor()
  inside a popover is not shippable — declarations carried by the style
  attribute or a stylesheet never resolve for an element first computed
  while the popover is closed, and even CSSOM-armed declarations
  mis-resolve to the spec's 50% unresolvable fallback. aimPin() reads
  rects in the popover's toggle handler instead, which is exactly as
  dynamic as the panel's own flip law (popover.svelte: position-try
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
    /** opt-in pointer notch: a tab CUT FROM the bubble through its mask,
        aimed at the anchor point the placement names ('top' →
        top-center, 'top-end' → the top-end corner); re-authored at every
        open, mirroring the once-at-open flip law */
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
  // the anchor point the tab aims at: center placements → the side
  // midpoint, -start/-end → the matching corner (physical left/right,
  // mirroring the physical span-left/span-right choice in `area`)
  const aimSide = $derived(
    placement.endsWith('-start') ? 'left'
    : placement.endsWith('-end') ? 'right'
    : 'center'
  );

  let panel = $state<HTMLElement | null>(null);
  let anchorEl = $state<HTMLElement | null>(null);
  let body = $state<HTMLElement | null>(null);
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  // notch geometry (px) — keep NOTCH in sync with --jx-tip-notch in the
  // styles. BASE is the tab's width at the bubble edge; the x clamp
  // keeps the tab clear of the bubble's corners.
  const BASE = 12;
  const NOTCH = 8;
  const EDGE = BASE / 2 + 2;

  const n = (v: number): number => Math.round(v * 100) / 100;

  /** outline of bubble + tab, comma path syntax (no spaces — the URI
      stays unencoded-safe). side = which bubble edge carries the tab;
      x = the tab apex's aim point in body-box px */
  const shapePath = (w: number, h: number, x: number, side: 'top' | 'bottom'): string => {
    const b = BASE / 2;
    return side === 'bottom'
      ? `M0,${n(NOTCH)}H${n(w)}V${n(h - NOTCH)}H${n(x + b)}L${n(x)},${n(h)}L${n(x - b)},${n(h - NOTCH)}H0Z`
      : `M0,${n(h - NOTCH)}H${n(w)}V${n(NOTCH)}H${n(x + b)}L${n(x)},0L${n(x - b)},${n(NOTCH)}H0Z`;
  };
  /** the same silhouette inset by 1px (the ring's inner edge) */
  const ringInnerPath = (w: number, h: number, x: number, side: 'top' | 'bottom'): string => {
    const b = BASE / 2 - 1;
    return side === 'bottom'
      ? `M1,${n(NOTCH + 1)}H${n(w - 1)}V${n(h - NOTCH - 1)}H${n(x + b)}L${n(x)},${n(h - 1)}L${n(x - b)},${n(h - NOTCH - 1)}H1Z`
      : `M1,${n(h - NOTCH - 1)}H${n(w - 1)}V${n(NOTCH + 1)}H${n(x + b)}L${n(x)},1L${n(x - b)},${n(NOTCH + 1)}H1Z`;
  };
  const svgUrl = (w: number, h: number, d: string): string =>
    `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${n(w)} ${n(h)}' preserveAspectRatio='none'><path d='${d}' fill='black'/></svg>")`.replaceAll(' ', '%20');

  // Author the notch mask once, at open — the same moment position-try
  // settles the panel's own flip (see Chromium constraint in the
  // header). Everything is plain px/data-URIs on custom properties; no
  // anchor() anywhere. Sets, on the panel: --jx-tip-shape (the body's
  // silhouette mask) and the --jx-surface-ring pair (the border ring's
  // subtract layers).
  function aimPin(): void {
    if (!panel || !body || !anchorEl) return;
    const r = body.getBoundingClientRect();
    const a = anchorEl.getBoundingClientRect();
    const w = r.width;
    const target =
      aimSide === 'left' ? a.left : aimSide === 'right' ? a.right : (a.left + a.right) / 2;
    const x = Math.min(Math.max(target - r.left, EDGE), Math.max(w - EDGE, EDGE));
    const side: 'top' | 'bottom' = r.top + r.bottom < a.top + a.bottom ? 'bottom' : 'top';
    panel.style.setProperty('--jx-tip-shape', svgUrl(w, r.height, shapePath(w, r.height, x, side)));
    panel.style.setProperty('--jx-surface-ring', svgUrl(w, r.height, shapePath(w, r.height, x, side)));
    panel.style.setProperty(
      '--jx-surface-ring-inner',
      svgUrl(w, r.height, ringInnerPath(w, r.height, x, side)),
    );
    panel.dataset.side = side;
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
  data-border-ring={arrow ? '' : undefined}
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={(e) => e.newState === 'open' && aimPin()}
  onpointerenter={() => clearTimeout(closeTimer)}
  onpointerleave={onLeave}
>
  <!-- surface body (fill + acrylic blur + silhouette mask); the popover
       element paints nothing (floating-surface law arch r3) and carries
       the border-ring ::before for the masked outline -->
  <span class="jx-tip-body jx-surface-body" bind:this={body}>{text}</span>
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
    /* the notch mask is anchor-driven — meaningless at viewport-center;
       without aimPin the body degrades to a plain (slightly airier)
       bordered bubble, never worse */
    .jx-tip[data-arrow] .jx-tip-body {
      padding-block: 5px;
    }
  }
  .jx-tip::backdrop {
    background: transparent;
  }
  /* the shadow layer is OFF entirely (content: none) — the tip's law is
     shadowless in every variant. Without this the law's ::after veil
     (0.32 black, brightness-filtered, full rect UNDER the body) would
     bleed through the masked-away notch flanks and paint them black */
  .jx-tip.jx-surface::after {
    content: none;
  }
  .jx-tip-body::after {
    content: none;
  }

  /* Notch cut (mask form, Owner-directed 2026-08-23): the body reserves
     a NOTCH strip of padding on BOTH block sides (layout-stable across
     flips — the visual bubble keeps its 5px inner padding on both
     sides), drops its own border (the platform ::before ring owns the
     outline on a masked silhouette), and masks to bubble+tab — the
     strip is dug away on both flanks of the tab (XboxYan's recipe).
     aimPin() authors --jx-tip-shape at open (rect read, the
     Chromium-safe pivot — see header): fill, blur and silhouette stay
     ONE paint, seamless by construction. NOTCH here and in the script
     are the same 8px by contract; the block gap keeps the 6px law (the
     tab lives INSIDE the reserved strip, no overhang). */
  .jx-tip[data-arrow] {
    --jx-tip-notch: 8px;
  }
  .jx-tip[data-arrow] .jx-tip-body {
    border: none;
    padding-block: calc(5px + var(--jx-tip-notch) + 1px);
    -webkit-mask-image: var(--jx-tip-shape, none);
    -webkit-mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-image: var(--jx-tip-shape, none);
    mask-size: 100% 100%;
    mask-repeat: no-repeat;
  }
</style>
