# P0.4 / P0.5 / P0.7 gate receipts — IMPL-D 2026-09-15, re-run at the
# Gate-2 P1 fix round (IMPL-E, 2026-09-15)

> RERUN OF RECORD: the final tree after the four Gate-2 P1 fixes
> (branch stylex-integration; the IMPL-E commits on top of
> `46425a31`). The IMPL-D edition of this file claimed "exit 0" for
> a verify:all run whose own transcript showed `verify:budgets ✗
> FAILED (chain aborts here)` — the contradiction Gate 2 flagged.
> What actually happened at IMPL-D, for the record: the chain
> aborted at budgets (B-consumer-vite 3865 vs the stale 2710
> baseline — IMPL-A's stylex bridge had grown the umbrella entry and
> the baseline was never re-derived; pre-existing at clean HEAD
> `8ebe92fe`, reproduced with all IMPL-D changes stashed), the two
> NEW gates ran GREEN inside the chain BEFORE the abort, and the
> tail gates (popover probe, shadcn-add) were run STANDALONE. The
> budget was then RE-PINNED (2710 → 3865, commit `46425a31`, message
> records the rationale) — and the IMPL-E rerun below is the change's
> FIRST full-chain exit 0, honestly.
>
> ENVIRONMENT (every browser gate below): CHROME_PATH was exported to
> `~/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/
> Google Chrome for Testing.app/Contents/MacOS/Google Chrome for
> Testing` — this machine's playwright cache is chromium-1243 (the
> verify:print script's pinned fallback of 1228 does not exist here;
> CHROME_PATH is the designed escape hatch, zero code change). The
> payload gate's browser discovery scans chromium-* newest-first and
> finds 1243 on its own; the export makes the print/km probes use it
> too.

## P0.4 — the payload generator + consistency gate

### The artifacts (regenerated at the fix round — same buildId)

```
$ node scripts/gen-stylex-payload.mjs
[gen:stylex-payload] 10 item(s) · buildId 60807e498baf… · 175 class constants · manifest written
```

- Item set (data-driven, no hand list): the registry's `tokens` item
  (the one item whose files[] owns a .stylex.ts) + the migration
  ledger's 9 corpus modules → 10 items, 18 pinned sources.
- buildId `60807e498baf…` UNCHANGED by the P1-1 fix — the id hashes
  generator/engine versions + SOURCE sha256s (the css layer-form
  change is downstream of the same sources through the same pinned
  engine, and the generator version did not bump).
- The item css bytes changed lawfully: byte-zero statement now
  `@layer properties, theme, base, components,
  components.stylex.priority1..N, utilities;` (N per item — e.g. 8
  for corpus/code-card), tier blocks nested under `components`.

### The gate (exit 0, GREEN — with the P1-1 teeth)

```
$ CHROME_PATH=… node scripts/verify-stylex-payload.mjs
━━ re-derivation (the pinned kernel pipeline) ━━━━━━━━━━━
  PASS  manifest item set ≡ derivation item set — 10 item(s)
  PASS  payload tree consistent (missing-rule / cross-build / manual-edit / same-build) — 10 item(s), 18 source(s) pinned
━━ consumer spot-compile (plain vite, zero @stylexjs) ━━━━━━━━━━━
  PASS  consumer build green with zero engine tooling — index-…css
  PASS  consumer built css keeps the F9 layer order (first-mention vector) — properties < theme < base < components < components.stylex.priority1 < … < priority8 < utilities
  PASS  consumer built css carries the item rules — .x1ghz6dp
  PASS  consumer package.json owes zero dependencies (no @stylexjs/stylex, @stylexjs/unplugin, @stylexjs/babel-plugin)
━━ dual-order browser assertion (real Chromium, both import orders) ━━━━━━━━━━━
  PASS  kernel css first → the consumer utility wins (computed) — display=grid · corpus/code-card · atom .x78zum5 (tier 4, display:flex) vs consumer .consumer-grid (layer utilities, display:grid)
  PASS  consumer css first → the consumer utility wins (computed) — display=grid · (same fixture)
  PASS  negative control: the escaped-tier css (top-level stylex.*, statement stuck at priority3) lets the ATOM win — display=flex (the escape is observable, so the green arms are meaningful)
━━ planted-defect self-tests (the teeth) ━━━━━━━━━━━
  PASS  selftest missing-rule (…) — caught naming the item
  PASS  selftest cross-build (…) — caught on the stamps
  PASS  selftest manual-edit (…) — caught on the sha
  PASS  selftest layer-escape (top-level stylex.* tiers past a priority3 statement) — caught naming the item + the uncovered tier
✓ verify:stylex-payload GREEN — same-build payload consistency holds
```

