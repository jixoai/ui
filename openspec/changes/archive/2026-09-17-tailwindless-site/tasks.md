# Tasks — P0 (this change)

## 1. The gate (AST, machine-readable contract, negative tests)
- [x] 1.1 `scripts/verify-tailwindless.mjs` — AST extraction: Svelte
      `class=`/`class:` + TS `cn()`/template string literals; CodeBlock
      doc-string sample code EXCLUDED (the AST boundary documented in
      the allowlist's exclusions); `--pin` writes
      research/tailwindless-allowlist.json (single writer), `--check`
      reads it
- [x] 1.2 the dynamic-producer registry seeded (`cn()`,
      `resolveTextStyle()` — its bracket emissions enumerated with
      their P3 retirement) + the semantic-rule registry (the pilot's
      lane-2 composites first entries)
      — producers seeded incl. the stylex runtime seam;
      semantics[] structure in place but EMPTY until the pilot's 3.3
      entries land (task 3 owns the first lane-2 composites)
- [x] 1.3 initial `--pin` from the AST census (the file/identity/
      count truth; mirrors share one entry)
      — 471 files · 11,625 identity slots · 25,904 occurrences
      (routes 141/16,325 · site-libs 156/4,171 · ui 174/5,408); the
      census doc carries the AST-recalibration table
- [x] 1.4 negative tests: a planted new utility → red; an equal-count
      identity swap → red; an unregistered producer identity → red;
      a tier-2 literal in a `.stylex.ts` → red (verify:stylex-
      authoring extension); an `@utility` growth in jixoai.css → red
      — `--selftest` runs all five (plus a sixth: hand-edited
      allowlist → red via canonical-serialization diff)
- [x] 1.5 `verify:tailwindless` wired into the verify chain
      — package.json script + verify-all's standalone list (after
      verify:mirror; NOT the managed-server phase)

