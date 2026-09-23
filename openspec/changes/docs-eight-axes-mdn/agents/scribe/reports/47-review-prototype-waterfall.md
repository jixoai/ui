# Task 47 — FIRST REVIEW prototype-waterfall (1st of 2) · scribe · 2026-09-23

**Verdict: PASS** — 0 MAJOR · **1 MINOR** (a falsified nuance, copy-only,
rides closure) · 0 LOW · 1 NIT. The trio's closing 1st: the rig, the
floor form, the loop, LAW #18, the no-JS claim, and the doctrine caveat
all verify — but the page's **size-stamp REM nuance is falsified by
measurement**: rem-based column floors read the DOCUMENT root font
(16px), not the §11 stamp's element font-size, so the stamp does NOT
re-scale them. Independence law kept: findings formed from my own
source reads + probes BEFORE opening vellum's report 37.

**Reviewed**: `apps/www/src/routes/docs/components/prototype-waterfall.html/`
(+page.svelte 481 lines, +page.ts 8-entry toc; clean vs HEAD through
e56511ea) + `apps/www/src/lib/ui/prototype-waterfall/` (svelte 147 —
one div, style directives only, no css/no tokens/no JS).

## The headline claims — verified by my own probing

### 1. The see-also LOOP — VERIFIED-TRUE

The waterfall law-notes carry the cross-reference pills linking
prototype-flex + prototype-grid (self as a non-link span); the flex and
grid pages' sources carry the mirror pills (each links the other two,
renders itself as the span) — the loop resolves: all six ordered pairs
of distinct trio members are linked, page-side.

### 2. The 14rem FLOOR, end-to-end — VERIFIED-TRUE digit-exact

- Count form @1400: computed column-count **3** (→ **4** on the 4
  selection), column-width auto, gap 16px, column-fill balance, laid-out
  count from distinct card offsetLefts = **3**.
- Floor form `"14rem"` @1400: style attr `columns: 14rem`, computed
  **column-width 224px** (= 14 × 16px document root), count auto,
  **laid-out 3**.
- Narrowed to 760: **laid-out 2** — width floored, count follows. The
  masonry floor semantics measured end-to-end, exactly as taught.

### 3. The SIZE-STAMP REM NUANCE — FALSIFIED (the MINOR)

The page teaches (4 seats: the size axis row, the overview paragraph,
the axes summary, the query-seat caption) that "the size stamp
re-scales REM-based column floors ('14rem' re-reads the root font),
while count-form columns are scale-blind". Measured twice, both
halves:

- The query-seat instance (`columns="14rem"` + `size={query({md: 18},
  13)}` at 1400px, so the md case holds): element font-size **18px**
  (the stamp verbatim in the style attr), computed floorWidth **224px** —
  if the stamp re-scaled the floor, 14 × 18 = **252px**. It didn't move.
- Cross-check from the other side: document root font 16px → **20px**
  moved the same instance's floor **224 → 280px** while the element
  stamp stayed 18px.

Mechanism: `rem` reads the HTML document root; the §11 stamp is an
inline ELEMENT font-size. The stamp re-scales `em`-relative copy (the
voice), never a rem-based floor. The measured truth: **both forms are
§11-stamp-scale-blind; the '14rem' floor re-scales only with a
document-root font change**. Seats to correct: the size axis row, the
overview third paragraph, the axes section summary, the query-seat
caption, and the receipts paragraph's implied reading. Copy-only,
one consistent sentence.

### 4. LAW #18 — VERIFIED-TRUE

Every each on the page is keyed (`card.id` — stable, uniqueness-
guaranteed); the mounted-children census: **8 waterfall roots, children
[9, 9, 9, 5, 3, 2, 2, 2] — all mounted** (rig, types ×2, query seat,
universal ×4). No duplicate-key abort, no missing row.

### 5. No JS in the family — VERIFIED-TRUE (with a phrasing nit)

