# Task 34 — REVIEW number-input (2nd of 2) · scribe · 2026-09-23

**Verdict: PASS.** Zero MAJOR on any dispatched claim. marginalia's two
MINORs are CONFIRMED with sharper receipts (her meta count is right — my
first recount agreed with the page and was wrong; corrected below), her
LOW is confirmed with a preferred fix, her chrome adjudication is
concurred with the exact svelte-check error reproduced. **One NEW
finding she did not have**: the theme row's "cell ink likewise [frozen]"
clause is FALSE as served, and the consequence is user-visible — the
dark field's value renders **white-on-white (contrast 1:1, invisible)**,
the frozen-ink seam's fourth instance and the first with a hard
legibility failure. Independence law kept: findings formed from my own
source reads + probes BEFORE opening her report 36.

**Reviewed**: `apps/www/src/routes/docs/components/number-input.html/`
(+page.svelte 534 lines) + `apps/www/src/lib/ui/number-input/` (347+40+90
+ css) + `apps/www/src/lib/meta/number-input.meta.ts` (227). The
number-input page + family files carry ZERO working-tree changes vs HEAD
36abc6b2 (the in-flight edits marginalia measured — the css carve-out and
page prose — are committed at c4fdd555/df90a035 lineage; the css carve-out
is IN the committed file I read).

## The claims, re-derived

### 1. Ladder digit-exact + hold clock — VERIFIED-TRUE

