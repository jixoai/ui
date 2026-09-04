/**
 * The end lane's cluster boundary (codex r1 B6, 2026-09-05, list-item
 * side): ItemEnd provides gap/align/wrap and NOTHING else — no DOM
 * injection, no child mutation, no seam/margin/radius reach-into. A
 * joined cluster (ButtonGroup's shape, here bare buttons so the law
 * is independent of button-group's implementation) renders verbatim.
 * The seam/radius POLICY inside a joined group belongs to button-group
 * itself (a parallel workstream) — this spec pins the list-item half
 * of the boundary.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ItemEndClusterHost from './fixtures/item-end-cluster-host.svelte';

describe('end lane cluster boundary (B6)', () => {
  it('renders the cluster verbatim — no injected nodes, no mutated children', () => {
    const { container } = render(ItemEndClusterHost);
    const lane = container.querySelector('[data-slot="item-end"]')!;
    const probes = [...lane.querySelectorAll('[data-probe]')];
    expect(probes.map((p) => p.getAttribute('data-probe'))).toEqual(['a', 'b', 'c']);
    // no injected separator/marker nodes between or around the buttons
    const elementChildren = [...lane.children].filter((c) => c.tagName !== 'TEMPLATE');
    expect(elementChildren).toHaveLength(3);
    // the lane styles nothing onto the children: no inline style, no
    // margin/radius declarations smuggled in
    for (const p of probes) {
      expect(p.getAttribute('style')).toBeNull();
    }
  });
});

describe('cluster boundary — the sheet is source-pinned', () => {
  const sheet = readFileSync(resolve(__dirname, '../src/lib/ui/list-item/item.css'), 'utf8');

  it('item.css never reaches into a joined group (no btngroup/button-group internals)', () => {
    expect(sheet).not.toMatch(/btngroup/u);
    expect(sheet).not.toMatch(/button-group/u);
    // and the lane law stays what it is: gap + alignment + wrap only
    expect(sheet).toMatch(/--jx-item-end-gap/u);
  });
});
