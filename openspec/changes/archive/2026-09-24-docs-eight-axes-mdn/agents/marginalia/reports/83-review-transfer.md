# TASK 83 — SECOND REVIEW transfer.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (2nd of 2; vellum's page — quill's 1st was PASS
  0-blockers/1-nit/3-flags, the nit landed at bd54d190. Independence law held:
  vellum's 46 and quill's 80 were opened only AFTER the findings below were fixed;
  the concordance addendum follows at the end)
- **Target**: `apps/www/src/routes/docs/components/transfer.html/` (+page.svelte 545
  lines) over the transfer family (svelte 295 / stylex 122 / css 44 / defaults 38),
  served live on :5244.
- **Method**: source reads (the dual keyed lists :217/:272, the two chains — stylex
  :38-39/:63 aliases vs css :26-42 base-token leans, the rest-less Props :53), headless
  Chromium over dev SSR :5244, the alias-theme law applied PER CHAIN with a full
  var-layer census (staged / unpinned / theme-dark seats under light and root dark),
  a text-keyed union census drive across move classes, SSR payload parse, the three
  gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT new. The landed HOST stratum
  rename verified in place and measured live; the per-chain census makes transfer the
  fifth family in the alias-theme law's map, with the crisp tier-2 signature on the
  dark seat.

## The landed item — the HOST stratum rename: VERIFIED in source and in the tree

The receipts paragraph (:525-528) now reads "the HOST stratum — attribute-scoped
re-declaration, distinct from the token strata #2/#3 above" — no number collision; the
stage pin carries a NAME, the token chains keep the numbers. And the paragraph's claim
is measured live in one capture: under root html.dark, the **unpinned** transfer's
panel re-derives — `--jx-card` **oklch(1 0 0) → oklch(0.3211)** (the alias re-substitutes
at :root, digit-exact as the paragraph says), panel border flips black → white — while
the **staged** panel holds everything light (`--jx-card` oklch(1 0 0), border black,
`--muted` oklch(0.9551), `--ring` at the brand). One render, both measured; the HOST
stratum is a distinct mechanism from tiers #2/#3 because it re-declares BOTH chains
(attribute scope), not one.

## The per-chain census — the fifth family's chain map (all three seats, both chains)

| seat | `--jx-card` (alias) | `--card` (base) | `--jx-border` (alias) | `--border` (base) | `--muted`/`--ring` (base) | painted panel |
|---|---|---|---|---|---|---|
| staged, light page | 1 0 0 | 1 0 0 | 0 0 0 | 0 0 0 | 0.9551 / brand | light |
| unpinned, light page | 1 0 0 | 1 0 0 | 0 0 0 | 0 0 0 | 0.9551 / brand | light |
| **dark seat** (`theme="dark"`, class:dark on the in-flow root) | **1 0 0 (HELD)** | **0.3211 (FLIPPED)** | **0 0 0 (HELD)** | **1 0 0 (FLIPPED)** | **0.2178 / 0.7044-brand (FLIPPED)** | **light (grounds hold)** |
| unpinned, root dark | 0.3211 | 0.3211 | 1 0 0 | 1 0 0 | dark / dark | dark |
| staged, root dark | 1 0 0 | 1 0 0 | 0 0 0 | 0 0 0 | light / light | light (HOST pin) |

The dark seat is the crisp tier-2 signature: the panel's painted ground HOLDS light
(the stylex atoms read the `--jx-card`/`--jx-border` :root aliases — island-proof)
while every base token the leans ride (`--muted`, `--ring`, `--border`-as-base)
re-derives in the island. "Grounds hold, leans flip" is now a per-chain measured map,
not a summary phrase. No hold anywhere outside a declared mechanism — the pin-finder
was never needed.

## The standing-TRUE surface — spot-checks held

1. **Union-weight census trajectory**: keyed on row label text (my first drive keyed
   checkbox `value` — all "on", an artifact). Trajectory: initial src [html, css, js] /
   tgt [empty-state]; single move → src [css, js] / tgt [html]; batch → restored full
   union; return → full restore. **Overlap 0 at every step** — no transit state where a
   key exists in both lists (the complement partition + one atomic assignment, source
   :217/:272). The one count dip in my instrumentation was the target's EMPTY-STATE
   placeholder li ("nothing here yet") leaving the count — an artifact, not a transit
   state; the family's own empty-state is honest UI.
2. **The mutation-diff discipline**: after each move **both movers disable** (selection
   cleared — nothing pickable = nothing movable), re-enabling on new picks.
3. **The both-sides theme-dark seat**: the table's dark-seat row above — grounds hold,
   leans flip, at the var layer.
