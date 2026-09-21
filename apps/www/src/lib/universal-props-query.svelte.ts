/**
 * jixoai universal props — the query() RUNTIME ENGINE
 * (apps/www/src/lib/universal-props-query.svelte.ts, explicit-props
 * W2 task 2.3a; registry/files/lib/universal-props-query.svelte.ts is
 * the byte mirror).
 *
 * The source of truth for §9 semantics (the desugarer is the
 * best-effort compile twin; the JS shim is the polyfill lane):
 *   · REGISTERED-SCALE order — cases normalize narrow → wide, never
 *     raw insertion order; override semantics are
 *     authoring-order-independent ({lg:'a',sm:'b'} ≡ {sm:'b',lg:'a'});
 *     same-width media sorts before container (later evaluation wins
 *     where both match — the ancestor-nesting intuition)
 *   · media keys via matchMedia (live, reactive through one $state
 *     tick — a consumer's $derived re-resolves in the same frame)
 *   · container keys via the NEAREST qualifying ancestor
 *     (container-type ≠ normal, container-name for `@sm/card`);
 *     missing-container = NEVER-MATCHES (§9; a component cannot
 *     query itself — CSS law)
 *   · SSR first paint: no window → the unconditional base (§9.1's
 *     correct-if-unresponsive first paint)
 *
 * The slot seam (defaults.svelte.ts) calls resolveQueryLane when it
 * receives an AxisQuery — the media lane resolves LIVE through this
 * module; container keys need an ELEMENT ANCHOR, which the family
 * wiring (W3) supplies via watchContainer/evaluateQuery (or the
 * vite-plugin's query-shim for un-desugarable cases). The scale
 * THRESHOLDS are the plugin alias tables' twins (§15.5 — remappable
 * build-side; the kernel lib cannot import the plugin package, so
 * both cite §9.1's frozen key sets and the battery pins agreement).
 */

import type { QueryKey, QueryResult } from './universal-props.schema';

// ── the registered scale tables (§9.1 keys; §15.5 values) ─────────
// The twin of packages/vite-plugin/src/universal-props/alias-tables.ts
// (VIEWPORT_SCALE/CONTAINER_SCALE) — keep the two in lockstep; the
// vite-plugin battery cross-asserts against the committed schema.

export const VIEWPORT_SCALE = {
  xs: 30,
  sm: 40,
  md: 48,
  lg: 64,
} as const;

export const CONTAINER_SCALE = {
  '3xs': 16,
  '2xs': 18,
  xs: 20,
  sm: 24,
  md: 28,
  lg: 32,
  xl: 36,
} as const;

export interface ParsedQueryKey {
  readonly kind: 'media' | 'container';
  readonly scale: string;
  readonly minWidthRem: number;
  readonly containerName: string | undefined;
}

/** parse one §9 key; null = outside the grammar (never matches at
 *  runtime; the BUILD diagnostics own the warning) */
export function parseQueryKey(key: string): ParsedQueryKey | 'empty-container-name' | null {
  if (!key.startsWith('@')) {
    const minWidthRem = (VIEWPORT_SCALE as Record<string, number | undefined>)[key];
    if (minWidthRem === undefined) return null;
    return { kind: 'media', scale: key, minWidthRem, containerName: undefined };
  }
  const body = key.slice(1);
  const slash = body.indexOf('/');
  const scale = slash === -1 ? body : body.slice(0, slash);
  const containerName = slash === -1 ? undefined : body.slice(slash + 1);
  if (containerName !== undefined && containerName === '') return 'empty-container-name';
  const minWidthRem = (CONTAINER_SCALE as Record<string, number | undefined>)[scale];
  if (minWidthRem === undefined) return null;
  return { kind: 'container', scale, minWidthRem, containerName };
}

/**
 * §9's ordering law: narrow → wide by threshold; at the SAME width
 * media before container (later evaluation wins — the container
 * overrides where both match; a genuine tie needs a §15.5 threshold
 * remap, the DEFAULT viewport/container tables share no value). The
 * plugin twin's exact shape (packages/vite-plugin alias-tables.ts —
 * keep in lockstep; the battery cross-pins).
 */
