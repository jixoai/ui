/**
 * The dialog structural gates (card-surface-kernel era, 2026-09-09).
 * Grid GEOMETRY is css — jsdom can't compute tracks — so these gates
 * pin what the law keys off (the list-item.spec / separator.spec
 * precedent):
 *
 *   STRUCTURE  the sticker host's presence STAMPS (data-sep-head /
 *              data-sep-foot on the data-jx-card host — the
 *              stamped-attribute painting law), the Separator
 *              INSTANCES edge-riding their band rows, the CardBody
 *              cell riding the absorbing row, and the retired
 *              borders/paddings gone from the markup.
 *   DIALECT    the interior IS the card structural kernel: the host
 *              stamps data-jx-card (never a Card component — no
 *              border/bg/shadow skin inside the dialog), the faces
 *              are the Card family parts (CardHeader/CardBody/
 *              CardFooter), the × rides .jx-card-end-action-slot —
 *              the seat the card sources reserved for it.
 *   CSS SOURCE dialog.css owns the MECHANISM only (scrim, × scale,
 *              the open-gated height-continuity flex); the ruler law
 *              lives in card.css (the sticker's rule set).
 *   r12 FACE   class/head/cancelGuard survive the restructure intact.
 *
 * The palette composition (head snippet + CardHeader + geometry
 * overrides) is locked end-to-end in search-client.spec.ts.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { Snippet } from 'svelte';
import Dialog from '../src/lib/ui/dialog/dialog.svelte';
import CardFooter from '../src/lib/ui/card/card-footer.svelte';

const css = readFileSync(resolve(process.cwd(), 'src/lib/ui/dialog/dialog.css'), 'utf8');
const cardCss = readFileSync(resolve(process.cwd(), 'src/lib/ui/card/card.css'), 'utf8');

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as Snippet;
const footer = (() => {}) as unknown as Snippet;
const head = (() => {}) as unknown as Snippet;

const host = (c: HTMLElement) => c.querySelector('[data-jx-card]')!;

/** band name | the separator's edge stamp, for DOM-order locks */
const zoneTag = (n: Element): string => {
  if (n.hasAttribute('data-jx-card-head')) return 'head-zone';
  if (n.hasAttribute('data-jx-card-body')) return 'body-zone';
  if (n.hasAttribute('data-jx-card-foot')) return 'foot-zone';
  return `sep-${n.getAttribute('data-jx-card-sep')}`;
};

describe('the sticker host — presence stamps (the painting law)', () => {
  it('always stamps the structural head separator; stamps the foot one only on presence', () => {
    const bare = render(Dialog, { props: { title: 't', children } });
    expect(host(bare.container).hasAttribute('data-sep-head')).toBe(true);
    expect(host(bare.container).hasAttribute('data-sep-foot')).toBe(false);
    // no footer face passed → no foot band, no foot separator edge
    expect(bare.container.querySelector('[data-jx-card-foot]')).toBeNull();
    expect(bare.container.querySelector('[data-jx-card-sep="foot"]')).toBeNull();

    const footed = render(Dialog, { props: { title: 't', children, footer } });
    expect(host(footed.container).hasAttribute('data-sep-foot')).toBe(true);
    expect(footed.container.querySelector('[data-jx-card-foot]')).not.toBeNull();
  });

  it('the host is the STICKER, not a Card — no planar skin inside the dialog (the kernel law)', () => {
    const { container } = render(Dialog, { props: { title: 't', children } });
    const h = host(container);
    expect(h.tagName).toBe('DIV'); // the interior host, a plain element carrying the attribute
    // the planar Card skin (border/bg/shadow utilities) must NOT ride it
    expect(h.className).not.toMatch(/border\b/);
    expect(h.className).not.toMatch(/bg-card/);
    expect(h.className).not.toMatch(/shadow-/);
    // and no Card COMPONENT is nested (the dialect is attributes + css)
    expect(container.querySelector('section[data-jx-card]')).toBeNull();
  });
});

