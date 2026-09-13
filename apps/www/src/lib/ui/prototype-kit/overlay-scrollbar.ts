/**
 * prototype-kit overlay scrollbar (registry/files/ui/prototype-kit/overlay-scrollbar.ts).
 *
 * The #22 law: a kit surface's scrollbar must never take layout width
 * from the content it scrolls. A frame's viewport is the CONTRACT (a
 * 390px page frame stays 390px even when its content overflows), and
 * a classic scrollbar steals ~15px of it — the reflow the Owner saw.
 * The fix is the scroll-area family's OVERLAY scrollbar law
 * (scrollbar="overlay"), transplanted to documents the kit does not
 * own outright (frame documents served by /__design__/frame, the
 * /prototypes/ canvas page):
 *
 *   1. hide the native viewport scrollbar (scrollbar-width: none +
 *      ::-webkit-scrollbar { display: none }) — wheel, keyboard,
 *      touch and PageUp/Home scrolling stay native (W3C-first);
 *   2. paint a floating thumb (position: fixed, inset-inline-end)
 *      with the family's geometry law: height = client/scroll ratio
 *      of the track, top = scrollTop/scroll ratio; drag writes
 *      scrollTop back through pointer capture (the carousel law);
 *   3. auto-hide ~700ms after the last interaction; reduced-motion
 *      keeps the thumb standing. Fine pointers only — touch devices
 *      keep the native overlay scrollbars the platform already paints
 *      (a self-drawn thumb over touch momentum is the anti-pattern
 *      the family rules out).
 *
 * Why not #jixoai/scroll-virtual: that item is a TanStack LIST
 * VIRTUALIZER (windowing long row sets), not an overlay scrollbar,
 * and it would break the kit's zero-dependency law
 * (@tanstack/svelte-virtual + scroll-area edges). The scroll-area
 * item itself is a scroll CONTAINER — it cannot wrap a document it is
 * mounted INTO. Same law, document-level transplant (grindstone
 * ledger, design-studio-r3 issue #22).
 *
 * Structural inputs (win/doc) keep it jsdom-testable; a missing
 * matchMedia / requestAnimationFrame / ResizeObserver degrades open
 * (installs anyway) so the test environment exercises the real path.
 *
 * Original requirement input: Owner 2026-09-12 (issue #22 —
 * 「prototype-kit 的滚动条不应该影响页面内容，建议使用虚拟滚动条」).
 */

/** install the overlay scrollbar law into a document; the returned
 *  release() removes every trace (style, thumb, listeners, timers) */
