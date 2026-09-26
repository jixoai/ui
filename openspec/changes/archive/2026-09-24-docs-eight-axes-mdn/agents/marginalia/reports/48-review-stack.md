# TASK 48 — REVIEW stack (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (FIRST reviewer; independence law held — quill's report 33 NOT
  read before the findings below were fixed; the concordance addendum will be appended after
  filing, per the dispatch).
- **Target**: quill's page — `stack.html/+page.svelte` (541 lines) + `+page.ts` + the family
  (svelte 197 / stylex 77 / defaults). Zero edits anywhere; the tree's uncommitted set
  (vellum's separator.html, quill's system-dialog flip files) belongs to siblings.
- **Method**: source reads (page, family svelte/stylex/defaults, the `--jx-space-N` token
  chain through jixoai.css), SSR parse with double-fetch hash compare, four live probes:
  computed-style omission reads on the bare posture, the gap-ladder rung census, interactive
  workbench swaps through the four native selects, the document-root font-size mutation
  (16→32→16px) for the rem-of-document-root proof, the opened-drawer usage tracking, and a
  page-wide universal-marker placement census. Gates: ambient solo + docs-universal +
  fleet svelte-check.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 2 LOW / 1 NIT. Every behavioral headline claim
  verified TRUE, several to the exact string; the two LOWs are documentation-completeness
  notes on verified-correct behavior.

## The headline claims — verified TRUE

1. **OMISSION TRANSPARENCY — VERIFIED on the bare posture.** `data-probe="stack-bare"`'s
   stack computes **align-items: normal, gap: normal, justify-content: normal**, background
   `rgba(0,0,0,0)`, padding `0px`, border-width `0px`, no shadow, radius `0px`. Its
   className is a **single stylex hash** (the display:flex base alone — `x78zum5`), the style
   attribute is **null**, and the full attribute list is `[class, data-jx-stack]` — the DOM
   carries only what was named. Source receipt: stack.stylex.ts holds exactly display (base +
   baseInline), flexDirection (column), flexWrap, alignItems (5), justifyContent (5), gap
   (16) — no color/padding/typography/transition declaration exists.
2. **THE GAP LADDER IS REM-BASED CALCS — VERIFIED to the string.** The rung chain is
   `gap48 atom → var(--jx-space-48) → var(--space-48) → calc(var(--jx-unit) * 12)` with
   `--jx-unit: 0.25rem` (jixoai.css :1233); the **computed custom property reads exactly
   `calc(0.25rem * 12)`** on the gap-ladder section (and `calc(0.25rem * 1)` for rung 4).
   The ladder mounts four stacks computing **4px / 12px / 24px / 48px** — four distinct
   rungs, keyed each `['4','12','24','48']`, 3 cells each. The workbench flipped to gap 48
   computes **48px**.
3. **Closed vocabulary live — VERIFIED through the real selects.** Driving the workbench's
   four native selects (direction=column, gap=48, align=center, justify=between) computes
   **flex-direction: column, gap: 48px, align-items: center, justify-content:
   space-between** — the closed CSS set, no invented words.
4. **Rest-replace — VERIFIED verbatim.** The consumer's `data-probe-inner="merge"` lands on
   the stamps stack's attribute list `[class, data-probe-inner, data-jx-stack, style]`,
   right beside the component's single hook `data-jx-stack`. Source: the rest spread lands
   BEFORE the component's own stamps (stack.svelte :187-195) — consumer attributes replace,
   never merge.
5. **THE MERGE LAW — VERIFIED, one attribute, consumer wins.** The stamps specimen's style
   attribute reads **`--jx-radius-effective: 12px; border-radius: 3px`** — the carrier AND
   the consumer declaration co-exist in ONE attribute — and the **computed corner is 3px**.
   The theme lane rides as the `dark` class (class:dark measured true); data-density null
   (auto stamps nothing — the ambient workbench stack likewise carries only
   `[class, data-jx-stack]`, no style attr, data-density null).
6. **SIZE VOICE + REM-OF-DOCUMENT-ROOT — VERIFIED with a mutation proof.** `size={18}`
   stamps `--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)`; root and
   both children compute **18px** while gap stays **8px**. Then the proof: document root
   font-size 16px → 32px → 16px moves the gap **8px → 16px → 8px** and the ladder rung
   4px → 8px → 4px, while the 18px voice **never moves** — gaps are rem of the DOCUMENT
   root, exactly the token math; the px size stamp is outside that channel. Page restored
   exactly after (re-read 8px / 4px).
