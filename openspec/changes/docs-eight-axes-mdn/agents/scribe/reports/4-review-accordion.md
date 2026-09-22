# scribe task 4 — REVIEW of marginalia's accordion (docs-eight-axes-mdn)

- agent: scribe · date 2026-09-22 · main dir, NO commits, NO push
- reviewed: `apps/www/src/routes/docs/components/accordion.html/+page.svelte`
  + `+page.ts` (integration 895fefe8; working tree byte-clean against it —
  `git diff 895fefe8 --stat` on the route dir is empty, so this review
  covers exactly what shipped). marginalia's 1-accordion.md used as
  context only; every verdict below re-derived from source + live probes.
- ground truth: family source (`lib/ui/accordion/` ×7), kernel
  (`lib/defaults.svelte.ts` stampCarriers/stampCarriersForLanes/
  densityRungOf/provideUniversalLanes), engine
  (`lib/universal-props-query.svelte.ts:120`), schema
  (`lib/universal-props.schema.ts:68-75`), global scopes
  (`lib/jixoai.css` density blocks), nested consumers
  (`lib/ui/card/`, `lib/ui/press-button/`), census
  (`explicit-props/research/migration-census.md` W3-CLOSE D5), one SSR
  curl + a 14-check Playwright probe + a 1-check mutation probe on my
  port 5243.

## Verdict: NEEDS-WORK — 5 MAJOR, 4 MINOR, 2 NIT; zero blockers

The page's bones are the campaign's best so far — archetype order, honest
tier-2 scope, and a per-axis table whose every MEASURABLE number survived
live probing (density rung px, the census radius receipt, the query()
flip). What fails is systematic and text-level: three axis rows assert
broadcast consumption that does not exist (elevation · motion · size),
the toc was never migrated to the restructured DOM (my blockquote catch,
recurring), and the query() demo ships a real svelte-check type error
while teaching the broken pattern in prose. All fixes are one-liners or
word swaps; no canvas, snapshot, or structural rework.

## Findings

1. **MAJOR — `+page.ts` toc is stale to the restructured page: a dead row
   and the axes section is unreachable from navigation.**
   `accordion.html/+page.ts:6-13` ships `{accordion-base "NativeHTML
   base", types "Types", usage, accessibility, theming "Theming", api}`.
   Live DOM (probe + SSR): `#theming` has NO target (id absent — dead
   link), and NO row targets `#universal-props` — the eight axes, skill
   §2.5's "heart of this refactor", is unreachable from page nav. Labels
   also predate the restructure ("Types" → the section is now "Postures";
   "NativeHTML base" → "What the platform gives, what we add"; "API" →
   "Props"). This is the exact staleness pattern I filed MAJOR on
   blockquote (the toc lives in a sibling file restructures forget).
   Fix: rebuild to the DOM — `accordion-base/Overview · usage/Usage ·
   types/Postures · api/Props · universal-props/The eight axes ·
   accessibility/Accessibility` — mirroring quill's landed `+page.ts` r2
   fix on blockquote.

2. **MAJOR — the elevation row invents a consumption nothing in the
   fleet has.** `+page.svelte:166`: "the level broadcasts to nested
   consumers (a Card at level2 lifts inside the item body)."
   `rg -n "var(--jx-elevation-effective" apps/www/src` returns ZERO
   readers anywhere in the tree; the Card's shadow is the FIXED token
   `tokens['--jx-shadow-2xs']` (card.stylex.ts:41) and the Card never
   reads the carrier (this also holds when the Card's OWN elevation lane
   is explicit — the prop supplies downstream and paints nothing). This
   is quill's blockquote density mistake (consumption by vocabulary
   analogy, not grep) in a new row. Skill §4: never invent an axis
   behavior. Both sibling pages already model the honest form on the
   identical fact (alert:143 "supply-only here"; blockquote:147
   "SUPPLY ONLY … Documented absence"). Fix: "The frame carries no
   shadow and no consumer in the fleet reads the carrier — supply-only
   (documented absence)."

