# Tasks

## 1. Track A — the math lane (lib katex + math-inline + math-block)

- [ ] 1.1 `registry/files/lib/katex.ts`: renderTex facade (htmlAndMathml
      default, throwOnError:false, errorColor 'var(--error)' — every
      default caller-overridable, precedence documented), registerMacros
      (last-wins, site-scoped semantics documented),
      `katex/dist/katex.min.css` import; header comment (intent list +
      facade-not-wrapper statement)
- [ ] 1.2 `registry/files/ui/math-inline/`: span surface, role="math"
      on the content-only span, HTMLAttributes<HTMLSpanElement> with
      `{...rest}` spreading BEFORE the component's own stamps (Svelte
      later-wins — consumer attributes pass through, component
      semantics un-overridable; conflict test pins it), no aria-label
      shadowing (MathML is the SR path), no css file; pure-barrel
      index.ts
- [ ] 1.3 `registry/files/ui/math-block/`: sync SSR render via $derived,
      FULL scroll-run rider — createScrollStamp({run, host, members:
      () => (mathEl ? [mathEl] : []), ramps: false}) armed in $effect
      with the returned destroy() as cleanup + ScrollChrome(shadow
      veil) — role="math" on the INNER content wrapper (figure keeps
      native semantics; copy button stays discoverable), rest spread
      before component stamps, copyable control (press physics,
      clipboard fallback, labels payload), error-in-place paint +
      console.warn; math-block.css (canonical `@layer theme, base,
      components, utilities;` prologue + timestamped intent comment +
      :where() paint); pure-barrel index.ts
- [ ] 1.4 specs: `apps/www/test/{katex,math-inline,math-block}.spec.ts`
      (real katex engine; markup/MathML/displayMode/error/override
      precedence; rest passthrough + a11y; stamp four-state verdicts +
      content-growth restamp) — mirror byte-identical to
      `registry/test/`

## 2. Track B — the diagram lane (color-utils + lib mermaid-engine + mermaid)

- [ ] 2.1 `registry/files/lib/color-utils.ts` parseColor EXTENSION:
      rgb()/rgba() parsing (comma AND space/slash serializations, alpha
      accepted + discarded in hex output) funnels into the Oklch model;
      unit tests for both syntax families + round-trips; mirrored both
      sides
- [ ] 2.2 `registry/files/lib/mermaid-engine.ts`: lazy singleton
      dynamic import; readThemeTokens(root?, resolvedTheme?) (color
      probes INSIDE the passed root's subtree → parseColor → hex; the
      documented per-theme safe-hex fallback table committed in the
      header as the oracle — never the raw string, one warn per
      degraded token; a SEPARATE fontFamily probe for --font-sans,
      font omitted when unresolvable; EXPLICIT resolvedTheme reads
      through a temporary local .dark/.jx-light probe wrapper under
      the same root — never global mutation); resolveTheme ('auto' →
      `.dark` class); deriveThemeVariables (§3.2's ONE-source-per-field
      table); renderDiagram with the id contract (§3.4), the
      themeRoot option (§3 — scoped containers resolve their own
      tokens), the rejection-recovering promise-chain serial queue +
      fingerprint over the FINAL merged initialize payload (§3.3 —
      token changes inside one theme mode re-initialize), and the
      protected-fields ladder (startOnLoad:false ·
      securityLevel:'strict' · theme:'base' never overridable; user
      themeVariables field-wise over derived); MermaidRenderError
      normalization (browser-only guard for SSR calls);
      registryDependencies @jixoai/color-utils
- [ ] 2.3 `registry/files/ui/mermaid/`: source floor → lazy SVG swap,
      generation discipline (code-card effect law) + render-id contract,
      data-state machine (floor/rendering/rendered/error), the surface
      passes its own figure as renderDiagram's themeRoot (scoped
      containers resolve their tokens) with the auto-mode
      effective-scope observer (document-root subtree class observer
      filtered to the figure's CURRENT ancestors — an ancestor
      .jx-light→.dark flip re-renders; disconnected in effect cleanup),
      zoom trio (scale
      transform, viewport pan, clamp 0.5–3), copy control, labels
      payload (incl. `diagram` — the viewport's accessible name when
      `name` is absent; never a nameless img), fade-in +
      reduced-motion kill, min-height reserve via
      `--jx-mermaid-floor-min` (default 6rem, consumer-tunable);
      viewport = finalized scroll-run exemption (two-axis pan,
      scrollbar-token law both axes, NEGATIVE test: no data-jx-scroll-run
      / chips / veils inside); role="img" + accessible name at all
      times; HTMLAttributes rest spread BEFORE component stamps;
      mermaid.css (canonical prologue); pure-barrel index.ts
