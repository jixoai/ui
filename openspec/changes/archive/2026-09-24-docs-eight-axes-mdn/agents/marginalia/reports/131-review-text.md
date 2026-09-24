# T131 — FIRST REVIEW text (marginalia, 2026-09-24)

- **Target**: `apps/www/src/routes/docs/components/text.html/` (page 467 + ts 16)
  over the family: text.svelte 200, the eight Raw sugars (19-21 lines each),
  text.stylex 60, defaults 66, barrel 7 + the SHARED kernel lib/text-style.svelte.ts
  135 (Text and inline-code's six-modifier resolver). **Registry twins: all checked
  files cmp-identical (family + kernel).** Vintage: HEAD 2b06c0d5; fresh build
  (dist 02:33).
- **VERDICT: NEEDS-WORK — 1 MAJOR / 0 MINOR / 0 LOW / 1 NIT. Tier 2 proposed (the
  page is one sheet-level fix away).**

## Verified TRUE with digits (my own instruments)

1. **The mark matrix — all eight forms, every paint exact.** p (no utilities, 400/
   normal/transparent), **strong 600** (the recorded settle over the UA's 700),
   **em italic**, **del line-through**, **mark** ground `oklab(0.6489 0.194139
   0.135938 / 0.18)` with padding **0.7px/3.5px = exactly 0.05em/0.25em at 14px**,
   **ins underline**, **sub/sup nothing** (fontSize 10.5px = the UA's smaller rule —
   the family adds zero). Every element is the semantic tag itself with the
   `data-jx-text` hook.
2. **Sugar ≡ base, by construction** — `<Text mark="em">` and `<Em>` render the SAME
   tag (EM), the SAME hook (`data-jx-text="em"`), the SAME class (x1k4tb9n); the only
   DOM delta is one empty Svelte fragment comment. Zero behavioral difference,
   measured.
3. **The absent-ambient law at the class level** — the playground's seat at rest
   carries `leading-[1.5] font-medium tracking-normal [font-size:14px]` and NOTHING
   for italic-off/family-inherit (the kernel emits nothing; the ambient channels
   flow). The kernel's STRING law is exactly as documented (text-style :99-134).
4. **The universal seats** — size=14 → fontSize 14px; size="large" → 18px; density
   stamps ride the roots (sm/lg); the mark·color=primary seat carries the tinted
   ground. The size axis is the root font-size lever, the modifier `fontSize` prop a
   separate name, exactly as taught.
5. **LAW #19**: 65 ids, zero duplicates. svelte-check: page **0 seats**, family
   **0 errors** (+8 fleet-noise warns). Twins cmp-identical including the kernel.

## Findings

1. **[MAJOR — the modifier playground's utilities do not exist in the served sheet:
   the live demo renders no change, in dev AND prod.]** The section's whole point is
   "the six text-modifier props, live". Measured four ways:
   - the seat computes **font-weight 400** while carrying the class `font-medium`
     (should compute 500) and **font-size 16px** while carrying
     `[font-size:14px]` (should compute 14px);
   - a RAW injected div with `class="font-medium [font-size:14px] leading-[1.5]"`
     computes 400 / 16px — the failure is sheet-level, not family-level;
   - a full stylesheet walk finds **zero rules** setting font-size/weight/family on
     the seat — the 16px/400 is pure inheritance; the classes resolve to nothing;
   - the compiled sheet grep: `.font-medium`, `.font-bold`, `font-[450]`,
     `leading-[1.5]`, `[font-size:14px]` — **absent from the 01:55 dist AND from
     this batch's fresh 02:33 build** (both vintages).
   Net effect: flipping every playground control updates the taught string (the
   drawer's usage class-list IS live — my drives mutated tracking/weight classes in
   the attribute) while the RENDER never moves. The page's own promise "the taught
   string IS the shown string" fails on the shown half; the copy's beats-ambient
   ruling ("weight replaces strong's own 600 — watch the strong row") demonstrates
   nothing (strong stays 600 through every drive). Root shape: the six modifiers are
   composed at RUNTIME (template interpolations the Tailwind scanner can never see)
   and the page's scanner-feed comment block (:201-211, citing the "app.css jx-html
   block precedent") is not feeding the compiled sheet — the utilities must be fed
   where the scan actually reads (the app.css block the comment itself cites), or
   the kernel must emit inline styles/vars instead of utility classes. The kernel's
   pure resolver is correct and stays; the feed is the fix. (inline-code shares the
   kernel — its modifier props are dead the same way; the family edit lands once.)
2. **[NIT — "the UA baseline shift is the law" is mechanism-loose under preflight.]**
   sub/sup compute fontSize 10.5px (the UA smaller rule) but vertical-align
   **baseline** — the visible shift comes from the app's preflight reimplementation
   (position-relative + top), not the UA vertical-align. The family-adds-nothing
   claim is TRUE either way; one word ("the UA-baseline-shift law, preflight-
   reimplemented") would arm the next prober.

## What survives the MAJOR

The matrix, the equivalence law, the sugar set, the universal seats, the a11y row
(semantic elements, not styled spans) are all stylex/family-side and all TRUE — the
MAJOR is confined to the six-modifier utilities' sheet presence, the shared kernel's
consumers (Text's playground + inline-code's chips). The fix is build/feed-level;
the page copy needs no rewording once the utilities land (the taught-string law is
already correct).

## Tier proposal

**Tier 2 proposed** — the archetype is right and the family is clean; the MAJOR is
a single feed fix away (one located blocker, no architectural rework). Re-tier after
the sheet lands.

## Probe-fault ownership

1. My first modifier drive used `#modifiers select` index positions that do not
   match the dock's DOM order — I fed values to the wrong controls and briefly read
   the resulting class churn as state changes; caught by the computed-style column
   refusing to move, re-driven through evaluate-dispatch with the diagnostics below.
2. The first sheet-scan's escape patterns missed escaped selectors; the second pass
   used matches()-based walking (zero hits) plus a raw computed probe (authoritative)
   plus the dist greps (fixed-string, verified against the built assets) — the
   triple is what makes the MAJOR solid.
3. The italic toggle drive reported toggled:false (my switch finder keyed on
   role/aria-checked which the kit's toggle may not carry) — italic is therefore
   receipted only at the class level (absent at rest), not through a live toggle.

## Gate record

- svelte-check (ONE run, saved): page **0 seats**; family **0 errors** (+8 fleet
  warns); the kernel text-style clean.
- Fresh build rc=0 (dist 02:33, ≥ 2b06c0d5) — and the build is itself evidence in
  the MAJOR (the utilities absent from the fresh prod sheet too). **verify:docs
  rc=0**; docs-universal **110/110**.
- Process: port 5244 mine, killed (lsof rc=1 empty); NO commits/pushes/fixes.
  Artifacts: /tmp/marginalia-131-text.mjs, /tmp/m131-textdiag.mjs,
  /tmp/m131-textdiag2.mjs.
