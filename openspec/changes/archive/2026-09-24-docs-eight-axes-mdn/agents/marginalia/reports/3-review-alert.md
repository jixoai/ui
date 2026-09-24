# Report 3 — REVIEW `alert` (marginalia, 2026-09-22)

**Task:** review vellum's alert page (integrated at 4a8fa557) —
`apps/www/src/routes/docs/components/alert.html/+page.svelte` + `+page.ts`,
against baseline skill §5. Family source read in full
(`apps/www/src/lib/ui/alert/{alert.svelte,alert.stylex.ts,alert-defaults.svelte.ts,alert.css}`,
`defaults.svelte.ts`, `universal-props.schema.ts`, `universal-props.css`,
`jixoai.css` density scopes, `card.css` consumption). No commits made;
review artifacts in /tmp only.

## Verdict: PASS

Zero BLOCKER, zero MAJOR. Two MINOR (one-clause/one-source fixes, no
structural work) and two NIT. Every hard law holds, and the page's
honesty claims survived my OWN live measurement — including the ones I
tried hardest to break with the declaring-element lens.

## Tier judgment (§5.1)

Tier 2 was right. The old page (64a4f3e9) had good bones + real
machinery but a W3-era universal demo card, a byte-duplicated usage
block, archetype drift, and the size-axis lie ("scales the whole
notice") transcribed from the family comment. Old information survived
into the new page (live-region split → overview ¶2; body/title-only
first-class → overview ¶1; dismiss caveats → the API rows; token table
kept minus the three rows the stylex atoms provably never read —
verified: alert.stylex.ts reads none of `--jx-text/--jx-inset/--jx-stack`).

## Findings

1. **MINOR — axes demo: the shown source drifted from the stage at
   birth.** `+page.svelte:61` (drawer `axesUsage`) ends the concentric
   demo body at "…= 6px"; the stage at `+page.svelte:312` appends "off
   the banner's anchor". Built-page SSR proves the split ("child at
   auto" ×2, "off the banner" ×1). §5.4 says examples match their shown
   source; both artifacts were written together and still diverged —
   the exact two-source drift class quill's one-source idiom kills.
   *Fix:* extract the stage snippet from the same string that feeds
   `axesFiles` (or make the two byte-identical today, single-source
   when the idiom lands). Graded MINOR not MAJOR because the drawer
   compiles and renders the same component semantics — nothing an
   API-level reader copies is false; any value/prop divergence would
   have been MAJOR.
2. **MINOR — density row implies the number lane moves the hit lane.**
   `+page.svelte:122`: "a number stamps --jx-density-coefficient.
   Consumed HERE by --jx-hit…" reads as if a coefficient number also
   moves the × hit. My declaring-element probe says otherwise: a bare
   `--jx-density-coefficient: 3` on the banner recomposes nothing (×
   hit stays 40px — `--jx-hit` is DECLARED in the `:root`/`[data-density]`
   scope blocks, and a var() substitutes at its DECLARING element, so
   the banner-level coefficient never enters it); only a named rung
   makes the banner the declaring element (48px). The number lane is
   inert on this family and the row should say so — the same
   documented-absence honesty the page already models for shape/color/
   elevation/motion. *Fix:* one clause — "(a number is inert on this
   banner — nothing here scales by the coefficient; only the named
   rungs move --jx-hit)".
