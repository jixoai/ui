# Task 12 — heading (CODE) + two ledger fixes · quill · 2026-09-22

**Verdict: LANDED (working tree; no commits per brief).** Tier 2 rewrite of the
heading docs page to the MDN archetype, curation file created, both bundled
one-field ledger fixes applied.

## Diff

| File | Change |
|---|---|
| `apps/www/src/routes/docs/components/heading.html/+page.svelte` | tier-2 rewrite: + Overview, + generated meta+curation Props, + the eight axes (per-axis table + demos + query case + fixed-paint TokenTable), ToC order fixed; ladder/standalone/a11y kept |
| `apps/www/src/routes/docs/components/heading.html/+page.ts` | ToC: +overview, +axes; universal-props folded into axes; survivors kept |
| `apps/www/src/lib/ui/props-table/docs/heading.docs.ts` | NEW curation: 6 overrides (level §13-keep, id, style #4-seam, children, class, rest) — no EXTRA lane |
| `apps/www/src/lib/ui/props-table/docs/component-canvas.docs.ts` | ledger fix: theme extra row + `ambient: 'own'` (marginalia NIT) |
| `agents/quill/experience.md` + `agents/quill/reports/10-dropdown-menu.md` | ledger fix: dock count 14→21 with marginalia attribution |

Sibling in-flight files observed untouched: `button-group.html/*` (another
agent), `vellum/experience.md`, `vellum/reports/11-review-dropdown-menu.md`.

## The measurement story (this task's spine)

- **Grep receipts (zero hits)**: `rg -- '-effective'` and the kernel-channel
  grep (`jx-text|jx-line|jx-inset|jx-gap|jx-stack`) over `src/lib/ui/heading/`
  — the family css reads NO carrier and NO channel. The only raw token is
  `--foreground` (the ink seam, heading.stylex.ts:32).
- **The size stamp is the consumer** — the task's one surprise. The brief
  warned about `--jx-text` vs `--jx-text-base`; the real finding: neither is
  read, AND `stampCarriers` emits `font-size: var(--jx-size-effective, 1rem)`
  INLINE next to the var (defaults.svelte.ts §11 block). The stamp lands on
  the h root itself (heading.svelte `style={rootStyle}`) → inline beats the
  class em rung → **an explicit size lane REPLACES the em ladder** (the
  `sizeLadder` rename's other half: local yields to universal). auto stamps
  nothing → the rung rules. No family css reads the var; the stamp IS the
  consumption.
- **Probe (single-evaluate, PASS)**: ambient h3 = 20px = 1.25 × 16px ambient
  preset (em rung × inherited); `size={14}` h3 = exactly 14px; `size="large"`
  = exactly 18px (--jx-size-large, universal-props.css:38). Positive control:
  stamped ≠ ambient. Line-heights confirm the leading seam everywhere
  (25/17.5/22.5px = 1.25×font).
- **Theme = the PARTIAL pole (4th measurement, 3rd distinct shape)**: dark
  island flips ink oklch(0 0 0) → oklch(1 0 0) while fontSize/weight/leading
  are byte-identical. One raw voice (--foreground via the seam fallback)
  flips; the ladder is theme-free. Sits between checkbox full-flip and
  cascader ring-only — the seam + the `data-jx-ty-ink='gradient'` presence
  gate (prose.css:97) is what makes it partial.

## EXTRA arithmetic

Meta = 14 props; 8 ambient axes → generated Universal section; main table =
**6 rows** (level, id, style, children, class, rest), all curated, no EXTRA
lane (level is the §13 keep, no axis-name collision). SSR parse of the raw
bytes confirms: 6 main rows + 8 generated axis rows + 8 per-axis table rows +
6 TokenTable rows (Source column dropped — the cascader-fold pattern: no
`source` field, facts in Default cells).

## FALSE-implying panels fixed

The W3-era universal demo had `color="primary"` ("primary ink") and
`radius="medium"` panels implying movement the receipts say doesn't exist.
Dropped; replaced by the measured four-panel axes canvas (ambient / 14px /
large / dark) with a disagreement-probe caption.

## Gates

| Gate | Result |
|---|---|
| svelte-check (page-scoped) | heading.html exactly 1 error — the standing cx idiom, moved 79:28→122:28 (count-neutral); heading.docs.ts clean |
| dev-smoke :5241 | 200, ready 1s; killed PID 16280; `lsof :5241` empty before AND after |
| SSR raw bytes | `--jx-size-effective: 14px; font-size: var(--jx-size-effective, 1rem)` verbatim in the h3 style attr; dark h3 = `class="… dark"`; 11 data-jx-heading stamps; FALSE panels gone |
| Probe | PASS (numbers above) |
| build | exit 0 |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| affected specs solo (docs-structure + docs-ambient-vocabulary + props-table-meta-drift + canvas-same-source) | **402/402** — equal to the pre-edit solo baseline |

No commits made.

## Process notes

- Grep-test-first held: zero `test/` pins on the heading page or family —
  no fixture updates owed.
- The query() case teaches the typing law in both directions: the page's
  number lane goes bare (`query({ md: 18 }, 14)` — infers), and the caption
  names the string-lane both-generics rule for the reader.
- One-h1 law preserved: hero owns the page's single h1; every demo stage
  carries `data-doc-demo-scope="headings-ok"`; ladder spans 2–6.
