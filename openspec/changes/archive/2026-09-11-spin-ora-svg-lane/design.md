# design — spin-ora-svg-lane

> r1 (super-thinker 8/10): spin.css stays in the files list (B1),
> registry/vite.config.ts byte-parity added (B2), verify-all array
> wiring made explicit (B3), virtual-module surface killed (the
> adapter is a build-start generator, no resolveId/load), curation
> predicate upgraded to Emoji_Presentation semantics, matchMedia
> change-listener adopted, SMIL unload-order documented, cli-spinners
> devDep + deps baseline + mirror manifest + blast-radius specs wired.

## 0. Sources & authorities

- **ora** (sindresorhus/ora) renders spinners from **cli-spinners**
  (v2.9.2) — `spinners.json` is the authoritative frame corpus. Frames
  are copied VERBATIM from the package data (never hand-transcribed —
  braille glyphs are transcription traps). cli-spinners@2.9.2 joins
  the ROOT devDependencies (the curation receipt script + the catalog
  snapshot test resolve it; scripts/verify-deps-baseline.json updates
  in the same change). Curation license note: cli-spinners is MIT —
  the catalog file's header records the source + license.
- **blocks-wave** (the default svg animation): extracted from
  https://magecdn.com/tools/svg-loaders/blocks-wave (page-embedded
  astro-island props, 2026-09-11). 9 `<rect>` children, each carrying
  4 SMIL `<animate>` elements (x/y/width/height, `dur="0.6s"`,
  staggered `begin` via syncbase refs `spinner_oJFS.begin+0.1s` …),
  root `fill="currentColor" viewBox="0 0 24 24"`. Site license: MIT,
  commercial + personal use, no attribution required.
- **Precedents**: icons library face (icon-component-pipeline
  2026-09-06; channels 2026-09-07), icon.svelte's `{@html}` sink law,
  registry `icon-set` item, gen:icons single-writer flow.

```
consumer config                     build time                       runtime
─────────────                       ───────────                      ───────
jixoai({ spinners: {          ┌──► resolve sources (string|file) ──► RAW safety
  spinners: { loader: {file} } │   vendor blocks-wave manifest      (animate-aware)
}})                            │   name grammar: /^[a-z][a-z0-9-]*$/
                               ├──► NO svgo (byte-faithful law)
scripts/gen-spin-set.mjs ──────┘         │
(single writer)                          ▼
                              registry/files/lib/spin-set.gen.ts
                              (SpinName union · SPIN_NAMES · getSpin)
                              byte-mirrored → apps/www/src/lib/
                                         │
                                         ▼
   <Spin spinner="dots" /> ──► text: spin-catalog.ts (JS interval, SSR frame 0)
   <Spin spinner="blocks-wave" /> ──► svg: getSpin → owned <svg> root + {@html} d
```

## 1. The text catalog (intent: pure data, verbatim corpus)

