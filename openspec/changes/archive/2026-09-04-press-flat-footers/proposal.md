# Proposal: press-flat-footers — the foot zones scope the flat texture by Context

## Why

The flat press texture (`raised={false}`, 2026-09-03) is per-button today.
The places it belongs by DEFAULT — a Card's foot zone and a Dialog's foot
zone — already scope their buttons' PAINT default through Context
(`ButtonVariantScope variant="ghost"`, minted for exactly this zone-default
job, r14 tuning 2). Owner 2026-09-04: foot buttons should ride flat by
default; an explicit `raised` prop still wins.

## What Changes

- **press-button** owns a NEW context key `PRESS_TEXTURE_KEY`
  (`Symbol.for('jx-press-texture')`, interface `PressTextureApi.raised`).
  The `raised` prop loses its static default; resolution becomes
  `explicit ?? zone ?? true`. The key is deliberately SEPARATE from
  `BUTTON_GROUP_KEY`: the group's key is paint policy and every
  ButtonGroup resets it — physics is not the group's to carry, so the
  texture flows THROUGH joined groups untouched (the context face of
  "physics never changes with paint").
- **ButtonVariantScope** gains `raised?: boolean` on the same zero-DOM
  boundary, inherit-then-provide (a paint-only scope never un-flattens
  an enclosing zone).
- **Dialog's foot zone and Card's foot zone** declare
  `raised={false}` on their existing scope. Head zones, standalone
  CardFooter/DialogFooter, and every bare button keep the convex default.
- Meta regenerated (`raised` joins the no-static-default zone — it rides
  `required` in the lowered schema); docs PropsTable gains the row.

## Impact

- `apps/www/src/lib/ui/press-button/press-button.svelte` (+ mirror)
- `apps/www/src/lib/ui/button-group/button-variant-scope.svelte` (+ mirror)
- `apps/www/src/lib/ui/dialog/dialog.svelte`, `card/card.svelte` (+ mirrors)
- `apps/www/src/lib/meta/press-button.meta.ts`, docs page, specs
  (press-button / dialog-ghost-scope / card / schema-lower / canvas)
- No kernel change (the `--jx-press-move` seam already carries the
  vector); no new tokens.

## 范围外（记档不做）

icon-button 不消费 texture（无 raised 轴，沿用上轮记档）；head zone 不
挂 flat；ButtonGroup 不加 raised prop（物理轴不属于组的 API）。
