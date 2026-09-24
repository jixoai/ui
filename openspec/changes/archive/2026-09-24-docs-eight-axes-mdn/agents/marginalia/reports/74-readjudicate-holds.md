# TASK 74 — RE-ADJUDICATION PROBE: separator + spin HOLD slots (marginalia, 2026-09-22)

- **Reviewer**: marginalia (the task-72 flag, closed; no sibling reports consulted —
  this probe adjudicates my own task-61/65 receipts against fresh instruments, so no
  concordance addendum applies)
- **Targets**: separator.html and spin.html served live on :5244; the chains from
  source: separator solid fill `backgroundColor: tokens['--jx-border']` (stylex :68/:72;
  `tokens.stylex :75 '--jx-border': 'var(--border)'`), spin ink `color:
  tokens['--jx-primary']` (stylex :26/:35/:62; `tokens.stylex :62 '--jx-primary':
  'var(--primary)'`).
- **VERDICT: BOTH STAGE-PIN.** The holds were `data-theme="light"` demo-stage pins, not
  chain mechanics. Under root html.dark every unpinned instance re-derives; no hold
  survives a body-level move. The fleet record's "root-pinned alias, frozen everywhere"
  story retires; the three-tier model replaces it. My own task-65 "fleet-wide frozen"
  A/B and task-61 "twice measured" holds are withdrawn as stage artifacts.

## The probe protocol, as executed (the pin-finder made explicit)

1. **CENSUS all instances** (not one sample — the 22-chip lesson): separator.html
   51 separator elements; spin.html 40 ink elements.
2. **Two-read under root html.dark** per instance: element paint + html-level var.
3. **Ancestor walk on every HOLD**: locate the boundary where the token's computed
   value differs from the parent's; name the pin element.
4. **Body-level control**: clone each held instance to `document.body` under root
   dark and re-read — the decisive move-outside-the-stage.
5. **Verdict per family**: STAGE-PIN vs CHAIN-FROZEN.

## Separator — STAGE-PIN

- Light baseline: 51 elements; the physics variants (ghost/masks/blend) read
  transparent (mechanism, not the chain); exactly **TWO solid fills** with the token
  paint `oklch(0 0 0)`: one with **no data-theme ancestor** (the unpinned instance),
  one inside a `data-theme="light"` stage.
- **Root html.dark**: html-level `--border` flips `oklch(0 0 0)` → `oklch(1 0 0)`
  (and `--jx-border` with it — the alias re-derives at :root, live). The **unpinned
  solid FLIPPED in place: oklch(0 0 0) → oklch(1 0 0)**. The stage-pinned solid HELD
  oklch(0 0 0).
- **Ancestor walk** (the hold): boundary at `div.x78zum5.xz65tgg…[data-theme="light"]`
  inside `div.jx-canvas-scroll` — `--border` oklch(0 0 0) on the stage vs
  oklch(1 0 0) on its parent. The stage re-voices the token family mid-tree; that is
  the whole pin.
- **Body-level control**: the pinned solid cloned to `document.body` under root dark
  reads **oklch(1 0 0) — moves-to-flip TRUE**. The hold was the stage, full stop.

## Spin — STAGE-PIN

- Light baseline: **40 ink elements**, all `oklch(0.6489 0.237 198)` — 7 inside
  `data-theme="light"` stages, 33 unpinned. html `--primary`/`--jx-primary` =
  0.6489-family.
- **Root html.dark**: html-level `--primary` flips to
  `oklch(0.7044 0.1872 calc(198 - 4))` (the site clock's hue arithmetic; computed
  color resolves H 194). The census: **33 of 40 FLIP to oklch(0.7044 0.1872 …)** —
  L 0.6489→0.7044, C 0.237→0.1872 — and **exactly the 7 stage-pinned inks HOLD**
  0.6489/0.237/198. Zero unexplained holds.
- **Ancestor walk** (a hold): the identical pin site — `div.x78zum5.xz65tgg`
  `[data-theme="light"]` inside `jx-canvas-scroll`, `--primary` light on the stage vs
  dark on its parent. Same stage component as separator's pin and tags-input's
  (task 72).
- **Body-level control**: a held ink cloned to body reads
  **oklch(0.7044 0.1872 194) — moves-to-flip TRUE**.

## Why both prior receipts measured holds (the reconciliation of my own record)

- The demos on both pages live inside `data-theme="light"` canvas stages. Task 61's
  "frozen, twice measured" separator samples and task 65's A/B spin samples were
  stage-pinned instances. The island halves of those receipts were TRUE (tier 2
  below); the root-dark halves were pin artifacts.
