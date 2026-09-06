# design — icon-library-presets

## 0. Source resolution today → after

```
IconSource (today):  string | { file } | `lucide:${kebab}`
IconSource (after):  …same…
                     | `md:${kebab}` | `ph:${kebab}` | `rx:${kebab}`   // presets
                     | { font: './x.woff2', code: 0xE002 }            // codepoint
                     | { font: './x.woff2', liga: 'md-logo' }         // best-effort
```

The preset REFERENCES (`md:x`) are ordinary IconSource strings —
usable in `library.icons` overrides AND in the prefix-compiler's
scanned names (the companion change). A preset is ENABLED by
`library.presets: ['material', …]`; referencing a disabled preset's
prefix is a named config error listing the enabled set.

## 1. Preset registry

```ts
interface IconPreset {
  readonly prefix: 'md' | 'ph' | 'rx';        // the ref namespace
  readonly peerPackage: string;               // optional peer to install
  readonly resolve(ref: string): Promise<ResolvedLibraryIcon>;
  readonly defaultsNote: string;              // style/weight/fill mapping
}
```

- **material** (`md:`): file = `@material-symbols/svg-${weight}/${style}/${name}${fill ? '-fill' : ''}.svg`.
  Config: `presets: [{ id: 'material', weight: 400, style: 'outlined', fill: false }]`
  (string shorthand `'material'` = these defaults). Apache-2.0.
- **phosphor** (`ph:`): `@phosphor-icons/core/assets/${weight}/${name}.svg`
  (weight: thin/light/regular/bold/fill/duotone; default regular). MIT.
- **remix** (`rx:`): `remixicon/icons/${category}/${name}.svg` (the
  name carries its category prefix, e.g. `rx:system:add-line`). Apache-2.0.
- Resolution = adapter-side (the plugin owns file I/O — frozen
  principle #4; peer packages resolve through node resolution, NOT
  ctx.loadSource); each preset icon passes the SAME safety → svgo →
  extraction pipeline as any other source (nature: material/phosphor/
  remix artwork is fill/mixed — the extractor's nature detection
  decides per icon, and stroke-nature icons in a fill family keep
  their stroke attrs in `d` children as today).
- Absent peer install → the lucide loud-fail precedent: named error
  naming the npm install line.
- Versioning: presets pin nothing themselves (consumers' own semver
  range rides their lockfile); the DEFAULTS (weight/style) are frozen
  per preset id and documented.

## 2. Font-file sources (the pivot's missing lane, build-time only)

```
{ font, code }:  wawoff2 decompress → opentype.js parse → cmap[cp]
                 → glyph outline → normalize (contain-fit, the
                   fontIconProvider math, reused verbatim) → {v, n:'fill', d}
{ font, liga }:  …same parse → GSUB liga lookup for the sequence
                 (opentype.js coverage is THIN — best-effort, and a
                 miss is a NAMED build error listing the font's
                 mapped names that DO resolve, never a silent blank)
```

- Reuse: slot-face `fontIconProvider` already owns decompression +
  parse + bbox-normalization — factor those helpers into
  `library/font-extract.ts` shared by both faces (byte-locks on the
  slot face must stay green: SHARING helpers is fine, changing slot
  behavior is not).
- The font file joins `watchFile` (HMR), like `{file}` SVGs.
- woff1 → still the hard error (existing loadSource rule). ttf/otf
  direct paths also accepted (`font: './x.ttf'`).
- Runtime: nothing changes — the payload enters packing/chunking as
  fill-nature artwork.

## 3. Type + artifact impact

None beyond names: preset/font names join `IconName` and the packing
order (manifest → custom insertion order → preset/font refs in
declaration order). Determinism law unchanged.

## 4. Docs

The icons page's plugin section gains: the preset table (prefix /
package / license / default mapping), the font-source snippet, and
the **SF Symbols verdict box** (licensing quote + pointer to
Apple-platform-only terms; tabler/hugeicons listed as not-shipped
with the why: no per-icon SVG package / JS-data only). The
component page's `name` docs mention prefixed names as legal union
members once the companion change lands (cross-referenced, not
duplicated).

## 5. Out of scope (explicit)

Prefix-compiler typing/scanning/aliases (companion change); runtime
font rendering (the abandoned direction); variable-font export
(parked with the research note: authoring needs Python fontTools —
no JS gvar writer exists; build-time instance extraction would use
fontkit getVariation or opentype.js ≥2.0 VariationManager).
