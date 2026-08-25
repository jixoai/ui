/**
 * Item family lock (test/list-item.spec.ts). The slot-composition
 * contract on grid (Codex D1): presence-matrix behavior is CSS (:has)
 * — jsdom can't compute it — so these locks pin the STRUCTURE the
 * matrix keys off (data-slots, roots, roles) plus the visual-matrix
 * data attributes; the css source guard pins that the matrix rules
 * exist.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import {
  Item,
  ItemGroup,
  ItemSeparator,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '../src/lib/ui/list-item';

const specDir = resolve(fileURLToPath(import.meta.url), '..');
const css = readFileSync(resolve(specDir, '../src/lib/ui/list-item/item.css'), 'utf8');

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as { render: () => {} };

describe('Item family — structure the presence matrix keys off', () => {
  it('root is a div by default, an anchor with href, carrying variant/size data', () => {
    const { container: c1 } = render(Item, { props: { children } });
    const div = c1.querySelector('[data-slot="item"]')!;
    expect(div.tagName).toBe('DIV');
    expect(div.getAttribute('data-variant')).toBe('default');
    expect(div.getAttribute('data-size')).toBe('default');

    const { container: c2 } = render(Item, {
      props: { href: '/x', variant: 'outline', size: 'sm', children },
    });
    const a = c2.querySelector('[data-slot="item"]')!;
    expect(a.tagName).toBe('A');
    expect(a.getAttribute('href')).toBe('/x');
    expect(a.getAttribute('data-variant')).toBe('outline');
    expect(a.getAttribute('data-size')).toBe('sm');
  });

  it('media stamps its variant; image renders the img', () => {
    const { container: c1 } = render(ItemMedia, { props: { variant: 'icon', children } });
    expect(c1.querySelector('[data-slot="item-media"]')!.getAttribute('data-variant')).toBe('icon');
    const { container: c2 } = render(ItemMedia, { props: { variant: 'image', src: '/a.png' } });
    expect(c2.querySelector('img')!.getAttribute('src')).toBe('/a.png');
  });

  it('ItemGroup is the role=list container; items self-role as listitem via context', async () => {
    const Host = (await import('./fixtures/item-group-host.svelte')).default;
    const { container } = render(Host);
    const group = container.querySelector('[data-slot="item-group"]')!;
    expect(group.getAttribute('role')).toBe('list');
    const items = group.querySelectorAll(':scope > [data-slot="item"]');
    expect(items.length).toBe(2);
    for (const el of items) expect(el.getAttribute('role')).toBe('listitem');
    // linked row stays an anchor; solo row outside the group is un-roled
    expect(items[0].tagName).toBe('A');
    const solo = container.querySelector(':scope > [data-slot="item"]')!;
    expect(solo.getAttribute('role')).toBeNull();
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
    const { container: ca } = render(ItemActions, { props: { id: 'row-actions', children } });
    expect(ca.querySelector('#row-actions')).toBeTruthy();
  });

  it('ItemSeparator renders the separator hairline', () => {
    const { container } = render(ItemSeparator);
    expect(container.querySelector('[data-slot="item-separator"]')).toBeTruthy();
  });
});

describe('Item family — the CSS presence matrix (source guard)', () => {
  it('carries the D1-ruled template rules', () => {
    expect(css).toContain(`grid-template-areas: 'media content actions'`);
    expect(css).toMatch(/:not\(:has\(> \[data-slot='item-media'\]\)\)/);
    expect(css).toContain(`'header header header'`);
    expect(css).toContain(`'footer footer footer'`);
    expect(css).toContain(`@container jx-items (max-width: 30rem)`);
    expect(css).toContain(`'actions actions'`);
    expect(css).toContain('.jx-item-separator');
    expect(css).toContain('container: jx-items / inline-size');
  });
});
