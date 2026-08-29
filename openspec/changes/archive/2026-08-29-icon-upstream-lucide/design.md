# Design — icon upstream (lucide)

## Data flow

```
                 lucide@^0.472.0 (npm, ISC)
                 ┌───────────┼──────────────────┐
           devDep(root)  devDep(css-laws)  peer+optional(vite-plugin)
                 │            │                  │ dynamic import('lucide')
         scripts/gen-icons  src/icon-uris.ts  providers/lucide.ts
                 │            │                  │
         ┌───────┴──────┐     │                  │
         │ emits        │     │                  │
         │ icons.ts     │     │                  │
         │ + --check    │     │                  │
         └───────┬──────┘     │                  │
                 ▼            ▼                  ▼
     registry/files/lib/  css-laws 5 laws +     virtual:jixoai-icons
     icons.ts             jx-icon-vocab proj.  (--jx-icon-* vars)
                 │            │
           {@html icons.x}  3+1 projections → theme sheets
```

Three independent consumers, one upstream. Consistency across layers
is transitive: each consumer pins its output against lucide's own
IconNode in its tests, so no cross-layer literal gate is needed.

## Decision: generation over runtime components (Owner, 2026-08-29)

`lucide-svelte` components were rejected for the registry layer: the
`{@html}` SVG-string interface, baked `aria-hidden`/`data-jx-icon`/
16px defaults and the zero-dependency registry posture are kept;
lucide becomes the build-time source instead. The plugin layer DOES
import lucide at runtime — but as an optional peer behind the
already-async provider factory, so the zero-runtime-dep posture
survives for every consumer that never passes `icons:`.

## Decision: byte-compat as the migration gate

The generator and the css-laws serializer must reproduce the current
committed artifacts BYTE-IDENTICALLY (except the two declared visual
changes). The encoder is reverse-engineered from the committed
literal URIs (encodeURIComponent flavor, `%23` ink encoding,
attribute order from lucide's canonical IconNode order). The
freshness gates (`verify:icons`, css-laws `--check`) plus the
existing jx-pure-parity fingerprint spec hold the line.

## Decision: stroke-width variants ride CSS, not manifest entries

Generated exports bake sw 2 (lucide default), matching today's
icons.ts law. Call sites needing 2.5/1.75/1.5 override via scoped
CSS (`stroke-width` beats the presentation attribute in the
cascade) — the same mechanism the 16px sizing law already uses. No
`xBold`-style manifest variants pollute the export vocabulary.

## Decision: the vocabulary block becomes a 4th projection

The jx-pure hand region's icon vocabulary (`:root`/`.dark`/
`.jx-light` `--jx-icon-*` definitions + `.jx-color-shell::after`
palette mask + `.jx-color-picker-chevron` mask) enters css-laws as a
dedicated `jx-icon-vocab` slot with begin/end markers, generated
from `icon-uris.ts`. verify-standards B2 (every data URI is a
`--jx-icon-*` definition or slotted use) keeps policing the sheet.

## Exceptions register (empty by ruling)

The invalid-ink exemption drafted in the original plan was REJECTED
by the Owner: lucide `circle-alert` (sw 2.5) replaces the bare
exclamation. There are NO hand-drawn glyphs left in the repo.
