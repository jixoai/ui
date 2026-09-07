# tasks — markdown-coverage-components

Lanes A/B/C/D run in parallel after the change docs clear review; the
MainAgent integrates. Review round 1 (2026-09-07) findings folded in:
blockquote ladder is outline|tonal (ghost retired to a followup
structural axis), task-item checkboxes stay native, the §2c
container-inner stack lands, no meta files (hand-authored props rows),
defaults files only where style props exist.

## Lane A — blockquote, heading, list (data-display)

- [ ] `registry/files/ui/blockquote/` — blockquote.svelte (two-rung
      ladder outline|tonal, label/cite/icon),
      blockquote-defaults.svelte.ts (`definePaintSlot(['outline',
      'tonal'], 'outline')` + density no-opinion), index.ts, css
      residue only if the placement law demands
- [ ] `registry/files/ui/heading/` — heading.svelte (level ladder in
      em, no margins, NO defaults file — no style prop), index.ts
- [ ] `registry/files/ui/list/` — list.svelte (ordered/start, B8
      channels, NO defaults file), index.ts
- [ ] mirrors + manifest regeneration

## Lane B — link, text family (general)

- [ ] `registry/files/ui/link/` — link.svelte (absolute http(s) →
      `target=_blank rel=noreferrer`, B2 utilities, NO defaults
      file), index.ts
- [ ] `registry/files/ui/text/` — text.svelte (base + mark literal
      slot + module re-exports), the eight sugar wrappers (P Strong
      Em Del Mark Ins Sub Sup), text-defaults.svelte.ts
      (`defineLiteralSlot`, own 'p'), index.ts
- [ ] mirrors + manifest regeneration

## Lane C — the markdown map + tests

- [ ] parse.ts: `detectBlockquoteAlert` (paragraph → text, with
      inline-wrapper tolerance one level deeper) + the kind→hue/label
      tables
- [ ] markdown-node.svelte: the full map per design §3 (escape
      scoping per §2; Separator behind the neutral carrier div;
      task items stay native disabled inputs)
- [ ] markdown.css: delete §3 (the ladder emigrates to Heading); add
      §2c the container-inner sibling stack
- [ ] markdown-render.spec.ts: map matrix, escape scoping, §2c
      container gaps + no-disc task items, alert matrix (incl. the
      inline-wrapper AST shape), streaming tolerance, the STRUCTURAL
      perf guard (prefix-key invariance, no wall-clock)
- [ ] the five component specs (hook stamps, Defaults semantics for
      blockquote/text, sugar equivalence, composition)

## Lane D — registry/docs mechanics

- [ ] registry.json: five items + markdown's +7 dependency edges +
      the markdown description's map table
- [ ] the frozen-availability chain: blockquote row in
      `scripts/context-coverage.config.json` + the living spec's
      variant-grammar family list + the variant-grammar page table
- [ ] docs pages ×5 with HAND-AUTHORED props rows (alert precedent;
      no meta files — the ambient-vocabulary carrier set stays six)
      + prerender entries + the markdown page's coverage and alert
      demos
- [ ] docs-structure freeze count (recount live totals first — the
      comment trail has drifted; general +2, data-display +3, dated
      comment states the real sum)
- [ ] blueprints ×5 (scenes + svgs)

## Lane E — the HTML equivalence lane (the Owner's 2026-09-07 addition)

- [ ] parse.ts: the frozen tag tables (inline + block), the accordion
      group merge (synthetic accordion_group block, locally typed),
      html attr safety (href re-validation, dangerous attrs dropped)
- [ ] markdown-node.svelte: html_inline/html_block branches route the
      whitelisted tags onto the same components; details → Accordion
      group render; unknown tags keep escaped-text degradation
- [ ] registry.json: markdown += @jixoai/accordion @jixoai/kbd
- [ ] tests: the equivalence matrix (html vs markdown spellings →
      identical roots), accordion (single/consecutive/open/nested/
      markdown bodies), hostile degradation (script/iframe/onclick/
      unsafe href), streaming tolerance (unclosed details)
- [ ] markdown docs page: equivalence demo + accordion demo

## Integration

- [ ] MainAgent cross-review of the lanes' diffs
- [ ] vision acceptance: five pages + markdown page × three presets
- [ ] `pnpm verify:all` green end-to-end
- [ ] archive the change, commit + push, dissolve the worktree
