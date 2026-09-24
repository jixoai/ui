# Task 24 — popconfirm (CODE) · quill · 2026-09-23

**Verdict: LANDED (working tree; no commits). Tier 2 优化重构** — the
skeleton was mid-archetype: hero (CATALOG-synced) / demo / override /
types / usage / a11y / theming / universal-props / api existed, but
install, overview, law-notes, see-also and the measured axes layer were
absent, theming + universal-props were old-format, and the ToC carried a
STALE id (`popconfirm-base` — an anchor no section ever shipped). Not
tier 1: the archetype gaps are structural sections, not copy polish. Not
tier 3: the family is untouched (no meta migration — a generated
`popconfirm.meta.ts` already exists and the hand `universal` table
documents it), the good sections carried over verbatim.

## Diff

| File | Change |
|---|---|
| `apps/www/src/routes/docs/components/popconfirm.html/+page.svelte` | + Install, + Overview (the two-sibling portal law), + law section (the confirmation state machine, 5 rows), + axes (8 measured/negative-grepped rows + 7-panel rig + query case + kernel TokenTable), a11y upgraded (focus law + the no-aria-live ruling), api expanded 9 → 14 rows + universal section, theming + universal-props folded into axes, + SeeAlso, typed cx predicate, ALL demos re-wired (the defect fix below) |
| `apps/www/src/routes/docs/components/popconfirm.html/+page.ts` | ToC re-pinned: overview / live demo / composition / The state machine / types / usage / Props / The eight axes / Accessibility — 9 entries, toc == DOM (the stale `popconfirm-base` entry retired) |

No matrix re-pin needed: popconfirm is outside the ambient-vocabulary
bijection universe (no tasks.md batch entry; verified before writing), so
the hand table's axis-named rows are invisible to the frozen matrix.

## THE FINDING: the served dead-trigger defect (PressButton × auto-wire)

The old page's demo (and the usage example) triggered the panel through a
PressButton relying on popconfirm's auto-wire — and it was **dead as
served**. Mechanism, probe-established:

- popconfirm's $effect auto-wire does `setAttribute('popovertarget', id)`
  on the first plain button — but **PressButton CLAIMS `popovertarget` as
  its own prop** (declared :404, rendered :707 as `popovertarget={popovertarget}`
  with default `undefined`). When PressButton re-renders (its press/hover
  state flips on the very interaction that should open the panel), Svelte's
  attribute reconciliation removes the claimed-but-undefined attribute —
  clobbering the imperative setAttribute. Evidence: the served button kept
  the effect's `aria-controls` (never a claimed prop) while
  `popovertarget` read **null**; clicking the trigger left the panel shut
  (zero `:popover-open` panels after click).
- The composition-d fixture never catches this: its override scenario
  asserts the plain onclick path, never the declarative wire.
