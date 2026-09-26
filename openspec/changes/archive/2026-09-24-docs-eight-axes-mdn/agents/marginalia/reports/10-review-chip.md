# Report 10 — REVIEW `chip` (marginalia, 2026-09-22)

Reviewer: marginalia (2nd of 2; quill's page, post-micro-fix state =
9ed2a7d8 — working tree byte-identical for both chip files, git
verified). Independence law held: vellum/reports/8-review-chip.md NOT
read before this report was filed. Evidence: source read (page + chip.docs.ts
+ chip.svelte root), raw SSR bytes on :5244 (1,191,911 B, HTTP 200),
live probes (single-evaluate; query flip across the real 48rem
boundary), my own negative-grep runs.

## Verdict: PASS — chip CLOSES (page #6)

The micro-fix receipts all verify in the served bytes, my own grep runs
reproduce every negative receipt, the live measurements confirm the
remaining numbers (density ladder, size glyph-lane, coefficient
inertness, theme bridge, query flip), and the EXTRA-lane regression is
clean. One NIT (query form consistency) and one declared-debt
observation — nothing blocking.

## Micro-fix receipts (the 9ed2a7d8 findings, re-derived)

1. **The 14px ladder: VERIFIED.** Served bytes carry the 3-rung ladder
   "11 / 12 / 14px at sm / default / lg" — measured ×2 (the density
   per-axis row :294 AND the TokenTable row :709; both surfaces agree,
   which is stronger than a single hit). The old 4-value string
   "10 / 11 / 12 / 14px" serves ×0. The height ladder "≈18 / 20 / 23px"
   serves ×1. Live: sm chip label 11px / box 17.95px (≈18) / inset 8px;
   default chip 12px / 20px / 12px; the lg rung receipted through the
   kernel's own `[data-density='lg']` scope (channel-binding harness:
   inset 16px, label 14px, line 21px → box ≈23px with the hairlines).
   Every ladder slot measured true.
2. **The negative-grep receipt form: VERIFIED.** Both rows lead with it
   ("SUPPLY-ONLY — stamps …; no family css reads it (grep receipt: zero
   --jx-radius-effective readers in the chip atoms)" / the same for
   --jx-color-effective), and my own grep reproduces the receipts: zero
   `--jx-radius-effective` / `--jx-color-effective` /
   `--jx-elevation-effective` / `--jx-motion-effective` readers under
   `lib/ui/chip/`. Elevation and motion rows carry the same receipt
   posture.
