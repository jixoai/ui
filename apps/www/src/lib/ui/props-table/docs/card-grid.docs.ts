/**
 * card-grid — the docs curation over the GENERATED meta
 * (docs-demo-standard pilot migration; zero-content-drift pinned by
 * test/props-table-meta-drift.spec.ts).
 *
 * Nothing hidden, nothing corrected: the served rows are the GENERATED
 * truth (min/foot/children/class + the eight axis rows — the W3-B
 * surface joined after this curation was written; `Snippet` normalizes
 * in the projection) — curation is prose only.
 */
import type { PropsDocs } from '../from-meta';

export const CARD_GRID_DOCS: PropsDocs = {
  overrides: {
    min: {
      description: 'Minimum column width before the grid collapses a column (any CSS length).',
    },
    children: {
      description: 'The cards; each child spans the two shared rows.',
    },
    class: {
      description: 'Forwarded to the grid container.',
    },
  },
};
