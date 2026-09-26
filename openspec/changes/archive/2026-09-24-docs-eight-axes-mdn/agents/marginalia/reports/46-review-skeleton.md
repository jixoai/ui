# TASK 46 — REVIEW skeleton (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (FIRST reviewer; independence law held — quill's report 32 NOT
  read before the findings below were fixed; the concordance addendum at the end was appended
  after filing, per the dispatch)
- **Target**: quill's page — `skeleton.html/+page.svelte` (467 lines) + the family (svelte
  128 / stylex / css). Zero drift on skeleton paths; the tree's uncommitted set (progress —
  vellum's FIX pass, system-dialog — quill, the ambient matrix) belongs to siblings.
- **Method**: source reads (page, family svelte/css/stylex), a 100-sample rAF opacity
  sampler over ~1.65s (the pulse in computed pixels), a reduced-motion freeze watch (502ms),
  stamp/geometry reads on the merge-law panel, the REAL scroller reveal (.jx-shell-body —
  window.scrollTo does nothing on this layout), SSR parse + real-DOM dead-class scan,
  ambient solo + docs-universal + fleet svelte-check.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT. Every headline claim verified —
  the pulse oscillates exactly 0.45 → 1 on the computed clock, the freeze is pixel-still, the
  merge law co-exists carrier and consumer in one attribute with the consumer winning, and the
  never-manufactures law holds to the pixel.

## The headline claims — verified TRUE

1. **The pulse in PIXELS — VERIFIED exactly.** 100 rAF opacity samples over ~1.65s on a live
   demo block: **oMin 0.45, oMax 1, oscillating** — exactly the claimed 0.45 → 1 envelope — on
   computed `jx-skeleton-pulse 1.4s ease-in-out infinite` (timing ease-in-out). It is
   BRIGHTNESS, not a sweep: the block's background-image computes to **none** (no gradient, no
   background-position motion) — the entire effect is the opacity channel. Keyframes source:
   skeleton.css :11-18 (0%/100% → 1, 50% → 0.45).
2. **The RM freeze — VERIFIED pixel-still.** Under `prefers-reduced-motion` (emulation
   verified live on this page's sibling clocks): computed **animationName: none**, opacity
   **1 at start and 1 after a 502ms watch** — a still frame, ≥350ms as claimed. The kill rides
   the unlayered `:where(.jx-skeleton)` carve-out (skeleton.css :25-29) — it beats the
   animation declaration.
3. **THE MERGE LAW — VERIFIED, one attribute, consumer wins.** The stamps specimen's style
   attribute reads `--jx-radius-effective: 12px; --jx-density-coefficient: 1; border-radius:
   3px` — the carrier stamp AND the consumer's own declaration co-exist in ONE style
   attribute, and the **computed corner is 3px** (consumer wins). Exactly the row's claim.
4. **The NEVER-MANUFACTURES law — VERIFIED to the pixel.** The size={18} specimens stamp
   `--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)` (computed 18px)
   while the boxes stay **exactly the class geometry: 128×12 (skBar) and 40×40 (size-10)** —
   measured unchanged. The named-step specimen stamps `var(--jx-size-medium)` → 16px and
   `var(--jx-radius-large)` with the block's radius computing **0px** — the bare block paints
   no corner of its own, exactly the row's "SUPPLY" verdict (the stamp lands; the scope is the
   work).
5. **Zero-vocabulary — VERIFIED**: the ambient matrix fixture carries **zero skeleton keys**;
   the family paints two atoms (--jx-muted ground + the inset hairline ring) with no
   token-vocabulary of its own; data-density/dark read only by descendants.
6. **The re-hosted demos — VERIFIED clean**: the live DOM carries **zero dead utility
   classes** (.h-4/.w-2\\/3/.h-3/.w-32/.size-10/.h-28 all count 0 on real elements); the 25
   SSR regex hits are escaped DRAWER CODE TEXT (the consumer-copy usage samples, where
   class-based geometry is the taught contract); the rendered blocks carry `jx-skeleton` +
   stylex hashes only (sample className: `jx-skeleton x1yn5p49 x10inlas xvm51jw xwaiz5r`).
