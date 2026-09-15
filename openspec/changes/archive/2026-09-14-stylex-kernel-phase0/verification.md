# Verification: stylex-kernel-phase0

## Change-doc gate (Gate 1)

- The four docs cross-agree; every design decision cites its
  research receipt (the archived dossier's findings IDs).
- The spec deltas (specs/) parse under openspec --strict with
  scenario blocks per requirement.
- No scope creep: zero production components migrate here (phase 1);
  www docs stay Tailwind; css-laws serializers untouched.

## Implementation gates (Gate 2 readiness)

- **F9 layer law**: a REAL dual-order browser assertion (headless
  Chromium, self-managed server): a payload item css against a
  Tailwind-shaped consumer stylesheet, kernel-first AND
  consumer-first, asserting the consumer utility's COMPUTED value
  wins in both — plus the always-run negative control (the
  escaped-tier shape shows the atom winning) and the planted
  layer-escape tree self-test. The statement is dynamic
  (priority1..N, utilities constantly last) and the tiers nest
  under `components` — the plugin's baked statement is the only
  source of layer order.
- **Payload consistency**: verify:stylex-payload re-derives class
  constants + item CSS and asserts same-build hash identity; a
  deliberately desynced pair FAILS the gate (self-test like the
  research's manifest validator). The build PUBLISHES the payload
  (public/payload/stylex/) and verify:shadcn-add installs a compiled
  item from the published manifest (zero @stylexjs/*, item usable
  via CSS import).
- **Zero consumer tooling**: verify:shadcn-add's clean consumer
  lockfile contains no @stylexjs/* names; the items render via CSS
  import alone.
- **Authoring teeth**: the throw-mode build fails on a planted
  shorthand (a throw-table name); verify:stylex-authoring fails on
  planted forbidden patterns (factory/vars-key) naming file +
  pattern; an engine-ACCEPTED shorthand compiles green with its
  declarations landing in the css (the P1-3 acceptance pair).
- **Corpus dogfood equivalence**: the 8 families' compiled outputs
  through the real pipeline match the research spike's artifacts
  per the COMMITTED comparator (research/compare-compiled.mjs v6 —
  the gate-1 review loop's hardened edition: N1 number formats
  (multi-digit safe, unquoted value tokens ONLY — never quoted
  content, selectors, --custom-property names, or url() contents);
  N2 quote-style-insensitive, value-sensitive pseudo content
  (url("a") ≡ url(a)); N3 steps() end-synonyms; N4 rule-set order
  (decls sorted within a rule, same-selector occurrences keep
  cascade order — reversed conflicts DIFFERENT); N5 structural
  matching forgiving ONLY the style-rule leaf name (L3c
  path-dependent class hashes) while the at-rule ancestry, the
  document-wide ordered @layer first-mention vector, prelude NAME
  case (@layer/@keyframes/named @container), custom-ident property
  values (animation-name etc.), selector() arguments in conditions,
  and same-name @keyframes REPLACE semantics (last block wins,
  frames never merge across blocks) all stay semantic. Flags may
  appear anywhere after the script name). INVOCATIONS OF RECORD:
  `node research/self-test.mjs` (the 56-row pinned positive+negative
  matrix — runs in Gate 1 AND Gate 2) and `node
  research/compare-compiled.mjs <a> <b> --raw-out
  research/dogfood-diff.json`.
- **Bug probes**: the POPOVER alignment probe is the permanent
  verify row (protocol of record: 1440×900, ≤0.5px, swapped-
  placement negative control ≥1px apart); the RANGE probe is
  retired to the API-trap receipt — verify:all carries ONE probe,
  not two. Verdicts come from real rendered geometry (bounding
  boxes), not CSS-text regexes.
- **Standing gates**: the full verify:all chain green including the
  byte-twin vite configs and mirror byte-identity.
- **Process discipline**: every dev server/build process the lanes
  start is reclaimed (pid receipts); heavy lanes serial.

## Receipts

- All new verify scripts print verdict + raw evidence lines; the
  corpus dogfood equivalence receipt lands in this change's
  research/ folder; Gate 2 re-runs ≥2 spot checks independently.
