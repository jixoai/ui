/**
 * The sheet family's Defaults contract lock (context-defaults-economy
 * task 2.2, 2026-09-03) — the frozen pilot decision (X2-11): ship the
 * contract (variant + size literal slots, the design table's two
 * named class-b examples), wire NO zone/entity — sheet has no footer
 * button cluster, so no zone need:
 *   - the contract surface: exactly { variant, density, size } —
 *     variant and size are literalSlots (declared owns 'auto' and
 *     '24rem', explicit type arguments), density the no-opinion axis
 *     slot (the panel stamps NOTHING; the fleet law)
 *   - zero behavior change: data-variant and the --jx-sheet-size
 *     style resolve exactly as the retired inline defaults did
 *   - 惰性律: the unit resolve below runs INSIDE a component window
 *     (unit-resolve-host — context-plugin-v2 D3-C: the density slot's
 *     ambient lane and the plugin-scope read are window-bound): the
 *     density slot stays silent, both owns resolve
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import type { Snippet } from 'svelte';
import Sheet from '../src/lib/ui/sheet/sheet.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import { SheetDefaults } from '../src/lib/ui/sheet/sheet-defaults.svelte';

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as Snippet;

// =========================================================================
// 1 · the contract surface — auditable in one place
// =========================================================================
describe('SheetDefaults — the contract surface', () => {
  it('declares exactly { variant, density, size }, shallow-frozen', () => {
    expect(Object.isFrozen(SheetDefaults.slots)).toBe(true);
    expect(Object.keys(SheetDefaults.slots).sort()).toEqual(['density', 'size', 'variant']);
  });

  it('resolves own-only inside a rootless component window (惰性律)', () => {
    // unit-resolve-host: compute runs in the host's $derived — no
    // provider, no plugin root; the density slot's ambient lane stays
    // silent instead of throwing (the retired outside-window case)
    const holder: { value?: unknown; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute: () => SheetDefaults.resolve({}),
        onvalue: (value, error) => {
          holder.value = value;
          holder.error = error;
        },
      },
    });
    flushSync();
    expect(holder.error).toBeUndefined();
    expect(holder.value).toEqual({ variant: 'auto', density: undefined, size: '24rem' });

    const explicit: { value?: unknown; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute: () => SheetDefaults.resolve({ variant: 'solid', size: '32rem' }),
        onvalue: (value, error) => {
          explicit.value = value;
          explicit.error = error;
        },
      },
    });
    flushSync();
    expect(explicit.error).toBeUndefined();
    expect(explicit.value).toEqual({ variant: 'solid', density: undefined, size: '32rem' });
  });
});

// =========================================================================
// 2 · the component read point — zero behavior change
// =========================================================================
describe('sheet.svelte — the one-line Defaults read point', () => {
  it('unset variant/size resolve the contract owns (data-variant="auto", --jx-sheet-size: 24rem)', () => {
    const { container } = render(Sheet, { props: { title: 't', children } });
    const panel = container.querySelector('dialog.jx-sheet')!;
    expect(panel.getAttribute('data-variant')).toBe('auto');
    expect(panel.getAttribute('style')).toContain('--jx-sheet-size: 24rem');
  });

  it('the explicit props win per slot', () => {
    const { container } = render(Sheet, {
      props: { title: 't', children, variant: 'acrylic', size: '32rem' },
    });
    const panel = container.querySelector('dialog.jx-sheet')!;
    expect(panel.getAttribute('data-variant')).toBe('acrylic');
    expect(panel.getAttribute('style')).toContain('--jx-sheet-size: 32rem');
  });
});
