# Report 12 — RE-VERIFY `breadcrumb` (marginalia, 2026-09-22)

Reviewer: marginalia (re-verify of my own task-7 NEEDS-WORK; scribe's
consolidated fix integrated at d6b8e21e — working tree byte-identical
for the breadcrumb route, git verified). LAW #14 TRANSITION-FRAME
discipline applied to every menu-ink claim: each after-read waited
250ms (> the 100ms `.jx-menu-item` transition) inside the evaluate.
Evidence: current source, raw SSR bytes (1,088,465 B, HTTP 200), live
probes, solo spec runs.

## Verdict: PASS — ALL EIGHT FINDINGS VERIFIED FIXED

**Breadcrumb CLOSES (page #7).** My task-7 BLOCKER is fixed with the
split stated exactly as measurement supports, and scribe's
LAW #14 deterministic probe is independently reproduced: with the
await, the composed menu re-themes wholesale (you-are-here background
0.9551 → **0.2178** — scribe's number, now my number) while the trail
stylex inks freeze. My task-7 "frozen you-are-here" observation was
the 100ms transition's start frame, exactly as the law says.

## Per-finding verdict table

| # | finding (my task 7 / vellum) | fix claimed | re-verification | verdict |
|---|---|---|---|---|
| 1 | BLOCKER — theme row + caption + summary overclaimed a full trail re-theme | rewritten split-by-declaring-layer-AND-level; TokenTable frozen-vs-raw pair | Row (:196-202) now states the split per layer: trail text inks frozen (stylex, ":root + the stylex theme classes, never plain .dark"); "everything RAW re-themes — chevron, focus outline, and the WHOLE composed menu — panel ground, border, item ink and the you-are-here paint … because the popover panel is a DOM descendant of the nav". Caption (:601) rewritten ("a split, measured"). Axes summary (:514) rewritten (old "only theme is live" serves ×0). TokenTable splits `--jx-muted-foreground` ("theme · stylex-frozen") vs `--muted-foreground (raw)` ("raw layer … 0.32 → 0.85 lightness, measured"). **Live steady-state re-measure**: trail link ink `oklch(0.3211 0 0)` frozen under `.dark`; chevron border 0.3211 → 0.8452 (raw flips); menu panel border/ink/item ink 0 → 1; **you-are-here bg 0.9551 → 0.2178** (the await resolves my task-7 start-frame read). | **FIXED** |
| 2 | MAJOR — hand-mirror drawers (fold drawer's tailwind `text-muted-foreground`) | drawers deleted, resolveRawCode + inkMuted consistent | All four drawers compose `usageFile(…, resolveRawCode(<id>))` (:69-109); the `text-muted-foreground` hit in the served bytes is date-picker's INLINED css comment, not a breadcrumb drawer; `inkMuted` serves ×2 (stage + fold drawer). The `close` dodge remains only for the Usage section's canonical CodeBlock sample — that is an authored composition, not a stage mirror. | **FIXED** |
| 3 | MINOR — canvases ungated, not in PILOTS | all four canvases id'd, PILOTS joined, 69/69 | ids on all four canvases (`demo`/`fold`/`dropdown`/`axes`); PILOTS carries `'components/breadcrumb.html'` with 4 inline-snapshot blocks (::demo ::fold ::dropdown ::axes). Solo run this task: **72/72 exit 0** (69 at the fix commit; +3 from sibling pages joining the lane since — breadcrumb's blocks green throughout). | **FIXED** |
| 4 | MINOR — query() bare form | two-generic everywhere | Stage (:613) and caption (:612) both `query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')`; the axes drawer's imports record carries `'{ query }'` + `'type { DensityLane }'` so the drawer stays runnable. Served bytes confirm the generic form in both surfaces. | **FIXED** |
| 5 | MINOR — the part-restamp promise named the wrong mechanism | scope-block mechanism replaces it | The query caption (:628-634) now reads "the nav's scope block re-declares the five channels the composed menu reads. At the lg viewport rung (≥64rem) the engine re-resolves to large and the scope re-stamps" — the mechanism is the nav's scope, not part stamps. | **FIXED** |
| 6 | NITs — channel count, rung-resets clause, "generated" wording, PROVIDER-SNAPSHOT placement | all four | Density row: "the FIVE channels (--jx-hit / --jx-line / --jx-inset / --jx-text / --jx-gap)" ✓ and "a named rung also resets the coefficient to 1 (explicit rung = exact rung, never double-scaled)" ✓ (my checkbox co-stamp law's clause, landed). Props summary: "the shared Universal props section" ✓ (no "generated" over a hand surface). PROVIDER-SNAPSHOT moved from the axes summary to the deviations paragraph (:522-526) ✓. | **FIXED** |
| 7 | See-also ruling | applied (no change) | toc (+page.ts) unchanged at 8 ids without a See also row; DocsSeeAlso marker present without a wrapper id — the fleet convention as ruled. | **APPLIED** |

## Original verified-TRUE receipts — spot-checks (all still hold)

1. **PROVIDER-SNAPSHOT kernel law** (source): `provideDensity(() =>
   resolvedDensity)` at breadcrumb.svelte:113;
   `provideUniversalLanes({ size, shape, radius, color, theme,
   elevation, motion })` at :132 — density rides the bridged write,
   the literal carries the other seven. Unmoved.
2. **Rung stamps** (SSR): the density panels stamp `sm` / `lg` and the
   query nav stamps the base `sm` (normalized small→sm), auto panels
   stamp nothing — identical to my task-7 reading.
3. **Menu-rides-rung** (live, with the LAW #14 await): sm menu item
   padding 8px / min-block-size 32px / font 12px vs lg 16px / 48px /
   15px — the composed menu still rides the rung through the nav's
   scope block.
4. **Radius fallback** (live): the radius="large" panel's open menu
   computes `--jx-radius-consumed: calc(10px * 1)` → border-radius
   10px — the §3 concentric consumption unchanged.
5. **Aria story** (source + task-7 receipts): aria-current never
   rewritten by the walk (paint-only data-walk-active), Enter on a menu
   entry dismisses/focuses/navigates — unchanged.

## Gates (my run, this task)

- `canvas-same-source.spec.ts` solo → **72/72, exit 0** (69 at the fix
  commit; +3 sibling-lane growth since — breadcrumb's 4 blocks green).
- `verify:docs-universal` → exit 0, `GREEN: 110/110 component pages
  render the shared universal section (110 markers)`.
- `verify:tailwindless` → first run RED with 30 violations ALL on
  `empty.html/+page.svelte` — a parallel agent's in-flight page (git
  status `M`, cx-at-class-position while mid-write; zero relation to
  breadcrumb). Clean retry after 60s: **exit 0, receipt verbatim** —
  `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0,
  ui:6} forms=42 — bound verbatim`.
- Dev smoke HTTP 200, bytes 1,088,465.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244`; lsof → 0 lines
  BEFORE. Kill-by-PID: listener PID **83161** killed; post-kill lsof →
  0 lines; pgrep → empty; wrapper exit 143 (my SIGTERM).
- Probe/scratch: /tmp only (`marginalia-12-split-probe.mjs`,
  `marginalia-12-bc-ssr.html`, `marginalia-12-dev.log`,
  `marginalia-12-{canvas,univ,tw,tw2}.log`). Repo-side writes: this
  report + experience.md. NO commits, NO push.
