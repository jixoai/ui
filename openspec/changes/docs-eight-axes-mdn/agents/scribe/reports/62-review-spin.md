# TASK 62 — FIRST REVIEW spin (scribe, 2026-09-24)

- **Reviewer**: scribe (1st of 2; independence law held — vellum's report 41 was opened
  only AFTER the findings below were fixed by my own source reads + live probes; the
  concordance addendum follows at the end)
- **Target**: vellum's page — `apps/www/src/routes/docs/components/spin.html/`
  (+page.svelte 759 lines + +page.ts, 11 toc entries) over the spin family
  `apps/www/src/lib/ui/spin/` (svelte 542 / stylex 65 / css 49 / defaults 104 / catalog /
  barrel). Integrated at 2a26eb96 with the drift #12 family-comment fix; target paths
  clean in the working tree; the in-flight sibling set untouched.
- **Method**: source reads (page, family svelte/stylex/css/defaults, the
  `--jx-primary: var(--primary)` alias chain in tokens.stylex :62), headless Chromium over
  dev SSR :5243 with warm-reload discipline, rAF opacity sampling, emulateMedia
  reduced-motion flips, a scoped-.dark island probe with hue-invariant assertions, the
  query seat driven across 48rem, SSR payload parse, the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 1 LOW (family-lane hydration noise) / 0 NIT.
  Every dispatched headline verified TRUE on my own instruments; the drift #12 mirror fix
  verified byte-identical.

## The headline claims — verified TRUE (my own instruments)

1. **OPACITY ONLY — VERIFIED with the negatives.** rAF sampling of a mid frame (the
   growVertical seat, 'both' slot shape) over 1.4s: **85 samples, min 0, max 1** (the full
   range oscillates; 15 nonzero — the both-shape holds ~a quarter cycle solid), while the
   computed negatives hold on the same element: **transform: none, background
   rgba(0,0,0,0), transition-duration: 0s**. Opacity is the only animated channel; no
   gradient, no transform, no transition anywhere.
2. **THE FLAT ENGINE — VERIFIED digit-exact.** Exactly **ONE `style[data-jx-spin-frames]`**
   in head holding **12 accumulated @keyframes rules** (the growVertical
   **jx-spin-f10-i120-l120-both** and the dots **jx-spin-f10-i80-l160-end** both present)
   after the whole page — dozens of instances across many parameter sets — mounted
   (idempotence observed at the census level). The seat: **10 frames** mounted, per-frame
   vars `--kf/--dur/--d` with the NEGATIVE delay ladder **−1200ms (frame 0) → −120ms
   (frame 9)** over the **1200ms** cycle; computed animation **jx-spin-f10-i120-l120-both,
   1.2s, delay −1.2s, linear, infinite**; the cursor computes **white-space: pre** (the box
   never breathes).
3. **RM ON BOTH NAMED CHANNELS — VERIFIED LIVE, both directions.** Emulated reduce: the mid
   frame's animation-name → **'none'** with the base face (frame 0 opacity 1, mid opacity
   0), AND the svg instance's **`animationsPaused()` → true**. Un-reduce: the keyframe name
   returns AND **animationsPaused() → false** — the matchMedia listener pauses the SMIL
   clock live, the static CSS kill lands on the text frames, zero JS in either restore.
4. **THE ROOT-PINNED ALIAS — VERIFIED with my own island probe, hue-rotated.** Baseline ink
   **oklch(0.6489 0.237 178)** — vellum's literal 154 hue is her wall-clock sample; L/C are
   the invariants. Scoped `.dark` island: the scope's `--primary` **re-derived** to
   oklch(0.7044 0.1872 …) while the computed ink **HELD** 0.6489/0.237/178 — the alias
   substitutes at :root before inheritance. Root-level `html.dark`: the ink **FLIPPED** to
   0.7044/0.1872 (H 174). Restored exactly. The same L/C flip family as progress's
   frozen-ink instance, measured on this page's served DOM.
5. **LANES-VS-PASSTHROUGHS — VERIFIED.** The query seat rides the DENSITY lane: the seat
   span stamps **data-density="lg" @1280 → "sm" @600** (live, both directions) while bare
   siblings stamp nothing (nulls in the same census — the zero-opinion rung discipline
   visible). `size` is the family's own `number | string` hybrid (Props :264) — no
   QueryResult in the type, the named/auto/query lanes unadopted per spin-defaults — the
   boundary holds by construction.
6. **OMISSION CENSUS + RULER — VERIFIED.** The bare inline posture's full attribute list is
   exactly **[data-jx-spin-inline, class, role, aria-label]** — no data-density (auto
   stamps no rung), no style attr (carriers resolve absent). The absent-size svg paints
   **`width: var(--jx-icon); height: var(--jx-icon)`** inline (the ruler; attrs cannot
   carry var()); an explicit size lands as the width/height **attribute** ("24px") with no
   style; a NUMBER size additionally stamps the §1 carrier
   (`--jx-size-effective: 28px; font-size: var(—jx-size-effective, 1rem)` measured).
   **Zero `--jx-*-effective` readers** over all six family files (grep receipt).
7. **DRIFT #12 — VERIFIED FIXED AND BYTE-IDENTICAL.** spin-defaults' density slot now
   reads "no family opinion on RUNG DEFAULTS — but the composed root DOES stamp
   data-density with the resolved rung (measured lg@1280 → sm@600 …)": rung-opinion
   absence distinguished from the real stamp. `diff` over all four mirrored files
   (svelte/stylex/css/defaults) against `registry/files/ui/spin/`: **byte-identical**.
