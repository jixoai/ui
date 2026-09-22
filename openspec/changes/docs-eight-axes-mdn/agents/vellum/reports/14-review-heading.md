# TASK 14 — REVIEW heading (vellum, 2026-09-22)

**Verdict: PASS** — the central claim (size consumes VIA THE INLINE
STAMP) is verified at source, SSR-byte and computed-style level, every
number in the dispatch reproduced exactly. Findings: 1 MINOR (the
fleet cx-idiom debt signature — same class as empty's), 1 NIT, 0
blockers.

## The central claim — mechanism-grade verification

**"The size lane emits `font-size: var(--jx-size-effective, 1rem)`
inline next to the var on the h root; inline beats the class em rung;
an explicit size REPLACES the em ladder; auto restores the ladder."**

1. SOURCE (defaults.svelte.ts:567→575, reached via stampCarriersForLanes
   at :800 — the function heading actually calls): the size branch
   pushes BOTH declarations —
   `'--jx-size-effective: ${value}', 'font-size: var(--jx-size-effective, 1rem)'`.
   `auto`/undefined spreads nothing → no stamp. Receipt exact.
2. SSR BYTES: the stamped heading's style attr verbatim —
   `style="--jx-size-effective: 14px; font-size: var(--jx-size-effective, 1rem)"`.
   The auto h3 carries NO style attr (`inline: null`).
3. COMPUTED (signature-gated per LAW #15 — waited on fontWeight 700
   before reading):
   - auto h3 → **20px** = 1.25em × the 16px ambient preset; the ladder
     intact (h2 24 / h4 18 / h5=h6 16px).
   - size={14} h3 → **exactly 14px** — the rung REPLACED; leading seam
     **17.5px** = 1.25 × 14 (the dispatch's number, byte-exact).
   - size="large" → **exactly 18px** (--jx-size-large); leading 22.5px.
   - The inline stamp wins the cascade over the `.h3` class rung —
     replacement, not addition, proven by the identical-level pair in
     the axes canvas (auto 20px vs stamped 14px, same tag, same class
     sheet).

## The theme pole — PARTIAL via the ink seam, verified

- Source: the ONLY raw token in ui/heading/ is `var(--foreground)`
  (grep: 2 hits, both the seam fallback
  `var(--jx-ty-ink, var(--foreground))`; zero other raw reads).
- Probe: under the real `.dark` stamp — ink **oklch(0 0 0) → oklch(1 0 0)**
  (the raw fallback re-substitutes against the .dark slot block) while
  fontSize (20px), weight (700) and leading (25px) are BYTE-IDENTICAL
  to the light panel. Partial, not full-flip, exactly as the row says.
- The prose gate: prose.css:97
  `[data-jx-ty-ink='gradient'] :is([data-jx-text='p'], [data-jx-heading])`
  — inside a gradient face the seam pins to --jx-ty-ink and the island
  can't take the ink (source-verified; the page documents, no demo
  needed).

## Zero-reads receipts (the greps that overturned the brief) — re-run

- `rg 'effective' ui/heading/` → **ZERO** (no carrier consumed by css).
- Kernel channels `var(--jx-text|--jx-line|--jx-inset|--jx-stack|
  --jx-gap|--jx-unit)` → **ZERO** (the type voice is em-of-font-size,
  NOT --jx-text — the density axis has no lever, per the row).
- Weight/leading ride the TYPED tokens (--jx-weight-bold,
  --jx-leading-tight) — per the refined THEME-SPLIT law, frozen by
  emission form; measured byte-identical under dark ✓.

## Re-derivations (all TRUE)

- **EXTRA arithmetic 14 − 8 = 6**, counted from the served tables: the
  meta renders 14 rows total (13 interface keys + the synthesized rest
  row) − the 8 axis rows in the generated "Universal props" section =
  **6 family rows** (level, id, style, children, class, rest). The
  page's API summary states exactly this. No EXTRA lane (HEADING_DOCS
  header + served) ✓.
- **FALSE-implying panels removed**: "primary ink" ×0 and "radius
  medium" ×0 in the served SSR ✓ — the axes canvas teaches only what
  serves (auto / size=14 / size=large / dark).
- **One-h1 law**: page renders exactly ONE h1 (the hero); the ladder
  demo spans levels 2–6 (data-jx-heading hooks 2–6 in SSR, no 1); all
  four demo wrappers carry `data-doc-demo-scope="headings-ok"` ×4.
- **query() both typing directions taught**: the number lane goes bare
  (`query({ md: 18 }, 14)` — compiles, infers), the caption names the
  string-lane both-generics form; flip measured **14px @600 ↔ 18px
  @1440** across the 48rem key.
- **Tier-2 audit**: ladder canvas, standalone demo, a11y table kept;
  Overview, per-axis table, meta+curation props, install, see-also
  added. Archetype order correct. toc 7/7 ids present. Fixed-paint
  TokenTable folded (no Source column; the seam/em-ladder/promotion-
  seam facts live in Default cells; the --jx-size-effective row names
  the stamp emission).
- **Clamp law surfaced**: data-jx-heading carries the clamped truth
  (source: round→bound; a11y row documents it).
- **grep test/ pins**: the page-family pins are
  reading-content-family.spec.ts + prose-scope.spec.ts → **50/50 PASS**
  (family untouched; page prose unpinned).

## Findings

1. **MINOR** — `heading.html/+page.svelte:122:28`: the page-local `cx`
   `.filter(Boolean)` without a type predicate — the known fleet
   cx-idiom error (1 error, pre-existing at 54750f68; in the 1623
   baseline). Same one-line fix the task-12 pages carry. (Zero
   warnings on the page otherwise.)
2. **NIT** — the axes canvas authors `id="axes"` with a hand usage
   file while the page is outside PILOTS — legal today, but a future
   pilot join fails `called.length > 0`. One disclosure comment (or a
   resolveRawCode migration) would future-proof it, matching the
   empty/heading same-source follow-up already on the books.
3. **NOTE (receipt hygiene, no action)** — the page's density row says
   "the named rung stamps data-density"; densityRungOf only stamps for
   NAMED rungs (number/auto/query stamp nothing) — the row's wording
   is compatible but could name that edge when the density axis ever
   gets its own demo here.

## Gates (all run on the integrated tree)

- ambient solo **284/284** · pinned specs (reading-content-family +
  prose-scope) **50/50** · docs-structure in verify:docs ✓
- svelte-check (fleet 2486 files): **1623 errors / 1030 warnings**;
  heading page = exactly 1 error (finding 1), 0 warnings
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110 component pages render
  the shared universal section (110 markers)`
- verify:docs exit 0 — `✓ all docs pages pass the skeleton lint
  (staged scope green)`

## Process evidence

- Port 5242: lsof EMPTY before (rc=1); server wrapper 47685 → vite
  47724; BOTH killed; after: lsof rc=1 (EMPTY), no 5242 vite remains.
- NO commits, NO push, ZERO tree edits by me (review-only).
- Probe: /tmp/vellum-14-heading-probe.mjs (16/16 PASS, LAW #15 gate on
  the family signature); SSR snapshot /tmp/vellum-14-heading-ssr.html;
  logs /tmp/vellum-14-heading-*.log.
