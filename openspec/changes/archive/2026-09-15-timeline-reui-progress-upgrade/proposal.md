# Timeline reui-standard upgrade + fractional svg-path progress; scroll-area chrome parameters; the fill auto basis correction

## Why

The Owner's r2 review (2026-09-15, after the visual walkthrough):

1. **scroll-area thumb**: the default radius becomes 0 (today: full
   capsule) and must be configurable; the thumb WIDTH must be
   configurable too (referencing the native sibling's width-tier
   approach).
2. **scroll-area track**: the deliberately un-flushed 2px inset from
   the region edge is unnecessary — the track goes FLUSH to the edge;
   and the hover growth must anchor at the EDGE side (the
   `transform-origin: right center` semantics for an inline-end
   track): the thumb grows INTO the content, never past the region
   boundary.
3. **the fill auto basis is wrong** (correcting this change's own W1
   law): auto fill resolution must ride the SAME basis as text/border
   — the theme scope — NOT the nearest opaque ancestor's measured
   backgroundColor. component-canvas's light/dark stage switching is
   by design and is never the fill's business; on the effects gallery
   the shimmer/rainbow hosts sit on a deliberately dark decorative
   band inside a LIGHT stage and today resolve dark — the components
   themselves are wrong, not the stage.
4. **timeline upgrade** (an upgrade, not a rewrite): first replicate
   the reui.io timeline standard — everything it can do
   (`defaultValue`/`value`/`onValueChange`, `orientation`, per-item
   `step` with discrete completion, indicator children/icons, the
   documented demo families) — then extend beyond it with the
   svg-path progress the drawn spine exists for: fractional values
   (`<Timeline defaultValue={1.5}>`) driving a progress stroke ALONG
   the measured path between node centers, animatable. Our existing
   highlights (the 8-directional dot slots, spine presets + geometry
   snippet, no-JS floor, RTL, density, pending) are KEPT. The docs
   page gets a major upgrade to carry all of it.

## What Changes

### W1 — the fill auto basis correction (press-effect runtime)

- `resolveFill(undefined)` (and `solidFill`'s HOSTLESS default base)
  resolve the canvas from the **theme scope's token** — the computed
  `--background` of the nearest theme-scope ancestor
  (`[data-theme="light"|"dark"]`, `.dark`, `.jx-light`, self
  included; an unscoped chain reads the ROOT element's token first)
  — the same basis text/border ride. The nearest-opaque-ancestor
  measured walk (`contextBaseCss`) RETIRES from the auto path (a
  decorative opaque band behind the host is not the fill's context).
  White/black by the resolved context is the TERMINAL fallback
  (non-token pages only). The scope observer contract (class +
  `data-theme`, live re-resolve) is kept.
- The living requirement "the press-effect fill channel resolves from
  the host's theme scope" is MODIFIED accordingly; its W1-era probe is
  REWRITTEN to the new basis (light stage + dark decorative band →
  LIGHT fill).

### W2 — scroll-area chrome parameters (hand-drawn sheet + adapter)

- Thumb radius: default `0`, configurable (`radius` prop: number px |
  `'full'`; CSS var `--jx-scroll-thumb-radius`). The full-capsule look
  becomes an explicit opt-in.
- Thumb width tiers: `width` prop `'auto' | 'thin' | 'wide'`
  (mirroring the native sibling's tier vocabulary; `none` is
  native-only — a hand-drawn scrollbar that draws nothing is the
  platform tier, not this component), default `'auto'` (today's
  geometry), painting the track/thumb widths through
  `--jx-scroll-track-w`-driven tiers.
- Track flush: the 2px edge insets retire — the track hugs the region
  edge (`inset-inline-end: 0` / `inset-block-end: 0`, block/inline
  stretch flush).
- Edge-anchored growth: the hover/drag widening anchors the OUTER
  (edge-side) flank and grows INTO the content — the geometric
  equivalent of `transform-origin: right center` for an inline-end
  vertical track (RTL mirrors through logical properties; the
  horizontal axis anchors its block-end flank). A literal scaleX
  transform would distort a configured radius, so the anchor is
  carried by the inset law, not a transform.

### W3 — timeline: the reui standard, then beyond (the upgrade)

**reui parity (everything it can do —
[the primitive source](./research/reui-timeline-primitive.tsx)):**

- `defaultValue?: number` (default `1`), `value?: number`
  (controlled), `onValueChange?: (value: number) => void` — decimal
  values are first-class.
- `TimelineItem` gains `step?: number` (default: DOM order + 1);
  `data-completed` paints when `step <= current` (attribute paint,
  the pending precedent) — completed dots/titles/separators restyle
  through tokens.
- New `TimelineHeader` part (reui parity, the plain wrapper).
- `TimelineDot` accepts `children` — the reui indicator-icon pattern
  (an icon inside the node), composed with the existing variants.
- Horizontal orientation = the existing `axis` prop (kept; documented
  mapping).

**Beyond reui — the fractional svg-path progress:**

- The spine's progress stroke (today scroll-animation-only) gains the
  VALUE driver: `value` maps onto the measured path — the stroke runs
  from the first node center to the interpolated point at
  `value` (1 → zero-length at node 1; 1.5 → halfway between nodes 1
  and 2; last → the full run), via stroke-dashoffset arithmetic on
  the whole-list path.
- Animatable: a CSS transition on the stroke's dashoffset (reduced
  motion: none) — tweening `value` draws the spine smoothly.
- Interplay: `animation: 'scroll'` keeps owning the stroke channel
  (the scroller drives it); the value contract still drives discrete
  completion. `view` per-item entrance is untouched.
- Keepers (our highlights, explicitly retained): 8-directional dot
  slot grammar, spine presets (plain/dashed/beam) + custom geometry
  snippet, no-JS floor + hydration upgrade, RTL, density, `pending`.

### W4 — docs upgrades

- **timeline.html — major upgrade**: the TWELVE official reui
  families, ONE docs stage each (the official full titles are
  research/reui-family-inventory.md's source of truth — all twelve
  are free and public; the short names below are display aliases;
  the inventory's mapping table pins each stage's aria-label):
  Basic · roadmap · order status · git activity · milestones ·
  pipeline steps · roadmap items · vertical · horizontal with
  leading labels · deployment log · activity feed with user avatars ·
  compact horizontal milestone — PLUS our highlight demos (slots
  matrix · spine presets · custom geometry snippet · the
  decimal-progress tween + controlled stepper).
- **scroll-area.html**: radius/width configuration demos.
- **effects/press-button**: the fill-channel copy updates to the new
  auto basis.

## Impact

- **Specs**: `component-authoring` (fill-channel requirement MODIFIED;
  scroll-area family requirement MODIFIED; NEW timeline value/progress
  requirement), `docs-site` (timeline docs upgrade requirement).
- **Code**: `press-effect-runtime.ts`; `scroll-area.css` +
  `scroll-area.svelte` (prop surface); the timeline family (root,
  item, dot, new header, spine engine's arc-length payload);
  `apps/www` mirror + routes (timeline/scroll-area/effects docs);
  registry payload (`registry.json` props + new files).
- **Breaking**: scroll-area thumb default look changes (capsule →
  square-cut radius 0; opt back with `radius='full'`); the fill auto
  color basis changes (measured canvas → scope token). Timeline
  additions are additive.
- **Gates**: existing verify battery + the rewritten/new probes; docs
  structure lint on the upgraded pages.
