# TASK 130 — progressive-blur (docs page) — 1st eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT — Tier 2 proposed.**
Owner = marginalia; independent 1st audit. Dist = 2b06c0d5 (fresh build rc=0). Port 5243
mine; killed after probes, lsof post rc=1 (sibling listeners on 5241/5244 verified by pid
and untouched).

## Delivery-shape taxonomy: SCENERY (aria-hidden, pointer-events-none, zero own paint)

The band is decoration over a host scroller: a sticky h-0 root carrying the masked
backdrop-filter ladder. The page teaches three mechanism claims — the PIN, the LADDER, the
REVEAL — all live-falsifiable, all measured here.

## Findings

**LOW 1 — "the component ships no script at all" overstates (the popover zero-script
precedent).** The API summary's phrase is falsifiable by a view-source check: the
component DOES ship a script lane (props/default resolution — blurLevels fallback, the
position/pin dialect narrowing, the compiled component class runs at hydration). The HERO
scopes correctly ("Zero JS" = the mechanism: the pin is sticky CSS, the reveal is the
scroll timeline — both verified with no runtime listeners), but the API summary states an
unscoped absolute. Fix shape (marginalia's own popover-MAJOR-2 remedy): scope the phrase —
"zero runtime listeners: the pin is pure CSS and the reveal rides the scroll timeline".

**NIT 1 — the live demo is unrailable**: the toc ships 7 entries and omits `#pblur-demo`
(the page's headline seat — the docs-rail composition). Every sibling section is railed;
prose rails its demo canvases (knobs/family), toast rails live-demo. One +page.ts entry
("the rail law") completes it.

## Verified-true (receipts against my armed suspicions)

- **The ladder is digit-exact**: the demo band decomposes into **8 layers** whose computed
  backdrop-filters read `blur(0.5px) 1px 2px 4px 8px 16px 32px 64px` — the default
  blurLevels ladder inner-edge-first, exactly the TokenTable/API claim.
- **Resting clean → scroll-painted (the reveal, both halves measured on the true demo
  scroller, 256px tall)**: at scrollTop 0 every layer computes **opacity 0.00** — nothing
  blurs while the list rests; after a 200px scroll every layer computes **opacity 1.00**
  — the scroll(nearest) timeline over --jx-pblur-ramp faded the ladder in. The engine
  gate is open here (CSS.supports animation-timeline: scroll() TRUE), so the degraded
  branch is source-true only (the @supports block in progressive-blur.css).
- **The pin holds**: the band root's viewport top stayed **constant (868px) across the
  whole 200px scroll** while the list rows moved underneath (row top 950→750) — the
  sticky h-0 root pinned to the scrollport edge through the range, exactly the
  "absolutely positioned overlays scroll away — probed" contrast.
- **The scenery contract**: band `aria-hidden="true"`, computed pointer-events none, and
  behaviorally hit-tested — elementFromPoint over the band's area returns the pinned
  head's text, never the band.
- Structure: LAW #19 clean (37 ids, zero duplicates); toc 7 == its own +page.ts (the NIT
  aside); h1 ×1; the a11y table's `keys={[]}` is honest (pure scenery — nothing focusable).
- **The scroll-run connection holds**: the family lane's only diagnostic is the standing
  cx overload (:79) — the :232/:241 narrowing fix (22e0d1b3) held; no new family info.

## Standard battery + gates

- SSR 200 (379,138 bytes) · verify:docs **rc=0** · docs-universal **110/110** · ONE saved
  svelte-check (the receipts above).
- Probe-fault ownership: three instrument passes were mine, not the page's — (1) my first
  "scroller" (computed overflow:auto, 100–400px tall) was a non-scrolling wrapper
  (scrollTo no-op'd, scrollTop stayed 0); (2) the second pass found a true scroller that
  was the WRONG one (no band inside); (3) the receipt came from anchoring on the demo's
  own `li` ("entry-01") and walking up to its real overflow container. The theming
  section's prScroll40 seat exists as a second instrument target I did not separately
  measure.
- Artifacts: /tmp/g130-{pl,pb-prose,final,final2}.mjs + /tmp/g130-*.log (batch-shared).

## Open questions for the code round

1. The archetype gaps (no overview/see-also; the types section is the strongest teaching
   surface — the six dialect panels — and could seed the axes table's shape row).
2. The degraded path (no scroll-timeline engines): source-true only here; if the Owner
   wants it live-true, an emulated @supports-off pass (a stylesheet toggle killing the
   animation-timeline) would prove the "never a wrongly-painted band" half.
