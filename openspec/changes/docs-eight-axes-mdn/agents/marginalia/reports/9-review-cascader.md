# Report 9 — REVIEW `cascader` (marginalia, 2026-09-22)

Reviewer: marginalia (1st of 2; quill's page, tier-3 rewrite, integrated
at 6a325144). Evidence: source read (page + curation + meta + family
svelte/stylex/css), raw SSR bytes on :5244 (936,888 B, HTTP 200), four
live probes (single-evaluate law; disagreement probes on the fixed
paint), old-page audit at 6a325144~1, inbound-id grep, test/ pin grep.

## Verdict: PASS (1 MINOR + 2 NIT; every measured claim held)

This is the campaign's first tier-3 review and the rewrite earns it.
Every number on the page measured true, the axis story's central
honesty claim (seven supply-only + theme's one consumed voice) is
grep- and probe-proven, and the one MINOR is a dead prose column in the
TokenTable — component-wide debt, not a page lie.

## Tier-3 justification: CONFIRMED

Old-page audit (194-line W3-era page) against quill's justification:

- **tw4-era theming TokenTable with the retired `--jx-hit` lane**: the
  old `#theming` card listed `--jx-text 11/12/13/15px`,
  `--jx-hit 28/32/40/48px`, `--jx-inset 8/8/12/16px` as the family's
  density paint — the family reads NONE of those channels (my grep:
  zero `-effective` reads in the whole family; the atoms read
  `--jx-text-base`/`--text-label-lg`/`--space-6`/`--space-10`/
  `--jx-unit` fixed constants). The old table presented kernel channels
  the family never consumed as its own paint. The new page replaces it
  with the fixed-paint receipt table + per-axis honesty rows.
- **Hand-written props table, zero axis surface**: old `#api` was a
  hand `<PropsTable universal props={[...]}>` with 8 props. New page
  renders the GENERATED meta + CASCADER_DOCS (verified in SSR: 8 family
  rows with verbatim defaults — separator `'/'`, placeholder
  `'select…'`, class `''` — bindable marker on `value`, required marker
  on `options`), the eight axis props splitting to the shared section.
- **No install/see-also**: zero DocsInstall/DocsSeeAlso in the old page
  (grep). New page: both markers ×1 in SSR.
- **No per-axis table / no query()**: the old page's only "query" hit is
  prose in the W3-A universal card. New page: per-axis table + one real
  query() case (both generics).
- **Wrong order**: old toc ran demo → types → usage → accessibility →
  theming → api. New DOM order is monotonic archetype (hero → install →
  overview → usage → live demo → Props → axes → a11y → see-also;
  positions verified monotonic in the bytes).
- **Beyond justification — the old page carried a measured-false
  claim**: the old universal card asserted "The family CONSUMES size
  and color". The zero-consumers grep proves both supply-only. The
  rewrite did not just re-layout; it deleted a lie.

**Survivor check (the honest-path law) — all survived**: complete joins /
partial submits `''` / truncation ("picking at level N truncates
everything deeper, then appends") / disabled (chain + option-level +
form propagation) all render in the new Overview + curation rows;
playground wiring (bind:value, echo output footer, reset) intact;
a11y rows carried over VERBATIM (Tab / ↑↓ / Enter-Space; role=group;
aria-label level n; aria-labelledby); demo tree (asia/japan/korea,
eu/fr) intact; meta description carries the path-value law. Survivor
ids kept (usage/api/accessibility/cascader-demo) for legacy-doc-routes
hash preservation; the dropped ids (types/theming/universal-props) have
ZERO inbound links (grep across src + legacy-doc-routes.json).

## Findings

1. **MINOR — the fixed-paint TokenTable's prose column is dead; every
   Source cell renders EMPTY.** TokenTable renders Token | Default |
   Source and nothing else (token-table.svelte header: "Two columns");
   `description` is type-accepted but never rendered, and
   `sourceLabel('structural')` returns `''` — so all 7 fixedTokens rows
   render an empty third cell (SSR receipt: `<td class="…xa69gwt
   xowzrx4"></td>` on every row). The dead prose includes the fullest
   statement of the `--jx-text-base` vs `--jx-text` distinction ("NOT a
   free name for the split" — the ruler-constant receipt the page leans
   on) and the fixed-padding/gap receipts. No misinformation results —
   the rendered axis rows carry the same facts (the size row: "each
   select reads --jx-text-base (the ruler's fixed 13px body voice)";
   the density row: the fixed constants) — but the table visibly shows
   a blank column and 7 unreachable prose blocks. Component-wide fact
   (badge/checkbox descriptions are equally dead; their density/color
   source cells at least render labels — cascader chose all-structural,
   so its cells are ALL blank). Fix: page-side, fold any unique receipt
   into the axis rows and drop the dead descriptions (or give rows
   renderable sources); component-side, an Owner call — rendering
   descriptions would change every migrated page.
2. **NIT — the density row doesn't name the co-stamped coefficient pin**
   (the law banked from my checkbox probe): the axes caption names it
   ("data-density="sm" + --jx-density-coefficient: 1 on the root" —
   SSR-verified verbatim) but the row itself reads "stamp the rung on
   the root" without the co-stamp. The pin is load-bearing (my checkbox
   probe: the pinned coefficient is LIVE at the rung's declaring scope —
   3× on a real lg wrapper → box 24→72px). One clause closes it.
3. **NIT — the separator curation's default phrasing reads as a value**:
   "the complete leaf path only (default 'asia/japan')" — the default
   is `separator '/'`; 'asia/japan' is what that tree JOINS into. One
   word of reword ("joining 'asia/japan' on the demo tree").

## Verified TRUE (receipts)

- **The zero-consumers grep (my own run)**: zero `-effective` reads
  under `lib/ui/cascader/` — all seven supply-only rows honest. The
  atoms' reads are exactly the fixed constants (stylex verified line by
  line): `--space-6` (group/chain gap), `calc(var(--jx-unit) * 1.75)`
  block padding, `--space-10` inline, `--jx-text-base` select face,
  `--text-label-lg` label, `--track-10`, `--jx-hairline`,
  `--jx-border/--jx-background/--jx-foreground` (frozen aliases — the
  face), `--jx-radius` (the theme token, not the carrier).
