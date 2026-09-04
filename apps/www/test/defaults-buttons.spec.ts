/**
 * The button families' Defaults contract lock
 * (context-defaults-economy task 2.1, 2026-09-03) — the pilot's
 * paint-axis trio, per design.md 迁移策略 and the spec delta's
 * Defaults requirements:
 *   - the contract surfaces: press-button / icon-button / button-group
 *     each declare exactly { variant, density }, shallow-frozen —
 *     icon-button's is the X2-11 RESTATE (press-button's slots
 *     restated, the composition's ambient face visible at the
 *     family), button-group's is declaration-first (the structural
 *     provider keeps its legacy inherit lane by the frozen provider
 *     duties; density flows through the contract today)
 *   - 惰性律: the unit resolves below run INSIDE a component window
 *     (unit-resolve-host — context-plugin-v2 D3-C: the ambient lanes
 *     and the plugin-scope read are window-bound): the paint slot's
 *     ambient read stays silent (own resolves), the density slot
 *     stays no-opinion undefined (fleet law)
 *   - zero behavior change, the WHOLE point of the read consolidation:
 *     every lane the pre-2.1 inline chains drove (own rung, zone
 *     adoption, explicit-wins, the restate pass-down, the separator
 *     policy on the reshaped effectiveVariant, density
 *     provide/explicit/no-opinion, the divider's layout half) resolves
 *     identically through the Defaults
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/defaults-buttons-host.svelte';
import InheritHost from './fixtures/defaults-buttons-inherit-host.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import { PressButtonDefaults } from '../src/lib/ui/press-button/press-button-defaults.svelte';
import { IconButtonDefaults } from '../src/lib/ui/icon-button/icon-button-defaults.svelte';
import { ButtonGroupDefaults } from '../src/lib/ui/button-group/button-group-defaults.svelte';

// ---- query helpers --------------------------------------------------------

const byTestid = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!;
const variantOf = (el: Element) => el.getAttribute('data-jx-press-button');
/** the button a wrapper testid holds (spans wrap the free-floating
 *  lanes; groups query their children directly) */
const wrappedVariantOf = (container: HTMLElement, id: string) =>
  variantOf(byTestid(container, id).querySelector('[data-jx-press-button]')!);

// =========================================================================
// 1 · the contract surfaces — auditable in one place per family
// =========================================================================
describe('the button families\' contract surfaces', () => {
  it('each declares exactly { variant, density }, shallow-frozen', () => {
    for (const Defaults of [PressButtonDefaults, IconButtonDefaults, ButtonGroupDefaults]) {
      expect(Object.isFrozen(Defaults.slots)).toBe(true);
      expect(Object.keys(Defaults.slots).sort()).toEqual(['density', 'variant']);
    }
  });
});

// =========================================================================
// 2 · 惰性律 — the unit resolves carried inside a component window
// =========================================================================
describe('惰性律 — unit resolves inside the window (unit-resolve-host)', () => {
  /** the in-window resolve carrier: compute runs inside the host's
   *  $derived (rootless — ambient lanes silent, scope read identity) */
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

  it('PressButtonDefaults: the silent ambient keeps the frozen own; density stays no-opinion', () => {
    expect(resolveInWindow(() => PressButtonDefaults.resolve({}))).toEqual({
      variant: 'outline',
      density: undefined,
    });
    expect(resolveInWindow(() => PressButtonDefaults.resolve({ variant: 'link' }).variant)).toBe(
      'link',
    );
  });

  it('IconButtonDefaults (the restate): same ladder, same own, same posture', () => {
    expect(resolveInWindow(() => IconButtonDefaults.resolve({}))).toEqual({
      variant: 'outline',
      density: undefined,
    });
    expect(resolveInWindow(() => IconButtonDefaults.resolve({ variant: 'ghost', density: 'sm' }))).toEqual({
      variant: 'ghost',
      density: 'sm',
    });
  });

  it('ButtonGroupDefaults: the zone-domain own; density no-opinion', () => {
    expect(resolveInWindow(() => ButtonGroupDefaults.resolve({}))).toEqual({
      variant: 'outline',
      density: undefined,
    });
  });
});

