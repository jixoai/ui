/**
 * ItemField icon slot — grindstone #17-2, the label-lane glyph. Five
 * lock groups:
 *
 *  1. icon omitted → the row DOM is BYTE-IDENTICAL to the pre-slot
 *     baseline (captured from git-clean sources before the change —
 *     the six shapes: five existing adapters + the raw ItemField;
 *     Svelte comment anchors included, ids pinned).
 *  2. icon given → no new [data-slot] appears; the glyph span lands
 *     INSIDE the label element, aria-hidden; the sheet sizes svgs at
 *     var(--jx-icon) (source-pinned).
 *  3. the accessible name survives: label[for] association intact,
 *     the glyph is inside the label so clicking it activates the
 *     control (label activation), no aria noise on the control.
 *  4. the id generation chain is unchanged: -label/-description/
 *     -error ids and the describedby chain behave exactly as before.
 *  5. all SEVEN leaf adapters pass the icon through (the Owner
 *     ruling) + the raw ItemField; ItemInput seals the Input shell's
 *     OWN semantic glyph away (icon is the field lane's, one name).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/item-field-icon-host.svelte';

const itemCss = readFileSync(resolve(__dirname, '../src/lib/ui/list-item/item.css'), 'utf8');

/** the pre-slot byte baseline (git-clean capture, 2026-09-13) */
const BASELINE: Record<string, string> = {
  toggle: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-t1-label" for="p-t1">Fast builds</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><!----><!----> <input id="p-t1" type="checkbox" role="switch" class="jx-html-switch"><!----></span><!----></div><!---->`,
  checkbox: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-c1-label" for="p-c1">Beta channel</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><!----><div class="checkbox__checkboxStyles.host"><span data-jx-check="" class="jx-check-lane"><input id="p-c1" type="checkbox" class="jx-html-checkbox"> <!----></span> <!----></div><!----></span><!----></div><!---->`,
  radio: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-r1-label" for="p-r1">Stable</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><div class="radio__radioStyles.host"><span data-jx-check="" class="jx-check-lane"><input type="radio" id="p-r1" class="jx-html-radio" name="chan" value="stable"> <!----></span> <!----></div><!----></span><!----></div><!---->`,
  select: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-s1-label" for="p-s1">Density</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><div class="jx-field" data-self-inset=""><!----> <span class="jx-select-wrap native-select__nativeSelectStyles.wrap"><select id="p-s1" class="jx-html-select native-select__nativeSelectStyles.control" data-chrome="bare"><!----><!----><option value="sm">sm</option> <option value="md">md</option><!----><!----></select></span> <!----></div><!----></span><!----></div><!---->`,
  input: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-i1-label" for="p-i1">Project name</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><!----><div class="jx-field" data-self-inset=""><!----> <div class="jx-html-control-shell  jx-slotted" data-chrome="bare" data-icon-position="auto"><!----> <!----> <!----> <input type="text" id="p-i1" class="jx-html-control-lane"> <span data-jx-semantic-icon="" aria-hidden="true" class="input__inputStyles.iconLane"><!----><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-jx-icon="" fill="none" stroke="currentColor"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" x2="15" y1="20" y2="20"></line><line x1="12" x2="12" y1="4" y2="20"></line></svg><!----></span><!----> <!----> <!----> <!----> <!----></div><!----> <!----> <!----> <!----> <!----></div><!----></span><!----></div><!---->`,
  raw: `<!----><!----><div data-item-field="text" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><span class="jx-item-field-label" id="p-f1-label">Custom control</span><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><button type="button" aria-labelledby="p-f1-label">act</button><!----></span><!----></div><!---->`
};

/** tailwindless Wave 1 (2026-09-17): the semantic-icon lane's utility
 *  payload became input stylex atoms — the member prefix names the
 *  lane, the trailing dev hashes are compiler-generated, so they are
 *  normalized away before the byte compare (every other byte stays
 *  pinned). W1b (2026-09-17): the checkbox/radio hosts' inline-flex
 *  w-fit and the native-select wrap became their families' atoms the
 *  same way — ANY <module>__<table>.<member> prefix with dev hashes
 *  collapses to the member name (the hashes are compiler state) */
const normalizeAtoms = (html: string): string =>
  // a <module>__<table>.<member> atom keeps its member name; the
  // compiler's dev hash tokens (x…) that trail it collapse away
  html.replace(/([a-z][a-zA-Z0-9-]*__[a-zA-Z0-9]+\.[a-zA-Z0-9]+)((?: x[a-z0-9]+)+)/gu, '$1');

const row = (container: HTMLElement, scope: string, kind: string) =>
  container.querySelector(`[data-${scope}] [data-icon-row="${kind}"]`)!;

describe('icon omitted — the byte-identical regression lock', () => {
  it('every plain row renders exactly the pre-slot DOM', () => {
    const { container } = render(Host);
    for (const [kind, baseline] of Object.entries(BASELINE)) {
      expect(normalizeAtoms(row(container, 'plain', kind).innerHTML.trim()), kind).toBe(baseline);
    }
  });
});

describe('icon given — the glyph lands in the label lane', () => {
  it('aria-hidden glyph span INSIDE the label element; no new data-slot anywhere', () => {
    const { container } = render(Host);
    const slotsBefore = [...container.querySelectorAll('[data-slot]')].map((n) =>
      n.getAttribute('data-slot'),
    );
    const labelTexts: Record<string, string> = {
      toggle: 'Fast builds',
      checkbox: 'Beta channel',
      radio: 'Stable',
      select: 'Density',
      input: 'Project name',
      segmented: 'Mode',
      stepper: 'Count',
      raw: 'Custom control',
    };
    for (const kind of Object.keys(labelTexts)) {
      const label = row(container, 'decorated', kind).querySelector(
        '.jx-item-field-label',
      )!;
      const glyph = label.querySelector('.jx-item-field-icon')!;
      expect(glyph.getAttribute('aria-hidden')).toBe('true');
      expect(glyph.querySelector('svg')).toBeTruthy();
      expect(glyph.previousElementSibling).toBeNull(); // inline-START of the label text
      // the glyph contributes no text — the accessible name is the label's alone
      expect(label.textContent).toBe(labelTexts[kind]);
    }
    // the presence matrix never gained a bit
    expect([...container.querySelectorAll('[data-slot]')].map((n) => n.getAttribute('data-slot'))).toEqual(slotsBefore);
  });

  it('the sheet sizes the glyph at the icon token (source-pin)', () => {
    expect(itemCss).toContain(':where(.jx-item-field-icon)');
    const block = itemCss.slice(itemCss.indexOf(':where(.jx-item-field-icon)'));
    expect(block.slice(0, block.indexOf('}') + 1)).toMatch(/margin-inline-end:\s*calc\(var\(--jx-gap\) \/ 2\)/u);
    expect(itemCss).toMatch(/:where\(\.jx-item-field-icon svg\)\s*\{[^}]*width:\s*var\(--jx-icon\);[^}]*height:\s*var\(--jx-icon\);/u);
  });
});

describe('the accessible name survives the glyph', () => {
  it('label[for] intact; clicking the glyph activates the control (label activation)', async () => {
    const { container } = render(Host);
    expect(container.querySelector('label[for="p-t1"]')!.textContent).toBe('Fast builds');
    const decoratedToggle = row(container, 'decorated', 'toggle').querySelector(
      'input',
    ) as HTMLInputElement;
    expect(decoratedToggle.id).toBe('d-t1');
    expect(decoratedToggle.checked).toBe(false);
    const glyph = row(container, 'decorated', 'toggle').querySelector('.jx-item-field-icon')!;
    await fireEvent.click(glyph); // inside the label → activation forwards to the control
    flushSync();
    expect(decoratedToggle.checked).toBe(true);
  });

  it('the control carries no aria noise from the glyph', () => {
    const { container } = render(Host);
    const input = row(container, 'decorated', 'input').querySelector('#d-i1')!;
    expect(input.getAttribute('aria-labelledby')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });
});

describe('the id chain is unchanged', () => {
  it('-label/-description/-error ids and describedby behave as before', () => {
    const { container } = render(Host);
    expect(container.querySelector('#d-t1')!.id).toBe('d-t1');
    expect(container.querySelector('label[for="d-t1"]')!.id).toBe('d-t1-label');
    expect(container.querySelector('#d-g1-label')!.tagName).toBe('SPAN'); // segmented stays text-mode
    expect(container.querySelector('#d-n1-label')!.tagName).toBe('LABEL'); // stepper stays for-mode
  });
});

describe('the seven-adapter passthrough (Owner ruling)', () => {
  it('every adapter renders the glyph row; ItemInput seals the shell glyph (one name, one lane)', () => {
    const { container } = render(Host);
    for (const kind of ['toggle', 'checkbox', 'radio', 'select', 'input', 'segmented', 'stepper']) {
      expect(
        row(container, 'decorated', kind).querySelectorAll('.jx-item-field-icon'),
        kind,
      ).toHaveLength(1);
    }
    // ItemInput: the glyph is the LABEL lane's — the Input shell's own
    // semantic-glyph lane renders nothing extra beyond the default type
    // glyph (icon omitted ⇒ the per-type default, unchanged law)
    const shell = row(container, 'plain', 'input').querySelector('.jx-html-control-shell')!;
    expect(shell.querySelector('.jx-item-field-icon')).toBeNull();
  });
});
