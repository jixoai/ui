import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import DropdownMenu from '../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
import Menubar from '../src/lib/ui/menubar/menubar.svelte';
import NavigationMenu from '../src/lib/ui/navigation-menu/navigation-menu.svelte';
import Command from '../src/lib/ui/command/command.svelte';
import Popconfirm from '../src/lib/ui/popconfirm/popconfirm.svelte';
import Breadcrumb from '../src/lib/ui/breadcrumb/breadcrumb.svelte';
import NavOpinionHost from './fixtures/nav-density-opinion-host.svelte';
import { resolveDensity } from '../src/lib/density.svelte';

const empty = (() => {}) as never;

describe('density adoption: menu roots', () => {
  it('roots stamp an opinion; no opinion rides the ambient css scope (fleet law)', () => {
    const defaults = [
      render(DropdownMenu, { props: { id: 'default-menu', children: empty } }),
      render(Menubar, { props: { children: empty } }),
      render(NavigationMenu, { props: { children: empty } }),
      render(Command, { props: { children: empty } }),
      render(Popconfirm, { props: { title: 'Confirm', children: empty } }),
      render(Breadcrumb, { props: { children: empty } }),
    ];
    // fleet law (2026-08-28, generalizing chrome-density-tier
    // 2026-08-26): a root with NO density opinion stamps NOTHING —
    // its subtree rides the ambient css scope (root default density,
    // or a chrome band like the bezel's data-jx-chrome); a
    // manufactured 'default' stamp would re-scope the element and
    // cut ambient inheritance off
    expect(defaults.map(({ container }) => container.querySelector('[data-density]')?.getAttribute('data-density')))
      .toEqual([undefined, undefined, undefined, undefined, undefined, undefined]);

    const explicit = render(DropdownMenu, { props: { id: 'large-menu', density: 'lg', children: empty } });
    expect(explicit.container.querySelector('[data-density="lg"]')).toBeTruthy();
    // an opinionated NavigationMenu stamps it (root + carried by its
    // triggers/panels through the bar context)
    const explicitNav = render(NavigationMenu, { props: { density: 'sm', children: empty } });
    expect(explicitNav.container.querySelector('[data-density="sm"]')).toBeTruthy();
  });

  it('keeps policy prop narrow: no legacy size aliases', () => {
    const source = [DropdownMenu, Menubar, NavigationMenu, Command, Popconfirm, Breadcrumb]
      .map((component) => String(component))
      .join('');
    expect(source).not.toMatch(/controlSize|data-size|jx-toggle-[wh]|jx-range-(sm|lg)/);
  });

  it('resolves all four scopes without shadowing an inherited parent', () => {
    const inherited = { density: 'lg' as const };
    expect((['xs', 'sm', 'default', 'lg'] as const).map((density) => resolveDensity(density, inherited)))
      .toEqual(['xs', 'sm', 'default', 'lg']);
    expect(resolveDensity(undefined, inherited)).toBe('lg');
    // no opinion anywhere → undefined (no stamp, ambient css scope)
    expect(resolveDensity(undefined, undefined)).toBeUndefined();
  });
});

describe('density adoption: the honest-opinion provider (chrome-density-tier r3)', () => {
  it('the context is reactive in BOTH directions — established and withdrawn opinions reach the nested consumer', async () => {
    const { container, rerender } = render(NavOpinionHost, { props: {} });
    const stamps = () =>
      [...container.querySelectorAll('nav[data-jx-navmenu]')].map((n) => n.getAttribute('data-density'));
    // no opinion: neither the host bar nor the nested consumer stamps
    expect(stamps()).toEqual([null, null]);
    // established: BOTH stamp — the nested bar resolves the inherited opinion
    await rerender({ props: { density: 'sm' } });
    expect(stamps()).toEqual(['sm', 'sm']);
    // withdrawn: BOTH un-stamp — a stale provider must not survive
    await rerender({ props: { density: undefined } });
    expect(stamps()).toEqual([null, null]);
  });
});