8. **SSR — VERIFIED.** Payload 1,059,116 bytes; **230 prerendered frame spans** carry the
   `--kf/--dur/--d` vars (all frames prerendered, first paint = frame 0 via the base
   rules); the keyframes style element is **absent from SSR** (the only two
   `jx-spin-frames` payload hits are the drawer's css comment and the receipts prose —
   counted as text, not elements); h1 ×1; universal marker ×1; toc = the 11 +page.ts ids
   ×2 rail surfaces; 0 undefined/null literals.

## Standard battery

- **THEME-SPLIT (the six mechanisms, this family's form)**: the rung stamp (data-density,
  measured lg/sm on the seat); the class:dark bridge (source :497/:530, stamps for
  composed descendants); the root-pinned alias (P4, the ink's freeze-and-flip); the §1
  carrier on number size (measured); the density RULER as the live consumer
  (var(--jx-icon) edge); zero effective-readers (the supply stays supply). The wrap
  posture's pill rides popover tokens (TokenTable).
- **Vocabulary-grep**: zero `jxoai` misspellings family+page; zero stale `data-theme` in
  the family.
- **KEYED-EACH + mounted children**: the gallery each keys on `(name)` — **11/11 cursors
  mounted**; the flat engine's frame each keys on index over the static frames array
  (10/10 on the seat); zero console errors in-session besides the LOW below.
- **EXTRA-lane by name**: api serves all 8 rows (spinner/label/size/interval/linger/
  lingerType/children/class); the axes table serves its 8 measured rows; the receipts
  paragraph's numbers all reproduce.
- **LAW #19**: **81 ids, zero duplicates**.
- **Gates**: ambient solo **284/284 rc=0** · docs-universal **110/110 GREEN** ·
  svelte-check **page 0 diagnostics** (fleet 1564/1028 in 604 files is the in-flight
  sibling set + ambient debt).

## Findings (severity-tagged)

1. **[LOW — hydration_html_changed console warnings, family lane]** Every load of the page
   logs repeated svelte `hydration_html_changed` warnings at the `{@html scopedPayload}`
   sink (spin.svelte :319/:464): the module-level `svgInstanceSeq` suffix counter diverges
   between the server render and client hydration, so some svg instances' namespaced SMIL
   payloads differ across the hydration boundary and Svelte keeps the server nodes.
   Visually benign (the SSR-scoped ids are self-contained and the loaders run — P3's
   pause/resume rode them), and `{#key}` rebuilds re-mint client-consistent suffixes — but
   it is console noise on every load and a hydration-hygiene wart for the family owner.
   Same salt-the-counter shape as table's W-next #11. Not a page blocker.
2. **[NIT — carried observation, no action]** The keyframes registry grows one rule per
   distinct parameter set (12 here, bounded by rendered variety) — her OQ3's bound noted,
   fine forever at doc scale.
3. **[NONE]** — no MAJOR, no MINOR on any dispatched claim.

## Process evidence

- Port **5243**: lsof empty before the run; vite killed by **PID 53784 + wrapper 53754**
  (`npm run dev --port 5243 --strictPort`); `lsof -nP -iTCP:5243 -sTCP:LISTEN` → **empty,
  rc=1** after.
- **NO commits, NO pushes; zero product-tree edits.** Media emulations and the island/root
  dark classes were reverted in-probe (restored ink re-read); siblings' in-flight files
  untouched.
- Independence: vellum 41 opened only after the findings above were fixed; concordance
  follows.
- Instrument honesty: my first island probe anchored `.panel` (stylex hash — zero hits)
  and crashed; re-anchored on the spin's own parentElement. My first hue assertion used
  her literal 154 — the served page rotates the brand hue (my sample H 178, L/C
  identical); re-asserted the L/C invariants per the wall-clock discipline (the +24 drift
  matches my press-button samples).
- Artifacts: /tmp/scribe-62-probe{1,2,3}.mjs, /tmp/scribe-62-ssr.html,
  /tmp/scribe-62-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading vellum's report 41)

My findings above were fixed before this section.

- **FULL CONCORDANCE — every overlapping receipt reproduced**: the opacity-only channel
  (her 7/32 nonzero / my 15/85 — different windows, same law; the three computed negatives
  identical), the flat engine (one style, 12 rules, the dots rule among them, name/
  duration/linear/infinite; her mid-frame −0.84s sample = my −1200…−120 ladder's frame 3),
  RM live on both channels both directions, the lg@1280 → sm@600 seat, the omission
  census (identical attribute list), the ruler inline style, whitespace-pre, the
  zero-effective-reader grep, LAW #19 none / gallery 11/11, SSR frames prerendered with
  the keyframes arriving at hydration, page 0 diagnostics, universal 110/110.
- **The root-pinned alias with numbers — concordant under the hue wall-clock**: her light
  0.6489 0.237 **154** / dark flip 0.7044 0.1872 **150**; mine 0.6489 0.237 **178** /
  **174** — L/C identical on both ends, the hue digits rotated by the same site clock as
  my press-button samples (+24). The island mechanics match: scope's --primary re-derived
  while the ink held; root dark flipped.
- **Her OQ2 (the stale density comment) = the drift #12 fix the dispatch named**: the
  served spin-defaults now distinguishes rung-opinion absence from the real data-density
  stamp, and my `diff` shows all four mirrored files byte-identical to the registry — the
  fix landed AND mirrored.
- **ADDITIONS (mine, not in report 41)**: the delay LADDER receipt (−1200…−120ms, not a
  single mid-frame sample); the rule-count idempotence census after full-page mount; the
  hydration_html_changed LOW (a console-noise finding her probe did not surface — the
  warnings post-date her pass or sat outside her battery); the §1 carrier read on a
  number-size instance; the pinned-attribute vs ruler-inline contrast on the same page;
  and the mirror `diff` receipts for all four family files.
