# Task 22 — navigation-menu (CODE) · quill · 2026-09-23

**Verdict: LANDED (working tree; no commits).** Tier 2 (the image model):
no generated props meta exists — the hand `universal` table stays as the
110-gate's marker and the ambient facts' pin. The archetype work: Install +
Overview (the duplication contract, stated plainly) + Usage (the two entry
shapes) + the measured axes layer + an upgraded Accessibility table + the
full-root API + See Also + the typed cx predicate. Family untouched — the
diff is the docs route (page + ToC) and the ambient-vocabulary matrix
re-pin.

## Diff

| File | Change |
|---|---|
| `apps/www/src/routes/docs/components/navigation-menu.html/+page.svelte` | + Install, + Overview, the old types/theming/universal-props sections folded (usage / axes / axes), the axes section (per-axis table + measured demo rig + query case + kernel TokenTable), API expanded to the full root interface + the parts table, + DocsSeeAlso, the cx predicate applied |
| `apps/www/src/routes/docs/components/navigation-menu.html/+page.ts` | ToC re-pinned to the page DOM: overview / live demo / usage / indicator / accessibility / axes / api |
| `apps/www/test/fixtures/docs-ambient-vocabulary.matrix.json` | variant + density re-pinned tableIndex 0 → 1 (the axes mechanism table took call-site slot 0); + size scope entry (the avatar/color-picker re-pin pattern) |

## Pre-flight decisions

- **No meta** → the hand `universal` table is the marker AND the ambient
  pin (image task 15 / nsa task 21 model). The table gained the full
  eight-axis rows + variant/inset (13 rows) — every row matches the real
  Props interface.
