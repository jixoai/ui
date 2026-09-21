/**
 * @jixoai/ui-vite-plugin (universal-props) — the query() JS shim
 * shell (explicit-props W2 task 2.3c, design §9.1's frozen module
 * API; exported as `./universal-props/query-shim`).
 *
 * The POLYFILL lane, never the primary path (the Owner's 垫片
 * ruling): the build desugars what it can prove into CSS; this
 * module serves what it cannot — container-type supply failures,
 * dynamic cases, SSR gaps. mountQueryShim(instance) re-stamps the
 * winning lane's carrier vars POST-paint only (idempotent — no
 * hydration surface); auditTree(root) is the runtime twin of the
 * build's missing-container diagnostic (dev-mode warning source).
 *
 * The per-route manifest of un-desugarable cases (the desugarer's
 * collector emits it) drives the dynamic import() of this module;
 * its schema is frozen (Codex r5): { route, instances: [{ id, key,
 * reason: 'no-container' | 'dynamic', module? }] } — W2's first test
 * fixture pins the shape.
 *
 * Browser-surface assumptions (all stubbable in tests):
 * getComputedStyle (container-type/container-name reads),
 * ResizeObserver, requestAnimationFrame, matchMedia, Element.
 */

import { compareQueryKeys, parseQueryKey } from './alias-tables.js';
import { carrierDeclarationsFor, type UniversalAxis } from './desugar.js';

// ── the manifest schema (frozen — Codex r5) ───────────────────────

export interface QueryManifestInstance {
  readonly id: string;
  readonly key: string;
  readonly reason: 'no-container' | 'dynamic';
  readonly module?: string;
}

export interface QueryRouteManifest {
  readonly route: string;
  readonly instances: readonly QueryManifestInstance[];
}

/** structural validation of a parsed manifest (the fixture gate — no
 *  zod at this layer; the shape is small and frozen) */
export function isValidRouteManifest(value: unknown): value is QueryRouteManifest {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  if (typeof m.route !== 'string') return false;
  if (!Array.isArray(m.instances)) return false;
  return m.instances.every((entry): boolean => {
    if (typeof entry !== 'object' || entry === null) return false;
    const e = entry as Record<string, unknown>;
    return (
      typeof e.id === 'string' &&
      typeof e.key === 'string' &&
      (e.reason === 'no-container' || e.reason === 'dynamic') &&
      (e.module === undefined || typeof e.module === 'string')
    );
  });
}

// ── the container walk (the §9 "nearest qualifying ancestor") ─────

/** one computed-style reader seam (tests stub it; browsers have it) */
const styleOf = (el: Element): CSSStyleDeclaration | null => {
  const get = (globalThis as { getComputedStyle?: (el: Element) => CSSStyleDeclaration }).getComputedStyle;
  return typeof get === 'function' ? get(el) : null;
};

/**
 * The NEAREST ancestor (self excluded — a component cannot query
 * itself, CSS law) whose computed container-type qualifies, with the
 * container-name match for named keys (`@sm/card` → a container
 * whose name list contains `card`). Missing → null → the case never
 * matches (§9's missing-container semantics).
 */
export function findContainerAncestor(element: Element, name?: string): Element | null {
  for (let el: Element | null = element.parentElement; el; el = el.parentElement) {
    const style = styleOf(el);
    if (!style) continue;
    const type = style.containerType;
    if (type !== 'inline-size' && type !== 'size' && type !== 'scroll-state') continue;
    if (name !== undefined) {
      const names = (style.containerName ?? '').trim().split(/\s+/).filter(Boolean);
      if (!names.includes(name)) continue;
    }
    return el;
  }
  return null;
}

// ── auditTree — the build warning's runtime twin ──────────────────

export interface QueryAuditFinding {
  readonly element: Element;
  readonly key: string;
  /** the parsed grammar, when the key parses */
  readonly containerName: string | undefined;
}

/**
 * Walk the tree for [data-jx-query] instances whose @ keys lack a
 * qualifying ancestor container (the dev-mode warning source — the
 * element's attr carries its container keys, stamped by the kernel
 * engine's mount helper). Returns the findings; the CALLER decides
 * presentation (dev console, overlay, test assertion).
 */
export function auditTree(root: ParentNode): QueryAuditFinding[] {
  const findings: QueryAuditFinding[] = [];
  const nodes = root.querySelectorAll('[data-jx-query]');
  for (const element of Array.from(nodes)) {
    const keys = (element.getAttribute('data-jx-query') ?? '')
      .split(/[,\s]+/)
      .filter(Boolean);
    for (const key of keys) {
      const parsed = parseQueryKey(key);
      if (parsed === null || parsed === 'empty-container-name') continue;
      if (parsed.kind !== 'container') continue;
      if (findContainerAncestor(element, parsed.containerName) === null) {
        findings.push({ element, key, containerName: parsed.containerName });
      }
    }
  }
  return findings;
}

// ── mountQueryShim — one ResizeObserver per unresolved @ key ──────

/** the instance contract: the element, its axis, the query's cases
 *  (ladder-evaluated at every restamp) and its base lane */
export interface QueryShimInstance {
  readonly element: HTMLElement;
  readonly axis: UniversalAxis;
  readonly cases: readonly (readonly [string, string | number])[];
  readonly base?: string | number;
}

/** the dev-mode once-logger set (§9: the shim logs once per missing
 * named container — a warning, never a loop) */
const loggedMissing = new Set<string>();

const warnOnce = (message: string): void => {
  if (!loggedMissing.has(message)) {
    loggedMissing.add(message);
    console.warn(`[jixoai:query-shim] ${message}`);
  }
};

/** evaluate a container key against its anchor's CURRENT width (px
 *  vs the registered rem threshold — 1rem = 16px, the root-em law;
 *  the desugared @container blocks ride the css engine's own rem) */