3. **EXTRA-lane regression: CLEAN.** The family table renders 12 rows —
   variant, href, external, onclick, type, ariaLabel, class, slotStart,
   slotEnd, children*, **shape** ('square' | 'pill', the "Rendered from
   extra" clause), **{@attach …} (component tag)** — the shared section
   carries the 8 axis rows; the task-6 rescue stands untouched by the
   micro-fix.

## Findings

1. **NIT — the query() case is the bare form.** Stage (:775), drawer
   (:264) and caption all read `query({ md: 16 }, 14)` — no explicit
   generics. Type inference works for this number-lane case (no
   DensityLane in the cases, base is a literal), so unlike breadcrumb's
   string-form this is not a type error — but every integrated sibling
   (badge/checkbox/cascader/accordion) carries the §6 two-generic form,
   and the drawer teaches the bare form to registry consumers. Fix at
   the next touch: `query<{ md: number }, number>({ md: 16 }, 14)` in
   stage + drawer.
2. **Observation (declared debt, not a new defect): the hand mirrors and
   the `close` dodge remain, but DECLARED.** The anchors/slots/twin/hue
   drawers are hand-authored mirrors whose source comment records the
   resolveRawCode migration as "the recorded follow-up" (:148-151) —
   chip is the one page that documents its own partial same-source
   coverage, and the mirrors match their stages' content. Noted so the
   follow-up stays on the ledger; nothing to fix in this review.

## Verified TRUE (receipts)

- **Declaring-element (the coefficient)**: the density={1.5} panel chip
  carries NO data-density attr, box 20px, label 12px — byte-unmoved,
  the rung scope absent (my probe: rung=null on the real chip).
- **Size glyph-lane**: size={14} → label 14px / box 20px; size="large"
  → label 18px / box 20px — the inline stamp re-types the glyphs while
  the box stays density-anchored (the badge-twin law), measured on the
  real panels.
- **Color supply-only vs the lane that paints**: `color="error"` chip
  bg = the primary tint, byte-identical to a plain tonal chip;
  `jx-hue-error` bg = the error hue (oklab 0.6/0.181/0.085) — the
  carrier changes nothing while the class repaints, exactly as the
  demo panel captions say.
- **THEME-SPLIT**: `theme="dark"` (fill variant) bg resolves the dark
  primary — the four grammar slots re-declare on the `.dark` scope
  (the :root,.jx-light,.dark selector list, the badge precedent); the
  row's one-way honesty ("light and system stamp nothing: a light chip
  inside a dark tree stays dark") matches the source — `class:dark`
  only for a resolved dark.
- **query() flip (measured, real 48rem boundary)**: 1280px → 16px
  label; 700px (< 768px) → 14px; back → 16px. The caption's numbers
  verbatim.
- **SSR ground truth**: universal marker ×1, install ×1, see-also ×1;
  toc 11/11 ids in DOM, archetype order monotonic (hero → install →
  overview → usage → ladder → anchors → slots → twin → hue → Props →
  axes → a11y → see-also); 27 `data-jx-chip` hook attrs served; the
  吃也供 hit in the bytes is jixoai.css's inlined kernel comment, not
  page prose (the badge precedent — the page never names the protocol).
- **Carried-over verifications (task 6, re-confirmed this run)**: the
  EXTRA-lane rescue renders (12 family rows incl. shape + the attach
  row); the shared split leaves nothing eaten.

## Tier judgment

Tier 2 stands (integration-accepted; nothing in the micro-fix changes
the page's posture — two receipt surfaces corrected, zero structural
moves). The play-state lab remains byte-identical to the pre-refactor
page per the pinned spec.

## Gates

Reviewer-side. Dev smoke HTTP 200, bytes 1,191,911. SSR byte checks
15/15 after correcting my own 吃也供 expectation (the one hit is the
inlined kernel comment, the badge precedent). Live probes all true.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244`; `lsof -i :5244
  -sTCP:LISTEN` → 0 lines BEFORE. Kill-by-PID: listener PID **62407**
  killed; post-kill lsof → 0 lines; pgrep → empty; wrapper exit 143
  (my SIGTERM).
- Probe/scratch: /tmp only (`marginalia-10-live-probe.mjs`,
  `marginalia-10-chip-ssr.html`, `marginalia-10-dev.log`). Repo-side
  writes: this report + experience.md. NO commits, NO push.

## Consolidation note (short)

Cross-read vellum/reports/8-review-chip.md (PASS, 0 BLOCKER · 1 MINOR ·
2 NIT — both verdicts agree). All three findings verified fixed in the
current state by my independent run: MINOR-1 (the 13px→14px ladder)
serves "11 / 12 / 14px" ×2 with the old string ×0, and my live sm /
default / lg-harness measurements (11/12/14 label, 8/12/16 inset,
≈18/20/≈23 box) match the corrected ladder slot by slot; NIT-3 (the
receipt form on radius/color) — both rows now lead with the
"grep receipt: zero … readers" form, which my own grep reproduces;
NIT-2's re-verify condition holds (the sm line's 8/11/≈18 still
measures true). **One divergence, deferred to vellum**: my NIT-1 (the
bare `query({ md: 16 }, 14)` form) — vellum adjudicated it compliant
(the §6 ruling governs explicit-argument lists; both params infer;
the page's only svelte-check error is the fleet cx idiom), with a
type-check receipt I did not run. I keep the note as optional
consistency polish, not a violation. Chip CLOSES.
