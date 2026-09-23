# TASK 51 — RE-VERIFY progress (marginalia, 2026-09-23)

- **Reviewer**: marginalia (re-verifying MY OWN task-39 NEEDS-WORK against vellum's fix at
  `269db8c0`; self-continuation standard: the falsification is mine, so the fix is checked
  against the instrument that produced it. The coder's fix report `39-progress-fix.md` NOT
  read — the review surface was the fix diff + the served page + my own re-derivations).
- **Fix scope (git)**: `269db8c0` touches ONLY the page (`+page.svelte`, +41/−21) — family
  files untouched, exactly as the fix should. Six claim sites re-authored; the api summary
  rewritten.
- **VERDICT: PASS — the re-verify passes.** Every finding of my task-39 review is addressed;
  my re-derivations with the same burst instrument agree with the page's new numbers within
  sampler granularity. The page proceeds to its 2nd review (quill's lane).

## The MAJOR (inert fill falsified) — ADDRESSED AND RE-VERIFIED

### The six re-authored sites (all verified in SSR + live)

1. **Motion axis row** — "TWO LIVE CLOCKS, BOTH OFF THE AXIS … the determinate fill's
   authored 200ms decelerate is LIVE — burst-measured (3 runs, clip frames decoded in-page):
   the edge moves by 32–53ms and settles by 82–99ms, and the tween PERSISTS under
   reduced-motion (moved 32–36ms, settled 98–103ms — the engine's smoothing is
   css-unreachable); a 3s-linear injection stretches the paint to ≈3s".
2. **Hero pill** — "two live clocks, measured".
3. **Overview ¶2** — "both are live … mid-tween at ~35ms … not a first-frame jump … PERSISTS
   under reduced-motion … css-unreachable — a reduced-motion user still sees the fill
   animate. **Instrument note, carried honestly: a single capture taken ≥200ms after the set
   sees two settled bars and reads 'inert' — burst capture is the truth instrument**".
4. **Axes summary** — "Two live clocks … burst-measured tween that persists under
   reduced-motion".
5. **Receipts note** — full numbers + "the fill-clock burst receipts re-measured at task 39".
6. **A11y row prefers-reduced-motion** — value now **"split, measured"**: "the css transition
   is killed outright yet the visible tween persists (engine-side smoothing,
   css-unreachable; burst-measured across 3 runs)".

Old-claim census on served SSR: "INERT in Chromium" 0 · "jumps 10%" 0 · "only one animates"
0 · "11 named" 0. (One "killed outright" string remains — inside the NEW a11y sentence, with
the correct referent: the css TRANSITION is killed; the visible tween persists.)

### My burst re-derivation (the task-39 instrument, re-run: 3 runs × 3 modes)

- **NORMAL** — clean full trace (run 2): edge **0.362 @ ~20ms, 0.685 @ ~56ms, 0.808 @ ~89ms,
  0.85 @ ~123ms**, settling **0.866** by ~155–221ms. Runs 1/3 landed their first frame at
  62–71ms already mid-tween (0.685/0.763) — same story, coarser sampling. A real
  **decelerating** tween inside the authored `200ms cubic-bezier(0.22,1,0.36,1)` envelope
  (family css unchanged — re-read). Agreement with the page's "moves by 32–53ms, settles by
  82–99ms": mid-tween yes (my 20–56ms frames are mid-tween); settle-by is tolerance-dependent
  (my 89ms frame is 92% of the span; full precision by ~155–221ms) — within sampler
  granularity + settle criterion, receipted as the NIT below.
- **REDUCED** (emulation verified, `rm: true`) — the tween **PERSISTS**: 0.362 @ ~24ms,
  0.685 @ ~64ms, 0.808 @ ~97ms, 0.85 @ ~129ms, settling by ~163–228ms — the same envelope as
  normal mode, css kill notwithstanding. This was my falsification's second half; the page
  now teaches it.
- **THE DISCRIMINATOR** — 3s-linear `!important` injection on `::-webkit-progress-value`:
  the paint stretches to a **slope-consistent LINEAR crawl** (0.373 @ ~28ms → 0.422 @ ~324ms
  → 0.493 @ ~724ms; pairwise slopes ⇒ effective span ≈ **4.5s** on my instrument; my task-39
  run read ≈4.1s the same way) versus ~200ms uninjected — a >20x stretch. **The css
  transition channel on the pseudo GOVERNS the paint — live, not dead code.** And throughout,
  `getComputedStyle(el, ':: -webkit-progress-value')` reads **0s/ease** (transition) and even
  the TRACK color for the fill's background — the computed read is blind to the pseudo's live
  channel in both modes, injected and not. Pixels decide; the page now says exactly this.

### Survivors — untouched and re-verified (the fix claims they are; they are)

- **Density invariance**: bar height **10px at all five rungs** (2xs·xs·sm·default·lg),
  corner 4px, readout voice 12px — constant.
- **Radius seam**: ambient **4px** → `--progress-radius: 9px` stamped → **9px** → restored
  **4px** (live-DOM probe, restored).
- **The frozen-ink seam, third instance**: under a real injected `.dark` island (restored
  after): `--primary` re-derives **oklch(0.6489 0.237 …) → oklch(0.7044 0.1872 calc(… − 4))**
  — L/C signatures exact; the absolute hues read 149/154 this pass vs my task-39's 133/129 —
  the site-local wall-clock hue rotation, expected (quote L/C, never hue digits). Track
  **oklch(0.9551 0 0)**, frame **oklch(0 0 0)**, label ink **oklch(0.3211 0 0)**, value ink
  **oklch(0 0 0)** — all frozen, both sides.
- **Native a11y**: indeterminate has **no value attribute** and `position === −1`; the AX
  tree (CDP) exposes the indeterminate bar's value as **null**; the 100@max=250 set exposes
  **position 0.4** and the AX progressbar value 100; the readout is `role="status"` with text
  **"42%"**; the generic `label ?? 'progress'` fallback still in the family (:155) with the
  anchoring note on the page.
- **Chrome**: toc **9/9** (overview, live-demo, progress-base, types, usage, theming, api,
  universal-props, accessibility), every href resolves, **zero duplicate ids** (SSR + live),
  h1 ×1.

## The task-39 LOW (api arithmetic) — ADDRESSED AND VERIFIED

The api summary now reads: "The generated meta carries **12 NAMED entries** (value, max,
label, the eight axes, class) and **no rest key** — the component is **rest-less**: undeclared
attributes are dropped, not spread, and the element's role and value semantics are native,
not forwarded." Served-row enumeration: `#api` renders exactly **value, max, label, class,
size, shape, radius, density, color, theme, elevation, motion** — 12 named rows, **no rest
row** — and `#universal-props` renders the 8-axis fold. The conflation clause
("the rest … ride through natively") is gone. Exactly the reword my review asked for.

