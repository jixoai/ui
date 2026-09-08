# Proposal: the handoff followups — T1 print artifact ownership, T2 the live sticky demo, T5 the host-resolution gate, and the hygiene sweep

The stacking-isolation session's handoff (2026-09-09) left five
tasks; this change carries the four that are NOT T3 (T3 rides its own
change, input-color-isolation, same delivery):

- **T1 — verify-print artifact ownership**: the standalone PORT form
  trusts whatever answers on :4173 — a stale python server holding
  six-day-old dist once satisfied it blind (the 4173 incident). The
  composite now NEVER uses the PORT form: verify-print gains a
  `--url` channel and verify-all spawns it against the SAME managed
  throwaway server the km probe uses (listen(0), readiness-polled,
  closed on every exit path) — the probe provably hits this run's
  artifact. The km block's spawn dance is extracted into a shared
  `runManagedProbe` helper (km + print, identical semantics); the
  print step sits INSIDE the managed server's lifetime, above
  `server.close()` (the archived wiring-order lesson). Both channels
  verified: managed harness 35/35, standalone self-serve 35/35.
- **T2 — the table page's sticky demo made real**: at the old short
  values NO `.jx-table` overflowed anywhere in 300–1280px
  (scrollWidth == clientWidth) — the data-sticky pin law had no live
  surface. The playground rows gain Runtime/Region columns + full
  dates (natural width ≈ 900px+), the slider max rises 680→960 so
  the wide side can show the no-scroll end. Measured: 88px overflow
  at the 560px default, start/end pins engaged, header z3 over row
  z2, pin riding the edge after scroll.
- **T5 — the B3 host-resolution linter (HARD)**: verify-standards'
  advisory z-census becomes the static twin of the browser-computed
  law. Every static z must clear one of four exits (var-keyed /
  z-0-rooting / the terminal-plane whitelist / a seeded host whose
  evidence needle exists at gate time); the seed registry
  (scripts/stacking-ladder.seeds.json) asserts bidirectionally —
  unregistered sites and stale seeds both fail. Seeded from the
  archive's three-category table. Landed with it: the sweep's
  deferred third line (terminal-header `.jx-nav` isolation) and the
  category annotations (patterns' corner carriers, scroll-area's
  virtual thumb, the scaffold's VT pseudo-groups). The gate proved
  its teeth live: it caught toc(40)/toast(90)/timeline(z1) missing
  from the first seeding before going green.
- **The hygiene sweep**: the stock `jxoai` misspellings across
  registry + mirrors (error strings in parse/menubar/navigation-menu,
  card-footer/component-canvas/toggle-group/list-item/button-variant
  comments, docs-pager, blueprints recipes, the search-corpus
  generator string, ghostty-term's font-stack comment, registry.json's
  icon-set copy, verify-all's own comment) — all `jxoai`-as-prose
  fixed to `jixoai`; the REAL identifiers (the plugin API `jixoai()`,
  the `virtual:jixoai-*` module ids) untouched. 83
  affected specs green; mirror pairs byte-identical.

T4 (the six guide pages' same-source migration) rides the same
delivery as its own lane; its inventory lands in this change's
tasks list.
