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
  it('zones stay flush and border-free (the r14 tuning: geometry belongs to content, not zones)', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    for (const zone of ['head', 'body', 'foot']) {
      const el = container.querySelector(`[data-jx-dialog-${zone}]`)!;
      expect(el.className).not.toMatch(/border-[tb]/);
      expect(el.getAttribute('class')).toBeNull(); // the zone element carries NO utilities
    }
    // the DEFAULT title row owns its rhythm; a consumer head snippet
    // renders FLUSH (the row drops its padding utilities entirely)
    const headRow = container.querySelector('.jx-dialog-head-content')!;
    expect(headRow.className).toMatch(/px-3\.5/);
    expect(headRow.className).toMatch(/py-2\.5/);
    const flushed = render(Dialog, { props: { head, children } });
    const flushedRow = flushed.container.querySelector('.jx-dialog-head-content')!;
    expect(flushedRow.className).not.toContain('px-');
    expect(flushedRow.className).not.toContain('py-');
    const bodyRow = container.querySelector('[data-jx-dialog-body] > div')!;
    expect(bodyRow.className).toMatch(/p-3\.5/);
  });

  it('the retired column ruler leaves no residue (no inset token, no subgrid, no col-start)', () => {
    expect(css).not.toMatch(/--jx-dialog-inset\s*:/); // the NAME may live in the retirement note; the DECLARATION may not
    expect(css).not.toContain('grid-template-columns: subgrid'); // mentions may live in notes; usage may not
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    expect(container.querySelector('.col-start-2')).toBeNull();
  });

  it('the scroll law (r14-3): the panel never scrolls — only the body content cell is the ring', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    // the ruler host carries a height BOUND but no overflow authority
    const ring = container.querySelector('[data-jx-dialog-scroll]')!;
    expect(ring.className).not.toMatch(/overflow(-[xy])?-?(auto|scroll)/);
    expect(ring.className).toMatch(/max-h-/);
    // the body ZONE is the scroll ring (min-height:0 unlocks the 1fr row)
    const bodyZone = container.querySelector('[data-jx-dialog-body]')!;
    const bodyCss = 'overflow-y: auto; scrollbar-gutter: stable; min-height: 0;';
    void bodyZone; void bodyCss;
    expect(css).toMatch(/\[data-jx-dialog-body\][^}]*min-height: 0/s);
    expect(css).toMatch(/\[data-jx-dialog-body\][^}]*overflow-y: auto/s);
    // the css gives body the ONLY flexible row (head/foot pinned)
    expect(css).toContain('[body] minmax(0, 1fr)');
    expect(css).not.toContain('[body] minmax(0, auto)');
  });

  it('the platform element is the named inline-size container', () => {
    const { container } = render(Dialog, { props: { title: 't', children } });
    expect(container.querySelector('dialog')!.className).toContain('@container/jx-dialog');
  });
});

