# tasks — ui-plugin-package

> Sub-agent dispatchable. Parallel batches marked with ⏸ (can run
> concurrently). Sequential dependencies marked with →.

## Phase P0: Workspace (sequential, before P1)

- [x] P0.1: Root pnpm-workspace.yaml (or npm workspaces field) —
       add `packages/*` to the workspace; verify the root build
       still passes with the new member

## Phase P1: Foundation (sequential after P0)

- [x] P1.1: Package scaffolding — `packages/ui-plugin/` with
       package.json (peer deps: vite, opentype.js as optional),
       tsconfig.json, build config (tsdown)
- [x] P1.2: Core types — `src/types.ts`: IconSlot, SvgAsset,
       IconProvider, SlotDefinition, ConsumerCapability,
       SourceDescriptor, SerializeMode, SafetyCheckerConfig,
       SafetyIssue/Result, SLOT_REGISTRY constant, SLOT_NAMES

## Phase P2: Providers (parallel after P1.2) ⏸

- [x] P2.1: `src/providers/svg.ts` — svgIconProvider (reads loaded
       SVG strings, returns SvgAsset) + tests
- [x] P2.2: `src/providers/lucide.ts` — lucideIconProvider (5 inline
       SVG paths: calendar/clock/chevron-down/pipette/x) + tests
- [x] P2.3: `src/providers/font.ts` — fontIconProvider (opentype.js
       glyph extraction, viewBox normalization) + tests with fixture fonts
- [x] P2.4: `src/providers/mixin.ts` — mixinIconProvider (base +
       per-slot overrides, null fallthrough) + tests

## Phase P3: Infrastructure (P3.1/P3.2 parallel after P1.2; P3.3 after P3.1+P3.2)

- [x] P3.1: `src/serializer.ts` — serializeIcon() (SvgAsset → data
       URI CSS value OR DOM-safe SVG string) + tests
       (SLOT_REGISTRY lives in P1.2 types.ts — serializer CONSUMES it, never defines it)
- [x] P3.2: `src/safety.ts` — createSafetyChecker() (configurable,
       default warn mode, structured SafetyIssue result type) + tests
- [x] P3.3: `src/vite-plugin.ts` — jxUI() (virtual CSS module with
       @layer theme {:root{}} wrapper, SourceDescriptor loading,
       HMR with source registration/invalidation API, provider
       lifecycle) + integration test
       → depends on P3.1 (serializer) + P3.2 (safety) contracts

## Phase P4: Integration (sequential after P2 + P3)

- [x] P4.1: `src/index.ts` — public API barrel
- [x] P4.2: Standard layer integration — update jx-html-input/select
       icon slots in jixoai.css to use var(--jx-icon-*, fallback)
- [x] P4.3: pipette slot — wrapper carrier (.jx-color-shell::after, face-side;
       input[type=color] is a replaced element, ::after unreliable)
- [x] P4.4: clear slot — jx-html-clear utility + .jx-clear-glyph CSS mask

## Phase P5: Quality gates (sequential after P4)

- [x] P5.1: Full test suite (unit + integration)
- [x] P5.2: Site build + parity gates green
- [x] P5.3: Documentation (README for the package)
- [x] P5.4: Codex review round
- [x] P5.5: Negative tests: WOFF2 decompression edge cases, malicious
       SVG rejection, HMR invalidation, CSP data: URI compatibility