- **The page-side fix (docs only, family untouched)**: the explicit wire —
  PressButton's popovertarget prop is first-class ("composers drive a
  popover panel's open/close through the platform", its own doc comment),
  so every demo now gives the Popconfirm an explicit `id` and passes
  `popovertarget={id}` through PressButton. Probe-verified end to end:
  panels open, keep closes through the platform (`:popover-open` true →
  false on the override's keep click).
- **FAMILY-GRADE flag for the owner** (not fixed by me): the auto-wire's
  setAttribute is inherently unstable behind any child component that
  claims the attribute — the robust family fix is either rendering-side
  (mirror state through a wrapper) or documenting the explicit wire as
  THE pattern for component triggers (my page now teaches exactly that).

## The measurement story (probe PASS; TRANSITION-FRAME: 420ms settle past the kernel's ~240ms; medium: headless Chromium computed styles over dev SSR)

- **The portal law (the coordinator's promotion-away question, answered):
  NEITHER the nav-menu promotion-away NOR a foreign r13 system — the
  anchor span and the promoted panel are SIBLINGS with no common carrier
  root, so the carriers + the §3/§7 consumption stamps land on the PANEL
  itself (self-carried; the source names it the PORTAL LAW, W3-C), and
  the family's OWN sheet (popconfirm.css, never popover.css) reads the
  same consumption law verbatim (.jx-pc: corner-shape + the
  --jx-radius-consumed border-radius).**
- **Radius consumed, self-carried**: ambient panel 0px (the concentric
  calc against the sheet's 0px default); radius="large" → the panel's
  inline style carries `--jx-radius-effective: var(--jx-radius-large)` +
  the EXPLICIT consumed form and the OPEN panel computes **10px**.
- **Elevation consumed (own level2)**: ambient surface oklch(0.96 / 72%)
  → elevation="level3" oklch(0.94 / 72%); the stamp moves 3 → 6dp.
- **Theme = the split**: `class:dark` on the PANEL; the SURFACE flips
  (acrylic oklch(0.96 / 72%) → **oklch(0.185 / 77%)** — the fill chain
  reads the level rung then raw --popover, both re-declared under .dark)
  while the title ink HOLDS its light black (typed --jx-foreground frozen
  at :root). Per-voice, measured, the frozen pole.
- **Density = the provider lane, consumed twice**: `density="lg"` stamps
  data-density on BOTH the anchor and the panel; the trigger tenant
  re-tiers **40 → 48px** AND the panel's own buttons re-base
  (**cancel 40 → 48px** — the --jx-hit channel re-based inside the panel's
  rung scope). No opinion → no attribute anywhere (the fleet law, this
  family in the density-adoption pin).
- **The focus law, live**: opening any panel lands `document.activeElement`
  on the CANCEL button (probe-true on all six rig panels) — the safe
  action, the system-dialog law in its light form.
- **query() both-args**: `density={query({ md: 'lg' as const }, 'sm' as
  const)}` (the literal widening guard); at 1280px the anchor stamps lg.
- **Supply-only cells by negative grep**: size/shape-consumption notes
  above; color (--jx-color-effective stamped, zero atom reads), motion
  (zero reads — the kernel owns motion; LAW #14 handled by its
  reduced-motion guard), the button's --jx-shadow-xs is a token, not the
  §7 carrier.

## EXTRA arithmetic (served enumeration first, per the badge-indicator law)

Meta (`src/lib/meta/popconfirm.meta.ts`, generated): **23 props** —
14 family (title, description, onconfirm, oncancel, confirmLabel,
cancelLabel, confirmTone, placement, variant, id, content, actions,
children, class) + 8 axis-named + `rest` (the meta itself carries the
rest entry — the interface HAS a rest spread, onto the anchor span).
Served: the family table carries the **14 family rows** (title/children
marked required; `class / rest` documents the passthrough pair in one
row — rest has no独立 prose) + the universal section serves the 8 axis
rows. 23 − 8 = 15 non-axis meta props, all enumerated as served. Density
is documented in the axes table (the authoritative provider story), not
duplicated in the family table.

## Gates (final state, after the LAST write)

| Gate | Result |
|---|---|
| svelte-check | popconfirm.html page: **0 diagnostics** |
| dev-SSR + probe :5241 | h1 ×1, marker ×1, DOM order complete, ToC == DOM (9), install/see-also shipped (4 links); full probe PASS above; server + wrapper killed by PID, `lsof :5241` EMPTY before AND after |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 (110 markers) |
| verify:docs | staged scope green |
| docs-ambient-vocabulary solo | **284/284** |
| family specs solo (batch5-antd-components + composition-d + defaults-overlays + density-adoption-menus) | **47/47** |
| matrix | no re-pin owed (popconfirm outside the tasksUniverse bijection — verified pre-write) |

## Open questions for the owner

1. **The PressButton × auto-wire clobber** (family-grade, above): the
   auto-wire is unstable behind claimed-attr components. Page-side I
   teach the explicit wire; the family-side disposition is yours.
2. The composition-d fixture's keep button carries the same bare
   `popovertarget` dead-wire pattern as the old page demo had — unpinned
   by the spec (only the onclick path is asserted). Left untouched
   (sibling file).
3. The dark-surface ink is low-contrast by the frozen-pole law (typed
   light ink on a dark surface — measured oklch(0 0 0) on 0.185). The
   page teaches it as the honest mechanism cost; if the fleet ever wants
   a readable dark popconfirm, that's a family design decision, not a
   doc fix.

No commits made. Report file: `agents/quill/reports/24-popconfirm.md`.
