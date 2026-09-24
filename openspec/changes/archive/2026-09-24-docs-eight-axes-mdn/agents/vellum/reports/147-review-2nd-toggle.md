# T147-R2 — SECOND REVIEW toggle (vellum, 2026-09-24) — the campaign's last review

- **Target**: `apps/www/src/routes/docs/components/toggle.html/` (+page.svelte :38
  usage reword, :279 segment relabel) over marginalia's owner round
  (agents/marginalia/reports/147-toggle.md, Tier 1) and scribe's first review
  (agents/scribe/reports/147-review-toggle.md, PASS 0M/0m/1L/1N). Both findings
  landed by the orchestrator; this round verifies the landings at the served
  layer and re-derives the fusion truths independently.
- **Vintage**: working tree uncommitted (HEAD 61d810ed + the two fixes);
  **my fresh build rc=0 (dist Sep 24, this dispatch's only build — I was the
  sole build writer; no other preview alive, ports 5241/5243/5244 empty
  before)**. Served payload **477,118 bytes** (page 200 on my 5242 preview).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier 1 CONFIRMED.**
  Both first-review findings verified landed at the served byte layer; every
  independent fusion receipt digit-exact; the fleet's 420 law holds. The
  campaign's 110th page closes clean.

## 1. The two landed fixes, served-layer verification

**LOW (the tenth copy seat) — LANDED.** Source: +page.svelte :38 now reads
`<!-- the label renders as a sibling label[for] above the control; checked is
$bindable -->`. Served **file-based byte census** (the 477KB HTML read from
disk, not shell-interpolated):

- `"on the LEFT"` → **0** · `"reads on the LEFT"` → **0** — the retired phrase
  is gone from both prior hit seats (Usage CodeBlock + canvas drawer's
  toggle-usage copy: the string's two render seats are covered by the same
  source fix, and the count is zero across the whole payload).
- `"above the control"` → **3** (the reworded usage string ×2 seats + the
  page's trued paragraph — comment and prose now agree).
- The rest of the retired set stays dead: `visually-hidden` 0 · `sibling
  selector` 0 · `28×16` 0 · `36×20` 0 · `44×24` 0 · `role="checkbox"` 0.
- The current vocabulary serves at scribe's exact counts: `32×16`/`36×18`/
  `40×20`/`48×24` ×3 each · `width − track` ×3 · `jx-html-switch` ×23.

**NIT (the 'md' segment label) — LANDED.** Source :279
`{ value: 'default', label: 'default' }`. Served segment buttons census:
**[sm, default, lg]** — no 'md' anywhere. Drive receipt (real coordinate
clicks on the segments, reading the canvas preview toggle
`input[name="canvas-toggle"]`): **sm → data-density="sm" 36×18 · lg →
data-density="lg" 48×24 · default → data-density="default" 40×20** — every
rung digit-exact, and the generated usage output omits density at default
(:68), so the code never lies (scribe's observation, preserved by the relabel).
One precision note, not a finding: the DEMO cells' default rung stamps NO
data-density (absence-is-state — receipt below), while the canvas toggle
carries the prop explicitly and therefore stamps the literal "default" —
explicit-prop stamps, prop-omission doesn't. Consistent with the family law.

## 2. Independent fusion spot-checks (my own instruments, served DOM @1440)

1. **role census**: 19/19 checkbox inputs carry `role="switch"` + the
   `jx-html-switch` class; **sr-only variants 0**; **19/19 carry a ::before
   knob** (computed content ≠ none) — the V2 DOM ISOMORPHISM, censused fresh.
2. **default rung geometry**: the demo cell keyed on label text (NOT
   data-density — the default rung stamps `null`, absence-is-state reproduced)
   reads **40×20** — width = 2 × track, digit-exact.
3. **the slide law, live**: real click on the default demo toggle — ::before
   transform `matrix(1,0,0,1,0,0)` → `matrix(1,0,0,1,20,0)`: **translateX 20px
   = width − track**, knob `oklch(1 0 0)` → `oklch(0 0 0)` (the
   primary-foreground flip), track `oklch(0.9551 0 0)` → `oklch(0.6489 0.237
   107)` (the primary tint), transition **0.2s cubic-bezier(0.22, 1, 0.36, 1)
   ×3** computed on the pseudo — all digit-exact, independently re-derived.

**scribe's demo_tg ship-as-is ruling, independently confirmed**: the three
`name="demo_tg"` inputs have **no form ancestor** (closest-form check ×3
false); the page's one form carries exactly one named input (`beta`) —
FormData can never see the trio. No change required, ruling upheld.

## 3. Recurrence guards

- **420 overflow (the fleet's 0/110 law)**: `.jx-shell-body` scrollWidth −
  clientWidth = **0 at 420×900** (and 0 at 1440) after the fixes. The usage
  code-drawer spans poke uncontained (right edge 736 vs 420) exactly like
  grid's — and the shell CLIPS them, the grid pattern, not timeline's
  55px sideways scroll. No usability impact; no regression.
- **toc/rail**: NAV carries **exactly the 9 +page.ts entries** (usage →
  see-also, "The painted switch" among them), **all 9 resolve** to present ids.
- **LAW #19**: **82 ids, zero duplicates** — matches both prior counts.
- **skeleton order (served DOM)**: `[install, usage, demo, in-a-form, types,
  accessibility, theming, universal-props, api, see-also]` — Install served as
  the first half, Usage before the demos (six-keep-order), See Also closing.

## Gate record

| Gate | Result |
|---|---|
| Fresh build (sole writer, rm dist first) | **rc=0** |
| verify:docs (repo root) | **rc=0** — the 6 "toggle" strings in the log are theme-toggle/toggle-group BACKLOG entries (verified by reading the lines); zero lint mentions of this page |
| Page on preview 5242 | **200** (477,118-byte payload) |
| svelte-check | NOT run — per dispatch (Owner single-run rule) |
| Commits | **none** — tree left for the orchestrator |

## Probe faults owned (mine)

1. First slide-law click used a Playwright locator filter (`#demo div` has
   nested hasText) that matched nothing — timeout. Re-keyed on the cell label
   text + real `mouse.click` at coordinates (a real click, per the campaign's
   platform-behavior law).
2. My first segment-drive read keyed the playground input on
   `aria-labelledby ∋ "play"` and caught **s10 — the disabled-row PlayToggle**,
   which carries a STATIC `density="sm"` (36×18) and is not segment-driven; I
   briefly read that as a failed drive. The density prop actually drives
   `input[name="canvas-toggle"]` (source :264-270); re-keyed on the name
   attribute → the digit-exact per-rung receipt above. The name attribute is
   the precise hook; label-text proximity is not.
3. Preview first start died `vite: not found` — nohup ran from the repo root
   (cwd resets between shells); restarted from apps/www.
4. `echo ===` in zsh is a glob error (`== not found`) — cosmetic, cost one
   command retry.

## Process

Port **5242**: empty before (lsof rc=1) → my preview after the build → killed
by PID at close; **lsof :5242 empty, rc=1** in the final message. Siblings
5241/5243/5244/5230 untouched. Artifacts: /tmp/t147-build.log, -docs.log,
-prev.log, -served.html, -lsof-before.txt, probe-t147{,b,c,d,e,f}.mjs.
NO fixes, NO commits.

## Closing note

This was the campaign's last second review. The page that closes the fleet
needed exactly what its history gave it: an owner round that trued nine copy
seats to the fusion, a first review that caught the tenth seat and one label,
and a two-line landing — verified here at the byte layer, the computed layer,
and the live-click layer. 0/0/0/0.
