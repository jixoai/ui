/**
 * The dialog family's Defaults contract lock (context-defaults-economy
 * task 2.2, 2026-09-03) — the pilot's class-b exemplar (design.md's
 * coverage table: a style prop with a declared own and no axis yet):
 *   - the contract surface: exactly { variant, density } — variant is
 *     the literalSlot (own 'auto', explicit type argument, ambient
 *     pending an axis), density the no-opinion axis slot (class a —
 *     the panel stamps NOTHING, the ambient css scope channel keeps
 *     flowing; the fleet law)
 *   - zero behavior change: data-variant resolves exactly as the
 *     retired inline default did (unset → 'auto', explicit wins)
 *   - 惰性律: the unit resolve below runs INSIDE a component window
 *     (unit-resolve-host — context-plugin-v2 D3-C: the density slot's
 *     ambient lane and the plugin-scope read are window-bound): the
 *     density slot stays silent (no throw, no manufactured opinion),
 *     the literal slot's own still resolves
 *
 * The ghost ButtonVariantScope usage is untouched by the migration
 * (r14 series) — its behavior lock lives in dialog-ghost-scope.spec.ts.
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import type { Snippet } from 'svelte';
import Dialog from '../src/lib/ui/dialog/dialog.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import { DialogDefaults } from '../src/lib/ui/dialog/dialog-defaults.svelte';

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as Snippet;

// =========================================================================
// 1 · the contract surface — auditable in one place
// =========================================================================
describe('DialogDefaults — the contract surface', () => {
  it('declares exactly { variant, density }, shallow-frozen', () => {
    expect(Object.isFrozen(DialogDefaults.slots)).toBe(true);
    expect(Object.keys(DialogDefaults.slots).sort()).toEqual(['density', 'variant']);
  });

  it('resolves own-only inside a rootless component window (惰性律)', () => {
    // unit-resolve-host: compute runs in the host's $derived — no
    // provider, no plugin root; the density slot's ambient lane stays
    // silent instead of throwing (the retired outside-window case)
    const holder: { value?: unknown; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute: () => DialogDefaults.resolve({}),
        onvalue: (value, error) => {
          holder.value = value;
          holder.error = error;
        },
      },
    });
    flushSync();
    expect(holder.error).toBeUndefined();
    expect(holder.value).toEqual({ variant: 'auto', density: undefined });

    const explicit: { value?: unknown; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute: () => DialogDefaults.resolve({ variant: 'solid' }),
        onvalue: (value, error) => {
          explicit.value = value;
          explicit.error = error;
        },
      },
    });
    flushSync();
    expect(explicit.error).toBeUndefined();
    expect(explicit.value).toEqual({ variant: 'solid', density: undefined });
  });
});

// =========================================================================
// 2 · the component read point — zero behavior change
// =========================================================================
describe('dialog.svelte — the one-line Defaults read point', () => {
  it('unset variant resolves the contract own: data-variant="auto"', () => {
    const { container } = render(Dialog, { props: { title: 't', children } });
    expect(container.querySelector('dialog.jx-dialog')!.getAttribute('data-variant')).toBe('auto');
  });

  it('the explicit prop wins per slot', () => {
    const { container } = render(Dialog, {
      props: { title: 't', children, variant: 'solid' },
    });
    expect(container.querySelector('dialog.jx-dialog')!.getAttribute('data-variant')).toBe('solid');
  });
});
