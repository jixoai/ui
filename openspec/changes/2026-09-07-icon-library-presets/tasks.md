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

- [ ] B1: factor fontIconProvider's decompress/parse/normalize
       helpers into `library/font-extract.ts` (slot face imports FROM
       it — slot byte-locks stay green)
- [ ] B2: `{ font, code }` resolution → {v, n:'fill', d}; ttf/otf
       direct + woff2; woff1 hard error; watchFile HMR
- [ ] B3: `{ font, liga }` best-effort GSUB lookup; miss = named
       error listing the font's resolvable names; unit tests with a
       fixture font carrying one ligature (built in-memory, the
       woff2-roundtrip precedent)

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