The dual-order arm is the P1-1 teeth: BEFORE the fix, the same
fixture measured `consumer-first: display=flex` (the atom beat the
utility — the css text checks never caught it because the text was
lawful-looking). The atom class, its tier, and its value are
DISCOVERED from the payload css (tier ≥ 4), never hand-pinned.

### The published payload + the shadcn-add extension (P1-2)

- The generator's `--publish` step ships the payload tree + manifest
  into `public/payload/stylex/` — build-site step 5.5 (right after
  `shadcn build`) and the root `build:registry` script both run it;
  the full `npm run build` at the fix round completed exit 0 with
  `[gen:stylex-payload] published 10 item(s) → public/payload/stylex/`.
- verify:shadcn-add regenerates the same published tree (its step
  0.5) and its NEW `stylex-compiled-payload` case installs a compiled
  item FROM the manifest: sha-verified copy into the consumer, ONE
  css import + plain-string constants, `zero @stylexjs/*` in
  package.json AND the lockfile (the generic per-case assertion),
  consumer vite build green, built css carries every stylex tier
  NESTED (zero top-level escapes) with `components` before
  `utilities` in the top-level first-mention vector, and the item's
  atom rules land.

## P0.5 — the authoring teeth

### throw mode already live (verified, not assumed)

- Source: `packages/vite-plugin/src/stylex/vite-plugin.ts`
  (`propertyValidationMode: 'throw'`, IMPL-A f0b560f5); the pins now
  also carry the layer nesting (`prefix: 'components.stylex'` +
  before/after anchors), mirrored EXACTLY in
  `scripts/lib/stylex-payload.mjs`.
- LIVE receipt (every gate run): the planted `background:` shorthand
  through the REAL babel transform under the kernel pins throws —
  "background is not supported. Use background-color, border-image
  etc. instead."

### The gate (exit 0, GREEN — with the P1-3 acceptance pair)

```
$ node scripts/verify-stylex-authoring.mjs
━━ the migration ledger (the stylex-touched trees) ━━━━━━━━━━━
  PASS  the 9 ledger file(s) obey the authoring law — 9 atoms module(s) + 0 sheet(s) scanned
  PASS  the shorthand blacklist matches the installed engine pin (18 throwing names) — all,animation,background,border,borderInline,borderBlock,borderTop,borderInlineEnd,borderRight,borderBottom,borderInlineStart,borderLeft,borderHorizontal,borderVertical,borderBlockStart,borderEnd,borderBlockEnd,borderStart
━━ planted defects (the teeth) ━━━━━━━━━━━
  PASS  planted factory → gate names file + pattern
  PASS  planted vars-key → gate names file + pattern
  PASS  planted shorthand → gate names file + pattern
  PASS  the sanctioned idioms pass (expandable shorthands, var() seams, keyframes) — clean
  PASS  the pinned engine THROWS on the planted shorthand (propertyValidationMode throw is live)
  PASS  an engine-accepted shorthand compiles and its declarations land in the css (P1-3a) — margin, padding, gap, flex, overflow, inset, text-decoration present
  PASS  a varied layer statement fails naming the file + divergence
  PASS  a statement that stops short of the sheet’s carried tiers fails
  PASS  a lawful sheet passes (no false positive on folder css)
  PASS  a hand-pasted engine rule in a sheet fails
✓ verify:stylex-authoring GREEN — the authoring law holds on the migration surface
```

### The shorthand law (Gate-2 P1-3, option A — the law text now
states what the code enforces)

