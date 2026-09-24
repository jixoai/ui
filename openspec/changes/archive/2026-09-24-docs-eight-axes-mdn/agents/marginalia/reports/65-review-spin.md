# TASK 65 — SECOND REVIEW spin (marginalia, 2026-09-23; 2nd of 2)

- **Reviewer**: marginalia (second reviewer; independence law held — vellum's report 41 and
  scribe's report 62 NOT read before the findings below were fixed; the concordance
  addendum follows after filing).
- **Target**: vellum's page — `spin.html/+page.svelte` (759 lines) + the family (svelte 541
  / catalog 462 / defaults 103 / css 48 / stylex 64). Zero edits by me; sibling noise
  (vellum's toast.html, quill's progress, scribe's system-dialog) receipted, none keyed in
  my gates.
- **VERDICT: PASS — the page closes.** The adjudication target settles cleanly, scribe's
  LOW reproduces on my census, and the ink engine verifies at every dispatched point.

## THE ADJUDICATION — settled: FLEET-WIDE FROZEN, no spin carve-out

The var-vs-paint read-site split applied at the element, A/B in one browser session:

| read | light | root-level html.dark |
|---|---|---|
| **spin glyph** computed color (the element's ink) | oklch(0.6489 0.237 185) | **oklch(0.6489 0.237 185) — HELD** |
| **spin glyph** computed `--jx-primary` (element) | oklch(0.6489 0.237 185) | **oklch(0.6489 0.237 185) — HELD** |
| html `--jx-primary` | oklch(0.6489 0.237 185) | oklch(0.7044 0.1872 calc(185 − 4)) — **re-derives** |
| html `--primary` | oklch(0.6489 0.237 185) | oklch(0.7044 0.1872 …) — **re-derives** |
| **separator strip** computed fill (same session A/B) | oklch(0 0 0) | **oklch(0 0 0) — HELD** |
| html `--jx-border` | oklch(0 0 0) | oklch(1 0 0) — re-derives |

**Verdict: the two families behave IDENTICALLY — the ink is frozen everywhere on the
served tree, and the fleet record gets the fleet-wide "frozen everywhere" correction, no
carve-out.** Scribe's "root html.dark makes it FLIP" was an **html-level var read**: the
:root alias (--jx-primary → var(--primary)) re-derives when html.dark re-voices --primary
— I confirm that read — but the re-derived value never reaches the element: the glyph's
computed --jx-primary and its painted color hold the light value through the flip. Same
tokens.stylex emission family as separator's --jx-border (both `var()` aliases in the typed
theme), same freeze. The mechanism is now measured at the element on TWO families with the
html-var-vs-element-paint divergence isolated; the page's three "root-level html.dark
re-derives it (measured flip)" seats (theme axis row, the alias paragraph, the theming
TokenTable) need the same correction separator's got — frozen everywhere; what re-derives
is the html-level alias value only. (L/C signatures 0.6489/0.237 → 0.7044/0.1872 — the
absolute hues are the site wall-clock's, quoted per the hue law.)

## The rest of the dispatched surface — verified TRUE

1. **Scribe's LOW — REPRODUCED on my census**: 3 fresh loads, console census —
   **5 `hydration_html_changed` warnings** (spin.svelte:318:2, the `{@html}` block) — the
   svgInstanceSeq SSR-vs-mount divergence (drift #14) live on the page. The SSR-side face
   is mine to add: **consecutive SSR fetches hash-differ** (91ccbc79 / d617bc4b), and the
   diff isolates to **7 lines — Svelte hydration-comment hashes and the svg gradient ids
   (`a-jx143` → `a-jx184`, `Oval-2-jx*`)**: the instance counter embeds in served ids and
   advances ~41 per request (the page's svg-spinner count). Same drift, both faces.
2. **The opacity-only channel — VERIFIED**: the injected keyframes
   (`jx-spin-f10-i80-l160-end`) animate **opacity** alone; a live frame's computed
   animation is `jx-spin-f10-i80-l160-end 0.8s` with delay **−0.72s**, opacity mid-cycle —
   the flat frame engine is opacity-pure.
3. **The negative-delay ladder — VERIFIED**: the cursor's 10 frames carry stepped inline
   phases `--d: −800ms / −720ms / −640ms / −560ms …` (interval 800ms ÷ 10), every frame
   animating the SAME rule with only the delay differing — every frame mid-cycle from the
   first render.
4. **RM both channels, bidirectional — VERIFIED**:
   - the CSS text channel: `animation-name` **none** under reduce → restored under
     no-preference;
   - the SMIL channel: Chrome exposes no `.paused`, so the receipt is the **SMIL clock
     itself** — `getCurrentTime()` advances **+0.62s** running, **freezes at +0.00s** under
     reduce, **resumes +0.6s** on no-preference. `pauseAnimations`/`unpauseAnimations`
     hold, bidirectionally.
5. **Drift #12 — the family comment fix verified**: all five family files
   (`spin.svelte / spin.css / spin.stylex.ts / spin-defaults / spin-catalog`) are
   **byte-identical** across the registry and www mirrors (cmp).
6. **The lanes-vs-passthroughs split — VERIFIED**: `size` is the hybrid — `number | string`
   with **no QueryResult member** (source :264; the raw-string and ABSENT lanes stay
   family-own per the recorded absent law) — it **rejects query() by type**; the page's
   ONE query() seat rides the **density** lane (`density={query({ md: 'large' }, 'small')}`,
   the rung stamp as the receipt), exactly as the API section teaches.

## Standard battery

- **SSR/post-settle duality**: clean within each render; the cross-render drift is the
  svgInstanceSeq/counter family receipted above (MINOR-class, same ledger as scroll-area's
  viewport-id counter).
- **Warm-reload law**: FAILS on this page by the same drift — attributed, diff-isolated
  (7 lines, ids/hydration comments only), ledger-shared with scroll-area's counter MINOR.
- **EXTRA-lane by name**: the svg-lane and text-lane sections, the wrapping-posture proof,
  and the system-trio-interval seats all present and mounted.
- **THEME-SPLIT (six mechanisms + the paint-read law)**: the adjudicated theme row above;
  color PINNED to the primary hue (zero --jx-color-effective readers — the hue axis never
  reaches the loader); density rung stamped (lg@1280 → sm@600 through the seat); the rest
  supply-only.
- **Vocabulary-grep**: zero --jx-color-effective/elevation-effective/motion-effective
  readers in the family; the ink is the --jx-primary chain.
- **KEYED-EACH**: no duplicate-key aborts observed; the mounted spinner census 16 svg
  postures.
- **LAW #19 one receipt line**: zero duplicate ids (SSR + live), h1 ×1, toc entries
  resolving, 0 undefined/null literals.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** — CLEAN (the task-63 separator 500-regression has been repaired: zero separator keys) |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 2495 files) | **page 0 diagnostics**; family = the fleet's state_referenced_locally warns (:324, :359 — pre-existing); fleet 1563/1028/603 |
| Raw SSR | the svgInstanceSeq drift diff-isolated (7 lines, ids + hydration comments); dups 0; h1 ×1 |

## Findings (severity-tagged)

1. **[MINOR — rides closure, ledger-shared]** the root-level-dark seats (three: the theme
   axis row, the alias paragraph, the theming TokenTable row) teach "root-level html.dark
   re-derives it (measured flip)" — the paint falsifies it (the glyph's computed ink holds
   the light value through the flip; the html-level var re-derives). The correction is
   separator's, verbatim in shape: "the ink is frozen EVERYWHERE — a scoped island cannot
   re-derive it, and neither can root-level dark; the alias re-derives at :root but the ink
   does not follow". Copy-only on this page; the family defect (primary-hued loaders are
   light-frozen on dark grounds) belongs to W-next #7's ledger, now measured on TWO
   families with the read-site split isolating the mechanism.
