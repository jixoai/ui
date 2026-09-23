# T115 — SECOND REVIEW section-card.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 97 1st-review report opened FIRST;
  the dogfood-inversion claims pushed to digit grade again; fresh axes. NO commits,
  NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/section-card.html/` over the
  section-card family, served live on :5242, dist @ HEAD.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (per
  dispatch; her digit-grade battery reproduced at every seat I touched). Her MINOR 1
  (cx) CLOSED; her LOW 2 (hero caption) LANDED as the caption reword; her LOW 3 (the
  heading-clone class) verified exactly the shape the W-next ledger banked.

## Her findings — all three closed or banked-true

1. **MINOR 1 (page cx :121:28) — CLOSED**: svelte-check page-scoped **0 diagnostics**.
2. **LOW 2 (types demo hero card H2 under an "h1" caption) — LANDED by her caption
   direction.** The demo caption now serves "**tone hero · h2 (h1 pairs at the route
   head — S4.1)**" (source :59; served text receipt). The card keeps headingLevel
   default 2 and the label no longer claims h1 — the demo now agrees with itself.
3. **LOW 3 (the heading-outline clone class, banked W-next) — the served shape IS the
   ledger shape.** Whole-page outline census: **h1 ×1** (the page-hero card,
   headingLevel={1} tone="hero" — source :36), **h2 ×17**, and **"Acquire a Backend."
   ×5** (the types demo + the 4 DensityDemo clones) — digit-for-digit her census. The
   banked fleet-design receipt (heading-bearing demo seats can't be scoped away) is
   measured-true at the current tree; nothing regressed, nothing needs page work.

## Headline claims — re-derived digit-exact

- **Non-overlap law ×7**: card-law, types, usage, accessibility, theming,
  universal-props, api — every section root carries data-family, root data-region
  null, the header block carries data-region, **overlap false ×7** ✓.
- **Tone paints, digit-exact at the served hooks** ([data-jx-section-header] p /
  [data-jx-section-summary]):
  - eyebrow: **11px, letter-spacing 2.64px = 11 × 0.24em** ✓, brand ink
    oklch(0.55 0.12 198) (her 171 — the brand rotation's drift, same law);
  - hero summary: **oklab(0 0 0 / 0.78)** = foreground 78% ✓, 14px ✓;
  - hero title clamp: **36.72px @1440 → 25.28px @800** ✓✓ both digits, textWrap
    **balance** ✓; the page-hero instance H1, the types-demo hero **H2 at the same
    36.72px hero paint** (the S4.1 independent-axes teaching, live).
- **Structural separator**: **18 separators, 1px tall** ✓ (18 cards).
- **The concentric chain (my fresh-axis re-derive)**: the radius-20 demo section
  stamps `--jx-radius-effective: 20px` and the auto Card inside computes
  **border-radius 6px = max(0, 20 − 0.875rem)** ✓ — the §3 broadcast landing exactly.

## Fresh axes (beyond her report)

- The served LOW-2 caption receipt (her fix verified at the text layer, not just
  committed).
- The types-hero H2 at full hero clamp (she measured the playground instance; the
  types demo is a second seat of the same teaching).
- The DensityDemo clone census re-run as the W-next bank's regression guard.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 43da0d99) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (her Finding 1 closed) |

## Process evidence

- Port **5242**: wrapper + listener 76910; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. No playground state touched this pass (the tone reads are
  read-only at the served hooks).
- Probe faults owned: my first eyebrow/summary reads keyed on generic span/p
  selectors and caught caption/body furniture twice — the component's own hooks
  ([data-jx-section-header] p, [data-jx-section-summary]) are the honest carriers
  (the T98 sr-only lesson, applied one lane later).
- Artifacts: /tmp/t115/{probe-sf-sc.mjs,probe-addendum1.mjs,probe-sc2.mjs,sf-sc.json,
  addendum1.json,scheck.log,lsof-after.txt}.

## Open questions

1. None on the page. The heading-clone W-next stays banked exactly as ledgered.
