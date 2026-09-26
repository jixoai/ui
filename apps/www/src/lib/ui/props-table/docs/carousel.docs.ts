/**
 * carousel — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 23, marginalia; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so they carry no overrides
 * here — their per-family mechanism rows live on the page's axes
 * table).
 *
 * EXTRA chain, reconstructed from the meta (the color-picker NIT is the
 * standard — the head is counted, not quoted): 15 raw entries, ZERO
 * duplicate keys − 8 axis-named = **7 family rows** (label, slideWidth,
 * dots, prevLabel, nextLabel, class, children). No hidden lane and no
 * extra lane: no family-local prop shares an axis name (slideWidth is
 * the family's own geometry literal — no collision with the §1 native
 * size attribute, which the family never receives).
 */
import type { PropsDocs } from '../from-meta';

export const CAROUSEL_DOCS: PropsDocs = {
  overrides: {
    label: {
      description:
        'The region\'s accessible name (aria-label) — a named grouping of slides; role=region with aria-roledescription="carousel" is the law.',
    },
    slideWidth: {
      description:
        "Slide width inside the snap track as any CSS length — '100%' (default) pages one-at-a-time; '80%' / '24rem' give the peeking carousel. Rides the --jx-slide-w variable the slide law sizes every direct child with.",
    },
    dots: {
      description:
        'The dot row under the track (mounts only with more than one slide). Dots are real buttons that COMMAND the scroller — they never navigate; the arrows stay either way.',
    },
    prevLabel: {
      description: "The prev arrow's text (aria-label stays 'previous slide').",
    },
    nextLabel: {
      description: "The next arrow's text (aria-label stays 'next slide').",
    },
    class: {
      description: 'Forwarded to the root region, after the family atoms.',
    },
    children: {
      description:
        'The slides — any element each, direct children of the snap track. Every direct child is sized to --jx-slide-w and snapped to the start edge (the slide law).',
    },
  },
};
