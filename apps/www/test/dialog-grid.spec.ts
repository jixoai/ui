/**
 * The dialog grid-ruler gates (r13, 2026-09-02 — the Owner's grid
 * mandate, list-item subgrid precedent). Grid GEOMETRY is css — jsdom
 * can't compute tracks — so these gates pin what the law keys off
 * (the list-item.spec / separator.spec precedent):
 *
 *   STRUCTURE  the ruler host's presence STAMPS (data-sep-head /
 *              data-sep-foot — the stamped-attribute painting law:
 *              the component resolves zone presence, css paints
 *              stamps only), the Separator INSTANCES in their row
 *              tracks, the zones' content cells riding the 1fr track,
 *              and the retired borders/paddings gone from the markup.
 *   CSS SOURCE the ruler block itself: subgrid tenancy, the named
 *              [sep-head]/[sep-foot] 1px tracks, the no-subgrid
 *              padding fallback, the container-query inset ladder.
 *   r12 FACE   class/head/cancelGuard survive the restructure intact.
 *
 * The palette composition (head snippet + geometry overrides) is
 * locked end-to-end in search-client.spec.ts.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { Snippet } from 'svelte';
import Dialog from '../src/lib/ui/dialog/dialog.svelte';

const css = readFileSync(resolve(process.cwd(), 'src/lib/ui/dialog/dialog.css'), 'utf8');

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as Snippet;
const footer = (() => {}) as unknown as Snippet;
const actions = (() => {}) as unknown as Snippet;
const head = (() => {}) as unknown as Snippet;

const scroll = (c: HTMLElement) => c.querySelector('[data-jx-dialog-scroll]')!;

/** zone name | the separator's track stamp, for DOM-order locks */
const zoneTag = (n: Element): string => {
  if (n.hasAttribute('data-jx-dialog-head')) return 'head-zone';
  if (n.hasAttribute('data-jx-dialog-body')) return 'body-zone';
  if (n.hasAttribute('data-jx-dialog-foot')) return 'foot-zone';
  return `sep-${n.getAttribute('data-jx-dialog-sep')}`;
};

describe('the ruler host — presence stamps (the painting law)', () => {
  it('always stamps the structural head separator; stamps the foot one only on presence', () => {
    const bare = render(Dialog, { props: { title: 't', children } });
    expect(scroll(bare.container).hasAttribute('data-sep-head')).toBe(true);
    expect(scroll(bare.container).hasAttribute('data-sep-foot')).toBe(false);
    // no footer face passed → no foot zone, no foot separator row
    expect(bare.container.querySelector('[data-jx-dialog-foot]')).toBeNull();
    expect(bare.container.querySelector('[data-jx-dialog-sep="foot"]')).toBeNull();

    const footed = render(Dialog, { props: { title: 't', children, footer } });
    expect(scroll(footed.container).hasAttribute('data-sep-foot')).toBe(true);
    expect(footed.container.querySelector('[data-jx-dialog-foot]')).not.toBeNull();
  });

  it('actions is the foot zone too (the shortcut face)', () => {
    const acted = render(Dialog, { props: { title: 't', children, actions } });
    expect(scroll(acted.container).hasAttribute('data-sep-foot')).toBe(true);
    expect(acted.container.querySelector('[data-jx-dialog-foot]')).not.toBeNull();
  });
});

describe('the separators — Separator instances in explicit tracks', () => {
  it('the head divider IS the Separator component (native hr, ink engine hooks, AT-hidden)', () => {
    const { container } = render(Dialog, { props: { title: 't', children } });
    const sep = container.querySelector('[data-jx-dialog-sep="head"]')!;
    expect(sep).not.toBeNull();
    expect(sep.tagName).toBe('HR'); // the Separator component's horizontal posture
    expect(sep.getAttribute('data-jx-separator')).toBe('line'); // its ink hook
    expect(sep.getAttribute('data-orientation')).toBe('horizontal');
    expect(sep.getAttribute('aria-hidden')).toBe('true'); // decorative chrome
  });

  it('the host DOM order is head, sep-head, body, sep-foot, foot', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    const order = [...scroll(container).children].map(zoneTag);
    expect(order).toEqual(['head-zone', 'sep-head', 'body-zone', 'sep-foot', 'foot-zone']);
  });
});

describe('the zones — borders retired, content rides the 1fr track', () => {
  it('no zone carries border or inline-padding utilities (block rhythm py stays); the body zone carries none at all', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    for (const zone of ['head', 'body', 'foot']) {
      const el = container.querySelector(`[data-jx-dialog-${zone}]`)!;
      expect(el.className).not.toMatch(/border-[tb]/);
      // INLINE padding is the ruler's job now — p-/px-/pl-/pr- are banned
      expect(el.className).not.toMatch(/\bp(x|l|r)?-[\d.]/);
    }
    expect(container.querySelector('[data-jx-dialog-body]')!.getAttribute('class')).toBeNull();
  });

  it("each zone's content cell rides the ruler's 1fr track (col-start-2)", () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    for (const zone of ['head', 'body', 'foot']) {
      const cell = container.querySelector(`[data-jx-dialog-${zone}] > div`)!;
      expect(cell.className).toContain('col-start-2');
    }
  });

  it('the platform element is the named inline-size container', () => {
    const { container } = render(Dialog, { props: { title: 't', children } });
    expect(container.querySelector('dialog')!.className).toContain('@container/jx-dialog');
  });
});