export function installOverlayScrollbar(win: Window, doc: Document): () => void {
  // fine-pointer gate: coarse (touch) keeps the platform's own overlay bars
  const fine =
    typeof win.matchMedia === 'function' ? win.matchMedia('(pointer: fine)') : null;
  if (fine !== null && !fine.matches) return () => {};
  const reduced =
    typeof win.matchMedia === 'function' ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const canHide = reduced === null || !reduced.matches;

  const root = doc.documentElement;
  // re-entrancy: one law per document (a canvas page may host nested
  // PrototypeCanvases — the second install is a no-op)
  if (root.querySelector('style[data-jx-frame-overlay-scrollbar]') !== null) {
    return () => {};
  }

  const style = doc.createElement('style');
  style.setAttribute('data-jx-frame-overlay-scrollbar', '');
  style.textContent = [
    'html{scrollbar-width:none;-ms-overflow-style:none}',
    'html::-webkit-scrollbar{width:0;height:0;display:none}',
  ].join('\n');
  doc.head.appendChild(style);

  const thumb = doc.createElement('div');
  thumb.setAttribute('data-jx-frame-vscroll-thumb', '');
  thumb.setAttribute('aria-hidden', 'true');
  thumb.style.cssText = [
    'position:fixed',
    'top:0',
    'right:2px',
    'width:6px',
    'height:0',
    'min-height:24px',
    'border-radius:3px',
    'z-index:2147483647',
    'background:var(--scrollbar-thumb, rgba(128,124,117,0.5))',
    'opacity:0',
    'visibility:hidden',
    'transition:opacity 180ms ease-out',
    'cursor:default',
    'touch-action:none',
  ].join(';');
  (doc.body ?? root).appendChild(thumb);

  let raf = 0;
  let hideTimer = 0;
  let dragging = false;
  let hovering = false;
  let released = false;

  // jsdom (no pretendToBeVisual) has no rAF — the setTimeout fallback
  // keeps the sync path testable
  const requestFrame: (cb: () => void) => number =
    typeof win.requestAnimationFrame === 'function'
      ? (cb) => win.requestAnimationFrame(cb)
      : (cb) => win.setTimeout(cb, 0) as unknown as number;
  const cancelFrame = (id: number): void => {
    if (typeof win.cancelAnimationFrame === 'function') win.cancelAnimationFrame(id);
    else win.clearTimeout(id);
  };

  const show = (): void => {
    if (released) return;
    thumb.style.opacity = '1';
    if (hideTimer !== 0) win.clearTimeout(hideTimer);
    if (canHide && !hovering && !dragging) {
      hideTimer = win.setTimeout(() => {
        hideTimer = 0;
        if (!hovering && !dragging) thumb.style.opacity = '0';
      }, 700);
    }
  };

  // the geometry law (scroll-area's overlay ratio, in px over the track)
  const sync = (): void => {
    raf = 0;
    if (released) return;
    const track = root.clientHeight;
    const scrollSize = root.scrollHeight;
    const scrollable = scrollSize > track + 1;
    thumb.style.visibility = scrollable ? 'visible' : 'hidden';
    if (!scrollable || track === 0) return;
    thumb.style.height = `${Math.max(24, Math.round((track / scrollSize) * track))}px`;
    thumb.style.top = `${Math.round((root.scrollTop / scrollSize) * track)}px`;
  };
  const schedule = (): void => {
    if (raf === 0) raf = requestFrame(sync);
  };

  // viewport scrolls target the document — inner scrollers leave the thumb alone
  const onScroll = (event: Event): void => {
    if (event.target !== doc && event.target !== root) return;
    show();
    schedule();
  };
  doc.addEventListener('scroll', onScroll, { passive: true, capture: true });

  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    const track = root.clientHeight;
    const scrollSize = root.scrollHeight;
    const scrollRange = scrollSize - track;
    if (scrollRange <= 0) return;
    event.preventDefault();
    dragging = true;
    if (typeof thumb.setPointerCapture === 'function') {
      try {
        thumb.setPointerCapture(event.pointerId);
      } catch {
        /* pointer gone — drag simply ends early */
      }
    }
    show();
    const startPointer = event.clientY;
    const startScroll = root.scrollTop;
    const thumbPx = Math.max(24, (track / scrollSize) * track);
    const factor = scrollRange / Math.max(1, track - thumbPx);
    const onMove = (move: PointerEvent): void => {
      root.scrollTop = startScroll + (move.clientY - startPointer) * factor;
    };
    const onUp = (up: PointerEvent): void => {
      dragging = false;
      if (typeof thumb.releasePointerCapture === 'function') {
        try {
          thumb.releasePointerCapture(up.pointerId);
        } catch {
          /* already released */
        }
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
  thumb.addEventListener('pointerdown', onPointerDown);
  const onEnter = (): void => {
    hovering = true;
    show();
  };
  const onLeave = (): void => {
    hovering = false;
    show();
  };
  thumb.addEventListener('pointerenter', onEnter);
  thumb.addEventListener('pointerleave', onLeave);

  // content growth re-syncs (fonts, images, HMR) — guarded for jsdom
  // (structural read: the Window var may lack the constructor there)
  type WindowWithObserver = Window & { ResizeObserver?: typeof ResizeObserver };
  const withObserver = win as WindowWithObserver;
  let observer: ResizeObserver | null = null;
  if (typeof withObserver.ResizeObserver === 'function') {
    observer = new withObserver.ResizeObserver(schedule);
    observer.observe(root);
    if (doc.body !== null) observer.observe(doc.body);
  }

  schedule();
  show();

  return () => {
    released = true;
    if (hideTimer !== 0) win.clearTimeout(hideTimer);
    if (raf !== 0) cancelFrame(raf);
    doc.removeEventListener('scroll', onScroll, { capture: true });
    thumb.removeEventListener('pointerdown', onPointerDown);
    thumb.removeEventListener('pointerenter', onEnter);
    thumb.removeEventListener('pointerleave', onLeave);
    observer?.disconnect();
    style.remove();
    thumb.remove();
  };
}
