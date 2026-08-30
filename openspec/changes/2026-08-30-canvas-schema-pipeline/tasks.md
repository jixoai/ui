# Tasks: canvas-schema-pipeline

## 1. Schema kernel (`apps/www/src/lib/schema/`) [P]

- [x] 1.1 `ir.ts`: IRNode kinds, `XUI` annotation type,
      `defineComponentMeta`/`defineAnnotations` identity helpers,
      `withAnnotations` merge (annotation keys outside `props` are a
      type error at consume time).
- [x] 1.2 `lower.ts`: `toJSONSchema(meta)` — per-kind lowering,
      `required` = props without defaults, `x-ui` passthrough; no
      `kind`/`typeText` ever appears in output.
- [x] 1.3 `schema2form.ts`: `controlsFor(schema)` mapping table
      (enum ≤5 → segmented, >5 → select; boolean → toggle; number
      with bounds → stepper; string → text with lane; `control:
      'none'`/snippet/opaque → excluded) returning typed row
      descriptors.
- [x] 1.4 vitest: lowering fixtures (press-button IR literal) with
      export equality + leak assertions; controlsFor lane/bounds/
      exclusion cases.

## 2. Extractor (`scripts/component-metadata-gen.mjs`) [P]

- [x] 2.1 Script split + TS AST parse of module/instance blocks;
      local type/interface collection; `$props()` destructure
      defaults.
- [x] 2.2 Type resolution per design (literal union / primitive /
      Snippet / opaque-with-typeText); template pass with
      `svelte/compiler` for `data-jx-*` hooks.
- [x] 2.3 Emitter: two-zone `.meta.ts` (GENERATED block + preserved
      annotations zone), `--check` zone diff with stale list,
      `--self-test` four fixtures (enum+default, numeric bounds,
      snippet+opaque, annotation-less `$props`).
- [x] 2.4 Generate `apps/www/src/lib/meta/press-button.meta.ts` and
      hand-author its annotations zone (variant/size/loading/label/
      radius row hints).

## 3. Canvas schema mode (registry + mirror, byte-identical) [P]

- [x] 3.1 `component-canvas.svelte`: `schema`/`values` (bindable)/
      `onvalue` props; defaults initialization; precedence (snippet
      > schema > none); reset-to-defaults fallback.
- [x] 3.2 Self-contained control rows (no `$lib/playground` import):
      segmented/select/toggle/stepper/text per `controlsFor`, lane
      layout, focus-visible + press physics, reduced-motion static.
- [x] 3.3 `component-canvas.css`: row styles in the existing layer
      idiom; `@container` responsive (dock collapses under stage on
      narrow).
- [x] 3.4 Mirror copy to `registry/files/ui/component-canvas/` and
      REPORT the manifest regen need (integrator runs
      `gen-mirror-manifest` — shared-file law).

## 4. Pilot page [P]

- [x] 4.1 `press-button.html/+page.svelte`: replace hand-written
      variant/effect playground state with meta → `toJSONSchema` →
      canvas `schema` + `bind:values`; effect names map to builders
      via `onvalue`; keep usage-live code overlay working from the
      same values.

## 5. Gates + integration [I]

- [ ] 5.1 `verify:meta` (= `--check`) npm script + `verify-all.mjs`
      wiring. [integrator]
- [ ] 5.2 Mirror manifest regen + `verify:mirror` + full
      `verify:all` green. [integrator]
- [ ] 5.3 vitest run green in CI order (before build). [integrator]

[P] = parallelizable subagent batch; [I] = integrator-owned.