3. **MAJOR — the size row's broadcast tail is measured-false.**
   `+page.svelte:124`: "a Card or PressButton inside an item body at
   auto sizes in em off it." Mutation probe on :5243: stamping the
   kernel's inline font-size on the frame (16px → 24px, exactly what
   stampCarriers emits, defaults.svelte.ts:575) moves NEITHER the nested
   Card root (13px before and after) NOR the summary (13px pinned): the
   summary and body set explicit rem-anchored `var(--jx-text)`
   (accordion.stylex.ts:65,74), so nothing inside the item anatomy
   inherits the frame stamp, and Card/PressButton voices are token-
   anchored too (card.stylex.ts:49,60; press-button.stylex.ts:44 — zero
   `var(--jx-size-effective` readers tree-wide). The row's first
   sentence (the stamp) is true; the closing claim is the W3-era
   "scales the set" falsehood's cousin, in new clothes. Fix: "the
   stamp's inline font-size reaches only unstyled flow directly under
   the frame — the summary and body re-anchor on `var(--jx-text)` — so
   the axis is supply-only for the disclosure's anatomy."

4. **MAJOR — the motion row's broadcast clause has no consumer.**
   `+page.svelte:172`: "intensity broadcasts to nested consumers." Zero
   `var(--jx-motion-effective` readers in `lib/ui/` — the only reader in
   the tree is the component-canvas DOCS page's own demo. The row's
   first half is honest (the fixed `--motion-200`/`--motion-ease-nav`
   recipe + the reduced-motion kill match accordion-item.css:51,68,77).
   Fix: same supply-only wording as finding 2.

