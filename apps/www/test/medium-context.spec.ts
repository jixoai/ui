/**
 * The document-level medium observation (print-pipeline layout
 * wiring, 2026-08-30).
 *
 * The ROOT layout provides the medium its plugin scopes endorse
 * (env.medium — the hue pipeline's gate). The print layer always
 * stamps the docs SOURCE ROOT — a page-owned element deep in the
 * tree that changes across navigations — never <html> itself. A
 * plain per-element observer bound at the document root would never
 * see those stamps; provideMedium therefore widens to subtree
 * observation exactly when the root IS document.documentElement.
 *
 * These fixtures lock that seam: a descendant stamp flips the
 * document medium, its removal re-derives back to screen, and a
 * stamp on <html> itself is seen the direct way. The NAVIGATION
 * fixtures lock the childList half (P1-6): a stamped source root
 * LEAVING the tree (route teardown) and a new root ARRIVING
 * (stamped or not) emit no attribute mutation — only childList
 * observation re-derives the document medium.
 */
import { render, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PrintMediumRootHost from './fixtures/print-medium-root-host.svelte';
import PrintMediumNavHost from './fixtures/print-medium-nav-host.svelte';
import { PRINT_SIM_ATTR } from '../src/lib/medium.svelte';

const readOut = (container: HTMLElement): string =>
  container.querySelector('[data-medium-out]')!.getAttribute('data-medium-out')!;

describe('provideMedium at the document root (subtree observation)', () => {
  it('starts at screen with no stamp anywhere', () => {
    const { container } = render(PrintMediumRootHost);
    expect(readOut(container)).toBe('screen');
  });

  it('a DESCENDANT source-root stamp flips the document medium to sim', async () => {
    const { container } = render(PrintMediumRootHost);
    const source = container.querySelector('[data-print-source]')!;
    source.setAttribute(PRINT_SIM_ATTR, '');
    await waitFor(() => expect(readOut(container)).toBe('sim'));
  });

  it('removing the descendant stamp re-derives back to screen', async () => {
    const { container } = render(PrintMediumRootHost);
    const source = container.querySelector('[data-print-source]')!;
    source.setAttribute(PRINT_SIM_ATTR, '');
    await waitFor(() => expect(readOut(container)).toBe('sim'));
    source.removeAttribute(PRINT_SIM_ATTR);
    await waitFor(() => expect(readOut(container)).toBe('screen'));
  });

  it('a stamp on <html> itself is observed directly (the same-scoped branch)', async () => {
    const { container } = render(PrintMediumRootHost);
    try {
      document.documentElement.setAttribute(PRINT_SIM_ATTR, '');
      await waitFor(() => expect(readOut(container)).toBe('sim'));
    } finally {
      document.documentElement.removeAttribute(PRINT_SIM_ATTR);
    }
    await waitFor(() => expect(readOut(container)).toBe('screen'));
  });
});

describe('provideMedium at the document root (navigation teardown & rescan)', () => {
  it('removing a STAMPED source root re-derives back to screen (the navigation teardown)', async () => {
    const { container } = render(PrintMediumNavHost);
    const source = container.querySelector('[data-print-source]')!;
    source.setAttribute(PRINT_SIM_ATTR, '');
    await waitFor(() => expect(readOut(container)).toBe('sim'));
    // the route leaves, taking its stamped source root along — no
    // attribute mutation fires, only the removal from the tree
    source.remove();
    await waitFor(() => expect(readOut(container)).toBe('screen'));
  });

  it('a NEW source root arriving after navigation is rescanned — unstamped stays screen, pre-stamped flips sim', async () => {
    const { container } = render(PrintMediumNavHost);
    const oldRoot = container.querySelector('[data-print-source]')!;
    const parent = oldRoot.parentElement!;
    oldRoot.setAttribute(PRINT_SIM_ATTR, '');
    await waitFor(() => expect(readOut(container)).toBe('sim'));

    // the first navigation swaps in an UNSTAMPED root — the medium
    // must fall back to screen
    oldRoot.remove();
    const plain = document.createElement('div');
    plain.setAttribute('data-print-source', '');
    parent.appendChild(plain);
    await waitFor(() => expect(readOut(container)).toBe('screen'));

    // the next navigation brings a root stamped BEFORE insertion — no
    // attribute mutation will ever fire for it, only the childList
    // arrival can carry the rescan
    plain.remove();
    const stamped = document.createElement('div');
    stamped.setAttribute('data-print-source', '');
    stamped.setAttribute(PRINT_SIM_ATTR, '');
    parent.appendChild(stamped);
    await waitFor(() => expect(readOut(container)).toBe('sim'));
  });
});
