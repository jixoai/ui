/**
 * jixoai scroll-area-kit — THE HAND-DRAWN INTERACTION ADAPTER
 * (registry/files/lib/scroll-area-kit/hand-drawn.svelte.ts, Owner
 * 2026-09-15). PART (b) of the kit's concern split — consumed ONLY by
 * the hand-drawn component (scroll-area). NEVER by the platform
 * sibling: native-scroll-area has no drawn thumb, and role="scrollbar"
 * on a nonexistent thumb is a violation, not a feature (the Gate-1 r1
 * ruling). The platform bar IS that sibling's accessibility contract.
 *
 * WHAT THIS ADAPTER OWNS:
 *   - the idle-fade timer (~700ms) and the FOUR auto-hide pins, each
 *     separately suspendable: region focus-within, thumb focus,
 *     active drag, hover. "AT-engaged" is not a detectable platform
 *     state and is deliberately NOT a pin — the four pins cover
 *     keyboard and AT users by construction. While ANY pin holds, the
 *     thumb node stays in the accessibility tree with its role intact
 *     and aria-valuenow tracking position (the fade is opacity-only;
 *     it never unmounts and never aria-hides a pinned thumb).
 *   - drag pinning (pointer capture, the carousel law), hover growth
 *     (the consumer's css widens on :hover — this adapter only keeps
 *     the thumb LIVE while hovered), keyboard scrolling (the thumb is
 *     keyboard-draggable: arrows step, PageUp/PageDown page,
 *     Home/End jump), and track-click paging.
 *   - the thumb's A11Y CONTRACT: role="scrollbar", aria-controls (the
 *     named viewport), aria-valuenow (0..100, live), aria-orientation,
 *     tabindex — stamped and maintained HERE, on nodes the consumer
 *     renders bare. Behavior lives in the kit; paint lives in the
 *     consumer (scroll-area.css owns the capsule look).
 *
 * Zero paint of its own: the adapter writes geometry inline styles
 * (size/offset — the math from the core) and data attributes the
 * consumer's sheet keys on. It never touches classes or colors.
 */

import {
  inlineMeasure,
  measureAxis,
  regionVerdicts,
  scrollInlineTo,
  thumbGeometry,
  dragFactor,
  type OverflowVerdict,
  type ScrollAxis,
} from './core';

/** the idle-fade delay — the family's standing ~700ms */
export const IDLE_FADE_MS = 700;

export interface ThumbNodes {
  /** the vertical thumb (null when the orientation excludes it) */
  readonly y?: HTMLElement | null;
  /** the horizontal thumb (null when the orientation excludes it) */
  readonly x?: HTMLElement | null;
}

export interface TrackNodes {
  readonly y?: HTMLElement | null;
  readonly x?: HTMLElement | null;
}

export interface HandDrawnOptions {
  /** the component's outer box — hover pin scope + pin stamp host */
  readonly region: HTMLElement;
  /** the scrollport — the scroller, the keyboard surface, the
   * aria-controls target (it must carry the given id) */
  readonly viewport: HTMLElement;
  /** the content wrapper inside the viewport — membership observation
   * root (rows coming or going re-verdict the chrome) */
  readonly content: HTMLElement;
  /** the thumb nodes, rendered bare by the consumer */
  readonly thumbs: ThumbNodes;
  /** the track lanes (optional — track-click paging wires when present) */
  readonly tracks?: TrackNodes;
  /** the viewport's id — feeds aria-controls on every thumb */
  readonly viewportId: string;
  /** verdict sink — the component stamps data-verdict-y/x (its own
   * attributes; the adapter never writes them itself) */
  readonly onverdict?: (verdicts: Record<ScrollAxis, OverflowVerdict>) => void;
}

export interface HandDrawnHandle {
  /** re-run the sync by hand (re-measure after external mutations) */
  update(): void;
  /** the live pin channels — for probes and tests */
  pins(): { hover: boolean; drag: boolean; focus: boolean };
  destroy(): void;
}

/** the keyboard step — one tenth of the port per arrow press */
const arrowStep = (client: number): number => Math.max(16, Math.round(client / 10));

/**
 * Mount the hand-drawn interaction on a rendered region. ONE rAF-
 * throttled sync reads geometry (the core's math) and writes thumb
 * inline styles + ARIA; liveness (show/fade/pins) rides scroll, hover,
 * focus and drag. Re-measure triggers: scroll (passive), viewport +
 * content resize (ResizeObserver), content MEMBERSHIP mutation
 * (childList — rows removed can retire the scroll distance entirely),
 * the page's return to the foreground (backgrounded tabs queue scroll
 * events UNDELIVERED — the wake restamp), and the font set settling
 * (late fonts re-widen content).
 */
