/**
 * display-currency — batch 4.1 cross gate (design §5 / tasks 4.1): the
 * 「编号=显示货币」law driven by REAL keyed {#each} reorders
 * (items.reverse()) over REAL components — Figure lane and Section
 * lane both — against the weak-fixture ban (a static label swap hides
 * behind unmount/remount; the keyed array keeps instance identities
 * and only moves DOM).
 *
 * What each lane proves, per the design's gate list:
 *   - the numbers re-derive from the NEW document order (attr + the
 *     caption/heading text node, within the same settle);
 *   - the explicit ids NEVER move;
 *   - every Reference display value follows the new number (the
 *     reference-follows law — registration thunks are live, never
 *     snapshots; also asserted straight through the registry);
 *   - instance preservation counter-evidence: each keyed row carries
 *     per-instance `beats` state — two pulses before the reverse stay
 *     two after (an unmount/remount would reset to one), the same
 *     DOM node objects survive the move, and the instances keep
 *     reacting to later pulses.
 *
 * Section-lane values (2.1/2.2/2.3 → swapped) are the sibling-swap
 * form of the law; the 3 → 3.2.1 path and the multi-root/nested
 * value tables already have their own fixtures in
 * section-numbering.spec.ts (batch 1) — no duplication here.
 */
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import ReorderHost from './fixtures/reorder-host.svelte';
import type { TargetRegistry } from '../src/lib/ui/figure/numbering.svelte';

/** observer bumps land in a microtask + rAF; two ticks flush the rederives */
const settle = async () => {
  await tick();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await tick();
};

// the reorder host's ProviderProbe exposes the live route registry here
const g = globalThis as Record<string, unknown>;
const targets = () => g.__probeTargets as TargetRegistry;

const figOf = (container: HTMLElement, id: string) =>
  container.querySelector(`figure#${id}`) as HTMLElement;

describe('4.1 — the display-currency law, figure lane (keyed items.reverse())', () => {
  it('renumbers from the new DOM order; ids stay; the same nodes and instances survive; references follow', async () => {
    const { container, component } = render(ReorderHost);
    await settle();

    // the lane root is the first top-level domain: figures 1.1–1.3
    expect(container.querySelector('#sec-fig-lane')!.getAttribute('data-number')).toBe('1');
    expect(figOf(container, 'fig-alpha').getAttribute('data-number')).toBe('1.1');
    expect(figOf(container, 'fig-beta').getAttribute('data-number')).toBe('1.2');
    expect(figOf(container, 'fig-gamma').getAttribute('data-number')).toBe('1.3');
    expect(figOf(container, 'fig-alpha').querySelector('figcaption')!.textContent).toBe('Figure 1.1 Alpha');
    // the reference baseline before the move
    const refs0 = container.querySelector('[data-refs="figures"]')!;
    expect(refs0.querySelector('a[data-ref-to="fig-alpha"]')!.textContent).toBe('Fig (1.1)');
    expect(refs0.querySelector('a[data-ref-to="fig-beta"]')!.textContent).toBe('Fig (1.2)');
    expect(refs0.querySelector('a[data-ref-to="fig-gamma"]')!.textContent).toBe('Fig (1.3)');

    // capture identities + prime the per-instance counters (two pulses)
    const alpha = figOf(container, 'fig-alpha');
    const rowA = container.querySelector('[data-row="f-a"]')!;
    component.tap();
    await tick();
    component.tap();
    await tick();
    expect(rowA.getAttribute('data-beats')).toBe('2');

    component.reverse(); // items.reverse() — keyed identities kept, DOM only moves
    await settle();

    // renumbered per id from the new positions…
    expect(figOf(container, 'fig-alpha').getAttribute('data-number')).toBe('1.3');
    expect(figOf(container, 'fig-beta').getAttribute('data-number')).toBe('1.2');
    expect(figOf(container, 'fig-gamma').getAttribute('data-number')).toBe('1.1');
    // …the id attribute never moved, and the display text followed
    expect(figOf(container, 'fig-alpha').id).toBe('fig-alpha');
    expect(figOf(container, 'fig-alpha').querySelector('figcaption')!.textContent).toBe('Figure 1.3 Alpha');
    expect(figOf(container, 'fig-alpha').querySelector('[data-jx-number]')!.textContent).toBe('1.3');

    // the SAME DOM node objects — moved, not recreated
    expect(container.querySelector('#fig-alpha')).toBe(alpha);
    expect(container.querySelector('[data-row="f-a"]')).toBe(rowA);
    // the counter never reset — the same component instances (the
    // remount counter-evidence: a destroy-and-recreate would read 1)
    expect(rowA.getAttribute('data-beats')).toBe('2');

    // every Reference display value follows the new number (same settle)
    const refs = container.querySelector('[data-refs="figures"]')!;
    expect(refs.querySelector('a[data-ref-to="fig-alpha"]')!.textContent).toBe('Fig (1.3)');
    expect(refs.querySelector('a[data-ref-to="fig-beta"]')!.textContent).toBe('Fig (1.2)');
    expect(refs.querySelector('a[data-ref-to="fig-gamma"]')!.textContent).toBe('Fig (1.1)');

    // straight through the registry: live thunks, never snapshots
    expect(targets().getTarget('fig-alpha')!.number()).toBe('1.3');
    expect(targets().getTarget('fig-gamma')!.number()).toBe('1.1');

    // the moved instances keep reacting — state survived the move
    component.tap();
    await tick();
    expect(container.querySelector('[data-row="f-a"]')!.getAttribute('data-beats')).toBe('3');
  });
});

