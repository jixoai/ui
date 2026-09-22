/**
 * badge — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn round 1, marginalia; the blockquote.docs.ts
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so the axis props carry no
 * overrides here).
 *
 * Corrections pinned to the extractor's documented ceilings:
 *   - variant / shape degrade to opaque aliases (BadgeVariant /
 *     BadgeShape are branded slot products) — the union text + the
 *     display defaults live here; the defaults are the family
 *     Defaults' own (badge-defaults.svelte.ts: the paint slot's
 *     'tonal', the literal slot's 'square').
 *   - style / rest stay visible ON PURPOSE: they are badge's
 *     composition story (the #4 seam joins the caller's style AFTER
 *     the carrier stamp; restProps are the span passthrough law).
 */
import type { PropsDocs } from '../from-meta';

export const BADGE_DOCS: PropsDocs = {
  overrides: {
    variant: {
      type: "'fill' | 'tonal' | 'outline'",
      default: "'tonal' · ambient zone",
      description:
        'Prominence ladder: fill speaks loudest (solid ground, same-hue border, injected ink), tonal is the default voice (the 12% tinted ground, 45% border), outline draws structure only (transparent ground, the outline border). Hue comes from the global slots — never a variant name. Omitted → the ambient paint zone (ButtonGroup / zone scope), else the frozen own tonal.',
    },
    shape: {
      type: "'square' | 'pill'",
      default: "'square' · own",
      description:
        'The corner law: square keeps the theme radius (var(--jx-radius) — 0px; 8px where corner-shape is supported), pill rounds fully (calc(infinity * 1px)). A family-local literal slot, NOT the universal §2 shape axis — the vocabulary collides with the axis name and §13 rules no mapping, so the axis is absent (explicit-props migration-census.md, batch B LANDED row; flagged for the W6 Owner dossier).',
    },
    slotStart: {
      description:
        'Icon lane before the label — the svg sizes to the secondary text (var(--jx-text-secondary)) and its side\'s inset halves (the :has() lane) so glyph and label stay balanced.',
    },
    slotEnd: {
      description:
        'Icon lane after the label — same sizing and inset-halving law. An icon-only badge (no children) keeps BOTH insets symmetric so the glyph centers (the tabs-trigger guard, F-6).',
    },
    children: {
      description:
        'The label text — the whole point of the chip. It renders as a plain <span> and composes anywhere one does: headings, table cells, terminal cards.',
    },
    class: {
      description:
        'Consumer classes — also the hue-injection seam: jx-hue-neutral / jx-hue-error / jx-hue-success retarget the four global slots (--jx-fill, --jx-fill-ink, --jx-tonal, --jx-outline); the arbitrary-property class covers hues outside the closed set.',
    },
    style: {
      description:
        "Inline style passthrough — composed AFTER the family's carrier stamp (the #4 seam law: never clobbered, never dropped).",
    },
    rest: {
      description:
        'Span attribute passthrough — data-*, title, aria-* land verbatim on the chip (a badge is a span; composition is the law, not a convenience).',
    },
  },
};
