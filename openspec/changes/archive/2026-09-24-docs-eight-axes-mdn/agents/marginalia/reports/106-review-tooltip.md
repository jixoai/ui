# T106 — tooltip (docs page) — 1st eight-axes review (marginalia)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 2 LOW / 0 NIT — Tier 2 proposed**

Owner = scribe (coded it); this is the 1st review, vellum holds the 2nd.
Page: `apps/www/src/routes/docs/components/tooltip.html/+page.svelte` (212
lines). Family read in full: `tooltip.svelte` (808), `tooltip.css` (107),
`tooltip.stylex.ts` (49), `tooltip-defaults.svelte.ts` (63), `index.ts` (6);
consuming context checked (`props-table/from-meta.ts` for the `universal`
table rows — see the RECORD CORRECTION).

Process: port 5244 mine (pre-check rc=1, served from apps/www, killed by
wrapper PID at end — lsof post_rc=1, no orphans). Probes
/tmp/marginalia-106-probe1.mjs + probe2.mjs (logs -p1/-p2). Dist e29e32b9
for the lint gate. No fixes applied.

---

## 0. RECORD CORRECTION — my T103/T104/T105 "API table omits the axes" findings were wrong

The `universal` attribute on `PropsTable` (props-table.svelte :98, :179 →
`universalRows(meta)` in from-meta.ts :166-177) renders the eight universal
axis rows as a SECOND table inside the API section. Live census (probe2, all
four pages, axis rows present in every one):

| page | rendered tables (tbody rows) | axis rows |
|---|---|---|
| tooltip | [9, 8] | all 8 |
| input | [18, 8] | all 8 |
| hover-card | [8, 8] | all 8 |
| list | [8, 8] | all 8 |

I audited the pages' `props` arrays in source instead of the RENDERED tables;
the axes were never omitted. Corrections owed: **T104 LOW-1 ("API table omits
7 axes") is withdrawn** — do not land its fix shape; adding axis rows would
duplicate rows that already render. **T105 LOW-1's "omitted as rows" half is
withdrawn** (the landed rest-row caveat is harmless but was aimed at a
non-existent gap). **T103 MINOR-2's receipt mis-stated the table's coverage**
— its surviving truth is only the summary's count phrasing ("Eight props"
counts the component-specific rows while the rendered table shows 8+8); that
is phrasing-level, not an omission. Lesson banked: the rendered table is the
claim surface.

## 1. The intent battery — every timing claim verified TRUE (T103 discipline)

Real mouse/keys, in-page 8ms rAF sampler + `event.timeStamp` listener marks,
per-run indices (probe2 FULL_CLOCK_BATTERY):

