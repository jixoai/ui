# T117 — SECOND REVIEW textarea.html (vellum)

- **Reviewer**: vellum (3rd-pass/2nd-closure: this page carries MY 1st review (77,
  PASS 0M/0m/2L/1N), marginalia's 84 2nd (PASS, 1 new LOW — the L3 ink half), and the
  post-84 landings the dispatch names. Her 84 report opened FIRST for this pass; my
  own 77 receipts re-derived as the headline set. NO commits, NO pushes; zero
  product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/textarea.html/` over the textarea
  family, served live on :5242, dist @ HEAD f4a36087.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (per
  dispatch — "closed pending your 2nd"; nothing I measured contradicts). The L3
  latent-ink theme row LANDED (the W-next #7 eighth voice); spellcheck/wrap SERVED at
  both layers (quill's ruling verified); my 77 boundary receipts re-derived
  digit-exact; page 0 diagnostics.

## The dispatch's named landings — verified

1. **The L3 latent-ink theme row (#7's eighth voice) — LANDED, the full chain split
   taught.** Source :176 now reads: "The ink has two halves: the shell face reads base
   tokens and flips at each stratum, but the typed text rides the ROOT-PINNED ALIAS
   chain and holds the root resolution — **at the settled L3 stamp that is black text
   on the flipped shell** (latent — no served L3 demo; the family ink-pair repair is
   queued, W-next #7)." This is marginalia-84's LOW landed verbatim-plus — the
   per-chain consequence (her table's text-ink row) now lives on the page's theme row,
   with the repair queued where it belongs.
2. **spellcheck/wrap SERVED at both layers (quill's ruling) — verified.** Byte layer:
   the usage snippet (:36) carries `spellcheck={false} wrap="hard"`. DOM layer: a LIVE
   seat **s14** serves `spellcheck="false"` and `wrap="hard"` (attribute + IDL
   `spellcheck === false` measured). The snippet-completion-vs-live-seat question her
   84 raised is closed the strong way — both layers serve.

## My 77 receipts — re-derived digit-exact

- **The 90% hysteresis boundary, both directions**: driving the maxlength-280 count
  instance (s16): **251 → "251 / 280" aria-live off**; **252 → "252 / 280" polite**
  (ceil(280×0.9) = 252) — crossing up exact; my 77 boundary at the same seat shape.
- **Code-point counting**: 🫠🫠 → DOM length 4 UTF-16 units, readout **"2 / 280"** ✓
  (surrogate pairs as one).
- **The universal table fold**: the api section renders the component rows + the
  8-axis universal fold (the campaign's rendered-surface convention) — no omission.

## Fresh axis (beyond both prior reports)

- **The count-instance census by maxlength**: the page serves TWO maxlength-280
  textareas (s13, s16) but only s16 carries the live readout — s13 is a
  maxlength-without-count seat. The no-cap instance (s2) renders the bare count with
  aria-live permanently off (her 84 census's "why" confirmed at the current tree:
  maxLen null → no threshold → off). The count channel is opt-in per seat, now
  census-backed.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD f4a36087) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (unchanged from 84's page receipt) |
| family lane | the 84-recorded standing trio persists (textarea.svelte :84 cx overload, :164 chrome-not-on-Props, :229 ClassValue|null) — recorded debt, not chased; no NEW shape |

## Process evidence

- Port **5242**: wrapper + listener 27154; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Counter drives died with the probe browser.
- Probe faults owned: my first counter drive hit s13 (maxlength-280 WITHOUT a count
  readout — the value landed, the readout I matched was another instance's static
  "0 / 280"); the census-then-drive fix (find the readout's own instance) is the
  receipt. Her 84's identical lesson ("my first counter drive hit the s2 notes
  instance") — the trap recurs per-seat; the census shape closes it.
- Artifacts: /tmp/t117/{probe-a2.mjs,probe-c.mjs,a2.json,c.json,scheck.log,
  lsof-after.txt}.

## Open questions

1. None. The page closes: 77 (1st) → 84 (2nd, one LOW) → the LOW landed → this
   closure pass verifies the landing and re-derives the contract. Tier 2.
