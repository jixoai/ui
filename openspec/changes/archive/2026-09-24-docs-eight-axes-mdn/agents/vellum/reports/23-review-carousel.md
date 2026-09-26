# TASK 23 — REVIEW carousel (vellum, 2026-09-22; 1st of 2)

**Verdict: PASS** — every dispatch claim re-derived independently and
verified TRUE; the falsified-row retirement, the one-token-apart shadow
contrast, the dots-honesty landing and the live query stamp all
reproduce. Findings: 0 blockers, 1 probe-craft NOTE.

## Claim 1 — falsified density token rows retired: VERIFIED

- Grep: **ZERO --jx-icon / --jx-hit reads in ui/carousel/** ✓.
- The page's only two mentions of those names are the RETIREMENT
  disclosure itself (header comment + the axes paragraph naming the
  W3-era rows as falsified) — the token table no longer carries them ✓.

## Claim 2 — the one-shadow-token-apart contrast: VERIFIED (emission census + probe)

- **Emission census**: the arrow's `boxShadow: tokens['--jx-shadow-xs']`
  compiles through the typed intermediate — the runtime sheet declares
  `--jx-shadow-xs:` at the :root pole — substitution once at :root.
  Button-group's cluster shadow reads RAW `--shadow-xs` directly —
  re-substitutes at the consuming element. Same sheet token, opposite
  emission form, opposite theme behavior: "one shadow token apart" is
  precisely right.
- **Co-resident probe**: under a `.dark` island, the carousel's arrows
  (ground oklch(1 0 0), ink oklch(0 0 0), border, shadow
  rgba(0,0,0,0.5) 2px 2px) and the dot are **byte-identical to light**
  — FROZEN, all five painted voices ✓. (The dot's HUE component drifts
  279°→306° between reads — the documented wall-clock rotation; the
  L/C polar is identical, so the freeze holds. First assertion trip
  noted in experience.md.)

## Claim 3 — density supply-only-on-self, supplied to slides: VERIFIED

- Track gap = **12px fixed (--jx-space-12)**, dots **--jx-space-8**,
  arrows the fixed base-type build — measured IDENTICAL under the
  stamped sm rung, the default, and the lg query case (gap 12px, arrow
  18px, dot 16px at every state) ✓.
- The rung scope IS stamped (`data-density` on the root), so composed
  slide content re-bases through the supply — the demo's guest content
  is where density lands. The chrome never does.

## Claim 4 — LAW #14 dots-honesty: VERIFIED

- Next-click → 700ms settle → scrollLeft lands at **831 = slide
  (819px) + gap (12px)** — exactly one slide+gap past origin (the
  track's own inline padding accounts for the offsetLeft delta).
- **activeDot and aria-current move together** (active index 0 → 1;
  aria-current="true" follows the same dot) ✓.
- **The no-absolute-px honesty holds**: the landing is
  slide+gap-relative (scroll-padding-adjusted offsetLeft), never a
  hardcoded px — the page's viewport-relative phrasing matches the
  code (`scrollTo(target.offsetLeft)`, adjacent smooth / long-jump
  instant).

## Claim 5 — query() two-generic + live stamp: VERIFIED

- `query<{ md: DensityLane }, DensityLane>({ md: 'small' }, 'lg'-family
  rung)`: **data-density flips lg @1280 → sm @600 → lg @1280** live,
  three reads; the chrome stays fixed across every flip (12px/18px/16px).
  String lane, both generics ✓.

## Claim 6 — standard receipts

- **A11y (SSR + probe)**: `role="region"` + `aria-roledescription=
  "carousel"` on the root; the track is the keyboard surface
  (`tabindex="0"`, scroll-snap x mandatory); arrows and dots are real
  buttons; `aria-current="true"` marks the active dot; **no
  aria-pressed anywhere** in the root ✓ (the selection-boundary law).
- **EXTRA 15 − 0 − 8 = 7**: served main table = **7 rows (label,
  slideWidth, dots, class, children, prevLabel, nextLabel)** — zero
  citation duplicates, the 8 axis rows separate. Counted from SSR ✓.
- **Leaf greps**: zero `-effective` reads; no density-kernel channels
  in the family (the fixed --jx-space-12/--jx-space-8 are structural).
- **Tier 2 audit**: archetype order holds; toc 6/6 present, order ==
  DOM; h1 = 1; page ZERO diagnostics.

## Gates (current tree)

- **canvas-same-source solo: 88/88** (the 2 carousel PILOTS blocks
  included) · svelte-check fleet: **1608 errors / 1030 warnings**,
  carousel page ZERO diagnostics
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110`
- verify:docs exit 0 — skeleton lint green

## Process evidence

- Port 5242: lsof EMPTY before (rc=1); server wrapper 83340 → vite
  83373; BOTH killed; after: lsof rc=1 (EMPTY), no 5242 vite remains.
- NO commits, NO push, ZERO tree edits by me (review-only; carousel
  files absent from git status).
- Probes: inline node scripts (frozen-pole dark island, LAW #14
  landing, query stamp across viewports) with LAW #15 gating on the
  scroll-snap signature; SSR snapshot /tmp/vellum-23-car-ssr.html;
  logs /tmp/vellum-23-car-*.log.
- Probe-craft note: the dot's hue rides the wall-clock rotation —
  polar (L/C) assertions, never full-color equality (the chip lesson,
  re-learned on the first assertion pass).
