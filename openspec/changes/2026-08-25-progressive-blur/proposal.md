# progressive-blur — the scroll-edge blur atom + the docs rail adoption

> Original request (2026-08-25, Owner): "左侧导航栏在向下滚动的时候，
> 最顶部的这里，默认启用 progressive blur 特效。这其实也是我们项目的
> 最佳实践，在存在 sticky 的时候，通常都会有各种 backdrop-blur 效果。
> 而因为这个是列表，是属于同图层的 sticky，所以建议用
> progressive-blur。你需要先把 https://magicui.design/docs/components/
> progressive-blur 这个组件移植到我们的组件库中来，然后再实现这个
> 左侧导航组件。" — plus the navigation-menu drift question (hover open,
> no animation) answered and fixed here.

## Why

The docs rail (docs-sections-nav) is a same-layer sticky list: the rail
cell itself scrolls (`.jx-dsn` overflow at wide form). The project's
standing practice — sticky surfaces get backdrop blur — has no atom for
the SCROLL-EDGE case (content scrolling under its own container's
edge). Magic UI's progressive-blur is the reference technique (stacked
masked `backdrop-filter` bands, zero JS); it belongs in the registry as
the canonical atom, then the docs rail adopts it.

The same request surfaced a DRIFT: navigation-menu still opens panels on
hover intent while the site's own top nav (terminal-header) received the
2026-08-25 Owner ruling — CLICK open only, hover retired — and its
panels ride the Popover primitive's motion kernel. navigation-menu
predates the ruling and kept both the hover path and a raw (kernel-less,
unanimated) popover panel. It is not "a custom header" — it is a stale
twin; this change realigns it.

## What Changes

```
┌──────────────────────────────────────────────────────────────┐
│ 1. progressive-blur (NEW registry:ui, group: general)        │
│    Magic UI port, zero JS, Svelte 5                          │
│    + reveal='static'|'scroll' extension (scroll-timeline)    │
│    sticky h-0 pin contract (abspos scrolls away — probed)    │
├──────────────────────────────────────────────────────────────┤
│ 2. docs-sections-nav (site-only chrome)                      │
│    rail ≥1200px: ProgressiveBlur top, reveal on scroll       │
│    mobile expand scroller: same treatment                    │
├──────────────────────────────────────────────────────────────┤
│ 3. navigation-menu realignment                               │
│    hover intent + grace timers RETIRED (Owner ruling)        │
│    panels rebuilt on the Popover primitive → motion kernel   │
│    (animated entry/exit, anchoring, light dismiss)           │
└──────────────────────────────────────────────────────────────┘
```

## Impact

- New registry item `progressive-blur` (3 files + mirror copies) —
  Components inventory 74, docs page, blueprint scene + SVG.
- `docs-sections-nav.svelte` gains the overlay in both scroll surfaces.
- `navigation-menu` drops `openDelay`, gains animated panels; its docs
  page + registry description rewritten for the click-open law.
- Gates affected: catalog/blueprints/docs-structure suites (counts),
  mirror manifest (regenerated), surface law untouched (new consumer).