- The declaring rule (receipted in task 72's probe 7, same layer here):
  `:root, .xbpgcew { --jx-muted: var(--muted); … --jx-border: var(--border) … }`
  inside `@layer components.stylex.priority1`. A var() reference in a :root custom
  property **re-substitutes when html.dark flips the site token**, and the recomputed
  value inherits to every unpinned descendant. ":root-pinned" named the declaration
  site, not the semantics.

## Seat corrections (you land them; exact lines from the served sources)

**separator.html (`+page.svelte`)** — the frozen-everywhere seats:
1. **:363-365 (the law paragraph)** — "root-level dark does not reach the paint …
   the strip's ink holds oklch(0 0 0), twice measured: frozen everywhere." → Replace
   with the three-tier receipt: the unpinned solid flips oklch(0 0 0) → oklch(1 0 0)
   at root dark (measured in place AND by body-level move); a mid-tree .dark island
   cannot re-derive it; `data-theme="light"` demo stages locally pin. The "twice
   measured" holds were the theming-demo stage.
2. **:505 (TokenTable, solid-fill row)** — "holds under a scoped .dark island AND at
   root-level dark … frozen everywhere, twice measured; the html var read is not the
   paint" → the html var read AGREES with the paint at root dark (both flip); keep the
   island clause, retire the root-dark freeze.
3. **:514 (axes summary)** — "frozen under a scoped .dark island, re-derived only at
   root-level dark" → already directionally right at root; adopt the three-tier
   language and add the stage-pin clause.
4. **:254 (color axis row, the mechanism split)** — the root-derivation clause stands;
   add the stage-pin tier so the row and the law paragraph tell one story.
5. **:528-531 (receipts prose)** — the island half (fill HELD under island) stands;
   the "html.dark re-derived it" clause was the ALIAS read — keep it but mark the
   element-level follow-up as superseded by the task-74 unpinned flip.

**spin.html (`+page.svelte`)** — the five A/B seats, plus the one row that was right:
1. **:358-359 (law prose)** — "at root-level dark the html alias re-derives but the
   re-derived value never reaches the glyph (the A/B …)" → it does: 33/40 unpinned
   inks flipped 0.6489→0.7044 at root dark, measured at the elements; the 7 holds are
   the data-theme stages.
2. **:637 (theming summary)** — "frozen EVERYWHERE … the value never reaches the
   glyph" → same rewrite.
3. **:648 (TokenTable, text-primary row)** — "FROZEN EVERYWHERE (scoped island: held;
   root-level dark: … the glyph holds)" → island clause stands; root-dark clause
   flips.
4. **:687 (axes summary)** — "frozen EVERYWHERE (the A/B adjudication: html
   re-derives, the element holds)" → rewrite per the three-tier model.
5. **:700-702 (receipts prose)** — "the ink HELD … under a scoped .dark island and
   re-derived at root-level dark A/B: html re-derives, the element holds" → the
   island half is the keeper; the element-holds half retires.
6. **:248 (color axis row)** — the one seat that already said "root-level html.dark
   re-derives it (measured flip)": keep the direction, adopt the three-tier language.
   The page was internally inconsistent before this probe; :248 wins.

## Ledger rewrite text (drop-in replacement for the fleet-line story)

> **THE ALIAS-THEME LAW (three-tier; separator/spin/tags-input re-adjudication,
> task 74).** The --jx-* aliases (`:root, .xbpgcew { --jx-border: var(--border);
> --jx-primary: var(--primary); --jx-muted: var(--muted); … }`,
> @layer components.stylex.priority1) are **LIVE at the root**: a var() reference in a
> :root custom property re-substitutes when html.dark flips the underlying site token,
> and the recomputed value inherits to every unpinned descendant.
> — **Tier 1, ROOT DARK FLIPS**: unpainted-by-stages instances re-derive (separator
> solid oklch(0 0 0) → oklch(1 0 0) in place and by body-level move; spin ink
> 33/40 → oklch(0.7044 0.1872 …); tags-input chips 14/22).
> — **Tier 2, ISLAND-PROOF**: a mid-tree `.dark` island re-derives the site token but
> cannot re-substitute an alias declared above it (measured on all three families and
> progress).
> — **Tier 3, STAGE-PINNED**: demo stages carrying `data-theme="light"` re-voice the
> token family mid-tree and locally pin their content (pin site: the stage div inside
> `jx-canvas-scroll`; every measured hold — 8/22 chips, 1/2 solids, 7/40 inks — had
> the pin ancestor, and none survived a body-level move).
> The var-vs-paint read-site law stands, with corrected scope: html-level var reads
> and element paints AGREE at root dark (both flip); they diverge only under islands
> and stages, which is where the single-sample probes of tasks 61/65 went astray.
> Fleet line retired. "Root-pinned alias, frozen" in any earlier report or page copy
> refers to a stage pin unless the instance was verified outside a data-theme
> ancestor. Remaining sweep: tabs.html and system-dialog.html (FLIP slots — confirm
> with the pin-finder at next touch) and progress.html (the frozen-ink instance named
> in the W-next #7 receipts — same instrument).

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 40312; killed by PID +
  wrapper after the probe; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → empty, rc=1 after.
- **NO commits, NO pushes; zero page/family edits** (probe task — the seat corrections
  above are named for the orchestrator, not landed).
- DOM mutations (html.dark class, body-level clones) reverted in-probe; restored
  baselines re-read.
- Artifacts: /tmp/marginalia-74-probe1.mjs, probe2.mjs,
  /tmp/marginalia-74-{dev,wrapper,listener}.*.
