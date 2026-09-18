# The one-shot completion — the engine leaves the repo NOW (Owner 2026-09-17)

## Why

The Owner's ruling after P0: separator's own docs page still carried
Tailwind classNames — the phased schedule (P1..Pfinal) leaves the
engine hanging for too long, and "你自己也不知道到底清得彻不彻底".
**一步到位**: migrate every surviving utility in one program, DELETE
the tailwindcss dependency + plugins entirely, and only then can the
replication be trusted — "你只有彻底把它删了，然后才能真正意义上
确保 1:1 的复刻". The Owner also frees the output from pixel-locked
1:1: removing Tailwind is expected to be a quality leap — "很多原本用
tailwindcss 硬编码的东西，现在都用 Context 管理起来了" (theme-able
literals become tokens, scopes retune everything). ONE unified
acceptance at the end (the Owner's 大验收), not per-phase reviews.

## The landscape (the pinned baseline)

470 files · 11,437 identities · 25,024 occurrences — routes 140 files
/ 15,445 · ui components 102 families / 5,408 · blueprints 138 files
/ 3,825 · libs 18 files / 346. The tailwindless gate (P0's machine)
enforces the monotone retreat; this change drives it to ZERO and then
removes the engine.

## Waves (parallel batches, serial integration)

- **W1 components**: 102 families onto the separator pattern
  (`<item>.stylex.ts` + component rewire + css shrink), in parallel
  agent batches over disjoint family sets.
- **W2 blueprints + libs**: 156 files — demo scenes are atom-heavy
  and mechanical.
- **W3 routes**: pattern-first — the shared page patterns (eyebrow
  ×554, demo labels, page shells, canvas frames) become shared
  surface atom modules + registered semantic rules ONCE, then
  per-page sweeps in parallel batches.
- **W4 engine removal**: app.css loses `@import 'tailwindcss'` +
  the @theme/@custom-variant bridge; jixoai.css's `@utility`
  jx-hue/jx-pair become plain classes; both vite configs drop
  `@tailwindcss/vite`; cn()'s tailwind-merge retires (utilities are
  gone, a plain joiner suffices); the print clone's `dark:`-stripping
  goes scope-native; check-tw4-prereq.mjs + the registry tw4
  prerequisite RETIRE (registry spec delta lands HERE — consumers
  need the theme sheet only); tailwindcss leaves every package.json.
- **Integration protocol** (parallel-safe): agents never touch
  registry.json, migration-ledger.json, the allowlist, or builds —
  they report; the orchestrator applies entries, rebuilds the
  payload, re-pins (decreases only), and runs the full verify chain
  between waves.

## Acceptance (the unified 大验收)

Budget ZERO (empty allowlist files[]), the engine's every trace
grepped clean (Pfinal's negative list, verbatim from the tailwindless
law), verify chain + www build + payload + probes green, receipts
regenerated, and a summary dossier the Owner walks on the dev server.
Where quality leapt (Context-managed values replacing hardcoded
utilities), the dossier names it instead of hiding it.
