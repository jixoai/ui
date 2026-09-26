# TASK 28 — REVIEW combobox (1st of 2; self-review — vellum reviewing vellum's task-24 page)

## Process note (independence disclosure)

This is a SELF-REVIEW — the queue forced it, so the strictest independence
standard was applied: the claims were re-derived from the integrated tree and
the served DOM FIRST (probe /tmp/vellum-28-cb-review.mjs, fresh measurements,
no reliance on the task-24 numbers beyond expectation), and my own task-24
report was consulted only to structure the claims list. The page has absorbed
five integrations since my CODE pass (git: eed9cd9e is still the last commit
touching it, zero drift in the page source — but the KERNEL and sheets moved,
so every measurement was re-taken, not assumed).

## Claim-by-claim re-verification

**1. Both self-fixed MAJORs — REGRESSION-CLEAN.**
- toc repair holds: hydrated toc == DOM exactly (10 entries: overview, usage,
  demo, multiple, rtl, types, accessibility, theming, universal-props, api;
  machine-checked ok:true) — the pre-task-24 defect (usage listed after types,
  multiple missing) has not regressed.
- the consumption falsification holds: the axes cells still carry the
  corrected verdicts (size = "THE §11 ECHO, NOTHING FOLLOWS"; color =
  "SUPPLY-ONLY … zero readers") — the pre-task-24 false claim ("the family
  CONSUMES size and color") has not crept back.

**2. FLOOR-ASYMMETRY — re-measured BOTH directions.** Across the theming
DensityDemo rungs: label voice 10/11/12/14px, input voice 11/12/13/15px,
field gap 4/4/8/8px, lane min-height 26/30/38/46px — all identical to the
task-24 ladder. The asymmetry itself, now measured as the shell's ACTUAL
rendered height: **40px at xs, sm AND default** (the lane shrinks inside the
fixed 2.5rem floor — shrink is dead) and **48px at lg** (the 46px lane
outgrows the floor: 46 + 2×1px borders — grow is live). Both directions of
the verdict reproduced on the current tree.

**3. ARIA end-to-end — reproduced.** Focus opens the panel
(`:popover-open`), `aria-expanded="true"`, `aria-controls === aria-owns`,
listbox `role="listbox"`; after ArrowDown `document.activeElement` is STILL
the input and `aria-activedescendant` syncs with the
`[data-jx-combobox-active]` row; filter "bun" narrows to 1 row; Enter commits
("Bun.Terminal"), closes the panel and flips `aria-expanded` to false.
Multiple: chips present, listbox `aria-multiselectable="true"`, check glyph,
chip remove "remove node-pty". Full chain green on the integrated tree.

**4. Two-time-bases demonstrator — both bases re-derived.** Wrapping the
catalogue field in `.dark`: the TYPED pole holds (shell border oklch(0 0 0),
the light value) while the RAW machines flip (well shadow → white-inset
rgba(255,255,255,0.12), panel ink → oklch(1 0 0)). The same-token pair
re-measured in one read: inside the dark scope `--terminal-hover` mixes
WHITE 14% over near-black (the machine's ground) while `--jx-terminal-hover`
still mixes BLACK 14% over near-white (the frozen pole) — one listbox, two
time-bases, intact.

**5. Tier + standard chrome — verified.** h1 ×1; install + see-also markers
present; `data-jx-props-table-universal` count ×1; toc==DOM (above); the axes
table's cells remain measured-or-grepped (source re-read: the density ladder,
size echo, supply-only greps, the split — all as filed in task 24).

## Fresh laws applied (post-CODE additions)

- **Served rows enumerated by NAME** (badge-indicator law): the api contract
  table serves — by row name — options*, value (bind), multiple, placeholder,
  label, name, error, id, allowCustom, showClear, disabled, variant, class =
  **13 family rows**, plus the 8-row generic universal fold = **21 served**.
  By-name counting confirms the api summary's arithmetic (22 meta − 8 axes =
  14 family; the synthesized rest hidden by the curation → 21): no duplicated
  rows, no byte-count ambiguity.
- **Every canvas carries its own drawer** (marginalia's law): 5
  `<ComponentCanvas>` instances on the page, 5 `files=` props (workbench →
  registry source + usage; catalogue / multiple+clear / rtl / universal-props
  each with their own demo file) — verified by source wiring after my probe's
  drawer-DOM selector guessed a wrong attribute (probe-craft note, not a page
  defect).
- **Authored-vs-served counting by names**: applied above; the served 13 =
  authored 13 with the two EXTRA-exempt rows (density, theme) still present —
  no silent fold on this page (its docs curation carries no axis-named
  authored rows needing the extra lane; the generic fold is the reference
  section).

## Findings

- **NIT (for reviewer #2, non-blocking)**: the theme row's "third time-base"
  (the shell's `colorScheme` flipping on `prefers-color-scheme` — the media,
  not the class) is verified this round by SOURCE re-read only (the stylex
  atom's `@media (prefers-color-scheme: dark)` block); the probe cannot flip
  the OS media without emulation. Accept as a source-receipt cell or emulate
  the media in review #2.
- **No MAJOR/MINOR findings.** Every task-24 measurement reproduced unchanged
  through five integrations; the misfold-class risk (axis-named authored rows
  silently folded) does not exist on this page — its curation carries no
  axis-named authored rows, and by-name enumeration proves the served set.

## Gates

- Combobox-family spec solos + docs set: form-components, form-expansion,
  props-table-meta-drift, defaults-form-families, batch4b-components,
  composition-e, docs-ambient-vocabulary, docs-structure — **8 files,
  445/445 GREEN** (ambient included: fully green on the current tree, no
  sibling noise this round).
- docs-universal: **GREEN 110/110**.
- Page-scoped svelte-check: **COMBOBOX PAGE CLEAN** (fleet 1599 — sibling
  drift only; this review made ZERO file edits).
- Port 5242 empty before (rc=1) and after teardown (rc=1; wrapper + vite
  killed by PID). NO commits, NO push. Quill's popconfirm in-flight files
  untouched (the only modified files on the tree).

## Verdict

**PASS** — the page survived five integrations with every claim intact; both
self-fixed MAJORs regression-clean; the floor-asymmetry and two-time-bases
demonstrators re-measured live; the ARIA chain green end-to-end; the fresh
laws (by-name row enumeration, per-canvas drawers, authored-vs-served
counting) all satisfied. Ready for reviewer #2 (marginalia or scribe).
