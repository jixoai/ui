# Wave 1 integration record (2026-09-17, orchestrator serial pass)

The four Wave-1 batches (52 top families, ~4,500 utility occurrences)
returned COMPLETE with disjoint file sets. This note records the
serial integration rulings and their receipts — the input to the
payload/pin rebuild and the W1 commit.

## Batch results (all four: mirrors cmp-identical, zero tier-2 new debt)

| batch | families | before → after | survivors |
|---|---|---|---|
| 0 | 12 (date-picker, pattern-hero-set, press-button, number-input, command, blockquote, input, code-card, sheet, dropdown-menu, avatar, empty) | 1,120 → 94 | all `jx-*` hooks / state markers |
| 1 | 13 (component-canvas, pagination, tags-input, tree-view, select, navigation-menu, language-switcher, tabs, props-table, menubar, section-card, token-table, result) | 1,121 → 0 | — |
| 2 | 13 (toast, transfer, ui-root, color-picker, a11y-table, carousel, breadcrumb, terminal-card, steps, pattern-faq, terminal-footer, chart, accordion) | 1,006 → 0 | — |
| 3 | 14 (file-input, combobox, mermaid, terminal-header, pattern-login, popconfirm, tour, alert, chip, hero-section, float-button, progressive-blur, input-otp, pattern-cta) | 1,156 → 83 | all `jx-*` semantic hooks |

(The separator family itself — the pilot — migrated in P0 and is
already committed.)

## Ruling 1 — the cx joiner law: component-local, zero exceptions

Two pilot precedents had diverged: separator (component-local cx,
followed by batches 0/2/3) vs timeline-docs surface module (exported
cx registered in STYLEX_MODULE_HELPERS, followed by batch 1's 24
modules / 61 import sites). Batch 1's module cx also LACKED the
string-passthrough branch batch 0 proved necessary (pre-joined group
strings explode per-character through `Object.entries('str')`).

**Ruling: component-local cx everywhere** (the separator serialize
law, canonical body = batch 0's superset form with string passthrough
+ dev-object members + `$$css` drop). The law becomes absolute — a
`.stylex.ts` module's only legal exports are `stylex.create` results
— so `STYLEX_MODULE_HELPERS` empties (machinery + selftests stay).
Rationale:

1. zero gate-exception surface to maintain across the remaining
   waves (W1b/2/3 playbook line becomes trivial);
2. 3 of 4 batches already conform; the serialize-mirror model is
   copy-based by design, so the per-component joiner is not new
   duplication;
3. local cx sits below the gate's AST horizon but is serialized +
   readable per component — and module-cx buys no additional
   auditability the per-export check doesn't already give atoms.