4. **rest-LESS**: `interface Props` (:53) extends nothing — no HTMLAttributes, no rest
   spread anywhere in the family; the composite takes only its declared surface. ✓
5. **The three family flags**: family-lane observations, not page defects — my probes
   surfaced no page-visible consequence; cross-checked against the reports after
   filing (addendum).

## Standard battery

- **SSR/post-settle**: payload 1,164,026 bytes; h1 ×1; universal marker present;
  0 undefined literals; warm-reload consecutive fetches **hash-identical**.
- **Vocabulary-grep**: zero `jxoai` in family or page.
- **LAW #19**: 74 ids on the live DOM, zero duplicates. 12 transfer instances censused
  (7 staged, 4 unpinned, 1 dark seat), each with both panels.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **transfer.html: 0 diagnostics**. Family lane, pre-existing (untouched): 1 ERROR — the Object.entries-undefined overload at transfer.svelte :134 (the standing kernel-adjacent class) |

Sibling keyed noise receipted, not chased: quill's website-scaffold, vellum's toc,
scribe's toast in flight.

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 86744; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- DOM injections (root dark, checkbox picks) reverted in-probe.
- Instrument honesty: (1) my first union drive keyed checkbox `value` (all default
  "on" — overlap artifacts); re-keyed on row label text; (2) the transient union-dip
  decoded as the target's empty-state placeholder li entering/leaving the label count
  — accounted before any "lost row" claim; (3) the mover-disabled state crashed my
  first return-move (no enabled button) — that IS the selection-cleared law working.
- Artifacts: /tmp/marginalia-83-probe{1,2,3}.mjs, /tmp/marginalia-83-ssr.html,
  /tmp/marginalia-83-{dev,wrapper,listener,ambient,universal,scheck}.*.

## Open questions

1. **The 1 family ERROR** (:134, the Object.entries-undefined overload) — the
   standing ledger debt; the same one-line typed-guard shape the other families carry.

---

## Concordance addendum (appended after reading vellum's report 46 and quill's report 80)

My findings above were fixed before this section.

- **The landed item is quill's nit, fixed in exactly her shape**: her 80 flagged the
  two receipts paragraphs numbering the stage pin differently ("#2" vs "#3" for one
  phenomenon); bd54d190 renamed it **the HOST stratum** (:527) with the explicit
  "distinct from the token strata #2/#3" clause — no collision, her cosmetic-alignment
  request landed verbatim in intent.
- **FULL CONCORDANCE with quill's 80**: the union-weight census trajectory (her
  [3,1]→[2,2]→[∅|4]→[3,1] with the empty-state rendered = my label-keyed
  [3,1-empty]→[2,1]→[1,3]→[3,1] — same trajectory, and her {n:1,empty:true} receipt is
  exactly the placeholder-li that polluted my first count); overlap 0 at every step;
  selection cleared (my crashed drive on the disabled movers IS her measured
  [true,true]-at-rest law); the one-capture capture (her :root 0.3211 vs stage 1.0 =
  my C census digit-exact); the dark seat both sides (her --primary 0.6489→0.7044 /
  0.237→0.1872 / calc(49−4)); rest-LESS (source facts identical); LAW #19 74 ids
  (vellum's count == hers == mine); page 0 diagnostics; ambient 284/284 + universal
  110/110; her :134 family ERROR == my family ERROR receipt.
- **FULL CONCORDANCE with vellum's 46**: the seven-strata theme naming (my per-chain
  table is the measured form of her strata #2/#3/#7 — the same --card value reading
  0.3211 at :root and 1.0 at the pinned panel in one rendered state, now extended to
  the --jx-border/--border pair and --muted/--ring); the LAW #18 double-weight spine
  (complement partition, ONE atomic assignment, mounted census per move class); the
  mutation diffs and selection clearing; the density one-consumed-axis claim; her
  three OQ drift flags = the three family flags quill confirmed and I re-saw no
  page-visible consequence of (my one-capture probe IS flag #3's measured basis,
  independently reproduced).
- **Additions (mine, not in 46/80)**: the per-chain TABLE — alias vs base pairs read
  at the same panel across three seats × two theme states (the fifth family's chain
  map; the dark seat row is the crisp tier-2 signature: --jx-card 1 0 0 held beside
  --card 0.3211 flipped); the text-keyed union drive with the empty-state accounting
  (her {n:1,empty:true} was a mounted-census row; my label census shows the same
  placeholder as a COUNT pollutant — the auditor's lesson, not the family's); the
  mover-disabled crash-as-receipt; and warm-reload hash-identical SSR (1,164,026
  bytes).
- **No contradictions anywhere across the three reports.** The page closes.
