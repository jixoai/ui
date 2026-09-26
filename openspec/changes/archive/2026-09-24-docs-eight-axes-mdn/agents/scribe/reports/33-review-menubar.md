# Task 33 — REVIEW menubar (2nd of 2) · scribe · 2026-09-23

**Verdict: PASS.** Zero MAJOR, zero new MINOR on the page. The one MINOR
is quill's consolidation item (a) — the api summary's row count — which
I confirm with the exact fold mechanism and which rides the kbd-closure
consolidation. Two of her notes needed precision work: her item (b)'s
proposed seat (a TokenTable row description) is **dead-API that cannot
render**, and two of her prose numbers needed source anchoring (below).
Independence law kept: all findings formed from my own source reads +
probes BEFORE opening her report 29. Content identity: `git diff
d6feaa94 HEAD` over the page + family is EMPTY — I reviewed
byte-identical content to vellum's page commit.

**Reviewed**: `apps/www/src/routes/docs/components/menubar.html/`
(+page.svelte 441 lines, last commit d6feaa94) +
`apps/www/src/lib/ui/menubar/` (menubar.svelte 412, menubar-item,
menubar-panel, menubar.css, menubar.stylex.ts, menubar.meta.ts).

## The claims, re-derived

### 1. In-place chain — VERIFIED-TRUE (source walk + live DOM)

