# Task 23 — REVIEW badge-indicator (1st of 2) · quill · 2026-09-23

**Verdict: PASS.** Zero MAJOR, zero MINOR defects on the page. One
CLAIM-PHRASING correction filed against the review brief (not the page):
no rest row is served — the page's own no-rest note and marginalia's
report both say so, and my served-DOM receipt confirms it. Independence
law kept: findings formed from my own source reads + probes BEFORE
opening marginalia's report; cross-check found no divergence between her
claims and my measurements.

**Reviewed**: `apps/www/src/routes/docs/components/badge-indicator.html/`
(+page.svelte ~403 lines, +page.ts) + the badge-indicator blocks in
`apps/www/test/canvas-same-source.spec.ts` (:62 route list, :1777 demo
snapshot, :1798 axes snapshot). Marginalia at a1d77c2c; reviewer #2 =
scribe after me.

## The five claims, re-derived

### 1. Posture-split size echo — VERIFIED-TRUE (probe receipts)

- **Standalone mirror wins**: the `size-echo` chip's inline style reads
  verbatim `--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)`
  and computes **font-size: 18px** — the inline mirror beats the class
  atom (--jx-text-micro), the micro text follows size. The merge law's
  inline-over-atom precedence, live.
- **Riding a child, the wrap takes the stamp**: `wrap-default`/`wrap-lg`
  both measure wrap data-density + carriers on the wrap element only;
  the chip inside holds **10px font / 18px box** in both.
- **The chip's own text holds 10px**: stamped-chip (density="lg" ON the
  chip): `data-density="lg"` present, height 18px, font-size **10px** —
  the rung moves nothing (the unit equations off the never-re-based
  --jx-unit; exactly ONE `--jx-unit:` declaration in jixoai.css, :root
  0.25rem — the whole ruler arithmetic 2.5U=10 / 4.5U=18 / 1.5U=6 hangs
  off it).
- Coverage note (NIT, non-blocking): the RIDING-half of the size claim
  has no served demo instance (the axes rig demos density wraps, not a
  size wrap) — the claim is source-verified (carriers land on the wrap
  only) + analog-probed by me via the density wraps (chip 10px under
  both). A sixth panel (`size={18}` over a child) would make the page's
  freshest claim self-serving.

### 2. The --destructive black/white raw-vs-typed — VERIFIED-TRUE (the cleanest pair, confirmed)

My own injected-island probe (a plain `.dark` div, two var reads):

```
raw  --destructive:   outside oklch(0 0 0)  → inside .dark oklch(1 0 0)   (FLIPS)
typed --jx-destructive: outside oklch(0 0 0)  → inside .dark oklch(0 0 0)   (FROZEN)
```

The chip's paint is the TYPED alias (stylex :root emission — the chip
keeps black ground / white ink under any scoped dark), the theme sheet's
RAW token re-declares per scope (jixoai.css :73 light black → :290 dark
white — line cites verified). Medium named per the THEME-SPLIT law: css
custom-property substitution at the DECLARING scope — the alias
substitutes once at :root and freezes; the raw re-declares inside .dark
and follows the tree. Destructive being black-by-design in light is what
makes the flip visible at both ends.

### 3. Composition measured — VERIFIED-TRUE (with the breakpoint receipt)

PressButton under the wrap: **40px** (density="default") → **48px**
(density="lg"), chip 18px beside both. BREAKPOINT DISCIPLINE: the demos
are EXPLICIT rungs (no query lane — the density row documents "no
query() seat" per the code-card judged-sound precedent), so I receipted
the viewport-independence directly: **48px at 900px AND 1280px
viewports** — the composition is scope-driven, not media-driven.

### 4. EXTRA arithmetic — arithmetic TRUE; "rest row served" FALSE (claim correction)

- Meta (`src/lib/meta/badge-indicator.meta.ts`, generated): **15 props**
  counted — 6 family (dot, count, overflow, showZero, children, label) +
  8 axis-named + class.
- Served api section: **exactly the 6 family rows** + the 8-row universal
  section = 14 rows, zero rest rows (probe-enumerated).
- The brief's "rest row served (EXTRA-lane law, reference-identity
  exemption)" is **not reproducible as served**: the interface closes at
  class — there is no rest spread, the page's axes note says so
  explicitly (the no-rest-spread check), and marginalia's own report says
  the same ("no synthesized rest row"). The "-1" in 15−8−1 is class
  (the rest identity, undocumented by fleet convention), NOT a served
  rest row. The page is right; the brief's phrasing mangled it.

### 5. Zero imports from badge/chip — VERIFIED-TRUE

SHAPE-AGNOSTIC grep over the whole family dir (source, defaults, stylex,
index): **zero** imports from badge/ or chip/ (zero `Badge[^I]`/`Chip`
identifier uses). Kinship is vocabulary-level (the micro scale) — badge
= the static chip, chip = the badge's activation twin, badge-indicator =
antd's live half. The Overview's paragraph 2 states it with the grep
receipt.

## The plus-list

- **Honest zero**: `visible` gate in source (`dot || (count !== undefined
  && (count > 0 || showZero))`) — count=0 renders NOTHING; showZero "0"
  measured in the types panels ("99+", "5", "0").
- **role="img" + aria-label on the dot only**: probe — dot chip
  role="img" aria "2 unread" (empty text); count chip role ABSENT,
  aria-label = the visible text ("5").
- **No aria-live**: source clean (no live region anywhere); the a11y
  table carries the ruling (state, not events — the HOST owns the live
  region).
- **Standard chrome, the positive exemplar**: h1 ×1; universal marker ×1;
  ToC 8/8 and order == DOM (probe-enumerated both lists);
  `id="install"` + `id="see-also"` SHIPPED (install folds out of the
  toc, see-also ships without a toc entry — both anchors live; see-also
  holds 4 component links).
- **canvas-same-source blocks**: the two inline snapshots match the
  page's stage markup verbatim (read side-by-side); the gate's 92 tests
  confirm mechanically.

## Cross-check against marginalia (read AFTER findings formed)

No divergence. Her five receipt groups reproduce under my independent
probes; her line cites check out (jixoai.css :73/:290, the single
--jx-unit declaration); her "For reviewer #2" heads-up (probe the size
split first) matched the sharpest claim. Her report correctly states the
no-rest-spread case — the BRIEF's "rest row served" phrasing is the only
text in this chain that says otherwise.

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| canvas-same-source solo | **92/92**, exit 0 |
| docs-ambient-vocabulary solo | **284/284**, zero failures |
| verify:docs-universal | GREEN 110/110 (110 markers) |
| svelte-check | badge-indicator.html page: **0 diagnostics** |
| Port 5241 | lsof EMPTY before; dev server + wrapper killed by PID; EMPTY after |

**Closure**: badge-indicator passes review #1. With scribe's review #2
pending, my disposition: no page changes required; the NIT (a served
child+size demo panel) is optional polish for the author's discretion;
the brief-claim correction (no rest row served) should be recorded by the
orchestrator so the campaign ledger doesn't inherit the mangled phrasing.

No commits made. Report file: `agents/quill/reports/23-review-badge-indicator.md`.
