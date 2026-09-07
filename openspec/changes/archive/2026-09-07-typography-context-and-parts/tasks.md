# tasks — typography-context-and-parts

The double-runtime probe (F4) gates Lane A's shape; run it first.

## Lane A — the prose scope
- [ ] F4 probe: .svelte.ts context ops under vite dev AND vitest, both
      import paths — pass ⇒ lib may carry the pair; fail ⇒ the inline
      posture (design §1.1's default)
- [ ] registry/files/lib/typography.svelte.ts (types, key, resolve bag)
- [ ] registry/files/ui/prose/ (prose.svelte + prose-defaults +
      index + prose.css — layer statement FIRST)
- [ ] heading.svelte: the one ink-utility edit (dedup probe pins it)
- [ ] the prose spec (unit + measured probes incl. the sovereignty
      probe both directions + chrome orthogonality)

## Lane B — the parts
- [ ] blockquote: rule/ruleSize literal slots + utility maps + hook +
      forced-colors re-materialization + matrix tests
- [ ] link: tri-state icon lane + @jixoai/icon edge + tests
- [ ] list: marker resolution + nav mode (class/rest on the list
      element) + reversed + tests + byte-parity
- [ ] markdown specs: the new-default deltas (shadow-1 quotes, alert
      glyph-free?, external-link glyph in anchor children)

## Lane C — registry/docs chain
- [ ] registry.json (prose ui + typography lib + link's icon edge)
- [ ] docs pages: prose (new, two-file floor) + blockquote/link/list
      upgrades + variant-grammar amendments
- [ ] freeze recount (live), prerender, mirrors + manifest, root
      build payloads, llms-txt

## Integration
- [ ] full battery + verify:all (CHROME_PATH)
- [ ] vision round, then the OWNER browser review (dev AND production
      builds — the exit criterion: quote shadow flip, link glyph,
      ruleSize 1-vs-4 side-by-side)
- [ ] archive + push + worktree cleanup

## Lane D — the canvas same-source machinery (R3-②)
- [ ] F1: packages/vite-plugin — svelte optional peerDep + devDep +
      tsdown external; rebuild dist
- [ ] canvas/extract.ts (pure: AST slice, snippet protocol, dedent,
      self-containment guard F4, dup/miss named errors) + ./canvas
      sub-entry export
- [ ] canvasPlugin() standalone (F3; no umbrella, no ghostty) +
      \0 resolveId/load (F5) + importer-derived page (F6) +
      named-error parse wrap (F8) + addWatchFile
- [ ] client.d.ts module family declaration
- [ ] $lib/canvas-usage.ts usageFile helper (both trees, mirror law)
- [ ] svelte.config twin one-line prerender fix (F7-review)
- [ ] plugin package tests (extraction unit + resolveId/load +
      round-trip + HMR dev probe)
- [ ] pilot migration: blockquote, link, list, prose (ids, per-canvas
      files, usage consts + close dodges replaced; markdown stays
      opted out — stretch)
- [ ] canvas-same-source.spec.ts drift gate (id↔call + snapshots) +
      rendered parity through the real virtual module
- [ ] component-canvas.html docs amendment (id = extraction key)