The family is 147 lines, one div, style directives only; grep: zero
transitions, zero ResizeObserver/setTimeout/rAF. Live settle: a rig
control change lands the new computed column-count **by the first
animation frame** (the same-task read is still stale — Svelte's flush
boundary — so "settles within the same frame" is off by one frame
boundary; "by the next frame, with nothing to wait for" is the precise
form). NIT.

### 6. The multicol doctrine caveat — VERIFIED-TRUE served

Column-order tradeoff, the consumer's break-inside, the reading-order
a11y rows, and the short-card-decks guidance all served.

## Standard battery

- **SSR/post-settle + warm-reload**: first visit warms, reload measures.
- **EXTRA-lane by name**: api hand rows served = **[columns, gap,
  strategy, class, …rest]** (5) + the universal 8. No served-count
  claims to falsify.
- **THEME-SPLIT vocabulary**: the theme row is a FORWARDER (bridge
  only); the universal dark panel carries the `dark` class, ambient
  panels carry nothing — trivially nothing-declares (no css exists).
- **Vocabulary-grep**: zero transition/observer/timer declarations;
  zero carrier readers (the family reads no var beyond its own — none
  declared).
- **LAW #19**: post-hydration **64 ids, ZERO duplicates**.
- **Stamps**: density sm/lg rungs land; the echo verbatim; ambient
  null.

## Findings

1. **[MINOR · rides closure]** The REM-nuance falsification — full
   receipts in claim 3. Copy-only; 4-5 seats carry the same sentence;
   the corrected mechanism: "rem-based column floors read the DOCUMENT
   root font and re-scale only with it — both forms are §11-stamp-
   scale-blind; the stamp moves the root voice, not the floor."
2. **[NIT]** "settles within the same frame" → "by the first animation
   frame" (the same-task read is stale; Svelte flushes at the
   microtask/frame boundary). Phrasing precision only.
3. **[INFO · vellum's four open questions, adjudicated]** (1) the
   'ordered' strategy must land with its own a11y section update (JS
   placement reorders against DOM): **concur, flag recorded**. (2)
   break-inside opt-in vs a family-side avoid default: **Owner's call;
   the opt-in is defensible** — a hard avoid default risks content
   clipping when a card exceeds the column height, a worse failure
   mode. (3) The page-side loop retires if the registry graph grows
   family grouping: **concur**. (4) The short-decks-only multicol
   caveat: **concur, taught**.

## Cross-check against vellum's report 37 (read AFTER findings formed)

Full concordance on the rig (count 3/4, floor 224px, laid-out 3→2 at
760), the stamps census, mounted children 9/9/9/5/3/2/2/2, the loop
pills, the no-JS grep, toc == DOM, and the duplicate-id scan. The ONE
divergence is the REM nuance: her point 4 asserts the rescale but her
receipt list never measured it (she measured the echo and the 224px
floor separately — the rescale itself, 224 → 252 under the stamp, is
the unrun experiment, and it fails: the floor stays 224). My document-
root cross-check supplies the mechanism: rem reads HTML's font-size.
Everything else in her report reproduces.

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284**, exit 0 — GREEN clean |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | prototype-waterfall.html page: **0 diagnostics**; family diagnostics are the fleet's baseline classes (provideUniversalLanes warns + 1 cx overload) |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper; EMPTY after |
| Tree | vellum's separator.html files and quill's system-dialog flip files untouched (the dispatch's named siblings; neither keyed anything I ran) |

## Closure

prototype-waterfall passes review #1 — disposition: the MINOR rides
closure as the one corrected mechanism sentence across its 4-5 seats
(copy-only; the measured truth is stated above), the NIT is phrasing
precision, and the four open-question adjudications are recorded. No
page changes required beyond the nuance correction. Reviewer #2
inherits the falsification receipt and the corrected sentence to check
against.

No commits made. Report file:
`agents/scribe/reports/47-review-prototype-waterfall.md`.
