# P0.4 / P0.5 / P0.7 gate receipts — IMPL-D, 2026-09-15

The payload pipeline, the authoring teeth, the chain wiring and the
docs page. Every verdict below is from a run against the committed
tree at HEAD of this change's commits (commands + exit codes verbatim
in the transcript; the logs quoted are the gate's own output).

## P0.4 — the payload generator + consistency gate

### The artifacts

```
$ node scripts/gen-stylex-payload.mjs
[gen:stylex-payload] 10 item(s) · buildId 60807e498baf… · 175 class constants · manifest written
```

- Item set (data-driven, no hand list): the registry's `tokens` item
  (the one item whose files[] owns a .stylex.ts) + the migration
  ledger's 9 corpus modules → 10 items, 18 pinned sources.
- Determinism: `--check` re-derivation = 0 drifted artifacts, across
  processes (class names hash from content + repo-root-relative
  module paths — the L3c rootDir pin).
- One manifest record, verbatim shape:

```json
"tokens": {
  "classModule": {
    "path": "registry/payload/stylex/tokens/tokens.styles.js",
    "sha256": "8713368c097a399015ea93e5ce3d2b1ed1785b07646c4fa1e89378d704313c91"
  },
  "css": {
    "path": "registry/payload/stylex/tokens/tokens.css",
    "sha256": "08dcb9f17a704cbc1135fe4f21f020c52b34e53d4465d3459afca42362814836"
  },
  "sourceSnapshot": [
    { "path": "registry/files/lib/tokens.stylex.ts",
      "sha256": "36147d15ad2523624603cc4da1d52bc59f9f7b3474192f24747356de33931144" }
  ]
}
```

- buildId `60807e498baf091b1e47652e09051c40fe6817a687a7e2b1e63402a96062740f`
  = sha256 over the canonical serialization (generatorVersion ‖
  engineVersion ‖ byte-sorted itemPath ‖ byte-sorted source sha256s,
  U+000A joins, trailing separator), stamped into every artifact
  (classModule header comment; css trailing comment after the
  byte-zero F9 statement).

### The gate (exit 0, GREEN)

```
$ node scripts/verify-stylex-payload.mjs
━━ re-derivation (the pinned kernel pipeline) ━━━━━━━━━━━
  PASS  manifest item set ≡ derivation item set — 10 item(s)
  PASS  payload tree consistent (missing-rule / cross-build / manual-edit / same-build) — 10 item(s), 18 source(s) pinned
━━ consumer spot-compile (plain vite, zero @stylexjs) ━━━━━━━━━━━
  PASS  consumer build green with zero engine tooling — index-Bj6ZTufO.css
  PASS  consumer built css keeps the F9 layer order (first-mention vector) — properties < theme < base < components < stylex.priority1 < stylex.priority2 < stylex.priority3 < utilities < …
  PASS  consumer built css carries the item rules — .x1ghz6dp
  PASS  consumer package.json owes zero dependencies (no @stylexjs/stylex, @stylexjs/unplugin, @stylexjs/babel-plugin)
━━ planted-defect self-tests (the teeth) ━━━━━━━━━━━
  PASS  selftest missing-rule (a rule deleted, manifest sha kept consistent): gate catches it as [missing-rule] naming the item — class constant .x1ghz6dp has no rule in registry/payload/stylex/corpus/code-card/code-card.css
  PASS  selftest cross-build (css from build B, classModule from build A): gate catches it as [cross-build] naming the item — buildId stamps disagree (classModule 60807e498baf / css 59ba054523f3 / manifest 60807e498baf…)
  PASS  selftest manual-edit (a hand-edited constant module): gate catches it as [manual-edit] naming the item — classModule … sha256 8cf092a2c115… ≠ recorded 247bf…
✓ verify:stylex-payload GREEN — same-build payload consistency holds
```

The cross-build plant is a REAL second compilation (a tweaked source
carrying a new atom export, compiled through the same core with the
overrides channel) — only its css is swapped into the payload copy,
with the manifest sha updated to match, so ONLY the stamp detector
can name the mode.

### verify:shadcn-add extension

- GENERIC per-case assertion: the consumer's package-lock.json
  carries zero `node_modules/@stylexjs/*` keys (the registry delta's
  three named packages and the whole scope).
