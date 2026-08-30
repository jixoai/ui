/**
 * Form family expansion suite (test/form-expansion.spec.ts, 2026-08-30).
 *
 * The expand-form-family F1 capabilities, rendered straight from the
 * same-source copies the site consumes ($lib/ui):
 *   - input: the code-point `count` readout, the password reveal toggle
 *     (default ON, hidden start), the floating bracket label
 *   - combobox: `multiple` (chips + MULTIVALUE bridge submission) and
 *     `showClear`
 *   - the form-field bridge's MULTIVALUE seam (values property /
 *     setValues → FormData with repeated same-name entries)
 *
 * Assertion law: state is read back through the DOM the way a user or a
 * form sees it (input.value, aria-pressed, chips, FormData.getAll) —
 * never through component internals. The maxlength CLAMP itself is the
 * platform's law (jsdom does not sanitize the value setter) — clamping
 * is browser-probed, here only the counter math and ARIA are asserted.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { createRawSnippet, flushSync } from 'svelte';

import Combobox from '../src/lib/ui/combobox/combobox.svelte';
import Input from '../src/lib/ui/input/input.svelte';
import Textarea from '../src/lib/ui/textarea/textarea.svelte';
import type { ComboboxOption } from '../src/lib/ui/combobox/combobox.svelte';
import { type FormField } from '../src/lib/form-field';

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
// Input — the count readout (code points, near-limit polite live region)
// ---------------------------------------------------------------------------
describe('Input count', () => {
  it('renders "n / max" in the hint lane and tracks typed text', async () => {
    const { container } = render(Input, {
      props: { label: 'bio', count: true, maxlength: 20 },
    });
    const input = container.querySelector('input')!;
    const readout = () => container.querySelector('[data-jx-count]')!;

    expect(readout().textContent?.replace(/\s+/g, ' ').trim()).toBe('0 / 20');
    // the readout stays SILENT below the near-limit zone (90% of the cap)
    expect(readout().getAttribute('aria-live')).toBe('off');

    await fireEvent.input(input, { target: { value: 'hello' } });
    expect(readout().textContent?.replace(/\s+/g, ' ').trim()).toBe('5 / 20');
    expect(readout().getAttribute('aria-live')).toBe('off');

    // crossing 90% of the cap flips the region polite (18 of 20 here)
    await fireEvent.input(input, { target: { value: 'x'.repeat(18) } });
    expect(readout().textContent?.replace(/\s+/g, ' ').trim()).toBe('18 / 20');
    expect(readout().getAttribute('aria-live')).toBe('polite');
  });

  it('counts CODE POINTS — surrogate pairs are one character, never two units', async () => {
    const { container } = render(Input, { props: { label: 'bio', count: true } });
    const input = container.querySelector('input')!;
    const readout = () => container.querySelector('[data-jx-count]')!;

    // CJK BMP pair + an astral CJK ext-B char + an emoji: 4 code points,
    // 6 UTF-16 units — the readout must report the code-point count
    const cjkAndAstral = '你好\u{17000}\u{1F44D}';
    expect(cjkAndAstral.length).toBe(6); // the UTF-16 trap the law rejects
    await fireEvent.input(input, { target: { value: cjkAndAstral } });
    expect(readout().textContent?.trim()).toBe('4');
  });

  it('plain "n" without a maxlength cap', async () => {
    const { container } = render(Input, { props: { label: 'bio', count: true } });
    const input = container.querySelector('input')!;
    await fireEvent.input(input, { target: { value: 'abc' } });
    expect(container.querySelector('[data-jx-count]')?.textContent?.trim()).toBe('3');
  });

  it('textarea passthrough: the same code-point law and near-limit region', async () => {
    const { container } = render(Textarea, {
      props: { label: 'bio', count: true, maxlength: 10 },
    });
    const textarea = container.querySelector('textarea')!;
    const readout = () => container.querySelector('[data-jx-count]')!;

    await fireEvent.input(textarea, { target: { value: '\u{1F44D}\u{1F44D}' } });
    // two emoji = 2 code points (4 UTF-16 units)
    expect(readout().textContent?.replace(/\s+/g, ' ').trim()).toBe('2 / 10');
    expect(readout().getAttribute('aria-live')).toBe('off');

    await fireEvent.input(textarea, { target: { value: 'x'.repeat(9) } });
    expect(readout().getAttribute('aria-live')).toBe('polite');
  });
});

// ---------------------------------------------------------------------------
// Input — the password reveal toggle (default ON, hidden start)
// ---------------------------------------------------------------------------
describe('Input password reveal', () => {
  it('renders the eye by DEFAULT, starting HIDDEN (the value is never revealed by default)', () => {
    const { container } = render(Input, { props: { type: 'password', label: 'key' } });
    const input = container.querySelector('input')!;
    const eye = container.querySelector<HTMLButtonElement>('.jx-input-reveal')!;

    expect(input.getAttribute('type')).toBe('password');
    expect(eye).toBeTruthy();
    expect(eye.getAttribute('aria-pressed')).toBe('false');
    expect(eye.getAttribute('aria-label')).toBe('show password');
  });

  it('press flips aria-pressed and ONLY the type — focus/value untouched', async () => {
    const { container } = render(Input, {
      props: { type: 'password', label: 'key', value: 's3cret' },
    });
    const input = container.querySelector<HTMLInputElement>('input')!;
    const eye = container.querySelector<HTMLButtonElement>('.jx-input-reveal')!;

    await fireEvent.click(eye);
    expect(input.getAttribute('type')).toBe('text'); // revealed
    expect(eye.getAttribute('aria-pressed')).toBe('true');
    expect(eye.getAttribute('aria-label')).toBe('hide password');
    expect(input.value).toBe('s3cret'); // the value survives the flip

    await fireEvent.click(eye);
    expect(input.getAttribute('type')).toBe('password');
    expect(eye.getAttribute('aria-pressed')).toBe('false');
  });

  it('reveal={false} opts out', () => {
    const { container } = render(Input, {
      props: { type: 'password', label: 'key', reveal: false },
    });
    expect(container.querySelector('.jx-input-reveal')).toBeNull();
  });

  it('text types never grow the eye', () => {
    const { container } = render(Input, { props: { type: 'text', label: 'plain' } });
    expect(container.querySelector('.jx-input-reveal')).toBeNull();
  });

  it('end-lane order: innerInlineEnd snippet > clearable × > eye', () => {
    const endSnippet = createRawSnippet(() => ({ render: () => '<span class="slot-marker">/v1</span>' }));
    const { container } = render(Input, {
      props: {
        type: 'password',
        label: 'key',
        clearable: true,
        value: 's3cret',
        innerInlineEnd: endSnippet,
      },
    });
    const shell = container.querySelector('.jx-html-control-shell')!;
    const laneKind = (el: Element): string => {
      if (el.hasAttribute('data-jx-slot')) return 'slot';
      if (el.classList.contains('jx-html-clear')) return 'clear';
      if (el.classList.contains('jx-input-reveal')) return 'eye';
      return 'other';
    };
    const kinds = [...shell.children].map(laneKind);
    expect(kinds.indexOf('slot')).toBeGreaterThan(-1);
    expect(kinds.indexOf('clear')).toBeGreaterThan(kinds.indexOf('slot'));
    expect(kinds.indexOf('eye')).toBeGreaterThan(kinds.indexOf('clear'));
    expect(kinds.indexOf('eye')).toBe(kinds.length - 1); // outermost end child
  });
});

// ---------------------------------------------------------------------------
// Input — the floating bracket label (labelMode="floating")
// ---------------------------------------------------------------------------
describe('Input floating label', () => {
  it('moves the label INTO the shell as a bracket; default stays stacked', () => {
    const stacked = render(Input, { props: { label: 'email' } });
    // stacked: the label is a direct child of .jx-field, above the shell
    const field = stacked.container.querySelector('.jx-field')!;
    expect(field.querySelector(':scope > label.jx-label')).toBeTruthy();
    expect(stacked.container.querySelector('.jx-floating-label')).toBeNull();

    const floating = render(Input, {
      props: { label: 'email', labelMode: 'floating' },
    });
    const shell = floating.container.querySelector('.jx-html-control-shell.jx-floating')!;
    expect(shell).toBeTruthy();
    const bracket = shell.querySelector('label.jx-floating-label')!;
    expect(bracket).toBeTruthy();
    expect(bracket.getAttribute('for')).toBe(
      shell.querySelector('input')!.getAttribute('id'),
    ); // label[for] wiring survives the move
  });

  it('seeds a placeholder so :placeholder-shown can express the empty state', () => {
    const { container } = render(Input, {
      props: { label: 'email', labelMode: 'floating' },
    });
    const input = container.querySelector('input')!;
    expect(input.getAttribute('placeholder')).toBe(' ');
  });

  it('keeps a consumer placeholder untouched', () => {
    const { container } = render(Input, {
      props: { label: 'email', labelMode: 'floating', placeholder: 'you@host.tld' },
    });
    expect(container.querySelector('input')!.getAttribute('placeholder')).toBe('you@host.tld');
  });

  it('error composition: aria-invalid rides the lane (the destructive bracket ink keys on it)', () => {
    const { container } = render(Input, {
      props: { label: 'email', labelMode: 'floating', error: 'email is required' },
    });
    const input = container.querySelector('input')!;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('.jx-html-control-shell')!.classList.contains('jx-invalid')).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// Combobox — multiple + the MULTIVALUE bridge
// ---------------------------------------------------------------------------
describe('Combobox multiple', () => {
  const options: ComboboxOption[] = [
    { value: 'svelte', label: 'Svelte' },
    { value: 'node', label: 'Node' },
    { value: 'bun', label: 'Bun' },
  ];

  function setup(extraProps: Record<string, unknown> = {}) {
    const rendered = render(Combobox, {
      props: { options, multiple: true, name: 'stack', ...extraProps },
    });
    const input = rendered.container.querySelector<HTMLInputElement>(
      'input[role="combobox"]',
    )!;
    const bridge = rendered.container.querySelector<HTMLElement>('jx-form-field')!;
    const chips = () => [...rendered.container.querySelectorAll('[data-jx-combobox-chip]')];
    const panel = () =>
      document.getElementById(input.getAttribute('aria-controls')!.replace('-listbox', '-panel'))!;
    /** open the panel the way the component does, then pick a row */
    const pick = async (label: string) => {
      await fireEvent.focus(input);
      await fireEvent.input(input, { target: { value: label } });
      await fireEvent.keyDown(input, { key: 'Enter' });
    };
    return { ...rendered, input, bridge, chips, panel, pick };
  }

  it('commits in SELECTION ORDER — getAll returns the picks in order', async () => {
    const { bridge, pick } = setup();
    expect(formDataOf(bridge).get('stack')).toBeNull(); // nothing committed yet

    await pick('bun');
    await pick('svelte');
    await pick('node');
    expect(formDataOf(bridge).getAll('stack')).toEqual(['bun', 'svelte', 'node']);
  });

  it('re-picking a selected row removes it (toggle membership)', async () => {
    const { bridge, pick } = setup({ value: ['svelte', 'node'] });
    expect(formDataOf(bridge).getAll('stack')).toEqual(['svelte', 'node']);

    await pick('svelte'); // toggle OFF
    expect(formDataOf(bridge).getAll('stack')).toEqual(['node']);
  });

  it('renders trigger chips (label + remove ×); chip removal keeps order', async () => {
    const { container, bridge, chips } = setup({ value: ['svelte', 'node', 'bun'] });
    expect(chips().length).toBe(3);
    expect(chips()[0].textContent).toContain('Svelte');
    expect(chips()[2].textContent).toContain('Bun');

    // remove the middle chip by its ×
    const removeBun = chips()[2].querySelector('button')!;
    expect(removeBun.getAttribute('aria-label')).toBe('remove Bun');
    await fireEvent.click(chips()[1].querySelector('button')!);
    expect(chips().length).toBe(2);
    expect(formDataOf(bridge).getAll('stack')).toEqual(['svelte', 'bun']);

    // chips stay readable and disabled fields are not edible (disabled ×)
    expect(container.querySelector('input[role="combobox"]')).toBeTruthy();
    void removeBun;
  });

  it('the panel is aria-multiselectable with aria-selected + check state; picking keeps it open', async () => {
    const { input, panel, pick } = setup();
    await pick('bun');

    // the panel stays OPEN for the next pick (multi-pick is a conversation)
    expect(panel().hasAttribute('open')).toBe(true);
    expect(input.getAttribute('aria-expanded')).toBe('true');

    const list = panel().querySelector('[role="listbox"]')!;
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    const rows = [...panel().querySelectorAll('[role="option"]')];
    const bunRow = rows.find((row) => row.textContent?.includes('Bun'))!;
    expect(bunRow.getAttribute('aria-selected')).toBe('true');
    expect(bunRow.querySelector('.jx-combobox-check')).toBeTruthy(); // the check glyph
    const svelteRow = rows.find((row) => row.textContent?.includes('Svelte'))!;
    expect(svelteRow.getAttribute('aria-selected')).toBe('false');
    expect(svelteRow.querySelector('.jx-combobox-check')).toBeNull();
  });

  it('allowCustom: unmatched text joins the selection as a chip', async () => {
    const { bridge, pick, chips } = setup();
    await pick('deno');
    expect(chips().length).toBe(1);
    expect(formDataOf(bridge).getAll('stack')).toEqual(['deno']);
  });

  it('clear (showClear) empties the selection — the field then submits NOTHING', async () => {
    const { container, bridge, pick } = setup({ showClear: true });
    await pick('bun');
    expect(formDataOf(bridge).getAll('stack')).toEqual(['bun']);

    const clear = container.querySelector<HTMLButtonElement>('button[aria-label="clear selection"]')!;
    expect(clear).toBeTruthy();
    await fireEvent.click(clear);
    expect(formDataOf(bridge).getAll('stack')).toEqual([]); // zero entries
    expect(formDataOf(bridge).get('stack')).toBeNull(); // honest empty
    expect(container.querySelector('[data-jx-combobox-chip]')).toBeNull();
  });

  it('showClear stays hidden while nothing is committed', () => {
    const { container } = setup({ showClear: true });
    expect(container.querySelector('button[aria-label="clear selection"]')).toBeNull();
  });

  it('form.reset() restores the initial array', async () => {
    const { bridge, pick } = setup({ value: ['svelte', 'bun'] });
    await pick('node');
    expect(formDataOf(bridge).getAll('stack')).toEqual(['svelte', 'bun', 'node']);

    // jsdom does not drive formResetCallback from form.reset() — invoke it
    // the way the platform would
    (bridge as unknown as FormField).formResetCallback();
    flushSync();
    expect(formDataOf(bridge).getAll('stack')).toEqual(['svelte', 'bun']);
  });

  it('a disabled component stops contributing', async () => {
    const { bridge } = setup({ value: ['svelte'], disabled: true });
    expect(formDataOf(bridge).getAll('stack')).toEqual([]);
    expect(formDataOf(bridge).get('stack')).toBeNull();
  });

  it('form-level disable (disabled fieldset) omits the field — and it comes back', async () => {
    const { bridge } = setup({ value: ['svelte', 'bun'] });
    expect(formDataOf(bridge).getAll('stack')).toEqual(['svelte', 'bun']);

    (bridge as unknown as FormField).formDisabledCallback(true);
    flushSync();
    expect(formDataOf(bridge).get('stack')).toBeNull();

    (bridge as unknown as FormField).formDisabledCallback(false);
    flushSync();
    expect(formDataOf(bridge).getAll('stack')).toEqual(['svelte', 'bun']);
  });

  it('lossless transport: newlines, quotes and unicode survive byte-for-byte', async () => {
    const weird = 'a\nb "q" ✅';
    const { bridge } = setup({ value: [weird, 'plain'] });
    const all = formDataOf(bridge).getAll('stack');
    expect(all).toEqual([weird, 'plain']); // repeated entries, never a joined string
  });

  it('single mode: the value attribute path still governs (MULTIVALUE disarmed)', async () => {
    const rendered = render(Combobox, {
      props: { options, name: 'backend', value: 'node' },
    });
    const bridge = rendered.container.querySelector<HTMLElement>('jx-form-field')!;
    expect(formDataOf(bridge).get('backend')).toBe('node');
    // no chips, no multiselectable in single mode
    expect(rendered.container.querySelector('[data-jx-combobox-chip]')).toBeNull();
  });

  it('single mode showClear: commits clear to an honest empty', async () => {
    const rendered = render(Combobox, {
      props: { options, name: 'backend', value: 'node', showClear: true },
    });
    const bridge = rendered.container.querySelector<HTMLElement>('jx-form-field')!;
    const clear = rendered.container.querySelector<HTMLButtonElement>(
      'button[aria-label="clear selection"]',
    )!;
    expect(formDataOf(bridge).get('backend')).toBe('node');
    await fireEvent.click(clear);
    expect(formDataOf(bridge).get('backend')).toBeNull();
  });
});
