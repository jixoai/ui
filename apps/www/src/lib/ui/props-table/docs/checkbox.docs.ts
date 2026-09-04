/**
 * checkbox — the docs curation over the GENERATED meta
 * (docs-demo-standard pilot migration; zero-content-drift pinned by
 * test/props-table-meta-drift.spec.ts).
 *
 * The table documents the checkbox-SPECIFIC additions over the
 * HTMLInputAttributes heritage: the heritage rows the destructure
 * surfaces (`id`, `'data-density'` ×2 — the interface member and the
 * safety-net twin — `class`, `...rest`) hide by curation. `checked`
 * is the `$bindable()` seam; `density`'s effective default is
 * runtime-resolved — since 4.3 (context-defaults-economy) the IR's
 * ambient field carries it (the `ambient scope` Default-column
 * marker); the `inherited` display override retired.
 */
import type { PropsDocs } from '../from-meta';

export const CHECKBOX_DOCS: PropsDocs = {
  overrides: {
    label: {
      description: 'Same-row label rendered with label[for].',
    },
    labelSide: {
      description: 'Places the label before or after the control.',
    },
    indeterminate: {
      description: 'Sets the native indeterminate IDL state.',
    },
    error: {
      description: 'Adds invalid state and an associated message.',
    },
    density: {
      description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.',
    },
    checked: {
      description: 'Bindable controlled checked state.',
      bindable: true,
    },
    id: { hide: true },
    'data-density': { hide: true },
    class: { hide: true },
    rest: { hide: true },
  },
};
