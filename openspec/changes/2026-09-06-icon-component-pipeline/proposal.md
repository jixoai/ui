# icon-component-pipeline — the Icon component + the plugin library face

## Why

The named icon library is consumed through raw `{@html icons.x}`
injection (197 call sites: 77 registry + 120 www mirror) — explicit
HTML injection as a public consumption pattern is inelegant, untyped
at the call site, and cannot carry per-instance props (size,
stroke-width) without `[&_svg]:*` descendant-class hacks. Icon
management is also root-script-bound (`scripts/gen-icons.mjs`), so
consumer apps cannot override built-ins or add custom icons, and the
whole set ships eagerly in one module with no size governance.

## What Changes

1. **The Icon component** (`@jixoai/icon`, registry item): renders
   `<Icon name="check" />` with a type-safe `name: IconName` union,
   `size` (default 16) and `strokeWidth` (default 2) props, currentColor
   painting by artwork nature, `aria-hidden` + `data-jx-icon` baked.
2. **The plugin library face** (`jixoai({ icons: { library } })`):
   named icons resolve from built-in lucide defaults, overrides, and
   custom sources (inline SVG / svg files / `lucide:` refs); the plugin
   generates the committed artifact `icon-set.gen.ts` — the `IconName`
   union (custom names included = generated type safety), the sync
   core, and the lazy chunk map.
3. **Async chunked loading**: icons pack greedily into chunks bounded
   by `maxChunkBytes` (default 20480 raw, non-gzip). The first chunk
   (the core set) inlines into the artifact synchronously — SSR renders
   it with zero wiring and zero pop-in (Svelte SSR renders only the
   `{#await}` pending branch, so lazy-only would blank every server
   paint). Overflow chunks load via dynamic import of
   `virtual:jixoai-icons/chunk/K`. `chunking: 'single'` packs
   everything into one file; `inlineFirstChunk: false` opts out of the
   inline core for maximal-code-splitting use cases.
4. **Built-in SVG optimization**: svgo v4 runs at build time on the
   library face only (the slot/CSS face keeps its byte-equivalence
   laws untouched).
5. **Full migration**: every `{@html icons.x}` call site becomes
   `<Icon name="x" />`; `lib/icons.ts` and `scripts/gen-icons.mjs`
   retire (the manifest moves into the plugin's default library);
   `gen:icons`/`verify:icons` re-point at the plugin's pure generator.
6. **Docs**: the icons page documents the component API, the library
   config, and the async semantics; the name grid renders from
   `ICON_NAMES`.

## Impact

- **Breaking** (sanctioned, no compat layer): the `@jixoai/icons`
  item's `{@html}` string interface is removed in favor of
  `@jixoai/icon-set` (the generated artifact) + `@jixoai/icon` (the
  component). `SEMANTIC_GLYPHS`-style `keyof typeof icons` typing
  migrates to `IconName`. The retirement list is rg-driven and
  gate-complete: root gen/verify scripts, verify-shadcn-add fixtures,
  jx-pure-parity / icons-page / terminal-patterns / geometry-
  consistency tests, verify-deps-baseline, registry.json +
  mirror-manifest all migrate in the same change, closed by a
  zero-hit rg gate (design §8).
- **Untouched**: the slot/CSS face (`--jx-icon-*`, SLOT_REGISTRY,
  provider pipeline, ink byte locks — `ink-equivalence.test` and
  `icons-dogfood.spec` stay green unmodified; provider-only configs
  are regression-locked byte-identical).
- **Packages**: `packages/vite-plugin` gains ONE dependency (`svgo`,
  build-time optimizer — the zero-runtime-dep law gains its first
  sanctioned exception, spelled in this change's delta; the full
  packaging chain — lockfile, tsdown external, pack gate, umbrella
  graph purity — is one task).
- **Install contract**: default tier = the committed artifact builds
  plugin-free (inline core, zero virtual imports); overflow tier =
  documented `@jixoai/vite-plugin` prerequisite with a
  forced-overflow clean-consumer probe (design §4).
- **Files**: new `registry/files/lib/icon-set.gen.ts` (generated,
  mirrored — artifact only; chunk bodies stay virtual, never files),
  new `registry/files/ui/icon/`, deleted `registry/files/lib/
  icons.ts` + `apps/www/src/lib/icons.ts` + `scripts/gen-icons.mjs`;
  docs page rewrite; registry.json items `icon` + `icon-set`,
  `icons` retired.
- The woff2/font direction (CSS Paint / OffscreenCanvas rasterization)
  was explored and dropped this round — out of scope by Owner decision.
