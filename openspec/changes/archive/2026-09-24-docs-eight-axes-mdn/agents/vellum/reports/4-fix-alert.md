# Report 4 — MICRO-FIX `alert` + the committed dark-island re-probe (vellum, 2026-09-22)

**Task:** task 4 — fix all four findings from marginalia's PASS review
(`agents/marginalia/reports/3-review-alert.md`), plus the committed
re-probe: my theme row claimed a full repaint under the `.dark` island;
re-measure it against the drift ledger's W-next #1 and rewrite honestly.
Plus one mid-flight addendum from the coordinator (scribe's accordion
review finding 5, campaign-wide): my page ships the same one-generic
`query()` type error. Files touched:
`apps/www/src/routes/docs/components/alert.html/+page.svelte` (only page
file) and `apps/www/test/canvas-same-source.spec.ts` (the same-source
drift gate — the axes canvas joined the lane, so it joins the pilots).
NO commits (main dir, orchestrator commits).

## Per-finding fixes

1. **MINOR — axes drawer drifted from its stage at birth → FIXED by
   single-sourcing (the quill idiom).** The hand-mirrored `axesUsage`
   literal is deleted. The axes `<ComponentCanvas>` now carries
   `id="axes"`; the drawer's usage file composes from the stage itself:
   `const axesUsage = usageFile({ Alert: '@ui/alert', Card: '@ui/card' },
   resolveRawCode('axes'))` over
   `virtual:jixoai-canvas/docs/components/alert.html/+page`. The
   explanatory comments moved INTO the stage children (extraction is a
   byte-slice, so both surfaces carry them). The drift died with the
   second source: the drawer now ships the stage's full sentence
   "…= 6px off the banner's anchor". The F4 self-containment guard
   passes (the `cx(rt.…)` attribute calls are CallExpressions, not bare
   identifiers). Cost: the spec's PILOTS grew by one page and one inline
   snapshot — `alert.html :: axes` pinned via `vitest -u`, then re-run
   green without `-u`. The query() canvas keeps its hand file
   deliberately: its drawer teaches the explicit `query<…>(…)` call
   form while the stage carries the page's own const (extraction would
   ship an unbound-identifier reference — F4 rejects exactly that).

2. **MINOR — density row implied the number lane moves the × hit lane →
   FIXED with the inert clause + the declaring-element why.** The row
   now reads "a number stamps --jx-density-coefficient — inert on this
   banner: nothing here scales by the coefficient, and only the named
   rungs move --jx-hit, the × affordance's hit lane (a bare number
   declares no scope block, so nothing re-declares AT the banner)" —
   marginalia's suggested clause plus the declaring-element mechanism
   (the accordion idiom my own experience log queued).

3. **NIT — "fixed literals" stale phrasing → FIXED.** Now "The banner's
   type and padding rhythm are static tokens — `var(--jx-text-base)`,
   `var(--space-12)`, `calc(var(--jx-unit) * 3.5)` — and none of them
   reads a density channel" (also the "is"→"are" grammar fix).

4. **NIT — density type cell vs the `density="2xs"` demo → FIXED.** The
   column now reads `'small' | 'medium' | 'large' | 'auto' | number
   (+ the five legacy spellings)`; the five spellings re-verified
   against `DensityLane` (universal-props.schema.ts:71: xs · 2xs ·
   sm · default · lg).

5. **ADDENDUM (coordinator, mid-flight) — the query() one-generic type
   error → FIXED in script, drawer string, and comment.**
   `responsiveDensity` is now
   `query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')`;
   the queryUsage drawer string teaches the same two-arg form; the
   comment states the why. **Premise proved, not assumed:** with the
   one-generic form temporarily reverted in place, svelte-check flags
   exactly `+page.svelte:75:73 — Argument of type '"large"' is not
   assignable to parameter of type 'undefined'` and the workspace error
   count moves 1646 → 1647; with the fix restored, the :75 error is
   gone and my file's only remaining diagnostic is the PRE-EXISTING
   page-family `cx`-helper strictness at :179:28 (byte-identical idiom
   and error on the committed anchor page at :66:28 — not this task's
   regression).

## THE RE-PROBE — verdict: the SPLIT, with alert's own twist

**Claim re-measured:** my theme row said "The one axis that repaints
the banner itself … the token profile flips inside the notice", and the
usage caption said "stamps the .dark class bridge on this banner only".
Per W-next ledger #1 (raw voices flip, semantic inks stay root-anchored)
I expected accordion's B1 failure mode here. **The live page shows
something more precise: BOTH mechanisms on one banner.**

Probe: `/tmp/vellum-4-alert-darkprobe.mjs`, log
`/tmp/vellum-4-darkprobe.log`, against my :5242 dev smoke — **11/11**,
re-run 11/11 after the wording edits. The tonal "dark profile" banner
vs its light tonal twin:

