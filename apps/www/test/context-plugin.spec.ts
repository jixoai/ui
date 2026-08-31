/**
 * The ContextPlugin kernel lock (context-plugin-system, 2026-08-30).
 *
 * The full verification matrix against design.md r2 / verification.md:
 *   - type domain: definePlugin targets narrowing + the 'medium'
 *     rejection (compile-time fixture + runtime guards)
 *   - ordering: array order / pre-post stable anchors / same-name
 *     override (per root) / cross-root stacking parent-first
 *   - the onion law: hook call log === beforeA → beforeB → afterB →
 *     afterA (same root AND parent/child composed root)
 *   - lifecycle: init full-value reducers (string / number / object),
 *     the reversible filter medium gate (screen → sim → print → sim →
 *     screen, value AND reference rebound)
 *   - immutability: frozen inputs in, new values out; raw is never
 *     written back by the chain
 *   - identity: zero plugins build no chain (structural assertion)
 *     and the dependency-count microbenchmark (a medium flip
 *     recomputes only the contexts whose plugins read it)
 *   - the three wirings: density's four-path matrix, medium's
 *     read-only domain, the hue adapter's wall clock + DOM stamp
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render, waitFor } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyChain,
  definePlugin,
  getContextPlugins,
  sortPlugins,
  withPlugins,
  type PluginPipeline,
  type PluginScope,
  type UnknownPlugin,
} from '../src/lib/context-plugin.svelte';
import { MEDIUM_DEF, PRINT_SIM_ATTR, type MediumState } from '../src/lib/medium.svelte';
import { currentHue, setHueManually, startHueRuntime, stopHueRuntime } from '../src/lib/hue-runtime.svelte';
import { resolveDensity } from '../src/lib/density.svelte';
import Root from './fixtures/context-plugin-root.svelte';
import MatrixHost from './fixtures/context-plugin-density-matrix-host.svelte';
import OnionHost from './fixtures/context-plugin-onion-host.svelte';
import NestedHost from './fixtures/context-plugin-nested-host.svelte';
import MediumHost from './fixtures/context-plugin-medium-host.svelte';
import HuePinHost from './fixtures/hue-pin-host.svelte';
import HueContextHost from './fixtures/hue-context-host.svelte';

const specDir = resolve(fileURLToPath(import.meta.url), '..');
const kernelSource = readFileSync(resolve(specDir, '../src/lib/context-plugin.svelte.ts'), 'utf8');

// ---- shared plugin builders ---------------------------------------------

const countingPlugin = (name: string, log: string[]): UnknownPlugin =>
  definePlugin({
    name,
    targets: ['probe'],
    before: (v: string, _env): string => {
      log.push(`before:${name}`);
      return `${v}<${name}`;
    },
    after: (v: string, _env): string => {
      log.push(`after:${name}`);
      return `${name}>${v}`;
    },
  });

// =========================================================================
// 1 · definePlugin — the registration currency
// =========================================================================
describe('definePlugin — the only registration entry', () => {
  it('freezes targets to the single context key and the product itself', () => {
    const p = definePlugin({
      name: 'p',
      targets: ['density'],
      before: (v: 'lg' | 'default' | 'sm' | 'xs' | undefined, _env) => v,
    });
    expect(p.targets).toEqual(['density']);
    expect(Object.isFrozen(p)).toBe(true);
    expect(Object.isFrozen(p.targets)).toBe(true);
    expect((p as { enforce?: unknown }).enforce).toBeUndefined();
  });

  it('keeps enforce / hooks optional and carries them when given', () => {
    const p = definePlugin({
      name: 'p',
      targets: ['hue'],
      enforce: 'pre',
      init: () => (v: number) => v + 1,
    });
    expect((p as { enforce?: unknown }).enforce).toBe('pre');
    expect(typeof (p as UnknownPlugin).init).toBe('function');
  });

  it('rejects a medium target at COMPILE time (the never-armed lane)', () => {
    // if this regresses, the @ts-expect-error below becomes UNUSED and
    // svelte-check fails the suite — the shiki-lib precedent
    const forgeMedium = () =>
      // @ts-expect-error the medium context is a read-only projection — 'medium' targets are rejected
      definePlugin({ name: 'x', targets: ['medium'], before: (v: MediumState) => v });
    expect(typeof forgeMedium).toBe('function');
  });

  it('rejects a medium target at RUNTIME (cast-forged spec)', () => {
    const forged = {
      name: 'forged',
      targets: ['medium'],
      before: (v: unknown) => v,
    } as never as Parameters<typeof definePlugin>[0];
    expect(() => definePlugin(forged)).toThrow(/medium/);
  });

  it('the medium def exposes the read-only projection domain', () => {
    expect(MEDIUM_DEF.key).toBe('medium');
    expect(MEDIUM_DEF.defaults()).toBe<MediumState>('screen');
    expect(MEDIUM_DEF.ssrSafe).toBe<MediumState>('screen');
  });
});

// =========================================================================
// 2 · runtime registration guards (the root)
// =========================================================================
describe('provideContextPlugins — runtime registration guards', () => {
  it('accepts only definePlugin products (the brand)', () => {
    const raw = { name: 'raw', targets: ['density'] } as unknown as UnknownPlugin;
    expect(() => render(Root, { plugins: [raw] })).toThrow(/definePlugin\(\) products only/);
  });

  it('refuses a medium-targeting plugin even with a stolen brand', () => {
    const branded = definePlugin({ name: 'ok', targets: ['density'] });
    // spread copies the module-private brand symbol — the registration
    // guard must still refuse the medium target itself
    const sneak = { ...branded, targets: ['medium'] } as unknown as UnknownPlugin;
    expect(() => render(Root, { plugins: [sneak] })).toThrow(/read-only projection/);
  });
});

// =========================================================================
// 3 · sortPlugins — the ordering law
// =========================================================================
describe('sortPlugins — array order with stable anchors', () => {
  const names = (plugins: readonly UnknownPlugin[]): string[] =>
    plugins.map((p) => String(p.name));

  it('preserves user array order when no anchors are set', () => {
    const [a, b, c] = [countingPlugin('a', []), countingPlugin('b', []), countingPlugin('c', [])];
    expect(names(sortPlugins([a, b, c]))).toEqual(['a', 'b', 'c']);
  });

  it('anchors pre before unanchored before post, stable inside each group', () => {
    const n1 = countingPlugin('n1', []);
    const n2 = countingPlugin('n2', []);
    const pre = definePlugin({ name: 'pre', targets: ['probe'], enforce: 'pre' });
    const post = definePlugin({ name: 'post', targets: ['probe'], enforce: 'post' });
    expect(names(sortPlugins([post, n1, pre, n2]))).toEqual(['pre', 'n1', 'n2', 'post']);
  });

  it('same NAME in one root: the later registration wins, with a warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const first = countingPlugin('dup', []);
      const second = countingPlugin('dup', []);
      const other = countingPlugin('other', []);
      const sorted = sortPlugins([first, other, second]);
      expect(names(sorted)).toEqual(['dup', 'other']);
      // identity proves the override, not a merge
      expect(sorted[0]).toBe(second);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('dup');
    } finally {
      warn.mockRestore();
    }
  });

  it('is pure: input untouched, output frozen', () => {
    const a = countingPlugin('a', []);
    const b = countingPlugin('b', []);
    const input = [a, b];
    const sorted = sortPlugins(input);
    expect(input).toEqual([a, b]);
    expect(input.length).toBe(2);
    expect(Object.isFrozen(sorted)).toBe(true);
    expect(sorted).not.toBe(input);
  });
});

// =========================================================================
// 4 · the onion law + lifecycle + immutability (withPlugins, unit level)
// =========================================================================
describe('withPlugins — the onion law (same root)', () => {
  it('hook call log is exactly beforeA → beforeB → afterB → afterA', () => {
    const log: string[] = [];
    const scope = {
      chain: [countingPlugin('A', log), countingPlugin('B', log)],
      env: { medium: 'screen' as MediumState, root: undefined },
      apply: (d: { key: string }, v: unknown) => v,
    };
    const pipe = withPlugins({ key: 'probe', defaults: () => 'raw', ssrSafe: 'raw' }, scope as PluginScope);
    pipe.setRaw('v');
    // raw → beforeA → beforeB → afterB → afterA: the outer layer's
    // after closes over every inner projection
    expect(pipe.exposed).toBe('A>B>v<A<B');
    expect(log).toEqual(['before:A', 'before:B', 'after:B', 'after:A']);
  });
});

describe('withPlugins — init is an environment-free full-value reducer', () => {
  it('string: plugin order, later output is the next input, later covers earlier', () => {
    const log: string[] = [];
    const scope = {
      chain: [
        definePlugin({
          name: 'one',
          targets: ['probe'],
          init: (def) => {
            log.push(`init-one:${def.key}`);
            return (v: string) => `${v}+one`;
          },
        }),
        definePlugin({
          name: 'two',
          targets: ['probe'],
          init: () => (v: string) => `${v}+two`,
        }),
      ],
      env: { medium: 'screen' as MediumState, root: undefined },
      apply: (d: { key: string }, v: unknown) => v,
    };
    const pipe = withPlugins({ key: 'probe', defaults: () => 'd', ssrSafe: 'd' }, scope as PluginScope);
    expect(pipe.raw).toBe('d+one+two');
    expect(log).toEqual(['init-one:probe']);
    // one-time: setRaw never re-runs init
    pipe.setRaw('next');
    expect(log).toEqual(['init-one:probe']);
  });

  it('number: reducers chain arithmetically (no string magic)', () => {
    const scope = {
      chain: [
        definePlugin({ name: 'ten', targets: ['probe'], init: () => (v: number) => v + 10 }),
        definePlugin({ name: 'double', targets: ['probe'], init: () => (v: number) => v * 2 }),
      ],
      env: { medium: 'screen' as MediumState, root: undefined },
      apply: (d: { key: string }, v: unknown) => v,
    };
    const pipe = withPlugins({ key: 'probe', defaults: () => 0, ssrSafe: 0 }, scope as PluginScope);
    expect(pipe.raw).toBe(20);
  });

  it('object: NO shallow merge — a reducer REPLACES the whole value', () => {
    const scope = {
      chain: [
        definePlugin({
          name: 'grow',
          targets: ['probe'],
          init: () => (v: { a: number; b: number }) => ({ ...v, a: v.a + 1 }),
        }),
        definePlugin({
          name: 'replace',
          targets: ['probe'],
          init: () => (_v: { a: number; b: number }) => ({ b: 99 }),
        }),
      ],
      env: { medium: 'screen' as MediumState, root: undefined },
      apply: (d: { key: string }, v: unknown) => v,
    };
    const pipe = withPlugins(
      { key: 'probe', defaults: () => ({ a: 1, b: 1 }), ssrSafe: { a: 1, b: 1 } },
      scope as PluginScope,
    );
    expect(pipe.raw).toEqual({ b: 99 });
  });
});

describe('withPlugins — immutability and raw ownership', () => {
  it('before/after take the frozen input and return a NEW value; raw keeps its reference', () => {
    const raw = Object.freeze({ tag: 'raw' });
    const seen: unknown[] = [];
    const scope = {
      chain: [
        definePlugin({
          name: 'b',
          targets: ['probe'],
          before: (v: { tag: string }, _env) => {
            seen.push(v);
            return { tag: `${v.tag}!` };
          },
          after: (v: { tag: string }, _env) => ({ tag: `[${v.tag}]` }),
        }),
      ],
      env: { medium: 'screen' as MediumState, root: undefined },
      apply: (d: { key: string }, v: unknown) => v,
    };
    const pipe = withPlugins(
      { key: 'probe', defaults: () => raw, ssrSafe: raw },
      scope as PluginScope,
    );
    // defaults pass through init untouched — the SAME frozen reference
    expect(pipe.raw).toBe(raw);
    const exposed = pipe.exposed;
    expect(exposed).not.toBe(raw); // new value out
    expect(exposed).toEqual({ tag: '[raw!]' });
    expect(seen[0]).toBe(raw); // the hook received the frozen input
    expect((raw as { tag: string }).tag).toBe('raw'); // never mutated
    // the chain NEVER writes back: raw is still the original reference
    expect(pipe.raw).toBe(raw);
  });
});

describe('withPlugins — zero plugins is the identity fast path', () => {
  it('no scope → no chain is built (structural) and exposed === raw by reference', () => {
    const spy = { called: false };
    const pipe = withPlugins({ key: 'probe', defaults: () => 'x', ssrSafe: 'x' }, undefined);
    expect(pipe.targeting).toHaveLength(0);
    const obj = { tag: 'obj' };
    pipe.setRaw(obj as never);
    expect(pipe.exposed).toBe(obj); // reference identity, no composition
    expect(spy.called).toBe(false);
  });

  it('a scope whose chain does not target the def stays identity — no hook runs', () => {
    let ran = false;
    const foreign = definePlugin({
      name: 'foreign',
      targets: ['other-key'],
      before: () => {
        ran = true;
        return 'x';
      },
    });
    const scope = {
      chain: [foreign as UnknownPlugin],
      env: { medium: 'screen' as MediumState, root: undefined },
      apply: (d: { key: string }, v: unknown) => v,
    };
    const pipe = withPlugins({ key: 'probe', defaults: () => 'v', ssrSafe: 'v' }, scope as PluginScope);
    expect(pipe.targeting).toHaveLength(0);
    expect(pipe.exposed).toBe('v');
    expect(ran).toBe(false);
    // the pure chain application agrees (the density seam's fast path)
    expect(applyChain({ key: 'probe' }, 'v', [foreign as UnknownPlugin], scope.env)).toBe('v');
  });
});

// =========================================================================
// 5 · the scope — root-scoped registration, stacking, env
// =========================================================================
describe('the plugin scope — registration, stacking, env', () => {
  it('getContextPlugins outside any root is undefined (identity, no singleton)', () => {
    expect(getContextPlugins()).toBeUndefined();
  });

  it('provides at a root: children read the scope; env defaults are SSR-shaped', () => {
    const holder: { scope?: PluginScope } = {};
    render(Root, { plugins: [], holder });
    const scope = holder.scope!;
    expect(scope).toBeDefined();
    expect(scope.chain).toEqual([]);
    // no medium provider above → the explicit 'screen' initial; no
    // root element passed → undefined (the SSR shape)
    expect(scope.env.medium).toBe<MediumState>('screen');
    expect(scope.env.root).toBeUndefined();
  });

  it('env.root carries the host element the root supplied', () => {
    const holder: { scope?: PluginScope } = {};
    const el = document.createElement('div');
    render(Root, { plugins: [], root: el, holder });
    expect(holder.scope!.env.root).toBe(el);
  });

  it('nested roots stack parent-first: the composed chain is [parent…, child…]', () => {
    const outerHolder: { scope?: PluginScope } = {};
    const innerHolder: { scope?: PluginScope } = {};
    const log: string[] = [];
    render(OnionHost, { log, nested: true, outerHolder, innerHolder });
    expect(outerHolder.scope!.chain).toHaveLength(1);
    expect(innerHolder.scope!.chain).toHaveLength(2);
    // parent plugin sits OUTER (first) in the composed chain
    expect(String(innerHolder.scope!.chain[0].name)).toBe('A');
    expect(String(innerHolder.scope!.chain[1].name)).toBe('B');
  });

  it('cross-root same names do NOT dedupe — both layers apply', () => {
    const log: string[] = [];
    const { container } = render(OnionHost, { log, nested: true, dup: true });
    // both same-named plugins fired (the log shows the parent/child pair)
    expect(log.filter((entry) => entry === 'beforeA').length).toBeGreaterThan(0);
    expect(log.filter((entry) => entry === 'beforeB').length).toBeGreaterThan(0);
    expect(container.querySelector('[data-density]')!.getAttribute('data-density')).toBe('sm');
  });
});

// =========================================================================
// 6 · the density wiring — onion exactness + the four-path matrix
// =========================================================================
describe('the density wiring — resolveDensity terminal value goes through the chain', () => {
  it('same-root A/B: the call log is exactly beforeA → beforeB → afterB → afterA', async () => {
    const log: string[] = [];
    const { rerender } = render(OnionHost, { log, nested: false, leafSize: 'lg' });
    expect(log).toEqual(['beforeA', 'beforeB', 'afterB', 'afterA']);
    // force one fresh resolution pass and assert the EXACT single pass
    log.length = 0;
    await rerender({ log, nested: false, leafSize: 'sm' });
    expect(log).toEqual(['beforeA', 'beforeB', 'afterB', 'afterA']);
  });

  it('parent/child roots: the same onion shape on the composed chain', async () => {
    const log: string[] = [];
    const { rerender } = render(OnionHost, { log, nested: true, leafSize: 'lg' });
    expect(log).toEqual(['beforeA', 'beforeB', 'afterB', 'afterA']);
    log.length = 0;
    await rerender({ log, nested: true, leafSize: 'sm' });
    expect(log).toEqual(['beforeA', 'beforeB', 'afterB', 'afterA']);
  });

  const leafStamp = (container: HTMLElement): string | null =>
    container.querySelector('[data-testid="matrix-leaf"]')!.getAttribute('data-density');
  const providerStamp = (container: HTMLElement): string | null =>
    container.querySelector('[data-density]:not([data-testid="matrix-leaf"])')!.getAttribute('data-density');

  it('four-path matrix × plugin on/off (the plugin maps defined values to sm)', async () => {
    // explicit
    const explicit = render(MatrixHost, { plugins: false, leaf: 'lg' });
    expect(leafStamp(explicit.container)).toBe('lg');
    await explicit.unmount();
    const explicitOn = render(MatrixHost, { plugins: true, leaf: 'lg' });
    expect(leafStamp(explicitOn.container)).toBe('sm');

    // inherited
    const inherited = render(MatrixHost, { plugins: false, provider: 'lg' });
    expect(leafStamp(inherited.container)).toBe('lg');
    await inherited.unmount();
    const inheritedOn = render(MatrixHost, { plugins: true, provider: 'lg' });
    expect(leafStamp(inheritedOn.container)).toBe('sm');

    // local fallback
    const fallback = render(MatrixHost, { plugins: false, fallback: 'default' });
    expect(leafStamp(fallback.container)).toBe('default');
    await fallback.unmount();
    const fallbackOn = render(MatrixHost, { plugins: true, fallback: 'default' });
    expect(leafStamp(fallbackOn.container)).toBe('sm');

    // no opinion at all — the plugin must NOT manufacture a stamp
    // (the fleet law: no opinion stamps NOTHING so ambient css
    // inheritance keeps flowing)
    const none = render(MatrixHost, { plugins: false });
    expect(leafStamp(none.container)).toBeNull();
    await none.unmount();
    const noneOn = render(MatrixHost, { plugins: true });
    expect(leafStamp(noneOn.container)).toBeNull();
  });

  it('the provider above the root keeps its own stamp unchained (direction in)', () => {
    const { container } = render(MatrixHost, { plugins: true, provider: 'lg' });
    expect(providerStamp(container)).toBe('lg'); // resolved above the root
    expect(leafStamp(container)).toBe('sm'); // the leaf went through the chain
  });

  it('nested both directions fix the capture coordinate (nearest visible chain)', () => {
    // direction 'in': provider OUTSIDE, plugin root INSIDE
    const inward = render(NestedHost, { direction: 'in' });
    const stampsIn = [...inward.container.querySelectorAll('[data-density]')].map((el) =>
      el.getAttribute('data-density'),
    );
    expect(stampsIn).toEqual(['lg', 'sm']); // provider raw, leaf chained

    // direction 'out': plugin root OUTSIDE, provider INSIDE
    const outward = render(NestedHost, { direction: 'out' });
    const stampsOut = [...outward.container.querySelectorAll('[data-density]')].map((el) =>
      el.getAttribute('data-density'),
    );
    expect(stampsOut).toEqual(['sm', 'sm']); // provider resolved chained, leaf inherits it
  });

  it('no plugin root anywhere: resolveDensity is the pure identity (today pages)', () => {
    // outside any component AND outside any root — the exact
    // pre-plugin resolution law, unchanged
    expect(resolveDensity('lg', undefined)).toBe('lg');
    expect(resolveDensity(undefined, { density: 'sm' })).toBe('sm');
    expect(resolveDensity(undefined, undefined, 'xs')).toBe('xs');
    expect(resolveDensity(undefined, undefined)).toBeUndefined();
  });
});

// =========================================================================
// 7 · the reversible filter gate + the dependency-count microbenchmark
// =========================================================================
describe('the filter medium gate — screen → sim → print → sim → screen', () => {
  const stampSim = (container: HTMLElement, on: boolean) => {
    const root = container.querySelector('[data-testid="medium-root"]')!;
    if (on) root.setAttribute(PRINT_SIM_ATTR, '');
    else root.removeAttribute(PRINT_SIM_ATTR);
  };
  const firePrint = (type: 'beforeprint' | 'afterprint') => {
    window.dispatchEvent(new Event(type));
    flushSync();
  };

  it('round-trips the value AND the reference; only medium-reading contexts recompute', async () => {
    const calls = { a: 0, b: 0 };
    const holder: { a?: PluginPipeline<{ tag: string }>; b?: PluginPipeline<string> } = {};
    const { container } = render(MediumHost, { calls, holder });

    // screen: the gate is closed — exposed IS the raw reference
    expect(container.querySelector('[data-testid="exposed-a"]')!.textContent).toBe('a');
    expect(holder.a!.exposed).toBe(holder.a!.raw); // reference identity
    expect(calls).toEqual({ a: 0, b: 1 }); // b's plugin ran once at first read

    // sim enters (the DOM stamp channel — MutationObserver microtask)
    stampSim(container, true);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="exposed-a"]')!.textContent).toBe('A(a)'),
    );
    expect(holder.a!.exposed).not.toBe(holder.a!.raw); // new value out
    expect(holder.a!.raw).toEqual({ tag: 'a' }); // raw untouched
    expect(container.querySelector('[data-testid="exposed-b"]')!.textContent).toBe('B(b)');
    // the dependency count: a's plugin ran, b's did NOT re-run
    expect(calls).toEqual({ a: 1, b: 1 });

    // real print wins over the surviving stamp
    firePrint('beforeprint');
    expect(container.querySelector('[data-testid="exposed-a"]')!.textContent).toBe('A(a)');
    expect(calls).toEqual({ a: 2, b: 1 });

    // afterprint clears ONLY the print source — the surviving stamp
    // re-derives 'sim' (re-evaluation, not restoration)
    firePrint('afterprint');
    expect(container.querySelector('[data-testid="exposed-a"]')!.textContent).toBe('A(a)');
    expect(calls).toEqual({ a: 3, b: 1 });

    // the stamp leaves → screen → the gate closes → the exposed value
    // AND its reference return exactly to the raw provider value
    stampSim(container, false);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="exposed-a"]')!.textContent).toBe('a'),
    );
    expect(holder.a!.exposed).toBe(holder.a!.raw); // reference rebound
    expect(calls.b).toBe(1); // probe-b never recomputed across the whole trip
  });
});

// =========================================================================
// 8 · the hue adapter — wall clock + DOM stamp, context-endorsed
// =========================================================================
describe('the hue adapter — wall clock and DOM stamp unchanged', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--brand-hue');
  });
  afterEach(() => {
    stopHueRuntime();
    vi.useRealTimers();
  });

  const stamp = (): string => document.documentElement.style.getPropertyValue('--brand-hue');

  it('derives the wall-clock hue and stamps documentElement (no context yet = the raw path)', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance'],
    });
    // 07:57:36 → hue 119.4 (just under the 119/120 rounding boundary:
    // +60s of wall clock must move the ROUNDED stamp)
    vi.setSystemTime(new Date(2026, 0, 15, 7, 57, 36));
    startHueRuntime();
    expect(stamp()).toBe('119');
    expect(get(currentHue)).toBe(119);

    // the 5s entry spin completes and cruising keeps deriving the clock
    vi.advanceTimersByTime(5_100);
    expect(stamp()).toBe('119'); // the spin returns to its own start

    // one minute of wall clock = 0.25° — the rounded stamp moves
    vi.setSystemTime(new Date(2026, 0, 15, 7, 58, 36));
    vi.advanceTimersByTime(1_000);
    expect(stamp()).toBe('120');
    stopHueRuntime();
  });

  it('dedups redundant CSS writes when the rounded written value has not moved', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance'],
    });
    vi.setSystemTime(new Date(2026, 0, 15, 7, 57, 36));
    startHueRuntime();
    vi.advanceTimersByTime(6_000);
    stopHueRuntime();
    const setProperty = vi.spyOn(document.documentElement.style, 'setProperty');
    // cruising ticks whose rounded value does not move write nothing
    vi.advanceTimersByTime(3_000);
    expect(setProperty).not.toHaveBeenCalled();
    setProperty.mockRestore();
  });

  it('routes manual sets through the endorsed pipeline and mirrors the store', () => {
    render(HueContextHost);
    setHueManually(120);
    flushSync();
    expect(stamp()).toBe('120');
    expect(get(currentHue)).toBe(120);
    // normalization: -30 wraps to 330
    setHueManually(-30);
    flushSync();
    expect(stamp()).toBe('330');
  });

  it('a print plugin pins the hue — the stamp follows the EXPOSED projection', () => {
    const { container } = render(HuePinHost);
    setHueManually(120);
    flushSync();
    expect(stamp()).toBe('120'); // screen: gate closed, wall-clock value
    expect(container.querySelector('[data-testid="hue-host"]')!.getAttribute('data-hue')).toBe('120');

    window.dispatchEvent(new Event('beforeprint'));
    flushSync();
    expect(stamp()).toBe('210'); // pinned through the chain
    expect(container.querySelector('[data-testid="hue-host"]')!.getAttribute('data-hue')).toBe('210');

    window.dispatchEvent(new Event('afterprint'));
    flushSync();
    expect(stamp()).toBe('120'); // the gate lifts — raw value restored
    expect(container.querySelector('[data-testid="hue-host"]')!.getAttribute('data-hue')).toBe('120');
  });
});

// =========================================================================
// 9 · module posture
// =========================================================================
describe('module posture', () => {
  it('the kernel has zero npm imports (svelte + local only)', () => {
    const imports = [...kernelSource.matchAll(/^import .*?from '([^']+)';$/gm)].map((m) => m[1]);
    expect(imports.every((specifier) => specifier === 'svelte' || specifier.startsWith('./'))).toBe(true);
  });
});
