# TASK 89 — FIRST REVIEW math-block.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (1st review; scribe's CODE, legacy explicit-props W4 at
  64a4f3e9, no CODE report — owner-checked I did not code it. No other math-block
  review exists; no concordance addendum applies. All findings derived from my own
  source reads + probes).
- **Target**: `apps/www/src/routes/docs/components/math-block.html/` (+page.svelte 462
  lines, toc 9) over the math-block family (svelte 436 / stylex 72 / css 35 / defaults
  41) — the native `<figure>` + KaTeX display-math surface riding the shared
  scroll-run contract, served live on :5244.
- **VERDICT: PASS — MAJOR x0 / MINOR x2 / LOW x0 / NIT x0.** **Tier proposal: Tier 1**
  (one attribute fix + one a11y-row note; the page is otherwise complete — toc 9/9
  with universal-props IN the rail, the strata/scroll-verdict/error/copy receipts all
  measured true).
- **The km gate**: `npm run verify:km` **GREEN — 9 assertions** against the live
  :5244 server (mermaid render + error-leak cleanliness; math-block .katex markup +
  hidden MathML + the strip scroll-verdict receipt — the script's own
  none/none/start-closed/none/none read matches my census exactly).

## MINOR 1 — the scroll run is not keyboard-focusable: the a11y table's Tab row is falsified on the strip

The a11y table (:387): "Tab — **Reaches the strip (focusable scroll run)** and the copy
control" and "← / → — Scroll the focused strip when the verdict is open". Measured on
the wide-equations strip (the overflowing run, state start-closed, scrollW 924 >
clientW 819): the run carries **no tabindex attribute** (IDL tabIndex −1), `.focus()`
does not take (activeElement unchanged), and a **real Tab walk from inside the strip
section never reaches the run in six presses**. The ←/→ claim rides on the focus that
cannot happen — keyboard users cannot scroll the clipped half of a wide equation (the
WCAG 2.1.1 scrollable-region class). One-attribute family fix: stamp
`tabindex="0"` on the run when the verdict arms (the scroll-run contract's own
arming point); the a11y row then measures true. The copy-control half of the Tab row
holds (MINOR grade: one surface's keyboard access, not the page's whole contract).

## The claims — verified digit-exact

- **The SSR/pre-render duality, BOTH halves**: the served bytes bake **real KaTeX
  markup — 96 `class="katex"` occurrences** in the raw payload (the sync-SSR lane's
  "prerender bakes REAL katex markup, zero flash" receipt); the hydrated paint matches
  the served markup (post-hydration reads identical — no code-card-style
  plain-text-floor). A live tex change re-derives in place (the workbench's
  formula select drives the same run — below).
- **The scroll-verdict machine** (the single-truth claim): the page's runs census —
  **fitting formulas paint state "none"** (no chrome; scrollW == clientW: 819/819,
  672/672, 640/640) and **overflowing runs paint "start-closed"** (232>195, 924>819,
  224>222 — the chips armed). The workbench drive (protocol selectOption euler →
  maxwell → system): euler 819 none; **system-wide 924 > 819 → "start-closed",
  overflow true**; **fit on → 819/819 "none", overflow false — the font-size fit
  kills the overflow and the verdict re-measures, exactly as the PlayHelp teaches**
  ("the chips dismiss as the verdict re-measures"); restored clean.
- **Errors paint in place**: the broken-tex seat renders the raw source run inside a
  `.katex-error` span colored **oklch(0.6 0.2 25)** (the errorColor
  `var(--error)` resolved — the monochrome-free error tint), and the console carries
  **"[jixoai/math-block] KaTeX parse error (painted in place): ParseError…"** — the
  warn receipt verbatim.
- **The copy control, end-to-end** (clipboard-permitted context, real-key Enter):
  aria-label flips **"copy" → "copied"**, the clipboard carries **the raw TeX
  payload** (`\mathrm{e}^{\mathrm{i}\pi} + 1 = 0` — the Euler identity), and the
  label restores to "copy" after the 1.6s window.
- **The role placement**: 11 `<figure>` elements page-wide; the rendered math blocks
  carry **role="math" on the inner wrapper** (5), with hidden MathML in the katex
  output (4 — the error seat's failed parse ships none, consistent); no aria-label on
  the surfaces.
- **The ink two-read** (the strip's katex, per-chain): light oklch(0 0 0) / root dark
  oklch(0 0 0) — **HOST stratum**: the strip lives inside the canvas stage's
  data-theme="light" pin; the katex ink is inheritance (no alias var), so the stage
  decides. Named per the alias-theme law; no frozen-ink claim to break (the page
  claims no dark-math repaint).

## Standard battery

- **SSR**: 1,202,520 bytes; h1 ×1; universal marker present; 0 undefined literals;
  zero `jxoai`.
- **Warm-reload (strip-style)**: raw fetches differ; **stripped of the dev-assembled
  style block, byte-identical** — the dev-CSS order artifact, fourth consecutive page.
- **EXTRA-lane**: the api table serves 6 props + the HTML rest (tex required;
  copyable; labels localization payload; fit; size; class) — the composition-first
  posture named; the rest-spread order (rest FIRST, the component's stamps AFTER —
  Svelte later-wins) is source-documented (:38-40).
- **LAW #18**: no repeated-row each on the page (the canvas files are static data;
  the ladder seats are hand-authored) — the keyed surface is empty by construction.
- **LAW #19**: 75 ids on the live DOM, zero duplicates.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| **verify:km** | **GREEN — 9 assertions** against the live :5244 tree (mermaid render + zero engine-chrome leaks; math-block .katex + hidden MathML + the strip verdict). **Port note**: the script defaults to :5199, where a STALE orphan listener (node 23502, not mine) serves a pre-mermaid build — the default-port run is red; run it `--url` at the tree under test |
| svelte-check (fleet) | **math-block.html: 1 diagnostic** (:190, the Object.entries-undefined standing class — recorded, not chased). Family lane, pre-existing: 4 ERRORs |
| verify:docs (dist 39b0a463) | **RED — 1 problem, seat = toast** (the recorded red), **math-block clean** — sibling noise receipted, not chased |

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 47565; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after. (The
  stale :5199 listener node 23502 predates this task and was left untouched — flagged
  for the orchestrator.)
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- DOM injections (root dark) reverted in-probe; all drives real keys / protocol
  selectOption.
- Instrument honesty: (1) my first workbench drive dispatched a synthetic change with
  an option LABEL as the value — silently no-oped (the T63 lesson's select edition);
  protocol selectOption on the marked select is the receipt; (2) my first "error
  seat" read searched for a trigger button that does not exist (the error seats
  render statically); (3) the strip-ink two-read is stage-pinned — the honest chain
  name, not a frozen-ink claim.
- Artifacts: /tmp/marginalia-89-probe{1,2,3,4,5,6,7,8,9}.mjs,
  /tmp/marginalia-89-ssr{1,2}.html,
  /tmp/marginalia-89-{dev,wrapper,listener,ambient,universal,km,km2,scheck,docs}.*.

## Open questions

1. **The scroll-run tabindex** (MINOR 1): the scroll-run contract arms
   data-jx-scroll-state on overflow; stamping `tabindex="0"` at the same arming point
   makes the a11y row true and closes the WCAG 2.1.1 gap. Family owner, one attribute.
2. **The stale :5199 orphan** (node 23502): whatever process owns it, the km gate's
   default port answers with a pre-mermaid build — worth killing or documenting so
   the next `npm run verify:km` without --url doesn't read the stale tree.
