# Report 7 — REVIEW `breadcrumb` (marginalia, 2026-09-22)

Reviewer: marginalia (2nd of 2; scribe's page, integrated at 37583d35).
Independence law held: vellum/reports/6-review-breadcrumb.md NOT read
before this report was filed. Evidence: source read (page + all 9 family
parts + dropdown-menu composed consumer), raw SSR bytes on :5244
(1,081,480 B, HTTP 200), four live probes (one-evaluate law throughout;
query() flip via real viewport moves both directions).

## Verdict: NEEDS-WORK (one BLOCKER; the rest of the page measured TRUE)

The supply/consume discipline on this page is the best I have measured —
the density row's provider-snapshot story, the composed-menu consumption
chain and the query() demo all held byte-for-byte and pixel-for-pixel.
But the theme row's central consumption claim is measured-false at the
trail's ink — the exact accordion theme-split class (stylex ink voices
are :root-frozen under a component `.dark`) — and the page's own live
demo shows a trail whose readable ink does not change while the caption
says it consumes live.

## Findings

1. **BLOCKER — the theme row + demo caption + axes summary overclaim
   what theme flips on the trail; the ink voices are FROZEN.** Three
   places: the theme row ("a resolved dark puts .dark on the nav and
   flips every semantic token the trail and the composed menu read"),
   the demo caption (`theme="dark" — the trail consumes this one live`),
   and the axes summary ("On the trail's own paint only theme is live").
   **Measured (real page pair, one evaluate):** link ink — the muted
   `--jx-muted-foreground` voice — is `oklch(0.3211 0 0)` on BOTH the
   light nav and the real `theme="dark"` demo nav; page ink
   (`--jx-foreground`) `oklch(0 0 0)` on both. On the nav scope the RAW
   tokens flip (`--muted-foreground` 0.3211 → 0.8452, `--foreground`
   0 → 1) while the `--jx-*` stylex aliases stay frozen (0.3211 / 0
   both) — `tokens.stylex.ts` maps `--jx-muted-foreground:
   'var(--muted-foreground)'`, and the alias substitution happens at
   the :root declaring scope, so a component `.dark` re-declaring the
   raw token never re-resolves it (the accordion white-on-white law;
   badge's theme row documents the same freeze as the W-next
   semantic-ink gap). What DOES re-theme, measured: the separator
   chevron's border (breadcrumb.css reads raw `--muted-foreground` —
   ::before border-right 0.3211 → 0.8452) and the composed menu panel's
   ink (`color: var(--popover-foreground)` in dropdown-menu.css — panel
   color 0 → 1 under the nav's `.dark`). So "the trail consumes this
   one live" is true only of a decorative 1px chevron border; every
   READABLE ink voice stays the light profile. **Fix (wording only, the
   badge theme-row pattern):** split the row — raw-reading voices
   (chevron, the focus ring `--ring`, the composed menu's popover ink)
   re-declare on the `.dark` scope; the link/page ink voices are the
   frozen aliases (document the absence, name the W-next semantic-ink
   gap); reword the caption, and consider opening the dropdown in the
   dark demo — the menu is the demo's real re-theming consumer.

2. **MINOR — the same-source lane has not reached breadcrumb: four
   ungated hand-mirror drawers, the `close` dodge, no canvas ids, no
   PILOTS entry — with a birth-drift receipt.** All four drawers
   (`usage`, `foldDemo`, `dropdownDemo`, `axesUsage`) are page-source
   template literals; none of the four canvases carries an `id`;
   `resolveRawCode` is never called; breadcrumb is absent from the
   canvas-same-source PILOTS. The drift class is not hypothetical: the
   fold drawer's separator sample shows `class="text-muted-foreground"`
   (a tailwind spelling) while the LIVE stage right below runs
   `class={cx(rt.inkMuted)}` — code shown ≠ code running, in the same
   section whose axes comment claims "code shown = code running". The
   axes drawer also embeds `query({ lg: 'large' }, 'small')` with no
   script/imports block, so the drawer file is not copy-paste-runnable
   (`query` undefined — badge's drawer carries the `{ query }` +
   `type { DensityLane }` imports record). And the W3-era
   `const close = '</' + 'script>'` dodge survives (badge deleted it).
   **Fix:** the accordion/badge path — id every canvas, compose the
   drawers from `resolveRawCode` + `usageFile`, join the PILOTS with
   inline snapshots (`-u` once, then green).

3. **MINOR — the toc omits See also, and the section is unlinkable.**
   The cohort standard (badge, alert) ends its toc with
   `{ id: 'see-also', label: 'See also' }`; breadcrumb's toc
   (+page.ts) stops at Accessibility, and the DocsSeeAlso wrapper div
   carries no `id` (badge wraps `<div id="see-also">`), so the last
   section could not be linked even if listed. SSR receipt:
   `href="#see-also"` absent, all eight listed ids present in DOM.
   Fix: add the wrapper id + the toc row.

4. **NIT — the density row's channel list under-counts.** It names
   `--jx-hit / --jx-line / --jx-inset / --jx-text` as the composed
   menu's reads; dropdown-menu.css `.jx-menu-trigger/.jx-menu-item`
   also reads `--jx-gap` (five channels). Measured ride, sm → lg:
   padding-inline 8 → 16px, min-block-size 32 → 48px, font-size 12 →
   15px — the claim itself is TRUE, just one channel short.

5. **NIT — "the generated Universal section below" implies a generated
   meta that does not exist.** breadcrumb has no `breadcrumb.meta.ts`;
   the section rides the `universal` flag over the shared artifact
   (`universalRows(undefined)`), and all five props tables are
   hand-written. The hand rows are byte-honest (every row I parsed
   matches source), so this is migration debt, not misinformation — the
   meta+docs curation lane is breadcrumb's remaining move when the
   batch close reaches it.

6. **NIT — toc label case is inconsistent** ("live demo", "fold a long
   trail", "the sibling jump" lowercase against "Overview" / "Props" /
   "Accessibility" capitalized).

7. **Observation (no row claim broken — owner's probe call):** the
   menu's you-are-here current-entry paint
   (breadcrumb.css `color-mix(in oklab, var(--muted) 70%, transparent)`)
   did NOT flip under my `.dark` toggle (background
   `oklab(0.9551 0 0 / 0.7)` in both profiles) while the same
   subtree's `--popover-foreground` ink flipped. Suspected cascade
   interplay (the `:where(...)` rule in `@layer components` vs the
   unlayered stylex atom's `backgroundColor: 'transparent'`) or a probe
   timing artifact on the reopened popover. Worth one deterministic
   probe before anyone documents the menu's theme story either way.

## Verified TRUE (receipts)

- **PROVIDER-SNAPSHOT KERNEL LAW, verbatim**: `provideDensity(() =>
  resolvedDensity)` (breadcrumb.svelte:113) carries the density supply;
  `provideUniversalLanes({ size, shape, radius, color, theme,
  elevation, motion })` (:132) omits density exactly as the axes
  summary says. The eager captured-parent capture (r11/3.3) is intact.
- **Density supply + rung stamps (SSR bytes)**: explicit rungs stamp
  normalized spellings — the small/large panels stamp
  `data-density="sm"` / `"lg"` (small · medium · large → sm · default ·
  lg via `normalizeDensityLane`, defaults.svelte.ts:436), `auto` panels
  stamp nothing (`densityRungOf` returns undefined for auto/number/
  query), and the query nav stamps `sm` in SSR — the base resolved, as
  the caption says. 12 navs, 20 links, 12 currents, 22 separators,
  24 `aria-current="page"`, 6 `hidden` fold attrs in the bytes.
- **The trail is density-immobile (measured)**: ol gap 6px, list
  font-size 12px on BOTH sm and lg panels — the fixed-token claim
  (`--jx-space-6`, `--jx-text-label-lg`) holds; the supply is the point.
- **The composed menu rides the rung (measured)**: menu item
  padding-inline 8 → 16px, min-block-size 32 → 48px, font-size 12 →
  15px between the sm and lg panels. Mechanism source-verified: the
  popover is NOT portaled (dropdown-menu.svelte renders the panel
  inside the anchor span, a DOM descendant of the nav), so the nav's
  `[data-density]` scope re-declaration reaches it; the anchor span
  re-stamps the rung itself (`data-density="sm"/"lg"` measured).
- **query() both directions (measured, real viewport moves)**:
  1280px (80rem) → `lg`, 800px (50rem) → `sm`, 1280px → `lg` again.
  The call form is the bare `query({ lg: 'large' }, 'small')` — no
  explicit generics, which type-checks (base infers) but deviates from
  the integrated-page two-generic standard; folded into finding 2's
  drawer fix rather than flagged separately.
- **Consumed-vs-supply grep**: ZERO `--jx-*-effective` reads under
  `lib/ui/breadcrumb/` (all eight supply-only/mechanism rows honest);
  the composed consumer reads exactly what the rows claim —
  dropdown-menu.css:28 `corner-shape: var(--jx-shape-effective, round)`,
  :32 the §3 concentric fallback
  `max(0px, calc(var(--jx-radius-effective) - var(--jx-inset-effective)))
  × factor`, and dropdown-menu.svelte:169-170 composes
  `--jx-radius-consumed` in both the explicit and auto forms.
- **Radius row, measured live**: `radius="large"` nav → panel
  `--jx-radius-consumed: calc(10px * 1)`, border-radius 10px; an auto
  nav's panel resolves the fallback verbatim to the theme's 0px base —
  corner-shape computed `superellipse(1)` both. "Open the node and the
  panel takes the radius" is exactly true.
- **Shape row TRUE**: the trail paints no corners (chevron is a rotated
  border square, breadcrumb.css:24-33); the corner consumption lives
  entirely in the menu (receipt above).
- **aria story TRUE**: `aria-current="page"` is hardcoded (Page
  `Omit<HTMLAnchorAttributes, 'aria-current'>` — not overridable); the
  separator is `aria-hidden="true"` by construction with the
  data-glyph chevron/custom stand-down; the menu walk's highlight is
  the paint-only `data-walk-active` attribute (dropdown-menu.css D-5
  note) — "never touches aria-current" is source-true; Enter on a menu
  entry hides the popover, refocuses the trigger, and navigates
  (handleNavigate) — the a11y table's contract matches the code.
- **Collapse honesty**: explicit `href` wins, else the first hidden
  page's href derives from its own DOM on hydrate (source-verified;
  SSR renders the fold's 5 wrapped items `hidden` with the ellipsis
  link hydrated after).
- **Census citation accurate**: breadcrumb IS in the 13-hole D5 sweep
  list (explicit-props/research/migration-census.md:313), the ~60
  legacy `densitySlot` consumers figure is real (:10), and the
  Dropdown `density: Density` row is the legacy local spelling, not a
  §13 rename — source-verified (`density?: Density` from
  $lib/density.svelte) and honestly documented as the part's own
  opinion slot.
- **EXTRA-lane refined law**: the family-local `density` prop on
  BreadcrumbDropdown shadows an axis name and its row RENDERS — the
  table carries no `universal` flag so the split never sweeps it
  (SSR: 3 density rows total, the Dropdown row present with
  `Density | ambient scope`). 策展覆盖=渲染 for all five hand tables.
- **Markers/archetype**: `data-jx-props-table-universal` ×1,
  `data-doc-install` ×1, `data-doc-see-also` ×1; all eight toc ids
  present in DOM in order (hero → install → overview → usage → three
  declared live-example sections → props → axes → a11y → see-also);
  en-US clean; 吃也供 unnamed in page prose (the one SSR hit is
  jixoai.css's inlined comment, the badge precedent).
- **docs-skeleton-scope**: breadcrumb absent from the backlog file —
  consistent with the mounted install/see-also markers.

## Tier judgment

Agree with scribe's **tier 2**. The restructure's bones are the
campaign's strongest supply/consume work (provider-snapshot disclosure,
composed-consumer mechanics, census citations, the walk-vs-current aria
distinction); the BLOCKER is a wording-level fix with an established
pattern (badge's theme row), and the same-source + toc gaps join
existing lanes. Nothing needs deleting.

## Gates

Reviewer-side, not re-run to closure (orchestrator re-verified 110/110
+ tailwindless at 6900340b): my evidence is the SSR byte probe (26/27,
the 1 fail = finding 3) + four live probes, all above. Dev smoke
HTTP 200, bytes 1,081,480.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244`; `lsof -i :5244
  -sTCP:LISTEN` → 0 lines BEFORE starting. Kill-by-PID receipt appended
  in the closing message (listener PID + post-kill 0-line lsof).
- Probe/scratch: /tmp only (`marginalia-7-ssr-probe.mjs`,
  `marginalia-7-live-probe.mjs`, `marginalia-7-menu-theme-probe.mjs`,
  `marginalia-7-radius-probe.mjs`, `marginalia-7-breadcrumb-ssr.html`,
  `marginalia-7-dev.log`). Repo-side writes: this report +
  experience.md consolidation note. NO commits, NO push.

## Consolidation note (appended AFTER my report was filed)

Cross-read vellum/reports/6-review-breadcrumb.md (NEEDS-WORK, 0 BLOCKER
· 2 MAJOR · 2 MINOR · 2 NIT). Verdicts agree; findings overlap heavily;
two severity/convention reconciliations and two concessions:

- **AGREED — the theme overclaim** (their MAJOR-1 ≈ my BLOCKER): same
  three locations, same measured core (link ink `oklch(0.3211 0 0)`
  frozen, page ink `oklch(0 0 0)` frozen, chevron + `--ring` raw voices
  flip), same fix pattern (badge theme-row split + the W-next
  semantic-ink gap). Vellum adds the built-dist declaring-selector grep
  (`--jx-*` ink voices declare only at `:root, .xbpgcew`, never plain
  `.dark`) — the source-level half of my empirical receipt; adopt.
  **Vellum's menu story refines mine and is more precise**: I measured
  the PANEL color flipping (`.jx-menu`'s raw
  `color: var(--popover-foreground)`, dropdown-menu.css:21) and
  reported "the composed menu panel's ink flips"; vellum's dist grep
  shows the menu ITEM's ink is a frozen stylex voice
  (dropdown-menu.stylex.ts:43) — which my own probe corroborates
  without my noticing: `itemColor` read BLACK (`oklab(0 0 0)`) under
  the dark toggle while the panel flipped to white. Net truth: the menu
  re-themes only in its raw-reading voices (panel-level color rule,
  current-entry recipe); the readable menu-item ink is frozen like the
  trail's. Any fix must say "partial" at BOTH levels, not just the
  trail's. Severity reconciliation for the consolidator: my BLOCKER
  call treats "measured-false central claim on an axis row" as the
  reader-deceives class (vellum's badge BLOCKER standard); vellum's
  MAJOR weighs the wording-only fix and the absence of a structural
  hole. Both file NEEDS-WORK; outcome identical.
- **AGREED — the fold drift** (their MAJOR-2 ≈ my MINOR-2's sharpest
  receipt): `text-muted-foreground` vs `cx(rt.inkMuted)`, verbatim same
  lines. Vellum scopes it shown-vs-running (§4 hard law); I scope it
  inside the missing same-source lane (ids + resolveRawCode + PILOTS,
  the accordion/badge path) with the `close` dodge and the
  non-runnable axes drawer as siblings. Fix once, both satisfied.
- **CONCEDE — query() generics**: I inferred the bare form type-checks
  (base infers `B`); vellum carries the better evidence — scribe
  self-reported the svelte-check error and the runtime signature
  declares both params — and the form teaches registry consumers the
  failing shape. Adopt their MINOR-3 + MINOR-4 (the caption's "parts
  keep their ambient read until the engine resolves" names a re-stamp
  that never happens; my SSR check counted nav stamps and missed the
  ABSENCE of part stamps on the query nav — good catch).
- **CONCEDE — toc casing**: my NIT-6 retracted. Anchor's toc uses the
  same lowercase demo-label convention ("what it does", "the line
  pick"); breadcrumb matches the anchor pattern and is internally
  consistent. Vellum's "matches the anchor convention" verified.
- **DOWNGRADED — see-also toc row** (my MINOR-3 → NIT): vellum is right
  that toc↔DOM is 1:1 complete (8/8). The cohort is SPLIT, not
  settled — badge/alert list See also; anchor/blockquote/breadcrumb
  don't. The real residue: the DocsSeeAlso wrapper carries no id, so
  the section is unreachable from the rail on every page in the
  no-entry half. One Owner ruling (list it everywhere + wrapper id,
  or codify the omission) closes it cohort-wide.
- **MINE UNIQUE, unchanged**: `--jx-gap` missing from the density
  row's channel list; "the generated Universal section" wording over a
  page with no generated meta; and my observation 7 now doubles as
  evidence AGAINST vellum's fix wording assumption — my probe measured
  the menu's current-entry background NOT flipping under `.dark`
  (oklab(0.9551 0 0 / 0.7) both profiles) while vellum's fix text
  lists "the menu's current-entry recipe" among the flipping raw
  voices (their receipt for it is source-level, breadcrumb.css raw
  tokens; mine is the computed value). One deterministic probe owed
  before the fix wording lands.
- **ADOPT (vellum-unique, no disagreement)**: the coefficient-pinned-
  at-1 carrier-story NIT (named rungs stamp BOTH attr and
  `--jx-density-coefficient: 1` — SSR-verified by vellum) and the
  axes-summary wall (§1 one-idea-per-paragraph).
