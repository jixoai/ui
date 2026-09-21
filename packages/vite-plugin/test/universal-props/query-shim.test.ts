// query-shim tests (explicit-props W2 task 2.5): the frozen manifest
// schema (§9.1, Codex r5 — "W2's first test fixture"), auditTree's
// missing-container walk, and mountQueryShim's post-paint restamp
// (idempotent, one observer per unresolved key, never-matches for
// missing containers). Node env: the DOM surface is a hand-rolled
// stub implementing exactly the API the shim reads (the header's
// "all stubbable" contract).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  auditTree,
  evaluateCases,
  findContainerAncestor,
  isValidRouteManifest,
  mountQueryShim,
  type QueryRouteManifest,
  type QueryShimInstance,
} from '../../src/universal-props/query-shim.js';

// ── the stub DOM ──────────────────────────────────────────────────

interface FakeStyle {
  containerType?: string;
  containerName?: string;
}

class FakeElement {
  readonly attrs = new Map<string, string>();
  readonly styleMap = new Map<string, string>();
  readonly children: FakeElement[] = [];
  parentElement: FakeElement | null = null;
  clientWidth = 0;
  computed: FakeStyle = {};
  constructor(...children: FakeElement[]) {
    for (const child of children) child.parentElement = this;
    this.children.push(...children);
  }
  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }
  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }
  removeAttribute(name: string): void {
    this.attrs.delete(name);
  }
  querySelectorAll(selector: string): FakeElement[] {
    const want = selector === '[data-jx-query]';
    const found: FakeElement[] = [];
    const visit = (el: FakeElement): void => {
      if (want && el.attrs.has('data-jx-query')) found.push(el);
      for (const child of el.children) visit(child);
    };
    visit(this);
    return found;
  }
  get style(): { setProperty(name: string, value: string): void } {
    return {
      setProperty: (name: string, value: string) => {
        this.styleMap.set(name, value);
      },
    };
  }
}

/** install the globals the shim reads (getComputedStyle is read
 *  through globalThis by the module — stubbed per element) */
const g = globalThis as Record<string, unknown>;
const originals: Record<string, unknown> = {};

const stub = (name: string, value: unknown): void => {
  originals[name] = g[name];
  g[name] = value;
};

beforeEach(() => {
  stub('getComputedStyle', (el: FakeElement) => el.computed);
});

afterEach(() => {
  for (const [name, value] of Object.entries(originals)) {
    if (value === undefined) delete g[name];
    else g[name] = value;
  }
});

// ── the manifest schema (the frozen shape) ────────────────────────

describe('the per-route manifest schema (§9.1, frozen)', () => {
  it('accepts the canonical fixture', () => {
    const manifest: QueryRouteManifest = {
      route: 'docs/universal-props.html',
      instances: [
        { id: 'q-1', key: '@sm/card', reason: 'no-container' },
        { id: 'q-2', key: '<dynamic>', reason: 'dynamic', module: 'src/routes/canvas/+page.svelte' },
      ],
    };
    expect(isValidRouteManifest(manifest)).toBe(true);
  });
  it('rejects shape drift (wrong route, unknown reason, wrong id/key types)', () => {
    expect(isValidRouteManifest(null)).toBe(false);
    expect(isValidRouteManifest({ instances: [] })).toBe(false);
    expect(isValidRouteManifest({ route: 'x', instances: [{ id: 1, key: 'sm', reason: 'dynamic' }] })).toBe(false);
    expect(isValidRouteManifest({ route: 'x', instances: [{ id: 'a', key: 'sm', reason: 'other' }] })).toBe(false);
    expect(isValidRouteManifest({ route: 'x', instances: [{ id: 'a', key: 'sm', reason: 'no-container', module: 3 }] })).toBe(false);
  });
});

// ── auditTree ─────────────────────────────────────────────────────

describe('auditTree — the build warning\'s runtime twin', () => {
  it('flags @ keys with NO qualifying ancestor container', () => {
    const stamped = new FakeElement();
    stamped.setAttribute('data-jx-query', '@sm/card,@md');
    const root = new FakeElement(new FakeElement(stamped));
    const findings = auditTree(root as unknown as ParentNode);
    expect(findings.map((f) => f.key)).toEqual(['@sm/card', '@md']);
  });
  it('passes when the nearest qualifying ancestor supplies container-type', () => {
    const stamped = new FakeElement();
    stamped.setAttribute('data-jx-query', '@sm');
    const host = new FakeElement(stamped);
    host.computed = { containerType: 'inline-size' };
    const root = new FakeElement(host);
    expect(auditTree(root as unknown as ParentNode)).toHaveLength(0);
  });
  it('a named key demands the matching container-name (missing name = finding)', () => {
    const stamped = new FakeElement();
    stamped.setAttribute('data-jx-query', '@sm/card');
    const host = new FakeElement(stamped);
    host.computed = { containerType: 'inline-size', containerName: 'sidebar' }; // wrong name
    const other = new FakeElement(host);
    other.computed = { containerType: 'inline-size', containerName: 'card' }; // further, right name
    const root = new FakeElement(other);
    expect(auditTree(root as unknown as ParentNode)).toHaveLength(0); // the NEAREST match wins at some depth
    // but a type-only ancestor under a NAMED key never satisfies it
    const wrongRoot = new FakeElement(new FakeElement(stamped));
    expect(auditTree(wrongRoot as unknown as ParentNode)).toHaveLength(1);
  });
  it('findContainerAncestor never returns the element itself (CSS law)', () => {
    const el = new FakeElement();
    el.computed = { containerType: 'inline-size' };
    expect(findContainerAncestor(el as unknown as Element)).toBeNull();
  });
});

