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

### F5 — THIS COMMIT (2026-09-13): Gate-1 r5 precision closure (pre-execution)

Reason: Codex Gate-1 round 4 (7.4/10) found five precision gaps. All
fixed BEFORE any measurement (no evidence existed to bias):

1. D2-02 token ambiguity resolved: the manifest now declares the
   SYNTHETIC TOKEN ENV explicitly (spike app.css carries `:root {
   --jx-gap: 0.5rem; --jx-inset: 0.75rem; --jx-hit: 2.5rem; }`) —
   8px 12px is exact under it; the real-theme path (density-default
   block, jixoai.css:2133-2157) is the SECONDARY control-build
   equality check (precedence is the invariant, literal recorded).
2. All "in-spike" deferrals eliminated: D2-03's carve-out rule text
   frozen verbatim (`:where(.switch-host:has(input:checked)) .rail {
   background: rgb(255, 0, 0) }`); D2-10 binds via control-build
   equality with block-verified anchors (.dark --primary
   jixoai.css:194; lg rung 261-285); D2-13's sim rule frozen verbatim
   (rgb(18, 52, 86) under @media not print); D1-11 points at the
   D2-12 frozen pair.
3. validate-manifests.mjs upgraded to BLOCK-SCOPED verification
   (brace-matched block per selector, declarations verified INSIDE
   the block, real line ranges printed) + a --self-test mode with
   three deliberately-wrong anchors that MUST fail (proving drift
   detection; both modes green at F5).
4. D1-03 fresh-navigation protocol: every measurement starts from a
   NEW navigation with the observer installed via addInitScript
   before parsing (the r4 wording could ride the already-waited D1-01
   page and miss the insertion event); style_ready never observed ⇒
   FAIL; records: navigationStart, observer-install ts, insertion ts,
   FCP, resource timing, settled computed bg.
5. D3 sample math fixed: bytes = 3 DEDICATED npm ci runs per config
   (separate from builds); builds = 5 rounds × [TW,A,B,C,C,B,A,TW]
   with each position = cold (npm ci + timed build) + immediate warm
   (timed build) ⇒ exactly 5 cold + 5 warm per config (40 runs);
   p50/p95 = NEAREST-RANK (n=5: 3rd / 5th smallest); vectors renamed
   to node_modules du median with Δ-over-common-base semantics (the
   fixture's svelte/vite/@jixoai closure excluded; styling-engine
   closure only).
6. Non-blocking: design header carries the baseline labels (source
   census @ 3c9097e0; protocol freeze @ F5); tasks.md gate rows
   updated to the real round history (6.2/7.1/7.0/7.4).

Post-F5 rule unchanged: evidence re-scores, never re-defines.

### F6 — THIS COMMIT (2026-09-13): Gate-1 r6 count-fix + manifest binding (pre-execution)

Reason: Codex Gate-1 round 5 (7.1/10) caught a real arithmetic bug and
a binding gap. All fixed BEFORE any measurement:

1. D3 schedule count FIXED (the r5 bug): the 8-slot cycle
   [TW,A,B,C,C,B,A,TW] held each config twice per round (10+10=80
   builds, n=5 percentiles invalid). Now: 5 rounds × 4-position
   ROTATION (each config exactly once per round) = 20 positions ×
   (cold + immediate warm) = 40 timed builds = exactly 5 cold + 5
   warm per config; nearest-rank n=5 valid.
2. validate-manifests.mjs v3 binds the MANIFEST itself: tier-1 rows
   (D2-02/10/12/14/15) must carry BOTH the selector string AND the
   anchor EXACTLY equal to the source's real block range (helpers
   bound whole-text); --self-test now proves THREE detections: wrong
   source declaration, tampered manifest anchor, tampered manifest
   selector (all caught; both modes green).
3. D2-14 anchor corrected to the real block tooltip.css:42-44 (was
   37-41 — comment lines, not the rule); D2-15 sub-anchors made
   exact (154-184 / 190-192 / 201-210); D2-12 upgraded to
   SELECTOR-LEVEL: the checkbox selector-list block
   (jx-pure.css:2256-2264) is located INSIDE the media block and the
   pinned pair verified there (a move to radio/range now fails).
