/**
 * mixinIconProvider unit tests (P2.4, 2026-08-28).
 *
 * Verifies the frozen lookup semantics: override.getIcon(slot) first,
 * null falls through to base.getIcon(slot), both null → null — and
 * that override providers are created ONCE at factory time, never per
 * getIcon call.
 */

import { describe, expect, it, vi } from 'vitest';
import { mixinIconProvider } from '../../../src/icons/providers/mixin.js';
import type { IconProvider, IconProviderFactory, IconSlot, ProviderContext, SvgAsset } from '../../../src/icons/types.js';

// ── mock helpers ───────────────────────────────────────────────────

function asset(tag: string): SvgAsset {
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0L24 24Z" data-tag="${tag}"/></svg>`,
    viewBox: { width: 24, height: 24 },
    nature: 'fill',
    source: { kind: 'inline' },
  };
}

/** a provider answering from a fixed map (missing slot → null) */
function staticProvider(map: Readonly<Partial<Record<IconSlot, SvgAsset | null>>>): IconProvider {
  return {
    getIcon(slot: IconSlot): SvgAsset | null {
      const value = map[slot];
      return value === undefined ? null : value;
    },
  };
}

/** wrap a provider in a factory that records its invocations */
function trackedFactory(provider: IconProvider): IconProviderFactory {
  return vi.fn(async (_ctx: ProviderContext): Promise<IconProvider> => provider);
}

/** production-style factory (no vi.fn) for the rejection tests */
function rejectingFactory(error: Error): IconProviderFactory {
  return async (): Promise<IconProvider> => {
    throw error;
  };
}

// ── tests ──────────────────────────────────────────────────────────

describe('mixinIconProvider', () => {
  it('answers overridden slots from the override and everything else from the base', async () => {
    const mixin = await mixinIconProvider(
      async () => staticProvider({ calendar: asset('base-calendar'), chevron: asset('base-chevron') }),
      { chevron: async () => staticProvider({ chevron: asset('override-chevron') }) },
    )(fakeContext());

    expect(mixin.getIcon('chevron')!.svg).toContain('override-chevron');
    expect(mixin.getIcon('calendar')!.svg).toContain('base-calendar');
    expect(mixin.getIcon('pipette')).toBeNull(); // neither provider has it
  });

  it('falls through to the base when the override returns null for its slot', async () => {
    const mixin = await mixinIconProvider(
      async () => staticProvider({ chevron: asset('base-chevron') }),
      { chevron: async () => staticProvider({ chevron: null }) },
    )(fakeContext());

    expect(mixin.getIcon('chevron')!.svg).toContain('base-chevron');
  });

  it('returns null when both override and base return null', async () => {
    const mixin = await mixinIconProvider(
      async () => staticProvider({ chevron: null }),
      { chevron: async () => staticProvider({}) },
    )(fakeContext());

    expect(mixin.getIcon('chevron')).toBeNull();
  });

  it('creates the override provider ONCE at factory time, not per getIcon call', async () => {
    const base = trackedFactory(staticProvider({ calendar: asset('base-calendar') }));
    const override = trackedFactory(staticProvider({ calendar: asset('override-calendar') }));

    const mixin = await mixinIconProvider(base, { calendar: override })(fakeContext());

    for (let i = 0; i < 3; i++) {
      expect(mixin.getIcon('calendar')!.svg).toContain('override-calendar');
    }
    expect(base).toHaveBeenCalledTimes(1);
    expect(override).toHaveBeenCalledTimes(1);
  });

  it('never consults an override provider for a foreign slot', async () => {
    const overrideGetIcon = vi.fn((slot: IconSlot): SvgAsset | null =>
      slot === 'chevron' ? asset('override-chevron') : null,
    );
    const mixin = await mixinIconProvider(
      async () => staticProvider({ calendar: asset('base-calendar') }),
      { chevron: async () => ({ getIcon: overrideGetIcon }) },
    )(fakeContext());

    expect(mixin.getIcon('calendar')!.svg).toContain('base-calendar');
    expect(overrideGetIcon).not.toHaveBeenCalled();
  });

  it('passes the same ProviderContext to base and override factories', async () => {
    const seen: ProviderContext[] = [];
    const record = async (ctx: ProviderContext): Promise<IconProvider> => {
      seen.push(ctx);
      return staticProvider({});
    };
    const ctx = fakeContext();

    await mixinIconProvider(record, { chevron: record })(ctx);

    expect(seen).toHaveLength(2);
    expect(seen[0]).toBe(ctx);
    expect(seen[1]).toBe(ctx);
  });

  it('propagates a base factory rejection', async () => {
    const error = new Error('base exploded');
    await expect(
      mixinIconProvider(rejectingFactory(error), { chevron: async () => staticProvider({}) })(
        fakeContext(),
      ),
    ).rejects.toBe(error);
  });

  it('propagates an override factory rejection', async () => {
    const error = new Error('override exploded');
    await expect(
      mixinIconProvider(async () => staticProvider({}), { chevron: rejectingFactory(error) })(
        fakeContext(),
      ),
    ).rejects.toBe(error);
  });
});

/** the minimal context shape — mixin itself does no I/O */
function fakeContext(): ProviderContext {
  return {
    loadSource: async (path: string) => {
      throw new Error(`unexpected loadSource(${path}) — mixin does no I/O`);
    },
    watchFile: () => {
      throw new Error('unexpected watchFile — mixin does no I/O');
    },
  };
}