- [ ] 2.4 specs: `apps/www/test/{mermaid-engine,mermaid}.spec.ts`
      (vi.mock the engine; contract assertions per design §8 —
      initialize args + adversarial config survival, singleton, probe
      pipeline + per-theme safe-hex fallback table, serial queue
      (fingerprint over merged payload; rejection-recovery — a failed
      render never poisons the next), id collisions (two instances /
      same name / re-renders), theme re-derive, generation discipline,
      error normalization + floor survival, rest passthrough + conflict
      attributes, no-chrome negative, zoom transform without engine
      calls, accessible-name trimmed ladder incl. `name="   "` and
      `labels={{ diagram: '' }}` → 'Diagram', themeRoot two-container
      scoped-token test, explicit-pin both directions (light root +
      dark pin, dark root + light pin — initialize payload colors from
      the target sheet, global root untouched), scoped-ancestor
      auto-flip test (an ancestor .jx-light→.dark flip re-initializes
      with changed baked fills; an unrelated sibling class change
      triggers NO render; observers disconnected on cleanup)) — mirror
      byte-identical to `registry/test/`

## 3. Registry surface

- [ ] 3.1 `registry.json` +5 entries (files/targets, dependencies
      katex|mermaid, registryDependencies per design.md §0's exhaustive
      edge list — math-block carries @jixoai/scroll-run/icons/utils,
      mermaid carries icons/utils, mermaid-engine carries
      @jixoai/color-utils — meta.group + meta.href for lib items per
      the shiki precedent, docs strings in the $lib consumer dialect)
- [ ] 3.2 deps pair: `apps/www/package.json` + `registry/package.json`
      both gain katex + mermaid (byte-identical pair); npm install;
      lockfile receipts committed for EVERY affected workspace (root
      `package-lock.json` + `apps/www/package-lock.json`; packages/*
  untouched unless a build demands it)
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
      error demo, API; TWO mounted instances (the id-collision demo
      surface for the browser probe)
- [ ] 4.4 svelte.config.js prerender entries ×3; **docs-skeleton
      scope: scripts/docs-skeleton-scope.json inScope += math-block,
      math-inline, mermaid (hard-fail, not WARN)**; meta gen
      (component-metadata-gen) for the three PropsTables; verify:docs +
      verify:meta GREEN

## 5. Payloads + gates

- [ ] 5.1 `pnpm build:registry`; payload parity spec green (5 new
      payloads with dependencies + registryDependencies intact)
- [ ] 5.2 targeted vitest green (both sides); test:types zero NEW
      failures vs the recorded baseline (main: 1 pre-existing type
      error; worktree fresh-bootstrap additionally carries the
      icons-dogfood dist + payload-parity build debts — both satisfied
      by this change's builds)
- [ ] 5.3 verify:standards/budgets/laws/icons/context GREEN; NEW
      `scripts/verify-katex-mermaid.mjs` (verify-surface bootstrap
      verbatim: playwright-core + local chromium discovery + --url
      :5199): mermaid page → two SVG instances with distinct ids, dark
      flip → re-render with a changed baked fill; math-block page →
      .katex + MathML in DOM, run carries a scroll-state verdict;
      registered as `verify:km` in root package.json and appended to
      the verify-all chain as the new final step AFTER verify:shadcn-add,
      with verify-all OWNING the server lifecycle EXCLUSIVELY (managed
      static node http server over apps/www/dist bound to 127.0.0.1 on
      an OS-assigned port via listen(0); the real address().port URL
      is the ONLY thing readiness poll and the probe touch; child
      reaped on success/failure/SIGINT with no residue; adversarial
      test: :5199 pre-occupied → composite still probes its own child;
      standalone verify:km keeps the caller-provided --url contract);
      vision lane screenshots (light+dark math quality, diagram
      theming, zoom, error states) reviewed
- [ ] 5.4 `scripts/verify-shadcn-add.mjs` CASES extended with
      math-block + mermaid (install from built payloads; deps land in
      the consumer's package.json; consumer vite build resolves the
      katex css font URLs); `pnpm verify:all` GREEN

## 6. Gates

- [ ] 6.1 openspec validate 2026-09-06-katex-mermaid --strict GREEN
- [ ] 6.2 Codex review rounds (change docs → implementation) ACCEPT
- [ ] 6.3 three-stage commit (spec → implementation + tasks → archive)
      on the katex-mermaid branch, rebased onto main at closeout
