# stale-standards-cleanup — living documents onto current mechanisms

## Why

The 2026-08-27 stale-standards sweep (`.agents/documents/
2026-08-27-stale-standards-sweep/sweep-report.md`, every finding
code-verified) inventoried where LIVING documents still teach
SUPERSEDED mechanisms — the defect class that produced the fb784e4
incident (PAGE_STANDARDS' dead 8/22 ToC skeleton misled a review into
retrofitting five pages). Owner ruling: clean them up.

## What

- **PAGE_STANDARDS.md (H1–H4)**: the 8/22 per-page aside/grid
  skeleton still lives in §2's copy-paste template, §3.3/§3.4's
  integration orders, §5's scoring (S1.3 + the one-vote veto +
  S5.1/S5.3), §6's anti-pattern 正解, and §7's review step 1 — every
  correctly-built firstpaint-era page FAILS that rubric. All
  repointed at the current contract: pages ship `{ toc }` as +page.ts
  page data; the ROOT LAYOUT owns the rail; the page body stays the
  single-column card stack.
- **design-tokens spec (H5)**: the two requirements still SHALL the
  retired `--jx-d-ctl-*` / closed `--jx-d-*` allowlist interface
  (0 hits in code since the c31fe6a rename) — rewritten onto the
  `--jx-*` alias interface the sheet actually carries.
- **component-authoring (M3)**: density contract requirement swept to
  `--jx-*` / `--jx-unit` (the hit-lane alias is already covered by
  the pending variant-grammar delta).
- **jx-pure (M4)**: Part B requirement's token spellings swept to
  `--jx-*`; **css-architecture (M5)**: `--jx-ruler-unit` → `--jx-unit`.
- **registry spec (M2)**: the "adding a component" scenario paths
  aligned to the spec's own folder law.
- **README (M6)**: markup-contract examples moved off the dead
  `data-jx-badge="destructive"` value onto live variant values.
- **badge.svelte (M7)**: the false "Alert keeps its own tone law"
  cross-reference corrected (Alert rides the same ladder).
- **result.svelte (L1)**: retired-law citation rephrased;
  **docs-route-model (L2)** + **docs-structure comment (L3)**: count
  drift 73 → 77.
- **M1 (131 instances)**: the line-2 flat `registry/files/ui/
  <name>.svelte` header paths across 65 components × both mirror
  roots (+1 scene file) rewritten to the nested folder-per-component
  form — the toast-viewport fix generalized into the sweep it should
  have been.

## Verification highlights

Byte-identity preserved on every mirrored file (manifest regen);
vitest + svelte-check at baseline; the spec deltas apply against the
living specs' current text.
