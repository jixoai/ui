/*
 * universal-props query() RUNTIME ENGINE spec (explicit-props W2
 * task 2.5/2.3a, §9 semantics). The engine's four laws under test:
 *   1. REGISTERED-SCALE order — query() normalizes narrow → wide,
 *      authoring-order-independent; same-width media before container
 *   2. media keys via matchMedia (window stubbed with a controllable
 *      fake — jsdom's own matchMedia never flips)
 *   3. container keys via the NEAREST qualifying ancestor
 *      (getComputedStyle stubbed for container-type/container-name —
 *      jsdom does not compute them) + the width threshold
 *   4. missing-container = never-matches (bare and named both)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONTAINER_SCALE,
  VIEWPORT_SCALE,
  compareQueryKeys,
  evaluateQuery,
  findContainerAncestor,
  parseQueryKey,
  query,
  resolveQueryLane,
  stampQueryInstance,
  watchContainer,
} from '$lib/universal-props-query.svelte';

// ── the controllable matchMedia stub ──────────────────────────────

const matchesByQuery = new Map<string, boolean>();
const listenersByQuery = new Map<string, Set<() => void>>();
// jsdom ships no matchMedia — the original is captured only when present
const originalMatchMedia =
  typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : undefined;

const fakeMatchMedia = (q: string): MediaQueryList => {
  const listeners = listenersByQuery.get(q) ?? new Set();
  listenersByQuery.set(q, listeners);
  return {
    // LIVE read — the engine caches the MediaQueryList once, so the
    // fake's matches must reflect later setMedia() flips
    get matches(): boolean {
      return matchesByQuery.get(q) ?? false;
    },
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_: string, listener: () => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
};

const setMedia = (minWidthRem: number, matches: boolean): void => {
  const q = `(min-width: ${minWidthRem}rem)`;
  matchesByQuery.set(q, matches);
  for (const listener of listenersByQuery.get(q) ?? []) listener();
};

// ── the computed-style stub (container-type/name) ─────────────────

const originalGetComputedStyle = window.getComputedStyle.bind(window);
let containerMarks: WeakMap<Element, { type?: string; name?: string }>;

const fakeGetComputedStyle = (el: Element): CSSStyleDeclaration => {
  const mark = containerMarks.get(el);
  if (mark) {
    const style = originalGetComputedStyle(el);
    return new Proxy(style, {
      get(target, prop: string) {
        if (prop === 'containerType') return mark.type ?? '';
        if (prop === 'containerName') return mark.name ?? '';
        const value = (target as unknown as Record<string, unknown>)[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    }) as CSSStyleDeclaration;
  }
  return originalGetComputedStyle(el);
};

const markContainer = (el: Element, type: string, name?: string): void => {
  containerMarks.set(el, { type, name });
};

beforeEach(() => {
  vi.stubGlobal('matchMedia', fakeMatchMedia);
  window.matchMedia = fakeMatchMedia;
  containerMarks = new WeakMap();
  window.getComputedStyle = fakeGetComputedStyle;
  getComputedStyle = fakeGetComputedStyle;
});

afterEach(() => {
  if (originalMatchMedia) window.matchMedia = originalMatchMedia;
  else delete (window as { matchMedia?: unknown }).matchMedia;
  window.getComputedStyle = originalGetComputedStyle;
  getComputedStyle = originalGetComputedStyle;
  vi.unstubAllGlobals();
  matchesByQuery.clear();
  listenersByQuery.clear();
});

// ── 1. the ladder ─────────────────────────────────────────────────

describe('registered-scale order (§9: insertion order is NOT the ladder)', () => {
  it('query() normalizes narrow → wide regardless of authoring order', () => {
    const q = query({ lg: 'large', sm: 'small', xs: 'small' } as const);
    expect(q.cases.map(([k]) => k)).toEqual(['xs', 'sm', 'lg']);
  });
  it('threshold order holds across the two scales (@md 28 < md 48)', () => {
    const q = query({ '@md': 'c', md: 'm' } as const);
    expect(q.cases.map(([k]) => k)).toEqual(['@md', 'md']);
  });
  it('the two scales never collapse (viewport sm ≠ container @sm)', () => {
    expect(VIEWPORT_SCALE.sm).toBe(40);
    expect(CONTAINER_SCALE.sm).toBe(24);
    expect(parseQueryKey('sm')).toMatchObject({ kind: 'media', minWidthRem: 40 });
    expect(parseQueryKey('@sm')).toMatchObject({ kind: 'container', minWidthRem: 24 });
  });
  it('compareQueryKeys is a total order over the grammar (pure width ladder)', () => {
    // @sm 24 · @md/card 28 · xs 30 · sm 40 · lg 64
    expect(['lg', '@md/card', '@sm', 'sm', 'xs'].sort(compareQueryKeys)).toEqual([
      '@sm',
      '@md/card',
      'xs',
      'sm',
      'lg',
    ]);
  });
  it('base rides verbatim; unknown keys parse to never-match', () => {
    const q = query({ badkey: 'x' } as Record<string, never>, 'auto');
    expect(q.base).toBe('auto');
    expect(evaluateQuery(q).value).toBe('auto');
  });
});

// ── 2+3+4. evaluation ─────────────────────────────────────────────

describe('media evaluation via matchMedia', () => {
  it('later (wider) matches override narrower ones', () => {
    const q = query({ sm: 'small', md: 'medium', lg: 'large' } as const, 'base');
    setMedia(40, true); // sm only
    expect(evaluateQuery(q).value).toBe('small');
    expect(evaluateQuery(q).matched).toBe('sm');
    setMedia(48, true); // sm + md
    expect(evaluateQuery(q).value).toBe('medium');
    setMedia(64, true); // all three
    expect(evaluateQuery(q).value).toBe('large');
    setMedia(64, false); // back under lg
    expect(evaluateQuery(q).value).toBe('medium');
  });
  it('nothing matches → base', () => {
    const q = query({ sm: 'small' } as const, 'medium');
    expect(evaluateQuery(q).value).toBe('medium');
    expect(evaluateQuery(q).matched).toBeNull();
  });
});

describe('container evaluation (nearest qualifying ancestor)', () => {
  const mount = (): { container: HTMLDivElement; inner: HTMLDivElement; host: HTMLDivElement } => {
    const container = document.createElement('div');
    const host = document.createElement('div');
    const inner = document.createElement('div');
    container.append(host);
    host.append(inner);
    document.body.append(container);
    return { container, host, inner };
  };

  it('matches against the container width (px vs rem×16)', () => {
    const { container, inner } = mount();
    markContainer(container, 'inline-size');
    Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true }); // ≥ 384px
    const q = query({ '@sm': 'small' } as const, 'medium');
    expect(evaluateQuery(q, inner).value).toBe('small');
    Object.defineProperty(container, 'clientWidth', { value: 300, configurable: true }); // < 384px
    expect(evaluateQuery(q, inner).value).toBe('medium');
  });

  it('MISSING container (no ancestor with container-type) = never matches', () => {
    const { inner } = mount(); // no marks
    const q = query({ '@sm': 'small' } as const, 'medium');
    expect(evaluateQuery(q, inner).value).toBe('medium');
  });

  it('a NAMED key demands the matching container-name (§9: @sm/card)', () => {
    const { container, inner } = mount();
    markContainer(container, 'inline-size', 'sidebar'); // wrong name
    Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
    const q = query({ '@sm/card': 'small' } as const, 'medium');
    expect(evaluateQuery(q, inner).value).toBe('medium'); // name miss → never matches
    markContainer(container, 'inline-size', 'card side'); // name list contains card
    expect(evaluateQuery(q, inner).value).toBe('small');
  });

  it('the NEAREST qualifying ancestor wins (self never queried)', () => {
    const { container, host, inner } = mount();
    markContainer(container, 'inline-size');
    markContainer(host, 'inline-size');
    Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(host, 'clientWidth', { value: 100, configurable: true });
    expect(findContainerAncestor(inner)).toBe(host); // nearest, not widest
    const q = query({ '@sm': 'small' } as const, 'medium');
    expect(evaluateQuery(q, inner).value).toBe('medium'); // host 100px < 384px
    // a component cannot query ITSELF (CSS law): the host's own query
    // resolves against container, not host
    expect(findContainerAncestor(host)).toBe(container);
    expect(evaluateQuery(q, host).value).toBe('small');
  });

  it('watchContainer registers the reactive tick source (width read live)', () => {
    const { container, inner } = mount();
    markContainer(container, 'inline-size');
    Object.defineProperty(container, 'clientWidth', { value: 300, configurable: true });
    const q = query({ '@sm': 'small' } as const, 'medium');
    const release = watchContainer(container);
    expect(evaluateQuery(q, inner).value).toBe('medium');
    // width is LIVE (clientWidth, never a stale cache): a flip is seen
    // on the next evaluation — the observer's tick owns re-derivation
    Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
    expect(evaluateQuery(q, inner).value).toBe('small');
    release();
  });

  it('media × container compose by the THRESHOLD ladder (wider match overrides)', () => {
    const { container, inner } = mount();
    markContainer(container, 'inline-size');
    Object.defineProperty(container, 'clientWidth', { value: 900, configurable: true });
    setMedia(30, true); // xs (30rem) matches
    // xs (30rem, media) then @lg (32rem, container): the container is
    // evaluated later (wider) → it overrides where both match — the
    // same-width media-first tie needs a §15.5 remap (the default
    // tables share no width) and is pinned in the plugin battery
    const q = query({ '@lg': 'container', xs: 'media' } as const, 'base');
    expect(evaluateQuery(q, inner).value).toBe('container');
    // container drops below its threshold → the media case resurfaces
    Object.defineProperty(container, 'clientWidth', { value: 100, configurable: true });
    expect(evaluateQuery(q, inner).value).toBe('media');
  });
});

describe('resolveQueryLane (the slot seam)', () => {
  it('plain lanes pass through untouched', () => {
    expect(resolveQueryLane('small')).toBe('small');
    expect(resolveQueryLane(42)).toBe(42);
    expect(resolveQueryLane(undefined)).toBeUndefined();
  });
  it('a query resolves its media lane live; container keys need an anchor', () => {
    const q = query({ sm: 'small', '@sm': 'large' } as const, 'medium');
    setMedia(40, true);
    // no anchor → the container key never matches; media wins
    expect(resolveQueryLane(q)).toBe('small');
  });
});

describe('stampQueryInstance (the auditTree hook)', () => {
  it('carries only the container keys', () => {
    const el = document.createElement('div');
    stampQueryInstance(el, query({ sm: 'small', '@sm': 'x', '@md/card': 'y' } as const));
    expect(el.getAttribute('data-jx-query')).toBe('@sm,@md/card');
    stampQueryInstance(el, query({ sm: 'small' } as const));
    expect(el.hasAttribute('data-jx-query')).toBe(false);
  });
});