export function createHandDrawnScrollbar(options: HandDrawnOptions): HandDrawnHandle {
  const { region, viewport, content, viewportId } = options;
  const thumbs: Partial<Record<ScrollAxis, HTMLElement | null>> = {
    y: options.thumbs.y ?? null,
    x: options.thumbs.x ?? null,
  };
  const tracks: Partial<Record<ScrollAxis, HTMLElement | null>> = {
    y: options.tracks?.y ?? null,
    x: options.tracks?.x ?? null,
  };
  const REDUCED = '(prefers-reduced-motion: reduce)';
  const fineMatches = (): boolean =>
    typeof matchMedia === 'function' ? matchMedia('(pointer: fine)').matches : true;
  const reduced = (): boolean =>
    typeof matchMedia === 'function' ? matchMedia(REDUCED).matches : false;

  let raf = 0;
  let hideTimer = 0;
  let live = false;
  let hovering = false;
  let dragging = false;
  let alive = true;

  // ---- the pins ─────────────────────────────────────────────────────
  // focus-within covers BOTH focus pins' machinery (the region holds
  // focus within — e.g. the named viewport — and the thumb's own
  // focus); they are driven and probed as separate inputs
  const focusPinned = (): boolean =>
    typeof document !== 'undefined' && region.contains(document.activeElement);
  const pinned = (): boolean => hovering || dragging || focusPinned();
  const stamp = (el: HTMLElement, name: string, on: boolean): void => {
    if (on) el.setAttribute(name, 'on');
    else el.removeAttribute(name);
  };
  const stampPins = (): void => {
    stamp(region, 'data-pin-hover', hovering);
    stamp(region, 'data-pin-drag', dragging);
    stamp(region, 'data-pin-focus', focusPinned());
  };

  // ---- liveness ─────────────────────────────────────────────────────
  const setLive = (on: boolean): void => {
    if (live === on) return;
    live = on;
    stamp(region, 'data-thumb-live', on);
  };

  const scheduleFade = (): void => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = 0;
    // reduced motion keeps the chrome statically visible (the standing
    // law); a pinned region never even schedules the fade
    if (pinned() || reduced()) return;
    hideTimer = window.setTimeout(() => {
      hideTimer = 0;
      if (alive && !pinned()) setLive(false);
    }, IDLE_FADE_MS);
  };

  const show = (): void => {
    setLive(true);
    scheduleFade();
  };

  // ---- the geometry sync ────────────────────────────────────────────
  /** THE THUMB'S A11Y CONTRACT — mounted here, never by the consumer */
  const thumbAria = (thumb: HTMLElement, axis: ScrollAxis): void => {
    thumb.setAttribute('role', 'scrollbar');
    thumb.setAttribute('aria-controls', viewportId);
    thumb.setAttribute('aria-orientation', axis === 'y' ? 'vertical' : 'horizontal');
    thumb.setAttribute('aria-valuemin', '0');
    thumb.setAttribute('aria-valuemax', '100');
    thumb.setAttribute('tabindex', '0');
  };

  const sync = (): void => {
    raf = 0;
    if (!alive) return;
    // READ pass — every geometry query before the first style write
    const verdicts = regionVerdicts(viewport);
    const reads: { axis: ScrollAxis; thumb: HTMLElement; client: number; scroll: number; offset: number }[] = [];
    for (const axis of ['y', 'x'] as const) {
      const thumb = thumbs[axis];
      if (!thumb) continue;
      const m = axis === 'y' ? measureAxis(viewport, axis) : inlineMeasure(viewport);
      reads.push({ axis, thumb, ...m });
    }
    // WRITE pass — verdicts out, then geometry + aria per thumb
    options.onverdict?.(verdicts);
    for (const { axis, thumb, client, scroll, offset } of reads) {
      const geo = thumbGeometry(client, scroll, offset);
      thumbAria(thumb, axis);
      if (!geo.shown) {
        // no verdict — no chrome: the affordance leaves the tab order
        // and the tree (hidden, not merely faded)
        thumb.removeAttribute('aria-valuenow');
        thumb.hidden = true;
        thumb.style.removeProperty(axis === 'y' ? 'block-size' : 'inline-size');
        thumb.style.removeProperty(axis === 'y' ? 'inset-block-start' : 'inset-inline-start');
        continue;
      }
      thumb.hidden = false;
      // logical geometry: size as the ratio, offset as the position
      // along the remaining lane — inset-inline-start mirrors under
      // RTL for free (the position fraction is logical travel)
      thumb.setAttribute('aria-valuenow', String(Math.round(geo.position * 100)));
      if (axis === 'y') {
        thumb.style.blockSize = `${(geo.ratio * 100).toFixed(3)}%`;
        thumb.style.insetBlockStart = `${(geo.position * (1 - geo.ratio) * 100).toFixed(3)}%`;
      } else {
        thumb.style.inlineSize = `${(geo.ratio * 100).toFixed(3)}%`;
        thumb.style.insetInlineStart = `${(geo.position * (1 - geo.ratio) * 100).toFixed(3)}%`;
      }
    }
  };

  const scheduleSync = (): void => {
    if (!raf) raf = requestAnimationFrame(sync);
  };

  // ---- keyboard: the thumb is keyboard-draggable ────────────────────
  const onThumbKey = (axis: ScrollAxis) => (event: Event): void => {
    const ev = event as KeyboardEvent;
    const vertical = axis === 'y';
    const client = vertical ? viewport.clientHeight : viewport.clientWidth;
    const max = (vertical ? viewport.scrollHeight : viewport.scrollWidth) - client;
    if (max <= 1) return;
    const step = arrowStep(client);
    let delta = 0;
    const key = ev.key;
    if (vertical) {
      if (key === 'ArrowDown') delta = step;
      else if (key === 'ArrowUp') delta = -step;
      else if (key === 'PageDown') delta = client;
      else if (key === 'PageUp') delta = -client;
      else if (key === 'Home') delta = -max;
      else if (key === 'End') delta = max;
    } else {
      if (key === 'ArrowRight') delta = step;
      else if (key === 'ArrowLeft') delta = -step;
      else if (key === 'PageDown') delta = client;
      else if (key === 'PageUp') delta = -client;
      else if (key === 'Home') delta = -max;
      else if (key === 'End') delta = max;
    }
    if (!delta) return;
    ev.preventDefault();
    viewport.scrollBy(vertical ? { top: delta } : { left: delta });
  };

  // ---- drag: pointer capture, the carousel law ──────────────────────
  const onThumbDown = (axis: ScrollAxis) => (event: Event): void => {
    const ev = event as PointerEvent;
    const thumb = thumbs[axis];
    const track = tracks[axis];
    if (ev.button !== 0 || !thumb || thumb.hidden) return;
    const vertical = axis === 'y';
    // the lane: the track's own measure when it has one (a laid-out
    // browser track), else the viewport's client side (the classic
    // approximation — jsdom and pre-layout frames measure 0)
    const trackPx = Math.max(
      vertical ? track?.clientHeight ?? 0 : track?.clientWidth ?? 0,
      vertical ? viewport.clientHeight : viewport.clientWidth,
    );
    const client = vertical ? viewport.clientHeight : viewport.clientWidth;
    const scrollSize = vertical ? viewport.scrollHeight : viewport.scrollWidth;
    const factor = dragFactor(trackPx, client, scrollSize, vertical ? thumb.offsetHeight : thumb.offsetWidth);
    if (!factor) return;
    ev.preventDefault();
    try {
      thumb.setPointerCapture?.(ev.pointerId);
    } catch {
      /* engines without pointer capture: the move/up pair still
       * listens on the thumb — degraded but functional */
    }
    dragging = true;
    stampPins();
    show();

    const startPointer = vertical ? ev.clientY : ev.clientX;
    const m = axis === 'y' ? measureAxis(viewport, axis) : inlineMeasure(viewport);
    const startOffset = m.offset;

    const onMove = (moveEvent: Event): void => {
      const pointer = vertical ? (moveEvent as PointerEvent).clientY : (moveEvent as PointerEvent).clientX;
      const next = startOffset + (pointer - startPointer) * factor;
      if (vertical) viewport.scrollTop = next;
      else scrollInlineTo(viewport, next);
      scheduleSync();
    };
    const onUp = (upEvent: Event): void => {
      dragging = false;
      stampPins();
      try {
        thumb.releasePointerCapture?.((upEvent as PointerEvent).pointerId);
      } catch {
        /* see setPointerCapture above */
      }
      thumb.removeEventListener('pointermove', onMove);
      thumb.removeEventListener('pointerup', onUp);
      thumb.removeEventListener('pointercancel', onUp);
      show();
    };
    thumb.addEventListener('pointermove', onMove);
    thumb.addEventListener('pointerup', onUp);
    thumb.addEventListener('pointercancel', onUp);
  };

  // ---- track-click paging ───────────────────────────────────────────
  const onTrackDown = (axis: ScrollAxis) => (event: Event): void => {
    const ev = event as PointerEvent;
    const track = tracks[axis];
    const thumb = thumbs[axis];
    if (ev.button !== 0 || !track || !thumb || thumb.hidden) return;
    // the click's logical position along the track vs the thumb:
    // ahead of the thumb's midpoint → page forward, behind → page back
    const rect = track.getBoundingClientRect();
    const rtl = axis === 'x' && getComputedStyle(track).direction === 'rtl';
    const trackPx = axis === 'y' ? rect.height : rect.width;
    const raw = axis === 'y' ? ev.clientY - rect.top : ev.clientX - rect.left;
    const logical = rtl ? trackPx - raw : raw;
    const client = axis === 'y' ? viewport.clientHeight : viewport.clientWidth;
    const m = axis === 'y' ? measureAxis(viewport, axis) : inlineMeasure(viewport);
    const geo = thumbGeometry(m.client, m.scroll, m.offset);
    const thumbPx = axis === 'y' ? thumb.offsetHeight : thumb.offsetWidth;
    const thumbStart = geo.position * (1 - geo.ratio) * trackPx;
    const forward = logical > thumbStart + thumbPx * 0.5 ? 1 : -1;
    ev.preventDefault();
    if (axis === 'y') viewport.scrollBy({ top: forward * Math.max(1, client) });
    else viewport.scrollBy({ left: forward * Math.max(1, client) });
    show();
  };

  // ---- wiring ───────────────────────────────────────────────────────
  const onScroll = (): void => {
    show();
    scheduleSync();
  };
  const onEnter = (): void => {
    hovering = true;
    stampPins();
    show();
  };
  const onLeave = (): void => {
    hovering = false;
    stampPins();
    scheduleFade();
  };
  const onFocusIn = (): void => {
    stampPins();
    show();
  };
  const onFocusOut = (): void => {
    stampPins();
    scheduleFade();
  };

  viewport.addEventListener('scroll', onScroll, { passive: true });
  region.addEventListener('pointerenter', onEnter);
  region.addEventListener('pointerleave', onLeave);
  region.addEventListener('focusin', onFocusIn);
  region.addEventListener('focusout', onFocusOut);
  const downUp: { thumb: HTMLElement; down: (e: Event) => void; key: (e: Event) => void; track: HTMLElement | null; trackDown: ((e: Event) => void) | null }[] = [];
  for (const axis of ['y', 'x'] as const) {
    const thumb = thumbs[axis];
    if (!thumb) continue;
    const down = onThumbDown(axis);
    const key = onThumbKey(axis);
    thumb.addEventListener('pointerdown', down);
    thumb.addEventListener('keydown', key);
    const track = tracks[axis] ?? null;
    const trackDown = track ? onTrackDown(axis) : null;
    if (track && trackDown) track.addEventListener('pointerdown', trackDown);
    downUp.push({ thumb, down, key, track, trackDown });
  }

  const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleSync);
  ro?.observe(viewport);
  ro?.observe(content);
  const mo = typeof MutationObserver === 'undefined' ? null : new MutationObserver(scheduleSync);
  mo?.observe(content, { childList: true, subtree: true });
  const onWake = (): void => scheduleSync();
  document.addEventListener('visibilitychange', onWake);
  window.addEventListener('focus', onWake);
  document.fonts?.ready.then(() => {
    if (alive) scheduleSync();
  });

  sync();
  // chrome greets on fine pointers (then the idle fade owns it);
  // coarse pointers keep the platform's own momentum bars — the
  // consumer hides the drawn lanes there (an environmental floor,
  // never an API mode)
  if (fineMatches()) show();

  return {
    update: sync,
    pins: () => ({ hover: hovering, drag: dragging, focus: focusPinned() }),
    destroy() {
      alive = false;
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = 0;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      viewport.removeEventListener('scroll', onScroll);
      region.removeEventListener('pointerenter', onEnter);
      region.removeEventListener('pointerleave', onLeave);
      region.removeEventListener('focusin', onFocusIn);
      region.removeEventListener('focusout', onFocusOut);
      for (const { thumb, down, key, track, trackDown } of downUp) {
        thumb.removeEventListener('pointerdown', down);
        thumb.removeEventListener('keydown', key);
        if (track && trackDown) track.removeEventListener('pointerdown', trackDown);
      }
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('focus', onWake);
      ro?.disconnect();
      mo?.disconnect();
    },
  };
}
