# verification — data-jx-hooks

> Evidence index (spec APPROVED r5 9.0/10; implementation rounds
> recorded here). Numbers finalized at the integration commit.

## Spec-phase evidence

- Review trail: review-r1.md (4.0 BLOCK) → r2 (5.5) → r3 (7.0) → r4
  (7.5) → r5 **Approve 9.0** (appended in review-r4.md).
- Engine lineage: regex classifier (r0, historical 529/232) →
  jx-inventory@2 (AST + <style> extraction) → @3 (variants/shapes/
  mutual exclusion) → @3.1 (shared AUDITOR_SOURCES boundary) →
  **@3.2** (non-class context masks: animate-[…], [--jx-x:…],
  (--jx-x)) — each hardened by a Codex blocker round.
- Committed authoritative manifest: inventory.json (clean-worktree
  regeneration, --label provenance).
- Gate: scripts/verify-hook-law.mjs — 11 fixtures + --selftest
  (same-collector shadow detection) + --post (proven failing on the
  pre-migration tree) + --live (CHROME_PATH/portable).

## Implementation evidence (final)

- [x] Orphan set (kbd/separator/scaffold-float/component-tree-nav/
      toggle) — migrated + live-verified (1a01fa5).
- [x] Codemod v2 mechanical subset (selectors/classList/directives) —
      11e17da + applied; stale-manifest mis-rewrites (canvas
      css-defined names) audited systematically and reverted.
- [x] Subagent batches: form-family (19 comps) / nav+surfaces (35
      files) / display+data (17 comps) — reports with per-file status,
      family + hand-review rulings, probe evidence (15/15, 219/219,
      26/26); orchestrator cross-verified mirrors byte-identical and
      zero scope hooks per batch.
- [x] Hand-review rulings ledger: event names / custom-element tags /
      Symbol.for keys / id wiring / custom-prop references / prose —
      all ruled non-hooks; engine@3.8 encodes the identifier contexts;
      mixed families ruled (sheet/tabs DROP as css-defined states;
      file/file-icon/step/toast/toggle = B6 coexistence recorded in
      RULED_COEXISTENCE).
- [x] Final counts (engine@3.8, clean worktree, committed manifest):
      defined 278 / hooks 0 / families 0 / handReview 0 /
      references 295 (class-form queries remain only for css-defined
      names — lawful).
- [x] Gates: verify-hook-law --post GREEN (clean tree, exit 0);
      --selftest (shadow detect + clean-zero) PASS; --live PASS
      ([data-jx-kbd] present + .jx-kbd gone; valued tone resolves);
      vitest 327/327 (main tree); root payload build GREEN; capture
      oracle: fresh HEAD baseline + same-tree compare 0 CHANGED,
      missing-image path exits 1.
- [x] BLOCKED (Owner WIP, not this change): `npm run build:site` —
      the Owner's uncommitted prototype-docs routes are marked
      prerenderable but not crawlable. Rerun after their WIP lands.
- [x] Owner exclusions: prototype-docs/** and overview-card.svelte
      (jx-wing-body deferred to the Owner's redesign) never touched
      nor committed by this change; staging was whitelist-only after
      the soft-reset incident.

## Known rulings (pre-recorded)

- sheet/tabs dynamic families = CSS-DEFINED STATES → dropped (no
  conversion).
- file-icon base = css-defined class; its {fileKind} variants ride a
  data attribute alongside.
- animate-[jx-skeleton-pulse…] keyframe names / [--jx-toggle-w:…] /
  (--jx-toggle-w) are non-class contexts (engine@3.2 masks).
- Owner's prototype-docs WIP is OUT of scope and never committed by
  this change (isolation incident soft-reset; whitelist-only staging
  thereafter).
