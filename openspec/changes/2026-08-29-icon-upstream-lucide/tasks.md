# tasks — icon upstream (lucide)

## A. vite-plugin (batch A)

- [x] A1: `providers/lucide.ts` — replace the 7 embedded literals
      with dynamic `import('lucide')` IconNode reads serialized
      through the existing `lucideSvg()` wrapper; missing-install
      failure carries the `npm i lucide` hint
- [x] A2: package.json — `lucide` optional peer (meta) + devDep for
      types/tests (applied centrally with the install)
- [x] A3: tests — `lucide.test.ts` asserts output ≡ lucide data
      serialization (no hand literals); `geometry-consistency.test.ts`
      re-pinned to lucide IconNode + wrapper contract

## B. css-laws (batch B)

- [x] B1: `src/icon-uris.ts` serializer — IconNode → byte-compatible
      data URI (ink `%23000`/`%23fff`, sw param)
- [x] B2: the 5 law sources (input/control/control-lane/clear/select)
      replace URI literals with `iconUri(...)` calls; regenerated
      sheets byte-identical outside the declared changes
- [x] B3: `jx-icon-vocab` 4th projection — the vocabulary block +
      palette/chevron masks move into a generated slot in jx-pure.css
- [x] B4: invalid-ink → lucide `circle-alert` sw 2.5; valid-ink →
      lucide `check` sw 2.5 (no hand-drawn glyphs remain)

## C. generated icon module + registry (batch C)

- [x] C1: `scripts/gen-icons.mjs` — manifest-driven generator with
      `--check` freshness mode; emits byte-compatible icons.ts
- [x] C2: icons.ts set expansion — sun/moon/monitor/languages/image/
      file-video/file-audio/upload/chevron-left/chevron-right/copy
      (full) for the component migration
- [x] C3: the 13 component files' inline `<svg>` → `{@html icons.x}`
      with scoped CSS stroke-width overrides where ≠ 2

## D. integration (ZCode, shared files)

- [ ] D1: registry.json — input/terminal-footer drop the unused
      `@jixoai/icons` dep; component-canvas gains it; the migrated
      components gain it (no npm deps added anywhere)
- [ ] D2: root package.json wiring — `gen:icons`/`verify:icons`
      scripts into verify:all
- [ ] D3: mirrors — registry → www copies + mirror manifest regen
- [ ] D4: full gate run — verify:icons/laws/mirror/standards,
      plugin build+vitest, www build, verify:shadcn-add,
      verify:budgets (B-consumer-icons baseline), shots compare +
      re-baseline the two declared visual changes, verify:all
