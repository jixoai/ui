# icon-library-presets — out-of-the-box icon libraries + font-file sources

## Why

The library face accepts exactly three sources today (built-in lucide
manifest, inline SVG strings, `{file}`) — every other library means
hand-feeding SVG files. The Owner asked for shadcn-creator-grade
out-of-the-box libraries (plus Material Symbols), and for the
font-file import lane that was in the original icon-direction brief
but dropped from the library face at the pivot.

## What Changes

1. **Library presets** — `library.presets: ['material', 'phosphor',
   'remix', …]` declares installed icon libraries; each preset
   contributes a prefixed resolver (`md:`, `ph:`, `rx:` …) resolving
   ONE icon by name at build time (no bulk bundling). Presets ship as
   optional peer packages of `@jixoai/vite-plugin`, each backed by a
   per-icon SVG-source package (research-verified 2026-09-07):
   - `material` → `@material-symbols/svg-400` (Apache-2.0; weight
     100–700 × fill/no-fill × outlined/rounded/sharp as discrete
     files — all seven weight packages are declared optional peers;
     default mapping `md:` = outlined / weight 400 / FILL 0,
     configurable). Note: grade/opsz axes exist only in the variable
     FONT, not the SVG packages.
   - `phosphor` → `@phosphor-icons/core` (MIT, 9,072 .svg).
   - `remix` → `remixicon` (Apache-2.0, 3,231 .svg).
   - `lucide` stays the built-in default (already wired).
   - tabler (repo-only SVGs) and hugeicons (JS data, no SVG files)
     are OUT — no per-icon SVG source package on npm (verified).
   - **SF Symbols is REJECTED on licensing** (Apple system-provided
     image terms: Apple-platform apps only, no SVG
     export/redistribution, no confusingly-similar glyphs in
     trademark uses). The docs page states this verdict.
2. **Font-file sources** — `IconSource` gains `{ font, code } |
   { font, liga }`: the plugin (which already owns woff2→TTF
   decompression via wawoff2 and opentype.js glyph extraction in the
   slot face's fontIconProvider) extracts the named glyph's outline
   at build time into the standard `{v, n:'fill', d}` payload.
   Runtime stays SVG (SSR/print/no-JS/chunking guarantees unchanged
   — the pivot's terms hold). Codepoint mapping is the primary lane;
   ligature lookup is best-effort (the `liga` string is text to
   shape through GSUB — opentype.js coverage is thin,
   research-verified) and misses fail loudly listing the font's
   resolvable ligature sequences, else the mapped-name hint.

## Impact

- `packages/vite-plugin`: new `library/presets/` resolvers + font
  source lane in `library/resolve.ts`; optional peers for the preset
  packages (absent install = loud named error, the lucide precedent).
- Generated artifact unchanged in shape BY THIS CHANGE (the
  companion prefix-compiler change extends it — ALIASES/template
  members); preset/font icons enter the
  same packing/chunking pipeline.
- docs icons page: preset table + font-source section + the SF
  Symbols licensing note.
- Deliberately out of scope: the prefix-compiler (name:prefix typing,
  `as` aliases — separate change 2026-09-07-icon-prefix-compiler);
  any runtime font rendering; variable-font EXPORT (researched,
  parked: JS cannot author gvar; fontTools is the only variable-font
  authoring path; fontkit getVariation / opentype.js 2.0
  VariationManager would serve build-time instance extraction if an
  export lane is ever wanted).
