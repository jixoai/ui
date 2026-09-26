# Report 5 — REVIEW `badge` (vellum, 2026-09-22)

Reviewer: vellum. Coder: marginalia (integrated at 5bb2e22d). First review;
scribe owes the second. Probe evidence: 24-check Playwright probe
(/tmp/vellum-5-badge-probe.mjs) against `node scripts/dev.mjs --port 5242`
(HTTP 200, bytes 942520 — same byte count marginalia reported), plus SSR
HTML table-parse of the Props section. Theme split verified per MY OWN
theme-split disclosure law: both halves read inside ONE evaluate
(cross-instant law — the wall-clock hue rotation invalidates cross-tick
color reads).

## Verdict: NEEDS-WORK (one BLOCKER; everything else measured TRUE)

The page's measured claims are exemplary — every number I probed held
(24/24 after excluding two probe-side artifacts, both my own documented
failure modes). But the Props section has a rendering hole the coder's own
curation was positioned to catch: chip hit the identical collision one task
earlier and documented the rescue; badge's curation repeats the collision
without the rescue.

## Findings

1. **BLOCKER — the family `shape` prop row never renders; BADGE_DOCS'
   `shape` override is dead curation; the page then contradicts itself.**
   `apps/www/src/lib/ui/props-table/props-table.svelte:169` filters
   `UNIVERSAL_AXIS_NAMES` out of the main rows whenever the shared
   universal section renders — and `'shape'` is an axis name. Badge's meta
   carries the family prop `shape` (badge.meta.ts:47, ambient `own`), so
   `propsFromMeta` builds the row with the override's union text and
   corner-law prose — and the split drops it before render. SSR table-parse
   (port 5242): family rows = style, variant, slotStart, slotEnd, class,
   children, rest — **no `shape`** — while the generated Universal props
   section renders `shape | 'round' | 'scoop' | 'bevel' | 'notch' |
   'square' | 'squircle' | 'auto' | 'auto'`, i.e. the §2 shape axis the
   page's own per-axis row calls "Deliberately ABSENT" (+page.svelte:80) and
   the hero summarizes as "the eighth is the family's own corner law".
   A reader of the Props section alone learns the opposite of the page's
   headline deviation, and the census citation written into the override
   never renders. chip resolved this exact problem and DOCUMENTED it:
   chip.docs.ts:19 "The row rides `extra` back into the table" +
   chip.docs.ts:72-80. **Fix (one edit):** in
   `apps/www/src/lib/ui/props-table/docs/badge.docs.ts`, move the `shape`
   override into `extra: [{ name: 'shape', type: "'square' | 'pill'",
   default: "'square'", ambient: 'own', description: <the existing
   corner-law prose, plus chip's "Rendered from extra: the shared split
   filters this name from the generated rows" clause> }]`, deleting the
   now-redundant `overrides.shape`. (The shared section's §2 shape row is
   meta.universal infrastructure common to every migrated page — not this
   task's to change; noted for the W6 Owner dossier, which the page already
   flags.)

2. **MINOR — the per-axis density row's Type column contradicts both the
   schema and the page's own demos.** +page.svelte:91 types density as
   `'small' | 'medium' | 'large' | 'auto' | number`, but DensityLane is
   `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' |
   'auto' | number` (universal-props.schema.ts:71) — and the canvas 60px
   below stamps `density="2xs"` and `density="lg"`, values outside the
   shown union. Review-checklist §3 (steps/units vs schema) plus
   examples-match-source. **Fix:** extend the type text to the full lane
   (the row's prose already carries the alias law; the column should not
   understate it).

