# T115 — SECOND REVIEW steps.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 98 1st-review report opened FIRST;
  landed items verified served; the C-16 focus law re-driven on a real click; fresh
  axis. NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/steps.html/` over the steps family
  (steps/steps-item/steps-indicator + css), served live on :5242, dist @ HEAD.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (her
  explicit proposal; the nine-word state machine re-receipted at the paint AND AT
  layers). Her MINOR 1 (cx) CLOSED; her LOW 2 (the orphan ToC extent) LANDED and
  serving; her NIT 3 (the duplicates/gaps claim has no seat) — **the seat LANDED**.

## Her findings — all three closed

1. **MINOR 1 (page cx :211:28) — CLOSED**: svelte-check page-scoped **0 diagnostics**.
2. **LOW 2 (#steps-demo wired but unlisted — the orphan ToC extent) — LANDED and
   served.** +page.ts now lists `{ id: 'steps-demo', label: 'the stepper demo' }`
   FIRST (source :7); the served rail opens with **#steps-demo** and runs 8 entries
   (#steps-demo #states #types #usage #accessibility #theming #universal-props #api),
   the extent's wiring attributes intact — rail == DOM == authored, no orphan.
3. **NIT 3 (duplicates/gaps claim seatless) — THE SEAT EXISTS NOW.** My duplicate
   census over every keyed list on the page found **one ol whose seats paint
   `current` ×2** (multiCurrent true; the page's other lists are size-3 singles or
   the gallery's size-1 rows) — a duplicate-ordinal demonstration seat: "duplicates
   paint every match current" now paints its own receipt. (The claim prose at :284 is
   unchanged; the seat arrived since her dist.)

## Headline claims — re-derived

- **The C-16 go-back focus law, real click**: the page's one go-back button
  (aria-label "completed: … — go back") focused + clicked: **activeElement becomes the
  LI (tabindex −1, aria-current "step")** — the button unmounts and focus rests on the
  item, never body ✓ her digit receipt reproduced.
- **The nine-word vocabulary, served ×9**: done 5 · current 10 · todo 5 · pending 1 ·
  success 1 · error 1 · hint 2 · emphasis 1 · disabled 1 (27 seats — her 24 grew by
  the duplicate seat + seats since; every state present). Spot digits:
  - **pending**: the breathing receipt live — inner indicator animates
    **jx-step-breathe 1.4s** ✓;
  - **disabled vs todo at the INNER indicator hook** ([data-jx-step-indicator], where
    the css law lives — steps.css :113-115): disabled **dashed + oklab(0 0 0 / 0.6)**
    vs todo **solid + oklch(0 0 0)** ✓✓ — her reduced-contrast digit receipt exactly
    (the alpha rides border-color, not opacity, as her mechanism note says).
- **LAW #18**: the duplicate seat is comparison-construction-safe (explicit ordinals
  ARE the law); her adjudication of the dispatch's "always-true" error (belongs to
  badge-indicator/float-button, not steps) stands — the steps family carries 0 page
  diagnostics this pass.

## Fresh axes (beyond her report)

- The duplicate-ordinal census (per-ol current-count) — proves the NIT 3 seat landed
  AND gives the fleet a reusable "multi-match" probe shape.
- The disabled/todo contrast pair re-read at the component's real carrier hook (her
  read was element-level; mine pins the css hook), closing any ambiguity about where
  the alpha lives.

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 43da0d99) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (her Finding 1 closed) |

## Process evidence

- Port **5242**: wrapper + listener 76910; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. The go-back drive left the workbench at current 0 (the state
  dies with the probe browser; no persisted mutation).
- Probe faults owned: (1) my first disabled read keyed the outer [data-jx-step]
  element — the border law lives on the inner [data-jx-step-indicator]; re-read at
  the css's own hook; (2) my first go-back finder assumed the first done li carries
  the button — re-scoped to the aria-label seam (one go-back button page-wide);
  (3) the output readout rides a canvas prop, not a native <output> — dropped from
  the receipt set as unfalsifiable-by-that-hook.
- Artifacts: /tmp/t115/{probe-steps-tc.mjs,probe-main2.mjs,probe-main3.mjs,
  steps-tc.json,main2.json,main3.json,scheck.log,lsof-after.txt}.

## Open questions

1. None. Her "seat the duplicates claim" wish is already granted by the page.
