/**
 * text — the docs curation over the GENERATED meta
 * (inline-code-engine-and-text-modifiers, 2026-09-08; zero-content-drift
 * pinned by test/props-table-meta-drift.spec.ts).
 *
 * The six modifier rows (lineHeight/weight/italic/tracking/family/
 * fontSize) are the shared text-style kernel riding the ambient-scale
 * amendment: an explicit prop emits its utility override — absent emits
 * nothing and the ambient channel flows (the 措辞律 every style row
 * states). The extractor degrades the imported TextStyleProps members
 * to opaque `unknown` (the documented same-file ceiling), so each of
 * the six carries an honest `type` correction; `italic`'s boolean
 * floor rides the display default. `mark` is the literal family slot:
 * the union + own 'p' live in the override (popover's variant
 * precedent), the IR's ambient 'own' marker renders beside it. The
 * `Raw exports` row is non-prop API prose — docs.extra, appended after
 * the meta rows.
 */
import type { PropsDocs } from '../from-meta';

export const TEXT_DOCS: PropsDocs = {
  overrides: {
    mark: {
      type: "'p' | 'strong' | 'em' | 'del' | 'mark' | 'ins' | 'sub' | 'sup'",
      default: "'p'",
      description:
        "The element vocabulary — ONE word is the prop value, the sugar name, and the HTML element. A literal slot, own 'p', never zone-ambient (an element choice is not prominence; the kbd precedent). Omitted resolves explicit ?? own, no context read.",
    },
    lineHeight: {
      type: 'number | string',
      description:
        'The text-modifier kernel: number ⇒ the unitless ratio (leading-[1.5]); string ⇒ verbatim. An explicit utility override — absent emits nothing and the ambient line flows.',
    },
    weight: {
      type: 'string',
      description:
        "A weight word or number — 'bold' → font-bold (named map), '450' → font-[450]. An explicit utility override — absent emits nothing and the ambient weight flows.",
    },
    italic: {
      type: 'boolean',
      default: 'false',
      description:
        'true ⇒ italic — an explicit utility override; absent emits nothing and the ambient channel flows (never not-italic).',
    },
    tracking: {
      type: 'string',
      description:
        "A letter-spacing word or length — 'wide' → tracking-wide, '-0.02em' → tracking-[-0.02em]. An explicit utility override — absent emits nothing and the ambient tracking flows.",
    },
    family: {
      type: 'string',
      description:
        'A font-family value — verbatim [font-family:…] (spaces escape to underscores). An explicit utility override — absent emits nothing and the ambient family flows.',
    },
    fontSize: {
      type: 'string',
      description:
        'A CSS length — verbatim [font-size:…], never named size (the axis-word law). An explicit utility override — absent emits nothing and the ambient scale flows.',
    },
    children: {
      type: 'Snippet',
      description: 'The inline content.',
    },
    class: {
      description: 'Forwarded to the rendered element; consumer classes land last.',
    },
    rest: {
      type: 'HTMLAttributes<HTMLElement>',
      default: 'spread',
      description: 'Every other attribute passes through to the chosen element untouched.',
    },
  },
  extra: [
    {
      name: 'Raw exports',
      type: 'P · Strong · Em · Del · Mark · Ins · Sub · Sup',
      default: '—',
      description:
        'The eight sugar components — each renders the base with its mark fixed (class/children/attrs forwarded); identical markup to <Text mark="{word}">.',
    },
  ],
};
