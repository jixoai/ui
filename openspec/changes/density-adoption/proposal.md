# density-adoption — one breaking sweep from kernel to componentless CSS

> Owner mandate (2026-08-26): the kernel across the WHOLE design
> system, full autonomy; jx-pure breaking changes sanctioned — the
> frozen Tier-2 vocabulary can and SHOULD change. Design rounds:
> Codex r1 (v0 6.5 — provider/ownership/proof problem framing) → r2
> converged **9.2/10**
> (`.agents/documents/2026-08-26-density-adoption/`). Baseline barrier
> proven green at `17ef509` (suite 492/492, kernel 61/61, ruler
> 18/18, matrix 37/37, jx-pure 65/65 after three latent gate
> defects were fixed; manifest regenerated).

## What Changes

1. **K0 — contract/substrate** (single owner, before concurrency):
   rename the policy prop to `density` everywhere (no `size` alias;
   visual `size` survives only for identity geometry like Avatar);
   the fallback-aware resolver (`explicit ?? inherited ?? fallback` —
   a Table defaults `sm` WITHOUT shadowing an inherited `lg`); the
   `--jx-d-ctl-*` inherited control interface (aliases only, no
   second scale) in the canonical theme pair; the three archived
   list-item residuals closed (optical token CONSUMED, grouped
   `layout="media"` made measurable, inset prose aligned); the
   table-driven adoption registry + verifier created.
2. **F — jx-pure v2** (breaking, sanctioned): the componentless sheet
   rebuilt on the control aliases; Tier-2 renames with NO deprecated
   aliases — `.jx-input→.jx-control`, `.jx-field-shell→.jx-control-shell`,
   `.jx-input-lane→.jx-control-lane`, `.jx-range→.jx-slider`,
   `.jx-color-field→.jx-color-shell`, `.jx-color→.jx-color-swatch`,
   `.jx-color-stretch→.jx-color-expand`; range size classes die;
   zero-JS preserved.
3. **A–E — family packets** (parallel subagents, disjoint exact file
   lists): A form-text (input/textarea/select/native-select/
   number-input/tags-input/input-otp/file-input) · B form-boolean
   (checkbox/radio/toggle/toggle-group/range/color-picker) · C
   buttons+navigation (press-button/icon-button/float-button/anchor/
   pagination) · D menus (dropdown-menu/menubar/navigation-menu/
   command/popconfirm/breadcrumb) · E data+status (table/tabs/
   descriptions/statistic/badge/kbd/empty/result/timeline/steps).
   Each packet owns source+mirror, its focused test, its docs
   canvas, its blueprint scene.
4. **Orchestrator** — exact-list merges (overlap = merge stop),
   payload/manifest regenerated ONCE after A–E, full proof suite.
5. **G — Owner handoff** — density ladders at four scopes +
   screenshots; the Owner's browser judgment is the visual authority.

## Impact

Breaking public API: `density` replaces policy-bearing `size`;
`controlSize`/`ItemSize`/`data-size` removed without aliases. All
density-owned control geometry derives from one inherited interface;
family css owns no independent scales. Static users get the same
policy through `.jx-pure` + `data-density`. Portaled panels stamp
their resolved density at the panel root (CSS inheritance follows
DOM, not Svelte context, through portals). Three wave browser
gates: kernel (equations+inheritance), adoption (registry rows ×
four scopes × physical hit rectangles), pure (v2 face).

## Non-goals

No change to terminal/bezel, press physics, scrollbar,
floating-surface, anchor-positioning, view-transition, or
reduced-motion laws. No forced app-shell provider; no JS in
jx-pure. No new density values, no ruler-equation changes, no
44px/48px floor changes, no `data-size` revival. No global body
typography change. No color-semantics/brand/display-heading/
color-map/SVG redesign. No compatibility aliases — migration is a
release-stage Owner decision, as authorized. No cleanup of
unrelated pre-existing warnings or dirty artifacts outside packet
scope.
