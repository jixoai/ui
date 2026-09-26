/**
 * input-group — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 17, quill; the docs-demo-standard 4.2
 * pattern; the meta table auto-splits the eight axis rows into the
 * generated Universal props section — their per-family mechanisms live
 * in the page's axis table. The PART components (addon/input) stay on
 * the page's hand tables — component-specific surfaces).
 *
 * No EXTRA lane: 15 meta props − 8 ambient axes = 7 rows; the
 * data-density row is the legacy attribute-name escape hatch, not a
 * collision with the density axis (different name, same word).
 */
import type { PropsDocs } from '../from-meta';

export const INPUT_GROUP_DOCS: PropsDocs = {
  overrides: {
    label: {
      description:
        'The group accessible name (aria-label shorthand) — a nameless group is announced as nothing; an explicit rest aria-label wins; aria-labelledby flows through the rest props.',
    },
    disabled: {
      description:
        'THE ONE propagation rule: native disabled on the lane + inert on EVERY addon (the platform\'s containment — activation and focus lost at once). The input part\'s own disabled stays per-part beside it.',
    },
    'data-density': {
      description:
        'The legacy attribute-name escape hatch, forwarded verbatim — the universal density lane above is the documented surface (inherit-then-provide).',
    },
    role: {
      description:
        'The group landmark (default \'group\') — override only when you own the semantics.',
    },
    class: {
      description: 'Merged into the root shell (cn()).',
    },
    children: {
      description:
        'The parts, authored in your tree: InputGroupAddon lanes beside a chromeless InputGroupInput — composition, not configuration.',
    },
    rest: {
      description:
        'aria-labelledby, data-*, event handlers — land on the root verbatim (the group landmark\'s attribute surface).',
    },
  },
};
