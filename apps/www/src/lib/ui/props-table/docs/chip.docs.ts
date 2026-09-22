/**
 * chip — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn round 1, quill; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the seven axis rows into
 * the generated Universal props section, so they carry no overrides
 * here — their per-family mechanism rows live on the page's axes
 * table).
 *
 * Corrections pinned to the extractor's documented ceilings:
 *   - variant / shape degrade to opaque aliases — the union text + the
 *     display defaults live here (the blockquote variant precedent).
 *   - `shape` is the COLLISION CASUALTY of the shared split: the main
 *     table drops every row named in UNIVERSAL_AXIS_NAMES when the
 *     generated section renders, and chip's FAMILY-LOCAL shape
 *     ('square' | 'pill', the silhouette corner-law vocabulary) shares
 *     its name with the §2 axis it left out (migration-census.md batch
 *     B — the family prop owns the name, `pill` is outside ShapeLane).
 *     The row rides `extra` back into the table with its real union
 *     and the own-default marker; hiding it would document an absent
 *     prop — the exact drift this lane exists to kill.
 *   - the effect mount is not a prop (attachments are invisible to the
 *     extractor) — the r4 component-tag row rides `extra` too.
 *   - `rest` hides (the spread passthrough the table never showed); the
 *     attachment row's prose carries the one load-bearing fact about it.
 */
import type { PropsDocs } from '../from-meta';

export const CHIP_DOCS: PropsDocs = {
  overrides: {
    variant: {
      type: "'fill' | 'tonal' | 'outline' | 'ghost'",
      default: "'tonal'",
      description:
        'The grammar ladder — prominence, never semantic hue. fill is the solid ground with the same-hue border; tonal the 12%/45% color-mix tint recipe; outline the structural border with an 8% hover overlay; ghost the transparent frame that presses without a shadow and hovers from --jx-tonal. Availability is the frozen variant-grammar table (all four rungs; link never reaches chip). Omitted → the ambient paint zone, else the frozen own tonal.',
    },
    href: {
      description:
        "Renders an anchor instead of the button root — the ONLY structural difference from a Badge. Internal hrefs (starting with '/') navigate in place.",
    },
    external: {
      description:
        "Opens non-internal hrefs in a new tab. Defaults to auto: any href not starting with '/' gets target=\"_blank\" + rel=\"noreferrer\".",
    },
    onclick: {
      description: 'Activation handler — fires on button press and on anchor click alike.',
    },
    type: {
      description: 'Native button type for the button root.',
    },
    ariaLabel: {
      description: 'Accessible name override — reach for it on icon-only chips.',
    },
    class: {
      description:
        'Appended to the composed classes. Hue injection rides here: the jx-hue-* / jx-pair-* intent utilities re-point the four grammar slots (--jx-fill, --jx-fill-ink, --jx-tonal, --jx-outline). Same-property overrides need the consumer ! — utility order is not guaranteed.',
    },
    slotStart: {
      description:
        'Leading lane, wrapped in a data-icon span. The data-icon law replaces the side padding (inset halves) and pins composed svg to var(--jx-text-secondary) — the label scale.',
    },
    slotEnd: {
      description:
        'Trailing lane, same law as slotStart: the side padding halves and svg rides the label scale.',
    },
    children: {
      required: true,
      description: 'The chip label — the uppercase micro-label voice at badge scale.',
    },
    rest: { hide: true },
  },
  extra: [
    {
      name: 'shape',
      type: "'square' | 'pill'",
      default: "'square'",
      ambient: 'own',
      description:
        "The family's silhouette vocabulary — square keeps the site radius var(--jx-radius) (not sharp corners), pill rounds fully (calc(infinity * 1px)). NOT the universal §2 shape axis: the name collision left the axis out rather than renamed (migration-census.md batch B; flagged for the W6 Owner dossier — a future rename ruling could adopt the axis). Rendered from extra: the shared split filters this name from the generated rows.",
    },
    {
      name: '{@attach …} (component tag)',
      type: 'Attachment<HTMLElement>',
      default: '—',
      description:
        'The effect mount (r4): <Chip {@attach pressEffect(ripple())}> compiles to a symbol-keyed prop that rides the rest spread onto the activation root, where the shared press-button runtime mounts the ink. A bare chip is plain — zero effect knowledge. Reduced motion freezes every loop.',
    },
  ],
};
