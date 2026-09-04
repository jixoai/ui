/**
 * The defaults tool's RUNTIME lock (context-defaults-economy 1.1,
 * 2026-09-03; context-plugin-v2 D3 subtractions, W2 task 3.4;
 * slot-values-first 2.5, 2026-09-04) — fixture per design.md r8 /
 * verification.md 工具层:
 *   - identity: defineLiteralSlot resolves `explicit ?? defaultValue`
 *     (the values tuple is a type/gate carrier ONLY — the runtime
 *     ignores it, so resolve is byte-identical to the retired
 *     literalSlot(own)); defineOpenSlot resolves `explicit ?? own`;
 *     absentSlot's sentinel undefined IS the absent state
 *   - 惰性律: construction never resolves (module-load zero-call);
 *     the window is a HARD CONTRACT (D3-C: a context-reading resolver
 *     outside a component window lets Svelte's own
 *     lifecycle_outside_component propagate — the retired predicate
 *     and slot-level backstop are gone); non-lifecycle errors
 *     propagate
 *   - the dual guard's runtime half (the WeakSet fixtures — dev-only
 *     since D3-B; vitest runs under vite with DEV=true): a legit
 *     cross-module defineAxisSlot product passes; a cast-forged slot
 *     and a marker-copied slot (brand symbol properties reflected
 *     from a legit slot onto a lookalike) both die at
 *     defineComponentDefaults with the frozen message — named slot
 *     constants (the family-file shape since slot-values-first)
 *     validate exactly as inline calls did
 *   - the resolve contract: a FRESH plain object each call, output
 *     never frozen, slots shallow-frozen
 */
import { getContext } from 'svelte';
import { describe, expect, it } from 'vitest';
import {
  absentSlot,
  defineAxisSlot,
  defineComponentDefaults,
  defineLiteralSlot,
  defineOpenSlot,
  type DefaultsSlot,
} from '../src/lib/defaults.svelte';

type SurfaceVariant = 'solid' | 'acrylic' | 'auto';
type GhostState = 'ghosted' | 'live';

// the family-file shape (slot-values-first D2): named slot constants
// wired into the contract object by reference — defineComponentDefaults
// brand-checks them exactly as it checked inline factory calls
const surfaceSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
const ghostSlot = absentSlot<GhostState>();

const DialogDefaults = defineComponentDefaults({
  surface: surfaceSlot,
  ghost: ghostSlot,
});

// =========================================================================
// 1 · the literal family — identity and the sentinel
// =========================================================================
describe('the literal family — the identity fast path', () => {
  it('defineLiteralSlot resolves explicit ?? defaultValue (values ignored at runtime)', () => {
    expect(DialogDefaults.resolve({ surface: 'solid' }).surface).toBe('solid');
    expect(DialogDefaults.resolve({}).surface).toBe('auto');
  });

  it('defineOpenSlot resolves explicit ?? own (the open-domain literal form)', () => {
    const size = defineOpenSlot<string>('24rem');
    expect(size(undefined)).toBe('24rem');
    expect(size('32rem')).toBe('32rem');
  });

  it('absentSlot: the sentinel undefined IS the absent state', () => {
    expect(DialogDefaults.resolve({}).ghost).toBeUndefined();
    expect(DialogDefaults.resolve({ ghost: 'ghosted' }).ghost).toBe('ghosted');
  });

  it('explicit beats everything, per slot, independently', () => {
    const both = DialogDefaults.resolve({ surface: 'acrylic', ghost: 'live' });
    expect(both).toEqual({ surface: 'acrylic', ghost: 'live' });
  });
});

// =========================================================================
// 2 · the resolve contract — fresh, plain, unfrozen; slots frozen
// =========================================================================
describe('resolve — the output contract', () => {
  it('returns a FRESH plain object each call (per-slot destructuring discipline)', () => {
    const a = DialogDefaults.resolve({});
    const b = DialogDefaults.resolve({});
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
    expect(Object.isFrozen(a)).toBe(false);
    expect(Object.getPrototypeOf(a)).toBe(Object.prototype);
  });

  it('exposes the shallow-frozen slots surface (the auditable contract)', () => {
    expect(Object.isFrozen(DialogDefaults.slots)).toBe(true);
    expect(Object.keys(DialogDefaults.slots).sort()).toEqual(['ghost', 'surface']);
    expect(DialogDefaults.slots.surface).toBeTypeOf('function');
  });
});

