# TASK 122 — SECOND REVIEW grid (marginalia, 2026-09-24 — REASSIGNED 2nd)

- **Reviewer**: marginalia — reviewing **MY OWN 1st** (task 111, NEEDS-WORK
  1M/1m/1L, consolidated at 97f5b6cc). The special shape: re-verified my own findings'
  landed state with fresh instruments; my 1st digits re-derived, not trusted; drift
  between the two reads owned below. Owner = scribe; vellum stays preserved in the
  record as the dispatched 2nd (both loaded — the orchestrator reassigned).
- **Target**: `apps/www/src/routes/docs/components/grid.html/` (+page.svelte 263,
  +page.ts 16) over the grid family (grid.svelte 176 / grid.stylex.ts 65 /
  grid-defaults 40 / index 5).
- **Vintage**: HEAD = **5a9bb37f**; dist mtime 01:14 = the consolidation minute and the
  dist CSS carries the landed fix atoms (x2lwn1j/xb3r6kr in
  `dist/_app/immutable/assets/0.MFf615MY.css`) — **the existing dist IS the 5a9bb37f
  vintage; no rebuild performed** because quill (5241) was actively serving
  `vite preview` off the shared dist at gate time. Gates run against the aligned
  vintage.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 1 NIT. Tier 2 CONFIRMED** (as
  proposed by my own 1st).

## The three landed items — all VERIFIED

1. **The MAJOR (the disclosure demo) — the fix landed and the demo now discloses.**
   Source: the lane content carries `rt.minH0, rt.overflowHidden` (+page.svelte:209);
   the atoms resolve to computed `min-height: 0px` / `overflow: hidden` on the live div,
   whose class list carries both fix atoms (x2lwn1j + xb3r6kr). **The 3-state
   re-measure on real button toggles: gridTemplateRows collapsed "34px" → open "106px"
   → re-collapsed "34px"** — my 1st read 70px FLAT in all three (the lane never moved);
   the track now travels 72px between states. The content is honestly clipped:
   scrollHeight 104 vs client 34 collapsed (the text hides; only box chrome remains).
   The 34px residue decomposes EXACTLY: 16px padT + 16px padB + 1px borT + 1px borB +
   0 margins — the canonical recipe (min-h-0/overflow-hidden) suppresses the CONTENT
   floor completely; the residue is the lane's own padding/border box, which no
   min-height can remove. The 0fr track's fr contribution is genuinely zero. The
   component-wrap option stays on the Owner's lull ledger per dispatch — not re-filed.
2. **The toc rebuild — VERIFIED at data + DOM layers.** +page.ts carries 7 entries —
   usage → grid-workbench ("Blowout-proof tracks") → disclosure → accessibility →
   theming → universal-props → api; **the dead #tracks anchor is gone** (no #tracks in
   the toc, none in the DOM). Served rail census: exactly those 7 hrefs, labels
   matching, **all 7 targets exist**; rail order == DOM section order exactly
   (`domOrder` == rail). My 1st's MINOR (dead anchor + unrail-ed workbench + drift) is
   fully closed.
3. **The cx seats — CLOSED and mirrored.** Page cx (+page.svelte:91-103) and component
   cx (grid.svelte:105-117) both carry the `style ?? {}` narrowing guard; the saved
   svelte-check run shows **0 seats on grid.html and 0 Errors in the family** — my
   1st's two ERROR seats (page :99:28, component :113:28) are gone. Family remainder:
   8 state_referenced_locally WARNs at grid.svelte :99 (the provideUniversalLanes
   fleet noise class — same as toast-viewport :207; counted separately per standing
   rule). **Registry twins byte-checked: all 4 files cmp-identical.**

## The page teaches the min-h-0 requirement — VERIFIED (three seats)

Section summary (:198): "the content keeps min-height: 0 / overflow: hidden"; the usage
snippet (:84): the canvas demo code shows `min-h-0 overflow-hidden` on the lane div;
and the lane's own live copy (:212-214) teaches the failure mode: "without them the
content's own minimum floors the 0fr track and the collapse never closes". The atoms
themselves are unchanged-correct (grid.stylex.ts :37-38: plain `0fr`/`1fr` — no floor
in the component; the fix is exactly where my 1st prescribed, the page side).

## Fresh axis — the blowout-proof tracks under RESIZE: VERIFIED

The workbench grid (the long-identifier cell present) measured across four viewport
widths and three cols swaps, all through real re-layout:

| state | tracks (px) | spread |
|---|---|---|
| 1280 / cols=3 | 218, 218, 218 | 0 |
| 1600 / cols=3 | 325, 325, 325 | 0 |
| 1100 / cols=3 | 243, 243, 243 | 0 |
| 900 / cols=3 | 182, 182, 182 | 0 |
| 1280 / cols=6 | 105 × 6 | 0 |
| 1280 / cols=12 | 49 × 12 | 0 |
| 1280 / cols=3 again | 218, 218, 218 | 0 |

