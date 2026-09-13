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

### F4 — THIS COMMIT (2026-09-13): Gate-1 r4 corrections (pre-execution, logged)

Reason: Codex Gate-1 round 3 (7.0/10) caught factual errors and
remaining operability gaps in the F3 artifacts. Corrections, all
BEFORE any R2/R3 measurement (no evidence existed to bias):

1. D2-02/D2-05: `.jx-input` did not exist — Part A's real Tier-2
   alias is `.jx-control` (jx-pure.css:265). Manifest rewritten with
   the real block's declarations and computed literals (8px 12px at
   the stated root conditions).
2. D2-14: the real override is `.jx-tip.jx-surface::after { content:
   none }` (tooltip.css:37-41); the notch mask lives on the
   `.jx-tip-shadow` CHILD (`mask-image: var(--jx-surface-ring)`),
   not a pseudo box-shadow. Manifest corrected; property = content
   (primary) + shadow-child mask (secondary).
3. D2-15: `.jx-subpanel*` was not a legal selector — frozen to the
   two REAL selectors; mechanism corrected to `--jx-panel-pad` /
   `--jx-pop-pad`/`--jx-pop-pad-inline` custom properties + the
   enumerated `position-area … !important` over inline style.
4. D2-07: "today's behavior" replaced by the CONTROL-BUILD EQUALITY
   protocol (TW-only build at pinned TW 4.3.3 records P_tw; PASS ⟺
   coexist computed === P_tw).
5. D2-12: the forced-colors property list is now frozen from the REAL
   Part C block (appearance: auto; background-image: none;
   jx-pure.css:2255-2264).
6. research/fixtures/validate-manifests.mjs added (24 anchor checks,
   all green at F4) — manifest-reality drift is mechanical now.
7. D1-03 criterion repaired: style-ready ≤ FCP_start with
   deterministic timestamps (resource-timing responseEnd /
   MutationObserver insertion vs paint startTime); SOFT-FAIL band
   0–100ms; hard FAIL beyond; all four records kept.
8. D3 measurement protocol frozen (fixture lineage, node v24.21.0 /
   npm 11.19.0 / Apple M1 16GB, npm-only, 3× npm ci installs, bytes
   = median du node_modules (+ lockfile + tarball totals recorded),
   5 cold + 5 warm interleaved TW,A,B,C,C,B,A,TW, p50/p95 on wall
   real).
9. Non-blocking folds: mirror object set enumerated (§1.3); gate
   invocation annotations (§1.4); blind-label control (§5); R0 task
   status semantics (tasks.md); RQ4 distribution constraints
   (source-copy, consumer-bundler boundary, rollback = per-family
   source revert).

Owner informed via session report. Post-F4 the F3 rule applies
unchanged: evidence re-scores, never re-defines.
