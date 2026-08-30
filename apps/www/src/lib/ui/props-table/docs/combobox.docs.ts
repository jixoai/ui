/**
 * combobox — the docs curation over the GENERATED meta
 * (docs-demo-standard pilot migration; zero-content-drift pinned by
 * test/props-table-meta-drift.spec.ts).
 *
 * The generic ceiling: `value: Multiple extends true ? string[] :
 * string` and `multiple: Multiple` degrade to their raw source text —
 * corrected here to the instantiated contract (design.md §1). `rest`
 * (the heritage spread) hides; `id`'s default is runtime-resolved.
 */
import type { PropsDocs } from '../from-meta';

export const COMBOBOX_DOCS: PropsDocs = {
  overrides: {
    options: {
      description: 'The full option list (order = panel order): { value, label, description?, disabled? }.',
      required: true,
    },
    value: {
      type: 'string | string[]',
      description: 'Committed value (bind:value) — a listed option’s value or a custom string; in multiple mode the selected string[] in SELECTION ORDER (breaking: no compat shim).',
      bindable: true,
    },
    multiple: {
      type: 'boolean',
      default: 'false',
      description: 'Multi-select: options toggle membership, trigger chips + panel check states, aria-multiselectable, and the bridge commits repeated same-name FormData entries via the MULTIVALUE seam.',
    },
    showClear: {
      description: '× in the trigger lane when something is committed; clearing submits honestly empty.',
    },
    placeholder: {
      description: 'Input placeholder while nothing is committed.',
    },
    label: {
      description: 'Renders label[for] above the control.',
    },
    name: {
      description: 'Form field name — intercepted off the input; the bridge submits the VALUE, never the display text.',
    },
    error: {
      description: 'Adds aria-invalid + aria-describedby + the dashed border.',
    },
    id: {
      default: 'auto',
      description: 'Wired into label[for] / error[id]; auto-generated when omitted.',
    },
    allowCustom: {
      description: 'Accept typed text that matches no option as the committed value (multiple: it joins the selection as a chip).',
    },
    disabled: {
      description: 'Disable the input, the chips and the chevron together.',
    },
    variant: {
      description: 'Floating-surface paint of the panel.',
    },
    class: {
      description: 'Forwarded to the shell.',
    },
    rest: { hide: true },
  },
};
