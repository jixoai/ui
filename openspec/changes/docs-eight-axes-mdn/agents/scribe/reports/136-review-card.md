# TASK 136 — card (docs page) — 2nd eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT (new) — Tier 2 CONFIRMED.**
Owner = marginalia; quill's 1st (T124a, PASS 0M/1m/2L/1N) consolidated. Dist = **ef520d44**
(fresh build rc=0, == the floor). Port 5243 mine; killed after probes, lsof post rc=1, no
orphans, siblings untouched.

## The landed items — verified closed

- **The 8-entry rail** — LANDED verbatim: +page.ts ships her proposed order exactly
  (`usage → foot-flexibility → grid-composition → types → accessibility → theming →
  universal-props → api`), and the served rail reads all eight in DOM order. The
  campaign's largest no-rail surface is railed.
- **The snippet casts (MINOR-1 ×3)** — CLOSED: `xGlyph`/`actionSeat`/`footSeat` now pass
  as `as unknown as Snippet` at :246/:308/:309; svelte-check: **card.html page 0 errors**
  (was 6).
- **The token-vocab trues (LOW-1)** — CLOSED: `source: 'law'` is zero-hit; the theming
  rows cite sanctioned sources.
- **The foot render-gate (NIT-1)** — CLOSED at the type layer (family 0 errors; the
  guarded render unchanged at runtime).
- **The family cx + typing (LOW-2 ×5 seats + NIT-1)** — CLOSED: ui/card **0 errors, 8
  standing warnings** (was 4 errors). The whole batch's typing debt is gone.
- Saved-run receipt: /tmp/g136-scheck.txt (the batch's ONE run).

## Her receipts — re-derived on my instruments

- **The concentric anchor, digit-exact**: the radius-20 card's `radius="auto"` child
  computes **6px** (= max(0, 20 − 14)) and the explicit-4 sibling stays **4px** — her
  pair reproduces digit-for-digit on the served seats.
- **The five-track inline ruler, verbatim**: computed `grid-template-columns` = `[card-
  inline-start] 14px · [card-content-start] 50.4px · [card-fill] 793.6px · [card-content-
  end] 116px · [card-inline-end] 14px` — five named tracks, the auto rails at their
  content widths at this viewport (the NAMES are the invariant, her 14px edge insets
  reproduce).
- **The foot render-gate lives**: the playground's foot-zone switch toggles
  `[data-sep-foot]` and `[data-jx-card-foot]` 7→6→7 page-wide (the toggled card drops
  BOTH the separator and the band, then restores) — "the stamp is the truth" re-driven.

## The fresh axis — the rail is functional, not just present

A rebuilt rail can dead-end; this one navigates. Clicking the rail's "Foot flexibility"
entry lands `#foot-flexibility` at the viewport top — and every rail id resolves against
a real section (the 8/8 census above). The page's conversion from no-rail to railed is
complete at both layers: the data (+page.ts) and the behavior (anchor navigation).

## Standard battery

- **LAW #19: 72 ids, zero duplicates**; h1 ×1; LAW #18: no repeated-row each; T94 clean
  (her receipts, consistent with the T121 audit's card-clean classification).
- Gates: verify:docs **rc=0** · ONE saved svelte-check (page 0 / family 0 — the
  consolidation closed the batch's whole typing debt; receipts above).
- Probe-fault ownership: my foot census counts page-WIDE data attributes (7 cards with
  feet), so the toggle reads ±1 rather than 0↔1 — the delta IS the toggled card; the
  concentric locator keyed the inline `--jx-radius-effective: 20px` stamp directly.
- Artifacts: /tmp/g136-{card,hdd}.mjs + /tmp/g136-{build,docs,scheck,preview}.log.

## Open questions

None new. The page is Tier-2 complete: railed, typed clean, and its headline physics
(concentric, ruler, foot-gate) reproduce digit-for-digit.