describe('the foot zone — actions auto-group, footer leads', () => {
  it('actions wraps its snippet in a ButtonGroup (justify end, named)', () => {
    const { container } = render(Dialog, { props: { title: 't', children, actions } });
    const group = container.querySelector('[data-jx-btngroup]')!;
    expect(group).not.toBeNull();
    expect(group.getAttribute('data-jx-btngroup')).toBe('horizontal');
    expect(group.getAttribute('aria-label')).toBe('Dialog actions');
    expect(group.className).toContain('justify-end');
  });

  it('both faces: footer renders as leading content, actions owns the terminal cluster', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer, actions } });
    const cell = container.querySelector('[data-jx-dialog-foot] > div')!;
    expect(cell.className).toContain('justify-end');
    // the ButtonGroup is the cell's LAST child — the terminal cluster
    const last = cell.lastElementChild!;
    expect(last.getAttribute('data-jx-btngroup')).toBe('horizontal');
  });
});

describe('the r12 composition face survives the restructure', () => {
  it('class lands on the platform element after the law utilities', () => {
    const { container } = render(Dialog, {
      props: { title: 't', children, class: 'mt-[14vh] w-[min(92vw,44rem)]' },
    });
    const dialog = container.querySelector('dialog')!;
    expect(dialog.className).toContain('jx-dialog');
    expect(dialog.className).toContain('mt-[14vh]');
    expect(dialog.className).toContain('w-[min(92vw,44rem)]');
  });

  it('the head snippet replaces the default title row; the x button stays', () => {
    const { container } = render(Dialog, { props: { title: 't', children, head } });
    expect(container.querySelector('h2')).toBeNull(); // the default title row is gone
    expect(container.querySelector('button[aria-label="Close"]')).not.toBeNull();
  });

  it('cancelGuard holds the shut; without it the cancel runs the animated close', async () => {
    const held = render(Dialog, {
      props: { title: 't', children, open: true, cancelGuard: () => true },
    });
    const heldDialog = held.container.querySelector('dialog')!;
    await vi.waitFor(() => expect(heldDialog.open).toBe(true));
    const c1 = new Event('cancel', { cancelable: true });
    heldDialog.dispatchEvent(c1);
    expect(c1.defaultPrevented).toBe(true); // claimed…
    expect(heldDialog.open).toBe(true); // …and held open (the guard's true)

    const free = render(Dialog, { props: { title: 't', children, open: true } });
    const freeDialog = free.container.querySelector('dialog')!;
    await vi.waitFor(() => expect(freeDialog.open).toBe(true));
    const c2 = new Event('cancel', { cancelable: true });
    freeDialog.dispatchEvent(c2);
    expect(c2.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(freeDialog.open).toBe(false)); // the animated shut ran
  });
});

describe('the ruler — css source law', () => {
  it('the scroll ring is the ruler host: [inset 1fr inset] columns behind the inset token', () => {
    expect(css).toContain('--jx-dialog-inset');
    expect(css).toMatch(
      /grid-template-columns:\s*var\(--jx-dialog-inset\)\s*minmax\(0, 1fr\)\s*var\(--jx-dialog-inset\)/,
    );
    expect(css).toContain('column-gap: 0'); // no gap tracks beside the insets
  });

  it('the zones rent the ruler through subgrid (grid-column 1/-1)', () => {
    expect(css).toContain('@supports (grid-template-columns: subgrid)');
    expect(css).toContain('grid-template-columns: subgrid');
    expect(css).toContain('grid-column: 1 / -1');
  });

  it('explicit named 1px separator rows; the foot matrix branches on the stamp', () => {
    expect(css).toContain('[sep-head] 1px');
    expect(css).toContain('[sep-foot] 1px');
    expect(css).toContain('[data-jx-dialog-scroll][data-sep-foot]');
    expect(css).toContain("[data-jx-dialog-sep='head']");
    expect(css).toContain("[data-jx-dialog-sep='foot']");
  });

  it('the no-subgrid fallback keeps the padding geometry (the law, the item.css pattern)', () => {
    // base block (outside @supports): zones self-pad from the same token
    const base = css.split('@supports (grid-template-columns: subgrid)')[0];
    expect(base).toContain('padding-inline: var(--jx-dialog-inset)');
    // the ruler path re-zeroes it — the tracks own the inset there
    expect(css).toContain('padding-inline: 0');
  });

  it('the responsive ladder: named container tiers step the inset down', () => {
    expect(css).toContain('@container jx-dialog (max-width: 22rem)');
    expect(css).toContain('@container jx-dialog (max-width: 15rem)');
    expect(css).toContain('--jx-dialog-inset: 0.875rem');
    expect(css).toContain('--jx-dialog-inset: 0.5rem');
    expect(css).toContain('--jx-dialog-inset: 0.3125rem');
  });

  it('no zone border paint creeps back into the family sheet', () => {
    expect(css).not.toMatch(/border-block|border-top|border-bottom/);
  });
});
