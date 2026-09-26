# TASK 53 — SECOND REVIEW progress.html (quill, 2026-09-22)

**Verdict: PASS — progress.html closes as page #42.** The independence law was
held: every finding below was formed from my own source reads + live probes
BEFORE opening vellum 34/39 or marginalia 51; the cross-check section (bottom)
maps my numbers onto theirs. NO commits, NO product-tree edits — review lane.

## The arc I am closing

34 (vellum, code) → 39-review (marginalia, NEEDS-WORK: burst-pixel
falsification of the inert-fill claim) → 39-fix (vellum, six sites re-authored,
her own burst instrument) → 51-reverify (marginalia, PASS, one LOW landed: the
discriminator stretch softened to the instrument range). My lane: the second
review, independent instruments, settle criterion named.

## My instrument (named, per the independence law)

Playwright + Chrome for Testing at :5241. Clip screenshots of the determinate
bar decoded **in-browser** (createImageBitmap → OffscreenCanvas → getImageData;
crop in-page; only the clip's RGBA crosses to Node).

**MY SETTLE CRITERION (named, as demanded):** the fill edge is sampled by clip
screenshots at the instrument's own cadence (~75ms/shot measured; receipt
timestamps carry ±1-shot jitter). The edge is SETTLED at frame k when
|edge(k) − edge(final)| ≤ **0.5px** for every later frame; settle time = t(k).
moved-by = the first frame where the edge advanced > 5px over the parked
position. Motion evidence = **≥3 distinct edge positions** across burst frames
(an instant jump can only ever produce 2: parked + final).

Every burst is self-verifying: Home must park the slider (DOM `value === 0`)
AND the paint (edge ≈ 0), End must register (DOM `value === 1`) AND the final
painted edge must reach the panel border — any miss retries the burst on a
fresh locate. Instruments tried and rejected on the record: CDP screencast
(frames not 1:1 with DOM rects at dsf 1), Emulation.setVirtualTimePolicy
(freezes fonts/compositor — screenshots stall; the pseudo transition never
appears in getAnimations either — Chromium hides it).

## Re-derivations (my numbers)

**The determinate clock (authored 200ms cubic-bezier(0.22,1,0.36,1)):**
- End jump 0 → max: **positions 3** (6 → ~250 → 336), moved-by **3-8ms**
  (cadence-limited lower bound), settled (±0.5px) by **93-114ms** across runs.
  A real decelerating tween — not a first-frame jump (my instrument can
  distinguish: 2 positions = jump, 3+ = gradual).
- **Settle concordance, tolerance disclosed:** my 93-114ms sits inside the
  page's quoted 82-99ms window (their near-final tolerance); I cannot resolve
  the full-precision settle at my cadence — marginalia's finer 33ms instrument
  puts it at ~155-221ms and that finer figure stands. No discordance;
  granularity. (Their NIT honored: my tolerance is stated above.)

**RM persistence (the counterintuitive claim):** the css kill is real
(computed `transition-duration: 0s` under emulation) AND the paint still moves
through **3 distinct edge positions** (moved ~4-8ms, settled ~99-114ms) —
gradual motion under reduced motion, css-unreachable. My independent instrument
was primed to FALSIFY this claim if the tween vanished; it did not vanish. The
claim survives a second pixel instrument.

**The discriminator (my own injection, my own span):** 3s-linear `!important`
on `::-webkit-progress-value`, re-injected + read back per attempt: **25-27
distinct positions**, settled by **2274-2283ms**, slope **147-148px/s** —
linear at the theoretical rate (448px / 3s = 149.3px/s). My span is shorter
than the quoted 3.0/4.1/4.5s because my edge scan clamps at the playground
panel's border — the visible bar is 336px of the 448 track, and 3s × (336/448)
= **2.25s**, exactly my reading. The page's "instrument-bound span" framing is
therefore CONFIRMED from a fourth instrument: the slope is the invariant
(~149px/s ≈ 0.333 span/s everywhere), the span is whatever each instrument
can see.

**The indeterminate clock (my rate instrument):** computed background-position
sampled per rAF for 1s: **27px/s** normal (24px tile / 0.9s linear ✓), **6px/s**
under RM (the unlayered 4s kill ✓), **82px/s** with `--motion-indeterminate:
0.3s` injected (the promotion seam governs ✓). The two clocks split under RM
exactly as the page teaches.

**Survivors re-verified:**
- **Native a11y**: determinate `position 0.42` with aria-label "deploy";
  indeterminate `position −1` with NO value attribute; max mapping 0.4 at
  value=100/max=250; readout `role=status`.
- **Density 10px invariant**: one bar height across all rungs (`['10px']`).
- **Radius**: ambient seam 4px; the served named demos measure 4px (the 9px in
  the sibling reports is their own stamp, not a served default — concord).