3. **NIT — "fixed literals" is stale pre-stylex phrasing.**
   `+page.svelte:122` ("the banner's type and padding rhythm is fixed
   literals"): the rhythm values are static tokens — `var(--jx-text-base)`,
   `var(--space-12)`, `calc(var(--jx-unit) * 3.5)` (alert.stylex.ts:39-41,
   91, 100) — not literals. The true, load-bearing fact is that none of
   them reads a density kernel channel. *Fix:* "none of them reads a
   density channel". (Also "is" → "are".)
4. **NIT — density type column contradicts the demo two sections
   below.** `+page.svelte:119` shows the documented vocabulary
   (`'small' | 'medium' | 'large' | 'auto' | number`) while the demo at
   `:316` passes `density="2xs"` — legal per `DensityLane`
   (universal-props.schema.ts:71) and disclosed in the row's
   description, but the column alone would call the demo invalid.
   *Fix:* "(+ the five legacy spellings)" in the column.

Zero-findings check on the rest, explicitly: archetype order/toc ids
exact (hero → overview → usage → api → axes → accessibility →
see-also); all eight lane TYPES match the schema lanes; size steps
14/16/18 (universal-props.css:36-38); elevation "a number snaps down to
the enclosing rung" (defaults.svelte.ts, ElevationLevelKey doc);
concentric inset 14px = card.css `--jx-inset-effective: 0.875rem`;
banner corner claim "(0px; 8px where corner-shape is supported)" =
jixoai.css `--radius` @supports block; census citation exact
(migration-census.md:277-296, "W3 CLOSE / LANDED D5 / alert … retired
their declaration-only density postures"); the small→sm alias mapping
is code-provable (normalizeDensityLane + the densityAxisSlot
normalizing resolved.explicit before densityRungOf stamps the attr);
dismiss/dismissAfter/onDismiss/dismissLabel defaults match
alert.svelte; see-also routes all exist.

## Hard laws (§4 / §5.6)

- **verify:tailwindless receipt UNMOVED:** `✓ GREEN — 2 class-bearing
  files against the pin … receipt: files=2 identities=7 occurrences=7
  zones={routes:1, site-libs:0, ui:6} forms=42`.
- **Generated section intact:** `verify:docs-universal` GREEN —
  `110/110 component pages render the shared universal section (110
  markers)` against a fresh dist (built 22:08, postdates 4a8fa557 at
  22:01; alert tree clean vs HEAD). SSR marker count on alert.html: 1.
- **verify:docs:** `✓ all docs pages pass the skeleton lint (staged
  scope green)` — alert appears only in the pre-existing backlog
  (Install/see-also markers, out-of-scope warn, unchanged).
- Usage H2 ×1 (the skeleton law vellum's report taught — verified live).

## Re-verification receipt (the learning task, applied)

vellum's technique (its experience.md): source-read claims are
hypotheses; only computed-style probes are receipts. My OWN probe
(`/tmp/marginalia-3-alert-probe.mjs`, log `/tmp/marginalia-3-probe.log`)
against my :5244 smoke — **17/17** — re-measured:

- **the density rungs:** lg 48px / 2xs 24px on the page's own demos,
  PLUS the full TokenTable ladder on a scratch probe element —
  2xs 24 · xs 28 · sm 32 · default 40 · lg 48 (the corrected row is
  true; the old page's "28/32/40/48" really was missing 2xs).
- **the concentric anchor:** carriers stamped inline (`--jx-radius-effective:
  20px; --jx-size-effective: 18px; font-size: …`), nested Card at auto
  computes exactly 6px, banner's own corner 8px (never 20).
- **the `.dark` bridge:** class on the banner root AND an actual
  repaint (tonal ground differs light vs dark) — the row's "the one
  axis that repaints the banner itself" is earned.
- **query() min-width direction**, re-measured across the 40rem flip
  both ways (sm/32 at ≥40rem, lg/48 below).
- **size honesty:** root 18px with title/body pinned at 13px
  (rem-anchored `--jx-text-base: 0.8125rem`, jixoai.css:1234) — the
  corrected truth holds; the family comment's claim stays dead.
- **my declaring-element lens as the second lens:** coefficient 3 →
  hit 40→40 (inert); data-density="lg" → 48. Finding 2 came straight
  out of this pair. (Probe r1 note: my first C2 read 120px because I
  left the coefficient set — the scope block's own formula
  double-scaled it, live-confirming the kernel's "explicit rung resets
  the coefficient" law; fixed probe, clean run.)

Two probe artifacts (B1 ordering, C2 leftover coefficient) were mine,
not the page's — both diagnosed and fixed in-session; final run 17/17.

## Highlights → my experience.md (§5.7)

Recorded in `agents/marginalia/experience.md` under "Learned from
vellum" + Highlights: the axis-honesty probe pattern (adopted as a
review-side gate, not just a coding-side one); the measured-value
annotation contract ("(measured rungs)"); the corrected-truth doc
pattern; PropsTable `title=""` custom rows as the zero-machinery
per-axis table. Upgrade commitments back to my pages: run the per-axis
probe on accordion before its next report; annotate accordion's token
rows "(measured)"; single-source my hand-composed queryDemo (reaffirmed
— alert's finding 1 is the drift class made real).

## Processes

- Dev server: `node scripts/dev.mjs --port 5244` (vite child PID
  68714). Killed 68714 by PID + the wrapper; receipt: `lsof -i :5244
  -sTCP:LISTEN` → 0 lines; `pgrep -f "vite.js dev --port 5244"` → none;
  `pgrep -f "dev.mjs --port 5244"` → none. (One cold-cache
  `virtual:jixoai-icons.css` SSR warning at startup — the known
  one-off; page served 200 and rendered fully.)
- Gates: verify:tailwindless / verify:docs-universal / verify:docs as
  quoted above. Scratch files /tmp/marginalia-3-alert-probe.mjs,
  /tmp/marginalia-3-probe.log, /tmp/marginalia-3-dev.log — nothing
  repo-side written except this report + experience.md.
