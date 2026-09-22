/**
 * heading — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 12, quill; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so they carry no overrides
 * here — their per-family mechanisms live in the page's axis table).
 *
 * No EXTRA lane: `level` is the §13-kept structural prop (the census
 * keep row — no collision with the size axis) and renders from the
 * meta main table.
 */
import type { PropsDocs } from '../from-meta';

export const HEADING_DOCS: PropsDocs = {
  overrides: {
    level: {
      default: '2',
      description:
        'The heading level: sets the native element (h1–h6), the em-scaled size rung and the data-jx-heading hook from ONE clamped value (rounded, then bounded) — the rendered truth never desyncs from the raw prop. Default 2 — h1 is the page\'s one-per-page title, and a component defaulting to it would mint competing titles; the markdown map always passes level explicitly. Kept outside the eight axes per migration-census.md\'s §13 row (component-specific, no collision with the size axis).',
    },
    id: {
      description: 'Optional explicit address — anchor links and aria-labelledby point here.',
    },
    style: {
      description:
        'Inline style passthrough — composed AFTER the family\'s carrier stamp (the #4 seam law: never clobbered, never dropped).',
    },
    children: {
      description: 'The heading text.',
    },
    class: {
      description: 'Forwarded to the rendered heading element; consumer classes land last.',
    },
    rest: {
      description:
        'Every other attribute passes through to the native heading element untouched (Omit<…, \'color\'> — the §1 native-collision rule).',
    },
  },
};