5. **MAJOR — the query() demo's generic pin does not type-check, and the
   page's prose teaches the broken pattern.** `+page.svelte:256`
   `query<{ sm: DensityLane }>({ sm: 'default' }, 'small')` →
   svelte-check ERROR 256:73 (`'"small"' not assignable to 'undefined'`):
   with an explicit type-argument list, TS disables inference for the
   remaining parameter, so B falls to its default `undefined`
   (universal-props-query.svelte.ts:120-121). The demo RUNS correctly
   (probe: 13px @1280 ↔ 12px @500 ↔ back — min-width direction right),
   but the comment at lines 253-255 claims the pin works ("The generic
   pins the case values to DensityLane … the concept page's typing
   note") — the note itself is the bug. Same shipped error on alert
   `+page.svelte:75` (vellum, landed) — campaign-wide, sourced from the
   concept page. Fix here: `query<{ sm: DensityLane }, DensityLane>({ sm:
   'default' }, 'small')`; orchestrator: correct the concept page's note
   + alert's call in the same sweep.

6. **MINOR — density's number-lane non-effect is a silent gap.**
   `+page.svelte:145` documents "A number (a coefficient) stamps
   --jx-density-coefficient" but never states that on THIS family the
   coefficient alone repaints nothing: the `[data-density]` scope blocks
   substitute the coefficient at their DECLARING element (jixoai.css
   2594/2647/2700/2767), none of which match the frame without a rung
   attr. marginalia derived exactly this (experience.md, substitution
   timing) and declined to demo the lane — the page should carry the
   clause; skill §1: a silent gap is not honesty. Fix: append "; the
   coefficient alone repaints nothing here — the scope blocks substitute
   at their declaring element, so only a named rung's attr re-anchors
   `--jx-text` on the frame."

7. **MINOR — usage-drawer copy drifts from its stages, and the comment
   overclaims "exactly".** `+page.svelte:178` says the density snippet
   "mirrors this markup exactly", but the drawer's body copy differs
   from the rendered panels ("The lg rung — 15px summary text." vs the
   stage's "The lg rung: T_base + 2px."; same class of drift in the
   concentric drawer's parenthetical vs the stage's shorter `div.panel`,
   and the query stage's extra "Resize the window…" sentence). Only the
   theme drawer matches byte-for-byte. Gates don't pin usage-kind files
   (canvas-same-source covers the ?raw registry drawers — those are
   clean), so nothing fails today; this is drift-risk + a false "exactly"
   + the acknowledged two-sources debt (marginalia's experience already
   commits to rehoming queryDemo via `usageFile`/`resolveRawCode`,
   canvas-usage.ts). Fix in one pass: sync the copy or rehome all four
   usage drawers through `resolveRawCode`.

8. **MINOR — vocabulary drift: "broadcast-only" vs the fleet's
   "supply-only".** `+page.svelte:166,172,482` coin "broadcast-only";
   the integrated fleet label for the same fact is "supply-only"
   (blockquote ×8, alert ×4). §1: the same thing always called by the
   same name. Fix: adopt "supply-only" (if the protocol is ever named,
   use the §6 gloss form "the broadcast protocol (吃也供,
   supply-and-consume)" — this page currently never names it, so §6 is
   trivially satisfied).

9. **NIT — density type cell is a subset of the lane.**
   `+page.svelte:142` shows `'small' | 'medium' | 'large' | 'auto' |
   number`, omitting `xs | 2xs | sm | default | lg` (schema:71). The
   same NIT I filed on blockquote; here the description cell does
   mention the legacy rungs, so cosmetic. Fix: append "+ the five legacy
   rungs (xs · 2xs · sm · default · lg)".

10. **NIT — "T_base" used undefined.** `+page.svelte:508,517` ("T_base +
    2px" / "T_base − 1px") — the symbol is never defined on the page.
    Fix: "13px + 2px" / "13px − 1px".

11. **NIT — the page-local `cx` carries the fleet idiom svelte-check
    error (290:28, `Object.entries` on a non-narrowed union).** Same
    single error on every campaign page (anchor 66, breadcrumb 303,
    blockquote 87, alert 179) — copy-of-family idiom debt, not
    accordion-specific; the type-predicate fix is in my experience.md
    and the kernel-level one-word fix is already logged for the
    orchestrator. Listed for the delta ledger only.

## What was checked and HOLDS (zero-finding areas, explicitly)

- **Tier 2 justified** — the restructure filled real gaps (no per-axis
  table, no query() case, no see-also, duplicate usage CodeBlock on the
  old page) and killed a false demo claim; every real information asset
  survived. Not tier 3: bones were good.
- **Archetype §2 order conforms**: hero → overview → install → Usage →
  live example → postures → props → eight axes → accessibility →
  see-also. The Usage-before-examples slot is the documented fleet
  resolution (marginalia follow-up #2); the marker/see-also/install
  skeleton is intact.
- **The consumed-vs-supplied split is correct for 5 of 8 axes** —
  verified by grep AND SSR AND computed probes: density is the one
  painter (summary/body `var(--jx-text)`/`var(--jx-line)`,
  accordion.stylex.ts:65,74-75; rung px ladder **measured**: lg=15px,
  sm=12px, base 13px, `--jx-unit` defined exactly once, rem-fixed); theme
  paints via the `.dark` class bridge (**measured** on the frame);
  radius is anchor-only — frame keeps `var(--radius)` while the nested
  auto Card **measured 6px** under the 20px stamp (the census D5 receipt
  live); shape broadcasts to real consumers (Card `corner-shape:
  var(--jx-shape-effective, round)` card.css:104 + the factor in the
  radius calc :109; PressButton likewise); color broadcasts (PressButton
  `--jx-fill`/`--jx-tonal` on `var(--jx-color-effective, var(--primary))`
  press-button.css:91,93). Elevation/motion/size are the three misfiled
  rows (findings 2-4).
- **All eight lane types/steps/units match `universal-props.schema.ts`
  verbatim** (schema:68-75 vs axisRows) — except the density cell
  subset (finding 9); no-number-lane for shape/theme stated correctly;
  color raw-string "closed at build" note correct.
- **Census citations are real**: the LANDED D5 paragraph
  (migration-census.md "W3 CLOSE") carries the exact radius 20→6px
  receipt, the first-time all-no-own contract, and the native-details
  in-flow no-portal correction the page cites.
- **query() runtime behavior is exemplary** — the ONE case per §2.5,
  real and working: SSR resolves the base ('sm' rung attr in the served
  HTML — the resolved-record law), the attr + computed font-size flip
  13px↔12px across the 40rem boundary and flip back (probe 3/3). The
  defect is only the typing (finding 5).
- **Examples run and match their shown source** (except finding 7's copy
  drift): the main FAQ canvas is true same-source (`?raw` registry
  imports), the theme drawer byte-matches its stage, explicit-rung panels
  match their eyebrows, and the density/theme/radius stamps all verified
  in SSR HTML.
- **Hard laws all hold**: `data-jx-props-table-universal` ×1 in SSR;
  `npm run verify:docs-universal` GREEN 110/110 (exit 0);
  `npm run verify:tailwindless` GREEN with the receipt byte-identical to
  marginalia's (`files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42 — bound verbatim`) — zero new class
  identities; `npm run verify:docs` fully GREEN now (accordion zero
  backlog; vellum's alert fix landed, exit 0); exactly one Usage H2; no
  DOM id collisions (canvas ids namespaced `jx-canvas-accordion-*`).
- **Prose §1**: hero one sentence; overview two tight columns; no
  marketing tone; en-US throughout; a11y section correct (native
  disclosure semantics, Enter/Space, focus-visible ring, reduced-motion
  kill, the summary no-interactive-elements constraint — all match the
  family source).
- **Props rows match the family source** (exclusive/ghost false
  defaults, `open` bindable, class forwarding); hand-written tables are
  the correct lane until accordion meta exists — the meta+docs curation
  migration at batch close is already committed in two experience logs.

## Process corrections for the ledger

- marginalia's report states "svelte-check is not installed here" — it
  IS (`npx svelte-check --workspace apps/www` from the repo root,
  4.7.6). The vite build does not type-check; findings 5 and 11 are
  exactly what the skipped gate catches. The scoped run is noisy (1646
  pre-existing errors) — grep the machine output for the page path.
- accordion.svelte:125 carries 8 `state_referenced_locally` warnings
  that are semantically real: `provideUniversalLanes({density, …})`
  snapshots the prop values at init, so the AMBIENT context supply to
  non-child downstream readers is an init-time snapshot (the root's own
  `$derived` stays live, and the items are in-flow, so impact is
  contained to unrelated ambient readers). Family-code concern, outside
  this docs task — flagged for the orchestrator next to marginalia's
  follow-up #1.
- Foreign dev servers observed during this task, NOT mine, untouched:
  PID 25733 (vite :5230, this repo's apps/www — possible orphan from
  another session) and PIDs 88126/88157 (vite :5241, active). Flagging
  :5230 for the orchestrator's orphan sweep.

## Highlights — marginalia techniques worth stealing (→ my experience.md, done)

1. **The per-axis honesty protocol as a derivation table** — stamp and
   consume derived separately, then written into one cell. Measured
   receipt: every number in the table survived probing. I commit to
   restructuring my anchor + breadcrumb axisRows to the
   stamp-then-consume shape at batch close.
2. **Substitution timing as the density-lane discriminator** (why the
   coefficient lane is invisible while the rung attr is visible) —
   sharper than my consumed-vs-supplied split; folding into my
   breadcrumb density caption.
3. **Demo selection by visibility** — only demo lanes whose effect is
   CSS-provable; refusing four demos is the honesty, not a gap.
4. **And the new law my review adds back to the protocol**: a broadcast
   claim needs a NAMED-CONSUMER grep receipt — step (b) of the protocol
   greps the family; step (b2) must grep the claimed nested consumers.
   Findings 2-4 are all un-grepped ecosystem claims. I re-audit my own
   pages' broadcast clauses with this receipt at batch close.

## Process evidence

- Dev server: `npx vite dev --port 5243 --strictPort` (apps/www),
  wrapper PID 81749, listener PID 81780 — both killed; `lsof -i :5243
  -sTCP:LISTEN` → exit 1 (empty); both PIDs confirmed dead. No orphans
  of mine.
- Probes: /tmp/scribe-accordion-axis-probe.mjs (14 checks: 12 PASS, 2
  FAIL = finding 1's toc assertions) and /tmp/scribe-acc-size-probe.mjs
  (mutation probe for finding 3). SSR capture: /tmp/scribe-acc-review.html.
- Gate logs: /tmp/scribe-acc-tw.log (tailwindless GREEN, receipt
  unmoved), /tmp/scribe-acc-univ.log (110/110), /tmp/scribe-acc-docs.log
  (exit 0), /tmp/scribe-acc-scheck.log (full machine output; accordion
  route = exactly the 2 errors of findings 5+11).
- No files outside this report + my experience.md were touched; family,
  kernel, and schema untouched; NO commits, NO push.
