/**
 * inline-code — the docs curation over the GENERATED meta
 * (inline-code-engine-and-text-modifiers, 2026-09-08; zero-content-drift
 * pinned by test/props-table-meta-drift.spec.ts).
 *
 * The r4 surface: `variant` is the frozen fused/tonal/outline union
 * with own 'fused' (the union + default live in the override — the
 * extractor sees the imported InlineCodeVariant alias; popover's
 * variant precedent) riding the ambient zone marker; `backend` is the
 * engine seam (prop → HIGHLIGHT_KEY context → the stock microlighter
 * range engine), the typeText 'HighlightBackend' passing through the
 * opaque ceiling untouched (the code-card row's precedent); the six
 * modifier rows are the shared text-style kernel with the same honest
 * type corrections as text.docs.ts — fontSize/lineHeight also feed the
 * padding-inline calc (radius + fontSize × (lineHeight − 1) / 2).
 * `children` (the chip's text) and the spread stay off the table —
 * the page's trailing note carries the passthrough prose.
 */
import type { PropsDocs } from '../from-meta';

export const INLINE_CODE_DOCS: PropsDocs = {
  overrides: {
    density: {
      description:
        'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.',
    },
    variant: {
      type: "'fused' | 'tonal' | 'outline'",
      default: "'fused'",
      description:
        'The ladder paint (fused own, the backdrop-fusion band); omitted → the ambient paint zone, else the frozen own fused.',
    },
    lang: {
      description:
        "'auto' = fingerprint heuristic; an explicit id/alias skips detection; 'text'/'plain' stay plain.",
    },
    backend: {
      description:
        'The engine seam: prop → HIGHLIGHT_KEY context → the stock microlighter range engine. A rejecting backend leaves the plain chip standing.',
    },
    lineHeight: {
      type: 'number | string',
      description:
        'The shared text-modifier kernel: number ⇒ the unitless ratio (leading-[1.5]); string ⇒ verbatim. Also feeds the padding calc; absent ⇒ the ambient line flows.',
    },
    weight: {
      type: 'string',
      description:
        "A weight word or number — 'bold' → font-bold (named map); '450' → font-[450].",
    },
    italic: {
      type: 'boolean',
      default: 'false',
      description: 'true ⇒ italic; absent stays ambient (never not-italic).',
    },
    tracking: {
      type: 'string',
      description:
        "A letter-spacing word or length — 'wide' → tracking-wide; '-0.02em' → tracking-[-0.02em].",
    },
    family: {
      type: 'string',
      description:
        'A font-family value — verbatim [font-family:…] (spaces escape to underscores).',
    },
    fontSize: {
      type: 'string',
      description:
        'A CSS length — verbatim [font-size:…]; also feeds the padding calc. Never named size (the axis-word law).',
    },
    class: {
      description:
        'Adds consumer classes; jx-hue-* intent utilities retune the tonal slot, and [--tok-token-…:…] injections land here.',
    },
    children: { hide: true },
    rest: { hide: true },
  },
};