2. **[MINOR — rides closure, ledger-shared with scroll-area]** the svgInstanceSeq/counter
   drift makes the page's SSR non-byte-identical across requests (drift #14's SSR face) —
   the same module-counter class as scroll-area's viewport-id counter; `$props.id()`-style
   per-render keys are the fix family. Scribe's LOW (the hydration warning) is this drift's
   client face — reproduced.
3. **[NONE]** otherwise — the opacity-only channel, the negative-delay ladder, the RM
   bidirectional kills, the mirrors, and the lanes-vs-passthroughs split all verify.

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 80456 / pgid 80447) → vite killed
  by pgid TERM + stragglers -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** html.dark toggles and media emulations
  fully unwound.
- Independence: vellum's report 41 and scribe's report 62 not read before the findings were
  fixed.
- Instrument honesty: **dsf 1, viewport-clip space** (no pixel capture was ultimately needed
  — the element's computed color is the paint-adjacent receipt the craft law names, and the
  SMIL clock is the channel's own instrument after Chrome exposed no `.paused`); the first
  engine probe's two selector misses (the svg IS the [data-jx-spin-svg] element; --d rides
  inline frame styles, not the injected sheet) were corrected before any conclusion.
- Artifacts: /tmp/marginalia-65-probe{1,2}.mjs, /tmp/m65-{a,b}.html,
  /tmp/marginalia-65-{ambient,universal,scheck,dev}.log.

### Instrument addendum (post-report cross-check)

The SMIL channel's receipt upgraded to the component's own API: scribe's
`animationsPaused()` — which I initially missed (`.paused` is unimplemented in Chrome;
`hasPaused: false` on SVGSVGElement here) — verifies **bidirectionally on all 16 SMIL
instances**: baseline `false` → reduce `true` → no-preference `false`. My SMIL-clock
instrument (getCurrentTime deltas +0.62 / 0.00 / +0.6) and her method agree digit-for-digit
in substance. The adjudication stands unchanged; second server pass killed, port 5244 empty
after.

One reconciling hypothesis worth the ledger: my stylesheet walk found NO declaring rule for
`--jx-border`/`--jx-primary` in `document.styleSheets` — the stylex theme's declarations
likely live in **adoptedStyleSheets** (outside that enumeration), consistent with a
stylex-theme `@property`-style pin (`inherits: false`) that explains BOTH element-level
holds (separator's fill, spin's ink) while the :root-level alias re-derives for html's own
read — and with scribe's flip read being the html-level var rather than the element's
computed ink. The two-read protocol (html var vs element computed) is the standing
adjudication instrument.

---

## Concordance addendum (appended after reading vellum's report 41 and scribe's report 62)

*[to be appended]*