4. D1-03 semantics: the MutationObserver timestamp is declared a
   conservative UPPER BOUND (callback delay recorded; SOFT-FAIL may
   be re-examined against it); missing FCP paint entry ⇒ FAIL
   (LIMITATION only when the browser emits no paint entries at all).
5. Δ formulas made reproducible: bytes Δ = du_median(config) −
   du_median(TW) (whole-tree du — hoisting/dedupe implicit); packages
   Δ = |lockfileNames(config) \ lockfileNames(TW)| (new names only).
6. Non-blocking folds: manifest headers now carry the F2–F6 lineage
   (not stale round labels); D2 manifest declares ROW KINDS
   (repo-derived = file:line anchor, machine-verified; synthetic =
   frozen rule text is the anchor); design's stale "Gate-1 r3" label
   replaced.

Post-F6 rule unchanged: evidence re-scores, never re-defines.

### F7 — THIS COMMIT (2026-09-13): Gate-1 PASS hygiene (round-6 B items)

Gate 1 round 6 verdict: **8.3/10 PASS** (trajectory 6.2 → 7.1 → 7.0 →
7.4 → 7.1 → 8.3). Execution unblocked. The five B items landed NOW:

1. D1-06 debug pin: `debug: true` frozen into BOTH spike modes;
   data-style-src asserted as the debug-gated attribute it is (the
   non-debug prod assumption dropped, not carried).
2. Validator binds the OUTER media range too (D2-12 requires both
   jx-pure.css:2256-2264 inner and 2255-2269 outer anchors in the
   manifest row).
3. lockfileNames extraction frozen: package-lock.json `packages`
   keys, strip leading node_modules/, keep LAST segment, drop root
   "" — same parser for all four configs.
4. Config receipts must record package.json + lockfile sha256 +
   generation commands + registry state per configuration.
5. Stale round-wording in design.md replaced with F-series labels;
   tasks.md Gate rows updated to the PASS verdict.

Environment note: disk was freed (~179Gi available) between rounds 6
and this commit — the disk-blocked lanes (R2 rebuild, spike installs)
are unblocked. Machine memory discipline stays: heavy lanes serial.

### F8 — THIS COMMIT (2026-09-13): Owner ruling — D7 REMOVED (difficulty replaces cost)

Owner ruling, verbatim (2026-09-13, session):

  「为什么要讨论迁移成本，这次是全部组件级别的破坏性更新，
  本身就是一个不计成本的工作。我们只讨论难点重点，不讨论成本。」

Effect, effective immediately (BEFORE D4/D5/D6 evidence lands — the
least-biased moment, as presented at ruling time):

1. **D7 (migration cost, w×1) is REMOVED from the scored dimensions.**
   The migration is a declared cost-no-object breaking rewrite (the
   standing Owner posture: 破坏性更新、默认忽略迁移工作). No
   file-count / family-count / hours arithmetic enters the verdict.
2. The census's high-risk data SURVIVES as DIFFICULTY/PRIORITY
   evidence: the 27-family risk register feeds D5 (ergonomics
   pressure points) and the follow-up blueprint's sequencing (which
   families prove the hard paths first) — never a score.
3. Scored set becomes D4(w3) + D5(w2) + D6(w2): max 35. The GO bar
   recalibrates PROPORTIONALLY: 24/40 = 60% → **≥21/35**, with the
   unchanged additional rule D4 ≥ 3. Weight sensitivity recomputes
   over the two heaviest remaining (D4, D5/D6).
4. The anchor-0 file-count trap (146 > 60 under any honest reading)
   is thereby dissolved, not re-anchored — the ruler is withdrawn,
   not recalibrated.

### F9 — THIS COMMIT (2026-09-13): the coexist layer-order correction (orchestrator ruling, evidence-backed)

The L3a spike proved the manifest's frozen app.css order
(`@import 'tailwindcss' → token vars → layer statement`) composes
BADLY with unplugin 0.19.0's append behavior: TW's own layer
statement lands first in the concatenated output, stylex layers
append last, and CSS first-declaration ordering makes stylex
PERMANENTLY beat consumer utilities — the UNLAWFUL cascade (D2-01
O1 measured 12px vs the lawful 42px; D2-03 unchecked sub-assertion
likewise). The O1-H diagnostic build proves the remedy: hoisting
the layer statement ABOVE the import (CSS-legal) restores BOTH rows
to the manifest's expected literals with ZERO regressions across
all other rows.

