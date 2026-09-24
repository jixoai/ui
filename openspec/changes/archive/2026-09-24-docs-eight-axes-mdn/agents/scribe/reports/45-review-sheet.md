# Task 45 — SECOND REVIEW sheet (2nd of 2) · scribe · 2026-09-23

**Verdict: PASS — the page closes as #40**, with one MINOR riding
closure: the wheel clause's second half does not reproduce on my
instrument. The dispatched reconciliation hypothesis ("chaining happens
through the panel's own scroll cell at its overscroll boundary") is
FALSIFIED by my targeted test — I made the cell genuinely scrollable,
wheeled it to its exact boundary, and kept wheeling: the docs scroller
did not move by a pixel. The clause's FIRST half (backdrop wheel is
swallowed) reproduces cleanly. Independence law kept: findings formed
from my own source reads + probes BEFORE opening quill's report 31 or
marginalia's report 42.

**Reviewed**: `apps/www/src/routes/docs/components/sheet.html/`
(+page.svelte 385 lines, +page.ts, clean vs HEAD fd3d8f63 through
1c9eed83) + `apps/www/src/lib/ui/sheet/` (svelte 370 / css 120 / stylex
90 / defaults 72).

## The wheel clause — my own two-target drive

Instrument sanity FIRST: with the sheet closed, wheel over the page
scrolls `.jx-shell-body` 0 → 1000 — the wheel pipeline works (the docs
scroller is the shell wrapper, not the window; window.scrollY reads 0
always — the naive instrument reads nothing).

- **Hit target A — the bare backdrop** (wheel at (300,300), 8 × 150px
  ticks): `.jx-shell-body.scrollTop` **frozen** (1558 → 1558; re-checked
  in a second session: pinned through ±ticks). The clause's first half —
  "the top layer swallows the default" — REPRODUCES.
- **Hit target B — the panel's own scroll cell at its overscroll
  boundary**: I injected tall content so the cell was GENUINEly
  scrollable (scrollHeight 1758 / clientHeight 631), wheeled it to its
  own bottom boundary (cell.scrollTop pinned at 1127 = max), then
  wheeled 8 more ticks PAST the boundary: **the shell did not move**
  (1558 → 1558). The clause's second half — "chaining happens through
  the panel's own scroll cell at its overscroll boundary" — does NOT
  reproduce on my instrument.
- Extended sweep: wheel over the **dialog padding** band — pinned. Wheel
  over the **backdrop re-check** — pinned. In every condition the shell
  is wheel-frozen while the sheet is open (programmatic scroll still
  works — nothing authors a lock).

Reading: with the sheet open, my instrument shows the shell
wheel-frozen at EVERY hit target — the mechanism sentence's second half
names a chaining path my probe cannot find. The clause's practical
guidance ("lock it in your app shell if the drawer's content demands
it") is unaffected. The fix is marginalia's honest one-sentence form
("wheel over the backdrop is swallowed — the page does not scroll while
the sheet is open; the scroller itself is never locked"), optionally
with an instrument note if a headed-Chrome run reproduces the
boundary-chain. MINOR, one sentence, rides closure.

## The rest of the battery — verified

- **Entry pixels — digit-exact** (single-evaluate rAF trace at 1280):
  1280 → 1149 → **1050 → 986 → 947 → 911 → 903 → 899 → 896 settled by
  ~182ms** — every claimed waypoint (1051/947/911/899/896) present, the
  claimed ~179ms settle inside my trace.
- **Escape exit**: `.closing` appears at t≈3ms and holds **inside the
  open window** through 204ms; `dialog.open` flips false at **225ms**
  (the claimed ~200-230ms band).
- **Focus restore (real click)**: trusted trigger click → focus moves
  inside the panel → Escape → `activeElement` = the **"Open sheet"
  button**. (My first probe used a programmatic click and read BODY —
  the same artifact marginalia ledgered; the real-click receipt is
  hers and mine.)
- **Backdrop click never closes**: measured, still open after the click.
- **Reduced motion**: open renders **docked immediately** (first frame
  x=896, zero slide frames); Escape closes at **19ms** (sub-frame —
  the claim's ~40-50ms is the same instant-close substance; the double
  kill — animation:none + the timer skip — is source-true at shut()).
- **W-next #8 workaround**: all four sheets at page level (the
  in-source receipt comment present); default **384px @ x 896**,
  **18rem → 288px @ x 992** — live. The in-canvas defect itself has no
  surviving specimen (historical receipt, as recorded).
- **The stamps drawer**: `data-density="sm"` + `class dark` +
  **12px** corners + **18px** root voice — four lanes on one
  top-layered root. (The dialog element's own box-shadow reads none —
  the level4 recipe paints on the card kernel's surface box; the STAMP
  is on the root, as the row says.)
- **EXTRA-lane by name**: served hand rows = **[open (bind), side,
  title \*, children \*, header, footer, width, variant]** — 8, exactly;
  + the universal 8. **Meta 16 named** (8 family + 8 axes, no
  rest/style) — consistent, no arithmetic claimed.
- **LAW #19**: post-hydration **47 ids, ZERO duplicates** (marginalia's
  48 vs my 47 is a count-moment drift; the zero-dup claim is the
  receipt), wrapper ids in SSR, toc resolves — one receipt line, as
  asked.