| claim | receipt |
|---|---|
| "opens instantly" / openDelay default 0 | hover-open ≤ **50ms** sampling upper bound (synchronous by source — `openDelay <= 0 → open()` with no timer, tooltip.svelte :689-692); comparative: a timed open (hover-card, T103) measured 300-411ms |
| "100ms close grace" | leave→close **113.8ms** (the +14 is the fire-time geometric verdict + sampling) |
| "the close delay lets the pointer cross onto the tip" | pointer trigger→tip crossing stays open at +450ms; leaving afterward closes on the later fire (the re-arm path, source :668-678) |
| "Escape closes" / "manual popovers skip the native Esc path" | keydown→close **21.8ms** — the component's own window handler (:730), which is exactly why the handler must exist |
| "focus opens immediately" (regardless of openDelay) | Tab→open **9.6ms** |
| "focus leaving the trigger closes it" | Tab out → closed ✓ |
| aria-describedby | wrapper→panel pairing on **15/15** instances; permanent attr; hidden popover = display:none so it "only reads while shown" ✓ |
| role=tooltip / popover=manual | on all 15 panels (the role PRESENT here — the deliberate contrast with hover-card's no-role is real and consistent) |

Census: 15 anchors / 15 panels (5 canvas + 3 types + 4 DensityDemo clones +
3 universal), zero duplicate ids (LAW #19 ✓ — `$props.id()` auto-ids survive
the DensityDemo quadruple), no `{#each}` anywhere (LAW #18 — nothing to
audit), toc 7/7 authored = rail = DOM in matching order (the list-page's
MINOR-2 class does NOT recur here).

## 2. Anchoring, arrow mask, ink — the token-table claims verified

- **--jx-tip-gap 6px**: computed margin 6px AND rest gap trigger→panel
  exactly **6px** (probe2 REST_GEOMETRY, translate 0px, panel==body box).
  Probe1's "16px" was MY artifact — measured 40ms into the 460ms kernel
  entry while the panel was still translating (ownership: mine, §5).
- **--jx-tip-notch 8px / --jx-tip-shape "authored at open"**: the arrow
  instance carries `data-arrow` + `data-border-ring`, and at open aimPin
  authors `--jx-tip-shape` + the `--jx-surface-ring`/`-inner` svg-url pair
  (all three read back as authored data-URIs), the body's computed
  mask-image rides the shape, `data-side` stamped ("bottom" — the tab edge
  of a top-placed bubble), NOTCH=8 both sides (tooltip.css :87-98).
- **--jx-surface-in-x/y · -ox/-oy "measured vectors"**: slide (12px, -12px),
  shadow (6px, -6px) — measured post-flip, signs consistent with the
  top-placed geometry.
- **--jx-p "parked at 1"**: inline on the open panel ✓ (the channel-ownership
  rest-pose law, source :482).
- Flip machinery: `position-try-fallbacks: flip-block, flip-inline,
  flip-block flip-inline` + `position-visibility: anchors-visible` computed ✓
  (the popover.svelte laws verbatim; the flip instrument itself was run to
  ground in T103/T104 — not re-derived here).
- **Ink TWO-READ (alias-theme suspect resolved)**: at rest the body paints
  oklch(0.98 0 0 / 0.72) + blur(14px) saturate(1) brightness(2) (variant
  auto → acrylic ✓), panel filter pinned to **none** (the r30 residue law),
  shadow veil oklch(1 0 0 / 0.32) at the aimPin vector. Chain: the
  solid-fill var resolves through the ELEVATION RUNG surface
  (`--jx-elevation-level1-surface` → oklch(0.98 0 0)), NOT raw `--popover`
  (oklch(1 0 0)) — the tip's ink is rung-paired, which is exactly what the
  universal-props section claims ("the theme's level table pairs the shadow
  recipe with the ladder rung").
- **Elevation own level1 + the snap**: default instance `--jx-elevation-effective: 1`
  + level1 shadow/surface pair; `elevation="level3"` → 6 + level3 pair;
  `elevation={4}` → level2-shadow/surface vars (the "4dp snaps down to
  level2" recipe claim TRUE — nuance: `--jx-elevation-effective` stamps the
  user's exact 4, the rung pairing snaps; the "(3dp)" parenthetical names the
  rung's dp, not the stamp).
- **--jx-hit through the composed control**: DensityDemo's four rungs measure
  button heights **28/32/40/48px** at xs/sm/default/lg ("the trigger rhythm
  follows the scope" TRUE, digit-exact).

## 3. Findings

**LOW-1 — "Escape plumbing" is attributed to the platform that doesn't
provide it for this component.** tooltip-base summary (:171): "The Popover
API gives the top layer, **Escape plumbing** and manual semantics." For a
`popover="manual"` panel the platform provides NO Escape dismissal — the
page's own a11y row says so (:190 "manual popovers skip the native Esc
path") and the component wires its own `window` keydown for exactly that
reason (tooltip.svelte :730, comment :18). The two rows disagree; a reader
taking the base section at its word would expect native Escape behavior
that manual semantics explicitly turn off. Fix shape: "gives the top layer
and manual semantics — Escape becomes the component's job" (or equivalent).

**LOW-2 — cx clone #13 + the family's two type seats.** +page.svelte :73-85
(seat :81:28 — the page carries one, so it is a page finding per the
standing rule) and tooltip.svelte :148-160 (seat :156:28, the twin).
Tooltip.svelte also carries :762:35 — the focusout handler's
`e.currentTarget.contains(e.relatedTarget)` with `EventTarget | null`
against `contains(Node)` — the same type-only class as hover-card's
:246/:280 (T103); runtime clean (the focus path measured 9.6ms open /
Tab-out close with no exception). Fix shapes: transfer's type-predicate for
the cx pair; an `instanceof Node` narrowing (or widening the helper) for
:762.

## 4. Verified-true, no finding

The hero's four-path intent model (hover-delay-opt-in / close-grace /
focus-immediate / Escape) is the component's actual behavior, digit for
digit. "Non-interactive by contract" — the panel is a text-only span, no
focusables, `text` plain string. "Zero JS geometry" — placement is CSS
Anchor Positioning + position-try (the panel uses no `anchor()` function;
aimPin's rect reads author only the arrow mask and motion vectors, which the
page's token table describes as authored/measured). Touch safety: the
pointermove tracker filters non-mouse pointers (pen only while hovering) —
unclaimed but correct. T94 audit: the family sheets carry no
:hover-with-paint pairs (intent is JS-side pointerenter/leave); nothing to
spec-match. Painted walk 7/7 sections non-zero; 9 reveal wrappers; screenshot
at /tmp/marginalia-106-page.png (no visual claims made from it).

## 5. Probe-fault ownership (my artifacts, not the page's)

- Probe1's hover-open clock (50.1ms) is an upper bound — the synchronous
  open plus sampler granularity; source-verified timerless.
- Probe1's "16px gap" was measured 40ms into the 460ms kernel entry — the
  panel was mid-translate. Probe2 re-measured at kernel rest (translate 0px):
  exactly 6px. The token claim was never in doubt once the settle discipline
  applied.
- Probe1's grace/escape/focus clocks returned stale-sampler deltas (null /
  negative) — my sampler kept whole-lifetime arrays and my crossing step
  moved the pointer off the anchor (whose leave I wired) rather than the
  panel (whose leave I hadn't). Probe2 rewired both leaves, added per-run
  indices, and re-ran on fresh state; all three clocks then landed clean.
- One `page.goto(URL)` bug in probe2 (missing const — URL resolved to the
  global constructor) — fixed before any results.

## 6. Gate record

- ambient solo: 284/284, rc=0 (known vite-teardown nuisance note).
- `npm run verify:docs-universal` → GREEN 110/110, rc=0.
- page-scoped svelte-check (from apps/www): page 1 error (:81 cx clone);
  family component 2 seats (:156 cx twin, :762 relatedTarget) — reported
  above, none self-fixed.
- `npm run verify:docs` (dist e29e32b9) → rc=1, sole red `toast: skeleton:
  Examples renders before Usage` — the scribe's consolidation owns it;
  seat-attributed away from tooltip.
- Server killed: lsof :5244 empty (post_rc=1), no orphan processes.