// ── evaluateCases + mountQueryShim ────────────────────────────────

describe('evaluateCases — the §9 ladder', () => {
  const anchors = new Map<string, FakeElement | null>();
  it('later (wider) matches override; base when nothing matches', () => {
    stub('matchMedia', () => ({ matches: false }));
    expect(evaluateCases([['sm', 'small'], ['lg', 'large']], anchors, 'medium')).toBe('medium');
  });
  it('container keys never match without an anchor (missing-container semantics)', () => {
    stub('matchMedia', () => ({ matches: false }));
    expect(evaluateCases([['@sm', 'small']], new Map(), 'medium')).toBe('medium');
  });
  it('the ladder composes by threshold — the WIDER matching key overrides (§9)', () => {
    const anchor = new FakeElement();
    anchor.clientWidth = 600; // ≥ @lg 32rem = 512px
    stub('matchMedia', () => ({ matches: true })); // xs (30rem) matches
    // xs (30rem, media) then @lg (32rem, container): the container is
    // evaluated later (wider) → it overrides where both match
    const value = evaluateCases(
      [['@lg', 'container'], ['xs', 'media']],
      new Map([['@lg', anchor]]),
      'base',
    );
    expect(value).toBe('container');
    // the container drops below its threshold → the media case resurfaces
    anchor.clientWidth = 100;
    expect(evaluateCases([['@lg', 'container'], ['xs', 'media']], new Map([['@lg', anchor]]), 'base')).toBe(
      'media',
    );
  });
});

describe('mountQueryShim — post-paint restamp', () => {
  it('stamps the winning lane\'s carrier vars, idempotently, and follows a container resize', () => {
    const anchor = new FakeElement();
    anchor.computed = { containerType: 'inline-size' };
    anchor.clientWidth = 300; // < @sm 24rem = 384px → base
    const host = new FakeElement();
    host.parentElement = anchor;
    const element = new FakeElement();
    element.parentElement = host;

    let resizeCb: (() => void) | null = null;
    const observed: FakeElement[] = [];
    class FakeRO {
      constructor(cb: () => void) {
        resizeCb = cb;
      }
      observe(el: FakeElement): void {
        observed.push(el);
      }
      disconnect(): void {}
    }
    stub('ResizeObserver', FakeRO);
    stub('requestAnimationFrame', (cb: () => void) => {
      cb();
      return 0;
    });
    stub('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));

    const instance: QueryShimInstance = {
      element: element as unknown as HTMLElement,
      axis: 'size',
      cases: [
        ['@sm', 'small'],
        ['md', 'medium'],
      ],
      base: 'large',
    };
    const dispose = mountQueryShim(instance);

    // post-paint stamp #1: nothing matches (anchor 300px, media off) → base
    expect(element.styleMap.get('--jx-size-effective')).toBe('var(--jx-size-large)');
    expect(element.styleMap.get('font-size')).toBe('var(--jx-size-effective, 1rem)');

    // the container crosses the 24rem boundary → restamp
    anchor.clientWidth = 500;
    resizeCb!();
    expect(element.styleMap.get('--jx-size-effective')).toBe('var(--jx-size-small)');

    // an identical evaluation is a no-op (idempotent — no hydration surface)
    const before = element.styleMap.get('--jx-size-effective');
    resizeCb!();
    expect(element.styleMap.get('--jx-size-effective')).toBe(before);

    // ONE observer, on the container (never the stamped element)
    expect(observed).toEqual([anchor]);

    dispose();
  });

  it('warns ONCE in dev for a missing NAMED container, and the case never matches', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stub('requestAnimationFrame', (cb: () => void) => {
      cb();
      return 0;
    });
    stub('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    stub('ResizeObserver', class {
      observe(): void {}
      disconnect(): void {}
    });
    const element = new FakeElement();
    const dispose = mountQueryShim({
      element: element as unknown as HTMLElement,
      axis: 'size',
      cases: [
        ['@sm/card', 'small'],
        ['@sm/card', 'small'], // duplicate mount-equivalent — still ONE warning
      ],
      base: 'medium',
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain('@sm/card');
    // base holds — the unanchored case never matched
    expect(element.styleMap.get('--jx-size-effective')).toBe('var(--jx-size-medium)');
    dispose();
    warn.mockRestore();
  });
});