export function compareQueryKeyOrder(
  a: { kind: 'media' | 'container'; minWidthRem: number },
  b: { kind: 'media' | 'container'; minWidthRem: number },
): number {
  if (a.minWidthRem !== b.minWidthRem) return a.minWidthRem - b.minWidthRem;
  const ka = a.kind === 'container' ? 1 : 0;
  const kb = b.kind === 'container' ? 1 : 0;
  return ka - kb;
}

export function compareQueryKeys(a: string, b: string): number {
  const pa = parseQueryKey(a);
  const pb = parseQueryKey(b);
  if (pa === null || pa === 'empty-container-name') return pb === null || pb === 'empty-container-name' ? 0 : 1;
  if (pb === null || pb === 'empty-container-name') return -1;
  return compareQueryKeyOrder(pa, pb);
}

// ── the runtime query() — §9.1's public API, sugar → ordered cases ─

type RawQueryCases = Readonly<Record<string, string | number | undefined>>;

/**
 * The §9.1 `query(cases, base?)` runtime: normalizes the object
 * literal to an ordered `cases` array (REGISTERED-SCALE order —
 * insertion order is NOT the ladder) plus the optional unconditional
 * `base` (default: the axis default, `auto`, arrives as undefined and
 * is the slot's own resolution). Unknown keys never match at runtime
 * (the layer split: type=lanes, build=keys — §9.1).
 */
export function query<T extends RawQueryCases, B extends string | number | undefined = undefined>(
  cases: T,
  base?: B,
): QueryResult<(T[keyof T] & {}) | (B extends string | number ? B : never)> {
  const ordered = Object.entries(cases)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .sort((a, b) => compareQueryKeys(a[0], b[0]))
    .map((entry): readonly [QueryKey, string | number] => [entry[0] as QueryKey, entry[1]]);
  if (import.meta.env?.DEV) {
    const seen = new Set<string>();
    for (const [key] of ordered) {
      const parsed = parseQueryKey(key);
      if (parsed === 'empty-container-name') {
        console.warn(`[jixoai:query] key '${key}': the named-container grammar demands a non-empty name segment (design §9) — never matches`);
      } else if (parsed === null) {
        console.warn(`[jixoai:query] key '${key}' is not in the registered scale tables — never matches`);
      }
      if (seen.has(key)) console.warn(`[jixoai:query] duplicate key '${key}' — the later case wins`);
      seen.add(key);
    }
  }
  return {
    $query: true,
    cases: ordered,
    base: base as never,
  } as QueryResult<(T[keyof T] & {}) | (B extends string | number ? B : never)>;
}

/** lane-value narrowing for QueryResult readers */
const isQueryResult = <T>(lane: T | QueryResult<T> | undefined): lane is QueryResult<T> =>
  typeof lane === 'object' && lane !== null && '$query' in lane;

// ── the reactive substrate ($state ticks — Svelte 5 universal) ────

/** one tick per media-query CHANGE; every $derived that read a media
 *  match through this module re-resolves in the same frame */
let mediaTick = $state(0);
const mediaListeners = new Map<string, MediaQueryList>();

function liveMediaMatches(minWidthRem: number): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  const queryString = `(min-width: ${minWidthRem}rem)`;
  let mql = mediaListeners.get(queryString);
  if (!mql) {
    mql = window.matchMedia(queryString);
    mql.addEventListener('change', () => {
      mediaTick += 1;
    });
    mediaListeners.set(queryString, mql);
  }
  void mediaTick; // the reactive read — re-derives on every change
  return mql.matches;
}

/** container watch state: the $state tick carries reactivity (a
 *  resize bumps it, every dependent $derived re-resolves); the WIDTH
 *  is read live from the element (clientWidth — the observer's job
 *  is the tick, never a cached truth that can go stale between
 *  fires); observers detach through the disposers watchContainer
 *  returns (the family wiring's teardown) */
let containerTick = $state(0);
const containerObservers = new Map<Element, ResizeObserver>();

