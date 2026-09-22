/**
 * avatar — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn round 1, vellum; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so they carry no overrides
 * here — their per-family mechanism rows live on the page's axes
 * table; `size` is one of those axis names (the §13 adoption — the
 * family prop IS the axis), so its story renders in the universal
 * section and the page's axes table, NOT here: an override for a
 * filtered row is dead text (the badge lesson).
 *
 * No extra lane: no family-local prop shares an axis name (the
 * silhouette vocabulary is `variant` — no collision, chip/badge's
 * `shape` casualty does not recur).
 *
 * `rest` is the one native-img story the table should keep visible:
 * every HTMLImgAttribute flows through the spread onto the img root
 * (loading/decoding/fetchpriority are the family's own defaults; a
 * caller's overrides win — the merge law).
 */
import type { PropsDocs } from '../from-meta';

export const AVATAR_DOCS: PropsDocs = {
  overrides: {
    src: {
      description:
        'Image URL. A failed load (or no src) swaps to the initials block — the onerror swap is the whole component; a changed src is a fresh chance (the failure state resets).',
    },
    name: {
      required: true,
      description:
        'The person — fuels alt text, the initials fallback and the tooltip. One word → its first two code points (CJK-safe: 张伟 stays 张伟); several words → the first letters of the first and last; the sm box keeps only the first code point.',
    },
    alt: {
      description:
        "Defaults to `name` (the avatar is content). Pass \"\" explicitly for a decorative avatar beside a visible name — the fallback block honors it too (aria-hidden, no label).",
    },
    variant: {
      type: "'bevel | rounded | squircle'",
      default: "'bevel' · Own default, not ambient",
      description:
        "The silhouette — one geometry, three corners, the family's own literal slot: bevel cuts var(--radius) to the box (sm 0.75× · md 1× · lg 1.25× — 6 / 8 / 10px at the 8px baseline), rounded is the true circle (50%), squircle the superellipse (50%). Not the §2 shape axis — no name collision; the axis supplies downward (see the axes table). corner-shape degrades per the §14 ladder: bevel → square, rounded/squircle → circle.",
    },
    tooltip: {
      type: 'boolean',
      default: 'true',
      description:
        'The full name rides a tooltip (hover-intent + focus, the tooltip family laws) — an avatar crops identity to initials, the tooltip gives it back. Pass false when the name is already visible beside the avatar.',
    },
    class: {
      description: 'Appended to the composed classes — forwarded to the img / fallback block.',
    },
    onerror: {
      description:
        'Runs BEFORE the fallback swap (a throwing handler must not leave the broken img on screen). Inspect event.target only — the swap already happened by the time your handler returns.',
    },
    style: {
      description:
        'Inline style — joined AFTER the axis carriers and the box var (the merge law: caller wins).',
    },
    rest: {
      description:
        'Every other native img attribute flows through onto the img root. loading="lazy", decoding="async" and the intrinsic width/height are the family\'s own (layout never shifts); caller values override.',
    },
  },
};
