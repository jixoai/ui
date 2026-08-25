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
- [ ] 3. Batch A (subagent): steps + timeline + descriptions families
      — registry + mirror + demo pages + tests + SSR/ordinal fixtures
- [ ] 4. Batch B (subagent): breadcrumb + pagination (+ range helper
      tests) + anchor + terminal-footer
- [ ] 5. Batch C (subagent): menubar + navigation-menu + toggle-group
      + dropdown-menu nested-walker scoping drive-by
- [ ] 6. Batch D (subagent): toc + hero-section + tour + alert-dialog
      + popconfirm
- [ ] 7. Batch E (subagent): command family (self-match items, CSS
      :has group/empty, kb nav preserved)
- [ ] 8. Batch F (subagent): terminal-header decomposition + docs-site
      chrome migration (last — rides on C's machinery)
- [ ] 9. ZCode integrator: registry.json entries per family (preserving
      sibling-session hunks), cross-batch fixes, per-batch commits
- [ ] 10. Gates: pnpm build + verify:mirror + vitest + hook-law +
       verify-composition-law --self-test (4 fixtures green) +
       verify-composition-law (0 violations) + openspec validate
       --strict
- [ ] 11. Browser walkthrough: 17 demo pages (built-in browser;
       ego-browser only on anomalies)
- [ ] 12. Codex implementation review round (Herdr, async) + iterate
       to green
- [ ] 13. Archive change; spec delta merged; exceptions table carried
       into component-authoring as the audit checklist