## 2. ONE real registry family — separator (the consumer contract)
- [x] 2.1 the separator component rewired onto its corpus-authored
      `separator.stylex.ts` (source of record: the kernel corpus);
      registry/files/ui/separator/** updated + www mirror synced
      — the registry/files root carries a byte-gated tokens.stylex.ts
      bridge (manifest override → the www mirror) so ONE relative
      import (`../../tokens.stylex`) resolves in the registry tree,
      the mirror, and consumer installs; the component joins atoms
      with the payload's own serialize form (zero @stylexjs runtime);
      the www build prerenders the payload-identical class strings
- [x] 2.2 the payload rebuilt for separator; registry.json deps
      audited (theme-sheet dependency only — no Tailwind prerequisite
      for this item)
      — payload key `separator` (registry kind) alongside the
      unchanged corpus/separator; registryDependencies +=
      @jixoai/tokens; the item payload is self-contained (tokens
      table + var block ride the item's artifacts)
- [x] 2.3 the CLEAN CONSUMER receipt: a plain-vite spot project
      (ZERO Tailwind, ZERO @stylexjs) installing the migrated
      separator item + the jixoai theme sheet and rendering it —
      extending verify:stylex-payload's spot-compile machinery;
      browser screenshot receipt
      — scripts/probe-tailwindless-consumer.mjs → 15/15 assertions
      (computed geometry + pixel deltas vs the undisturbed backdrop:
      ghost 92%/93%, solid 100%); research/consumer-separator.png +
      research/consumer-receipt.json; browser/server/fixture
      teardown receipted by pid + port evidence
- [x] 2.4 the kernel corpus page renamed honestly (kernel/payload
      fixture — not a registry consumer proof)

## 3. The pilot page — docs/components/timeline.html
- [x] 3.1 `apps/www/src/lib/surface/timeline-docs.stylex.ts` (UNDER
      the transform root; the page imports it) — atoms over typed
      tokens + structural constants
      — 38 atoms (layout / space-ladder steps / measures /
      typography / fonts / ink roles) + the exported cx() joiner
      (separator's serialize law: create members are objects in
      dev, joined strings in payloads — Svelte class interpolation
      needs the join); theme-able slots ride the typed site voice
      scale, structural geometry stays literal (tier-1)
- [x] 3.2 every bracket value promoted: the token steps CREATED in
      this change (jixoai.css + tokens.stylex + the typed map + the
      www mirror — no P1 dependency)
      — the "site voice scale" segment (jixoai.css both copies,
      byte-identical): --text-micro/label/label-lg/small,
      --track-label/wide, --shell-w, --stage-w, --space-4..40,
      --hairline; 19 typed members in tokens.stylex (3 copies,
      byte-identical); 13px reuses --jx-text-base (kernel channel,
      plain var — the map's cycle law); 15px/--jx-measure/leading
      NOT used by the pilot, not created (usage governs)
- [x] 3.3 recurring composites → registered semantic rules (lane-2
      sheet, intent comments, allowlist semantics entries)
      — page <style> sheet (scoped, blueprints bp-stage precedent):
      tl-shell · tl-eyebrow · tl-body · tl-col · tl-frame ·
      tl-grid-3 · tl-grid-matrix · tl-ctl(+--primary); the gate's
      semantics[] registry (SEMANTIC_RULES in the gate source, the
      single writer's data) carries owner/selector/scope + the
      pre-existing site rule `pill` (docs-tables.css)
- [x] 3.4 responsive seams → container queries on section hosts (or
      registered media rules); hover/focus → native pseudo selectors
      in the semantic rules
      — viewport seams stay REGISTERED MEDIA RULES (breakpoint
      parity: sm 40rem / lg 64rem / min-900 / min-1100 / min-1300
      flip exactly where the utilities did — a container
      translation would drift the flip by the shell padding);
      hover:bg-muted ×4 + hover:opacity-90 ×1 are native :hover
      pseudos inside .tl-ctl / .tl-ctl--primary
- [x] 3.5 the page's allowlist entry drops to ZERO; other budgets
      unchanged
      — 65 identities / 294 occurrences → ZERO (re-pin: 471→470
      files, 11625→11437 identities, 25904→25024 occurrences; the
      extra deltas are `pill` dropping out of other files' entries
      — the semantics exemption, removal direction); computed-style
      parity probed on the live page (flex/8px gap/11px eyebrow/
      2.64px tracking/1px borders/3-track grid/12.5px body all
      match the utility values); research/pilot-after.png

## 4. Receipts (reproducible matrix)
- [x] 4.1 `research/pilot-matrix-receipt.json` from a pinned probe:
      viewports [375, 768, 1099, 1100, 1440] × the pilot's container
      hosts; assertions: layout parity vs the pre-migration baseline
      shots, dark-scope parity, keyboard focus-visible presence,
      forced-colors emulation, print emulation (plus an explicit
      verify:print run — provenance note: verify-all runs it inside
      its managed-server phase; the pilot runs it standalone too so
      the receipt does not depend on the full chain)
- [x] 4.2 parity walkthrough — the vision subagent is unavailable
      this session (builtin:zai not configured); parity proven
      PROGRAMMATICALLY instead (research/pilot-parity-receipt.json):
      pixel-level diff of all five before/after pairs (w1440
      pixel-ZERO; residuals on w375/w768 attributed to the documented
      brand-hue wall-clock with cluster localization), on top of the
      computed-style matrix — a vision pass is a nice-to-have when
      the model returns
- [x] 4.3 verify chain GREEN: tailwindless, laws, mirror, docs,
      meta, stylex-authoring, stylex-payload; openspec strict valid
- [x] 4.4 env receipts recorded: packages/css-laws + packages/
      vite-plugin deps installed, vite-plugin dist rebuilt,
      apps/www npm-installed — stylex gates now RUN in this worktree

## Follow-up phases (own changes, gated): P1
`2026-09-17-tailwindless-p1-tokens` (audit) → P2
`2026-09-17-tailwindless-p2-components` (+ registry-spec retirement +
cn() seam) → P3 site-libs → P4..Pn routes → Pfinal negative
end-state.
