# T39 — progress.html FIX (NEEDS-WORK closure, 1st review round)

**Tier: 1 — prose/claims fix.** No structure changed; the re-author is confined to the two
clocks story and the api meta arithmetic, all receipts re-measured by me with the burst
instrument. Zero product-tree edits; one page file touched.

## The falsification, owned

My T34 page claimed the determinate fill's authored `transition: width 200ms
cubic-bezier(0.22, 1, 0.36, 1)` was INERT ("jumps 10% → 87% within the first frame in normal
AND reduced modes") — an instrument artifact: my single capture was taken ≥200ms after the
set, so it saw two settled bars. marginalia's burst instrument falsified the claim; this task
re-measures with my own burst implementation and re-authors every site of the old claim.

## The re-verification — burst instrument, multi-run, ranges quoted

**Instrument (named):** clip screenshots of the determinate bar burst-captured at ~33ms
cadence (playwright `animations: 'allow'`), each frame decoded through an in-page canvas,
fill-edge traced per frame (rightmost fill-green pixel, sum-distance < 90), timestamps from
the page clock sampled after each capture; 0.10 → 0.87 value jump; runs: 3 normal + 3
reduced-motion (emulated) + 1 discriminator. Frame timestamps are lower bounds on motion
time (sampled post-capture) — the envelope comparisons are between like runs, basis
consistent.

- **NORMAL (3/3 runs):** baseline edge 0.098; first moved frame at 32–53ms already mid-tween
  (~0.36); settled by 82–99ms (final edge 0.748). A real decelerating tween inside ~150ms of
  paint — NOT a first-frame jump. Authored 200ms envelope governs (the decelerate shape
  matches cubic-bezier(0.22, 1, 0.36, 1): most travel in the first third).
- **REDUCED (emulated, 3/3 runs):** moved by 32–36ms, settled by 98–103ms — **the visible
  tween PERSISTS under the RM kill** (the unlayered `:where(...) { transition: none }` wins
  the cascade — computed kills the css transition — yet the paint keeps tweening;
  engine-side smoothing is css-unreachable). Within instrument noise of the normal envelope.
- **Discriminator (3s linear injected, reset tween given 3.4s to settle first):** edge climbs
  LINEARLY 0.103 @ 33ms → 0.286 @ 750ms — slope 0.000255/ms ⇒ full span ≈ 3.0s — and is
  still moving at 750ms. The css transition channel on `::-webkit-progress-value` is LIVE
  and governable; the authored rule is neither dead nor droppable (review's open question 1
  stays moot). Computed-style probe on the pseudo read `0s` — the known computed lie; the
  pixels decided.
- **Sweep receipts (live):** computed `animation: 0.9s linear infinite` /
  `jx-progress-run` normal; **4s** under the same RM emulation that left the fill tween
  intact — the two clocks split under RM exactly as the re-authored page now says.
- **Basis note (instrument honesty):** the traced edge is a fraction of the CLIP width
  (448px) while the painted track is ~391px at capture time (a stable post-load container
  settle of ~56px happened once, before all runs; base/final constants across all 7 runs) —
  the factor cancels in every timing receipt. Row census at settle: 1px border-AA, 335px
  fill-green, 56px track, 56px page background.
- **duplicate-id hard assert:** NONE page-wide (institutionalized, re-run in the same
  probe).

## Page changes (one file)

`apps/www/src/routes/docs/components/progress.html/+page.svelte` — six sites:

1. **Overview ¶2 re-authored**: "TWO clocks, and both are live" — the indeterminate sweep
   (0.9s → 4s RM) + the value clock (fill tween live, persists under RM, css-unreachable
   engine smoothing) + the instrument note (single capture ≥200ms reads "inert"; burst is
   the truth instrument for paint transitions). The old "jumps within the first frame in
   normal AND reduced modes" claim is GONE.
2. **Motion axis row re-authored**: "TWO LIVE CLOCKS, BOTH OFF THE AXIS" with the multi-run
   burst ranges (32–53/82–99ms normal; 32–36/98–103ms RM) + the 3s-linear discriminator.
3. **A11y row re-authored**: `prefers-reduced-motion` → "split, measured": sweep slows to
   4s; fill tween NOT fully suppressible (visible tween persists; burst-measured, 3 runs).
   The falsified "the inert fill transition is killed outright" is GONE.
4. **Receipts note re-authored**: the two live clocks with my multi-run ranges + the
   single-capture limitation named; re-measure date credited (task 34 → burst re-measured at
   task 39).
5. **LOW — api arithmetic fixed**: the summary now says the meta carries "12 NAMED entries
   (value, max, label, the eight axes, class) and no rest key — the component is rest-less:
   undeclared attributes are dropped, not spread, and the element's role and value semantics
   are native, not forwarded." The old "11 named + the synthesized rest" arithmetic and the
   "attributes ride through natively" forwarding conflation are GONE.
6. **Hero pill + axes-section summary**: "two clocks, measured" → "two live clocks,
   measured"; "the Chromium-inert fill transition" → "the fill's burst-measured tween that
   persists under reduced-motion".

Survivors kept untouched (verified TRUE by the review): density paint-invariance, radius
seam 4/9px, frozen-ink third instance, native a11y receipts, grep receipts, toc 9/9.

## INFO — probe route disposition (no action)

`src/routes/probe-timeline-progress/` is NOT an untracked leftover: it is tracked-clean at
HEAD (committed in `aab5adf9`, the timeline/scroll-area/press r2 round — before my T34) and
pinned by `src/lib/surface/routes.stylex.ts:1199` ("39 at pin"). Not mine, referenced — left
in place, keyed for the orchestrator's sweep.

## Gates (repo root)

- `verify:tailwindless` rc=0 — VERBATIM receipt: `files=2 identities=7 occurrences=7
  zones={routes:1, site-libs:0, ui:6} forms=42` (pin intact).
- `verify:docs` rc=0 — skeleton lint green.
- `verify:docs-universal` rc=0 — 110/110.
- page-scoped svelte-check: **0 diagnostics on progress.html/+page.svelte** (fleet exit 1 is
  the pre-existing debt the review already keyed: family :61/:153 Object.entries, :123
  warns, scenes/progress ×1 — all unchanged files).
- Ambient solos (progress-adjacent pair, apps/www): `batch2-components` +
  `defaults-overlays` — **2 files, 37/37, exit 0**. Working-tree attribution: my
  progress page + quill's in-flight `system-dialog.html` (+page.svelte/+page.ts) +
  `test/fixtures/docs-ambient-vocabulary.matrix.json` (keyed, not mine) — no sheet noise
  reproduced in this round's pair.
- SSR of the rebuilt page: `burst-measured` ×5, `12 NAMED entries` ×1, old claim ("only one
  animates") 0 occurrences, h1 ×1, toc 9/9 order PASS.

## Process evidence

- Port **5242**: lsof **empty before** (rc=1); started by npm wrapper (PID 1704) → vite
  listener (PID 1736); after gates killed BOTH by PID; `lsof` after: empty, **rc=1**.
  (An unrelated foreign rustc pair surfaced during PID lookup — another session's build;
  untouched.)
- **NO commits, NO pushes.** Probe injections (3s discriminator style tag) removed via
  handle before teardown; sibling files untouched.
- Instrument faults caught and fixed BEFORE conclusions ran (three, in the open): a
  node-scope leak into `page.evaluate`, a clip captured mid-smooth-scroll (rect read moved
  behind a settle + a box-stability assert), a settle metric anchored on the wrong constant
  and a discriminator whose reset tween was still mid-flight (the 3.4s settle). The v2
  receipts above are the ones that survived those fixes.
- Artifacts: /tmp/ptp-burst.mjs, /tmp/ptp-burst2.mjs, /tmp/ptp-basis.mjs,
  /tmp/ptp-ssr2.html, /tmp/g39-{tw,docs,uni,scheck,ambient}.txt.