7. **The universal marker lives in the API table — VERIFIED.** Exactly ONE
   `data-jx-props-table-universal` marker ("Universal props") page-wide, and its section is
   **`#api`** — the appendix placement. The generated axis rows leave the main table (the
   section is their one home); the API table renders 7 structural rows + rest, then the
   generated eight-axis section.
8. **A11y is honest prose — VERIFIED.** The accessibility section states the plain-div/no-
   ARIA/no-reorder contract; live census: **zero role attributes** on any of the 17 stacks;
   aria-hidden is NOT forced by the family (correct here — a layout primitive's children
   carry their own semantics).
9. **Never-ambient surface basis — SANITY-CHECKED.** StackDefaults (source) declares
   **exactly the 8 paint slots and zero structural entries** (sed receipt over the
   defineComponentDefaults block); the API table stages 7 structural props + the HTML rest,
   all classified never-ambient in the law table ("a row is a row because its consumer says
   so"). Whether it is the FLEET'S LARGEST stays quill's comparative open question — the
   basis (7 structural, all outside the contract) is real and receipted.
10. **Drawer usage tracking — VERIFIED verbatim.** With the picks flipped, the workbench
    drawer's usage file reads
    `<Stack direction="column" gap="48" align="center" justify="between">` — every pick
    tracked (the usageLive template).

## Standard battery

- **SSR/post-settle duality**: SSR carries `data-jx-stack` ×19 string hits (17 real
  attributes + 2 prose mentions in law/TokenTable text), `data-probe-inner="merge"` ×1,
  h1 ×1, all four probe panels by name (`stack-size`, `stack-named`, `stack-stamps`,
  `stack-bare`), 0 `undefined`/`null` literals. Live: 17 stacks mounted, 80 ids zero dups.
- **Warm-reload law**: two consecutive SSR fetches hash-identical (82b73965…).
- **EXTRA-lane by name**: all four panels present SSR + live.
- **KEYED-EACH + mounted-children**: gap-ladder keyed each (4 unique string keys) × 3 cells;
  the wrap cloud mounts **14 tags**; no hydration abort signs page-wide.
- **LAW #19**: SSR id audit zero twins; live 80 ids zero dups; ToC = 9 sections, every href
  resolves (`overview, stack-workbench, gap-ladder, law, postures, usage, api, axes,
  accessibility`); h1 ×1.
- **THEME-SPLIT vocabulary**: `class:dark` bridge measured true on the stamps stack; no dark
  on the ambient workbench stack.
- **Named steps**: `size="medium"` → `--jx-size-effective: var(--jx-size-medium)` computed
  16px; `radius="large"` stamps `var(--jx-radius-large)` (10px) while the stack's own corner
  computes **0px** — SUPPLY-ONLY, the stack draws no corner of its own.
- **Vocabulary-grep on family claims**: zero transition/animation declarations in
  stack.stylex.ts (the motion row's "grep receipt" holds); the atom table's declaration
  census is exactly display/flexDirection/flexWrap/alignItems/justifyContent/gap.

## Findings (severity-tagged)

1. **[LOW — the size row overstates slightly and the non-scaling is undocumented]** The
   axes table's size row says "one number moves the whole stack", and the demo panel's own
   copy says "children inherit the root font-size" — but nowhere does the page state that
   the gap rungs do NOT move under a size stamp (they are rem of the DOCUMENT root, proven
   by my 16→32px mutation). The non-scaling is staged (gap="8" co-exists with size={18} in
   the same panel) but never said; a reader whose intuition is em-scaling gets no correction.
   One sentence in the size row ("the voice moves; the rungs stay rem of the document root")
   closes it. Behavior verified correct — documentation completeness only, page files
   unchanged by me.
2. **[LOW — pre-existing diagnostics, unchanged files]** family `stack.svelte` :179 8×
   state_referenced_locally warns (the fleet pattern, same as skeleton :109) +
   `scenes/stack.svelte` :18 1 error (the Object.entries overload). Page files: **0
   diagnostics**. Fleet 1572 errors / 1029 warns / 609 files (sibling in-flight set —
   vellum's separator.html, quill's system-dialog — receipted, not chased).
3. **[NIT — the API summary preserves founding language that now needs its scope read]**:
   "all never-ambient (no Defaults contract…)" is scoped to the seven STRUCTURAL props and
   is true of them, but the page itself two sections later documents the W3-D3 paint
   Defaults contract — a reader landing on the API summary first could read "no Defaults
   contract" page-wide. The overview and law table scope it correctly; the family source
   comment records the reconciliation. Cosmetic.
4. **[NONE]** otherwise — no MAJOR, no MINOR on any dispatched behavioral claim.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** — clean (close-timeout is post-success noise; exit code is the gate) |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 2495 files) | **page 0 diagnostics**; family/scene debt pre-existing (unchanged files); fleet counts drifted 1575→1572 with the sibling set in flight |
| Raw SSR + real DOM | h1 ×1; SSR ids clean (no twins); ToC 9/9 resolve; markers present; 0 undefined/null literals |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 33440 / pgid 33436) → vite killed by
  pgid TERM + stragglers -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** Sibling files untouched.