describe('the separators — Separator instances edge-riding their band rows', () => {
  it('the head divider IS the Separator component (native hr, ink engine hooks, AT-hidden)', () => {
    const { container } = render(Dialog, { props: { title: 't', children } });
    const sep = container.querySelector('[data-jx-card-sep="head"]')!;
    expect(sep).not.toBeNull();
    expect(sep.tagName).toBe('HR'); // the Separator component's horizontal posture
    expect(sep.getAttribute('data-jx-separator')).toBe('fused'); // its ink hook
    expect(sep.getAttribute('data-orientation')).toBe('horizontal');
    expect(sep.getAttribute('aria-hidden')).toBe('true'); // decorative chrome
  });

  it('the host DOM order is head, sep-head, body, sep-foot, foot', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    const order = [...host(container).children].map(zoneTag);
    expect(order).toEqual(['head-zone', 'sep-head', 'body-zone', 'sep-foot', 'foot-zone']);
  });
});

describe('the bands — borders retired, the kernel parts compose', () => {
  it('bands stay flush and border-free (geometry belongs to content, not bands)', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    for (const band of ['head', 'body', 'foot']) {
      const el = container.querySelector(`[data-jx-card-${band}]`)!;
      expect(el.className).not.toMatch(/border-[tb]/);
    }
    // the DEFAULT title row IS the Card family's CardHeader — it owns
    // the block rhythm only (py-2.5; the inline inset arrives BY
    // TRACK); a consumer head snippet renders RAW
    const headRow = container.querySelector('.jx-card-head-content')!;
    expect(headRow.className).toMatch(/py-2\.5/);
    expect(headRow.className).not.toMatch(/px-/); // the track paints the inset
    expect(headRow.querySelector('h2[data-jx-card-title]')).not.toBeNull();
    const flushed = render(Dialog, { props: { head, children } });
    expect(flushed.container.querySelector('.jx-card-head-content')).toBeNull();
    expect(flushed.container.querySelector('h2')).toBeNull();
    // the × rides the RESERVED seat (the card sources' wish, kept)
    expect(container.querySelector('.jx-card-end-action-slot .jx-dialog-x')).not.toBeNull();
  });

  it('the body is the CardBody part — ONE gutter-compensation formula, single-sourced', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    const bodyBand = container.querySelector('[data-jx-card-body]')!;
    const bodyRow = bodyBand.querySelector('[data-jx-card-cell]')!;
    expect(bodyBand.hasAttribute('data-jx-scroll')).toBe(false); // default scroller
    expect(bodyRow.className).toMatch(/py-3\.5/);
    expect(bodyRow.className).toMatch(/px-\[max\(0\.875rem-var\(--jx-scrollbar-thin,0px\),0px\)\]/);
  });

  it('scroll={false} declares the body a non-scroller: the off-stamp, absent by default', () => {
    const fixed = render(Dialog, { props: { title: 't', children, scroll: false } });
    expect(fixed.container.querySelector('[data-jx-card-body]')!.getAttribute('data-jx-scroll')).toBe('off');
  });
});

