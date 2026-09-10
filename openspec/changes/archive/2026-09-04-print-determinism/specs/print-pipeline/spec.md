# Delta: print-pipeline — print determinism (viewport independence)

## ADDED Requirements

### Requirement: print output is a pure function of the document + printConfig — never of the window

The print face SHALL be viewport-independent: fragmentation decisions,
page box sequences, content stamps, and folio backfill MUST be
identical regardless of the window size the print (or standby preview)
was initiated from.

- The viewport→page re-scope: while PrintDoc is mounted, every
  reachable stylesheet's WIDTH-feature media queries (`min-width` /
  `max-width` / `width` and the device-width family — theme-standard,
  custom, or hand-written; the transform matches query SYNTAX, never
  breakpoint names) are re-scoped to a container query against the
  page content area (`jx-print-viewport`, inline-size). The original
  rules are disabled reversibly; synthesized rules re-enter the same
  cascade layer. Non-width features (hover, forced-colors, …) remain
  outer `@media` compounds.
- Lifecycle rides the component: PrintDoc mount activates the channel
  (the standby preview included — a preview that differs from print
  is meaningless); unmount reverts every side effect (the existing
  zero-residue law absorbs the synthetic styles and `not all`
  stamps).
- Un-expressible queries fall back to disable + a loud console log
  (selector + original condition, counted in verify output) — the
  user's print gesture is NEVER blocked.
- The differential gate is the acceptance definition: a real-browser
  two-viewport run (800×600 vs 1600×1200) through the full print pose
  must produce byte-identical page box sequences, content stamps, and
  folio. jsdom static assertions cover the transform's unit surface
  (synthesis, disabling, layer fidelity, restore-on-unmount).

#### Scenario: a narrow window prints identically to a wide one

- GIVEN the same document and printConfig
- WHEN the full print pose runs at 800×600 and at 1600×1200
- THEN the page box sequences, content stamps, and folio are
  byte-identical, and no viewport media query evaluates against the
  window inside the print face

#### Scenario: a custom breakpoint re-scopes without enumeration

- GIVEN a theme defines private breakpoints (e.g. `--breakpoint-xxl`)
  or a component hand-writes `@media (min-width: 55rem)`
- WHEN PrintDoc mounts
- THEN those queries resolve against the page content area's width —
  the transform never reads breakpoint names or maintains a class
  allowlist

#### Scenario: an un-expressible query degrades loudly, never blocks

- GIVEN a width query the channel cannot express as a container query
- WHEN the print pose initializes
- THEN the rule is disabled for the print face, a console warning
  names the selector and original condition, and the print gesture
  completes

#### Scenario: unmounting restores the stylesheet untouched

- GIVEN the print pose ran with re-scoped queries
- WHEN PrintDoc unmounts (afterprint or manual exit)
- THEN every `not all` stamp is removed, every synthesized style is
  gone, and the residue probe finds zero leftovers
