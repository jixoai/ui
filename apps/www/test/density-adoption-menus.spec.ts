import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import DropdownMenu from '../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
import Menubar from '../src/lib/ui/menubar/menubar.svelte';
import NavigationMenu from '../src/lib/ui/navigation-menu/navigation-menu.svelte';
import Command from '../src/lib/ui/command/command.svelte';
import Popconfirm from '../src/lib/ui/popconfirm/popconfirm.svelte';
import Breadcrumb from '../src/lib/ui/breadcrumb/breadcrumb.svelte';
import { resolveDensity } from '../src/lib/density.svelte';

const empty = (() => {}) as never;

describe('density adoption: menu roots', () => {
  it('roots stamp an opinion; NavigationMenu without one rides ambient (chrome-density-tier law)', () => {
    const defaults = [
      render(DropdownMenu, { props: { id: 'default-menu', children: empty } }),
      render(Menubar, { props: { children: empty } }),
      render(NavigationMenu, { props: { children: empty } }),
      render(Command, { props: { children: empty } }),
      render(Popconfirm, { props: { title: 'Confirm', children: empty } }),
      render(Breadcrumb, { props: { children: empty } }),
    ];
    // chrome-density-tier law (2026-08-26): NavigationMenu with NO
    // density opinion stamps NOTHING — its subtree rides the ambient css
    // scope (root default density, or a chrome band like the bezel's
    // data-jx-chrome); the other roots still stamp their resolved default
    expect(defaults.map(({ container }) => container.querySelector('[data-density]')?.getAttribute('data-density')))
      .toEqual(['default', 'default', undefined, 'default', 'default', 'default']);

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
    expect(resolveDensity(undefined, undefined)).toBe('default');
  });
});