/**
 * The §11 broadcast duty's query fuel: watch one container element
 * (the nearest qualifying ancestor a container key resolved against).
 * ONE ResizeObserver per element, shared across every consumer; the
 * returned disposer detaches when the last family releases it (W3
 * wiring owns the call sites).
 */
export function watchContainer(el: Element): () => void {
  if (typeof ResizeObserver === 'undefined') return () => {};
  if (!containerObservers.has(el)) {
    const observer = new ResizeObserver(() => {
      containerTick += 1;
    });
    observer.observe(el);
    containerObservers.set(el, observer);
  }
  return () => {
    const observer = containerObservers.get(el);
    if (!observer) return;
    observer.disconnect();
    containerObservers.delete(el);
  };
}

const currentContainerWidth = (el: Element): number => {
  void containerTick; // the reactive read — re-derives on every resize
  return el.clientWidth;
};

// ── container resolution (the §9 nearest qualifying ancestor) ─────

/**
 * The nearest ancestor (self EXCLUDED — a component cannot query
 * itself, CSS law) whose computed container-type qualifies, matching
 * container-name for named keys. Missing → null → the key never
 * matches. getComputedStyle per call (cheap enough at resolve time;
 * the §9.1 semantics demand live truth, and family wiring caches).
 */
export function findContainerAncestor(element: Element, name?: string): Element | null {
  if (typeof getComputedStyle !== 'function') return null;
  for (let el: Element | null = element.parentElement; el; el = el.parentElement) {
    const style = getComputedStyle(el);
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

// ── the evaluation core ───────────────────────────────────────────

/** one key's current match; container keys need the anchor and never
 *  match without one (the slot path resolves media live, container
 *  through the anchor/shim — §9's carrier dual-track) */
function keyMatches(key: string, anchor: Element | null | undefined): boolean {
  const parsed = parseQueryKey(key);
  if (parsed === null || parsed === 'empty-container-name') return false;
  if (parsed.kind === 'media') return liveMediaMatches(parsed.minWidthRem);
  if (!anchor) return false;
  const container = findContainerAncestor(anchor, parsed.containerName);
  if (container === null) return false;
  return currentContainerWidth(container) >= parsed.minWidthRem * 16;
}

/**
 * §9's ladder evaluation: cases (already in registered-scale order
 * when built through query()) applied narrow → wide — later matches
 * override; the base when nothing matches. Anchor optional: with no
 * anchor, container keys never match (missing-container semantics).
 */
export function evaluateQuery<T>(
  q: QueryResult<T>,
  anchor?: Element | null,
): { value: T | undefined; matched: QueryKey | null } {
  if (typeof window === 'undefined') {
    // SSR first paint: the base is the correct-if-unresponsive lane
    return { value: q.base, matched: null };
  }
  let value = q.base;
  let matched: QueryKey | null = null;
  for (const [key, lane] of q.cases) {
    if (keyMatches(key, anchor ?? null)) {
      value = lane;
      matched = key;
    }
  }
  return { value, matched };
}

/**
 * The slot seam's resolver: plain lanes pass through untouched;
 * a QueryResult resolves live (media lane reactive through the
 * $state ticks — call sites inside a consumer's $derived re-resolve
 * on viewport/container change; container keys need the anchor).
 */
export function resolveQueryLane<T>(
  lane: T | QueryResult<T> | undefined,
  anchor?: Element | null,
): T | undefined {
  if (isQueryResult(lane)) return evaluateQuery(lane, anchor).value;
  return lane;
}

// ── the shim hook (data-jx-query stamping for auditTree) ──────────

/**
 * Stamp one element as a query instance for the browser shim's
 * auditTree walk (§9.1): the attr carries the element's container
 * keys. Idempotent (re-stamping replaces the value).
 */
export function stampQueryInstance(element: Element, q: QueryResult<unknown>): void {
  const containerKeys = q.cases
    .map(([key]) => key)
    .filter((key): boolean => {
      const parsed = parseQueryKey(key);
      return parsed !== null && parsed !== 'empty-container-name' && parsed.kind === 'container';
    });
  if (containerKeys.length === 0) {
    element.removeAttribute('data-jx-query');
    return;
  }
  element.setAttribute('data-jx-query', containerKeys.join(','));
}
