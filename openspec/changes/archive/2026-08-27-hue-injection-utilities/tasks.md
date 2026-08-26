# tasks — hue-injection-utilities

- [x] Theme sheet @utility intent layer (6 hues + destructive pair, both roots)
- [x] Compiler probe: declaration-equivalent emission vs arbitrary
      form (resolved TW 4.3.3; orderings verified in the built sheet —
      the r1-era 4.2.1 byte-equality result is historical)
- [x] cn() tailwind-merge classGroups for the closed set (both roots)
- [x] Guard suite (closed set verbatim, token existence, no hue-destructive, dedupe)
- [x] Spec delta: component-authoring injection-seam amendment
- [x] Migration: in-repo intent call sites → utilities (components,
      feedback states, docs pages, tests) — r1 blocker fix: InlineCode's
      local default reverted to the arbitrary EARLY slot (consumer-wins
      frozen contract; the utility form would outrank consumer injections)
- [x] The article: /docs/variant-grammar.html + route registration
      (probe claims honestly scoped: shipped vs contract-pending)
- [x] Codex review loop: r1 BLOCKED 5.5 (3 P1 fixed) → r2 7.8
      (pair prose + version evidence fixed) → r3 no P1/no regression,
      one P2 doc line fixed with assertion → r4 confirmation
- [x] Gates green at final close — r4 CLEAN, final score 9.2/10
      (5.5 BLOCKED → 7.8 → 9.2; artifacts:
      .agents/documents/2026-08-26-variant-grammar/codex-hue-review.md)
