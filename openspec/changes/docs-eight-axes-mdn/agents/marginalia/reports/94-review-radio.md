# T94 — FIRST REVIEW radio.html (marginalia)

**Verdict: NEEDS-WORK** — **1 MAJOR / 3 MINOR / 1 LOW / 0 NIT**. Tier proposal: **Tier 1**
(the native-strength class: claims are few, platform-attributed, and almost all reproduce;
the two defects are one paint-law bug and one demo-seat hydration quirk — narrow fixes).
Independence law kept: findings formed from my own source reads (the 258-line page,
radio.svelte 184, checkbox.css, jixoai.css :1943-2035, DensityDemo current source) and
five probe passes on port 5244 BEFORE any report reading; no other radio review exists —
no concordance addendum. NO commits, NO pushes. Zero family edits.

## Verified — the claim bank that HOLDS

**Radio-group contract (the native-strength class) — all real keys/clicks.**
- **Arrow-key walking + wrap-around**: click `node` → ArrowRight ×3 walks bun → deno →
  **wraps to node**; ArrowLeft returns to deno. The hero pill, demo prose ("tab into the
  group and use the arrows"), and the a11y table's "Arrow keys — move selection within
  same-name radio group" all reproduce on the served DOM.
- **Space** selects the focused radio; **label[for] clicks** select (bun's label click
  flips the group); **disabled** radios are inert (DOM clicks ignored; checked+disabled
  holds); **bind:group** surfaces live in the canvas readout ("group bun" after the walk).
- Same-name **name grouping**: one group spans the density demo's four scopes (see
  MINOR 2 for the consequence) — the native same-name semantics, live.

**Paint receipts** (jixoai.css law vs computed): appearance `none`; border-radius 50%
(computed); 1px solid border; unchecked ground = background (oklch(1 0 0)); **:checked =
primary border + primary dot at scale(1) on the background ground** (the later
`.jx-html-radio:checked { background: var(--background) }` counter-rule wins — the
radio/checkbox divergence law holds); dot `scale(0) → scale(1)` matrices measured both
states, transition 0.15s; the checkbox checkmark path (`::before`) is `content: none` on
radio (pure circle dot — "zero icon deps" true); hover leans border to primary (real
page.hover, hue tracks the load rotation); focus-visible = 1px inset ring (offset −1px);
labelSide `left` → `flex-direction: row-reverse` (data-jx-check-left); label[for] wired
on every seat.

**Density ladders — ALL FIVE token rows digit-exact** (per-rung computed): `--jx-hit`
28/32/40/48 (lane min-block-size), `--jx-icon` **16/18/20/24** (ring width), `--jx-gap`
8/8/12/16, `--jx-text` 11/12/13/15, `--jx-line` 16/18/20/24. "The ring, dot, and label
all consume the shared density scale" holds (dot follows the ring via the 2px inset).

**§1 native collision rule**: `Omit<HTMLInputAttributes, 'size' | 'color'>` at source;
**zero size/color attributes** on all 19 served inputs; the explicit seats stamp the
carriers instead (`--jx-size-effective: 14px` + font-size at the size-14 root;
`--jx-radius-effective: var(--jx-radius-medium)` on the radius seat; data-density sm/lg
stamps). Universal-props summary true as written.

**Parity gate receipt (the dispatch baseline)**: fresh run on 5244 —
`✓ [shot] radio: pixels equal (hot 0.000% of channels)` (checkbox equal too; toggle
40×20 vs 41×20 warn-only known gap). The gate's **5 failures are all W-next #22's pair,
none radio**: 4 × native-select DOM-isomorphism (tier0 class absent) + 1 × input hue
(focused border-top-color black vs brand). Seat-attribute: radio carries a clean
pixel-parity baseline — the MINOR 1 disc below lives OUTSIDE the fixture's states
(fixture gap noted there).

**Structure/battery**: toc == DOM == rail links **7/7 in order** (the page-data policy;
chrome OUT); h1 ×1; **duplicate ids 0** (the DensityDemo clone does NOT mint the LAW #19
class here — radio ids are `$props.id()`-unique); zero dangling hashes; SSR raw fetch
strip-style **byte-stable** across two loads; zero-reader greps ×0 over ui/radio + route
(getComputedStyle/matchMedia/offsetWidth/clientWidth); no `{#each}`/`{#key}` on page or
family; the api table's 5 additions (label, group bindable, labelSide, error, density)
match the component's own additions over the rest-spread native base.

## Findings

