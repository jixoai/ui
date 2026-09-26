/**
 * hero-section — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 13, quill; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so they carry no overrides
 * here — their per-family mechanisms live in the page's axis table).
 *
 * No EXTRA lane: no family-local prop shares an axis name ('title' is
 * a snippet — the native attribute is Omitted, not collided), so all
 * 12 non-axis props render beneath the generated section.
 */
import type { PropsDocs } from '../from-meta';

export const HERO_SECTION_DOCS: PropsDocs = {
  overrides: {
    eyebrow: {
      required: true,
      description:
        'Tracked uppercase label above the title — the accent voice: ink rides --primary-text (flips under .dark).',
    },
    summary: {
      required: true,
      description:
        'The lead paragraph, capped at the 16cm ergonomic measure (min(100%, …) so narrow hosts never overflow); ink --jx-muted-foreground.',
    },
    copyCommand: {
      description:
        'The clipboard payload AND the default CTA\'s label. SNIPPET-CONDITIONAL: required exactly when the default copy CTA renders; provide a #copy snippet instead and this is unused (and may be omitted).',
    },
    copyLabel: {
      description: 'aria affordance of the default copy CTA (default \'copy\' — localize freely).',
    },
    title: {
      description:
        'The h1 content, rendered inside the data-jx-hero-title hook; any <em> inside carries the accent paint (the :where() components-layer rule — consumer utilities still win). Plain text is also legal.',
    },
    badges: {
      description:
        'The badge-row content — compose Badge parts (badges: string[] is dead). The row wraps at the kernel gaps; the uppercase label voice is the component\'s.',
    },
    copy: {
      description:
        'Replaces the default copy CTA wholesale — the command string stays yours to render however.',
    },
    terminal: {
      description:
        'The OPTIONAL second-column aside (usually a terminal-card). The hero owns only the column and its bottom alignment at the ≥64rem container tier; without the snippet the wide form keeps the right side empty — whitespace is the focus.',
    },
    secondary: {
      description: 'Extra outline CTAs after the copy button; omit and the row holds the CTA alone.',
    },
    class: {
      description: 'Forwarded to the section root, after the family atoms.',
    },
    style: {
      description:
        'Inline style passthrough — composed AFTER the family\'s carrier stamp (the #4 seam law: never clobbered, never dropped).',
    },
    rest: {
      description:
        'Every other attribute passes through to the section untouched (Omit<HTMLAttributes<HTMLElement>, \'title\' | \'color\'> — both native names cleared for the snippet and the axis).',
    },
  },
};
