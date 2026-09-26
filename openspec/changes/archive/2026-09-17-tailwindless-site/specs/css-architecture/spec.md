# css-architecture deltas

## ADDED Requirements

### Requirement: the tailwindless law — the site is the first consumer of its own tokens (Owner 2026-09-17)

jixoai-ui's own site (apps/www routes + site libs) and every registry
component SHALL express ALL styling through the EXISTING placement-law
lanes, with NO second utility system: typed static atoms
(`stylex.create`, lane 1 — now extended to site surfaces), colocated
scoped CSS for what atoms cannot express (lane 2), and the token
sheets (lane 3). The Tailwind engine RETIRES from the whole repo in
phases (the blueprint's P0..Pfinal): during migration a
`verify:tailwindless` gate pins a per-file ALLOWLIST of surviving
utility identities + counts (growth is CI-red; a finished file's
allowlist is zero); at program end the budget is EMPTY and the
engine's every trace is deleted.

THE VALUE RULE (three tiers, enforced over `.stylex.ts` sources and
authored CSS by `verify:stylex-authoring` + the tailwindless gate):
(a) STRUCTURAL constants are lawful (display, flex-direction,
position, geometry in atoms' own terms — `display: 'flex'`,
`blockSize: '1px'`); (b) THEME-ABLE values (color, spacing steps,
typography sizes/tracking/leading, radii, shadows, motion durations)
MUST reference tokens (`var(--jx-*)`/the typed `tokens.stylex`
members) — a literal in a theme-able slot is a MISSING TOKEN STEP:
the value is promoted into the design-tokens sheet (the 收纳 process)
and the atom references the step; (c) recurring composite clusters
become REGISTERED semantic rules (lane-2 sheets with owner + selector
family + declaration scope recorded in the sheet's intent comment) —
never an unregistered utility lookalike.

Dynamic class producers (any code path building class strings —
`cn()`, `resolveTextStyle`, slot resolvers) are REGISTERED in the
gate's source with an enumeration of the identities they may emit;
an unregistered producer or identity is gate-red.

PFINAL (the negative end-state, each item a task with its own
receipt): no `@import 'tailwindcss'`, `@tailwindcss`, `@theme`,
`@custom-variant`, or `@utility` anywhere in repo CSS; no
`@tailwindcss/vite` in either vite config; no `tailwind-merge` in
`cn()` (the class-merge seam retires with a documented replacement);
the print clone's `dark:`-stripping logic replaced by scope-native
handling; `check-tw4-prereq.mjs` and the registry install
prerequisite RETIRED (the registry spec's consumer contract flips:
migrated items need the jixoai theme sheet ONLY); `tailwindcss`
absent from production `package.json` files (design-tool and test
fixtures' scope frozen by explicit decision before Pfinal); the
tailwindless gate runs with an EMPTY allowlist; the stylex payload's
layer contract re-proven post-Tailwind (dual import-order browser
probe — the cascade proof must not keep assuming the utilities layer
rides last), and the canonical layer statement FROZEN for the
post-engine world: the utilities tier is REMOVED from the prelude
(the layer dies with the engine), the generator emits the shortened
statement, and a negative test pins both (a stale utilities-tier
prelude is red).

#### Scenario: the gate pins the migration budget

- GIVEN any state of the migration program
- WHEN `verify:tailwindless` runs
- THEN every class identity in apps/www/src and the mirrored registry
  components resolves against the atom vocabulary, registered
  semantic/producer identities, or the file's ALLOWLIST (identity +
  count) — any GROWTH or unlisted identity fails the gate, and a
  finished file's allowlist is exactly zero

#### Scenario: a bracket value is promoted, not tolerated

- GIVEN a migration edit touching a surviving utility with an
  arbitrary value (a `[...]` form)
- WHEN the edit lands
- THEN the recurring value has become a token step (or an existing
  step covers it) and the site references it through an atom or
  semantic rule — the bracket form is gone from the file

#### Scenario: the no-Tailwind consumer contract is proven early

- GIVEN the P0 consumer fixture (a plain-vite spot project, zero
  Tailwind and zero @stylexjs, installing the migrated REGISTRY
  families — separator first — plus the jixoai theme sheet)
- WHEN it renders
- THEN the families style correctly through atoms + tokens alone —
  the fixture is the standing receipt that migration increments
  shrink the hard binding, and it grows one family per completed
  phase until it covers the registry

#### Scenario: the engine's retirement is total

- GIVEN the program's final phase
- THEN every Pfinal negative condition above holds verbatim — the
  repo greps clean of Tailwind directives, plugins, the merge
  dependency, and the prerequisite machinery, and the gate runs with
  an EMPTY allowlist

## MODIFIED Requirements

### Requirement: the placement law

Styling SHALL live in exactly one place per kind — the ORIGINAL
placement law with its first lane rewritten atom-first, its fourth
lane rewritten tailwindless, every other clause carried verbatim:

1. Paint expressible as typed static atoms → `stylex.create` in the
   component's `<item>.stylex.ts` OR the site surface's atom module
   (the tailwindless extension, 2026-09-17: the site rides the SAME
   atom lane — the first-consumer law; site atom modules live UNDER
   THE TRANSFORM ROOT `apps/www/src/lib/surface/<name>.stylex.ts`
   because the kernel-scope gate transforms only `src/lib` +
   `registry/files` — routes import them, never author outside the
   root, NO plugin include change; the component-authoring shorthand
   law: engine-throw-table properties forbidden), compiled by the
   kernel build into atom classes; dynamic
   values ride CSS-var bindings (atoms consume
   `var(--jx-*)`/component vars; the component computes the vars) —
   factories and vars-keys are forbidden (see component-authoring).
   [CHANGED LANE — was: Tailwind v4 utilities composed in component
   markup; the site extension — was: site markup composing Tailwind
   utilities]
2. CSS atoms cannot express (pseudo-element geometry,
   `@container`/`@keyframes`/scroll-driven/view-transition at-rules,
   press-physics custom properties) → colocated
   `ui/<item>/<item>.css` (or the site module's named css) loaded by a
   relative side-effect import from the component/module file,
   containing ONLY standard CSS (token custom properties, `@layer
   components` scoped with `:where()`, the at-rules above). `@utility`
   MUST NOT appear in folder css (a standalone css file has no
   Tailwind context); custom utilities, if ever needed, MUST live in
   the single Tailwind entry/theme item with their own
   compiled-output probe — THE LEGACY MIGRATION WINDOW CLAUSE
   (tailwindless, 2026-09-17): the existing `@utility` inventory in
   jixoai.css is FROZEN (growth is gate-red); the clause dies at
   Pfinal with the engine (every `@utility` deleted, the
   compiled-output probe retired with it). Every folder sheet MUST
   open with the
   canonical layer statement (the FULL form per the canonical layer
   law). [carried verbatim except the canonical-statement extension,
   the site-module wording, and the legacy-window clause]
3. Tokens + element-default sheets → `registry/files/theme/`
   (jixoai.css, jx-pure.css) — consume-only EXCEPT during the
   density-adoption change, whose K0 and F packets are the sanctioned
   owners of these two sheets. [verbatim]
4. Site-only surfaces → colocated with the route/module they serve.
   [CHANGED — the tailwindless edition, 2026-09-17] app.css's
   Tailwind context RETIRES in phases (the tailwindless program):
   NEW site styling lands as stylex atoms (lane 1) or registered
   site-module css (lane 2 semantics); during migration the Tailwind
   entry remains ONLY for unmigrated surfaces, with the
   `verify:tailwindless` per-file allowlists pinning the retreat; at
   program end the sole `@import 'tailwindcss'`, the global
   `@theme`/`@custom-variant` rules, and the tailwindcss dependency
   are deleted and app.css carries only token imports + site base
   rules in plain CSS.

Every authored-CSS file MUST carry a top comment listing its
orthogonal intents (with timestamps) per the repo law. [verbatim]

BOUNDARY (explicit): the Tier-2 unlayered exception, the
state-machine carve-out, the surface-kernel override, the print
whitelist, the derived-scale/density laws, and every OTHER
requirement of this spec are UNCHANGED by this delta — atoms ride
the same layer/specificity physics the utilities lane rode.

#### Scenario: a new component needs a pseudo-element build

- WHEN the paint cannot be expressed as atoms (pseudo-element
  geometry, at-rules)
- THEN it lands in `ui/<item>/<item>.css` under `@layer components`
  with `:where()`, imported relatively by the component
- AND a consumer utility overrides it (Tier-1-owned css loses to
  utilities)

#### Scenario: component paint IS utility-able

- WHEN a surface is boxes/borders/spacing/typography on the token
  sheet (the atom-first edition of this scenario: "utility-able"
  paint now means atom-able)
- THEN it is authored as static atoms in `<item>.stylex.ts`, NO css
  file is created, and consumer utilities still override it (the
  canonical layer law)

#### Scenario: a dynamic width is authored

- WHEN a component needs a runtime-dependent size
- THEN the atom consumes `var(--component-size)` and the component
  computes the var — a factory call fails verify:stylex-authoring

#### Scenario: css loads exactly once

- GIVEN an item's css imported relatively by its component
- WHEN the component is used on a page that also imported the css
  historically
- THEN the stylesheet appears exactly once in the built output

#### Scenario: a family packet edits the theme sheet

- GIVEN packet A running after the foundations
- WHEN it needs a new token
- THEN it reports the desired delta; the orchestrator applies it —
  packets never edit the canonical theme directly

#### Scenario: a site page needs layout paint

- GIVEN a site surface needing boxes/spacing/typography (the
  tailwindless edition)
- WHEN the edit lands
- THEN it is authored as static atoms in the surface's
  `<surface>.stylex.ts` over typed tokens (theme-able values) and
  structural constants — Tailwind utility composition in site markup
  is closed to new code (the file's allowlist may only shrink)