- New case `stylex-tokens`: the stylex-adjacent lib item installs
  clean — tokens.stylex.ts lands at @lib, the theme sheet arrives
  (the css-import prerequisite), zero @stylexjs/* in package.json,
  consumer vite build green.
- Full-run verdicts ride the verify:all receipt below.

## P0.5 — the authoring teeth

### throw mode already live (verified, not assumed)

- Source: `packages/vite-plugin/src/stylex/vite-plugin.ts:254`
  (`propertyValidationMode: 'throw'`, IMPL-A f0b560f5).
- Dist: `packages/vite-plugin/dist/stylex/vite-plugin.js:73`.
- LIVE receipt (every gate run): the planted `background:` shorthand
  through the REAL babel transform under the kernel pins throws —
  "background is not supported. Use background-color, border-image
  etc. instead."

### The gate (exit 0, GREEN)

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
  PASS  a varied layer statement fails naming the file + divergence
  PASS  a lawful sheet passes (no false positive on folder css)
  PASS  a hand-pasted engine rule in a sheet fails
✓ verify:stylex-authoring GREEN — the authoring law holds on the migration surface
```

### The shorthand blacklist semantics (the IMPL-C risk, resolved)

The blacklist is DERIVED AT GATE RUNTIME from the pinned
babel-plugin's own throwing table (styleResolution
'property-specificity'): 18 names — the background/border/all/
animation family + logical-side aliases. `margin`, `padding`,
`inset`, `gap`, `flex`, `overflow`, `textDecoration` (spike §5.3:
engine-expandable, throw mode passes them; the dogfood corpus carries
them as-is, including demo.stylex.ts:83's `textDecoration: 'none'`)
are LAWFUL — the derivation settles the risk by construction, and
the pin-count assertion (18) makes an engine bump that moves the
table fail the gate loudly.

## P0.7 — the chain + the docs

- verify:all ordering landed: authoring → payload → mirror (the
  npm-script block), popover probe after the mirror-class gates (4c,
  IMPL-B), consumer gates last (design §7).
- npm scripts: `gen:stylex-payload`, `verify:stylex-payload`,
  `verify:stylex-authoring`.
- Docs: `apps/www/src/routes/docs/install.html` (Sections-nav lead
  entry). svelte-check: zero errors from the new page; prerender
  round-trip (svelte.config + docs-structure spec) green 12/12.
- In passing: the pre-existing `/probe-stylex-corpus` exact-set drift
  P0.6c left in `test/docs-structure.spec.ts` (route in
  svelte.config, absent from the expected probe list — the failing
  row reproduced at clean HEAD 8ebe92fe before any IMPL-D edit) —
  fixed by completing that expected list.

## The full verify:all run (the change's first full-chain run)

`node scripts/verify-all.mjs` (after `npm run build`, exit 0 — the
dist precondition), chain order as wired:

```
registry dependency shape ✓ → verify:standards ✓ → verify:laws ✓ →
verify:icons ✓ → verify:spins ✓ → verify:migration ✓ →
verify:stylex-authoring ✓ GREEN (in-chain) → verify:stylex-payload ✓
GREEN (in-chain) → verify:mirror ✓ → verify:context ✓ →
verify:deps ✓ → verify:budgets ✗ FAILED (chain aborts here)
```

- The two NEW gates ran GREEN inside the chain, in the design §7
  position (authoring → payload → mirror; the popover probe and
  consumer gates sit after the mirror class — not reached in this
  run because the chain aborts at budgets).
- THE BOUNDARY: the one chain failure, `verify:budgets`
  B-consumer-vite 3865 vs baseline 2710 (threshold 2846), is
  PRE-EXISTING at clean HEAD 8ebe92fe — reproduced with ALL IMPL-D
  source changes stashed (identical numbers; `git stash` run of
  record in the transcript). B-consumer-vite measures
  gzip(packages/vite-plugin/dist/index.js): the umbrella entry grew
  with IMPL-A's stylex bridge (P0.2) and the budget baseline was
  never re-derived — an IMPL-A follow-up (re-baseline with a note,
  per the script's own history), not an IMPL-D regression. No IMPL-D
  file touches that dist entry.
- Environment note: the first full-chain attempt died at verify:laws
  with `node_modules/.bin/tsx: No such file or directory` — the
  css-laws package's node_modules was EMPTY in this worktree (local
  install state, not a repo change; `npm install` in
  packages/css-laws fixed it; zero git-tracked files changed).
- The tail gates after the abort point, run STANDALONE (receipts):
  - `node scripts/verify-popover-area-align.mjs` — GREEN (primary
    bottom-start delta=0px; control bottom-end −171px; |control −
    primary| ≥ 1px).
  - `node scripts/verify-shadcn-add.mjs` — exit 0,
    `clean-install cases (22): ALL GREEN` (234 PASS rows) — including
    the NEW stylex-tokens case (tokens.stylex.ts at @lib, theme sheet
    arrived, zero @stylexjs/* in package.json, consumer build green)
    and the GENERIC zero-@stylexjs/* lockfile assertion PASSing on
    every one of the 22 cases.

## Process discipline (recycle evidence)

- The gate scripts spawn no servers and no watchers: the payload
  gate's consumer spot-compile is an in-process programmatic
  `build()` (awaited to completion); the authoring gate's engine arm
  is an in-process babel transform.
- verify:shadcn-add's lifecycle spine reaped its child groups
  (`[lifecycle] reaped 1 child group(s): 27730` in the run of
  record; exit 0, no LEAKED line).
- Post-run `ps`/`lsof` audit: ZERO node/vite/python processes from
  these lanes remain. The only same-day listeners are foreign
  (pid 490 serve.mjs under /private/tmp/content-srv — not this
  lane; a transient pid 34572 already gone at re-check). The
  site-build background task exited 0 and was joined.
- The npm install that fixed css-laws' empty node_modules changed no
  git-tracked file (`git status` clean for that path after).
