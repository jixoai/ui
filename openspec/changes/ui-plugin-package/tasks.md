# tasks — ui-plugin-package

> Sub-agent dispatchable. Parallel batches marked with ⏸ (can run
> concurrently). Sequential dependencies marked with →.

## Phase P1: Foundation (sequential)

- [ ] P1.1: Package scaffolding — `packages/ui-plugin/` with
       package.json (peer deps: vite, opentype.js as optional),
       tsconfig.json, build config (tsdown)
- [ ] P1.2: Core types — `src/types.ts`: IconSlot, SvgAsset,
       IconProvider, SlotDefinition, SafetyCheckerConfig

## Phase P2: Providers (parallel after P1.2) ⏸

- [ ] P2.1: `src/providers/svg.ts` — svgIconProvider (reads loaded
       SVG strings, returns SvgAsset) + tests
- [ ] P2.2: `src/providers/lucide.ts` — lucideIconProvider (5 inline
       SVG paths: calendar/clock/chevron-down/pipette/x) + tests
- [ ] P2.3: `src/providers/font.ts` — fontIconProvider (opentype.js
       glyph extraction, viewBox normalization) + tests with fixture fonts
- [ ] P2.4: `src/providers/mixin.ts` — mixinIconProvider (base +
       per-slot overrides, null fallthrough) + tests

## Phase P3: Infrastructure (parallel after P1.2) ⏸

- [ ] P3.1: `src/serializer.ts` — serializeIcon() (SvgAsset → data
       URI CSS value) + tests
- [ ] P3.2: `src/safety.ts` — createSafetyChecker() (configurable,
       default warn mode) + tests (positive + negative)
- [ ] P3.3: `src/vite-plugin.ts` — jxUI() (virtual CSS module,
       file I/O, HMR, provider lifecycle) + integration test

## Phase P4: Integration (sequential after P2 + P3)

- [ ] P4.1: `src/index.ts` — public API barrel
- [ ] P4.2: Standard layer integration — update jx-html-input/select
       icon slots in jixoai.css to use var(--jx-icon-*, fallback)
- [ ] P4.3: pipette slot moves from face to standard layer
       (jx-html-color ::after)
- [ ] P4.4: clear slot — the × button's SVG becomes a slot consumer

## Phase P5: Quality gates (sequential after P4)

- [ ] P5.1: Full test suite (unit + integration)
- [ ] P5.2: Site build + parity gates green
- [ ] P5.3: Documentation (README for the package)
- [ ] P5.4: Codex review round
