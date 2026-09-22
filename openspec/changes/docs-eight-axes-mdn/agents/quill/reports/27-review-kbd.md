# Task 27 — REVIEW kbd (1st of 2) · quill · 2026-09-23

**Verdict: NEEDS-WORK (small, page-fixable) — one MINOR finding blocks the
closure: the FALSIFIED INHERITANCE CAPTION SURVIVES VERBATIM in the served
PlayHelp, with a second milder inheritance sentence in the shortcut-rows
summary — the exact claim the task's fix was supposed to eradicate, still
contradicting the axes table on the same page. Everything else — density
ladder, the typed-STREAM theme flip, the own 2px corner, the engrave tier,
supply-only cells, a11y, chrome, the EXTRA-limitation honesty — verified
TRUE under my independent probes. The fix is two-to-three copy strings;
re-gate is trivial.** Independence law kept — findings (including the
surviving caption) were fixed before opening vellum's report 30.

**Reviewed**: `apps/www/src/routes/docs/components/kbd.html/` (+page.svelte
421 lines, +page.ts) at 1d793c84. Medium per LAW #16: hydrated live page,
headless-Chromium computed styles, injected `.dark` scope with
before/inside reads.

## The claims, re-derived

### 1. The falsified inheritance caption — the correction HOLDS in three surfaces; the stale claim SURVIVES in two (MINOR, blocking)

