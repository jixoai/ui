/**
 * The button-bar family lock (OpenSpec 2026-09-08-button-bar) — the
 * free-floating action lane:
 *   - the Defaults contract surface (paint slot own ghost over the
 *     four-value zone domain, density no-opinion — the button-group
 *     proxy-family precedent, declaration-first)
 *   - the lane's identity: members fall to ghost + flat with zero
 *     per-button props (data-jx-press-button="ghost" +
 *     data-jx-press-flat), the frozen outside contrast staying
 *     outline + convex
 *   - explicit-wins at every level (member variant/raised, lane
 *     variant/raised)
 *   - inherit-then-provide on BOTH axes (an opinion-less lane passes
 *     an enclosing ButtonVariantScope's variant and texture through)
 *   - a joined cluster as ONE member: inherits ghost (seam policy
 *     follows), root cluster shadow dark through the lane's flat
 *     texture; the cluster's own explicit variant still wins
 *   - the layout faces: single row/column utilities, justify
 *     placement, the density provide, role/label/rest passthrough
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/button-bar-host.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import { ButtonBarDefaults } from '../src/lib/ui/button-bar/button-bar-defaults.svelte';

// ---- query helpers --------------------------------------------------------

const byTestid = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!;
const variantOf = (el: Element) => el.getAttribute('data-jx-press-button');
const isFlat = (el: Element) => el.hasAttribute('data-jx-press-flat');
/** the button a wrapper testid holds (spans wrap the members —
 * PressButton passes no rest attrs; the defaults-buttons precedent) */
const wrappedVariantOf = (container: HTMLElement, id: string) =>
  variantOf(byTestid(container, id).querySelector('[data-jx-press-button]')!);
const wrappedIsFlat = (container: HTMLElement, id: string) =>
  isFlat(byTestid(container, id).querySelector('[data-jx-press-button]')!);
const wrappedDensityOf = (container: HTMLElement, id: string) =>
  byTestid(container, id)
    .querySelector('[data-jx-press-button]')!
    .getAttribute('data-density');

// =========================================================================
// 1 · the contract surface — auditable in one place
// =========================================================================
describe('the button-bar contract surface', () => {
  it('declares exactly { variant, density }, shallow-frozen', () => {
    expect(Object.isFrozen(ButtonBarDefaults.slots)).toBe(true);
    expect(Object.keys(ButtonBarDefaults.slots).sort()).toEqual(['density', 'variant']);
  });
});

// =========================================================================
// 2 · 惰性律 — the unit resolve carried inside a component window
//     (rootless: the ambient lane stays silent, own ghost resolves;
//     density stays no-opinion undefined — the fleet law)
// =========================================================================
describe('惰性律 — unit resolves inside the window', () => {
  const resolveInWindow = (compute: () => unknown): unknown => {
    const holder: { value?: unknown; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute,
        onvalue: (value, error) => {
          holder.value = value;
          holder.error = error;
        },
      },
    });
    flushSync();
    expect(holder.error).toBeUndefined();
    return holder.value;
  };

  it('own ghost over the four-value zone domain; density no-opinion', () => {
    expect(resolveInWindow(() => ButtonBarDefaults.resolve({}))).toEqual({
      variant: 'ghost',
      density: undefined,
    });
    expect(resolveInWindow(() => ButtonBarDefaults.resolve({ variant: 'fill' }).variant)).toBe(
      'fill',
    );
  });
});

// =========================================================================
// 3 · the lane's identity — ghost + flat by default, contrast intact
// =========================================================================
describe('the ghost + flat defaults', () => {
  it('members fall to ghost + flat with zero props; the outside contrast stays outline + convex', () => {
    const { container } = render(Host);
    expect(wrappedVariantOf(container, 'outside-bare')).toBe('outline');
    expect(wrappedIsFlat(container, 'outside-bare')).toBe(false);

    expect(wrappedVariantOf(container, 'member-bare')).toBe('ghost');
    expect(wrappedIsFlat(container, 'member-bare')).toBe(true);
  });

  it('explicit member props win over the lane', () => {
    const { container } = render(Host);
    expect(wrappedVariantOf(container, 'member-fill')).toBe('fill');
    expect(wrappedVariantOf(container, 'member-raised')).toBe('ghost');
    expect(wrappedIsFlat(container, 'member-raised')).toBe(false);
  });

  it('the lane itself can re-rung and re-texture', () => {
    const { container } = render(Host);
    expect(wrappedVariantOf(container, 'tonal-member')).toBe('tonal');
    expect(wrappedVariantOf(container, 'convex-member')).toBe('ghost');
    expect(wrappedIsFlat(container, 'convex-member')).toBe(false);
  });
});

