/**
 * ItemField + adapter lock (openspec list-item-systemization task 3).
 * The wiring contract: generated controlId lands on the NATIVE
 * element of every adapter; label[for] associates; describedby
 * chains description then error; error → aria-invalid; labelMode
 * text swaps the association channel. jsdom structure locks — the
 * browser keyboard smoke rides the task-6 fixture.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/item-field-host.svelte';

describe('ItemField — the settings-row wiring', () => {
  it('every adapter puts the generated id on its NATIVE control', () => {
    const { container } = render(Host);
    const toggle = container.querySelector('#t1')!;
    expect(toggle.tagName).toBe('INPUT');
    expect(toggle.getAttribute('type')).toBe('checkbox');
    expect(container.querySelector('#c1')!.tagName).toBe('INPUT');
    expect(container.querySelector('#r1')!.tagName).toBe('INPUT');
    expect((container.querySelector('#r1') as HTMLInputElement).name).toBe('channel');
    expect(container.querySelector('#s1')!.tagName).toBe('SELECT');
    expect(container.querySelector('#i1')!.tagName).toBe('INPUT');
  });

  it('label[for] association: the visible label points at the control', () => {
    const { container } = render(Host);
    const label = container.querySelector('label[for="t1"]')!;
    expect(label.id).toBe('t1-label');
    expect(label.textContent).toContain('Fast builds');
    // the native association is the name source: NO aria-labelledby in for-mode
    expect(container.querySelector('#t1')!.getAttribute('aria-labelledby')).toBeNull();
  });

  it('describedby chains description then error; error drives aria-invalid', () => {
    const { container } = render(Host);
    expect(container.querySelector('#t1')!.getAttribute('aria-describedby')).toBe('t1-description');
    expect(container.querySelector('#c1')!.getAttribute('aria-describedby')).toBe('c1-error');
    // ItemInput keeps the computed relations on the NATIVE input (the
    // Input merge law — its own error wiring must not clobber them)
    const nativeInput = container.querySelector('#i1')!;
    expect(nativeInput.getAttribute('aria-invalid')).toBe('true');
    const inputChain = nativeInput.getAttribute('aria-describedby')!;
    expect(inputChain).toBe('i1-description i1-error');
    for (const id of inputChain.split(' ')) expect(container.querySelector(`[id="${id}"]`)).toBeTruthy();
    expect(container.querySelector('#c1')!.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('#t1')!.getAttribute('aria-invalid')).toBeNull();
    // the ids the chain references exist
    expect(container.querySelector('#t1-description')!.textContent).toContain('typechecking');
    expect(container.querySelector('#c1-error')!.textContent).toContain('flag');
  });

  it('ItemRadio group is the two-way channel (bind:group law)', async () => {
    const { container } = render(Host);
    const r1 = container.querySelector('#r1') as HTMLInputElement;
    const r2 = container.querySelector('#r2') as HTMLInputElement;
    expect(r1.checked).toBe(true);
    expect(r2.checked).toBe(false);
    r2.click();
    await new Promise((r) => setTimeout(r));
    expect(r2.checked).toBe(true);
    expect(r1.checked).toBe(false);
    // the parent's bound group value followed the click (bind:group law)
    expect(container.querySelector('[data-channel]')!.textContent).toBe('beta');
  });

  it('field rows stamp the Item contract (auto chrome, group inheritance)', () => {
    const { container } = render(Host);
    const standaloneRow = container.querySelector('#t1')!.closest('[data-slot="item"]')!;
    expect(standaloneRow.getAttribute('data-item-chrome')).toBe('surface');
    // grouped field yields chrome to the group + native li wrapper
    const groupedRow = container.querySelector('#g1')!.closest('[data-slot="item"]')!;
    expect(groupedRow.getAttribute('data-item-chrome')).toBe('none');
    expect(groupedRow.closest('li[data-slot="item-row"]')).toBeTruthy();
    const section = container.querySelector('[data-slot="item-group"]')!;
    expect(section.tagName).toBe('SECTION');
    expect(section.querySelector('[data-slot="item-list"]')!.getAttribute('data-dividers')).toBe('auto');
  });

  it('labelMode text: span label + a custom control carries aria-labelledby', () => {
    const { container } = render(Host);
    const label = container.querySelector('#f1-label')!;
    expect(label.tagName).toBe('SPAN');
    const button = container.querySelector('button[aria-labelledby]')!;
    expect(button.getAttribute('aria-labelledby')).toBe('f1-label');
    // for-mode rows never render a span label
    expect(container.querySelector('label[for="f1"]')).toBeNull();
  });
});
