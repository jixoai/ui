/**
 * The props-table migration's zero-content-drift lock
 * (docs-demo-standard task 4.2, pilot batch: select, popover, checkbox,
 * card-grid, date-picker, toast, combobox).
 *
 * The LEGACY arrays below are the FROZEN hand-written tables as they
 * rendered on 2026-08-30 (git-time truth, mechanically extracted from
 * the pre-migration pages). The meta-sourced render
 * (propsFromMeta(meta, docs)) must reproduce every row's CONTENT
 * byte-for-byte: type, default, description, required, bindable, and
 * the row count. Row ORDER follows the interface declaration order
 * now — each page's rendered order is pinned explicitly below, so any
 * future order change is a conscious snapshot edit, not silent drift.
 *
 * One intentional content ADDITION is pinned: date-picker's `locale`
 * row — the hand-written table predated the prop (stale; the exact
 * drift this change exists to kill).
 *
 * Snapshot edit 2026-09-03 (context-defaults-economy task 4.3 — the
 * ambient column's deliberate 先破再立):
 *   - PropNode carries an optional `ambient` field ('zone' | 'scope' |
 *     'own'), written by component-metadata-gen from the family
 *     Defaults slot facts; the cell projection below pins it as the
 *     sixth content field.
 *   - The density rows' `inherited` display default RETIRED: the
 *     effective default is runtime-resolved and the IR ambient field
 *     carries it (the Default column renders `ambient scope`); the
 *     descriptions adopt the W-wave frozen phrasing.
 *   - The slot-carrying variant rows pin `ambient: 'own'`.
 *   - popover's variant Props type became the imported
 *     PopoverSurfaceVariant alias (W2): the meta honestly degrades to
 *     an opaque, so the union text + inline default live in the docs
 *     override (the documented extraction ceiling) — content unchanged
 *     byte-for-byte.
 *
 * The curation-accountability matrix (which override fields each docs
 * module uses) is pinned too: a new correction can only land by
 * editing this file, which is the review seam for extractor ceilings.
 */
import { describe, expect, it } from 'vitest';
import { propsFromMeta, type PropEntry, type PropsDocs } from '../src/lib/ui/props-table/from-meta';
import { meta as selectMeta } from '../src/lib/meta/select.meta';
import { meta as popoverMeta } from '../src/lib/meta/popover.meta';
import { meta as checkboxMeta } from '../src/lib/meta/checkbox.meta';
import { meta as cardGridMeta } from '../src/lib/meta/card-grid.meta';
import { meta as datePickerMeta } from '../src/lib/meta/date-picker.meta';
import { meta as toastViewportMeta } from '../src/lib/meta/toast-viewport.meta';
import { meta as comboboxMeta } from '../src/lib/meta/combobox.meta';
import { SELECT_DOCS } from '../src/lib/ui/props-table/docs/select.docs';
import { POPOVER_DOCS } from '../src/lib/ui/props-table/docs/popover.docs';
import { CHECKBOX_DOCS } from '../src/lib/ui/props-table/docs/checkbox.docs';
import { CARD_GRID_DOCS } from '../src/lib/ui/props-table/docs/card-grid.docs';
import { DATE_PICKER_DOCS } from '../src/lib/ui/props-table/docs/date-picker.docs';
import { TOAST_VIEWPORT_DOCS } from '../src/lib/ui/props-table/docs/toast-viewport.docs';
import { COMBOBOX_DOCS } from '../src/lib/ui/props-table/docs/combobox.docs';

// ── the frozen legacy tables (2026-08-30, pre-migration) ───────────────

