# katex-mermaid — out-of-the-box math and diagram surfaces

> Owner request (2026-09-06): "引入开箱即用的 KaTeX/Mermaid 渲染组件"
> with the out-of-the-box bar spelled out — 一致的 theme at minimum
> (主题色 brand-hue/token binding, 亮暗模式, 控件), variants and config
> passthrough beyond. Naming ruling (Owner): the math syntax standard
> is LaTeX, not an engine property → function-named `math-block` /
> `math-inline`; mermaid's syntax is proprietary → the `mermaid` name
> verbatim. Markdown integration ($…$ recognition, ```mermaid block
> takeover) is a SEPARATE lane (the markdown-streaming branch) — this
> change reserves the engine seams but ships no markdown surface.

## What Changes

1. **lib `katex` — the isomorphic math engine facade (P0)** —
   `registry/files/lib/katex.ts`: a thin facade over `katex.renderToString`
   ("facade, not wrapper" — the shiki precedent): jixoai option defaults
   (`output: 'htmlAndMathml'`, `throwOnError: false`, `errorColor` bound
   to a token), option passthrough untouched (`macros`, `strict`,
   `trust`, …), a `registerMacros` extension point, and the ONE side
   effect that makes math out-of-the-box: `import
   'katex/dist/katex.min.css'` — KaTeX's fonts ride the npm package and
   the consumer's bundler; zero font shipping, zero plugin prerequisite.
2. **lib `mermaid-engine` — the lazy diagram engine facade (P0)** —
   `registry/files/lib/mermaid-engine.ts`: dynamic `import('mermaid')`
   lazy singleton (the engine is ~1MB — code-split, loaded only when a
   diagram actually renders); `readThemeTokens()` resolves live tokens
   through the probe + parseColor pipeline (custom properties return
   UNRESOLVED token streams from getComputedStyle — a hidden probe
   element resolves `var()` chains, `@jixoai/color-utils`'s parseColor
   + formatColor convert to mermaid-safe hex; unparseable strings pass
   through with a warn, theming never fails a render), and maps them
   onto mermaid's `themeVariables` (theme `base`).
   `renderDiagram(source, { theme, config })` returns the sanitized
   SVG string with a typed render-error. `startOnLoad:false`,
   `securityLevel` stays mermaid's default strict (its built-in
   DOMPurify pass). The theme flip (`.dark` class on the root — the
   registry's own theme contract) re-derives and re-renders.
3. **ui `math-inline` — the inline math surface (P0)** —
   `registry/files/ui/math-inline/`: one `<span>` rendering KaTeX inline
   mode; no chrome, no controls; inherits prose `currentColor` (light/
   dark inverts with ZERO re-render); KaTeX's hidden MathML is the
   screen-reader path (no aria-label shadowing).
4. **ui `math-block` — the display math surface (P0)** —
   `registry/files/ui/math-block/`: figure + scrollport; renders
   **synchronously during SSR/prerender** — the math engine is
   isomorphic and small, so the display law here is NOT code-card's
   plain-text-floor-then-upgrade but direct server paint: true zero
   flash, zero CLS, print-freeze-safe markup (the ruling is recorded in
   the spec). The wide-equation strip RIDES the shared scroll-run
   contract (`@jixoai/scroll-run` host/run/ScrollChrome — the
   scroll-run unification law, tabs/button-group precedent); the copy
   control (TeX source, press physics, clipboard
   fallback) is `copyable=true` by default; `labels` localizes the
   control vocabulary (localization-payload law); errors paint in place
   (`throwOnError:false`, errorColor token) with a console.warn
   diagnostic.
5. **ui `mermaid` — the diagram surface (P0)** —
   `registry/files/ui/mermaid/`: the code-card progressive-enhancement
   law verbatim — prerender paints the escaped source floor (readable,
   zero JS), hydration lazy-loads the engine and swaps in the rendered
   SVG (fade-in, reduced-motion respected, min-height reserves the box);
   `theme:'auto'` (default) follows the site theme flip via a
   MutationObserver on the root class and re-renders with re-derived
   tokens; controls per the Owner minimum: copy source + zoom
   (in/out/reset, scaled pan in the scrollport); a parse failure paints
   the error-summary panel and KEEPS the source floor standing (the
   code-card fallback law).
6. **registry surface (P0)** — five `registry.json` entries (`katex`,
   `mermaid-engine` lib items; `math-block`, `math-inline`, `mermaid`
   ui items) with `dependencies: ["katex"|"mermaid"]`, declared
   `registryDependencies` (`@jixoai/katex`, `@jixoai/mermaid-engine`,
   `@jixoai/jixoai-theme`), meta.group per the taxonomy (math-block/
   mermaid → data-display, math-inline → general, libs → engines);
   byte-identical mirrors + manifest regen (113 → 118 items); docs
   pages ×3 with demos (formulas, diagram kinds, light/dark, zoom,
   error); vitest specs mirrored both sides; `public/r` payloads.

## Impact

- NEW: `registry/files/lib/katex.ts`, `registry/files/lib/mermaid-engine.ts`,
  `registry/files/ui/math-block/{math-block.svelte,math-block.css,index.ts}`,
  `registry/files/ui/math-inline/{math-inline.svelte,index.ts}`,
  `registry/files/ui/mermaid/{mermaid.svelte,mermaid.css,index.ts}` —
  all byte-mirrored to `apps/www/src/lib/**`.
- NEW: `apps/www/src/routes/docs/components/{math-block,math-inline,mermaid}.html/+page.{ts,svelte}`
  (+ `svelte.config.js` prerender entries, docs-skeleton scope),
  `apps/www/test/{katex,math-block,math-inline,mermaid-engine,mermaid}.spec.ts`
  byte-identical in `registry/test/`, optional
  `apps/www/src/lib/meta/{math-block,math-inline,mermaid}.meta.ts`.
- MODIFIED: `registry.json` (+5 items), `apps/www/mirror-manifest.json`
  (regen), `apps/www/package.json` + `registry/package.json` (katex +
  mermaid deps — the byte-identical pair), `apps/www/public/r/*`
  (payloads rebuild).
- Specs: component-authoring (math surface law, diagram floor law),
  registry (engine-item out-of-the-box contract, syntax-standard
  naming ruling).

## Out of scope

- Markdown integration ($…$ / ```mermaid block takeover) — the
  markdown-streaming lane; the lib seams here are its future imports.
- `math-block` variants beyond the default surface (panel/frame
  variants, display numbering/equation labels) — follow-up if a
  consumer asks.
- Mermaid diagram-type micro-imports (`registerExternalDiagrams`
  per-kind chunks), full-screen mode, wheel-zoom modifiers — the lazy
  whole-engine singleton is v1; splitting is an optimization pass.
- skills/jixoai-website edits (the main checkout carries Owner WIP on
  SKILL.md; a follow-up change wires the new components into the
  website skill's stack table).
