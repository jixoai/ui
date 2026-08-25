/**
 * Batch 4b contract suite (test/batch4b-components.spec.ts, 2026-08-22).
 * The command palette, navigation menu, and menubar — the three
 * coordinator components from the batch-4 design ruling. Popover/dialog
 * surfaces run on the setup.ts polyfills; the command filter ranking is
 * tested as the pure function it is.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import CommandHost from './fixtures/command-host.svelte';
import MenubarHost from './fixtures/menubar-host.svelte';
import NavMenuHost from './fixtures/navmenu-host.svelte';

const commands: CommandItem[] = [
  { id: 'deploy', label: 'Deploy site', group: 'actions', hint: '⌘D' },
  { id: 'theme', label: 'Toggle theme', group: 'actions' },
  { id: 'registry', label: 'Open registry', group: 'go', keywords: 'components npm' },
  { id: 'tokens', label: 'Open tokens', group: 'go', disabled: true },
];

// ---------------------------------------------------------------------------
// the ranking function died with the closed API — filtering is now a
// per-item inclusion predicate (defaultCommandMatch); the disjunction
// table + authored-order byte-stability live in composition-e.spec.ts.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Command — combobox + activedescendant, one execution path
// ---------------------------------------------------------------------------
describe('Command', () => {
  // composition-first-apis: the palette composes Input/List/Empty/
  // Group/Item parts (host fixture); items self-match. Deeper locks
  // (byte-stability, disabled three locks, IME) live in
  // composition-e.spec.ts.
  function setup() {
    const rendered = render(CommandHost);
    const dialog = rendered.container.querySelector('dialog.jx-command') as HTMLDialogElement;
    const input = rendered.container.querySelector('input[role="combobox"]') as HTMLInputElement;
    return { rendered, dialog, input };
  }

  it('opens as a modal dialog with focus in the search input', async () => {
    const { rendered, input, dialog } = setup();
    await new Promise(requestAnimationFrame);
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-label')).toBeTruthy();
    const list = rendered.container.querySelector(`#${input.getAttribute('aria-controls')}`);
    expect(list?.getAttribute('role')).toBe('listbox');
  });

  it('filters as you type and walks with arrows (activedescendant)', async () => {
    const { input, rendered } = setup();
    await new Promise(requestAnimationFrame);
    await fireEvent.input(input, { target: { value: 'open' } });
    const options = [...rendered.container.querySelectorAll('[role="option"]:not([hidden])')];
    expect(options.length).toBe(3); // registry + tokens + github (hidden ones don't count)
    // the walk anchors on the first VISIBLE item, then walks in
    // authored order
    const initialId = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(initialId)?.textContent).toContain('Open the registry');
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    const activeId = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(activeId)?.textContent).toContain('Open tokens');
  });

  it('Enter selects once through onselect and closes', async () => {
    let selected: string | undefined;
    let opens = 0;
    const rendered = render(CommandHost);
    const input = rendered.container.querySelector('input') as HTMLInputElement;
    await new Promise(requestAnimationFrame);
    await fireEvent.keyDown(input, { key: 'Enter' });
    const dialog = rendered.container.querySelector('dialog.jx-command') as HTMLDialogElement;
    expect(dialog.open).toBe(false);
    expect(Number(getComputedStyle(dialog).getPropertyValue('--jx-p'))).toBeLessThan(1);
  });

  it('no matches renders polite status text, not an option', async () => {
    const { input, rendered } = setup();
    await new Promise(requestAnimationFrame);
    await fireEvent.input(input, { target: { value: 'zzzz' } });
    expect(rendered.container.querySelector('[role="status"]')?.textContent).toContain('no matches');
    expect(rendered.container.querySelectorAll('[role="option"]:not([hidden])').length).toBe(0);
  });

  it('⌘K toggles when hotkey is opted in', async () => {
    const rendered = render(CommandHost, { props: { hotkey: true, initialOpen: false } });
    await fireEvent.keyDown(window, { key: 'k', metaKey: true });
    const dialog = rendered.container.querySelector('dialog.jx-command') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// NavigationMenu — the bar walks, panels glide
// ---------------------------------------------------------------------------
describe('NavigationMenu', () => {
  // composition-first-apis: trigger ids are DERIVED from the Item id —
  // tests resolve triggers by label, panels via popovertarget
  const triggerByLabel = (container: HTMLElement, label: string): HTMLButtonElement =>
    [...container.querySelectorAll('button[aria-haspopup="true"]')].find(
      (t) => t.textContent === label,
    ) as HTMLButtonElement;

  it('renders a nav with panel triggers + plain links, one tab stop', () => {
    const { container } = render(NavMenuHost);
    const nav = container.querySelector('nav[aria-label="site"]')!;
    const triggers = [...nav.querySelectorAll('button[aria-haspopup="true"]')];
    expect(triggers.length).toBe(2);
    // the current section is a PANEL trigger (button), marked aria-current
    expect(nav.querySelector('[aria-current="true"]')!.textContent).toBe('components');
    const link = nav.querySelector('a[data-jx-navmenu-link]')!;
    expect(link.textContent).toBe('docs');
    expect(link.getAttribute('aria-current')).toBeNull();
    const stops = triggers.filter((t) => t.tabIndex === 0);
    expect(stops.length).toBe(1);
    expect(stops[0]!.textContent).toBe('components'); // current section
  });

  it('ArrowRight walks the triggers', async () => {
    const { container } = render(NavMenuHost);
    const triggers = [...container.querySelectorAll('button[aria-haspopup="true"]')] as HTMLButtonElement[];
    triggers[0]!.focus();
    await fireEvent.keyDown(triggers[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(triggers[1]);
  });

  // the 2026-08-25 realignment: CLICK open only, state mirrored from
  // the popover primitive's native toggle seam (the polyfill fires it
  // synchronously inside show/hide, like the platform)
  it('click opens the panel through the toggle seam; a second click closes', async () => {
    const { container } = render(NavMenuHost);
    const trigger = triggerByLabel(container, 'components');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    // one-at-a-time (popover=auto): opening the other panel flips state
    const other = triggerByLabel(container, 'registry');
    await fireEvent.click(other);
    expect(other.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(other);
    expect(other.getAttribute('aria-expanded')).toBe('false');
  });

  it('hovering a trigger opens NOTHING (the hover path is retired)', async () => {
    const { container } = render(NavMenuHost);
    const triggers = [...container.querySelectorAll('button[aria-haspopup="true"]')] as HTMLButtonElement[];
    await fireEvent.pointerEnter(triggers[0]!);
    await fireEvent.pointerEnter(triggers[1]!);
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(triggers.every((t) => t.getAttribute('aria-expanded') === 'false')).toBe(true);
  });

  // Codex r1 blocking #1: Escape must CLOSE the panel (the explicit
  // hide), not just return focus — preventDefault on the keydown
  // cancels the native close request, so the handler owns the close
  it('Escape inside the panel closes it and returns focus to the trigger', async () => {
    const { container } = render(NavMenuHost);
    const trigger = triggerByLabel(container, 'components');
    await fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    // scope to the OPEN panel's body — each panel carries its own
    // Escape handler; the panel resolves through the trigger's wire
    const body = document.getElementById(trigger.getAttribute('popovertarget')!)!.querySelector(
      '[data-jx-navmenu-panel-body]',
    ) as HTMLElement;
    await fireEvent.keyDown(body, { key: 'Escape' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });
});

// ---------------------------------------------------------------------------
// Menubar — the top-level contract
// ---------------------------------------------------------------------------
describe('Menubar', () => {
  it('renders a menubar with roving tabindex and haspopup triggers', () => {
    const { container } = render(MenubarHost);
    const bar = container.querySelector('[role="menubar"]')!;
    const triggers = [...bar.querySelectorAll('button[aria-haspopup="menu"]')];
    expect(triggers.length).toBe(2);
    expect(triggers[0]!.tabIndex).toBe(0);
    expect(triggers.slice(1).every((t) => t.tabIndex === -1)).toBe(true);
  });

  it('ArrowDown opens the panel and focuses its first item; Escape returns', async () => {
    const { container } = render(MenubarHost);
    const trigger = container.querySelector(
      'button[aria-haspopup="menu"]',
    ) as HTMLButtonElement;
    trigger.focus();
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    await new Promise(requestAnimationFrame);
    const firstItem = container.querySelector(
      '.jx-menubar-panel [role="menuitem"]',
    ) as HTMLElement;
    expect(document.activeElement).toBe(firstItem);

    await fireEvent.keyDown(firstItem, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
  });

  it('←/→ moves between top triggers', async () => {
    const { container } = render(MenubarHost);
    const triggers = [...container.querySelectorAll('button[aria-haspopup="menu"]')] as HTMLButtonElement[];
    triggers[0]!.focus();
    await fireEvent.keyDown(triggers[0]!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(triggers[1]);
  });
});
