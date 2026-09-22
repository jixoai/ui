# TASK 15 — REVIEW button-group (1st of 2) — the PROVIDER family

- **Reviewer**: scribe (first reviewer; reviewer #2 = marginalia, after)
- **Target**: vellum's page integrated at `80c46cac` — `docs(button-group): tier-2 archetype repair (vellum task 12)`
- **Scope**: page (`apps/www/src/routes/docs/components/button-group.html/+page.svelte`, 788 lines) + button-group's PILOTS axes block (`test/canvas-same-source.spec.ts:491`)
- **Method**: source read (page + family + press-button reads + jixoai.css scopes + scroll-run.css), raw-SSR byte parse, live computed probes (playwright-core + system Chrome, /tmp scripts), solo specs + verify battery
- **VERDICT: PASS** — the provider story's measured claims all hold; findings below are one under-reported lane + hygiene fixes to ride into the 2nd review's closure

## The provider story, claim by claim

### 1. Four-voice theme split measured — TRUE (all four voices re-measured live)
Co-resident specimens probed in one evaluate ("density default row" light vs "dark row" theme=dark, permanent `.dark` island):

| Voice | Claim | Measured |
|---|---|---|
| FLIPS | outline border (--jx-outline slot) 0→1 under .dark | `border: oklch(0 0 0) → oklch(1 0 0)` (black→white), 1px both |
| FROZEN | label ink (--jx-foreground alias) | `oklch(0 0 0) == oklch(0 0 0)` — dark row keeps the light :root substitution |
| THEME-NEUTRAL | seams paint no color | ghost group's real sep element: `backdrop-filter: contrast(0.5)`, `background: rgba(0,0,0,0)` — zero color channel |
| FOLLOWS | cluster shadow (raw --shadow-xs) | `rgba(0,0,0,.5) 2px 2px → rgba(255,255,255,.5) 2px 2px` |

Declaring layers named: the flip re-runs the substitution at the island because `:root, .jx-light, .dark` re-declares `--jx-outline: var(--border)` ON the scope (jixoai.css:1500-1505, the canvas-bug law) and the raw `--border` flips under `.dark`; the frozen ink is the stylex token alias substituted at :root (press-button.stylex.ts:92 `color: tokens['--jx-foreground']`); the shadow is a RAW `--shadow-xs` read on the root, re-declared under the island's `.dark` (jixoai.css:269/316, white ink per the Owner's geometry-frozen ruling); the seam engine carries no color tokens at all (button-group.css `[data-jx-btngroup-sep] { backdrop-filter: contrast(0.5) }`).

### 2. Density provider re-bases JOINED buttons — TRUE, with one under-reported lane (finding 1)
Measured live: **xs 28/11 · sm 32/12 · default 40/13 · lg 48/15** (block + font). Method note: default+lg are prop-driven specimens; xs/sm measured by setting the rung's `data-density` attribute on a live group root (the same attribute the component's named-rung stamp writes — the css scope is the mechanism under test). The number lane is inert: inline `--jx-density-coefficient: 3` on a live group → buttons stay 40/13 (the declaring-element law: the coefficient composes in the :root rung scopes; the wrapper re-declares nothing).
Provide-side verified in source: `provideDensity(() => resolvedDensity)` with the eager parent-capture (`button-group.svelte:408-414`, the derived_references_self guard), the provider-snapshot kernel law honored (density NOT in the `provideUniversalLanes` literal, :450); the `[data-density]` scopes re-declare `--jx-hit` (jixoai.css:2621/2674/2727/2796) and `--jx-text` (:454/…), and the joined buttons read exactly those (`press-button.stylex.ts:42` minHeight, :44 fontSize). Pins: `test/defaults-buttons.spec.ts:194` (provider duties) + :223 (child adopts tier / explicit wins / opinion-less inherits without self-reference, parent flip re-resolves); `test/density-adoption-menus.spec.ts:78` covers the reactive provider kernel itself (menus, not this family — noted).

