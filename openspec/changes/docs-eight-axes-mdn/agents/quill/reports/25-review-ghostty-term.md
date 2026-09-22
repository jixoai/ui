# Task 25 — REVIEW ghostty-term (1st of 2) · quill · 2026-09-23

**Verdict: PASS.** Zero MAJOR, zero MINOR blocking defects. One MINOR
wording-precision finding on the page's central novelty (the theme row's
"every painted voice is a TYPED token" — true for the CSS surface, imprecise
for the canvas shell, whose freeze is boot-time-resolution, not alias
freezing; suggested wording below, author's discretion). Three open
questions adjudicated: KEEP / KEEP / KEEP. Independence law kept — findings
formed from my own source reads and probes before opening vellum's report;
zero factual divergence.

**Reviewed**: `apps/www/src/routes/docs/components/ghostty-term.html/`
(+page.svelte 1135 lines, +page.ts). Vellum at 197bf895; reviewer #2 after
me. Medium named per LAW #16: SSR HTML + headless-Chromium computed styles
+ a canvas pixel sample (getImageData on the family's own canvas) + an
injected `.dark` scope with before/inside reads; all probe claims carry
420ms-class waits where the wasm boot is involved.

## The five claims, re-derived

### 1. The live misfold fix — VERIFIED-TRUE (enumerated by name)

Served api contract table = **11 rows, in order**: cols, rows, auto,
fontSize, wasmUrl, **theme**, onData, onResize, **density**, class,
children — density and theme riding the docs.extra EXTRA lane (source:
the same object references passed in both `props` and
`docs={{ extra: [apiDensityRow, apiThemeRow] }}` — reference identity
exempts them from the fold). The universal FOLD still holds: the second
table renders the generic 8 axis rows (size, shape, radius, density,
color, theme, elevation, motion) and the marker (`data-jx-props-table-universal`)
counts exactly 1. Meta arithmetic verified independently: the generated
meta carries **27 props** (26 named + the synthesized `rest`).

### 2. Theme = THE SHADOWED SLOT — VERIFIED-TRUE (with one precision finding)

- **Slot semantics re-derived from source**: `absentSlot<T>()` =
  `defineAxisSlot('absent', (explicit) => explicit)` — the own is
  undefined and ABSENCE is the meaningful state; the component falls back
  knob-by-knob (`d.theme?.background ?? token('--terminal')`,
  ghostty-term.svelte :542). 'light'/'dark'/'system' have no seat; the
  generic THEME AXIS is shadowed by the shell-object escape hatch.
- **The measured split reproduces exactly**: rootBg oklch(0.9551 0 0) and
  rootColor oklch(0 0 0) HOLD inside my injected `.dark` scope (the css
  root atoms ride the TYPED --jx-terminal/--jx-terminal-foreground aliases,
  frozen at :root) while the scope's own raw read flips
  (`--terminal` 0.9551 → **0.2** at the same element). The canvas ground
  sampled BEFORE the scope landed: rgb(240,240,240) — the light pole.
- **MINOR (the precision finding)**: the theme row's "every painted voice
  is a TYPED token" is exact for the CSS surface but imprecise for the
  canvas shell — the wasm's shell colors resolve from
  `token('--terminal')`, a RAW read at the probe element, executed at
  boot/repaint time with no scope observer. The measured "keeps the :root
  pole inside a dark scope" is therefore a BOOT-TIME SNAPSHOT (no
  re-resolution trigger), not alias freezing: a component booted INSIDE a
  dark scope would probe the dark pole. Suggested wording: "the surface
  atom is a typed :root token; the canvas shell resolves the raw shell
  tokens at boot and never re-resolves — a scope flip moves neither."
  Author's discretion; the claim-as-served reproduces either way.

### 3. Density CONSUMED — VERIFIED-TRUE

