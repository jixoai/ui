# verification — tw4-css-modularization

> Evidence index for the change (Owner-approved 2026-08-24; review
> history r1–r6 spec rounds + P3-impl + P3-r1 implementation rounds).
> Final status: see the review verdicts; this file records the
> verifiable evidence behind each claim.

## Phase gates (all re-run after P3-r1, commit 1f90bb9)

| Gate | Command | Result |
| --- | --- | --- |
| Source↔mirror drift | `node scripts/gen-mirror-manifest.mjs --check` | GREEN — 85 items, 220 pairs, canonicalMain 73 (toast → toast-viewport.svelte) |
| Registry payloads | `npm run build` | 85 payloads, folder-shaped targets |
| Unit/behavior suite | `npm --prefix apps/www run test` | 327/327 (24 files) |
| Site build | `npm --prefix apps/www run build` + `npm run build:site` | pass; llms.txt 67 pages |
| Layer law (dual axes + context + kernel probes) | `node scripts/verify-layer-law.mjs` | 12/12 (r3: + terminal-header subpanel, tooltip, popover, sheet state machine) |
| Folder-css contract | `node scripts/verify-folder-css.mjs` | ALL GREEN (dev + production build) |
| Real-consumer install | `node scripts/verify-shadcn-add.mjs` | ALL GREEN — accordion + toast + code-card chain (shiki.ts exactly once at canonical @lib; utils/theme/fontsource arrive; consumer vite build passes) |
| Clean-consumer entry gate | `node scripts/verify-clean-consumer.mjs` | 10/10 — empty project, public 2-line entry, fontsource closure, compiled dark:*/border-border/bg-background + kbd utilities |
| Screenshot oracle | `node scripts/capture-baseline.mjs` | 67/67 REAL routes (200 + marker + frozen clock + reduced-motion); committed-script back-to-back 67/67 within tolerance; compare = failing gate (metrics + allowlist) |
| Prerequisite check | `npm --prefix apps/www run check:tw4` | OK (this repo's own entry) |
| OpenSpec | `openspec validate tw4-css-modularization --strict` | valid |

## Phase evidence

### P0 — pipeline probes

- **0.1 ORDER LAW** (772fade): `verify-folder-css.mjs` — a bare
  `@layer components` in a sheet injected BEFORE the Tailwind entry
  sorts components before base (preflight's `border: 0 solid` beats
  the folder rule); the canonical prologue makes sheet order
  irrelevant. Reproduced, fixed, verified dev + build.
- **0.2 install proof** (66ad4af→P3-r1): real `shadcn add` against a
  python-served temp registry (REGISTRY_URL localized,
  colors/neutral.json cached for offline safety).
- **0.3 manifest** (4543f56): first live catch — toggle +
  number-input mirrors stale since r9 (39b6a46); repaired. Findings:
  tree-view-multiselect folded into tree-view (P1); color-utils/
  surface-motion unreferenced-but-mirrored; native-form shared-claim
  of jx-pure.css recorded.

### P1 — mechanical folder migration (ad58597)

82 files → 73 folders both sides (git-mv, rename history kept);
companion css same-batch (r2 B7 option 1); import graph rewritten by
pure path mapping (216 site + 35 test files + registry-side $lib
refs); cross-component sibling imports fixed; zero functional delta:
327/327 + verify scripts + P0.2 fixtures re-run green.

### P2 — layer law (54bad14)

toc.css (38 selectors) + website-scaffold.css (56) layerized
(`scripts/layerize-sheet.mjs`: prologue + @layer components +
full-selector :where + :root→theme + keyframes passthrough);
app.css three-way boundary (r3 B10): keeps sole Tailwind entry + ALL
global context; site-only surfaces → lib/site/docs-tables.css
(+layout) + token-lab.css (tokens.html); dead .skip-link deleted.
Visual: 0/69 CHANGED under the tolerant comparator of the time
(oracle later rebuilt — see the honest note below).

### P3 — utility re-authoring (89e7193..1f90bb9)

72/72 styled components migrated: 4 orchestrator-led paradigms
(kbd pure / toggle hybrid + state-machine carve-out / separator
zero-residue / skeleton keyframes-residue) then 68 via four parallel
subagents (16+17+16+20... batches A–D), each verified by computed
probes; orchestrator cross-checked every batch (zero scoped styles,
byte-identical mirrors) and owns all commits. Net code effect across
P3 commits: ≈ −5,300 lines of scoped css.

**Cascade law as implemented** (spec-synced in r1): three bounded
exceptions — Part A (frozen), the state-machine carve-out (unlayered
:where over own utilities), the surface-kernel override (enumerated,
natural specificity, over foreign unlayered surface laws:
terminal-header `.jx-pop.jx-subpanel*`, tooltip/popover jx-surface
pseudo family).

### P3-r1 — the Codex blockers (1f90bb9)

1. Part A classes routed through cn() in five files → plain string
   composition (probed intact).
2. code-card closure → utils dep added, direct shiki.ts entry removed
   (single canonical owner); fixtures registry-derived + chain case.
3. Carve-out exceeded the law → terminal-header three-band rewrite,
   tour/table :where(), sheet choreography re-homed, third exception
   codified bounded; section-card/icon-button theme deps; app.css
   hue comment corrected per ruling.
4. Screenshot oracle photographed 404 fallback pages (route suffix
   stripped; fallback paints the shell) → literal .html navigation +
   HTTP 200 + main-content marker + dedupe + non-zero exit; fresh
   REAL-page baseline (67/67); r1 delta median 0.000%/max 0.004%.

**Honest scope note (Codex P3-r1 ruling adopted):** pre-r1 screenshot
comparisons (P2's "0/69", P3's "home-only") were taken on poisoned
captures and are RETRACTED as parity evidence. P3's visual parity
stands on: the four agents' per-component computed-style probes, the
327-test suite, the r1 zero-delta measurement on REAL pages, and
final appearance acceptance by Owner/browser review. The 0.5%
threshold is a triage hypothesis, not an acceptance bound.

## Documented parity debt (non-blocking, Codex-ruled)

- terminal-card's legacy `box-shadow: <lengths> var(--shadow)` has
  always been IACVT-none (pre-existing source bug; fix separately
  with `--shadow-color`).
- transfer's phones `@container` is dead on docs pages (no query
  container ancestor; pre-existing).
- pagination's disabled-edge state is not demoed on its docs page
  (markup-verified only).

## Archive readiness

- [x] All tasks P0–P4 checked with evidence; docs/checks landed
      (README prerequisite, check:tw4, blueprint scene for utils,
      verification.md).
- [x] Spec rounds r1–r6 (r6 Approve 9/10) + implementation rounds
      r0 BLOCK 5.5 → r1 BLOCK 7.0 → r2 BLOCK 7.5 → **r3 ACCEPT 8.5**
      (review-p3-impl.md; non-blocking suggestions applied: bezel
      assertion gated, this file updated to the r3 command/results).
- [x] Parity debt documented (terminal-card IACVT shadow, transfer
      dead @container, pagination demo gap) — Codex-ruled non-blocking.
- [ ] Owner final approval recorded + `openspec archive
      tw4-css-modularization` (this commit).
