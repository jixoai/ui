# verification — variant-grammar (evidence index)

## Gates (all at the integration commit)

| Gate | Result | Notes |
|---|---|---|
| vitest full suite | **544/544** (48 files) | incl. new chip 19, inline-code 13, variant-grammar source guards 2 (glued-utility adjacency + source-drawer path existence, toast included), migrated press-button/icon-button/batch1/batch3/composition-d, catalog + docs-structure re-frozen |
| svelte-check | **253 errors / 19 warnings** | exactly the pre-wave baseline (measured via stash before the wave); zero new errors/warnings attributed to wave files (chip.html effectExpr warning fixed to $derived) |
| verify-density-kernel | **61/61** | token block addition is density-free; kernel untouched |
| verify-density-adoption | **66/66** | chip row C (lane [data-jx-chip]) + inline-code row E; browser phase included |
| verify-hook-law (default) | **OK** | data-jx-badge/-alert/-press-button/-chip valued hooks |
| verify-hook-law `--post` (strict) | **RED — pre-existing, not this wave's** | 3 failure classes (9 css-less jx-* hooks in component-canvas/navigation-menu/popconfirm/range; 20 hand-review ambiguities in breadcrumb/command/playground; 4 data-jx name shadows). All live in components untouched by variant-grammar — they are the data-jx-hooks remediation's own committed intermediate state (07a0512, "failing gate + consumer contract"); that change owns closing them |
| mirror manifest | **GREEN 90 items / 302 pairs** | byte-identity; new chip + inline-code pairs; docs-upgrade site-only quartet classified (pre-existing debt) |
| verify-press (real Chromium) | **12/12** | press law (scroll-aware: the shell's custom `.jx-shell-body` root needs scrollIntoViewIfNeeded — r3 harness fix), effects, rainbow-on-fill screen blend (re-keyed selector), bevel ink, and the five-rung × four-effect matrix (paint preserved, text readable, loops armed) |
| registry payload parity | **green after root build** | `npm run build` + `build:site` regenerated public payloads (91 files incl. chip/inline-code) |
| blueprint pipeline | **green** | scenes auto-globbed (chip, inline-code added), SVGs regenerated + committed |

## Phase 0 (design freeze)

- ZCode draft: `.agents/documents/2026-08-26-variant-grammar/zcode-draft-r1.md`
- Codex r1 verdict "amend, then freeze", draft 6/10: `codex-r1-response.md`
- Frozen contract: `design.md` (grammar, tokens, recipes, action/status
  split, component contracts, forced-colors law, migration tables)
- Two OWNER overrides over Codex suggestions, recorded in design.md:
  Badge default hue = primary (Owner's explicit answer); Chip =
  spec-lawful control-scale root (Codex's own hit-lane ruling)

## Implementation batches (5 parallel subagents + ZCode integration)

Per Owner orchestration: file-disjoint batches, no subagent commits,
shared files ZCode-only; every batch's report cross-checked against
the real diff (mirror parity cmp, tone=/variant greps, tests). The
load-bearing mid-flight discovery — TW4 named border-color utilities
sort AFTER arbitrary ones, so `border-border` silently overrides a
rung's arbitrary border-color — was probed empirically by batch D,
broadcast to all in-flight batches, and resolved structurally (base
carries width-only `border`; every rung is the sole border-color
source).

## Honest gaps (Owner browser review pending — design §7)

- Real-browser visuals of the wave's deliberate changes: Badge
  anatomy/height (20px kbd-law), secondary softening (tonal neutral
  replaces the yellow solid), Alert surface (ladder ground, border +
  shadow-2xs kept), Chip control-scale silhouette (~44px, not 20px)
- Contrast probe for every shipped semantic injection pair, both
  themes (design §7 requirement — reports, never recomputes)
- verify-surface / verify-trygrid not run this wave (floating-surface
  domain untouched by the grammar; belongs to their own gate)
