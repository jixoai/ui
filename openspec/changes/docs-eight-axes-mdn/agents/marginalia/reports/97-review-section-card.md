# T97 — FIRST REVIEW section-card.html (marginalia)

**Verdict: PASS** — **0 MAJOR / 1 MINOR / 2 LOW / 0 NIT**. Tier proposal: **Tier 2**
(the dogfood-inversion audit: this card frames every other page's demos, so the claims
were pushed to digit grade — the density formulas, the tone paints, the separator
geometry, the non-overlap law, the concentric chain — and the density-clone heading
question needed the whole-page outline census). Independence law kept: findings formed
from my own source reads (the 283-line page, section-card.svelte 384, css/stylex/
defaults) and two probe passes on port 5244 BEFORE any report reading; no other
section-card review exists — no concordance addendum. NO commits, NO pushes. Zero
family edits.

## Verified — the claim bank (digit receipts)

**The non-overlap law (the ToC wiring) — HOLDS on all seven page sections.** Every
section carrying `family` + `headerRegion` (card-law, types, usage, accessibility,
theming, universal-props, api) measures `data-family` on the section root +
`data-region` on the HEADER block only, root region null, **overlap false ×7** —
"non-overlapping leaves by construction" is exactly what the served DOM ships. Hero
and demo cards carry no wiring attributes (null ×3), as they should.

**The heading law — one h1, no skips.** h1 ×1 (the hero head, `h1[data-jx-section-title]`);
the playground live instance stays **h2 even after flipping tone→hero** (measured:
data-tone hero, tag H2, clamp size 36.72px) — the page's S4.1 note ("the live instance
stays h2 so this page keeps exactly one h1") honored live. The card renders the heading
itself; no hand-rolled headings anywhere on the page.

**Tone paints — digit-exact.** Default tone: title font-nav ("Share Tech Mono") 19.52px
text-balanced, summary muted `oklch(0.3211 0 0)` 13px, eyebrow brand hue
`oklch(0.55 0.12 171)` with tracking **2.64px = 11px × 0.24em** ✓. Hero tone: title
**36.72px** (the clamp — scales to **25.28px at 800w**, measured both widths),
summary **`oklab(0 0 0 / 0.78)`** — foreground at 78%, digit-exact — 14px. The
"clamp-scaled / text-balance / foreground 78%" claims all reproduce.

**Density adoption — the card-grid baseline re-true on a second page.** Default rung:
header padding-block **12px**, body **16px**, eyebrow **11px**, summary **13px/20px**
— the legacy-pixel formulas verbatim; padding-inline **16px** lives on the header/body
ZONES (root 0 — "zones pad themselves", the structural-separator economy). xs vs sm
**share the spacing rungs (8/8, 12/12) and differ on the TEXT step** (eyebrow 9px vs
10px, summary 11/16 vs 12/18) — "that difference now actually renders" receipted; lg
13/15/24. The theming section's "sizes from the page type ramp and theme tokens only"
is honest: no --jx-density-effective readers in the paint.

**The structural separator.** `Separator[data-jx-section-sep]` present per card,
**1px tall, edge-to-edge** (1px/1px from the root's edges — the grid-area 1/1 +
align-self end pin), 18 separators for 18 cards.

**Reveal interaction (the dogfood-inversion arm).** Cards sit inside `[data-reveal]`
wrappers (receipted) while the card itself measures **transform: none, transition 0s**
— the card carries no animation channel that could fight the reveal wrapper's
transform; its one hard shadow (`1px 1px 0 rgba(0,0,0,.5)`, the site signature) is
static. No reveal interplay exists to break.

**Universal props — the concentric chain digit-exact.** size 18 → root font **18px**;
density="small" stamps `data-density="sm"` on the root; the concentric demo: radius 20
on the section → `--jx-radius-effective: 20px`, and the auto Card inside computes
**border-radius 6px** = max(0px, 20px − 0.875rem) with the consumed var string verbatim
— the §3 broadcast landing exactly as the summary states.

