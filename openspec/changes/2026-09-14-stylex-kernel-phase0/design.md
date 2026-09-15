# Design: stylex-kernel-phase0

> Orthogonal intents: (1) the build-side engine absorption; (2) the
> typed token layer over the existing sheet; (3) the compiled-output
> payload pipeline + its consistency gate; (4) the authoring law and
> its enforcement; (5) the two production-bug pre-checks. Every
> design decision below cites its research receipt (archive:
> openspec/changes/archive/2026-09-13-stylex-kernel-research/).

## §1 The engine rides our plugin (build-side only)

- `@jixoai/ui-vite-plugin` gains a devDependency on
  `@stylexjs/unplugin` (pinned 0.19.0 per the research's F-series pin
  set; bumps re-run the D1 fixtures) and exposes the compiled-output
  pipeline for OUR builds only. Consumer installs of the plugin are
  NOT required by any registry item (F11) — the plugin's existing
  icon/channel features keep their current consumers.
- The vite twin configs (apps/www ≡ registry, byte-identity gate)
  gain the stylex wiring identically.
- **The F9 canonical layer law is baked here** (Gate-2 P1-1 revision,
  measured into place by the dual-order Chromium fixture): every
  kernel-emitted CSS establishes the ONE canonical FULL statement —
  `@layer properties, theme, base, components,
  components.stylex.priority1, …, components.stylex.priorityN,
  utilities;` where N = the highest priority tier THAT css carries
  (derived at bake time from the engine's own emission; the O1-H
  measurement of 1..3 was that corpus's special case, not the law),
  `utilities` constantly last — AND the engine's tiers NEST UNDER
  `components` (the useCSSLayers prefix `components.stylex`). The
  nesting is not cosmetic: cascade-layer registration is append-only
  by first mention, so a TOP-LEVEL stylex tier first mentioned after
  the consumer's `utilities` registration (the consumer's stylesheet
  loaded first) sorts after it and permanently beats utilities —
  measured: consumer-first import + top-level tiers = the atom wins
  (display=flex over the utility's grid); the same css with nested
  tiers = the utility wins in BOTH orders (grid/grid). The plugin
  owns engine-emitted statements (layer-law.ts is the single source;
  dev virtual css, build assets, and payload item css all carry it);
  folder sheets carry the sheet form (the five standing layers) per
  the transitionally-scoped law (specs delta). The law's teeth:
  verify:stylex-payload loads a payload item css against a
  Tailwind-shaped consumer stylesheet in BOTH orders in headless
  Chromium and asserts the utility's COMPUTED value wins, with the
  escaped-tier shape as the always-run negative control.

## §2 The typed token layer

- One `.stylex.ts` module (a registry:lib item, byte-mirrored)
  wrapping the EXISTING jixoai token sheet with `stylex.defineVars`
  whose values are verbatim `var(--primary)`-style references
  (compile-legality proven: L1 §6 compile test + D2-08/09/10
  behavior). The sheet remains the single source (R4 channel
  collapse: markup channels 3 → 1, no fourth channel).
- Density/dark/hue keep working unchanged: they stamp attributes and
  custom properties through the existing runtime channels (spec law;
  atoms consume the vars, so scopes cascade through the DOM).
- The context-plugin kernel is untouched (zero-npm law preserved —
  the plugin and its engine are BUILD-time tools, never kernel
  runtime imports).

## §3 The compiled-output payload pipeline

```
authoring (source of record)          our build (one pass)
─────────────────────────────         ────────────────────────────
ui/<item>/<item>.svelte      ──┐
  class={atoms.foo}            │  @jixoai/ui-vite-plugin
  + <item>.stylex.ts           ├──▶ stylex/unplugin transform
  + <item>.css (folder law) ──┘     + F9 layer baking
                                       │
                          ┌────────────┴────────────┐
                          ▼                         ▼
              compiled class-constant       item CSS (atoms +
              module (plain strings,        folder css + layer
              same-build hash pinned)       statement, same hash)
                          └────────────┬────────────┘
                                       ▼
                    registry payload (what shadcn add ships)
                    + consumers import the CSS — zero tooling
```

- The generator emits BOTH artifacts from ONE build invocation; the
  consistency gate (verify:stylex-payload) re-derives both and
  asserts hash identity — a class constant whose rule is missing
  from the CSS (or vice versa) FAILS the build.
- **The publish lane (Gate-2 P1-2)**: the build pipeline ships the
  payload into the deploy tree (`public/payload/stylex/` — the
  zero-engine consumer surface at /payload/stylex/<item>/): the
  generator's `--publish` step runs inside build-site right after
  `shadcn build`, and the root `build:registry` script chains it.
  verify:shadcn-add regenerates the same published tree and installs
  a compiled item FROM its manifest in a real consumer (class module
  + item css, one css import, zero @stylexjs/* in the built
  consumer) — the phase-0 answer to "wired into the registry build";
  phase-1 migrations fold the artifacts into registry items' files[]
  and retire the manual copy.
- Path-dependent hashing (the research's L3c anomaly ①) is moot:
  we are the only compiler; the discipline is same-build emission,
  enforced by the gate.
- verify:shadcn-add's real-consumer contract extends: the clean
  consumer imports item CSS, uses the components with zero engine
  packages in its lockfile (the F11 assertion).

## §4 The authoring law (and its teeth)

1. Kernel paint = `stylex.create` static atoms against the typed
   tokens. The shorthand line is THE ENGINE'S LINE (Gate-2 P1-3,
   option A — the implementation was already right, the law text was
   wrong): properties the pinned engine's throw table rejects (18
   names under the 0.19.0 pin, derived at gate runtime from the
   installed babel-plugin + a pin-count assertion) are FORBIDDEN;
   properties the engine ACCEPTS (margin, padding, inset, gap, flex,
   overflow, textDecoration — the corpus uses them) are LAWFUL: the
   compiled css carries them as standard CSS shorthand declarations
   (browsers expand at parse time; the engine serializes `margin: 0`
   as `margin: 0`, NOT as longhand expansion — an earlier draft of
   this law claimed expansion and was wrong). Option B (pure
   longhand corpus rewrite) was rejected: no evidence the corpus's
   engine-accepted shorthands ever miscompiled; rewriting 9 modules
   to satisfy an over-strict text is law-text appeasement, not
   engineering.
2. Dynamic values = CSS-var bindings ONLY: atoms consume
   `var(--jx-*)`/component vars; components compute the vars at
   runtime (inline style or scoped stamp) — the D1-08-proven
   degradation path, now the sanctioned idiom. Factories, `vars`
   keys inside create(), and closure-composed dynamic values are
   FORBIDDEN (the research's dynamic-value trilogy: each silently
   broke).
3. `cn()` survives for merging CONSUMER-passed classes with our
   constants (plain strings now — the Svelte class-non-merge tax no
   longer applies to compiled output).
4. Enforcement: `verify:stylex-authoring` — greps/AST-scans
   `.stylex.ts` sources for forbidden patterns (factory calls,
   vars-keys, shorthand properties) and fails naming file + pattern;
   the throw-mode babel config makes dropped declarations build
   errors.

## §5 The two production-bug pre-checks (phase-1 gate, cherry-pickable)

1. **Range thumb-ring collapse probe**: Chromium forces axial cq
   units on UA-shadow slider pseudos (research L3b §finding; the
   same law rides production jx-pure.css:1601). The probe builds
   www, drives the real range component in headless Chromium,
   measures the thumb ring's computed box-shadow/geometry; if
   collapsed → the fix (cqw-independent units for the UA-shadow
   members) lands IN THIS CHANGE with its own verify row.
2. **Popover position-area alignment probe**: `bottom span-right`'s
   engine semantics measured LEFT-aligned while terminal-header's
   comment claims right. The probe measures the rendered panel edge
   alignment; the fix is either the correct area value or the
   comment's correction (whichever the measurement rules).

THE PROBE CONTRACT (final, single voice): the POPOVER alignment
probe is the ONE permanent verify row — protocol of record per the
receipt appendix: viewport 1440×900 headless Chromium; ONE metric
(panelLeft − pillLeft); PRIMARY assertion |delta| ≤ 0.5px; NEGATIVE
CONTROL = the swapped placement measured on the SAME metric (recorded
−146px) asserted |control − primary| ≥ 1px — same-metric, mechanically
decidable. The RANGE probe is RETIRED to the API-trap receipt
(renderer healthy; the untrustworthy getComputedStyle-on-UA-shadow
read path is the kernel note) — it does NOT enter verify:all. Only
the popover fix is a cherry-pickable commit. P0.1's forensic receipts
are COMMITTED (research/p0-bug-probes.md + appendix, 14 shots, 2 raw
JSONs).

## §6 What phase 0 deliberately does NOT do

No production component switches its paint (phase 1's job — the 8
corpus families first); the @theme mapping region stays (phase 3);
www docs pages stay Tailwind (the standing coexistence proof); the
css-laws serializers are untouched (their projections are
engine-agnostic CSS — phase 3 reviews the utility projection's
consumers).

## §7 Evidence standard

The corpus dogfood equivalence check (the 8 families compiled
through the real pipeline vs the research spike's compiled outputs)
is phase 0's acceptance centerpiece: the foundations must reproduce
the research's measured behavior inside the production build, not
just in the lab. The comparison method is FIXED (the archive's
serialization lessons applied): normalize number formats,
::before/::after content strings, and steps(1,) timing serializations
before diffing — a committed comparator script owns the
normalization; raw diffs ride alongside. verify:all ordering for the
new gates: authoring → payload → mirror → the popover probe (the
ONE permanent probe; needs a fresh build) → shadcn consumer gate
(consumers gate last). Every gate added here runs in verify:all from day
one.
