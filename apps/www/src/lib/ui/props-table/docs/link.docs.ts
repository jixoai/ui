/**
 * link — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 20, quill; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section — their per-family mechanisms
 * live in the page's axes table).
 *
 * No EXTRA lane: 15 meta props − 8 ambient axes = 7 rows, all curated
 * (href, title, icon, children, class, style, rest). No family-local
 * prop shares an axis name — fontSize deliberately does not exist here
 * (the modifier is text-family's; the link's size story is the axis).
 */
import type { PropsDocs } from '../from-meta';

export const LINK_DOCS: PropsDocs = {
  overrides: {
    href: {
      required: true,
      description:
        'The link target — and the whole external contract: an absolute http(s) href renders target="_blank" + rel="noreferrer" and data-jx-link="external"; relative routes, anchors and non-http schemes keep same-tab navigation. Lands AFTER the spread (the separator law) — not overridable through rest.',
    },
    title: {
      description:
        'Advisory title, passthrough to the native attribute — also after the spread (the component\'s contract).',
    },
    icon: {
      description:
        'The suffix-icon lane, TRI-STATE (undefined ≠ off): omitted paints the default externalLink glyph IFF the link is external (inline-core — SSR-painted, hydration-matched, 0.8em); null turns the lane off; a snippet renders custom content in the data-jx-link-icon span. Internal links never carry the lane at any setting.',
    },
    children: {
      description:
        'The link label — the accessible name. Omit for attribute-only anchors; write the departure into the words, not a glyph.',
    },
    class: {
      description: 'Forwarded to the anchor; consumer classes land last (tailwind-merge replaces, never stacks).',
    },
    style: {
      description:
        'Inline style passthrough — composed AFTER the family\'s carrier stamp (the #4 seam law: never clobbered, never dropped).',
    },
    rest: {
      description:
        'Every other anchor attribute passes through (Omit<HTMLAnchorAttributes, \'color\'> — the §1 native-collision rule); href, title, target and rel land after the spread as the component\'s contract.',
    },
  },
};