DensityDemo scopes 2xs…lg, live boxes (scope wrappers carry
data-density; the field's own attr stays null — ambient):

```
2xs 24×24 / 10px · xs 28×28 / 11px · sm 32×32 / 12px
default 40×40 / 13px · lg 48×48 / 15px
```

All five rungs × (hit, voice) digit-exact; **2xs lands exactly 24px**
(the WCAG 2.5.8 floor) live. Hold clock with real pointers (16ms
sampler): immediate first step (sampled 104ms — sampler latency over the
synchronous pointerdown step), **plateau** — one step in ~380ms (the
authored 300ms HOLD_DELAY), steady-state deltas 112/94/99/95/111/95/100/94
ms (**≈99ms**, the authored 100ms HOLD_REPEAT), release at a body
coordinate 400/300px OFF the button ends the run (window-level
pointerup), value frozen across a 350ms wait — **orphanStep: false**.

### 2. Theme split SETTLED — VERIFIED-TRUE (transitionDuration first)

transitionDuration **0.15s** read first; reads at ≥400ms settle. Dark
field vs light baseline:

- RE-DERIVING: well ink rgba(0,0,0,.12) → **rgba(255,255,255,.12)**;
  --background 1 0 0 → **0 0 0**; --muted 0.9551 → **0.2178** (real
  hover on the stepper confirms the pose paint); --ring re-derives with
  the dark drift calc — my read **oklch(0.7044 0.1872 calc(129 - 4))**,
  marginalia's **calc(75 - 4)**: identical L/C, identical −4° drift,
  different hue base — the brand-hue wall-clock law, vindicated again.
- FROZEN (stylex atoms): shell bg **oklch(1 0 0)** both voices; shell
  border oklch(0 0 0) both; stepper glyph ink black both.
- **BUT the cell ink is NOT frozen — see finding 3.**

### 3. The fixed family serving + the re-trued copy — VERIFIED-TRUE

Invalid specimen computes **border-style: dashed** + border-color
**oklch(0 0 0)** (var(--jx-destructive), token-correct black-in-light) —
the unlayered carve-out `.jx-num[data-jx-num-invalid]` in number-input.css
beats the atom tie by layering. The re-trued receipts paragraph teaches
exactly this (the atom-vs-atom cascade kill, "re-measured dashed here")
and is serve-true; the api error row describes the wiring
(aria-invalid + described-by), which was never broken.

### 4. Commit semantics — VERIFIED-TRUE (with the bounce isolated)

Real keyboard: "007"+Enter → display **"7"**; "99"+Enter → **16**
(clamped, and the PlayRange follows to 16); cleared+Enter at the
shared-binding demo seat → the chip reads **1** — the PlayRange bounce,
caught live. **Isolation proof**: the same clear+Enter at the RTL
specimen (bind:value, NO range attached) → display **"" and stable ""** —
the component's undefined commit is spec-true
(`onCommit: value = Number.isFinite(n) ? clamp(snap(n)) : undefined` +
display `value == null ? '' : String(value)`); the rebound-to-min is the
playground's shared-binding artifact, not a family defect. Concur with
marginalia's adjudication 4.

### 5. Standard chrome — VERIFIED-TRUE

h1 ×1 · universal marker ×1 (data-jx-props-table-universal) · toc **8/8**
served order==DOM (overview, live-demo, types, usage, theming, api,
universal-props, accessibility; install/see-also out) · served
data-chrome census **frame ×17, zero bare/prop specimens** · axes table 8
measured rows served.

### 6. Meta census — the summary over-counts (finding 1)

Raw meta keys: **24**, including three quoted duplicate keys
('data-density', 'aria-invalid', 'aria-describedby') → **20 distinct
named props + rest = 21 entries**. The summary's "22 entries (21 named
props + the synthesized rest)" is one over on both numbers. My first
recount said 21 named (summary-consistent) — WRONG; marginalia's
brace-count (20 named + rest) is the correct census. The fold half:
served hand table = **[value, min, max, step, label, error, disabled] =
7 rows**; density folds into the universal 8 and its served text is the
GENERIC §4 fold text ("spacing/leading scale over the kernel channels
(§4)") — the family's ambient-scope vocabulary is not served anywhere in
the api section.

## Findings

1. **[MINOR · CONFIRMED — rides closure]** The api summary drifts from
   the served shape twice: "22 entries (21 named props…)" vs actual
   **21 (20 named + rest)**, and "the hand table serves the 8 consumer
   rows — density's row text is the family's ambient-scope vocabulary"
   vs served **7** with density's row being the GENERIC §4 fold text.
   Same fold-mechanics class as menubar's just-closed item (a); the fix
   is the two count/shape sentences (or docs curation to restore
   density's family text through the fold, if a seat exists).
2. **[MINOR · CONFIRMED, mirror sharpened — rides closure]** Stale family
   comments ship through the same-source drawer: :7 "28px-wide stepper
   buttons" (the ladder makes them 24–48px full-hit squares) and
   :103/:114 "CONSUMED by the family" on size/color (the page's measured
   truth is supply-only, zero channel readers; the parentheticals
   describe the §1 guard). **The registry copy
   `registry/files/ui/number-input/number-input.svelte` is byte-IDENTICAL
   today** (diff -q) — a $lib-only comment fix would CREATE the
   divergence, so the fix must land mirrored in the same change (drift
   #11's "with the registry mirror this time"). The duplicated density
   doc comment (:97-98) rides the same comment pass.
3. **[NEW — MINOR on the page, MAJOR-cost seam beneath]** The theme
   row's FROZEN clause says "the shell border and cell ink likewise
   [stayed frozen]" — **FALSE as served**: the cell atom carries NO
   color (the ink rides the standard `.jx-html-control-lane`), so the
   cell ink RE-DERIVES under .dark: measured oklch(0 0 0) light →
   **oklch(1 0 0) dark** on the frozen white shell — **white ink on
   white paint, contrast 1:1; the value "3" is INVISIBLE in the dark
   field** (screenshot receipt; the input's value confirmed in DOM).
   The steppers' glyph ink IS frozen black (the atom's
   tokens['--jx-foreground']) — the page author likely generalized from
   the steppers to the cell. Page fix now: correct the clause (cell ink
   re-derives via the standard lane) and disclose the dark cost. Family
   fix: freeze the lane ink or scope the shell atoms — **this is the
   frozen-ink seam's fourth instance** (progress's was the third, W-next
   #7) and the first with a hard legibility failure; attach this
   receipt to W-next #7.
4. **[LOW · CONFIRMED — fix direction offered]** The fourth universal
   specimen is labeled "dense" but carries `density="large"` — identical
   to the labeled "large" specimen beside it (the demo grid teaches a
   falsehood). Preferred fix: re-rung to `density="sm"` (32px) so the
   grid gains a new ladder point and the label becomes honest; a pure
   relabel is the minimal alternative.
5. **[INFO · CONCUR]** The chrome triangle: the meta carries a chrome
   entry (`"chrome": {"kind": "opaque"}`, meta.ts :98-101), Props has no
   chrome member, and the :169 destructure costs a live svelte-check
   error — reproduced verbatim: `Property 'chrome' does not exist on
   type 'Props'. (ts)`. Concur with the adjudication: chrome stays OUT
   of Props (the control-integration CONTEXT decides; a prop would
   create a second voice); family-side cleanup = drop/annotate the meta
   entry + type the destructure safely.

## Cross-check against marginalia's report 36 (read AFTER findings formed)

No factual divergence on any dispatched claim: her ladder digits, hold
clock, settled theme split, commit semantics + PlayRange adjudication,
invalid-shell receipt, chrome-ambient verification, and chrome census all
reproduce under my independent probes. Her meta count (21) is CORRECT —
my first recount briefly disagreed with her and then corrected itself in
her favor (20 named + rest). Three things I add: (a) the dark cell-ink
falsity + the invisible-value consequence (her split receipt stopped at
the shell atoms — the composite's ink half escaped); (b) the registry
mirror's byte-identical status (sharpens her finding 2's fix
requirement); (c) the preferred re-rung fix for her "dense" LOW. Her
ring hue cite (calc(75-4)) vs mine (calc(129-4)) is the wall-clock law
working as designed, not a divergence.

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| defaults-form-families + density-adoption-form-text solos | **32/32**, exit 0 |
| form-components solo | **30/30**, exit 0 |
| carved-action-band + date-picker-fragments solos | **39/39**, exit 0 |
| list-item-control-chrome solo | **6/6**, exit 0 |
| docs-ambient-vocabulary solo | **282/284** — the 2 failures are **sheet-keyed sibling noise, attributed** (below) |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | number-input.html page: **0 diagnostics**; the family's :169 chrome error IS finding 5's receipt; remaining family diagnostics are the fleet-wide cx conditional-atom typing class |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper; EMPTY after |

**The ambient attribution chain** (the 2 failures, `sheet table[0]
variant#1` + the bijection's `sheet|1|variant|1`): (1) zero
number-input keys in either failure; (2) neither HEAD commit after my
task-33 green run (8a25571b 08:22, 36abc6b2 08:27) touches sheet or the
matrix; (3) the working tree gained an UNCOMMITTED sheet rework
(`sheet.html` +282/−108, introducing `lawTable` — a table expression
ahead of the api table, shifting the pinned tableIndex 0 → 1);
(4) `git log -S lawTable` on the sheet page is EMPTY — the string has
never been committed; (5) my own task-33 ambient log (08:16, 284/284
green) predates the drift. The matrix re-pin rides the sheet sibling's
closure. Not touched, per the sibling law.

## Closure

number-input passes review #2. My disposition: findings 1, 2, 4 ride
closure as page/family copy fixes (2 mirrored); finding 3's page half
(correct the cell-ink clause + disclose the dark cost) should ride the
same closure, with its family half attached to W-next #7 as the fourth
frozen-ink-seam instance and the first legibility failure; finding 5 is
the family lane's typing cleanup. No page changes required beyond the
copy fixes above.

No commits made. Report file:
`agents/scribe/reports/34-review-number-input.md`.