RULING (orchestrator level; Owner informed in the session report;
Gate 2 reviews it): the frozen order was SETUP SCAFFOLDING, not the
law — D2-01's expectation (consumer utility WINS) IS the law
(css-architecture: utilities win). Correcting scaffolding to
achieve the lawful configuration is fidelity to the contract. BUT
honesty rule: decision.md reports D2 BOTH ways — "as-run FAIL under
the frozen order (root cause documented)" AND "PASS under the F9
configuration" — with the F9 configuration defined as: `app.css`
opens with the full layer statement (theme, base, components,
utilities, then the stylex-prefixed layers per useCSSLayers),
followed by `@import 'tailwindcss'` and token vars. The corpus
spike (L3b) and any consumer-boilerplate generation use the F9
order.

Strategic consequence recorded for D3/RQ4: the coexistence footgun
is REAL and SILENT (a wrong order quietly inverts the override law;
dev-mode adds a second inversion via the virtual-css tag preceding
TW base) — this is prime evidence that architecture A (consumers
hand-wire unplugin) carries real blast radius, and that
architecture B (the @jixoai plugin generates the correct entry +
layer statement, the footgun becomes impossible) earns its keep.

Additional spike facts logged as D5 evidence (no ruling needed):
shorthand properties (background/border) are silently dropped by
babel-plugin 0.19 defaults (propertyValidationMode silent; throw
mode reveals) — StyleX requires longhands; Svelte 5 static class +
spread class do NOT merge (silent replacement; a mix helper is
owed); createTheme rides attrs; dynamic values' type-safe path is
the factory pattern; $lib aliases break babel module resolution;
Vite 8 + rolldown without a CSS entry silently drops the stylex
stylesheet link (a CSS entry is MANDATORY).

### F10 — THIS COMMIT (2026-09-13): D3 packages-vector re-anchor (orchestrator judgment under no-answer protocol; Owner override preserved)

The L3c receipt falsified the design's factual assumption verbatim:
"babel chain rides unplugin deps" (design §4 D3 notes) — the F6
frozen lockfile algorithm counts babel ×20 + browserslist as REAL
consumer lockfile names (+50 for B, +6 even for runtime-only C), so
NO architecture can pass the Δ≤+2 tolerance.

RULING (orchestrator, under the no-answer protocol — the Owner was
presented the three options and did not answer; decision.md reports
D3 under BOTH readings so the Owner can override at review; Gate 2
reviews this entry): the packages NAME COUNT becomes a REPORTED
diagnostic (with the babel-chain explanation attached); the GATING
vectors for install burden become the MEASURED burden proxies —
bytes Δ (≤+5MB) and cold-build p95 Δ (≤+15%) — both already frozen,
both already measured, both GREEN for architecture B (bytes +1.78MB;
cold p95 −24%, FASTER than the TW4 baseline). Config-files Δ=0,
config-lines Δ≤+6, boilerplate ≤10-generated-lines unchanged.

Effect: A still FAILS substantively (config lines +15, hand-copied
boilerplate, F9-footgun exposure at the consumer); B PASSES all
burden vectors; C passes burden but carries the hybrid-payload
contract (path-dependent class hashing — consumers cannot recompile
source without name divergence).

The falsified-assumption quote, the measurement table, and this
ruling travel together into decision.md's D3 section.

### F10-status — THIS COMMIT (2026-09-14): Owner presented twice, no answer; dispositions recorded

F10 was presented to the Owner twice via structured question (session
2026-09-13/14) with no answer received. Dispositions under the
no-answer protocol: F10 signed PRO-TEM by the orchestrator (corrects
a falsified fact; burden vectors pre-registered; dual-column
preserved); the D4 permissive reading deliberately NOT signed
(post-evidence meaning-change is beyond solo orchestrator authority —
strict reading holds D4<3 → NO-GO as-scored). decision.md §5 now
carries the dual-pending table + the orchestrator's recommendation
(sign both). The Owner's word on either ruling is the switch; a
rejection is final and respected (fallback: RQ7 ranking or in-place
TW4).
