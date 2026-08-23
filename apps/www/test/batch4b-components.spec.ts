/**
 * Batch 4b contract suite (test/batch4b-components.spec.ts, 2026-08-22).
 * The command palette, navigation menu, and menubar — the three
 * coordinator components from the batch-4 design ruling. Popover/dialog
 * surfaces run on the setup.ts polyfills; the command filter ranking is
 * tested as the pure function it is.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Command, { rankCommandItems, type CommandItem } from '../src/lib/ui/command.svelte';
import MenubarHost from './fixtures/menubar-host.svelte';
import NavMenuHost from './fixtures/navmenu-host.svelte';

const commands: CommandItem[] = [
  { id: 'deploy', label: 'Deploy site', group: 'actions', hint: '⌘D' },
  { id: 'theme', label: 'Toggle theme', group: 'actions' },
  { id: 'registry', label: 'Open registry', group: 'go', keywords: 'components npm' },
  { id: 'tokens', label: 'Open tokens', group: 'go', disabled: true },
];

// ---------------------------------------------------------------------------
// rankCommandItems — the pure ranking
// ---------------------------------------------------------------------------
describe('rankCommandItems', () => {
  it('ranks exact > startsWith > token > includes > keywords', () => {
    const pool: CommandItem[] = [
      { id: 'kw', label: 'mode', keywords: 'dark night' },
      { id: 'inc', label: 'toggle dark mode' },
      { id: 'tok', label: 'toggle dark' },
      { id: 'pre', label: 'dark theme' },
      { id: 'exact', label: 'dark' },
    ];
    const ranked = rankCommandItems(pool, 'dark');
    // ties (tok/inc both token-startsWith) fall back to input order
    expect(ranked.map((i) => i.id)).toEqual(['exact', 'pre', 'inc', 'tok', 'kw']);
  });

  it('empty query returns original order; case/whitespace fold', () => {
    expect(rankCommandItems(commands, '')).toEqual(commands);
    expect(rankCommandItems(commands, '  OPEN  ').map((i) => i.id)).toEqual(
      rankCommandItems(commands, 'open').map((i) => i.id),
    );
  });
});

// ---------------------------------------------------------------------------
// Command — combobox + activedescendant, one execution path
// ---------------------------------------------------------------------------
describe('Command', () => {
  function setup() {
    const rendered = render(Command, {
      props: { items: commands, hotkey: false, open: true },
    });
    const dialog = rendered.container.querySelector('dialog.jx-command') as HTMLDialogElement;
    const input = rendered.container.querySelector(
      'input[role="combobox"]',
    ) as HTMLInputElement;
    return { rendered, dialog, input };
  }

  it('opens as a modal dialog with focus in the search input', async () => {
    const { rendered, input, dialog } = setup();
    await new Promise(requestAnimationFrame);
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(input);
    // named combobox pointing at the REAL listbox node (uid-scoped id)
    expect(input.getAttribute('aria-label')).toBeTruthy();
    const list = rendered.container.querySelector(
      `#${input.getAttribute('aria-controls')}`,
    );
    expect(list?.getAttribute('role')).toBe('listbox');
  });

  it('filters as you type and walks with arrows (activedescendant)', async () => {
    const { input, rendered } = setup();
    await new Promise(requestAnimationFrame);
    await fireEvent.input(input, { target: { value: 'open' } });
    const options = [...rendered.container.querySelectorAll('[role="option"]')];
    expect(options.length).toBe(2); // registry + disabled tokens
    // disabled items render but are skipped by the walk
    expect(options[1]!.getAttribute('aria-disabled')).toBe('true');

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    const activeId = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(activeId)?.textContent).toContain('Open registry');
  });

  it('Enter selects once through onselect and closes', async () => {
    let selected: CommandItem | undefined;
    let opens = 0;
    const rendered = render(Command, {
      props: {
        items: commands,
        hotkey: false,
        open: true,
        onselect: (item) => (selected = item),
        onopenchange: (o) => (opens += o ? 1 : 0),
      },
    });
    const input = rendered.container.querySelector('input') as HTMLInputElement;
    await new Promise(requestAnimationFrame);
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(selected?.id).toBe('deploy'); // first enabled, exact-free query
    const dialog = rendered.container.querySelector('dialog.jx-command') as HTMLDialogElement;
    // Enter closes through the shared declarative timeline (r29):
    // dialog.close() fires immediately — the allow-discrete display
    // window holds the exit while --jx-p runs 1→0
    expect(dialog.open).toBe(false);
    expect(Number(getComputedStyle(dialog).getPropertyValue('--jx-p'))).toBeLessThan(1);
  });

  it('no matches renders polite status text, not an option', async () => {
    const { input, rendered } = setup();
    await new Promise(requestAnimationFrame);
    await fireEvent.input(input, { target: { value: 'zzzz' } });
    expect(rendered.container.querySelector('[role="status"]')?.textContent).toContain(
      'no matches',
    );
    expect(rendered.container.querySelectorAll('[role="option"]').length).toBe(0);
  });

  it('⌘K toggles when hotkey is opted in', async () => {
    const rendered = render(Command, { props: { items: commands, hotkey: true } });
    await fireEvent.keyDown(window, { key: 'k', metaKey: true });
    const dialog = rendered.container.querySelector('dialog.jx-command') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// NavigationMenu — the bar walks, panels glide
// ---------------------------------------------------------------------------
describe('NavigationMenu', () => {
  it('renders a nav with panel triggers + plain links, one tab stop', () => {
    const { container } = render(NavMenuHost);
    const nav = container.querySelector('nav[aria-label="site"]')!;
    const triggers = [...nav.querySelectorAll('button[aria-haspopup="true"]')];
    expect(triggers.length).toBe(2);
    // the current section is a PANEL trigger (button), marked aria-current
    expect(nav.querySelector('[aria-current="true"]')!.textContent).toBe('components');
    const link = nav.querySelector('a.jx-navmenu-link')!;
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
