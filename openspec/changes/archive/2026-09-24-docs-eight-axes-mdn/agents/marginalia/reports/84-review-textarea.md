# TASK 84 — SECOND REVIEW textarea.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (2nd of 2; quill's page — vellum's 1st was PASS 0M/0m/2L/1N,
  the LOWs+NIT landed at 4fdd9d2a with one apostrophe repair en route. Independence law
  held: quill's 68 and vellum's 77 were opened only AFTER the findings below were fixed;
  the concordance addendum follows at the end)
- **Target**: `apps/www/src/routes/docs/components/textarea.html/` (+page.svelte 597
  lines) over the textarea family (svelte 260 / stylex 68 / defaults 40), served live
  on :5244.
- **Method**: source reads (the counter plumbing :197-205, the element markup
  :218-247, the strata row :176, the density row :141, the §1 collision :524), headless
  Chromium over dev SSR :5244 with a setter+input boundary drive at 251/252/253/280 and
  back, viewport-resize rows reads, a settled L3 `.dark` injection with full per-chain
  reads, prefers-dark emulation for the L1 mechanism, SSR payload parse, the three
  gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / **1 LOW new** (the L3 ink half of the theme
  row; family-lane consequence, one clause on the page) / 0 NIT. All three landed items
  re-derived; the counter boundary, code-point counting, rows arithmetic, §1 collision,
  and the L1 mechanism all verified digit-exact.

## The landed items — all three re-derived ✓

1. **spellcheck/wrap on the base demo's usage snippet**: the served page's usage code
   block now carries the complete verbatim class — the rendered snippet reads
   `…"bio" rows={3} placeholder="multiline, maxlength rides through…" maxlength={280}
   spellcheck={false} wrap="hard"` — the class completes on the served page ✓ (it is a
   code-text completion; no live bio instance is served, consistent with the item's
   framing).
2. **The rows named in the density cells**: the density row (:141) and the theming/a11y
   summaries now teach the PROJECTION arithmetic — "rows-4 projections: height = rows ×
   voice × 1.5 — the served rows-3 sample reads 45/68". Measured on the served rows-3
   field: **2xs voice 10px / line-height 15px / height 45px** (3×15) and **lg voice
   15px / line-height 22.5px / height 68px** (3×22.5 = 67.5 → 68 rendered) — the
   arithmetic verified at both rungs (the one-stamp-constant lesson: the same formula
   holds at both ends, not just the quoted pair).
3. **The L1 mechanism footnote**: the theme row (:176) reads "under prefers-dark the
   SITE'S THEME SYNC adds html.dark (the mechanism — not the media query alone)". Live:
   emulating `prefers-color-scheme: dark` **adds html.dark to `<html>`** (the sync, not
   bare CSS) and `--border` flips page-wide oklch(0 0 0) → oklch(1 0 0) — the footnote's
   mechanism verified end-to-end.

## The standing surface — held

- **The counter boundary, digit-exact both directions** (driven on the s16
  maxlength-280 + count instance): "251 / 280" aria-live **off** → "252 / 280"
  **polite** (252 = ceil(280×0.9)) → 253 polite → "280 / 280" polite → back to
  "251 / 280" **off**. The boundary is exact crossing up AND down.
- **Code-point counting**: "🫠🫠" reads **2** (surrogate pairs as one — the
  expand-form-family passthrough, source :198-205).
