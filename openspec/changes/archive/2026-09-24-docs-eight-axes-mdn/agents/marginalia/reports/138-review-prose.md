# T138 — SECOND REVIEW prose (marginalia, 2026-09-24)

- **Protocol**: scribe's 1st (130-review-prose.md, PASS 0M/1m/0L/0N — "the
  strongest page of the batch") opened FIRST; both landed items verified; his
  receipts re-derived; fresh axis on the coverage/pending seats.
- **Vintage**: HEAD = fresh build at **ef520d44** (dist 03:01).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier 2 CONFIRMED.**

## The landed items — VERIFIED

1. **The page cx closed** (+page.svelte:114 — `Object.entries(style ?? {})`, the
   hardened guard).
2. **The family style null-guard closed** (prose.svelte:281 — `if (style != null)
   parts.push(style);`, the exact narrowing scribe prescribed for the string|null
   at the emission lane). Saved svelte-check: **page 0 seats, family 0 errors** —
   both of scribe's diagnostics gone.

## Scribe's receipts — re-derived (all confirm)

1. **Sovereignty, the markdown half measured live**: inside the relaxed-markdown
   region, the P computes **16px / 28px** — the typography trio's own values beat
   the outer knobs BY CASCADE, exactly the taught ladder (face(0,1,1) <
   residue(0,2,0) < §2a(0,2,1) < trio(0,3,0)). (The plain-P half of the seat — the
   outer knobs applying at 18/36 where the sheet is silent — scribe measured and
   my P-sample slice did not reach it; the inside half is the falsifiable crux and
   it holds live.)
2. **measure is inheritance**: the measure seat's P computes **17px** (= the
   1.0625rem knob) with the region's own leading (32.3px) — the knob scales the
   region's type through pure inheritance.
3. **The gradient is fill-only**: the gradient heading computes background-clip
   **text** with a **transparent fill** (`rgba(0, 0, 0, 0)`) — the
   never-color:transparent claim holds at the heading.
4. **The P-only lanes are presence-gated**: the indent seat stamps
   `data-jx-ty-indent` and computes **text-indent 27px = 2em at the 13.5px
   measure** (the 稿纸 convention, digit-exact); the drop-cap seat stamps
   `data-jx-ty-initial`; the ambient seats stamp nothing.
5. **family mono, code sovereign / serif honest**: the mono region's P computes
   JetBrains Mono; `--font-serif` at the root computes **EMPTY** — the page's
   serif-pending panel documents a real degradation, not an assumed one.

## Fresh axis — the lane-attribute census (scribe's probe-fault #2, systematized)

I census'd every `[data-jx-prose]` region's presence attributes page-wide: the
leading regions stamp `data-jx-ty-leading`, indent/initial stamp theirs, the
ambient regions stamp NOTHING (absence-is-state, confirmed at scale), and — a
nuance beyond scribe's note — the **gradient ink region stamps
`data-jx-ty-ink="gradient"`** (a presence attr with a value), while the plain
muted-ink region emits declarations only. So the ink lane has BOTH a
declaration-only mode (muted) and a stamped mode (gradient). Not a finding — the
page's a11y table lists leading/indent/initial as the presence attrs and the
gradient attr rides the variant seam — but the next prober should model the ink
lane as two-mode, which scribe's fault note alone would not reveal.

## Structure + gates

- LAW #19 (scribe's 52-id census unchanged this vintage); toc 9 == DOM 9; the
  eleven-knob API table with the universal marker.
- svelte-check (ONE run, saved): page **0 seats**, family **0 errors**.
- Fresh build rc=0 (dist 03:01); **verify:docs rc=0**; docs-universal **110/110**.
- Process: port 5244 mine, killed (lsof rc=1 empty); NO commits/pushes/fixes.
  Artifacts: /tmp/marginalia-138-probe.mjs.

## Probe-fault ownership

1. My P-sample slice (first 12) missed the measure region's plain-P (the 18/36
   half of the sovereignty seat) — the inside half (16/28) is measured live, the
   outside half rests on scribe's digits this pass. A follow-up read would close
   it; not load-bearing for the verdict.
2. The strongInk read inside the gradient heading returned null (no `<strong>`
   child in THAT heading; scribe's marks-restore receipt was taken on her seat) —
   the fill-only half is measured, the marks-restore half stands on scribe's.
