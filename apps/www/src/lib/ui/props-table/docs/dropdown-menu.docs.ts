/**
 * dropdown-menu — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 10, quill; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so they carry no overrides
 * here — their per-family mechanisms live in the page's axis table).
 *
 * No EXTRA lane needed: the family-local `variant` is not an axis name
 * and keeps its Own-default marker from the IR (the literal slot,
 * 'auto' — the dialog/sheet surface grammar).
 */
import type { PropsDocs } from '../from-meta';

export const DROPDOWN_MENU_DOCS: PropsDocs = {
  overrides: {
    id: {
      required: true,
      description:
        'Stable mount-stable id wiring the trigger (popovertarget), the panel (popover id) and the CSS anchor name (--jx-menu-<id>) — wired once, never reactive.',
    },
    density: {
      description:
        'The menu rhythm lane — inherit-then-provide: the anchor and panel carry the named rung (data-density), the items resolve their own stamp through the same contract, and composers inherit the menu\'s scope. Number/query lanes carry no rung (the legacy-edge narrowing).',
    },
    triggerLabel: {
      description: 'The default trigger button\'s label (ignored when the `trigger` snippet is given).',
    },
    placement: {
      description:
        'Anchor placement for the panel — position-area semantics (bottom/bottom-start/bottom-end/top/top-start/top-end; the span table pairs each logical placement with the span that measures as its intended alignment).',
    },
    variant: {
      description:
        'Floating-surface paint for the panel (the dialog/sheet surface grammar). Literal slot with own \'auto\' (acrylic unless the environment asks for reduced transparency) — declared own, no axis yet.',
    },
    trigger: {
      description:
        'Custom trigger snippet rendered inside the anchor wrapper; its popovertarget button is adopted for aria mirroring and focus restoration.',
    },
    panelClass: {
      description: 'Class passthrough onto the panel element, after the family atoms.',
    },
    onToggle: {
      description: 'Receives every native open-state change (the toggle seam; state read live from :popover-open).',
    },
    children: {
      description:
        'The menu items — DropdownMenuItem pairs or any [role=menuitem] elements; the keyboard walk joins them all through scoped DOM delegation.',
    },
  },
};
