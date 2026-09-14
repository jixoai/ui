# P0.6 receipts — the corpus dogfood (8 families + demo chrome)

> stylex-kernel phase 0 (IMPL-C, 2026-09-15). Working tree
> `jixoai-labs/ui-stylex` (worktree, branch stylex-integration, HEAD
> `d816aaa5` at task start). Every command below is re-runnable from
> the change directory
> (`openspec/changes/2026-09-14-stylex-kernel-phase0`).

## 1. Fixture placement (design §6 ruling, recorded)

**Decision**: the dogfood lives at
`apps/www/src/lib/__probe__/stylex-corpus/` (9 modules + one fixture
component), wired into the real build by the noindex route
`/probe-stylex-corpus`.

**Why (design §6: "the dogfood runs as a build fixture, not a shipped
page")**: `__probe__/` is the established home of build-verification
fixtures (IMPL-B's `popover-area-probe` + `folder-css-probe`), it sits
INSIDE the engine's kernel scope (`apps/www/src/lib` — the transform
runs there), and it is OUTSIDE the registry/files ⇄ mirror pair
(`apps/www/src/lib/__probe__/` is a `SITE_ONLY_PREFIX` in
`scripts/lib/site-only.mjs` — the mirror manifest is untouched). The
registry tree (`registry/files/ui/<family>/`) stays pristine: phase 1
authors the real `<item>.stylex.ts` files in place, and no registry
item ships dogfood atoms. The fixture component renders NOTHING
visible (one hidden marker div); the atoms reach the emitted CSS
through the transform (collection is transform-time), and every
module's export is referenced so no tree-shaker can drop it.

## 2. The corpus modules + the authoring law

9 modules under `apps/www/src/lib/__probe__/stylex-corpus/`:
`code-card` `icon` `popover` `press-button` `prose` `range`
`separator` `switch` (the 8 research families) + `demo` (the spike's
demo chrome — authored StyleX-style "so the whole demo rides one
engine"; the spike artifact carries its atoms, so both sides of the
comparison must too).

Law mapping (design §4, verified under the REAL pipeline's
`propertyValidationMode:'throw'`):

- **static longhand atoms ONLY** — zero factory calls, zero vars-keys
  inside `create()`, zero shorthands (the spike-proven
  `textDecoration:'none'` / `outline` / `padding` compound values pass
  the throw-mode validator as unambiguous longhand-compatible forms,
  unchanged from the spike authoring);
- **theme refs ride the typed token layer** (design §2/§4.1, the
  P0.3b scene idiom): whole-value refs are `tokens['--jx-…']` members;
  refs embedded in composite values name the member literally
  (`var(--jx-ring)` inside `outline`, `var(--jx-border)` inside the
  tick gradients);
- **component seams and kernel channels stay plain `var()` strings**
  (§4.2): `--jx-hit/--jx-text/--jx-line/--jx-gap/--jx-inset/--jx-icon`
  (density), `--jx-toggle-*`, `--jx-pop-pad*`, `--jx-surface-ox/oy`,
  `--jx-tick-step`, `--jx-press-*/--jx-fill*/--jx-tonal/--jx-outline`
  (press-button), `--readonly-code-*`, `--tok-*`,
  `--jx-scrollbar-thin`, `--jx-engrave-shade/glow`.

Two re-authorings the law FORCES vs the spike (design §4.2 — "the
dynamic-value trilogy each silently broke"):

1. **icon**: the spike's factory
   `reservedSize: (size) => ({ width: size, height: size })` compiled
   to `@property --x-width/--x-height` + `var(--x-width/height)` atoms.
   The dogfood re-authors the reserved box as a CSS-var seam:
   `width/height: 'var(--jx-icon-size, var(--jx-icon, 1.5rem))'` —
   the component computes `--jx-icon-size` at runtime (inline style or
   scoped stamp, D1-08); unset degrades to the ambient density channel.
2. **press-button**: the spike's `stylex.defineVars` pose/hue contracts
   + `stylex.createTheme` override classes are build-time theme
   classes — outside the sanctioned idiom. The four pose seams and
   four hue seams ride ATOM FALLBACKS carrying the spike's own
   defaults (`boxShadow: 'var(--jx-press-shadow, var(--jx-shadow-xs))'`
   etc.), preserving the unset-seam runtime resolution.

## 3. Method (the comparator's invocation of record)

```
# 0. the comparator self-test (invocation of record, Gate 1 AND 2)
node research/self-test.mjs        # → all 56 rows verdict as expected

# 1. baseline: clean HEAD (d816aaa5), real www build
cd apps/www && npm run build       # → dist/_app/immutable/assets/0.AVTMvBfZ.css
cd ../../openspec/changes/2026-09-14-stylex-kernel-phase0
node research/dogfood/extract-stylex.mjs extract ../../../apps/www/dist \
  research/dogfood/baseline-stylex.css
#   → F9 statement at byte 0 OK; 26 rules (the tokens defineVars :root
#     block + the P0.3b scene atoms)

# 2. dogfood: with the fixture (+ the route registered), real www build
cd ../../../apps/www && npm run build   # → 0.BJgD5RCQ.css
cd ../../openspec/changes/2026-09-14-stylex-kernel-phase0
node research/dogfood/extract-stylex.mjs extract ../../../apps/www/dist \
  research/dogfood/dogfood-stylex.css
#   → F9 statement at byte 0 OK; 340 rules

# 3. the spike artifact's stylex portion (from the first @property to EOF —
#    the unplugin APPENDS stylex output after the app css)
node research/dogfood/extract-stylex.mjs slice-spike \
  ../../archive/2026-09-13-stylex-kernel-research/spike/corpus/dist/assets/index-BJZZnwww.css \
  research/dogfood/spike-stylex.css          # → 334 rules

# 4. the dogfood delta (rule-level multiset subtraction, corpus-shared aware)
node research/dogfood/extract-stylex.mjs delta \
  research/dogfood/baseline-stylex.css research/dogfood/dogfood-stylex.css \
  research/dogfood/spike-stylex.css research/dogfood/dogfood-delta.css
#   → baseline 26 rules (12 corpus-shared kept) − dogfood 340 → delta 326 rules

# 5. THE COMPARATOR (of record)
node research/compare-compiled.mjs \
  research/dogfood/dogfood-delta.css research/dogfood/spike-stylex.css \
  --raw-out research/dogfood-diff.json
#   → compare-compiled: DIFFERENT (334 vs 342 selectors, N1-N5) — see §4

# 6. root-cause bucketing
node research/dogfood/analyze-diffs.mjs research/dogfood-diff.json
#   → T=37 F=13 P=12 U=0 — every diff bucketed, ZERO unexplained
```

**Extraction rules** (`research/dogfood/extract-stylex.mjs`, all
assertions inside the script):

- the stylex surface of a www asset = the plugin-appended TAIL: every
  top-level unit from the first `@layer stylex.*` mention to EOF —
  blockless priority mentions dropped, the `@layer stylex.priorityN {…}`
  wrappers stripped (one indent), the trailing `@layer utilities;`
  bookkeeping re-mention dropped, bare `@keyframes` + defineVars
  `:root` rules kept verbatim. The F9 statement is ASSERTED at byte 0
  of the asset (the layer law re-verified fresh in BOTH builds).
- **layer stripping is honest here**: the spike (pre-F9 lab) emitted
  UNLAYERED stylex output with `:not(#\#)` specificity bumps
  (treeshake compensation); the F9 pipeline wraps the same rules in
  `@layer stylex.priorityN` blocks and the bumps DISAPPEAR (layers own
  the ordering — verified: same pinned engine, `useCSSLayers` rides
  CSS-generation only, `packages/vite-plugin/node_modules/@stylexjs/
  unplugin/lib/core.js:36`). The comparator's N5 leaf-forgiveness
  absorbs the bump difference (282 of 334 delta selectors matched
  structurally); the layer ORDER itself is byte-0-asserted above and
  pinned by the P0.2 receipts + package tests.
- the delta subtracts baseline rules EXCEPT corpus-shared ones
  (pseudo-suffix + decls, raw or typed-stripped — the tokens scene and
  corpus atoms share typed decl text because plain-atom class names
  are content-derived and dedupe across modules; found live: the
  scene's flat `background-color:var(--jx-primary)` must NOT be kept
  by matching the spike switch's `:checked` rule of the same value).
  A baseline rule MISSING from the dogfood build fails the script
  (regression guard).

## 4. The verdict — and what "equivalent" means here

```
compare-compiled: DIFFERENT (334 vs 342 selectors, normalizations N1-N5 applied)
```

The verdict is DIFFERENT **by design** — phase 0's foundations
(typed token layer, F9 layers, the §4.2 idiom) DELIBERATELY change
the compiled text the lab produced. The acceptance standard (design
§7: "the foundations must reproduce the research's measured behavior
inside the production build") is met by: **every one of the 112 diffs
root-caused to a designed divergence, zero unexplained** —
`research/dogfood/analyze-diffs.mjs` exit 0.

| bucket | count | root cause | design citation |
|---|---|---|---|
| T | 37 | typed-token indirection: `var(--jx-X)` ⇔ `var(--X)` for X a tokens.stylex member (colors, fonts, shadows, surfaces; incl. fallback-carrying `var(--jx-surface-shadow,#ffffff52)` and gradient-embedded `var(--jx-border)`) | §2 + §4.1; resolution = the tokens :root block (`--jx-X: var(--X)`), live-probe chain proven P0.3b |
| F | 13 | seam fallbacks: press pose seams (`--jx-press-shadow(-hover/-active)`, `--jx-press-move`) + hue seams (`--jx-fill/-ink`, `--jx-tonal` incl. the color-mix forms, `--jx-outline`) carry the spike's defineVars defaults as atom fallbacks | §4.2 (the ONE sanctioned dynamic idiom; build-time theme classes are outside it) |
| P | 12 | spike-only machinery: 2 `@property --x-*` + 2 `var(--x-width/height)` rules (the icon FACTORY — forbidden) and 2 defineVars `:root` + 4 createTheme override-class blocks (press-button) have NO dogfood counterpart; the dogfood's 2 icon seam atoms (`var(--jx-icon-size, var(--jx-icon, 1.5rem))`) have no spike counterpart | §4.2 (factories forbidden; components compute vars at runtime) |

**Matched exactly (the reproduction core)**: 282/334 delta selectors
structurally matched the spike with N1–N5 normalization and NO
post-hoc transformation — including `@keyframes xfeh6hy-B` under its
IDENTICAL name (content-derived: same frames → same hash, the L3c
path-dependence concern does not arise for same-content frames),
every geometry/literal atom (masks, gradients, steps(1)→step-end,
`calc(infinity * 1px)`→`3.40282e38px`, the veils, the switch travel),
every media/forced-colors/print/reduced-motion nest, and the document
@layer order vector (no diffs). Content-derived class identity was
observed directly (`.x78zum5` display:flex, `.x10a8y8t` inset:0 —
same names both sides).

### Per-family verdict table

| family | verdict | designed divergences (all bucketed) |
|---|---|---|
| code-card | EQUIVALENT modulo T | T: font-nav/font-mono (head/file/pre), ring + foreground fallback (pre outline, `--tok-foreground` composite) |
| icon | EQUIVALENT modulo P | P: factory → `--jx-icon-size` seam (§4.2) |
| popover | EQUIVALENT modulo T | T: border/background/muted/foreground/popover (body, trigger, acrylic mix), font-sans, shadow-xs/sm/sm-press, surface-shadow fallback pair (+ the `@supports lab()` nest) |
| press-button | EQUIVALENT modulo T+F+P | T: font-sans/mono, foreground, primary (link/spinner/check); F: 4 pose seams + 4 hue seams (13 diff entries incl. :hover/:active nests); P: defineVars/createTheme blocks absent |
| prose | EQUIVALENT modulo T | T: muted-foreground/primary/error inks, 6 ground surfaces, fonts |
| range | EQUIVALENT modulo T | T: foreground/error inks, font-mono, border (end ticks + 3 tick gradients, `--jx-tick-step` seam unchanged) |
| separator | EQUIVALENT modulo T | T: border on the 2 solid atoms; all masks/ghosts/blends verbatim |
| switch | EQUIVALENT modulo T | T: border/primary/muted/background/ring/primary-foreground (track ring shadow, hover ring, checked grounds, knob border, focus ring); the whole state machine verbatim |
| demo chrome | EQUIVALENT modulo T | T: muted-foreground/border/card/foreground/muted |

## 5. F9 layer law — re-verified in the dogfood build

`apps/www/dist/_app/immutable/assets/0.BJgD5RCQ.css` byte 0 =
`@layer properties, theme, base, components, stylex.priority1,
stylex.priority2, stylex.priority3, utilities;` (asserted by the
extractor in BOTH builds). The stylex tail rides
`@layer stylex.priority2 … priority9` blocks (one per nesting depth;
`priority1` mentioned blockless) + the trailing `@layer utilities;`
re-mention, then bare `@keyframes xfeh6hy-B` and the 60-member
defineVars `:root, .xbpgcew` block. Same in the baseline build.

## 6. Process evidence

- builds: two serial `npm run build` in apps/www (baseline HEAD
  `d816aaa5`, then dogfood), both exit 0; no dev server, no browser,
  no background processes started (the extractor/comparator are
  one-shot node scripts).
- `node research/self-test.mjs` → 56/56 (re-run in the final gate).
- artifacts committed alongside this receipt:
  `research/dogfood/{extract-stylex.mjs, analyze-diffs.mjs,
  baseline-stylex.css, dogfood-stylex.css, dogfood-delta.css,
  spike-stylex.css}` + `research/dogfood-diff.json` (the raw diff, of
  record) — Gate 2 can re-run step 5/6 on the committed extracts.
