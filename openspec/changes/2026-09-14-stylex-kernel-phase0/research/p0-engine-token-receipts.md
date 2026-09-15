# P0.2 + P0.3 receipts — the engine wiring + the typed token layer

> stylex-kernel phase 0 (IMPL-A, 2026-09-15; the F9 section and the
> package-gate counts re-measured at the Gate-2 P1 fix round by
> IMPL-E, same day — both marked below). Every receipt below is
> re-runnable from this tree; commands verbatim. Commits:
> `f0b560f5` (P0.2a), `d7891b37` (P0.2b), `d79bc320` (P0.3a),
> `fe12cde7` (P0.3b), + the probe commit (P0.3c, this file).

## P0.2 — the engine rides @jixoai/ui-vite-plugin

### The pin

```
npm ls @stylexjs/unplugin @stylexjs/stylex   # in packages/vite-plugin
├── @stylexjs/stylex@0.19.0
└─┬── @stylexjs/unplugin@0.19.0
  └─┬── @stylexjs/babel-plugin@0.19.0
    └── @stylexjs/stylex@0.19.0 deduped
```

devDependencies EXACT (no `^`); policy recorded in
`packages/vite-plugin/src/stylex/vite-plugin.ts` (header) + README
("Version pin policy"): **bumps re-run the research dossier's D1
fixtures AND re-audit the wrapper** — the wrapper drives the pinned
version through its public surface + ONE internal accessor
(`__stylexCollectCss`). tsdown keeps the engine EXTERNAL
(`tsdown.config.ts` external list) — dist carries the bare specifier
`@stylexjs/unplugin/vite`, never a relative node_modules path, never a
consumer dependency (F11).

### The kernel-scope gate

Unit receipts (in `packages/vite-plugin/test/stylex/wiring.test.ts`,
11/11 green in the suite run):

- out-of-scope ids (`src/docs/page.ts`, `node_modules/dep/mod.js`)
  return null BEFORE the engine ever sees them;
- in-scope ids transform (`stylex.create` → `$$css:` class table);
- `?svelte` query suffixes still scope-match (id path math on the
  query-stripped realpath);
- empty `include` is the named startup error.

Realpath normalization is load-bearing: vite hands hooks realpath'd
module ids (`/private/var/…` on macOS) while config paths may be
lexical (`/var/…`) — lexical `startsWith` silently never matches
(found live in the fixture; fixed in `src/stylex/vite-plugin.ts`).

### The F9 layer law — baked in the REAL site build

`npm run build:blueprints` → `vite build` (apps/www, the twins'
wiring) emits the TW-compiled entry css which (as FIRST measured
here, IMPL-A edition):

```
byte 0:      @layer properties, theme, base, components, stylex.priority1,
             stylex.priority2, stylex.priority3, utilities;
             @layer theme{:root,:h…                      ← TW's own output follows
contains:    4 × @layer stylex.priorityN blocks
contains:    the 60-member defineVars :root block
             (:root, .x… { --jx-primary: var(--primary); … })
contains:    every atom rule (.x1wgjywl { background-color: var(--jx-primary) }
             … border/color/font-family/box-shadow atoms)
```

