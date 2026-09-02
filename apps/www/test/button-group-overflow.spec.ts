/**
 * button-group-overflow.spec.ts — the r13 overflow state machine
 * (wrap | collapse, hysteresis, the folded menu).
 *
 * jsdom lays nothing out, so each test stubs getBoundingClientRect
 * per element (the setup.ts convention for geometry specs) and then
 * pokes the group's exported remeasure() — the same pass a
 * ResizeObserver callback runs. The measured geometry is chosen by
 * hand: greedy rows, collapse counts, and both hysteresis margins
 * (enter strict, leave with slack) are asserted against exact
 * expectations.
 *
 * A11y under test: the ⋯ trigger names itself (aria-label) and its
 * panel (aria-haspopup), the folded entries are real menuitems in a
 * role=menu whose activation CLICKS the hidden real button (the
 * consumer's handler fires on the real element), and selection closes
 * the menu with focus restored to the trigger — no focus trap.
 */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import OverflowHost from './fixtures/button-group-overflow-host.svelte';

const rect = (width: number): DOMRect =>
  ({ width, height: 32, x: 0, y: 0, top: 0, left: 0, right: width, bottom: 32, toJSON: () => {} }) as DOMRect;

/** stub the measuring pose: the container's available width, each
 *  item's natural line width, the ⋯ trigger's width */
function stub(
  group: Element,
  avail: number,
  widths: number[],
  more = 0,
): HTMLElement[] {
  (group as HTMLElement).getBoundingClientRect = () => rect(avail);
  const kids = [...group.children].filter(
    (c): c is HTMLElement =>
      !c.hasAttribute('popover') && !c.hasAttribute('data-jx-btngroup-more'),
  );
  kids.forEach((kid, i) => {
    kid.getBoundingClientRect = () => rect(widths[i] ?? 0);
  });
  const moreEl = group.querySelector<HTMLElement>('[data-jx-btngroup-more]');
  if (moreEl) moreEl.getBoundingClientRect = () => rect(more);
  return kids;
}

describe('ButtonGroup · overflow: the static path', () => {
  it('renders the complete single row until measurement says otherwise (SSR/no-JS shape)', () => {
    const { container } = render(OverflowHost);
    const og = container.querySelector('[data-testid="og"]')!;
    expect(og.hasAttribute('data-jx-overflow')).toBe(false);
    expect(og.querySelectorAll('[data-jx-press-button]')).toHaveLength(5);
    expect(og.hasAttribute('data-jx-measuring')).toBe(false); // the pass is atomic
  });
});

describe('ButtonGroup · overflow: wrap (default)', () => {
  it('overflows into measured greedy rows with row leads dropping the seam', async () => {
    const rendered = render(OverflowHost);
    const og = rendered.container.querySelector('[data-testid="og"]')!;
    const kids = stub(og, 100, [50, 40, 30, 60]);
    rendered.component.poke();
    expect(og.getAttribute('data-jx-overflow')).toBe('wrap');
    // margin-box rows (jsdom computes 0 margins — the sheet never
    // loads there): [50,40]=90 | [30,60]=90 — row-major, DOM order
    const cell = (i: number) => `${kids[i].style.gridRow}/${kids[i].style.gridColumn}`;
    expect(cell(0)).toBe('1/1');
    expect(cell(1)).toBe('1/2');
    expect(cell(2)).toBe('2/1');
    expect(cell(3)).toBe('2/2');
    // EVERY row lead is stamped (row 1's lead is a first-child — the
    // stamp's margin reset is a no-op there, but the mark is uniform)
    expect(kids[0].hasAttribute('data-jx-row-start')).toBe(true);
    expect(kids[2].hasAttribute('data-jx-row-start')).toBe(true); // row lead: no seam neighbor
    expect(kids[1].hasAttribute('data-jx-row-start')).toBe(false);
    expect(og.hasAttribute('data-jx-measuring')).toBe(false); // the pass is atomic
    // wrap never folds a menu
    expect(og.querySelector('[data-jx-btngroup-more]')).toBeNull();
  });

  it('a divider that would OPEN a row closes the previous cluster instead', async () => {
    const rendered = render(OverflowHost, { props: { withDivider: true } });
    const og = rendered.container.querySelector('[data-testid="og"]')!;
    // row 1 fills at copy+move (95); the divider's 1px would tip it
    // over 95.5 → it stays on row 1's TAIL instead (it closes the
    // copy/move cluster rather than dangling at a row edge)
    const kids = stub(og, 95, [40, 55, 1, 60, 50, 50]);
    rendered.component.poke();
    expect(og.getAttribute('data-jx-overflow')).toBe('wrap');
    const divider = kids[2];
    expect(`${divider.style.gridRow}/${divider.style.gridColumn}`).toBe('1/3');
    expect(divider.hasAttribute('data-jx-row-start')).toBe(false);
  });

  it('hysteresis: leaving wrap needs margin — boundary jitter cannot flap', async () => {
    const rendered = render(OverflowHost);
    const og = rendered.container.querySelector('[data-testid="og"]')!;
    const widths = [50, 40, 30, 60]; // natural margin-box sum = 180
    stub(og, 100, widths);
    rendered.component.poke();
    expect(og.getAttribute('data-jx-overflow')).toBe('wrap');
    // 4px slack: still wrapped (the HYST=8 band)
    stub(og, 184, widths);
    rendered.component.poke();
    expect(og.getAttribute('data-jx-overflow')).toBe('wrap');
    // 8px slack: back to the single row, placements cleared
    stub(og, 188, widths);
    rendered.component.poke();
    expect(og.hasAttribute('data-jx-overflow')).toBe(false);
    expect(og.children[0].style.gridRow).toBe('');
  });
});

