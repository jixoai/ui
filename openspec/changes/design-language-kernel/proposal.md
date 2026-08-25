# design-language-kernel — 尺规思维 × token-context injection (the scale kernel + the shared ruler)

> Owner mandate (2026-08-26, near-verbatim): the next wave's CORE
> MINDSET is the "old-school architect" ruler-and-compass derivation —
> dimensions DERIVED (css calc chains), not eyeballed; grid+subgrid
> because it matches how designers think (shared rulers). Density is a
> token system injected through context (Kotlin-Compose-inspired):
> define tokens, build components on tokens, inject defaults via
> context — "这个架构方式将是我们全面超越 shadcnui 的关键设计".
> list-item is the kernel's first conformance client (or the kernel is
> built through it). Design rounds: Codex r1 (v0 6.0) → r2 converged
> **9.2/10** (`.agents/documents/2026-08-26-design-kernel/`), plus two
> real-Chromium probes (the documented probe checks + probe 2 at 7/7)
> validating the subgrid architecture — evidence file:
> `.agents/documents/2026-08-26-design-kernel/subgrid-probe-evidence.md`;

## What Changes

1. **The scale kernel (Tier-0 capability)** — `--jx-ruler-unit`
   (4px) + `--jx-ruler-text-base` (13px) and a FULLY derived
   four-density vocabulary (`--jx-density-*-{xs|sm|default|lg}`:
   text/leading/line/gaps/inset/row-min/hit-min/media) in the
   canonical theme sheet; `[data-density]` scopes map them to
   inherited `--jx-d-*` aliases. Components consume aliases and NEVER
   branch on density in their own css. Four sizes with real
   differentiation (xs 11px/28px → lg 15px/48px rows), derived from U
   and T_base by written equations.
2. **`density.svelte.ts`** — the context channel: getter-backed
   `DensityContext` (Symbol key, `resolveDensity(explicit ??
   inherited ?? 'default')`), a real `registry:lib` item; list-item
   declares the dependency edge. Resolution is SSR-visible via
   `data-density` stamps (the two-channel law: Svelte context resolves
   policy, the CSS scope injects values).
3. **The shared ruler (grouped rows)** — ItemGroup gains an explicit
   `ruler: 'content-end' | 'media-content-end'`; under
   `@supports (subgrid)` the ul owns the column tracks and rows RENT
   them through TWO subgrid levels (li + .jx-item). The 16+8 presence
   matrix becomes a STANDALONE-ONLY law; the narrow law becomes
   areas-only placement on rows (mixed wrap=auto/never rows coexist;
   the shared end line survives). Cross-row alignment — the Owner's
   balance complaint — is structural.
4. **The balance law** — row inline-start breathing B ==
   media/content seam G (same ruler mark) at every density; media
   boxes derive from the line (icon = L, image = 2L — seam never folds
   into the object); glyphs center geometrically with ONE bounded
   optical-correction token (±U/2).
5. **The field-lane fix (Owner's stacked-layout defect)** — ItemField
   composes `<ItemEnd wrap="never">` by construction; content keeps
   min-width:0 and may wrap; truncation is an explicit opt-in stamp.
   The checkbox-group / registry-card stacking dies here.
6. **Migration** — list-item `size` keeps its name, type becomes
   `Density` ('lg' added); `data-size` authority is REMOVED (breaking,
   no alias); ItemGroup is the first provider; rows/groups stamp
   `data-density`. lg ships in the API + one blueprint proof row; broad
   menu/form adoption is the FOLLOW-UP change (wave boundary against
   the concurrent composition-first agent's files).
7. **Mechanical gates** — `scripts/verify-density-kernel.mjs` (computed
   table + scope inheritance + the greppable no-literal-branch law) and
   `scripts/verify-item-ruler.mjs` (grouped alignment, absent-track
   retention, span law, mixed narrow, the exact checkbox-group fixture)
   on real Chromium; jsdom context/stamp suite; existing 33/33 matrix
   gate stays authoritative for standalone/fallback.

## Impact

Canonical+mirror: `registry/files/theme/jixoai.css` +
`apps/www/src/lib/jixoai.css` (geometry block only), NEW
`registry/files/lib/density.svelte.ts` + mirror, the whole list-item
family (both trees), list-item docs + blueprint, `registry.json`
(+density item, +dependency edge), manifest/payload (orchestrator),
new verify scripts + specs. NOT touched: palette/terminal/bevel/
press/scrollbar tokens, jx-pure Parts A–D, floating-surface law,
native control semantics, the concurrent agent's files.