describe('4.1 — the same law, section lane (keyed items.reverse())', () => {
  it('sibling numbers swap (2.1 ↔ 2.3), ids stay, heading text follows, references follow', async () => {
    const { container, component } = render(ReorderHost);
    await settle();

    // the section lane root is the second top-level domain: children 2.1–2.3
    expect(container.querySelector('#sec-sec-lane')!.getAttribute('data-number')).toBe('2');
    expect(container.querySelector('#sec-r-alpha')!.getAttribute('data-number')).toBe('2.1');
    expect(container.querySelector('#sec-r-beta')!.getAttribute('data-number')).toBe('2.2');
    expect(container.querySelector('#sec-r-gamma')!.getAttribute('data-number')).toBe('2.3');
    const refs0 = container.querySelector('[data-refs="sections"]')!;
    expect(refs0.querySelector('a[data-ref-to="sec-r-alpha"]')!.textContent).toBe('§ 2.1');
    expect(refs0.querySelector('a[data-ref-to="sec-r-gamma"]')!.textContent).toBe('§ 2.3');

    // identities + counter priming before the swap
    const alpha = container.querySelector('#sec-r-alpha')!;
    const rowA = container.querySelector('[data-row="s-a"]')!;
    component.tap();
    await tick();
    component.tap();
    await tick();
    expect(rowA.getAttribute('data-beats')).toBe('2');

    component.reverse();
    await settle();

    // the sibling swap, per id; the id itself never moved
    expect(container.querySelector('#sec-r-alpha')!.getAttribute('data-number')).toBe('2.3');
    expect(container.querySelector('#sec-r-beta')!.getAttribute('data-number')).toBe('2.2');
    expect(container.querySelector('#sec-r-gamma')!.getAttribute('data-number')).toBe('2.1');
    expect(alpha.getAttribute('data-number')).toBe('2.3'); // the captured node carried the change
    // the heading's leading number node + the U+00A0 join followed
    expect(container.querySelector('#sec-r-alpha [data-jx-number]')!.textContent).toBe('2.3');
    expect(container.querySelector('#sec-r-alpha h2')!.textContent).toBe('2.3\u00A0R Alpha');

    // the SAME DOM node and the SAME instance (counter not reset)
    expect(container.querySelector('#sec-r-alpha')).toBe(alpha);
    expect(container.querySelector('[data-row="s-a"]')).toBe(rowA);
    expect(rowA.getAttribute('data-beats')).toBe('2');

    // references follow the new numbers; the registry thunk reads through
    const refs = container.querySelector('[data-refs="sections"]')!;
    expect(refs.querySelector('a[data-ref-to="sec-r-alpha"]')!.textContent).toBe('§ 2.3');
    expect(refs.querySelector('a[data-ref-to="sec-r-beta"]')!.textContent).toBe('§ 2.2');
    expect(refs.querySelector('a[data-ref-to="sec-r-gamma"]')!.textContent).toBe('§ 2.1');
    expect(targets().getTarget('sec-r-alpha')!.number()).toBe('2.3');
    expect(targets().getTarget('sec-r-gamma')!.number()).toBe('2.1');
  });
});