gap 8px constant through every swap; the long-identifier cell never exceeds its
siblings at any width. The repeat(N, minmax(0, 1fr)) law holds through re-layout —
my 1st's fixed-width receipt now extends across the resize dimension.

## Findings

1. **[NIT — the exhibit snaps; the copy's motion language slightly oversells.]** The
   toggle transitions the track **instantaneously** — transition sampling at 40ms
   caught exactly two distinct values ["34px", "106px"], no intermediates: the grid
   ships `transition: all` at 0s (no duration anywhere in the family), and the demo
   supplies none. The section summary says "Grid **can** animate…" (capability, true —
   grid-template-rows is interpolable once a consumer adds a transition) and honestly
   hedges the Chrome clock-freeze; but the lane's own line "the track IS the
   animation" reads stronger than the exhibit: a reader expecting visible tweening
   sees a snap. One clause fixes it — either supply
   `transition: grid-template-rows 300ms` in the demo snippet (making the exhibit
   show the tween the section promises), or soften the lane line to name the
   consumer's transition as the motion half. Same basket, second clause: "between
   zero and full" is true of the TRACK's fr contribution; the visual floor of a
   padded lane is its own padding+border box (34px here) — one parenthetical would
   spare the next prober the decomposition. New information only; the mechanism fix
   is complete; no regression of anything landed.
2. **[NONE]** — no MAJOR, no MINOR, no LOW. All three of my 1st's findings are closed.

## Drift ledger (my 1st reads vs now)

- Collapsed lane height: **70px (1st) → 34px (now)** — different numbers, both
  correct: the lane copy grew (the teaching sentence was added, scrollHeight 70 →
  104) and the floor changed NATURE — the 1st's 70px was the CONTENT floor (unclipped
  text); the 34px is the box residue with content clipped. The 1st's MAJOR failure
  mode (flat, never moves) is gone: 34 → 106 → 34.
- Everything else re-derived identical (track equality, gap rung, toc census now
  7/7 clean, twins cmp-identical).

## Tier proposal

**Tier 2 CONFIRMED** — the page is archetype-complete with its one MAJOR fixed
exactly as prescribed; the second review converges at one precision NIT. No re-tier.

## Probe-fault ownership

1. **My first probe script had a syntax-logic bug** (`...readWorkbench() && (await
   readWorkbench())` — spreading a Promise conjunction); self-caught on re-read before
   running; fixed to a plain await-then-spread. No data consequence.
2. **The transition sampler's clearInterval ran against the wrong handle** (the
   interval self-terminates at 40 samples; my cleanup referenced window.__iv which was
   never set) — harmless: the self-cap ended sampling before cleanup. The distinct-
   value receipt is from real samples.
3. **BootSplash settle carried over from T119** (fonts.ready + 9s) — no click
   interception occurred this time; the lesson transferred clean.

## Gate record

- **verify:docs rc=0** — "all docs pages pass the skeleton lint (staged scope green)"
  against the 5a9bb37f-vintage dist (see Vintage note: no rebuild, quill's preview
  protected; the dist provably carries the landed fix atoms).
- **verify:docs-universal rc=0 — 110/110.**
- **svelte-check: ONE run** (Owner's new rule, 2026-09-24) — saved to
  /tmp/marginalia-122-sc.log and grep-scoped: grid.html **0 seats**; grid family
  **0 Errors** (8 fleet-noise WARNs at grid.svelte :99, counted separately). Fleet
  backdrop: 1482 errors / 1028 warnings / 566 files.

## Process evidence

- Port **5244** mine: lsof empty before (rc=1); dev server started from apps/www
  (wrapper 55527, listener 55573); **killed BOTH by PID**; final
  `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1**. No orphans. Sibling ports
  untouched: quill 5241 (preview — the reason for no rebuild), vellum 5242 (not
  listening this window), scribe 5243 (source-read, no server), 5230 Owner's,
  5245 empty as dispatched (also noted: an unrelated python3 server on 5246 — not
  mine, not touched, flagged for hygiene only).
- **NO commits, NO pushes; zero product-tree edits.** All probe mutation in disposable
  browser contexts (toggles, a viewport resize cycle, select swaps).
- Independence: scribe (the owner) not consulted; my own 1st report re-read first per
  protocol and treated as claims.
- Artifacts: /tmp/marginalia-122-probe.mjs (3-state + toc + resize),
  /tmp/marginalia-122-probe2.mjs (34px decomposition + transition sampling),
  /tmp/marginalia-122-{docs,univ,sc,dev}.log, /tmp/marginalia-122-wrapper.txt.
