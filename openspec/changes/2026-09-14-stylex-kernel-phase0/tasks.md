# Tasks: stylex-kernel-phase0

> Status legend: [x] done · [~] in flight · [ ] todo. The research
> dossier (archive/2026-09-13-stylex-kernel-research) is the
> evidence base; this change's receipts land in its own research/
> folder.

## P0.1 — the production-bug pre-checks (phase-1 gate; cherry-pickable)

- [ ] scripts/verify-range-thumb-ring.mjs: build www, drive the real
      range in headless Chromium, measure the thumb ring; verdict +
      raw output committed.
- [ ] scripts/verify-popover-area-align.mjs: measure the rendered
      subpanel edge alignment vs the anchor; verdict + raw output.
- [ ] If either confirms: the fix lands with its verify row and a
      cherry-pickable commit structure.

## P0.2 — the engine rides the plugin (build-side)

- [ ] packages/vite-plugin: devDep @stylexjs/unplugin @0.19.0
      ( + peer review of the version pin policy: exact pin, bump =
      re-run D1 fixtures).
- [ ] The jixoai() wiring for our builds: transform scope = the
      kernel trees only (registry/files, apps/www/src/lib mirror),
      NOT docs routes.
- [ ] The F9 canonical layer statement baked into emitted CSS (the
      plugin owns it; no author hand-writing).
- [ ] The vite twins stay byte-identical (gate green).

## P0.3 — the typed token layer

- [ ] registry/files/lib (new lib item): tokens.stylex.ts wrapping
      the jixoai sheet via defineVars with verbatim var() values;
      registry.json edge; mirror + blueprint per the standing laws.
- [ ] Type-safety probe: a typo'd token fails the kernel build
      (compiles green otherwise).

## P0.4 — the payload generator + consistency gate

- [ ] Generator: compiled class-constant modules + per-item CSS from
      ONE build pass (same-build hash).
- [ ] scripts/verify-stylex-payload.mjs: re-derives both artifacts,
      asserts hash identity + spot-compiles a consumer import; wired
      into verify:all.
- [ ] verify:shadcn-add extended: the clean consumer's lockfile
      contains ZERO @stylexjs/* entries; items work via CSS import.

## P0.5 — the authoring law's teeth

- [ ] babel propertyValidationMode:'throw' in kernel builds.
- [ ] scripts/verify-stylex-authoring.mjs: forbidden patterns
      (factory calls at non-markup level, vars-keys, shorthands in
      .stylex.ts) → fail naming file+pattern; wired into verify:all.
- [ ] The law text lands in the spec deltas (this change's specs/).

## P0.6 — the corpus dogfood

- [ ] The 8 research families compile through the real pipeline;
      equivalence check vs the spike's compiled outputs (receipt in
      research/).
- [ ] No production markup switches paint (phase 1); the dogfood
      runs as a build fixture, not a shipped page.

## P0.7 — gates + docs

- [ ] verify-all chain gains: stylex-payload, stylex-authoring, the
      two bug probes.
- [ ] Docs: the install prerequisite page (import the item CSS;
      engine tooling optional for consumers' own use).

## P0.8 — review gates (remix)

- [ ] Gate 1: Codex reviews this change doc set (fresh agent).
- [ ] Gate 2: Codex reviews the implementation + receipts; iterate
      to ≥ the research bar (8.0+); score + reasons recorded.
