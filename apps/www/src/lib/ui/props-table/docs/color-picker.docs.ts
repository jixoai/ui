/**
 * color-picker — the docs curation over the GENERATED meta
 * (docs-eight-axes-mdn task 16, scribe; the docs-demo-standard 4.2
 * pattern — name/type/default from the registry interface, prose from
 * this curation; the meta table auto-splits the eight axis rows into
 * the generated Universal props section, so they carry no overrides
 * here — their per-family mechanism rows live on the page's axes
 * table; the family's own density mechanism is CONSUMED through the
 * ambient scope channels, so its story is the axes table's).
 *
 * The heritage rows the destructure surfaces (`id`, `'data-density'`
 * ×2 — the interface member and the safety-net twin — `class`,
 * `...rest`) hide by curation (the checkbox precedent). The
 * `aria-invalid` / `aria-describedby` rows STAY: they are the family's
 * own interface members (the input.svelte validation merge — caller
 * relations survive alongside the error wiring), not heritage noise.
 *
 * No extra lane: no family-local prop shares an axis name (the
 * surface vocabulary is `variant` — own literal 'auto', the
 * dialog/sheet precedent — no collision with the color axis story;
 * the picker is a color INSTRUMENT, its chrome deliberately hue-neutral:
 * --jx-color-effective stamps and zero family css reads it — the
 * negative-grep receipt lives on the page's color row).
 */
import type { PropsDocs } from '../from-meta';

export const COLOR_PICKER_DOCS: PropsDocs = {
  overrides: {
    value: {
      bindable: true,
      description:
        'The committed color string — the ONE value model every surface flows through (field typing, native swatch pick, editor drag, bind write). Notation follows format; oklch is the conversion hub, so round-trips stay exact.',
    },
    format: {
      description:
        "Input and output notation: 'hex' | 'hsl' | 'oklch'. A format switch re-emits the SAME color in the new notation; pasted text in any notation parses and commits canonically.",
    },
    name: {
      description:
        'Form field name — the native input[type=text] submits its string under it through its own FormData lane (the swatch never carries a second name lane).',
    },
    label: {
      description:
        'Renders a same-row label[for] bound to the native field — a REAL label binding, not an aria-only name.',
    },
    error: {
      description:
        'Adds invalid state and an associated message: the lane border dashes, aria-invalid lands on the field, and the describedby chain points field AND swatch at the "! message" line (the input.svelte error law).',
    },
    disabled: {
      description:
        'The platform disabled semantics on every native control at once — field, swatch and chevron.',
    },
    variant: {
      default: "'auto'",
      description:
        "The editor panel's surface treatment: 'solid' | 'acrylic' | 'auto' — the floating-surface paint has a declared own ('auto') and no axis yet (the dialog/sheet precedent): explicit ?? 'auto', never context. The panel rides the terminal bezel law either way.",
    },
    showSwatch: {
      description:
        'Mounts the native input[type=color] swatch riding the generated COLOR LAW face (the conic well chip — laws/color.ts, the 4th mounting surface). Clicking it opens the ENGINE picker: the native path every input mode gets. false removes that path entirely.',
    },
    showValue: {
      description:
        'Shows the value text in the lane; false keeps the native field as the sr-only value carrier — label, name and ARIA intact (the native contract never drops).',
    },
    lane: {
      description:
        'A custom lane beside the swatch — your content owns the visible spot (it sees { text, open, disabled }) while the native field goes sr-only: label[for], name and the ARIA wiring survive (the input.svelte slot law).',
    },
    'aria-invalid': {
      description:
        'Caller-supplied validation state — used only when the error wiring is absent (the merge: the error law outranks, but never drops, the caller relation).',
    },
    'aria-describedby': {
      description:
        'Caller-supplied describedby — merged under the same law: the error wiring wins when present, the caller relation survives when not.',
    },
    id: { hide: true },
    'data-density': { hide: true },
    class: { hide: true },
    rest: { hide: true },
  },
};
