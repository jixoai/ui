/**
 * tree-view contract suite (test/tree-view.spec.ts, 2026-08-22).
 * The generic core: ARIA semantics, selection/toggle activation split,
 * the keyboard contract, disabled rows, the prefix/suffix resolvers, and
 * the multiselect extension's tri-state cascade — asserted through the
 * DOM exactly the way the demo page consumes the components.
 */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import TreeHost from './fixtures/tree-host.svelte';

const row = (host: HTMLElement, treeLabel: string, path: string): HTMLElement => {
  const tree = host.querySelector(`ul[role="tree"][aria-label="${treeLabel}"]`)!;
  return [...tree.querySelectorAll<HTMLElement>('li[role="treeitem"]')].find(
    (li) => li.dataset.path === path,
  )!;
};

const checkState = (li: HTMLElement): 'on' | 'mixed' | 'off' => {
  const box = li.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  if (box.checked) return 'on';
  return box.dataset.mixed !== undefined ? 'mixed' : 'off';
};

describe('tree-view core', () => {
  it('renders nested ARIA semantics with levels and expanded state', () => {
    const { container } = render(TreeHost);
    const tree = container.querySelector('ul[role="tree"][aria-label="host tree"]')!;
    // src, src/b and the disabled legacy folder each own a group
    expect(tree.querySelectorAll('ul[role="group"]').length).toBe(3);
    const src = row(container, 'host tree', 'src');
    expect(src.getAttribute('aria-level')).toBe('1');
    expect(src.getAttribute('aria-expanded')).toBe('true');
    expect(src.querySelector('ul[role="group"] li[role="treeitem"]')!.getAttribute('aria-level')).toBe('2');
  });

  it('leaf click selects (aria-selected + callback id); folder click toggles, never selects', async () => {
    const onselect = vi.fn();
    const { container } = render(TreeHost, { props: { onselect } });
    const leaf = row(container, 'host tree', 'src/a.ts');
    await fireEvent.click(leaf.querySelector('.jx-tree-row')!);
    expect(onselect).toHaveBeenCalledWith('src/a.ts');
    expect(leaf.getAttribute('aria-selected')).toBe('true');

    const folder = row(container, 'host tree', 'src');
    await fireEvent.click(folder.querySelector('.jx-tree-row')!);
    await waitFor(() => expect(folder.getAttribute('aria-expanded')).toBe('false'));
    expect(onselect).toHaveBeenCalledTimes(1);
  });

  it('the keyboard contract: arrows walk and expand, Enter selects, Home/End jump', async () => {
    const onselect = vi.fn();
    const { container } = render(TreeHost, { props: { onselect } });
    const first = row(container, 'host tree', 'src');
    first.focus();
    // -> enters the first child
    await fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement?.dataset?.path).toBe('src/a.ts');
    // Enter activates the focused leaf
    await fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onselect).toHaveBeenCalledWith('src/a.ts');
    // End jumps to the last visible item, Home back to the first
    await fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement?.dataset?.path).toBe('d.ts');
    await fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(document.activeElement?.dataset?.path).toBe('src');
    // <- on the first-level folder stays (no parent above)
    // -> on the collapsed b folder expands it
    const b = row(container, 'host tree', 'src/b');
    b.focus();
    await fireEvent.keyDown(b, { key: 'ArrowRight' });
    await waitFor(() => expect(b.getAttribute('aria-expanded')).toBe('true'));
  });

  it('roving tabindex keeps exactly one tab stop', () => {
    const { container } = render(TreeHost);
    const tree = container.querySelector('ul[role="tree"][aria-label="host tree"]')!;
    expect(tree.querySelectorAll('li[tabindex="0"]').length).toBe(1);
  });

  it('disabled rows: aria-disabled, never toggle or select', async () => {
    const onselect = vi.fn();
    const onactivate = vi.fn();
    const { container } = render(TreeHost, { props: { onselect, onactivate } });
    const legacy = row(container, 'host tree', 'legacy');
    expect(legacy.getAttribute('aria-disabled')).toBe('true');
    await fireEvent.click(legacy.querySelector('.jx-tree-row')!);
    expect(legacy.getAttribute('aria-expanded')).toBe('false');
    expect(onselect).not.toHaveBeenCalled();
    expect(onactivate).not.toHaveBeenCalled();
  });

  it('disabled folders cannot be expanded or collapsed by the arrow keys either', async () => {
    const { container } = render(TreeHost);
    const legacy = row(container, 'host tree', 'legacy');
    legacy.focus();
    await fireEvent.keyDown(legacy, { key: 'ArrowRight' });
    await fireEvent.keyDown(legacy, { key: 'ArrowLeft' });
    expect(legacy.getAttribute('aria-expanded')).toBe('false');
  });

  it('the documented ctx.preventDefault() contract owns the activation', async () => {
    const onselect = vi.fn();
    const { container } = render(TreeHost, { props: { onselect } });
    const tree = container.querySelector('ul[role="tree"][aria-label="host custom"]')!;
    const folder = [...tree.querySelectorAll<HTMLElement>('li[role="treeitem"]')].find(
      (li) => li.dataset.path === 'src',
    )!;
    const leaf = [...tree.querySelectorAll<HTMLElement>('li[role="treeitem"]')].find(
      (li) => li.dataset.path === 'src/a.ts',
    )!;
    await fireEvent.click(folder.querySelector('.jx-tree-row')!);
    await fireEvent.click(leaf.querySelector('.jx-tree-row')!);
    await fireEvent.keyDown(leaf, { key: 'Enter' });
    // defaults fully cancelled: no toggle, no select — only the count
    expect(folder.getAttribute('aria-expanded')).toBe('true');
    expect(onselect).not.toHaveBeenCalled();
    expect(leaf.getAttribute('aria-selected')).not.toBe('true');
    expect(container.querySelector('.host-intercepted')?.textContent).toBe('intercepted: 3');
  });

  it('onPrefixSlotRender picks per node; onSuffixSlotRender arms folders only', async () => {
    const { container } = render(TreeHost);
    const folder = row(container, 'host tree', 'src');
    const leaf = row(container, 'host tree', 'src/a.ts');
    expect(folder.querySelector('.host-folder')?.textContent).toBe('src');
    expect(leaf.querySelector('.host-file')?.textContent).toBe('a.ts');
    // folders carry the action button, leaves do not
    expect(folder.querySelector('.host-act')).toBeTruthy();
    expect(leaf.querySelector('.host-act')).toBeNull();
    // clicking the action never toggles the folder
    await fireEvent.click(folder.querySelector('.host-act')!);
    expect(folder.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('tree-view-multiselect extension', () => {
  it('tri-state: checked leaf, mixed parent (enabled descendants only)', () => {
    const { container } = render(TreeHost);
    expect(checkState(row(container, 'host multi', 'src/a.ts'))).toBe('on');
    expect(checkState(row(container, 'host multi', 'src'))).toBe('mixed');
    // disabled subtree never counts toward the cascade
    expect(checkState(row(container, 'host multi', 'legacy'))).toBe('off');
  });

  it('folder click cascades over enabled descendants and back', async () => {
    const { container } = render(TreeHost);
    const src = row(container, 'host multi', 'src');
    await fireEvent.click(src.querySelector('.jx-tree-row')!);
    await waitFor(() => expect(checkState(src)).toBe('on'));
    expect(checkState(row(container, 'host multi', 'src/a.ts'))).toBe('on');
    expect(checkState(row(container, 'host multi', 'src/b'))).toBe('on');
    await fireEvent.click(src.querySelector('.jx-tree-row')!);
    await waitFor(() => expect(checkState(src)).toBe('off'));
    expect(checkState(row(container, 'host multi', 'src/a.ts'))).toBe('off');
  });

  it('Space toggles the focused row through the onactivate seam', async () => {
    const { container } = render(TreeHost);
    const leaf = row(container, 'host multi', 'd.ts');
    leaf.focus();
    await fireEvent.keyDown(leaf, { key: ' ' });
    await waitFor(() => expect(checkState(leaf)).toBe('on'));
  });

  it('disabled rows render inert checkboxes and never cascade', async () => {
    const { container } = render(TreeHost);
    const legacy = row(container, 'host multi', 'legacy');
    const box = legacy.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(box.disabled).toBe(true);
    // the frozen subtree shows plain off (its stale checked ids never
    // surface), and a disabled folder row never toggles anything
    expect(checkState(legacy)).toBe('off');
    await fireEvent.click(legacy.querySelector('.jx-tree-row')!);
    await fireEvent.keyDown(legacy, { key: ' ' });
    expect(checkState(legacy)).toBe('off');
    expect(checkState(row(container, 'host multi', 'src'))).toBe('mixed');
  });
});
