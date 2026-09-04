/**
 * The clean-consumer navigation families' Defaults contract lock
 * (context-defaults-economy task 3.3, 2026-09-03) — four families with
 * NO provider lane (pagination, steps, section-card, timeline): the
 * migration is the pure read consolidation, so the lock pins
 *   - the contract surfaces: exactly the declared slot sets,
 *     shallow-frozen (density no-opinion for the three roots; tone and
 *     the dot variant as literal slots with declared owns)
 *   - 惰性律: the unit resolves below run INSIDE a component window
 *     (unit-resolve-host — context-plugin-v2 D3-C: the density slots'
 *     ambient lanes and the plugin-scope read are window-bound) —
 *     density slots stay silent undefined (fleet law), the literal
 *     owns resolve (SectionCard's tone slot reads no context, so its
 *     assertion keeps the plain unit form)
 *   - zero behavior change: the stamps resolve exactly as the retired
 *     inline chains did (no opinion → no stamp, explicit wins, the dot
 *     defaults 'square', the section tone drives the title register)
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import type { Snippet } from 'svelte';
import Pagination from '../src/lib/ui/pagination/pagination.svelte';
import Steps from '../src/lib/ui/steps/steps.svelte';
import SectionCard from '../src/lib/ui/section-card/section-card.svelte';
import Timeline from '../src/lib/ui/timeline/timeline.svelte';
import TimelineDot from '../src/lib/ui/timeline/timeline-dot.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import { PaginationDefaults } from '../src/lib/ui/pagination/pagination-defaults.svelte';
import { StepsDefaults } from '../src/lib/ui/steps/steps-defaults.svelte';
import { SectionCardDefaults } from '../src/lib/ui/section-card/section-card-defaults.svelte';
import { TimelineDefaults } from '../src/lib/ui/timeline/timeline-defaults.svelte';

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as Snippet;

// =========================================================================
// 1 · the contract surfaces — auditable in one place per family
// =========================================================================
describe('the clean-consumer families\' contract surfaces', () => {
  it('each declares exactly its slot set, shallow-frozen', () => {
    for (const [defaults, keys] of [
      [PaginationDefaults, ['density']],
      [StepsDefaults, ['density']],
      [SectionCardDefaults, ['tone']],
      [TimelineDefaults, ['density', 'variant']],
    ] as const) {
      expect(Object.isFrozen(defaults.slots)).toBe(true);
      expect(Object.keys(defaults.slots).sort()).toEqual([...keys].sort());
    }
  });

  it('resolves own-only / no-opinion inside a rootless component window (惰性律)', () => {
    // unit-resolve-host: compute runs in the host's $derived — the
    // three density-slot families' ambient lanes stay silent instead
    // of throwing (the retired outside-window case)
    const holder: { value?: unknown[]; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute: () => [
          PaginationDefaults.resolve({}),
          StepsDefaults.resolve({ density: 'xs' }),
          TimelineDefaults.resolve({}),
          TimelineDefaults.resolve({ variant: 'ring' }),
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
      { density: 'xs' },
      { density: undefined, variant: 'square' },
      { density: undefined, variant: 'ring' },
    ]);
    // SectionCard's tone slot reads no context — the plain unit form
    // holds on the legal side too
    expect(SectionCardDefaults.resolve({})).toEqual({ tone: 'default' });
  });
});

// =========================================================================
// 2 · the component read points — zero behavior change
// =========================================================================
describe('the read consolidation through the contracts', () => {
  it('pagination: no opinion stamps nothing; explicit wins', () => {
    const bare = render(Pagination, { props: { children } });
    expect(bare.container.querySelector('[data-jx-pagination]')!.hasAttribute('data-density')).toBe(false);
    const explicit = render(Pagination, { props: { density: 'sm', children } });
    expect(explicit.container.querySelector('[data-jx-pagination]')!.getAttribute('data-density')).toBe('sm');
  });

  it('steps: no opinion stamps nothing; explicit wins', () => {
    const bare = render(Steps, { props: { children } });
    expect(bare.container.querySelector('[data-jx-steps]')!.hasAttribute('data-density')).toBe(false);
    const explicit = render(Steps, { props: { density: 'lg', children } });
    expect(explicit.container.querySelector('[data-jx-steps]')!.getAttribute('data-density')).toBe('lg');
  });

  it('timeline: no opinion stamps nothing; the dot defaults square, explicit ring wins', () => {
    const bare = render(Timeline, { props: { children } });
    expect(bare.container.querySelector('ol')!.hasAttribute('data-density')).toBe(false);
    const dot = render(TimelineDot);
    expect(dot.container.querySelector('[data-jx-tl-dot]')!.getAttribute('data-variant')).toBe('square');
    const ring = render(TimelineDot, { props: { variant: 'ring' } });
    expect(ring.container.querySelector('[data-jx-tl-dot]')!.getAttribute('data-variant')).toBe('ring');
  });

  it('section-card: tone literal slot drives the title register (own default, hero explicit)', () => {
    const everyday = render(SectionCard, { props: { title: 't', children } });
    const everydayTitle = everyday.container.querySelector('h2')!;
    expect(everydayTitle.className).not.toContain('text-[clamp');
    const hero = render(SectionCard, { props: { title: 't', tone: 'hero', children } });
    expect(hero.container.querySelector('h2')!.className).toContain('text-[clamp');
  });
});
