# TASK 61 — FIRST REVIEW separator (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (FIRST reviewer; independence law held — vellum's report 40 NOT
  read before the findings below were fixed; the concordance addendum follows after filing).
- **Target**: vellum's page — `separator.html/+page.svelte` (571 lines) + `+page.ts`
  (11-entry toc) + the family (svelte 200 / stylex 154 / css 33 / defaults). Zero edits by
  me; the in-flight sibling (vellum's tags-input.html) had compiled clean by gate time.
- **VERDICT: PASS** — 0 MAJOR / **1 MINOR (rides closure)** / 0 LOW / 0 NIT. The ghost law,
  the scoped-island freeze, the ladder, the omission census, the zero-reader class, the
  self-stamp, and the toc rewrite all verify — several to the digit. The MINOR: the
  root-level-dark half of the theme-split story is falsified on the paint.

## The headline claims — verified TRUE

1. **THE GHOST LAW — VERIFIED, delta 0 at all seven samples.** Pixel probe over the real
   proof box (the oklch 0.98→0.35→0.98 gradient panel in #variants): ground/strip pairs
   **214→171, 161→144, 108→118, 59→93, 107→117, 161→144, 214→170** against the fixed-point
   prediction **strip = 0.5·C + 63.75** (the page's "0.5C + 0.25" in normalized units) —
   **delta 0** at six samples, **−1** at one (rounding). **The sign flip measured both
   directions**: light ground 214 → strip darker (171); dark ground 59 → strip lighter
   (93). Her quoted pairs (218→173, 58→93) sit inside my envelope (my grounds differ by
   sample-x on the same gradient). Instrument receipt: **dsf 1, viewport-clip space, strip
   row located by the element rect (no row-guessing)** — and the env note that two of my
   earlier capture attempts (a fixed-position fixture — a backdrop-root boundary — and a
   scroller mis-identity on this page's two-column shell) produced junk frames before the
   locator-driven clip landed.
2. **THE ROOT-PINNED ALIAS — the scoped-island freeze VERIFIED digit-exact.** Wrapping the
   gallery's solid separator in a scoped `.dark` island: the inherited **--border flipped
   to oklch(1 0 0)** on the island while **the fill HELD oklch(0 0 0)** and the strip's own
   `--jx-border` computed **oklch(0 0 0)** (ghost-off backdrop-filter: none receipted). The
   chain greps: `--jx-border: var(--border)` at tokens.stylex.ts :75 (the typed alias), and
   my `:root` census of root-pinned aliases in jixoai.css counts **113** by my regex (her
   116 — census-method variance, noted; the mechanism is what the claim rides).
3. **THE LADDER — VERIFIED**: computed block-size **1px** (fused/solid/dashed/dense/fade),
   **2px** (dotted), **6px** (wavy); `backdrop-filter: contrast(0.5)` on the ghost and every
   mask, **none on solid and fade**; `mix-blend-mode: difference` on **fade only** — the
   three engines (ghost / mask / blend) exactly as tabulated.
4. **THE OMISSION CENSUS — VERIFIED**: the bare hr carries **`data-jx-separator="fused"` +
   `data-orientation="horizontal"` + class — and nothing else** (no density attr, no style
   attr, no role). The vertical div lands **role="separator" + aria-orientation="vertical"
   AFTER the spread** (attribute order receipted — component-owned, not overridable).
5. **THE ZERO-READER CLASS — grep-CONFIRMED**: the family's one token read is solid's
   `tokens['--jx-border']` ×2 (solidHorizontal + solidVertical); zero color/shape/radius/
   elevation/motion/density/size readers; zero transition/animation declarations (the ink
   is instantaneous physics).
6. **SELF-STAMP — the taxonomy base case VERIFIED**: the §11 carrier and the caller's
   declarations share ONE style attribute (source: `rootStyle = [carriers, callerStyle].join`;
   live: the query-seat separator's attr reads `--jx-size-effective: 18px; font-size:
   var(--jx-size-effective, 1rem)`; the density panels stamp `--jx-density-coefficient: 1`
   with their rungs; the named radius panel stamps `var(--jx-radius-medium)` — supply).
7. **THE TOC REWRITE — VERIFIED**: 11 entries in true DOM order (overview, live-demo,
   variants, length-layout, separator-base, types, usage, theming, api, universal-props,
   accessibility) — **universal-props present** (the old toc's miss), install/see-also out;
   every href resolves; the TokenTable's solid row carries the normalized source-value form.

## THE MINOR — the root-level-dark half of the theme split is falsified on the paint

The page teaches (three seats: overview ¶2, the theme axis row, the theming TokenTable's
solid row) that the alias "re-derives **only at root-level dark** (`html.dark` →
`oklch(1 0 0)`, measured)". My two-direction probe:

- **Scoped island**: freeze VERIFIED (above) — her find, reproduced digit-exact.
- **Root-level dark** (`html.dark` added live): the html-level `--jx-border` **does**
  re-derive (oklch(0 0 0) → **oklch(1 0 0)** — the var-level claim is true at :root), **but
  the strip's `--jx-border` AND its painted fill HOLD oklch(0 0 0)**. The ink does not
  follow the re-derived alias — the solid separator is frozen **everywhere** on the served
  tree, not just under scoped islands.

Her "measured" was almost certainly the html-level var read (which I confirm); the painted
ink — the thing the row is about — never moves. Mechanism note (suspicion, plumbing
unverified): my stylesheet walk finds no declaring rule for `--jx-border` in the accessible
sheets, and the strip not inheriting the re-derived :root value smells like a stylex
theme `@property` pin (`inherits: false`) — stated without a cause claim, same discipline
the page owes. Correction for the three seats: "the ink is frozen EVERYWHERE on the served
tree — a scoped island cannot re-derive it, and neither can root-level dark (the alias
re-derives at :root but the ink does not follow); solid on a dark ground paints the light
frozen fill — the escape hatch does not escape" (W-next #7's shape deepens: this is a real
dark-mode defect in the one additive variant, not just copy). Everything else in the theme
row is TRUE and measured: the six physics variants, the class:dark stamp for descendants.

## Standard battery

- **SSR/post-settle duality + warm-reload law**: two fetches hash-identical (603b585b…).
- **EXTRA-lane by name**: canvases "separator", "separator · ink engine", "separator ·
  length", "separator · types", "Separator · universal props" — all mounted post-reveal.
- **Measurement-first**: the ghost law is pixels (7 samples, deltas receipted); the theme
  split is computed reads on a driven island/root.
- **THEME-SPLIT (all six mechanisms)**: the physics variants carry zero tokens (ladder
  receipt: contrast on ghost+masks, none on solid+fade; difference on fade); the one token
  read is solid's — with the MINOR above.
- **Vocabulary-grep**: zero transition/animation declarations; the one token read ×2.
- **KEYED-EACH + mounted-children**: the INK_GALLERY each keys `(v)` — **7/7 gallery rows
  mounted** (fused/solid/dashed/dense/dotted/wavy/fade).
- **LAW #19 one receipt line**: zero duplicate ids (SSR + live), h1 ×1, toc 11/11 resolving,
  0 undefined/null literals.
- **Query seat**: the wide side receipted (`--jx-size-effective: 18px` on the seat at 1440 —
  the stamp IS the receipt on a zero-reader family); the 13px narrow side rides the same
  lane mechanism verified twice this campaign (stack, waterfall) — spot-check inherited,
  named honestly.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** — clean this pass (tags-input had compiled by gate time; 0 sibling keys) |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 2495 files) | **page 0 diagnostics**; family 8× state_referenced_locally warns at :167 (fleet pattern, pre-existing); fleet 1564/1028/604 |
| Raw SSR | dups 0; h1 ×1; toc 11/11 ×2 hrefs; warm-reload identical |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 45868 / pgid 45865) → vite killed by
  pgid TERM + stragglers -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** The scoped island and root-level dark
  were injected and fully unwound (fill re-read oklch(0 0 0) at rest).
- Independence: vellum's report 40 not read before the findings were fixed.
- Instrument honesty (her triple, met on my side): **dsf 1**; **viewport-clip space** (the
  strip row located by element rect, not guessed); and the two junk-frame sources named —
  a fixed-position fixture forms a backdrop ROOT (the filter sampled nothing: strip ==
  ground) and this page's two-column shell means `.jx-shell-body` is not always the
  scrolling ancestor (the proof box lives under a `shellFlush` column with its own scroll
  range). The locator-driven clip is the instrument that landed.
- Artifacts: /tmp/marginalia-61-probe{1,2,3,4,5}.mjs, /tmp/marginalia-61-ssr.html,
  /tmp/marginalia-61-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading vellum's report 40)

## Concordance addendum (appended after reading vellum's report 40)

My findings above were fixed before this section; cross-check against her receipts:

- **FULL CONCORDANCE on the mechanism find and nearly every receipt**: the SELF-STAMP
  taxonomy base case (carriers + caller style in one rootStyle on the strip); the
  zero-reader class (solid's `tokens['--jx-border']` ×2 as the family's one token read);
  the omission census (bare hr = class + data-jx-separator + data-orientation; vertical's
  role/aria after the spread); the variant ladder (1px / 2px dotted / 6px wavy; contrast on
  ghost+masks, none on solid+fade; difference on fade only); the toc rewrite (11 entries,
  universal-props restored, chrome out); the KEYED gallery 7/7; TokenTable normalized to
  the union (solid = color, physics = structural — the progress precedent); LAW #18/#19;
  and the ghost law — her 218→173 / 58→93 with 0.5·ground+64 sit inside my seven-sample
  delta-0 envelope (my grounds 214/161/108/59/107/161/214).
- **Her instrument-honesty triple is real and I hit a fourth**: her (a) subpixel straddle
  (dsf 3), (b) scaffold-button hijack, (c) document-vs-viewport clip space — my run added
  (d) a fixed-position fixture forms a BACKDROP ROOT (the filter sampled nothing: strip ==
  ground in my first fixture attempt) and (e) this page's two-column shell means
  `.jx-shell-body` is not always the scrolling ancestor. My working clip was
  viewport-anchored by element rect at dsf 1 (delta 0 ×7 proves the anchoring); her
  document-space note vs my viewport-space success is instrument variance across setups —
  name your space, as she says.
- **THE ONE DIVERGENCE — my MINOR**: her root-level-dark receipt ("the alias re-derives at
  :root → fill oklch(1 0 0) — FLIPS (measured; restored cleanly)") does not reproduce on my
  instrument. At html.dark I measure the alias re-deriving AT :root (html's --jx-border:
  oklch(0 0 0) → oklch(1 0 0)) while **the strip's --jx-border and its painted fill HOLD
  oklch(0 0 0)** — twice (island-wrapped and unwrapped). Her measurement may have been the
  var at :root rather than the painted fill; the observable ink never re-derives anywhere
  on the served tree, which is the claim the page's three seats make. Reviewer #2 should
  read the html var and the strip backgroundColor side by side under html.dark — the two
  reads diverge, and that divergence IS the mechanism story.
- **ADDITIONS**: the strip-not-inheriting observation (the re-derived :root value does not
  reach the ink — suspect a stylex theme @property-style pin with inherits:false; my
  stylesheet walk could not see the declaring rule, so stated as suspicion without a cause
  claim); the dark-mode defect framing (solid's escape hatch does not escape: a
  light-frozen oklch(0 0 0) line on dark grounds — W-next #7's shape deepens); the census
  note (my :root alias regex counts 113 vs her 116 — method variance); and the
  DensityDemo-internal `[data-jx-separator=""]` element (density xs + scroll-edge vars)
  that appears in universal-props censuses — a demo-infrastructure hook, not the family.
- **Her open questions**: (1) the W-next #7 addition — concur, and my MINOR deepens it (the
  fix shape "read var(--border) directly at use site" would restore BOTH the mid-tree and
  the root-level re-derivation my data shows missing); (2) the ambient-rung census — nice
  fleet receipt, concur; (3) the full-bleed stage posture — concur (her seat fix is why my
  seat probe found a full-width ground to measure).
