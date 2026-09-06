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
  readonly resolveFile(ref: string): string;  // ABSOLUTE peer SVG path (node-resolved)
  readonly defaultsNote: string;              // style/weight/fill mapping
}
```

`resolveFile` returns the peer package's ABSOLUTE SVG path via node
resolution. It deliberately does NOT return resolved icon data (the
post-pipeline `ResolvedLibraryIcon` type would contradict the shared
pipeline below): the ADAPTER reads that path through `ctx.loadSource`
(mime law + watchFile HMR reuse, exactly like `{file}` sources) and
runs the shared RAW safety → svgo → structural-validation pipeline.

- **material** (`md:`): file = `@material-symbols/svg-${weight}/${style}/${name}${fill ? '-fill' : ''}.svg`.
  Config: `presets: [{ id: 'material', weight: 400, style: 'outlined', fill: false }]`
  (string shorthand `'material'` = these defaults). Apache-2.0.
- **phosphor** (`ph:`): `@phosphor-icons/core/assets/${weight}/${name}.svg`
  (weight: thin/light/regular/bold/fill/duotone; default regular). MIT.
- **remix** (`rx:`): `remixicon/icons/${category}/${name}.svg` (the
  name carries its category prefix, e.g. `rx:system:add-line`). Apache-2.0.
- Resolution = adapter-side, two steps (the plugin owns file I/O —
  frozen principle #4): presets node-resolve to an absolute path via
  `resolveFile` and hand it to `ctx.loadSource` — node resolution
  locates the FILE; the plugin still owns the READ. Each preset icon
  then passes the SAME RAW safety → svgo → extraction pipeline as any
  other source (nature: material/phosphor/
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
                 resolvable ligature names WHEN THE PARSER EXPOSES
                 THEM, else the glyph-name/cmap hint — never a silent
                 blank)
```

- Reuse (corrected inventory): what is actually shareable from
  providers/font.ts is `loadOpentype` + `toArrayBuffer` +
  `normalizeGlyph` plus the bbox-emptiness check — factor those into
  `library/font-extract.ts` shared by both faces (byte-locks on the
  slot face must stay green: SHARING helpers is fine, changing slot
  behavior is not). Decompression is NOT fontIconProvider's — it
  lives in the vite plugin's `loadSource`, so the library lane
  inherits woff2 decompress, the woff1 hard error, and ttf/otf mime
  detection through `io.loadSource` for free. `extractGlyph` and its
  slot-labeled error strings STAY in font.ts (their messages are
  test-locked, font.test.ts:281-303).
- Plug-in point: a new font-mime branch in `resolveLibraryInputs`,
  parallel to the svg-only `{file}` branch, reusing the slot face's
  loud-fail precedents (charToGlyphIndex === 0 and the empty-bbox
  error).
- Script twin: the root script adapter (library/script.ts) is
  svg-only today and its header says the library face never reads
  fonts — v1 scope: gen:icons / `--check` REJECT font sources with a
  NAMED error (documented), not a silent mime lie; extending the
  script twin (woff2 decompress + mime detect) is future work
  outside this change.
- The font file joins `watchFile` (HMR), like `{file}` SVGs.
- woff1 → still the hard error (existing loadSource rule). ttf/otf
  direct paths also accepted (`font: './x.ttf'`).
- Runtime: nothing changes — the payload enters packing/chunking as
  fill-nature artwork.

## 3. Type + artifact impact

None beyond names: preset/font icons are VALUES of `library.icons`
entries — they enter packing at their declared position in the custom
insertion order (no new input stream in THIS change; the scanned
stream belongs to the companion change). Determinism law unchanged.
The in-repo default config is untouched by this change, so the 38/38
geometry lock and the MEASURED 6602/1-chunk acceptance stay green
unmodified.

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
