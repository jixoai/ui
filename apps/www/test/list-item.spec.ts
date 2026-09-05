/**
 * Item family lock (test/list-item.spec.ts, openspec
 * list-item-systemization task 2). Presence-matrix GEOMETRY is css
 * (:has()) — jsdom can't compute it — so these locks pin the
 * STRUCTURE the matrix and the stamped-chrome law key off: native
 * group DOM, resolution stamps, divider ownership, leaf forwarding.
 * The css source guard pins the matrix/divider/terminal rules exist;
 * the exhaustive browser geometry fixture lands in task 6.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type { Snippet } from 'svelte';
import {
  Item,
  ItemGroup,
  ItemDivider,
  ItemEnd,
  ItemAfter,
  ItemChevron,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '../src/lib/ui/list-item';

const specDir = resolve(fileURLToPath(import.meta.url), '..');
const cssPath = resolve(specDir, '../src/lib/ui/list-item/item.css');
const css = readFileSync(cssPath, 'utf8');

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as Snippet;

describe('Item family — structure the matrix keys off', () => {
  it('root is a div by default, an anchor with href; stamps the resolved chrome', () => {
    const { container: c1 } = render(Item, { props: { children } });
    const div = c1.querySelector('[data-slot="item"]')!;
    expect(div.tagName).toBe('DIV');
    // standalone auto → its own surface
    expect(div.getAttribute('data-variant')).toBe('auto');
    expect(div.getAttribute('data-item-chrome')).toBe('surface');
    // density stamps (opinion-only law): no density prop → no stamp,
    // the row rides the ambient css scope; data-size authority is gone
    expect(div.getAttribute('data-density')).toBeNull();
    expect(div.getAttribute('data-layout')).toBe('standard');

    const { container: c2 } = render(Item, {
      props: { href: '/x', variant: 'outline', density: 'xs', children },
    });
    const a = c2.querySelector('[data-slot="item"]')!;
    expect(a.tagName).toBe('A');
    expect(a.getAttribute('href')).toBe('/x');
    // explicit variant always wins over the group policy (escape hatch)
    expect(a.getAttribute('data-variant')).toBe('outline');
    expect(a.getAttribute('data-item-chrome')).toBe('outline');
    expect(a.getAttribute('data-density')).toBe('xs'); // explicit DENSITY override
    // the stamp union is CLOSED: explicit default normalizes to none
    const { container: c3 } = render(Item, { props: { variant: 'default', children } });
    const d = c3.querySelector('[data-slot="item"]')!;
    expect(d.getAttribute('data-variant')).toBe('default');
    expect(d.getAttribute('data-item-chrome')).toBe('none');
  });

  it('media stamps its variant; image renders the img (src/alt stay public)', () => {
    const { container: c1 } = render(ItemMedia, { props: { variant: 'icon', children } });
    expect(c1.querySelector('[data-slot="item-media"]')!.getAttribute('data-variant')).toBe('icon');
    const { container: c2 } = render(ItemMedia, { props: { variant: 'image', src: '/a.png', alt: 'a' } });
    const img = c2.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/a.png');
    expect(img.getAttribute('alt')).toBe('a');
  });

  it('group is native: frame + ul[role=list]; rows are li wrappers; label → section', async () => {
    const Host = (await import('./fixtures/item-group-host.svelte')).default;
    const { container } = render(Host);
    // labeled group → section frame + visible label outside the list
    const section = container.querySelector('[data-slot="item-group"]')!;
    expect(section.tagName).toBe('SECTION');
    const label = section.querySelector('.jx-item-group-label')!;
    expect(section.getAttribute('aria-labelledby')).toBe(label.id);
    const list = section.querySelector('[data-slot="item-list"]')!;
    expect(list.tagName).toBe('UL');
    expect(list.getAttribute('role')).toBe('list');
    // data-dividers lives ONLY on the ul (adjacency owner)
    expect(list.getAttribute('data-dividers')).toBe('auto');
    expect(section.getAttribute('data-dividers')).toBeNull();
    // the group is the density provider + owns the explicit ruler;
    // with no density opinion it stamps NOTHING (fleet law) — rows
    // and frame ride the ambient css scope together
    expect(section.getAttribute('data-density')).toBeNull();
    expect(list.getAttribute('data-density')).toBeNull();
    expect(list.getAttribute('data-ruler')).toBe('content-end');
    // rows are li wrappers keeping anchor semantics inside
    const rows = list.querySelectorAll(':scope > [data-slot="item-row"]');
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector('[data-slot="item"]')!.tagName).toBe('A');
    // grouped auto rows yield chrome to the group; layout/size inherit
    const grouped = rows[0].querySelector('[data-slot="item"]')!;
    expect(grouped.getAttribute('data-item-chrome')).toBe('none');
    expect(grouped.getAttribute('data-layout')).toBe('standard');
    // standalone row renders its root directly (no li wrapper, own surface)
    const solo = container.querySelector(':scope > [data-slot="item"]')!;
    expect(solo.tagName).toBe('DIV');
    expect(solo.getAttribute('data-item-chrome')).toBe('surface');
  });

  it('ItemEnd hosts the trailing lane: after metadata, actions, chevron glyph', () => {
    const { container } = render(ItemEnd, { props: { children } });
    expect(container.querySelector('[data-slot="item-end"]')!.getAttribute('data-wrap')).toBe('auto');
    const { container: ca } = render(ItemAfter, { props: { children } });
    expect(ca.querySelector('[data-slot="item-after"]')!.getAttribute('data-tone')).toBe('muted');
    const { container: cc } = render(ItemChevron);
    const chevron = cc.querySelector('[data-slot="item-chevron"]')!;
    expect(chevron.querySelector('svg')!.hasAttribute('data-jx-icon')).toBe(true);
    // decorative: the shared inline icon bakes aria-hidden
    expect(chevron.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    // the decorative contract lives on the exported leaf too
    expect(chevron.getAttribute('aria-hidden')).toBe('true');
  });

  it('a caller-supplied data-dividers never lands on the frame (component-owned)', () => {
    const { container } = render(ItemGroup, { props: { 'data-dividers': 'none', children } });
    const frame = container.querySelector('[data-slot="item-group"]')!;
    expect(frame.getAttribute('data-dividers')).toBeNull();
    expect(frame.querySelector('[data-slot="item-list"]')!.getAttribute('data-dividers')).toBe('auto');
  });

  it('ItemDivider is the childless presentational li boundary', () => {
    const { container } = render(ItemDivider);
    const divider = container.querySelector('[data-slot="item-divider"]')!;
    expect(divider.tagName).toBe('LI');
    expect(divider.getAttribute('role')).toBe('presentation');
    expect(divider.children.length).toBe(0);
  });

  it('ItemTitle/ItemDescription honor the as override (dt/dd support)', () => {
    const { container: ct } = render(ItemTitle, { props: { as: 'dt', children } });
    expect(ct.firstElementChild!.tagName).toBe('DT');
    const { container: cd } = render(ItemDescription, { props: { as: 'dd', children } });
    expect(cd.firstElementChild!.tagName).toBe('DD');
  });

  it('slot leaves forward rest attributes — id reaches the title node (the prelude bug)', () => {
    // PlayRow points aria-labelledby at ItemTitle's id; before the
    // prelude fix the leaf destructured only as/class/children and
    // silently dropped it everywhere (openspec list-item-systemization
    // task 1)
    const { container: ct } = render(ItemTitle, { props: { id: 'row-label', children } });
    expect(ct.querySelector('#row-label')!.getAttribute('data-slot')).toBe('item-title');
    const { container: cd } = render(ItemDescription, {
      props: { id: 'row-desc', 'aria-hidden': 'true', children },
    });
    expect(cd.querySelector('#row-desc')!.getAttribute('aria-hidden')).toBe('true');
    const { container: cc } = render(ItemContent, { props: { id: 'row-content', children } });
    expect(cc.querySelector('#row-content')).toBeTruthy();
  });
});

describe('Item family — the CSS contract (source guard)', () => {
  it('carries the end-based matrix, group laws, and terminal paint', () => {
    expect(css).toContain(`grid-template-areas: 'header header header'
      'media content end'
      'footer footer footer'`);
    expect(css).toMatch(/:not\(:has\(> \[data-slot='item-media'\]\)\)/);
    expect(css).toMatch(/:not\(:has\(> \[data-slot='item-end'\]\)\)/);
    expect(css).toContain(`@container jx-items (max-width: 30rem)`);
    expect(css).toContain(`'end end'`);
    // container lives on the list; dividers on the ul only
    expect(css).toContain('container: jx-items / inline-size');
    // the kernel laws: subgrid ruler + density aliases + no data-size
    expect(css).toContain('grid-template-columns: subgrid');
    expect(css).toContain("[data-ruler='media-content-end']");
    expect(css).toMatch(/var\(--jx-(text|gap|row-min|hit)/);
    // the two-line reserve is a POSTURE, not a row law (Owner
    // 2026-09-05): BOTH title and description present earn the
    // row-min floor; the base row floors at the hit height — a
    // title-only row is one line tall
    expect(css).toMatch(
      /\.jx-item\):has\(\[data-slot='item-title'\]\):has\(\[data-slot='item-description'\]\)[^}]*min-block-size: var\(--jx-row-min\)/,
    );
    expect(css).not.toMatch(/:where\(\.jx-item\)\s*\{[^}]*min-block-size: var\(--jx-row-min\)/);
    expect(css).not.toMatch(/\[data-size=/);
    expect(css).toContain("[data-wrap='never']");
    expect(css).toMatch(/\[data-slot='item-list'\]\[data-dividers='auto'\] > \[data-slot='item-row'\] \+ \[data-slot='item-row'\]/);
    // terminal law (r3 fill upgrade): chrome paints the family-local
    // clean fill — a breath of ink over the page background — never --card
    expect(css).toContain('background: var(--jx-item-fill)');
    expect(css).toContain(`background: var(--terminal-hover)`);
    expect(css).toContain(`box-shadow: inset 2px 0 0 var(--primary)`);
    expect(css).not.toContain('var(--card)');
    expect(css).toContain('.jx-item-group-label');
    expect(css).toContain('[data-slot=\'item-divider\']');
    // ItemSeparator's contract is gone
    expect(css).not.toContain('.jx-item-separator');
    // exhaustive-matrix complement (the browser gate is scripts/verify-item-matrix.mjs):
    // 16 wide + 8 narrow end-present combos, each declaring BOTH tracks and areas
    const wideBlock = css.slice(0, css.indexOf('/* ── slot geometry'));
    expect(wideBlock.match(/grid-template-areas/g)!.length).toBe(16);
    expect(wideBlock.match(/grid-template-columns/g)!.length).toBe(16);
    expect(css.match(/grid-template-areas/g)!.length).toBe(30); // 16 wide + 8 narrow standalone/fallback + 6 grouped ruler (appendix B)
    // the cascade law: every matrix selector is :where()-wrapped — no
    // bare .jx-item rule may exist (impl-review r2-10)
    expect(css).not.toMatch(/^\s*\.jx-item[\s,{]/m);
  });
});

describe('Item family — the reactive policy law (impl-review r1-7)', () => {
  it('stamps re-resolve on group prop changes; nested groups shadow', async () => {
    const Host = (await import('./fixtures/item-policy-host.svelte')).default;
    const { rerender, container } = render(Host, {
      props: { mode: 'default', density: 'default', layout: 'standard' },
    });
    const outer = container.querySelector('[data-probe="outer"]')!;
    const outerList = outer.querySelector(':scope > [data-slot="item-list"]')!;
    // default mode, dividers omitted → auto; frame carries mode
    expect(outer.getAttribute('data-mode')).toBe('default');
    expect(outerList.getAttribute('data-dividers')).toBe('auto');
    // nested group shadows: inner rows are sm despite outer default
    const innerRow = outer.querySelector('[data-probe="inner"] [data-slot="item"]');
    expect(innerRow!.getAttribute('data-density')).toBe('sm');

    // muted forces none even when 'auto' is supplied explicitly
    await rerender({ mode: 'muted', dividers: 'auto', density: 'default' });
    expect(outer.getAttribute('data-mode')).toBe('muted');
    expect(outer.querySelector(':scope > [data-slot="item-list"]')!.getAttribute('data-dividers')).toBe('none');

    // plain + explicit none → none; rerender merges props, so the
    // omission cases get their own fresh renders below
    await rerender({ mode: 'plain', dividers: 'none', density: 'sm' });
    expect(outer.querySelector(':scope > [data-slot="item-list"]')!.getAttribute('data-dividers')).toBe('none');
    expect(outer.getAttribute('data-density')).toBe('sm');
    expect(innerRow!.getAttribute('data-density')).toBe('sm');
    await rerender({ mode: 'plain', dividers: 'auto', density: 'default' });
    expect(outer.querySelector(':scope > [data-slot="item-list"]')!.getAttribute('data-dividers')).toBe('auto');
    // layout re-resolves too: the frame stamps it, auto rows inherit it
    await rerender({ mode: 'plain', dividers: 'auto', density: 'default', layout: 'media' });
    expect(outer.getAttribute('data-layout')).toBe('media');
    expect(outer.querySelector(':scope > [data-slot="item-list"] > [data-slot="item-row"] [data-slot="item"]')!.getAttribute('data-layout')).toBe('media');
    // grouped rows re-resolved size through the whole rerender chain
    const groupedRow = outer.querySelector(':scope > [data-slot="item-list"] > [data-slot="item-row"] [data-slot="item"]');
    expect(groupedRow!.getAttribute('data-density')).toBe('default');
    expect(groupedRow!.getAttribute('data-item-chrome')).toBe('none');

    // the omission matrix on fresh trees: plain omitted → none,
    // default omitted → auto (already the first render above)
    const plain = render(Host, { props: { mode: 'plain', density: 'default', layout: 'standard' } });
    expect(
      plain.container.querySelector('[data-probe="outer"] > [data-slot="item-list"]')!.getAttribute('data-dividers'),
    ).toBe('none');
    plain.unmount();
  });
});
