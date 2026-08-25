/**
 * composition-e (composition-first-apis, Batch E, 2026-08-25): the
 * command family's composition locks —
 *   1. authored-order byte-stability under any custom predicate;
 *   2. the disabled three locks (never walk / never activedescendant /
 *      never fire on Enter);
 *   3. the CSS :has group-self-hide + empty-reveal states (DOM state
 *      via matches() — jsdom's nwsapi resolves :has — plus the css
 *      source laws themselves);
 *   4. the IME composition guard;
 *   5. the default match disjunction table.
 * The old closed-API suite (batch4b-components.spec.ts) still targets
 * items[]/rankCommandItems and is the integrator's rewrite — reported,
 * not patched here.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

import CommandHost from './fixtures/command-host.svelte';
import {
  COMMAND_WALK_SELECTOR,
  defaultCommandMatch,
  type CommandMatch,
} from '../src/lib/ui/command/command.svelte';

// the css source laws are asserted textually — vitest's css pipeline
// stubs ?raw stylesheets, so read the mirror copy straight from disk
const commandCss = readFileSync('src/lib/ui/command/command.css', 'utf8');

const AUTHORED_ORDER = [
  'Run the audit',
  'Deploy site',
  'Toggle theme',
  'Open the registry',
  'Open tokens',
  'Open GitHub',
];

function setup(props: {
  match?: CommandMatch;
  onselect?: (label: string) => void;
  closeOnSelect?: boolean;
  hotkey?: boolean;
} = {}) {
  const rendered = render(CommandHost, { props });
  const dialog = rendered.container.querySelector('dialog.jx-command') as HTMLDialogElement;
  const input = rendered.container.querySelector('input[role="combobox"]') as HTMLInputElement;
  const options = () =>
    [...rendered.container.querySelectorAll('[role="option"]')] as HTMLElement[];
  const visible = () => options().filter((option) => !option.hasAttribute('hidden'));
  // the accessible name: aria-label when authored children exist,
  // content (= label) when they do not
  const names = (els: HTMLElement[]) =>
    els.map((el) => el.getAttribute('aria-label') ?? el.textContent?.trim() ?? '');
  const active = () => input.getAttribute('aria-activedescendant');
  return { rendered, dialog, input, options, visible, names, active };
}

const tick = () => new Promise(requestAnimationFrame);

// ---------------------------------------------------------------------------
// the dialog shell (behavior preserved verbatim)
// ---------------------------------------------------------------------------
describe('Command — the dialog shell', () => {
  it('opens modal with focus in the input; the combobox wires to the real listbox', async () => {
    const { rendered, dialog, input, active } = setup();
    await tick();
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(input);
    const list = rendered.container.querySelector(`#${input.getAttribute('aria-controls')}`);
    expect(list?.getAttribute('role')).toBe('listbox');
    // the open anchor: first WALKABLE option (the disabled first item is skipped)
    expect(document.getElementById(active()!)?.getAttribute('role')).toBe('option');
    expect(document.getElementById(active()!)?.textContent).toContain('Deploy site');
  });

  it('⌘K toggles only when the hotkey is opted in', async () => {
    const { dialog } = setup({ hotkey: true });
    await tick();
    expect(dialog.open).toBe(true);
    await fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(dialog.open).toBe(false);
    await fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(dialog.open).toBe(true);
  });

  it('Enter fires the item onselect once and closes through the timeline', async () => {
    const onselect = vi.fn();
    const { dialog, input } = setup({ onselect });
    await tick();
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(onselect).toHaveBeenCalledTimes(1);
    expect(onselect).toHaveBeenCalledWith('Deploy site');
    expect(dialog.open).toBe(false);
    expect(Number(getComputedStyle(dialog).getPropertyValue('--jx-p'))).toBeLessThan(1);
  });

  it('closeOnSelect={false} keeps the palette open for batch actions', async () => {
    const onselect = vi.fn();
    const { dialog, input } = setup({ onselect, closeOnSelect: false });
    await tick();
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(onselect).toHaveBeenCalledWith('Deploy site');
    expect(dialog.open).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// lock 1 — authored order is byte-stable under any custom predicate
// ---------------------------------------------------------------------------
describe('Command — the predicate may only answer inclusion', () => {
  it('a permissive predicate keeps the authored tree order exactly (byte-stable)', async () => {
    const { input, visible, names } = setup({ match: () => true });
    await tick();
    await fireEvent.input(input, { target: { value: 'zzz-irrelevant' } });
    expect(names(visible())).toEqual(AUTHORED_ORDER);
  });

  it('an including predicate yields the authored SUBSEQUENCE, never reordered', async () => {
    const { input, visible, names } = setup({
      match: (item, query) => query !== '' && item.label.toLowerCase().startsWith('open'),
    });
    await tick();
    await fireEvent.input(input, { target: { value: 'o' } });
    expect(names(visible())).toEqual(['Open the registry', 'Open tokens', 'Open GitHub']);
  });

  it('the walk follows the filtered tree order and wraps cross-group', async () => {
    const { input, active } = setup();
    await tick();
    await fireEvent.input(input, { target: { value: 'open' } });
    await fireEvent.keyDown(input, { key: 'Home' });
    expect(document.getElementById(active()!)!.textContent).toContain('Open the registry');
    await fireEvent.keyDown(input, { key: 'ArrowUp' });
    // wrap: up from the first visible lands on the LAST visible
    expect(document.getElementById(active()!)!.textContent).toContain('Open GitHub');
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(document.getElementById(active()!)!.textContent).toContain('Open the registry');
  });
});

// ---------------------------------------------------------------------------
// locks 2+3 — disabled items never walk, never become
// activedescendant, never fire onselect on Enter
// ---------------------------------------------------------------------------
describe('Command — the disabled three locks', () => {
  it('never enter the walk: ↑/↓ and Home/End skip them', async () => {
    const { input, options, active } = setup();
    await tick();
    const disabledIds = options()
      .filter((option) => option.getAttribute('aria-disabled') === 'true')
      .map((option) => option.id);
    expect(disabledIds.length).toBe(1);
    // walk the full cycle twice — every step lands on a walkable option
    for (let step = 0; step < AUTHORED_ORDER.length * 2; step++) {
      await fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(disabledIds).not.toContain(active());
    }
    await fireEvent.keyDown(input, { key: 'End' });
    expect(document.getElementById(active()!)!.textContent).toContain('Open GitHub');
    await fireEvent.keyDown(input, { key: 'Home' });
    expect(document.getElementById(active()!)!.textContent).toContain('Deploy site');
  });

  it('never become activedescendant via pointer, never fire onselect on click', async () => {
    const onselect = vi.fn();
    const { input, options, dialog } = setup({ onselect });
    await tick();
    const disabled = options().find((option) => option.getAttribute('aria-disabled') === 'true')!;
    await fireEvent.pointerEnter(disabled);
    expect(input.getAttribute('aria-activedescendant')).not.toBe(disabled.id);
    await fireEvent.click(disabled);
    expect(onselect).not.toHaveBeenCalled();
    expect(dialog.open).toBe(true);
  });

  it('never fire onselect on Enter — a query leaving only the disabled item visible is a no-op', async () => {
    const onselect = vi.fn();
    const { input, dialog } = setup({ onselect });
    await tick();
    await fireEvent.input(input, { target: { value: 'run the' } });
    await tick();
    // only the disabled option is visible → no walkable option → no anchor
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(onselect).not.toHaveBeenCalled();
    expect(dialog.open).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// the CSS :has laws — group self-hide + empty reveal
// ---------------------------------------------------------------------------
describe('Command — the CSS :has laws', () => {
  it('an emptied group carries hidden on every option and matches the self-hide state', async () => {
    const { rendered, input } = setup();
    await tick();
    await fireEvent.input(input, { target: { value: 'open' } });
    const groups = [...rendered.container.querySelectorAll('[data-jx-command-group]')] as HTMLElement[];
    const [actions, go] = groups;
    expect(
      [...actions.querySelectorAll('[role="option"]')].every((option) =>
        option.hasAttribute('hidden'),
      ),
    ).toBe(true);
    expect(go.querySelector('[role="option"]:not([hidden])')).toBeTruthy();
    // the exact CSS state the component css keys on (nwsapi resolves :has)
    expect(
      actions.matches('[data-jx-command-group]:not(:has([role="option"]:not([hidden])))'),
    ).toBe(true);
    expect(
      go.matches('[data-jx-command-group]:not(:has([role="option"]:not([hidden])))'),
    ).toBe(false);
  });

  it('the empty node is statically present; the reveal state flips with visibility', async () => {
    const { rendered, input } = setup();
    await tick();
    const list = rendered.container.querySelector('[data-jx-command-list]') as HTMLElement;
    expect(rendered.container.querySelector('[data-jx-command-empty]')).toBeTruthy();
    expect(
      list.matches('[data-jx-command-list]:not(:has([role="option"]:not([hidden])))'),
    ).toBe(false);
    await fireEvent.input(input, { target: { value: 'zzzz' } });
    expect(
      list.matches('[data-jx-command-list]:not(:has([role="option"]:not([hidden])))'),
    ).toBe(true);
  });

  it('the css carries the :has laws under @supports with the documented degraded fallback', () => {
    expect(commandCss).toContain('@supports selector(:has(*))');
    expect(commandCss).toContain('[data-jx-command-group]:not(:has([role=option]:not([hidden])))');
    expect(commandCss).toContain('[data-jx-command-list]:not(:has([role=option]:not([hidden])))');
    expect(commandCss).toContain('[data-jx-command-empty]');
    // the hidden-attribute restore (the option's display utilities sit
    // above the UA sheet — the visibility channel must not lose)
    expect(commandCss).toContain('[data-jx-command-item][hidden]');
  });
});

// ---------------------------------------------------------------------------
// the IME composition guard
// ---------------------------------------------------------------------------
describe('Command — the IME composition guard', () => {
  it('keys during composition are ignored; the walk and Enter resume after compositionend', async () => {
    const onselect = vi.fn();
    const { input, active, dialog } = setup({ onselect });
    await tick();
    const before = active();
    await fireEvent.compositionStart(input);
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(active()).toBe(before); // composing → no move, no activation
    expect(onselect).not.toHaveBeenCalled();
    expect(dialog.open).toBe(true);
    await fireEvent.compositionEnd(input);
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(active()).not.toBe(before); // resumed
  });
});

// ---------------------------------------------------------------------------
// the default match disjunction table (pure function)
// ---------------------------------------------------------------------------
describe('defaultCommandMatch — the disjunction table', () => {
  it('label equals · startsWith · token startsWith · includes · keywords includes', () => {
    expect(defaultCommandMatch({ label: 'dark' }, 'dark')).toBe(true); // equals
    expect(defaultCommandMatch({ label: 'dark theme' }, 'dar')).toBe(true); // startsWith
    expect(defaultCommandMatch({ label: 'toggle dark mode' }, 'dar')).toBe(true); // token
    expect(defaultCommandMatch({ label: 'toggle dark mode' }, 'ark')).toBe(true); // includes
    expect(defaultCommandMatch({ label: 'mode', keywords: 'dark night' }, 'night')).toBe(true); // keywords
    expect(defaultCommandMatch({ label: 'mode' }, 'dark')).toBe(false); // nothing matches
    expect(defaultCommandMatch({ label: 'Deploy site' }, 'zzz')).toBe(false);
  });

  it('empty or whitespace-only query includes everything', () => {
    expect(defaultCommandMatch({ label: 'anything' }, '')).toBe(true);
    expect(defaultCommandMatch({ label: 'anything' }, '   ')).toBe(true);
  });

  it('case-insensitive + whitespace-collapsed query normalization', () => {
    expect(defaultCommandMatch({ label: 'Deploy site' }, '  DEPLOY  ')).toBe(true);
    expect(defaultCommandMatch({ label: 'toggle dark mode' }, 'Toggle  Dark')).toBe(true);
  });

  it('the walk selector is the frozen law', () => {
    expect(COMMAND_WALK_SELECTOR).toBe("[role=option]:not([hidden]):not([aria-disabled='true'])");
  });
});
