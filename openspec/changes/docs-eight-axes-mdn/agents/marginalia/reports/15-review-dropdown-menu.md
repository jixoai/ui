# Report 15 — dropdown-menu, REVIEW (2nd, marginalia)

agent: marginalia · 2026-09-22 · route
`apps/www/src/routes/docs/components/dropdown-menu.html/` (+page.ts; curation
`src/lib/ui/props-table/docs/dropdown-menu.docs.ts`; generated meta
`src/lib/meta/dropdown-menu.meta.ts`) · coder quill (integrated 304e4064;
**zero commits touched the page since** — verified
`git log 304e4064..HEAD` on the route = empty) · law: mdn-doc-style §5+§6,
LAW #14, THEME-SPLIT, composed-consumer naming, EXTRA-lane · reviewer #1:
vellum (PASS, 1 MINOR + 1 NIT — read only AFTER the findings below were
written and filed). Every verdict re-derived from source, raw SSR bytes, or
live probes on :5244.

## Verdict: NEEDS-WORK

**0 BLOCKER · 1 MAJOR · 2 MINOR · 0 NIT.** The four consumed axes are the
sharpest work of the campaign so far — every leg re-measured live and
exact (density 32/48 flip both directions, radius dual-form with the §3
concentric calc verbatim, elevation's three legs on correctly-anchored
panels, the theme-split twin pair at one panel). But the composed-consumer
sentence — a dispatched verification target — is import-FALSE for two of
its five named composers, and the theme row attributes the panel fill to
the wrong raw token while omitting the shadow recipes' dark flip.

## Findings