- **The correction is served**: the axes size row carries the full
  falsification ("Measured FALSE: the kbd renders 12px inside a 13.5px
  prose context and inside a 13px table row alike"); the Overview teaches
  the own voice; the workbench description states "not inherited from the
  context".
- **Measured**: every served kbd computes **12px** — inside the 13.5px
  prose context, inside a 13px menu button, inside a 12.5px table row (my
  probe pairs context-vs-glyph font sizes; the atom pins
  --jx-text-secondary, so context never scales it).
- **THE SURVIVORS**: (i) the demo's PlayHelp renders, verbatim, *"the chip
  inherits font-size from context — it shrinks in table cells and grows in
  heroes"* (+page.svelte :300-301) — the exact falsified sentence, in the
  first drawer a reader opens; (ii) the shortcut-rows summary says
  *"Every instance below is the same component reading its size from the
  context"* (:315) — the same claim, milder words. Both contradict the
  axes table on the same page. **Fix: rewrite the two strings to the own-
  voice truth (or point them at the axes row); re-run svelte-check +
  ambient.** No structural change.
- Note for the consolidation: vellum's report states the playground help
  was "corrected in place" — as served, it was not. Not an accusation; the
  write-then-verify gap this campaign keeps catching.

### 2. Density consumed — VERIFIED-TRUE (digit-exact, three channels)

Under the DensityDemo scope boxes (xs / default / lg): fontSize
**10 / 12 / 14px**, line-height **13.5 / 18 / 21px**, paddingInline
**8 / 12 / 16px** — and `data-density` is **absent on the kbd itself** in
every box (the ambient attribute absent; the SCOPE BOX carries the rung —
the two-channel finding, measured). The channels are the SECONDARY kernel
lanes (--jx-text-secondary / --jx-line-secondary / --jx-gap).

### 3. Theme = the typed-STREAM case — VERIFIED-TRUE, digit-exact (and the taxonomy refined)

My injected `.dark` around a served tonal kbd, before → inside:

```
bg:     oklab(0.6489 0.2334 -0.0412 / 0.12) → oklab(0.7044 0.1816 -0.0453 / 0.12)
border: oklab(0.6489 … / 0.45)              → oklab(0.7044 … / 0.45)
color:  oklch(0.6489 0.237 350)             → oklch(0.7044 0.1872 346)
--jx-tonal at the element: 0.6489…350       → 0.7044 0.1872 calc(350 - 4)
```

The ladder re-derives from the scope's primary — hue-injected calc and
all. Source mechanism: `--jx-tonal` is RE-DECLARED under each theme scope
(jixoai.css :1499, `:root, .jx-light, .dark { --jx-tonal: var(--primary); … }`
— "the substitution re-runs against the scope's own --primary"), unlike
combobox's typed tokens declared once at :root by the stylex emission.

**Adjudication of open question 1 (the taxonomy split)**: YES — the law
needs the distinction; kbd's tonal voices are typed atoms whose flip would
be mis-predicted by emission-form alone. But the correct cut is not
literal-vs-stream VALUE SHAPE (both --jx-tonal and --jx-primary store
`var(--primary)` streams); it is **DECLARATION COVERAGE**: an alias
re-declared at every theme scope (`:root, .jx-light, .dark`) re-runs
substitution per scope and RE-DERIVES; an alias declared once at :root
(the stylex theme emission) freezes the ambient pole. Proposed law note:
**typed-REDECLARED (re-deriving — --jx-tonal/--jx-fill/--jx-outline, the
jixoai.css per-scope block) vs typed-ROOT-ONCE (frozen — the tokens.stylex
aliases)**, with combobox and kbd as the named contrast pair. The Board
should fold this into the five-mechanism law as vellum proposed, with the
coverage cut rather than the value-shape cut.

### 4. Own corner / engrave / supply-only — VERIFIED-TRUE

- **Radius 2px own seam**: computed borderRadius **2px on every served
  instance** — including `radius="medium"` and `shape="squircle"` demos
  whose inline styles carry --jx-radius-effective/--jx-shape-effective
  stamps the corner ignores. `var(--kbd-radius, 2px)` is the promotion
  seam, not the axis carrier — measured and source-confirmed.
- **Engrave tier**: computed boxShadow = the literal inset pair
  (`rgba(0, 0, 0, 0.4) 1px 1px 0px 0px inset` + the light companion) —
  --jx-shadow-engrave, the axis carrier unread.
- **Zero transitions / no css file**: the family ships no css at all
  (dir listing + grep); zero transition declarations in the atoms; zero
  shape/color/motion carrier readers (grep receipts over ui/kbd/).

### 5. a11y — VERIFIED-TRUE

Native `<kbd>` renders zero ARIA (the element is the semantics); the a11y
table teaches compose-by-hand (one kbd per key, the + literal, each key
its own announcement) and carries the honest non-interactive `—` keys row;
rest props (title/data-*/global ARIA) documented as the consumer's channel.

### 6. The EXTRA-channel limitation (claim 7) — VERIFIED, the note is honest

The served api table is **[variant, class] — 2 rows** (probe-enumerated)
while the SOURCE props array carries the density row inline with the
matrix-frozen 'ambient scope' cell: the pin is satisfied at the source
level (ambient 284/284 green) and the universal fold serves the generic
density text in its 8-row section. The limitation note is honest — with
one residue: the hoisted `apiDensityRow` const (:194-200) is now DEAD CODE
(referenced nowhere; the inline literal is what the scanner and the table
serve). NIT: delete it at consolidation, or wire it if a future
props-table feature ever reads references.

## Gates (my run)

| Gate | Result |
|---|---|
| kbd spec solos (kbd, batch3-components, defaults-kbd-badge-chip, --testTimeout=30000) | **28/28**, exit 0 |
| docs-ambient-vocabulary solo | **284/284** (kbd's two matrix pins hold at the source level — variant own-'tonal' + density ambient-scope) |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | kbd page: **0 diagnostics** |
| Port 5241 | lsof EMPTY before; dev server + wrapper killed by PID; EMPTY after |

## Process evidence

Probes (deleted after the run): chrome/toc/api enumeration, per-context
font pairs, DensityDemo rung ladder, injected-island theme reads, radius
matrix across the universal demo instances. Dead-const and summary-sentence
receipts from source + served DOM. All sibling files untouched
(scribe's input-otp review, vellum's menubar CODE, marginalia's
boot-splash CODE — none of their keys appeared in my solos).

No commits made. Report file: `agents/quill/reports/27-review-kbd.md`.
