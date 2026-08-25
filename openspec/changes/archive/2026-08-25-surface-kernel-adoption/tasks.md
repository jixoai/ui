# tasks — surface-kernel-adoption

- [x] 1. Audit: 19 popover/dialog surfaces → 11 adopters, sheet
      excluded (declared variant), tooltip kept (declared hand-rolled)
- [x] 2. OpenSpec change scaffold (swept into 1ba47f4 by the
      parallel session — history accepted)
- [x] 3. Batch A: dropdown-menu + menubar + float-button (subagent)
- [x] 4. Batch B: select + combobox + tags-input (subagent)
- [x] 5. Batch C: date-picker + color-picker (subagent)
- [x] 6. Batch D: popconfirm + hover-card + tour (subagent)
- [x] 7. ZCode gates: shadcn build + verify:mirror + vitest + manifest
- [x] 8. Cross-batch fixes: menubar per-panel kernels (glide ghost),
      surfaceMotionSupported export; per-batch commits
- [x] 9. Browser walkthrough (verify-kernel-adoption — FULL 11-adopter
      matrix 34/34 GREEN after Codex r1; verify:surface 46/47, the
      failure pre-exists on f87ec87)
- [x] 10. Codex review round 1 (Herdr, gpt-5.6-terra xhigh): 9.0/10,
      zero blockers; all three non-blocking findings processed
      (probe coverage 4→11, probe resilience, float-button naming)
- [x] 11. Codex review round 2 (fix confirmation): 9.5/10, zero
      blockers; doc-level findings closed in ad43329 (review-r2.md)
