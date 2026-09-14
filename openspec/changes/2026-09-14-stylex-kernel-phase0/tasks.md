# Tasks: stylex-kernel-phase0

> Status legend: [x] done · [~] in flight · [ ] todo. The research
> dossier (archive/2026-09-13-stylex-kernel-research) is the
> evidence base; this change's receipts land in its own research/
> folder.

## P0.1 — the production-bug pre-checks (phase-1 gate; cherry-pickable)

- [x] scripts/verify-range-thumb-ring.mjs equivalent: PROBED
      (research/p0-bug-probes.md) — verdict **NO BUG**: Chrome 152
      renders the cq law healthily (pixel-diff 0.0000 vs px
      overrides); the L3b lead was an API trap
      (getComputedStyle(el,'::-webkit-slider-thumb') returns HOST
      geometry — untrustworthy for UA-shadow pseudos; recorded as a
      kernel-note, no production change).
- [x] scripts/verify-popover-area-align.mjs equivalent: PROBED —
      verdict **CONFIRMED BACKWARDS**: span-right measures LEFT-
      aligned, span-left RIGHT-aligned; production surfaces ride
      overflow-rescue (hue via flip-inline). Fix plan (from the
      receipt): popover.svelte placement-mapping span-suffix swap
      (L189-197), terminal-header.css override -> span-left (or drop;
      family inline is span-left) + comment fix, navigation-menu-
      panel.svelte L137 intent check; visual regression across
      nav/dropdown/tooltip/float-button/hue.
- [ ] Implement the popover-area fix as cherry-pickable commits +
      permanent regression probe rows (waits for Gate 1).

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
      the jixoai sheet via defineVars with verbatim var() values.
      ACCEPTANCE, itemized: registry.json edge added; mirror-
      manifest regenerated + verify:mirror green; blueprint scene
      committed; the byte-twin vite configs updated identically.
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
      SCAN SCOPE is the MIGRATION LEDGER — research/migration-ledger.json
      (schema: { version, files: [posix-relative stylex-touched paths] };
      maintained: each migration commit appends its family's files;
      P0 seeds it with the phase-0 dogfood files; the authoring gate
      and the canonical-statement check read it, legacy trees are
      never scanned).
- [ ] The law text lands in the spec deltas (this change's specs/).

## P0.6 — the corpus dogfood

- [ ] The 8 research families compile through the real pipeline;
      equivalence check vs the spike's compiled outputs via the
      COMMITTED comparator script (serialization normalization:
      number formats, pseudo content, steps() timing); receipt in
      research/.
- [ ] No production markup switches paint (phase 1); the dogfood
      runs as a build fixture, not a shipped page.

## P0.7 — gates + docs

- [ ] verify-all chain gains: stylex-payload, stylex-authoring, the
      popover regression probe (ONE permanent probe).
- [ ] Docs: the install prerequisite page (import the item CSS;
      engine tooling optional for consumers' own use).

## P0.8 — review gates (remix)

- [ ] Gate 1: Codex reviews this change doc set (fresh agent).
- [ ] Gate 2: Codex reviews the implementation + receipts; iterate
      to ≥ the research bar (8.0+); score + reasons recorded.