Source: `menubar.svelte` renders
`<ul bind:this={barEl} data-jx-menubar data-density={densityRungOf(d.density)}
class:dark={d.theme === 'dark'} style={rootStyle} role="menubar">` — the
UL#bar carrying every stamp. `menubar-item.svelte` hosts the slot span
(anchor-name — the kernel's live axis) inside the LI; the panel renders
INSIDE the item's slot span. Live walk on an open panel: DIV[role=menu]
← SPAN[slot] ← LI ← UL[data-jx-menubar][role=menubar]. The causal claim
holds: the panel is a DOM descendant of the stamped bar, so bar stamps
reach the open panel through plain inheritance across the top-layer
promotion — the top layer moves paint, not DOM. Third DOM shape
(wrap-IN-PLACE), distinct from nav-menu's promotion-away and
popconfirm's self-carried portal.

### 2. Radius three-state, panel-only — VERIFIED-TRUE (TRANSITION-FRAME 420ms)

Measured at the settle frame (getAnimations().finished + 420ms):

- Ambient open panel: **0px** (the §3 concentric calc against the
  sheet's 0px default).
- `radius="medium"` bar: **8px**, the explicit-form stamp
  `--jx-radius-effective: var(--jx-radius-medium)` in the bar style.
- Stamped bar (`--jx-radius-effective: 12px` injected on the root):
  panel computes **12px**.
- **The bar itself 0px throughout** — border-radius 0px on the bar root
  in all three states (panel-only consumption by construction; source:
  menubar.css :29-31 `corner-shape: var(--jx-shape-effective, round);
  border-radius: var(--jx-radius-consumed, <auto form verbatim>)`).

### 3. Theme split-voice through the REAL theme="dark" prop — VERIFIED-TRUE

All reads through the real prop (dark class lands on the bar root),
real clicks for the hover pose:

- **FROZEN (typed-ROOT-ONCE)**: bar card oklch(1 0 0) while --card
  flips to oklch(0.3211 0 0); the OPEN pose band oklch(0.9551 0 0)
  stays light on the dark bar (measured on the open panel state).
- **RE-DERIVING (live chains)**: panel surface dark acrylic
  **oklch(0.185 0 0 / 0.732174)** (the settled-frame read; source
  recipe jixoai.css :939/:1060 `color-mix(in oklab, var(--popover)
  72%, transparent)` — the 72% mix against the dark --popover, my
  measured alpha matches digit-for-digit); panel ink oklch(1 0 0)
  re-derived.
- **Real-hover pose**: raw `var(--muted)` flips dark —
  **oklch(0.2178 0 0)** measured via real mouse move to the trigger's
  live coordinates (no synthetic events). The split-voice exemplar:
  live css chains re-derive while stylex atom snapshots freeze.

### 4. Density two-channel — VERIFIED-TRUE (served rungs × four channels)

Ambient: attr **null**, cascade default rung — hit **40px**, voice
**13px**, line **20px**, inset **12px**. Explicit `density="lg"`: attr
**lg** → **48 / 15 / 24 / 16px** re-scoped in place. DensityDemo scope
boxes: xs → **28 / 11 / 16 / 8px**. Every served rung × four channels
(--jx-hit/--jx-text/--jx-line/--jx-inset) digit-exact. Rung census
(source): the system's named set is FIVE
(`'lg' | 'default' | 'sm' | 'xs' | '2xs'`, density.svelte.ts :23); the
menubar page serves THREE (xs/default/lg) — its own summary says
"across xs/default/lg", honest about the served set. Bar attr null
throughout the ambient demo (no stamp leak).

### 5. Glide one-hop on real clicks + keyboard — VERIFIED-TRUE (full chain)

My probe6 (Enter path) measured: Enter opens File + focuses its first
item ("Open docs…"); arrows from INSIDE the panel are panel-scoped and
dead ×2; Escape closes + restores focus to the File trigger. That
taught the precondition: **the glide requires trigger focus** (the bar
walker's closest-menu scoping). Final probe, correct trigger state:

```
click File      → 1 open panel, aria-expanded [true,null,false], focus ON trigger
ArrowRight      → File expanded=false, Edit expanded=true, panel "Undo Redo",
                  focus INSIDE on "Undo" (Edit's first item)  — THE GLIDE
ArrowRight ×2   → unchanged (Edit open, focus "Undo")           — DEAD ×2
Escape          → 0 open panels, focus back ON the Edit trigger — RESTORED
```

Digit-for-digit the one-hop contract: closes/opens/focuses-inside once,
further arrows dead ×2, Escape restores. This also CONFIRMS quill's
open-question-2 adjudication from her 1st pass — the measured wording
wins over the family comment's chain-glide aspiration (receipt over
comment; family untouchable).

### 6. Meta / matrix pins / parts table / chrome — VERIFIED-TRUE

- Meta (`menubar.meta.ts`): **14 props** counted (13 named + synthesized
  rest) — density, label, variant, size, shape, radius, color, theme,
  elevation, motion, class, children, style, rest.
- SSR: h1 ×1 · universal marker ×1 · ToC 8/8 and order == DOM ·
  served hand-table rows by name: **[label, variant]** (2) + the
  universal 8-row fold · parts table **[id, href, onselect]**.
- Ambient matrix pins: the density row text is the frozen
  ambient-scope vocabulary; docs-ambient-vocabulary 284/284 confirms
  at gate level.
- TokenTable: --jx-bar-gap 8px (source: component) row present (see
  finding 2 for its rendering seat).

## Findings

1. **[MINOR · consolidation item (a), rides closure]** The api summary
   (:358) says "the hand table serves the 3 consumer rows" while the
   served hand table is **2 rows (label, variant)**. Mechanism nailed:
   the hand PropsTable ARRAY carries 3 entries (label, density,
   variant), but density is axis-named and the universal mode folds it
   into the shared 8-row table — authored 3, served 2. Same
   served-vs-summary class kbd's closure just reworded. Fix = the one
   count sentence (kbd precedent).
2. **[LOW · agreed substance, dead seat]** Consolidation item (b): the
   --jx-bar-gap flip-limit note is agreed, but quill's proposed seat —
   "one sentence in the TokenTable row" — **cannot render**: ui/token-table's
   `TokenEntry` declares `description?: string` (:41) and the markup
   never references it (grep: single occurrence — the same dead-API
   renderer gap I filed as W-next on code-card's TokenTable, task 25;
   now a SECOND instance). The note needs a live seat: the theming
   section summary (which already names --jx-bar-gap) or the axes-table
   density row text. The W-next for the dead `description` field is
   now evidenced across two components.
3. **[INFO · W-next candidate (c) CONFIRMED with the source line]** The
   triggerOpen frozen-light band: `menubar.stylex.ts :58-59` —
   `triggerOpen: { backgroundColor: tokens['--jx-muted'], … }` — the
   stylex atom freezes the :root emission (0.9551) while the hover pose
   (menubar.css raw `var(--muted)` pseudo) re-derives and flips
   (0.2178). The observation is real, the mechanism is the
   declaration-coverage taxonomy working as designed, and the
   document-now/family-fix-later split is right: the page's split-voice
   treatment is the correct interim; the fix (triggerOpen reading a
   re-deriving chain) is a family-grade change for the Owner, riding
   the dark-ink contrast W-next.
4. **[NIT · reviewer prose, not the page]** Quill's report §4 says
   "All four rungs × four channels digit-exact" — she measured three
   rungs (default/lg/xs); the system has five named rungs; the page
   serves three. Her cells are all digit-exact; only the count word is
   off. No page defect.
5. **[NIT · cross-read precision]** Her panel acrylic alpha "0.83" vs
   my settled-frame **0.732174**, anchored by the source recipe's 72%
   mix (jixoai.css :939/:1060). Same ground (0.185), same acrylic
   verdict; the source-anchored value is the receipt. Transitional-
   frame sensitivity on WAAPI surfaces — the TRANSITION-FRAME law
   applies to alpha reads too.

## Cross-check against quill's report 29 (read AFTER findings formed)

No factual divergence on the page. Her in-place chain, radius
three-state, split-voice table, density cells, glide chain, elevation
split, no-hover-open, motion supply-only, chrome and served-rows all
reproduce under my independent probes. Her open-question-2 adjudication
(measured one-hop wording over the aspirational family comment) is
confirmed by my two-path glide evidence (Enter path = panel-scoped
dead arrows; click path = the glide). Three precision notes filed as
findings 2/4/5 — all in the review layer, none on the page.

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| composition-c solo | **14/14**, exit 0 |
| density-adoption-menus solo | **4/4**, exit 0 |
| batch4b-components solo | **13/13**, exit 0 |
| defaults-nav-providers solo | **7/7**, exit 0 |
| composition-regressions solo | **3/3**, exit 0 |
| (family solos total = 41/41, matches quill's run) | |
| docs-ambient-vocabulary solo | **284/284**, exit 0 |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | menubar.html page: **0 diagnostics**; family-file diagnostics baseline-classified (2 duplicate-identifier TS artifacts on the dual script-block type import, identical pattern in untouched list-item/index.ts ×4; state_referenced_locally = the workspace-dominant warning class, 1018 instances) |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper after each probe round; EMPTY after |

Process notes: every vitest solo exited 0 with "Tests closed
successfully" (the trailing "close timed out" is Vite hanging-process
noise after the green summary, not a failure). The stray node processes
in the final ps are ai-fly's (different repo) — none of mine.

## Closure

menubar passes review #2. My disposition: the MINOR (api summary count
sentence) rides the kbd-closure consolidation verbatim; the LOW's seat
correction (live summary sentence, not the dead TokenTable description)
should be recorded by the orchestrator alongside the dead-API W-next
(second instance); the W-next candidate (c) is confirmed with the
source line and stays Owner-grade. No page changes required from this
reviewer.

No commits made. Report file:
`agents/scribe/reports/33-review-menubar.md`.
