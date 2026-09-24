# T115 — SECOND REVIEW scaffold-float.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 96 1st-review report opened FIRST;
  landed items verified at byte + DOM layers; headline receipts re-derived; fresh axes.
  NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/scaffold-float.html/` over the
  scaffold-float family + website-scaffold's contract, served live on :5242, dist @ HEAD.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 0 NIT.** **Tier ruling: Tier 1** (per
  dispatch and her proposal — the concept/law page's structural receipts all
  re-derived). Her two MINORs and LOW verified landed; my LOW is a drift observation on
  the fleet's rail coordinates — the lane LAW intact, the cited digits moved.

## Her findings — all three landed

1. **MINOR 1 (contract-type import broken) — FIXED and MIRRORED.** Both trees
   (apps/www/src/lib/ui/scaffold-float/scaffold-float.svelte:53 ==
   registry/files/ui/scaffold-float/scaffold-float.svelte:53) now read
   `import type { TopLayerArea, TopLayerApi } from
   '../website-scaffold/website-scaffold.svelte'` — her fix direction verbatim; the
   registry twin byte-matches.
2. **MINOR 2 (page cx overload :61:28) — CLOSED.** svelte-check page-scoped: **0
   diagnostics** (the cx wave covered the page).
3. **LOW 3 (api table undercounts — `pos` missing) — LANDED, fuller than her ask.** The
   served api table renders THREE props: children, area, and **pos** — typed as the
   nine slot names (left-top … right-bottom), default 'right-bottom', with the
   Owner-R3 date and the `data-float-pos` carrier named; the summary reads "a children
   snippet, the semantic role, and the **nine-slot position**". Her "one row + one
   word" ask, exceeded.

## The W-next #21 lane map — re-measured (the dispatch's digit-exact assertion, adjusted)

- **Sections-nav: digit-exact** — nav.jx-dsn "docs sections" at **x0 y74, w256 h826**.
- **ToC rail frame: digit-exact** — div.jx-toc at **x1200 y74, 240×222**.
- **The rail's inner nav: y94 h196 exact; x/w DRIFTED** — measured **x1220 w212** vs
  her receipt x1231 w190 (see LOW 1).
- **Non-overlap + hit-test: hold** — 0+256 ≤ 1220 (noOverlap true);
  elementFromPoint at the rail's center hits rail content (hitInside true).
- **Float slot empty by design** — .jx-float-slot children ×0; and my fresh census:
  **zero `[data-jx-float-content]` nodes live** (not just SSR) — the scaffold's own
  rail reaches the top layer as scaffold-native chrome (rail ← .jx-chrome-slot ←
  .jx-top-layer, ancestry receipted), NOT through the component's portal path. The
  two-slots-never-mix law receipts at the served layer precisely because the
  component's adoption channel is empty while the top layer is populated.

## The immersive ride — re-derived as a constant-delta law

Real scroller (.jx-shell-body) triad: rest (headerY 0, railY 74) → scrolled
(headerY −62, railY 12 at scrollTop 384 — the page's max scroll clamped under 400) →
restored (0 / 74). Her form (0→−74.7 / 74→0) and mine agree on the law and improve its
statement: **railY − headerY = 74 at every sample** — the rail rides the header as ONE
transform on the shared top layer, exactly the "by construction" claim.

## LOW 1 — the fleet's rail coordinates drift with the scaffold chrome; cited digits went stale

Her x1231/w190 and the standing "x1231–1421" prose (also cited in float-button.html's
lane-teaching, "(measured)") now measure **x1220–1432, w212** — I verified the drift is
fleet-wide by re-measuring float-button.html's rail: the SAME x1220/w212. The scaffold
chrome's rail box changed in some consolidation since her dist (28c6ebae); the lane LAW
(right side, y94 top alignment, non-overlap with the 256px nav) is intact and y94 is
digit-stable. Nothing on scaffold-float's own page cites digits — the stale digits live
in float-button.html's prose (a closed page, cited here for the record). Fix direction
for the next text pass: hedge the cited block with "(content-dependent; ~x1220–1432 at
the current chrome)" or re-measure at citation time. Scored LOW; the orchestrator owns
the wording seat.

## Fresh axes (beyond her report)

- The live-adoption census (above) — the empty portal channel as the law's receipt.
- The constant-delta ride form (above).
- The cross-page rail drift check (float-button same digits) — turns a would-be
  "scaffold-float drift" into a fleet-chrome observation.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 43da0d99, rebuilt this session) | **GREEN rc=0** (staged scope green) |
| verify:docs-universal | **GREEN 110/110 rc=0** |
| svelte-check page-scoped | **0 diagnostics** (her Finding 2 closed) |
| build @ HEAD | rc=0 (43da0d99 = 5318741b + the T110 consolidation — newer, as dispatched) |

## Process evidence

- Port **5242**: wrapper (/tmp/t115-wrapper.pid) + listener 76910; lsof-empty before
  (rc=1, 0 lines); after gates killed BOTH by PID; `lsof -nP -iTCP:5242 -sTCP:LISTEN`
  → **0 lines, rc=1 — port EMPTY after**. Sibling ports 5241/5243/5244/5230 untouched.
- NO commits, NO pushes. Scroll state restored in-probe (the triad restores itself).
- Probe faults owned: my first eyebrow/aside-style finder classes from prior lanes
  (here: none material — the ride needed the real scroller, her lesson applied
  pre-emptively).
- Artifacts: /tmp/t115/{probe-sf-sc.mjs,probe-addendum1.mjs,sf-sc.json,addendum1.json,
  gate-docs.log,gate-universal.log,scheck.log,lsof-after.txt,t115-port-before.txt}.

## Open questions

1. The rail-digits drift (my LOW): wording seat is float-button's prose + any future
   citations — orchestrator's call.
