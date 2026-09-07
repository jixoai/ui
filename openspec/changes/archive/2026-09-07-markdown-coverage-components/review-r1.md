# review-r1 — the subagent design review round (2026-09-07)

Reviewer: zcode general-purpose subagent (COMPACT workflow — the user
confirmed subagent review over Codex for this change). Verdict on the
first draft: **REVISE** (13 findings); all folded in before
implementation:

1. **BLOCKER — the paint slot vs the frozen-availability gate.**
   `definePaintSlot` requires a `frozenAvailability` row
   (verify:context hard-fails otherwise) and the amendment chain
   (config + living spec family list + variant-grammar page table)
   was unamended. → Folded: the chain is now a Lane D task and landed
   (all three mirrors).
2. **MAJOR — ghost vocabulary misuse.** The draft's third rung
   (borderless manuscript indent) redefined ghost as static — ghost
   is interactive-chrome vocabulary (rest-transparent, hover-tonal,
   border-preserved). → Folded: the ladder is outline|tonal (the
   alert row shape); the indent posture is a recorded followup
   structural axis.
3. **MAJOR — Checkbox breaks the task-item marker suppression.** The
   control's div>span>input wrapper defeats `li:has(> input)` and
   makes vertical-align inert. → Folded: task items stay native
   disabled inputs (the jx-pure bare-checkbox face owns the paint);
   unlock recorded.
4. **MAJOR — block escapes descope container prose.** → Folded: the
   §2c container-inner sibling stack (the flush law's positive
   counterpart, weaker by specificity so edges stay flush).
5. **MAJOR — ambient-vocabulary/meta carrier set.** → Folded: no
   meta files (hand-authored props rows, the alert precedent); new
   pages ride the zero-increment debt policy.
6-13. MINOR/NOTE findings (strong/mark face overrides recorded,
   link rel=noreferrer unification + no origin comparison, edge
   arithmetic +8→+7 after the checkbox change, live freeze recount —
   the comment trail's 104 was drift, the real sum was 95 → 100,
   defaults files only where style props exist, the alert detector's
   inline-wrapper tolerance, structural-not-wall-clock perf guard) —
   all folded.

# The Owner's mid-flight additions (both folded as new lanes)

- **The text family design** (after plan r2): `<Text mark>` base +
  Raw semantic exports (P Strong Em Del Mark Ins Sub Sup) from
  text.svelte itself — "降低学习成本"; `<P>` joined the family.
- **The HTML equivalence lane** (after integration): `some
  <b>text</b>` ≡ `some **text**`; details/summary → the accordion
  (verified W3C-first native-details before design). Implementation
  corrected the design's own probe error (flat vs nested factory
  options — the html axis rides TRUE, floor fully render-side) and
  closed a REAL hole the lane exposed: the parser's html-anchor
  pre-conversion bypasses validateLink, so the link branch now
  re-validates every href on both syntax paths.

# Integration + recovery notes

- The host rebooted mid-Lane-C; the subagent was lost with a
  truncated spec file and an over-asserted streaming test. Recovery:
  the SSR-snapshot describe restored, the alert branch rewritten as
  ONE Blockquote whose props flip (the element identity law the test
  pins), the L3 assertion aligned with the law (the successor event
  is the ONE bounded remount), and the five component specs written
  (reading-content-family.spec.ts, 13 tests).
- verify-hook-law B1 attributed: `jx-hue-` came from lane C's string
  concatenation (fixed — GITHUB_ALERTS carries full class names);
  `jx-tk-`/`jx-dsn-` are pre-existing upstream (fails identically on
  a clean origin/main checkout — not this change's debt).
- registry-payload parity needed the root build (public/r payloads)
  in the fresh worktree — environment, not regression.