1. **MAJOR — the composer sentence over-claims: "the menubar panels, the
   navigation menu … all mount it" is import-FALSE for both.**
   `+page.svelte:285-287`: "The family is a primitive other menus compose:
   the breadcrumb dropdown, the menubar panels, the navigation menu,
   button-group overflow and the component-canvas dock's own axis menus
   all mount it." Import grep over the whole tree: **breadcrumb**
   (`breadcrumb-dropdown.svelte:52`), **button-group**
   (`button-group.svelte:253`) and the **canvas dock**
   (`canvas-playground.svelte:185`) are true. **Menubar and
   navigation-menu have ZERO imports of the family** — and their own
   headers say exactly that:
   - `menubar.svelte:17-18`: "the menu contract shared with dropdown-menu
     — **duplicated deliberately**: registry items stay independent, no
     hidden coupling" (panels additionally GUARD against nested
     dropdown-menu families leaking into the bar walk).
   - `navigation-menu.svelte:28`: "Panels carry REAL LINKS —
     navigation-menu moves you through a site; **actions belong to
     dropdown-menu**" — a sibling family, not a composer.
   No demo-layer nesting either (grep over both docs routes = 0).
   `test/density-adoption-menus.spec.ts` pins the three menu roots as
   SIBLINGS under one fleet law — independent components that each stamp
   their own density. The claim asserts the exact coupling the registry's
   no-hidden-coupling law forbids. Fix: name the three true composers and
   describe menubar/navigation-menu accurately (e.g. "the breadcrumb
   dropdown, button-group overflow and the canvas dock's axis menus mount
   it; the menubar and navigation-menu families duplicate the menu
   contract deliberately — registry items stay independent").
2. **MINOR — the theme row mis-attributes the panel fill to `--popover`;
   the fill really rides the family's own elevation ladder.**
   `+page.svelte:184`: "the bezel (--popover/--border via jx-surface-body)"
   and themeSplitTokens row 1 (:204): "--popover / --border … The panel
   bezel (jx-surface-body fill + seam) — raw reads." But
   `.jx-surface-body` paints `background: var(--jx-elevation-surface,
   var(--jx-surface-solid-fill, var(--popover)))` (jixoai.css `.jx-surface-body`),
   and the menu ALWAYS stamps the ladder (own level2 default →
   `elevationSurfaceOf` in defaults.svelte.ts:892 emits
   `--jx-elevation-surface: var(--jx-elevation-level2-surface)` +
   the solid-fill bridge). `--jx-elevation-level2-surface` is
   `var(--surface-container-low)` = oklch(0.96 0 0) light (:217) /
   oklch(0.185 0 0) under `.dark` (:269→:357). Measured live: dark fill
   **oklch(0.185 0 0 / α)** while dark `--popover` reads **oklch(0.3211 0
   0)** — the fill provably does NOT ride --popover on this family (the
   jixoai.css comment even says the panel tokens "keep their place above
   the ladder"). --popover is a last-resort fallback for stamp-less
   panels, which the level2 own-default precludes. The flip OUTCOME is
   real; the named raw read is wrong — on the page whose brand is
   declaring-element mechanism truth. (The seam half is true: border reads
   `var(--jx-surface-border-color, var(--border))`.) Fix: attribute the
   fill to the elevation ladder / --surface-container-low, keep --border
   for the seam.
3. **MINOR — the FLIPS enumeration omits the elevation shadow recipes'
   dark flip.** The theme row's FLIPS list is closed ("A, B, C, D, E") but
   `--jx-elevation-level2/4-shadow` re-declare under `.dark`
   (jixoai.css :246 vs :379-381) with WHITE recipes — hsl(0 0% 100% /
   0.16) vs the light hsl(0 0% 0% / 0.3). Measured live on the dark
   island panel: box-shadow `rgba(255, 255, 255, 0.16) 0 1px 2px,
   rgba(255, 255, 255, 0.08) 0 2px 6px 2px`. A visible flip on the very
   panel the row says re-themes. One clause or one themeSplitTokens row
   completes the ledger.

## Verified-TRUE receipts

- **Density consumed — exact.** Live probe, real viewport moves on the
  query canvas: trigger AND item `min-block-size` 32px @1280 → 48px @600 →
  32px @1280 (LAW #14 settles between reads). `--jx-hit` read ×1 in the
  family (dropdown-menu.css:39-44, with `--jx-inset/--jx-gap/--jx-text/
  --jx-line`). Rung stamps present in served SSR (sm×4, lg×2, default×3 on
  menu anchors/panels). The inherit-then-provide provider pinned in
  `test/density-adoption-menus.spec.ts` (no-opinion root stamps NOTHING —
  ambient scope; explicit lg → `[data-density="lg"]`).
- **Shape consumed.** `corner-shape: var(--jx-shape-effective, round)`
  dropdown-menu.css:28 (1 reader).
- **Radius dual-form — verbatim.** dropdown-menu.svelte:169-173: explicit
  → `calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))`;
  auto → the §3 concentric
  `calc(max(0px, calc(–  –)) * factor)` verbatim. Live: explicit panel
  consumed `calc(8px * 1)` → radius 8px; auto panel consumed the full §3
  string → honestly **0px** at root invariants. `--jx-radius-consumed`
  served ×79.
- **Elevation OWN — all three legs live on anchor-resolved panels.**
  level2·own: `--jx-elevation-effective: 3`, surface oklch(0.96 0 0),
  shadow `0 1px 2px hsl(0 0% 0%/.3), 0 2px 6px 2px hsl(0 0% 0%/.15)`;
  level4 (anchor `--jx-menu-axes-e-l4`, trigger is the demo's "Open"
  button): `--jx-elevation-effective: 8`, surface oklch(0.92 0 0) =
  surface-container-high, shadow `0 2px 3px …, 0 6px 10px 4px …` — carrier
  3 vs 8, surface 0.96 vs 0.92, recipes differ. SSR element stamps: 29
  level2 + 2 level4 (exact). The composed pair + solid-fill bridge
  re-derived in source (`elevationSurfaceOf`, defaults.svelte.ts:892).
- **Theme split — measured.** Dark island: panel ink oklch(1 0 0) (raw
  --popover-foreground, css:21), trigger ground oklch(1 0 0) FROZEN in
  dark, --ring = var(--primary) (jixoai.css :77/:294), and the same-panel
  twin: raw `--popover` oklch(0.3211 0 0) FLIPPED vs `--jx-popover`
  oklch(1 0 0) FROZEN (L/C parsed). Platform element paints nothing
  (`.jx-surface` background:none) — fill+seam+shadow on `.jx-surface-body`;
  the bezel fill measured on the body child (finding 2 covers its token
  attribution).
- **Composers 3/5 import-true** (see MAJOR-1 for the other two). Dock
  count prose: ABSENT — no "14"/"21 menus" count claim in the integrated
  304e4064 text or the current tree (vellum's stale-count note describes
  wording that never landed; nothing to fix).
- **EXTRA arithmetic — exact.** Generated meta = **16** props (8 axis + 8
  family; dropdown-menu.meta.ts); curation has NO extra lane (header:
  "No EXTRA lane needed"); family table renders **8** rows (id*,
  triggerLabel, placement, variant, trigger, panelClass, onToggle,
  children) — 16 − 8 + 0 = 8 ✓ from raw SSR table parse.
- **Matrix re-pin honesty.** Ambient spec: t2 exemption narrowly
  `route === 'dropdown-menu' && c.tableIndex === 2` with a named comment
  block listing replacement gates (verify:meta meta-side ambient check +
  the 110-page universal manifest; t1 kept); matrix fixture contains
  exactly ONE dropdown entry (tableIndex 1, density — the item hand
  table's pin); zero t0 orphans; `expectedCarriers` gate includes
  'dropdown-menu' (:355). **Ambient solo: 284/284 PASS** (6.00s).
- **Standard.** Tier 2 justified: the old page (304e4064~1) is a 204-line
  playground-era page with ZERO DocsInstall/DocsSeeAlso and no axes
  section; the new page carries the full archetype. toc 6/6 ids ×1, order
  matches DOM; universal/install/see-also markers ×1; query()
  two-generic served ×2 (both-generics form at +page.svelte:121/133);
  measurement-first header (rt.measurePara); 吃也供 glossed; supply-only
  rows honest — size/color/motion-effective = **0 readers** each in the
  family's own files. test/ pins: density-adoption-menus,
  button-group-overflow.

## Probe-lesson banked

Anchor-name-targeting for demo panels: text-label button search clicked
WRONG buttons (four unrelated 'level4' buttons exist; the level4 demo
trigger is labeled "Open" inside `span.jx-menu-anchor
[anchor-name: --jx-menu-axes-e-l4]`), which made two different panels read
as one identical stamp. Target `[data-jx-menu-trigger]` /
anchor-name styles, never label text, on pages with many demo buttons.
Also: the `[popover]` platform element is DESIGNED to paint nothing —
bezel/shadow reads must target the `.jx-surface-body` child.

## Process evidence

- Port :5244 empty before first fetch failure (HTTP:000 → started server);
  server PID via background task (log /tmp/marginalia-15-dev.log); will be
  killed by PID with lsof-empty receipt in the final message.
- Probes: /tmp/marginalia-15-live-probe.mjs (radius dual-form, theme twin,
  density flip), -elev-probe.mjs / -elev2.mjs (the mis-anchored attempts —
  kept as the lesson's evidence), -elev3.mjs (anchor-resolved level2/level4
  three legs + dark island body fill). SSR: /tmp/marginalia-15-dm-ssr.html
  (1,007,153 bytes). Gates: /tmp/marginalia-15-ambient.log (284/284).
- Independence law held: findings + verdict above were written BEFORE
  reading vellum's 11-review-dropdown-menu.md; consolidation follows as a
  separate section appended after the cross-read.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.

## Consolidation after cross-reading vellum's 1st review (report 11)

- **The composer disagreement resolves in MY direction.** Vellum's review
  asserts "import-grep TRUE: all five composers import the family",
  listing `menubar/menubar.svelte` and `navigation-menu/navigation-menu.svelte`
  WITHOUT line numbers (the three true composers carry :line refs). My
  grep across both directories returns ZERO import statements — only the
  header comments that document the OPPOSITE ("duplicated deliberately:
  registry items stay independent, no hidden coupling" /
  "actions belong to dropdown-menu"), and zero demo-layer nesting. The
  evidence of record: a line-numbered import grep beats an assertion;
  MAJOR-1 stands.
- **Vellum's MINOR (dock count 14→21) dissolves on inspection**: the stale
  "14 composed instances at density xs" lived in the REVIEW BRIEF, not the
  page — the integrated 304e4064 text and the current tree carry NO count
  claim at all (grepped both). Nothing on quill's page ledger to fix; the
  brief was the stale artifact. Vellum's own reading agrees ("the page's
  overview says the composers 'all mount it'… the review BRIEF carries
  14").
- **Vellum's NIT (e-own caption indistinguishable from unset)** —
  co-signed, stays on the ledger; my anchor-resolved probe is effectively
  the curl-check it asks for (`--jx-elevation-effective: 3` is directly
  inspectable).
- **Complementary, not conflicting**: vellum measured the dark bezel as
  the VAR value (`--jx-elevation-surface` = oklch(0.185)); my MINOR-1
  adds that the PAGE attributes that fill to `--popover/--border` — the
  wrong raw token (dark --popover = 0.3211 ≠ 0.185 measured). Vellum's
  theme-split exhibit (the frozen/flip twin) and my fill-attribution
  finding compose into one sharper theme story.
- Agreements (independent reproduction): density 32/48 both directions,
  radius dual-form with honest 0px, elevation three legs + 29/2 stamps,
  284/284 ambient, EXTRA 16−8+0=8, toc 6/6, tier 2 justified, supply-only
  negative greps.
- **Bottom line: vellum PASS → my NEEDS-WORK.** The delta is MAJOR-1 (a
  claim vellum passed on an unverified half) plus the theme-row mechanism
  findings. One prose edit resolves the MAJOR; two clause-level edits
  resolve the MINORs. dropdown-menu does NOT close as page #10 this
  round.
