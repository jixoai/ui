# Tasks

## 1. Track A — the math lane (lib katex + math-inline + math-block)

- [ ] 1.1 `registry/files/lib/katex.ts`: renderTex facade (htmlAndMathml
      default, throwOnError:false, errorColor 'var(--error)',
      passthrough), registerMacros, `katex/dist/katex.min.css` import;
      header comment (intent list + facade-not-wrapper statement)
- [ ] 1.2 `registry/files/ui/math-inline/`: span surface, role="math",
      no aria-label shadowing (MathML is the SR path), no css file;
      pure-barrel index.ts
- [ ] 1.3 `registry/files/ui/math-block/`: sync SSR render via $derived,
      scroll-run rider (jx-scroll-host grid + horizontal
      data-jx-scroll-run + ScrollChrome shadow veil — the unification
      law, never a family-local copy), copyable control (press physics,
      clipboard fallback, labels payload), error-in-place paint +
      console.warn; math-block.css (canonical `@layer theme, base,
      components, utilities;` prologue + timestamped intent comment +
      :where() paint); pure-barrel index.ts
- [ ] 1.4 specs: `apps/www/test/{katex,math-inline,math-block}.spec.ts`
      (real katex engine) — mirror byte-identical to `registry/test/`

## 2. Track B — the diagram lane (lib mermaid-engine + mermaid)

- [ ] 2.1 `registry/files/lib/mermaid-engine.ts`: lazy singleton
      dynamic import, readThemeTokens (probe-element var() resolution +
      @jixoai/color-utils parseColor/formatColor → hex, raw-string
      fallback + warn), resolveTheme ('auto' → `.dark` class),
      deriveThemeVariables (derivation map from design.md §3.2),
      renderDiagram (startOnLoad false, theme 'base', strict
      securityLevel, re-initialize on theme/config change),
      MermaidRenderError normalization; registryDependencies
      @jixoai/color-utils
- [ ] 2.2 `registry/files/ui/mermaid/`: source floor → lazy SVG swap,
      generation discipline (code-card effect law), data-state machine
      (floor/rendering/rendered/error), theme-follow MutationObserver
      (auto mode), zoom trio (scale transform, viewport pan, clamp
      0.5–3), copy control, labels payload, fade-in +
      reduced-motion kill, min-height reserve; viewport = recorded
      scroll-run exemption (two-axis pan surface, scrollbar-token law
      both axes — comment states the rationale); mermaid.css (canonical
      prologue); pure-barrel index.ts
- [ ] 2.3 specs: `apps/www/test/{mermaid-engine,mermaid}.spec.ts`
      (vi.mock the engine; contract assertions per design.md §8) —
      mirror byte-identical to `registry/test/`

## 3. Registry surface

- [ ] 3.1 `registry.json` +5 entries (files/targets, dependencies
      katex|mermaid, registryDependencies per design.md §0's exhaustive
      edge list — math-block carries @jixoai/scroll-run/icons/utils,
      mermaid carries icons/utils, mermaid-engine carries
      @jixoai/color-utils — meta.group + meta.href for lib items per
      the shiki precedent, docs strings in the $lib consumer dialect)
- [ ] 3.2 deps pair: `apps/www/package.json` + `registry/package.json`
      both gain katex + mermaid (byte-identical pair); npm install
- [ ] 3.3 mirrors byte-identical both sides; manifest regenerated
      (113 → 118); verify:mirror GREEN; verify:deps GREEN (ratchet
      unchanged or shrunk — every new cross-item edge declared)

## 4. Docs site

- [ ] 4.1 `apps/www/src/routes/docs/components/math-block.html/` —
      Intro/Install/Usage/Examples (Euler, Maxwell, matrices/aligned,
      error demo)/API/See Also; +page.ts toc data
- [ ] 4.2 `apps/www/src/routes/docs/components/math-inline.html/` —
      inline-in-prose demo, API
- [ ] 4.3 `apps/www/src/routes/docs/components/mermaid.html/` — demos
      (flowchart, sequence, state, pie), light/dark flip demo, zoom,
      error demo, API
- [ ] 4.4 svelte.config.js prerender entries ×3; docs-skeleton scope;
      meta gen (`component-metadata-gen`) for the three PropsTables;
      verify:docs + verify:meta GREEN

## 5. Payloads + gates

- [ ] 5.1 `pnpm build:registry`; payload parity spec green (5 new
      payloads with dependencies + registryDependencies intact)
- [ ] 5.2 targeted vitest green (both sides); test:types zero NEW
      failures vs pre-change baseline
- [ ] 5.3 verify:standards/budgets/laws/icons/context GREEN; vision
      lane screenshots (light+dark math quality, diagram theming,
      zoom, error states) reviewed
- [ ] 5.4 `scripts/verify-shadcn-add.mjs` CASES extended with
      math-block + mermaid fixtures (deps land in the consumer's
      package.json; katex css import resolves); `pnpm verify:all` GREEN

## 6. Gates

- [ ] 6.1 openspec validate 2026-09-06-katex-mermaid --strict GREEN
- [ ] 6.2 Codex review rounds (change docs → implementation) ACCEPT
- [ ] 6.3 three-stage commit (spec → implementation + tasks → archive)
      on the katex-mermaid branch, rebased onto main at closeout