// =========================================================================
// 3 · press-button — the read consolidation changes nothing
// =========================================================================
describe('press-button through PressButtonDefaults', () => {
  it('bare resolves the frozen own rung; explicit rungs ride verbatim (link included)', () => {
    const { container } = render(Host);
    expect(wrappedVariantOf(container, 'pb-bare')).toBe('outline');
    expect(wrappedVariantOf(container, 'pb-explicit')).toBe('fill');
    expect(wrappedVariantOf(container, 'pb-link')).toBe('link');
  });

  it('zone adoption: a ghost group\'s bare child adopts ghost; explicit still wins', () => {
    const { container } = render(Host);
    const group = byTestid(container, 'pb-ghost-group');
    const buttons = [...group.querySelectorAll('[data-jx-press-button]')];
    expect(buttons.map(variantOf)).toEqual(['ghost', 'fill']);
  });

  it('scope adoption: the zone scope styles a free-floating button the same way', () => {
    const { container } = render(Host);
    expect(wrappedVariantOf(container, 'pb-scope')).toBe('tonal');
  });
});

// =========================================================================
// 4 · icon-button — the restate lane (X2-11)
// =========================================================================
describe('icon-button through IconButtonDefaults (the restate)', () => {
  it('a bare icon-button keeps the restated own; a tonal group\'s child adopts tonal; explicit wins', () => {
    const { container } = render(Host);
    expect(wrappedVariantOf(container, 'ib-bare')).toBe('outline');
    const group = byTestid(container, 'ib-tonal-group');
    const buttons = [...group.querySelectorAll('[data-jx-press-button]')];
    expect(buttons.map(variantOf)).toEqual(['tonal', 'fill']);
  });
});

// =========================================================================
// 5 · button-group — the provider duties ride the reshaped reads
// =========================================================================
describe('button-group — the provider duties intact', () => {
  it('the separator policy keys the effective variant: ghost seams, plain none', () => {
    const { container } = render(Host);
    expect(byTestid(container, 'plain-group').hasAttribute('data-jx-separator')).toBe(false);
    expect(byTestid(container, 'pb-ghost-group').hasAttribute('data-jx-separator')).toBe(true);
  });

  it('an INHERITED ghost counts (r14-10): a scope-wrapped bare group seams; an explicit shadow does not', () => {
    const { container } = render(Host);
    expect(byTestid(container, 'scope-ghost-group').hasAttribute('data-jx-separator')).toBe(true);
    expect(byTestid(container, 'scope-tonal-group').hasAttribute('data-jx-separator')).toBe(false);
  });

  it('the divider\'s layout half (orientation) survives the confined read', () => {
    const { container } = render(Host);
    // a vertical group's divider is a HORIZONTAL hairline (the line,
    // not the flow); the divider keeps role=separator
    const divider = byTestid(container, 'v-ghost-group').querySelector('[data-jx-btngroup-divider]')!;
    expect(divider.getAttribute('aria-orientation')).toBe('horizontal');
    expect(divider.getAttribute('role')).toBe('separator');
  });
});

// =========================================================================
// 6 · density — provide / explicit / no-opinion through the slots
// =========================================================================
describe('density through the family slots', () => {
  it('a dense group\'s child adopts the tier; an explicit child beats the provider', () => {
    const { container } = render(Host);
    const buttons = [...byTestid(container, 'dense-group').querySelectorAll('[data-jx-press-button]')];
    expect(buttons.map((b) => b.getAttribute('data-density'))).toEqual(['sm', 'lg']);
  });

  it('no opinion stamps nothing (fleet law: the ambient css scope channel flows)', () => {
    const { container } = render(Host);
    expect(byTestid(container, 'pb-bare').querySelector('button')?.hasAttribute('data-density')).toBe(false);
  });

  it('an opinion-less group under a density parent inherits WITHOUT self-reference, and a parent flip re-resolves', async () => {
    // the derived_references_self pin: the group's own provideDensity
    // write must never shadow its eager capture — rendering alone
    // proves the chain terminates, and the rerender proves the
    // re-resolution path (the pre-2.1 code's reactivity) survives
    const { container, rerender } = render(InheritHost, { props: { parentDensity: 'lg' } });
    const group = byTestid(container, 'inherit-group');
    expect(group.getAttribute('data-density')).toBe('lg');
    expect(group.querySelector('[data-jx-press-button]')?.getAttribute('data-density')).toBe('lg');

    await rerender({ props: { parentDensity: 'xs' } });
    expect(group.getAttribute('data-density')).toBe('xs');
    expect(group.querySelector('[data-jx-press-button]')?.getAttribute('data-density')).toBe('xs');
  });
});
