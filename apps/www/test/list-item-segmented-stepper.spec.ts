/**
 * ItemSegmented + ItemStepper — grindstone #17-3, the two adapters
 * that retire the canvas-authored seg/stepper idioms (its own css
 * called them "button rows without a registry adapter yet"). Five
 * lock groups:
 *
 *  1. ItemStepper chrome + bounds: data-chrome resolves 'bare' inside
 *     an integrated field row, 'frame' standalone; min/max clamp and
 *     step snap land 0.1+0.1 on 0.2 (never 0.3000…4).
 *  2. ItemStepper aria + disabled: label[for] → the native input's id;
 *     error → aria-invalid + the describedby chain; disabled → the
 *     input turns READONLY (AT-readable) and both buttons disable.
 *  3. ItemSegmented native-radio contract: role=radiogroup over N
 *     radios sharing name=controlId — the name-scoped grouping that
 *     OWNS arrow-walk + one tab stop in real engines (jsdom does not
 *     implement radio arrow-walking; the contract facts here are what
 *     make browsers do it — the aria-pressed button rows could never
 *     claim them). Native exclusivity + no re-press clear.
 *  4. ItemSegmented wiring: aria-labelledby to the field's labelId,
 *     describedby chain, NO duplicate self-rendered aria-label;
 *     options data-driven rendering + the children escape hatch.
 *  5. The chrome axis on the shared sheet: the FRAMED cluster is
 *     byte-frozen (the pre-#17 cluster, git-extracted, must survive
 *     verbatim); the bare rung source-pins to the borderless-chrome
 *     law (no border, ghost hover wash, flex fill for wrapped lines);
 *     DOM resolution: standalone frame / self field frame / integrated
 *     bare / explicit chrome prop beats the ambient.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/item-seg-step-host.svelte';

const css = readFileSync(resolve(__dirname, '../src/lib/jixoai.css'), 'utf8');

// ---------------------------------------------------------------------------
// ItemStepper — chrome, bounds, aria, disabled
// ---------------------------------------------------------------------------
describe('ItemStepper (ItemField + NumberInput)', () => {
  it('resolves the chrome ambient: integrated row → bare, standalone control → frame', () => {
    const { container } = render(Host);
    const integrated = container.querySelector('#n1')!.closest('[data-chrome]');
    expect(integrated?.getAttribute('data-chrome')).toBe('bare');
    expect(
      container
        .querySelector('[data-testid="standalone"] .jx-html-tgroup')!
        .getAttribute('data-chrome'),
    ).toBe('frame');
  });

  it('step snap: 0.1 + 0.1 lands on 0.2 (the float-step law), clamped into [min, max]', async () => {
    const { container } = render(Host);
    const plus = container.querySelector('[data-jx-num-plus]') as HTMLButtonElement;
    const input = container.querySelector('#n1') as HTMLInputElement;
    expect(input.value).toBe('0.1');
    await fireEvent.pointerDown(plus);
    await fireEvent.pointerUp(window);
    flushSync();
    expect(input.value).toBe('0.2'); // NOT 0.30000000000000004
    // clamp: step 0.1 from 0.2 … the max is 1 — press until the wall
    for (let i = 0; i < 12; i += 1) {
      await fireEvent.pointerDown(plus);
      await fireEvent.pointerUp(window);
    }
    flushSync();
    expect(Number(input.value)).toBe(1);
  });

  it('label[for] association + error wiring ride the NATIVE input', () => {
    const { container } = render(Host);
    expect(container.querySelector('label[for="n2"]')!.id).toBe('n2-label');
    const input = container.querySelector('#n2') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('n2-description n2-error');
    // the id chain the describedby references exists
    for (const id of input.getAttribute('aria-describedby')!.split(' '))
      expect(container.querySelector(`[id="${id}"]`)).toBeTruthy();
  });

  it('disabled: the input turns READONLY (AT-readable) and both buttons disable', () => {
    const { container } = render(Host);
    const input = container.querySelector('#n3') as HTMLInputElement;
    const shell = input.closest('.jx-num')!;
    expect(input.hasAttribute('disabled')).toBe(false);
    expect(input.hasAttribute('readonly')).toBe(true);
    expect(shell.querySelector('[data-jx-num-minus]')!.hasAttribute('disabled')).toBe(true);
    expect(shell.querySelector('[data-jx-num-plus]')!.hasAttribute('disabled')).toBe(true);
  });

  it('the terminal self-inset contract: the wrapper stamps data-self-inset inside the auto lane', () => {
    const { container } = render(Host);
    const wrapper = container.querySelector('[data-jx-num-minus]')!.closest('.jx-field')!;
    expect(wrapper.hasAttribute('data-self-inset')).toBe(true);
    expect(wrapper.closest('[data-slot="item-end"]')!.getAttribute('data-inset')).toBe('auto');
  });
});

// ---------------------------------------------------------------------------
// ItemSegmented — the native radio contract + the field wiring
// ---------------------------------------------------------------------------
describe('ItemSegmented (ItemField + ToggleGroup single)', () => {
  it('radiogroup over N same-name radios — the contract that owns arrow-walk + one tab stop', async () => {
    const { container } = render(Host);
    const group = container.querySelector('#g1-label')!.closest('[data-item-field]')!.querySelector('.jx-html-tgroup') as HTMLElement;
    expect(group.getAttribute('role')).toBe('radiogroup');
    const radios = [...group.querySelectorAll('label > input')] as HTMLInputElement[];
    expect(radios).toHaveLength(3);
    for (const radio of radios) {
      expect(radio.type).toBe('radio');
      expect(radio.name).toBe('g1'); // = the field's controlId
    }
    // native exclusivity + the projection follows (bind:value + callback)
    await fireEvent.click(radios[1]!);
    flushSync();
    expect(radios[1]!.checked).toBe(true);
    expect(radios[0]!.checked).toBe(false);
    expect(container.querySelector('[data-seg]')!.textContent).toBe('b');
    expect(container.querySelector('[data-last-seg]')!.textContent).toBe('b');
    // no re-press clear — native radio semantics (an explicit none item
    // is the pattern), the Owner ruling
    await fireEvent.click(radios[1]!);
    expect(radios[1]!.checked).toBe(true);
    expect(container.querySelector('[data-seg]')!.textContent).toBe('b');
  });

  it('aria wiring: labelledby to the field label, the describedby chain, no duplicate aria-label', () => {
    const { container } = render(Host);
    const group = container.querySelector('#g1-label')!.closest('[data-item-field]')!.querySelector('.jx-html-tgroup') as HTMLElement;
    expect(group.getAttribute('aria-labelledby')).toBe('g1-label');
    expect(group.getAttribute('aria-describedby')).toBe('g1-description');
    expect(group.getAttribute('aria-label')).toBeNull(); // the #17 fix
    expect(container.querySelector('#g1-label')!.tagName).toBe('SPAN'); // radiogroup ⇒ always text mode
  });

  it('options render data-driven; children escape hatch composes ToggleGroupItems', () => {
    const { container } = render(Host);
    const optGroup = container.querySelector('#g1-label')!.closest('[data-item-field]')!.querySelector('.jx-html-tgroup')!;
    expect([...optGroup.querySelectorAll('label')].map((l) => l.textContent!.trim())).toEqual([
      'a',
      'b',
      'c',
    ]);
    const handGroup = container.querySelector('#g2-label')!.closest('[data-item-field]')!.querySelector('.jx-html-tgroup')!;
    expect([...handGroup.querySelectorAll('label')].map((l) => l.textContent!.trim())).toEqual([
      'first',
      'second',
    ]);
  });
});

// ---------------------------------------------------------------------------
// The chrome axis on the shared sheet — framed frozen, bare source-pinned
// ---------------------------------------------------------------------------
describe('toggle-group chrome axis (the shared standard layer)', () => {
  it('the FRAMED cluster survives #17 byte-for-byte (pre-change git extraction)', () => {
    const framed = `.jx-html-tgroup {
  corner-shape: var(--corner-shape, bevel);
  display: inline-flex;
  width: fit-content;
  flex-wrap: wrap;
  overflow: hidden;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--card);
  box-shadow: var(--shadow-2xs);
}

.jx-html-tgroup> label {
  display: inline-flex;
  align-items: center;
  min-block-size: var(--jx-hit, 2.5rem);
  padding-block: calc((var(--jx-hit, 2.5rem) - var(--jx-line, 1.25rem)) / 2);
  padding-inline: var(--jx-inset, 0.75rem);
  font-family: var(--font-nav);
  font-size: var(--jx-text, 0.8125rem);
  line-height: var(--jx-line, 1.25rem);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted-foreground);
  background-color: transparent;
  border-inline-end: 1px solid var(--border);
  cursor: pointer;
  user-select: none;
  transition: color 150ms ease-out, background-color 150ms ease-out;
}

.jx-html-tgroup> label:last-child {
  border-inline-end: 0;
}

.jx-html-tgroup> label:not(:has(input:disabled)):hover {
  color: var(--foreground);
}

.jx-html-tgroup> label:has(input:checked) {
  background-color: var(--primary);
  color: var(--primary-foreground);
}

.jx-html-tgroup> label:has(input:checked):not(:has(input:disabled)):hover {
  color: var(--primary-foreground);
}

.jx-html-tgroup> label:has(input:focus-visible) {
  outline: 1px solid var(--ring);
  outline-offset: -1px;
}

.jx-html-tgroup> label:has(input:disabled) {
  cursor: not-allowed;
  opacity: 0.45;
}

.jx-html-tgroup> label > input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

  @media (prefers-reduced-motion: reduce) {
    .jx-html-tgroup> label {
      transition: none;
    }
  }

`;
    expect(css).toContain(framed);
  });

  it("the bare rung source-pins to the borderless-chrome law (ghost cells + flex fill)", () => {
    expect(css).toContain(".jx-html-tgroup[data-chrome='bare'] {");
    const bare = css.slice(css.indexOf(".jx-html-tgroup[data-chrome='bare']"));
    const containerBlock = bare.slice(0, bare.indexOf('}') + 1);
    expect(containerBlock).toMatch(/border:\s*0/u);
    expect(containerBlock).toMatch(/background:\s*transparent/u);
    expect(containerBlock).toMatch(/box-shadow:\s*none/u);
    const labelBlock = bare.slice(
      bare.indexOf(".jx-html-tgroup[data-chrome='bare']> label"),
      bare.indexOf("\n\n", bare.indexOf(".jx-html-tgroup[data-chrome='bare']> label")),
    );
    expect(labelBlock).toMatch(/border-inline-end:\s*0/u);
    expect(labelBlock).toMatch(/flex:\s*1 1 auto/u); // the dock r2 fill lesson
    expect(labelBlock).toMatch(/justify-content:\s*center/u);
    expect(bare).toContain(
      "color-mix(in oklab, var(--muted) 55%, transparent)",
    ); // ghost hover wash
  });

  it('DOM resolution: standalone frame / self field frame / integrated bare / explicit beats ambient', () => {
    const { container } = render(Host);
    const chrome = (labelText: string) =>
      (
        [...container.querySelectorAll('.jx-html-tgroup')].find((g) =>
          g.textContent.includes(labelText),
        ) as HTMLElement
      ).getAttribute('data-chrome');
    expect(container.querySelector('[data-testid="standalone"] [data-jx-tgroup]')!.getAttribute('data-chrome')).toBe('frame');
    expect(chrome('f1')).toBe('frame');
    expect(chrome('b1')).toBe('bare');
    expect(chrome('o1')).toBe('frame');
  });
});
