# Proposal: icon upstream — lucide becomes the only geometry source

## Why

The "single-source law" for icon geometry was enforced by hand: the
same lucide 0.472 path data was copied into ~10 source sites
(`registry/files/lib/icons.ts`, the jx-pure/jxoai sheet URIs, the
css-laws TS literals, the vite-plugin's embedded provider, 13
component files' inline `<svg>`, two geometry-pinning tests). Every
lucide bump is a manual multi-file sync, and the cross-layer gate
(`geometry-consistency.test.ts`) only pins a 5-fragment subset.
Owner ruling (2026-08-29): stop self-drawing — the mature library
becomes the import source; hand-copied geometry goes to zero with NO
exemptions.

## What Changes

- **Generated icon module**: `scripts/gen-icons.mjs` imports IconNode
  data from `lucide@^0.472.0` (npm, ISC) and emits
  `registry/files/lib/icons.ts`. The public interface is UNCHANGED:
  SVG strings consumed via `{@html icons.x}`, 24×24 viewBox, 16px
  baked size, `data-jx-icon`, `aria-hidden`, sw 2, theme-owned CSS
  sizing. `--check` mode is the freshness gate (`verify:icons`).
  Registry consumers gain NO npm dependency.
- **css-laws imports lucide**: a new `src/icon-uris.ts` serializer
  (IconNode → data URI, ink variants `%23000`/`%23fff`, sw param)
  replaces the hand-written URI literals in the 5 law sources. The
  jx-pure icon vocabulary block (`:root`/`.dark`/`.jx-light` +
  palette/chevron masks) moves from the hand region into a 4th
  generated projection (`jx-icon-vocab` slot).
- **invalid-ink de-exempted**: the hand-drawn bare exclamation is
  REPLACED by lucide `circle-alert` (sw 2.5). valid-ink stays lucide
  `check` (sw 2.5). Zero hand-drawn glyphs remain.
- **vite-plugin imports lucide**: `lucideIconProvider` drops its 7
  embedded literals and reads IconNode via dynamic
  `import('lucide')`. `lucide` becomes an OPTIONAL peer — consumers
  who never opt into the icons feature install nothing; a missing
  install fails loudly with the install hint.
- **Component inline SVG → generated module**: the 13 component files
  with hand-copied inline glyphs (dialog/sheet ×, dropdown/popover/
  language-switcher chevrons, theme-toggle sun/moon/monitor,
  file-input kind glyphs, image placeholder, date-picker chevrons,
  code-card/hero-section check+copy, color-picker pipette) consume
  `{@html icons.x}` from the generated set. Non-default stroke
  widths (2.5/1.75/1.5) ride scoped CSS overrides — presentation
  attributes yield to CSS by cascade law.

## Intentional visual changes

1. code-card / hero-section `copy`: the hand-simplified variant
   becomes the full lucide `copy` geometry.
2. `--jx-icon-invalid-ink`: bare exclamation → `circle-alert` (gains
   the circle container).

Both re-baseline their screenshot routes.

## Out of scope (declared, not missed)

- tooltip's caret-polygon data URI — a structural arrow ornament,
  not an icon-library glyph.
- blueprints/og-image static assets — derived outputs; geometry is
  unchanged so they are not regenerated.
- The `--jx-icon-palette` (sheet) vs `pipette` slot (plugin) naming
  split — pre-existing, preserved as-is; both sides now source from
  lucide, reconciliation is a separate decision.
- lucide version upgrades — locked to ^0.472.0 for pixel parity;
  bumping is its own change with re-baselining.
