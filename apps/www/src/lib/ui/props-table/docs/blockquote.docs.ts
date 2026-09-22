/**
 * blockquote — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn round 1, quill; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so they carry no overrides
 * here).
 *
 * Corrections pinned to the extractor's documented ceilings:
 *   - variant / rule / ruleSize degrade to opaque aliases — the union
 *     text + the display defaults live here (the popover variant
 *     precedent). ruleSize's default is '4', the family source's own
 *     (blockquote-defaults.svelte.ts: defineLiteralSlot([1, 4, 8], 4)
 *     — the R3 browser-review ruling); the pre-refactor hand table
 *     showed '1', the stale pre-R3 value, which is exactly the drift
 *     this meta+curation lane exists to kill.
 *   - `style` / `rest` hide (heritage passthrough the table never
 *     showed — the select curation precedent).
 */
import type { PropsDocs } from '../from-meta';

export const BLOCKQUOTE_DOCS: PropsDocs = {
  overrides: {
    variant: {
      type: "'outline' | 'tonal'",
      default: "'outline'",
      description:
        'Ladder prominence: outline paints the transparent ground with the left rule and the muted 0.875em body; tonal paints the alert recipe verbatim (12% tinted ground, 45% border, rounded box). Hue rides the jx-hue-* class injection, never the variant name. Omitted → the ambient paint zone, else the frozen own outline. Availability is frozen at these two rungs — fill buries long-form copy and ghost is interactive-chrome vocabulary a static quote misuses.',
    },
    rule: {
      type: "'shadow' | 'border'",
      default: "'shadow'",
      description:
        "The left rule's ink channel: shadow paints over geometry (the inset standard — command-item's inset primary, the elevation grammar's WELL tier, kbd's engrave lineage); border consumes it. Outline in shadow mode emits no border at all; tonal keeps its box border plus the shadow rule. A literal slot the ambient zone never moves.",
    },
    ruleSize: {
      type: '1 | 4 | 8',
      default: '4',
      description:
        "The rule's literal px ladder — the Owner's explicit enumeration, recorded as the ruling over a derived scale. Paddings stay fixed across sizes: paint never moves geometry. Kept outside the eight axes per migration-census.md's §13 row (no collision with the universal size axis).",
    },
    label: {
      description:
        'One-line uppercase heading in the alert title-row form — the surface\'s one fixed chrome size (0.8125rem). Omitted renders a bare body block.',
    },
    icon: {
      description:
        'Snippet rendered inline-start of the label — bring your own glyph (lucide, svg, text); the component ships no glyph vocabulary.',
    },
    cite: {
      description:
        'Attribution rendered as <footer><cite> after the body — the MDN posture. Not the native cite attribute, and never an element swap: the root stays <blockquote>.',
    },
    children: {
      description:
        'Body copy, rendered as direct children of the native blockquote (no wrapper). At auto the body rides 0.875em of the ambient scale; an explicit size REPLACES that em voice — the root renders the stamped size verbatim and the body copy follows it.',
    },
    class: {
      description:
        'Forwarded to the root blockquote. The jx-hue-* intent utilities land here — the tonal rung consumes their --jx-tonal / --jx-outline seams, and the rule channel rides the same single hue source.',
    },
    style: { hide: true },
    rest: { hide: true },
  },
};
