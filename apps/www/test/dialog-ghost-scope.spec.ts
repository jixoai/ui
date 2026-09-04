import { describe, expect, it } from 'vitest';
import Host from '../test/fixtures/dialog-ghost-host.svelte';
import { mount } from 'svelte';

describe('the dialog ghost scope (r14-2 → r14-9)', () => {
  it('raw footer content and DialogFooter buttons default to ghost via Context; explicit wins', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    mount(Host, { target });
    // the close button is a CONTEXT consumer too (r14-4): IconButton
    // with no variant inherits the header's ghost scope
    const x = target.querySelector('.jx-dialog-x');
    expect(x?.getAttribute('data-jx-press-button')).toBe('ghost');

    const byLabel = Object.fromEntries(
      [...target.querySelectorAll('[data-jx-press-button]')].map((b) => [b.textContent?.trim(), b]),
    );
    const variantOf = (el?: Element) => el?.getAttribute('data-jx-press-button'); // the stamp carries the resolved variant
    // the RAW footer snippet's button — the zone scope covers it directly
    expect(variantOf(byLabel['raw-foot-button'])).toBe('ghost');
    // the DialogFooter's grouped button — inheritance flows through the
    // component into its ButtonGroup
    expect(variantOf(byLabel['grouped-ghost'])).toBe('ghost');
    expect(variantOf(byLabel['explicit-wins'])).toBe('outline'); // explicit wins, always

    // r14-9 integration: the footer snippet renders RAW in the zone —
    // DialogFooter's grid rides directly under it (the variant scope
    // renders no element), and exactly one grouped cluster exists
    expect(target.querySelector('[data-jx-dialog-foot] > .jx-dialog-foot-grid')).not.toBeNull();
    expect(target.querySelectorAll('[data-jx-dialog-foot] [data-jx-btngroup]').length).toBe(1);

    // r14-10 (Owner: the group's seam must show): the INHERITED ghost
    // turns the separator policy on — the seam pseudo's paint hook
    // rides the group's data-jx-separator stamp
    const group = target.querySelector('[data-jx-dialog-foot] [data-jx-btngroup]')!;
    expect(group.hasAttribute('data-jx-separator')).toBe(true);
    // r14-13: the actions cluster opens through the group's own
    // leading seam (the first button's flush bracket)
    expect(group.hasAttribute('data-jx-leading-seam')).toBe(true);

    // 2026-09-04, Owner — the foot rides the FLAT texture: the zone's
    // scope writes raised=false, so every footer button without an
    // explicit prop adopts the engrave-tier inset press (raw or
    // grouped — the group WRITES the flat texture itself now), while
    // an explicit raised=true keeps the convex law (explicit ALWAYS
    // wins)
    const flatOf = (el?: Element) => el?.className.includes('[--jx-press-move:none]') ?? false;
    expect(flatOf(byLabel['raw-foot-button'])).toBe(true);
    expect(flatOf(byLabel['grouped-ghost'])).toBe(true);
    expect(flatOf(byLabel['explicit-wins'])).toBe(true); // variant-explicit, physics still inherited
    expect(flatOf(byLabel['raised-explicit'])).toBe(false); // the prop wins
    // convex ghost keeps its own none-trio; the flat block's seams are gone
    expect(byLabel['raised-explicit']?.className).not.toContain('--jx-press-move');
    expect(byLabel['raised-explicit']?.className).not.toContain('engrave');
    // the cluster-shadow law: the flat zone carries to the GROUP root
    // too — the joined cluster casts no shadow of its own inside it
    expect(group.hasAttribute('data-jx-btngroup-flat')).toBe(true);
    target.remove();
  });
});