describe('ButtonGroup · overflow: collapse (the收纳 menu)', () => {
  it('folds the overflow tail into the menu; k buttons stay inline; at least one always does', async () => {
    const rendered = render(OverflowHost, { props: { overflow: 'collapse' } });
    const og = rendered.container.querySelector('[data-testid="og"]')!;
    // needed(k) = Σ margin-boxes + trigger box: 40k + 20 →
    // needed(2)=100 ≤ 100 < needed(3)=140
    const kids = stub(og, 100, [40, 40, 40, 40, 40], 20);
    rendered.component.poke();
    await tick(); // the folded entries render through Svelte state
    expect(og.getAttribute('data-jx-overflow')).toBe('collapse');
    expect(kids.map((k) => k.hasAttribute('data-jx-overflow-hidden'))).toEqual([
      false,
      false,
      true,
      true,
      true,
    ]);
    // the folded entries are real menuitems carrying the buttons' labels
    const items = [...og.querySelectorAll('[role="menu"] [role="menuitem"]')];
    expect(items.map((i) => i.textContent?.trim())).toEqual(['delete', 'rename', 'export']);
  });

  it('a divider with a hidden start neighbor folds too; the cluster boundary survives as the menu\'s plain hr', async () => {
    const rendered = render(OverflowHost, { props: { overflow: 'collapse', withDivider: true } });
    const og = rendered.container.querySelector('[data-testid="og"]')!;
    // needed(2) = 100 > 90 → k collapses to 1: the divider's start
    // neighbor (move) is hidden → the divider folds with it, and the
    // boundary between the folded clusters rides into the menu as an hr
    const kids = stub(og, 90, [40, 40, 1, 40, 40, 40], 20);
    rendered.component.poke();
    await tick();
    expect(og.getAttribute('data-jx-overflow')).toBe('collapse');
    expect(kids[0].hasAttribute('data-jx-overflow-hidden')).toBe(false); // k ≥ 1 always
    expect(kids[2].hasAttribute('data-jx-overflow-hidden')).toBe(true); // the divider folded
    const menu = og.querySelector('[role="menu"]')!;
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    expect(items.map((i) => i.textContent?.trim())).toEqual(['move', 'delete', 'rename', 'export']);
    // the divider between the folded move and delete clusters renders
    // as the menu's plain hr (dropdown-menu law) — not a menuitem
    const hrs = menu.querySelectorAll('hr');
    expect(hrs).toHaveLength(1);
    expect(hrs[0].previousElementSibling?.textContent?.trim()).toBe('move'); // between the clusters
    expect(hrs[0].nextElementSibling?.textContent?.trim()).toBe('delete');
  });

  it('the ⋯ trigger names itself and its panel; opening focuses item 1; selection proxies the REAL button and restores focus', async () => {
    const onAction = vi.fn();
    const rendered = render(OverflowHost, { props: { overflow: 'collapse', onAction } });
    const og = rendered.container.querySelector('[data-testid="og"]')!;
    stub(og, 100, [40, 40, 40, 40, 40], 20);
    rendered.component.poke();

    const trigger = og.querySelector<HTMLButtonElement>('[data-jx-btngroup-more] button')!;
    expect(trigger.getAttribute('aria-label')).toBe('more actions');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('popovertarget')).toBeTruthy(); // the platform invoker path

    // open: the popovertarget click toggles the panel; the menu
    // keyboard contract focuses the FIRST item (not the trigger)
    await fireEvent.click(trigger);
    const menu = og.querySelector('[role="menu"]')!;
    const items = [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
    await waitFor(() => expect(document.activeElement).toBe(items[0]));

    // selection clicks the hidden REAL button — the consumer's handler
    // fires on it, and the menu closes with focus back on the trigger
    await fireEvent.click(items[0]);
    expect(onAction).toHaveBeenCalledWith('delete');
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('hysteresis: the inline count grows only with margin (the HYST=8 band)', async () => {
    const rendered = render(OverflowHost, { props: { overflow: 'collapse' } });
    const og = rendered.container.querySelector('[data-testid="og"]')!;
    const widths = [40, 40, 40, 40, 40];
    stub(og, 100, widths, 20); // k=2 (needed(2)=100)
    rendered.component.poke();
    expect(
      og.querySelectorAll('[data-jx-overflow-hidden="true"]'),
    ).toHaveLength(3);

    // needed(3) = 140: 140+8 > 141 → still k=2 inside the band
    stub(og, 141, widths, 20);
    rendered.component.poke();
    expect(og.querySelectorAll('[data-jx-overflow-hidden="true"]')).toHaveLength(3);

    // past the band: k=3 grows back (140+8 ≤ 150)
    stub(og, 150, widths, 20);
    rendered.component.poke();
    expect(og.querySelectorAll('[data-jx-overflow-hidden="true"]')).toHaveLength(2);
  });

  it('when everything fits inline again the trigger never shows (state returns to none)', async () => {
    const rendered = render(OverflowHost, { props: { overflow: 'collapse' } });
    const og = rendered.container.querySelector('[data-testid="og"]')!;
    stub(og, 100, [40, 40, 40, 40, 40], 20);
    rendered.component.poke();
    expect(og.getAttribute('data-jx-overflow')).toBe('collapse');
    // grow wide enough that every button + trigger fit: k = all → none
    stub(og, 300, [40, 40, 40, 40, 40], 20);
    rendered.component.poke();
    expect(og.hasAttribute('data-jx-overflow')).toBe(false);
    expect(og.querySelectorAll('[data-jx-overflow-hidden="true"]')).toHaveLength(0);
  });
});
