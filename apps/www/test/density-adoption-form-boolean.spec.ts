/**
 * Packet B density adoption contract (2026-08-26).
 * Locks policy props/stamps, physical wrapper ownership, and the absence of
 * the retired toggle footprint API. Browser geometry is covered by the
 * adoption verifier against the built docs fixture.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import Checkbox from '../src/lib/ui/checkbox/checkbox.svelte';
import Radio from '../src/lib/ui/radio/radio.svelte';
import Toggle from '../src/lib/ui/toggle/toggle.svelte';
import Range from '../src/lib/ui/range/range.svelte';
import ColorPicker from '../src/lib/ui/color-picker/color-picker.svelte';
import TerminalHeader from '../src/lib/ui/terminal-header/terminal-header.svelte';
import TerminalCard from '../src/lib/ui/terminal-card/terminal-card.svelte';
import TerminalFooterHost from './fixtures/terminal-footer-host.svelte';

describe('density adoption packet B', () => {
  it('stamps resolved density on every boolean/control root', () => {
    const { container } = render(Checkbox, { props: { label: 'ready', density: 'xs' } });
    expect(container.querySelector('[data-density]')?.getAttribute('data-density')).toBe('xs');
  });

  it('uses physical activation lanes around visual boolean glyphs', () => {
    const checkbox = render(Checkbox, { props: { label: 'ready' } });
    expect(checkbox.container.querySelector('[data-jx-check]')).not.toBeNull();
    expect(checkbox.container.querySelector('.jx-html-checkbox')).not.toBeNull();
    const radio = render(Radio, { props: { label: 'ready', name: 'state' } });
    expect(radio.container.querySelector('[data-jx-check]')).not.toBeNull();
    expect(radio.container.querySelector('.jx-html-radio')).not.toBeNull();
  });

  it('keeps range interaction and color trigger roots present', () => {
    const range = render(Range, { props: { label: 'volume', density: 'sm' } });
    expect(range.container.querySelector('[data-density]')?.getAttribute('data-density')).toBe('sm');
    const color = render(ColorPicker, { props: { label: 'accent', density: 'default' } });
    expect(color.container.querySelector('.jx-color-picker-trigger')).not.toBeNull();
  });

  it('preserves the range keyboard contract while density owns its hit lane', async () => {
    const { container } = render(Range, { props: { label: 'volume', value: 5, min: 0, max: 10, step: 1 } });
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    expect(slider.getAttribute('aria-valuenow')).toBe('5');
    await fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.getAttribute('aria-valuenow')).toBe('6');
    await fireEvent.keyDown(slider, { key: 'End' });
    expect(slider.getAttribute('aria-valuenow')).toBe('10');
  });

  it('does not expose a toggle size/controlSize footprint API', () => {
    const toggleSource = readFileSync(resolve(import.meta.dirname, '../src/lib/ui/toggle/toggle.svelte'), 'utf8');
    expect(toggleSource).not.toContain('controlSize');
    expect(toggleSource).not.toContain('--jx-toggle-w');
    expect(toggleSource).not.toContain('--jx-toggle-h');
  });

});

// ---------------------------------------------------------------------------
// terminal family density matrix (merge-alignment B3, 2026-08-29)
// ---------------------------------------------------------------------------
// The B3 criterion classes verified across no-parent/xs/lg on the
// terminal chrome/content trio: the header is CHROME (the
// data-jx-chrome pointer-modality band), the card and footer are
// CONTENT (editorial type literals). None of them holds a density
// opinion, so the expected data-density behavior in EVERY state is the
// ABSENCE of a stamp — nothing re-scopes the subtree, and the nearest
// [data-density] ancestor remains exactly what the ambient scope
// provided (null under no parent, the scope wrapper under xs/lg). The
// family's fixed-posture leaf — ghostty-term, whose explicit
// 'default' fallback resolves a concrete stamp — locks its own matrix
// in ghostty-term.spec.ts.

describe('density adoption — terminal family matrix (B3: chrome/content hold no opinion)', () => {
  // jsdom ships no matchMedia; the header's tier-cross watcher and the
  // card's reduced-motion probe need the listener pair only (the
  // composition-f convention — matches is never true in the headless
  // pass)
  beforeAll(() => {
    if (typeof window.matchMedia !== 'function') {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
    }
  });

  const densityStates = [
    ['no parent (the root default scope)', 'no-parent'],
    ['parent scope xs', 'xs'],
    ['parent scope lg', 'lg'],
  ] as const;

  /** the ambient-scope harness: a [data-density] scope ancestor (or
   * none) wrapping the render target — the css scope channel the trio
   * rides; the scope element doubles as the flow-through oracle. */
  const scopeTarget = (
    state: (typeof densityStates)[number][1],
  ): { scopeEl: HTMLElement | null; target: HTMLElement } => {
    const scopeEl = state === 'no-parent' ? null : document.createElement('div');
    if (scopeEl) {
      scopeEl.setAttribute('data-density', state);
      document.body.appendChild(scopeEl);
    }
    const target = document.createElement('div');
    (scopeEl ?? document.body).appendChild(target);
    return { scopeEl, target };
  };

  it.each(densityStates)(
    'terminal-header (chrome): stamps no data-density under %s — ambient flows through',
    (_label, state) => {
      const { scopeEl, target } = scopeTarget(state);
      const { container } = render(TerminalHeader, { target, props: { brand: 'matrix-brand' } });
      const header = container.querySelector('header.jx-nav');
      expect(header).toBeTruthy();
      // chrome holds no opinion: no manufactured stamp in any state
      expect(header!.hasAttribute('data-density')).toBe(false);
      // the band is the pointer-modality chrome (data-jx-chrome), not a
      // density scope — it carries no data-density either
      const row = header!.querySelector('div[data-jx-chrome]');
      expect(row).toBeTruthy();
      expect(row!.hasAttribute('data-density')).toBe(false);
      // ambient flows THROUGH: the nearest density scope is the parent
      // wrapper (or none) — the header re-scoped nothing
      expect(header!.closest('[data-density]')).toBe(scopeEl);
      scopeEl?.remove();
    },
  );

  it.each(densityStates)(
    'terminal-card (content): stamps no data-density under %s — literals are the registered structural exception',
    (_label, state) => {
      const { scopeEl, target } = scopeTarget(state);
      const { container } = render(TerminalCard, {
        target,
        props: { barTitle: 'matrix — zsh', command: 'npx jixoai-ui add', outputs: ['ok'] },
      });
      const card = container.querySelector('[data-jx-terminal]');
      expect(card).toBeTruthy();
      expect(card!.hasAttribute('data-density')).toBe(false);
      expect(card!.closest('[data-density]')).toBe(scopeEl);
      scopeEl?.remove();
    },
  );

  it.each(densityStates)(
    'terminal-footer (content): stamps no data-density under %s — ambient flows through',
    (_label, state) => {
      const { scopeEl, target } = scopeTarget(state);
      // the composed host fixture (the footer's children snippet is
      // consumer content — composition-b convention)
      const { container } = render(TerminalFooterHost, { target });
      const footer = container.querySelector('[data-jx-terminal-footer]');
      expect(footer).toBeTruthy();
      expect(footer!.hasAttribute('data-density')).toBe(false);
      expect(footer!.closest('[data-density]')).toBe(scopeEl);
      scopeEl?.remove();
    },
  );

});
