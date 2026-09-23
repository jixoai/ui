# T44 — CODE toast.html (vellum)

**Tier: B (archetype restructure + seats + full measurement battery).** The family files were
already strong (toast-v2 is reviewed code); the page needed the MDN archetype (overview +
live-demo ids, trio-last flush order, toc == DOM, the measured eight-axes table) and the
watch-item battery: announcement discipline, TRANSITION-FRAME on the timed surfaces,
stacking/queue, portal classification, keyed-id uniqueness.

## Structure (toc == DOM, LAW #19)

hero (h1 ×1) → #install → **#overview (new)** → **#live-demo (new id)** → #usage (moved into
the flush, first) → #types → #stacking → #theming → #api → #universal-props →
**#accessibility (moved last — trio theming → api → axes → a11y)** → #see-also (id added,
chrome OUT). **toc: 9 entries == DOM == SSR rail** (was: 6 entries, accessibility listed
third, universal-props missing). Stale "demo-standard skeleton (2026-08-30)" comment removed
(superseded law text). div balance 0, h1 ×1, SectionCard/ComponentCanvas balanced.
**LAW #19: 63 ids page-wide, duplicates NONE (probe).**

New content: #overview (three paragraphs — clock model, announcement/portal law, keys+axes);
`axisRows` measured 8-row PropsTable in #universal-props; receipts paragraph; query() seat
(`query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small')`) + axis seat — TWO extra
viewports with their OWN stores (two viewports never share a store — the visibility handshake
would fight over the reported slice), landed at `pos="left-bottom"` / `pos="left-top"` so the
three stacks never overlap; `universalUsage` updated to the axis-prop line.

One code fix: the page's cx helper `.filter(Boolean)` flagged `Object.entries(style)` under a
`| undefined` union (pre-existing at HEAD:142 — my +2 import lines shifted it to 144 and the
page-scoped gate caught it). Hardened to `.filter((s): s is NonNullable<(typeof s)> =>
Boolean(s))` — zero behavior change, 0 page diagnostics after.

## Delivery shape: SELF-CARRIED PORTAL (taxonomy)

All three stacks probe-render inside `div.jx-float-slot` under `div.jx-top-layer` — the
scaffold's float plane via the jx-top-layer context (ScaffoldFloat adoption), NOT page flow
(`inPageFlow: false` for stacks mounted inside canvas stages, which proves the portal, since
standalone fallback would render in place). Because a trigger ancestor's CSS carriers never
span the adoption, the viewport stamps its OWN carriers on the stack root: `data-density`,
`class:dark`, the elevation pair, the coefficient (PORTAL LAW comment at
toast-viewport.svelte:196-204). Precedent class: batch C promotion — but the carrier stamp
makes it self-carried.

## Measurements (probe on 5242, chrome, /docs/components/toast.html)

**Announcements (triple weight).** Per-item live regions confirmed on the served DOM:
burst census roles = `[status, status, status, status]`, the sticky assertive push = exactly
1 × `role=alert` card. Insert-timing: MutationObserver recorded 4/4 added cards with
`textContent.length > 0` AT insertion (no empty-then-fill). The +1 queued chip: `aria-hidden="true"`.

**TRANSITION-FRAME battery (instrument: MutationObserver add/remove log on the page clock —
DOM-removal watcher, the progress-burst lesson).**
- Auto-dismiss (duration 5000): **5224 / 5225 / 5227 ms** across 3 runs (≈224ms overhead over
  the store window — consistent with the exit paint).
- Exit-snapshot frame (× dismiss): **230 / 229 / 230 ms** — EXIT_MS 220 + one frame. The
  leaving ghost is a NEW card node carrying `.jx-toast-leaving`: present during the window
  (1), gone after (0).
- Reduced motion (emulated): dismiss removal **2 ms** (snapshot skipped, immediate); auto
  dismiss still **5004 ms** (RM kills the animation, not the clock).