- **THEME-SPLIT — partial re-theme, measured**: the family's ONE raw
  read is `:where(.jx-cascader-select:focus) { outline: 1px solid
  var(--ring); outline-offset: -1px }` (cascader.css — the unlayered
  carve-out). One-evaluate probe on the real page pair: focused ring
  `oklch(0.6489 0.237 190)` → `oklch(0.7044 0.1872 186)` — hue delta
  exactly **−4** (quill's 142→138 was their wall-clock instant; the
  delta is the invariant) — while the face (bg white, ink black, border
  black) is byte-unchanged across the island. "Ring flips, face
  doesn't" is measured-true, and it is the honest inverse pole of
  checkbox's full-flip.
- **Fixed-paint numbers (the disagreement probes)**: select height
  **35px on every panel** including the lg-rung query root (the a11y
  hit-surface invariance; clears the 24px WCAG 2.5.8 AA floor); select
  face **13px** and label **12px** everywhere; chain gap 6px; block
  padding 7px = calc(4px × 1.75). The size=24 panel: root carries
  `--jx-size-effective: 24px; font-size: var(--jx-size-effective, 1rem)`
  and computed root font-size 24px — while the select face stays 13px
  (its own `var(--jx-text-base)` declaration beats inheritance) —
  "moves the stamp, not the paint" re-probed and true.
- **query() §6 form + flip**: `query<{ lg: DensityLane }, DensityLane>(
  { lg: 'large' }, 'small')` — both generics, served in the drawer AND
  the caption (my first byte-grep missed the entity-encoded form — the
  two-generic text is in the raw bytes twice). DOM flip measured:
  1280px (80rem) → `lg`, 900px (56.25rem) → `sm`, back → `lg`, with
  selectH 35px throughout — "a DOM fact, not a pixel fact" is exactly
  right.
- **Stamps in SSR**: compact root `data-density="sm"` +
  `--jx-density-coefficient: 1`; dark root `class="… dark"`;
  size root's carrier + inline font-size; ambient roots stamp neither
  half (null attrs, null style); query root SSR-paints the base `sm`.
- **吃也供 gloss**: named once, glossed — "(吃也供, supply-and-consume)"
  in the axes summary. First-mention gloss law satisfied.
- **EXTRA-lane arithmetic (from the meta)**: family props are
  options/value/name/separator/disabled/label/placeholder/class — none
  shadows an axis name; the eight axis names in the meta are the
  intended lanes (§1: the family destructures them so the native
  selects never receive them — and the old select `size` attribute has
  no passthrough to collide with, the family renders no multi-select
  and spreads no rest). "No extra lane needed" verified.
- **A11y table source-true**: `aria-label={label ?? 'cascade'}`
  (cascader.svelte:192), per-select `aria-label="level {level + 1}"`
  (:201), aria-labelledby to the visible label; disabled dims opacity
  0.5 with no transition (motion row's "snaps instantly" — the stylex
  `:disabled { opacity: 0.5 }`, no transition property anywhere in the
  family css).
- **SSR ground truth**: universal marker ×1, install ×1, see-also ×1;
  toc 6/6 ids in DOM, monotonic archetype order, install before
  overview; the Props summary's "GENERATED meta" wording is TRUE here
  (unlike hand-table pages — the meta table renders with verbatim
  defaults and the markers).
- **test/ pins**: cascader pinned in defaults-form-families,
  docs-structure, docs-ambient-vocabulary, batch6 spec + a fixture host
  — the docs-side pins (structure/ambient-vocabulary) cover this page's
  lint surface.

## Tier judgment

**Tier 3 justified** — and the audit strengthened the case: beyond
quill's five structural counts (all confirmed), the old page's
"consumes size and color" sentence was measured-false, and only the
rewrite's grep-grade honesty could catch that. The rewrite is not a
re-layout; it is the page's first truthful axis story.

## Gates

Reviewer-side. Dev smoke HTTP 200, bytes 936,888. My SSR probe: 18/20 —
both "fails" were my own byte-grep artifacts (the entity-encoded
`&lt;` generic form IS served; the T_base distinction text lives in
the dead TokenTable descriptions, see finding 1) — plus four live
probes, all above.

## Processes (the recycle law)

- Dev server: `node scripts/dev.mjs --port 5244`; `lsof -i :5244
  -sTCP:LISTEN` → 0 lines BEFORE. Kill-by-PID: listener PID **48271**
  killed; post-kill lsof → 0 lines; pgrep → empty; wrapper exit 143
  (my SIGTERM).
- Probe/scratch: /tmp only (`marginalia-9-ssr-probe.mjs`,
  `marginalia-9-live-probe.mjs`, `marginalia-9-probe3.mjs`,
  `marginalia-9-cascader-ssr.html`, `marginalia-9-dev.log`).
  Repo-side writes: this report + experience.md. NO commits, NO push.
