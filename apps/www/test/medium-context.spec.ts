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
 * stamp on <html> itself is seen the direct way.
 */
import { render, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PrintMediumRootHost from './fixtures/print-medium-root-host.svelte';
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
