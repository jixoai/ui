/**
 * The sheet family's Defaults contract lock (context-defaults-economy
 * task 2.2, 2026-09-03; re-locked W3-C) — the frozen pilot decision
 * (X2-11): ship the contract, wire NO zone/entity — sheet has no
 * footer button cluster, so no zone need:
 *   - the contract surface: { variant, width, density, … } — variant
 *     and width are literalSlots (declared owns 'auto' and '24rem',
 *     explicit type arguments), the EIGHT universal axes ride the
 *     same record (elevation carries the drawer's own level4, the
 *     §7 historic z-feel mapping; the others no-own)
 *   - the §13 RENAME (W3-C, Owner table ruling): the css-width prop
 *     is `width` now — never `size`; the freed name belongs to the
 *     universal size lane (a scale axis, root font-size)
 *   - zero behavior change on the width lane: the --jx-sheet-size
 *     style resolves exactly as before, through the renamed slot
 *   - 惰性律: the unit resolve below runs INSIDE a component window
 *     (unit-resolve-host — context-plugin-v2 D3-C: the ambient lanes
 *     are window-bound): they stay silent, both owns resolve
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
  it('declares the §13-renamed width slot + the eight universal axes, shallow-frozen', () => {
    expect(Object.isFrozen(SheetDefaults.slots)).toBe(true);
    expect(Object.keys(SheetDefaults.slots).sort()).toEqual([
      'color',
      'density',
      'elevation',
      'motion',
      'radius',
      'shape',
      'size',
      'theme',
      'variant',
      'width',
    ]);
  });

  it('resolves own-only inside a rootless component window (惰性律)', () => {
    // unit-resolve-host: compute runs in the host's $derived — no
    // provider, no plugin root; the ambient lanes stay silent
    // instead of throwing (the retired outside-window case)
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
    expect(holder.value).toEqual({
      variant: 'auto',
      width: '24rem',
      density: 'auto',
      size: 'auto',
      shape: 'auto',
      radius: 'auto',
      color: 'auto',
      theme: 'auto',
      elevation: 'level4',
      motion: 'auto',
    });

    const explicit: { value?: unknown; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute: () => SheetDefaults.resolve({ variant: 'solid', width: '32rem' }),
        onvalue: (value, error) => {
          explicit.value = value;
          explicit.error = error;
        },
      },
    });
    flushSync();
    expect(explicit.error).toBeUndefined();
    expect(explicit.value).toMatchObject({ variant: 'solid', width: '32rem' });
  });
});

// =========================================================================
// 2 · the component read point — zero behavior change on the width lane
// =========================================================================
describe('sheet.svelte — the one-record Defaults read point', () => {
  it('unset variant/width resolve the contract owns (data-variant="auto", --jx-sheet-size: 24rem)', () => {
    const { container } = render(Sheet, { props: { title: 't', children } });
    const panel = container.querySelector('dialog.jx-sheet')!;
    expect(panel.getAttribute('data-variant')).toBe('auto');
    expect(panel.getAttribute('style')).toContain('--jx-sheet-size: 24rem');
  });

  it('the explicit props win per slot (the §13 rename: width, never size)', () => {
    const { container } = render(Sheet, {
      props: { title: 't', children, variant: 'acrylic', width: '32rem' },
    });
    const panel = container.querySelector('dialog.jx-sheet')!;
    expect(panel.getAttribute('data-variant')).toBe('acrylic');
    expect(panel.getAttribute('style')).toContain('--jx-sheet-size: 32rem');
  });

  it('the elevation own lands the §7 consumption pair (level4 = the drawer rung)', () => {
    const { container } = render(Sheet, { props: { title: 't', children } });
    const panel = container.querySelector('dialog.jx-sheet')!;
    const style = panel.getAttribute('style') ?? '';
    expect(style).toContain('--jx-elevation-effective: 8');
    expect(style).toContain('--jx-elevation-shadow: var(--jx-elevation-level4-shadow)');
    expect(style).toContain('--jx-elevation-surface: var(--jx-elevation-level4-surface)');
  });
});
