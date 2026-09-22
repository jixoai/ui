# vellum task 6 — REVIEW breadcrumb (docs-eight-axes-mdn)

Reviewer: vellum · 2026-09-22 · main dir, no commits, no push.
Scope reviewed: `apps/www/src/routes/docs/components/breadcrumb.html/+page.svelte`
+ `+page.ts` (scribe task 2, integrated at 37583d35). Family untouched —
verified read-only. Scribe's report (2-breadcrumb.md) used as context only;
every claim below re-derived from source, built dist, raw SSR bytes, or live
measurement.

**Verdict: NEEDS-WORK** — 0 BLOCKER · 2 MAJOR · 2 MINOR · 2 NIT. The bones
are the best-verified of the four pages I have reviewed: census D5 receipt,
provider-snapshot verbatim, all eight stamp/consumption mechanisms, the
menu-ride and query-flip claims all measured TRUE. The first MAJOR is the
theme-split law (§6) — the exact un-rescued shape the badge review flagged,
on the one row that claims full re-theme.

## Process evidence

- Before any work: `lsof -i :5242 -sTCP:LISTEN` → empty (exit 1).
- Dev server: wrapper PID **58699** (`npx vite dev --port 5242 --strictPort`,
  log /tmp/vellum-6-bc-vite.log). Killed by PID after probing;
  `lsof -ti :5242` → empty (exit 1) after kill; no orphan grandchild (the
  documented wrapper-PID lesson — port re-checked by its own holder path).
- Raw SSR: `curl :5242/docs/components/breadcrumb.html` → /tmp/vellum-6-bc-ssr.html
  (1,081,480 bytes) — all payload/row greps on raw bytes, not page.content()
  (the entity-escape law).
- Declaring-selector greps on the BUILT dist asset 0.DRQtofFE.css (dev CSSOM
  injects nothing greppable). Probes: /tmp/vellum-6-bc-review-probe.mjs,
  -query-probe.mjs, -menu-probe.mjs, -immobile-probe.mjs (playwright-core +
  system Chrome, headless).

## Verified TRUE (receipts)

- **Tier 2 justified** — scribe's old-page audit (patchwork band outside the
  shell, W3-era uniform size demo card, stale toc) supports tier 2; the
  restructure is real and the old page's facts survived (fold, separator
  swap, sibling jump, derive-on-hydrate, ellipsis part).
