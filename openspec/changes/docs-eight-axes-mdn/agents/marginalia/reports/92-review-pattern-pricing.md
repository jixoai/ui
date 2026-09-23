# TASK 92 — FIRST REVIEW pattern-pricing.html (marginalia, 2026-09-23)

- **Reviewer**: marginalia (1st review; scribe's CODE, legacy explicit-props W4 at
  64a4f3e9, no CODE report — owner-checked I did not code it. No other
  pattern-pricing review exists; no concordance addendum applies. All findings
  derived from my own source reads + probes).
- **Target**: `apps/www/routes/docs/components/pattern-pricing.html/`
  (+page.svelte 247 lines, toc 5) over the pattern-pricing family (svelte 216 /
  stylex 75 / css 22 / defaults 40) — the `$ plan --compare` ASCII-ruled pricing
  section: the matrix over the Table family, per-tier CodeCards, the
  data-jx-recommended paint law, served live on :5244.
- **VERDICT: PASS — MAJOR x0 / MINOR x1 / LOW x0 / NIT x1.** **Tier proposal:
  Tier 1** — a 247-line pattern page, toc 5/5 clean, the signature paint law
  verified at the computed layer; the owed items are one demo-markup stamp (or a
  summary hedge) and the press-law shadow note.
- **The dispatch's period-toggle assumption — N/A receipted**: the page hosts NO
  monthly/yearly toggle (the SSR bytes carry no monthly/yearly text; the tiers are
  fixed per-seat/month payload). The "state receipts on BOTH directions" instrument
  has no seat; the matrix + recommended-lane instruments carried the audit.

## MINOR 1 — the summary claims the recommended card takes the border-primary rung; the served demo never stamps it

The demo summary (:117): "the recommended tier is one paint law: brand rules flank
the opted-in column **and the recommended card takes the border-primary rung**."
Measured on the three served tier CodeCards (solo / team / self-host): **all three
compute the same neutral border — oklab(0 0 0 / 0.18) 1px** — the team (recommended)
card is not visually distinct at the card layer, and no primary rung is stamped in
the markup. The COLUMN half of the law paints digit-exact (below); the CARD half is
the gap. Fix: stamp the border-primary rung on the team card's CodeCard in the demo
markup (one class — teaching the composition law the summary promises), or hedge the
summary to the column-only law.

## NIT 1 — the card CTAs' press-law shadow pose doesn't paint (the hover fill does)

Hovering a tier card's copy PressButton paints the **tonal brand fill**
(oklab(0.6489 −0.037 −0.234 …) — the primary hue) but the **box-shadow stays none**
at rest AND hover. The press-law shadow pose (the "hover grows only the hard
shadow" family story) is absent on this page's card CTAs — the same borrowed
press-law question as pattern-cta's NIT, now on a second pattern (the fleet-level
press-shadow-pose question is firming up: two patterns, same absence). The
affordance is not dead (the tonal fill is the hover feedback); one hedge line or the
press-button owner's pose check closes it.

## The claims — verified digit-exact

- **The recommended-column law PAINTS at the computed layer**:
  - the recommended **th** computes the tinted head —
    `color-mix(in oklab, var(--primary) 14%, var(--jx-table-head))` resolved to
    **oklab(0.9122 −0.0058 −0.0327)** vs the plain head **oklch(0.9551 0 0)** — the
    tint is visibly and measurably different;
  - the recommended **th AND td** compute the flanking brand rules —
    `box-shadow: oklch(0.6489 0.237 260) 2px 0 0 inset, oklch(0.6489 0.237 260) -2px
    0 0 inset` — the primary-hue flank, both sides, exactly the pattern css's two
    rules (:15-24);
  - **13 `data-jx-recommended` cells** served (the th + its tds across the demo and
    composition tables).
- **The body cells take brand INSET RULES, never a background swap** (the css
  header's law — the row-hover paint keeps flowing underneath): the td paint is the
  inset rules only, no background ✓.
- **The composition census** (the per-member EXTRA-lane): the matrix rides the Table
  family (consumer-authored thead/tbody in the children snippet — **LAW #18: rows
  stay authored content, no each** — the keyed surface empty by construction); each
  tier's install command rides a **CodeCard** (solo / team / self-host commands read
  back off the cards); the plan labels ride **Badge**; the copy actions ride
  **PressButton** — the four composed members, each at its own seat.
- **The fold mechanism is present**: the table frame computes
  **container-type: inline-size** (the container-query law — "narrow the stage and
  the frame folds to card rows"; the fold drive needs the stage's own width handle —
  receipted at the mechanism layer).
- **The toc census**: 5 authored == 5 served, no dead anchors, no unrailable
  sections — clean.
- **LAW #19**: 35 ids, zero duplicates.

## Standard battery

- **SSR**: 926,904 bytes; h1 ×1; universal marker present; 0 undefined literals;
  zero `jxoai`; 13 recommended-cell attributes served.
- **Warm-reload (strip-style)**: raw fetches differ; stripped of the dev-assembled
  style block, **byte-identical** — the dev-CSS order artifact, seventh consecutive
  page.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **pattern-pricing.html: 1 diagnostic** — :73 the Object.entries-undefined overload (the standing fleet class; recorded, not chased). Family lane: **0 ERRORs** — the pattern-pricing family is clean |
| verify:docs (dist a3bb69c7) | **RED — seat = toast** (the recorded docs-lint red), **pattern-pricing passes the skeleton lint** — sibling noise receipted, not chased |

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 938; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- Real hover for the press-law read (the T81/T91 class); protocol-grade census reads
  throughout.
- Instrument honesty: (1) my recommended-tint read initially flagged "check-source"
  because the computed color-mix serializes to oklab — the arithmetic (primary 14%
  into the table-head) is the source rule's own; the DIFFERENTIAL vs the plain head
  is the receipt; (2) the tier-card census picked up a 4th card-like element (the
  table's own surface) — trimmed to the three tier cards.
- Artifacts: /tmp/marginalia-92-probe{1,2}.mjs, /tmp/marginalia-92-ssr{1,2}.html,
  /tmp/marginalia-92-{dev,wrapper,listener,ambient,universal,scheck,docs}.*.

## Open questions

1. **The border-primary rung** (MINOR 1): one class on the team card's CodeCard
   (teaching the composition law the summary promises) or a one-clause summary
   hedge — the orchestrator lands either.
2. **The press-law shadow pose** (the NIT): two patterns now receipt the same
   absence (pattern-cta's copy CTA, pattern-pricing's card CTAs) — the press-button
   owner's pose check is firming into a fleet-level question.
