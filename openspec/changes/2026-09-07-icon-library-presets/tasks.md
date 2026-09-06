# tasks — icon-library-presets

## A. Preset machinery (packages/vite-plugin)

- [ ] A1: `src/icons/library/presets/` — the IconPreset interface +
       registry; `library.presets` option (string shorthand + object
       form); disabled/unknown preset prefix → named error listing
       the enabled set
- [ ] A2: material preset (`md:` → @material-symbols/svg-${weight},
       weight/style/fill config, default outlined/400/FILL0) + peer
       absent loud-fail
- [ ] A3: phosphor (`ph:` → @phosphor-icons/core) + remix (`rx:` →
       remixicon) presets + peer absent loud-fail
- [ ] A4: adapter-side preset resolution through the shared
       safety→svgo→extraction pipeline; per-icon nature detection
       for mixed families; unit tests per preset (fixture SVGs
       vendored small, real packages in optional devDeps)

## B. Font-file sources

- [ ] B1: factor the genuinely shared helpers out of
       providers/font.ts into `library/font-extract.ts`:
       `loadOpentype`, `toArrayBuffer`, `normalizeGlyph` + the
       bbox-emptiness check (slot face imports FROM it — slot
       byte-locks stay green). NOT factored: decompression (it lives
       in the vite plugin's loadSource, never fontIconProvider's —
       the library lane inherits woff2/woff1/ttf/otf handling through
       `io.loadSource`) and `extractGlyph` + its slot-labeled error
       strings (test-locked, font.test.ts:281-303 — they stay in
       font.ts)
- [ ] B2: `{ font, code }` resolution → {v, n:'fill', d} via a new
       font-mime branch in resolveLibraryInputs (parallel to the
       svg-only `{file}` branch; charToGlyphIndex===0 / empty-bbox
       loud-fail precedents); ttf/otf direct + woff2; woff1 hard
       error; watchFile HMR; the root-script adapter (svg-only twin)
       rejects font sources with a NAMED error — documented, script
       twin font support is future work
- [ ] B3: `{ font, liga }` best-effort GSUB lookup; miss = named
       error listing the font's resolvable ligature names WHEN THE
       PARSER EXPOSES THEM, else the glyph-name/cmap hint; unit tests
       with a fixture font carrying one ligature (built in-memory,
       the woff2-roundtrip precedent)

## C. Docs + gates

- [ ] C1: icons page plugin section — preset table (prefix/package/
       license/default), font-source snippet, SF Symbols licensing
       verdict, tabler/hugeicons not-shipped note; icons-page.spec
       locks updated
- [ ] C2: optional peers declared in package.json
       (peerDependencies + peerDependenciesMeta, the lucide
       precedent); `npm pack --dry-run` gate
- [ ] C3: full gate battery green (verify:all; vite-plugin suite;
       www suite; docs)

## D. Closure

- [ ] D1: codex doc-review rounds (PASS gate) → implementation
       streams → codex diff review → archive → push
