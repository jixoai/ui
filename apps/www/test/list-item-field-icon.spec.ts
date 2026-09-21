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
import { checkboxStyles } from '../src/lib/ui/checkbox/checkbox.stylex';
import { radioStyles } from '../src/lib/ui/radio/radio.stylex';
import { nativeSelectStyles } from '../src/lib/ui/native-select/native-select.stylex';
import { inputStyles } from '../src/lib/ui/input/input.stylex';
import { cx } from './helpers/stylex-atom';

const itemCss = readFileSync(resolve(__dirname, '../src/lib/ui/list-item/item.css'), 'utf8');

/** the pre-slot byte baseline (git-clean capture, 2026-09-13;
 *  re-pinned W5-r2 2026-09-21):
 *    - 3e8c38ec (explicit-props W3 batch D1, the eight-axis surface)
 *      added the row's §3/§14 radius consumption — every row now
 *      carries the inline --jx-radius-consumed formula (the auto
 *      arm: max(0px, R − P) × the factor); it is THIS change's own
 *      contract, pinned byte-exact below.
 *    - 012335c4 (dev:false, hashed classes everywhere) retired the
 *      dev-name atom spellings; the baselines carry ATOM placeholders
 *      where atom tokens ride, both sides normalize identically, and
 *      the member identity lives in the cx() membership assertions
 *      inside the test (identity through the shared source modules,
 *      strength unchanged).
 *    - the select row's data-self-inset attribute order follows the
 *      live serialization (attr order is Svelte state, not contract). */
const BASELINE: Record<string, string> = {
  toggle: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" style="--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1));" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-t1-label" for="p-t1">Fast builds</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><!----><!----> <input id="p-t1" type="checkbox" role="switch" class="jx-html-switch"><!----></span><!----></div><!---->`,
  checkbox: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" style="--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1));" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-c1-label" for="p-c1">Beta channel</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><!----><div class="ATOM"><span data-jx-check="" class="jx-check-lane"><input id="p-c1" type="checkbox" class="jx-html-checkbox"> <!----></span> <!----></div><!----></span><!----></div><!---->`,
  radio: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" style="--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1));" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-r1-label" for="p-r1">Stable</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><div class="ATOM"><span data-jx-check="" class="jx-check-lane"><input type="radio" id="p-r1" class="jx-html-radio" name="chan" value="stable"> <!----></span> <!----></div><!----></span><!----></div><!---->`,
  select: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" style="--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1));" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-s1-label" for="p-s1">Density</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><div data-self-inset="" class="jx-field"><!----> <span class="jx-select-wrap ATOM"><select id="p-s1" class="jx-html-select ATOM" data-chrome="bare"><!----><!----><option value="sm">sm</option> <option value="md">md</option><!----><!----></select></span> <!----></div><!----></span><!----></div><!---->`,
  input: `<!----><!----><div data-item-field="for" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" style="--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1));" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><label class="jx-item-field-label" id="p-i1-label" for="p-i1">Project name</label><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><!----><div class="jx-field" data-self-inset=""><!----> <div class="jx-html-control-shell  jx-slotted" data-chrome="bare" data-icon-position="auto"><!----> <!----> <!----> <input type="text" id="p-i1" class="jx-html-control-lane"> <span data-jx-semantic-icon="" aria-hidden="true" class="ATOM"><!----><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-jx-icon="" fill="none" stroke="currentColor"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" x2="15" y1="20" y2="20"></line><line x1="12" x2="12" y1="4" y2="20"></line></svg><!----></span><!----> <!----> <!----> <!----> <!----></div><!----> <!----> <!----> <!----> <!----></div><!----></span><!----></div><!---->`,
  raw: `<!----><!----><div data-item-field="text" data-control-chrome="integrated" data-slot="item" data-variant="auto" data-item-chrome="surface" data-layout="standard" style="--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1));" class="jx-item jx-item-field"><!----><!----><!----><div data-slot="item-content"><!----><span class="jx-item-field-label" id="p-f1-label">Custom control</span><!----> <!----> <!----><!----></div><!----> <span data-slot="item-end" data-align="center" data-wrap="never" data-inset="auto"><!----><button type="button" aria-labelledby="p-f1-label">act</button><!----></span><!----></div><!---->`
};

/** compile-lane normalization (W5-r2, 2026-09-21): a stylex atom
 *  token is a bare x-hash (x + ≥6 [0-9a-z] — no semantic class in
 *  these trees starts with x) or a legacy dev-name prefix; contiguous
 *  atom runs collapse to the ATOM placeholder the baselines carry,
 *  then class-attr bodies re-trim. Every other byte stays pinned. */
const ATOM_TOKEN = '[a-z][a-zA-Z0-9-]*__[a-zA-Z0-9]+\\.[a-zA-Z0-9]+|\\bx[0-9a-z]{5,}\\b';
const normalizeAtoms = (html: string): string =>
  html
    .replace(new RegExp(`(?:${ATOM_TOKEN})(?:\\s+(?:${ATOM_TOKEN}))*`, 'gu'), 'ATOM')
    .replace(/(class=")([^"]*)"/gu, (_m, head: string, body: string) => `${head}${body.trim()}"`);

const row = (container: HTMLElement, scope: string, kind: string) =>
  container.querySelector(`[data-${scope}] [data-icon-row="${kind}"]`)!;

describe('icon omitted — the byte-identical regression lock', () => {
  it('every plain row renders exactly the pre-slot DOM', () => {
    const { container } = render(Host);
    for (const [kind, baseline] of Object.entries(BASELINE)) {
      expect(normalizeAtoms(row(container, 'plain', kind).innerHTML.trim()), kind).toBe(baseline);
    }
    // the atom MEMBER identity the baselines' dev names used to carry
    // (compile-lane re-pin W5-r2 — the atom STRINGS after 012335c4):
    // membership through the shared cx join, per atom-bearing node
    const checkboxHost = row(container, 'plain', 'checkbox').querySelector('div:not([data-slot]) > .jx-check-lane')!.parentElement!;
    expect(checkboxHost.className).toContain(cx(checkboxStyles.host));
    const radioHost = row(container, 'plain', 'radio').querySelector('div:not([data-slot]) > .jx-check-lane')!.parentElement!;
    expect(radioHost.className).toContain(cx(radioStyles.host));
    const selectWrap = row(container, 'plain', 'select').querySelector('.jx-select-wrap')!;
    expect(selectWrap.className).toContain(cx(nativeSelectStyles.wrap));
    const selectControl = row(container, 'plain', 'select').querySelector('select.jx-html-select')!;
    expect(selectControl.className).toContain(cx(nativeSelectStyles.control));
    const iconLane = row(container, 'plain', 'input').querySelector('[data-jx-semantic-icon]')!;
    expect(iconLane.className).toContain(cx(inputStyles.iconLane));
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
