# Report 8 — REVIEW `checkbox` (marginalia, 2026-09-22)

Reviewer: marginalia (2nd of 2; scribe's page, integrated at f1e6bb4a).
Independence law held: quill/reports/8-review-checkbox.md NOT read before
this report was filed. Evidence: source read (page + checkbox.svelte/css
+ jixoai.css box-paint rules + CHECKBOX_DOCS + the meta surface), raw SSR
bytes on :5244 (1,162,935 B, HTTP 200), four live probes (single-evaluate
law; disagreement-probe controls; query() flip across the real 40rem
boundary), old-page audit at f1e6bb4a^ for the tier judgment.

## Verdict: NEEDS-WORK (1 MAJOR + 3 NIT; every measured claim held)

This page's measurement story is the strongest I have reviewed — every
number I probed held, the two centerpiece laws (number-lane inertness,
bare-branch byte-identity) are TRUE in the bytes and in computed styles,
and the theme row's full-flip pole is genuine. The one MAJOR is an
inherited drawer that teaches classes this repo does not have.

## Findings

1. **MAJOR — the in-a-form drawer is a stale tailwind-era mirror; shown
   ≠ running.** `+page.svelte:145-153` (checkboxFormDemo) renders the
   drawer file `checkbox-form-demo.svelte` containing
   `class="flex flex-col gap-4"` (:145), `class="flex flex-wrap items-center
   gap-3 pt-1"` (:148), and `<span class="text-muted-foreground text-[12.5px]">`
   (:150) — while the LIVE stage it sits beside runs `cx(rt.col16)`,
   `cx(rt.wrapRow12, rt.pt4)`, `cx(rt.inkMuted, rt.text125)` (:483-488).
   This repo is tailwindless (the receipt: 2 class-bearing files pinned,
   7 identities); none of those classes is registered — pasted, the
   sample's layout collapses and its hint span renders in inherited ink.
   git shows the drift is INHERITED (the old page already carried
   `text-muted-foreground`; scribe shipped it unchanged through the
   restructure). This is the identical disease vellum graded MAJOR on
   breadcrumb's fold sample — here across three elements. **Fix:** make
   the drawer compose from `resolveRawCode` (id the canvas) or rewrite
   the sample in the mechanism the stage actually runs.

2. **NIT — partial same-source coverage.** Only the axes canvas carries
   an `id` (the PILOTS snapshot covers it, 58/58 per the integration
   commit); the states/form/query/bare canvases are ungated hand files.
   The query split is DECLARED and reasoned ("its drawer teaches the
   explicit call form while the stage carries the page's own const" —
   a legitimate teaching difference); states and bare match the stage
   content; the form drawer does not (finding 1). **Fix:** id the form
   (and bare) canvases into the lane, or declare their exemptions the
   way the query canvas does.

3. **NIT — the density co-stamp story is incomplete, and the pin is
   load-bearing.** Raw SSR: a named-rung wrapper stamps BOTH halves —
   `<div data-density="lg" style="--jx-density-coefficient: 1"
   class="jx-field">` — while the row's stamp story reads as mutually
   exclusive (named → the rung; number → the coefficient; auto →
   neither) and the TokenTable says the coefficient is "1 at :root".
   My probe on the REAL wrapper DOM proves the co-stamped coefficient
   is LIVE at the rung's declaring scope: setting it to 3 on the lg
   wrapper recomposed box 24 → 72px, lane 48 → 120px, label 15 → 45px
   (the [data-density='lg'] scope block re-declares the channels AT the
   wrapper, substituting the wrapper's own coefficient — the kernel's
   pin at 1 is what makes "explicit rung = exact rung" true). **Fix:**
   name the co-stamp and the pin's role in the density row + the
   coefficient token row (one clause: "the rung's wrapper co-stamps the
   coefficient pinned at 1 — the pin is what keeps the rung exact; the
   number lane alone, with no rung scope, is the inert case").

4. **NIT — CHECKBOX_DOCS.density.description is unreachable prose.**
   `density` is an axis name, so the meta row splits to the shared
   section (which carries the schema's own description) and the
   override's text — "Explicit override of the ambient density scope…"
   — renders NOWHERE (0 hits in the raw SSR bytes). Harmless (the real
   density story lives in the per-axis row + TokenTable), but it is
   策展覆盖≠渲染 in its mildest form. Note: the drift spec pins the
   curation content, so removal is a spec-side move, not a one-line
   delete.

## Verified TRUE (receipts)

- **Number-lane inertness — the centerpiece — through the REAL carrier
  path**: stripping the rung attr from a real wrapper (the true
  number-lane posture: no scope block matches) and sweeping
  `--jx-density-coefficient` 1.5 → 3 → reset leaves box/lane
  **20px/40px byte-unmoved**; restoring `data-density="lg"` returns
  24px/48px. The movement control proves the harness detects scaling —
  the inertness is the stamp's, not the harness's. Matches the row's
  declaring-element wording exactly (channels declare at :root and the
  rung scopes, never at a stamp with no rung).
- **The four ladders, all five rungs, measured through the real carrier
  classes**: `--jx-icon` box 14/16/18/20/24; `--jx-hit` lane
  24/28/32/40/48 (the 2xs floor-lowering to 24 is real; xs=28 sits ON
  the default floor); `--jx-gap` 8/8/8/12/16; `--jx-text`
  10/11/12/13/15; `--jx-line` 14/16/18/20/24. Real page wrappers
  (lg coeff=1 → 24/48; 2xs → 14/24; sm → 18/32) corroborate.
- **THEME-SPLIT — the full-flip pole is GENUINE (independently
  verified)**: every paint voice reads the raw token layer
  (jixoai.css:1869-1931 — `--background`, `--border`, `--primary`,
  `--primary-foreground`, `--ring`; checkbox.css:22 `--foreground`), all
  six re-declared in the `.dark` block, zero stylex-frozen semantic ink
  in the chain. Measured one-evaluate: checked fill
  `oklch(0.6489 0.237 170)` → `oklch(0.7044 0.1872 166)` — the primary
  hue drift −4° EXACT — label ink `oklch(0 0 0)` → `oklch(1 0 0)`. The
  real `theme="dark"` demo checkbox carries the dark fill. After
  breadcrumb's frozen-alias BLOCKER, this page's full-flip claim is the
  honest pole of the split — the declaring-selector grep the row cites
  is the right tool and it was applied truthfully.
- **Bare branch — byte-identity in the raw bytes AND live**: the two
  bare inputs render `<input type="checkbox" checked=""
  class="jx-html-checkbox" name="X"/>` — byte-identical modulo name, no
  data-density, no style attr (SSR grep); computed styles identical
  (20px/20px, same border/background). Ambient `.dark` flows through
  bare (fill flipped in my island probe — custom properties inherit);
  the explicit theme cannot stamp (the bare branch renders one input,
  source-verified). The unstamped-embedded-lane story is true as told.
- **query() §6 form + flip**: `query<{ sm: DensityLane }, DensityLane>(
  { sm: 'small' }, 'large')` — both generics, the law documented in the
  comment. Flip measured across the REAL boundary: 1280px (80rem) →
  `sm` 18px/32px; 600px (37.5rem) → base `lg` 24px/48px; back → `sm`.
  (My first flip probe used 900px = 56.25rem — still ≥40rem — and
  correctly returned sm; the boundary re-probe is the receipt.)
- **SSR ground truth**: universal marker ×1, install ×1, see-also ×1;
  toc 9/9 ids in DOM with rail anchors (See also present per the
  wrapper-id pattern); main meta table renders label/error/labelSide/
  indeterminate/bare/checked (bindable marker on checked); the heritage
  id/class hides hold; size+color split to the shared section and the
  shared section carries all eight axis rows.
- **EXTRA-lane arithmetic**: CHECKBOX_DOCS carries NO extra lane; the
  only axis-name props (size/color/density) are INTENDED axis lanes
  (the §1 native-collision rule) whose home is the shared section — no
  family prop is silently eaten. The §1 story in the Props summary is
  source-true (the interface omits native size/color and re-declares
  the names as lanes; rest forwards the rest to the input).
- **Paint claims**: `corner-shape: var(--corner-shape, bevel)` +
  `border-radius: 0` verbatim (jixoai.css:1874/1885) — the shape row's
  "reads the site token the axis never bridges" and the deliberately
  square glyph are source-true; error wiring (aria-invalid +
  describedby + dashed border :1932), the indeterminate IDL effect,
  150ms ease-out dropped under prefers-reduced-motion (:1919-1941) —
  all source-verified.
- **Tier 2 justified (old-page audit)**: the W3-era page demoed
  `size={14}` on a documented non-consumer ("size 14 · density small"),
  carried 4-rung ladders missing 2xs entirely (28/32/40/48 with no
  floor story), duplicated the states matrix across "demo" and "types"
  sections, and had no bare/per-axis story. The restructure preserves
  every old fact (usage, form, states, a11y) and fixes the demo lie.

## Tier judgment

Agree with scribe's **tier 2** — the audit above supports it: the
non-consumer demo is gone, the ladders gained the 2xs rung and the
floor story, the bare branch got the census-grade section it was
promised, and the page joined the canvas PILOTS (axes).

## Gates

Reviewer-side; orchestrator re-verified the shared gates at integration.
My evidence: the SSR probe (24/25 — the 1 "fail" is my own substring
check: the `checked` row renders, with the bind marker in the name
cell) + four live probes, all above. Dev smoke HTTP 200,
bytes 1,162,935.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244`; `lsof -i :5244
  -sTCP:LISTEN` → 0 lines BEFORE. Kill-by-PID: listener PID **34053**
  killed; post-kill lsof → 0 lines; `pgrep -f "dev.mjs --port 5244"` →
  empty. Wrapper exited 143 (my SIGTERM).
- Probe/scratch: /tmp only (`marginalia-8-ssr-probe.mjs`,
  `marginalia-8-live-probe.mjs`, `marginalia-8-real-probe.mjs`,
  `marginalia-8-probe4.mjs`, `marginalia-8-checkbox-ssr.html`,
  `marginalia-8-dev.log`). Repo-side writes: this report +
  experience.md. NO commits, NO push.

## Consolidation note (appended AFTER this report was filed)

Cross-read quill/reports/8-review-checkbox.md (NEEDS-WORK, 1 MAJOR +
1 MINOR + 1 NIT). Verdicts agree; the centerpiece receipts agree to the
digit; one big concession, two adoptions, two unique findings from each
side.

- **CONCEDE (and a probe-method lesson) — quill's MAJOR-1 is real and my
  probe false-PASSED it.** The bare section's wrapped-contrast cell
  (`name="wrapped-contrast"`) carries NO stamps — its wrapper is
  `<div class="jx-field">` in my own SSR capture (re-grepped post-read:
  no data-density, no style) — while the prose promises "its root
  carries data-density and the carrier style". My SSR check asked for
  "a div with data-density + a --jx-density style" and my loose regex
  matched an unrelated axes-canvas div — a false PASS sitting right
  next to the evidence. Quill read the sentence against the actual
  cell. The receipt discipline I preach (check the SPECIFIC element, not
  "some element that looks like it") is now a filed lesson: a probe
  that can match the wrong node proves nothing. Grading: quill's MAJOR
  is the right call — it is a measured-false claim in the section's own
  evidence, the same reader-deceives class as my breadcrumb BLOCKER,
  scoped to one demo sentence.
- **ADOPT — quill's MINOR-1 (`--corner-shape` declared nowhere).** I
  verified the reads (jixoai.css:1874/1890) and took "the site's token"
  at face value; quill grepped for a declaration and found none — the
  bevel fallback always wins today. My shape-row verification was
  half-depth. Adopt the reword ("an undeclared customization seam whose
  bevel fallback wins today").
- **OVERLAP — quill's NIT-1 ≈ my NIT-2's bare-drawer half** (task-alpha/
  task-beta vs bare-plain/bare-inert; undocumented teaching split).
  Same fix: compose from the stage or carry the query file's note.
- **MINE UNIQUE — the form-drawer tailwind mirror (my MAJOR-1)**: quill's
  receipt table clears the canvases it tested but not the form drawer;
  `flex flex-col gap-4` / `text-muted-foreground text-[12.5px]` vs the
  stage's rt.* atoms stands as filed (inherited from the old page —
  git-verified). Consolidated fix list: two MAJORs (wrapped-contrast
  evidence + form drawer), both are "the page's own shown thing is
  false as rendered".
- **MINE UNIQUE — the co-stamp incompleteness (my NIT-3), upgraded by
  quill's own receipt.** Quill's 3b positive control cites the lg
  wrapper's `style="--jx-density-coefficient: 1"` as a stamp fact; my
  probe adds that the pinned coefficient is LIVE at the rung scope
  (3× → box 24→72px) — the pin is load-bearing and the row should say
  so. Quill's declaring-scope grep (:489/2630/2683/2736/2805) is the
  source-level half of my DOM-level proof; keep both.
- **MINE UNIQUE — dead curation prose (my NIT-4)**; quill's unique:
  the svelte-check per-page receipt (1648 workspace, one standing
  cx-idiom error on this page) and the markdown.css:154 suppression
  receipt — both adopt into the record.
- **Agreement register**: bare byte-identity (byte-level, both),
  number-lane inertness (quill: component-declaration probe + positive
  control; me: rung-strip + coefficient sweep on real DOM —
  complementary halves of the same proof), ladders (quill 4 rungs, me
  5 incl xs), theme full-flip pole (same numbers: 0.6489/170 →
  0.7044/166, −4°), query flip both directions across 40rem, §1
  collision, grep receipts, toc 9/9, universal ×1, tier 2 accepted.
  Both file NEEDS-WORK; the consolidated fix list is quill's three +
  my form-drawer MAJOR + my two NITs.
