# T95 — FIRST REVIEW range.html (marginalia)

**Verdict: PASS** — **0 MAJOR / 1 MINOR / 0 LOW / 0 NIT**. Tier proposal: **Tier 2**
(six contract families — keyboard, wheel grammar, snap arithmetic, ticks math, RTL,
vertical — verified at digit and pixel grade; the full battery plus a pixel-scan
instrument was required). Independence law kept: findings formed from my own source
reads (the 339-line page, range.svelte 531, range.css's generated face, range-tick,
stylex) and five probe passes on port 5244 BEFORE any report reading; no other range
review exists — no concordance addendum. NO commits, NO pushes. Zero family edits.

## Verified — the claim bank (digit + pixel receipts)

**Keyboard contract — digit-exact on real keys.** Canvas volume from 40: ArrowRight 41,
ArrowLeft ×2 39, ArrowUp 40, ArrowDown 39, Home 0, End 100, PageDown 100→90→80
(stride 10 = the platform's step×10), PageUp 90. The a11y table's rows and the demo
prose ("←→/↑↓ step by step, Home/End jump, PageUp/PageDown stride — all the platform's
own") reproduce verbatim.

**Step-precision arithmetic.** Tolerance (step 0.05): 0.35 → ArrowRight → value "0.4",
readout AND aria-valuetext **"0.40"** (the 2-decimal formatting = max decimals of
step/min/max, decimalsOf at source :261-273). Gain (step 0.5): 6 → 5.5, "5.5" —
"decimal steps snap at the step's precision" true at the exact precision.

**External-write snap — live twice.** (1) Driven through the real playground: setting
max to 30 with the bound value at 100 snapped the bindable to **30** (the $effect
clampToStep, source :296-299). (2) The page's OWN types demo ships `value={30}` with
`max={10}` — the served input reads **10** (the clamp visibly ate the authoring
overflow). min/max terminal snap + re-clamp law (E-13) untested at the boundary by the
page but source-true.

**Wheel surface — grammar and clamp digit-exact.** Synthetic WheelEvents on the input
(the handler is addEventListener, so dispatch drives it): deltaY −120 → 40→**41**
("wheel up raises — a dial, not a scrollbar"); two +120s → **39** (two detents, two
steps); **deltaY −400 in one event → +1** (the ±20px detent clamp: "a physical mouse
notch and a trackpad detent both step exactly once"). A real hover-verified wheel-up
reproduced (+1). Page `scrollY 0→0` across gestures — "never scrolls the page" holds.
Readout and aria-valuetext follow every commit (the input's own channel).

**Click-to-snap.** Ruler click at 25% of the travel → value **25**; the exact end-tick
click → **100** (a 2px-shorter landing commits 99 — the nearest-mark law with uniform
half-period zones, correct behavior, receipted not filed).

**RTL — pixel-mirrored fill + flipped arrows.** Centerline pixel scan of the rtl
volume (value 70): primary run **on the right of the thumb** (`W250 P9 W40 P594` —
fill grows from the right ✓ the law's :dir(rtl) thumb-shadow mirror); ArrowRight
**decreases** (70→69, the platform's visual mapping — "arrow keys flip" true).

**Vertical face.** Bottom click → **0**, top click → **10** (min at the physical
bottom); real ArrowDown/Up step 5↔4; computed `writing-mode: vertical-lr` +
`direction: rtl` + Gecko's `orient` attribute; 160px height = `--jx-range-length`
(calc(0.25rem × 40) = 10rem); the ruler's ::after end mark measured 1px tall × 12px
wide at the bottom-left (the min mark, per the law's block-end move).

**Ticks math — digit-exact.** Gain ruler (span 10, step 0.5): height 4px, inline
margin **10px = half the 20px thumb** (the travel-box inset), aria-hidden, 1px end
tick at inline-end. The 1/5/10 ruler seat: strips at `--jx-tick-step` **1% / 5% /
10%** (the snap period × scale) with graded lengths **33.33% / 66.67% / 100%** (rank
by value — minor short, major long), exactly the RangeTick contract. Click a mark →
nearest snap (probe2).

**Pixel geometry (the pseudo-read replacement).** Chromium does not expose
`::-webkit-slider-thumb` computed styles — my first reads were garbage (the instrument
note below); receipts re-derived by screenshot pixel-scan at dsf 3:
- Fill: at value 40 the primary run ends at **122.3css px** vs the expected thumb-left
  edge + ring 120 + 2.5 = **122.5** — the fill hugs the thumb's left edge exactly (the
  giant-spread box-shadow fill, source :159).
- Thumb: vertical cross through the thumb = ring/interior/ring ≈ the 20px input height
  (ring ≈2.5px + AA); density rungs scale one unit — thumb spans ≈16px at xs and ≈24px
  at lg (the 100cqh container chain, "every internal proportion scales as one unit").
- Track: muted groove visible in crops (too light to color-classify in this near-white
  profile — the cross-section classified it with the ground; noted, not a defect).

**Error law.** aria-invalid "true", aria-describedby resolves to `s19-error`, the
"!volume is required" line, `.jx-invalid` on the input, and the **thumb ring dashes
VISUALLY CONFIRMED** (the crop shows a segmented monochrome ring — border-style dashed
+ foreground, the unlayered rule winning over the layered mount, CR-1 note). Readout
"destructive mark": `--jx-destructive` is wired (stylex valueInvalid) but resolves to
the same black as `--jx-foreground` in this monochrome profile — token-true,
paint-flat; the textarea T77 precedent, receipted not filed.

**DensityDemo / the T94-lesson sweep.** The density seat `<Range label="density
sample" value={50} />` cloned ×4: all four read **50** with readouts "50" — NO
hydration flip (the T94 phantom came from `bind:group` with an undefined group; a
defined `bind:value` hydrates clean). Ids are `$props.id()`-unique (0 dup ids), no
name → no group merge; the plain children form is safe here. **The resting-state
pseudo-class audit**: range.css's only state selectors are `:dir(rtl)`, `:focus-visible`
(1px ring, offset 2), `:disabled` (0.5), and the component's `.jx-invalid` — no
`:checked`/`:indeterminate` pair exists in this family (the T94 class does not recur);
the vertical `:dir(rtl)` rule is redundant-but-identical to its non-rtl twin (the
face's own `direction: rtl` matches both — harmless, generated).

**Structure/battery.** toc == DOM == rail **7/7 in order**; h1 ×1; duplicate ids 0;
zero dangling hashes; SSR strip-style byte-stable; no `{#each}`/`{#key}` on page or
family (LAW #18 empty); zero-reader greps ×0 over ui/range + route. **§1 collision**:
no size/color attributes on any served input; carriers stamped on the axis seats.
**Sibling differential**: hue-popover rides the same generated law via `.jx-range` +
scoped `.jx-hue-range` fat-strip overrides (source :93-96) — one visual law, second
mounting surface live on the site. **Parity**: range is EXCLUDED by design ("custom
slider, not a native wrapper", design §4) — no tier0 baseline demanded; every paint
claim above is the family's own receipt.

## Findings

1. **[MINOR] Page-scoped svelte-check is red — 1 ERROR on +page.svelte.** :153:28 — the
   page-local cx overload (`Object.entries(style)` vs `{…} | undefined`;
   `filter(Boolean)` doesn't narrow). This is now the THIRD page carrying the identical
   buggy helper (popover :245, radio :112, range :153 — radio's was consolidated this
   round but the helper itself persists per page). The transfer.html type-predicate fix
   applied per page closes each red; the fleet-level fix is one shared util so the
   next copied page doesn't re-import the bug.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo (apps/www, `test/`) | GREEN — 284/284, exit 0 |
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| verify:docs (dist @ e3a9c0db) | RED — sole FAILED seat = **toast** (the recorded red); range appears only in the legacy backlog, expected for its class |
| svelte-check page-scoped | **RED — 1 ERROR (:153:28 cx overload)** (Finding 1); fleet totals elsewhere untouched |
| verify-native-parity | N/A by design (range excluded, design §4 custom slider) |

## Process evidence

- Port **5244**: wrapper 76875 started for the session (/tmp/marginalia-95-wrapper.txt,
  -dev.log); after gates killed by PID; `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY
  after**. No orphan probe browsers.
- NO commits, NO pushes. Synthetic events were used only against addEventListener
  seams (the component's own wheel/pointer listeners) after the real-path equivalents
  reproduced; the T63/T89 synthetic-event lesson does not apply to this listener class.
- Probe faults owned, fixed pre-verdict: (1) `getComputedStyle(el,
  '::-webkit-slider-thumb')` returns the element's own styles, not the pseudo's — the
  first paint pass was garbage (thumbW 320px) and was replaced wholesale by the
  screenshot pixel-scan; (2) probe2's wheel/vertical no-ops were pointer-positioning
  misses — bisected with a synthetic dispatch (worked) + a hit-target check
  (`elementFromPoint` = the input) before re-running real gestures clean; (3) a stale
  boundingBox crashed the first pixel-scan clip — fresh boxes per section; (4) `await
  fetch().text().replace()` precedence (T94's slip, once more).
- Artifacts: /tmp/marginalia-95-probe{1..4}.mjs, -error-thumb.png, -ambient.log,
  -docs.log, -wrapper.txt, -dev.log.