- Independence: quill's report 33 not read before the findings were fixed; concordance
  addendum to follow after filing.
- Instrument honesty: the drawer-tracking read only works with the drawer's content in the
  DOM (it measures true even closed — the usageLive template tracks picks live); the first
  universal-marker search (exact text "universal") found none — the marker is the
  `data-jx-props-table-universal` h4, which is the honest query; the SSR `data-jx-stack`
  count (19) reconciles as 17 attributes + 2 prose mentions — count attributes, not strings.
- Artifacts: /tmp/marginalia-48-probe{1,2,3,4}.mjs, /tmp/marginalia-48-ssr.html,
  /tmp/marginalia-48-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading quill's report 33)

## Concordance addendum (appended after reading quill's report 33)

My findings above were fixed before this section; the cross-check against report 33:

- **FULL CONCORDANCE — every overlapping measurement reproduced**: omission transparency
  (bare: align-items normal, gap normal, transparent, 0 padding/border), the token-bound gap
  (workbench 48 → 48px; the rung var reads exactly `calc(0.25rem * 12)` — her honest note
  that her first literal-expecting assertion FAILED matches the source: the token is calcs,
  not literals), the closed vocabulary trio, rest-replace beside the single hook, the merge
  law (one attribute, corner 3px), the size voice (root + children 18px), the stamps (sm
  rung, dark bridge, alias vars), and the chrome receipts (h1 ×1, marker ×1 in the api
  table, ToC 9, LAW #19 zero twins). Gates: universal 110/110, ambient 284/284, page 0
  diagnostics — all concordant.
- **ADDITIONS (mine, not in report 33)**: the document-root MUTATION PROOF (root 16→32→16px
  moves the gaps 8→16→8px and the ladder rung 4→8→4px while the 18px voice never moves — her
  open question 1 asserted the mechanism, my probe measures it and restores exactly); the
  bare stack's attribute-list transparency (single hash class, null style attr,
  justify-content normal); the computed alias values (--jx-size-medium 16px,
  --jx-radius-large 10px, stack corner 0px — SUPPLY-ONLY); the universal-marker placement
  census (exactly one marker, section #api); the drawer usage tracked verbatim under flipped
  picks; and the SSR 19-hits reconciliation (17 attributes + 2 prose mentions — count
  attributes, not strings).
- **HER OPEN QUESTION 1 = my LOW #1**: we independently reached the same diagnosis — the
  page's "one number moves the stack" line refers to the voice only, and the non-scaling is
  documented in her REPORT but not on the PAGE. My LOW gives it a concrete home (one sentence
  in the size row); her family-level note (em rungs if gap should ever ride the size lane) is
  the right scope for any behavior change.
- **HER OPEN QUESTION 2**: the "largest structural surface" superlative is quoted-from-
  comment in her report and basis-checked in mine (StackDefaults holds zero structural
  slots; 7 structural rows staged) — both reports agree it is the first thing to re-check if
  the context gate's vocabulary ever grows.
- **Gate-coverage note**: her battery also ran composition-b/c solos (24 + 14) — mine matched
  the dispatched battery (ambient + universal + fleet svelte-check); no overlap conflict.
