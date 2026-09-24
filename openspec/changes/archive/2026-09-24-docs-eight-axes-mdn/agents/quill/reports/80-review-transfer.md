# T80 — FIRST REVIEW transfer.html (quill)

**Target:** vellum's CODE 46, integrated at 6f032ef1 ("docs(mdn): transfer #coded t2 — her
CODE queue complete"), owner-checked. **Independence law honored:** all findings below were
formed from my own source reads + live probes on port 5241 BEFORE opening
`agents/vellum/reports/46-transfer.md`; the cross-check section is appended after the
findings locked.

## Verdict: PASS (0 blockers · 1 nit · 3 family flags confirmed)

20/20 probe checks, two consecutive green runs + warm-reload green; three gates green;
mirror 3/3 byte-identical; family standing debt pre-existing and untouched.

## Headline claims — measured on the served DOM

### LAW #18 at union weight — GREEN

- **Complement partition**: source keys [alpha, beta, gamma] ∩ target keys [keeper] = empty;
  union = all four options (`check: COMPLETIONS empty, union = alpha,beta,gamma,keeper`).
  Both `{#each}` blocks keyed `(option.value)` (transfer.svelte:217, :272 — source read).
- **ONE atomic move, no transit state**: `move()` = `value = next` (spread-in or filter-out)
  then both picked Sets cleared then `onchange` — transfer.svelte:174–185. There is no code
  path where a key exists in both lists.
- **Mounted census after every move class** (real checkbox clicks + real mover clicks on the
  live demo): `[3,1]` → single +1 → `[2,2]` → batch +2 through the EMPTY state
  (`[{n:1,empty:true},{n:4,empty:false}]` — "no matches" renders) → return −3 → `[3,1]`
  restored with keeper on target. Census matched the value list at every step.
- **Selection cleared post-move**: 0 checked remaining after the single move (measured).
- **Movers disabled at zero movable** [true, true] at rest; a check arms the → mover
  (measured [false, true]).
- **Search**: per panel, label substring, case-insensitive — "alp" → visible [alpha], legends
  read "source · 1/3 visible" / "target · 1/1 visible" (footers of truth; "0/0" through the
  empty state).
- **Disabled deno**: renders, checkbox `disabled` (cannot even check — `disabledAttr: true`),
  a FORCED check never crosses (wasDisabled true; target labels after = ["node 24"] only);
  movers never arm off it.
- **FormData bridge**: at rest echoes `value="keep"`; after the single move echoes the LIST
  `keep\na` (multi-entry `\n` join of [keep, alpha]) — the multi-entry FormData law, correct.

### THE PAGE-LEVEL CAPTURE — GREEN, exact numbers

Under `html.dark` (the L1 page bridge, set in-probe — ONE render, no reload):

- `:root`-level (outside any stage): `--jx-card` re-derives **oklch(0.3211 0 0)** — matches
  the receipts paragraph's claimed 1.0 → 0.3211 exactly.
- Inside the pinned stage (`data-theme="light"`, stageTheme confirmed "light"): `--jx-card`
  holds **oklch(1 0 0)**. Same rendered state, both measured — the substitution point
  decides frozen-vs-flip.

### The seven strata — completed with the lean-flip measurement

My probe adds the half vellum's report left unmeasured — the `theme="dark"` island seat in
#universal-props (`.jx-transfer.dark` inside the light stage), BOTH sides read:

- **Grounds hold**: `--jx-card` = oklch(1 0 0), identical to the non-dark sibling.
- **Leans flip**: `--primary` L 0.6489 → 0.7044, C 0.237 → 0.1872, and the hue rides
  **`calc(49 - 4)`** — rotation computed from the base 49, L/C quoted as digits. The
  quote-L/C-never-raw-hue law is honored in the token source itself (measured receipt).
- Strata #1/#2 measured in the capture above (page bridge re-derives; stage pin holds).

### The three family flags — all confirmed as candidates, none a defect

1. **role=status legend candidate**: moves announce NOTHING at component level today —
   measured `aria-live` ×0, `role=status` ×0 in the family; legends are counts, not live.
   Adding it would be NET-NEW signal (no double-announce risk). The page's recipes already
   bridge with their own `aria-live="polite"` readouts (measured "rejected removals: 0"),
   which announce recipe events, not moves — no doubling there either. Confirmed candidate.
2. **Dev-mode duplicate-value warning**: union uniqueness holds iff consumer options are
   unique; a dup value key-collides inside one list and the family cannot partition it.
   Demo data measured unique. Confirmed cheap-hardening candidate.
3. **Root-dark-demos-outside-stage rule**: measured — outside the stage, root dark
   re-derives 0.3211; any future live root-dark demo must mount outside a pinned stage (or
   the pin needs an opt-out). Page-shape, not family. Confirmed.

## Standing battery

