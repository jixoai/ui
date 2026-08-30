/**
 * popover — the docs curation over the GENERATED meta
 * (docs-demo-standard pilot migration; zero-content-drift pinned by
 * test/props-table-meta-drift.spec.ts).
 *
 * The cleanest pilot: every type/default cell comes from the GENERATED
 * zone verbatim (the placement enum, the `number | string` union, the
 * snippet rows) — curation is prose, two required flags, and the
 * `bind:this` imperative-handle row the extractor cannot see.
 */
import type { PropsDocs } from '../from-meta';

export const POPOVER_DOCS: PropsDocs = {
  overrides: {
    id: {
      description: 'Popover id: popovertarget association + the CSS anchor name.',
      required: true,
    },
    triggerLabel: {
      description: 'Default trigger button label; ignored when a trigger snippet is given.',
    },
    placement: {
      description: 'The INITIAL anchored position; chosen once at open, never re-evaluated while open.',
    },
    variant: {
      description: 'Floating-surface paint.',
    },
    tryFallbacks: {
      description: 'Raw position-try value — custom @position-try idents replace the default flip series.',
    },
    gap: {
      description: 'Anchor gap, margin semantics — number = uniform px; shorthand gaps only the facing side. Invalid input is ignored.',
    },
    trigger: {
      description: 'Custom trigger control; anchoring stays component-owned.',
    },
    panelClass: {
      description: 'Appended to the panel (width, grid, tokens — never anchoring).',
    },
    onToggle: {
      description: 'Mirrors the native toggle event; the only open-state source of truth.',
    },
    children: {
      description: 'The whole panel body.',
      required: true,
    },
  },
  extra: [
    {
      name: 'bind:this',
      type: '{ show, hide, toggle }',
      default: '—',
      description: 'Imperative handle — thin native passthroughs for exceptional triggers.',
    },
  ],
};
