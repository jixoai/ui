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
    target.remove();
  });
});
