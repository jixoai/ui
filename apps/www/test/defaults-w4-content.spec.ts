/**
 * The W4 content-and-scene Defaults migration RUNTIME lock
 * (context-defaults-economy task 3.4, 2026-09-03) — the content and
 * scene families moved onto the family Defaults contracts. Behavior
 * is ZERO-change (the pre-migration specs chart-components.spec.ts /
 * inline-code.spec.ts / list-item*.spec.ts / language-switcher.spec.ts /
 * ghostty-term.spec.ts / batch*-components.spec.ts stay green
 * untouched); this suite pins the NEW resolution surface per
 * specs/component-authoring's Defaults contract:
 *   - the frozen-table paint slot: InlineCode tonal/outline (own
 *     tonal) resolves `explicit ?? ambient(zone) ?? own` — zone
 *     ambient wins over own, the explicit prop wins over the zone
 *     (the values guard retired with D3-A: the ambient domain is
 *     trusted; a zone variant outside a family union is the
 *     unsupported external surface — no runtime guard, no warn)
 *   - the literal slots (kbd-mode, class b): avatar size/md +
 *     variant/bevel, chart fill/96 — a zone does NOT move them
 *     (ambient capability pends a future table freeze / axis)
 *   - the no-opinion density slots: Statistic/InlineCode/chart
 *     glyphs/list rows resolve undefined → no stamp (fleet law); a
 *     provider's opinion stamps; the explicit prop beats the provider
 *   - the chart ENSEMBLE provider (r11 eager-capture form): the
 *     group tier reaches the glyphs; an explicit glyph tier wins;
 *     flipping the ensemble density re-derives the subtree — the
 *     derived_references_self guard
 *   - the list family: ItemGroup provides (r11 eager capture) — the
 *     frame, the ul, the rows AND the adapter rows (checkbox/toggle,
 *     the X2-11 restate shape) land the group tier; the auto-chrome
 *     law survives the migration (standalone surface, grouped none,
 *     explicit outline); inset/tone ride their literal slots
 *   - the ghostty family own 'default' (design-frozen): resolved in
 *     a real component window under an ambient provider the slot
 *     takes the provider's tier; the in-window unit face takes the
 *     own
 *   - the 惰性律's in-window unit face (unit-resolve-host,
 *     context-plugin-v2 D3-C): the density-bearing families resolve
 *     their own-defaults projections inside a rootless component
 *     window; the pure-literal families (avatar/theme-toggle/
 *     language-switcher/tour) read no context, so their assertions
 *     keep the plain unit form
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/defaults-w4-content-host.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import { AvatarDefaults } from '../src/lib/ui/avatar/avatar-defaults.svelte';
import { ChartDefaults } from '../src/lib/ui/chart/chart-defaults.svelte';
import { GhosttyTermDefaults } from '../src/lib/ui/ghostty-term/ghostty-term-defaults.svelte';
import { InlineCodeDefaults } from '../src/lib/ui/inline-code/inline-code-defaults.svelte';
import { LanguageSwitcherDefaults } from '../src/lib/ui/language-switcher/language-switcher-defaults.svelte';
import { ListItemDefaults } from '../src/lib/ui/list-item/list-item-defaults.svelte';
import { StatisticDefaults } from '../src/lib/ui/statistic/statistic-defaults.svelte';
import { ThemeToggleDefaults } from '../src/lib/ui/theme-toggle/theme-toggle-defaults.svelte';
import { TourDefaults } from '../src/lib/ui/tour/tour-defaults.svelte';

const byTestid = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!;

// =========================================================================
// 1 · bare — the frozen/literal owns, no-opinion density stays unstamped
// =========================================================================
describe('bare — no providers', () => {
  it('inline-code resolves its frozen own variant (tonal)', () => {
    const { container } = render(Host);
    const chip = byTestid(container, 'bare').querySelector('[data-jx-inline-code]')!;
    expect(chip.getAttribute('data-jx-inline-code')).toBe('tonal');
  });

  it("avatar resolves the literal owns (md box, bevel silhouette) and doesn't stamp density", () => {
    const { container } = render(Host);
    const img = byTestid(container, 'bare').querySelector('[data-jx-avatar]')!;
    expect(img.getAttribute('data-jx-avatar')).toBe('md');
    expect(img.getAttribute('data-jx-avatar-variant')).toBe('bevel');
    expect(img.getAttribute('data-density')).toBeNull();
  });

  it('chart-bar resolves the literal own variant (fill); the donut keeps its literal 96px box', () => {
    const { container } = render(Host);
    const bare = byTestid(container, 'bare');
    expect(bare.querySelector('[data-jx-chart-bar]')!.getAttribute('data-jx-chart-bar')).toBe('fill');
    const svg = bare.querySelector('[data-jx-chart-donut] svg, div svg')!;
    expect(svg.getAttribute('width')).toBe('96');
  });

  it('no-opinion density resolves undefined → statistic and the bare row stamp nothing (fleet law)', () => {
    const { container } = render(Host);
    const bare = byTestid(container, 'bare');
    expect(bare.querySelector('[data-jx-stat]')!.getAttribute('data-density')).toBeNull();
    expect(bare.querySelector('[data-slot="item"]')!.getAttribute('data-density')).toBeNull();
  });

  it('the standalone Item keeps the auto-chrome surface law', () => {
    const { container } = render(Host);
    const row = byTestid(container, 'bare').querySelector('[data-slot="item"]')!;
    expect(row.getAttribute('data-item-chrome')).toBe('surface');
    expect(row.getAttribute('data-variant')).toBe('auto');
  });

  it("language-switcher resolves its literal own structure ('pair')", () => {
    const { container } = render(Host);
    expect(byTestid(container, 'bare').querySelector('[data-jx-lang-seg]')).not.toBeNull();
  });
});

// =========================================================================
// 2 · the zone — paint ambient wins over own, explicit wins over ambient,
//     the literal slots do not move, density rides its own axis
// =========================================================================
describe('zone + density providers', () => {
  it("the zone's 'outline' moves the frozen-table family, never the literal slots", () => {
    const { container } = render(Host);
    const zone = byTestid(container, 'zone');
    expect(zone.querySelector('[data-jx-inline-code]')!.getAttribute('data-jx-inline-code')).toBe('outline');
    // avatar's silhouette is the literal family: own 'bevel' holds under a zone
    expect(zone.querySelector('[data-jx-avatar-variant]')!.getAttribute('data-jx-avatar-variant')).toBe('bevel');
  });

  it('the explicit props beat the zone and the density provider', () => {
    const { container } = render(Host);
    const zone = byTestid(container, 'zone');
    const chips = zone.querySelectorAll('[data-jx-inline-code]');
    expect(chips[1].getAttribute('data-jx-inline-code')).toBe('tonal');
    const stats = zone.querySelectorAll('[data-jx-stat]');
    expect(stats[0].getAttribute('data-density')).toBe('sm');
    expect(stats[1].getAttribute('data-density')).toBe('lg');
  });
});

// =========================================================================
// 3 · the chart ensemble — the r11 eager-capture provider form
// =========================================================================
describe('chart ensemble provider', () => {
  it("the ensemble's density tier reaches every glyph; an explicit glyph tier wins", () => {
    const { container } = render(Host);
    const ens = byTestid(container, 'ensemble');
    expect(ens.querySelector('[data-jx-chart]')!.getAttribute('data-density')).toBe('sm');
    const bars = ens.querySelectorAll('[data-jx-chart-bar]');
    expect(bars[0].getAttribute('data-density')).toBe('sm');
    expect(bars[1].getAttribute('data-density')).toBe('xs');
    expect(bars[1].getAttribute('data-jx-chart-bar')).toBe('tonal'); // the literal slot's explicit lane
    expect(ens.querySelector('[data-jx-chart-sparkline]')!.getAttribute('data-density')).toBe('sm');
  });

  it('flipping the ensemble density re-derives the subtree (derived_references_self guard)', async () => {
    const { container, rerender } = render(Host);
    await rerender({ ensembleDensity: 'default' });
    const ens = byTestid(container, 'ensemble');
    expect(ens.querySelector('[data-jx-chart]')!.getAttribute('data-density')).toBe('default');
    expect(ens.querySelector('[data-jx-chart-bar]')!.getAttribute('data-density')).toBe('default');
    expect(ens.querySelector('[data-jx-chart-sparkline]')!.getAttribute('data-density')).toBe('default');
  });
});

// =========================================================================
// 4 · the list family — ItemGroup provides, adapters restate, literals
//     ride their slots, the auto-chrome law survives
// =========================================================================
describe('list family', () => {
  it("the group's tier lands on the frame, the ul, the rows AND the adapter rows (restate)", () => {
    const { container } = render(Host);
    const list = byTestid(container, 'list');
    const groups = list.querySelectorAll('[data-slot="item-group"]');
    expect(groups[0].getAttribute('data-density')).toBe('sm');
    expect(list.querySelector('[data-slot="item-list"]')!.getAttribute('data-density')).toBe('sm');
    const rows = groups[0].querySelectorAll('[data-slot="item"]');
    expect(rows[0].getAttribute('data-density')).toBe('sm'); // ambient from the group
    expect(rows[1].getAttribute('data-density')).toBe('xs'); // explicit beats the group
    expect(rows[2].getAttribute('data-density')).toBe('sm'); // adapter row (checkbox restate)
    expect(rows[3].getAttribute('data-density')).toBe('sm'); // adapter row (toggle restate)
  });

  it('the auto-chrome law survives: grouped rows yield chrome to the group, explicit outline wins', () => {
    const { container } = render(Host);
    const groups = byTestid(container, 'list').querySelectorAll('[data-slot="item-group"]');
    const rows = groups[0].querySelectorAll('[data-slot="item"]');
    expect(rows[0].getAttribute('data-item-chrome')).toBe('none');
    expect(rows[2].getAttribute('data-item-chrome')).toBe('outline');
    expect(rows[0].getAttribute('data-variant')).toBe('auto');
  });

  it('inset and tone ride their literal slots', () => {
    const { container } = render(Host);
    const groups = byTestid(container, 'list').querySelectorAll('[data-slot="item-group"]');
    expect(groups[0].getAttribute('data-inset')).toBeNull(); // own false
    expect(groups[1].getAttribute('data-inset')).toBe('true'); // explicit
    const afters = groups[0].querySelectorAll('[data-slot="item-after"]');
    expect(afters[0].getAttribute('data-tone')).toBe('muted'); // own
    expect(afters[1].getAttribute('data-tone')).toBe('default'); // explicit
  });

  it('flipping the group density re-derives frame, rows and adapters (derived_references_self guard)', async () => {
    const { container, rerender } = render(Host);
    await rerender({ groupDensity: 'default' });
    const list = byTestid(container, 'list');
    expect(list.querySelector('[data-slot="item-group"]')!.getAttribute('data-density')).toBe('default');
    expect(list.querySelector('[data-slot="item"]')!.getAttribute('data-density')).toBe('default');
  });
});

// =========================================================================
// 5 · the ghostty family own — 'default' (design-frozen), ambient-aware
// =========================================================================
describe("ghostty-term's family own 'default'", () => {
  it('inside a provider window the slot takes the ambient tier (sm)', () => {
    const { container } = render(Host);
    expect(byTestid(container, 'ghostty').querySelector('[data-testid="ghostty-slot-probe"]')!.getAttribute('data-slot-density')).toBe('sm');
  });

  it('flipping the ambient provider re-derives the slot in the same frame', async () => {
    const { container, rerender } = render(Host);
    await rerender({ groupDensity: 'default' });
    expect(byTestid(container, 'ghostty').querySelector('[data-testid="ghostty-slot-probe"]')!.getAttribute('data-slot-density')).toBe('default');
  });

  it('the in-window unit face (unit-resolve-host, rootless) resolves the own', () => {
    const holder: { value?: unknown; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute: () => [GhosttyTermDefaults.resolve({}).density, GhosttyTermDefaults.resolve({ density: 'xs' }).density],
        onvalue: (value, error) => {
          holder.value = value;
          holder.error = error;
        },
      },
    });
    flushSync();
    expect(holder.error).toBeUndefined();
    expect(holder.value).toEqual(['default', 'xs']);
  });
});

// =========================================================================
// 6 · the 惰性律's in-window unit face — the density-bearing families
//     resolve their own-defaults projections inside a rootless window;
//     the pure-literal families keep the plain unit form
// =========================================================================
describe('in-window unit own projections (unit-resolve-host, 惰性律)', () => {
  /** the in-window resolve carrier: compute runs inside the host's
   *  $derived (no provider, no plugin root — ambient lanes silent) */
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

  // density-bearing families: the window-bound ambient lanes and the
  // plugin-scope read make the plain unit form a hard-contract throw
  it('InlineCodeDefaults and the density-slot families resolve their own defaults', () => {
    expect(resolveInWindow(() => InlineCodeDefaults.resolve({}))).toEqual({
      variant: 'tonal',
      density: undefined,
    });
    expect(resolveInWindow(() => ChartDefaults.resolve({}))).toEqual({
      variant: 'fill',
      density: undefined,
      size: 96,
    });
    expect(resolveInWindow(() => StatisticDefaults.resolve({}))).toEqual({ density: undefined });
    expect(resolveInWindow(() => ListItemDefaults.resolve({}))).toEqual({
      variant: 'auto',
      density: undefined,
      inset: false,
      tone: 'muted',
    });
  });

  // pure-literal families: no slot reads context — the plain unit
  // calls hold on the legal side too
  it('AvatarDefaults / ThemeToggleDefaults / LanguageSwitcherDefaults / TourDefaults (pure literals)', () => {
    expect(AvatarDefaults.resolve({})).toEqual({ size: 'md', variant: 'bevel' });
    expect(ThemeToggleDefaults.resolve({})).toEqual({ variant: 'compact' });
    expect(LanguageSwitcherDefaults.resolve({})).toEqual({ variant: 'pair' });
    expect(TourDefaults.resolve({})).toEqual({ variant: 'auto' });
  });
});