- **The duplication contract is the page's spine** (coordinator's critical
  context): the hero pill, the Overview's third paragraph, and the Usage
  summary all state it — panels carry real links; actions belong to
  dropdown-menu; the three menu roots (dropdown-menu, menubar,
  navigation-menu) are DELIBERATE duplicates: independent registry items,
  no hidden coupling; the only sharing is fleet-LAW level
  (density-adoption-menus pins all the menu roots under one
  honest-opinion law). Menubar cross-referenced honestly (the glide is
  NAMED "the menubar glide" in the family's own source).
- **Spec pins honored**: density-adoption-menus (no-opinion → no stamp;
  explicit rung stamps root + carried through the bar context; no legacy
  size aliases — the policy prop stays narrow), navigation-menu-indicator
  (two motion laws, B-1/B-3 interrupt laws, popover exclusion, OWNED-nav
  scoping, chrome-box bars, decorative-only part), defaults-nav-providers
  (the 10-slot contract: eight universals + variant literal own 'auto' +
  inset open-domain own 0 + elevation own level2), composition-c (the
  current-trigger fixture shape).
- **input-picker-bridge**: grepped — zero navigation-menu mentions. No
  wiring pins owed.

## The measurement story (probe PASS — all claims measured on the served page)

- **Density = CONSUMED through the kernel lanes, scoped by the
  honest-opinion law.** The entries' hit/gap/inset/type are plain
  var(--jx-hit/--jx-gap/--jx-inset/--jx-text/--jx-line) reads —
  substitution at the consuming element. Measured: ambient bar 40px hit /
  13px type / 12px gap+padding with NO attribute anywhere (the
  no-opinion-stamps-nothing law, live); density="sm" stamps data-density
  on BOTH root and trigger and re-scopes to 32px / 12px / 8px.
- **The coefficient subtlety, measured**: density={1.5} stamps
  --jx-density-coefficient: 1.5 on the root and NO rung attribute — and
  the entries hold 40px/13px UNCHANGED. The kernel lanes are computed at
  their DECLARING scope, so a bare coefficient re-rungs nothing; it moves
  only consumers reading the carrier at or below the stamp.
- **Size = SUPPLY-ONLY for the entries** (the no-font-size kinship's
  inverse): the stamp moves the root 16 → 14px measured, and the entries
  hold 13px/40px — every entry carries its own kernel type voice
  (--jx-text) which beats inheritance by declaration.
- **Radius/shape = CONSUMED THROUGH THE PANEL** — one promotion away: the
  nav root always stamps --jx-radius-consumed (the auto concentric form
  verbatim; explicit form when a lane resolves), and .jx-pop's
  border-radius/corner-shape read exactly those carriers
  (popover.css :37-47). Measured: ambient panel 0px (the sheet's
  --jx-radius-effective: 0px default through the concentric calc);
  radius="large" → the OPEN panel's computed radius jumps to 10px. The
  top layer moves the paint, never the DOM — the promotion-kept
  inheritance is the consumption channel.
- **Elevation = CONSUMED THROUGH THE PANEL, with the family's own
  (level2)**: the §7 pair + solid-fill bridge always stamp (own level2 =
  the menu rung, 3dp — the NAV itself paints nothing, chrome never
  elevated). Measured: the open panel's surface fill changes between the
  level2 bar (oklch 0.96) and an elevation="level3" bar (oklch 0.94).
- **Theme = the split, measured** (and vindicated through a red herring):
  the PANEL flips live — .jx-pop reads the raw --popover/--popover-foreground
  tokens that .dark re-declares for its subtree (measured: surface
  oklch(0.96) → oklch(0.185), text black → white; the promotion keeps DOM
  inheritance) — while the BAR's ink freezes — the atoms read the typed
  --jx-* aliases, computed once at :root (measured: the idle trigger is
  oklch(0.3211) in BOTH scopes while the raw --muted-foreground underneath
  differs 0.3211 → 0.8452 — the alias froze the ambient value). First
  probe pass read a hue drift on the current link as an ink flip — false:
  the hue-injection scopes inject per-panel hues that drift on the
  wall-clock (the color-picker task 19 hygiene); the clean signal is the
  idle trigger, which does not move. The indicator's tonal fill sits on
  the flipped side (--jx-tonal is re-declared per theme scope,
  jixoai.css :1499).
- **The indicator, all pins live**: data-motion="navigation" +
  viewTransitionName 'jx-nav-indicator' (waapi bar: empty name — no View
  Transitions, no cost); aria-hidden + tabIndex -1 (adds no tab stop);
  the bar goes position:relative; the hug-box equals the entry box
  (145px == 145px — inset own 0).
- **The walk + the toggle seam**: the roving trim lands the tab stop on
  the current-section trigger (components tab=0, registry tab=-1);
  popovertarget wire present; aria-expanded mirrors the native toggle
  seam; panels open/close through the declarative wire in the probe.
- **query() case**: a responsive density rung — `query({ md: 'lg' as
  const }, 'sm' as const)` (the string lane needs the literal widening
  guard); measured at 1280px viewport: data-density="lg", hit 48px.

## The matrix re-pin (the one test-fixture edit)

The axes mechanism table (axisRows — an identifier reference, so the AST
parser reads zero rows from it) took PropsTable call-site slot 0, shifting
the hand universal table to slot 1. Per the avatar (r1, vellum) and
color-picker (task 16, scribe) re-pin precedents:

- variant + density entries: tableIndex 0 → 1, cells unchanged (the
  universal table carries the same ambient-scope / own-'auto' cells the
  old page pinned), notes documenting the move.
- + size entry (scope marker, ambient-scope default cell — changed on the
  universal table's size row from `'auto'` to `ambient scope`): the
  family prop IS the axis (the §13 adoption); size rides the ambient
  carriers, so the scope marker — the measured root-stamp-only behavior
  is the note's justification.
- NO spec exemption needed: the mechanism table is invisible to the
  parser (identifier, not an inline array — unlike dropdown-menu's task 10
  case, where the inline array needed the exemption).

## Gates (final state, after the LAST write)

| Gate | Result |
|---|---|
| svelte-check | page: 0 diagnostics (the typed cx predicate; the query string-lane needed the `as const` widening guard — the both-generics law) |
| dev-SSR + probe :5241 | marker ×1, h1 ×1, all 7 sections, coef panel served; full probe PASS (above); server PID + wrapper killed, `lsof :5241` empty before AND after |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 (110 markers) |
| verify:docs | staged scope green |
| build | exit 0, no prerender 500s |
| affected specs solo (10 files incl. the five menu-family specs, --testTimeout=30000) | **505/505** — density-adoption-menus, navigation-menu-indicator, defaults-nav-providers, composition-c, docs-ambient-vocabulary (284/284 after the re-pin; the sibling's file-input keys cleared by their own fix), docs-structure, scroll-area-kit, props-table-meta-drift, canvas-same-source, reading-content-family |
| family | untouched; the input-picker-bridge spec has zero navigation-menu pins |

No commits made. Report file: `agents/quill/reports/22-navigation-menu.md`.
