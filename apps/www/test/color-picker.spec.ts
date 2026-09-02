/**
 * ColorPicker · native rebase contract (2026-09-01).
 *
 * The standing Owner law (range rebase, same day): jx-pure is the
 * foundation — the registry component adds richer slots + semantics,
 * NEVER a re-drawn simulation of a native control. The audit found the
 * 2026-08-20 build rendered ZERO native inputs (a button trigger with
 * painted spans). This suite locks the rebase:
 *
 *  - the FIELD is a REAL input[type=text] — label[for] target, name=
 *    FormData lane, native disabled, focus and selection;
 *  - the SWATCH is a REAL input[type=color] — the engine picker path,
 *    bound to the hex projection, no second name lane;
 *  - the SV pad + hue rail STAY custom (no native 2D picker surface
 *    exists — the date-picker calendar-grid legitimacy class), with
 *    every value flowing through the ONE truth the natives bind;
 *  - the popover rides the platform Popover API off the chevron;
 *  - native passthrough (the input.svelte law): Props extends
 *    HTMLInputAttributes and the rest spread lands on the FIELD (the
 *    lane's semantic surface) — a label-less picker keeps its
 *    accessible name through aria-label;
 *  - E-9's external-write half: an INVALID bind write displays RAW in
 *    the field while the picker's own projection keeps the LAST VALID
 *    color — a subsequent valid write recovers.
 *
 * Assertion law: state is read back through the DOM the way a user or
 * a form sees it (input.value, FormData, aria) — never through
 * component internals. The Popover-API surface is jsdom-polyfilled in
 * test/setup.ts.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';

import ColorPicker from '../src/lib/ui/color-picker/color-picker.svelte';
import ColorPickerHost from './fixtures/color-picker-host.svelte';
import { createRawSnippet } from 'svelte';
import { readFileSync } from 'node:fs';
import { cleanup } from '@testing-library/svelte';

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

describe('ColorPicker · the native field', () => {
  it('the FIELD is a REAL input[type=text] carrying the value — a REAL label binds through for/id', () => {
    const { container } = render(ColorPicker, { props: { label: 'accent', value: '#007924' } });
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(field).not.toBeNull();
    expect(field.value).toBe('#007924');
    // labelable — the label[for] targets the field's own id
    expect(container.querySelector(`label[for="${field.id}"]`)).not.toBeNull();
    // no re-drawn value surface: the old div/span readout is gone
    expect(container.querySelector('[data-jx-color-picker-value]')).toBeNull();
  });

  it('name= submits through its own FormData lane (the field owns it)', () => {
    const { container } = render(ColorPicker, { props: { name: 'accent', value: '#007924' } });
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(formDataOf(field).get('accent')).toBe('#007924');
  });

  it('field typing commits on change: parsed text canonicalizes, invalid drafts revert', async () => {
    const { container } = render(ColorPicker, { props: { label: 'c', value: '#007924' } });
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    // the real typing cadence: input events draft the lane, change commits
    await fireEvent.input(field, { target: { value: '#0f2' } });
    await fireEvent.change(field);
    // #0f2 parses, converts through OKLCH, commits canonical hex6
    expect(field.value).toBe('#00ff22');
    // an unparseable draft reverts to the last committed string
    await fireEvent.input(field, { target: { value: 'not a color' } });
    await fireEvent.change(field);
    expect(field.value).toBe('#00ff22');
  });

  it('external bind writes re-display RAW — the $bindable contract (host)', async () => {
    const { container } = render(ColorPickerHost);
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    await fireEvent.click(container.querySelector('[data-testid="reset"]') as Element);
    flushSync();
    expect(field.value).toBe('#112233');
    expect(container.querySelector('[data-testid="out"]')?.textContent).toBe('#112233');
  });

  it('disabled locks every native control (field, swatch, chevron)', () => {
    const { container } = render(ColorPicker, { props: { label: 'c', disabled: true } });
    expect(
      (container.querySelector('input[type="text"]') as HTMLInputElement).hasAttribute('disabled'),
    ).toBe(true);
    expect(
      (container.querySelector('input[type="color"]') as HTMLInputElement).hasAttribute('disabled'),
    ).toBe(true);
    expect(
      (container.querySelector('button[popovertarget]') as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('error wires the NATIVE invalid seam on the field — and the swatch shares the describedby (E-11)', () => {
    const { container } = render(ColorPicker, { props: { label: 'theme hue', error: 'required' } });
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(field.getAttribute('aria-invalid')).toBe('true');
    const describedBy = field.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(container.querySelector(`#${describedBy}`)?.textContent).toContain('required');
    // both native controls inside the lane answer the one message line
    const swatch = container.querySelector('input[type="color"]') as HTMLInputElement;
    expect(swatch.getAttribute('aria-describedby')).toBe(describedBy);
  });

  it('showValue=false keeps the native value contract (sr-only field, lane intact)', () => {
    const { container } = render(ColorPicker, {
      props: { label: 'c', name: 'accent', value: '#007924', showValue: false },
    });
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(field).not.toBeNull();
    expect(field.classList.contains('sr-only')).toBe(true);
    expect(field.value).toBe('#007924');
    expect(formDataOf(field).get('accent')).toBe('#007924');
  });
});

describe('ColorPicker · the native swatch path', () => {
  it('the swatch is a REAL input[type=color] bound to the hex projection — no second name lane', () => {
    const { container } = render(ColorPicker, { props: { label: 'c', value: '#007924', name: 'accent' } });
    const swatch = container.querySelector('input[type="color"]') as HTMLInputElement;
    expect(swatch).not.toBeNull();
    expect(swatch.value.toLowerCase()).toBe('#007924');
    expect(swatch.hasAttribute('name')).toBe(false);
  });

  it('a native swatch pick commits through the ONE truth in the ACTIVE notation', async () => {
    const { container } = render(ColorPicker, {
      props: { label: 'c', value: 'oklch(0.6489 0.237 145)', format: 'oklch' },
    });
    const swatch = container.querySelector('input[type="color"]') as HTMLInputElement;
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    await fireEvent.input(swatch, { target: { value: '#ff0000' } });
    flushSync();
    // the engine hands raw hex; the picker re-emits canonical oklch —
    // a hex pick never rewrites an oklch picker's value surface
    expect(field.value.startsWith('oklch(')).toBe(true);
  });

  it('showSwatch=false omits the native swatch (the lane keeps field + chevron)', () => {
    const { container } = render(ColorPicker, { props: { label: 'c', showSwatch: false } });
    expect(container.querySelector('input[type="color"]')).toBeNull();
    expect(container.querySelector('.jx-color-picker-trigger input[type="text"]')).not.toBeNull();
  });
});

describe('ColorPicker · the lane + editor popover', () => {
  it('keeps the .jx-color-picker-trigger root wrapping the native controls', () => {
    const { container } = render(ColorPicker, { props: { label: 'c' } });
    const lane = container.querySelector('.jx-color-picker-trigger') as HTMLElement;
    expect(lane).not.toBeNull();
    expect(lane.querySelector('input[type="color"]')).not.toBeNull();
    expect(lane.querySelector('input[type="text"]')).not.toBeNull();
    expect(lane.querySelector('button[popovertarget]')).not.toBeNull();
  });

  it('the chevron opens the platform popover; the SV pad + hue rail stay custom', async () => {
    const { container } = render(ColorPicker, { props: { label: 'c', id: 'cp-pop' } });
    const field = container.querySelector('#cp-pop') as HTMLInputElement;
    const chevron = container.querySelector('button[popovertarget]') as HTMLButtonElement;
    const panel = container.querySelector('#cp-pop-panel') as HTMLElement;
    expect(panel.getAttribute('popover')).toBe('auto');
    expect(chevron.getAttribute('popovertarget')).toBe('cp-pop-panel');
    // the honest generic promise — the panel opens as role=group, not
    // a dialog (E-7: the pairing must match, not overpromise)
    expect(chevron.getAttribute('aria-haspopup')).toBe('true');
    // the 2D picker surfaces no native element provides — custom by law
    expect(panel.querySelector('.jx-color-picker-sv')).not.toBeNull();
    expect(panel.querySelector('[data-jx-color-picker-hue]')).not.toBeNull();
    await fireEvent.click(chevron);
    expect(panel.hasAttribute('open')).toBe(true);
    flushSync();
    expect(chevron.getAttribute('aria-expanded')).toBe('true');
    // close path restitutes focus to the native field (the value surface)
    panel.hidePopover();
    flushSync();
    expect(chevron.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(field);
  });

  it('an editor format switch re-emits the SAME color in the new notation — the field follows (one truth)', async () => {
    const { container } = render(ColorPicker, { props: { label: 'c', id: 'cp-fmt', value: '#007924' } });
    const field = container.querySelector('#cp-fmt') as HTMLInputElement;
    const select = container.querySelector('#cp-fmt-panel select') as HTMLSelectElement;
    expect(select).not.toBeNull();
    await fireEvent.change(select, { target: { value: 'hsl' } });
    flushSync();
    expect(field.value.startsWith('hsl(')).toBe(true);
  });
});

describe('ColorPicker · native attribute passthrough', () => {
  it('rest props land on the native FIELD — aria-label without a label, title, data-testid', () => {
    const { container } = render(ColorPicker, {
      props: { value: '#007924', 'aria-label': 'accent', title: 'pick a color', 'data-testid': 'cp' },
    });
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(field.getAttribute('aria-label')).toBe('accent');
    expect(field.getAttribute('title')).toBe('pick a color');
    expect(field.getAttribute('data-testid')).toBe('cp');
    // no label prop → no label[for]; the passthrough IS the naming path
    expect(container.querySelector('label')).toBeNull();
  });

  it('component-owned wiring wins over the spread (input.svelte law)', () => {
    const { container } = render(ColorPicker, {
      props: { value: '#007924', type: 'number', autocomplete: 'on' },
    });
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    // the spread sits BEFORE the wiring: a hostile rest cannot un-text
    // the field or re-enable autocomplete on a color string lane
    expect(field.type).toBe('text');
    expect(field.getAttribute('autocomplete')).toBe('off');
    // the swatch keeps its own chrome wiring — untouched by the field's rest
    expect((container.querySelector('input[type="color"]') as HTMLInputElement).type).toBe('color');
    expect(
      (container.querySelector('input[type="color"]') as HTMLInputElement).hasAttribute('data-testid'),
    ).toBe(false);
  });

  it('caller aria-describedby survives when the error wiring is absent', () => {
    const { container } = render(ColorPicker, {
      props: { value: '#007924', 'aria-describedby': 'hint-1' },
    });
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(field.getAttribute('aria-describedby')).toBe('hint-1');
  });
});

describe('ColorPicker · invalid external writes (E-9)', () => {
  it('an unparseable bind write displays RAW; the picker keeps the last VALID projection; a valid write recovers', async () => {
    const { container } = render(ColorPickerHost);
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    const swatch = container.querySelector('input[type="color"]') as HTMLInputElement;
    await fireEvent.click(container.querySelector('[data-testid="bad"]') as Element);
    flushSync();
    // the field re-displays the raw string; the $bindable keeps it —
    // the old code kept the PREVIOUS field text (the early return
    // contradicted the raw-preserve contract)
    expect(field.value).toBe('not a color');
    expect(container.querySelector('[data-testid="out"]')?.textContent).toBe('not a color');
    // the swatch derives from the editor seat, which NEVER went
    // invalid — it keeps painting the last valid color
    expect(swatch.value.toLowerCase()).toBe('#007924');
    // recovery: a subsequent parseable write re-seats everything
    await fireEvent.click(container.querySelector('[data-testid="reset"]') as Element);
    flushSync();
    expect(field.value).toBe('#112233');
    expect(swatch.value.toLowerCase()).toBe('#112233');
    expect(container.querySelector('[data-testid="out"]')?.textContent).toBe('#112233');
  });
});

describe('ColorPicker · form reset (E-4)', () => {
  it('a host form reset re-syncs the bindable, the field draft and the editor seat', async () => {
    const { container } = render(ColorPickerHost);
    const form = container.querySelector('form') as HTMLFormElement;
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    const swatch = container.querySelector('input[type="color"]') as HTMLInputElement;
    // what SSR markup would carry: the reset restores the value
    // ATTRIBUTE (client-only renders set the property, so pin the
    // defaultValue the parsed HTML would have had)
    field.defaultValue = '#007924';
    // drive the one-truth away through the field (change commits)
    await fireEvent.input(field, { target: { value: '#ff0000' } });
    await fireEvent.change(field);
    flushSync();
    expect(container.querySelector('[data-testid="out"]')?.textContent).toBe('#ff0000');
    // the platform restores the field but fires NO input/change events
    form.reset();
    await Promise.resolve(); // let the reset listener's microtask run
    flushSync();
    expect(field.value).toBe('#007924');
    expect(container.querySelector('[data-testid="out"]')?.textContent).toBe('#007924');
    // the editor re-seats: the swatch's hex projection follows the
    // restored color (a stale seat would still paint #ff0000)
    expect(swatch.value.toLowerCase()).toBe('#007924');
  });
});

describe('ColorPicker — the input-color law base + the lane slot (Owner rebase, 2026-09-02)', () => {
  it('the swatch rides the COLOR LAW face (the 4th mounting surface), never a hand-drawn chip', () => {
    const css = readFileSync('src/lib/ui/color-picker/color-picker.css', 'utf8');
    const begin = css.indexOf('@jixoai/css-laws:begin:color-mount');
    const end = css.indexOf('@jixoai/css-laws:end:color-mount');
    expect(begin).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(begin);
    const mount = css.slice(begin, end);
    // the law face verbatim on the component hook: the conic well chip
    expect(mount).toContain('[data-jx-color-picker-swatch]:not(.no-jx-pure');
    expect(mount).toContain('border-radius: 50%');
    expect(mount).toContain('conic-gradient(from 0deg');
    // the H1 ruled divergence (the square chip) is RETIRED
    expect(css).not.toContain('RULED DIVERGENCE');
    const hand = css.indexOf('--jx-color-picker-swatch]{');
    if (hand > -1) {
      // any remaining hand block on the hook must not re-draw the face
      const block = css.slice(hand, css.indexOf('}', hand));
      expect(block).not.toContain('background:');
    }
  });

  it('the DEFAULT lane is the input-text; a `lane` snippet takes the visible spot, the field goes sr-only', async () => {
    const store1 = { v: '#007924' };
    const { container } = render(ColorPickerHost);
    const field = container.querySelector('[data-jx-color-picker-field]') as HTMLElement;
    expect(field.className).not.toContain('sr-only'); // default: visible

    cleanup();
    // a custom lane: a probe span reading the snippet params
    // the form-expansion house idiom: string-render raw snippets
    const laneSnippet = createRawSnippet((get) => ({
      render: () => {
        const c = get();
        return '<span data-lane-probe="">' + c.text + '|' + c.open + '|' + c.disabled + '</span>';
      },
    }));
    const host2 = render(ColorPickerHost, { props: { lane: laneSnippet } });
    await new Promise((r) => setTimeout(r, 0));
    const f2 = host2.container.querySelector('[data-jx-color-picker-field]') as HTMLElement;
    expect(f2.className).toContain('sr-only'); // semantics live, face hidden
    const probe = host2.container.querySelector('[data-lane-probe]') as HTMLElement;
    expect(probe).toBeTruthy();
    expect(probe.textContent).toContain('#007924'); // live draft text
    expect(host2.container.querySelector('[data-jx-color-picker-swatch]')).toBeTruthy(); // law swatch still the anchor
    void store1;
  });
});
