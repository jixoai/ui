/**
 * Form family contract suite (test/form-components.spec.ts, 2026-08-20).
 *
 * Six components × (behaviour + boundary + safety), rendered straight from
 * the same-source copies the site consumes ($lib/ui). The Popover-API
 * surface (popovertarget, toggle events, :popover-open) is jsdom-polyfilled
 * in test/setup.ts; everything else runs on the real component code.
 *
 * Assertion law: state is read back through the DOM the way a user or a
 * form sees it (input.value, trigger text, chips, FormData) — never through
 * component internals.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';

import Checkbox from '../src/lib/ui/checkbox/checkbox.svelte';
import Combobox from '../src/lib/ui/combobox/combobox.svelte';
import DatePicker from '../src/lib/ui/date-picker/date-picker.svelte';
import NumberInput from '../src/lib/ui/number-input/number-input.svelte';
import Radio from '../src/lib/ui/radio/radio.svelte';
import Range from '../src/lib/ui/range/range.svelte';
import Select from '../src/lib/ui/select/select.svelte';
import TagsInput from '../src/lib/ui/tags-input/tags-input.svelte';
import Toggle from '../src/lib/ui/toggle/toggle.svelte';
import type { Tag } from '../src/lib/ui/tags-input/tags-input.svelte';
import type { FormField } from '../src/lib/form-field';

/** collect name/value pairs the way a submit would — WITHOUT moving the
 *  controls out of their component DOM (a detached input loses its label
 *  wiring), so the form snapshot is restored right after reading it */
function formDataOf(...controls: Element[]): FormData {
  const form = document.createElement('form');
  const anchors = controls.map((control) => ({
    parent: control.parentNode as Node,
    next: control.nextSibling,
  }));
  for (const control of controls) form.appendChild(control);
  const data = new FormData(form);
  for (const [i, control] of controls.entries()) {
    anchors[i].parent.insertBefore(control, anchors[i].next);
  }
  return data;
}

