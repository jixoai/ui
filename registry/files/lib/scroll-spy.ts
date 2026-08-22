/**
 * jixoai scroll spy (registry/files/lib/scroll-spy.ts → @lib/scroll-spy.ts).
 * The ONE plain line-pick implementation (batch-4 closure ruling: two
 * active-pick algorithms must not drift). anchor.svelte consumes it;
 * toc-engine stays the WEIGHTED variant (IoM + rule tracker) — this is
 * the simple "which section holds the viewport-top line" answer.
 *
 * Contract (2026-08-22, tour/toc design contract notes):
 *  - CAPTURE-phase window scroll listener: element scroll does NOT
 *    bubble, and pages that scroll inner shell containers must be
 *    heard (walkthrough-4's anchor lesson, kept here forever)
 *  - the pick = the LAST target whose top sits at/past the line
 *    (offset px from the viewport top); nothing past the first target
 *    ⇒ empty pick
 *  - rAF-throttled; resize re-runs; destroy() removes everything
 *
 * Framework-free, DOM-read-only — no geometry writes, ever.
 */

export interface ScrollSpyTarget {
  /** the fragment id, WITHOUT '#' */
  id: string;
}

export interface ScrollSpy {
  /** the current pick ('' before the first target / when none applies) */
  readonly current: string;
  /** re-read now (public for resize/mount paths) */
  sync(): void;
  /** teardown: listeners + pending frame */
  destroy(): void;
}

export function createScrollSpy(
  targets: () => ScrollSpyTarget[],
  onPick: (id: string) => void,
  options: { offset?: number } = {},
): ScrollSpy {
  const offset = options.offset ?? 96;
  let current = '';
  let raf = 0;

  function sync(): void {
    let picked = '';
    for (const target of targets()) {
      const el = document.getElementById(target.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= offset) picked = target.id;
    }
    if (picked !== current) {
      current = picked;
      onPick(picked);
    }
  }

  function handleScroll(): void {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(sync);
  }

  // capture: hears the document scroller AND inner shell containers
  window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
  window.addEventListener('resize', handleScroll);
  sync();

  return {
    get current() {
      return current;
    },
    sync,
    destroy() {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(raf);
    },
  };
}