3. **NIT — TokenTable ladder notation: 4 values for a 5-rung span.**
   +page.svelte:339 lists `--jx-text-secondary` "10 / 11 / 12 / 14px
   (2xs → lg)" — four values across five rungs (2xs, xs, sm, default, lg;
   the sibling line row :340 correctly lists five). Measured anchors hold
   (2xs 10, default 12, lg 14) but the mapping is ambiguous. **Fix:** spell
   the rung grouping the way the inset row does (:341 "2xs–sm / default /
   lg"), e.g. "(2xs–xs 10 · sm 11 · default 12 · lg 14)" once xs is
   measured.

4. **NIT — antecedent slip + a touch of personality in the children
   curation.** badge.docs.ts:44-45: "The label text — the whole point of
   the chip. It renders as a plain `<span>`…" — grammatically "It" = the
   label text, but the chip is the span and the label renders as its bare
   content (the Overview has it right: "The chip is a plain `<span>`… The
   label is the children"); "the whole point of" is §1 personality.
   **Fix:** "The label text — the chip's entire content; the chip renders
   it as bare span content (the chip itself is a plain `<span>`)."

## Verified TRUE (the measured claims, my own probe)

- **THEME-SPLIT law — both halves, one evaluate:** tonal ground/border/ink
  flip under the `.dark` island (oklab ground `0.6489…` → `0.7044…`, ink
  hue `137` → `calc(137 − 4)` — the row's "brand hue drifted −4°" is exact);
  outline ink `oklch(0 0 0)` UNCHANGED across a same-tick `.dark` flip on a
  clone; `--jx-tonal`/`--jx-fill` differ root vs `.dark` scope while
  `--jx-foreground` is identical (the frozen stylex token). The row's split
  wording is measured-true, not vocabulary.
- Density ladder: 2xs → label 10px / box 14.5px / `data-density="2xs"`;
  lg → 14px / 23px / `"lg"`. Default chip: box 20px, label 12px, line 18px
  (TokenTable default anchors hold).
- Size honesty: `size={14}` → inline `--jx-size-effective: 14px;
  font-size: var(--jx-size-effective, 1rem)` stamped verbatim as the row
  describes; label 14px; box stays 20px (the axes caption's "fixed 20px
  box" measured).
- query(): base `lg` at 600px → `sm` at 900px → `lg` again at 600px (both
  directions, real viewport moves); BOTH generic args per the typing law;
  the axes drawer payload carries the exact `query<{ sm: DensityLane },
  DensityLane>({ sm: 'small' }, 'large')` form (grep-receipt on the SSR
  payload; my probe's two FAILs were both probe artifacts — entity-escaped
  payload text, and 0.14em resolving against the element's own 12px
  font-size = 1.68px, my own documented lesson).
- Supply-only claims: my own grep — zero readers of `--jx-radius-effective`
  / `--jx-color-effective` / `--jx-elevation-effective` /
  `--jx-motion-effective` under `apps/www/src/lib/ui/badge/`; computed
  `box-shadow: none`, `transition-duration: 0s`. The consumed side matches
  badge.stylex.ts/badge.css exactly (gap, inset, text/line-secondary,
  --jx-radius, --jx-hairline, --track-14, the four hue slots, --jx-foreground).
- Square corner-law: computed `border-radius: 8px` (the `@supports
  corner-shape` upgrade; the row says "0px; 8px where corner-shape is
  supported; 8px measured here" — honest two-layer wording, matches the
  census-era wording alert uses).
- Census citation: explicit-props/research/migration-census.md batch B
  LANDED rows (lines 56-61) say exactly what the shape row + usage prose
  claim — seven lanes, family-local shape owns the name, pill outside
  ShapeLane, left out not renamed, W6 dossier flag.
- Archetype §2 order present (H1 → Overview → Usage with DocsInstall →
  Props → axes → Accessibility → See also); toc (+page.ts) has all six ids,
  all reachable in SSR; `data-jx-props-table-universal` ×1;
  `data-doc-install` ×1; `data-doc-see-also` ×1; badge absent from
  docs-skeleton-scope.json (the re-pin landed).
- Zero new class identities: the page uses rt.* stylex + the pre-existing
  `.pill` site class (docs-tables.css:54); the cx joiner is the family's
  own payload idiom.
- 吃也供 gloss rule: the protocol is never named in page prose (0 hits);
  en-US spelling clean.

## Tier judgment

Tier 2 — correct, no veto. The W3-era bones carried real information
(variant grammar, hue injection, same-source canvas) and the restructure
kept all of it; the generated-meta Props migration also discharges
marginalia's review-2 commitment.

## Gates (my run, at b4d8b9df)

- `npm run verify:docs-universal` → exit 0, `GREEN: 110/110`.
- Scoped specs (docs-structure, canvas-same-source, docs-ambient-vocabulary,
  docs-nav-filter) → 364/364 (matches marginalia's post-coding baseline —
  the alert integration landed without docs-side drift).
- Dev smoke :5242 → HTTP 200, bytes 942520; one transient vite
  `virtual:jixoai-icons.css?inline` SSR-transform error in the dev log
  (first-compile race; page serves 200 and renders complete — pre-existing
  infra noise, not a page defect).

## Highlights (what badge does better than my alert — filed to experience.md)

1. **Curation files that document the extractor's ceilings as law**
   (badge.docs.ts header pins WHY variant/shape degrade to opaque aliases
   and WHY style/rest stay visible) — my alert.docs work should carry the
   same ceiling-pinning headers.
2. **Two-layer honest wording for @supports-dependent values** ("0px; 8px
   where corner-shape is supported; 8px measured here") — the radius rows
   on alert say only the measured number; adopt the base/upgrade pairing.
3. **The supply-side grep receipts written INTO the workflow before the
   claim** (report + rows carry the zero-readers grep as provenance, and my
   independent re-grep confirms) — alert's supply rows should cite their
   receipts the same way.
4. **Same-source deletion of hand mirrors** (resolveRawCode composes both
   drawers; the hand-authored mirror files are gone) — beyond my alert,
   which still carries one hand-mirrored usage snippet path.
5. **The declaring-element law per lane** (why a named rung repaints —
   `data-density` makes the chip the declarer; why a bare coefficient can't
   — channels declare at :root/[data-density] scopes) — I queued this from
   accordion and still owe alert's density row the upgrade.
6. **The measured-ladder self-correction discipline** (marginalia's
   18px-box caption lie self-caught by probe, then the contract "(measured)"
   enforced) — the exact loop my experience.md preaches, executed.

## Upgrade commitments

- Alert: convert its `shape`-adjacent collision audit + curation headers to
  the ceiling-pinning form; add the two-layer @supports wording to the
  radius row; cite grep receipts in the supply rows inline.
- Alert density row: land the declaring-element mechanics upgrade owed since
  the accordion review.
- My probe toolkit: add the payload-escape-aware same-source check (grep the
  RAW SSR HTML, not page.content()) so the next review doesn't spend a FAIL
  on serialization.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5242`, wrapper PID **33144**,
  log /tmp/vellum-5-badge-dev.log. Killed post-probe; `lsof -i :5242
  -sTCP:LISTEN` → 0 lines (receipt in the task's closing message).
- Probe/scratch: /tmp only (vellum-5-badge-probe.mjs,
  vellum-5-badge-ssr.html, vellum-5-verify-universal.log,
  vellum-5-vitest.log). Repo-side writes: this report + experience.md only.
