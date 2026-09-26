/**
 * The canvas playground dock suite (test/canvas-playground.spec.ts,
 * canvas-playground-dock 2026-09-08; the eight-axis bar re-pin
 * 2026-09-21, the Owner's post-acceptance directive).
 *
 * The dock gates, read through the DOM: mounts EXPANDED (the Owner
 * ruling 默认展开); the head toggle collapses to the chip (aria-expanded
 * flips, the body goes inert); reset wires page-owned onreset || the
 * schema-defaults fallback; the output dl rides the dock foot; schema
 * rows render as ItemGroup rows (li[data-slot=item-row]); the consumer
 * snippet keeps escape-hatch precedence; the horizontal drag clamp is
 * a PURE table test (the toast-swipe precedent — jsdom never needs
 * real pointer capture). THE EIGHT-AXIS BAR: the head ships theme (the
 * cycle button) + the SEVEN menu axes (size · shape · radius ·
 * density · color · elevation · motion — icon-button + the family's
 * DropdownMenu, `auto` + the named steps, a check on the current
 * value); the bar's lanes ride the canvas root's SUPPLY (a flip
 * re-stamps the §10 carriers), never the stage's rungs.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import CanvasPlayground, {
  CANVAS_AXIS_LANES,
  clampDockX,
} from '$lib/ui/component-canvas/canvas-playground.svelte';

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
    // the eight-axis bar (Owner directive 2026-09-21): [grip, theme +
    // the seven menu axes in one ButtonGroup] ships on EVERY canvas —
    // the chevron and the body exist only when there is body
    expect(dock.querySelector('[data-jx-canvas-theme-toggle]')).not.toBeNull();
    expect(dock.querySelectorAll('[data-jx-canvas-axis]').length).toBe(7);
    expect(dock.querySelector('[data-jx-canvas-dock-axes]')).not.toBeNull();
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

  // RE-PINNED (the Owner's eight-axis bar directive, 2026-09-21): the
  // legacy xs/sm/default/lg rung select RETIRED — the density control
  // is now the axis grammar's menu (auto/small/medium/large) and the
  // lane rides the canvas root's SUPPLY (carriers + ambient lanes),
  // never the stage's data-density rung. The menu items are real
  // buttons in the DOM (the popover panel renders closed; jsdom
  // dispatches clicks regardless), so the interaction is asserted
  // end-to-end through the same path a user drives
  it('the seven axis menus carry the axis grammar; a flip re-stamps the canvas root (supply-not-force)', async () => {
    const { container } = render(CanvasSchemaHost);
    const dock = container.querySelector<HTMLElement>('[data-jx-canvas-dock]')!;
    const canvasRoot = container.querySelector<HTMLElement>('[data-jx-canvas]')!;

    // every axis ships its named steps + auto (the universal
    // vocabulary — the retired select's rungs are gone from the bar)
    const entries = (axis: string) =>
      [...dock.querySelectorAll<HTMLButtonElement>(`#jx-canvas-schema-host-axis-${axis} [data-axis-value]`)];
    expect(entries('size').map((el) => el.getAttribute('data-axis-value'))).toEqual([
      'auto', 'small', 'medium', 'large',
    ]);
    expect(entries('shape').map((el) => el.getAttribute('data-axis-value'))).toEqual([
      'auto', 'round', 'scoop', 'bevel', 'notch', 'square', 'squircle',
    ]);
    expect(entries('elevation').map((el) => el.getAttribute('data-axis-value'))).toEqual([
      'auto', 'level-1', 'level0', 'level1', 'level2', 'level3', 'level4', 'level5',
    ]);
    expect(entries('density').map((el) => el.getAttribute('data-axis-value'))).toEqual([
      'auto', 'small', 'medium', 'large',
    ]);

    // `auto` is the default and the current value carries the check
    expect(entries('size')[0]!.hasAttribute('data-axis-current')).toBe(true);
    expect(entries('size')[3]!.hasAttribute('data-axis-current')).toBe(false);

    // the flip: menu item click → the dock's lane record → the canvas
    // root's §10 carrier (size=large stamps the §1 declaration; the
    // check state follows)
    await fireEvent.click(entries('size')[3]!);
    expect(canvasRoot.getAttribute('style')).toContain('--jx-size-effective: var(--jx-size-large)');
    expect(entries('size')[3]!.hasAttribute('data-axis-current')).toBe(true);
    expect(entries('size')[0]!.hasAttribute('data-axis-current')).toBe(false);

    // and back to auto — stamps nothing again (the pre-existing
    // density coefficient-1 aside, the slot's own 'default')
    await fireEvent.click(entries('size')[0]!);
    expect(canvasRoot.getAttribute('style')).not.toContain('--jx-size-effective');
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

    const reset = container.querySelector<HTMLButtonElement>('[data-jx-canvas-reset]')!;
    await fireEvent.click(reset);
    expect(container.querySelector('[data-testid="stage-demo"]')!.textContent).toBe('Actions');
  });

  it('no onreset + schema: reset restores the schema defaults', async () => {
    const { container } = render(CanvasSchemaHost);
    // grindstone #17-3: the segmented row rides ItemSegmented — the
    // segment's identity is the native radio's value
    await fireEvent.click(
      container.querySelector<HTMLInputElement>('[data-jx-canvas-seg] input[value="outline"]')!,
    );
    await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-jx-canvas-reset]')!);
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
    expect(dock.querySelector('[data-jx-canvas-seg]')).toBeNull();
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

  it('the eight-axis lanes seed all-auto (the default stamps nothing)', () => {
    expect(CANVAS_AXIS_LANES).toEqual({
      size: 'auto',
      shape: 'auto',
      radius: 'auto',
      density: 'auto',
      color: 'auto',
      elevation: 'auto',
      motion: 'auto',
    });
    // the seed is FROZEN — writers reassign the record, never mutate
    expect(Object.isFrozen(CANVAS_AXIS_LANES)).toBe(true);
  });
});
