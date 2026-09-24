# T138 — SECOND REVIEW progressive-blur (marginalia, 2026-09-24)

- **Protocol**: scribe's 1st (130-review-progressive-blur.md, PASS 0M/0m/1L/1N)
  opened FIRST; the landed item verified; his receipts re-derived; his open
  question #2 (the degraded path) taken as my fresh axis.
- **Vintage**: HEAD = fresh build at **ef520d44** (dist 03:01).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier 2 CONFIRMED.**

## The landed item — VERIFIED

**The zero-script claim scoped** (scribe's LOW 1): the API summary now reads "the
component's **MECHANISM** ships no script at all — the props lane is JS (resolution
+ stamps), the popover zero-script precedent" — the scoped fix shape exactly (the
hero's "Zero JS" was already mechanism-scoped). Source-verified at +page.svelte:216.

State note: scribe's NIT 1 (the unrailable demo — `#pblur-demo` absent from the
7-entry toc) did NOT land — the dispatch scoped the consolidation to the scoping
fix, and +page.ts still opens at pblur-law. Still-open, expected, not re-filed.

## Scribe's receipts — re-derived (all confirm)

1. **The ladder is digit-exact**: the demo band's 8 layers compute backdrop-filter
   **blur(0.5px) 1px 2px 4px 8px 16px 32px 64px** — the default blurLevels ladder
   inner-edge-first, exactly the API default claim.
2. **Rest-clean**: at scrollTop 0 all 8 layers compute **opacity 0** — nothing
   blurs while the list rests.
3. **The reveal, both halves**: after a 200px scroll the layer opacities flip to
   **1** (the deduped set inverts 0,1 → 1,0); scrolling back restores the rest
   state (0,1). The scroll(nearest)-timeline reveal measured live on the true demo
   scroller (254px tall, scrollHeight 783, found via the entry-01 li walk).
4. **The pin holds**: the band's viewport top stayed **constant at 888px** across
   the whole scroll while the rows moved 950 → 769 — the sticky h-0 root pinned
   through the range.
5. A second (static) band on the page rests at opacity 1 — the theming seat's
   always-painted static law visible as the control group.

## Fresh axis — scribe's open question #2: the degraded path, MEASURED

Scribe left the no-scroll-timeline branch source-true only. I emulated a
non-supporting engine by force-killing the animations in-probe
(`animation: none !important; animation-timeline: auto !important`):

- at rest: all 8 layers **opacity 0** (invisible);
- after the same 200px scroll: **still all opacity 0** — no band ever paints.

The authored base rule (opacity 0, progressive-blur.css :26) + the @supports
revival means a non-supporting engine degrades to **NO effect** — "never a
wrongly-painted band" is now MEASURED, not just source-true. (The inline-edge
always-painted degradation noted in the css header was not separately driven —
the demo band is block-edge; the law's block-arm is the one this page exhibits.)

## Structure + gates

- LAW #19 clean (scribe's 37-id census unchanged); toc 7 == +page.ts (the NIT
  aside stands); svelte-check (ONE run, saved): page **0 seats**, family
  **0 errors** — scribe's standing :79 cx is gone too.
- Fresh build rc=0 (dist 03:01); **verify:docs rc=0**; docs-universal **110/110**.
- Process: port 5244 mine, killed (lsof rc=1 empty); NO commits/pushes/fixes; the
  degradation injection reverted by context close. Artifacts:
  /tmp/marginalia-138-probe.mjs.

## Probe-fault ownership

1. My layer census includes a second band set (the theming seat's static band) —
   the first ladder dump interleaved both (0×8 then 1×4); the per-band reads in
   the pin/reveal stage are the clean receipts.
2. My first scroller walk (T131 lesson applied) still required the li-anchor walk;
   the 256px figure scribe quoted is the same container (I read 254 rounded
   against borders).