// ---------------------------------------------------------------------------
// NumberInput — the [- NUM +] stepper
// ---------------------------------------------------------------------------
describe('NumberInput', () => {
  it('steps and clamps into [min, max] from buttons and typing', async () => {
    const { container } = render(NumberInput, {
      props: { value: 15, min: 1, max: 16, label: 'workers' },
    });
    const input = container.querySelector('input[type="number"]')!;
    const minus = container.querySelector<HTMLButtonElement>('.jx-num-minus')!;
    const plus = container.querySelector<HTMLButtonElement>('.jx-num-plus')!;

    // normal step up lands exactly on the max
    await fireEvent.pointerDown(plus);
    expect(input.value).toBe('16');
    await fireEvent.pointerUp(window);

    // stepping past the max clamps — never exceeds the boundary
    await fireEvent.pointerDown(plus);
    expect(input.value).toBe('16');
    await fireEvent.pointerUp(window);

    // stepping below the min clamps the other way
    await fireEvent.pointerDown(minus);
    await fireEvent.pointerUp(window);
    await fireEvent.pointerDown(minus);
    await fireEvent.pointerUp(window);
    expect(input.value).toBe('14');

    // direct typing commits on change and clamps too (99 → 16)
    await fireEvent.change(input, { target: { value: '99' } });
    expect(input.value).toBe('16');
    await fireEvent.change(input, { target: { value: '0' } });
    expect(input.value).toBe('1');
  });

  it('commits empty typing as undefined, not NaN or 0', async () => {
    const { container } = render(NumberInput, { props: { value: 5, min: 1, max: 10 } });
    const input = container.querySelector('input[type="number"]')!;
    await fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');
  });

  it('disabled blocks every stepping path: buttons disabled, input readonly, guards hold', async () => {
    const { container } = render(NumberInput, {
      props: { value: 5, min: 0, max: 10, disabled: true },
    });
    const input = container.querySelector('input[type="number"]')!;
    const minus = container.querySelector<HTMLButtonElement>('.jx-num-minus')!;
    const plus = container.querySelector<HTMLButtonElement>('.jx-num-plus')!;

    // the buttons carry disabled; the input turns READONLY (stays readable
    // for AT) — the component's documented disabled contract
    expect(minus.disabled).toBe(true);
    expect(plus.disabled).toBe(true);
    expect(input.hasAttribute('readonly')).toBe(true);
    expect(input.disabled).toBe(false);

    // pointer paths are guarded even where jsdom dispatches onto disabled
    // buttons anyway (engines differ — the guard is the safety net)
    await fireEvent.pointerDown(plus);
    await fireEvent.pointerUp(window);
    await fireEvent.pointerDown(minus);
    await fireEvent.pointerUp(window);
    expect(input.value).toBe('5');

    // a change that leaks through a readonly field reverts to committed
    await fireEvent.change(input, { target: { value: '9' } });
    expect(input.value).toBe('5');
  });

  it('press-and-hold accelerates and unmount clears every timer', async () => {
    vi.useFakeTimers();
    try {
      const { container, unmount } = render(NumberInput, {
        props: { value: 0, min: 0, max: 1000 },
      });
      const input = container.querySelector('input[type="number"]')!;
      const plus = container.querySelector<HTMLButtonElement>('.jx-num-plus')!;

      // immediate step on press, 300ms delay, then one step every 100ms
      await fireEvent.pointerDown(plus);
      expect(input.value).toBe('1');
      await vi.advanceTimersByTimeAsync(300 + 3 * 100);
      expect(input.value).toBe('4');

      // unmount mid-hold: the teardown effect must clear delay + interval
      unmount();
      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(2000);
      // the detached input is no longer driven by any leaked interval
      expect(input.value).toBe('4');
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// Select — the popover listbox
// ---------------------------------------------------------------------------
describe('Select', () => {
  const options = [
    { value: 'svelte', label: 'Svelte' },
    { value: 'node', label: 'Node' },
    { value: 'bun', label: 'Bun' },
  ];

  function setup(extraProps: Record<string, unknown> = {}) {
    const rendered = render(Select, { props: { options, value: 'svelte', ...extraProps } });
    const trigger = rendered.container.querySelector<HTMLButtonElement>(
      'button[popovertarget]'
    )!;
    const panelId = trigger.getAttribute('popovertarget')!;
    const panel = () => document.getElementById(panelId)!;
    const list = () => panel().querySelector('[role="listbox"]')!;
    return { ...rendered, trigger, panel, list };
  }

  it('clicking an option commits the value and closes the panel', async () => {
    const { trigger, panel } = setup();
    await fireEvent.click(trigger); // popovertarget opens the panel
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    await fireEvent.click(panel().querySelector('[role="option"][id$="-opt-2"]')!);
    expect(trigger.textContent).toContain('Bun');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel().hasAttribute('open')).toBe(false);
  });

  it('↑/↓ move the roving highlight (aria-activedescendant) and Enter commits', async () => {
    const { trigger, list } = setup();
    // native-select muscle memory: ArrowDown on the closed trigger opens it
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    // fresh-open highlight continues from the selected row (svelte = opt-0)
    expect(list().getAttribute('aria-activedescendant')).toMatch(/-opt-0$/);

    await fireEvent.keyDown(list(), { key: 'ArrowDown' });
    expect(list().getAttribute('aria-activedescendant')).toMatch(/-opt-1$/);

    // the highlighted row exists and is the option Enter will commit
    const activeId = list().getAttribute('aria-activedescendant')!;
    expect(document.getElementById(activeId)?.textContent).toContain('Node');

    await fireEvent.keyDown(list(), { key: 'Enter' });
    expect(trigger.textContent).toContain('Node');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('a disabled option is skipped by keyboard and refuses click selection', async () => {
    const withDisabled = [
      { value: 'svelte', label: 'Svelte' },
      { value: 'node', label: 'Node', disabled: true },
      { value: 'bun', label: 'Bun' },
    ];
    const rendered = render(Select, { props: { options: withDisabled, value: 'svelte' } });
    const trigger = rendered.container.querySelector<HTMLButtonElement>(
      'button[popovertarget]'
    )!;
    const panel = () => document.getElementById(trigger.getAttribute('popovertarget')!)!;

    await fireEvent.click(trigger);
    const disabledRow = panel().querySelector('[aria-disabled="true"]')!;
    expect(disabledRow.textContent).toContain('Node');

    // click on the disabled row: neither selects nor closes
    await fireEvent.click(disabledRow);
    expect(trigger.textContent).toContain('Svelte');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    // keyboard: ArrowDown skips straight past it (opt-0 → opt-2)
    const list = panel().querySelector('[role="listbox"]')!;
    expect(list.getAttribute('aria-activedescendant')).toMatch(/-opt-0$/);
    await fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(list.getAttribute('aria-activedescendant')).toMatch(/-opt-2$/);
  });
});

// ---------------------------------------------------------------------------
// Checkbox / Radio / Toggle — the pure-CSS selectors
// ---------------------------------------------------------------------------
describe('Checkbox / Radio / Toggle', () => {
  it('checkbox toggles via its own control and via the label', async () => {
    const { container } = render(Checkbox, {
      props: { label: 'subscribe', name: 'subscribe', value: 'yes' },
    });
    const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    const label = container.querySelector('label')!;

    expect(label.getAttribute('for')).toBe(input.id); // label[for] wiring
    expect(input.checked).toBe(false);

    await fireEvent.click(input);
    expect(input.checked).toBe(true);
    await fireEvent.click(input);
    expect(input.checked).toBe(false);

    // label activation reaches the control (the whole row is clickable)
    await fireEvent.click(label);
    expect(input.checked).toBe(true);
  });

  it('radio groups commit exactly the checked member into FormData', async () => {
    const free = render(Radio, { props: { label: 'free', name: 'plan', value: 'free' } });
    const pro = render(Radio, { props: { label: 'pro', name: 'plan', value: 'pro' } });
    const freeInput = free.container.querySelector<HTMLInputElement>('input[type="radio"]')!;
    const proInput = pro.container.querySelector<HTMLInputElement>('input[type="radio"]')!;

    expect(formDataOf(freeInput, proInput).get('plan')).toBeNull();

    await fireEvent.click(proInput);
    expect(proInput.checked).toBe(true);
    expect(freeInput.checked).toBe(false);
    expect(formDataOf(freeInput, proInput).get('plan')).toBe('pro');

    await fireEvent.click(freeInput);
    expect(formDataOf(freeInput, proInput).get('plan')).toBe('free');
  });

  it('toggle flips from the label row and submits its checked pair', async () => {
    const { container } = render(Toggle, {
      props: { label: 'notifications', name: 'notifications' },
    });
    const label = container.querySelector('label')!;
    const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;

    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.checked).toBe(false);

    await fireEvent.click(label); // label activation toggles the hidden input
    expect(input.checked).toBe(true);
    expect(formDataOf(input).get('notifications')).toBe('on');

    await fireEvent.click(label);
    expect(input.checked).toBe(false);
    expect(formDataOf(input).get('notifications')).toBeNull();
  });

  it('disabled renders the platform contract on all three controls', async () => {
    const checkbox = render(Checkbox, { props: { label: 'cb', disabled: true } });
    const radio = render(Radio, { props: { label: 'r', disabled: true } });
    const toggle = render(Toggle, { props: { label: 't', disabled: true } });

    const checkboxInput = checkbox.container.querySelector('input')!;
    const radioInput = radio.container.querySelector('input')!;
    const toggleInput = toggle.container.querySelector('input')!;

    // the native disabled attribute is THE interaction contract (browsers
    // block activation on it); the toggle additionally dims its row
    expect(checkboxInput.disabled).toBe(true);
    expect(radioInput.disabled).toBe(true);
    expect(toggleInput.disabled).toBe(true);
    expect(toggle.container.querySelector('label')!.className).toContain('jx-toggle-disabled');
  });

  it('checkbox submits its value pair only while checked (FormData law)', async () => {
    const { container } = render(Checkbox, {
      props: { label: 'consent', name: 'consent', value: 'agreed', checked: true },
    });
    const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    expect(input.checked).toBe(true);
    expect(formDataOf(input).get('consent')).toBe('agreed');

    await fireEvent.click(input);
    expect(formDataOf(input).get('consent')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Combobox — the searchable select
// ---------------------------------------------------------------------------
describe('Combobox', () => {
  const options = [
    { value: 'svelte', label: 'Svelte', description: 'runes' },
    { value: 'node', label: 'Node' },
    { value: 'bun', label: 'Bun' },
  ];

  function setup(extraProps: Record<string, unknown> = {}) {
    const rendered = render(Combobox, { props: { options, ...extraProps } });
    const input = rendered.container.querySelector<HTMLInputElement>(
      'input[role="combobox"]'
    )!;
    const panelId = input.getAttribute('aria-controls')!.replace('-listbox', '-panel');
    const panel = () => document.getElementById(panelId)!;
    return { ...rendered, input, panel };
  }

  it('typing filters options by label (case-insensitive contains)', async () => {
    const { input, panel } = setup();
    await fireEvent.focus(input); // fresh-open like the component does
    await fireEvent.input(input, { target: { value: 'UN' } });

    const rows = panel().querySelectorAll('[role="option"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Bun');

    // filtering auto-highlights the first match for aria-activedescendant
    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-0$/);
    const activeId = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(activeId)?.textContent).toContain('Bun');
  });

  it('Enter commits the highlighted option; the display follows the commit', async () => {
    const { input } = setup({ value: 'node' });
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'bu' } });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('Bun');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('allowCustom commits unmatched text as the value', async () => {
    const { input, panel } = setup({ allowCustom: true });
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'deno fresh' } });

    // the no-match affordance row is offered
    expect(panel().textContent).toContain('Use “deno fresh”');

    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('deno fresh');
  });

  it('without allowCustom, no match shows "No results" and never commits', async () => {
    const { input, panel } = setup({ allowCustom: false });
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'zzz' } });

    expect(panel().querySelector('.jx-combobox-empty')?.textContent).toContain(
      'No results for “zzz”'
    );

    await fireEvent.keyDown(input, { key: 'Enter' });
    await fireEvent.focusOut(input); // blur reverts the display
    expect(input.value).toBe('');
  });
});

// ---------------------------------------------------------------------------
// TagsInput — input × multiselect
// ---------------------------------------------------------------------------
describe('TagsInput', () => {
  it('Enter commits the typed text as a tag chip', async () => {
    const { container } = render(TagsInput, { props: { label: 'stack' } });
    const input = container.querySelector('input')!;
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'react' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    const chips = container.querySelectorAll('.jx-tags-tag');
    expect(chips.length).toBe(1);
    expect(chips[0].textContent).toContain('react');
    expect(input.value).toBe(''); // the input resets after a commit
  });

  it('Backspace on the empty input deletes the last tag', async () => {
    const { container } = render(TagsInput, {
      props: { tags: [{ value: 'svelte' }, { value: 'node' }] as Tag[] },
    });
    const input = container.querySelector('input')!;
    await fireEvent.focus(input);
    await fireEvent.keyDown(input, { key: 'Backspace' });

    const chips = container.querySelectorAll('.jx-tags-tag');
    expect(chips.length).toBe(1);
    expect(chips[0].textContent).toContain('svelte');
  });

  it('maxTags caps the set: input hides and "N/N tags" shows', async () => {
    const { container } = render(TagsInput, {
      props: { tags: [{ value: 'svelte' }] as Tag[], maxTags: 2 },
    });
    const input = container.querySelector('input')!;
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'node' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(container.querySelectorAll('.jx-tags-tag').length).toBe(2);
    expect(container.querySelector('input')).toBeNull(); // input hidden at cap
    expect(container.querySelector('.jx-tags-full')?.textContent).toBe('2/2 tags');

    // the cap also blocks programmatic commits through the entry guard
    await fireEvent.keyDown(container.querySelector('.jx-tags-full')!, { key: 'Enter' });
    expect(container.querySelectorAll('.jx-tags-tag').length).toBe(2);
  });

  it('a duplicate flashes the existing chip instead of adding one', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { container } = render(TagsInput, {
        props: { tags: [{ value: 'react' }] as Tag[] },
      });
      const input = container.querySelector('input')!;
      await fireEvent.focus(input);
      await fireEvent.input(input, { target: { value: 'react' } });
      await fireEvent.keyDown(input, { key: 'Enter' });

      const chips = container.querySelectorAll('.jx-tags-tag');
      expect(chips.length).toBe(1); // NOT added
      expect(chips[0].classList.contains('jx-tags-flash')).toBe(true); // flashes

      await vi.advanceTimersByTimeAsync(250); // flash self-clears
      expect(chips[0].classList.contains('jx-tags-flash')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// DatePicker — the calendar popover
// ---------------------------------------------------------------------------
describe('DatePicker', () => {
  // Fixed clock: the component derives "today" at instantiation; tests
  // pin it so month navigation and bounds are deterministic.
  const NOW = new Date(2026, 7, 20, 12, 0, 0); // 2026-08-20 local

  function setup(extraProps: Record<string, unknown> = {}) {
    const rendered = render(DatePicker, { props: { label: 'deploy date', ...extraProps } });
    const trigger = rendered.container.querySelector<HTMLButtonElement>(
      'button.jx-date-trigger'
    )!;
    const cell = (iso: string) => document.getElementById(`${trigger.id}-d-${iso}`)!;
    const open = async () => {
      await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    };
    return { ...rendered, trigger, cell, open };
  }

  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('single mode commits an ISO "YYYY-MM-DD" value', async () => {
    const { trigger, cell, open } = setup();
    await open();
    await fireEvent.click(cell('2026-08-25'));

    expect(trigger.textContent).toContain('2026-08-25');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('min/max disable out-of-bounds days: aria-disabled, unclickable', async () => {
    const { trigger, cell, open } = setup({ min: '2026-08-10', max: '2026-08-20' });
    await open();

    const before = cell('2026-08-05');
    expect(before.getAttribute('aria-disabled')).toBe('true');
    expect(before.className).toContain('jx-date-off');

    await fireEvent.click(before); // refused: no commit
    expect(trigger.textContent).not.toContain('2026-08-05');
    expect(trigger.getAttribute('aria-expanded')).toBe('true'); // panel stays

    await fireEvent.click(cell('2026-08-15')); // in-bounds commits
    expect(trigger.textContent).toContain('2026-08-15');
  });

  it('range mode swaps when the end lands before the start', async () => {
    const { trigger, cell, open } = setup({ mode: 'range' });
    await open();

    await fireEvent.click(cell('2026-08-25')); // anchor
    expect(trigger.textContent).toContain('2026-08-25 → …');

    await fireEvent.click(cell('2026-08-10')); // backwards → swap
    expect(trigger.textContent).toContain('2026-08-10 → 2026-08-25');
    expect(trigger.textContent.indexOf('2026-08-10')).toBeLessThan(
      trigger.textContent.indexOf('2026-08-25')
    );
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// FormField bridge — ElementInternals form association
// (registry/files/lib/form-field.ts, the faceless <jx-form-field> element)
// ---------------------------------------------------------------------------
describe('FormField bridge', () => {
  const selectOptions = [
    { value: 'svelte', label: 'Svelte' },
    { value: 'node', label: 'Node' },
    { value: 'bun', label: 'Bun' },
  ];

  it('Select contributes its committed value (not the label) to FormData', async () => {
    const { container } = render(Select, {
      props: { options: selectOptions, value: 'svelte', name: 'runtime' },
    });
    const trigger = container.querySelector<HTMLButtonElement>('button[popovertarget]')!;
    const bridge = container.querySelector<HTMLElement>('jx-form-field')!;

    // the bridge is faceless: no box of its own
    expect(bridge.style.display).toBe('contents');
    expect(formDataOf(bridge).get('runtime')).toBe('svelte');

    // committing through the panel re-syncs the bridge contribution
    await fireEvent.click(trigger);
    await fireEvent.click(document.getElementById(`${trigger.id}-opt-2`)!);
    expect(trigger.textContent).toContain('Bun'); // the label is display-only
    expect(formDataOf(bridge).get('runtime')).toBe('bun'); // FormData carries the CODE
  });

  it('Combobox submits the option value, never the display text', async () => {
    const { container } = render(Combobox, {
      props: { options: selectOptions, name: 'backend' },
    });
    const input = container.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    const bridge = container.querySelector<HTMLElement>('jx-form-field')!;

    // nothing committed → no entry; the native input carries NO name, so
    // it can never leak the display text into FormData either
    expect(formDataOf(bridge, input).get('backend')).toBeNull();
    expect(input.hasAttribute('name')).toBe(false);

    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'bu' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(input.value).toBe('Bun'); // display follows the LABEL...
    expect(formDataOf(bridge, input).get('backend')).toBe('bun'); // ...FormData the VALUE
  });

  it('Range contributes its numeric string and follows keyboard commits', async () => {
    const { container } = render(Range, {
      props: { name: 'volume', value: 40, min: 0, max: 100, showValue: false },
    });
    const bridge = container.querySelector<HTMLElement>('jx-form-field')!;
    const slider = container.querySelector<HTMLElement>('[role="slider"]')!;

    expect(formDataOf(bridge).get('volume')).toBe('40');
    await fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(formDataOf(bridge).get('volume')).toBe('41');
  });

  it('TagsInput submits its tag values as one JSON array; the empty set stays out', async () => {
    const { container } = render(TagsInput, {
      props: { name: 'stack', tags: [{ value: 'svelte' }, { value: 'node' }] as Tag[] },
    });
    const bridge = container.querySelector<HTMLElement>('jx-form-field')!;
    const input = container.querySelector('input')!;

    expect(formDataOf(bridge).get('stack')).toBe('["svelte","node"]');
    expect(input.hasAttribute('name')).toBe(false); // the typing input never submits

    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'bun' } });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(formDataOf(bridge).get('stack')).toBe('["svelte","node","bun"]');

    // emptying the field empties the contribution (native control semantics)
    await fireEvent.keyDown(input, { key: 'Backspace' });
    await fireEvent.keyDown(input, { key: 'Backspace' });
    await fireEvent.keyDown(input, { key: 'Backspace' });
    expect(container.querySelectorAll('.jx-tags-tag').length).toBe(0);
    expect(formDataOf(bridge).get('stack')).toBeNull();
  });

  it('a disabled field stops contributing; an unnamed one never starts', async () => {
    const named = render(Select, {
      props: { options: selectOptions, value: 'svelte', name: 'runtime' },
    });
    const disabled = render(Select, {
      props: { options: selectOptions, value: 'svelte', name: 'runtime', disabled: true },
    });
    const unnamed = render(Select, { props: { options: selectOptions, value: 'svelte' } });

    expect(formDataOf(named.container.querySelector('jx-form-field')!).get('runtime')).toBe(
      'svelte'
    );
    expect(formDataOf(disabled.container.querySelector('jx-form-field')!).get('runtime')).toBeNull();
    expect(formDataOf(unnamed.container.querySelector('jx-form-field')!).get('runtime')).toBeNull();
  });

  it('form reset restores the mount value through jx-reset', async () => {
    const { container } = render(Select, {
      props: { options: selectOptions, value: 'svelte', name: 'runtime' },
    });
    const trigger = container.querySelector<HTMLButtonElement>('button[popovertarget]')!;
    const bridge = container.querySelector<HTMLElement>('jx-form-field')!;

    await fireEvent.click(trigger);
    await fireEvent.click(document.getElementById(`${trigger.id}-opt-2`)!);
    expect(formDataOf(bridge).get('runtime')).toBe('bun');

    // jsdom does not drive formResetCallback from form.reset() — invoke it
    // the way the platform would
    (bridge as FormField).formResetCallback();
    flushSync();

    expect(formDataOf(bridge).get('runtime')).toBe('svelte'); // mount value restored
    expect(trigger.textContent).toContain('Svelte'); // component state followed jx-reset
  });

  it('form-level disable reaches the control through jx-disabled', async () => {
    const { container } = render(Combobox, {
      props: { options: selectOptions, name: 'backend', value: 'bun' },
    });
    const bridge = container.querySelector<HTMLElement>('jx-form-field')!;
    const input = container.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    expect(input.disabled).toBe(false);

    (bridge as FormField).formDisabledCallback(true);
    flushSync();
    expect(input.disabled).toBe(true); // the control paints disabled...
    expect(formDataOf(bridge).get('backend')).toBeNull(); // ...and stops contributing

    (bridge as FormField).formDisabledCallback(false);
    flushSync();
    expect(input.disabled).toBe(false);
    expect(formDataOf(bridge).get('backend')).toBe('bun');
  });
});
