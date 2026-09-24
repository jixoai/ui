# TASK 57 — RE-VERIFY prototype-waterfall (marginalia, 2026-09-23)

- **Reviewer**: marginalia (re-verifying MY OWN task-55 NEEDS-WORK against the fix at
  `5494dcab`; the fix diff is the review surface — all three of my named seats addressed).
- **VERDICT: PASS — the page closes.** All three fix seats verified served and live; the
  standing TRUEs spot-check clean; gates green.

## The three fix seats — verified

1. **THE BLOCKER (the missed query-panel seat) — FIXED AND SERVED.** The prose (:432-437)
   now teaches the corrected mechanism with the two-direction probe quoted: "the column
   floor does NOT follow that stamp: the §11 stamp is element-level, the '14rem' floor
   reads the DOCUMENT root (two-direction probe: stamp 18px → the 224px floor unchanged;
   document root 16→20px → 280px). … Resize across 48rem and watch the TYPE move while the
   tracks hold." — served ×1 (the invitation phrase wraps across two source lines; both
   halves census). **The SSR old-claim census — the instrument that caught the miss — now
   reads ZERO** ("re-scale with the stamp" / "re-scales REM-based" / "floors re-scale" /
   "settled within the frame": 0 hits; it was exactly 1 last pass).
2. **THE PREDICATE FIX — the mirror is live and TRUE.** `resolveRigUsage` now matches the
   real file name (`prototype-waterfall-usage.svelte`), and the drawer provably renders the
   live template: after driving the rig (columns → the "14rem" floor, gap → 30 — computed
   column-width 224px / column-gap 30px receipted on the container), the opened drawer reads
   **`<PrototypeWaterfall columns="14rem" gap={30} strategy="balanced">`** with the
   nine-cards comment — the usage file mirrors the picks, which makes the PlayHelp's
   "mirrors the live control state (same-source law)" sentence TRUE instead of aspirational.
   Both arms of my LOW closed by the one predicate fix, exactly as the commit claims.
3. **THE SETTLE RESIDUAL — TRUED.** The receipts paragraph (:413 area) now reads "the
   reflow settled **by the first animation frame (the same-task read is stale at Svelte's
   flush boundary)**; no JS reflow to wait for" — served ×1; and my quantification re-run
   reproduces the receipt form on the current tree: same-task gap read **24px (stale)**,
   next animation frame **30px (settled)**.

## Spot-checks (the standing TRUEs, sampled — all hold)

- **The two-direction rem experiment**: the query specimen computes **224px** under the
  active 18px stamp (3 laid-out) and **280px** with the document root at 20px (2 laid-out) —
  digit-exact again; root restored after.
- **LAW #18**: **8 roots / 41 children** mounted — unchanged.
- **Warm-reload**: two fetches hash-identical (19b01178…); SSR duality clean; zero
  duplicate ids; h1 ×1.
- Zero undefined/null literals; the multicol caveats and the loop pills untouched by the
  fix (diff scope: 3 page sites only — resolver, receipts sentence, query prose).

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 2495 files) | **page 0 diagnostics**; 1 pre-existing scene error (the Object.entries overload class); fleet 1568/1028/606 with vellum's tabs.html contributing 3 log lines (sibling noise, receipted) |
| Raw SSR | old-claim census **0**; corrected-phrasing census 3/3 sites served; dups 0; h1 ×1 |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 10765 / pgid 10762) → vite killed by
  pgid TERM + stragglers -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** All live mutations (rig drives, root
  font-size, drawer toggles) restored in-probe.
- Instrument honesty: my first mirror probe drove the rig with manual native-setter events
  and the drive silently failed to land (state stayed initial) — switched to Playwright's
  protocol `selectOption`/`fill`, after which the same controls drove and the mirror
  receipted. The drawer capture in the failed pass rendered the live template at its
  INITIAL picks (`columns={3} gap={16}`) — which is itself mirror evidence (the static
  usage constant would have shown `columns="14rem"` with the ellipsis), but the tracked
  drive is the honest form and is what the report claims.
- Artifacts: /tmp/marginalia-57-probe{1,2}.mjs, /tmp/marginalia-57-ssr.html,
  /tmp/marginalia-57-{ambient,universal,scheck,dev}.log.
