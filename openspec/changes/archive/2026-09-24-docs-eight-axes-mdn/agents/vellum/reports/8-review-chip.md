# Report 8 — chip, REVIEW (1st, vellum)

agent: vellum · 2026-09-22 · page
`apps/www/src/routes/docs/components/chip.html/+page.svelte` (+page.ts) +
`apps/www/src/lib/ui/props-table/docs/chip.docs.ts` · coder quill
(integrated 1783878f; the EXTRA-lane law fix landed after, 6900340b) ·
law: mdn-doc-style §5 + §6 rulings + the EXTRA-lane law with teeth ·
reviewer #2: marginalia. Every claim below re-derived from source, raw SSR
bytes, or live probes on :5242.

## Verdict: PASS (with findings — 0 BLOCKER · 1 MINOR · 2 NIT)

The page's EXTRA-lane verification targets (the reason this review was
scoped) all hold: the 12-row family table renders the rescued `shape` row
with the "Rendered from extra" clause and the clause is TRUE; the §2
universal row, the family silhouette row, and the ABSENT axis row coexist
without contradiction, each in its own lane with distinguishing prose; the
reference-identity exemption is additive and the popover regression spot is
unchanged. One measured number is wrong (the density label ladder at lg),
plus two receipt-precision nits.

## The three scoped EXTRA-lane verifications