**Curation rule (objective, re-runnable)**: include every
cli-spinners entry whose frames (a) contain NO emoji-presentation
characters — no codepoint ≥ U+1F000, no U+FE0F (VS16), no BMP char
with Emoji_Presentation=Yes (the standard ranges list embedded in the
curation script — a blanket 0x2600-0x27bf range is WRONG: ✶✸✹✺ and
the trigrams are text-presentation glyphs and stay) — (b) count
≤ 30 frames, (c) are ≤ 10ch wide per frame. Excludes: the emoji
family (clock/earth/hearts/monkey/smiley/moon/runner/weather/
fingerDance/fistBump/soccerHeader/mindblown/speaker/*Pulse/
timeTravel/dwarfFortress/christmas/arrow2), the oversized (dots8Bit
256 frames, dots12 56, sand 35, material 92, pong/shark width), and
**bouncingBar by name** — its frames ARE `[` `]` bracket art, the
very decoration this change kills (Owner ruling #1). Result ≈ 63
spinners (star, hamburger, toggle12 return under the corrected
predicate).

- File: `registry/files/ui/spin/spin-catalog.ts` — one intent: the
  frozen corpus. Export `SPINNER_CATALOG` (Record<name, { frames:
  readonly string[]; interval: number }>), `TextSpinnerName` (union),
  `TEXT_SPINNER_NAMES`. Per-spinner interval rides VERBATIM (line
  130ms, simpleDots 400ms, circleHalves 50ms…).
- **Default: `dots`** (ora's default; the current `/—\|` cycle remains
  available as `line`).

## 2. The frame engine (CSS steps → JS interval)

The 4-frame CSS machinery cannot express 2..30 frames at
per-spinner intervals. The engine is ora's own: a `$state` frame
index + `$effect` interval.

- **SSR**: frame 0 statically (no interval server-side; `$effect`
  never runs) — hydration renders the same frame 0, no mismatch.
- **reduced-motion**: the effect obtains
  `matchMedia('(prefers-reduced-motion: reduce)')` and SUBSCRIBES to
  its `change` event (cleanup removes it) — under reduce the interval
  is torn down, on un-reduce it restarts, restoring the old CSS
  media-query's LIVE semantics (a mount-time one-shot read would
  freeze the decision; one listener line buys parity with the
  retired CSS kill).
- The frame index is `$state`; the interval callback writes it from
  a local counter — the async callback's write is outside the
  effect's dependency capture by construction (no re-subscribe on
  tick). `spinner` change re-runs the effect (cleanup + restart at
  the new interval).
- **spin.css shrinks to ONE rule** (the frame keyframes die with the
  CSS engine): the svg posture's CSS-animation reduced-motion kill
  (§3) — the file stays as that rule's D1-exempt home (and stays in
  the registry files list), the same residue posture it already
  held.

## 3. The svg posture (component contract)

`getSpin(name)` answers `{ v, n, d } | null` synchronously (single
inline module — no lazy tier; `null` not `undefined`, the `getIcon`
precedent). The component OWNS the `<svg>` root: viewBox from data,
`size` square edge (default 16, resolved via SpinDefaults' open
literal slot — icon parity), nature-aware currentColor painting
(fill nature: `fill=currentColor stroke=none`; stroke nature the
inverse), `aria-hidden`, `data-jx-spin-svg`, `class` + rest
verbatim. `d` (the children innerHTML incl. `<animate>`) crosses
through `{@html}` — the icon sink law verbatim: payload exclusively
the plugin-extracted artifact content, RAW-gated upstream, nothing
prop-reachable.

- **R1 (root-attr handling)**: the artifact stores `{ v, n, d }` —
  `n` the artwork nature (fill|stroke) EXACTLY as icons do, so a
  CSS-animated stroke loader keeps correct painting. blocks-wave is
  fill-nature. (One-line cost for icon symmetry; not speculative —
  custom loaders are the feature's point.)
- **Reduced motion, two named channels**: SMIL loaders → the same
  matchMedia listener as §2 drives `root.pauseAnimations()` /
  `unpauseAnimations()` (freeze on first frame: the 3×3 grid).
  CSS-keyframed loaders → spin.css's static kill
  (`@media (prefers-reduced-motion: reduce) {
  :where([data-jx-spin-svg] *) { animation: none } }` riding the
  unlayered `:where` carve-out — D1-exempt residue, the toggle/Part
  A precedent). The two channels are documented, not conflated.
- **Multi-instance lockstep + unload order**: SMIL syncbase refs
  (`begin="spinner_oJFS.begin+0.1s"`) resolve by id; duplicate ids
  across instances resolve to the FIRST in document order →
  same-artwork instances animate in lockstep, and if that first
  instance UNMOUNTS first (SPA navigation), the dangling syncbase
  leaves dependent timelines engine-defined (may freeze or reset).
  Independent phasing needs per-instance id rewrite over the trusted
  payload — REJECTED (the `{@html}` payload stays byte-faithful; no
  string surgery on markup at render). Declared compromise: docs
  note + the V3 walkthrough covers multi-instance and
  first-instance-unmount.

## 4. The unified name lane

`spinner?: SpinName | TextSpinnerName` (default `'dots'`).
Resolution: **artifact first, catalog second** — an svg spinner named
`dots` overrides the text one (explicit config beats built-ins; the
icons override law). Name grammars keep the namespaces legible
(catalog camelCase vs artifact kebab) but are NOT enforced as
disjoint — override is a feature, not a collision. Unknown name
(reached only via `as any`): render frame 0 of `dots` + one dev
warn (never a blank region — loading feedback never disappears).

## 5. The plugin feature (packages/vite-plugin/src/spinners/)

```
src/spinners/
  types.ts        SpinnerSource (string | {file}), SpinnersPluginOptions,
                  SpinData {v,n,d}, report
  manifest.ts     the vendored blocks-wave svg + name
  resolve.ts      source resolution (adapter I/O only here)
  generate.ts     the PURE generator (input: resolved {name,svg}[];
                  output: artifact source + report) — svgo NEVER runs
  safety.ts       re-export the icons RAW checker; SMIL allowances if
                  the checker rejects animate elements (R2 — never
                  weaken the checker for icons)
  vite-plugin.ts  the adapter: buildStart validate/resolve + optional
                  write + drift-warn. NO resolveId/load — there is no
                  virtual surface (nothing imports a virtual id: the
                  artifact has no lazy tier and no CSS face; the
                  component imports the real generated file)
  script.ts       writeSpinSetArtifact / checkSpinSetArtifact (the
                  root-script adapter, icons script.ts precedent)
  index.ts        the ./spinners sub-entry barrel
```

- **Umbrella**: `jixoai({ spinners: { includeDefaults?, spinners?,
  output?, write? } })` — default **false** (icons precedent:
  registering costs hooks; opting in is explicit — and the DEFAULT
  experience loses nothing: the committed artifact is plugin-free).
  No provider/slot split — spinners have ONE face (the library
  face); the icons ≥1-of-2 matrix error does not apply (a bare `{}`
  IS a configuration: it means "blocks-wave only").
- **R2 (safety scope)**: the icons RAW checker's rejection set
  (scripts, on* handlers, foreign namespaces…) applies VERBATIM;
  SMIL elements (`animate`, `animateTransform`, `set`) are NOT in
  the rejection set and SHALL be regression-tested to stay allowed.
  If the checker rejects anything blocks-wave needs, the spinners
  lane gets its own allowance — never a checker WEAKENING for icons.
- **No svgo** (byte-faithful law): svgo's default preset carries
  `convertShapeToPath`, which rewrites `<rect>` to `<path>` and
  silently KILLS `attributeName="x|y|width|height"` animate
  targeting. Spinners lane: RAW safety gate → verbatim extract.
  (optimize option deliberately absent; a future tuned preset would
  be a new change with its own evidence.)
- **Artifact** `registry/files/lib/spin-set.gen.ts`: `SpinName`
  union, `SPIN_NAMES`, `getSpin(name): SpinData | null`, GENERATED
  header naming gen:spins. Single inline module, always-sync (no
  chunk tier, no virtual ids, no plugin prerequisite for the DEFAULT
  artifact — spin-set installs plugin-free; the plugin only
  re-generates with custom spinners).
- **www dogfood**: BOTH app configs add `spinners: {}` byte-
  identically — `apps/www/vite.config.ts` AND
  `registry/vite.config.ts` (the vite-config-parity gate diffs them
  byte-for-byte; one-sided edits fail verify:all). CONFIG-PARITY
  with the root gen script options (the icons law).
- **Single writer**: `scripts/gen-spin-set.mjs` (+ `gen:spins`,
  `verify:spins` scripts) is the ONLY in-repo writer; the vite
  adapter drift-warns, never writes (write: false default);
  `verify-all.mjs`'s FIXED gate array gains `'verify:spins'` (it
  does not enumerate npm scripts — an unwired gate never runs).

## 6. Tests (the measured-acceptance law)

- **plugin vitest**: catalog-independent battery — (a) default
  artifact content (blocks-wave union + getSpin payload byte-Equal
  to the vendored svg modulo root extraction), (b) custom inline +
  file sources join the union, (c) name grammar + override errors,
  (d) safety: `<script>` rejected, `<animate>` allowed (R2 pinned),
  (e) generator purity (same input → same bytes), (f) drift-warn
  path, (g) umbrella default-off + bare-{} shape, (h) write:false
  adapter never touches disk.
- **www suite**: NEW spin battery (frame-0 SSR markup, no brackets —
  pinned byte assertions; spinner prop union; svg posture markup
  (owned root attrs + animate children present); reduced-motion
  paths (interval never starts / pauseAnimations called — mocked);
  wrapping posture regression (scrim/aria-busy unchanged); catalog
  snapshot (names count + verbatim frames spot-checks against the
  cli-spinners devDep data)). BLAST RADIUS re-records:
  `test/defaults-overlays.spec.ts` (SpinDefaults' banner — the
  contract comment updates: spinner/size join the surface),
  `test/batch5-antd-components.spec.ts` (`[data-jx-spin-inline]`
  markup assertions), and the context-coverage fixture copy of the
  spin files (`test/fixtures/context-coverage/root/registry/files/
  ui/spin/`) re-synced to the new shape.
- **verify:all** stays green end-to-end: mirror (the manifest
  REGENERATES — new files join it via the write-mode mirror tool),
  meta, docs structure, budgets re-recorded where the artifact
  shifts them, deps baseline (cli-spinners row).

## 7. Registry + docs

- `registry.json`: spin description rewritten (ora catalog voice,
  bracket cursor retired); `registryDependencies` += `@jixoai/
  spin-set`; files: spin.svelte, spin-catalog.ts, index.ts,
  spin-defaults.svelte.ts, **spin.css** (kept — the reduced-motion
  kill's home). NEW `spin-set` (registry:lib, group engines): ships
  the artifact, docs the gen:spins contract.
- Docs page `docs/components/spin.html`: the text gallery (family
  representatives, NOT all 63), the svg section (blocks-wave + size
  + reduced-motion note + multi-instance/lockstep note), postures
  unchanged. llms-txt md regenerates via the build.
- Blueprint scene: text + svg + wrapping trio.

## 8. Rejected alternatives (recorded)

- **CSS steps for the catalog** — impossible per-frame-count
  keyframes without generated CSS (breaks utilities posture); JS
  interval IS ora's mechanism. REJECTED.
- **Virtual module surface (`virtual:jixoai-spin-set`)** — the icons
  virtual ids exist because the artifact's lazy loaders import them
  and the slot face serves CSS; the spinners artifact has neither
  consumer. A resolveId/load/middleware surface nobody imports is
  dead weight (super-thinker r1). REJECTED — the adapter is a
  build-start generator + drift-warner.
- **Chunked lazy artifact** — the budget problem icons solved
  (38+ icons, gzip-budgeted) does not exist at ≤ a few spinners;
  the lazy tier + reserved-box machinery would be speculative
  complexity. REJECTED (single inline module).
- **Per-instance SMIL id rewrite** — string surgery on trusted
  markup at render; violates the byte-faithful payload instinct
  for a cosmetic phase offset. REJECTED (lockstep compromise,
  unload-order sharp edge documented).
- **`type="text"|"svg"` prop** — two vocabulary lanes for one
  concern; the unified `spinner` name lane (artifact-first override)
  matches the icon override law. REJECTED.
- **svgo with tuned preset** — a preset that provably preserves
  SMIL semantics is a research task with no consumer need yet;
  byte-faithful is the safe default. DEFERRED (new change with
  evidence if ever).
