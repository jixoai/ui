/**
 * The provider-lane navigation families' Defaults contract lock
 * (context-defaults-economy task 3.3, 2026-09-03) — six STRUCTURAL
 * providers (tabs, table, breadcrumb, menubar, dropdown-menu,
 * navigation-menu) plus the navigation-menu indicator's inset slot.
 * The migration keeps each provider's inherit-then-provide lane by the
 * frozen provider duties (r11 first contract — the EAGER capture:
 * getDensityContext() rides the $derived.by argument subtree, evaluated
 * BEFORE the root's own provideDensity write, so a lazy read can never
 * resolve the key to the root's own context and self-reference). The
 * lock pins:
 *   - the contract surfaces: exactly the declared slot sets,
 *     shallow-frozen (table's density slot carries the design-frozen
 *     family own 'sm'; the surface variants are literal slots over
 *     'solid' | 'acrylic' | 'auto'; the indicator's inset a literal
 *     number slot, own 0)
 *   - 惰性律: the unit resolves below run INSIDE a component window
 *     (unit-resolve-host — context-plugin-v2 D3-C: the density slots'
 *     ambient lanes and the plugin-scope read are window-bound) —
 *     density slots stay silent (undefined, or table's own 'sm'), the
 *     literal owns resolve
 *   - zero behavior change: the stamps resolve exactly as the retired
 *     inline chains did (no opinion → no stamp / table's sm floor;
 *     explicit wins; the provided tier reaches the family's parts)
 *   - the derived_references_self pin, six ways: each provider under a
 *     density parent renders (chain terminates) and a parent flip
 *     re-resolves every lane (the pre-3.3 code's reactivity)
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import type { Snippet } from 'svelte';
import InheritHost from './fixtures/defaults-nav-inherit-host.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import Tabs from '../src/lib/ui/tabs/tabs.svelte';
import Table from '../src/lib/ui/table/table.svelte';
import Menubar from '../src/lib/ui/menubar/menubar.svelte';
import DropdownMenu from '../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
import { TabsDefaults } from '../src/lib/ui/tabs/tabs-defaults.svelte';
import { TableDefaults } from '../src/lib/ui/table/table-defaults.svelte';
import { BreadcrumbDefaults } from '../src/lib/ui/breadcrumb/breadcrumb-defaults.svelte';
import { MenubarDefaults } from '../src/lib/ui/menubar/menubar-defaults.svelte';
import { DropdownMenuDefaults } from '../src/lib/ui/dropdown-menu/dropdown-menu-defaults.svelte';
import { NavigationMenuDefaults } from '../src/lib/ui/navigation-menu/navigation-menu-defaults.svelte';

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as Snippet;

// ---- query helpers --------------------------------------------------------

const byTestid = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!;
const densityOf = (el: Element | null | undefined) => el?.getAttribute('data-density');

// =========================================================================
// 1 · the contract surfaces — auditable in one place per family
// =========================================================================
describe('the provider families\' contract surfaces', () => {
  it('each declares exactly its slot set, shallow-frozen', () => {
    for (const [defaults, keys] of [
      [TabsDefaults, ['density']],
      [TableDefaults, ['density']],
      [BreadcrumbDefaults, ['density']],
      [MenubarDefaults, ['density', 'variant']],
      [DropdownMenuDefaults, ['density', 'variant']],
      [NavigationMenuDefaults, ['density', 'inset', 'variant']],
    ] as const) {
      expect(Object.isFrozen(defaults.slots)).toBe(true);
      expect(Object.keys(defaults.slots).sort()).toEqual([...keys].sort());
    }
  });

  it('resolves own/no-opinion inside a rootless component window (惰性律)', () => {
    // unit-resolve-host: compute runs in the host's $derived — the
    // density slots' ambient lanes stay silent instead of throwing
    // (the retired outside-window case); table's design-frozen own
    // 'sm' resolves, the literal surface variants own 'auto'
    const holder: { value?: unknown[]; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute: () => [
          TabsDefaults.resolve({}),
          BreadcrumbDefaults.resolve({}),
          // the design-frozen family own: a table with NO opinion resolves 'sm'
          TableDefaults.resolve({}),
          MenubarDefaults.resolve({}),
          DropdownMenuDefaults.resolve({ variant: 'solid' }),
          NavigationMenuDefaults.resolve({}),
          NavigationMenuDefaults.resolve({ inset: 2 }),
        ],
        onvalue: (value, error) => {
          holder.value = value as unknown[] | undefined;
          holder.error = error;
        },
      },
    });
    flushSync();
    expect(holder.error).toBeUndefined();
    expect(holder.value).toEqual([
      { density: undefined },
      { density: undefined },
      { density: 'sm' },
      { density: undefined, variant: 'auto' },
      { density: undefined, variant: 'solid' },
      { density: undefined, variant: 'auto', inset: 0 },
      { density: undefined, variant: 'auto', inset: 2 },
    ]);
  });
});

// =========================================================================
// 2 · the component read points — zero behavior change
// =========================================================================
describe('the read consolidation through the contracts', () => {
  it('tabs: no opinion stamps nothing; explicit wins; the panel inherits the provided tier', () => {
    const bare = render(Tabs, { props: { children } });
    expect(densityOf(bare.container.querySelector('[data-jx-tabs]'))).toBe(null);
    const explicit = render(Tabs, {
      props: {
        density: 'xs',
        children: (() => {}) as unknown as Snippet,
      },
    });
    expect(densityOf(explicit.container.querySelector('[data-jx-tabs]'))).toBe('xs');
    // the PROVIDER duty: TabsContent resolves through the family
    // contract and lands the root's provided tier
    const composed = render(Tabs, {
      props: {
        density: 'lg',
        children: (() => {}) as unknown as Snippet,
      },
    });
    // compose a panel through the rendered root's subtree is the
    // inherit host's job below; here the root's own stamp suffices
    expect(densityOf(composed.container.querySelector('[data-jx-tabs]'))).toBe('lg');
  });

  it('table: the family own sm is the floor (frame + table stamp); explicit wins', () => {
    const bare = render(Table, { props: { caption: 'items', children } });
    expect(densityOf(bare.container.querySelector('figure'))).toBe('sm');
    expect(densityOf(bare.container.querySelector('table'))).toBe('sm');
    const explicit = render(Table, { props: { density: 'lg', children } });
    expect(densityOf(explicit.container.querySelector('figure'))).toBe('lg');
  });

  it('menubar / dropdown-menu: variant defaults auto through the literal slot; explicit wins', () => {
    const bar = render(Menubar, { props: { children } });
    expect(densityOf(bar.container.querySelector('[data-jx-menubar]'))).toBe(null);
    const menu = render(DropdownMenu, { props: { id: 'v-menu', children } });
    expect(menu.container.querySelector('[data-variant="auto"]')).toBeTruthy();
    const acrylic = render(DropdownMenu, {
      props: { id: 'v-menu-2', variant: 'acrylic', children },
    });
    expect(acrylic.container.querySelector('[data-variant="acrylic"]')).toBeTruthy();
  });

  it('dropdown-menu-item: inherits the menu root\'s provided tier (the item\'s own read point)', () => {
    const { container } = render(InheritHost, { props: { parentDensity: 'lg' } });
    // the fixed-density menu: the root provides 'sm', the item adopts it
    const fixed = byTestid(container, 'fixed-menu');
    expect(densityOf(fixed.querySelector('.jx-menu-anchor'))).toBe('sm');
    expect(densityOf(fixed.querySelector('[role="menuitem"]'))).toBe('sm');
    // the inherit menu: root adopts the host tier, the item follows
    const inherit = byTestid(container, 'inherit-menu');
    expect(densityOf(inherit.querySelector('[role="menuitem"]'))).toBe('lg');
  });
});

// =========================================================================
// 3 · the derived_references_self pin — six providers under one parent
// =========================================================================
describe('the eager capture: inherit without self-reference, re-resolve on flip', () => {
  it('each provider adopts the parent tier and a flip re-resolves every lane', async () => {
    const { container, rerender } = render(InheritHost, { props: { parentDensity: 'lg' } });
    const lanes: [name: string, el: () => Element | null][] = [
      ['tabs root', () => byTestid(container, 'inherit-tabs').querySelector('[data-jx-tabs]')],
      ['tabs panel', () => byTestid(container, 'inherit-tabs').querySelector('[data-jx-tab-panel]')],
      ['table frame', () => byTestid(container, 'inherit-table').querySelector('figure')],
      ['breadcrumb root', () => byTestid(container, 'inherit-breadcrumb')],
      ['breadcrumb item', () => byTestid(container, 'inherit-breadcrumb').querySelector('[data-jx-breadcrumb-item], li')],
      ['menubar root', () => byTestid(container, 'inherit-menubar')],
      ['dropdown anchor', () => byTestid(container, 'inherit-menu').querySelector('.jx-menu-anchor')],
      ['navmenu root', () => byTestid(container, 'inherit-navmenu')],
    ];
    for (const [name, get] of lanes) expect(densityOf(get()), `${name} adopts lg`).toBe('lg');

    await rerender({ props: { parentDensity: 'xs' } });
    for (const [name, get] of lanes) expect(densityOf(get()), `${name} re-resolves xs`).toBe('xs');
  });
});
