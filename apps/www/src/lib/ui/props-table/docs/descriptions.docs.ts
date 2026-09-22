/**
 * descriptions — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 17, scribe; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section — their per-family mechanism
 * rows live on the page's axes table).
 *
 * The heritage rows the destructure surfaces (`class`, `...rest`)
 * hide by curation (the checkbox pattern); `style` STAYS visible —
 * the root JOINS it after the §11 carriers and the --jx-desc-cols
 * stamp (the merge law: caller wins), so it is real API on this
 * family.
 *
 * No extra lane: `bordered` is the literal slot's boolean form (own
 * false — booleans are a closed domain, the values form), not an axis
 * name; `columns` is the family's own HOW-prop. No casualty.
 */
import type { PropsDocs } from '../from-meta';

export const DESCRIPTIONS_DOCS: PropsDocs = {
  overrides: {
    columns: {
      description:
        'Term/value pairs per row — clamped to 1–4 (truncated, never rounded up). The count stamps --jx-desc-cols on the root; the dl folds to ONE pair per row under 640px of CONTAINER width (the component\'s own container query — any layout column inherits the law). A HOW-prop: it changes how the grid paints, never what renders.',
    },
    bordered: {
      description:
        'The hairline "bordered" antd look — CSS on the same dl, never a table in disguise: the root grows the card-ground frame and the Items paint their cell bottom edges plus the muted term background + inline-end rule. Rides CONTEXT down to the Items — one decision, painted everywhere.',
    },
    style: {
      description:
        'Inline style — joined AFTER the §11 axis carriers and the --jx-desc-cols stamp (the merge law: caller wins).',
    },
    children: {
      required: true,
      description:
        'The DescriptionsItem pairs, in source order — the dl preserves description-list semantics, so nothing but dt/dd groups belongs inside.',
    },
    class: { hide: true },
    rest: { hide: true },
  },
};
