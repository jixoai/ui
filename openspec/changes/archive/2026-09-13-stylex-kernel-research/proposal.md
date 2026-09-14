# Proposal: the StyleX kernel research (stylex-kernel-research)

## Why

Owner direction (2026-09-13): the kernel should DROP its Tailwind CSS
dependency and integrate StyleX as its own styling engine. Two stated
motivations, plus one standing constraint:

1. **Render performance** — Tailwind is making "the whole CSS rendering"
   difficult. The census confirms the physical shape: every page loads
   the built main sheet is 300,245B raw / 43,352B gzip — TW-generated
   content is 45.5% (utilities 106,954B / 1501 rules), jx-pure 34.4%,
   jixoai.css 14.5%, component css 2.2%, site 3.4% (r0-census
   attribution over the 2026-09-11 dist — a HISTORICAL artifact
   receipt pending the current-HEAD rebuild, not yet a baseline);
   126/126 built pages load this one sheet plus ~13 shared assets —
   per-page render-blocking averages 386KB raw / 63.4KB gzip. The
   engine swap's DIRECT lever is the ~45% utility slice; the ~49%
   law-sheet share prices the hype-asymmetry risk (design §6). Whether the pain is sheet size,
   parse/recalc cost, dev-mode scanning, or FOUC must be MEASURED,
   not assumed (R2) — including the null hypothesis that the symptom
   is addressable without an engine swap.
2. **Context redundancy** — the honest inventory (design §1.2, r2)
   distinguishes OWNERS, PROJECTIONS of one law (css-laws' 5 outputs
   from 13 typed sources), INTENTIONAL carrier hierarchies (icon
   tiers), spec-mandated runtime channels (density's two-channel
   contract), and TRUE duplication — semantic intent expressible
   simultaneously via TW4 `@theme` utilities, context vars bridged as
   arbitrary-value utilities, and alias vocabulary; the @theme mapping
   region itself; the icon dual supply. R4 quantifies the
   true-duplication class per candidate architecture: a new engine
   must SHRINK it, never add a channel (RQ3 acceptance bar).
3. **Coexistence constraint** — end developers may still pair Tailwind.
   The kernel must live beside consumer Tailwind without cascade
   fights, and the consumer override law (consumer utilities beat
   kernel paint) is non-negotiable (RQ2).

This is a RESEARCH change: no production code changes. The deliverable
is an evidence-backed GO/NO-GO decision, and if GO, the blueprint
(drafted, not executed) of the follow-up implementation change.

## What Changes

- **A research dossier** under this change folder:
  - external state-of-art: StyleX 2026-09 (versions, maintenance
    health, non-React posture, Vite path, Svelte precedents, SSR/SSG
    extraction, theming, cascade/layer interop) — every claim sourced;
  - repo baseline measurements: built-sheet attribution (bytes/rules by
    origin), per-page critical CSS, dev-loop timings;
  - feasibility spikes (committed, runnable): Svelte 5 + Vite 8 +
    StyleX minimal; StyleX⇄Tailwind v4 coexistence with override-law
    probes; adapter-static SSG extraction path;
  - migration scope census and cost model (106 ui items + 1 stray
    file, 140 registry items total; 94 TW-bearing component files /
    218 svelte with 2340 LITERAL-CLASS tokens — the frozen-grammar
    LOWER BOUND; class={expr} sites are excluded by the grammar, the
    class={cn('…utilities…')} surface spans ≥51 further files and is
    a separate R5 census row; docs routes 16.8k tracked-source
    tokens; variant tables, cn() fate, registry distribution
    prerequisites);
  - alternatives scan (null hypothesis "fix Tailwind in place" +
    ranked fallback engines) — the decision is only honest if the
    counterfactuals were priced.
- **A decision** against pre-registered criteria (design §4: three
  hard gates D1–D3, scored dimensions D4–D7). NO-GO is a legal,
  valuable outcome — it must be argued with the same rigor as GO.
- **If GO**: the follow-up implementation change proposal text
  (spec deltas it would carry: css-architecture placement law,
  component-authoring styling posture, registry prerequisites,
  context-plugin boundary implications) — as a draft artifact here,
  never executed by this change.

## Impact

- **Specs: none modified in this change.** The research INVENTORIES the
  laws a GO would later touch — the placement law #1 "utility-first",
  the styling-posture requirement, the consumer prereq gate
  (check-tw4-prereq), the zero-npm context-plugin boundary — the deltas
  themselves belong to the follow-up change.
- **Files: this change folder only** (docs + spike/ scratch projects
  with pinned manifests, no node_modules, no dist). No production
  file, gate, or public API changes. R0/R2 measurements RUN builds in
  the main checkout (gitignored dist) and commit only reports +
  receipts.
- **Gates: untouched at runtime.** But the research ENUMERATES them
  (design §1.4, Gate-1 A5): the verify-all chain (dependency shape,
  standards, laws/icons/spins/migration, mirror, context, deps,
  budgets, docs, meta, vite-config dual-app byte-identity, ghostty/
  betlang pins, registry-test mirror, shadcn-add, managed km/
  isolation/print), the law-probing suites (tw-context-probe,
  tw-standard-layer-probe, jx-pure-parity, dld-layers, density-adoption
  ×5, density-context, props-table-print-hook, registry-payload-parity,
  hook-law, check-tw4-prereq), and the ~170 component suites — each
  classified research-evidence vs follow-up-apply.
- **Kernel boundary (design §1.3, r2)**: `packages/css-laws/src/**`
  is an IMPLEMENTATION INPUT (its serializers are the projection layer
  a channel-collapse touches), not an observation-only object; theme
  sheets are generated artifacts with receipts; www docs routes stay
  Tailwind as the coexistence proof.
- **Not in scope**: actual component migration, www docs-page
  restyling, css-laws sheet edits, vite-plugin behavior changes (the
  plugin is studied as distribution-architecture B's vehicle only).