describe('the foot band — the footer snippet is RAW; CardFooter is the content face', () => {
  it('the scope covers band buttons; the foot renders the snippet RAW', () => {
    const { container } = render(Dialog, { props: { title: 't', children, footer } });
    // the scope component renders NO element (a context boundary) —
    // the head face places directly under its band
    expect(container.querySelector('[data-jx-card-head] .jx-card-head-face')).not.toBeNull();
    // the foot band renders the footer snippet RAW — no grid, no group,
    // no divider from Dialog; the content face is CardFooter's
    expect(container.querySelector('[data-jx-card-foot] > .jx-card-foot-grid')).toBeNull();
    expect(container.querySelector('[data-jx-card-foot] > [data-jx-btngroup]')).toBeNull();
    expect(container.querySelector('[data-jx-card-foot] > [data-jx-separator]')).toBeNull();
  });

  it('CardFooter: children auto-join ONE ButtonGroup (named; the seats place on the ruler)', () => {
    const { container } = render(CardFooter, { props: { children } });
    const grid = container.querySelector('.jx-card-foot-grid')!;
    expect(grid).not.toBeNull();
    const groups = grid.querySelectorAll(':scope > .jx-card-foot-cluster > [data-jx-btngroup]');
    expect(groups.length).toBe(1);
    expect(groups[0]?.getAttribute('aria-label')).toBe('Actions'); // the neutral default
  });

  it('CardFooter: the end slot replaces the grouped arrangement entirely', () => {
    const ended = render(CardFooter, {
      props: { children, end: (() => {}) as unknown as Snippet },
    });
    expect(ended.container.querySelector('[data-jx-btngroup]')).toBeNull(); // no group under the raw face
    expect(ended.container.querySelector('.jx-card-foot-grid')).not.toBeNull(); // the ruler mirror still carries the end content
  });

  it("CardFooter: the opening line is the GROUP's leading seam — no standalone Separator anywhere", () => {
    const grouped = render(CardFooter, { props: { children } });
    const group = grouped.container.querySelector('[data-jx-btngroup]');
    expect(group?.hasAttribute('data-jx-leading-seam')).toBe(true);
    const bare = render(CardFooter, { props: {} });
    expect(bare.container.querySelector('[data-jx-separator]')).toBeNull(); // no cluster → no dangling line
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

describe('the dialect — css source law (mechanism here, ruler in the kernel sheet)', () => {
  it('dialog.css owns NO ruler: the structural rule set lives in card.css (the sticker)', () => {
    // the mechanism residue only — no grid templates, no band rules
    expect(css).not.toContain('grid-template-rows');
    expect(css).not.toContain('data-jx-card-head');
    expect(css).not.toContain('data-jx-card-body');
    expect(css).not.toContain('data-jx-card-foot');
    // the sticker's sheet carries the three-band template with the
    // body row as the sole absorber (integer lines — the tenancy law)
    expect(cardCss).toMatch(/grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)\s+auto/s);
    // the container (the 15rem reversal's anchor) rides the sticker
    expect(cardCss).toContain('container: jx-card');
    // the sticker host needs no overflow authority (the body cell is
    // the ring); its max-h is the panel's own geometry in markup
  });

  it('the scroll law lives in the kernel sheet: the cell is the ring, both-edges gutter', () => {
    expect(cardCss).toMatch(/\[data-jx-card-cell\][^}]*overflow-y: auto/s);
    expect(cardCss).toMatch(/\[data-jx-card-cell\][^}]*scrollbar-gutter: stable both-edges/s);
    expect(cardCss).toMatch(/\[data-jx-scroll='off'\][^}]*scrollbar-gutter: auto/s);
  });

  it('the height-continuity flex is GATED on open dialogs — a closed dialog stays display:none (2026-09-05)', () => {
    // an author display declaration — even :where() zero-specificity —
    // outranks the UA sheet's dialog:not([open]) { display: none }
    // (author > UA origin beats specificity). Ungated, every CLOSED
    // dialog rendered as an invisible absolutely-positioned box below
    // the viewport; the site's root-layout search palette made the
    // DOCUMENT scrollable by its height (the page-shift bug).
    expect(css).toMatch(/\.jx-dialog\[open\][\s\S]{0,80}display: flex/);
    expect(css).toMatch(/\.jx-dialog:popover-open[\s\S]{0,80}display: flex/);
    // the UNGATED platform selector must not exist
    expect(css).not.toMatch(/:where\(\.jx-dialog\)\s*\{/);
    // the grid host under the conducted ceiling: the flex-child floor
    // is lifted (the kernel's absorbing row can constrain)
    expect(css).toMatch(/\[data-jx-dialog-surface\][^}]*>\s*:where\(\[data-jx-card\]\)[\s\S]{0,60}min-height: 0/s);
  });

  it('no zone border paint creeps back into either sheet', () => {
    for (const sheet of [css, cardCss]) {
      expect(sheet).not.toMatch(/border-block|border-top|border-bottom/);
    }
  });
});