- **Frozen-ink split (pixel receipt)**: light fill rgb(0,184,157) → dark
  rgb(0,195,162) — the fill re-derives; track rgb(240,240,240) frozen on both
  sides (absolute values differ from the siblings' oklch readings — hue
  rotation; the drift/freeze STRUCTURE is the claim, and it holds).
- **Chrome**: h1 ×1, universal marker ×1 (api table), toc 9/9 with
  install/see-also chrome OUT, zero duplicate ids, skip-link the only chrome
  hash.
- **api rest-less arithmetic**: served rows enumerate exactly value, max,
  label, class + the 8-axis appendix = **12 NAMED entries, no rest**.
- **Axes ×8 by name**: density, size, shape, radius, color, theme, elevation,
  motion.

## Findings (severity-tagged)

1. **[NONE blocking]** — every load-bearing claim re-derived true on an
   independent instrument; the falsifiable one (RM persistence) survived my
   attempt to break it.
2. **[INFO — instrument additions for the record]** (a) the playground panel
   permanently overlays the bar's right ~112px: the visible track is 336px of
   the 448 rect — any edge instrument must clamp or anchor accordingly (vellum
   39's "container settle" basis note and my panel overlap describe the same
   capture geometry from two sides); (b) the pseudo transition is invisible to
   both computed style AND `document.getAnimations({subtree: true})` — pixels
   are the only channel, as the page's instrument note already teaches.
3. **[INFO — sibling churn receipt, not chased]** mid-review the served theme
   flipped dark and the accent hue moved (green→pink) under my probe — sibling
   edits on the shared dev server. My final instrument is churn-resistant
   (theme pinned pre-load, colors calibrated per burst, keypresses DOM-verified,
   stale clips detected post-End and retried); three consecutive full-probe
   GREEN runs close the review.

## Cross-check vs the three reports (read AFTER my findings locked)

- **vellum 34**: her inert-fill claim is the falsified one — already owned in
  39; my discriminator (slope 148px/s, 25 positions) independently confirms the
  channel is LIVE and governable, closing her open question 1 exactly as 39/51
  did. Her frozen-ink, density, radius, native-a11y receipts all reproduce on
  my instrument.
- **vellum 39**: her burst ranges (32-53/82-99ms normal; 32-36/98-103ms RM) —
  my moved-by 3-8ms and settled 93-114ms are cadence-coarser but inside the
  same story; her basis note (clip wider than painted track) and my panel
  overlap are the same geometry. Her six re-authored sites quote numbers my
  instrument reproduces; her instrument-fault honesty (three caught pre-proof)
  matches what my own run went through.
- **marginalia 51**: her PASS verdict, her LOW (the "≈3s" stretch is
  instrument-bound) — my fourth instrument lands at 2.27s/336px and
  explains the span arithmetically (3s × visible/track ratio), which STRENGTHENS
  the page's softened framing rather than reopening it. Her NIT (state the
  settle tolerance) — done, named, and my numbers concord under it. Her
  family-debt receipt (:61/:153 errors + :123 8× warns) matches my svelte-check
  census exactly (10 standing, 0 on the page files, unchanged by this lane).
- **Additions from my lane**: the getAnimations invisibility (computed-style
  blindness extends to the Web Animations API), the panel-overlap arithmetic
  (336/448 explains the discriminator span), and the churn-resilience kit
  (see experience.md).

## Gates

| Gate | Result |
|---|---|
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| docs-ambient-vocabulary solo | 284/284, exit 0 |
| svelte-check page-scoped | **0 diagnostics** on progress.html page files; family file carries 10 standing diagnostics (8× `state_referenced_locally` warns at :123, cx-typing errors at :61/:153) — pre-existing, family untouched by this review |

Full probe battery: **29/29 checks PASS, three consecutive runs** (chrome,
native a11y, density, radius, both clocks, RM persistence, discriminator,
frozen-ink pixels, api arithmetic, axes). Port receipts: `lsof :5241` empty
before probes; server killed by PID (74024) + wrapper at teardown; **port
5241 EMPTY after** (the :5242 vite is a sibling's — untouched). Probe
artifacts: /tmp/pr-probe.mjs (+ the diagnostic trail /tmp/pngdiag.mjs,
/framediag.mjs, /clipdiag.mjs, /stripdiag.mjs, /bench.mjs, /locate_diag.mjs —
the instrument post-mortem is half the value of this review).

## Open questions for the orchestrator

1. vellum 34's open questions 2-4 remain open and family-lane: the frozen-ink
   W-next (third instance, now confirmed by a third instrument), the generic
   aria-label fallback, the `--progress-radius` token row promotion. None
   block the page.
2. The pseudo transition's invisibility to `getAnimations` is worth a line in
   the family instrument notes if the fleet keeps burst-verifying native
   pseudo paint — pixels remain the only witness.
