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
- **The F9 canonical layer law is baked here**: every kernel-emitted
  CSS opens with the full layer statement — `theme, base,
  components, utilities`, then the atoms layer — BEFORE any engine
  output appends (the research's O1-H diagnostic build proved this
  is the lawful order; the as-frozen order inverted the override
  law). The plugin owns the statement; authors never hand-write it.

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
- Path-dependent hashing (the research's L3c anomaly ①) is moot:
  we are the only compiler; the discipline is same-build emission,
  enforced by the gate.
- verify:shadcn-add's real-consumer contract extends: the clean
  consumer imports item CSS, uses the components with zero engine
  packages in its lockfile (the F11 assertion).

## §4 The authoring law (and its teeth)

1. Kernel paint = `stylex.create` static atoms against the typed
   tokens. Longhands only (shorthands throw:
   `propertyValidationMode:'throw'` — the silent-drop finding).
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
probe is the ONE permanent verify row, protocol of record per the
receipt appendix — viewport 1440×900 headless Chromium, ≤0.5px
tolerance, swapped-placement negative control asserted to differ by
≥1px, PASS/fail fields explicit. The RANGE probe is RETIRED to the
API-trap receipt (renderer healthy; the untrustworthy
getComputedStyle-on-UA-shadow read path is the kernel note) — it
does NOT enter verify:all. Only the popover fix is a cherry-pickable
commit. P0.1's forensic receipts are COMMITTED
(research/p0-bug-probes.md + appendix, 14 shots, 2 raw JSONs).

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
new gates: authoring → payload → mirror → the two probes → shadcn
consumer gate (probes need a fresh build; consumers gate last). Every gate added here runs in verify:all from day
one.