1. **[MAJOR] Every yet-unselected radio group paints as SOLID PRIMARY DISCS — the
   checkbox `:indeterminate` law is wrong for radios.** jixoai.css :2006
   (`.jx-html-radio:checked, .jx-html-radio:indeterminate { background: var(--primary);
   border-color: var(--primary) }`) pairs with a counter-override for `:checked` only
   (:2031). Per the HTML spec, a radio matches `:indeterminate` whenever NO member of its
   name-group is checked — the default state of most real radio groups. Measured on the
   served page: both universal-props seats (`univ-radio-px`, `univ-radio-named`) are
   `checked:false` yet `matches(':indeterminate') === true`, computed ground
   **oklch(0.6489 0.237 <hue>)** = primary (hue 176/274/191 across my loads — it tracks
   the brand rotation), border the same hue → the ring is invisible and the control
   renders as a filled brand blob (screenshot receipt: two solid shapes where the
   section demonstrates the axis seats). Radios have no authored indeterminate state
   (the component header's state list has none) — the rule was checkbox law; for
   checkboxes JS-set indeterminate is legit, for radios it fires on every resting group.
   **The parity fixture missed it**: the radio pixel-shot compares like-for-like states
   and evidently never renders an all-unchecked group (fixture gap — worth a probe case).
   Fix: scope the indeterminate fill to the checkbox class, or give radios the
   `:checked`-style ground counter-rule.
2. **[MINOR] The density seat renders a selection the source never authored — Svelte
   hydration checks the last clone.** The theming seat `<Radio label="density sample"
   name="density-radio" />` carries no `checked`, no `value`, no group; DensityDemo
   clones it ×4 (the plain `children` form — **not** `childrenScoped`; the page predates
   the guard). SSR ships all four `checked:false`; hydration flips the **last** clone to
   checked (poll timeline: `false×4 → false,false,false,true`; a no-JS load stays
   all-false; a manual uncheck persists — a one-time hydration write). The served demo
   shows the lg sample selected with nothing in the page authoring it — an SSR/CSR
   duality mismatch on the page (screenshot receipt: the lg row checked, three siblings
   empty). Compounding the clone: the four scopes share `name="density-radio"`, so they
   form ONE native group — clicking sm unchecks xs (measured) and the demo is a
   cross-scope single-choice. **The LAW #19 id class does NOT fire here** (auto ids are
   unique — zero dup ids measured), which is exactly why this slipped past the id
   census. Fix direction: per-scope seats via `childrenScoped` with explicit
   value/group (or `checked={false}` + a value) so hydration has nothing to flip.
3. **[MINOR] The geometry digits and the "circle" don't match the served paint.**
   Claims: "radio — 16px circle" (hero title), "appearance-none + 16px circle" (meta),
   "pops an 8px dot from scale(0) to scale(1)" (demo prose + meta + component header).
   Measured at the ambient/default rung: ring **20px** (`--jx-icon` default; 16px exists
   only at the xs rung), dot **14px** (the `inset: 2px` box; 10/12/14/18 across rungs) —
   the page's own TokenTable (16/18/20/24) already contradicts its hero. And the claimed
   circle renders as a **beveled diamond-ish ring** — `corner-shape:
   var(--corner-shape, bevel)` at `border-radius: 50%` — clearly visible in both
   screenshots. One rewording pass naming the rung (and either embracing the bevel in
   the copy or `corner-shape: round` on the ring/dot) aligns the claims with the paint.
4. **[MINOR] Page-scoped svelte-check is red — 1 ERROR on +page.svelte.** :112:28 — the
   page-local cx overload (`Object.entries(style)` rejects `{…} | undefined`;
   `filter(Boolean)` doesn't narrow) — the same class transfer.html fixed with the type
   predicate. 0 warnings on the page; fleet totals 1548/1028 elsewhere, untouched.
5. **[LOW] The error contract is claimed but never seated.** The a11y table declares
   `aria-invalid` / `aria-describedby {id}-error` and the meta description promises
   "error wiring identical to checkbox" — but NO served seat passes `error`
   (aria-invalid radios ×0, `.jx-error` lines ×0 page-wide). The wiring is source-real
   (radio.svelte :152-155, :177-183 + the dashed-border law jixoai.css :2018-2020), so
   the claim is true by source and unverified by the served DOM. One error seat (like
   textarea's `! bio is required` line) completes the class.

## Gates

| Gate | Result |
|---|---|
| verify-native-parity (5244) | radio pixel-shot **EQUAL** (hot 0.000%); 5 failures = W-next #22's pair (4 native-select isomorphism + 1 input hue), none radio |
| docs-ambient-vocabulary solo (apps/www, `test/`) | GREEN — 284/284, exit 0 |
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| verify:docs (dist @ adb494a0) | RED — sole FAILED seat = **toast** (the recorded red); radio sits in the legacy backlog (no Install/See Also, Examples-before-Usage), expected for its class, not a red |
| svelte-check page-scoped | **RED — 1 ERROR (:112:28 cx overload)** on radio.html/+page.svelte (Finding 4) |

## Process evidence

- Port **5244**: wrapper 48923 started for the session (listener in the same process
  tree, /tmp/marginalia-94-wrapper.txt + -dev.log); after gates killed by PID;
  `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY after**. No orphan probe browsers.
- NO commits, NO pushes. All injections reverted in-probe (the manual uncheck in probe5
  was on a probe-local page instance; no DOM state outlives a probe).
- Probe faults owned, fixed pre-verdict: (1) my first CSSOM walk skipped every
  CSSStyleRule (empty `cssRules` lists are truthy — the `continue` short-circuited);
  the `:indeterminate` adjudication came from `matches()` + computed reads instead;
  (2) probe2's disabled-label click timed out on Playwright's actionability ("not
  enabled") — itself a disabled-contract receipt; switched to a DOM-click probe;
  (3) an `out` helper left undefined crashed probe3 (T76's class); (4) a `await
  promise.text().replace()` precedence slip — parenthesized.
- The univ-seat ground mystery took three probes to adjudicate (primary-hue ground →
  hue-rotation false lead → `matches(':indeterminate')` true with property false → the
  spec's group-has-no-selection rule → the checkbox-law import). The screenshots are
  filed as the visual record: /tmp/marginalia-94-univ.png, -theming.png.
- Artifacts: /tmp/marginalia-94-probe{1..5}.mjs, -parity.log, -ambient.log, -docs.log,
  -wrapper.txt, -dev.log.
