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
    placement     anchored inset-area: 'bottom' | 'bottom-end' | 'top' |
                  'top-end' | 'top-start' | 'bottom-start' (default
                  'bottom-end' — under the trigger, right edges aligned)
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
    placement?: 'bottom' | 'bottom-end' | 'top' | 'top-end' | 'top-start' | 'bottom-start';
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
      // predict BEFORE the panel's first style recalc so the first
      // frame carries the correct vector
      const { sx, sy } = predictDirection();
      applyDirection(panel, sx, sy);
      playEntry();
      requestAnimationFrame(verifyDirection);
    } else if (panel) {
      playExit();
    }
    onToggle?.(open);
  }

  // ── MOTION KERNEL (Owner rulings, 2026-08-22 r12 → 2026-08-23 r19) ──
  // Division of labor: CSS lays out and statically paints; EVERY
  // animation — panel, body, and the REAL shadow element — runs here
  // in WAAPI (the ::after fallback is content:none on kernel
  // components). Two laws:
  //
  // 1. OPACITY CHANNEL LAW — an animated opacity (even a constant 1)
  //    activates the compositor's opacity channel and breaks
  //    backdrop-filter blur. Opacity is therefore animated ONLY at
  //    runtime, ONLY while the kernel pins the materials OPAQUE
  //    (entry phase A fades 0→1; exit phase B' fades 1→0 after A'
  //    has solidified the composite).
  // 2. NO LINGERING FILLS — a filled animation left on a rendered
  //    element defers backdrop-filter rasterization (the
  //    blur-appears-minutes-later bug). Every phase is canceled the
  //    moment its successor owns the values, and at entry-rest (end
  //    values equal the cascade). The one exception: the exit tail's
  //    forwards fill must survive until display:none — canceling it
  //    snaps opacity back to 1 for a visible frame (the exit flicker).
  //
  // Choreography (230ms per phase, linear — segments only join
  // smoothly on a flat easing):
  //   ENTRY  A: opaque bg; opacity 0→1 + DEFOCUS resolve + slide to the
  //            shadow's spot (panel & shadow merged)
  //          B: separation — panel rises to 0, materials' alphas develop
  //            (all three layers WAAPI), the shadow's ABSOLUTE position
  //            never moves
  //   EXIT   A': mirror — solidify + merge, opacity untouched, starting
  //            from the CURRENT live values (closing mid-entry stays
  //            continuous — no snap to the cascade first)
  //          B': the merged opaque composite defocuses, slides out and
  //            fades — the exact reverse of entry A
  const PHASE_MS = 230;
  const EASE = 'linear';
  const DEFOCUS = 'blur(100px)';
  let solidBg = ''; // opaque fill, re-resolved per open (theme-safe)
  let glassBg = ''; // translucent acrylic fill, read per open
  let veilBg = ''; // the shadow layer's translucent veil, read per open
  let veilSolid = ''; // the veil's opaque form (pure shadow color)

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
    const b = p?.querySelector<HTMLElement>('.jx-pop-body');
    const sh = p?.querySelector<HTMLElement>('.jx-pop-shadow');
    return p && b && sh ? { p, b, sh } : null;
  };

  /** kernel-owned animations on the panel and the body */
  function kernelAnims(): Animation[] {
    const out: Animation[] = [];
    for (const el of [panel, panel?.querySelector('.jx-pop-body'), panel?.querySelector('.jx-pop-shadow')]) {
      if (!el) continue;
      for (const a of el.getAnimations()) {
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

  // The kernel owns these layers from MOUNT time — the inline lock is
  // permanent, so the CSS fallback sequences can never race the first
  // open (the first-open flash with no DEFOCUS was exactly that race)
  $effect(() => {
    const s = surface();
    if (!s) return;
    s.p.style.animation = 'none';
    s.b.style.animation = 'none';
    if (!solidBg && !s.p.matches(':popover-open')) {
      solidBg = resolveVar(s.p, '--jx-surface-solid-fill', '--popover');
    }
  });

  const vec = (v: string, f: string): string => `var(${v}, ${f})`;
  const IN = () => vec('--jx-surface-in-x', '0px') + ' ' + vec('--jx-surface-in-y', '6px');
  const SHADOW = () => vec('--jx-surface-ox', '6px') + ' ' + vec('--jx-surface-oy', '6px');

  /** replay = the direction-correction restart: same choreography, but
   *  opacity stays 1 (the panel is already visible — resetting it was
   *  the first-open flash) */
  function playEntry(replay = false): void {
    const s = surface();
    if (!s) return;
    const { p, b, sh } = s;
    // snapshot the LIVE opacity BEFORE canceling — the replay's first
    // keyframe must resume the in-flight fade; reading after the cancel
    // would return the cascade's 1 and jump the panel bright (Codex r2)
    const liveOp = getComputedStyle(p).opacity;
    for (const a of kernelAnims()) a.cancel();
    // release the previous run's inline pins (rest pins from the last
    // entry, freeze pins from a close) — the entry phases own every
    // channel from here
    p.style.opacity = '';
    p.style.filter = '';
    p.style.translate = '';
    sh.style.translate = '';
    b.style.backgroundColor = '';
    sh.style.backgroundColor = '';
    if (prefersReducedMotion()) return;
    glassBg = getComputedStyle(b).backgroundColor; // open cascade (kernel lock ⇒ no CSS animation on it)
    veilBg = getComputedStyle(sh).backgroundColor; // the veil at rest
    // re-resolve the theme-dependent opaque values EVERY open — a
    // cached value would go stale across a light/dark switch
    solidBg = resolveVar(p, '--jx-surface-solid-fill', '--popover');
    veilSolid = resolveVar(p, '--shadow-color', '--shadow-color');
    const solid = solidBg || glassBg;

    // PHASE A — the kernel-pinned OPAQUE window (ALL layers opaque,
    // the shadow merged flush under the panel)
    const bodyA = anim(b, [{ backgroundColor: solid }, { backgroundColor: solid }]);
    const shadowA = anim(sh, [
      { translate: '0 0', backgroundColor: veilSolid },
      { translate: '0 0', backgroundColor: veilSolid },
    ]);
    const panelA = anim(
      p,
      // replay resumes the fade FROM ITS CURRENT VALUE — pinning 1
      // here snapped 0.1→1 at the restart (the residual first-open
      // flash); the defocus restarts fully (sub-visible at this depth)
      replay
        ? [
            { opacity: liveOp, translate: IN(), filter: DEFOCUS },
            { opacity: 1, translate: SHADOW(), filter: 'blur(0px)' },
          ]
        : [
            { opacity: 0, translate: IN(), filter: DEFOCUS },
            { opacity: 1, offset: 0.5, filter: 'blur(50px)' },
            { opacity: 1, translate: SHADOW(), filter: 'blur(0px)' },
          ],
    );
    panelA.finished
      .then(() => {
        if (!p.matches(':popover-open')) return;
        // pin opacity 1 INLINE for phase B: the kernel cascade rests at
        // 0 (first-frame law) and phase B never carries opacity, so
        // without the pin the panel vanishes during separation
        p.style.opacity = '1';
        bodyA.cancel();
        shadowA.cancel();
        panelA.cancel(); // phase B starts exactly where A ended
        // PHASE B — separation (no opacity anywhere): the panel rises
        // while the shadow's ABSOLUTE position stays put — its relative
        // offset grows to the shadow offset as the veil develops
        const bodyB = anim(b, [{ backgroundColor: solid }, { backgroundColor: glassBg }]);
        const shadowB = anim(sh, [
          { translate: '0 0', backgroundColor: veilSolid },
          { translate: SHADOW(), backgroundColor: veilBg },
        ]);
        const panelB = anim(p, [{ translate: SHADOW() }, { translate: '0 0' }]);
        panelB.finished
          .then(() => {
            // pin the REST POSE INLINE, then release every fill so
            // nothing lingers over the open panel (Law 2). The inline
            // pins are load-bearing: once :popover-open drops, the
            // cascade flips to the CLOSED state (panel IN(), body solid,
            // shadow veil) — without the pins the next close would
            // snapshot the flipped cascade and the exit would start
            // from the entry's far spot (the direction-reversal bug,
            // Owner report 2026-08-23 r20)
            p.style.translate = '0px 0px';
            p.style.opacity = '1'; // the kernel cascade rests at 0 (r21)
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
    if (!s) return;
    const { p, b, sh } = s;
    // snapshot the CURRENT live values BEFORE canceling: closing
    // mid-entry must stay continuous (cancel-first snapped the panel
    // to the cascade — the exit-start jerk)
    const curBg = getComputedStyle(b).backgroundColor;
    const curT = getComputedStyle(p).translate === 'none' ? '0px 0px' : getComputedStyle(p).translate;
    const curShBg = getComputedStyle(sh).backgroundColor;
    const curShT = getComputedStyle(sh).translate === 'none' ? '0px 0px' : getComputedStyle(sh).translate;
    const curOp = getComputedStyle(p).opacity;
    const curFilter = getComputedStyle(p).filter;
    // freeze EVERY animated channel INLINE before canceling: after the
    // cancel each cascade resolves to its CLOSED state (panel IN(),
    // body solid) and any unprotected channel showed a naked cascade
    // frame — the panel flashing to the entry start read as the entry
    // replaying (r20). The frozen opacity/filter also keep phase A'
    // free of those channels (materials may still be translucent)
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
        if (p.matches(':popover-open')) return; // reopened mid-flight
        panelA.cancel(); // B' owns the panel now (its fill would fight)
        // bodyA + shadowA hold the OPAQUE fills through B' (the closed
        // cascade resolves the translucent variant — Law 1 forbids
        // opacity motion over it); the shadow stays merged (relative
        // 0) and rides out with the panel
        // PHASE B' — merged opaque composite: defocus + slide + fade,
        // FROM THE FROZEN LIVE opacity/filter (mid-entry closes stay
        // continuous; the materials are opaque by now, so the opacity
        // channel is harmless)
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

  // ── DIRECTION KERNEL ──
  // ONE vector, TWO magnitudes: slide distance (--jx-surface-in-*, 12px)
  // and shadow offset (--jx-surface-ox/oy, 6px) share their signs, so
  // the shadow always falls to the panel's outward side.
  let lastPanelW = 0;
  let lastPanelH = 0;

  function applyDirection(p: HTMLElement, sx: -1 | 0 | 1, sy: -1 | 0 | 1): void {
    p.style.setProperty('--jx-surface-in-x', sx === 0 ? '0px' : `${sx * 12}px`);
    p.style.setProperty('--jx-surface-in-y', sy === 0 ? '0px' : `${sy * 12}px`);
    p.style.setProperty('--jx-surface-ox', sx === 0 ? '0px' : `${sx * 6}px`);
    p.style.setProperty('--jx-surface-oy', sy === 0 ? '0px' : `${sy * 6}px`);
  }

  /** synchronous, in the toggle event (before the first style recalc):
   *  the authored placement plus a position-try flip prediction from
   *  the anchor's live rect and the panel's last-known size (a
   *  physical cache — sizes are stable across opens, directions are
   *  not, so this can never go stale the way a cached vector would) */
  function predictDirection(): { sx: -1 | 0 | 1; sy: -1 | 0 | 1 } {
    let sx: -1 | 0 | 1 = placement.endsWith('-start') ? -1 : placement.endsWith('-end') ? 1 : 0;
    let sy: -1 | 0 | 1 = placement.startsWith('top') ? -1 : 1;
    if (anchorEl && lastPanelH > 0) {
      const ar = anchorEl.getBoundingClientRect();
      const gap = 24;
      const fitsBelow = window.innerHeight - ar.bottom > lastPanelH + gap;
      const fitsAbove = ar.top > lastPanelH + gap;
      if (sy > 0 && !fitsBelow && fitsAbove) sy = -1;
      else if (sy < 0 && !fitsAbove && fitsBelow) sy = 1;
      const fitsAfter = window.innerWidth - ar.right > lastPanelW + gap;
      const fitsBefore = ar.left > lastPanelW + gap;
      if (sx > 0 && !fitsAfter && fitsBefore) sx = -1;
      else if (sx < 0 && !fitsBefore && fitsAfter) sx = 1;
    }
    return { sx, sy };
  }

  /** one frame in: the panel's REAL geometry is readable. Agreement →
   *  nothing to do. Misprediction → replay the entry on the measured
   *  vector (same frame cancel+replay; opacity stays 1 — sub-visible) */
  function verifyDirection(): void {
    const s = surface();
    if (!s || !anchorEl || !s.p.matches(':popover-open')) return;
    lastPanelW = s.p.offsetWidth;
    lastPanelH = s.p.offsetHeight;
    const pr = s.p.getBoundingClientRect();
    const ar = anchorEl.getBoundingClientRect();
    const sign = (d: number): -1 | 0 | 1 => (Math.abs(d) < 4 ? 0 : (Math.sign(d) as -1 | 0 | 1));
    const sx = sign(pr.left + pr.width / 2 - (ar.left + ar.width / 2));
    const sy = sign(pr.top + pr.height / 2 - (ar.top + ar.height / 2));
    const agreed =
      s.p.style.getPropertyValue('--jx-surface-in-x') === (sx === 0 ? '0px' : `${sx * 12}px`) &&
      s.p.style.getPropertyValue('--jx-surface-in-y') === (sy === 0 ? '0px' : `${sy * 12}px`);
    if (!agreed) {
      applyDirection(s.p, sx, sy);
      playEntry(true);
    }
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
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
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