**IMPL-E re-measure (Gate-2 P1-1, 2026-09-15)** — the statement's
GENERAL form replaced the fixed priority1..3 (the O1-H 1..3 was that
corpus's special case; the dogfood corpus emits through priority9):

```
byte 0:      @layer properties, theme, base, components,
             components.stylex.priority1, …, components.stylex.priority9,
             utilities;                      ← DYNAMIC N, utilities last
contains:    @layer components.stylex.priority2 … priority9 blocks
             (one per nesting depth; priority1 blockless)
             + the trailing @layer utilities; bookkeeping re-mention
contains:    ZERO top-level stylex.* mentions (the escape the dual-order
             gate plants against)
```

The NESTING (tiers under `components`) is the load-bearing half of
the law: cascade-layer registration is append-only by first mention,
so top-level tiers arriving after the consumer's utilities
registration permanently beat utilities (measured consumer-first
failure); nested, the consumer utility wins BOTH import orders —
the dual-order browser arm of verify:stylex-payload is the standing
proof.

The statement is PLUGIN-OWNED (`layer-law.ts` —
`canonicalLayerStatement(N)` / `maxStylexPriority(css)` /
`parseCanonicalStatement`, exported from the package root; pinned by
tests). Authors never write it; the O1-H evidence chain (spike-report
§5.1) is the mechanism's provenance. Dev also carries it: the
`/virtual:stylex.css` middleware serves the statement (dynamic over
the collected css) + collected css.

### The css-entry trap (§5.2) — no longer silent

A build with stylex output but zero css assets warns with the named
fix and writes the fallback `assets/stylex.css` (statement-first).
Receipt: `packages/vite-plugin/test/stylex/wiring.test.ts`
("css-entry trap" row).

### The twins

`cmp apps/www/vite.config.ts registry/vite.config.ts` → byte-identical
(both commits re-verified). Same for the package twins
(`apps/www/package.json` ≡ `registry/package.json`, each gaining
`@stylexjs/stylex: 0.19.0` devDep + regenerated locks). From the
registry app's root the www-relative include math resolves to
nonexistent dirs (match-nothing, never an error) — the established
twin path-math precedent, documented in the config comment.

### Package gates

`npm test` in packages/vite-plugin (IMPL-A edition): **500/500
green** (one earlier single-test flake did not reproduce across two
clean reruns). The umbrella's dynamic-import pin moved 1 → 2
(`./icons/vite-plugin.js`, `./stylex/vite-plugin.js`) in both existing
purity gates — deliberate, pinned by the new packaging test.

**IMPL-E re-run (Gate-2 P1-4 honesty fix, 2026-09-15, this
machine)** — the real counts replace the round number:

```
Test Files  1 failed | 42 passed (43)
     Tests  498 passed | 6 skipped (504)   [gate-2 r3/r4 corrections: 495→497 (the two coverage-aware idempotence regressions) →498 (the packaging gate now pins the EXPORTED one-source pattern); command of record: npm test -- --maxWorkers=1 (SERIAL — the default parallel run races the packaging build)]
```

- The ONE file-level failure is `test/icons/library/example-hmos.test.ts`
  — ENVIRONMENT, not code: its fixture build downloads the pinned
  Ghostty wasm and the transfer arrived TRUNCATED through this
  machine's proxy on all 3 attempts (received 1006943 bytes, pin
  expects 1006740; the script's own diagnosis names it: "a proxy
  truncating the transfer… NOT pin drift"). Its 6 tests SKIP after
  the failed setup (the 6-skipped count above is exactly this suite).
- Zero test failures in the 498 that ran (serial), including the re-pinned
  stylex suite (12/12: the dynamic-statement pins, the
  parse/coverage round-trip, the byte-zero bake with nested tiers,
  the css-entry trap, the dist law).
- Attribution honesty: the IMPL-A "500/500" was that day's machine
  state (unproxied); on THIS machine the suite is 498 green + 1
  environment-blocked file. CI (unproxied) is the authoritative lane
  for the hmos suite.

## P0.3 — the typed token layer

### The module

`registry/files/lib/tokens.stylex.ts` + byte-mirror
`apps/www/src/lib/tokens.stylex.ts`: 60 `stylex.defineVars` members,
key `--jx-<sheet-name>`, value VERBATIM `var(--sheet-name)` — the
sheet stays the single source (R4); this module re-maps, never
re-computes. The sheet's own `--jx-*` kernel channels (scrollbar
widths, engrave shades) are deliberately NOT wrapped: the stylex key
namespace IS `--jx-*`, so wrapping them would be a self-referential
custom property (cycle) — their consumed form stays plain `var()` in
folder css per the placement law. Named keys (not hashed) keep emitted
custom properties stable across builds/paths (L3c never touches the
token layer).

### Gates

