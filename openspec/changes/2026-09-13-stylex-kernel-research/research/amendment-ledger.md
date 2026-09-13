# Amendment ledger — protocol freezes and their history

> Purpose (Gate-1 r2 round-2, blocker A4): R1 (external intel)
> completed while Gate 1 was in flight, and the r2 design cites its
> findings. That timing breach cannot be retroactively undone; the
> honest repair is to declare f77ecd9c (and this r3 successor) the
> POST-R1 RE-FROZEN research protocol, enumerate every R1-influenced
> element, and close the door: after the r3 commit, NO new R2/R3
> evidence may modify the gates, anchors, corpus, or fixture
> manifests — amendments require a logged entry here with reason and
> date (design §4/§6 rule, operationalized).

## Freeze events

### F1 — 3c9097e0 (2026-09-13): pre-R1 protocol

The original four docs: D1–D7, P1–P4, three-channel redundancy model,
three spikes + optional stretch corpus. R0 census numbers cited from
the (then unreceipted) Explore sweep; R1 already in flight.

### F2 — f77ecd9c (2026-09-13): post-Gate-1-r1, still R1-contaminated in timing

Full blocker adoption (receipts, inventory model, boundary roles,
gate table, D1/D2 matrices as lists, R2b, mandatory corpus). Design
text cites R1 findings (container queries, Svelte support, fallback
ranking). Declared HERE: F2 is the POST-R1 RE-FROZEN protocol.

R1-influenced elements carried into F2 (enumeration, blocker A4):

1. RQ1 reframed — original: "does any Svelte path exist at all";
   post-R1: "verify the OFFICIAL unplugin path against the two blind
   spots (Vite 8, adapter-static)". R1 sources: PR #1454, official
   example-sveltekit, unplugin core.js.
2. D5 anchor + corpus rationale — "container queries not supported"
   (L1 §9) justifies the range family's folder-css boundary and the
   ≤+50% LOC tolerance framing.
3. RQ7 fallback ranking — PigmentCSS EXCLUDED (on hold, MUI-confirmed)
   and style9/Linaria demoted came from R1's maintenance scan; the
   Panda/vanilla-extract/UnoCSS ordering likewise.
4. D6 anchors — the 0.x-single-vendor framing and 5-month-old Svelte
   chain facts come from R1 (npm cadence, #1834 breaking change,
   engineering-blog adoption claims).
5. D3/RQ4 architecture options — architecture B's premise (unplugin
   absorbs into @jixoai/ui-vite-plugin) rests on R1's unplugin
   option-surface findings.

Bias-control consequence: because R1 landed pre-freeze, Gate 2 MUST
treat vendor-sourced claims (Meta blog, official docs) as
ADVERSARIAL-REVIEW targets: every R1 fact that touches a gate verdict
must be re-grounded in spike evidence (design §6 React-shaped-evidence
rule) or the affected dimension drops to missing-data.

### F3 — THIS COMMIT (2026-09-13): Gate-1 r3, the execution freeze

Additions: committed fixture manifests (D1 13 rows, D2 15 rows incl.
the surface-kernel and terminal-header foreign-override cases; corpus
floating-family frozen to popover), the version pin set (npm registry
2026-09-13), numeric FOUC criterion (D1-03), D3 tolerance vectors
(design §4), the historical-dist demotion (see r0-census amendment
§h), the 2340 "literal-class lower bound" relabel, and the
specialized-scripts gate rows (§1.4).

## Post-F3 rule

R2/R2b/R3/R5 outputs feed SCORING, never gate re-definition. Any
change to fixtures/anchors/corpus/thresholds after F3 lands here as
`### F<n>` with: what changed, why (evidence or argument), and
whether the Owner was informed. Silent drift = verification failure
(the Gate 2 reviewer diffs this file against fixture commits).
