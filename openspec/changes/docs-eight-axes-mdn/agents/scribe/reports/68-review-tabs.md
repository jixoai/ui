# TASK 68 — FIRST REVIEW tabs (scribe, 2026-09-24)

- **Reviewer**: scribe (1st of 2; independence law held — vellum's report 42 was opened
  only AFTER the findings below were fixed by my own source reads + live probes; the
  concordance addendum follows at the end)
- **Target**: vellum's page — `apps/www/src/routes/docs/components/tabs.html/`
  (+page.svelte 1150 lines + +page.ts, 13-entry toc) over the tabs family (list 634 —
  the keyboard/indicator engine — trigger 120 + css 196, content 56, root 208, stylex,
  defaults). Integrated at d51b92c7 with the sixth-mechanism discovery; target paths clean
  in the working tree; the in-flight sibling set untouched.
- **Method**: source reads (page, the list engine's walk + indicator css), headless
  Chromium over dev SSR :5243 with warm-reload discipline, REAL-key ARIA batteries,
  rAF-sampled indicator travel through the 240ms authored transition and under emulated
  reduced motion, the density seat driven across 48rem, the sixth-mechanism adjudication
  with element-level ink reads under three theme states, SSR payload parse, the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Every headline claim verified
  TRUE with digit receipts; the sixth-mechanism adjudication confirms the alias receipt is
  PAINT-TRUE on this family.

## The headline claims — verified TRUE (my own instruments)

1. **THE ARIA CHAIN ON REAL KEYS — VERIFIED.** Page census: **29 tablists**, 129 tabs,
   22 panels. The demo tablist (preview · raw · diff · audit-DISABLED — the disabled-last
   shape the dispatch targets): ArrowRight from the selected trigger **moved focus AND
   flipped aria-selected** (preview → raw, exactly one true), **the roving stop followed**
   (raw tabindex 0, all others −1), list **tabindex −1** (out of the Tab order). The walk
   **wraps and skips disabled triggers** (source: the modulo walk over the non-disabled
   list). **End with the disabled last trigger: lands on diff** — the last ENABLED — with
   audit still disabled (the APG skip, on real keys). **Home → preview** (focus AND
   selection). Automatic activation: the focus move selects (the engine clicks).
2. **PANELS — VERIFIED hidden + UNMOUNTED.** Inactive panels carry the **hidden attribute
   with ZERO child elements** (content unmounted — element-presence receipt, counting
   elements not innerHTML); the active panel renders its content. Every panel's
   **aria-labelledby pairs its trigger's deterministic id** (`s2-tab-preview` …) and all
   resolve; **panels tabindex 0** per APG.
3. **THE INDICATOR'S TRANSITION-FRAME — VERIFIED.** Computed
   **`transition-duration: 0.24s, 0.24s, 0.24s`** (transform/width/height,
   cubic-bezier(0.2, 0.8, 0.2, 1) authored in tabs-trigger.css). One selection driven with
   rAF sampling: **20 samples, 15 DISTINCT transforms**, first mid-travel
   `translate(25.78px, 38)` → settle at `translate(92px, 38)` — the decelerate envelope
   through many more than the claimed ~9 distinct mid-travel positions. **Under emulated
   reduced motion: 17 samples, 1 distinct transform, duration 0s** — the bar JUMPS.
4. **DENSITY — THE ONE CONSUMED AXIS, DIGIT-EXACT.** The seat trigger's computed
   min-height/height: **48px @lg → 32px @sm** across the 48rem viewport key, with
   data-density flipping lg/sm — the kernel rescale on the trigger's hit height, exact.
5. **THE SIXTH THEMING MECHANISM — ADJUDICATED: PAINT-TRUE (the third data point).** The
   chain: `--jx-foreground: var(--foreground)` is declared at `:root` (the stylex token
   table) — `:root` and `html` are the SAME element, so `html.dark`'s `--foreground`
   re-declaration wins the substitution AT the root, and the resolved `--jx-foreground`
   inherits down. Measured at the ELEMENT's computed usage (the trigger's own
   `getComputedStyle().color`, never an html-level var read):
   - light: trigger ink **oklch(0 0 0)**; `--jx-foreground` = `--foreground` = 0 0 0;
   - scoped `.dark` island: **`--foreground` flipped to oklch(1 0 0)** while
     **`--jx-foreground` HELD 0 0 0** and the trigger's computed ink **HELD** — the alias
     substitutes before inheritance;
   - **root-level `html.dark`: the trigger's computed ink reads oklch(1 0 0) — the ink
     re-derives AT THE PAINT** — vellum's receipt is paint-true on this family, not an
     html-level read artifact.
   The fleet data point now reads: separator **HELD** (the ghost ink is engine physics),
   tags-input **FLIPPED** (the chip ground is a var-chain read), **tabs FLIPPED** (the
   trigger ink is a var-chain read) — the hold/flip line is exactly the var-read vs
   physics line, as the craft law predicts.
6. **THE CANVAS-PINNED GROUND — VERIFIED.** Under root-level dark, the canvas stage
   (`data-theme="light"`, confirmed in ComponentCanvas source) computes its ground
   **oklab(0.981142 0 0)** — the light ground held inside the stage while the site went
   dark: in-page demos are light-scoped BY ANCESTOR ATTRIBUTE (the scope mechanism, the
   ledger's added theme mechanism; attribute-scoped re-declaration joins defineVars pins
   and root-pinned aliases).