The blacklist is DERIVED AT GATE RUNTIME from the pinned
babel-plugin's own throwing table (styleResolution
'property-specificity'): 18 names — the background/border/all/
animation family + logical-side aliases — with the pin-count
assertion (18) so an engine bump that moves the list fails the gate
loudly. Engine-ACCEPTED shorthands (`margin`, `padding`, `inset`,
`gap`, `flex`, `overflow`, `textDecoration`) are LAWFUL: the P1-3a
row proves a real kernel-pipeline compile of all seven lands their
declarations in the css (the engine serializes `margin: 0` AS
`margin: 0` — standard CSS, browsers expand at parse time; the
earlier spec text's "expands to longhand" claim was measured wrong
and is retired). The IMPL-C risk (textDecoration:'none' in
demo.stylex.ts) is resolved BY the derivation, not by an exemption.

## P0.7 — the chain + the docs

- verify:all ordering landed: authoring → payload → mirror (the
  npm-script block), popover probe after the mirror-class gates (4c,
  IMPL-B), consumer gates last (design §7).
- npm scripts: `gen:stylex-payload` / `verify:stylex-payload` /
  `verify:stylex-authoring`; `build:registry` now chains the payload
  publish (P1-2).
- Docs: `apps/www/src/routes/docs/install.html` — the layer-law
  sample updated to the general form (dynamic tiers nested under
  components, utilities last).

## The full verify:all run (the fix round's run of record)

```
$ export CHROME_PATH=~/Library/Caches/ms-playwright/chromium-1243/…/Google Chrome for Testing
$ node scripts/verify-all.mjs
```

Every step green, exit 0 — including (selection):

```
verify:stylex-authoring ✓ GREEN (in-chain)
verify:stylex-payload ✓ GREEN (in-chain, dual-order browser arm included)
verify:mirror ✓ · verify:context ✓ · verify:deps ✓ · verify:budgets ✓
  (B-consumer-vite against the re-pinned 3865 baseline)
vite.config.ts dual-app byte-identity ✓ · ghostty-pin (offline) ✓
verify:popover-area ✓ (primary delta=0px; control −171px; pass=true)
verify:shadcn-add ✓ — clean-install cases (23): ALL GREEN
verify:km ✓ · verify:isolation ✓ · verify:print ✓ (all on the
  composite's managed static server, CHROME_PATH=chromium-1243)
✓ verify-all GREEN — the full gate chain passed
```

- 23 shadcn-add cases = the 22 standing + the NEW
  stylex-compiled-payload (P1-2). The first fix-round harness run
  caught one over-strict assertion in the new case's postBuild (the
  consumer bundler re-serializes layer statements — minified,
  deduped, block order shuffled — so the assertion now checks the
  SURVIVING law: nesting + top-level first-mention order); the chain
  rerun above carries the fixed gate, all rows green.
- The IMPL-D-era standalone tail-gate receipts (popover GREEN,
  shadcn-add 22 cases green) remain historically accurate for their
  tree; the chain above supersedes them as the run of record.

## openspec + package gates at the fix round

- `openspec validate 2026-09-14-stylex-kernel-phase0 --strict` →
  valid (after the P1 spec-delta revisions).
- `npm test` (packages/vite-plugin): 495 passed | 6 skipped, zero
  failing tests; the one file-level failure is the hmos e2e suite
  whose Ghostty-wasm fixture download arrives proxy-truncated on
  this machine (environment — full attribution in
  research/p0-engine-token-receipts.md §package gates).
- `git diff --check`: zero whitespace offenses (the payload
  regeneration + the dogfood extracts were swept; 4 trailing-space
  lines removed from the frozen baseline extract,
  comparison-neutral).

## Process discipline (recycle evidence)

- The payload gate's browser arm: ONE chromium instance + ONE
  OS-assigned static server, both closed in a `finally` (the log's
  clean exit with no dangling handles); the consumer spot-compile is
  an in-process programmatic `build()` awaited to completion.
- verify:shadcn-add's lifecycle spine reaped its child groups on
  every exit path (the harness's own B2 contract; no LEAKED line in
  the run of record).
- The www build + verify-all ran serially (the shared public/ tree
  and the 16GB machine discipline); no dev server was started by any
  lane; post-run `ps` audit found no residual node/vite/python
  processes from these lanes.
