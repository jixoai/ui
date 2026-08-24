<!--
  jixoai tooltip (registry/files/ui/tooltip.svelte).
  The hover-intent hint, built the same way as popover.svelte: a native
  Popover API panel (popover="manual" — no light dismiss; the tooltip
  owns its own exit) anchored to the trigger through CSS Anchor
  Positioning, zero JS geometry.

  Intent model (the part CSS alone cannot do — the reason this is a
  component and not a utility class):
    pointerenter → open NOW (Owner ruling 2026-08-23: tips show
                     immediately; a hover-intent delay is opt-in through
                     openDelay for sweep-heavy surfaces)
    pointerleave → close after closeDelay (100ms)   lets the pointer
                     cross the gap onto the tooltip itself (the panel's
                     own pointerenter cancels the pending close)
    focusin     → open NOW                           keyboard/screen
                     readers never wait for hover timers
    focusout    → close NOW
    Escape      → close NOW (manual popovers skip the native Esc path)
    toggle      → the notch mask + the slide vector are authored once, at
                  open, and the WAAPI motion kernel plays (Arrow law)

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

  Motion kernel (2026-08-23 r2, popover.svelte's WAAPI kernel, VERBATIM
  choreography — three layers: the platform panel, the surface body and
  a REAL .jx-tip-shadow child masked to the notch silhouette; a static
  ::after veil cannot join the choreography because pseudo-elements are
  unreachable from WAAPI). The one structural simplification: no
  direction predict/verify/replay — aimPin's rect read at open already
  knows the post-flip geometry (both axes), so the slide and shadow
  vectors are measured, not predicted. Same two laws as popover.svelte:
  (1) opacity is animated ONLY while the kernel pins the materials
  OPAQUE (an animated opacity activates the compositor's opacity
  channel and breaks backdrop-filter blur); (2) no lingering fills —
  every phase is canceled the moment its successor owns the values, the
  exceptions being the exit tail's forwards fill (holds opacity 0 until
  display:none) and the exit's body/shadow opaque holds through B'
  (popover parity — they die with the panel's display:none).

  Anchoring, flip fallbacks and anchors-visible scroll hiding follow the
  popover.svelte laws; engines without anchor positioning fall back to
  viewport-center (never worse).

  tw4 (2026-08-24): anchor/body paint as token utilities in the markup;
  tooltip.css keeps the D1-exempt machinery — panel anchor geometry +
  the @supports viewport-center fallback, ::backdrop, the notch-mask
  builds, and the overrides of the unlayered jx-surface ::after/::before
  law (unlayered themselves, with natural specificity: a layered copy
  could never beat the law).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import { cn } from '$lib/utils';
  import './tooltip.css';

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
    /** delay before hover opens (ms); 0 (default) shows the tip
        immediately — opt in for sweep-heavy surfaces; focus opens
        immediately regardless */
    openDelay?: number;
    /** grace before closing, so the pointer can cross onto the tip */
    closeDelay?: number;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency). The shadow rides
        the law's static ::after veil, masked to the notch silhouette
        and offset to the panel's outward side (aimPin sets
        --jx-surface-ox/oy at open). */
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
    openDelay = 0,
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

  // Author the notch mask and the slide vector once, at open — the same
  // moment position-try settles the panel's own flip (see Chromium
  // constraint in the header). Everything is plain px/data-URIs on
  // custom properties; no anchor() anywhere. Sets, on the panel:
  // --jx-tip-shape (the body's silhouette mask), the --jx-surface-ring
  // pair (the border ring's subtract layers), and the --jx-surface-in-*
  // slide vector (measured from the post-flip geometry — the kernel
  // reads it through var() at animation time).
  // anchor-positioning capability (Codex r2): without it the panel sits
  // at viewport-center — a notch aimed at nothing is noise, and the
  // arrow CSS is @supports-gated to match
  const anchored = (): boolean =>
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name: --jx-tip-fallback');

  function aimPin(): void {
    if (!panel || !body || !anchorEl || !anchored()) return;
    const r = body.getBoundingClientRect();
    const a = anchorEl.getBoundingClientRect();
    const w = r.width;
    const side: 'top' | 'bottom' = r.top + r.bottom < a.top + a.bottom ? 'bottom' : 'top';
    // the notch trio is arrow-only (Codex r1): a plain tip's shadow must
    // stay rectangular — writing the ring vars unconditionally cut it
    if (arrow) {
      const target =
        aimSide === 'left' ? a.left : aimSide === 'right' ? a.right : (a.left + a.right) / 2;
      const x = Math.min(Math.max(target - r.left, EDGE), Math.max(w - EDGE, EDGE));
      panel.style.setProperty('--jx-tip-shape', svgUrl(w, r.height, shapePath(w, r.height, x, side)));
      panel.style.setProperty('--jx-surface-ring', svgUrl(w, r.height, shapePath(w, r.height, x, side)));
      panel.style.setProperty(
        '--jx-surface-ring-inner',
        svgUrl(w, r.height, ringInnerPath(w, r.height, x, side)),
      );
    }
    panel.dataset.side = side;
    // slide + shadow vectors from the MEASURED geometry (Codex r1: the
    // requested aim ignores flip-inline — the panel can end up on the
    // other side, and the slide/shadow must follow the REAL position):
    // both signs read from the rects like popover's verifyDirection
    // (4px dead zone on x), so the panel arrives from — and the shadow
    // falls to — its actual outward side, never onto the anchor.
    const sign = (d: number): -1 | 0 | 1 => (Math.abs(d) < 4 ? 0 : (Math.sign(d) as -1 | 0 | 1));
    const sx = sign(r.left + r.width / 2 - (a.left + a.width / 2));
    const sy: -1 | 1 = side === 'bottom' ? -1 : 1;
    panel.style.setProperty('--jx-surface-in-x', sx === 0 ? '0px' : `${sx * 12}px`);
    panel.style.setProperty('--jx-surface-in-y', `${sy * 12}px`);
    panel.style.setProperty('--jx-surface-ox', sx === 0 ? '0px' : `${sx * 6}px`);
    panel.style.setProperty('--jx-surface-oy', `${sy * 6}px`);
  }

  // ── MOTION KERNEL (2026-08-23 r2: popover.svelte's choreography,
  // VERBATIM — three layers: the platform panel, the surface body and a
  // REAL shadow child (pseudo-elements are unreachable from WAAPI, so a
  // static ::after veil cannot join the choreography; the earlier
  // two-layer port collapsed phase A's slide into the rest position and
  // dropped phase B's layer separation entirely — Owner report). The
  // only structural simplification: no direction predict/verify/replay —
  // aimPin's rect read at open already knows the post-flip side, so the
  // slide/shadow vectors are measured, not predicted. Same two laws as
  // popover.svelte: (1) opacity is animated ONLY while the kernel pins
  // the materials OPAQUE (an animated opacity activates the compositor's
  // opacity channel and breaks backdrop-filter blur); (2) no lingering
  // fills — every phase is canceled the moment its successor owns the
  // values, the one exception being the exit tail's forwards fill
  // (holds opacity 0 until display:none). ──
  const PHASE_MS = 230; // must match the law's allow-discrete window (460/230)
  const EASE = 'linear';
  const DEFOCUS = 'blur(100px)';
  let solidBg = ''; // opaque fill, re-resolved per open (theme-safe)
  let glassBg = ''; // translucent acrylic fill, read per open
  let veilBg = ''; // the shadow layer's translucent veil, read per open
  let veilSolid = ''; // the veil's opaque form (pure shadow color)

  interface CSSElementAnimationLike extends Animation {
    __jxKernel?: boolean;
  }

  const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** resolve a custom property through ONE level of var() nesting */
  function resolveVar(el: HTMLElement, name: string, fallbackName: string): string {
    const cs = getComputedStyle(el);
    const raw = cs.getPropertyValue(name).trim();
    const target = raw || `var(${fallbackName})`;
    const varRef = /^var\(\s*(--[\w-]+)\s*\)$/.exec(target);
    return (varRef ? cs.getPropertyValue(varRef[1]).trim() : target) || cs.getPropertyValue(fallbackName).trim();
  }

  const surface = (): { p: HTMLElement; b: HTMLElement; sh: HTMLElement } | null => {
    const p = panel;
    const b = p?.querySelector<HTMLElement>('.jx-tip-body');
    const sh = p?.querySelector<HTMLElement>('.jx-tip-shadow');
    return p && b && sh ? { p, b, sh } : null;
  };

  function kernelAnims(): Animation[] {
    const out: Animation[] = [];
    for (const el of [panel, panel?.querySelector('.jx-tip-body'), panel?.querySelector('.jx-tip-shadow')]) {
      if (!el || typeof (el as HTMLElement).getAnimations !== 'function') continue;
      for (const a of (el as HTMLElement).getAnimations()) {
        if ((a as CSSElementAnimationLike).__jxKernel) out.push(a);
      }
    }
    return out;
  }

  function anim(el: HTMLElement, frames: Keyframe[], fill: FillMode = 'both'): Animation {
    const a = el.animate(frames, { duration: PHASE_MS, easing: EASE, fill });
    (a as CSSElementAnimationLike).__jxKernel = true;
    return a;
  }

  const IN = () => `var(--jx-surface-in-x, 0px) var(--jx-surface-in-y, 6px)`;
  const SHADOW = () => `var(--jx-surface-ox, 6px) var(--jx-surface-oy, 6px)`;

  function playEntry(): void {
    const s = surface();
    if (!s || typeof s.p.animate !== 'function') return; // jsdom etc.
    const { p, b, sh } = s;
    const token = runToken;
    const alive = () => token === runToken && p.isConnected;
    const liveOp = getComputedStyle(p).opacity;
    for (const a of kernelAnims()) a.cancel();
    // release the previous run's inline pins — the entry owns every channel
    p.style.opacity = '';
    p.style.filter = '';
    p.style.translate = '';
    sh.style.translate = '';
    b.style.backgroundColor = '';
    sh.style.backgroundColor = '';
    if (prefersReducedMotion()) return;
    glassBg = getComputedStyle(b).backgroundColor;
    veilBg = getComputedStyle(sh).backgroundColor;
    // re-resolve the theme-dependent opaque values EVERY open — a cached
    // value would go stale across a light/dark switch
    solidBg = resolveVar(p, '--jx-surface-solid-fill', '--popover') || glassBg;
    veilSolid = resolveVar(p, '--shadow-color', '--shadow-color');

    // PHASE A — the kernel-pinned OPAQUE window (ALL layers opaque, the
    // shadow merged flush under the panel): fade + defocus + slide to
    // the shadow's spot
    const bodyA = anim(b, [{ backgroundColor: solidBg }, { backgroundColor: solidBg }]);
    const shadowA = anim(sh, [
      { translate: '0 0', backgroundColor: veilSolid },
      { translate: '0 0', backgroundColor: veilSolid },
    ]);
    const panelA = anim(p, [
      { opacity: Number.parseFloat(liveOp) || 0, translate: IN(), filter: DEFOCUS },
      { opacity: 1, offset: 0.5, filter: 'blur(50px)' },
      { opacity: 1, translate: SHADOW(), filter: 'blur(0px)' },
    ]);
    panelA.finished
      .then(() => {
        if (!alive() || !p.matches(':popover-open')) return;
        // pin opacity 1 INLINE for phase B: the kernel cascade rests at 0
        p.style.opacity = '1';
        bodyA.cancel();
        shadowA.cancel();
        panelA.cancel(); // phase B starts exactly where A ended
        // PHASE B — separation (no opacity anywhere): the panel rises to
        // rest while the shadow's ABSOLUTE position stays put — its
        // relative offset grows to the shadow offset as the veil develops
        const bodyB = anim(b, [{ backgroundColor: solidBg }, { backgroundColor: glassBg }]);
        const shadowB = anim(sh, [
          { translate: '0 0', backgroundColor: veilSolid },
          { translate: SHADOW(), backgroundColor: veilBg },
        ]);
        const panelB = anim(p, [{ translate: SHADOW() }, { translate: '0px 0px' }]);
        panelB.finished
          .then(() => {
            if (!alive() || !p.matches(':popover-open')) return;
            // pin the REST POSE INLINE, then release every fill (Law 2)
            p.style.translate = '0px 0px';
            p.style.opacity = '1';
            b.style.backgroundColor = glassBg;
            sh.style.translate = SHADOW();
            sh.style.backgroundColor = veilBg;
            bodyB.cancel();
            shadowB.cancel();
            panelB.cancel();
          })
          .catch(() => {}); // mid-entry close aborts — nothing to do
      })
      .catch(() => {});
  }

  function playExit(): void {
    const s = surface();
    if (!s || typeof s.p.animate !== 'function') return;
    const { p, b, sh } = s;
    const token = runToken;
    const alive = () => token === runToken; // exit B' must run even detached-ish; only destroy blocks
    // snapshot the CURRENT live values BEFORE canceling: closing
    // mid-entry must stay continuous
    const curBg = getComputedStyle(b).backgroundColor;
    const curT = getComputedStyle(p).translate === 'none' ? '0px 0px' : getComputedStyle(p).translate;
    const curShBg = getComputedStyle(sh).backgroundColor;
    const curShT = getComputedStyle(sh).translate === 'none' ? '0px 0px' : getComputedStyle(sh).translate;
    const curOp = getComputedStyle(p).opacity;
    const curFilter = getComputedStyle(p).filter;
    // freeze EVERY animated channel INLINE before canceling — after the
    // cancel each cascade resolves to its CLOSED state
    p.style.opacity = curOp;
    p.style.filter = curFilter;
    p.style.translate = curT;
    sh.style.translate = curShT;
    b.style.backgroundColor = curBg;
    sh.style.backgroundColor = curShBg;
    for (const a of kernelAnims()) a.cancel();
    if (prefersReducedMotion()) return;
    const solid = solidBg || curBg;
    if (!veilSolid) veilSolid = resolveVar(p, '--shadow-color', '--shadow-color');

    // PHASE A' — solidify + merge (translate + fills only; the frozen
    // inline opacity/filter hold the panel's live look)
    const bodyA = anim(b, [{ backgroundColor: curBg }, { backgroundColor: solid }]);
    const shadowA = anim(sh, [
      { translate: curShT, backgroundColor: curShBg },
      { translate: '0 0', backgroundColor: veilSolid },
    ]);
    const panelA = anim(p, [{ translate: curT }, { translate: SHADOW() }]);
    panelA.finished
      .then(() => {
        if (!alive() || p.matches(':popover-open')) return; // reopened mid-flight
        panelA.cancel(); // B' owns the panel now (its fill would fight)
        // PHASE B' — merged opaque composite: defocus + slide + fade,
        // FROM THE FROZEN LIVE opacity/filter
        anim(
          p,
          [
            { translate: SHADOW(), opacity: curOp, filter: curFilter },
            { translate: IN(), opacity: 0, filter: DEFOCUS },
          ],
          'forwards', // holds opacity 0 until display:none — no cancel (Law 2 exception)
        );
      })
      .catch(() => {});
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
    // 0 (the default) opens synchronously — a setTimeout(…, 0) would
    // still defer to the next macrotask and read as a lag
    if (openDelay <= 0) {
      open();
      return;
    }
    openTimer = setTimeout(open, openDelay);
  }
  function onLeave(): void {
    clearTimeout(openTimer);
    closeTimer = setTimeout(close, closeDelay);
  }

  // run/destroy token (Codex r2): a phase continuation queued as a
  // microtask can still fire AFTER onDestroy canceled the live
  // animations — every .then() re-validates before creating successors
  let runToken = 0;

  // pending intent timers AND kernel animations must never outlive the
  // component (Codex r1: un-canceled WAAPI keeps animating detached DOM)
  onDestroy(() => {
    runToken++;
    clearTimers();
    for (const a of kernelAnims()) a.cancel();
  });

  // THE toggle seam (popover.svelte's): open state read LIVE from
  // :popover-open at fire time — ToggleEvent state fields are never
  // trusted. Open authors the notch + slide vector (pre-recalc) and
  // plays the entry; close plays the exit (the jx-waapi law holds
  // display+overlay through the run).
  function onTipToggle(): void {
    if (!panel) return;
    if (panel.matches(':popover-open')) {
      aimPin();
      playEntry();
    } else {
      playExit();
    }
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<!-- svelte-ignore a11y_no_static_element_interactions -- the wrapper is
     not an interactive control; hover/focus intent is decoration riding
     over whatever focusable trigger the consumer composed inside -->
<span
  class={cn('jx-tip-anchor inline-flex', className)}
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
  class="jx-tip jx-surface jx-waapi fixed w-fit max-w-[min(80vw,18rem)] text-xs leading-[1.5] text-center text-popover-foreground"
  data-variant={variant}
  data-arrow={arrow ? '' : undefined}
  data-border-ring={arrow ? '' : undefined}
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={onTipToggle}
  onpointerenter={() => clearTimeout(closeTimer)}
  onpointerleave={onLeave}
>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from WAAPI — the kernel animates it in lockstep
       (popover r18 law), masked to the notch silhouette -->
  <div class="jx-tip-shadow jx-surface-shadow" aria-hidden="true"></div>
  <!-- surface body (fill + acrylic blur + silhouette mask); the popover
       element paints nothing (floating-surface law arch r3) and carries
       the border-ring ::before for the masked outline -->
  <span class="jx-tip-body jx-surface-body block px-[9px] py-[5px]" bind:this={body}>{text}</span>
</div>
