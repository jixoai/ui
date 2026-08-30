/**
 * The medium reducer gates (paged-doc-family, 2026-08-30).
 *
 * Part 1 — the PURE reducer: every combination of the two signal
 * sources, including the priority (real print > sim > screen) and
 * the isPrintProjection equivalence.
 *
 * Part 2 — the reactive channel on a mounted PagedDoc: the full
 * migration cycle the verification contract names (真 print↔screen、
 * sim 进入/退出、真 print 压过 sim、afterprint 后 sim 戳仍在则恢复
 * sim). PagedDoc projects the derived state as data-jx-medium — the
 * observable under test; no stylesheet keys off it.
 */
import { render, fireEvent } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { deriveMedium, isPrintProjection, type MediumState } from '$lib/medium.svelte';
import MediumHost from './fixtures/paged-medium-host.svelte';

describe('deriveMedium (pure reducer)', () => {
  it('derives all four combinations with the documented priority', () => {
    expect(deriveMedium(false, false)).toBe<MediumState>('screen');
    expect(deriveMedium(false, true)).toBe<MediumState>('sim');
    expect(deriveMedium(true, false)).toBe<MediumState>('print');
    // real print wins over the surviving sim stamp
    expect(deriveMedium(true, true)).toBe<MediumState>('print');
  });

  it('isPrintProjection is exactly "not screen"', () => {
    for (const state of ['screen', 'sim', 'print'] as MediumState[]) {
      expect(isPrintProjection(state)).toBe(state !== 'screen');
    }
  });
});

describe('the reactive medium channel (PagedDoc)', () => {
  const mediumOf = (container: HTMLElement): string | null =>
    container.querySelector('[data-jx-paged-doc]')?.getAttribute('data-jx-medium') ?? null;

  const firePrintEvent = (type: 'beforeprint' | 'afterprint'): void => {
    window.dispatchEvent(new Event(type));
    flushSync();
  };

  it('migrates screen → sim → print → sim → screen (re-evaluation, not restoration)', async () => {
    const { container } = render(MediumHost);
    expect(mediumOf(container)).toBe('screen');

    // sim enters: the stamp drives the state (through the DOM, by the
    // MutationObserver — the stamp is the source of truth)
    await fireEvent.click(container.querySelector('[data-testid="sim-toggle"]')!);
    expect(mediumOf(container)).toBe('sim');

    // real print wins over the surviving stamp
    firePrintEvent('beforeprint');
    expect(mediumOf(container)).toBe('print');

    // afterprint clears ONLY the realPrint source and re-derives:
    // the stamp is still there → sim again
    firePrintEvent('afterprint');
    expect(mediumOf(container)).toBe('sim');

    // removing the stamp re-derives to screen
    await fireEvent.click(container.querySelector('[data-testid="sim-toggle"]')!);
    expect(mediumOf(container)).toBe('screen');
  });

  it('afterprint with no surviving stamp lands on screen', async () => {
    const { container } = render(MediumHost);
    firePrintEvent('beforeprint');
    expect(mediumOf(container)).toBe('print');
    firePrintEvent('afterprint');
    expect(mediumOf(container)).toBe('screen');
  });

  it('isPrintProjection rides along (sim counts as a projection)', async () => {
    const { container } = render(MediumHost);
    await fireEvent.click(container.querySelector('[data-testid="sim-toggle"]')!);
    expect(mediumOf(container)).toBe('sim');
    // the stamp is on the doc root itself
    expect(container.querySelector('[data-jx-paged-doc]')?.hasAttribute('data-jx-print-sim')).toBe(
      true,
    );
  });
});
