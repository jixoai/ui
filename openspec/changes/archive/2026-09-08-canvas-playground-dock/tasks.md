# Tasks

## Lane CORE

- [ ] C1. `canvas-schema.svelte.ts` kernel extraction (types +
      controlsFor + schemaDefaultsOf + constants + PlayOutput);
      canvas module re-export; schema2form re-point; mirror.
- [ ] C2. `canvas-playground.svelte` the dock: pose/collapse/drag +
      ItemGroup composition (schema rows + snippet passthrough) +
      output foot + reset; pure clampDrag helper exported; mirror.
- [ ] C3. Canvas slimming: aside → dock mount inside stage-row;
      schema state machine moves; `pane` retires; css deletions +
      dock residue; mirror.
- [ ] C4. Kit: PlayFields → ItemGroup, PlayRow → Item shell,
      PlayHelp footnote tune, playground.css trim.
- [ ] C5. Targeted specs green (canvas/schema2form/list-item +
      component-canvas-related existing specs re-pinned).

## Lane DOCS-TESTS (after CORE)

- [ ] D1. pane= consumer sweep; component-canvas docs page workbench
      rework + copy.
- [ ] D2. Spec sweep (old lane pins) + NEW canvas-playground.spec.ts
      (expand/collapse/reset/output/rows/precedence/drag-clamp table).
- [ ] D3. props-table/meta updates if pane pinned; mirror manifest;
      vision snapshots regen.

## Integration

- [ ] I1. vision pass: representative pages × both themes × narrow
      container (dock overflow), expand/collapse/drag live.
- [ ] I2. verify:all GREEN → archive → commit + push → clean
      worktree.
