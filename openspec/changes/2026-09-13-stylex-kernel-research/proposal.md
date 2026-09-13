# Proposal: the StyleX kernel research (stylex-kernel-research)

## Why

Owner direction (2026-09-13): the kernel should DROP its Tailwind CSS
dependency and integrate StyleX as its own styling engine. Two stated
motivations, plus one standing constraint:

1. **Render performance** — Tailwind is making "the whole CSS rendering"
   difficult. The census confirms the physical shape: every page loads
   ONE compiled sheet (TW4 preflight + utilities for the whole site +
   the 2273-line jixoai.css + the 2363-line jx-pure.css + every folder
   css), and the docs routes alone carry 13k+ utility tokens. Whether
   the pain is sheet size, parse/recalc cost, dev-mode scanning, or
   FOUC must be MEASURED, not assumed (R2) — including the null
   hypothesis that the symptom is addressable without an engine swap.
2. **Context redundancy** — the same design intent currently lives in
   THREE parallel channels: (a) TW4 `@theme inline` semantic utilities,
   (b) context-system CSS variables (`--jx-*`) bridged back into markup
   as arbitrary-value utilities (`px-[var(--jx-inset)]`), and (c) the
   css-laws generated vocabulary — plus the deliberate icon dual
   supply. A new engine must COLLAPSE channels, not add a fourth (RQ3).
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
  - migration scope census and cost model (106 ui items, variant
    tables, cn() fate, registry distribution prerequisites);
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
  laws a GO would later touch (placement law #1 "utility-first",
  styling-posture requirement, check-tw4-prereq consumer gate, the
  zero-npm context-plugin boundary, mirror/verify gates) — the deltas
  themselves belong to the follow-up change.
- **Files: this change folder only** (docs + spike/ scratch projects
  with pinned manifests, no node_modules, no dist). No production
  file, gate, or public API changes. Baseline measurements RUN builds
  but commit only their reports.
- **Gates: untouched.** Nothing in verify:all changes during research.
- **Not in scope**: any actual component migration, www docs-page
  restyling, css-laws sheet changes, and the vite-plugin's runtime
  behavior (the plugin is STUDIED as a distribution vehicle, not
  modified).