7. **THE TWO RT-ATOM FIXES + STRUCTURE — VERIFIED.** Page-scoped svelte-check: **0
   diagnostics** (the nonexistent `rt.tabsGradPill`/`rt.tabsMd2` HEAD errors are gone).
   toc **13 == +page.ts == DOM == SSR rail ×2 surfaces** (the old 5-entry toc missed seven
   real sections — all seven now served). Payload 1,286,078 bytes; h1 ×1; universal marker
   ×1; 0 undefined/null literals.

## Standard battery

- **EXTRA-lane by name**: the api/theming tables and the indicator gallery (line · pill ·
  outline · glass · liquid · none) + the custom-indicator snippet seat all served by name.
- **THEME-SPLIT (all six mechanisms + var-vs-paint)**: the consumed density kernel
  (measured 48/32), the root-pinned alias (adjudicated at the element), the
  attribute-scoped canvas ground (measured under root dark), class:dark stamps for
  composed descendants, the defineVars pins, and the supply chains (zero
  `--jx-*-effective` readers over ui/tabs/ — the row's grep receipt).
- **Vocabulary-grep**: zero `jxoai` misspellings; no stale vocabulary in the family.
- **KEYED-EACH**: the layout runs key their letter triggers (uniqueness-guaranteed
  strings; 129 tabs mounted page-wide, 12/12 per layout run per the row's census).
- **LAW #19**: **241 ids, zero duplicates**.
- **Gates**: ambient solo **284/284 rc=0** · docs-universal **110/110 GREEN** ·
  svelte-check **page 0 diagnostics** (the family's own diagnostics — the FocusEvent/
  MouseEvent narrowing, `TabsScrollEffect` name, the undefined-binding — are the
  pre-existing debt in unchanged family files).

## Findings (severity-tagged)

1. **[NONE]** — no MAJOR, no MINOR, no LOW, no NIT on any dispatched claim.
2. **[LEDGER — carried flags, no action]** Her OQ1 (the canvas light-pin is a fleet
   posture — axis receipts measured inside canvases describe the light ground) and OQ2
   (the family density-comment drift, spin's cousin) stay for their owners; my seats rode
   full-width grounds outside canvases per that posture.

## Process evidence

- Port **5243**: lsof empty before the run; vite killed by **PID 94066 + wrapper 94038**
  (`npm run dev --port 5243 --strictPort`); `lsof -nP -iTCP:5243 -sTCP:LISTEN` → **empty,
  rc=1** after.
- **NO commits, NO pushes; zero product-tree edits.** Media emulation and the island/root
  dark classes reverted in-probe; siblings' in-flight files untouched.
- Independence: vellum 42 opened only after the findings above were fixed; concordance
  follows.
- Instrument honesty: my first rAF script died referencing `document` in Node (the probe's
  bug, re-run clean); the roving-follows receipt reads the served tabindex state rather
  than trusting focus; the ink adjudication reads the TRIGGER's computed color (the
  element's paint), per the var-vs-paint law.
- Artifacts: /tmp/scribe-68-probe{1,2,3}.mjs, /tmp/scribe-68-ssr.html,
  /tmp/scribe-68-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading vellum's report 42)

My findings above were fixed before this section.

- **FULL CONCORDANCE — every overlapping receipt reproduced**: the 29-tablist census; the
  ArrowRight flip + roving follow + indicator travel (her 0→25.6→73.9→80→88.5→91.7→92
  envelope = my 25.78→92 at my sampling cadence, same 0.24s×3 computed transition); End
  skipping the disabled audit trigger (stays on diff); Home → preview; list tabindex −1;
  panels hidden + unmounted (element-presence both); deterministic labelledby; panels
  tabindex 0; the density trigger 48/32 digit-exact; the three theme states on the token
  chain; the canvas light-pin; toc 13 == DOM == SSR; LAW #19 none; page 0 diagnostics
  including her two rt-atom fixes.
- **THE SIXTH MECHANISM — her receipt ADJUDICATED PAINT-TRUE**: my trigger-element
  computed ink flips to oklch(1 0 0) under html.dark exactly as her "(1 0 0 down the
  chain)" claimed. The fleet data-point line now reads separator HELD / tags-input FLIPPED
  / tabs FLIPPED — the hold/flip boundary is the var-read vs physics-ink line, which is
  the var-vs-paint law's prediction. Her numbers were honest element reads; no html-level
  artifact anywhere.
- **ADDITIONS (mine, not in report 42)**: the RM single-position census with sample counts
  (17 samples, 1 distinct, 0s); the 15-distinct-transform travel census (hers 9 — cadence
  difference, same envelope); the alias chain named at the declaration site
  (`--jx-foreground: var(--foreground)` at :root; html.dark re-declares --foreground on
  the same element, so the substitution at the root re-derives) with the fleet
  hold/flip line stated; the canvas ground measured UNDER root dark (oklab(0.981142 0 0)
  held) completing her scope claim from the dark side; and the 129-tab/22-panel page
  census beyond her tablist count.