- **Chrome/SSR**: 200; h1 ×1; main ×1; toc 11/11 resolve (matches +page.ts data — install/
  see-also OUT, trio last); duplicate ids **0** (LAW #19, one line: 74 ids page-wide per
  vellum, my probe: dupes NONE — no wrapper twins minted).
- **Warm-reload law**: reload → census [3,1], bridge "keep", h1 ×1, stage pin light — GREEN.
- **EXTRA-lane**: transfer is **rest-LESS** — the Props interface names every attr (options,
  value, name, titles, searchPlaceholder, onchange, the eight axes, class); no `...rest`
  spread anywhere in the component markup. Nothing to forward, nothing unnamed.
- **KEYED-EACH union weight**: both lists keyed option.value; union keys unique (measured).
- **Vocabulary**: `docs-ambient-vocabulary.matrix.json` has **0 transfer rows** — no page
  pins to re-verify; the fleet spec is the gate (284/284 below).
- **Density the ONE consumed axis**: rows ride `var(--jx-text)` (transfer.stylex.ts source
  read); measured row set {11, 12, 13, 15}px across the theming-section rung demos — the
  12px sm / 13px ambient claim sits inside the measured set; legend/search chrome on static
  label steps.
- **Zero readers**: `getComputedStyle|matchMedia|offsetWidth|clientWidth` ×0 over
  ui/transfer/; `--jx-*-effective` reads ×0 (all supply-only rows honest); `transition` ×0
  in the family css (motionless verified).

## Gates

| Gate | Result |
|---|---|
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| docs-ambient-vocabulary solo (apps/www, single spec) | **284/284, exit 0** (known vite-teardown nuisance note; rc=0) |
| svelte-check page-scoped | **0 diagnostics on transfer.html/+page.svelte and +page.ts**. Family standing debt, pre-existing and untouched: 8× `state_referenced_locally` warns (transfer.svelte:119) + cx-overload errors (:134 component, :17 scenes/transfer) — component last touched by c6959e78, BEFORE vellum's 6f032ef1 (which touched only the page) |
| Mirror law | `cmp` byte-identical registry/files/ui/transfer/ ⇄ apps/www/src/lib/ui/transfer/ — transfer.svelte / transfer.stylex.ts / transfer.css, 3/3 |

## Cross-check vs vellum's report 46 (opened AFTER findings locked)

**Concordance (her receipts my probes independently confirm)**: union uniqueness by
complement partition; ONE atomic assignment / no transit; census [α,β,γ|keep] → [b,c|α,keep]
→ [∅|α,β,γ,keep] → [α,β,γ|keep] — identical trajectory to mine; mutation diffs and
selection clearing; legends/aria-labels; search receipt; disabled law; bridge echo ("keep"
at rest — my addition: the post-move list echo `keep\na`); LAW #19 dupes NONE; density
12px/13px; zero effective readers ×5; motionless; the capture (1.0 vs 0.3211, stage pin
"light"); component has no live region + recipes bridge; toc 11 == DOM. All match.

**Additions (mine, beyond her report)**:
1. The stratum #3 lean-flip measured BOTH sides (grounds hold + `--primary`
   0.6489→0.7044 / 0.237→0.1872 / `calc(49 - 4)`) — she measured only the grounds side of
   the theme="dark" seat ("white under the island").
2. Warm-reload receipt (not in her gate set).

**One nit (non-blocking)**: the page's two receipts paragraphs number the stage pin
differently — the theme axisRow calls the island-held grounds "stratum #2" (token layer),
the receipts paragraph calls the pin "stratum #3" (scoping mechanism). Both are defensible
under her own seven-strata list (the pin IS a scoped re-declaration OF the alias ground),
but a reader meets "#2" and "#3" for the same phenomenon two paragraphs apart. Cosmetic
prose alignment only; the physical claims are identical and measured.

## Probe faults owned (all mine, all fixed pre-verdict)

1. Return-move driver clicked every unchecked row in BOTH panels (keep included) → census
   [4,1]; fixed to select exactly the three movers on the target list → [3,1] restored.
2. Bridge assertion inherited the dispatch headline's at-rest expectation ("keep") for the
   post-move state; the component correctly echoes the LIST (`keep\na`). Expectation fixed.
3. The scoped `componentAnnounces` selector still used a nonexistent `[data-jx-transfer]`
   hook after the global rename to `.jx-transfer` — crash; fixed.
4. Dark emulation via `colorScheme` alone never flips the fleet's class bridge (`rootDark`
   stayed false) — the L1 bridge is `html.dark`, set directly in-probe. Plus a lightness
   regex that couldn't match `oklch(1 0 0)`.

## Port/process receipts

- Port **5241** empty BEFORE this task's probes (task-start receipt); after gates:
  listener 70376 (wrapper 70347) killed by PID; `lsof -i :5241` ×0 lines — **port EMPTY
  after**. Zero orphan probe browsers.
- NO commits, NO pushes (coordinator integrates). Probe DOM injections (`html.dark`)
  removed in-probe; all checkbox/mover/mover-search interactions real clicks/inputs.