### 3. Radius carrier / size supply-only — TRUE
- Radius: no carrier → button corner **0px**; inline `--jx-radius-effective: 16px` → **16px** (0→16 measured); the page's `radius="medium"` specimen → **8px**. Mechanism: `press-button.css:66-73` `border-radius: var(--jx-radius-consumed, calc(max(0px, R_eff − inset_eff) × factor_eff)))` — R−seam with the defaulting seam at 0.
- Size: inline `font-size: 20px` on the group root → button type stays **13px** (the button's own `fontSize: var(--jx-text)` atom beats inherited root font) — exactly the row's measured claim.

### 4. W7 scroll verdict — TRUE, re-derived live
`data-jx-scroll-state="start-closed"`, scrollLeft 0, `overflow-x: auto`, `scrollbar-width: none`, `scroll-behavior: smooth`, content overflowing (scrollWidth 232 > clientWidth 172); under start-closed every start chevron computes `display: none`, every end chevron visible. Source of record: scroll-run.css:74-85 (the run IS the scroller) + :243-251 (verdict gates) + the unlayered veil gates (scroll-run.css:395-399).

### 5. The disclosed follow-up — honest in substance, imprecise in the page comment (finding 4)
The lab/scroll/query rejections are REAL (playground page-state bind, reactive query() embed — un-extractable). But the zone/nesting/boundary trio are STATIC stages, and the axes canvas proves static-plus-atoms stages extract fine (the pinned snapshot keeps `cx(rt.…)` verbatim). They could migrate with an id + an import-map entry for ButtonVariantScope — their non-migration is a deferral, not a rejection-class case. Vellum's commit message says this honestly ("disclosed as follow-up"); the page header comment (:62-66) lumps them into the rejection-class sentence and should say "deferred".

### 6. Standard checks — TRUE
- **Tier 2**: old page (`git show 80c46cac^`) 604 lines with a hand `#theming` DensityDemo section → new page archetype order (hero → install → overview → usage → lab → scroll → variant-scope → examples → nesting → boundary → API → axes → accessibility → see-also). Raw SSR: 12 unique `#` anchors, **0 dead**, toc **11/11** (measured), `#theming` gone.
- **query()**: `query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')` — both generics per the §6 typing law (the page comment documents WHY). Live: 1280 → 48/15 (lg), 600 → 32/12 (base small), 1280 → 48/15. Both directions.
- **Props tables from raw SSR**: API 14 rows (orientation…children*, …rest), axes per-axis table 8 rows, variant-scope 2 rows + its generated universal 8, keyboard 2, ARIA 4. 0 empty cells everywhere EXCEPT the token table (finding 2).
- **a11y**: role=group law + "no aria-pressed" boundary intact; the token note "2xs sits at 24px" agrees with the fleet ruling (24 = AA minimum; the xs rung 28px exceeds it).
- **PILOTS**: button-group's axes block pinned at test/canvas-same-source.spec.ts:491 — solo run 75/75 green.

## Findings (severity-tagged)

1. **[MEDIUM · page wording]** The density row under-reports the re-based lanes: "the scope block re-bases the lanes the joined buttons read (--jx-hit, --jx-text)". The joined buttons ALSO read `--jx-inset` — `paddingInline: 'var(--jx-inset)'` (press-button.stylex.ts:60) — and the same `[data-density]` scope re-bases it per rung: 4px unit × factors 2/2/3/4 (jixoai.css:1250-1253, :1293-1296) = **8/8/12/16px**. The OLD page carried exactly this token row (`--jx-inset: 8 / 8 / 12 / 16px` — verified true) and the archetype repair dropped it. Nothing false is claimed, but "the lanes the joined buttons read" is falsifiable as written and the TokenTable lost a real row. Fix: name the third lane in the row + restore the token row.
2. **[LOW-MEDIUM · TokenTable API + page]** `source: 'structural'` renders an EMPTY Source cell: the union accepts it (token-table.svelte:42) but `sourceLabel` maps only density/component/color (:105) → ''. SSR-measured: the `--shadow-xs` and `--border` rows show empty Source cells (the page's only non-zero empty-cell count). Fix either side: add 'structural' to the map (it reads as a real source class) or drop it from the union and the page's two rows.
3. **[LOW · family css hygiene]** Dead veil-gate selectors in button-group.css:210-217: pre-unification names (`.jx-btngroup-scroll-host`, `[data-jx-btngroup-run]`, `.jx-btngroup-veil-layer`) match nothing in the DOM — the component stamps `jx-scroll-host` + `data-jx-scroll-run` (button-group.svelte:1019-1024, :959) and the LIVE gates live in scroll-run.css (:243-251, :395-399). Zero runtime impact; the stale "UNLAYERED on purpose" comment sits over a dead pair. Delete the residue.
4. **[LOW · page comment precision]** The disclosure should separate the real rejection class (lab/scroll/query) from the deferral (zone/nesting/boundary — migratable under the axes precedent). See §5.
5. **[LOW · family-code, pre-existing]** button-group.svelte type errors for the family owner: :325 `ButtonGroupScrollEffect` unresolved in the instance script (the module-script re-export doesn't reach it), :540 the fleet cx `Object.entries` overload, :570/:571/:636 `.style` on un-narrowed `Element`. Same hygiene class as avatar's (drift-ledger family cleanup). Page file itself: zero errors (2 known-idiom capture warns).
6. **[INFO]** 7 non-reactive-capture warns across page + family (the provideUniversalLanes/usageLive idiom) — runtime probes all green; consistent with the fleet-wide idiom posture.

## Gate receipts

| Gate | Result |
|---|---|
| `verify:docs-universal` | GREEN: 110/110 (exit 0) |
| `verify:tailwindless` | GREEN — files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (exit 0) |
| `verify:docs` | skeleton lint staged scope green (exit 0) |
| canvas-same-source solo | 75/75 (exit 0) |
| button-group family specs solo (button-group + overflow + scroll + defaults-buttons) | 71/71 (exit 0) |
| Live probes | ladder 28/32/40/48 · 11/12/13/15; number inert; radius 0→16 (medium→8); size 13px unmoved; four voices flip/frozen/neutral/follows; W7 start-closed; query 1280→48/600→32→1280 |
| Raw SSR | toc 11/11, 0 dead anchors, API 14 + axes 8 rows, token table 2 empty cells (finding 2) |

## Process evidence

- Port **5243**: `lsof -ti :5243` before = `45872` → killed by PID → after = **empty**, no ps residue; background dev-server task exited 143 (my SIGTERM).
- **No commits, no pushes.**
- Artifacts: probes `/tmp/scribe-15-probe{1,2,3}.mjs` + `/tmp/scribe-15-probe1.log`; SSR `/tmp/scribe-15-ssr.html` (1,291,128 bytes); old page `/tmp/scribe-15-old-page.svelte`; gate logs `/tmp/scribe-15-{canvas,family,universal,twind,docs,scheck}.log`.
- Theme reads: co-resident light/dark specimens in ONE evaluate (no flip, no transition-frame exposure); the first probe's bogus "light" baseline (the dark specimen itself) was caught by the `darkClass: true` field and re-run — the measurement-first discipline applied to my own probe.