data-density stamped on the family roots (sm / default / lg — and the own
'default' makes the attribute ALWAYS present on unstamped instances, the
always-concrete cell-math contract observed live). The kernel ladder at
the roots resolves exactly: --jx-text 12 / 13 / 15px (0.8125rem − 1px,
0.8125rem, + 2px) and --jx-line 18 / 20 / 24px (×1.5, ×20/13, ×1.6). The
consumption mechanism is a JS probe, not css paint: the component reads
`getComputedStyle(probeEl)` for --jx-text/--jx-line (probeTokenPx,
:508-520) and feeds the wasm cell math — CONSUMED in the strongest sense
(the geometry cannot render without the lanes).

### 4. Size §11 echo + the falsified-face proof — VERIFIED-TRUE

All three served instances: `--jx-size-effective: 18px; font-size:
var(--jx-size-effective, 1rem)` (the query instance at 1280px, md won) /
13px (the size={13} lane) / `var(--jx-size-large)` → 18px (size="large")
— computed root font-sizes 18 / 13 / 18. The ERROR FACE (the invalid-wasm
degradation demos, role="status", "$ghostty-term: ghostty-vt wasm could
not…") computes **13px at all three** — the fixed --jx-text-base voice,
the nothing-follows proof live on the page.

### 5. Supply-only — VERIFIED-TRUE

Zero --jx-shape/radius/color/elevation/motion-effective readers across
ui/ghostty-term/ + vt-deps.ts (my own SHAPE-AGNOSTIC grep); the family
root's computed box-shadow is **none** — the demo window's float shadow
is page chrome, as claimed.

## The three open questions — adjudication (reviewer #1)

**(a) The fold's generic theme row alongside the family's true theme row: KEEP.**
The universal section is the SHARED grammar reference — its rows are the
fleet's axis definitions, not this family's consumption claims; the
family truth lives one table up with an explicit cross-reference ("the
generic light/dark/system THEME AXIS is shadowed by this object — see the
axes table"). Hiding the theme row fleet-wide is a from-meta change with
fleet-wide blast radius to spare one family's shadow case, and the
code-card precedent already governs this exact shape. The reader risk is
mitigated in the row itself.

**(b) The "SHADOWED — the shell-theme OBJECT, not the axis enum" type cell: KEEP.**
The type column is where the page declares what the prop IS; for this
prop the honest answer is "not the axis enum" — reshaping it into a union
would re-launder the grammar the contract explicitly rejects
(absentSlot's whole point). The pattern break is the content. If the
fleet ever wants a house style for shadowed slots, that's a PropsTable
convention decision, not this page's defect.

**(c) The hand-picked kinship pair vs data-driven DocsSeeAlso: KEEP.**
They operate on different layers — DocsSeeAlso is the data-driven
navigation surface (the reading chain), the Overview's terminal-card /
code-card pair is the prose kinship ARGUMENT (terminal-idiom families).
No contradiction between them; the prose doesn't claim to be the related
components list. Not overreach.

## Cross-check against vellum's report (read AFTER findings formed)

Zero factual divergence. Her misfold pre-edit receipt (9 rows) I cannot
re-measure post-fix, but the post-edit served state matches her claim row
for row, the docs.extra mechanism is in the source, and her meta count
(27) is independently verified. Her tier-2 gap analysis matches what the
skeleton still shows structurally. Her disclosed mid-task clobber incident
left no residue in the final state I measured.

## Gates (my run)

| Gate | Result |
|---|---|
| ghostty four spec files solo (ghostty-term, ghostty-vt, cursor-probe, mouse-probe, --testTimeout=30000) | **101/101**, exit 0 |
| docs-ambient-vocabulary solo | 2 failures, **both kbd-keyed** (`kbd table[0] density#1` + the bijection cascade) — vellum's in-flight kbd files, the brief's pre-declared sibling noise; zero ghostty-term failing keys |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | ghostty-term.html page: **0 diagnostics** |
| Port 5241 | lsof EMPTY before; dev server + wrapper killed by PID; EMPTY after |

No commits made. Report file: `agents/quill/reports/25-review-ghostty-term.md`.