function containerKeyMatches(key: string, anchor: Element): boolean {
  const parsed = parseQueryKey(key);
  if (parsed === null || parsed === 'empty-container-name') return false;
  const widthPx = anchor ? anchor.clientWidth : 0;
  return widthPx >= parsed.minWidthRem * 16;
}

function mediaKeyMatches(key: string): boolean {
  const parsed = parseQueryKey(key);
  if (parsed === null || parsed === 'empty-container-name' || parsed.kind !== 'media') return false;
  const mm = (globalThis as { matchMedia?: (q: string) => { matches: boolean } }).matchMedia;
  if (typeof mm !== 'function') return false;
  return mm(`(min-width: ${parsed.minWidthRem}rem)`).matches;
}

/**
 * The winning lane under §9's ladder: cases evaluated in
 * REGISTERED-SCALE order (narrow → wide, media before container at
 * the same width — later matches override), missing-container cases
 * NEVER match, base when nothing matches.
 */
export function evaluateCases(
  cases: readonly (readonly [string, string | number])[],
  anchors: ReadonlyMap<string, Element | null>,
  base: string | number | undefined,
): string | number | undefined {
  let winner: string | number | undefined = base;
  const ordered = cases
    .filter(([key]) => {
      const parsed = parseQueryKey(key);
      return parsed !== null && parsed !== 'empty-container-name';
    })
    .slice()
    .sort((a, b) => compareQueryKeys(a[0], b[0]));
  for (const [key, lane] of ordered) {
    const parsed = parseQueryKey(key)!;
    const matches =
      parsed.kind === 'media'
        ? mediaKeyMatches(key)
        : (() => {
            const anchor = anchors.get(key) ?? null;
            return anchor !== null && containerKeyMatches(key, anchor);
          })();
    if (matches) winner = lane;
  }
  return winner;
}

/**
 * Mount the shim on one instance: resolves each @ key's anchor
 * (nearest qualifying container), observes it with ONE ResizeObserver
 * (plus a media restamp listener), and re-stamps the winning lane's
 * §11 carrier declarations onto the element's inline style POST-paint
 * — idempotent (identical declarations are skipped, no hydration
 * surface, no flicker). Returns the disposer (observer off, listeners
 * off; the LAST stamp stays — it is a computed value, not a lease).
 */
export function mountQueryShim(instance: QueryShimInstance): () => void {
  const { element, axis, cases, base } = instance;
  const containerKeys = cases
    .map(([key]) => key)
    .filter((key): boolean => {
      const parsed = parseQueryKey(key);
      return parsed !== null && parsed !== 'empty-container-name' && parsed.kind === 'container';
    });

  const anchors = new Map<string, Element | null>();
  const observers: ResizeObserver[] = [];
  const cleanups: (() => void)[] = [];

  const resolveAnchors = (): void => {
    for (const key of containerKeys) {
      const parsed = parseQueryKey(key);
      if (parsed === null || parsed === 'empty-container-name') continue;
      const anchor = findContainerAncestor(element, parsed.containerName);
      anchors.set(key, anchor);
      if (anchor === null && parsed.containerName !== undefined) {
        warnOnce(
          `container key '${key}' has no qualifying container-name ancestor — the case never matches (design §9)`,
        );
      }
    }
  };

  let lastStamp = '';
  const restamp = (): void => {
    const lane = evaluateCases(cases, anchors, base);
    if (lane === undefined) return;
    const decls = carrierDeclarationsFor(axis, lane);
    if (decls === null || decls.length === 0) return;
    const joined = decls.join('; ');
    if (joined === lastStamp) return; // idempotent
    lastStamp = joined;
    for (const decl of decls) {
      const [name, ...rest] = decl.split(': ');
      if (name === undefined || rest.length === 0) continue;
      element.style.setProperty(name, rest.join(': '));
    }
  };

  resolveAnchors();
  // POST-paint only — never during hydration's first frame
  const raf = (globalThis as { requestAnimationFrame?: (cb: () => void) => number }).requestAnimationFrame;
  const schedule = (cb: () => void): void => {
    if (typeof raf === 'function') raf(cb);
    else cb();
  };
  schedule(restamp);

  const RO = (globalThis as { ResizeObserver?: new (cb: () => void) => { observe(t: Element): void; disconnect(): void } })
    .ResizeObserver;
  if (typeof RO === 'function') {
    for (const anchor of new Set([...anchors.values()])) {
      if (!anchor) continue;
      const observer = new RO(() => restamp());
      observer.observe(anchor);
      observers.push(observer);
    }
  }
  const mm = (globalThis as { matchMedia?: (q: string) => { matches: boolean; addEventListener(t: string, l: () => void): void; removeEventListener(t: string, l: () => void): void } })
    .matchMedia;
  const hasMediaKey = cases.some(([key]) => {
    const parsed = parseQueryKey(key);
    return parsed !== null && parsed !== 'empty-container-name' && parsed.kind === 'media';
  });
  if (typeof mm === 'function' && hasMediaKey) {
    // every media key shares the viewport — one listener on the
    // widest threshold flips every ladder decision below it
    const widest = Math.max(
      ...cases
        .map(([key]) => parseQueryKey(key))
        .filter((p): p is NonNullable<typeof p> => p !== null && p !== 'empty-container-name')
        .map((p) => p.minWidthRem),
    );
    const mql = mm(`(min-width: ${widest}rem)`);
    const onChange = (): void => restamp();
    mql.addEventListener('change', onChange);
    cleanups.push(() => mql.removeEventListener('change', onChange));
  }

  return () => {
    for (const observer of observers) observer.disconnect();
    for (const cleanup of cleanups) cleanup();
  };
}
