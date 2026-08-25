# tasks — composition-first-apis

- [x] 1. Audit + research + OpenSpec scaffold (this change)
- [x] 2. Codex design round r1 (4.5/10) → r2 revision: family context
      contract, explicit ordinals, self-match, ownership, ecosystem
      granularity, verification matrix
- [x] 2b. Codex design rounds r1–r3 (4.5 → 6.0 → 7.2) → r4 revision:
      ToC SSR exception ruling, item-scoped :last-child selectors,
      ID/handle protocol precision, typed child contract, ordinal
      semantics, command selectors, pageRange token branching,
      verify-composition-law.mjs CREATED (15 pre-change violations =
      the kill list: 13 structural + 2 config-tree)
- [x] 2c. Codex design rounds r1–r9 (Herdr): 4.5→8.3, APPROVE-FOR-
      IMPLEMENTATION (review-design-r1.md 全轨迹归档)
- [x] 3. Batch A: steps + timeline + descriptions families
- [x] 4. Batch B: breadcrumb + pagination (+ range helper) + anchor
      + terminal-footer
- [x] 5. Batch C: menubar + navigation-menu + toggle-group +
      dropdown-menu scoping drive-by
- [x] 6. Batch D: toc + hero-section + tour + alert-dialog +
      popconfirm
- [x] 7. Batch E: command family (self-match, :has states, kb nav)
- [x] 8. Batch F: terminal-header decomposition + docs-site chrome
- [x] 9. Integrator: registry.json (17 family entries +104 files,
      descriptions), manifest regen (+ terminal-header hash patch;
      batch2 spec left for the tooltip session's landing), the toc
      page-data seam, 3 scenes, 6 old suites migrated — per-batch
      commits 78c6310…a0b662b
- [x] 10. Gates GREEN: build + vitest (479/479, 37 files) + hook-law
       + composition-law 0 violations + self-test 4/4 + site build
       85 pages prerendered + openspec validate --strict
- [x] 11. Walkthrough 17/17 (built-in browser webview unavailable ×2
       → ego-browser per owner instruction; every behavioral lock
       verified live incl. the composed header mega panels)
- [x] 12. Codex implementation review: r1 7.1 → r2 7.0 → r3 7.8 →
       r4 APPROVE-FOR-IMPLEMENTATION 8.2/10 (P1 修复五组 + 回归锁
       3c12a20；轨迹归档 review-design-r1.md)
- [x] 13. Archived; spec delta merged into component-authoring (the
       composition-first API surface, the family context contract,
       the child snippet contract); the exceptions table IS the
       probe's in-script allowlist (scripts/verify-composition-law.mjs)