- **Archetype §2 order** — hero → install → overview → usage → live examples
  → props → axes → a11y → see-also; matches the integrated pages' precedent
  (anchor's overview/usage slots).
- **toc complete** — +page.ts lists exactly the 8 DOM ids, in DOM order; raw
  SSR: each id ×1; label casing matches the anchor convention.
- **Universal marker ×1** in raw SSR (`data-jx-props-table-universal`);
  `DocsSeeAlso` ×1. No new class identities (`pill` is a registered semantic
  class, routes.stylex.ts:38; everything else rides rt.* atoms).
- **Shared-split trap cleared with an SSR parse** (my badge-review law):
  props-table.svelte:169's filter is per-table and keyed on `showUniversal`;
  the BreadcrumbDropdown table (no `universal`, no `meta`) renders all 5
  rows — parsed from raw SSR: `density | Density | ambient scope` IS there.
  The root universal table's family rows (label/children/...rest) carry no
  axis names, so nothing is silently dropped.
- **Per-axis mechanisms all real**: `data-density` rung + coefficient stamped
  by the root (raw SSR: 12 trail navs — 7 ambient, sm+coeff 1, lg+coeff 1,
  radius carrier verbatim `--jx-radius-effective: var(--jx-radius-large)`,
  1 `class="dark"`, query root sm); `densityRungOf` stamps greped in **all 8
  part files** (list/item/link/page/separator/collapse×2/dropdown/ellipsis);
  menu consumption claims verbatim in dropdown-menu.css (`corner-shape:
  var(--jx-shape-effective, round)` :28; the concentric calc
  `max(0px, calc(radius − inset)) × factor` :32-33; --jx-hit/--jx-line/
  --jx-inset/--jx-text :39-44; **zero** elevation/motion/color/size kernel
  reads — the "nothing consumes" rows hold for the menu too).
- **Provider-snapshot + census**: section summary's PROVIDER-SNAPSHOT
  sentence is verbatim vs breadcrumb.svelte:123-127; census D5 row lists
  breadcrumb in the 13 sweep holes; the ~60-legacy-consumers figure is the
  family source's own (breadcrumb.svelte:105-106), cited as such.
- **Steps/units vs universal-props.schema.ts** — all 8 rows match
  (density sm·md·lg→coefficient incl. the sm·default·lg normalization
  verbatim from density.svelte.ts:31; shape 6 steps, no number; radius/size
  px; color 6 + hue; theme light/dark/system; elevation level-1…level5 + dp;
  motion 4 steps + coefficient).
- **Measured token ladder** (disagreement-probe on coinciding numbers):
  list label 12px (= --jx-text-label-lg), tracking 0.96px = 0.080 × own
  font-size (the em-law asserted as computed ÷ own size), ol gap 6px
  (= --jx-space-6 "unit × 1.5" with unit 4px), uppercase transform, 
  aria-current=page on the current part.
- **Density-immobile trail, measured**: ambient vs sm vs lg panels — fs/gap/
  tracking byte-identical (12px / 6px / 0.96px).
- **Menu rides the rung, measured** (the page's headline demo claim): opened
  the sibling-jump node in each panel — small 32px min-block-size / 12px /
  8px pad-inline vs large 48px / 15px / 16px; query panel at 1200px reads the
  lg rhythm (48px/15px). Native popover stays a DOM descendant of the nav, so
  the nav's `[data-density]` scope block re-scopes the channels the menu
  reads — "open the node and watch the menu rhythm step" is true on both
  sides of 64rem.
- **query() flip, measured both directions**: 900px → data-density="sm";
  1200px → "lg"; back to 900px → "sm". SSR root stamp sm matches the caption.
- **Props claims vs source**: Page's span form keeps aria-current
  (breadcrumb-page.svelte:52-66); Separator children → data-glyph="custom",
  aria-hidden always (breadcrumb-separator.svelte:37-44); Link child contract
  hands merged { class, href, ...rest }; Collapse href derivation walks the
  collapsed run on hydrate (breadcrumb-collapse.svelte:72-86); Dropdown
  aria-current per item + handleNavigate hidePopover→focus trigger→navigate;
  BreadcrumbEllipsis exported (index.ts). A11y walk claim: dropdown-menu.css
  :96-100 — the walk paints data-walk-active and never rewrites aria-current.

## Findings

1. **MAJOR — the theme row and theme demo claim a full re-theme; measured:
   the trail's ink does not flip** (THEME-SPLIT law, §6 ruling).
   `+page.svelte:259-261` ("flips every semantic token the trail and the
   composed menu read"), `:567` ("On the trail's own paint only theme is
   live"), `:641` (demo caption "theme='dark' — the trail consumes this one
   live"). One-evaluate probe: link ink `oklch(0.3211 0 0)` and page ink
   `oklch(0 0 0)` IDENTICAL across the ambient and `.dark` panels; only the
   raw voices flip (chevron `--muted-foreground` 0.3211→0.8452; `--ring`
   149→145 hue). Dist grep: `--jx-muted-foreground` / `--jx-foreground` /
   `--jx-primary` / `--jx-ring` declare ONLY at `:root, .xbpgcew` (+ the
   stylex theme class) — never plain `.dark`; the menu's ink is the same
   frozen voice (dropdown-menu.stylex.ts:43), only its current-entry recipe
   (breadcrumb.css:42-45, raw tokens) flips. On the light page the "dark"
   demo looks near-identical to ambient — the accordion invisible-ink shape.
   Fix: rewrite the row as "partial re-theme, measured: the raw voices flip
   (chevron --muted-foreground, focus --ring, the menu's current-entry
   recipe); the stylex ink voices (--jx-foreground/--jx-muted-foreground/
   --jx-primary) stay :root-frozen — the semantic-ink re-scope gap (W-next
   #1)", and recaption the demo to match; adjust the :567 "only theme is
   live" clause to "theme lands in the raw voices".
2. **MAJOR — the fold demo's shown code is not the running code** (hard law
   §4). `+page.svelte:133` (foldDemo sample) shows
   `<span class="text-muted-foreground">/</span>`; the stage it must match
   (`:480`) runs `<span class={cx(rt.inkMuted)}>/</span>`. `text-muted-
   foreground` is not a registered identity in this tailwindless repo —
   pasted, the sample's slash renders in inherited ink, not muted ink (the
   same string disease exists in code-card/math-block samples — campaign
   debt, but this page's pair is verifiably split within one commit).
   Fix: make both sides one mechanism — stage and sample share a paste-able
   form (e.g. `style="color: var(--muted-foreground)"`), or change the
   sample to the mechanism the stage actually runs.
3. **MINOR — query() called with zero type args; every integrated sibling
   page applies the §6 both-args ruling.** `+page.svelte:653` (stage),
   `:209` (axesUsage sample), `:652` (caption): `query({ lg: 'large' },
   'small')` → `QueryResult<string>` — the svelte-check error scribe
   self-reported and filed as kernel-only debt, but the runtime signature
   (universal-props-query.svelte.ts:120) declares both params, and
   anchor:394 / accordion:554 / badge:317 all use the two-generic form.
   The sample also TEACHES the failing form to registry consumers.
   Fix: `query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')`
   in stage + sample + caption, importing `type DensityLane`.
4. **MINOR — the query caption's "(the parts keep their ambient read until
   the engine resolves)" promises a part re-stamp that never happens.**
   `+page.svelte:666-667`. Measured: the query panel live carries exactly
   ONE data-density element (the nav) at BOTH viewports, while the static
   panels' parts all stamp. The menu DOES step across 64rem — via the nav's
   `[data-density]` scope block re-declaring the kernel channels, not via
   part stamps. "Until the engine resolves" names the wrong mechanism.
   Fix: "(the parts' own stamps stay ambient — the rung rides the nav's
   scope block, so every channel the subtree reads steps with it)".
5. **NIT — named-rung panels stamp BOTH the rung attr and the coefficient;
   the density row's carrier story reads as mutually exclusive.**
   `+page.svelte:225` vs raw SSR (`data-density="sm"
   style="--jx-density-coefficient: 1"`). The kernel's own comment: "a NAMED
   lane selects the scope and leaves the coefficient at 1 (explicit rung =
   exact rung)". Fix: add ", the coefficient pinned at 1" after the
   normalization clause.
6. **NIT — the axes section summary is a wall** (§1: one idea per
   paragraph). `+page.svelte:567` carries three jobs (census adoption, the
   provider-snapshot kernel law, the live/landed/absent split) in one dense
   block. Fix: keep the live/landed/absent split in the summary; move the
   PROVIDER-SNAPSHOT sentence down into the census-citation paragraph, which
   already cites the bridge and the D5 row.

Zero BLOCKERs — justified: my first suspect was the badge shared-split shape
(a family prop named like an axis silently eaten by the universal filter);
parsed the SSR rows before concluding and the Dropdown `density` row renders.

## Highlights (scribe's page doing better than mine)

- **The third consumed-vs-supply state — "stamped but landed in a composed
  part"**: the density/shape/radius rows name WHERE the supply lands (the
  menu's --jx-hit/--jx-line/--jx-inset/--jx-text; the panel's concentric
  calc) and the demos instruct "open the node". My alert/anchor rows stop at
  consumes/doesn't. Commitment: alert's density row gets a landed-where
  clause pattern on my next touch; any future family that composes
  consumers gets the landing site + the open-the-node demo.
- **The root-resolves SSR receipt inline on the query demo** ("inspect the
  markup: data-density='sm' on this nav") — scribe's self-caught correction
  turned into a curl-checkable caption. Commitment: my alert query demo gets
  the same stamp-pointing caption (with MINOR-4's corrected mechanism).
- **The census paragraph disposes the non-deviations** ("No §13 renames
  apply: label is a family prop… not an axis rename") — pre-empting the
  reviewer question inside the citation. Commitment: my census paragraphs
  gain the no-rename dispositions.
- **Per-part-group props tables** (root / List+Item / Link+Page /
  Separator+Ellipsis+Collapse / Dropdown) instead of one flat table —
  scannable MDN reference style. Commitment: alert's single props table
  splits the same way on my next touch.
- **Provider-snapshot quoted verbatim at the claim site** (verified vs
  breadcrumb.svelte:123-127) instead of paraphrase. Commitment: my alert
  census paragraph upgrades to verbatim + source line.
- **Gate discipline**: verify:docs-universal re-run on FRESH dist after the
  full build — my stale-dist lesson applied unprompted; scribe's
  log-file + `$?` discipline held throughout.