// =========================================================================
// 3 · the dual guard — factory products only (the WeakSet fixtures)
// =========================================================================
describe('the dual guard — slots accept factory products only', () => {
  it('accepts a legit cross-module axis slot constructed via defineAxisSlot', () => {
    const probe = defineAxisSlot<string>('probe-axis', (explicit) => explicit ?? 'own');
    const ProbeDefaults = defineComponentDefaults({ probe });
    expect(ProbeDefaults.slots.probe).toBe(probe);
    expect(ProbeDefaults.resolve({ probe: 'explicit' }).probe).toBe('explicit');
    expect(ProbeDefaults.resolve({}).probe).toBe('own');
  });

  it('rejects a cast-forged slot (the half the type brand cannot see)', () => {
    const forged = ((v: string | undefined) => v ?? 'x') as unknown as DefaultsSlot<string>;
    expect(() => defineComponentDefaults({ forged })).toThrow(
      '[defaults] slots accept factory products only',
    );
  });

  it('rejects a marker-copied slot (brand properties reflected from a legit slot)', () => {
    const legit = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
    const lookalike = ((v: SurfaceVariant | undefined) => v ?? 'auto') as DefaultsSlot<SurfaceVariant>;
    for (const symbol of Object.getOwnPropertySymbols(legit)) {
      Object.defineProperty(lookalike, symbol, Object.getOwnPropertyDescriptor(legit, symbol)!);
    }
    // the brand marker really did transfer to the lookalike…
    expect(Object.getOwnPropertySymbols(lookalike).length).toBeGreaterThan(0);
    // …and the WeakSet still refuses it (the check is dev-only since
    // D3-B — vitest runs under vite with DEV=true, so it still fires)
    expect(() => defineComponentDefaults({ lookalike })).toThrow(
      '[defaults] slots accept factory products only',
    );
  });
});

// =========================================================================
// 4 · 惰性律 — construction purity and the hard window contract
// =========================================================================
describe('惰性律 — construction is pure; the window contract', () => {
  it('construction NEVER resolves (module-load zero-call)', () => {
    let calls = 0;
    const lazy = defineAxisSlot<string>('lazy-axis', (explicit) => {
      calls += 1;
      return explicit ?? 'own';
    });
    expect(calls).toBe(0);
    expect(lazy(undefined)).toBe('own');
    expect(calls).toBe(1);
  });

  it('outside the window a context-reading resolver throws the native lifecycle error (the hard contract)', () => {
    // D3-C: the predicate and the slot-level re-entry backstop are
    // retired — a resolver whose ambient lane reads context lets
    // Svelte's own lifecycle_outside_component PROPAGATE out of the
    // slot call (never caught, never normalized, never
    // message-matched). The in-window resolve is every host fixture's
    // job (unit-resolve-host.svelte carries the migrated its).
    const reader = defineAxisSlot<string | undefined>(
      'ambient-axis',
      (_explicit, _ambient) => getContext<string | undefined>(Symbol('probe-key')),
    );
    expect(() => reader(undefined)).toThrow(/lifecycle_outside_component/);
  });

  it('non-lifecycle errors propagate through the slot (no silent identity)', () => {
    const axisBug = new Error('axis-bug');
    const buggy = defineAxisSlot<string>('buggy-axis', () => {
      throw axisBug;
    });
    // the SAME error reference escapes — nothing is swallowed
    expect(() => buggy(undefined)).toThrow(axisBug);
  });
});

// =========================================================================
// 5 · the name carrier (错误消息与门禁报告同源)
// =========================================================================
describe('the axis name carrier', () => {
  it('rides the product function name for diagnostics', () => {
    expect(defineAxisSlot<string>('probe-axis', (e) => e ?? 'own').name).toBe('probe-axis');
    expect(defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto').name).toBe('literal');
    expect(defineOpenSlot<string>('24rem').name).toBe('literal');
    expect(absentSlot<GhostState>().name).toBe('absent');
  });
});