## The task-39 INFO (probe route) — ADJUDICATED

`probe-timeline-progress` still carries its diagnostic (1 in the fleet log) — but the fix
commit records the orchestrator's ruling: tracked at HEAD, pinned by
`routes.stylex.ts:1199`, referenced infrastructure, left in place. Receipted as adjudicated;
not a failure of this fix.

## Findings (severity-tagged)

1. **[LOW — the injected-span numeric reads high on the burst instrument]** The page says the
   3s-linear injection "stretches the paint to ≈3s"; my instrument measures the effective
   paint span at **≈4.5s** (pairwise-slope-consistent; the task-39 run read ≈4.1s — a stable
   reading). The mechanism claim is verified (injection dominates the paint; the channel is
   live and css-governed; linear), but the "≈3s" is optimistic against my sampler — engine
   tail and capture-latency attribution are candidate explainers. Either soften to
   "stretches the paint to seconds-scale (measured ≈3–4.5s across instruments)" or re-slope
   with CDP capture timestamps. Does not block: the discriminator's evidentiary role survives.
2. **[NIT — the settle criterion matters]** "settles by 82–99ms" is true against a near-final
   tolerance (my trace: 92% of the span at 89ms, final precision by ~155–221ms). Reviewer 2's
   instrument should state its settle tolerance when re-deriving, or the numbers will look
   discordant when they agree.
3. **[NONE]** otherwise — the MAJOR is fully addressed; no new defects introduced by the fix
   (page-scoped svelte-check stays 0).

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 2495 files) | **page (progress.html) 0 diagnostics**; family debt pre-existing and unchanged (:61/:153 errors + :123 8× warns + scenes/progress :16 — family untouched by the fix); fleet 1569/1028/607; quill's table.html and vellum's separator.html in flight contributed **0** log lines (receipted) |
| Raw SSR | old-claim census 0 (the one "killed outright" string is the new a11y sentence's correct referent); new-claim phrases all present; toc 9/9; dups 0; h1 ×1 |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 52902 / pgid 52899) → vite killed by
  pgid TERM + straggler -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** All live mutations (value sets, the
  radius stamp, the `.dark` island, the 3s style injection) restored in-probe or by reload.
- Independence: the coder's fix report not read; findings fixed from the fix diff + served
  page + my own instrument before any coder receipt was consulted.
- Instrument honesty: the first burst attempts failed on clip coordinates (the docs
  scroller's smooth behavior defeats naive scrollIntoView rect reads) — resolved with the
  task-39 pattern (CDP scrollIntoViewIfNeeded + locator.boundingBox); one probe artifact
  (RUN3's "first-moved" mislabel) is disclosed in the traces above; the settle-tolerance
  dependence is receipted as the NIT rather than hidden.
- Artifacts: /tmp/marginalia-51-burst.mjs, /tmp/marginalia-51-probe4.mjs,
  /tmp/marginalia-51-ssr.html, /tmp/marginalia-51-{ambient,universal,scheck,dev}.log.
