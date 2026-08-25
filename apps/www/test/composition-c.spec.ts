/**
 * Batch C composition suite (test/composition-c.spec.ts, 2026-08-25).
 * The composition-first locks for menubar + navigation-menu +
 * toggle-group and the dropdown-menu nested-walker drive-by:
 *
 *   - ID protocol: trigger aria-controls resolves to the LIVE panel
 *     (derived `${id}-panel`, present whether open or not)
 *   - nested-walker scoping: entries whose closest('[role=menu]') is
 *     the walking panel — nested families never leak
 *   - duplicate-id first-wins + no ghost handles on unmount
 *   - toggle-group value laws (single swaps/deselects, multiple stacks)
 *   - dropdown-menu scoping regression (the drive-by)
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import MenubarHost from './fixtures/composition-c-menubar.svelte';
import NavMenuHost from './fixtures/composition-c-navmenu.svelte';
import ToggleHost from './fixtures/composition-c-toggle.svelte';
import DupHost from './fixtures/composition-c-dup.svelte';
import GhostHost from './fixtures/composition-c-ghost.svelte';
import DropdownNestedHost from './fixtures/composition-c-dropdown-nested.svelte';

const raf = () => new Promise(requestAnimationFrame);

// ---------------------------------------------------------------------------
// ID protocol — aria-controls resolves to the live panel
// ---------------------------------------------------------------------------
describe('composition-c: menubar ID protocol', () => {
  it('every trigger aria-controls resolves to its role=menu popover=manual panel', () => {
    const { container } = render(MenubarHost);
    // the BAR's triggers only — the nested dropdown's own trigger also
    // carries aria-haspopup=menu but lives inside a [role=menu] panel
    const triggers = [...container.querySelectorAll('button[aria-haspopup="menu"]')].filter(
      (el) => el.closest('[role="menu"]') === null,
    );
    expect(triggers.length).toBe(2);
    for (const trigger of triggers) {
      const panelId = trigger.getAttribute('aria-controls')!;
      expect(panelId).toMatch(/-panel$/);
      const panel = document.getElementById(panelId);
      expect(panel).toBeTruthy();
      expect(panel!.getAttribute('role')).toBe('menu');
      expect(panel!.getAttribute('popover')).toBe('manual');
      // derived id pairing: `${itemId}-trigger` ↔ `${itemId}-panel`
      expect(panelId).toBe(`${trigger.id.replace(/-trigger$/, '')}-panel`);
    }
  });

  it('ArrowDown opens the panel and focuses its first scoped item; Escape restores the trigger', async () => {
    const { container } = render(MenubarHost);
    const trigger = container.querySelector('#file-trigger') as HTMLButtonElement;
    trigger.focus();
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    await raf();
    const first = container.querySelector('#file-panel [data-jx-menubar-menu-item]') as HTMLElement;
    expect(document.activeElement).toBe(first);

    await fireEvent.keyDown(first, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('composition-c: navigation-menu ID protocol', () => {
  it('trigger popovertarget === aria-controls === the live popover=auto panel id', () => {
    const { container } = render(NavMenuHost);
    const triggers = [...container.querySelectorAll('button[aria-haspopup="true"]')];
    expect(triggers.length).toBe(2);
    for (const trigger of triggers) {
      const panelId = trigger.getAttribute('popovertarget')!;
      expect(trigger.getAttribute('aria-controls')).toBe(panelId);
      const panel = document.getElementById(panelId);
      expect(panel).toBeTruthy();
      expect(panel!.getAttribute('popover')).toBe('auto');
      expect(panelId).toBe(`${trigger.id.replace(/-trigger$/, '')}-panel`);
    }
  });

  it('click opens through the declarative wire; aria-expanded mirrors the toggle seam', async () => {
    const { container } = render(NavMenuHost);
    const trigger = container.querySelector(
      'button[aria-current="true"]',
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!);
    expect(panel!.matches(':popover-open')).toBe(true);
    // Escape inside the panel closes it and hands focus back
    await fireEvent.keyDown(panel!, { key: 'Escape' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('one tab stop on the current section trigger; bare link composes in-bar', async () => {
    const { container } = render(NavMenuHost);
    await raf();
    const nav = container.querySelector('nav[data-jx-navmenu]')!;
    const triggers = [...nav.querySelectorAll('button[aria-haspopup="true"]')] as HTMLButtonElement[];
    const stops = triggers.filter((t) => t.tabIndex === 0);
    expect(stops.length).toBe(1);
    expect(stops[0]!.getAttribute('aria-current')).toBe('true');
    const link = nav.querySelector('a[data-jx-navmenu-link]') as HTMLAnchorElement;
    expect(link.textContent).toBe('docs');
    expect(link.getAttribute('aria-current')).toBeNull();
    expect(link.tabIndex).toBe(0); // a real link is always tabbable
  });

  it('ArrowRight walks the triggers', async () => {
    const { container } = render(NavMenuHost);
    await raf();
    const triggers = [...container.querySelectorAll('button[aria-haspopup="true"]')] as HTMLButtonElement[];
    triggers[0]!.focus();
    await fireEvent.keyDown(triggers[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(triggers[1]);
  });
});

// ---------------------------------------------------------------------------
// Nested-walker scoping — nested menu items never leak
// ---------------------------------------------------------------------------
describe('composition-c: nested-walker scoping', () => {
  it('menubar BAR walk skips menuitems inside panels (incl. the nested dropdown)', async () => {
    const { container } = render(MenubarHost);
    const file = container.querySelector('#file-trigger') as HTMLButtonElement;
    file.focus();
    // unscoped DOM order is [File, nested a, nested b, Edit] — the walk
    // must land on Edit, not a nested item
    await fireEvent.keyDown(file, { key: 'ArrowRight' });
    expect(document.activeElement?.textContent).toBe('Edit');
  });

  it('menubar PANEL walk wraps within its own items only', async () => {
    const { container } = render(MenubarHost);
    const file = container.querySelector('#file-trigger') as HTMLButtonElement;
    file.focus();
    await fireEvent.keyDown(file, { key: 'ArrowDown' });
    await raf();
    const items = [...container.querySelectorAll('#file-panel [data-jx-menubar-menu-item]')] as HTMLElement[];
    expect(items.length).toBe(3);
    // End lands on the LAST scoped item ("close"), never the nested ones
    await fireEvent.keyDown(items[0], { key: 'End' });
    expect(document.activeElement).toBe(items[2]);
    // ArrowDown from the last scoped item wraps to the first — an
    // unscoped walk would step into the nested dropdown's items
    await fireEvent.keyDown(items[2], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[0]);
  });

  it('dropdown-menu drive-by: the walk never enters a nested [role=menu]', async () => {
    const { container } = render(DropdownNestedHost);
    const trigger = container.querySelector(
      'button[popovertarget="c-dd-nested"]',
    ) as HTMLButtonElement;
    await fireEvent.click(trigger);
    await raf();
    const panel = document.getElementById('c-dd-nested')!;
    const outer = [...panel.querySelectorAll('button[role="menuitem"]')].filter(
      (el) => el.closest('[role="menu"]') === panel,
    ) as HTMLElement[];
    expect(outer.length).toBe(2);
    expect(document.activeElement).toBe(outer[0]);
    await fireEvent.keyDown(panel, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(outer[1]);
    // from the last scoped item the walk WRAPS — it never visits the
    // nested submenu's items
    await fireEvent.keyDown(panel, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(outer[0]);
  });
});

// ---------------------------------------------------------------------------
// Duplicate-id first-wins + ghost handles
// ---------------------------------------------------------------------------
describe('composition-c: duplicate-id first-wins', () => {
  it('two panels under one derived id: only the FIRST ever opens', async () => {
    const { container } = render(DupHost);
    const triggers = [...container.querySelectorAll('button[aria-haspopup="menu"]')] as HTMLButtonElement[];
    const panels = document.querySelectorAll('[id="dup-panel"]');
    expect(panels.length).toBe(2);
    // clicking the SECOND trigger resolves the shared derived id — the
    // first registration's handles are the ones that fire
    await fireEvent.click(triggers[1]);
    expect(panels[0].hasAttribute('open')).toBe(true);
    expect(panels[1].hasAttribute('open')).toBe(false);
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
  });
});

describe('composition-c: no ghost handles', () => {
  it('a removed panel unregisters; aria-controls stays deterministic and clicks stay inert', async () => {
    const rendered = render(GhostHost, { props: { withPanel: true } });
    const trigger = rendered.container.querySelector('#solo-trigger') as HTMLButtonElement;
    await fireEvent.click(trigger);
    expect(document.getElementById('solo-panel')).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    await rendered.rerender({ withPanel: false });
    expect(document.getElementById('solo-panel')).toBeNull();
    // the derived wire survives panel absence (a trigger without a
    // panel is caller error, but the handle must be gone, not ghosted)
    expect(trigger.getAttribute('aria-controls')).toBe('solo-panel');
    await expect(fireEvent.click(trigger)).resolves.toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Toggle-group value laws
// ---------------------------------------------------------------------------
describe('composition-c: toggle-group value laws', () => {
  it('single: pressing swaps the value; pressing the active one deselects to empty', async () => {
    const onchange = vi.fn();
    const { container } = render(ToggleHost, { props: { onchange } });
    const buttons = [...container.querySelectorAll('button[aria-pressed]')] as HTMLButtonElement[];
    expect(buttons.length).toBe(3);

    await fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    expect(onchange).toHaveBeenLastCalledWith('bold');

    await fireEvent.click(buttons[1]);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(onchange).toHaveBeenLastCalledWith('italic');

    await fireEvent.click(buttons[1]);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    expect(onchange).toHaveBeenLastCalledWith('');
  });

  it('multiple: presses stack and un-press removes only its own value', async () => {
    const onchange = vi.fn();
    const { container } = render(ToggleHost, { props: { multiple: true, onchange } });
    const buttons = [...container.querySelectorAll('button[aria-pressed]')] as HTMLButtonElement[];

    await fireEvent.click(buttons[0]);
    await fireEvent.click(buttons[2]);
    expect(onchange).toHaveBeenLastCalledWith(['bold', 'underline']);
    expect(
      buttons.map((b) => b.getAttribute('aria-pressed') === 'true'),
    ).toEqual([true, false, true]);

    await fireEvent.click(buttons[0]);
    expect(onchange).toHaveBeenLastCalledWith(['underline']);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('the group landmark and the multivalue bridge payload', async () => {
    const single = render(ToggleHost);
    const group = single.container.querySelector('[role="group"]')!;
    expect(group.getAttribute('aria-label')).toBe('text style');
    const bridge = single.container.querySelector('jx-form-field')!;
    expect(bridge.hasAttribute('multivalue')).toBe(false);

    const multi = render(ToggleHost, { props: { multiple: true } });
    const mBridge = multi.container.querySelector('jx-form-field')!;
    expect(mBridge.hasAttribute('multivalue')).toBe(true);
    const buttons = [...multi.container.querySelectorAll('button[aria-pressed]')] as HTMLButtonElement[];
    await fireEvent.click(buttons[0]);
    await fireEvent.click(buttons[2]);
    expect(mBridge.getAttribute('value')).toBe('bold\nunderline');
  });
});
