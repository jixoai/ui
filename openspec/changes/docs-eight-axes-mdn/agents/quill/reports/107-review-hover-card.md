# T107d — SECOND REVIEW hover-card.html (quill)

**1st:** marginalia 103, PASS 0M/2m/2L/1N, Tier 2 (BOARD line 33). **2nd protocol:** her
report opened FIRST; all four landed items verified at served-DOM + source + mirror + dist
layers; headline clocks re-derived with my own instruments; fresh probe axis added.
Target: `apps/www/src/routes/docs/components/hover-card.html/` (legacy class, explicit-props
era) over the hover-card family.

## Verdict: PASS — page closes, Tier 2 confirmed (0 new findings)

## Landed items — verified at every layer

1. **MINOR 1 (served, not just claimed)**: the canvas demo card now carries a real link —
   the `@gaubee` trigger's card serves "the component index" (`<a href="/docs/components…">`
   inside the card, +page.svelte source + served DOM). **Focusable census: 7 popover
   panels, focusables > 0 on the served cards** (her 1st-review census was 0, 0, 0, 0, 0,
   0, 0). The teaching is now SERVED: the canvas description's "Click the link inside it"
   has a referent, and — the load-bearing half — **my real-keyboard walk reproduces the
   claimed sequence: Tab lands on the trigger (focus opens the card instantly), the NEXT
   Tab crosses focus INTO the card's link, and the card STAYS open** (the crossing-cancel
   path exercised live at the served layer; card held open past the 200ms grace window
   with focus inside).
2. **MINOR 2**: the api summary now reads "Eight named props plus the eight universal axes
   (**sixteen interface members**; the axes fold below per the convention)" (+page.svelte:173
   source; served #api section text matches) — the 16-count is trued.
3. **LOW 1 (cx clones) closed at the gate**: full fleet svelte-check — **page 0 diagnostics,
   ui/hover-card family 0 ERRORs** (her :56 page + :69 component twins are gone; 8 standing
   `state_referenced_locally` warns remain, the W3-D3 class).
4. **LOW 2 (the Node-guard) landed AND mirrored**: hover-card.svelte:215-217 —
   `const node = target instanceof Node ? target : null` guarding `inside()`; the two
   focusout handlers (:249, :283) pass `e.relatedTarget` through it. Registry ⇄ apps/www
   `cmp` **3/3 IDENTICAL**. **Dist bytes**: the guard signature (`instanceof Node ? … :
   null`) is present in the built immutable chunks (fresh dist, HEAD da166454 ≥ the
   8254dd5c dispatch floor).

## Her headline clocks — re-derived, concordant

- **openDelay ~300ms**: real-mouse open clock (8ms in-page poll) brackets **300ms**
  (my band 250–480 allowing dev jitter — hers measured 311–411 across three runs).
- **Escape closes globally**: real Escape closed the open card within 150ms (her +15ms
  event-log receipt; my granularity coarser, direction identical).

## FRESH AXIS — the state machine's reopen hygiene

Her battery never re-enters after an Escape. Sequence with the real mouse: hover open →
Escape closes → pointer leaves (grace elapses, card stays closed) → re-hover **reopens** on
the 300ms lane. No stuck-closed state after the global-close path — the machine's
tracking state survives Escape cleanly. (Instrument note: this axis needs REAL pointer
moves — synthetic `pointerenter` dispatches never arm the open timer; her own T103
lesson, re-learned, now receipted from the 2nd seat.)

## Gates (batch-shared runs, seat-receipted)

- svelte-check full fleet: hover-card.html + +page.ts **0 diagnostics**; ui/hover-card
  family **0 ERRORs** — both LOW items confirmed closed at the gate layer.
- verify:docs-universal GREEN 110/110; verify:docs sole red = toast skeleton order
  (scribe's in-flight T71 — seat-attributed, NOT adopted); hover-card clean.
- Fresh build exit 0 at HEAD da166454.

## Process

Port 5241 (batch seat). Probes /tmp/t107d-hover.mjs, t107d2-hover.mjs, t107d3-hover.mjs.
NO commits, NO product-tree edits. Probe faults owned (all mine, all fixed pre-verdict):
(1) I hovered then pressed Tab — hover is not focus, so Tab went to the skip-link; the
claimed sequence starts from FOCUS on the trigger (re-derived her claim faithfully by
tabbing TO the trigger first). (2) A stale-open panel poisoned my first clock (negative
deltas) — clean-close between legs. (3) Synthetic pointerenter never arms the open timer —
the real mouse is the only valid driver for this family's clocks (concordant with her
"real mouse/keys" instrument note).
