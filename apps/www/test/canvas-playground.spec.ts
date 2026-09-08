/**
 * The canvas playground dock suite (test/canvas-playground.spec.ts,
 * canvas-playground-dock 2026-09-08).
 *
 * The dock gates, read through the DOM: mounts EXPANDED (the Owner
 * ruling 默认展开); the head toggle collapses to the chip (aria-expanded
 * flips, the body goes inert); reset wires page-owned onreset || the
 * schema-defaults fallback; the output dl rides the dock foot; schema
 * rows render as ItemGroup rows (li[data-slot=item-row]); the consumer
 * snippet keeps escape-hatch precedence; the horizontal drag clamp is
 * a PURE table test (the toast-swipe precedent — jsdom never needs
 * real pointer capture).
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import CanvasPlayground, { clampDockX } from '$lib/ui/component-canvas/canvas-playground.svelte';

import CanvasHost from './fixtures/canvas-host.svelte';
import CanvasPlainHost from './fixtures/canvas-plain-host.svelte';
import CanvasSchemaHost from './fixtures/canvas-schema-host.svelte';
import CanvasPrecedenceHost from './fixtures/canvas-schema-precedence-host.svelte';
import CanvasEchoDupesHost from './fixtures/canvas-output-dupes-host.svelte';

describe('dock: default expanded (the Owner ruling)', () => {
  it('mounts with the body open, wired head→body ids', () => {
    const { container } = render(CanvasSchemaHost);
    const dock = container.querySelector<HTMLElement>('[data-jx-canvas-dock]')!;
    expect(dock).not.toBeNull();
    expect(dock.getAttribute('aria-label')).toBe('Controls for schema host');

    const toggle = container.querySelector<HTMLButtonElement>('[data-jx-canvas-dock-toggle]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const body = container.querySelector<HTMLElement>('.jx-canvas-dock-collapse')!;
    expect(toggle.getAttribute('aria-controls')).toBe(body.id);
    expect(body.hasAttribute('data-open')).toBe(true);
    expect(body.inert).toBeFalsy();
  });

  it('no body content → chrome-only dock (no chevron, no collapse region)', () => {
    const { container } = render(CanvasPlainHost);
    const dock = container.querySelector<HTMLElement>('[data-jx-canvas-dock]')!;
    expect(dock).not.toBeNull();
    // the unified-chrome ruling: [grip, theme, size] ships on EVERY
    // canvas — the chevron and the body exist only when there is body
    expect(dock.querySelector('[data-jx-canvas-theme-toggle]')).not.toBeNull();
    expect(dock.querySelector('[data-jx-canvas-density-select]')).not.toBeNull();
    expect(dock.querySelector('[data-jx-canvas-dock-toggle]')).toBeNull();
    expect(dock.querySelector('.jx-canvas-dock-collapse')).toBeNull();
  });
});

describe('dock: the unified chrome head (Owner amendment 2026-09-08)', () => {
  it('the theme icon button flips the stage scope; aria-pressed carries state', async () => {
    const { container } = render(CanvasSchemaHost);
    const stage = container.querySelector<HTMLElement>('[data-jx-canvas-stage]')!;
    expect(stage.getAttribute('data-theme')).toBe('light');

    const theme = container.querySelector<HTMLButtonElement>('[data-jx-canvas-theme-toggle]')!;
    expect(theme.getAttribute('aria-label')).toBe('Toggle theme');
    expect(theme.getAttribute('aria-pressed')).toBe('false');
    await fireEvent.click(theme);
    expect(stage.getAttribute('data-theme')).toBe('dark');
    expect(theme.getAttribute('aria-pressed')).toBe('true');
  });

  it('the density select carries the repo-standard union, stamped DIRECTLY', async () => {
    const { container } = render(CanvasSchemaHost);
    const stage = container.querySelector<HTMLElement>('[data-jx-canvas-stage]')!;
    expect(stage.getAttribute('data-density')).toBe('default');

    const select = container.querySelector<HTMLSelectElement>('[data-jx-canvas-density-select]')!;
    expect(select.getAttribute('aria-label')).toBe('Density');
    expect([...select.options].map((o) => o.value)).toEqual(['xs', 'sm', 'default', 'lg']);
    await fireEvent.change(select, { target: { value: 'sm' } });
    expect(stage.getAttribute('data-density')).toBe('sm');
  });
});

describe('dock: collapse (one click, aria + inert)', () => {
  it('the toggle collapses to the head chip and back', async () => {
    const { container } = render(CanvasSchemaHost);
    const toggle = container.querySelector<HTMLButtonElement>('[data-jx-canvas-dock-toggle]')!;
    const body = container.querySelector<HTMLElement>('.jx-canvas-dock-collapse')!;

    await fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(body.hasAttribute('data-open')).toBe(false);
    // jsdom does not reflect the inert IDL property back to the
    // attribute — the PROPERTY is the browser-truth (Svelte sets it)
    expect(body.inert).toBe(true);

    await fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(body.inert).toBeFalsy();
  });

  it('the reset rides the body foot (inside the collapse region)', () => {
    const { container } = render(CanvasSchemaHost);
    const foot = container.querySelector<HTMLElement>('[data-jx-canvas-dock-foot]')!;
    expect(foot).not.toBeNull();
    expect(foot.querySelector('[data-jx-canvas-reset]')).not.toBeNull();
    expect(foot.closest('.jx-canvas-dock-collapse')).not.toBeNull();
  });
});

describe('dock: reset wiring (onreset || schema-defaults fallback)', () => {
  it('page-owned onreset wins: the callback runs and state returns', async () => {
    const { container } = render(CanvasHost);
    const input = container.querySelector<HTMLInputElement>('[data-testid="label-input"]')!;
    await fireEvent.input(input, { target: { value: 'renamed' } });

    const reset = container
      .querySelector<HTMLElement>('[data-jx-canvas-reset]')!
      .querySelector('button')!;
    await fireEvent.click(reset);
    expect(container.querySelector('[data-testid="stage-demo"]')!.textContent).toBe('Actions');
  });

  it('no onreset + schema: reset restores the schema defaults', async () => {
    const { container } = render(CanvasSchemaHost);
    await fireEvent.click(
      container.querySelector<HTMLButtonElement>('[data-jx-canvas-seg-option="outline"]')!,
    );
    await fireEvent.click(
      container.querySelector<HTMLElement>('[data-jx-canvas-reset]')!.querySelector('button')!,
    );
    expect(JSON.parse(container.querySelector('[data-testid="stage-demo"]')!.textContent!)).toEqual(
      { variant: 'fill', loading: false, depth: 2 },
    );
  });

  it('snippet-only dock without onreset ships no reset button', () => {
    const { container } = render(CanvasEchoDupesHost);
    expect(container.querySelector('[data-jx-canvas-reset]')).toBeNull();
  });
});

describe('dock: output foot + ItemGroup composition', () => {
  it('the output dl rides the dock foot (read-only, never a live region)', () => {
    const { container } = render(CanvasHost);
    const dock = container.querySelector<HTMLElement>('[data-jx-canvas-dock]')!;
    const rows = dock.querySelectorAll('[data-jx-canvas-output-row]');
    expect(rows.length).toBe(3);
    expect(rows[0].querySelector('dt')!.textContent).toBe('label');
    expect(rows[2].querySelector('dd')!.textContent).toBe('—');
    expect(dock.querySelector('.jx-canvas-output')!.getAttribute('aria-live')).toBeNull();
  });

  it('schema rows render INSIDE the ItemGroup as item rows', () => {
    const { container } = render(CanvasSchemaHost);
    const dock = container.querySelector<HTMLElement>('[data-jx-canvas-dock]')!;
    const group = dock.querySelector<HTMLElement>('[data-slot="item-group"]')!;
    expect(group).not.toBeNull();
    const rows = dock.querySelectorAll('[data-jx-canvas-row]');
    expect(rows.length).toBe(4);
    for (const row of rows) {
      // the migrated row wrapper is display:contents INSIDE the group's
      // list — the Item row shell (li[data-slot=item-row]) renders within
      // it, on the group's own list
      expect(row.closest('[data-slot="item-list"]')).toBe(
        group.querySelector('[data-slot="item-list"]'),
      );
      expect(row.querySelector('li[data-slot="item-row"]')).not.toBeNull();
    }
  });

  it('the consumer playground snippet renders inside the same ItemGroup; rows are not duplicated', () => {
    const { container } = render(CanvasPrecedenceHost);
    const dock = container.querySelector<HTMLElement>('[data-jx-canvas-dock]')!;
    expect(dock.querySelector('[data-testid="custom-playground"]')).not.toBeNull();
    expect(dock.querySelectorAll('[data-jx-canvas-row]').length).toBe(0);
    expect(dock.querySelector('[data-jx-canvas-seg-option]')).toBeNull();
  });
});

describe('dock: the drag clamp (pure, the toast-swipe precedent)', () => {
  // a 600px host, a 280px dock, 12px insets on both sides: the window
  // is [-296, 0] — mounted at 0 (right-aligned), traveling left to the
  // mirrored inset
  it.each([
    [0, -296, 0, 0, 'the mounted pose stays'],
    [-100, -296, 0, -100, 'in-window travel passes through'],
    [-400, -296, 0, -296, 'beyond the left bound pins at min'],
    [50, -296, 0, 0, 'beyond the right bound pins at max'],
    [-296, -296, 0, -296, 'the exact min is kept'],
  ])('clampDockX(%p, %p, %p) → %p (%s)', (proposed, min, max, expected) => {
    expect(clampDockX(proposed, min, max)).toBe(expected);
  });

  it('degenerate bounds (host narrower than the dock + insets) pin at max', () => {
    expect(clampDockX(-40, 30, -10)).toBe(-10);
    expect(clampDockX(5, 30, -10)).toBe(-10);
  });
});

describe('dock: the component is importable with its pure helper', () => {
  it('CanvasPlayground is a component; clampDockX is a named export', () => {
    expect(typeof CanvasPlayground).toBe('function');
    expect(typeof clampDockX).toBe('function');
  });
});