- **The variant-grammar slots RE-SCOPE — the tonal paint genuinely
  flips.** `--jx-tonal` re-substitutes against the island's `--primary`
  (oklch(0.6489 0.237 146) → oklch(0.7044 0.1872 142)); the 12% ground
  mix, the 45% border mix, AND the title/body inks all flip (they all
  ride `--jx-tonal` since the r2 blocker fix made the tonal body
  consume the variant ink). Mechanism: the sheet declares the slots at
  `:root,.jx-light,.dark` (jixoai.css:1497-1504, the Owner canvas-bug
  law) — the same W6-class re-scope accordion's card ground lacks.
- **The stylex semantic ink layer stays :root-frozen — ledger #1
  exactly.** Raw `--muted-foreground` flips (oklch(0.3211 0 0) →
  oklch(0.8452 0 0)) while `--jx-muted-foreground` is unchanged on the
  island; same for `--jx-foreground` and `--jx-ring`. And the shadow:
  raw `--shadow-2xs` flips to the white ink while the stylex token
  `--jx-shadow-2xs` keeps the black ink — computed boxShadow is
  byte-identical black on both banners. Consequence on THIS family: the
  outline rung's title/body ramp, the × affordance glyph, its focus
  ring, and the hard-offset shadow ink keep the light values inside a
  dark island.
- **Compiled-CSS receipt (not dev-pipeline inference):** the fresh dist
  (`dist/_app/immutable/assets/0.DRQtofFE.css`) declares
  `--jx-muted-foreground: var(--muted-foreground)` ONLY on
  `:root, .xbpgcew` (+ the `.x13ei35y.x13ei35y` theme class) — never
  under plain `.dark`; `--jx-tonal: var(--primary)` IS on
  `:root,.jx-light,.dark`. Source read, live probe, and build output
  agree.

**So: NOT accordion's invisible-text failure, and NOT a full flip
either — a partial re-theme whose FLIPPING half is the variant-grammar
pair (theme-scoped in the sheet) and whose FROZEN half is the stylex
semantic ink layer (the W-next #1 gap).** Honest rewrite landed in all
four claim sites: the theme row ("A PARTIAL re-theme on this banner,
measured (the drift ledger's W-next #1)… document[ed] supply-side until
the protocol pass"), the axes section summary ("theme partially
re-themes the banner (the tonal pair re-scopes under the .dark island;
the semantic ink layer stays root-anchored)"), and the demo caption in
both surfaces (drawer string + stage, kept in sync): "a partial
re-theme: the tonal pair re-scopes to the island's dark profile; the
semantic ink layer stays root-anchored (W-next #1)".

**Campaign datum for the ledger's W-next #1 (for the orchestrator to
fold in):** the gap is not uniform across consumers — any family whose
paint rides the variant-grammar slots (`--jx-tonal`/`--jx-outline`/
`--jx-fill`) measurably re-themes those voices under a plain `.dark`
island, because the SHEET theme-scopes the slots; the frozen layer is
precisely the stylex token map (tokens.stylex.ts defineVars — ink,
ring, shadows). Alert sits in both worlds: tonal paint flips, semantic
ink does not. The accordion/anchor wording "raw voices only" is true
for them and incomplete as a fleet generalization.

## Gates

- **canvas-same-source solo:** `npx vitest run
  test/canvas-same-source.spec.ts` (apps/www) → **44/44** (41 + alert's
  2 dynamic + 1 snapshot), snapshot written once with `-u`, then green
  without it.
- **verify:tailwindless:** `✓ GREEN — 2 class-bearing files against the
  pin … receipt: files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42` — receipt UNMOVED (run pre- and
  post-build).
- **verify:docs-universal (fresh dist):** `GREEN: 110/110 component
  pages render the shared universal section (110 markers)`.
- **verify:docs:** `✓ all docs pages pass the skeleton lint (staged
  scope green)` — alert still only in the pre-existing backlog rows
  (Install/see-also markers, out of this task's scope).
- **svelte-check:** with the fix, exactly ONE diagnostic on the page —
  the pre-existing `cx`-helper baseline (:179:28, family-wide idiom);
  the :75 query() error exists ONLY with the one-generic form (proved
  by revert-probe, see finding 5).
- **dev smoke :5242:** page 200, 8 banners, the new row/caption strings
  render, axes drawer carries the composed stage (4/4 drawer
  assertions); dark re-probe 11/11 twice.

## Processes

- Dev server `node scripts/dev.mjs --port 5242` from the repo root.
  Reclaim: killed the :5242 listener by PID (5102), found the wrapper
  STILL alive (81675 — my own logged mistake class), killed it too;
  receipt: `lsof -i :5242 -sTCP:LISTEN` → 0 lines, `pgrep -f
  "dev.mjs --port 5242"` → none. Fresh `pnpm run build` AFTER the kill
  (no dev server touching dist during gates).
- Scratch artifacts, /tmp only: vellum-4-alert-darkprobe.mjs + log,
  vellum-4-smoke.mjs + log, vellum-4-extract.mjs, vellum-4-dev.log,
  vellum-4-page-backup.svelte. Repo-side writes: the two files above +
  this report + experience.md.
- Probe bug self-caught (my own logged law): the smoke's first "2xs
  rung" FAIL was my 700-char slice cutoff, not the page — re-measured
  with the full drawer text, 4/4.
