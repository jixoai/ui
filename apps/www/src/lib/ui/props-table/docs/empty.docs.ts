/**
 * empty — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 11, quill; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so they carry no overrides
 * here — their per-family mechanisms live in the page's axis table).
 *
 * No EXTRA lane: no family-local prop shares an axis name (the five
 * content props + class render beneath the generated section).
 */
import type { PropsDocs } from '../from-meta';

export const EMPTY_DOCS: PropsDocs = {
  overrides: {
    title: {
      required: true,
      description: 'The no-data heading — font-nav uppercase at the density channel\'s type voice.',
    },
    description: {
      description: 'Optional supporting copy, clamped to a 36ch measure under the title.',
    },
    illustration: {
      description:
        'Snippet replacing the default terminal listing (ls checks/ · 0 items) — bring any glyph; the art stays decorative (aria-hidden) either way.',
    },
    actions: {
      description:
        'Recovery actions under the caption — usually a press-button; the row wraps at the density gap.',
    },
    class: {
      description: 'Forwarded to the root figure, after the family atoms.',
    },
  },
};
