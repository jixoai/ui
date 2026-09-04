/**
 * select — the docs curation over the GENERATED meta
 * (docs-demo-standard pilot migration; zero-content-drift pinned by
 * test/props-table-meta-drift.spec.ts).
 *
 * Rows hidden by curation: heritage passthrough the table never showed
 * (`id`, the `'data-density`' pair, `class`, `...rest`). `density`'s
 * effective default is runtime-resolved: since 4.3
 * (context-defaults-economy) the IR's ambient field carries it (the
 * `ambient scope` Default-column marker) — the `inherited` display
 * override retired, the union text stays (the imported Density type is
 * the extractor's same-file ceiling).
 */
import type { PropsDocs } from '../from-meta';

export const SELECT_DOCS: PropsDocs = {
  overrides: {
    options: {
      description: 'The full option list; order = panel order.',
      required: true,
    },
    value: {
      description: 'Committed value; undefined shows the placeholder.',
      bindable: true,
    },
    placeholder: {
      description: 'Trigger text when nothing is selected.',
    },
    label: {
      description: 'Field label rendered as label[for] above the trigger.',
    },
    name: {
      description: 'Form field name — the bridge submits the committed value under it.',
    },
    error: {
      description: 'Error text: sets aria-invalid, wires aria-describedby, dashes the shell.',
    },
    multiple: {
      description: 'Reserved extension direction — not implemented in v1 (warns).',
    },
    variant: {
      description: 'Floating-surface fill of the panel.',
    },
    density: {
      type: "'xs' | 'sm' | 'default' | 'lg'",
      description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.',
    },
    disabled: {
      description: 'Disables the trigger and the form-bridge field.',
    },
    id: { hide: true },
    'data-density': { hide: true },
    class: { hide: true },
    rest: { hide: true },
  },
};