const LEGACY: Record<string, PropEntry[]> = {
  select: [
    { name: 'options', type: 'SelectOption[]', default: '—', description: 'The full option list; order = panel order.', required: true },
    { name: 'value', type: 'string', default: '—', description: 'Committed value; undefined shows the placeholder.', bindable: true },
    { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Trigger text when nothing is selected.' },
    { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the trigger.' },
    { name: 'name', type: 'string', default: '—', description: 'Form field name — the bridge submits the committed value under it.' },
    { name: 'error', type: 'string', default: '—', description: 'Error text: sets aria-invalid, wires aria-describedby, dashes the shell.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the trigger and the form-bridge field.' },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Reserved extension direction — not implemented in v1 (warns).' },
    { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface fill of the panel.', ambient: 'own' },
    { name: 'density', type: "'xs' | 'sm' | 'default' | 'lg'", default: '—', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.', ambient: 'scope' },
  ],
  popover: [
    { name: 'id', type: 'string', default: '—', description: 'Popover id: popovertarget association + the CSS anchor name.', required: true },
    { name: 'triggerLabel', type: 'string', default: "''", description: 'Default trigger button label; ignored when a trigger snippet is given.' },
    { name: 'placement', type: "'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start' | 'left' | 'right' | 'center'", default: "'bottom-end'", description: 'The INITIAL anchored position; chosen once at open, never re-evaluated while open.' },
    { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface paint.', ambient: 'own' },
    { name: 'tryFallbacks', type: 'string', default: "''", description: 'Raw position-try value — custom @position-try idents replace the default flip series.' },
    { name: 'gap', type: 'number | string', default: '—', description: 'Anchor gap, margin semantics — number = uniform px; shorthand gaps only the facing side. Invalid input is ignored.' },
    { name: 'trigger', type: 'Snippet', default: '—', description: 'Custom trigger control; anchoring stays component-owned.' },
    { name: 'panelClass', type: 'string', default: "''", description: 'Appended to the panel (width, grid, tokens — never anchoring).' },
    { name: 'onToggle', type: '(open: boolean) => void', default: '—', description: 'Mirrors the native toggle event; the only open-state source of truth.' },
    { name: 'children', type: 'Snippet', default: '—', description: 'The whole panel body.', required: true },
    { name: 'bind:this', type: '{ show, hide, toggle }', default: '—', description: 'Imperative handle — thin native passthroughs for exceptional triggers.' },
  ],
  checkbox: [
    { name: 'label', type: 'string', default: '—', description: 'Same-row label rendered with label[for].' },
    { name: 'labelSide', type: "'left' | 'right'", default: "'right'", description: 'Places the label before or after the control.' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Sets the native indeterminate IDL state.' },
    { name: 'error', type: 'string', default: '—', description: 'Adds invalid state and an associated message.' },
    { name: 'density', type: 'Density', default: '—', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.', ambient: 'scope' },
    { name: 'checked', type: 'boolean', default: '—', description: 'Bindable controlled checked state.', bindable: true },
  ],
  'card-grid': [
    { name: 'min', type: 'string', default: "'320px'", description: 'Minimum column width before the grid collapses a column (any CSS length).' },
    { name: 'children', type: 'Snippet', default: '—', description: 'The cards; each child spans the two shared rows.' },
    { name: 'class', type: 'string', default: "''", description: 'Forwarded to the grid container.' },
  ],
  'date-picker': [
    { name: 'value', type: 'string', default: '—', description: 'ISO "YYYY-MM-DD" (or canonical "YYYY-MM-DDTHH:mm" with showTime); single mode committed value.', bindable: true },
    { name: 'range', type: 'DatePickerRange', default: '—', description: '{ start?, end? }; range mode committed value.', bindable: true },
    { name: 'mode', type: "'single' | 'range'", default: "'single'", description: 'Commit mode for the calendar.' },
    { name: 'showTime', type: 'boolean', default: 'false', description: 'v1 single-mode ONLY — mode="range" + showTime is a type error. Canonical "YYYY-MM-DDTHH:mm" local wall-clock value; the TimeStepper row mutates the time part, the grid the date part; each preserves the other.' },
    { name: 'presets', type: 'DatePickerPreset[]', default: '—', description: 'Quick-pick lane entries ({ label, value: ISO date | { start, end } }); activation rides the exact grid-pick pipeline (commit + close). Malformed values are dropped.' },
    { name: 'preset', type: 'Snippet<[DatePickerPreset]>', default: '—', description: 'Snippet escape for per-entry rich content; default renders the label text.' },
    { name: 'isDisabled', type: '(iso: string) => boolean', default: '—', description: 'Consumer day predicate — true days wear the outside-day law (visible, not-allowed, uncommittable); the arrow walk skips them.' },
    { name: 'label', type: 'string', default: '—', description: 'Field label; renders label[for] above the trigger.' },
    { name: 'error', type: 'string', default: '—', description: 'Error text → aria-invalid + describedby + dashed trigger.' },
    { name: 'placeholder', type: 'string', default: "'Select date...'", description: 'Trigger text when nothing is committed.' },
    { name: 'min', type: 'string', default: '—', description: 'ISO date; earlier days render disabled.' },
    { name: 'max', type: 'string', default: '—', description: 'ISO date; later days render disabled.' },
    { name: 'format', type: "'iso' | 'locale'", default: "'iso'", description: 'Display format — the committed value stays canonical regardless.' },
    { name: 'id', type: 'string', default: 'auto', description: 'Wired into label[for] / error[id]; auto-generated when omitted.' },
    { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface variant for the panel fill.', ambient: 'own' },
    { name: 'class', type: 'string', default: "''", description: 'Class passthrough.' },
  ],
  toast: [
    { name: 'store', type: 'ToastStore', default: '—', description: 'The app-created store (createToastStore()) — never a module singleton.', required: true },
    { name: 'maxVisible', type: 'number', default: '4', description: 'Max toasts rendered at once; older ones stay queued behind the +N queued chip. 0 renders none (everything queues — never a wider render).' },
    { name: 'pos', type: 'FloatPos', default: '—', description: 'The float slot’s nine-grid position (left-top … right-bottom). Default right-bottom; the pile grows AWAY from the slot’s block edge and swipes toward its nearest screen edges.' },
    { name: 'expand', type: 'boolean', default: 'false', description: 'Pins the expanded posture — the full list, every card at its own height. Hover/touch still lifts into it while inside.' },
    { name: 'gap', type: 'number', default: '8', description: 'The stack’s rung spacing in px — the collapsed depth stairs and the expanded ladder both space by it.' },
    { name: 'swipeDirections', type: 'readonly SwipeDirection[]', default: '—', description: 'Default swipe directions when a push names none — resolved per SLOT toward its nearest screen edges (right-bottom → right + down; the center takes none).' },
    { name: 'class', type: 'string', default: "''", description: 'Extra classes on the corner stack.' },
  ],
  combobox: [
    { name: 'options', type: 'ComboboxOption[]', default: '—', description: 'The full option list (order = panel order): { value, label, description?, disabled? }.', required: true },
    { name: 'value', type: 'string | string[]', default: '—', description: 'Committed value (bind:value) — a listed option’s value or a custom string; in multiple mode the selected string[] in SELECTION ORDER (breaking: no compat shim).', bindable: true },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Multi-select: options toggle membership, trigger chips + panel check states, aria-multiselectable, and the bridge commits repeated same-name FormData entries via the MULTIVALUE seam.' },
    { name: 'showClear', type: 'boolean', default: 'false', description: '× in the trigger lane when something is committed; clearing submits honestly empty.' },
    { name: 'placeholder', type: 'string', default: "'Search or type...'", description: 'Input placeholder while nothing is committed.' },
    { name: 'label', type: 'string', default: '—', description: 'Renders label[for] above the control.' },
    { name: 'name', type: 'string', default: '—', description: 'Form field name — intercepted off the input; the bridge submits the VALUE, never the display text.' },
    { name: 'error', type: 'string', default: '—', description: 'Adds aria-invalid + aria-describedby + the dashed border.' },
    { name: 'id', type: 'string', default: 'auto', description: 'Wired into label[for] / error[id]; auto-generated when omitted.' },
    { name: 'allowCustom', type: 'boolean', default: 'true', description: 'Accept typed text that matches no option as the committed value (multiple: it joins the selection as a chip).' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input, the chips and the chevron together.' },
    { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface paint of the panel.', ambient: 'own' },
    { name: 'class', type: 'string', default: "''", description: 'Forwarded to the shell.' },
  ],
};

// The single pinned content addition: the locale row the stale
// hand-written date-picker table never had (added by the interface
// 2026-08-30, surfaced by the meta source).
const DATE_PICKER_LOCALE_ROW: PropEntry = {
  name: 'locale',
  type: 'string',
  default: '—',
  description: "BCP 47 locale for the panel vocabulary + the 'locale' display format (Intl.DateTimeFormat); default = the page's <html lang>.",
};

// ── the seven pilots, wired ────────────────────────────────────────────

const PILOTS: { name: string; meta: typeof selectMeta; docs: PropsDocs; renderedOrder: string[] }[] = [
  {
    name: 'select',
    meta: selectMeta,
    docs: SELECT_DOCS,
    renderedOrder: ['options', 'density', 'value', 'placeholder', 'label', 'name', 'error', 'multiple', 'variant', 'disabled'],
  },
  {
    name: 'popover',
    meta: popoverMeta,
    docs: POPOVER_DOCS,
    renderedOrder: ['id', 'triggerLabel', 'placement', 'variant', 'tryFallbacks', 'gap', 'trigger', 'panelClass', 'onToggle', 'children', 'bind:this'],
  },
  {
    name: 'checkbox',
    meta: checkboxMeta,
    docs: CHECKBOX_DOCS,
    renderedOrder: ['label', 'error', 'labelSide', 'indeterminate', 'checked', 'density'],
  },
  {
    name: 'card-grid',
    meta: cardGridMeta,
    docs: CARD_GRID_DOCS,
    renderedOrder: ['min', 'class', 'children'],
  },
  {
    name: 'date-picker',
    meta: datePickerMeta,
    docs: DATE_PICKER_DOCS,
    renderedOrder: ['value', 'range', 'mode', 'showTime', 'label', 'error', 'placeholder', 'min', 'max', 'format', 'locale', 'presets', 'preset', 'isDisabled', 'id', 'variant', 'class'],
  },
  {
    name: 'toast',
    meta: toastViewportMeta,
    docs: TOAST_VIEWPORT_DOCS,
    renderedOrder: ['store', 'maxVisible', 'pos', 'expand', 'gap', 'swipeDirections', 'class'],
  },
  {
    name: 'combobox',
    meta: comboboxMeta,
    docs: COMBOBOX_DOCS,
    renderedOrder: ['options', 'value', 'multiple', 'placeholder', 'label', 'name', 'error', 'id', 'allowCustom', 'showClear', 'disabled', 'variant', 'class'],
  },
];

const cell = (row: PropEntry): string =>
  JSON.stringify([row.type, row.default ?? null, row.description, row.required ?? false, row.bindable ?? false, row.ambient ?? null]);

describe('props-table meta migration — zero content drift (pilot seven)', () => {
  for (const pilot of PILOTS) {
    it(`${pilot.name}: every legacy row's content survives byte-for-byte`, () => {
      const rendered = propsFromMeta(pilot.meta, pilot.docs);
      const legacy =
        pilot.name === 'date-picker' ? [...LEGACY['date-picker'], DATE_PICKER_LOCALE_ROW] : LEGACY[pilot.name];
      expect(rendered.length, 'row count').toBe(legacy.length);

      const renderedByName = new Map(rendered.map((r) => [r.name, r]));
      for (const row of legacy) {
        const got = renderedByName.get(row.name);
        expect(got, `row ${pilot.name}.${row.name} present`).toBeDefined();
        expect(cell(got!), `row ${pilot.name}.${row.name} content`).toBe(cell(row));
      }
      // no extra rows beyond the legacy set
      for (const name of renderedByName.keys()) {
        expect(legacy.some((r) => r.name === name), `no unlisted row ${pilot.name}.${name}`).toBe(true);
      }
    });

    it(`${pilot.name}: rendered order is the pinned interface order`, () => {
      const rendered = propsFromMeta(pilot.meta, pilot.docs);
      expect(rendered.map((r) => r.name)).toEqual(pilot.renderedOrder);
    });
  }

  it('the meta files carry the registry source paths (provenance)', () => {
    expect(selectMeta.source).toBe('registry/files/ui/select/select.svelte');
    expect(popoverMeta.source).toBe('registry/files/ui/popover/popover.svelte');
    expect(checkboxMeta.source).toBe('registry/files/ui/checkbox/checkbox.svelte');
    expect(cardGridMeta.source).toBe('registry/files/ui/card-grid/card-grid.svelte');
    expect(datePickerMeta.source).toBe('registry/files/ui/date-picker/date-picker.svelte');
    expect(toastViewportMeta.source).toBe('registry/files/ui/toast/toast-viewport.svelte');
    expect(comboboxMeta.source).toBe('registry/files/ui/combobox/combobox.svelte');
  });
});

// ── curation accountability: which override fields are in play ────────
//
// The GENERATED zone owns name/type/default where it can; the override
// fields below (in the projection's field order: type, default,
// required, bindable, hide, description) are the honest extraction
// ceilings (design.md §1). A new override landing here means an
// interface changed under a ceiling — conscious snapshot edit required.
const OVERRIDE_FIELDS_IN_PLAY = {
  select: {
    options: ['required', 'description'],
    value: ['bindable', 'description'],
    placeholder: ['description'],
    label: ['description'],
    name: ['description'],
    error: ['description'],
    multiple: ['description'],
    variant: ['description'],
    density: ['type', 'description'],
    disabled: ['description'],
    id: ['hide'],
    'data-density': ['hide'],
    class: ['hide'],
    rest: ['hide'],
  },
  popover: {
    id: ['required', 'description'],
    triggerLabel: ['description'],
    placement: ['description'],
    variant: ['type', 'default', 'description'],
    tryFallbacks: ['description'],
    gap: ['description'],
    trigger: ['description'],
    panelClass: ['description'],
    onToggle: ['description'],
    children: ['required', 'description'],
  },
  checkbox: {
    label: ['description'],
    labelSide: ['description'],
    indeterminate: ['description'],
    error: ['description'],
    density: ['description'],
    checked: ['bindable', 'description'],
    id: ['hide'],
    'data-density': ['hide'],
    class: ['hide'],
    rest: ['hide'],
  },
  'card-grid': {
    min: ['description'],
    children: ['description'],
    class: ['description'],
  },
  'date-picker': {
    value: ['type', 'bindable', 'description'],
    range: ['type', 'bindable', 'description'],
    mode: ['type', 'description'],
    showTime: ['description'],
    presets: ['type', 'description'],
    preset: ['type', 'description'],
    isDisabled: ['type', 'description'],
    label: ['type', 'description'],
    error: ['type', 'description'],
    placeholder: ['description'],
    min: ['type', 'description'],
    max: ['type', 'description'],
    format: ['type', 'description'],
    locale: ['type', 'description'],
    id: ['type', 'default', 'description'],
    variant: ['type', 'description'],
    class: ['description'],
  },
  toast: {
    store: ['required', 'description'],
    maxVisible: ['description'],
    pos: ['description'],
    expand: ['description'],
    gap: ['description'],
    swipeDirections: ['description'],
    class: ['description'],
  },
  combobox: {
    options: ['required', 'description'],
    value: ['type', 'bindable', 'description'],
    multiple: ['type', 'default', 'description'],
    showClear: ['description'],
    placeholder: ['description'],
    label: ['description'],
    name: ['description'],
    error: ['description'],
    id: ['default', 'description'],
    allowCustom: ['description'],
    disabled: ['description'],
    variant: ['description'],
    class: ['description'],
    rest: ['hide'],
  },
};

describe('curation accountability — the override-field matrix is pinned', () => {
  for (const pilot of PILOTS) {
    it(`${pilot.name}: override fields match the pinned matrix`, () => {
      const matrix: Record<string, string[]> = {};
      for (const [prop, override] of Object.entries(pilot.docs.overrides ?? {})) {
        const fields = (['type', 'default', 'required', 'bindable', 'hide', 'description'] as const).filter(
          (f) => override[f] !== undefined,
        );
        matrix[prop] = fields;
      }
      expect(matrix).toEqual(OVERRIDE_FIELDS_IN_PLAY[pilot.name]);
    });
  }
});