- Hover hold: card alive at t=5s (unheld control dies at 5.2s); removal **4222 ms** after
  release (remaining ≈4s + exit paint).
- Hidden tab (document.hidden stub + visibilitychange dispatch — the handler reads
  `document.hidden`, viewport:308): alive at 5.6s through the full 5s window; removal
  **4962 ms** after resume = remaining ≈4700 + 220 exit paint + overhead. Resumes the
  REMAINING time, not a fresh 5s.

**Stacking/queue.** Burst ×5 → 4 visible (newest four: #2..#5) + "+1 queued" chip; × dismiss
of the front card → chip gone AND "Deployed #1" (the oldest queued) rendered — FIFO promotion
on the count dropping below maxVisible; the queued card armed at first visibility, not at push.

**Keys/ids.** The each keys `(item.id)` (toast-viewport.svelte:846); ids are a monotonic
per-store counter (`nextId++`, toast-store.ts:288) — duplicate keys structurally impossible
(LAW #18 worst case: a constant burst). Expandable dialogs opened sequentially: ids
**11 / 12 / 13** — distinct, monotonic; the jx-toast-<id> shared-element names inherit it.

**THEME-SPLIT (the card runs TWO ink systems).**
- Root-level dark (html.dark injected, restored): `--jx-popover` at the stack re-derives
  oklch(1 0 0) → oklch(0.3211 0 0); `--surface-container`/`--jx-elevation-level3-surface`
  0.94 → 0.205; the card re-paints **through a transition** (mid-tween frame measured at
  oklab 0.482 — the earlier "no flip" reads were first-frame artifacts, owned below).
- Scoped island (viewport `theme="dark"` under light root): the island's ground re-derives —
  axis card bg = oklch(0.205 0 0) — via the level table's `.dark` side; the tonal hue
  re-derives via the `:root, .jx-light, .dark` selector-list re-declaration (title ink
  oklch(0.7044 0.1872 177) measured); the :root-pinned popover aliases HOLD (white 1.0 at the
  island). Frozen-vs-flip SPLIT INSIDE ONE CARD.
- Canvas data-theme pins never touch the card: the toast renders in the float plane outside
  any stage (adoption severs ancestor scope — the portal chains are the receipt).
- WCAG (oklch→sRGB converted, NOT the naive component parse — see faults): light card ink on
  ground **19.43:1**; tonal ink on dark ground **4.57:1** (passes AA normal); frozen outline
  ink on the island ground **2.81:1** — FAILS AA (drift flag #14, below).

**Density (kernel lanes; own no-opinion).** Ambient demo card desc = **13px**; axis seat
`density="large"` stamps `data-density="lg"` on the stack root → **15px**; query seat at
1280w → `lg`/15px, at 600w → `sm`/**12px** (attr flip + font flip measured on the same card).

**Swipe.** 70px fast drag right → dismissed (n 1→0); 30px slow drag → sprang back (n 1→1).
The SWIPE constants (48px / 0.11 px·ms) stay verified at the pure-function level
(judgeSwipe); the mid-drag computed transform read `none` at my sample points — the carry
plumbing (var updates between move events) was not observable with my sampling; verdicts only.

**Zero-reader greps over ui/toast/ (5 axes SUPPLY-ONLY):** --jx-size-effective,
--jx-shape-effective, --jx-radius-effective, --jx-color-effective, --jx-motion-effective —
0 files each. Elevation is the OWN-and-CONSUMED axis: the stack root inline style carries
`--jx-elevation-shadow/surface: var(--jx-elevation-level3-*)` (probe receipt) and the card
reads them with the popover fallback (toast.css:60,71).

## Gates

- `verify:tailwindless` rc=0 — VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42`.
- `verify:docs` rc=0 · `verify:docs-universal` rc=0 (**110/110**).
- page-scoped svelte-check: **0 diagnostics on toast.html/+page.(svelte|ts)** after the cx
  hardening (fleet rc=1 = pre-existing debt elsewhere — untouched files).
- Ambient solo (apps/www, `npx vitest run` three files): batch2-components + docs-structure +
  docs-nav-filter = **3 files, 56/56, exit 0** (vitest's "close timed out" teardown note; exit
  code 0).

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 65032 + listener 65114 (logged to
  /tmp/t44/*.pid); killed BOTH by PID; lsof AFTER: empty, **rc=1**.
- NO commits, NO pushes. Probe DOM injections (html.dark, document.hidden/visibilityState
  stubs) restored in-probe. Sibling keyed noise: svelte-check fleet output cross-referenced —
  the one toast.html diagnostic was MY page and got fixed; no sibling file touched.

## Probe faults owned (caught before conclusions)

1. **First-frame transition artifact**: two root-dark reads reported "no flip" because
   getComputedStyle fired on the first frame of the card's background-color transition — one
   read even mis-read a serialization change (oklch→oklab, same 0.94) as a "flip" via string
   compare. The dedicated re-probe (120ms settle + forced reflow) measured the mid-tween
   0.482 frame and the settled 0.205. Color claims must compare resolved values, not strings,
   and wait past transitions (the T42 discriminator-reset lesson, new color-flip flavor).
2. **Contrast helper color-space bug**: my first ratio (1.64) parsed oklch components as
   sRGB 0-255 — garbage. Recomputed with a proper oklch→linear-sRGB conversion (4.57 / 2.81 /
   19.43). Never trust a contrast number whose helper doesn't know the color space.
3. **Ghost ×-click no-ops**: the 220ms leaving ghost re-renders a full card (including the ×);
   a fast clear loop kept clicking ghosts and never dismissing (manifested as a 12s chip-wait
   timeout in the fifo stage). Fixed with `[data-jx-toast]:not(.jx-toast-leaving)` targeting.
4. **document.hidden stub miss**: the freeze probe stubbed visibilityState only; the handler
   reads document.hidden (viewport:308) — first run showed the toast "expiring while hidden".
   Stub both, then the freeze measured (alive at 5.6s, 4962ms-after-resume removal).
5. **waitForFunction arg evaluated after the push** (twice): the baseline count must be
   captured BEFORE the trigger, not as an inline `await` argument evaluated post-click.
6. **fifo read raced the ghost window** (probe1): reading titles 0ms after the chip-gone wait
   counted the four exit ghosts as visible cards ("5 visible, no chip" — impossible state).
   400ms settle fixed the census.

## Open questions / drift flags for the orchestrator

1. **Drift flag #14 — outline ink on a dark island fails AA (2.81:1).** An outline toast
   under a `theme="dark"` viewport (light root) paints :root-frozen black ink
   (--jx-foreground/--jx-muted-foreground, tokens.stylex — never re-declared under .dark) on
   the re-derived dark level3 ground (0.205 measured). Root-level dark is unaffected (inks
   re-derive white). The tonal variant is fine (4.57:1) because --jx-tonal rides the
   selector-list re-declaration. Candidate fixes live in the family (stamp the ink pair on
   the stack root under class:dark, or re-declare --jx-foreground/--jx-muted-foreground in
   the jixoai.css theme-scope list) — family/stylesheet owners' call, not a docs-page fix.
2. **The card's background-color transition** (observed tweening on theme flip) — didn't
   audit its duration/RM story (out of battery scope); noting so the next motion auditor
   knows it exists (toast.css transition block ~:254).
3. **Two extra viewports per docs page are a new pattern** (seats with own stores at their
   own float slots). It worked cleanly (three stacks, zero interference), but if a future
   page needs MORE seats, the float plane's slot inventory (nine) becomes the budget.
4. The swipe carry is not observable via mid-drag getComputedStyle transforms at my sample
   cadence — if a reviewer wants the physics on the served DOM (not just the pure function),
   it needs rAF sampling during a synthetic drag (the pulse-in-pixels treatment).
