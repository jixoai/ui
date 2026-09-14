# Proposal: stylex-kernel-phase0 — the build-side foundations (blueprint F11 edition, phase 0)

## Why

The research change 2026-09-13-stylex-kernel-research concluded GO
(Owner-signed F12; archived with its dossier: 22 commits, Gate 1
8.3/PASS, Gate 2 7.7 SUFFICIENT-for-decision, verdict chain F8 →
F11 → F12). The Owner's distribution directive (F11, verbatim) fixes
the architecture:

> 「我并不想把它下放到我的开发者那边。……最终的效果，我只是想
> 让他直接编译出一些 class name，仅此而已。……我们 jixoai-ui 只
> 提供编译好的这些 className。」

StyleX's toolchain lives ONLY in our build. This change delivers
PHASE 0 of the blueprint (decision.md §6, F11 edition): the
foundations that every subsequent migration phase rides — plus the
two production-bug PRE-CHECKS the blueprint orders before phase 1.

## What Changes

1. **@jixoai/ui-vite-plugin absorbs the engine (build-side only)**:
   depends on @stylexjs/unplugin; the jixoai() plugin wiring for OUR
   www + registry builds (the byte-twin vite configs stay twins);
   bakes the F9 canonical layer statement into every emitted CSS.
2. **The typed token accessors**: a `.stylex.ts` module wrapping the
   jixoai token sheet (`var(--primary)` references — compile-proven
   by the research) giving kernel authors typed StyleX vars over the
   existing CSS-variable source of truth.
3. **The payload generator + consistency gate**: emits, from ONE
   build, the compiled class-constant modules + per-item CSS the
   registry ships; a new verify gate pins both artifacts to the same
   build hash (consumers never recompile our source; verify:shadcn-add
   extended to the compiled form).
4. **The authoring law + its enforcement**: kernel paint = static
   atoms against typed tokens; dynamic values ONLY via CSS-var
   bindings (the D1-08-proven degradation path — factories, vars-keys
   and camelCase-composed dynamic values FORBIDDEN); babel
   `propertyValidationMode:'throw'`; a lint/verify script enforcing
   the rule set.
5. **The corpus dogfood**: the 8 research-proven families compile
   through the phase-0 pipeline and match the spike's compiled
   outputs (equivalence check) — proof the foundations produce the
   research's measured results inside the real build.
6. **The production-bug PRE-CHECKS, resolved by forensics**
   (receipts committed): the range thumb-ring lead was an API TRAP,
   not a production bug (getComputedStyle on UA-shadow pseudos
   returns host geometry; renderer measured healthy — kernel note
   recorded, zero production change); the popover position-area
   semantics ARE inverted vs the comments (span-right = left-
   aligned), and its fix rides this change as the permanent
   regression probe + cherry-pickable commits.

Phases 1–3 (family migrations, risk-tiered; channel retirements)
are SEPARATE follow-up changes — this change ships zero migrated
production components.

## Impact

- **Specs**: css-architecture — the placement law's Tier-1 lane
  becomes atom-first (MODIFIED) + the canonical layer law (ADDED) +
  the same-build payload consistency law (ADDED); component-authoring
  — the styling posture requirement rewritten for atom authoring with
  the CSS-var dynamic idiom (MODIFIED); registry — the install
  prerequisite becomes "import the item CSS" (MODIFIED).
- **Files**: packages/vite-plugin/** (engine absorption + generator);
  registry/files/lib (token accessors — a new lib item); scripts/
  (verify:stylex-payload, the authoring lint, the two probes);
  apps/www + registry vite configs (the twin wiring); verify-all
  chain gains the new gates.
- **Gates**: NEW verify:stylex-payload (same-build consistency);
  verify:shadcn-add extended; existing law gates (layer/folder-css/
  jx-pure family) untouched in semantics — they police CSS that
  phase 0 does not yet alter.
- **Not in scope**: any production component migration (phase 1+),
  www docs pages (stay Tailwind — the standing coexistence proof),
  the @theme mapping region's retirement (phase 3).
