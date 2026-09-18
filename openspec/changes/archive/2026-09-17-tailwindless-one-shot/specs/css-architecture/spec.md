## MODIFIED Requirements

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

THE JOINER LAW (Wave 1 ruling, 2026-09-17): a `.stylex.ts` module's
only legal exports are `stylex.create` results — the class joiner
(`cx`) lives INSIDE each consuming component's script (the separator
serialize law), never exported from the module. The canonical joiner
tolerates plain strings (passthrough whole — a pre-joined group
string must not explode per-character through `Object.entries`),
stylex dev objects (string members joined, `$$css` dropped), and
falsy values. The gate's per-export verification keeps zero helper
exceptions (the STYLEX_MODULE_HELPERS registry stays empty; its
machinery and selftests remain for future deliberate use).

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
fixtures' scope frozen by explicit decision before Pfinal — the
design-tool studio is the ONE frozen Tailwind-CONSUMER enclave: its
`packages/design-tool/src/studio/studio-static.css` keeps the engine
fan-in BY DESIGN, exactly the way any external consumer may; the
repo-css cleanliness conditions apply to every OTHER css, and the
tailwindless gate pins the enclave as an allowlist of exactly one
file — a second `@import 'tailwindcss'` anywhere else is red); the
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

#### Scenario: the joiner stays component-local

- GIVEN any migrated family's `.stylex.ts` module
- WHEN the gate classifies its exports
- THEN every export is a `stylex.create` result — an exported joiner
  (or any other non-create export) is rogue-red, and each consuming
  component carries the canonical local `cx` (string-passthrough
  superset form) in its own script

#### Scenario: the engine's retirement is total

- GIVEN the program's final phase
- THEN every Pfinal negative condition above holds verbatim — the
  repo greps clean of Tailwind directives, plugins, the merge
  dependency, and the prerequisite machinery, and the gate runs with
  an EMPTY allowlist