```
node scripts/gen-mirror-manifest.mjs        # 141 items, 532 file pairs
node scripts/gen-mirror-manifest.mjs --check   # GREEN (verify:mirror)
node scripts/verify-deps.mjs                # GREEN (104 theme prerequisites;
                                            #  ledger ratchet unchanged; zero @stylexjs/*)
npx tsc -p apps/www --noEmit                # ZERO errors from tokens.stylex.ts
                                            # (752 pre-existing project errors untouched)
```

registry.json edge: item `tokens` (registry:lib, engines group, href
/tokens.html), files → `@lib/tokens.stylex.ts`,
registryDependencies `["@jixoai/jixoai-theme"]` (the structured
install prerequisite — the var() references need the sheet present).

### The type-safety probe (P0.3c)

`node openspec/changes/2026-09-14-stylex-kernel-phase0/research/stylex-typo-probe.mjs`

```
[typo-probe] clean run exit=0
[typo-probe] typo run exit=1; names token=true
  TypeCheckError: Property '--jx-primry' does not exist on type
  'Readonly<{ readonly '--jx-brand-hue' StyleXVar<string>; … 56 more …; }>'
  Did you mean '--jx-primary'?
 PASS  P0.3 type-safety probe — clean exit=0 (0 required);
       typo exit=1 (non-zero required); output names the token: true
```

The D1-12 mechanism transposed onto the repo's kernel typecheck
(vitest --typecheck, checker tsc): a planted spec-d fixture consumes
the typed layer; the typo'd key FAILS the kernel typecheck naming the
key ("Did you mean…"), the correct spelling compiles green. The probe
deletes its planted file (finally) — the tree stays clean.

### The blueprint scene (P0.3b)

`apps/www/src/lib/blueprints/scenes/tokens.svelte` — the first REAL
stylex atoms in the site build: static longhand atoms against typed
tokens, swatch table folded from STATIC sx() calls only (zero
runtime). `apps/www/static/blueprints/tokens.svg` committed (109KB
vector scene; all six hue swatches paint as grayscale lumas per the
blueprint bake).

Two live findings captured while rendering it:

1. **Svelte template comments are TEXT** — a comment containing
   `<sheet-name>` OPENS an element ("implicitly closed" warning; a
   stray `</sheet-name>` landed in the prerendered HTML). Fixed by
   rewording; keep `<…>` pairs out of template comment prose.
2. **Wide-gamut sheet hues + the serializer**: three sheet tokens are
   OUT OF SRGB GAMUT — `color-mix(in srgb, oklch(0.82 0.18 85) 100%,
   transparent)` emits `color(srgb 0.976 0.723 -0.179)`; the
   serializer's parseRgb regex only matched non-negative components,
   so warning/info/accent fills serialized as null (silently
   unpainted). Fixed in `scripts/blueprints/serialize.mjs` (minus sign
   + clamp; backward compatible for in-gamut colors). This was a
   pre-existing serializer gap affecting any wide-gamut token paint,
   not a stylex-pipeline issue — the computed-style chain resolved
   correctly end-to-end (live-probed: swatch backgrounds read
   `oklch(.6489 .237 <brand-hue>)` through `--jx-primary`).

### Blueprint spec position vs baseline

Baseline (stashed pristine tree): blueprints.spec 4 failures
(missing scenes: spin-set, prototype-flex, +2; missing svgs for the
same). After P0.3b: 2 failures (the scene-less entries remain — other
lanes' items) — the committed-SVG row FLIPPED GREEN (the full render
emitted the hatch-fallback svgs). catalog.spec 10/10. NO new failures.

## Pre-existing branch state (verified, not caused by this work)

`npm run test:types` at the repo root: "Type Errors: no errors" (the
typecheck gate is green); the vitest RUN portion carries 45 failing
tests / 13 files IDENTICALLY on the pristine baseline (stashed run,
log /tmp/baseline-types.log) — wasm-probe/mouse-probe/blueprints
scene-less entries et al. are the standing branch state other lanes
own.
