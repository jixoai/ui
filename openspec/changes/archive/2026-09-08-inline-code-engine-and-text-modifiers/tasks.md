# Tasks

## Lane A — the text modifier kernel (ask 5)

- [x] A1. `registry/files/lib/text-style.svelte.ts`: `TextStyleProps`
  (lineHeight/weight/italic/tracking/family/fontSize) +
  `resolveTextStyle` per design D5 (absent ⇒ no utility; fontSize
  arbitrary-property form; no bare `size` naming).
- [x] A2. `text.svelte`: six props + class merge
  `forms.utilities + resolveTextStyle(…) + className`; header comment
  gains the ambient-scale amendment note.
- [x] A3. Re-type the eight sugars' Props to include the kernel's
  `TextStyleProps` (unconditional — the runtime passes through via
  `{...rest}`, but the typed surface must show the six modifiers;
  public-API correctness, not gate-dependent). Mirror-copy any file
  you touch.
- [x] A4. text docs page: modifier matrix demo region
  (`/docs/components/text`).
- [x] A5. Tests: text modifier matrix spec additions (prop → class,
  absent → no utility, sugar pass-through) —
  `apps/www/test/text-modifiers.spec.ts` (15 tests, green).

## Lane B — inline-code (asks 1/2/4/6 + fused)

- [x] B1. Highlight core: `DEFAULT_MICROLIGHTER_BACKEND` singleton
  export; adapter anchor `(el.closest('pre') ?? el)`; rAF-coalesced
  `highlightAll` queue (microtask fallback).
- [x] B2. `inline-code.svelte`: retire the shiki token path; the
  backend seam (`backend ?? context ?? DEFAULT_MICROLIGHTER_BACKEND`)
  with the `CSS.highlights` pre-gate; keep detection + PLAIN_LANGS;
  `data-language` flows through the backend contract.
- [x] B3. Variant rework: `definePaintSlot(['fused','tonal',
  'outline'], 'fused')` + the fused utilities (tuned contrast %) +
  forced-colors degrade; header comment rewrite.
- [x] B4. `paint.svelte.ts` `PaintVariant` += `'fused'`; config
  `paintVariantUnion` += `"fused"`; `frozenAvailability.inline-code` →
  `{variants:['fused','tonal','outline'], own:'fused'}` (ONE commit
  with B3 — the A4 gate chain); `defaults-w4-content.spec.ts`
  re-pins inline-code's own 'tonal' → 'fused' (:10/:64-67/:123/:259).
- [x] B5. Theme ladder: `--jx-density-chip-radius-{2xs,xs,sm,default,lg}`
  primitives (2/2/2/4/8) + `--jx-chip-radius` scope remaps
  (jixoai.css, both mirror sides).
- [x] B6. Geometry: `rounded-(--jx-chip-radius)`; the six modifier
  props wired through the kernel (fontSize/lineHeight feed D6);
  the padding calc (default token form + explicit literal form +
  half-pair fallback).
- [x] B7. registry.json inline-code: deps drop shiki; edges +=
  `@jixoai/highlight` + `@jixoai/highlight-microlighter` +
  `@jixoai/text`; description/docs fields updated. (Also: the
  design-D5 file listing `@lib/text-style.svelte.ts` under the text
  item — without it the new `@jixoai/text` edge reads dead in
  verify-deps; the -microlighter engine item's docs field gained the
  DEFAULT_MICROLIGHTER_BACKEND + inline-code-default notes.)
- [x] B8. Tests: inline-code.spec rewrite (fused default, 2/4/8
  radius wiring, backend contract + pre-gate degrade, detection
  table unchanged, padding utilities, modifier props) +
  `paint-zone-availability.spec.ts` re-pins (inline-code zone
  fallback 'tonal' → 'fused', :6/:27/:42).

## Lane C — separator fused/solid (ask 3)

- [x] C1. Literal slot rename `line`→`fused` + add `solid`; defaults
  file + component comment rewrite.
- [x] C2. separator.css: the solid rule (per orientation,
  `backdrop-filter:none; background:var(--border)`).
- [x] C3. The sweep: every `line` usage as separator variant across
  registry/www/blueprints (docs pages, demos, tests, hook-value
  literals); the ambient-matrix bareDefault mirror.
- [x] C4. Tests: separator spec updates + solid assertions.
- [x] C5. design-tokens delta lands with C2 (same change).

## Lane D — markdown + meta + mirrors + docs

- [x] D1. markdown-node.svelte: drop `lang="text"` ×2; map comment
  amend; PLUS the markdown item's install-facing copy — registry.json
  description (:1191) + docs (:1240) + the markdown docs page's
  construct-table row (markdown.html/+page.svelte:519
  `<InlineCode lang="text">` → rides auto).
- [x] D2. markdown-render.spec: lang pins → auto pins (plain text +
  detection stamping; jsdom plain-degrade posture).
- [x] D3. Mirror sync (`apps/www/src/lib/**`) + gen-mirror-manifest;
  component-metadata-gen ×3.
- [x] D4. Docs pages: inline-code engine/variant/geometry/modifier
  sections; separator fused+solid; vg ladder table + frozen-table
  copy; canvas-same-source snapshot regen.
- [x] D5. props-table-meta-drift: LEGACY rows + docs descriptions
  (text six props, inline-code new props).

## Integration

- [x] I1. Full review pass over lanes; conflicts merged; `npm run
  verify:all` (CHROME_PATH set) green — after three environment repairs
  (css-laws tsx, the SSR guard for the theme-loader map, the betlang
  wasm dist restored to the fresh worktree).
- [x] I2. vision pass done: fused PASS both themes (contrast-75
  KEPT — no tune), radius ladder PASS, separator solid PASS, text
  matrix PASS, vg fused row PASS; 2 defects found → fixed (the scan
  selector, the padding channel); 1 pre-existing hydration warning on
  the text canvas noted as followup.
- [x] I3. Tuning verdict: keep backdrop-contrast-75 (every ground
  read; the knob stays for future taste). Re-verified live: padding
  7px, 8 categories / 37 ranges registered.
- [ ] I4. Archive the change; commit + push; clean the worktree.