7. **The shells — VERIFIED mounted (LAW #18 + PROBE-READINESS)**: after revealing through the
   REAL scroller, the shells canvas mounts **24 blocks** — card 4 (1 + avatar + 2 lanes), list
   8 (4 keyed rows × 2), table 12 (3 header + 3 keyed rows × 3); the keyed eaches
   `[64,92,78,85] as w (w)` and `[0,1,2] as row (row)` carry defined, unique keys; the list
   rows carry their `width: N%` styles. All blocks aria-hidden="true" ✓.
8. **The a11y contract — VERIFIED**: aria-hidden lands after the rest spread (source :117-127)
   and measures true on every block; the loading state is the container's aria-busy (the demo
   stages carry it).

## Findings (severity-tagged)

1. **[LOW — pre-existing diagnostics, unchanged files]** family :51 (the cx join class) +
   :109 8× state_referenced_locally warns (the fleet pattern), scenes/skeleton ×1. Page:
   **0 diagnostics**. Fleet 1575/609 (sibling set — quill's system-dialog, vellum's progress
   FIX pass, the ambient matrix, all in flight and untouched).
2. **[NIT — the readout is scoped to the scroller]** The pulse/freeze receipts live in the
   top canvas; the shells canvas (and any deeper section) only mounts after scrolling the
   REAL scroller — window.scrollTo does nothing on this layout. Reviewer #2's probe should
   scroll .jx-shell-body (the task-42 lesson, re-confirmed here).
3. **[NONE]** otherwise — no MAJOR, no MINOR on any dispatched claim.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** — clean pass (the in-tree matrix re-pin carried the prior keys; no new noise) |
| verify:docs-universal | GREEN **110/110** |
| svelte-check (fleet, 609 files) | **page 0 diagnostics**; family/scene debt pre-existing (unchanged files) |
| Raw SSR + real DOM | h1 ×1; SSR ids clean (no twins); ToC complete (overview, skeleton-demo, shells, law, types, usage, api, axes, accessibility); markers present; 0 undefined/null literals |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper → vite killed by PID (+ wrapper);
  **port after: []**.
- **NO commits, NO pushes; zero product-tree edits.** Sibling files (progress FIX pass,
  system-dialog, the ambient matrix) untouched.
- Independence: quill's report 32 not read before the findings were fixed; the concordance
  addendum follows after filing.
- Instrument honesty: my first shells probe found zero panels — the playground-laziness bank
  plus the wrong scroller (window.scrollTo is a no-op on this layout); re-probed through
  .jx-shell-body and the 24 blocks mounted exactly. The task-42 scroller lesson, applied.
- Artifacts: /tmp/marginalia-46-probe{1,2}.mjs, /tmp/marginalia-46-ssr.html,
  /tmp/marginalia-46-{specs,scheck,dev,dev2}.log.

---

## Concordance addendum (appended after reading quill's report 32)

My findings above were fixed before this section; the cross-check against report 32:

- **FULL CONCORDANCE — every measurement reproduced**: the pulse (her 120 samples/2s, oMin
  0.45 → oMax 1; mine 100 samples/1.65s, identical envelope), the freeze (animation none,
  pixel-still), the merge law (both declarations in one attribute, corner 3px), the
  never-manufactures law (18px voice; skBar 128×12, size-10 40×40 — pixel-exact), the stamps
  (sm rung, dark bridge, alias vars, auto-stamps-nothing), the anatomy (aria-hidden every
  block; muted ground 0.9551 — consistent with my earlier --jx-muted reads), LAW #19 (zero
  twins, guard live), and the dead-utility re-hosting (her 527×0 staging catch; my live scan:
  zero dead-class elements on real nodes).
- **ADDITIONS (mine, not in report 32)**: the background-image: none receipt (the "not a
  shimmer" claim proven by the ABSENCE of any gradient to sweep — her brightness-only
  assertion, now instrumented); the shells mounted-children census (24 blocks: card 4 / list
  8 / table 12, keyed eaches with defined unique keys — the LAW #18 surface her probe did not
  enumerate); and the real-scroller instrument note (window.scrollTo is a no-op on this
  layout — .jx-shell-body is the scroller; my first shells probe found zero panels until I
  scrolled the right element).
- **HER OPEN QUESTIONS, updated**: (1) the dead-utility corpus sweep — worth running, and the
  cheap instrument is a per-page live querySelectorAll over the suspect class selectors (my
  SSR-regex scan false-positived 25 hits, all escaped drawer code text — the DOM query is the
  honest form); (2) the MISSING --motion-1400/--motion-ease-in-out promotion — concurred, the
  page documents the literals as the source of record, which is the right holding state.
