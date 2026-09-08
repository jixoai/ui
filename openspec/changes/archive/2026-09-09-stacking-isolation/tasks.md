# Tasks: stacking-isolation

- [x] 1. Spec deltas: css-architecture MODIFIED (isolation clause +
      scenarios + the container-type platform fact) and
      canvas-schema MODIFIED (dock pose wording: absolute → the
      one-cell grid host). Apply the same text to the living specs
      at ship time (archive step), per house flow.
- [x] 2. Incident fix, embedder side: `.jx-scroll-host` isolation
      in scroll-run.css + www mirror.
- [x] 3. Incident fix, canvas side: `.jx-canvas-scroll` (demo
      ceiling) + `.jx-canvas-stage-row` (page boundary) isolation
      in component-canvas.css + www mirror.
- [x] 4. Audit sweep: integrate the research inventory into
      design.md's AUDIT table; apply isolation to every class-(a)
      ladder owner + mirrors; record (b)/(c) as the standing
      inventory.
- [x] 4b. Print-determinism debt (found by this round's gate, root
       cause in a0a512e9): the dock retires in print — kernel-print
       artifact rule + the component's @media print twin; mirrors;
       probe EQ at both viewports.
- [x] 5. Enforcement: decide per the audit's gate survey (fold a
      z-index/isolation discipline check into an existing verify-*
      script, or carry the law in spec + review this round);
      implement if folded.
- [x] 6. Vision verification on the preview (5218): the scroll-run
      docs overlap corner — chips UNDER the dock, hit-test flips to
      the dock; drag/collapse/theme chrome unaffected; acrylic
      translucency intact over the run content; spot pages beyond
      scroll-run (canvas-heavy + one chrome-only dock page).
- [x] 7. www test pass for touched components (scroll-run,
      component-canvas suites) + verify:all full gate.
- [x] 8. Ship: verification.md, archive the change, commit, push
      (route per the button-bar parallel session's state at ship
      time: FF local main if its tree is clean, else push remote
      main from the worktree and leave local catch-up to it).