describe('the foot zone — actions auto-group, footer leads', () => {
  it('the ghost scope covers header and footer buttons (Context, r14-2)', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer, actions } });
    // both zones wrap their content in the variant scope
    expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    // the scope component renders NO element (a context boundary, not a
    // container) — the slot grids sit directly under the zones
    expect(container.querySelector('[data-jx-dialog-head] > .jx-dialog-head-grid')).not.toBeNull();
    expect(container.querySelector('[data-jx-dialog-foot] > .jx-dialog-foot-grid')).not.toBeNull();
  });

  it('actions wraps its snippet in a ButtonGroup (named; the grid packs the end)', () => {
    const acted = render(Dialog, { props: { title: 't', children, actions } });
    const grid = acted.container.querySelector('.jx-dialog-foot-grid')!;
    expect(grid.querySelector('[data-jx-btngroup]')).not.toBeNull();
  });

  it('footer buttons hang in ONE button-group; actions groups separately; one divider between (r14-7)', () => {
    const both = render(Dialog, { props: { title: 't', children, footer, actions } });
    const grid = both.container.querySelector('.jx-dialog-foot-grid')!;
    const groups = [...grid.querySelectorAll(':scope > [data-jx-btngroup]')];
    expect(groups.length).toBe(2); // the footer cluster AND the actions cluster
    expect(groups[0]?.getAttribute('aria-label')).toBe('Dialog footer');
    expect(groups[1]?.getAttribute('aria-label')).toBe('Dialog actions');
    // between the two groups exactly one decorative separator
    expect(grid.querySelectorAll(':scope > hr').length).toBe(1);
    // the actions group stays the terminal child
    expect([...grid.children].at(-1)?.getAttribute('data-jx-btngroup')).toBe('horizontal');
  });

  it('the RAW end slot replaces the grouped cluster entirely (the footerEnd reference)', () => {
    const ended = render(Dialog, {
      props: { title: 't', children, footer, actions, end: (() => {}) as unknown as Snippet },
    });
    const grid = ended.container.querySelector('.jx-dialog-foot-grid')!;
    expect(grid.querySelectorAll('[data-jx-btngroup], hr').length).toBe(0); // no groups, no divider
    // the foot zone still exists (end drives hasFoot)
    expect(ended.container.querySelector('[data-jx-dialog-foot]')).not.toBeNull();
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

  it('the close button ships NO tooltip carriage; the accessible name survives (r14-6)', () => {
    const { container } = render(Dialog, { props: { title: 't', children } });
    const x = container.querySelector('.jx-dialog-x')!;
    expect(x.getAttribute('aria-label')).toBe('Close');
    // the popover-manual tooltip carriage is GONE (tip={false}), not
    // merely hidden — the quiet square
    expect(x.closest('[popover]')).toBeNull();
    expect(container.querySelector('[popover]')).toBeNull();
  });

  it('the close button ships NO tooltip carriage; the accessible name survives (r14-6)', () => {
    const { container } = render(Dialog, { props: { title: 't', children } });
    const x = container.querySelector('.jx-dialog-x')!;
    expect(x.getAttribute('aria-label')).toBe('Close');
    // the popover-manual tooltip carriage is GONE (tip={false}), not
    // merely hidden — the quiet square
    expect(x.closest('[popover]')).toBeNull();
    expect(container.querySelector('[popover]')).toBeNull();
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
  it('the scroll ring is the ROW-RULER host: one column, named rows (r14)', () => {
    expect(css).toMatch(/display: grid;/);
    expect(css).toContain('[head] auto');
    expect(css).toContain('[body] minmax(0, 1fr)'); // the ONLY flexible row (the scroll law, r14-3)
    // no column ruler on the scroll RING (the zone-level slot grids
    // own their own two-track columns — that is the r14-2 law)
    const ring = css.slice(css.indexOf('[data-jx-dialog-scroll]'), css.indexOf('.jx-dialog-head-grid'));
    expect(ring).not.toContain('grid-template-columns');
  });

  it('explicit named 1px separator rows; the foot matrix branches on the stamp', () => {
    expect(css).toContain('[sep-head] 1px');
    expect(css).toContain('[sep-foot] 1px');
    expect(css).toContain('[data-jx-dialog-scroll][data-sep-foot]');
    expect(css).toContain("[data-jx-dialog-sep='head']");
    expect(css).toContain("[data-jx-dialog-sep='foot']");
  });

  it('the r14 tuning records itself in the sheet (the retirement note)', () => {
    expect(css).toContain('RETIRED');
    expect(css).toMatch(/r14 tuning/i);
  });

  it('the inset ladder is gone; the platform stays a named container (the 15rem foot variants ride it)', () => {
    expect(css).not.toContain('@container jx-dialog (max-width: 22rem)');
    expect(css).not.toMatch(/--jx-dialog-inset\s*:/); // the NAME may live in the retirement note; the DECLARATION may not
  });

  it('no zone border paint creeps back into the family sheet', () => {
    expect(css).not.toMatch(/border-block|border-top|border-bottom/);
  });
});