**Structure/battery.** toc == DOM == rail **7/7 in order**; h1 ×1; duplicate ids 0;
zero dangling hashes; SSR strip-style byte-stable (18 separators shipped); no
`{#each}`/`{#key}` on the page. **The T94 resting-state audit**: the family's state
surface is `data-tone`/`data-density`/`class:dark` — no `:checked`/`:indeterminate`-
shaped pairs anywhere (the class does not recur). DensityDemo childrenScoped check:
the theming seat clones ×4 — **ids clean** (auto-generated), but see LOW 2 for the
heading half.

## Findings

1. **[MINOR] Page-scoped svelte-check is red — 1 ERROR on +page.svelte.** :121:28 —
   the cx overload (`Object.entries(style)` vs `{…} | undefined`), the FIFTH page
   clone (popover :245, radio :112, range :153, scaffold-float :61, section-card
   :121). The shared-util consolidation flag from T95/T96 stands; per-page predicates
   close each red. Family standing warns (section-card.svelte :326 provideUniversalLanes
   trio) untouched, pre-existing.
2. **[LOW] The types demo's hero card renders H2 under an "h1" caption.** The types
   section captions its second demo "tone hero · h1" and the card claims "The hero
   head." — but the served card carries `headingLevel` default 2 → an **H2 in hero
   paint** (measured). The playground help has the correct model ("hero tone pairs
   with headingLevel={1}" — independent axes), and the raw usage snippet in the same
   demo file omits the prop too. One `headingLevel={1}` on the demo card — or a
   caption reword to "tone hero (h2 here; pair with headingLevel={1} for a real
   route head)" — aligns the demo with its own label.
3. **[LOW] The heading-outline clone class: the density demo mints 4 identical H2s.**
   The theming DensityDemo clones the seat card ×4, so the page outline carries
   **"Acquire a Backend." ×5** (types demo + 4 clones) — 17 h2s total. The toc rail
   stays clean (data-driven, 7/7), and no level skips — but the a11y heading tree
   carries four demo artifacts. This is the T94 id-clone lesson generalized: the
   childrenScoped guard exists for id-bearing seats; **heading-bearing seats have the
   same shape problem** (a heading can't be scoped away). Receipt for the fleet's
   DensityDemo design: heading-bearing demo content wants the scoped form or a
   non-heading specimen.

**Receipt-only notes (not findings):** the api table (title*, eyebrow, summary,
children*, headingLevel, tone, family, region, headerRegion, class + 8 ambient axis
rows) omits the document-ontology props — `role` (default 'section'), `ordering`,
`numbering`, `floatScope`, and the addressable `id` — five component-own props from
the Props interface the api page hasn't absorbed yet (the ontology R2 layer is newer
than the table). Same class as T96's `pos`; flagged for a text pass, not scored here
— the page's summary ("four content slots plus the ToC wiring attributes") describes
exactly the ten it renders, so the table is internally honest.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo (apps/www, `test/`) | GREEN — 284/284, exit 0 |
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| verify:docs (dist @ 49a79df8) | RED — sole FAILED seat = **toast** (the recorded red); section-card in the legacy backlog only, expected |
| svelte-check page-scoped | **RED — 1 ERROR (:121:28 cx overload)** (Finding 1); family warns pre-existing, untouched |

## Process evidence

- Port **5244**: wrapper 9460 started for the session (/tmp/marginalia-97-wrapper.txt,
  -dev.log); after gates killed by PID; `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY
  after**. No orphan probe browsers.
- NO commits, NO pushes. Playground state restored in-probe (eyebrow refilled, tone
  flipped back); no DOM mutations outlived a probe.
- Probe faults owned: my first `data-jx-section ` SSR needle regex carried a trailing
  space and counted 0 (the attribute's neighbors differ) — the separator count (18)
  served as the SSR instance receipt instead; the root padding-inline read 0 and was
  nearly filed against the density formula before the zones-carried-padding design
  (header/body 16px) resolved it — the structural-separator comment was the map.
- Artifacts: /tmp/marginalia-97-probe1.mjs, -ambient.log, -docs.log, -sc.log,
  -wrapper.txt, -dev.log.
