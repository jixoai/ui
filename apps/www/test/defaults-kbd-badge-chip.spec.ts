/**
 * The kbd/badge/chip Defaults migration RUNTIME lock
 * (context-defaults-economy task 2.3, 2026-09-03) — the pilot
 * batch's density-axis consumers moved onto the family Defaults
 * contracts. Behavior is ZERO-change (the pre-migration specs
 * kbd.spec.ts / chip.spec.ts stay green untouched); this suite pins
 * the NEW resolution surface per specs/component-authoring's
 * Defaults contract:
 *   - the frozen-table paint slots: Badge fill/tonal/outline (own
 *     tonal) and Chip all-four (own tonal) resolve
 *     `explicit ?? ambient(zone) ?? own` — zone ambient wins over
 *     own, the explicit prop wins over the zone
 *   - kbd's variant is the LITERAL family (own tonal, never reads
 *     context): a zone does NOT move it — kbd is absent from the
 *     frozen availability table, so ambient paint pends a future
 *     table freeze
 *   - the values guard retired with D3-A (the ambient domain is
 *     trusted; ZonePaintVariant narrows at the provider and, since
 *     the single-key law, no second write path exists at all)
 *   - the no-opinion density slots: bare resolves undefined → no
 *     stamp (fleet law); a provider's opinion stamps; the explicit
 *     prop beats the provider
 *   - the literal shape slots: own 'square' resolves, the explicit
 *     pill passes through
 *   - reactivity: a parent zone flip re-derives both paint families
 *     in the SAME frame
 *   - the 惰性律's in-window unit face (unit-resolve-host,
 *     context-plugin-v2 D3-C): every family's Defaults resolves its
 *     own-defaults projection inside a rootless component window
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/defaults-kbd-badge-chip-host.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import { BadgeDefaults } from '../src/lib/ui/badge/badge-defaults.svelte';
import { ChipDefaults } from '../src/lib/ui/chip/chip-defaults.svelte';
import { KbdDefaults } from '../src/lib/ui/kbd/kbd-defaults.svelte';

const byTestid = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!;

// =========================================================================
// 1 · bare — the frozen owns, no-opinion density stays unstamped
// =========================================================================
describe('bare — no providers', () => {
  it('every family resolves its frozen own variant (tonal)', () => {
    const { container } = render(Host);
    const bare = byTestid(container, 'bare');
    expect(bare.querySelector('kbd')!.getAttribute('data-jx-kbd')).toBe('tonal');
    expect(bare.querySelector('[data-jx-badge]')!.getAttribute('data-jx-badge')).toBe('tonal');
    expect(bare.querySelector('[data-jx-chip]')!.getAttribute('data-jx-chip')).toBe('tonal');
  });

  it('no-opinion density resolves undefined → nothing stamps (fleet law)', () => {
    const { container } = render(Host);
    const bare = byTestid(container, 'bare');
    for (const el of [
      bare.querySelector('kbd')!,
      ...bare.querySelectorAll('[data-jx-badge]'),
      ...bare.querySelectorAll('[data-jx-chip]'),
    ]) {
      expect(el.getAttribute('data-density')).toBeNull();
    }
  });

  it("the literal shape slots: own 'square' renders the site radius, explicit pill rounds fully", () => {
    const { container } = render(Host);
    const bare = byTestid(container, 'bare');
    expect(bare.querySelector('[data-jx-badge]')!.className).toContain('rounded-(--radius)');
    expect(bare.querySelector('[data-jx-badge="tonal"] + [data-jx-badge]')!.className).toContain(
      'rounded-full',
    );
    expect(bare.querySelector('[data-jx-chip]')!.className).toContain('rounded-(--radius)');
    expect(bare.querySelector('button[data-jx-chip] ~ button[data-jx-chip]')!.className).toContain(
      'rounded-full',
    );
  });
});

// =========================================================================
// 2 · the zone — paint ambient wins over own, explicit wins over ambient,
//     kbd's literal slot does not move, density rides its own axis
// =========================================================================
describe('zone + density providers', () => {
  it("the zone's 'outline' moves the paint-slot families, never kbd's literal slot", () => {
    const { container } = render(Host);
    const zone = byTestid(container, 'zone');
    expect(zone.querySelector('[data-jx-badge]')!.getAttribute('data-jx-badge')).toBe('outline');
    expect(zone.querySelector('[data-jx-chip]')!.getAttribute('data-jx-chip')).toBe('outline');
    // kbd's variant is the literal family: own 'tonal' holds under a zone
    expect(zone.querySelector('kbd')!.getAttribute('data-jx-kbd')).toBe('tonal');
  });

  it('the explicit props beat the zone and the density provider', () => {
    const { container } = render(Host);
    const zone = byTestid(container, 'zone');
    const badges = zone.querySelectorAll('[data-jx-badge]');
    expect(badges[1].getAttribute('data-jx-badge')).toBe('fill');
    const chips = zone.querySelectorAll('[data-jx-chip]');
    expect(chips[1].getAttribute('data-density')).toBe('lg');
  });

  it("the density provider's opinion stamps every family", () => {
    const { container } = render(Host);
    const zone = byTestid(container, 'zone');
    expect(zone.querySelector('kbd')!.getAttribute('data-density')).toBe('sm');
    expect(zone.querySelector('[data-jx-badge]')!.getAttribute('data-density')).toBe('sm');
    expect(zone.querySelector('[data-jx-chip]')!.getAttribute('data-density')).toBe('sm');
  });
});

// =========================================================================
// 4 · reactivity — one zone flip, both paint families, the same frame
// =========================================================================
describe('zone reactivity', () => {
  it('a parent zone flip re-derives badge and chip in the SAME frame', async () => {
    const { container, rerender } = render(Host, { props: { zone: 'outline' } });
    const zone = byTestid(container, 'zone');
    expect(zone.querySelector('[data-jx-badge]')!.getAttribute('data-jx-badge')).toBe('outline');

    await rerender({ zone: 'fill' });
    // ONE DOM read after the flush: both families already moved — no
    // intermediate frame where one moved and the other lagged
    expect(zone.querySelector('[data-jx-badge]')!.getAttribute('data-jx-badge')).toBe('fill');
    expect(zone.querySelector('[data-jx-chip]')!.getAttribute('data-jx-chip')).toBe('fill');
  });
});

// =========================================================================
// 5 · 惰性律 — the in-window unit face (unit-resolve-host, rootless)
// =========================================================================
describe('in-window unit resolution — the own-defaults projection', () => {
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

  it('BadgeDefaults: own tonal/square, no density opinion (ambient silent, no throw)', () => {
    expect(resolveInWindow(() => BadgeDefaults.resolve({}))).toEqual({
      variant: 'tonal',
      shape: 'square',
      density: undefined,
    });
    expect(resolveInWindow(() => BadgeDefaults.resolve({ variant: 'fill' }))).toEqual({
      variant: 'fill',
      shape: 'square',
      density: undefined,
    });
  });

  it('ChipDefaults: own tonal/square, no density opinion', () => {
    expect(resolveInWindow(() => ChipDefaults.resolve({}))).toEqual({
      variant: 'tonal',
      shape: 'square',
      density: undefined,
    });
  });

  it('KbdDefaults: own tonal (the literal family), no density opinion', () => {
    expect(resolveInWindow(() => KbdDefaults.resolve({}))).toEqual({
      variant: 'tonal',
      density: undefined,
    });
    // the literal slot never reads context: an explicit value passes through
    expect(resolveInWindow(() => KbdDefaults.resolve({ variant: 'outline' }))).toEqual({
      variant: 'outline',
      density: undefined,
    });
  });
});