Dispatched as a mechanical subagent pass over batch 1's 24 modules +
61 import sites (+ the two surface modules' consumers), green-gated
on the families' spec batteries + mirror cmp.

## Ruling 2 — the Wave-1 scale extension (token promotion)

The sheet's own voice-scale comment ("the promotion table is a seed,
actual usage governs") — Wave 1 usage now governs. Live seam names
honored verbatim (batch 3's `var(--name, fallback)` seams resolve on
promotion; mismatched or one-off values stay on their exact
fallbacks — rendering is byte-stable either way).

**Accepted (30 sheet steps, sheet = registry/files/theme/jixoai.css ⇄
apps/www/src/lib/jixoai.css, both copies byte-identical):**

- text: `--text-sm` 0.875rem (14px), `--text-body-lg` 0.9375rem
  (15px), `--text-body-xl` 1rem (16px)
- tracking ladder: `--track-tight` -0.02em, `--track-04/06/10/12/14/
  18/20` (0.04–0.2em)
- weight ladder: `--weight-medium/semibold/bold` (500/600/700 — no
  weight lived in the sheet before Wave 1)
- leading ladder: `--leading-none` 1, `--leading-12` 1.2,
  `--leading-tight` 1.25 (the live seam name — see declined note for
  1.1), `--leading-14/145/15/155`
- motion family: `--motion-100/150/200`, `--motion-hero` 480ms,
  `--motion-ease-out`, `--motion-ease-nav`
  cubic-bezier(0.22, 1, 0.36, 1)
- space rungs: `--space-2/14/18` (ruler equations, ×0.5/×3.5/×4.5)

**Typed map (+31 members, three copies identical):** the 30 wrappers
above + `--jx-primary-text: var(--primary-text)` (the sheet owned the
value since r1; three batches demanded typed access). The map is now
110 members.

**Declined (recorded so the acceptance dossier can show the line):**
`--text-micro-lg` 10.5px (half-step artifact, single family — seam
fallback stays exact); 18px text, 16.8/19.52/11.5px (single-family
one-offs, css-exact per batch 1); track 0.025em; leading 1.1 (batch
0's "tight" — the 1.25 seam ×6 wins the name; 1.1 stays css), 1.3,
2.0, px rungs 24/28, `--jx-lead-tree`; `--radius-md` 6px (the radius
law is 0 + corner-shape bevel — a 6px rung contradicts it; batch 2's
value stays css); weight 400 (the css default); plain `ease` keyword;
canvas/tree sub-step spaces (2.4–13.6px — ruler equations per batch
0/1, no steps).

## Ruling 3 — registry.json + ledger entries (applied, verified)

- registry.json: +99 file entries (47 family `.stylex.ts` + 6 family
  `.css` + 46 tokens bridges), +46 `@jixoai/tokens` dependency edges
  (progressive-blur correctly excluded — its module imports no
  tokens). Item count unchanged (144), no duplicate paths, insertion
  anchored after each family's existing files.
- research/migration-ledger.json: +53 entries (47 registry-side
  family modules — registry side so item-owned modules skip the
  corpus payload lane — plus www-only a11y-table,
  docs-sections-nav, props-table, token-table, search-palette, and
  surface/component-canvas). Total 73, all paths exist.
- search-palette deliberately gets NO registry item: it is site
  chrome (the layout's command palette) with mirror twins but no
  distribution contract.

## Ruling 4 — css canonicalization sweep (dispatched)

All 31 Wave-1 lane-2 sheets (24 modified + 7 new, ×2 mirrors) open
WITHOUT the canonical five-layer statement — the batches used
unlayered `:where()` + fragment `@layer components`, a playbook
deviation. Not chain-blocking (the authoring gate scans the ledger,
css enters the ledger only when canonical) but required for the
quality bar. Dispatched as a second mechanical agent: prepend the
tier-0 canonical statement at byte zero, drop superseded legacy
statement lines, AND swap exact-value literals onto the new tokens
(font-weight 500/600/700, motion 100/150/200/480ms + easings, the
leading/tracking ladders — exact matches only). The 31 sheets join
the ledger after the sweep verifies.

## Finding — docs-structure taxonomy red is PRE-EXISTING

`test/docs-structure.spec.ts` fails `layout:20 → layout:21` + "unique
canonical page 108 → 107" at the CURRENT tree — and the failure is
byte-identical at HEAD: registry.json data, catalog.ts,
docs-route-model.ts, and the spec itself are all unmodified vs HEAD
(proven by data-level diff + git status). The 21st layout member is
the prototype-* trio (prototype-flex/grid/waterfall joined layout
after the r4 snapshot freeze; waterfall shares a canonical page href
with the prototype hub — the actual uniqueness violation). Batch 3's
"parallel batch added a layout item" attribution was wrong. Not a
Wave-1 blocker; belongs to the prototype/docs taxonomy owners.

## Deferred to post-agent (this pass)

1. component-canvas surface twin (registry/files/surface/
   component-canvas.stylex.ts + its item files[] entry) — waits for
   the cx agent to finish editing the www module.
2. ledger += the 31 css sheets — waits for the canonicalization
   sweep.
3. vitest stylex wiring (batch 3's in-tree edit) verified as the
   correct terminal form — batch 1 independently derived the same
   fix in /tmp (unplugin dev + runtimeInjection through the kernel
   pins, ghostty/icons/spinners off); no further action.
4. Mirror manifest re-classification, payload rebuild, allowlist
   re-pin (decreases only), full verify chain — after 1–2 land.

## Postscript — how the pass actually closed (2026-09-17)

- **cx unification**: the agent landed 86 files (24 modules + 62
  import sites — 62 not 61: the timeline docs page sits in routes),
  39 mirror pairs cmp-identical, zero `export const cx` anywhere,
  zero import residuals; every battery green except isolated
  pre-existing reds (tabs-indicator ×1 proven pre-existing by
  revert-replay; schema-lower ×1 = press-button meta drift from
  another task). `STYLEX_MODULE_HELPERS` emptied in the gate (law
  absolute: modules export create results only).
- **css canonicalization**: the dispatched agent hit a usage cap
  with ZERO writes; the orchestrator took the transform over —
  comment-segmented, idempotent, exact-value-only: 31 sheet pairs
  get the tier-0 canonical statement at byte zero (each sheet's
  legacy `@layer theme, base, components, utilities;` line retired),
  +162 token swaps (motion 100/150/200ms ×83, ease-out family,
  ease-nav bezier ×8, weights ×9, leading ×8, tracking ×2).
  Declined by exact-value rule: 1.1/1.6/1.5rem leading, ±0.025em,
  120–5000ms durations, the 0.2/0.8/0.2 and overshoot bezier
  curves, weight 400. verify:stylex-authoring GREEN over the
  104-entry ledger (73 + 31 css).
- **registry.json final**: +100 entries (the 99 + component-canvas
  surface twin), +47 dependency edges; MIRROR_PATH_OVERRIDES gains
  the ONE item-owned surface pair; site-only.mjs gains the six
  www-only docs-infra modules; search-palette's css/stylex join the
  svelte's pending classification in UNREFERENCED_LIB (search-stream
  family). Manifest: 144 items / 651 pairs, --check GREEN.
  (registry/files/routes/** is gitignored syncer transport — the
  timeline page twin divergence is lawful droppings.)
- **payload**: 64 stylex items, 6,289 class constants, published;
  buildId stable across reruns (deterministic).
- **pin**: 434 files · 8,721 identities · 20,891 occurrences
  (routes 15,445 / site-libs 4,171 / **ui 1,275**). Wave 1 removed
  4,133 ui occurrences = −76.4% of the ui zone (5,408 → 1,275);
  routes/site-libs untouched (W2/W3 territory). RATCHET lowered to
  the pin.
- **verify chain**: tailwindless (check+selftest) · mirror ·
  stylex-authoring · stylex-payload · laws · docs · standards ·
  meta — 8 GREEN. Two attributed pre-existing reds:
  verify:parity (5 rows, probe targets the Owner's :5199 main
  server where the grindstone trio's tier1 `has-*` utilities landed
  without a parity re-pin — W1b's toggle-group/native-select
  migration owns the follow-up) and openspec --all --strict
  (design-studio-r3, the studio stream's own delta-less change on
  main). The one-shot change itself validates green.

## The full-battery triage (2026-09-17 night)

Full www suite (default workers): 94 failed / 2,710 passed.
Serial isolation (`--maxWorkers=1`) converged the truth to four
groups:

1. **Cross-family stale spec expectations** (W1 debt — the batches
   ported their OWN families' specs; consumers' specs still
   asserted utility strings): alert ×2 + card's press seam ×1 +
   tabs' veil band ×1 ported by the orchestrator on the spot
   (atom-channel dialect per progressive-blur.spec's precedent);
   the remaining ~14 across 9 files (carved-action-band,
   composition-props, list-item-field-icon/-end-cluster/
   -segmented-stepper, search-client, enhance-picker-feedback,
   section-numbering, docs-nav-filter + schema-lower fixture)
   dispatched as a dedicated port agent.
2. **Environment, proven green on demand**: the ghostty wasm
   suites (osc/selection/scrollbar/title-timing/mouse/cursor/
   ghostty-vt/ghostty-term/title-prop — 127 tests) pass with
   `JIXOAI_GHOSTTY_WASM_PATH` pointing at the cached wasm
   (title-prop.spec gained the env branch it lacked — it hardcoded
   the /tmp research default); the betlang suites (63 tests) pass
   once `packages/betlang-wasm/dist` is built (copied from the
   upstream install for this run).
3. **Pre-existing, byte-proven earlier**: docs-structure ×2
   (prototype trio), tree-view ×2 (Host undefined), blueprints ×4
   (spin-set.svelte + prototype-kit.svg never existed at HEAD),
   docs-ambient-vocabulary ×1 (archived-path ENOENT).
4. **Load flakes**: the remaining gap between 94 (parallel) and
   the serial truth — timeouts under worker contention only
   (5,000ms caps), all green serially. The full-suite rerun for
   the acceptance dossier runs serial or with reduced workers.

An attempted HEAD-baseline comparison in an isolated worktree
crashed at vitest startup (rolldown dep-optimization refuses the
symlinked node_modules layout) — the vacuous 0-failure baseline
was discarded; attribution above rests on serial isolation +
byte-identical input proofs instead.


