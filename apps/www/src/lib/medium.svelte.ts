/**
 * jixoai print medium — the Svelte channel of the paged-docs medium
 * contract (paged-doc-family, 2026-08-30; synthesis v5 §1).
 *
 * Three-state model, PURELY DERIVED — there is no imperative
 * transition anywhere, only two signal sources feeding a reducer:
 *
 *   medium = realPrint ? 'print' : (simStamp ? 'sim' : 'screen')
 *
 *   - realPrint  the document actually sits in print media. Sources:
 *     `matchMedia('print')` (Chromium flips it under print emulation
 *     AND around the real dialog — the probe's channel) plus the
 *     beforeprint/afterprint events (the always-available channel).
 *   - simStamp   the nearest observed root carries `data-jx-print-sim`
 *     (the screen print-preview stamp — the fourth consumer's signal).
 *
 * Priority is expressed by the reducer alone: real print > sim >
 * screen. The exit semantics are re-evaluation, not restoration:
 * `afterprint` (or a matchMedia change, or a stamp removal) clears
 * ONLY its own source, then the derivation re-runs — a surviving sim
 * stamp restores 'sim', none yields 'screen'. Components subscribe to
 * the derived value and never cache a stale state.
 *
 * `isPrintProjection` ≡ `medium !== 'screen'` — the drive signal for
 * the screen print preview, kept in lockstep with the CSS mirror by
 * construction (both derive from the same two sources).
 *
 * CSS EXCLUSION LAW: the sim projection copy in
 * `lib/paged/print-projection.css` is wrapped in `@media not print`,
 * so under real print the sim rules stop matching entirely and the
 * `@media print` product is the sole authority — the two CSS halves
 * never both apply. Nothing in this module keys CSS off a medium
 * stamp (the §0 ruling: no data-medium CSS scope); the
 * `data-jx-medium` attribute PagedDoc projects is a read-only
 * telemetry hook no stylesheet targets.
 *
 * SSR SAFETY: no module-top-level window access; browser
 * subscriptions live inside component effects, which never run on
 * the server.
 *
 * Posture follows density.svelte.ts's getter-backed context pattern,
 * read-only: there is deliberately NO override chain — the medium is
 * environment truth, not an opinion to resolve.
 */
import { getContext, setContext } from 'svelte';

export type MediumState = 'screen' | 'sim' | 'print';

/** The sim stamp attribute — the DOM side of the second signal source. */
export const PRINT_SIM_ATTR = 'data-jx-print-sim' as const;

/**
 * The pure derived reducer (the whole state machine in one
 * expression). Exported standalone so tests and consumers can verify
 * every transition without a DOM.
 */
export function deriveMedium(realPrint: boolean, simStamp: boolean): MediumState {
  return realPrint ? 'print' : simStamp ? 'sim' : 'screen';
}

/** The fourth consumer's drive signal: everything not screen. */
export function isPrintProjection(medium: MediumState): boolean {
  return medium !== 'screen';
}

/** Read-only medium context (getter-backed so rerenders stay reactive). */
export interface MediumContext {
  /** the derived three-state */
  readonly medium: MediumState;
  /** source 1: the document is in real print media */
  readonly realPrint: boolean;
  /** source 2: the observed root carries the sim stamp */
  readonly simStamp: boolean;
  /** ≡ medium !== 'screen' */
  readonly isPrintProjection: boolean;
}

export const MEDIUM_KEY = Symbol('jx-print-medium');

export function getMedium(): MediumContext | undefined {
  return getContext<MediumContext | undefined>(MEDIUM_KEY);
}

/**
 * Provide the medium for a subtree. `root` returns the element whose
 * `data-jx-print-sim` attribute is the sim signal (PagedDoc passes
 * its article; any ancestor stamp observed by that element is the
 * page's choice to wire). `initialSim` covers the server render,
 * where the stamp is known from props but not yet observable.
 */
export function provideMedium(options: {
  root: () => HTMLElement | undefined;
  initialSim?: boolean;
}): MediumContext {
  // the two signal sources — nothing else holds state
  let realPrint = $state(false);
  let simStamp = $state(Boolean(options.initialSim));

  // the derivation (single expression, no caching)
  const medium = $derived(deriveMedium(realPrint, simStamp));

  const context: MediumContext = {
    get medium() {
      return medium;
    },
    get realPrint() {
      return realPrint;
    },
    get simStamp() {
      return simStamp;
    },
    get isPrintProjection() {
      return isPrintProjection(medium);
    },
  };
  setContext(MEDIUM_KEY, context);

  // Browser-only wiring. Effects never run during SSR, so the module
  // needs no window guard at import time; jsdom (vitest) exercises
  // this path too, feature-detected per surface.
  $effect(() => {
    if (typeof window === 'undefined') return;
    const win = window;

    // ---- source 1: real print ------------------------------------------
    // matchMedia covers Chromium's print emulation (the probe) and the
    // real dialog window; beforeprint/afterprint are the portable
    // events. All writers converge on the same boolean — the exit is
    // always "clear the source, re-derive", never "set the old state".
    const mq = typeof win.matchMedia === 'function' ? win.matchMedia('print') : null;
    const syncFromMq = () => {
      if (mq) realPrint = mq.matches;
    };
    syncFromMq(); // adopt an already-printing document
    mq?.addEventListener?.('change', syncFromMq);
    const onBeforePrint = () => {
      realPrint = true;
    };
    const onAfterPrint = () => {
      realPrint = false;
    };
    win.addEventListener('beforeprint', onBeforePrint);
    win.addEventListener('afterprint', onAfterPrint);

    // ---- source 2: the sim stamp ---------------------------------------
    // The DOM is the source of truth (any writer may stamp); the
    // observer mirrors attribute changes into the signal.
    const el = options.root();
    let observer: MutationObserver | undefined;
    const readStamp = () => {
      simStamp = el?.hasAttribute(PRINT_SIM_ATTR) ?? false;
    };
    if (el && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(readStamp);
      observer.observe(el, { attributes: true, attributeFilter: [PRINT_SIM_ATTR] });
    }
    readStamp();

    return () => {
      mq?.removeEventListener?.('change', syncFromMq);
      win.removeEventListener('beforeprint', onBeforePrint);
      win.removeEventListener('afterprint', onAfterPrint);
      observer?.disconnect();
    };
  });

  return context;
}
