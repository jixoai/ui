# Proposal: merge-alignment — the frozen decision record for the two-stream reunification

## Context

feat/jx-pure-register-fusion (css-laws V3, icon vocabulary, picker
bridge, cq geometry — 84 commits) merged with main (ghostty-term
suite, jixoai() umbrella, theme extensibility — 30+ commits) at
647c606, 707/707 tests green. This change freezes the BIDIRECTIONAL
standard alignment decided in the ZCode-led Codex discussion
(codex-merge-align, 2026-08-29) and lands it item by item.

## Decision record (frozen — implementation tracks this table)

| # | decision | ruling |
|---|---|---|
| A1 | plugin unification | `@jixoai/vite-plugin`'s `jixoai()` umbrella is the canonical owner. The icon system (providers/serializer/safety) folds in as a `icons` FEATURE OPTION: provider factories stay a physically independent submodule (pure, testable), safety config nests under `icons`, default OFF (no file reads / font parsing / optional deps without opt-in). `@jixoai/ui-plugin` was never published (npm 404 verified) → one-shot migration, NO compat re-export. |
| A2 | theme extension law | "defaults ride extension points, never hardcode" enters the living spec. `--jx-icon-*` slots comply. Add a static check: slot fallback URIs allowed, duplicate icon paint outside slots forbidden. |
| A3 | gate chain | a composite auditable gate: verify:laws → mirror → budgets → ghostty-pin --offline → shadcn-add (real consumer proof, external fetch handled). Online pin stays on wasm-sync/nightly (proxy resilience). Deploy workflow gains the full chain. |
| A4 | registry deps | bare inter-item deps forbidden — every entry `@jixoai/<item>`; chip's `press-button` fixed (landed in D0); static assertion added with A3. |
| B1 | css-laws scope | future native form-control laws: TS-law-generated ONLY (no hand @utility/@apply). Guard targets the law slots + form-control face — NOT a blanket CSS grep (jx-hue-* intent utilities stay legal). |
| B2 | icon carriers | hierarchy: inline SVG currentColor (component ctx) > mask dedicated carrier, chrome on ancestors (CSS-only) > background + ink flips (UA pseudos). Terminal nav glyphs adopt the 13px inline-SVG precedent when they become real glyphs; the CSS hamburger stays (form-follows-function exception recorded). |
| B3 | density semantics | **undefined-ambient is the canonical default** (chrome/providers hold no opinion; ambient scope flows through). Fixed-posture standalone leaves needing definite geometry pass an EXPLICIT local fallback (ghostty-term's `fallback('default')` is the exemplar). Audit: full static inventory of resolveDensity/data-density/--jx-* consumers; terminal FAMILY (header/card/footer) enters the density registry — not just ghostty-term. Criterion classes: provider/chrome→ambient; fixed leaf→stamp; content→no stamp (literal = structural exception). Each class verified across no-parent/xs/lg. |
| B4 | cq geometry | locked size+ratio + container-type:size + internals all 100cqh-derived — for FIXED-posture controls only; fluid/editorial surfaces excluded. Requires definite containing block + used-value/narrow-wide matrix verification. |
| B5 | floating surface | terminal panels are specializations of the shared surface law (same kernel/classes) — no terminal-specific motion law; keep reduced-motion/no-JS/exit-cancellation locks. |
| C1 | budgets | B-face re-recorded to 10393/400 rules (merged streams' face laws; rendering identity covered by parity 311 + terminal suites). NOT re-recorded again without growth justification. (landed in D0) |
| C2 | wasm resolver | bounded retry (3 attempts) + per-attempt received/expected diagnostics + final error naming proxy-truncation vs pin-drift vs JIXOAI_GHOSTTY_WASM_PATH. Final size/hash verification never weakened. (landed in D0) |
| C3 | consumer budget | dual budgets during two-package reality: B-consumer-icons + B-consumer-vite (aggregate observational only). After A1: canonical vite-plugin budget + icons feature sub-budget. |

## Execution order (Codex-corrected)

0. **D0 evidence repair** — C1 baseline, A4 bare dep, C2 resolver, verification.md truthing. *(landed)*
1. **D1 this decision record** — frozen before pushing the merge to main. *(this change)*
2. D2 gate chain (A3) into composite script + workflow.
3. D3 A1 umbrella migration as its OWN change (packed consumer + type entry + built runtime + vite integration proof).
4. D4 B1/B2/B4/B5 + B3 density audit (registry expansion + matrix evidence).
5. D5 Owner browser acceptance; release.

## Impact

- No behavior changes in D0/D1 (evidence + records only).
- D2-D4 touch packages/{vite-plugin,ui-plugin}, scripts, workflows,
  the density registry, and terminal-family docs — each its own
  gated change per the order above.
