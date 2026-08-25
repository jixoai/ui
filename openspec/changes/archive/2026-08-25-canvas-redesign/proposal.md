# canvas-redesign — component-canvas, the Item family, the playground kit

> Owner request (2026-08-25): four findings — playground controls lack
> standards (no list-item component; reference shadcn's, but grid not
> flex), text-noise chrome (reset / "inner playground" / oversized
> Source / no accordion semantics on Code), stage needs default
> max-height + auto-scroll + container queries, scroll-virtual shows a
> lone scrollbar (default width too narrow). Owner rulings: default
> fill + full center sweep; all 67 playground pages migrate to the kit.

## What Changes

1. **Item family** (registry:ui/list-item): 10 slots on GRID with a
   :has()-driven presence matrix (Codex D1) — done, committed.
2. **Playground kit** ($lib/playground): PlayRow on Item, typed
   controls, field context (Codex D3) — done; scroll-virtual dogfooded.
3. **Canvas redesign** (Codex D2/D4/D5/D6): three layers (named host /
   scrollport container jx-canvas / stage), icon chrome, output rename,
   single code disclosure — done.
4. **Sweeps**: 68 pages (stage evaluation + kit migration) — in flight.
5. **Default flip to fill** — LAST, after sweeps verify.
6. Codex design round archived (review-design.md); implementation
   review round at the end.

## Impact

registry (list-item + range srLabel + icons), canvas consumers (43
output renames, 5 fill renames), the kit, blueprint pipeline, tests.