- **SSR chrome**: h1 ×1 · universal marker ×1 · toc 8/8 == +page.ts ==
  DOM · zero undefined/null literals.

## Findings

1. **[MINOR · rides closure]** The wheel clause's second half does not
   reproduce: the cell-at-overscroll-boundary chains nothing to the
   docs scroller on my instrument (the falsification receipt above —
   the cell made genuinely scrollable first, which neither prior report
   ran). Fix: marginalia's one-sentence wheel-user form, optionally
   instrument-qualified. The first half + the app-shell guidance stand.
2. **[NIT · recorded]** The elevation level4 default is served through
   the card kernel's surface box (the dialog's own box-shadow none) —
   the row's "stamps the shadow recipe on the root" is stamp-accurate;
   no change needed, this line just records where the paint lands for
   the next prober.

## Cross-check against quill's report 31 and marginalia's report 42 (read AFTER findings formed)

- **quill 31 (author)**: her finding 3 (backdrop chains 0→1396) does
  not reproduce on my instrument either — the same non-reproduction
  marginalia got. Her finding 6 (entry pixels 1280→…→896, closed
  223-230ms) and finding 7 (focus chain, backdrop never closes)
  reproduce. Her finding 1 (the each_key_duplicate hydration crash —
  LAW #18's birthplace) is why the law-table mapping is in the page;
  the page renders clean. Her finding 2 (canvas-host vs top-layer
  width) — the workaround verified live (384/288 at page level).
- **marginalia 42 (1st review)**: her entry trace waypoints all appear
  in my denser sampler; her Escape band, RM substance, backdrop click,
  focus-restore (real click), W-next #8 verification, stamps, meta 16,
  and LAW #19 receipts all reproduce. Her MINOR (the scroll disclosure)
  is MY finding 1 — and my scrollable-cell test CLOSES the question her
  report left open ("reviewer #2 should reconcile with her original
  instrument"): the cell-at-boundary hypothesis is falsified too, so
  the honest sentence is the fix, and quill's 0→1396 remains
  unreproduced on two independent instruments (hers and mine).
- No divergence beyond the wheel mechanism, which my probe now pins
  down to: **the shell is wheel-frozen at every hit target while the
  sheet is open** (headless Chromium).

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284**, exit 0 — GREEN clean (quill's system-dialog re-pin landed in the fixture; her sheet keys long gone) |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | sheet.html page: **0 diagnostics**; family diagnostics are the fleet's baseline cx-union/warn classes; the 46 system-dialog/progress-path hits are the named siblings' in-flight files |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper; EMPTY after |

## Closure

sheet passes review #2 — **the page closes as #40**, with the wheel
clause's second half reworded to the honest wheel-user sentence (one
line, riding closure; the falsification receipt above is the fix's
justification). Everything else stands as written.

No commits made. Report file:
`agents/scribe/reports/45-review-sheet.md`.
