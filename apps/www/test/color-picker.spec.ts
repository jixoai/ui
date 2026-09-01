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
 *  - the popover rides the platform Popover API off the chevron.
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

  it('error wires the NATIVE invalid seam on the field', () => {
    const { container } = render(ColorPicker, { props: { label: 'theme hue', error: 'required' } });
    const field = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(field.getAttribute('aria-invalid')).toBe('true');
    const describedBy = field.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(container.querySelector(`#${describedBy}`)?.textContent).toContain('required');
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
    expect(chevron.getAttribute('aria-haspopup')).toBe('dialog');
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
