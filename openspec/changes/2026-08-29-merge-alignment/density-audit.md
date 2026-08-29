# B3 density semantics — full static audit + terminal family registration

Owner original demand: 2026-08-29 "merge-alignment D4/B3 — density
semantics full audit and terminal family registration" against the
frozen decision table (proposal.md row B3).

## The frozen law (audited against)

`resolveDensity` undefined-ambient semantics ARE the canonical default
(registry/files/lib/density.svelte.ts — `explicit ?? inherited ??
optional local fallback`; no opinion → `undefined` → the consumer
stamps NOTHING so the ambient css scope channel flows through).

```
class                   obligation                          exemplar
---------------------  ----------------------------------  -------------------------
provider / chrome       NO opinion — undefined flows        tabs / navigation-menu
fixed-posture leaf      EXPLICIT local fallback             ghostty-term
needing definite        (resolveDensity(d, inh, 'default'))  (table: 'sm')
geometry
pure content /          NO stamp — literals need a          terminal-card / footer
typography              registered structural exception
```

## Method

Full-tree grep over `registry/files/` + `apps/www/src/lib/` for
`resolveDensity` / `getDensityContext` / `provideDensity` /
`data-density`, then per-consumer classification against the three
classes. Mirrors verified byte-identical (cmp) — the census counts each
component once, both copies behave the same.

## Census

53 `resolveDensity` call sites · 38 component directories ·
7 `provideDensity` providers · 0 literal `data-density="…"` stamps.

| packet | components | class | implementation | verdict |
|---|---|---|---|---|
| A form-text | input, textarea, select, native-select, number-input, tags-input, input-otp, file-input | leaf | `resolveDensity(density, ctx)` no fallback; stamp on opinion only | PASS |
| B boolean | checkbox, radio, toggle, toggle-group, range, color-picker | leaf | same no-fallback pattern | PASS |
| C press | press-button, chip, float-button, anchor, pagination | leaf | same no-fallback pattern | PASS |
| D menus | dropdown-menu(+item), menubar(root/trigger/panel), navigation-menu(root/trigger/panel), command(×6), popconfirm, breadcrumb(root + 7 parts) | provider + pass-through | providers expose the honest opinion (undefined = none); trigger/panel stamp `bar.densityOpinion` / `bar.density` — the SAME family opinion, never manufactured | PASS |
| E data | table, tabs(root+content), descriptions, statistic, badge, kbd, inline-code, empty, result, timeline, steps | leaf (+1 fixed) | all no-fallback except **table** | PASS |
| K0 | list-item (item-group + item) | provider + leaf | `item-group` provides; `item` resolves/stamps | PASS |
| terminal | ghostty-term | **fixed-posture leaf** | `resolveDensity(density, inheritedDensity, 'default')` — the B3 exemplar | PASS |
| terminal | header / card / footer | chrome / content / content | **zero density API consumption, zero stamps** — ambient flows through | PASS (was unregistered — fixed below) |

Sanctioned explicit local fallbacks (both kernel-documented):
`table → 'sm'` (row defaults sm only when NO parent provider exists)
and `ghostty-term → 'default'` (canvas cell geometry needs a concrete
density even unthemed). No other component derives geometry that
breaks under undefined — everything else correctly rides ambient.

Supporting channels, also audited:

- `registry/files/lib/density.svelte.ts` (+ mirror) — policy-only
  kernel; resolution law locked by test/density-context.spec.ts.
- `apps/www/src/lib/jixoai.css` — the css scope channel: four
  `[data-density=…]` scopes + `:root:not([data-density])` root default
  + the `[data-jx-chrome]` pointer-modality band (line ~1868).
- `density-demo.svelte` + docs routes (tokens/form/list-item/parity) —
  demo wrappers stamping scopes to EXHIBIT the law; not component
  violations.

## Violations

**0.** No chrome manufactured an opinion; no fixed leaf missed its
stamp; no literal stamp exists anywhere in the tree. The terminal trio
was authored correctly from the start (terminal-header's own header
comment cites chrome-density-tier; the docs pages declare "No density
footprint: the bezel is fixed chrome"). The only B3 gap was
**registration**: the density adoption registry carried ghostty-term
alone — exactly the Codex-review finding.

**Component diffs: none required.** Mirrors untouched (byte-identity
re-verified post-audit).

## Fixes landed (registration + evidence, not behavior)

1. `scripts/density-adoption-registry.mjs` — new **`terminal-chrome`**
   row: roots for terminal-header/card/footer (registry + mirror),
   `docsRoute /docs/components/terminal-header.html`, probeRoot/lanes
   on `[data-jx-chrome]`, `densityOwned: []` (the trio owns NO
   density-owned geometry — verification is the jsdom matrix suite),
   and the three structural-literal exceptions registered
   (`[data-jx-terminal]`, `[data-jx-terminal-footer]`,
   `[data-jx-terminal-footer-column]` font-size). The ghostty-term row
   stays as the family's fixed-leaf contract.
2. `apps/www/test/density-adoption-form-boolean.spec.ts` — terminal
   family three-state matrix (9 `it.each` cases): for each of
   no-parent / parent-xs / parent-lg, each of header (chrome band +
   root), card, footer asserts (a) NO `data-density` attribute ever,
   (b) `closest('[data-density]')` is exactly the ambient scope wrapper
   (null without one) — the mechanical proof that nothing re-scoped
   the subtree and ambient flows through. ghostty-term's fixed-leaf
   matrix (no-parent → `'default'` stamp) remains locked in
   ghostty-term.spec.ts.

## Verification

- `cd apps/www && npx vitest run test/density-adoption-form-boolean.spec.ts test/ghostty-term.spec.ts`
  → 68/68 green (14 boolean-spec incl. 9 new matrix cases + 54 ghostty-term).
- Full suite `npx vitest run` → **716/716 green** (707 baseline + 9 matrix).
- `node scripts/verify-density-adoption.mjs --packet all` → **76/77**,
  the new `terminal-chrome` row fully PASS (static complete; browser
  stamps 4, USED values, chrome lane h=73px, ambient resize
  11/13/15px across xs/default/lg). The single FAIL (`B: lane physical
  h=27.0`) is PRE-EXISTING — proven by a stash round-trip (71/72
  without this change) and untouched by it (packet B probes the built
  public/ fixture, not these files).
- Gate nuance learned (recorded in the row): `[data-jx-chrome]` pins
  its aliases ABSOLUTELY (sm tier, density-independent — "chrome means
  a band, not a second scale", jixoai.css ~1860). The generic resize
  probe therefore targets `header.jx-nav` — OUTSIDE the band — where
  the ambient density axis demonstrably re-scopes; the band lane check
  covers the physical chrome itself.