- **The readout class list is CONSTANT across all regimes** (one class set; the flip
  channel is aria-live off↔polite, not a class change). The dispatch's "three verdict
  classes" decode (post-filing) as quill's EXTRA-lane FORWARDING verdicts —
  forwarded-WITH-A-JOB (maxlength drives the readout: my s16 census + drive; rows
  declared + default; oninput source-ordered), forwarded-VERBATIM (spellcheck/wrap in
  the snippet; name/placeholder live), WITHHELD (the color attribute — the §1
  collision's color half) — all three classes receipted by my passes.
- **The §1 collision rule**: size-stamped fields (18px / 14px / large→18px hosts) all
  compute the native textarea at the kernel voice (**13px / 12px / 15px**) — the
  native element never receives the stamp; `--jx-size-effective` rides the field root
  only. VERIFIED on three seats.
- **Density NO-OPINION AND REACTIVE**: the rung attr stamps the field root; the voice
  and height flow from the ambient scope (the C table above). Zero
  `--jx-density-effective` readers (the row's grep receipt stands).

## The L3 settled-paint flip — verified, and the chain split NAMED (the LOW)

Driving `.dark` onto a field root (the L3 component stamp, settled 1.5s past the
shell's transitions):

| channel | before | settled L3 | chain |
|---|---|---|---|
| shell border | oklch(0 0 0) | **oklch(1 0 0) FLIPPED** | base `--border` (1 0 0) |
| shell background | oklch(1 0 0) | **oklch(0 0 0) FLIPPED** | base |
| label ink | oklch(0.3211 0 0) | **oklch(0.8452 0 0) FLIPPED** | base `--muted-foreground` (0.8452) |
| **typed text (`--jx-foreground`)** | oklch(0 0 0) | **oklch(0 0 0) HELD** | **:root alias — island-proof** |

The flip is real and reversible (restored reads exact). But the per-chain read names
the consequence: **the shell face flips while the typed text stays alias-frozen —
settled L3 renders black text on the black shell** (invisible input under
`theme="dark"`). The chain split the dispatch hinted at is real and now named: the
SHELL law reads base tokens (flips at every stratum), the textarea's text ink reads
the `--jx-foreground` :root alias (frozen at L2 islands AND at L3). The page's theme
row teaches the strata mechanics and the monochrome invalid signal but not the ink
half. **[LOW — one clause on the theme row + the family flag]**: the L3 stratum's
typed-text ink stays frozen (the alias-theme law's tier-2 prediction) — the same
#14-family pattern as toast/tour, latent (no served L3 demo exists; the state is
reachable only by a consumer stamping `theme="dark"`). Page clause + family ink-pair
fix are the owner's call, exactly like the tour/toast flags.

## Standard battery

- **SSR/post-settle**: payload 1,062,010 bytes; h1 ×1; universal marker present; the
  single "undefined" byte-hit is prose ("Svelte skips undefined writes") — content,
  not a literal; warm-reload consecutive fetches **hash-identical**; the served
  snippet text carries `spellcheck={false}` and `wrap=` (double-confirming landed
  item 1 at the byte layer).
- **Vocabulary-grep**: zero `jxoai` in family or page.
- **LAW #19**: **93 ids on the live DOM, zero duplicates** (vellum's pass counted 67 —
  both zero-dupes; the delta is probe-pass scope/reveal state, the law holds either
  way). The three count instances (s2/s16/s20) all carry unique ids.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **textarea.html: 0 diagnostics**. Family lane, pre-existing (untouched): 3 ERRORs — the Object.entries-undefined overload (:84), `chrome` not on Props (:164), + 1 same-class — the standing kernel-adjacent debt |

Sibling keyed noise receipted, not chased: quill's website-scaffold, vellum's toc,
scribe's toast in flight.

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 95698; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- DOM injections (.dark on the field root, root dark, the counter values) reverted
  in-probe.
- Instrument honesty: (1) my first counter drive hit the s2 "notes" instance — whose
  readout has NO maxlength (label "251", not "251 / 280"; the family renders the bare
  count when no cap rides) — re-drove on the s16 maxlength-280 instance; (2) my first
  bio finder matched a rows-5 notes field by placeholder prefix — the bio exists as
  snippet text, not a live instance, and the landed item is the snippet completion;
  (3) my first L3 read sampled mid-transition (oklab(0.02) frames) — the settled read
  waits 1.5s past the injection.
- Artifacts: /tmp/marginalia-84-probe{1,2,3}.mjs,
  /tmp/marginalia-84-{dev,wrapper,listener,ambient,universal,scheck}.*.

## Open questions

1. **The L3 ink clause** (the LOW above): the theme row's strata story is
   mechanically complete except the typed-text ink half; the family owner decides
   between stamping the ink pair under class:dark (the toast/tour candidate fix) and
   documenting the frozen ink as intended.
2. **The 3 family ERRORs** (:84/:164 + 1) — the standing ledger debt (one is the
   `chrome`-not-on-Props shape also receipted on tags-input).

---

## Concordance addendum (appended after reading vellum's report 77 and quill's report 68)

My findings above were fixed before this section.

- **The "three verdict classes" decode**: quill's 68 names them — the EXTRA-lane
  FORWARDING verdicts (forwarded-WITH-A-JOB / forwarded-VERBATIM / WITHHELD), not
  counter states. My measured surface covers all three: maxlength forwarded-with-a-job
  (the s16 attr + the live readout it drives), rows verbatim with the default-4
  destructure, spellcheck/wrap verbatim (snippet) + name/placeholder live, color
  withheld + size consumed (the §1 collision census).
- **FULL CONCORDANCE with vellum's 77**: the hysteresis boundary exact at
  ceil(280×0.9)=252 both directions (her 250→252→260→251, mine 251→252→253→280→251 —
  I add the 253 and at-cap 280 samples); code-point 🫠🫠 = 2; the L1 mechanism live
  (her htmlClass "js" → "js dark" observation = my html.dark + --border flip under
  emulated prefers-dark); the rows projection arithmetic (45/68 = rows × voice × 1.5 —
  her receipt and the landed cells agree); the settled L3 two-read (her "var flips
  instantly, the paint follows the border-color transition" — my first read caught the
  same frames); LAW #19 zero dupes; page 0 diagnostics; universal 110/110.
- **The LOW is new relative to both reports**: vellum's L3 receipt verified the SHELL
  paint flip settled; my settled per-chain read names the TEXT-INK half — the typed
  text rides the --jx-foreground alias and STAYS frozen black on the flipped dark
  shell (black-on-black at L3), while the label ink rides the base
  --muted-foreground and flips. The chain split is real, measured on one field, and
  neither prior report names the text-ink consequence (hers verified the box; quill's
  68 teaches the strata mechanically). The LOW asks one clause on the theme row + the
  family ink-pair decision (the toast/tour fix shape).
- **One acceptance-call observation for the orchestrator**: vellum's LOW 1 asked for
  a served SEAT passing spellcheck/wrap; the landed fix completes the usage SNIPPET
  text (verified at the byte layer). The measured-seat gap she named persists — no
  live element carries the attributes. If snippet-completion is the accepted closure,
  the dispatch's wording ("completes on the served page") already says so; if the
  letter of her LOW stands, one attribute on the base demo seat closes it.
- **Additions (mine, not in 68/77)**: the 253 and at-cap-280 boundary samples; the
  no-cap count mode census (s2 renders the bare count with aria-live permanently off —
  vellum observed the workbench's plain-N mode too; my census adds the WHY: maxLen
  null when no maxlength rides); the size-collision census across three stamped
  seats; the per-chain L3 table with the text-ink row; warm-reload hash-identical SSR
  (1,062,010 bytes).
- **Probe-fault kinship (the campaign's recurring traps, all owned)**: my wrong
  count-instance drive == vellum's "workbench has no maxlength" re-point; my
  mid-transition L3 read == her paint-lags-var settle lesson; her three-file ambient
  solo vs my single-file 284/284 — both green, no contradiction.