// =========================================================================
// 4 · inherit-then-provide — an opinion-less lane passes the zone through
// =========================================================================
describe('inherit-then-provide on both axes', () => {
  it('an enclosing scope variant reaches members through the lane', () => {
    const { container } = render(Host);
    expect(wrappedVariantOf(container, 'shadowed-variant-member')).toBe('tonal');
  });

  it('an enclosing flat texture reaches members through the lane', () => {
    const { container } = render(Host);
    expect(wrappedIsFlat(container, 'shadowed-texture-member')).toBe(true);
  });
});

// =========================================================================
// 5 · a joined cluster as ONE member
// =========================================================================
describe('the nested joined cluster', () => {
  it('inherits ghost, its seams follow the ghost policy, its root shadow goes dark', () => {
    const { container } = render(Host);
    const cluster = byTestid(container, 'nested-cluster');
    expect(cluster.hasAttribute('data-jx-btngroup-flat')).toBe(true);
    expect(cluster.hasAttribute('data-jx-separator')).toBe(true);
    expect(wrappedVariantOf(container, 'cluster-member')).toBe('ghost');
    expect(wrappedVariantOf(container, 'cluster-member-2')).toBe('ghost');
    // the loose member beside it stays independent — no joined seam on the lane
    const lane = byTestid(container, 'bar-cluster');
    expect(lane.hasAttribute('data-jx-separator')).toBe(false);
  });

  it("the cluster's own explicit variant still wins", () => {
    const { container } = render(Host);
    expect(wrappedVariantOf(container, 'cluster-fill-member')).toBe('fill');
  });
});

// =========================================================================
// 6 · the layout faces — one row/column, placement, role, density
// =========================================================================
describe('the layout faces', () => {
  it('default: the single row (flex, gap, items-center, justify-end) + the valued hook', () => {
    const { container } = render(Host);
    const bar = byTestid(container, 'bar-identity');
    expect(bar.getAttribute('data-jx-btnbar')).toBe('horizontal');
    expect(bar.getAttribute('role')).toBe('group');
    expect(bar.getAttribute('aria-label')).toBe('identity');
    const cls = bar.getAttribute('class') ?? '';
    for (const utility of ['flex', 'gap-2.5', 'flex-row', 'items-center', 'justify-end']) {
      expect(cls, `class="${cls}"`).toContain(utility);
    }
  });

  it('vertical: one stretched column', () => {
    const { container } = render(Host);
    const bar = byTestid(container, 'bar-vertical');
    expect(bar.getAttribute('data-jx-btnbar')).toBe('vertical');
    const cls = bar.getAttribute('class') ?? '';
    for (const utility of ['flex-col', 'items-stretch']) {
      expect(cls, `class="${cls}"`).toContain(utility);
    }
  });

  it('justify between places members at both ends', () => {
    const { container } = render(Host);
    expect((byTestid(container, 'bar-between').getAttribute('class') ?? '')).toContain(
      'justify-between',
    );
  });

  it('density is provided to the subtree (members adopt the tier)', () => {
    const { container } = render(Host);
    expect(byTestid(container, 'bar-dense').getAttribute('data-density')).toBe('sm');
    expect(wrappedDensityOf(container, 'dense-member')).toBe('sm');
  });

  it('role override honored; an explicit rest aria-label wins over label', () => {
    const { container } = render(Host);
    const bar = byTestid(container, 'bar-role');
    expect(bar.getAttribute('role')).toBe('toolbar');
    expect(bar.getAttribute('aria-label')).toBe('real tools');
  });
});