1. **12 rows incl. shape — CONFIRMED, and the clause is TRUE.** Raw-SSR
   table parse: the family table renders exactly 12 rows (variant, href,
   external, onclick, type, ariaLabel, class, slotStart, slotEnd, children*,
   **shape**, {@attach …}). The shape row's cells are the EXTRA lane's
   content identity: type `'square' | 'pill'`, default `'square'` with the
   own-default marker ("Own default, not am[biguous]"), and the description
   ending "Rendered from extra: the shared split filters this name from the
   generated rows" — rendered ×1. Provenance proof: the META's own shape row
   (kind opaque, typeText `ChipShape`, chip.meta.ts:48) does NOT render —
   `ChipShape` appears nowhere in the served tables — and no duplicate shape
   row exists. The row comes from extra, not from a meta merge. Mechanics
   verified in source: props-table.svelte `extraRows = new Set(docs?.extra)`
   + `!UNIVERSAL_AXIS_NAMES.has(row.name) || extraRows.has(row)` — reference
   identity holds because propsFromMeta spreads docs.extra as-is
   (from-meta.ts:116); the meta's shape row is a different object and is
   name-filtered like any axis row. Row arithmetic: 19 meta props − 8
   axis-named − rest(hidden) = 10 + 2 extra = 12 (was 11 pre-fix — the fix
   commit's "11→12" checks out exactly).
2. **The three shape texts coexist WITHOUT contradiction — CONFIRMED.** The
   universal section renders the §2 generic row (ShapeLane union, default
   `'auto'` · ambient scope — chip.meta.ts:113 puts shape IN the universal
   surface, so the generated row exists); the family table renders the
   silhouette prop row; the per-axis table renders "ABSENT — the
   family-local shape prop owns the name… left out (forwarding ambient)
   rather than renamed" (census-faithful: migration-census.md:56-60,
   verbatim on "seven lanes", "owns the prop name", "pill is outside
   ShapeLane", "left out (forwarding ambient)", "FLAGGED for the W6 Owner
   dossier"). The prose distinguishes family-local prop vs axis surface in
   three places (API summary `:729` "shape stays in the family table — it is
   the silhouette prop, not the axis"; the extra row's own "NOT the
   universal §2 shape axis"; the overview's "the shape axis is deliberately
   absent"). ChipDefaults carries seven slots and NO shapeAxisSlot
   (chip-defaults.svelte.ts:63-72) — "left out" is contract-true; ambient
   passes through unintercepted. No reader is told the axis is settable when
   it is not.
3. **Regression sweep — CLEAN.** The exemption is additive (a `Set.has`
   reference check only shortcuts the name filter for genuine extra
   objects); non-extra axis-named rows filter as before. Spot-check:
   popover.html SSR — family table renders 11 rows INCLUDING the
   `bind:this` extra row (`{ show, hide, toggle }`) unchanged, plus the
   8-row universal section. (checkbox's canvas-same-source snapshot failure
   during my gate run is scribe's in-flight task-8 page, not a
   props-table regression — the table machinery gates green.)

## Standard review

- **Tier 2 justified** — the old page (1783878f^) already carried the
  play-state lab, the usage head/tail assembly, anchors/slots/hue facts;
  the restructure added the archetype skeleton (install, per-axis table,
  query case, see-also, route toc) while the lab, usage assembly and canvas
  children stayed byte-identical (pinned by component-canvas-floor.spec.ts
  + variant-grammar.spec.ts per the page header). Repair-not-rewrite; the
  real information survived.
- **Archetype §2 order** — hero → install → overview → usage → live lab →
  family demos → API → axes → accessibility → see-also. One Usage H2; the
  generated Universal section rides the API table.
- **toc vs DOM** — 11 rows, each id ×1 in raw SSR, order matches DOM; the
  stale hit-lane entry is gone.
- **Consumed-vs-supply receipts re-derived**: family grep — ZERO reads of
  `--jx-color-effective` / `--jx-elevation*` / `--jx-motion-effective` /
  `--jx-radius-effective` in chip.{svelte,stylex.ts,css}; the color slot
  re-derivation lives ONLY at `[data-jx-press-button]`
  (press-button.css:90-93) and the chip root carries `data-jx-chip`, never
  that attribute (chip.svelte:232-268) — the row's keying claim is
  source-true. Consumption side measured (below).
- **THEME-SPLIT — the page's theme row is the slot-painted family shape and
  it is TRUE**: the four grammar slots declare at `:root, .jx-light, .dark`
  (jixoai.css — declaring-selector walk), so the plain `.dark` bridge DOES
  re-scope them. Live, same tick: fill ground `oklab(0.6489 0.192 0.139 /
  0.74)` → `oklab(0.7044 0.159 0.099 / 0.74)` (hue shift = the dark
  profile's calc(N - 4)), `--jx-fill`/`--jx-tonal`/`--jx-outline` resolved
  values all re-scope. The row claims exactly the four slots and nothing
  else — honest per the disclosure law.
- **query() §6** — `query({ md: 16 }, 14)` is the zero-explicit-args form
  (the ruling governs explicit-argument lists; both params infer here) and
  it type-checks: the chip page's ONLY svelte-check error is the fleet cx
  idiom (235:28). Measured: 16px at ≥48rem ↔ 14px base below, both
  directions, SSR carrier stamps resolve (`--jx-size-effective: 16px/14px`).
- **Declaring-element mechanics** — the density row's coefficient clause
  ("no rung attribute matches, nothing recomposes") measured: density 1.5
  chip — label 12px, height 20px, no data-density attr, coefficient inline.
- **Prose §1** — measurement-first header, tight paragraphs, the Owner
  scale ruling cited with date, the hit-floor a11y note present with the
  forced-colors degradation. No marketing tone found.

## Measured TRUE (live, :5242)

- **Size is glyph-lane**: size 14 → label 14px, box 20px; size large →
  label 18px (`var(--jx-size-large)`), box STILL 20px; the root's inline
  stamp outranks the base atom's channel-anchored label (both declarations
  on the same element — inline wins).
- **Density named rungs**: sm → label 11px, inset 8px, height ≈18px;
  default → 12px / 12px / 20px; lg (clone-flip) → inset 16px, height ≈23px.
- **Radius supply-only**: stamped `--jx-radius-effective: 10px` under a
  square chip → computed corner unchanged (8px, `var(--jx-radius)`).
- **Elevation supply-only**: `--jx-elevation-effective: 3` inline → the
  `.jx-press` rest shadow unchanged.
- **Color supply-only, drift-immune**: with `--jx-color-effective:
  oklch(0.9 0.4 200)` inlined on a clone, the tonal ground computes hue
  330.0 — IDENTICAL (Δ0.0°) to the no-carrier twin — the cyan carrier never
  reaches the paint; and the page's painting twin (jx-hue-error) reads the
  12% tint of the injected hue, proving the lane that paints is the class.

## Findings

1. **MINOR — the density label ladder claims 13px at lg; kernel + measured
   truth is 14px.** `+page.svelte:294` ("label 11 / 12 / 13px, height ≈18 /
   20 / 23px at sm / default / lg") and the TokenTable row `:709`
   ("11 / 12 / 13px at sm / default / lg"). Measured live under a real lg
   scope (inset 16px + height 23px prove the scope applied): label **14px**.
   Kernel corroboration: `--jx-density-secondary-text-lg =
   max(0.625rem, calc(var(--jx-density-text-lg) − unit/4))` = max(10,
   15−1) = 14px (jixoai.css:1350,1241); the badge page's fixed ladder
   (10/11/12/14, measured task 6) agrees — chip is the badge twin on the
   same channels. The inset and height thirds of the ladder are correct.
   Fix: "11 / 12 / 14px" in both spots.
2. **NIT — the axesUsage sample's density line oversells precision it
   drops elsewhere.** `+page.svelte:257`: "the sm rung: inset 8px, label
   11px, height 18px" — correct as written (all three measured), but the
   same snippet is the consumer-facing copy for a lane whose lg numbers the
   page gets wrong (finding 1); when fixing finding 1, re-verify this line
   still agrees (it does today).
3. **NIT — the color row's "Documented absence on the chip itself" sits on
   the radius row and the color row says "No chip css reads it" — both
   TRUE, but neither cites the negative grep the way elevation/motion rows
   do ("grep receipt: zero hits").** `+page.svelte:308,322`. The elevation/
   motion rows model the receipt form this campaign standardized (scribe's
   law); radius and color state the fact without the receipt. Fix: append
   "(grep receipt: zero reads tree-wide outside the press-button keying)"
   to both.

Zero BLOCKERs — justified: the collision-shaped risk (extra lane dead at
the component level) was this review's headline suspicion and it is
disproven at the rendered-bytes level, not the curation level.

## Gates (re-run this review)

| gate | result | tail |
|---|---|---|
| `verify:docs-universal` | exit 0 | `GREEN: 110/110 component pages render the shared universal section (110 markers)` |
| `verify:tailwindless` | exit 0 | `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim` |
| scoped svelte-check | 1 error | chip page: exactly `235:28` cx `Object.entries` — the fleet idiom debt; the query() call type-checks clean |
| canvas-same-source (observed in the accordion round, same tree) | chip N/A | chip is not a PILOT; the checkbox failure in that run is scribe's in-flight task 8, unrelated |

## Highlights (what this page does better than mine)

1. **The collision-casualty documentation as a first-class lane**: the extra
   shape row's prose states WHAT it is, WHY it rides extra, and WHAT the
   shared split would otherwise do — the curation file teaches the
   machinery. My badge rescue (task 6) states the fact; chip's states the
   law. Upgrade: badge's extra shape row gets the same "Rendered from
   extra" closure line.
2. **The supply-only-vs-painting-lane paired demo** (color error chip next
   to the jx-hue-error chip, captions naming the carrier-unread vs the
   injected slot) — the cleanest visual proof of "the axis doesn't paint,
   the class does" in the fleet. Adopt in alert's color row demo.
3. **The Owner-ruling citations inline** (the 2026-09-01 scale ruling with
   its supersession note, twice, in overview + twin + a11y) — provenance at
   the claim site. Adopt for alert's hit-floor note.

## Process

- Port :5242 empty BEFORE work (lsof exit 1). Dev server wrapper PID
  **8524** (log /tmp/vellum-8-chip-vite.log). Killed by PID; `lsof -ti
  :5242` → empty (exit 1); wrapper confirmed dead; no orphan.
- Raw SSR: /tmp/vellum-8-chip-ssr.html (1,191,766 bytes) + popover spot
  /tmp/vellum-8-popover-ssr.html. Probes: /tmp/vellum-8-chip-probe.mjs,
  -probe2.mjs, -color.mjs (drift-immune), -query.mjs, -diag.mjs,
  -shot.mjs. Gate logs: /tmp/vellum-8-chip-{univ,tw,scheck}.log.
- Probe lessons banked (experience.md): variant-paint readiness gating
  (base-atom font-size is necessary but NOT sufficient — the earlier
  transparent-ground reads raced the dev CSSOM), wall-clock hue/alpha
  drift immunity (Δ-hue same-tick assertion; the primary breathes alpha
  0.74↔1.0, which is what faked a carrier flow).
- Working tree carries sibling in-flight work (badge task-6 residue,
  checkbox task-8); untouched. NO commits, NO push.
